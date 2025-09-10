import { test, expect } from '../fixtures/base-test';
import * as fs from 'fs';
import * as path from 'path';
import { OfertaPage } from '../pages/oferta-page';
import { ConfirmarVentaPage } from '../pages/confirmar-venta-page';
import { BasePage } from '../pages/base-page'


// ►►► FUNCIÓN MÁS CONFIABLE PARA PLAYWRIGHT
async function preguntarNumeroVentas(): Promise<number> {
    return new Promise((resolve) => {
        const rl = require('readline-sync');

        try {
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

interface DniData {
    disponibles: string[];
    usados: string[];
}

interface CoordenadasData {
    usadas: string[];
    sinCobertura: string[];
}

function leerCoordenadasUsadas(): CoordenadasData {
    const filePath = path.join(__dirname, 'coordenadas.json');
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const parsedData = JSON.parse(data);
            return {
                usadas: parsedData.usadas || [],
                sinCobertura: parsedData.sinCobertura || []
            };
        }
    } catch (error) {
        console.log('❌ Error leyendo archivo de coordenadas:', error);
    }
    return {
        usadas: [],
        sinCobertura: []
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

function generarCoordenadaUnica(): { lat: string, lon: string } | null {
    const coordenadasData = leerCoordenadasUsadas();
    for (let i = 0; i < 100; i++) {
        const lat = `-12.097${generarTresDigitos()}`;
        const lon = `-77.006${generarTresDigitos()}`;
        const coordenadaStr = `${lat},${lon}`;
        if (!coordenadasData.usadas.includes(coordenadaStr) &&
            !coordenadasData.sinCobertura.includes(coordenadaStr)) {
            console.log(`✅ Coordenada única generada: ${coordenadaStr}`);
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
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('❌ Error leyendo archivo de DNIs:', error);
    }
    return {
        disponibles: [],
        usados: []
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
        if (!dniData.usados.includes(dni)) {
            dniData.usados.push(dni);
        }
        guardarEstadoDNIs(dniData);
        console.log(`✅ DNI ${dni} marcado como usado`);
        return true;
    } else {
        console.log(`⚠️ DNI ${dni} no encontrado en disponibles`);
        return false;
    }
}

// ►►► FUNCIÓN MEJORADA DE REINICIO
async function reiniciarTestCompleto(page: any, winforcePage: any, basePage: BasePage): Promise<boolean> {
    console.log('🔄 REINICIANDO FLUJO COMPLETO DESDE LOGIN...');

    try {
        // Verificar si estamos en about:blank antes de limpiar
        const currentUrl = await basePage.getCurrentUrl();
        if (currentUrl && currentUrl !== 'about:blank') {
            // Limpiar storage y cookies solo si no estamos en about:blank
            await basePage.clearBrowserData();
        } else {
            console.log('⚠️ Omitiendo limpieza de storage en about:blank');
        }

        // Navegar a login usando BasePage
        await basePage.navigateToLogin();

        // Esperar a que el formulario de login esté presente
        await page.waitForSelector('#username', {
            state: 'visible',
            timeout: 15000
        });

        // Hacer login
        await winforcePage.loginWithDefaultCredentials();

        // Esperar navegación
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Verificar que estamos en la página correcta después del login
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

        // Intentar recuperación
        try {
            await basePage.navigateToLogin();

            // Esperar elementos críticos
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
        // Verificar que no estamos en about:blank
        const currentUrl = page.url();
        if (currentUrl === 'about:blank') {
            return false;
        }

        // Verificar que estamos en la página correcta
        const isCorrectPage = currentUrl.includes('nuevoSeguimiento') ||
                             currentUrl.includes('login');

        // Verificar que elementos críticos están visibles
        const usernameVisible = await page.isVisible('#username');
        const passwordVisible = await page.isVisible('#password');

        return isCorrectPage && (usernameVisible || passwordVisible);
    } catch (error) {
        return false;
    }
}

async function buscarScoreDespuesReinicio(page: any, winforcePage: any, basePage: BasePage): Promise<boolean> {
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

        const coordenadas = generarCoordenadaUnica();
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
async function continuarFlujoCompletoDespuesReinicio(page: any, winforcePage: any, basePage: BasePage): Promise<boolean> {
    console.log('🔄 EJECUTANDO FLUJO COMPLETO DESPUÉS DE REINICIO...');

    const scoreEncontrado = await buscarScoreDespuesReinicio(page, winforcePage, basePage);

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
test('Flujo completo Winforce con múltiples ventas', async ({ winforcePage, page, browser }) => {
      const basePage = new BasePage(page);
    // ►►► INICIALIZACIÓN SEGURA - VERIFICAR ESTADO INICIAL
    console.log('🔍 Verificando estado inicial del browser...');
    const initialUrl = await basePage.getCurrentUrl();
    console.log(`📝 URL inicial: ${initialUrl}`);


    // Si estamos en about:blank, navegar directamente al login
if (initialUrl === 'about:blank') {
    console.log('🚀 Navegando desde about:blank al login...');
    await basePage.navigateToLogin();


        // Esperar a que los elementos críticos estén visibles
        await page.waitForSelector('#username', { state: 'visible', timeout: 15000 });
    }

    const ventasRequeridas = await preguntarNumeroVentas();
    console.log(`🎯 Objetivo: ${ventasRequeridas} venta(s) exitosa(s)`);

    let ventasExitosas = 0;
    let ejecucionCompleta = 1;

    // ►►► BUCLE PRINCIPAL PARA MÚLTIPLES VENTAS
    while (ventasExitosas < ventasRequeridas) {
        console.log(`\n📊 EJECUCIÓN ${ejecucionCompleta} - Ventas exitosas: ${ventasExitosas}/${ventasRequeridas}`);

        const ofertaPage = new OfertaPage(page);
        test.setTimeout(1800000);

        let dniAleatorio: string | null = null;
        let scoreEncontrado = false;
        let intento = 1;
        let maxIntentos = 50;

        console.log(`🔄 INICIANDO TEST - Máximo 5 intentos para botón Continuar`);

        // ►►► VERIFICACIÓN INICIAL DE ESTADO
        await test.step('Verificar estado inicial antes de cada venta', async () => {
            const currentUrl = page.url();
            console.log(`🔍 URL actual: ${currentUrl}`);

            // Si estamos en about:blank, navegar al login
// Si estamos en about:blank, navegar al login
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

            // Si estamos en login, hacer login primero
            if (currentUrl.includes('login')) {
                console.log('🔐 Detectado en página de login, haciendo login...');
                await winforcePage.loginWithDefaultCredentials();
                await page.waitForLoadState('networkidle');
                await winforcePage.clickVentasMenu();
                await page.waitForTimeout(3000);
                await winforcePage.clickNewLead();
                await page.waitForTimeout(2000);
            }
            // Si no estamos en la página correcta, reiniciar
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
            // Solo navegar si no estamos ya en la posición correcta
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
            console.log(`📊 DNIs usados: ${leerArchivoDNIs().usados.length}`);
            console.log(`📍 Coordenadas usadas: ${leerCoordenadasUsadas().usadas.length}`);
            console.log(`🚫 Coordenadas sin cobertura: ${leerCoordenadasUsadas().sinCobertura.length}`);

            const coordenadas = generarCoordenadaUnica();
            if (!coordenadas) {
                console.log('❌ No se pudieron generar coordenadas únicas');
                throw new Error('NO_HAY_COORDENADAS_UNICAS');
            }

            console.log(`📍 Coordenadas para este intento: ${coordenadas.lat}, ${coordenadas.lon}`);

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
                    console.log('🚫 Coordenadas sin cobertura detectadas - Marcando y reiniciando...');
                    marcarCoordenadaSinCobertura(coordenadas.lat, coordenadas.lon);
                    const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
                    if (!reinicioExitoso) throw new Error('REINICIO_FALLIDO');
                    scoreEncontrado = false;
                    intento++;
                    debeContinuar = true;
                } else {
                    scoreEncontrado = await winforcePage.validarScore(30000);
                    if (scoreEncontrado) {
                        console.log('✅ Score encontrado, marcando coordenada como usada');
                        marcarCoordenadaComoUsada(coordenadas.lat, coordenadas.lon);
                    } else {
                        console.log(`🔄 Score no encontrado, reiniciando para nuevo intento...`);
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
            const flujoCompletado = await continuarFlujoCompletoDespuesReinicio(page, winforcePage, basePage);
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

                                        const planSeleccionado = await ofertaPage.seleccionarPlanAleatorio();
                                        console.log(`🎯 Plan seleccionado aleatoriamente: ${planSeleccionado}`);

                                        await page.waitForTimeout(3000);
                                        console.log('🔄 Esperando a que carguen las ofertas después de seleccionar plan...');

                                        try {
                                            await ofertaPage.esperarOfertasCargadas();

                                            const ofertaSeleccionada = await ofertaPage.seleccionarOfertaAleatoria();
                                            console.log(`✅ Oferta seleccionada: ${ofertaSeleccionada.nombre} - S/ ${ofertaSeleccionada.precio}`);

                                            await page.waitForTimeout(2000);

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
                                            const planSeleccionado = await ofertaPage.seleccionarPlanAleatorio();
                                            console.log(`✅ Plan seleccionado después de reintento: ${planSeleccionado}`);

                                            await page.waitForTimeout(3000);
                                            try {
                                                await ofertaPage.esperarOfertasCargadas();
                                                const ofertaSeleccionada = await ofertaPage.seleccionarOfertaAleatoria();
                                                console.log(`✅ Oferta seleccionada después de reintento: ${ofertaSeleccionada.nombre}`);
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
                                const scoreEncontrado = await buscarScoreDespuesReinicio(page, winforcePage, basePage);

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
                    // Después de reiniciar exitosamente, SALIR del bucle de confirmación
                    // para volver al inicio del flujo completo
                    console.log('✅ Reinicio exitoso, volviendo al inicio del flujo');
                    return; // Salir de este step, no lanzar error
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
                    const marcadoExitoso = marcarDNIComoUsado(dniAleatorio);
                    if (marcadoExitoso) {
                        console.log(`✅ DNI ${dniAleatorio} marcado como usado después de venta exitosa`);
                        console.log(`📋 DNI REGISTRADO EXITOSAMENTE: ${dniAleatorio}`);
                    }
                }

                // ►►► REINICIAR INMEDIATAMENTE PARA SIGUIENTE VENTA
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
                    // Después de reiniciar exitosamente, SALIR del bucle de confirmación
                    // para volver al inicio del flujo completo
                    console.log('✅ Reinicio exitoso, volviendo al inicio del flujo');
                    return; // Salir de este step, no lanzar error
                } else {
                    console.log('❌ Reinicio falló, continuando con siguiente intento');
                    continue;
                }
            }

        } catch (error) {
            console.log('❌ ERROR en confirmación de venta:', error.message);
            console.log('🔄 Reiniciando flujo completo debido a error...');

            // Reiniciar el flujo completo
            const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
            if (reinicioExitoso) {
                // Después de reiniciar exitosamente, SALIR del bucle de confirmación
                console.log('✅ Reinicio exitoso después de error, volviendo al inicio del flujo');
                return; // Salir de este step, no lanzar error
            } else {
                console.log('❌ No se pudo reiniciar después del error');
                if (intentos >= maxIntentos) {
                    throw new Error(`No se pudo completar la confirmación de venta después de ${intentos} intentos`);
                }
                continue;
            }
        }

    } while (!ventaExitosa && intentos < maxIntentos);

    // Si no fue exitosa y salimos del bucle, NO lanzar error sino reiniciar
    if (!ventaExitosa) {
        console.log(`⚠️ No se pudo completar la confirmación de venta después de ${intentos} intentos, reiniciando...`);
        const reinicioExitoso = await reiniciarTestCompleto(page, winforcePage, basePage);
        if (!reinicioExitoso) {
            throw new Error(`No se pudo completar la confirmación de venta después de ${intentos} intentos y reinicio falló`);
        }
        console.log('✅ Reinicio exitoso, volviendo al inicio del flujo');
        // No lanzar error, simplemente volver al inicio del while loop principal
    }
});
        // ►►► VERIFICAR ESTADO DESPUÉS DE CADA VENTA
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

        // ►►► SOLO INCREMENTAR CONTADOR, EL REINICIO YA SE HIZO ARRIBA
        ejecucionCompleta++;
    } // ← Cierre del while loop principal

    // ►►► RESUMEN FINAL (FUERA DEL WHILE LOOP)
    await test.step('Resumen final del proceso', async () => {
        console.log('\n🎉' + '='.repeat(60));
        console.log('🎯 PROCESO COMPLETADO EXITOSAMENTE');
        console.log('🎉' + '='.repeat(60));

        console.log(`\n📊 ESTADÍSTICAS FINALES:`);
        console.log(`✅ Ventas exitosas completadas: ${ventasExitosas}/${ventasRequeridas}`);
        console.log(`🔄 Total de ejecuciones realizadas: ${ejecucionCompleta - 1}`);
        console.log(`📈 Tasa de éxito: ${((ventasExitosas / (ejecucionCompleta - 1)) * 100).toFixed(2)}%`);

        console.log(`\n📋 INFORMACIÓN DE DNIs:`);
        console.log(`🎯 DNIs usados en esta ejecución: ${ventasExitosas}`);
        console.log(`📊 DNIs restantes disponibles: ${leerArchivoDNIs().disponibles.length}`);
        console.log(`📈 DNIs usados totales: ${leerArchivoDNIs().usados.length}`);

        console.log(`\n📍 INFORMACIÓN DE COORDENADAS:`);
        console.log(`🗺️  Coordenadas usadas totales: ${leerCoordenadasUsadas().usadas.length}`);
        console.log(`🚫 Coordenadas sin cobertura: ${leerCoordenadasUsadas().sinCobertura.length}`);
        console.log(`🌐 Total de coordenadas procesadas: ${leerCoordenadasUsadas().usadas.length + leerCoordenadasUsadas().sinCobertura.length}`);

        console.log('\n⏱️  TIEMPO DE EJECUCIÓN:');
        console.log(`🕒 Hora de finalización: ${new Date().toLocaleTimeString()}`);
        console.log(`📅 Fecha: ${new Date().toLocaleDateString()}`);

        console.log('\n💾 GUARDANDO INFORMACIÓN...');
        await page.waitForTimeout(2000);

        // Tomar screenshot final
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
    });
});