// pages/crmExperienciaPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import * as fs from 'fs';
import * as path from 'path';

export class CrmExperienciaPage extends BasePage {
// Locators del login
readonly usernameInput: Locator;
readonly passwordInput: Locator;
readonly ingresarButton: Locator;

// Locators del menú
readonly crmExperienciaOption: Locator;
readonly crmValidacionesOption: Locator;
readonly validacionAsesorOption: Locator;

// Locators de la página de validación
readonly filtroEstadoSelect: Locator;
readonly filtroBusquedaSelect: Locator;
readonly busquedaInput: Locator;
readonly buscarButton: Locator;
readonly telefonoIcon: Locator;
readonly resultado1Select: Locator;
readonly resultado2Select: Locator;
readonly guardarButton: Locator;
readonly confirmarSiButton: Locator;
readonly okButton: Locator;
readonly comentario: Locator;

constructor(page: Page) {
        super(page);

        // Configurar URL para CRM Experiencia
        this.setCrmExperienciaUrl();

        // Inicializar locators del login
        this.usernameInput = page.locator("//input[@placeholder='Nombre usuario']");
        this.passwordInput = page.locator("//input[@placeholder='Clave']");
        this.ingresarButton = page.locator("//button[normalize-space()='INGRESAR']");

        // Inicializar locators del menú
        this.crmExperienciaOption = page.locator("//body/section/aside[@id='leftsidebar']/div[@class='menu']/div[@class='slimScrollDiv']/ul[@class='list']/li[4]/a[1]");
        this.crmValidacionesOption = page.locator("//body/section/aside[@id='leftsidebar']/div[@class='menu']/div[@class='slimScrollDiv']/ul[@class='list']/li/ul[@class='ml-menu']/li[8]/a[1]");
        this.validacionAsesorOption = page.locator("//a[normalize-space()='VALIDACION ASESOR']");

        // Inicializar locators de validación
        this.filtroEstadoSelect = page.locator("//select[@id='busca_estado']");
        this.filtroBusquedaSelect = page.locator("//select[@id='cb_busca_columna']");
        this.busquedaInput = page.locator("//input[@id='txt_busca']");
        this.buscarButton = page.locator("//a[@class='btn btn-block btn-info waves-effect']");
        this.telefonoIcon = page.locator("//i[@class='material-icons'][contains(text(),'settings_phone')]");
        this.resultado1Select = page.locator("//select[@id='cb_resultado1']");
        this.resultado2Select = page.locator("//select[@id='cb_resultado2']");
        this.guardarButton = page.locator("//button[@id='bt_guardar']");
        this.confirmarSiButton = page.locator("//button[@id='boton_enviar_validacion']");
        this.okButton = page.locator("//button[contains(@class,'confirm') and contains(text(),'OK')]");
        this.comentario = page.locator("//textarea[@id='txt_descripcion_validacion']");
    }

    // ►►► MÉTODO PARA OBTENER EL ÚLTIMO DNI DEL JSON
    async obtenerUltimoDni(): Promise<string> {
        try {
            const dnisPath = path.join(__dirname, '../specs/dnis.json');
            console.log(`📁 Buscando archivo en: ${dnisPath}`);

            if (fs.existsSync(dnisPath)) {
                const dnisData = fs.readFileSync(dnisPath, 'utf8');
                const dnisJson = JSON.parse(dnisData);

                const ventasExitosas = dnisJson.ventasExitosas;
                if (ventasExitosas && ventasExitosas.length > 0) {
                    const ultimoDni = ventasExitosas[ventasExitosas.length - 1];
                    console.log(`📄 Último DNI obtenido del JSON: ${ultimoDni}`);
                    console.log(`📊 Total de DNIs en el array: ${ventasExitosas.length}`);
                    return ultimoDni;
                } else {
                    console.log('⚠️ El array ventasExitosas está vacío');
                }
            } else {
                console.log('⚠️ No se encontró el archivo dnis.json');
            }
        } catch (error: any) {
            console.log('❌ Error leyendo archivo DNIs:', error.message);
        }

        console.log('🔄 Usando DNI por defecto: 44417747');
        return '44417747';
    }

    // ►►► MÉTODO PARA NAVEGAR AL LOGIN ESPECÍFICO DE CRM EXPERIENCIA
    async navigateToCrmExperienciaLogin(): Promise<void> {
        console.log('🌐 Navegando al login de CRM Experiencia...');
        await this.navigateTo('pages/login_form.php');
    }

    // Método para realizar login
    async login(username: string = '73451263', password: string = '73451263'): Promise<void> {
        console.log('🔐 Realizando login en CRM Experiencia...');
        await this.navigateToCrmExperienciaLogin();
        await this.fillField(this.usernameInput, username);
        await this.fillField(this.passwordInput, password);
        await this.waitAndClick(this.ingresarButton);
        await this.waitForPageLoad();
        console.log('✅ Login en CRM Experiencia completado');
    }

    // Método para navegar al módulo de validación asesor
    async navegarAValidacionAsesor(): Promise<void> {
        console.log('🧭 Navegando al módulo de validación asesor...');

        await this.waitAndClick(this.crmExperienciaOption);
        await this.waitAndClick(this.crmExperienciaOption);
        await this.waitAndClick(this.crmExperienciaOption);

        await this.waitAndClick(this.crmValidacionesOption);

        await this.waitAndClick(this.validacionAsesorOption);
        await this.waitForPageLoad();
        console.log('✅ Navegación completada');
    }

    // Método para configurar filtros de búsqueda (ACTUALIZADO)
    async configurarFiltros(dni?: string): Promise<string> {
        console.log('⚙️ Configurando filtros de búsqueda...');

        // Obtener el DNI (del parámetro o del JSON)
        let dniABuscar = dni;
        if (!dniABuscar) {
            dniABuscar = await this.obtenerUltimoDni();
        }

        // Seleccionar "FILTRAR:" en el filtro de estado
        await this.selectOptionByLabel(this.filtroEstadoSelect, 'FILTRAR:');
        await this.page.waitForTimeout(500);

        // Seleccionar "Nro documento" en el filtro de búsqueda
        await this.selectOptionByLabel(this.filtroBusquedaSelect, 'Nro documento');
        await this.page.waitForTimeout(500);

        // Ingresar DNI
        await this.fillField(this.busquedaInput, dniABuscar);
        console.log(`✅ Filtros configurados para DNI: ${dniABuscar}`);

        return dniABuscar;
    }

    // Método para realizar búsqueda
    async realizarBusqueda(): Promise<void> {
        console.log('🔍 Realizando búsqueda...');
        await this.waitAndClick(this.buscarButton);

        // Esperar a que los resultados carguen
        await this.page.waitForTimeout(2000);
        console.log('✅ Búsqueda completada');
    }

    // Método para procesar resultado (hacer clic en teléfono)
    async procesarResultado(): Promise<void> {
        console.log('📞 Procesando resultado...');

        // Hacer clic en el ícono del teléfono
        await this.waitAndClick(this.telefonoIcon);

        // Esperar a que se carguen los selects
        await this.page.waitForTimeout(1000);
        console.log('✅ Resultado procesado');
    }

    // Método para completar validación
    async completarValidacion(comentario1: string = 'danny prueba'): Promise<void> {
        console.log('📝 Completando validación...');

        // Seleccionar "APROBADO" en el primer select
        await this.selectOptionByValue(this.resultado1Select, '1');
        await this.page.waitForTimeout(500);

        // Seleccionar "TODO CORRECTO" en el segundo select
        await this.selectOptionByValue(this.resultado2Select, '1');
        await this.page.waitForTimeout(500);

        await this.fillField(this.comentario, comentario1);
        console.log('✅ Comentario agregado');

        // Hacer clic en Guardar
        await this.waitAndClick(this.guardarButton);
        console.log('✅ Validación completada');
    }

    // Método para confirmar en modal
    async confirmarModal(): Promise<void> {
        console.log('✅ Confirmando acción en modal...');

        // Hacer clic en SI
        await this.waitAndClick(this.confirmarSiButton);
        await this.page.waitForTimeout(1000);

        // Hacer clic en OK
        await this.waitAndClick(this.okButton);
        console.log('✅ Confirmación completada');
    }

    // Método completo que ejecuta todo el flujo (ACTUALIZADO)
    async ejecutarFlujoCompleto(dni?: string): Promise<void> {
        console.log('\n🚀 INICIANDO FLUJO COMPLETO DE VALIDACIÓN CRM');
        console.log('═'.repeat(60));

        try {
            await this.login();
            await this.navegarAValidacionAsesor();

            // Obtener el DNI usado (del parámetro o del JSON)
            const dniUsado = await this.configurarFiltros(dni);

            await this.realizarBusqueda();

            // Verificar si hay resultados antes de continuar
            const hayResultados = await this.isElementVisible(this.telefonoIcon, 5000);
            if (hayResultados) {
                await this.procesarResultado();
                await this.completarValidacion();
                await this.confirmarModal();
                console.log(`✅ Validación completada para DNI: ${dniUsado}`);
            } else {
                console.log(`❌ No se encontraron registros para DNI: ${dniUsado}`);
                console.log('💡 Revisa que el DNI exista en el sistema');
            }

            console.log('═'.repeat(60));
            console.log('🎉 FLUJO COMPLETADO EXITOSAMENTE');

        } catch (error) {
            console.log('❌ Error en el flujo:', error);
            throw error;
        }
    }

    // ►►► MÉTODO ADICIONAL: Para cambiar específicamente a la URL de CRM Experiencia
    async setCrmExperienciaUrl(): Promise<void> {
        this.setBaseUrl('http://10.23.100.24/proy_RM/Win.CRM_EXPERIENCIA');
        console.log('✅ URL configurada específicamente para CRM Experiencia');
    }

    // ►►► MÉTODO ADICIONAL: Para verificar que estamos en la URL correcta
    async verificarUrlCrmExperiencia(): Promise<boolean> {
        const currentUrl = await this.getCurrentUrl();
        const isCrmExperiencia = currentUrl.includes('10.23.100.24/proy_RM');
        console.log(`🔍 Verificación URL CRM Experiencia: ${isCrmExperiencia ? '✅' : '❌'}`);
        return isCrmExperiencia;
    }

    // ►►► MÉTODO ADICIONAL: Para probar la lectura del JSON
    async probarLecturaDni(): Promise<void> {
        const ultimoDni = await this.obtenerUltimoDni();
        console.log(`🧪 DNI obtenido en prueba: ${ultimoDni}`);
    }
}