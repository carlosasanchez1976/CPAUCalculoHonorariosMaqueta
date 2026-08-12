/**
 * Middleware global de manejo de errores
 * Proyecto: CH2026 - Sistema de Cálculo de Honorarios CPAU
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * 
 * Propósito:
 * - Capturar todos los errores que lleguen al final de la cadena
 * - Convertir errores nativos a ApiError
 * - Loguear errores con trazabilidad completa
 * - Responder al cliente con estructura consistente
 * - Ocultar información sensible en producción
 * 
 * Registro:
 *   En app.js o lambda.js, DESPUÉS de todas las rutas:
 *   app.use(errorHandler);
 * 
 * IMPORTANTE: Este middleware debe ser el ÚLTIMO en la cadena
 */

const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Middleware de manejo de errores (4 parámetros)
 * Express detecta automáticamente middlewares de error por tener 4 params
 * 
 * @param {Error|ApiError} err - Error capturado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware (no usado, pero requerido por Express)
 */
function errorHandler(err, req, res, next) {
  // Determinar si estamos en ambiente de desarrollo/qa
  const isDevOrQA = ['development', 'dev', 'qa'].includes(
    process.env.NODE_ENV?.toLowerCase()
  );
  
  // Si es un ApiError, usarlo directamente
  if (ApiError.isApiError(err)) {
    // Log estructurado del error
    console.error(`❌ [${err.code}] ${err.errorId}:`, {
      message: err.message,
      statusCode: err.statusCode,
      detail: err.detail,
      metadata: err.metadata,
      endpoint: `${req.method} ${req.path}`,
      timestamp: err.timestamp
    });
    
    // Si hay detail y estamos en dev/qa, loguearlo también
    if (isDevOrQA && err.detail) {
      console.error('🔍 Error Detail:', err.detail);
    }
    
    // Responder con JSON estructurado
    return res.status(err.statusCode).json(err.toJSON(isDevOrQA));
  }
  
  // Si NO es ApiError, convertirlo
  console.error('⚠️  [UNHANDLED ERROR] Error no manejado capturado:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    endpoint: `${req.method} ${req.path}`
  });
  
  // Crear ApiError genérico
  const genericError = new ApiError({
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'Error interno del servidor',
    statusCode: 500,
    detail: isDevOrQA ? {
      originalError: err.message,
      errorType: err.constructor?.name,
      stack: err.stack
    } : null,
    metadata: {
      endpoint: `${req.method} ${req.path}`,
      unhandled: true
    }
  });
  
  console.error(`❌ [INTERNAL_SERVER_ERROR] ${genericError.errorId}:`, {
    message: genericError.message,
    originalError: err.message
  });
  
  return res.status(500).json(genericError.toJSON(isDevOrQA));
}

/**
 * Middleware para manejar rutas no encontradas (404)
 * Debe registrarse ANTES del errorHandler pero DESPUÉS de todas las rutas válidas
 * 
 * Uso:
 *   app.use(notFoundHandler);
 *   app.use(errorHandler);
 */
function notFoundHandler(req, res, next) {
  const error = new ApiError({
    code: ERROR_CODES.RESOURCE_NOT_FOUND,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    statusCode: 404,
    metadata: {
      endpoint: `${req.method} ${req.path}`,
      method: req.method,
      path: req.path
    }
  });
  
  next(error);
}

/**
 * Wrapper para funciones async de Express
 * Captura errores de promesas rechazadas y los pasa a errorHandler
 * 
 * Uso:
 *   router.get('/ruta', asyncHandler(async (req, res) => {
 *     const data = await miAsyncFunction();
 *     res.json({ success: true, data });
 *   }));
 * 
 * @param {Function} fn - Función async a wrapear
 * @returns {Function} Middleware que maneja el error
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
module.exports.asyncHandler = asyncHandler;
