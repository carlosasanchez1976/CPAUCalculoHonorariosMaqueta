/**
 * Test de manejo de errores en capa DB
 * Proyecto: CH2026 - Sistema de Cálculo de Honorarios CPAU
 * SPEC: SPEC030-CALC-Manejo de errores en API (Fase 2)
 * 
 * Ejecutar: node src/config/test-db-errors.js
 */

const { executeQuery, executeStoredProcedure } = require('./db');
const ApiError = require('../utils/ApiError');

console.log('🧪 Iniciando test de errores en capa DB...\n');

// ========================================
// TEST 1: Query inválida (tabla no existe)
// ========================================
async function testInvalidQuery() {
    console.log('✅ TEST 1: Query con tabla inexistente');
    try {
        await executeQuery('SELECT * FROM tabla_que_no_existe', []);
        console.log('   ✗ No se lanzó error (FALLO)\n');
    } catch (error) {
        if (ApiError.isApiError(error)) {
            console.log('   ✓ ApiError lanzado correctamente');
            console.log('   errorId:', error.errorId);
            console.log('   code:', error.code);
            console.log('   message:', error.message);
            console.log('   detail:', JSON.stringify(error.detail, null, 2));
            console.log('   metadata:', JSON.stringify(error.metadata, null, 2));
            console.log('');
        } else {
            console.log('   ✗ Error NO es ApiError (tipo:', error.constructor.name, ')');
            console.log('   Error:', error.message, '\n');
        }
    }
}

// ========================================
// TEST 2: Stored Procedure inexistente
// ========================================
async function testInvalidStoredProcedure() {
    console.log('✅ TEST 2: Stored Procedure inexistente');
    try {
        await executeStoredProcedure('SP_Que_No_Existe', [1, 2, 3]);
        console.log('   ✗ No se lanzó error (FALLO)\n');
    } catch (error) {
        if (ApiError.isApiError(error)) {
            console.log('   ✓ ApiError lanzado correctamente');
            console.log('   errorId:', error.errorId);
            console.log('   code:', error.code);
            console.log('   message:', error.message);
            
            // Verificar que storedProcedure está en metadata
            if (error.metadata && error.metadata.storedProcedure) {
                console.log('   ✓ storedProcedure en metadata:', error.metadata.storedProcedure);
            } else {
                console.log('   ✗ storedProcedure NO está en metadata');
            }
            
            console.log('   detail:', JSON.stringify(error.detail, null, 2));
            console.log('');
        } else {
            console.log('   ✗ Error NO es ApiError (tipo:', error.constructor.name, ')');
            console.log('   Error:', error.message, '\n');
        }
    }
}

// ========================================
// TEST 3: Query con sintaxis SQL incorrecta
// ========================================
async function testInvalidSyntax() {
    console.log('✅ TEST 3: Query con sintaxis SQL incorrecta');
    try {
        await executeQuery('SELECCIONA TODOS DE tabla', []);
        console.log('   ✗ No se lanzó error (FALLO)\n');
    } catch (error) {
        if (ApiError.isApiError(error)) {
            console.log('   ✓ ApiError lanzado correctamente');
            console.log('   errorId:', error.errorId);
            console.log('   code:', error.code);
            
            // Verificar que se incluye errno y sqlState
            if (error.detail && error.detail.errno) {
                console.log('   ✓ errno incluido:', error.detail.errno);
            }
            if (error.detail && error.detail.sqlState) {
                console.log('   ✓ sqlState incluido:', error.detail.sqlState);
            }
            
            console.log('');
        } else {
            console.log('   ✗ Error NO es ApiError');
            console.log('   Error:', error.message, '\n');
        }
    }
}

// ========================================
// TEST 4: Verificar JSON output (producción)
// ========================================
async function testJSONOutput() {
    console.log('✅ TEST 4: Verificar formato JSON para producción');
    try {
        await executeQuery('SELECT * FROM tabla_inexistente', []);
    } catch (error) {
        if (ApiError.isApiError(error)) {
            const jsonProd = error.toJSON(false); // Sin detail
            const jsonDev = error.toJSON(true);   // Con detail
            
            console.log('   JSON Producción (sin errorDetail):');
            console.log('   ', JSON.stringify(jsonProd, null, 2).split('\n').join('\n    '));
            
            console.log('\n   JSON QA/Dev (con errorDetail):');
            console.log('   ', JSON.stringify(jsonDev, null, 2).split('\n').join('\n    '));
            
            if (!jsonProd.errorDetail && jsonDev.errorDetail) {
                console.log('\n   ✓ Diferenciación correcta entre ambientes\n');
            } else {
                console.log('\n   ✗ Problema con diferenciación de ambientes\n');
            }
        }
    }
}

// ========================================
// EJECUTAR TODOS LOS TESTS
// ========================================
async function runAllTests() {
    try {
        await testInvalidQuery();
        await testInvalidStoredProcedure();
        await testInvalidSyntax();
        await testJSONOutput();
        
        console.log('========================================');
        console.log('✅ Tests de capa DB completados');
        console.log('========================================');
        console.log('\n💡 NOTA: Estos errores son ESPERADOS para validar el manejo de errores');
        
    } catch (error) {
        console.error('❌ Error crítico ejecutando tests:', error);
    } finally {
        // Cerrar conexiones
        const { closePool } = require('./db');
        await closePool();
        console.log('🔌 Pool cerrado');
        process.exit(0);
    }
}

runAllTests();
