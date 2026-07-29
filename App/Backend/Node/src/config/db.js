// db.js
// Configuración de conexión a MySQL con soporte AWS Secrets Manager

const mysql = require('mysql2/promise');
// const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
require('dotenv').config();

let pool = null;

// ========================================
// OBTENER CREDENCIALES: SOLO ENV LOCALES
// ========================================
async function getDBCredentials() {
    // Siempre usar variables de entorno directas
    console.log('📍 Usando credenciales desde variables de entorno');
    return {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    };
}

// ========================================
// CREAR CONNECTION POOL (Singleton Pattern)
// ========================================
async function createPool() {
    if (pool) {
        console.log('♻️  [DB] Reutilizando connection pool existente');
        return pool;
    }

    const credentials = await getDBCredentials();

    console.log(`🔌 [DB] Creando connection pool para: ${credentials.host}/${credentials.database}`);

    pool = mysql.createPool({
        host: credentials.host,
        port: credentials.port,
        user: credentials.user,
        password: credentials.password,
        database: credentials.database,

        // Configuración optimizada para Lambda
        waitForConnections: true,
        connectionLimit: 5,              // BAJO para Lambda (muchas instancias concurrentes)
        maxIdle: 2,                      // Máximo de conexiones idle
        idleTimeout: 60000,              // 60 segundos
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,

        // Timeouts
        connectTimeout: 10000,           // 10 segundos
        

        // Charset y timezone
        charset: 'utf8mb4',
        timezone: '-03:00'               // Argentina Time (UTC-3)
    });

    // Test de conexión inicial
    try {
        const connection = await pool.getConnection();
        console.log('✅ [DB] Conexión a MySQL establecida correctamente');
        connection.release();
    } catch (error) {
        console.error('❌ [DB] Error al conectar con MySQL:', error);
        throw error;
    }

    return pool;
}

// ========================================
// OBTENER POOL (con lazy initialization)
// ========================================
async function getPool() {
    if (!pool) {
        await createPool();
    }
    return pool;
}

// ========================================
// SEGURIDAD: Solo log en desarrollo
// ========================================
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'qa') {
    console.log('🔍 CONFIGURACIÓN BD:');
    console.log(`   HOST: ${process.env.DB_HOST}`);
    console.log(`   USER: ${process.env.DB_USER}`);
    console.log(`   DATABASE: ${process.env.DB_NAME}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
}


// ========================================
// EJECUTAR QUERY CON PARÁMETROS
// ========================================
const executeQuery = async (query, params = []) => {
    try {
        const poolInstance = await getPool();
        
        // Solo log en desarrollo
        if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'qa') {
            console.log(`🔄 Ejecutando QUERY: ${query.substring(0, 100)}...`);
        }
        
        const [results] = await poolInstance.execute(query, params);
        return results;
    } catch (error) {
        console.error('❌ Error en consulta DB:', error.message);
        throw error;
    }
};

// ========================================
// EJECUTAR STORED PROCEDURE
// ========================================
const executeStoredProcedure = async (procedureName, params = []) => {
    try {
        const poolInstance = await getPool();
        
        if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'qa') {
            console.log(`📞 Ejecutando SP: ${procedureName}`);
        }
        
        const placeholders = params.map(() => '?').join(', ');
        const sql = `CALL ${procedureName}(${placeholders});`;
        const result = await executeQuery(sql, params);
        
        // Los stored procedures devuelven [resultados, metadatos]
        // Siempre retornar un array con al menos un elemento vacío para evitar undefined
        return Array.isArray(result) && result.length > 0 ? result : [[]];
        
    } catch (error) {
        console.error(`❌ Error ejecutando SP ${procedureName}:`, error.message);
        throw error;
    }
};

// ========================================
// CERRAR POOL (para testing/cleanup)
// ========================================
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('🔌 [DB] Connection pool cerrado');
    }
};

module.exports = { 
    pool,                    // Exportar pool directamente para compatibilidad
    getPool,                 // Función para obtener pool con lazy init
    executeQuery, 
    executeStoredProcedure,
    closePool
};
