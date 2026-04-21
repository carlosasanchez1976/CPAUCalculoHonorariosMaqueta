// ============================================================================
// TEST DE CONEXIÓN A BASE DE DATOS MYSQL
// ============================================================================
// Propósito: Verificar que la conexión a MySQL funciona correctamente
// Uso: node scripts/test-db-connection.js

const { getPool, executeQuery, executeStoredProcedure, closePool } = require('../src/config/db');
require('dotenv').config();

console.log('🧪 INICIANDO TEST DE CONEXIÓN A MYSQL\n');
console.log('═'.repeat(80));

async function testConnection() {
    try {
        // ========================================
        // TEST 1: Conexión básica
        // ========================================
        console.log('\n📌 TEST 1: Verificando conexión al pool...');
        const pool = await getPool();
        const connection = await pool.getConnection();
        console.log('   ✅ Conexión obtenida del pool');
        connection.release();
        console.log('   ✅ Conexión liberada al pool');

        // ========================================
        // TEST 2: Query simple
        // ========================================
        console.log('\n📌 TEST 2: Ejecutando query simple (SELECT 1)...');
        const simpleResult = await executeQuery('SELECT 1 as test');
        console.log('   ✅ Query ejecutada:', simpleResult);

        // ========================================
        // TEST 3: Verificar base de datos actual
        // ========================================
        console.log('\n📌 TEST 3: Verificando base de datos actual...');
        const dbResult = await executeQuery('SELECT DATABASE() as db_name');
        console.log(`   ✅ Base de datos activa: ${dbResult[0].db_name}`);

        // ========================================
        // TEST 4: Listar tablas del proyecto
        // ========================================
        console.log('\n📌 TEST 4: Verificando tablas del proyecto CH2026...');
        const tablesResult = await executeQuery(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME LIKE 'Calc_%'
            ORDER BY TABLE_NAME
        `);
        
        if (tablesResult.length > 0) {
            console.log('   ✅ Tablas encontradas:');
            tablesResult.forEach(row => {
                console.log(`      - ${row.TABLE_NAME}`);
            });
        } else {
            console.log('   ⚠️  No se encontraron tablas Calc_*');
        }

        // ========================================
        // TEST 5: Verificar Stored Procedures
        // ========================================
        console.log('\n📌 TEST 5: Verificando Stored Procedures...');
        const spResult = await executeQuery(`
            SELECT ROUTINE_NAME 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_SCHEMA = DATABASE() 
            AND ROUTINE_TYPE = 'PROCEDURE'
            AND ROUTINE_NAME LIKE 'Calc_%'
            ORDER BY ROUTINE_NAME
        `);
        
        if (spResult.length > 0) {
            console.log('   ✅ Stored Procedures encontrados:');
            spResult.forEach(row => {
                console.log(`      - ${row.ROUTINE_NAME}`);
            });
        } else {
            console.log('   ⚠️  No se encontraron Stored Procedures Calc_*');
        }

        // ========================================
        // TEST 6: Contar registros de prueba (si existen)
        // ========================================
        console.log('\n📌 TEST 6: Verificando datos de prueba...');
        try {
            const countResult = await executeQuery(`
                SELECT 
                    (SELECT COUNT(*) FROM Calc_Maq) as total_calculos,
                    (SELECT COUNT(*) FROM Calc_Maq_Items) as total_items
            `);
            console.log(`   ✅ Registros en Calc_Maq: ${countResult[0].total_calculos}`);
            console.log(`   ✅ Registros en Calc_Maq_Items: ${countResult[0].total_items}`);
        } catch (error) {
            console.log('   ⚠️  Tablas aún no tienen datos (esto es normal si no corriste los seeds)');
        }

        // ========================================
        // TEST 7: Test de Stored Procedure (si existe)
        // ========================================
        console.log('\n📌 TEST 7: Probando llamada a Stored Procedure...');
        try {
            // Intentar llamar al SP de listar (con un ID ficticio)
            const spTestResult = await executeStoredProcedure(
                'Calc_Maq_Listar_Calculo_Items',
                ['CALC-2026-001']  // ID de prueba
            );
            
            if (spTestResult && spTestResult[0]) {
                console.log(`   ✅ SP ejecutado correctamente. Items encontrados: ${spTestResult[0].length}`);
            } else {
                console.log('   ℹ️  SP ejecutado pero no retornó datos (normal si no hay registros con ese ID)');
            }
        } catch (error) {
            if (error.code === 'ER_SP_DOES_NOT_EXIST') {
                console.log('   ⚠️  SP no existe todavía (ejecutar scripts de BD primero)');
            } else {
                console.log(`   ⚠️  Error al ejecutar SP: ${error.message}`);
            }
        }

        // ========================================
        // RESUMEN FINAL
        // ========================================
        console.log('\n' + '═'.repeat(80));
        console.log('✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
        console.log('═'.repeat(80));
        console.log(`\n📊 RESUMEN:`);
        console.log(`   • Base de datos: ${dbResult[0].db_name}`);
        console.log(`   • Tablas encontradas: ${tablesResult.length}`);
        console.log(`   • Stored Procedures: ${spResult.length}`);
        console.log(`   • Conexión: OK ✅\n`);

    } catch (error) {
        console.error('\n❌ ERROR EN TEST DE CONEXIÓN:');
        console.error('   Mensaje:', error.message);
        console.error('   Código:', error.code);
        console.error('   SQL State:', error.sqlState);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 SOLUCIÓN: Verifica que MySQL esté corriendo en localhost:3306');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 SOLUCIÓN: Verifica las credenciales en .env');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\n💡 SOLUCIÓN: La base de datos no existe. Créala primero.');
        }
        
        process.exit(1);
    } finally {
        // Cerrar el pool
        await closePool();
        console.log('🔌 Connection pool cerrado\n');
    }
}

// Ejecutar tests
testConnection();
