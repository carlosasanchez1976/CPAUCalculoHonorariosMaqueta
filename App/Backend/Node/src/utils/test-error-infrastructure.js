/**
 * Test básico de infraestructura de errores
 * Proyecto: CH2026 - Sistema de Cálculo de Honorarios CPAU
 * SPEC: SPEC030-CALC-Manejo de errores en API (Fase 1)
 * 
 * Ejecutar: node src/utils/test-error-infrastructure.js
 */

const ApiError = require('./ApiError');
const ERROR_CODES = require('../constants/errorCodes');

console.log('🧪 Iniciando test de infraestructura de errores...\n');

// ========================================
// TEST 1: Crear ApiError básico
// ========================================
console.log('✅ TEST 1: Crear ApiError básico');
try {
  const error1 = new ApiError({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Campo requerido faltante',
    statusCode: 400,
    detail: { field: 'nombre', received: null },
    metadata: { module: 'test', function: 'test1' }
  });
  
  console.log('   errorId:', error1.errorId);
  console.log('   code:', error1.code);
  console.log('   message:', error1.message);
  console.log('   statusCode:', error1.statusCode);
  console.log('   ✓ ApiError creado correctamente\n');
} catch (e) {
  console.error('   ✗ Error creando ApiError:', e.message, '\n');
}

// ========================================
// TEST 2: Método toJSON sin detail
// ========================================
console.log('✅ TEST 2: toJSON sin detail (producción)');
try {
  const error2 = new ApiError({
    code: ERROR_CODES.DB_SP_ERROR,
    message: 'Error al ejecutar procedimiento almacenado',
    statusCode: 500,
    detail: { storedProcedure: 'Test_SP', errno: 1062 },
    metadata: { module: 'db' }
  });
  
  const jsonProd = error2.toJSON(false); // Sin detail
  console.log('   JSON (sin detail):', JSON.stringify(jsonProd, null, 2));
  
  if (!jsonProd.errorDetail) {
    console.log('   ✓ Detail correctamente oculto en producción\n');
  } else {
    console.log('   ✗ Detail NO debería estar visible\n');
  }
} catch (e) {
  console.error('   ✗ Error en toJSON:', e.message, '\n');
}

// ========================================
// TEST 3: Método toJSON con detail
// ========================================
console.log('✅ TEST 3: toJSON con detail (QA/dev)');
try {
  const error3 = new ApiError({
    code: ERROR_CODES.DB_SP_ERROR,
    message: 'Error al ejecutar procedimiento almacenado',
    statusCode: 500,
    detail: { storedProcedure: 'Test_SP', sqlError: 'Duplicate entry' },
    metadata: { module: 'db' }
  });
  
  const jsonQA = error3.toJSON(true); // Con detail
  console.log('   JSON (con detail):', JSON.stringify(jsonQA, null, 2));
  
  if (jsonQA.errorDetail) {
    console.log('   ✓ Detail correctamente incluido en QA\n');
  } else {
    console.log('   ✗ Detail debería estar visible\n');
  }
} catch (e) {
  console.error('   ✗ Error en toJSON con detail:', e.message, '\n');
}

// ========================================
// TEST 4: Método addMetadata
// ========================================
console.log('✅ TEST 4: addMetadata (enriquecimiento)');
try {
  const error4 = new ApiError({
    code: ERROR_CODES.CALCULATION_ERROR,
    message: 'Error al calcular honorarios',
    statusCode: 500,
    metadata: { module: 'calculo' }
  });
  
  error4.addMetadata('function', 'grabarCalculo');
  error4.addMetadata('calculoId', 123);
  
  console.log('   metadata:', error4.metadata);
  
  if (error4.metadata.function === 'grabarCalculo' && error4.metadata.calculoId === 123) {
    console.log('   ✓ Metadata enriquecido correctamente\n');
  } else {
    console.log('   ✗ Metadata no se agregó correctamente\n');
  }
} catch (e) {
  console.error('   ✗ Error agregando metadata:', e.message, '\n');
}

// ========================================
// TEST 5: ApiError.isApiError
// ========================================
console.log('✅ TEST 5: Verificar isApiError');
try {
  const apiErr = new ApiError({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Test',
    statusCode: 400
  });
  
  const normalErr = new Error('Error normal');
  
  const test1 = ApiError.isApiError(apiErr);
  const test2 = ApiError.isApiError(normalErr);
  
  if (test1 === true && test2 === false) {
    console.log('   ✓ isApiError funciona correctamente\n');
  } else {
    console.log('   ✗ isApiError no detecta correctamente:', { test1, test2 }, '\n');
  }
} catch (e) {
  console.error('   ✗ Error en isApiError:', e.message, '\n');
}

// ========================================
// TEST 6: ApiError.fromError
// ========================================
console.log('✅ TEST 6: fromError (conversión de error nativo)');
try {
  const nativeError = new Error('Error nativo de prueba');
  const convertedError = ApiError.fromError(nativeError, ERROR_CODES.INTERNAL_SERVER_ERROR, 'Error inesperado');
  
  console.log('   Error convertido:');
  console.log('     - code:', convertedError.code);
  console.log('     - message:', convertedError.message);
  console.log('     - errorId:', convertedError.errorId);
  console.log('     - detail:', convertedError.detail);
  
  if (ApiError.isApiError(convertedError)) {
    console.log('   ✓ Error nativo convertido a ApiError correctamente\n');
  } else {
    console.log('   ✗ Conversión falló\n');
  }
} catch (e) {
  console.error('   ✗ Error en fromError:', e.message, '\n');
}

// ========================================
// TEST 7: Verificar ERROR_CODES
// ========================================
console.log('✅ TEST 7: Verificar constantes ERROR_CODES');
try {
  const requiredCodes = [
    'VALIDATION_ERROR',
    'MISSING_REQUIRED_FIELD',
    'INVALID_FIELD_TYPE',
    'DB_SP_ERROR',
    'DB_QUERY_ERROR',
    'CALCULATION_ERROR',
    'RESOURCE_NOT_FOUND',
    'INTERNAL_SERVER_ERROR'
  ];
  
  const missing = requiredCodes.filter(code => !ERROR_CODES[code]);
  
  if (missing.length === 0) {
    console.log('   ✓ Todos los códigos requeridos existen');
    console.log('   Total códigos definidos:', Object.keys(ERROR_CODES).length, '\n');
  } else {
    console.log('   ✗ Códigos faltantes:', missing, '\n');
  }
} catch (e) {
  console.error('   ✗ Error verificando ERROR_CODES:', e.message, '\n');
}

// ========================================
// TEST 8: Formato de errorId
// ========================================
console.log('✅ TEST 8: Formato de errorId');
try {
  const error8 = new ApiError({
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Test errorId',
    statusCode: 400
  });
  
  const errorIdPattern = /^err_\d{13}_[a-z0-9]{6}$/;
  const isValid = errorIdPattern.test(error8.errorId);
  
  console.log('   errorId:', error8.errorId);
  console.log('   Pattern válido:', isValid);
  
  if (isValid) {
    console.log('   ✓ Formato de errorId correcto\n');
  } else {
    console.log('   ✗ Formato de errorId incorrecto\n');
  }
} catch (e) {
  console.error('   ✗ Error verificando errorId:', e.message, '\n');
}

console.log('========================================');
console.log('✅ Tests completados');
console.log('========================================');
