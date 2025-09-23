import sql from 'mssql';
import * as fs from 'fs';
import * as path from 'path';
import * as readlineSync from 'readline-sync';

interface DatabaseConfig {
server: string;
database: string;
user: string;
password: string;
options: {
encrypt: boolean;
trustServerCertificate: boolean;
requestTimeout: number;
};
availableDatabases: string[];
}

// ►►► DASHBOARD 2.0 - Efectos visuales surrealistas SIN PARPADEO
class DashboardSurreal {
private static frames = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
private static symbols = ['✨', '⚡', '🌟', '💫', '🔥', '🌈', '🚀', '🌌'];

static mostrarHeader(): void {
    console.log('\n' + '═'.repeat(80));
    console.log('🌌  D A T A B A S E   M I G R A T I O N   D A S H B O A R D   2 . 0  🌌');
    console.log('═'.repeat(80));
  }

  static mostrarEstado(frame: number, message: string, progress: number = 0, config: DatabaseConfig, tiempo: string): void {
    const frameIndex = frame % this.frames.length;
    const symbolIndex = frame % this.symbols.length;

    const barWidth = 30;
    const filled = Math.floor((progress / 100) * barWidth);
    const empty = barWidth - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

    // Retroceder 6 líneas y limpiar desde ahí (sin incluir el header)
    process.stdout.write('\x1B[6A\x1B[0J');

    console.log(`${this.symbols[symbolIndex]} ${this.frames[frameIndex]} ${message}`);
    console.log(`🟦 [${progressBar}] ${progress}%`);
    console.log(`🏢 Servidor: ${config.server}`);
    console.log(`🗃️  Base: ${config.database}`);
    console.log(`👤 Usuario: ${config.user}`);
    console.log(`⏰ Tiempo: ${tiempo}`);
    console.log('🔮 Estado: PROCESANDO DATOS MULTIDIMENSIONALES...');
    console.log('─'.repeat(80));
  }

  static mostrarTerminado(config: DatabaseConfig, tiempoTotal: string, inicio: Date, fin: Date): void {
    console.log('\n' + '⭐'.repeat(40));
    console.log('🎉  M I G R A C I Ó N   C O M P L E T A D A  🎉');
    console.log('💫  Todos los datos han sido trascendidos exitosamente!');
    console.log('⭐'.repeat(40));

    console.log('\n📊  R E S U M E N   D E   M I G R A C I Ó N  📊');
    console.log('─'.repeat(80));
    console.log(`✅ Inicio: ${inicio.toLocaleTimeString()}`);
    console.log(`✅ Fin: ${fin.toLocaleTimeString()}`);
    console.log(`⏱️  Duración: ${tiempoTotal}`);
    console.log(`🏢 Base: ${config.database}`);
    console.log(`👤 Usuario: ${config.user}`);
    console.log('🎯 Estado: MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('─'.repeat(80));
  }

  static mostrarError(error: any, config: DatabaseConfig, tiempo: string): void {
    console.log('\n' + '💥'.repeat(40));
    console.log('🚨  E R R O R   D I M E N S I O N A L  🚨');
    console.log('💥'.repeat(40));
    console.log(`📛 Mensaje: ${error.message}`);
    console.log(`⏰ Tiempo transcurrido: ${tiempo}`);
    console.log(`🏢 Base: ${config.database}`);
    console.log('🔧 Verificar conexión al multiverso de datos');
    console.log('💥'.repeat(40));
  }
}

// ►►► TEMPORIZADOR MEJORADO
class TemporizadorSurreal {
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  obtenerTiempoTranscurrido(): string {
    const elapsed = Date.now() - this.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  obtenerTiempoTotal(): string {
    return this.obtenerTiempoTranscurrido();
  }
}

export class DatabaseUtils {
  private static config: DatabaseConfig;

  private static cargarConfiguracion(): DatabaseConfig {
    const configPath = path.join(process.cwd(), 'test', 'specs', 'config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  }

  private static guardarConfiguracion(config: DatabaseConfig): void {
    const configPath = path.join(process.cwd(), 'test', 'specs', 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  private static obtenerEmojiBaseDatos(nombreBD: string): string {
    const emojis = ['🗄️', '💾', '📀', '💿', '📊', '📈', '📉', '🎯', '⚡', '🌟'];
    const hash = nombreBD.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
  }

  // Método para seleccionar base de datos
  static async seleccionarBaseDatos(): Promise<void> {
    DashboardSurreal.mostrarHeader();
    this.config = this.cargarConfiguracion();

    try {
      console.log(`\n🔮  B A S E   D E   D A T O S   A C T U A L  🔮`);
      console.log(`   📊 ${this.config.database}`);
      console.log('─'.repeat(80));
     console.log(`\n🌌 ¿Desea actualizar su BD o usar la misma?\n1. 🌟 Sí\n2. 💫 No\n\n🎯 Seleccione una opción (1/2):`);
      const respuesta = readlineSync.question(
        '-'   );


      if (respuesta === '1') {
        console.log('\n🚀  S E L E C C I Ó N   D E   B A S E   D E   D A T O S  🚀');
        console.log('─'.repeat(80));

        this.config.availableDatabases.forEach((db, index) => {
          console.log(`${index + 1}. ${this.obtenerEmojiBaseDatos(db)} ${db}`);
        });

        const seleccion = readlineSync.question('\n🎲 Seleccione una opción (1-5): ');
        const opcion = parseInt(seleccion);

        if (opcion >= 1 && opcion <= this.config.availableDatabases.length) {
          const nuevaBD = this.config.availableDatabases[opcion - 1];
          this.config.database = nuevaBD;
          this.guardarConfiguracion(this.config);

          console.log(`\n✅  B A S E   D E   D A T O S   A C T U A L I Z A D A  ✅`);
          console.log(`   🎯 Nueva base: ${this.obtenerEmojiBaseDatos(nuevaBD)} ${nuevaBD}`);
        } else {
          console.log('\n❌  O P C I Ó N   I N V Á L I D A  ❌');
          console.log('   🔄 Usando base de datos actual...');
        }
      } else if (respuesta === '2') {
        console.log('\n✅  U S A N D O   B A S E   A C T U A L  ✅');
        console.log('   ⚡ Sin cambios en la configuración');
      } else {
        console.log('\n❌  O P C I Ó N   I N V Á L I D A  ❌');
        console.log('   🔄 Usando base de datos actual...');
      }

      console.log('\n' + '⭐'.repeat(80));

    } catch (error) {
      console.log('\n❌ Error al seleccionar base de datos:', error.message);
    }
  }

  // MÉTODO MIGRACIÓN MEJORADO SIN PARPADEO
  static async ejecutarMigracionSilenciosa(): Promise<void> {
    console.clear();
    DashboardSurreal.mostrarHeader();
    this.config = this.cargarConfiguracion();

    const temporizador = new TemporizadorSurreal();
    let pool: sql.ConnectionPool | null = null;

    try {
      // Fase 1: Conexión - MOSTRAR SOLO UNA VEZ
      console.log('\n🔗  I N I C I A N D O   C O N E X I Ó N   I N T E R D I M E N S I O N A L  🔗');
      console.log('─'.repeat(80));

      // Mostrar estado inicial SOLO UNA VEZ
      console.log('✨ Conectando al servidor cósmico...');
      console.log('🟦 [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%');
      console.log(`🏢 Servidor: ${this.config.server}`);
      console.log(`🗃️  Base: ${this.config.database}`);
      console.log(`👤 Usuario: ${this.config.user}`);
      console.log(`⏰ Tiempo: 00:00`);
      console.log('🔮 Estado: PROCESANDO DATOS MULTIDIMENSIONALES...');
      console.log('─'.repeat(80));

      // CONEXIÓN PRIMERO
      pool = await sql.connect({
        server: this.config.server,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        options: this.config.options
      });

      // ACTUALIZAR MENSAJE DESPUÉS DE CONEXIÓN EXITOSA
      process.stdout.write('\x1B[7A\x1B[0J'); // Retrocede 7 líneas

      console.log(`🏢 Servidor: ${this.config.server}`);
      console.log(`🗃️  Base: ${this.config.database}`);
      console.log(`👤 Usuario: ${this.config.user}`);
      console.log(`⏰ Tiempo: ${temporizador.obtenerTiempoTranscurrido()}`);
      console.log('🔮 Estado: PROCESANDO DATOS MULTIDIMENSIONALES...');
      console.log('─'.repeat(80));

      // Fase 2: Ejecución con animación
      const tiempoInicio = new Date();
      const estimatedTime = 180000;
      let frame = 0;

      // Ejecutar el stored procedure
      const ejecucionPromise = pool.request().execute('[CRM].[MigrarPedidosExperiencia]');

      // Animación DURANTE la ejecución
      while (true) {
        const elapsed = Date.now() - tiempoInicio.getTime();
        const progress = Math.min(100, 33 + Math.floor((elapsed / estimatedTime) * 67)); // Empieza en 33%
        const tiempoStr = temporizador.obtenerTiempoTranscurrido();

        DashboardSurreal.mostrarEstado(frame, 'Procesando datos multidimensionales...', progress, this.config, tiempoStr);

        // Verificar si terminó
        try {
          await Promise.race([
            ejecucionPromise,
            new Promise(resolve => setTimeout(resolve, 200))
          ]);
          break;
        } catch (error) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        frame++;
      }

      // Esperar finalización
      await ejecucionPromise;

      // MOSTRAR 100% COMPLETADO
      process.stdout.write('\x1B[7A\x1B[0J');
      console.log('✅ Migración cósmica completada!');
      console.log('🟦 [██████████████████████████████] 100%');
      console.log(`🏢 Servidor: ${this.config.server}`);
      console.log(`🗃️  Base: ${this.config.database}`);
      console.log(`👤 Usuario: ${this.config.user}`);
      console.log(`⏰ Tiempo: ${temporizador.obtenerTiempoTranscurrido()}`);
      console.log('🎯 Estado: MIGRACIÓN EXITOSA');
      console.log('─'.repeat(80));

      await new Promise(resolve => setTimeout(resolve, 1000));

      const tiempoTotal = temporizador.obtenerTiempoTotal();
      const tiempoFin = new Date();

      // Fase 3: Pantalla final
      console.clear();
      DashboardSurreal.mostrarHeader();
      DashboardSurreal.mostrarTerminado(this.config, tiempoTotal, tiempoInicio, tiempoFin);

    } catch (error) {
      const tiempoTotal = temporizador.obtenerTiempoTranscurrido();
      console.clear();
      DashboardSurreal.mostrarHeader();
      DashboardSurreal.mostrarError(error, this.config, tiempoTotal);
      throw error;
    } finally {
      if (pool) {
        await pool.close();
      }
    }
  }
}