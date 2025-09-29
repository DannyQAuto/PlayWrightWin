import { Page, Locator } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BasePage {
readonly page: Page;
baseUrl: string;
private configFile: string;
private readonly environment: string; // Identificar el ambiente
private static urlLogged = false;

constructor(page: Page, configFile: string = 'config.json') {
        this.page = page;
        this.configFile = configFile;
        this.environment = configFile.includes('experiencia') ? 'experiencia' : 'winforce'; // Identificar ambiente

        this.baseUrl = this.obtenerUrlGuardada() || this.getDefaultUrl();

        // Solo mostrar el log una vez
        if (!BasePage.urlLogged) {
            this.showInitialDashboard();
            BasePage.urlLogged = true;
        }
    }

    // ►►► MÉTODO PARA OBTENER URL POR DEFECTO SEGÚN EL AMBIENTE
    private getDefaultUrl(): string {
        if (this.environment === 'experiencia') {
            return 'http://10.23.100.24/proy_RM/Win.CRM_EXPERIENCIA/pages';
        } else {
            return 'http://10.23.100.19:183/proy_JC';
        }
    }

    // ►►► MÉTODO PARA MOSTRAR DASHBOARD INICIAL
    private showInitialDashboard(): void {
        console.log('\n' + '═'.repeat(80));
        console.log('           🚀 AUTOMATIZACION DE VENTAS');
        console.log('═'.repeat(80));
        console.log('  TEST: Flujo completo Winforce con múltiples ventas');
        console.log(`  ⏰ TIME: ${new Date().toLocaleTimeString()} | 📅 DATE: ${new Date().toLocaleDateString()}`);
        console.log('═'.repeat(80));
        console.log(`🎯 Ambiente: ${this.environment.toUpperCase()} && CRMEXPERIENCIA`);
        console.log(`✅ URL base configurada: ${this.baseUrl} & http://10.23.100.24/proy_RM/Win.CRM_EXPERIENCIA/pages/login_form.php `);
        console.log('═'.repeat(80));
    }

    // ►►► MÉTODO PARA OBTENER LA URL GUARDADA
    private obtenerUrlGuardada(): string | null {
        try {
            const configPath = path.join(__dirname, this.configFile);
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configData);
                const url = config.lastBaseUrl || null;
                if (url) {
                    console.log(`📖 URL recuperada de ${this.configFile}: ${url}`);
                }
                return url;
            }
        } catch (error) {
            console.log('⚠️ Error leyendo configuración:', error.message);
        }
        return null;
    }

    // ►►► MÉTODO PARA GUARDAR LA URL PERSISTENTEMENTE
    private guardarUrlEnConfig(nuevaUrl: string): void {
        try {
            const configPath = path.join(__dirname, this.configFile);
            const configData = {
                lastBaseUrl: nuevaUrl,
                updatedAt: new Date().toISOString(),
                environment: this.environment
            };
            fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
            console.log(`💾 URL guardada en ${this.configFile}`);
        } catch (error) {
            console.log('⚠️ Error guardando configuración:', error.message);
        }
    }

    // ►►► NUEVO MÉTODO: Verificar si la URL corresponde al ambiente actual
    private debeGuardarUrl(url: string): boolean {
        const esUrlWinforce = url.includes('10.23.100.19') || url.includes('proy_JC');
        const esUrlExperiencia = url.includes('10.23.100.24') || url.includes('EXPERIENCIA');

        if (this.environment === 'winforce' && esUrlWinforce) {
            return true;
        }
        if (this.environment === 'experiencia' && esUrlExperiencia) {
            return true;
        }

        return false;
    }

    // ►►► MÉTODO PARA ACTUALIZAR URL (CON BLOQUEO DE MODIFICACIÓN CRUZADA)
    setBaseUrl(newUrl: string): void {
        const urlLimpia = newUrl.replace(/\/\w+$/, '');
        this.baseUrl = urlLimpia;

        // SOLO guardar si la URL pertenece al mismo ambiente
        if (this.debeGuardarUrl(urlLimpia)) {
            this.guardarUrlEnConfig(urlLimpia);
            console.log(`✅ URL ${this.environment} actualizada a: ${urlLimpia}`);
        } else {

        }
    }

    // ►►► MÉTODO PARA CAMBIAR A LA RUTA ALTERNATIVA (CON BLOQUEO)
    setAlternativeUrl(): void {
        const alternativeUrl = 'http://10.23.100.24/proy_RM/Win.CRM_EXPERIENCIA/pages';
        this.baseUrl = alternativeUrl;

        // SOLO guardar si es el ambiente de experiencia
        if (this.environment === 'experiencia') {
            this.guardarUrlEnConfig(alternativeUrl);
            console.log(`🔄 URL base cambiada a ruta alternativa: ${alternativeUrl}`);
        } else {
            console.log(`🚫 BLOQUEO: No se puede cambiar a URL alternativa desde ambiente ${this.environment}`);
            console.log(`ℹ️  URL alternativa solo disponible para ambiente experiencia`);
        }
    }

    // ►►► MÉTODO PARA NAVEGAR A LA RUTA ALTERNATIVA DE LOGIN (SOLO EXPERIENCIA)
    async navigateToAlternativeLogin(waitForLoad: boolean = true): Promise<void> {
        if (this.environment !== 'experiencia') {
            console.log(`🚫 BLOQUEO: navigateToAlternativeLogin solo disponible para ambiente experiencia`);
            return;
        }

        const alternativeLoginUrl = 'http://10.23.100.24/proy_RM/Win.CRM_EXPERIENCIA/pages/login_form.php';
        await this.page.goto(alternativeLoginUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        if (waitForLoad) {
            await this.waitForPageLoad(30000);
        }
        console.log(`🧭 Navegado a ruta alternativa de login: ${alternativeLoginUrl}`);
    }

    // ►►► MÉTODO PARA RESTABLECER LA URL POR DEFECTO
    resetToDefaultUrl(): void {
        const defaultUrl = this.getDefaultUrl();
        this.baseUrl = defaultUrl;

        // Siempre permitir reset a la URL por defecto del ambiente
        this.guardarUrlEnConfig(defaultUrl);
        console.log(`🔄 URL base restablecida a valor por defecto: ${defaultUrl}`);
    }

    // ►►► MÉTODO PARA OBTENER EL AMBIENTE ACTUAL
    getCurrentEnvironment(): string {
        return this.environment;
    }

    // ►►► MÉTODO PARA OBTENER EL ARCHIVO DE CONFIGURACIÓN ACTUAL
    getCurrentConfigFile(): string {
        return this.configFile;
    }

    // ►►► MÉTODO PARA CAMBIAR EL ARCHIVO DE CONFIGURACIÓN (CON VALIDACIÓN)
    setConfigFile(newConfigFile: string): void {
        const oldEnvironment = this.environment;
        this.configFile = newConfigFile;

        // Recargar la URL desde el nuevo archivo de configuración
        const nuevaUrl = this.obtenerUrlGuardada() || this.getDefaultUrl();
        this.baseUrl = nuevaUrl;

        console.log(`📁 Archivo de configuración cambiado: ${oldEnvironment} → ${this.environment}`);
        console.log(`✅ URL base actual: ${this.baseUrl}`);
    }

    // ►►► MÉTODO PARA VERIFICAR SI UNA URL ES COMPATIBLE CON EL AMBIENTE ACTUAL
    isUrlCompatible(url: string): boolean {
        return this.debeGuardarUrl(url);
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

    // Método para esperar y hacer click
    async waitAndClick(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.click();
    }

    // Método para llenar un campo
    async fillField(locator: Locator, text: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(text);
    }

    // Método para obtener texto
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

    // Método genérico para seleccionar opción
    async selectOption(selectLocator: Locator, option: string | { value?: string, label?: string, index?: number }): Promise<void> {
        await selectLocator.waitFor({ state: 'visible' });

        if (typeof option === 'string') {
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