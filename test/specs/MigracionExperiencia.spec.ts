import { test, expect } from '../fixtures/base-test';
import { DatabaseUtils } from '../utils/database-utils'; // ← Ruta corregida

test('Migración de pedidos experiencia', async ({ }, testInfo) => {
    test.setTimeout(180000);

    await test.step('Seleccionar base de datos', async () => {
        await DatabaseUtils.seleccionarBaseDatos();
    });

    await test.step('Ejecutar migración silenciosa', async () => {
        await DatabaseUtils.ejecutarMigracionSilenciosa();

        await testInfo.attach('Estado Migración', {
            body: '✅ MIGRACIÓN TERMINADA EXITOSAMENTE',
            contentType: 'text/plain'
        });
    });
});