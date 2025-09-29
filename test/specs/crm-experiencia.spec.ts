// specs/crm-experiencia.spec.ts
import { test } from '@playwright/test';
import { CrmExperienciaPage } from '../pages/crmExperienciaPage';

test('Flujo completo de validación CRM Experiencia con último DNI', async ({ page }) => {
    const crmPage = new CrmExperienciaPage(page);

    await test.step('Login en CRM Experiencia', async () => {
        await crmPage.login();
    });

    await test.step('Navegar al módulo de validación asesor', async () => {
        await crmPage.navegarAValidacionAsesor();
    });

    await test.step('Configurar filtros con último DNI del JSON', async () => {
        // No pasamos DNI, así que usará automáticamente el último del JSON
        const dniUsado = await crmPage.configurarFiltros();
        console.log(`🔍 Buscando con DNI: ${dniUsado}`);
    });

    await test.step('Realizar búsqueda', async () => {
        await crmPage.realizarBusqueda();
    });

    await test.step('Procesar resultado si existe', async () => {
        const hayResultados = await crmPage.isElementVisible(crmPage.telefonoIcon, 5000);
        if (hayResultados) {
            await crmPage.procesarResultado();
            await crmPage.completarValidacion();
            await crmPage.confirmarModal();
            console.log('✅ Validación aplicada exitosamente');
        } else {
            console.log('ℹ️ No hay registros para validar');
        }
    });

    console.log('✅ FLUJO CRM EXPERIENCIA COMPLETADO');
});