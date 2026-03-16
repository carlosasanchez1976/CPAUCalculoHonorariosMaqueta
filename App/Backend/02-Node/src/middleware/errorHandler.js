/**
 * Middleware de manejo centralizado de errores
 */

/**
 * Error handler middleware para Express
 * @param {Error} err - Error capturado
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next
 */
export function errorHandler(err, req, res, next) {
  // Log del error completo (en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error capturado:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body
    });
  } else {
    // En producción, log más simple
    console.error('❌ Error:', err.message);
  }

  // Construir response de error
  const errorResponse = {
    success: false,
    error: err.message || 'Error interno del servidor',
    requestId: `req_${Date.now()}`,
    version: '1.0'
  };

  // Agregar stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Determinar status code
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json(errorResponse);
}

/**
 * Clase de error personalizado para validaciones
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

/**
 * Clase de error personalizado para recursos no encontrados
 */
export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
