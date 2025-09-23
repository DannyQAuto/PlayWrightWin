import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import * as fs from 'fs';
import * as path from 'path';

export class WinforcePage extends BasePage {
readonly usernameInput: Locator;
readonly passwordInput: Locator;
readonly loginButton: Locator;
readonly ventasMenu: Locator;
readonly NewLead: Locator;
readonly AnadirLead: Locator;
readonly CoodenadaLat: Locator;
readonly CoodenadaLong: Locator;
readonly BuscarCorde: Locator;
readonly CorfirmarCorde: Locator;
readonly ContinuarCorde: Locator;
readonly SelectDoc: Locator;
readonly OptionDNI: Locator;
readonly WriteDni: Locator;
readonly BuscarDni: Locator;
readonly Score: Locator;
readonly telefono1: Locator;
readonly telefono2: Locator;
readonly Email: Locator;
readonly TipoDomicilio: Locator;
readonly SelectHogar: Locator;
readonly ZonaRiesgo: Locator;
readonly SinCobertura: Locator;
readonly PredioDropdown: Locator;
readonly OptionInquilino: Locator;
readonly TipoContactoDropdown: Locator;
readonly TipoContactoSelect: Locator;
readonly OptionVenta: Locator;
readonly CheckboxTratamientoDatos: Locator;
readonly CheckboxMaterialPublicitario: Locator;
readonly TextareaObservaciones: Locator;

// NUEVOS LOCATORS para el selector de vendedor
readonly vendedorDropdown: Locator;
readonly vendedorOptions: Locator;
readonly vendedorSelectElement: Locator;
readonly botonGuardar: Locator;
readonly botonContinuar: Locator;
readonly botonOkRegistroExitoso: Locator;

private vendedorEmail: string;
private readonly password: string = 'conecta'; // La contraseña se mantiene fija

constructor(page: Page) {
        super(page);
        this.vendedorEmail = this.obtenerEmailGuardado() || 'despiritu.waytech@win.pe';
        console.log(`✅ Email del vendedor configurado: ${this.vendedorEmail}`);

        // Inicializar todos los locators
        this.usernameInput = page.locator('#username');
        this.passwordInput = page.locator('#password');
        this.loginButton = page.locator('#ingresar');
        this.ventasMenu = page.locator('xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/div[1]/div[1]/div[2]/span[1]/span[1]');
        this.NewLead = page.locator('xpath=/html[1]/body[1]/div[1]/div[1]/div[1]/div[1]/div[1]/div[3]/div[1]/div[1]/div[1]/div[2]/div[1]/div[1]/a[1]/span[2]');
        this.AnadirLead = page.locator('//button[@id="btnNuevoLead"]');
        this.CoodenadaLat = page.locator("//input[@id='gf_lat']");
        this.CoodenadaLong = page.locator("//input[@id='gf_lon']");
        this.BuscarCorde = page.locator("//button[@id='gf_buscar_coordenadas']//img");
        this.CorfirmarCorde = page.locator("//input[@value='Confirmar']");
        this.ContinuarCorde = page.locator("//button[@id='continuar']");
        this.SelectDoc = page.locator('span[aria-labelledby="select2-tipo_doc-container"]');
        this.OptionDNI = page.locator('li.select2-results__option:has-text("DNI")');
        this.WriteDni = page.locator("//input[@id='documento_identidad']");
        this.BuscarDni = page.locator("#search_score_cliente");
        this.Score = page.locator("#estamos_verificando");
        this.telefono1 = page.locator("//input[@id='cli_tel1']");
        this.telefono2 = page.locator("//input[@id='cli_tel2']");
        this.Email = page.locator("//input[@id='cli_email']");
        this.TipoDomicilio = page.locator('#select2-tipo_servicio-container');
        this.SelectHogar = page.locator('.select2-results__option:has-text("Hogar")');
        this.ZonaRiesgo = page.locator('button.swal2-confirm:has-text("OK")');
        this.SinCobertura = page.locator('h5.mb-1:has-text("Sin Cobertura")');
        this.PredioDropdown = page.locator('span#select2-relacionPredio-container');
        this.OptionInquilino = page.locator('.select2-results__option:has-text("Inquilino")');
        this.TipoContactoDropdown = page.locator('span#select2-tipoInteres-container');
        this.TipoContactoSelect = page.locator('select[name="ide_tip_int"]');
        this.OptionVenta = page.locator('.select2-results__option:has-text("Venta")');
        this.CheckboxTratamientoDatos = page.locator('label[for="checkTratamientoDatos"]');
        this.CheckboxMaterialPublicitario = page.locator('label[for="checkMaterialPublicitario"]');
        this.TextareaObservaciones = page.locator('#observaciones');

        // NUEVOS LOCATORS para el selector de vendedor
        this.vendedorDropdown = page.locator('span[aria-labelledby="select2-agencia-container"]');
        this.vendedorOptions = page.locator('.select2-results__option');
        this.vendedorSelectElement = page.locator('select[name="agencia"]');
        this.botonGuardar = page.locator('//button[@id="register_search"]');
        this.botonContinuar = page.locator('#continuar');
        this.botonOkRegistroExitoso = page.locator('//button[normalize-space()="OK"]');
    }

    // ►►► MÉTODO PARA OBTENER EL EMAIL GUARDADO
    private obtenerEmailGuardado(): string | null {
        try {
            const configPath = path.join(__dirname, 'config.json');
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configData);
                return config.lastVendedorEmail || null;
            }
        } catch (error) {
            console.log('⚠️ Error leyendo configuración de email:', error.message);
        }
        return null;
    }

    // ►►► MÉTODO PARA GUARDAR EL EMAIL PERSISTENTEMENTE
    private guardarEmailEnConfig(nuevoEmail: string): void {
        try {
            const configPath = path.join(__dirname, 'config.json');

            // Leer configuración existente o crear nueva
            let configData: any = {};
            if (fs.existsSync(configPath)) {
                const existingData = fs.readFileSync(configPath, 'utf8');
                configData = JSON.parse(existingData);
            }

            // Actualizar solo el email del vendedor
            const updatedConfig = {
                ...configData,
                lastVendedorEmail: nuevoEmail,
                emailUpdatedAt: new Date().toISOString()
            };

            fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
            console.log('✅ Email guardado en configuración para próximas ejecuciones');
        } catch (error) {
            console.log('⚠️ Error guardando configuración de email:', error.message);
        }
    }

    // ►►► MÉTODO PARA ACTUALIZAR EL EMAIL DEL VENDEDOR
    setVendedorEmail(nuevoEmail: string): void {
        this.vendedorEmail = nuevoEmail;
        this.guardarEmailEnConfig(nuevoEmail);
        console.log(`✅ Email del vendedor actualizado a: ${nuevoEmail}`);
    }

    // ►►► MÉTODO PARA OBTENER EL EMAIL ACTUAL
    getVendedorEmail(): string {
        return this.vendedorEmail;
    }

    async navigateToWinforce(): Promise<void> {
        await this.navigateTo('http://10.23.100.19:183/proy_at2/login');
    }

    async login(username: string, password: string): Promise<void> {
        await this.fillField(this.usernameInput, username);
        await this.fillField(this.passwordInput, password);
        await this.waitAndClick(this.loginButton);
    }

    // ►►► MÉTODO ACTUALIZADO: Usa el email configurado
    async loginWithDefaultCredentials(): Promise<void> {
        await this.login(this.vendedorEmail, this.password);
    }

    async clickVentasMenu(): Promise<void> {
        await this.waitAndClick(this.ventasMenu);
    }

    async clickNewLead(): Promise<void> {
        await this.waitAndClick(this.NewLead);
    }

    async clickAnadirLead(): Promise<void> {
        try {
            await this.AnadirLead.waitFor({ state: 'visible', timeout: 10000 });
            await this.AnadirLead.click();
            console.log('✅ Botón Añadir Lead clickeado');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            console.log('❌ Error al hacer clic en Añadir Lead:', error);
            throw error;
        }
    }

    async Corde(latitud: string, longitud: string): Promise<void> {
        await this.fillField(this.CoodenadaLat, latitud);
        await this.fillField(this.CoodenadaLong, longitud);
        await this.waitAndClick(this.BuscarCorde);
        await this.waitAndClick(this.CorfirmarCorde);
        await this.waitAndClick(this.ContinuarCorde);
    }

    async confirmarCoordenadas(): Promise<void> {

        await this.waitAndClick(this.BuscarCorde);
        await this.waitAndClick(this.CorfirmarCorde);
        await this.waitAndClick(this.ContinuarCorde);

    }

    async selectDNIAsDocumentType(): Promise<void> {
        try {
            await this.SelectDoc.waitFor({ state: 'visible', timeout: 15000 });
            await this.SelectDoc.click();

            await this.page.waitForSelector('li.select2-results__option:has-text("DNI")', {
                state: 'visible',
                timeout: 15000
            });


            await this.OptionDNI.click();
           console.log('👤 DNI seleccionado');

            await this.page.waitForSelector('ul.select2-results__options', {
                state: 'hidden',
                timeout: 10000
            });

            await this.page.waitForTimeout(1000);

        } catch (error) {
            console.error('Error al seleccionar DNI:', error);
            await this.page.screenshot({ path: 'error-select-dni.png' });
            throw error;
        }
    }

    async Documento(Dni: string): Promise<void> {
        await this.fillField(this.WriteDni, Dni);
    }

    async clickBuscarDni(): Promise<void> {
        await this.BuscarDni.click();
        console.log('🔍 Botón Buscar DNI clickeado');
    }

    async verificarZonaRiesgo(): Promise<boolean> {
        try {


            const modalSelectors = [
                'button.swal2-confirm:has-text("OK")',
                '.swal2-popup',
                'text=Zona de riesgo',
                'text=Alerta',
                'text=OK',
                '.swal2-confirm'
            ];

            for (const selector of modalSelectors) {
                const elemento = this.page.locator(selector);
                const isVisible = await elemento.isVisible({ timeout: 3000 }).catch(() => false);

                if (isVisible) {

                    await elemento.click();

                    return true;
                }
            }

            console.log('✅ No se detectó modal de zona de riesgo');
            return false;

        } catch (error) {
            console.log('❌ Error al verificar modal de zona de riesgo:', error);
            return false;
        }
    }

    async verificarSinCobertura(): Promise<boolean> {
        try {
            console.log('🔍 Verificando si tiene "cobertura"...');
            await this.page.waitForTimeout(2000);

            const sinCoberturaVisible = await this.SinCobertura.isVisible({ timeout: 3000 }).catch(() => false);

            if (sinCoberturaVisible) {
                const texto = await this.SinCobertura.textContent();
                console.log(`⚠️ Mensaje detectado: "${texto}" - Haciendo refresh...`);
                return true;
            }

            console.log('✅ No se detectó mensaje "Sin Cobertura"');
            return false;

        } catch (error) {
            console.log('❌ Error al verificar Sin Cobertura:', error);
            return false;
        }
    }

    async verificarZonaRiesgoMejorado(): Promise<boolean> {
        try {
            console.log('🔍 Verificando modales de alerta...');

            const modalSelectors = [
                'button.swal2-confirm',
                '.swal2-popup',
                'text/=Zona de riesgo',
                'text/=Alerta',
                'text/=OK',
                'text/=Aceptar',
                'button:has-text("OK")',
                'button:has-text("Aceptar")',
                '.modal-dialog',
                '.modal-content'
            ];

            for (const selector of modalSelectors) {
                try {
                    const elemento = this.page.locator(selector);
                    const isVisible = await elemento.isVisible({ timeout: 2000 }).catch(() => false);

                    if (isVisible) {
                        console.log(`⚠️ Modal detectado con selector: ${selector}`);

                        const botonesConfirmacion = [
                            'button.swal2-confirm',
                            'button:has-text("OK")',
                            'button:has-text("Aceptar")',
                            'input[type="button"][value="OK")',
                            'button.btn-primary',
                            'button.btn-confirm'
                        ];

                        for (const botonSelector of botonesConfirmacion) {
                            const boton = this.page.locator(bonSelector);
                            if (await boton.isVisible({ timeout: 1000 }).catch(() => false)) {
                                await boton.click();
                                console.log('✅ Modal cerrado haciendo clic en botón');
                                await this.page.waitForTimeout(1000);
                                return true;
                            }
                        }

                        await elemento.click();
                        console.log('✅ Modal cerrado haciendo clic en el elemento');
                        await this.page.waitForTimeout(1000);
                        return true;
                    }
                } catch (error) {
                    continue;
                }
            }

            console.log('✅ No se detectaron modales de alerta');
            return false;

        } catch (error) {
            console.log('❌ Error al verificar modales:', error);
            return false;
        }
    }

    async verificarErrores(): Promise<boolean> {
        try {
            const selectoresError = [
                'text/=Error',
                'text/=Failed',
                'text/=Timeout',
                'text/=No se pudo',
                'text/=Connection',
                '.error',
                '.alert-danger',
                '.text-danger'
            ];

            for (const selector of selectoresError) {
                const elemento = this.page.locator(selector);
                if (await elemento.isVisible({ timeout: 1000 }).catch(() => false)) {
                    console.log(`❌ Error detectado: ${selector}`);
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        }
    }

    async validarScoreMejorado(timeout: number = 30000): Promise<boolean> {
        try {
            console.log('⏳ Esperando para que aparezca el Score (timeout: 30s)...');

            let tiempoInicio = Date.now();
            let tiempoTranscurrido = 0;

            while (tiempoTranscurrido < timeout) {
                const hayModal = await this.verificarZonaRiesgoMejorado();
                const haySinCobertura = await this.verificarSinCobertura();

                if (haySinCobertura) {
                    console.log('🚫 Coordenadas sin cobertura detectadas');
                    return false;
                }

                if (hayModal) {
                    console.log('⚠️ Modal detectado y cerrado, continuando verificación...');
                }

                const isScoreVisible = await this.Score.isVisible().catch(() => false);

                if (isScoreVisible) {
                    const scoreText = await this.Score.textContent();
                    console.log(`📊 Texto del Score: ${scoreText}`);

                    if (scoreText && scoreText.toLowerCase().includes('score')) {
                        console.log('✅ Score encontrado correctamente');
                        return true;
                    }
                }

                const hayError = await this.verificarErrores();
                if (hayError) {
                    console.log('❌ Error detectado en la página');
                    return false;
                }

                await this.page.waitForTimeout(2000);
                tiempoTranscurrido = Date.now() - tiempoInicio;

                if (tiempoTranscurrido % 10000 === 0) {
                    console.log(`⏰ Esperando score... (${Math.round(tiempoTranscurrido/1000)}s)`);
                }
            }

            console.log('❌ Timeout: Score no encontrado después de', timeout/1000, 'segundos');
            return false;

        } catch (error) {
            console.log('❌ Error en validación de score:', error.message);
            return false;
        }
    }

    async validarScore(timeout: number = 10000): Promise<boolean> {
        try {
            console.log('⏳ Esperando para que aparezca el Score...');

            const hayModal = await this.verificarZonaRiesgo();
            const haySinCobertura = await this.verificarSinCobertura();

            if (haySinCobertura) {
                console.log('🔄 Mensaje "Sin Cobertura" detectado, haciendo refresh...');
                try {
                    await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
                } catch (error) {
                    console.log('⚠️ Error en reload, continuando...', error.message);
                }
                await this.page.waitForTimeout(3000);
                return false;
            }

            if (hayModal) {

                await this.page.waitForTimeout(10000);
            } else {
                await this.page.waitForTimeout(timeout);
            }

            const isScoreVisible = await this.Score.isVisible().catch(() => false);

            if (isScoreVisible) {
                const scoreText = await this.Score.textContent();
                console.log(`📊 Texto del Score: ${scoreText}`);

                if (scoreText && scoreText.toLowerCase().includes('score')) {

                    return true;
                }
            }


            try {
                await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 5000 });
            } catch (error) {
                console.log('⚠️ Error in reload, continuando...', error.message);
            }
            await this.page.waitForTimeout(3000);
            return false;

        } catch (error) {
            console.log('❌ Error en validación, intentando continuar...', error.message);
            try {
                await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 5000 });
            } catch (reloadError) {
                console.log('⚠️ Error en reload del catch, continuando...', reloadError.message);
            }
            await this.page.waitForTimeout(3000);
            return false;
        }
    }

    async validarScoreConReintentos(maxReintentos: number = 3): Promise<boolean> {
        for (let intento = 1; intento <= maxReintentos; intento++) {
            console.log(`🔄 Intento ${intento} de ${maxReintentos} para validar score`);

            const exito = await this.validarScore(10000);

            if (exito) {
                return true;
            }

            if (intento < maxReintentos) {
                console.log(`⏳ Esperando antes del próximo intento...`);
                await this.page.waitForTimeout(3000);
            }
        }

        console.log('❌ No se pudo obtener el score después de todos los intentos');
        return false;
    }

    async llenarTelefono1(): Promise<void> {
        await this.fillField(this.telefono1, '921001264');
        console.log('📞 Teléfono 1 escrito: 921001264');
    }

    async llenarTelefono2(): Promise<void> {
        await this.fillField(this.telefono2, '904088904');
        console.log('📞 Teléfono 2 escrito: 904088904');
    }

    async llenarEmail(): Promise<void> {
        await this.fillField(this.Email, 'qati@win.pe');
        console.log('📧 Email escrito: qati@win.pe');
    }

    async llenarInformacionContacto(): Promise<void> {
        await this.llenarTelefono1();
        await this.page.waitForTimeout(1000);
        await this.llenarTelefono2();
        await this.page.waitForTimeout(1000);
        await this.llenarEmail();
        await this.page.waitForTimeout(1000);
    }

    async seleccionarTipoDomicilio(opcion: string = 'Hogar'): Promise<void> {
        try {
            console.log(`🏠 Seleccionando tipo de domicilio: ${opcion}`);

            await this.TipoDomicilio.waitFor({ state: 'visible', timeout: 10000 });
            await this.TipoDomicilio.click();
            console.log('✅ Seleccionando el tipo de domicilio');

            await this.page.waitForSelector('.select2-results__options', {
                state: 'visible',
                timeout: 10000
            });


            const opcionLocator = this.page.locator(`.select2-results__option:has-text("${opcion}")`);
            await opcionLocator.waitFor({ state: 'visible', timeout: 10000 });
            await opcionLocator.click();
            console.log(`✅ Opción "${opcion}" seleccionada`);

            await this.page.waitForSelector('.select2-results__options', {
                state: 'hidden',
                timeout: 5000
            });

            await this.page.waitForTimeout(1000);

        } catch (error) {
            console.error(`❌ Error al seleccionar tipo de domicilio "${opcion}":`, error);
            await this.page.screenshot({ path: 'error-tipo-domicilio.png' });
            throw error;
        }
    }

    async seleccionarHogar(): Promise<void> {
        await this.seleccionarTipoDomicilio('Hogar');
    }

    async abrirDropdownPredio(): Promise<void> {
        try {

            await this.PredioDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await this.PredioDropdown.click();

            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al abrir dropdown de Predio:', error);
            throw error;
        }
    }

    async seleccionarInquilino(): Promise<void> {
        try {
            console.log('👤 Seleccionando Inquilino...');
            await this.OptionInquilino.waitFor({ state: 'visible', timeout: 10000 });
            await this.OptionInquilino.click();
            console.log('✅ Inquilino seleccionado');
            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al seleccionar Inquilino:', error);
            throw error;
        }
    }

    async seleccionarPredioInquilino(): Promise<void> {
        try {
            await this.abrirDropdownPredio();
            await this.seleccionarInquilino();
            console.log('🎯 Proceso de selección de Predio-Inquilino completado');
        } catch (error) {
            console.error('❌ Error en el proceso de Predio-Inquilino:', error);
            throw error;
        }
    }

    async abrirDropdownTipoContacto(): Promise<void> {
        try {
            console.log('📞 Abriendo dropdown de Tipo de Contacto...');
            await this.TipoContactoDropdown.waitFor({ state: 'visible', timeout: 10000 });
            await this.TipoContactoDropdown.click();
            console.log('✅ Dropdown de Tipo de Contacto abierto');
            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al abrir dropdown de Tipo de Contacto:', error);
            throw error;
        }
    }

    async seleccionarVenta(): Promise<void> {
        try {
            console.log('💰 Seleccionando Venta desde dropdown...');
            await this.OptionVenta.waitFor({ state: 'visible', timeout: 10000 });
            await this.OptionVenta.click();
            console.log('✅ Venta seleccionada desde dropdown');
            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al seleccionar Venta desde dropdown:', error);
            throw error;
        }
    }

    async verificarVentaSeleccionada(): Promise<boolean> {
        try {
            const selectedValue = await this.getSelectedOptionValue(this.TipoContactoSelect);
           // console.log(`🔍 Valor seleccionado en tipo contacto: ${selectedValue}`);
            return selectedValue === '3';
        } catch (error) {
            console.error('❌ Error al verificar selección de Venta:', error);
            return false;
        }
    }

    async seleccionarTipoContactoVenta(): Promise<void> {
        try {
            console.log('💰 Seleccionando opcion de venta');

            // Método preferido: seleccionar por value directamente en el select
            await this.selectOptionByValue(this.TipoContactoSelect, '3');


            await this.page.waitForTimeout(1000);

            // Verificar que la selección fue exitosa
            const seleccionExitosa = await this.verificarVentaSeleccionada();
            if (!seleccionExitosa) {
                throw new Error('La selección por value no funcionó');
            }

        } catch (error) {
            console.error('❌ Error al seleccionar Venta por value:', error);

            // Fallback: método tradicional con dropdown de Select2
            console.log('🔄 Intentando método alternativo con dropdown...');
            await this.abrirDropdownTipoContacto();
            await this.seleccionarVenta();
            console.log('✅ Venta seleccionada (método alternativo)');
        }
    }

    async marcarCheckboxTratamientoDatos(): Promise<void> {
        try {
            console.log('✅ Marcando checkbox de Tratamiento de Datos...');
            await this.checkCheckbox(this.CheckboxTratamientoDatos);

            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al marcar checkbox de Tratamiento de Datos:', error);
            throw error;
        }
    }

    async marcarCheckboxMaterialPublicitario(): Promise<void> {
        try {
            console.log('✅ Marcando checkbox de Material Publicitario...');
            await this.checkCheckbox(this.CheckboxMaterialPublicitario);

            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al marcar checkbox de Material Publicitario:', error);
            throw error;
        }
    }

    async llenarObservaciones(texto: string = 'prueba qa danny'): Promise<void> {
        try {
            console.log('📝 Escribiendo en observaciones...');
            await this.fillTextarea(this.TextareaObservaciones, texto);
            console.log(`✅ Observaciones escritas: "${texto}"`);
            await this.page.waitForTimeout(1000);
        } catch (error) {
            console.error('❌ Error al escribir en observaciones:', error);
            throw error;
        }
    }

    async completarInformacionAdicional(): Promise<void> {
        try {
            console.log('🎯 Completando información adicional...');

            await this.marcarCheckboxTratamientoDatos();
            await this.marcarCheckboxMaterialPublicitario();
            await this.llenarObservaciones();


        } catch (error) {
            console.error('❌ Error al completar información adicional:', error);
            throw error;
        }
    }

    // NUEVO: Método para seleccionar el primer vendedor disponible
    async seleccionarPrimerVendedor(): Promise<void> {
        try {
           // console.log('👤 Abriendo dropdown de vendedor...');

            // Esperar a que el dropdown esté disponible
            await this.vendedorDropdown.waitFor({ state: 'visible', timeout: 10000 });

            // Hacer clic para abrir el dropdown
            await this.vendedorDropdown.click();
            // console.log('✅ Dropdown de vendedor abierto');

            // Esperar a que las opciones se carguen
            await this.page.waitForTimeout(2000);

            // Verificar cuántas opciones hay disponibles
            const opcionesCount = await this.vendedorOptions.count();
            console.log(`📊 Número de vendedores disponibles: ${opcionesCount}`);

            if (opcionesCount === 0) {
                console.log('⚠️ No hay vendedores disponibles en el dropdown');
                return;
            }

            // Obtener todas las opciones de vendedor
            const todasLasOpciones = await this.vendedorOptions.all();

            // Filtrar solo las opciones que no son el placeholder "Seleccione vendedor"
            const opcionesValidas = [];

            for (const opcion of todasLasOpciones) {
                const texto = await opcion.textContent();
                if (texto && texto.trim() !== 'Seleccione vendedor') {
                    opcionesValidas.push(opcion);
                }
            }



            if (opcionesValidas.length === 0) {
                console.log('⚠️ No se encontraron vendedores válidos');
                return;
            }

            // Seleccionar el primer vendedor válido
            const primerVendedor = opcionesValidas[0];
            const nombreVendedor = await primerVendedor.textContent();

            console.log(`✅ Seleccionando primer vendedor: ${nombreVendedor?.trim()}`);
            await primerVendedor.click();

            // Esperar a que el dropdown se cierre
            await this.page.waitForTimeout(1000);


        } catch (error) {
            console.error('❌ Error al seleccionar vendedor:', error);

            // Método alternativo: intentar seleccionar por value si el dropdown falla
            try {
                console.log('🔄 Intentando método alternativo de selección...');
                await this.seleccionarPrimerVendedorAlternativo();
            } catch (fallbackError) {
                console.error('❌ Método alternativo también falló:', fallbackError);
                throw error;
            }
        }
    }

    // NUEVO: Método alternativo para seleccionar vendedor
    private async seleccionarPrimerVendedorAlternativo(): Promise<void> {
        try {
            // Intentar seleccionar directamente por el elemento select
            if (await this.vendedorSelectElement.isVisible()) {
                // Obtener todas las opciones del select
                const options = await this.vendedorSelectElement.locator('option').all();

                // Encontrar la primera opción que tenga value (no sea el placeholder)
                for (const option of options) {
                    const value = await option.getAttribute('value');
                    if (value && value !== '') {
                        const text = await option.textContent();
                        console.log(`✅ Seleccionando vendedor por value: ${value} - ${text}`);
                        await this.selectOptionByValue(this.vendedorSelectElement, value);
                        return;
                    }
                }
            }

            throw new Error('No se pudo encontrar opciones válidas en el método alternativo');

        } catch (error) {
            console.error('❌ Error en método alternativo:', error);
            throw error;
        }
    }

    // NUEVO: Método para verificar si el vendedor fue seleccionado correctamente
    async verificarVendedorSeleccionado(): Promise<boolean> {
        try {
            const textoSeleccionado = await this.vendedorDropdown.textContent();
            const tieneSeleccione = textoSeleccionado?.includes('Seleccione vendedor');

            if (!tieneSeleccione) {
                console.log(`✅ Vendedor seleccionado: ${textoSeleccionado}`);
                return true;
            }

            console.log('❌ Aún muestra "Seleccione vendedor"');
            return false;

        } catch (error) {
            console.error('❌ Error al verificar selección de vendedor:', error);
            return false;
        }
    }

    async clickBotonGuardar(): Promise<void> {
        try {
            console.log('💾 Haciendo clic en botón Guardar...');
            await this.waitAndClick(this.botonGuardar);
            console.log('✅ Botón Guardar clickeado exitosamente');
            await this.page.waitForTimeout(3000);
        } catch (error) {
            console.error('❌ Error al hacer clic en botón Guardar:', error);
            throw error;
        }
    }

    // MÉTODO CORREGIDO: Esperar y hacer clic en Continuar
    async esperarYHacerClicContinuar(timeout: number = 60000): Promise<boolean> {
    console.log(`⏳ Esperando máximo ${timeout/1000} segundos para botón Continuar...`);

    const startTime = Date.now();

    try {
        // Esperar a que el botón esté visible
        await this.botonContinuar.waitFor({
            state: 'visible',
            timeout: timeout
        });

        // Verificar si está habilitado
        const isEnabled = await this.botonContinuar.isEnabled();

        if (isEnabled) {
            console.log('✅ Botón Continuar ACTIVO - haciendo clic!');
            await this.botonContinuar.click();
            return true;
        } else {
            console.log('❌ Botón visible pero DESHABILITADO después de 1 minuto');
            return false;
        }

    } catch (error) {
        console.log('❌ Botón Continuar nunca apareció después de 1 minuto');
        return false;
    }
}

async verificarYManjearModalRegistroExitoso(): Promise<boolean> {
    try {
        console.log('🔍 Verificando si aparece modal de registro exitoso...');

        // Esperar un momento para que el modal pueda aparecer
        await this.page.waitForTimeout(2000);

        const modalVisible = await this.botonOkRegistroExitoso.isVisible({ timeout: 5000 }).catch(() => false);

        if (modalVisible) {
            console.log('✅ Modal de registro exitoso detectado - haciendo clic en OK');
            await this.botonOkRegistroExitoso.click();
            console.log('✅ Modal cerrado exitosamente');
            await this.page.waitForTimeout(1000);
            return true;
        }

        console.log('✅ No se detectó modal de registro exitoso');
        return false;

    } catch (error) {
        console.log('❌ Error al verificar modal de registro exitoso:', error.message);
        return false;
    }
}
async verificarCargaCompleta(): Promise<boolean> {
    try {
        // Verificar múltiples elementos para asegurar carga completa
        const elementosVisibles = await Promise.all([
            this.AnadirLead.isVisible().catch(() => false),
            this.CoodenadaLat.isVisible().catch(() => false),
            this.CoodenadaLong.isVisible().catch(() => false)
        ]);

        return elementosVisibles.every(visible => visible);
    } catch (error) {
        return false;
    }
}
}