import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BasePage {
readonly page: Page;
baseUrl: string;
private static urlLogged = false; // ← Flag estático para evitar logs duplicados

constructor(page: Page) {
        this.page = page;
        this.baseUrl = this.obtenerUrlGuardada() || 'http://10.23.100.19:183/proy_JC';

        // Solo mostrar el log una vez
        if (!BasePage.urlLogged) {
            console.log(`✅ URL base configurada: ${this.baseUrl}`);
            BasePage.urlLogged = true;
        }
    }

    // ►►► MÉTODO PARA OBTENER LA URL GUARDADA
    private obtenerUrlGuardada(): string | null {
        try {
            const configPath = path.join(__dirname, 'config.json');
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configData);
                return config.lastBaseUrl || null;
            }
        } catch (error) {
            console.log('⚠️ Error leyendo configuración:', error.message);
        }
        return null;
    }

    // ►►► MÉTODO PARA GUARDAR LA URL PERSISTENTEMENTE
    private guardarUrlEnConfig(nuevaUrl: string): void {
        try {
            const configPath = path.join(__dirname, 'config.json');
            const configData = {
                lastBaseUrl: nuevaUrl,
                updatedAt: new Date().toISOString()
            };
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
            console.log('✅ URL guardada en configuración para próximas ejecuciones');
        } catch (error) {
            console.log('⚠️ Error guardando configuración:', error.message);
        }
    }

    // ►►► MÉTODO PARA ACTUALIZAR URL (AHORA GUARDA PERSISTENTEMENTE)
    setBaseUrl(newUrl: string): void {
        // Limpiar la URL (remover /login, /ventas, etc. del final)
        const urlLimpia = newUrl.replace(/\/\w+$/, '');
        this.baseUrl = urlLimpia;
        this.guardarUrlEnConfig(urlLimpia);
        console.log(`✅ URL base actualizada a: ${urlLimpia}`);
    }

    // Método para navegar a una URL relativa
    async navigateTo(path: string = '', waitForLoad: boolean = true): Promise<void> {
        const fullUrl = path ? `${this.baseUrl}/${path.replace(/^\//, '')}` : this.baseUrl;
        await this.page.goto(fullUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        if (waitForLoad) {
            await this.waitForPageLoad(30000);
        }
    }

    // Método para navegar al login específicamente
    async navigateToLogin(waitForLoad: boolean = true): Promise<void> {
        await this.navigateTo('login', waitForLoad);
    }

    // Método para navegar a nuevo seguimiento
    async navigateToNuevoSeguimiento(waitForLoad: boolean = true): Promise<void> {
        await this.navigateTo('nuevoSeguimiento', waitForLoad);
    }

    // Método para navegar a ventas
    async navigateToVentas(waitForLoad: boolean = true): Promise<void> {
        await this.navigateTo('ventas', waitForLoad);
    }

    // Método para esperar y hacer click (SIN allure.step)
    async waitAndClick(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    // Método para llenar un campo (SIN allure.step)
    async fillField(locator: Locator, text: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(text);
    }

    // Método para obtener texto (SIN allure.step)
    async getElementText(locator: Locator): Promise<string> {
        await locator.waitFor({ state: 'visible' });
        return await locator.textContent() ?? '';
    }

    // Método para seleccionar opción en un dropdown por value
    async selectOptionByValue(selectLocator: Locator, value: string): Promise<void> {
        await selectLocator.waitFor({ state: 'visible' });
        await selectLocator.selectOption({ value: value });
    }

    // Método para seleccionar opción en un dropdown por texto visible
    async selectOptionByLabel(selectLocator: Locator, label: string): Promise<void> {
        await selectLocator.waitFor({ state: 'visible' });
        await selectLocator.selectOption({ label: label });
    }

    // Método para seleccionar opción en un dropdown por índice
    async selectOptionByIndex(selectLocator: Locator, index: number): Promise<void> {
        await selectLocator.waitFor({ state: 'visible' });
        await selectLocator.selectOption({ index: index });
    }

    // Método genérico para seleccionar opción (puede recibir value, label o index)
    async selectOption(selectLocator: Locator, option: string | { value?: string, label?: string, index?: number }): Promise<void> {
        await selectLocator.waitFor({ state: 'visible' });

        if (typeof option === 'string') {
            // Intenta primero por value, luego por label
            try {
                await selectLocator.selectOption({ value: option });
            } catch {
                await selectLocator.selectOption({ label: option });
            }
        } else {
            await selectLocator.selectOption(option);
        }
    }

    // Método para obtener el valor seleccionado de un dropdown
    async getSelectedOptionValue(selectLocator: Locator): Promise<string> {
        await selectLocator.waitFor({ state: 'visible' });
        return await selectLocator.inputValue();
    }

    // Método para obtener el texto de la opción seleccionada
    async getSelectedOptionText(selectLocator: Locator): Promise<string> {
        await selectLocator.waitFor({ state: 'visible' });
        const selectedOption = selectLocator.locator('option:checked');
        return await selectedOption.textContent() ?? '';
    }

    // Método para verificar si una opción específica está seleccionada
    async isOptionSelected(selectLocator: Locator, value: string): Promise<boolean> {
        await selectLocator.waitFor({ state: 'visible' });
        const selectedValue = await this.getSelectedOptionValue(selectLocator);
        return selectedValue === value;
    }

    // Método para marcar/desmarcar checkbox
    async setCheckbox(locator: Locator, checked: boolean): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        const isChecked = await locator.isChecked();

        if (checked && !isChecked) {
            await locator.check();
        } else if (!checked && isChecked) {
            await locator.uncheck();
        }
    }

    // Método para marcar checkbox
    async checkCheckbox(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.check();
    }

    // Método para desmarcar checkbox
    async uncheckCheckbox(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.uncheck();
    }

    // Método para verificar si un checkbox está marcado
    async isCheckboxChecked(locator: Locator): Promise<boolean> {
        await locator.waitFor({ state: 'visible' });
        return await locator.isChecked();
    }

    // Método para llenar textarea
    async fillTextarea(locator: Locator, text: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(text);
    }

    // Método para tomar screenshot
    async takeScreenshot(name: string): Promise<void> {
        const screenshot = await this.page.screenshot();
        // Este método se usará desde los tests con allure.attachment
    }

    // Método adicional: obtener todas las opciones de un select
    async getSelectOptions(selectLocator: Locator): Promise<Array<{value: string, text: string}>> {
        await selectLocator.waitFor({ state: 'visible' });
        const options = await selectLocator.locator('option').all();

        const optionsData = [];
        for (const option of options) {
            const value = await option.getAttribute('value');
            const text = await option.textContent();
            optionsData.push({ value: value ?? '', text: text ?? '' });
        }

        return optionsData;
    }

    // Método para esperar a que un elemento esté visible
    async waitForElementVisible(locator: Locator, timeout: number = 10000): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout });
    }

    // Método para esperar to que un elemento esté oculto
    async waitForElementHidden(locator: Locator, timeout: number = 10000): Promise<void> {
        await locator.waitFor({ state: 'hidden', timeout });
    }

    // Método para verificar si un elemento está visible
    async isElementVisible(locator: Locator, timeout: number = 5000): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    // Método para verificar si un elemento existe
    async isElementExists(locator: Locator, timeout: number = 5000): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'attached', timeout });
            return true;
        } catch {
            return false;
        }
    }

    // Método para obtener el valor de un atributo
    async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
        await locator.waitFor({ state: 'visible' });
        return await locator.getAttribute(attribute);
    }

    // Método para hacer hover sobre un elemento
    async hover(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.hover();
    }

    // Método para presionar una tecla
    async pressKey(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    // Método para escribir texto
    async typeText(text: string): Promise<void> {
        await this.page.keyboard.type(text);
    }

    // Método para limpiar cookies y storage
    async clearBrowserData(): Promise<void> {
        await this.page.context().clearCookies();
        await this.page.evaluate(() => {
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch (error) {
                console.log('⚠️ No se pudo limpiar storage');
            }
        });
    }

    // Método para recargar la página
    async reloadPage(): Promise<void> {
        await this.page.reload();
    }

    // Método para ir hacia atrás
    async goBack(): Promise<void> {
        await this.page.goBack();
    }

    // Método para ir hacia adelante
    async goForward(): Promise<void> {
        await this.page.goForward();
    }

    // Método para obtener la URL actual
    async getCurrentUrl(): Promise<string> {
        return this.page.url();
    }

    // Método para obtener el título de la página
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    // Método para esperar a que la página se cargue completamente
    async waitForPageLoad(timeout: number = 30000): Promise<void> {
        await this.page.waitForLoadState('networkidle', { timeout });
    }
}