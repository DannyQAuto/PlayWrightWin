import { test, expect } from '../fixtures/base-test';
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