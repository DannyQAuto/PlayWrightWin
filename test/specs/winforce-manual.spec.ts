import { test, expect } from '../fixtures/base-test';
import * as fs from 'fs';
import * as path from 'path';
import { OfertaPage1 as OfertaPage } from '../pages/oferta-page1';
import { ConfirmarVentaPage } from '../pages/confirmar-venta-page';
import { BasePage } from '../pages/base-page';

// ►►► INTERFACE Y FUNCIONES PARA CONFIGURACIÓN PERSISTENTE
interface ConfigData {
coordenadaBaseLat: string;
coordenadaBaseLon: string;
lastBaseUrl?: string;
vendedorEmail?: string;
updatedAt: string;
}

// Función para mostrar barra de progreso
function showProgressBar(current: number, total: number, width: number = 20): string {
    const percentage = (current / total) * 100;
    const filled = Math.round((width * current) / total);
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percentage.toFixed(0)}% (${current}/${total})`;
}

// Función para timer con formato
function formatTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

// Función para mostrar sección de título
function showSectionTitle(title: string): void {
    console.log('\n' + '='.repeat(60));
    console.log(`📋 ${title}`);
    console.log('='.repeat(60));
}

// Función para mostrar métricas en vivo
function showLiveMetrics(metrics: {
    progress: number;
    elapsed: string;
    eta: string;
    steps: string;
    memory: string;
    cpu: string;
    network: string;
}): void {
    console.log('\n📊 LIVE METRICS:');
    console.log(`   ► Progress: ${metrics.progress}% ${showProgressBar(metrics.progress, 100, 15)}`);
    console.log(`   ► Elapsed: ${metrics.elapsed} | ETA: ${metrics.eta}`);
    console.log(`   ► Steps: ${metrics.steps}`);
    console.log(`   ► Mem: ${metrics.memory} | CPU: ${metrics.cpu} | Net: ${metrics.network}`);
}

// Función para mostrar recomendación
function showRecommendation(message: string): void {
    console.log(`🎯 RECOMMENDATION: ${message}`);
}

function obtenerConfiguracion(): ConfigData {
    const configPath = path.join(__dirname, 'config.json');
    try {
        if (fs.existsSync(configPath)) {
            const data = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(data);
            return config;
        }
    } catch (error) {
        console.log('❌ Error leyendo archivo de configuración:', error);
    }

    // Configuración por defecto si no existe el archivo
    const configDefault = {
        coordenadaBaseLat: "-12.097",
        coordenadaBaseLon: "-77.006",
        updatedAt: new Date().toISOString()
    };

    console.log('📁 Creando archivo config.json con valores por defecto');
    guardarConfiguracion(configDefault);

    return configDefault;
}

function guardarConfiguracion(config: ConfigData): void {
    const configPath = path.join(__dirname, 'config.json');
    try {
        config.updatedAt = new Date().toISOString();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('💾 Configuración guardada en config.json');
    } catch (error) {
        console.log('❌ Error guardando configuración:', error);
    }
}

// ►►► CARGAR CONFIGURACIÓN AL INICIAR (persistente después de reinicios)
const configInicial = obtenerConfiguracion();
let coordenadaBaseLat = configInicial.coordenadaBaseLat;
let coordenadaBaseLon = configInicial.coordenadaBaseLon;

// ►►► AGREGADO: Función para preguntar si desea actualizar el ambiente
async function preguntarActualizarAmbiente(basePage: BasePage): Promise<{ actualizar: boolean; nuevaUrl?: string }> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            showSectionTitle('ACTUALIZACIÓN DE AMBIENTE');
            console.log('¿Desea actualizar el ambiente?');
            console.log('1. SI');
            console.log('2. NO');

            const respuesta = rl.question('- ').trim().toUpperCase();

            if (respuesta === '1' || respuesta === 'SI') {
                showSectionTitle('ESCRIBA LA NUEVA URL');
                console.log('Ejemplo: http://10.23.100.19:183/proy_JC/login');
                console.log('URL actual:', basePage.baseUrl);
                const nuevaUrl = rl.question('Escriba la URL BASE del nuevo ambiente: ').trim();

                if (nuevaUrl) {
                    console.log(`✅ Nueva URL configurada: ${nuevaUrl}`);
                    resolve({ actualizar: true, nuevaUrl });
                } else {
                    console.log('⚠️ URL vacía, se mantiene la URL actual');
                    resolve({ actualizar: false });
                }
            } else {
                const urlCompleta = `${basePage.baseUrl}/login`;
                console.log(`✅ Se mantiene el ambiente actual: ${urlCompleta}`);
                resolve({ actualizar: false });
            }
        } catch (error) {
            console.log('⚠️ Error en input. Se mantiene el ambiente actual.');
            resolve({ actualizar: false });
        }
    });
}

// ►►► AGREGADO: Función para preguntar si desea cambiar el email del vendedor
async function preguntarCambiarEmail(winforcePage: any): Promise<{ cambiarEmail: boolean; nuevoEmail?: string }> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            showSectionTitle('CAMBIO DE EMAIL DEL VENDEDOR');

            console.log('¿Desea cambiar el correo del vendedor?');
            console.log('1. SI');
            console.log('2. NO');

            const respuesta = rl.question('- ').trim().toUpperCase();

            if (respuesta === '1' || respuesta === 'SI') {
                showSectionTitle('ACTUALIZACIÓN DE EMAIL DEL VENDEDOR');
                console.log('Email actual:', winforcePage.getVendedorEmail());
                const nuevoEmail = rl.question('Escriba el nuevo correo del vendedor: ').trim();

                if (nuevoEmail && nuevoEmail.includes('@')) {
                    console.log(`✅ Nuevo email configurado: ${nuevoEmail}`);
                    resolve({ cambiarEmail: true, nuevoEmail });
                } else {
                    console.log('⚠️ Email inválido o vacío, se mantiene el email actual');
                    resolve({ cambiarEmail: false });
                }
            } else {
                console.log('✅ Se mantiene el email actual:', winforcePage.getVendedorEmail());
                resolve({ cambiarEmail: false });
            }
        } catch (error) {
            console.log('⚠️ Error en input. Se mantiene el email actual.');
            resolve({ cambiarEmail: false });
        }
    });
}

// ►►► AGREGADO: Función para preguntar si desea modificar coordenadas BASE PERSISTENTEMENTE
async function preguntarModificarCoordenadas(): Promise<{ modificarCoordenadas: boolean; coordenadasManuales?: { lat: string, lon: string } }> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            showSectionTitle('MODIFICACIÓN DE COORDENADAS BASE');
            console.log(`📍 Coordenadas actuales (desde config.json): ${coordenadaBaseLat}, ${coordenadaBaseLon}`);
            console.log('¿Desea modificar las coordenadas BASE de forma permanente?');
            console.log('1. Si (se guardarán para reinicios y próximas ejecuciones)');
            console.log('2. No (mantener coordenadas actuales)');

            const respuesta = rl.question('- ').trim().toUpperCase();

            if (respuesta === '1' || respuesta === 'SI') {
                showSectionTitle('INGRESO DE NUEVAS COORDENADAS BASE PERMANENTES');
                console.log('Ejemplo: -12.087, -77.016');
                console.log('💡 Estas coordenadas se guardarán en config.json y sobrevivirán reinicios');

                let coordenadasValidas = false;
                let latitud = '';
                let longitud = '';

                while (!coordenadasValidas) {
                    const inputCoordenadas = rl.question('Ingrese las nuevas coordenadas base (latitud, longitud): ').trim();

                    if (inputCoordenadas === '') {
                        console.log('✅ Manteniendo coordenadas base actuales');
                        resolve({ modificarCoordenadas: false });
                        return;
                    }

                    const coordenadasRegex = /^-?\d+\.\d+,\s*-?\d+\.\d+$/;
                    if (coordenadasRegex.test(inputCoordenadas)) {
                        const [lat, lon] = inputCoordenadas.split(',').map(coord => coord.trim());
                        latitud = lat;
                        longitud = lon;
                        coordenadasValidas = true;
                        console.log(`✅ Nuevas coordenadas base: ${latitud}, ${longitud}`);
                    } else {
                        console.log('❌ Formato inválido. Use el formato: -12.087, -77.016');
                        console.log('Por favor, intente nuevamente o presione Enter para mantener las actuales');
                    }
                }

                resolve({
                    modificarCoordenadas: true,
                    coordenadasManuales: { lat: latitud, lon: longitud }
                });
            } else {
                console.log('✅ Manteniendo coordenadas base actuales');
                resolve({ modificarCoordenadas: false });
            }
        } catch (error) {
            console.log('⚠️ Error en input. Manteniendo coordenadas base actuales.');
            resolve({ modificarCoordenadas: false });
        }
    });
}

// ►►► AGREGADO: Importar módulo para reproducir sonidos
import * as player from 'play-sound';

// ►►► AGREGADO: Función para reproducir sonido de notificación
function reproducirSonidoNotificacion(): void {
    try {
        process.stdout.write('\x07');

        if (process.platform === 'win32') {
            const { exec } = require('child_process');
            exec('powershell -c (New-Object Media.SoundPlayer "C:\\Windows\\Media\\Ring03.wav").PlaySync();',
                { timeout: 3000 }, (error: any) => {
                    if (error) console.log('⚠️ No se pudo reproducir sonido en Windows');
                });

        }
    } catch (error) {
        console.log('⚠️ No se pudo reproducir sonido de notificación:', error.message);
        process.stdout.write('\x07');
    }
}

// ►►► FUNCIÓN MÁS CONFIABLE PARA PLAYWRIGHT
async function preguntarNumeroVentas(): Promise<number> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            showSectionTitle('CANTIDAD DE VENTAS');
            const answer = rl.question('¿Cuantas ventas exitosas necesitas realizar? ');
            const numero = parseInt(answer);

            if (isNaN(numero) || numero <= 0) {
                console.log('⚠️ Número inválido. Se usará 1 venta por defecto.');
                resolve(1);
            } else {
                resolve(numero);
            }
        } catch (error) {
            console.log('⚠️ Error en input. Se usará 1 venta por defecto.');
            resolve(1);
        }
    });
}

async function preguntarSeleccionPlan(): Promise<number> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            reproducirSonidoNotificacion();
            showSectionTitle('SELECCIÓN DE PLAN');
            console.log('ESCRIBA EL NÚMERO DEL PLAN QUE DESEA SELECCIONAR (0 PARA ALEATORIO)');
            const answer = rl.question('-');
            const numero = parseInt(answer);

            if (isNaN(numero) || numero < 0) {
                console.log('⚠️ Número inválido. Se seleccionará un plan aleatorio.');
                resolve(0);
            } else {
                resolve(numero);
            }
        } catch (error) {
            console.log('⚠️ Error en input. Se seleccionará un plan aleatorio.');
            resolve(0);
        }
    });
}

async function preguntarSeleccionOferta(): Promise<number> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            reproducirSonidoNotificacion();
            showSectionTitle('SELECCIÓN DE OFERTA');
            const answer = rl.question('-');
            const numero = parseInt(answer);

            if (isNaN(numero) || numero < 0) {
                console.log('⚠️ Número inválido. Se seleccionará una oferta aleatoria.');
                resolve(0);
            } else {
                resolve(numero);
            }
        } catch (error) {
            console.log('⚠️ Error en input. Se seleccionará una oferta aleatoria.');
            resolve(0);
        }
    });
}

// ►►► NUEVA FUNCIÓN: Preguntar productos adicionales
async function preguntarProductosAdicionales(): Promise<number[]> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            reproducirSonidoNotificacion();
            showSectionTitle('PRODUCTOS ADICIONALES');
            console.log('Escriba los números de los productos que desea agregar (separados por coma)');
            console.log('Ejemplo: 1,2,3');
            console.log('O escriba 0 para continuar sin agregar productos');

            const answer = rl.question('- ');

            if (answer.trim() === '0') {
                console.log('✅ Continuando sin agregar productos adicionales');
                resolve([]);
                return;
            }

            const numeros = answer.split(',')
                .map(num => parseInt(num.trim()))
                .filter(num => !isNaN(num) && num > 0);

            resolve(numeros);

        } catch (error) {
            console.log('⚠️ Error en input. Continuando sin productos adicionales.');
            resolve([]);
        }
    });
}

// ►►► NUEVA FUNCIÓN: Preguntar por portabilidad
async function preguntarPortabilidad(): Promise<boolean> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
            reproducirSonidoNotificacion();
            showSectionTitle('PREGUNTA DE PORTABILIDAD');
            console.log('¿Desea una portabilidad?');
            console.log('1. Si');
            console.log('2. No');

            const answer = rl.question('- ');
            const quierePortabilidad = (answer === '1' || answer.toLowerCase() === 'si');

            console.log(`✅ Usuario seleccionó: ${quierePortabilidad ? 'SI' : 'NO'} a portabilidad`);
            resolve(quierePortabilidad);

        } catch (error) {
            console.log('⚠️ Error en input. Se asumirá NO portabilidad.');
            resolve(false);
        }
    });
}

interface DniData {
    disponibles: string[];
    ventasExitosas: string[];
    noCalifican: string[];
}

interface CoordenadasData {
    usadas: string[];
    sinCobertura: string[];
    ventasExitosas: string[];
}

function leerCoordenadasUsadas(): CoordenadasData {
    const filePath = path.join(__dirname, 'coordenadas.json');
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(data);
            return {
                usadas: parsedData.usadas || [],
                sinCobertura: parsedData.sinCobertura || [],
                ventasExitosas: parsedData.ventasExitosas || []
            };
        }
    } catch (error) {
        console.log('❌ Error leyendo archivo de coordenadas:', error);
    }
    return {
        usadas: [],
        sinCobertura: [],
        ventasExitosas: []
    };
}

function guardarCoordenadasUsadas(coordenadasData: CoordenadasData): void {
    const filePath = path.join(__dirname, 'coordenadas.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify(coordenadasData, null, 2));
        console.log('✅ Estado de coordenadas guardado correctamente');
    } catch (error) {
        console.log('❌ Error guardando estado de coordenadas:', error);
    }
}

function generarTresDigitos(): string {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

function generarCoordenadaUnica(coordenadasManuales?: { lat: string, lon: string }): { lat: string, lon: string } | null {
    if (coordenadasManuales) {
        const lat = `${coordenadasManuales.lat}${generarTresDigitos()}`;
        const lon = `${coordenadasManuales.lon}${generarTresDigitos()}`;

        coordenadaBaseLat = coordenadasManuales.lat;
        coordenadaBaseLon = coordenadasManuales.lon;

        const config = obtenerConfiguracion();
        config.coordenadaBaseLat = coordenadaBaseLat;
        config.coordenadaBaseLon = coordenadaBaseLon;
        guardarConfiguracion(config);

        console.log(`✅ Usando coordenadas: ${lat}, ${lon}`);
        console.log(`💾 Coordenadas base GUARDADAS para próximos tests: ${coordenadaBaseLat}, ${coordenadaBaseLon}`);
        return { lat, lon };
    }

    const coordenadasData = leerCoordenadasUsadas();
    for (let i = 0; i < 100; i++) {
        const lat = `${coordenadaBaseLat}${generarTresDigitos()}`;
        const lon = `${coordenadaBaseLon}${generarTresDigitos()}`;
        const coordenadaStr = `${lat},${lon}`;
        if (!coordenadasData.usadas.includes(coordenadaStr) &&
            !coordenadasData.sinCobertura.includes(coordenadaStr) &&
            !coordenadasData.ventasExitosas.includes(coordenadaStr)) {
            console.log(`✅ Coordenada generada: ${coordenadaStr}`);
            console.log(`   (Usando coordenadas base desde config.json)`);
            return { lat, lon };
        }
    }
    console.log('❌ No se pudo generar una coordenada única después de 100 intentos');
    return null;
}

function marcarCoordenadaComoUsada(lat: string, lon: string): void {
    const coordenadasData = leerCoordenadasUsadas();
    const coordenadaStr = `${lat},${lon}`;
    if (!coordenadasData.usadas.includes(coordenadaStr)) {
        coordenadasData.usadas.push(coordenadaStr);
        guardarCoordenadasUsadas(coordenadasData);
        console.log(`🚫 Coordenada ${coordenadaStr} marcada como usada`);
    } else {
        console.log(`⚠️ Coordenada ${coordenadaStr} ya estaba marcada como usada`);
    }
}

function marcarCoordenadaVentaExitosa(lat: string, lon: string): void {
    const coordenadasData = leerCoordenadasUsadas();
    const coordenadaStr = `${lat},${lon}`;

    const indexUsadas = coordenadasData.usadas.indexOf(coordenadaStr);
    if (indexUsadas !== -1) {
        coordenadasData.usadas.splice(indexUsadas, 1);
    }

    if (!coordenadasData.ventasExitosas.includes(coordenadaStr)) {
        coordenadasData.ventasExitosas.push(coordenadaStr);
        guardarCoordenadasUsadas(coordenadasData);
        console.log(`✅ Coordenada ${coordenadaStr} marcada como VENTA EXITOSA`);
    } else {
        console.log(`⚠️ Coordenada ${coordenadaStr} ya estaba marcada como venta exitosa`);
    }
}

function marcarCoordenadaSinCobertura(lat: string, lon: string): void {
    const coordenadasData = leerCoordenadasUsadas();
    const coordenadaStr = `${lat},${lon}`;
    if (!coordenadasData.sinCobertura.includes(coordenadaStr)) {
        coordenadasData.sinCobertura.push(coordenadaStr);
        guardarCoordenadasUsadas(coordenadasData);
        console.log(`🚫 Coordenada ${coordenadaStr} marcada como SIN COBERTURA`);
    } else {
        console.log(`⚠️ Coordenada ${coordenadaStr} ya estaba marcada como sin cobertura`);
    }
}

function leerArchivoDNIs(): DniData {
    const filePath = path.join(__dirname, 'dnis.json');
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(data);
            return {
                disponibles: parsedData.disponibles || [],
                ventasExitosas: parsedData.ventasExitosas || [],
                noCalifican: parsedData.noCalifican || []
            };
        }
    } catch (error) {
        console.log('❌ Error leyendo archivo de DNIs:', error);
    }
    return {
        disponibles: [],
        ventasExitosas: [],
        noCalifican: []
    };
}

function guardarEstadoDNIs(dniData: DniData): void {
    const filePath = path.join(__dirname, 'dnis.json');
    try {
        fs.writeFileSync(filePath, JSON.stringify(dniData, null, 2));
        console.log('✅ Estado de DNIs guardado correctamente');
    } catch (error) {
        console.log('❌ Error guardando estado de DNIs:', error);
    }
}

function obtenerDNIDisponible(): string | null {
    const dniData = leerArchivoDNIs();
    if (dniData.disponibles.length === 0) {
        console.log('⚠️ No hay más DNIs disponibles');
        return null;
    }
    const randomIndex = Math.floor(Math.random() * dniData.disponibles.length);
    const dniSeleccionado = dniData.disponibles[randomIndex];
    return dniSeleccionado;
}

function marcarDNIComoUsado(dni: string): boolean {
    const dniData = leerArchivoDNIs();
    const index = dniData.disponibles.indexOf(dni);
    if (index !== -1) {
        dniData.disponibles.splice(index, 1);
        guardarEstadoDNIs(dniData);
        console.log(`✅ DNI ${dni} marcado como usado`);
        return true;
    } else {
        console.log(`⚠️ DNI ${dni} no encontrado en disponibles`);
        return false;
    }
}

function marcarDNIVentaExitosa(dni: string): boolean {
    const dniData = leerArchivoDNIs();
    const indexDisponibles = dniData.disponibles.indexOf(dni);

    if (indexDisponibles !== -1) {
        dniData.disponibles.splice(indexDisponibles, 1);
    }

    if (!dniData.ventasExitosas.includes(dni)) {
        dniData.ventasExitosas.push(dni);
        guardarEstadoDNIs(dniData);
        console.log(`✅ DNI ${dni} marcado como VENTA EXITOSA`);
        return true;
    } else {
        console.log(`⚠️ DNI ${dni} ya estaba marcado como venta exitosa`);
        return false;
    }
}

function marcarDNIComoNoCalifica(dni: string): boolean {
    const dniData = leerArchivoDNIs();
    const indexDisponibles = dniData.disponibles.indexOf(dni);

    if (indexDisponibles !== -1) {
        dniData.disponibles.splice(indexDisponibles, 1);
    }

    if (!dniData.noCalifican.includes(dni)) {
        dniData.noCalifican.push(dni);
        guardarEstadoDNIs(dniData);
        console.log(`🚫 DNI ${dni} marcado como NO CALIFICA`);
        return true;
    } else {
        console.log(`⚠️ DNI ${dni} ya estaba marcado como no califica`);
        return false;
    }
}

// ►►► FUNCIÓN MEJORADA DE REINICIO
async function reiniciarTestCompleto(page: any, winforcePage: any, basePage: BasePage): Promise<boolean> {
    console.log('🔄 REINICIANDO FLUJO COMPLETO DESDE LOGIN...');

    try {
        const currentUrl = await basePage.getCurrentUrl();
        if (currentUrl && currentUrl !== 'about:blank') {
            await basePage.clearBrowserData();
        } else {
            console.log('⚠️ Omitiendo limpieza de storage en about:blank');
        }

        await basePage.navigateToLogin();

        await page.waitForSelector('#username', {
            state: 'visible',
            timeout: 15000
        });

        await winforcePage.loginWithDefaultCredentials();

        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await page.waitForTimeout(3000);

        const newUrl = await basePage.getCurrentUrl();
        if (!newUrl.includes('nuevoSeguimiento')) {
            await winforcePage.clickVentasMenu();
            await page.waitForTimeout(3000);
            await winforcePage.clickNewLead();
            await page.waitForTimeout(2000);
        }

        console.log('✅ Flujo reiniciado exitosamente');
        return true;

    } catch (error) {
        console.log('❌ Error en reinicio completo:', error.message);

        try {
            await basePage.navigateToLogin();

            await page.waitForSelector('#username', {
                state: 'visible',
                timeout: 10000
            });

            return true;
        } catch (secondError) {
            console.log('❌ Error crítico en reinicio:', secondError.message);
            return false;
        }
    }
}

// ►►► FUNCIÓN PARA VERIFICAR REINICIO EXITOSO
async function verificarReinicioExitoso(page: any): Promise<boolean> {
    try {
        const currentUrl = page.url();
        if (currentUrl === 'about:blank') {
            return false;
        }

        const isCorrectPage = currentUrl.includes('nuevoSeguimiento') ||
                             currentUrl.includes('login');

        const usernameVisible = await page.isVisible('#username');
        const passwordVisible = await page.isVisible('#password');

        return isCorrectPage && (usernameVisible || passwordVisible);
    } catch (error) {
        return false;
    }
}

async function buscarScoreDespuesReinicio(page: any, winforcePage: any, basePage: BasePage, coordenadasManuales?: { lat: string, lon: string }): Promise<boolean> {
    console.log('🔄 BUSCANDO SCORE DESPUÉS DE REINICIO...');

    let scoreEncontrado = false;
    let intento = 1;
    let maxIntentos = 20;

    while (!scoreEncontrado && intento <= maxIntentos) {
        console.log(`\n🔄 Intento número después de reinicio: ${intento}`);

        const dniAleatorio = obtenerDNIDisponible();
        if (!dniAleatorio) {
            console.log('❌ No hay DNIs disponibles para usar después de reinicio');
            return false;
        }

        console.log(`🎲 DNI seleccionado después de reinicio: ${dniAleatorio}`);

        const coordenadas = generarCoordenadaUnica(coordenadasManuales);
        if (!coordenadas) {
            console.log('❌ No se pudieron generar coordenadas únicas después de reinicio');
            return false;
        }

        console.log(`📍 Coordenadas después de reinicio: ${coordenadas.lat}, ${coordenadas.lon}`);

        let debeContinuar = false;

        try {
            await winforcePage.AnadirLead.waitFor({ state: 'visible', timeout: 10000 });
            await winforcePage.clickAnadirLead();
            await page.waitForTimeout(3000);

            await winforcePage.CoodenadaLat.fill(coordenadas.lat);
            await winforcePage.CoodenadaLong.fill(coordenadas.lon);
            await winforcePage.confirmarCoordenadas();
            await page.waitForTimeout(2000);

            await winforcePage.selectDNIAsDocumentType();
            await page.waitForTimeout(1000);

            await winforcePage.Documento(dniAleatorio);
            await page.waitForTimeout(2000);

            await winforcePage.clickBuscarDni();

            const haySinCobertura = await winforcePage.verificarSinCobertura();
            if (haySinCobertura) {
                console.log('🚫 Coordenadas sin cobertura detectadas después de reinicio');
                marcarCoordenadaSinCobertura(coordenadas.lat, coordenadas.lon);
                const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                if (!reinicioExitoso) return false;
                scoreEncontrado = false;
                intento++;
                debeContinuar = true;
            } else {
                scoreEncontrado = await winforcePage.validarScore(30000);
                if (scoreEncontrado) {
                    console.log('✅ Score encontrado después de reinicio');
                    marcarCoordenadaComoUsada(coordenadas.lat, coordenadas.lon);
                } else {
                    console.log(`🔄 Score no encontrado después de reinicio`);
                    if (dniAleatorio) {
                        marcarDNIComoNoCalifica(dniAleatorio);
                    }
                    const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                    if (!reinicioExitoso) return false;
                    intento++;
                    debeContinuar = true;
                }
            }

        } catch (error) {
            console.log('❌ Error durante búsqueda de score después de reinicio:', error.message);
            try {
                const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                if (!reinicioExitoso) return false;
            } catch (reloadError) {
                console.log('⚠️ Error en reinicio después de reinicio');
                return false;
            }
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            intento++;
            debeContinuar = true;
        }

        if (debeContinuar) {
            continue;
        }
        break;
    }

    return scoreEncontrado;
}

async function continuarFlujoCompletoDespuesReinicio(page: any, winforcePage: any, basePage: BasePage, coordenadasManuales?: { lat: string, lon: string }): Promise<boolean> {
    console.log('🔄 EJECUTANDO FLUJO COMPLETO DESPUÉS DE REINICIO...');

    const scoreEncontrado = await buscarScoreDespuesReinicio(page, winforcePage, basePage, coordenadasManuales);

    if (!scoreEncontrado) {
        console.log('❌ No se pudo encontrar score después de reinicio');
        return false;
    }

    console.log('✅ Score encontrado después de reinicio - CONTINUANDO CON FLUJO...');

    await test.step('Llenar información de contacto después de reinicio', async () => {
        await winforcePage.llenarInformacionContacto();
        await page.waitForTimeout(2000);
        console.log('✅ Información de contacto completada después de reinicio');
    });

    await test.step('Seleccionar tipo de domicilio después de reinicio', async () => {
        try {
            await winforcePage.seleccionarTipoDomicilio('Hogar');
            console.log('✅ Tipo de domicilio "Hogar" seleccionado después de reinicio');
            await page.waitForTimeout(2000);
            await winforcePage.seleccionarPredioInquilino();
            await page.waitForTimeout(2000);
        } catch (error) {
            console.log('❌ Error al seleccionar tipo de domicilio después de reinicio', error);
            await winforcePage.seleccionarHogar();
            console.log('✅ Tipo de domicilio "Hogar" seleccionado (método alternativo)');
            await page.waitForTimeout(2000);
            await winforcePage.seleccionarPredioInquilino();
            await page.waitForTimeout(2000);
        }
    });

    await test.step('Seleccionar tipo de contacto después de reinicio', async () => {
        await winforcePage.seleccionarTipoContactoVenta();
        console.log('✅ Venta seleccionada después de reinicio');
        await page.waitForTimeout(2000);
    });

    await test.step('Completar información adicional después de reinicio', async () => {
        await winforcePage.completarInformacionAdicional();
        console.log('✅ Información adicional completada después de reinicio');
        await page.waitForTimeout(2002);
    });

    await test.step('Seleccionar vendedor después de reinicio', async () => {
        try {
            await winforcePage.seleccionarPrimerVendedor();
            await page.waitForTimeout(2000);
            const seleccionExitosa = await winforcePage.verificarVendedorSeleccionado();
            if (!seleccionExitosa) {
                console.log('⚠️ La selección automática de vendedor falló después de reinicio, continuando...');
            }
            console.log('✅ Proceso de selección de vendedor completado después de reinicio');
        } catch (error) {
            console.log('⚠️ Error al seleccionar vendedor después de reinicio, continuando con el flujo...', error.message);
        }
    });

    return true;
}

// ►►► TEST PRINCIPAL MODIFICADO
test('Flujo completo Winforce con múltiples ventas', async ({ winforcePage, page, browser}) => {
    let basePage = new BasePage(page);
    let coordenadasManuales: { lat: string, lon: string } | undefined;

    // Mostrar dashboard inicial
    console.log('\n' + '='.repeat(60));
    console.log('           🚀 DEEPSEEK PLAYWRIGHT DASHBOARD');
    console.log('='.repeat(60));
    console.log('  TEST: Flujo completo Winforce con múltiples ventas');
    console.log(`  TIME: ${new Date().toLocaleTimeString()} | DATE: ${new Date().toLocaleDateString()}`);
    console.log('='.repeat(60));

    // ►►► PREGUNTAS INICIALES
    const { actualizar, nuevaUrl } = await preguntarActualizarAmbiente(basePage);

    if (actualizar && nuevaUrl) {
        basePage.setBaseUrl(nuevaUrl);
        console.log('✅ Ambiente actualizado correctamente');

        const { cambiarEmail, nuevoEmail } = await preguntarCambiarEmail(winforcePage);

        if (cambiarEmail && nuevoEmail) {
            winforcePage.setVendedorEmail(nuevoEmail);
            console.log('✅ Email del vendedor actualizado correctamente');
        }

        // ►►► SOLO PREGUNTAR POR COORDENADAS SI ACTUALIZÓ EL AMBIENTE
        const { modificarCoordenadas, coordenadasManuales: coordsManuales } = await preguntarModificarCoordenadas();
        coordenadasManuales = coordsManuales;
    } else {
        console.log('✅ Continuando con ambiente actual...');
        // ►►► NO PREGUNTAR POR COORDENADAS SI NO ACTUALIZÓ EL AMBIENTE
        // Se usarán automáticamente las coordenadas guardadas en config.json
        console.log(`📍 Usando coordenadas base desde config.json: ${coordenadaBaseLat}, ${coordenadaBaseLon}`);
    }

    // ►►► NUEVA VARIABLE: Para trackear DNIs exitosos en ESTA ejecución
    const dnisExitososEstaEjecucion: string[] = [];

    // ►►► INICIALIZACIÓN SEGURA - VERIFICAR ESTADO INICIAL
    console.log('\n🌐 PHASE 1: INITIALIZATION');
    console.log('   🔍 Verificando estado inicial del browser...');
    const initialUrl = await basePage.getCurrentUrl();
    console.log(`   📝 URL inicial: ${initialUrl}`);

    if (initialUrl === 'about:blank') {
        console.log('   🚀 Navegando desde about:blank al login...');
        await basePage.navigateToLogin();
        await page.waitForSelector('#username', { state: 'visible', timeout: 15000 });
    }

    const ventasRequeridas = await preguntarNumeroVentas();
    console.log(`\n🎯 Objetivo: ${ventasRequeridas} venta(s) exitosa(s)`);

    let ventasExitosas = 0;
    let ejecucionCompleta = 1;

    // Mostrar métricas iniciales
    showLiveMetrics({
        progress: 0,
        elapsed: '0s',
        eta: 'Calculando...',
        steps: '0/0',
        memory: '0MB',
        cpu: '0%',
        network: '0req/s'
    });

    // ►►► BUCLE PRINCIPAL PARA MÚLTIPLES VENTAS
    while (ventasExitosas < ventasRequeridas) {
        const progress = Math.round((ventasExitosas / ventasRequeridas) * 100);
        console.log(`\n📊 EJECUCIÓN ${ejecucionCompleta} ${showProgressBar(ventasExitosas, ventasRequeridas)}`);

        const ofertaPage = new OfertaPage(page);
        test.setTimeout(1800000);

        let dniAleatorio: string | null = null;
        let coordenadasActuales: { lat: string, lon: string } | null = null;
        let scoreEncontrado = false;
        let intento = 1;
        let maxIntentos = 50;

        console.log(`🔄 INICIANDO TEST - Máximo 5 intentos para botón Continuar`);

        // ►►► VERIFICACIÓN INICIAL DE ESTADO
        await test.step('Verificar estado inicial antes de cada venta', async () => {
            const currentUrl = page.url();
            console.log(`🔍 URL actual: ${currentUrl}`);

            if (currentUrl === 'about:blank') {
                console.log('🔍 Detectado about:blank, navegando al login...');
                await basePage.navigateToLogin();
                await winforcePage.loginWithDefaultCredentials();
                await page.waitForLoadState('networkidle');
                await winforcePage.clickVentasMenu();
                await page.waitForTimeout(3000);
                await winforcePage.clickNewLead();
                await page.waitForTimeout(2000);
                return;
            }

            if (currentUrl.includes('login')) {
                console.log('🔐 Detectado en página de login, haciendo login...');
                await winforcePage.loginWithDefaultCredentials();
                await page.waitForLoadState('networkidle');
                await winforcePage.clickVentasMenu();
                await page.waitForTimeout(3000);
                await winforcePage.clickNewLead();
                await page.waitForTimeout(2000);
            }
            else if (!currentUrl.includes('nuevoSeguimiento')) {
                console.log('🔄 Estado incorrecto detectado, reiniciando...');
                const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                if (!reinicioExitoso) {
                    throw new Error('No se pudo reiniciar el flujo');
                }
            }
            else {
                console.log('✅ Ya está en posición correcta, continuando...');
            }
        });

        await test.step('Login y navegación', async () => {
            const currentUrl = page.url();
            if (currentUrl === 'about:blank' || !currentUrl.includes('nuevoSeguimiento')) {
                console.log('🧭 Navegando a la página inicial...');
                await winforcePage.navigateToWinforce();
                await winforcePage.loginWithDefaultCredentials();
                await page.waitForLoadState('networkidle');
                await winforcePage.clickVentasMenu();
                await page.waitForTimeout(3000);
                await winforcePage.clickNewLead();
                await page.waitForTimeout(2000);
            } else {
                console.log('✅ Ya está en posición correcta, continuando...');
            }
        });

        while (!scoreEncontrado && intento <= maxIntentos) {
            console.log(`\n🔄 Intento número: ${intento}`);

            dniAleatorio = obtenerDNIDisponible();
            if (!dniAleatorio) {
                console.log('❌ No hay DNIs disponibles para usar');
                throw new Error('NO_HAY_DNIS_DISPONIBLES');
            }

            console.log(`🎲 DNI seleccionado: ${dniAleatorio}`);
            console.log(`📊 DNIs disponibles: ${leerArchivoDNIs().disponibles.length}`);
            console.log(`📊 DNIs ventas exitosas: ${leerArchivoDNIs().ventasExitosas.length}`);
            console.log(`🚫 DNIs no califican: ${leerArchivoDNIs().noCalifican.length}`);
            console.log(`📍 Coordenadas usadas: ${leerCoordenadasUsadas().usadas.length}`);
            console.log(`📍 Coordenadas ventas exitosas: ${leerCoordenadasUsadas().ventasExitosas.length}`);
            console.log(`🚫 Coordenadas sin cobertura: ${leerCoordenadasUsadas().sinCobertura.length}`);

            coordenadasActuales = generarCoordenadaUnica(coordenadasManuales);
            if (!coordenadasActuales) {
                console.log('❌ No se pudieron generar coordenadas únicas');
                throw new Error('NO_HAY_COORDENADAS_UNICAS');
            }

            console.log(`📍 Coordenadas para este intento: ${coordenadasActuales.lat}, ${coordenadasActuales.lon}`);

            let debeContinuar = false;

            try {
                await winforcePage.AnadirLead.waitFor({ state: 'visible', timeout: 10000 });
                await winforcePage.clickAnadirLead();
                await page.waitForTimeout(3000);

                await winforcePage.CoodenadaLat.fill(coordenadasActuales.lat);
                await winforcePage.CoodenadaLong.fill(coordenadasActuales.lon);
                await winforcePage.confirmarCoordenadas();
                await page.waitForTimeout(2000);

                await winforcePage.selectDNIAsDocumentType();
                await page.waitForTimeout(1000);

                await winforcePage.Documento(dniAleatorio);
                await page.waitForTimeout(2000);

                await winforcePage.clickBuscarDni();

                const haySinCobertura = await winforcePage.verificarSinCobertura();
                if (haySinCobertura) {
                    console.log('🚫 Coordenadas sin cobertura detectadas - Marcando y reiniciando...');
                    marcarCoordenadaSinCobertura(coordenadasActuales.lat, coordenadasActuales.lon);
                    const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                    if (!reinicioExitoso) throw new Error('REINICIO_FALLIDO');
                    scoreEncontrado = false;
                    intento++;
                    debeContinuar = true;
                } else {
                    scoreEncontrado = await winforcePage.validarScore(30000);
                    if (scoreEncontrado) {
                        console.log('✅ Score encontrado, marcando coordenada como usada');
                        marcarCoordenadaComoUsada(coordenadasActuales.lat, coordenadasActuales.lon);
                    } else {
                        console.log(`🔄 Score no encontrado, reiniciando para nuevo intento...`);
                        if (dniAleatorio) {
                            marcarDNIComoNoCalifica(dniAleatorio);
                        }
                        const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                        if (!reinicioExitoso) throw new Error('REINICIO_FALLIDO');
                        intento++;
                        debeContinuar = true;
                    }
                }

            } catch (error) {
                console.log('❌ Error durante el flujo, reintentando...', error.message);
                try {
                    const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                    if (!reinicioExitoso) throw new Error('REINICIO_FALLIDO');
                } catch (reloadError) {
                    console.log('⚠️ Error en reinicio principal, intentando navegar de nuevo...');
                    await winforcePage.navigateToWinforce();
                    await winforcePage.loginWithDefaultCredentials();
                }
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(5000);
                await winforcePage.clickVentasMenu();
                await page.waitForTimeout(3000);
                await winforcePage.clickNewLead();
                await page.waitForTimeout(2000);
                intento++;
                debeContinuar = true;
            }

            if (debeContinuar) {
                continue;
            }
            break;
        }

        if (!scoreEncontrado) {
            console.log(`❌ Score no encontrado después de ${intento - 1} intentos`);
            throw new Error(`SCORE_NO_ENCONTRADO_${intento - 1}_INTENTOS`);
        }

        console.log('✅ Score encontrado exitosamente después de', intento - 1, 'intentos');

        let huboReinicio = false;

        await test.step('Llenar información de contacto', async () => {
            try {
                await winforcePage.llenarInformacionContacto();
                await page.waitForTimeout(2000);
                console.log('✅ Información de contacto completada exitosamente');
            } catch (error) {
                console.log('❌ Error en contacto, reiniciando...', error.message);
                const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                if (reinicioExitoso) {
                    huboReinicio = true;
                }
            }
        });

        if (huboReinicio) {
            const flujoCompletado = await continuarFlujoCompletoDespuesReinicio(page, winforcePage, basePage, coordenadasManuales);
            if (!flujoCompletado) {
                throw new Error('NO_SE_PUDO_COMPLETAR_FLUJO_DESPUES_DE_REINICIO');
            }
        } else {
            await test.step('Seleccionar tipo de domicilio - Hogar', async () => {
                try {
                    await winforcePage.seleccionarTipoDomicilio('Hogar');
                    console.log('✅ Tipo de domicilio "Hogar" seleccionado exitosamente');
                    await page.waitForTimeout(2000);
                    await winforcePage.seleccionarPredioInquilino();
                    await page.waitForTimeout(2000);
                } catch (error) {
                    console.log('❌ Error al seleccionar tipo de domicilio, intentando alternativa...', error);
                    await winforcePage.seleccionarHogar();
                    console.log('✅ Tipo de domicilio "Hogar" seleccionado (método alternativo)');
                    await page.waitForTimeout(2000);
                    await winforcePage.seleccionarPredioInquilino();
                    await page.waitForTimeout(2000);
                }
            });

            await test.step('Seleccionar tipo de contacto - Venta', async () => {
                await winforcePage.seleccionarTipoContactoVenta();
                console.log('✅ Venta seleccionada exitosamente');
                await page.waitForTimeout(2000);
            });

            await test.step('Completar información adicional', async () => {
                await winforcePage.completarInformacionAdicional();
                console.log('✅ Información adicional completada exitosamente');
                await page.waitForTimeout(2000);
            });

            await test.step('Seleccionar vendedor', async () => {
                try {
                    await winforcePage.seleccionarPrimerVendedor();
                    await page.waitForTimeout(2000);
                    const seleccionExitosa = await winforcePage.verificarVendedorSeleccionado();
                    if (!seleccionExitosa) {
                        console.log('⚠️ La selección automática de vendedor falló, continuando...');
                    }
                    console.log('✅ Proceso de selección de vendedor completado');
                } catch (error) {
                    console.log('⚠️ Error al seleccionar vendedor, continuando con el flujo...', error.message);
                }
            });
        }

        await test.step('Hacer clic en botón Guardar y reintentar hasta 5 veces si no encuentra Continuar', async () => {
            const maxReintentosGuardar = 2;
            let reintento = 1;
            let flujoCompletado = false;

            while (reintento <= maxReintentosGuardar && !flujoCompletado) {
                console.log(`\n🔄 INTENTO ${reintento}/${maxReintentosGuardar} - Buscando botón Continuar`);

                try {
                    console.log('💾 Haciendo clic en botón Guardar...');
                    await winforcePage.clickBotonGuardar();
                    console.log('✅ Formulario guardado exitosamente');

                    let continuarActivo = false;

                    for (let i = 0; i < 20; i++) {
                        const isVisible = await winforcePage.botonContinuar.isVisible({ timeout: 1000 }).catch(() => false);
                        const isEnabled = isVisible ? await winforcePage.botonContinuar.isEnabled() : false;

                        if (isVisible && isEnabled) {
                            console.log('✅ Botón Continuar ACTIVO - verificando modal de registro exitoso...');

                            const hayModal = await winforcePage.verificarYManjearModalRegistroExitoso();

                            if (hayModal) {
                                console.log('✅ Modal manejado - procediendo con clic en Continuar');
                            }

                            console.log('✅ Haciendo clic en botón Continuar!');
                            await winforcePage.botonContinuar.click();
                            continuarActivo = true;
                            flujoCompletado = true;

                            await page.waitForTimeout(5000);

                            try {
                                const isSelectVisible = await ofertaPage.isSelectTipoBusquedaVisible();
                                if (isSelectVisible) {
                                    console.log('✅ Página de selección de oferta cargada - Seleccionando Internet');
                                    await ofertaPage.seleccionarTipoBusquedaInternet();
                                    console.log('✅ Internet seleccionado exitosamente');

                                    await page.waitForTimeout(2000);
                                    console.log('📋 Esperando que cargue el selector de planes...');

                                    const isPlanSelectVisible = await ofertaPage.isSelectFiltroOfertaVisible();
                                    if (isPlanSelectVisible) {
                                        console.log('✅ Selector de planes visible - Seleccionando plan aleatorio');

                                        console.log('📋 Lista de planes disponibles:');
                                        console.log('-----------------------------');
                                        const planes = await ofertaPage.listarPlanesConNumeros();
                                        planes.forEach(plan => {
                                            console.log(`${plan.numero}. ${plan.text} (Value: ${plan.value})`);
                                        });
                                        console.log('-----------------------------');

                                        reproducirSonidoNotificacion();

                                        const numeroPlan = await preguntarSeleccionPlan();
                                        let planSeleccionado;

                                        if (numeroPlan > 0) {
                                            planSeleccionado = await ofertaPage.seleccionarPlanManual(numeroPlan);
                                        } else {
                                            planSeleccionado = await ofertaPage.seleccionarPlanAleatorio();
                                            console.log(`🎯 Plan seleccionado aleatoriamente: ${planSeleccionado}`);
                                        }

                                        await page.waitForTimeout(3000);

                                        try {
                                            await ofertaPage.esperarOfertasCargadas();

                                            const ofertas = await ofertaPage.listarOfertasConNumeros();
                                            console.log(`📊 Ofertas encontradas: ${ofertas.length}`);
                                            ofertas.forEach((oferta) => {
                                                console.log(`   ${oferta.numero}. ${oferta.nombre} - S/ ${oferta.precio} (Value: ${oferta.value})`);
                                            });
                                            console.log('-----------------------------');

                                            reproducirSonidoNotificacion();

                                            console.log('❓❓❓❓❓❓❓ ESCRIBA EL NÚMERO DE LA OFERTA QUE DESEA SELECCIONAR (0 PARA ALEATORIO) ❓❓❓❓❓❓');

                                            const numeroOferta = await preguntarSeleccionOferta();
                                            let ofertaSeleccionada;

                                            if (numeroOferta > 0) {
                                                ofertaSeleccionada = await ofertaPage.seleccionarOfertaManual(numeroOferta);
                                            } else {
                                                ofertaSeleccionada = await ofertaPage.seleccionarOfertaAleatoria();
                                                console.log(`🎯 Oferta seleccionada aleatoriamente: ${ofertaSeleccionada.nombre}`);
                                            }
                                            await page.waitForTimeout(2000);

                                            console.log('🔄 Verificando productos adicionales...');
                                            const hayProductosAdicionales = await ofertaPage.hayProductosAdicionalesDisponibles();

                                            if (hayProductosAdicionales) {
                                                console.log('📦 Se encontraron productos adicionales disponibles');

                                                const productos = await ofertaPage.listarProductosAdicionalesConNumeros();

                                                if (productos.length > 0) {
                                                    const numerosProductos = await preguntarProductosAdicionales();

                                                    if (numerosProductos.length > 0) {
                                                        console.log(`✅ Seleccionando productos: ${numerosProductos.join(', ')}`);
                                                        await ofertaPage.seleccionarProductosAdicionalesManual(numerosProductos);
                                                        await page.waitForTimeout(2000);
                                                    } else {
                                                        console.log('✅ Continuando sin seleccionar productos adicionales');
                                                    }
                                                } else {
                                                    console.log('ℹ️ No hay productos adicionales disponibles para seleccionar');
                                                }
                                            } else {
                                                console.log('ℹ️ No se encontraron productos adicionales disponibles');
                                            }

                                        } catch (ofertaError) {
                                            console.log('⚠️ Error al seleccionar oferta:', ofertaError.message);
                                            console.log('🔄 Intentando continuar sin selección de oferta...');
                                        }

                                    } else {
                                        console.log('⚠️ Selector de planes no visible después de seleccionar Internet');
                                    }

                                } else {
                                    console.log('⚠️ Select de tipo búsqueda no visible, intentando con espera extendida...');
                                    await page.waitForTimeout(8000);
                                    const retryVisible = await ofertaPage.isSelectTipoBusquedaVisible();
                                    if (retryVisible) {
                                        await ofertaPage.seleccionarTipoBusquedaInternet();
                                        console.log('✅ Internet seleccionado en reintento');

                                        await page.waitForTimeout(3000);
                                        try {
                                            console.log('📋 Lista de planes disponibles:');
                                            console.log('-----------------------------');
                                            const planes = await ofertaPage.listarPlanesConNumeros();
                                            planes.forEach(plan => {
                                                console.log(`${plan.numero}. ${plan.text} (Value: ${plan.value})`);
                                            });
                                            console.log('-----------------------------');

                                            reproducirSonidoNotificacion();

                                            const numeroPlan = await preguntarSeleccionPlan();
                                            let planSeleccionado;

                                            if (numeroPlan > 0) {
                                                planSeleccionado = await ofertaPage.seleccionarPlanManual(numeroPlan);
                                            } else {
                                                planSeleccionado = await ofertaPage.seleccionarPlanAleatorio();
                                                console.log(`🎯 Plan seleccionado aleatoriamente: ${planSeleccionado}`);
                                            }
                                            await page.waitForTimeout(3000);
                                            try {
                                                await ofertaPage.esperarOfertasCargadas();
                                                const ofertas = await ofertaPage.listarOfertasConNumeros();
                                                console.log(`📊 Ofertas encontradas: ${ofertas.length}`);

                                                reproducirSonidoNotificacion();

                                                console.log('❓❓❓❓❓❓❓ ESCRIBA EL NÚMERO DE LA OFERTA QUE DESEA SELECCIONAR (0 PARA ALEATORIO) ❓❓❓❓❓❓');

                                                ofertas.forEach((oferta) => {
                                                    console.log(`   ${oferta.numero}. ${oferta.nombre} - S/ ${oferta.precio} (Value: ${oferta.value})`);
                                                });

                                                const numeroOferta = await preguntarSeleccionOferta();
                                                let ofertaSeleccionada;

                                                if (numeroOferta > 0) {
                                                    ofertaSeleccionada = await ofertaPage.seleccionarOfertaManual(numeroOferta);
                                                } else {
                                                    ofertaSeleccionada = await ofertaPage.seleccionarOfertaAleatoria();
                                                    console.log(`🎯 Oferta seleccionada aleatoriamente: ${ofertaSeleccionada.nombre}`);
                                                }

                                                console.log('🔄 Verificando productos adicionales...');
                                                const hayProductosAdicionales = await ofertaPage.hayProductosAdicionalesDisponibles();

                                                if (hayProductosAdicionales) {
                                                    console.log('📦 Se encontraron productos adicionales disponibles');

                                                    const productos = await ofertaPage.listarProductosAdicionalesConNumeros();

                                                    if (productos.length > 0) {
                                                        const numerosProductos = await preguntarProductosAdicionales();

                                                        if (numerosProductos.length > 0) {
                                                            console.log(`✅ Seleccionando productos: ${numerosProductos.join(', ')}`);
                                                            await ofertaPage.seleccionarProductosAdicionalesManual(numerosProductos);
                                                            await page.waitForTimeout(2000);
                                                        } else {
                                                            console.log('✅ Continuando sin seleccionar productos adicionales');
                                                        }
                                                    } else {
                                                        console.log('ℹ️ No hay productos adicionales disponibles para seleccionar');
                                                    }
                                                } else {
                                                    console.log('ℹ️ No se encontraron productos adicionales disponibles');
                                                }

                                            } catch (ofertaError) {
                                                console.log('⚠️ Error al seleccionar oferta después de reintento:', ofertaError.message);
                                            }

                                        } catch (planError) {
                                            console.log('⚠️ Error al seleccionar plan después de reintento:', planError.message);
                                        }
                                    }
                                }
                            } catch (error) {
                                console.log('⚠️ Error al seleccionar Internet después de Continuar:', error.message);
                            }

                            break;
                        }

                        console.log(`⏳ Esperando... ${i + 1}/20 segundos (Intento ${reintento})`);
                        await page.waitForTimeout(1000);
                    }

                    if (!continuarActivo) {
                        console.log(`❌ Botón Continuar no apareció en el intento ${reintento}`);

                        if (reintento < maxReintentosGuardar) {
                            console.log('🔄 REINICIANDO FLUJO COMPLETO DESDE LOGIN...');
                            const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);

                            if (reinicioExitoso) {
                                console.log('🔄 Reinicio exitoso - BUSCANDO SCORE NUEVAMENTE...');
                                const scoreEncontrado = await buscarScoreDespuesReinicio(page, winforcePage, basePage, coordenadasManuales);

                                if (scoreEncontrado) {
                                    console.log('✅ Score encontrado después de reinicio - CONTINUANDO FLUJO...');
                                    await winforcePage.llenarInformacionContacto();
                                    await page.waitForTimeout(2000);

                                    await winforcePage.seleccionarTipoDomicilio('Hogar');
                                    await page.waitForTimeout(2000);
                                    await winforcePage.seleccionarPredioInquilino();
                                    await page.waitForTimeout(2000);

                                    await winforcePage.seleccionarTipoContactoVenta();
                                    await page.waitForTimeout(2000);

                                    await winforcePage.completarInformacionAdicional();
                                    await page.waitForTimeout(2000);

                                    await winforcePage.seleccionarPrimerVendedor();
                                    await page.waitForTimeout(2000);

                                    reintento++;
                                    continue;
                                } else {
                                    console.log('❌ No se pudo encontrar score después de reinicio');
                                    reintento++;
                                }
                            } else {
                                console.log('❌ Reinicio falló');
                                reintento++;
                            }
                        } else {
                            console.log('❌ MÁXIMO DE REINTENTOS ALCANZADO - Botón Continuar nunca apareció');
                            throw new Error('BOTON_CONTINUAR_NO_APARECIO_5_INTENTOS');
                        }
                    }

                } catch (error) {
                    console.log(`❌ Error en intento ${reintento}:`, error.message);
                    if (reintento < maxReintentosGuardar) {
                        reintento++;
                        console.log(`🔄 Procediendo con intento ${reintento}...`);

                        try {
                            await reiniciarTestCompleto(page, winforcePage, basePage);
                        } catch (reinicioError) {
                            console.log('⚠️ Error en reinicio después de error:', reinicioError.message);
                        }
                    } else {
                        console.error(`BOTON_CONTINUAR_NO_APARECIO_5_INTENTOS: ${error.message}`);
                        throw new Error('Se realizaron 5 intentos pero no se encontró el botón Continuar para continuar la venta');
                    }
                }
            }
        });

        await test.step('Verificar que el flujo se completó correctamente', async () => {
            try {
                await page.waitForTimeout(3000);

                const isInternetSelected = await ofertaPage.verificarInternetSeleccionado();
                expect(isInternetSelected).toBeTruthy();
                console.log('✅ Verificación exitosa: Internet está seleccionado');

                const isPlanSelected = await ofertaPage.verificarPlanSeleccionado();
                expect(isPlanSelected).toBeTruthy();
                console.log('✅ Verificación exitosa: Plan está seleccionado');

                const ofertaSeleccionada = await ofertaPage.obtenerOfertaSeleccionada();
                if (ofertaSeleccionada) {
                    console.log(`✅ Verificación exitosa: Oferta seleccionada - ${ofertaSeleccionada.nombre} - S/ ${ofertaSeleccionada.precio}`);
                } else {
                    console.log('⚠️ No se pudo verificar la selección de oferta');
                }

                const isContinuarHabilitado = await ofertaPage.isBotonContinuarHabilitado();
                expect(isContinuarHabilitado).toBeTruthy();
                console.log('✅ Verificación exitosa: Botón Continuar está habilitado');

                await ofertaPage.clickContinuar();
                console.log('✅ Clic en botón Continuar realizado exitosamente');

            } catch (error) {
                console.log('❌ Error en verificación final:', error.message);
                throw error;
            }
        });

        await test.step('Confirmar venta completa', async () => {
            const confirmarVentaPage = new ConfirmarVentaPage(page);
            let ventaExitosa = false;
            let intentos = 0;
            const maxIntentos = 20;

            do {
                intentos++;
                console.log(`🔄 Intento ${intentos} de ${maxIntentos} - Confirmación de venta`);

                try {
                    await confirmarVentaPage.esperarCarga();

                    const hayPortabilidad = await confirmarVentaPage.verificarPortabilidad();
                    if (hayPortabilidad) {
                        const quierePortabilidad = await preguntarPortabilidad();
                        if (quierePortabilidad) {
                            await confirmarVentaPage.procesarPortabilidadSi();
                        } else {
                            await confirmarVentaPage.procesarPortabilidadNo();
                        }
                    }

                    const ventaConfirmada = await confirmarVentaPage.confirmarVentaCompleta();

                    console.log('📊 RESULTADO VENTA:');
                    console.log(`   📞 Canal: ${ventaConfirmada.canalVenta}`);
                    console.log(`   📅 Fecha: ${ventaConfirmada.fechaProgramacion}`);
                    console.log(`   ⏰ Tramo: ${ventaConfirmada.tramoHorario}`);
                    console.log(`   🔍 Cómo se enteró: ${ventaConfirmada.comoSeEntero}`);
                    console.log(`   📱 Operador: ${ventaConfirmada.operadorActual}`);
                    console.log(`   📁 Archivo subido: ${ventaConfirmada.archivoSubido ? '✅ Sí' : '❌ No'}`);
                    console.log(`   🟢 Solicitud realizada: ${ventaConfirmada.solicitudRealizada ? '✅ Sí' : '❌ No'}`);

                    if (!ventaConfirmada.solicitudRealizada) {
                        console.log('❌ La solicitud no se pudo completar, reiniciando...');
                        const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                        if (reinicioExitoso) {
                            return;
                        } else {
                            console.log('❌ Reinicio falló, continuando con siguiente intento');
                            continue;
                        }
                    }

                    ventaExitosa = await confirmarVentaPage.manejarModalVenta();

                    if (ventaExitosa) {
                        console.log('🎉 ¡VENTA EXITOSA REGISTRADA!');
                        ventasExitosas++;
                        console.log(`✅ Venta exitosa ${ventasExitosas}/${ventasRequeridas} completada`);

                        if (dniAleatorio) {
                            const marcadoExitoso = marcarDNIVentaExitosa(dniAleatorio);
                            if (marcadoExitoso) {
                                console.log(`✅ DNI ${dniAleatorio} marcado como VENTA EXITOSA`);
                                console.log(`📋 DNI REGISTRADO EXITOSAMENTE: ${dniAleatorio}`);
                                dnisExitososEstaEjecucion.push(dniAleatorio);
                            }
                        }

                        if (coordenadasActuales) {
                            marcarCoordenadaVentaExitosa(coordenadasActuales.lat, coordenadasActuales.lon);
                        }

                        if (ventasExitosas < ventasRequeridas) {
                            console.log(`\n🔄 REINICIANDO FLUJO PARA SIGUIENTE VENTA...`);
                            const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                            if (reinicioExitoso) {
                                console.log('✅ Reinicio exitoso, continuando con siguiente venta...');
                                break;
                            } else {
                                console.log('❌ Reinicio falló, terminando test');
                                throw new Error('REINICIO_FALLIDO_DESPUES_DE_VENTA');
                            }
                        }
                        break;
                    } else {
                        console.log('❌ Venta no exitosa, reiniciando proceso...');
                        const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                        if (reinicioExitoso) {
                            return;
                        } else {
                            console.log('❌ Reinicio falló, continuando con siguiente intento');
                            continue;
                        }
                    }

                } catch (error) {
                    console.log('❌ ERROR en confirmación de venta:', error.message);
                    console.log('🔄 Reiniciando flujo completo debido a error...');

                    const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                    if (reinicioExitoso) {
                        return;
                    } else {
                        console.log('❌ No se pudo reiniciar después del error');
                        if (intentos >= maxIntentos) {
                            throw new Error(`No se pudo completar la confirmación de venta después de ${intentos} intentos`);
                        }
                        continue;
                    }
                }

            } while (!ventaExitosa && intentos < maxIntentos);

            if (!ventaExitosa) {
                console.log(`⚠️ No se pudo completar la confirmación de venta después de ${intentos} intentos, reiniciando...`);
                const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                if (!reinicioExitoso) {
                    throw new Error(`No se pudo completar la confirmación de venta después de ${intentos} intentos y reinicio falló`);
                }
                console.log('✅ Reinicio exitoso, volviendo al inicio del flujo');
            }
        });

        if (ventasExitosas < ventasRequeridas) {
            console.log('🔍 Verificando estado después de venta exitosa...');
            const currentUrl = page.url();

            if (!currentUrl.includes('nuevoSeguimiento')) {
                console.log('🔄 Ajustando estado para siguiente venta...');
                try {
                    await winforcePage.clickVentasMenu();
                    await page.waitForTimeout(3000);
                    await winforcePage.clickNewLead();
                    await page.waitForTimeout(2000);
                    console.log('✅ Estado ajustado correctamente');
                } catch (error) {
                    console.log('❌ Error ajustando estado, reiniciando...');
                    await reiniciarTestCompleto(page, winforcePage, basePage);
                }
            }
        }

        ejecucionCompleta++;

        // Actualizar métricas en vivo
        showLiveMetrics({
            progress: Math.round((ventasExitosas / ventasRequeridas) * 100),
            elapsed: 'Calculando...',
            eta: 'Calculando...',
            steps: `${ventasExitosas}/${ventasRequeridas}`,
            memory: 'Calculando...',
            cpu: 'Calculando...',
            network: 'Calculando...'
        });
    }

    // ►►► RESUMEN FINAL
    await test.step('Resumen final del proceso', async () => {
        console.log('\n🎉' + '='.repeat(60));
        console.log('🎯 PROCESO COMPLETADO EXITOSAMENTE');
        console.log('🎉' + '='.repeat(60));

        console.log(`\n📊 ESTADÍSTICAS FINALES:`);
        console.log(`✅ Ventas exitosas completadas: ${ventasExitosas}/${ventasRequeridas}`);
        console.log(`🔄 Total de ejecuciones realizadas: ${ejecucionCompleta - 1}`);
        console.log(`📈 Tasa de éxito: ${((ventasExitosas / (ejecucionCompleta - 1)) * 100).toFixed(2)}%`);

        console.log(`\n📋 DNIs EXITOSOS EN ESTA PRUEBA (${dnisExitososEstaEjecucion.length}):`);
        console.log('='.repeat(50));
        if (dnisExitososEstaEjecucion.length > 0) {
            dnisExitososEstaEjecucion.forEach((dni, index) => {
                console.log(`${index + 1}. ${dni}`);
            });
        } else {
            console.log('❌ No hubo DNIs exitosos en esta prueba');
        }
        console.log('='.repeat(50));

        console.log(`\n📋 INFORMACIÓN DE DNIs:`);
        console.log(`🎯 DNIs usados en esta ejecución: ${ventasExitosas}`);
        console.log(`📊 DNIs restantes disponibles: ${leerArchivoDNIs().disponibles.length}`);
        console.log(`✅ DNIs de ventas exitosas: ${leerArchivoDNIs().ventasExitosas.length}`);
        console.log(`🚫 DNIs que no califican: ${leerArchivoDNIs().noCalifican.length}`);

        console.log(`\n📋 LISTA DE DNIs DE VENTAS EXITOSAS:`);
        console.log('='.repeat(40));
        const dnisVentasExitosas = leerArchivoDNIs().ventasExitosas;
        if (dnisVentasExitosas.length > 0) {
            dnisVentasExitosas.forEach((dni, index) => {
                console.log(`${index + 1}. ${dni}`);
            });
        } else {
            console.log('❌ No hay DNIs de ventas exitosas registrados');
        }
        console.log('='.repeat(40));

        console.log(`\n📋 LISTA DE DNIs QUE NO CALIFICAN:`);
        console.log('='.repeat(40));
        const dnisNoCalifican = leerArchivoDNIs().noCalifican;
        if (dnisNoCalifican.length > 0) {
            dnisNoCalifican.forEach((dni, index) => {
                console.log(`${index + 1}. ${dni}`);
            });
        } else {
            console.log('✅ No hay DNIs que no califiquen');
        }
        console.log('='.repeat(40));

        console.log(`\n📍 INFORMACIÓN DE COORDENADAS:`);
        console.log(`🗺️  Coordenadas usadas totales: ${leerCoordenadasUsadas().usadas.length}`);
        console.log(`✅ Coordenadas de ventas exitosas: ${leerCoordenadasUsadas().ventasExitosas.length}`);
        console.log(`🚫 Coordenadas sin cobertura: ${leerCoordenadasUsadas().sinCobertura.length}`);
        console.log(`🌐 Total de coordenadas procesadas: ${leerCoordenadasUsadas().usadas.length + leerCoordenadasUsadas().ventasExitosas.length + leerCoordenadasUsadas().sinCobertura.length}`);

        console.log('\n⏱️  TIEMPO DE EJECUCIÓN:');
        console.log(`🕒 Hora de finalización: ${new Date().toLocaleTimeString()}`);
        console.log(`📅 Fecha: ${new Date().toLocaleDateString()}`);

        console.log('\n💾 GUARDANDO INFORMACIÓN...');
        await page.waitForTimeout(2000);

        try {
            await page.screenshot({
                path: `resultados-finales-${new Date().getTime()}.png`,
                fullPage: true
            });
            console.log('📸 Captura de pantalla guardada: resultados-finales.png');
        } catch (error) {
            console.log('⚠️ No se pudo guardar la captura de pantalla:', error.message);
        }

        console.log('\n🎉' + '='.repeat(60));
        console.log('✅ TODAS LAS VENTAS SOLICITADAS HAN SIDO COMPLETADAS');
        console.log('🎉' + '='.repeat(60));

        // Mostrar recomendación final
        showRecommendation('Optimize image upload >3s');
    });
});