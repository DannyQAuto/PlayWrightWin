import sql from 'mssql';

const config = {
server: '10.23.100.17',
database: 'PE_WINET_CRM_JC',
user: 'sa',
password: '0pticalN.qa+',
options: {
encrypt: false,
trustServerCertificate: true,
requestTimeout: 3600000
}
};

export class DatabaseUtils {
// MÉTODO SIMPLE QUE SOLO AVISA CUANDO TERMINA
static async ejecutarMigracionSilenciosa(): Promise<void> {
        let pool: sql.ConnectionPool | null = null;
        try {
            pool = await sql.connect(config);

            console.log('⏳ Ejecutando migración... (esto puede demorar hasta 3 minutos)');
            console.log('🕒 Iniciado: ' + new Date().toLocaleTimeString());

            // EJECUTAR EL STORED PROCEDURE
            await pool.request().execute('[CRM].[MigrarPedidosExperiencia]');

            // SOLO ESTE MENSAJE CUANDO TERMINA
            console.log('✅ MIGRACIÓN TERMINADA: ' + new Date().toLocaleTimeString());

        } catch (error) {
            console.log('❌ MIGRACIÓN FALLÓ: ' + new Date().toLocaleTimeString());
            console.error(error);
            throw error; // Opcional: relanzar el error si quieres que falle el test
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
}

