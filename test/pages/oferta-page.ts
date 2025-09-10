import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class OfertaPage extends BasePage {
// Locators
readonly selectTipoBusqueda: Locator;
readonly optionInternet: Locator;
readonly selectFiltroOferta: Locator;
readonly optionsPlanes: Locator;

// ►►► NUEVOS LOCATORS para ofertas
readonly divOfertas: Locator;
readonly radioButtonsOfertas: Locator;
readonly nombresOfertas: Locator;
readonly preciosOfertas: Locator;

// ►►► NUEVO LOCATOR para el botón Continuar
readonly btnContinuar: Locator;

constructor(page: Page) {
        super(page);
        // Locators existentes...
        this.selectTipoBusqueda = page.locator('select[name="tipoBusqueda"]');
        this.optionInternet = page.locator('select[name="tipoBusqueda"] option[value="1"]');
        this.selectFiltroOferta = page.locator('select[name="filtroOferta"]');
        this.optionsPlanes = page.locator('select[name="filtroOferta"] option[value]:not([value=""])');

        // ►►► NUEVOS LOCATORS para ofertas
        this.divOfertas = page.locator('div[onclick^="svas_array"]');
        this.radioButtonsOfertas = page.locator('input[name="plan"][type="radio"]');
        this.nombresOfertas = page.locator('h2#paqueteproducto');
        this.preciosOfertas = page.locator('b.fs-4');

        // ►►► NUEVO LOCATOR para el botón Continuar
        this.btnContinuar = page.locator('button#continuar').or(
            page.locator('//button[@id="continuar"]')
        ).or(
            page.locator('button:has-text("Continuar")')
        ).or(
            page.locator('[class*="btn-primary"]:has-text("Continuar")')
        ).or(
            page.locator('[class*="btn-warning"]:has-text("Continuar")')
        ).first();
    }

    // ►►► MÉTODOS DE VISIBILIDAD Y VERIFICACIÓN
    async isSelectTipoBusquedaVisible(): Promise<boolean> {
        try {
            return await this.selectTipoBusqueda.isVisible({ timeout: 5000 });
        } catch (error) {
            return false;
        }
    }

    async isSelectFiltroOfertaVisible(): Promise<boolean> {
        try {
            return await this.selectFiltroOferta.isVisible({ timeout: 5000 });
        } catch (error) {
            return false;
        }
    }

    async verificarInternetSeleccionado(): Promise<boolean> {
        try {
            const selectedValue = await this.selectTipoBusqueda.inputValue();
            return selectedValue === '1';
        } catch (error) {
            console.log('❌ Error verificando selección de Internet:', error.message);
            return false;
        }
    }

    async verificarPlanSeleccionado(): Promise<boolean> {
        try {
            const selectedValue = await this.selectFiltroOferta.inputValue();
            return selectedValue !== '';
        } catch (error) {
            console.log('❌ Error verificando selección de plan:', error.message);
            return false;
        }
    }

    // ►►► MÉTODO PARA SELECCIONAR INTERNET
    async seleccionarTipoBusquedaInternet(): Promise<void> {
        await this.selectTipoBusqueda.waitFor({ state: 'visible', timeout: 10000 });
        await this.selectTipoBusqueda.selectOption({ value: '1' });
        console.log('✅ Tipo de búsqueda seleccionado: Internet');

        // Verificar que la selección fue exitosa
        const isSelected = await this.verificarInternetSeleccionado();
        if (!isSelected) {
            throw new Error('No se pudo seleccionar Internet en el tipo de búsqueda');
        }
    }

    // ►►► MÉTODO PARA LISTAR TODOS LOS PLANES DISPONIBLES
    async listarPlanesDisponibles(): Promise<void> {
        await this.selectFiltroOferta.waitFor({ state: 'visible', timeout: 10000 });

        // Obtener todos los planes disponibles (excluyendo la opción vacía)
        const options = await this.optionsPlanes.all();

        if (options.length === 0) {
            console.log('❌ No se encontraron planes disponibles');
            return;
        }

        console.log('📋 Lista de planes disponibles:');
        console.log('-----------------------------');

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const value = await option.getAttribute('value');
            const text = await option.textContent();

            if (value && text) {
                console.log(`${i + 1}. ${text.trim()} (Value: ${value})`);
            }
        }
        console.log('-----------------------------');
        console.log(`Total de planes: ${options.length}`);
    }

    // ►►► MÉTODO MEJORADO PARA SELECCIONAR PLAN ALEATORIO
    async seleccionarPlanAleatorio(): Promise<string> {
        await this.selectFiltroOferta.waitFor({ state: 'visible', timeout: 10000 });

        // Primero listar todos los planes disponibles
        await this.listarPlanesDisponibles();

        // Obtener todos los planes disponibles
        const options = await this.optionsPlanes.all();

        if (options.length === 0) {
            throw new Error('No se encontraron planes disponibles');
        }

        // Seleccionar un plan aleatorio
        const randomIndex = Math.floor(Math.random() * options.length);
        const selectedOption = options[randomIndex];

        const value = await selectedOption.getAttribute('value');
        const text = await selectedOption.textContent();

        if (!value || !text) {
            throw new Error('No se pudo obtener la información del plan seleccionado');
        }

        // Seleccionar el plan
        await this.selectFiltroOferta.selectOption({ value: value });
        console.log(`✅ Plan seleccionado: ${text.trim()} (Value: ${value})`);

        return `${value} - ${text.trim()}`;
    }

    // ►►► MÉTODO PARA SELECCIONAR PLAN ESPECÍFICO
    async seleccionarPlanPorValue(value: string): Promise<void> {
        await this.selectFiltroOferta.waitFor({ state: 'visible', timeout: 10000 });
        await this.selectFiltroOferta.selectOption({ value: value });

        // Verificar que se seleccionó correctamente
        const selectedValue = await this.selectFiltroOferta.inputValue();
        if (selectedValue !== value) {
            throw new Error(`No se pudo seleccionar el plan con value: ${value}`);
        }

        // Obtener el texto del plan seleccionado
        const selectedText = await this.selectFiltroOferta.locator('option:checked').textContent();
        console.log(`✅ Plan seleccionado: ${selectedText?.trim()} (Value: ${value})`);
    }

    // ►►► MÉTODOS PARA OFERTAS
    async hayOfertasDisponibles(): Promise<boolean> {
        const count = await this.divOfertas.count();
        return count > 0;
    }

    async obtenerInformacionOfertas(): Promise<Array<{
        value: string;
        nombre: string;
        precio: string;
        elemento: Locator;
    }>> {
        await this.divOfertas.first().waitFor({ state: 'visible', timeout: 10000 });

        const ofertas = [];
        const count = await this.divOfertas.count();

        for (let i = 0; i < count; i++) {
            const ofertaDiv = this.divOfertas.nth(i);
            const radioButton = ofertaDiv.locator('input[name="plan"][type="radio"]');
            const nombreElement = ofertaDiv.locator('h2#paqueteproducto');
            const precioElement = ofertaDiv.locator('b.fs-4');

            const value = await radioButton.getAttribute('value');
            const nombre = await nombreElement.textContent();
            const precio = await precioElement.textContent();

            if (value && nombre && precio) {
                ofertas.push({
                    value: value,
                    nombre: nombre.trim(),
                    precio: precio.trim(),
                    elemento: ofertaDiv
                });
            }
        }

        return ofertas;
    }

    async seleccionarOfertaAleatoria(): Promise<{
        value: string;
        nombre: string;
        precio: string;
    }> {
        console.log('🔍 Buscando ofertas disponibles...');

        // Esperar a que las ofertas estén visibles
        await this.divOfertas.first().waitFor({ state: 'visible', timeout: 15000 });

        const ofertas = await this.obtenerInformacionOfertas();

        if (ofertas.length === 0) {
            throw new Error('No se encontraron ofertas disponibles');
        }

        console.log(`📊 Ofertas encontradas: ${ofertas.length}`);

        // Mostrar información de las ofertas (para debugging)
        ofertas.forEach((oferta, index) => {
            console.log(`   ${index + 1}. ${oferta.nombre} - S/ ${oferta.precio} (Value: ${oferta.value})`);
        });

        // Seleccionar una oferta aleatoria
        const randomIndex = Math.floor(Math.random() * ofertas.length);
        const ofertaSeleccionada = ofertas[randomIndex];

        console.log(`🎯 Seleccionando oferta aleatoria: ${ofertaSeleccionada.nombre}`);

        // Hacer clic en el div de la oferta
        await ofertaSeleccionada.elemento.click();
        await this.page.waitForTimeout(2000);

        // Verificar que el radio button está seleccionado
        const isChecked = await ofertaSeleccionada.elemento.locator('input[name="plan"]').isChecked();
        if (!isChecked) {
            console.log('⚠️ El radio button no se seleccionó automáticamente, intentando seleccionar manualmente...');
            await ofertaSeleccionada.elemento.locator('input[name="plan"]').check();
        }

        // Verificar que la oferta quedó seleccionada
        const verificado = await this.verificarOfertaSeleccionada(ofertaSeleccionada.value);
        if (!verificado) {
            throw new Error(`No se pudo verificar la selección de la oferta: ${ofertaSeleccionada.nombre}`);
        }

        // ►►► NUEVO: Verificar si el botón Continuar se ha habilitado
        const continuarHabilitado = await this.isBotonContinuarHabilitado();
        console.log(`🔘 Estado botón Continuar: ${continuarHabilitado ? 'HABILITADO' : 'DESHABILITADO'}`);

        console.log(`✅ Oferta seleccionada exitosamente: ${ofertaSeleccionada.nombre} - S/ ${ofertaSeleccionada.precio}`);

        return ofertaSeleccionada;
    }

    async verificarOfertaSeleccionada(expectedValue: string): Promise<boolean> {
        const radioButton = this.page.locator(`input[name="plan"][value="${expectedValue}"]`);
        return await radioButton.isChecked();
    }

    async obtenerOfertaSeleccionada(): Promise<{
        value: string;
        nombre: string;
        precio: string;
    } | null> {
        const checkedRadio = this.page.locator('input[name="plan"]:checked');
        const count = await checkedRadio.count();

        if (count === 0) {
            return null;
        }

        const value = await checkedRadio.getAttribute('value');
        const divPadre = checkedRadio.locator('xpath=../..//..//..'); // Navegar hasta el div contenedor
        const nombre = await divPadre.locator('h2#paqueteproducto').textContent();
        const precio = await divPadre.locator('b.fs-4').textContent();

        if (value && nombre && precio) {
            return {
                value: value,
                nombre: nombre.trim(),
                precio: precio.trim()
            };
        }

        return null;
    }

    async esperarOfertasCargadas(): Promise<void> {
        console.log('⏳ Esperando a que carguen las ofertas...');

        // Esperar máximo 15 segundos a que aparezcan ofertas
        for (let i = 0; i < 15; i++) {
            const hayOfertas = await this.hayOfertasDisponibles();
            if (hayOfertas) {
                console.log('✅ Ofertas cargadas correctamente');
                return;
            }
            await this.page.waitForTimeout(1000);
            console.log(`⏳ Esperando ofertas... ${i + 1}/15 segundos`);
        }

        throw new Error('Las ofertas no se cargaron después de 15 segundos');
    }

    // ►►► MÉTODO MEJORADO PARA ENCONTRAR SELECTOR
    async encontrarSelectTipoBusqueda(): Promise<Locator | null> {
        const selectors = [
            'select[name="tipoBusqueda"]',
            'select#tipoBusqueda',
            'select.form-select',
            'select[class*="busqueda"]',
            'select[data-name*="busqueda"]'
        ];

        for (const selector of selectors) {
            const locator = this.page.locator(selector);
            if (await locator.count() > 0) {
                console.log(`✅ Select encontrado con selector: ${selector}`);
                return locator;
            }
        }

        // Buscar por option que contenga "Internet"
        const selectsWithInternet = this.page.locator('select').filter({
            has: this.page.locator('option').filter({
                hasText: /Internet|internet/i
            })
        });

        if (await selectsWithInternet.count() > 0) {
            console.log('✅ Select encontrado por option con texto "Internet"');
            return selectsWithInternet.first();
        }

        console.log('❌ No se pudo encontrar el select de tipo búsqueda');
        return null;
    }

    // ►►► MÉTODO ROBUSTO PARA SELECCIÓN DE INTERNET
    async seleccionarInternetRobusto(): Promise<void> {
        console.log('🔍 Buscando select de tipo búsqueda...');

        const select = await this.encontrarSelectTipoBusqueda();
        if (!select) {
            throw new Error('No se pudo encontrar el select de tipo búsqueda');
        }

        await select.waitFor({ state: 'visible', timeout: 10000 });

        // Intentar seleccionar por value
        try {
            await select.selectOption({ value: '1' });
            console.log('✅ Internet seleccionado por value="1"');
        } catch (error) {
            console.log('⚠️ No se pudo seleccionar por value, intentando por texto...');
            // Intentar seleccionar por texto
            await select.selectOption({ label: /Internet/i });
            console.log('✅ Internet seleccionado por texto');
        }

        // Verificar que la selección fue exitosa
        const selectedValue = await select.inputValue();
        console.log(`🔍 Valor seleccionado: ${selectedValue}`);

        if (selectedValue !== '1' && selectedValue !== '') {
            console.log('✅ Internet seleccionado exitosamente');
        } else {
            throw new Error('No se pudo seleccionar Internet en el tipo de búsqueda');
        }
    }

    // ►►► MÉTODO PARA VERIFICAR SI EL BOTÓN CONTINUAR ESTÁ HABILITADO
    async isBotonContinuarHabilitado(): Promise<boolean> {
        try {
            // Primero verificar que existe
            if (!await this.existeBotonContinuar()) {
                return false;
            }

            // Verificar que está visible
            const isVisible = await this.btnContinuar.isVisible({ timeout: 3000 });
            if (!isVisible) {
                return false;
            }

            // Verificar que está habilitado
            return await this.btnContinuar.isEnabled({ timeout: 3000 });
        } catch (error) {
            console.log('⚠️ Error verificando estado del botón Continuar:', error.message);
            return false;
        }
    }

    // ►►► MÉTODO PARA VERIFICAR SI EL BOTÓN EXISTE
    async existeBotonContinuar(): Promise<boolean> {
        try {
            const count = await this.btnContinuar.count();
            return count > 0;
        } catch (error) {
            console.log('⚠️ Error verificando existencia del botón Continuar:', error.message);
            return false;
        }
    }

    // ►►► MÉTODO PARA HACER CLIC EN CONTINUAR
    async clickContinuar(): Promise<void> {
        console.log('🖱️ Intentando hacer clic en el botón Continuar...');

        try {
            // Primero verificar si el botón existe
            const existe = await this.existeBotonContinuar();
            if (!existe) {
                throw new Error('El botón Continuar no se encuentra en la página');
            }

            // Esperar que esté visible
            await this.btnContinuar.waitFor({ state: 'visible', timeout: 15000 });

            // Verificar que el botón está visible
            const isVisible = await this.btnContinuar.isVisible();

            if (!isVisible) {
                throw new Error('El botón Continuar no es visible');
            }

            // Esperar a que esté habilitado (usando polling manual)
            console.log('⏳ Esperando que el botón Continuar esté habilitado...');
            const startTime = Date.now();
            const timeout = 10000; // 10 segundos

            while (Date.now() - startTime < timeout) {
                const isEnabled = await this.btnContinuar.isEnabled();
                if (isEnabled) {
                    console.log('✅ Botón Continuar está habilitado');
                    break;
                }
                await this.page.waitForTimeout(500);
            }

            // Verificar final del estado
            const finalEnabled = await this.btnContinuar.isEnabled();
            if (!finalEnabled) {
                console.log('⚠️ El botón Continuar sigue deshabilitado después de esperar');
                // Tomar screenshot para debugging
                await this.page.screenshot({ path: 'debug-continuar-disabled.png' });
            }

            // Hacer clic en el botón aunque esté deshabilitado (a veces igual funciona)
            console.log('🎯 Haciendo clic en el botón Continuar...');
            await this.btnContinuar.click({ force: true }); // force: true para clic aunque esté deshabilitado

            console.log('✅ Clic en botón Continuar realizado');

            // Esperar a que la acción se complete
            await this.page.waitForTimeout(2000);

        } catch (error) {
            console.log('❌ Error al hacer clic en Continuar:', error.message);

            // Tomar screenshot para debugging
            await this.page.screenshot({ path: 'error-continuar.png' });

            // Intentar método alternativo de clic
            console.log('🔄 Intentando método alternativo de clic...');
            await this.btnContinuar.dispatchEvent('click');

            throw error; // Relanzar el error original
        }
    }

    // ►►► MÉTODO PARA VERIFICAR TEXTO DEL BOTÓN CONTINUAR
    async getTextoBotonContinuar(): Promise<string> {
        const texto = await this.btnContinuar.textContent();
        return texto ? texto.trim() : '';
    }

    // ►►► MÉTODO PARA FLUJO COMPLETO DE SELECCIÓN Y CONTINUAR
    async completarFlujoOferta(): Promise<{
        oferta: { value: string; nombre: string; precio: string };
    }> {
        // Seleccionar oferta aleatoria
        const oferta = await this.seleccionarOfertaAleatoria();

        // Verificar que el botón Continuar está habilitado
        const continuarHabilitado = await this.isBotonContinuarHabilitado();
        if (!continuarHabilitado) {
            throw new Error('El botón Continuar no se habilitó después de seleccionar la oferta');
        }

        // Hacer clic en Continuar
        await this.clickContinuar();

        return { oferta };
    }
}