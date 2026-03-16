# Ejemplos de Conexión a Base de Datos desde AWS Lambda

**Proyecto:** CH2026  
**Fecha:** 16/03/2026  
**Propósito:** Ejemplos prácticos de configuración de conexión a AWS RDS desde Lambda

---

## MySQL Connection (mysql2)

### Instalación
```bash
npm install mysql2
```

### Configuración completa

```javascript
// src/config/database-mysql.js
const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

let pool = null;

/**
 * Obtiene credenciales desde AWS Secrets Manager
 */
async function getDBCredentials() {
  const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  
  try {
    const data = await secretsManager
      .getSecretValue({ SecretId: 'CH2026/prod/db-credentials' })
      .promise();
    
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    
    // Fallback a variables de entorno (dev/local)
    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };
  }
}

/**
 * Crea y retorna connection pool (singleton pattern)
 */
async function createPool() {
  if (pool) return pool;
  
  const credentials = await getDBCredentials();
  
  console.log(`[DB] Creando connection pool para: ${credentials.host}/${credentials.database}`);
  
  pool = mysql.createPool({
    host: credentials.host,
    port: 3306,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    
    // Configuración para Lambda
    waitForConnections: true,
    connectionLimit: 5,              // BAJO para Lambda (muchas instancias concurrentes)
    maxIdle: 2,                      // Máximo de conexiones idle
    idleTimeout: 60000,              // 60 segundos
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    
    // Timeouts
    connectTimeout: 10000,           // 10 segundos
    acquireTimeout: 10000,
    
    // Charset
    charset: 'utf8mb4',
    
    // Zona horaria
    timezone: 'Z'                    // UTC
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

/**
 * Obtiene una conexión del pool
 */
async function getConnection() {
  const connectionPool = await createPool();
  return connectionPool.getConnection();
}

/**
 * Ejecuta una query simple
 */
async function query(sql, params = []) {
  const connection = await getConnection();
  
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Ejecuta un stored procedure
 */
async function callProcedure(procedureName, params = []) {
  const connection = await getConnection();
  
  try {
    const placeholders = params.map(() => '?').join(', ');
    const [rows] = await connection.query(
      `CALL ${procedureName}(${placeholders})`,
      params
    );
    
    // MySQL retorna array de resultsets
    // El resultado del SP está en rows[0]
    return rows[0];
  } finally {
    connection.release();
  }
}

/**
 * Cierra el pool (útil para tests)
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] Connection pool cerrado');
  }
}

module.exports = {
  getConnection,
  query,
  callProcedure,
  closePool
};
```

### Ejemplo de uso en repositorio

```javascript
// src/repositories/calculos.repository.js (MySQL)
const db = require('../config/database-mysql');

class CalculosRepository {
  /**
   * Ejecuta cálculo de honorarios básico
   */
  async calcularHonorariosBasico(datos) {
    try {
      const resultado = await db.callProcedure(
        'SP_CALCULAR_HONORARIOS_BASICO',
        [
          datos.usuarioId,
          datos.valorObra,
          datos.superficie,
          datos.tipologia,
          JSON.stringify(datos.tareasProfesionales),
          datos.nombreProyecto,
          datos.ubicacion
        ]
      );
      
      // El SP retorna una fila con el resultado
      return resultado[0];
      
    } catch (error) {
      console.error('[Repository] Error en calcularHonorariosBasico:', error);
      throw new Error(`Error al calcular honorarios: ${error.message}`);
    }
  }
  
  /**
   * Obtiene histórico de cálculos con paginación
   */
  async obtenerHistorico(usuarioId, pagina = 1, limite = 20) {
    try {
      const offset = (pagina - 1) * limite;
      
      const rows = await db.callProcedure(
        'SP_OBTENER_HISTORICO_CALCULOS',
        [usuarioId, limite, offset]
      );
      
      // El SP retorna dos resultsets:
      // rows[0] = lista de cálculos
      // rows[1] = { total: X }
      
      // En MySQL, los resultsets vienen en rows
      // Necesitamos hacer un segundo query para obtener el total
      const [totalResult] = await db.query(
        'SELECT COUNT(*) as total FROM Calculos WHERE UsuarioID = ? AND Activo = 1',
        [usuarioId]
      );
      
      return {
        calculos: rows,
        total: totalResult.total,
        pagina,
        limite,
        totalPaginas: Math.ceil(totalResult.total / limite)
      };
      
    } catch (error) {
      console.error('[Repository] Error en obtenerHistorico:', error);
      throw new Error(`Error al obtener histórico: ${error.message}`);
    }
  }
}

module.exports = new CalculosRepository();
```

---

## SQL Server Connection (mssql)

### Instalación
```bash
npm install mssql
```

### Configuración completa

```javascript
// src/config/database-sqlserver.js
const sql = require('mssql');
const AWS = require('aws-sdk');

let pool = null;

/**
 * Obtiene credenciales desde AWS Secrets Manager
 */
async function getDBCredentials() {
  const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });
  
  try {
    const data = await secretsManager
      .getSecretValue({ SecretId: 'CH2026/prod/db-credentials' })
      .promise();
    
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    
    // Fallback a variables de entorno
    return {
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    };
  }
}

/**
 * Crea y retorna connection pool (singleton pattern)
 */
async function createPool() {
  if (pool && pool.connected) return pool;
  
  const credentials = await getDBCredentials();
  
  console.log(`[DB] Creando connection pool para: ${credentials.server}/${credentials.database}`);
  
  const config = {
    server: credentials.server,
    database: credentials.database,
    user: credentials.user,
    password: credentials.password,
    port: 1433,
    
    // Opciones de conexión
    options: {
      encrypt: true,                    // Obligatorio para Azure SQL / RDS
      trustServerCertificate: false,    // false en producción
      enableArithAbort: true,
      connectTimeout: 30000,            // 30 segundos
      requestTimeout: 30000
    },
    
    // Pool configuration para Lambda
    pool: {
      max: 5,                           // Bajo para Lambda
      min: 0,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 10000
    }
  };
  
  try {
    pool = await sql.connect(config);
    console.log('✅ [DB] Conexión a SQL Server establecida correctamente');
    return pool;
  } catch (error) {
    console.error('❌ [DB] Error al conectar con SQL Server:', error);
    throw error;
  }
}

/**
 * Obtiene el pool de conexiones
 */
async function getPool() {
  return await createPool();
}

/**
 * Ejecuta una query simple
 */
async function query(sqlQuery, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  
  // Agregar parámetros
  Object.keys(params).forEach(key => {
    request.input(key, params[key]);
  });
  
  const result = await request.query(sqlQuery);
  return result.recordset;
}

/**
 * Ejecuta un stored procedure
 */
async function callProcedure(procedureName, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  
  // Agregar parámetros con sus tipos
  Object.keys(params).forEach(key => {
    const param = params[key];
    
    // Detectar tipo automáticamente
    if (param.type && param.value !== undefined) {
      request.input(key, param.type, param.value);
    } else {
      request.input(key, param);
    }
  });
  
  const result = await request.execute(procedureName);
  return result.recordset;
}

/**
 * Cierra el pool (útil para tests)
 */
async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('[DB] Connection pool cerrado');
  }
}

module.exports = {
  getPool,
  query,
  callProcedure,
  closePool,
  sql  // Exportar para acceder a tipos (sql.Int, sql.Decimal, etc.)
};
```

### Ejemplo de uso en repositorio

```javascript
// src/repositories/calculos.repository.js (SQL Server)
const db = require('../config/database-sqlserver');
const sql = db.sql;

class CalculosRepository {
  /**
   * Ejecuta cálculo de honorarios básico
   */
  async calcularHonorariosBasico(datos) {
    try {
      const resultado = await db.callProcedure(
        'SP_CALCULAR_HONORARIOS_BASICO',
        {
          UsuarioID: { type: sql.Int, value: datos.usuarioId },
          ValorObra: { type: sql.Decimal(18, 2), value: datos.valorObra },
          Superficie: { type: sql.Decimal(10, 2), value: datos.superficie },
          Tipologia: { type: sql.NVarChar(100), value: datos.tipologia },
          TareasJSON: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(datos.tareasProfesionales) },
          NombreProyecto: { type: sql.NVarChar(200), value: datos.nombreProyecto },
          Ubicacion: { type: sql.NVarChar(200), value: datos.ubicacion }
        }
      );
      
      // El SP retorna una o más filas
      return resultado[0];
      
    } catch (error) {
      console.error('[Repository] Error en calcularHonorariosBasico:', error);
      throw new Error(`Error al calcular honorarios: ${error.message}`);
    }
  }
  
  /**
   * Obtiene histórico de cálculos con paginación
   */
  async obtenerHistorico(usuarioId, pagina = 1, limite = 20) {
    try {
      const offset = (pagina - 1) * limite;
      
      const resultado = await db.callProcedure(
        'SP_OBTENER_HISTORICO_CALCULOS',
        {
          UsuarioID: { type: sql.Int, value: usuarioId },
          Limite: { type: sql.Int, value: limite },
          Offset: { type: sql.Int, value: offset }
        }
      );
      
      // SQL Server puede retornar múltiples resultsets
      // Si el SP retorna primero las filas y luego el total:
      // resultado = primera query (las filas)
      // Para obtener el total, podemos hacer query adicional o modificar el SP
      
      const [totalResult] = await db.query(
        'SELECT COUNT(*) as total FROM Calculos WHERE UsuarioID = @usuarioId AND Activo = 1',
        { usuarioId: { type: sql.Int, value: usuarioId } }
      );
      
      return {
        calculos: resultado,
        total: totalResult.total,
        pagina,
        limite,
        totalPaginas: Math.ceil(totalResult.total / limite)
      };
      
    } catch (error) {
      console.error('[Repository] Error en obtenerHistorico:', error);
      throw new Error(`Error al obtener histórico: ${error.message}`);
    }
  }
}

module.exports = new CalculosRepository();
```

---

## Variables de Entorno

### Archivo .env (Desarrollo local)

```bash
# Base de datos
DB_HOST=localhost
DB_NAME=CH2026_Honorarios
DB_USER=ch2026_user
DB_PASSWORD=your_password_here
DB_PORT=3306                    # 3306 para MySQL, 1433 para SQL Server

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_ISSUER=CH2026-API
JWT_AUDIENCE=CH2026-Frontend
JWT_EXPIRY_MINUTES=60

# AWS
AWS_REGION=us-east-1
SECRETS_NAME=CH2026/dev/jwt-secret

# Stage
STAGE=dev
LOG_LEVEL=debug
```

### AWS Parameter Store / Secrets Manager

```bash
# Crear secret en AWS Secrets Manager
aws secretsmanager create-secret \
  --name CH2026/prod/db-credentials \
  --description "Credenciales de base de datos para CH2026" \
  --secret-string '{
    "host": "ch2026-db.abc123.us-east-1.rds.amazonaws.com",
    "user": "ch2026_api",
    "password": "STRONG_PASSWORD_HERE",
    "database": "CH2026_Honorarios"
  }'

# Crear secret JWT
aws secretsmanager create-secret \
  --name CH2026/prod/jwt-secret \
  --description "JWT configuration para CH2026" \
  --secret-string '{
    "jwtSecret": "GENERATE_WITH_CRYPTO_randomBytes_32",
    "jwtIssuer": "CH2026-API",
    "jwtAudience": "CH2026-Frontend",
    "jwtExpiryMinutes": 60,
    "refreshTokenExpiryDays": 7
  }'
```

---

## Testing Local

### Test de conexión MySQL

```javascript
// test-mysql-connection.js
const db = require('./src/config/database-mysql');

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a MySQL...');
    
    // Test 1: Query simple
    const [result] = await db.query('SELECT 1 + 1 AS resultado');
    console.log('✅ Query simple OK:', result);
    
    // Test 2: Query de datos reales
    const parametros = await db.query('SELECT * FROM Parametros WHERE Activo = 1');
    console.log('✅ Query parametros OK:', parametros.length, 'registros');
    
    // Test 3: Stored procedure
    const valorK = await db.callProcedure('SP_OBTENER_VALOR_K', []);
    console.log('✅ Stored procedure OK:', valorK);
    
    // Cerrar pool
    await db.closePool();
    console.log('✅ Tests completados correctamente');
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    process.exit(1);
  }
}

testConnection();
```

### Test de conexión SQL Server

```javascript
// test-sqlserver-connection.js
const db = require('./src/config/database-sqlserver');
const sql = db.sql;

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a SQL Server...');
    
    // Test 1: Query simple
    const result = await db.query('SELECT 1 + 1 AS resultado');
    console.log('✅ Query simple OK:', result);
    
    // Test 2: Query de datos reales
    const parametros = await db.query('SELECT * FROM Parametros WHERE Activo = 1');
    console.log('✅ Query parametros OK:', parametros.length, 'registros');
    
    // Test 3: Stored procedure
    const valorK = await db.callProcedure('SP_OBTENER_VALOR_K', {});
    console.log('✅ Stored procedure OK:', valorK);
    
    // Cerrar pool
    await db.closePool();
    console.log('✅ Tests completados correctamente');
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    process.exit(1);
  }
}

testConnection();
```

### Ejecutar tests

```bash
# MySQL
node test-mysql-connection.js

# SQL Server
node test-sqlserver-connection.js
```

---

## Mejores Prácticas

### 1. Siempre liberar conexiones
```javascript
// ❌ MAL: Puede causar pool exhaustion
const connection = await db.getConnection();
const result = await connection.query('SELECT * FROM Calculos');
// Olvidamos hacer connection.release()

// ✅ BIEN: Siempre en bloque try-finally
const connection = await db.getConnection();
try {
  const result = await connection.query('SELECT * FROM Calculos');
  return result;
} finally {
  connection.release();
}
```

### 2. No recrear pool en cada invocación
```javascript
// ❌ MAL: Crea nuevo pool cada vez
async function handler(event) {
  const pool = mysql.createPool({ ... });  // COSTOSO
  // ...
}

// ✅ BIEN: Pool singleton
let pool = null;
async function getPool() {
  if (!pool) {
    pool = mysql.createPool({ ... });
  }
  return pool;
}
```

### 3. Usar parámetros, nunca concatenación
```javascript
// ❌ MAL: SQL Injection vulnerable
const userId = req.params.id;
const query = `SELECT * FROM Usuarios WHERE UsuarioID = ${userId}`;

// ✅ BIEN: Parametrizado
const query = 'SELECT * FROM Usuarios WHERE UsuarioID = ?';
const result = await db.query(query, [userId]);
```

### 4. Manejar errores específicos
```javascript
try {
  const result = await db.callProcedure('SP_CALCULAR_HONORARIOS', params);
  return result;
} catch (error) {
  // Detectar errores específicos
  if (error.code === 'ER_DUP_ENTRY') {          // MySQL
    throw new Error('Registro duplicado');
  }
  if (error.code === 'ECONNREFUSED') {
    throw new Error('Base de datos no disponible');
  }
  if (error.number === 2627) {                   // SQL Server: Duplicate key
    throw new Error('Registro duplicado');
  }
  
  // Error genérico
  console.error('Error de base de datos:', error);
  throw error;
}
```

---

**Última actualización:** 16/03/2026  
**Autor:** Equipo CH2026  
**Referencia:** [08-GuiaMigracionBackendReal.md](08-GuiaMigracionBackendReal.md)
