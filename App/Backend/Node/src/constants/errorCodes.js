/**
 * Códigos de error estandarizados para la API
 * Proyecto: CH2026 - Sistema de Cálculo de Honorarios CPAU
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * 
 * Uso:
 *   const ERROR_CODES = require('../constants/errorCodes');
 *   throw new ApiError({ code: ERROR_CODES.VALIDATION_ERROR, ... });
 */

const ERROR_CODES = Object.freeze({
  // ========================================
  // VALIDACIÓN (400)
  // ========================================
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
  INVALID_FIELD_VALUE: 'INVALID_FIELD_VALUE',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  
  // ========================================
  // AUTENTICACIÓN Y AUTORIZACIÓN (401, 403)
  // ========================================
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // ========================================
  // RECURSOS (404, 409)
  // ========================================
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CALCULO_NOT_FOUND: 'CALCULO_NOT_FOUND',
  USUARIO_NOT_FOUND: 'USUARIO_NOT_FOUND',
  TAREA_NOT_FOUND: 'TAREA_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  
  // ========================================
  // BASE DE DATOS (500)
  // ========================================
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_SP_ERROR: 'DB_SP_ERROR',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  DB_TIMEOUT: 'DB_TIMEOUT',
  
  // ========================================
  // LÓGICA DE NEGOCIO (500)
  // ========================================
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  PDF_GENERATION_ERROR: 'PDF_GENERATION_ERROR',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  INVALID_CALCULATION_STATE: 'INVALID_CALCULATION_STATE',
  
  // ========================================
  // EXTERNOS Y GENERALES (500, 503)
  // ========================================
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
});

/**
 * Obtiene el status HTTP sugerido para un código de error
 * @param {string} errorCode - Código de error de ERROR_CODES
 * @returns {number} Status HTTP (default: 500)
 */
function getStatusCodeForError(errorCode) {
  const statusMap = {
    // 400 - Bad Request
    VALIDATION_ERROR: 400,
    MISSING_REQUIRED_FIELD: 400,
    INVALID_FIELD_TYPE: 400,
    INVALID_FIELD_VALUE: 400,
    INVALID_DATE_FORMAT: 400,
    INVALID_DATE_RANGE: 400,
    
    // 401 - Unauthorized
    UNAUTHORIZED: 401,
    INVALID_TOKEN: 401,
    TOKEN_EXPIRED: 401,
    
    // 403 - Forbidden
    FORBIDDEN: 403,
    INSUFFICIENT_PERMISSIONS: 403,
    
    // 404 - Not Found
    RESOURCE_NOT_FOUND: 404,
    CALCULO_NOT_FOUND: 404,
    USUARIO_NOT_FOUND: 404,
    TAREA_NOT_FOUND: 404,
    TEMPLATE_NOT_FOUND: 404,
    
    // 409 - Conflict
    DUPLICATE_RESOURCE: 409,
    DB_CONSTRAINT_VIOLATION: 409,
    
    // 503 - Service Unavailable
    SERVICE_UNAVAILABLE: 503,
    DB_TIMEOUT: 503,
    EXTERNAL_SERVICE_ERROR: 503,
    
    // 500 - Internal Server Error (default)
    DB_CONNECTION_ERROR: 500,
    DB_QUERY_ERROR: 500,
    DB_SP_ERROR: 500,
    CALCULATION_ERROR: 500,
    PDF_GENERATION_ERROR: 500,
    INVALID_CALCULATION_STATE: 500,
    INTERNAL_SERVER_ERROR: 500,
    UNKNOWN_ERROR: 500
  };
  
  return statusMap[errorCode] || 500;
}

module.exports = ERROR_CODES;
module.exports.getStatusCodeForError = getStatusCodeForError;
