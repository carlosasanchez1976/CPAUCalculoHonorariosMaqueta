/**
 * Clase centralizada de errores para la API
 * Proyecto: CH2026 - Sistema de Cálculo de Honorarios CPAU
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * 
 * Propósito:
 * - Estandarizar estructura de errores
 * - Generar errorId único rastreable
 * - Diferenciar entre dev/qa y producción
 * - Facilitar debugging con trazabilidad completa
 * 
 * Uso:
 *   const ApiError = require('../utils/ApiError');
 *   const ERROR_CODES = require('../constants/errorCodes');
 *   
 *   throw new ApiError({
 *     code: ERROR_CODES.VALIDATION_ERROR,
 *     message: 'Descripción user-friendly',
 *     statusCode: 400,
 *     detail: { campo: 'valor', causa: 'razón' },
 *     metadata: { module: 'miModulo', function: 'miFuncion' }
 *   });
 */

class ApiError extends Error {
  /**
   * Constructor de error estructurado
   * @param {Object} options - Opciones del error
   * @param {string} options.code - Código de error (usar ERROR_CODES)
   * @param {string} options.message - Mensaje user-friendly en español
   * @param {number} options.statusCode - HTTP status code (200-599)
   * @param {Object} [options.detail=null] - Info técnica (solo visible en dev/qa)
   * @param {Object} [options.metadata={}] - Data contextual (module, function, etc.)
   */
  constructor({ code, message, statusCode, detail = null, metadata = {} }) {
    super(message);
    
    // Propiedades estándar de Error
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
    
    // Propiedades personalizadas
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.detail = detail;
    this.metadata = metadata;
    
    // Propiedades de trazabilidad
    this.timestamp = new Date().toISOString();
    this.errorId = this.generateErrorId();
  }
  
  /**
   * Genera un ID único para el error
   * Formato: err_{timestamp}_{random}
   * Ejemplo: err_1786548238551_a7k9m2
   * 
   * @returns {string} ID único rastreable
   */
  generateErrorId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8); // 6 caracteres
    return `err_${timestamp}_${random}`;
  }
  
  /**
   * Convierte el error a formato JSON para enviar al cliente
   * @param {boolean} [includeDetail=false] - Si incluir errorDetail (solo en dev/qa)
   * @returns {Object} Objeto JSON con estructura estandarizada
   */
  toJSON(includeDetail = false) {
    const response = {
      success: false,
      error: this.message,
      errorCode: this.code,
      errorId: this.errorId,
      timestamp: this.timestamp,
      version: '1.0'
    };
    
    // Incluir detail solo si se solicita (dev/qa)
    if (includeDetail && this.detail) {
      response.errorDetail = this.detail;
    }
    
    // Incluir metadata si tiene contenido
    if (this.metadata && Object.keys(this.metadata).length > 0) {
      response.metadata = this.metadata;
    }
    
    return response;
  }
  
  /**
   * Enriquece el error con información adicional de contexto
   * Útil cuando se captura un ApiError y se quiere agregar más info
   * 
   * @param {string} key - Clave del metadata a agregar
   * @param {any} value - Valor del metadata
   * @returns {ApiError} this (para chaining)
   */
  addMetadata(key, value) {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
    return this;
  }
  
  /**
   * Convierte el error a string para logs
   * @returns {string} Representación legible del error
   */
  toString() {
    return `[${this.code}] ${this.errorId}: ${this.message}`;
  }
  
  /**
   * Obtiene el objeto completo para logging
   * Incluye stack trace y toda la información técnica
   * @returns {Object} Objeto completo para logs
   */
  toLog() {
    return {
      errorId: this.errorId,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      detail: this.detail,
      metadata: this.metadata,
      stack: this.stack
    };
  }
}

/**
 * Verifica si un error es una instancia de ApiError
 * @param {any} error - Objeto a verificar
 * @returns {boolean} true si es ApiError
 */
ApiError.isApiError = function(error) {
  return error instanceof ApiError;
};

/**
 * Crea un ApiError desde un error nativo o desconocido
 * @param {Error|any} error - Error original
 * @param {string} defaultCode - Código de error por defecto
 * @param {string} defaultMessage - Mensaje por defecto
 * @returns {ApiError} Nuevo ApiError
 */
ApiError.fromError = function(error, defaultCode = 'UNKNOWN_ERROR', defaultMessage = 'Error inesperado') {
  if (ApiError.isApiError(error)) {
    return error;
  }
  
  const ERROR_CODES = require('../constants/errorCodes');
  
  return new ApiError({
    code: defaultCode,
    message: defaultMessage,
    statusCode: 500,
    detail: {
      originalError: error?.message || String(error),
      stack: error?.stack
    },
    metadata: {
      errorType: error?.constructor?.name || typeof error
    }
  });
};

module.exports = ApiError;
