import { test, expect } from '../fixtures/base-test';

// Datos de prueba
const testData = {
validUser: {
username: 'standard_user',
password: 'secret_sauce'
},
invalidUser: {
username: 'invalid_user',
password: 'wrong_password'
}
};

test.describe('Login Tests', () => {
    // ❌ SE ELIMINÓ el mode: 'serial' para que todos los tests se ejecuten

    test('Login exitoso', async ({ loginPage, page }, testInfo) => {
        await test.step('Navegar a la página de login', async () => {
            await loginPage.navigateTo('https://www.saucedemo.com/v1/');
            await testInfo.attach('Página de login cargada', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });
        });

        await test.step('Realizar login con credenciales válidas', async () => {
            await loginPage.fillField(loginPage.usernameInput, testData.validUser.username);
            await loginPage.fillField(loginPage.passwordInput, testData.validUser.password);
            await loginPage.waitAndClick(loginPage.loginButton);

            await testInfo.attach('Formulario de login completado', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });
        });

        await test.step('Agregar producto al carrito', async () => {
            await loginPage.waitAndClick(loginPage.car);
            await loginPage.waitAndClick(loginPage.car2);

            await testInfo.attach('Producto agregado al carrito', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });
        });

        await test.step('Verificar redirección y elementos de la página', async () => {
            await expect(page).toHaveURL(/inventory.html/);
            await expect(page.locator('.product_label')).toHaveText('Products');

            await testInfo.attach('Página de productos después del login', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });
        });
    });

    test('Login fallido', async ({ loginPage, page }, testInfo) => {
        await test.step('Navegar a la página de login', async () => {
            await loginPage.navigateTo('https://www.saucedemo.com/v1/');
            await testInfo.attach('Página de login inicial', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });
        });

        await test.step('Intentar login con credenciales inválidas', async () => {
            await loginPage.fillField(loginPage.usernameInput, testData.invalidUser.username);
            await loginPage.fillField(loginPage.passwordInput, testData.invalidUser.password);
            await loginPage.waitAndClick(loginPage.loginButton);

            await testInfo.attach('Formulario con credenciales inválidas', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });
        });

        await test.step('Verificar mensaje de error', async () => {
            const errorMessage = await loginPage.getElementText(loginPage.errorMessage);
            expect(errorMessage).toContain('Username and password do not match');

            await testInfo.attach('Mensaje de error de login', {
                body: await page.screenshot(),
                contentType: 'image/png'
            });

            await testInfo.attach('Mensaje de Error', {
                body: errorMessage,
                contentType: 'text/plain'
            });
        });
    });

    test('Migración de pedidos experiencia', async ({ dbUtils }, testInfo) => {
        test.setTimeout(180000); // ⏱️ Solo este test tendrá timeout de 3 minutos

        await test.step('Ejecutar migración silenciosa de base de datos', async () => {
            await dbUtils.ejecutarMigracionSilenciosa();

            await testInfo.attach('Estado Migración', {
                body: '✅ MIGRACIÓN TERMINADA EXITOSAMENTE',
                contentType: 'text/plain'
            });
        });
    });
});