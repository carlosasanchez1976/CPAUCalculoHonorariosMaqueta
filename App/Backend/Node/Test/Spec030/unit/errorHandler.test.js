/**
 * Tests unitarios para errorHandler middleware
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * Fase: 5 - Testing
 */

const errorHandler = require('../../../src/middlewares/errorHandler');
const { notFoundHandler, asyncHandler } = errorHandler;
const ApiError = require('../../../src/utils/ApiError');
const ERROR_CODES = require('../../../src/constants/errorCodes');

describe('errorHandler Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/api/test',
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  describe('errorHandler()', () => {
    test('debe manejar ApiError correctamente', () => {
      const apiError = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Error de validación',
        statusCode: 400
      });
      
      errorHandler(apiError, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Error de validación',
          errorCode: ERROR_CODES.VALIDATION_ERROR,
          errorId: expect.any(String),
          timestamp: expect.any(String),
          version: '1.0'
        })
      );
    });
    
    test('debe incluir errorDetail en entorno development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const apiError = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de consulta',
        statusCode: 500,
        detail: { query: 'SELECT * FROM users' },
        metadata: { model: 'Usuario' }
      });
      
      errorHandler(apiError, req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorDetail: { query: 'SELECT * FROM users' },
          metadata: { model: 'Usuario' }
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
    
    test('debe incluir errorDetail en entorno qa', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'qa';
      
      const apiError = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de consulta',
        statusCode: 500,
        detail: { query: 'SELECT * FROM users' }
      });
      
      errorHandler(apiError, req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errorDetail: expect.any(Object)
        })
      );
      
      process.env.NODE_ENV = originalEnv;
    });
    
    test('NO debe incluir errorDetail en entorno production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const apiError = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de consulta',
        detail: { query: 'SELECT * FROM users', password: 'secret123' },
        metadata: { model: 'Usuario' }
      });
      
      errorHandler(apiError, req, res, next);
      
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.error).not.toHaveProperty('errorDetail');
      expect(jsonCall.error).not.toHaveProperty('detail');
      expect(jsonCall.error).not.toHaveProperty('metadata');
      expect(jsonCall.error).not.toHaveProperty('stack');
      
      process.env.NODE_ENV = originalEnv;
    });
    
    test('debe convertir Error genérico a ApiError', () => {
      const genericError = new Error('Unexpected error');
      
      errorHandler(genericError, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Error interno del servidor',
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
          errorId: expect.any(String),
          timestamp: expect.any(String),
          version: '1.0'
        })
      );
    });
    
    test('debe usar mensaje genérico si Error no tiene message', () => {
      const weirdError = { weird: 'error' };
      
      errorHandler(weirdError, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Error interno del servidor',
          errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR
        })
      );
    });
  });
  
  describe('notFoundHandler()', () => {
    test('debe retornar 404 con ApiError', () => {
      notFoundHandler(req, res, next);
      
      // Verifica que next fue llamado con ApiError
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          statusCode: 404
        })
      );
    });
    
    test('debe incluir la ruta en el mensaje', () => {
      req.path = '/api/nonexistent-endpoint';
      
      notFoundHandler(req, res, next);
      
      const error = next.mock.calls[0][0];
      expect(error.message).toContain('/api/nonexistent-endpoint');
    });
    
    test('debe crear ApiError con errorId', () => {
      notFoundHandler(req, res, next);
      
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.errorId).toBeDefined();
      expect(isValidErrorId(error.errorId)).toBe(true);
    });
  });
  
  describe('asyncHandler()', () => {
    test('debe ejecutar función async exitosa sin errores', async () => {
      const successHandler = asyncHandler(async (req, res) => {
        res.json({ success: true });
      });
      
      await successHandler(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });
    
    test('debe capturar errores y pasarlos a next', async () => {
      const errorHandler = asyncHandler(async (req, res) => {
        throw new Error('Async error');
      });
      
      await errorHandler(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Async error');
    });
    
    test('debe capturar ApiError y pasarlo a next', async () => {
      const apiError = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed'
      });
      
      const errorHandler = asyncHandler(async (req, res) => {
        throw apiError;
      });
      
      await errorHandler(req, res, next);
      
      expect(next).toHaveBeenCalledWith(apiError);
    });
    
    test('debe funcionar con Promises rechazadas', async () => {
      const wrappedHandler = asyncHandler(async (req, res) => {
        throw new Error('Promise rejected');
      });
      
      await wrappedHandler(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Promise rejected');
    });
  });
  
  describe('Integración entre middlewares', () => {
    test('notFoundHandler → errorHandler debe producir respuesta 404 correcta', () => {
      // Simular notFoundHandler
      notFoundHandler(req, res, next);
      
      // Capturar el error pasado a next
      const error = next.mock.calls[0][0];
      
      // Simular errorHandler procesando ese error
      errorHandler(error, req, res, jest.fn());
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
          errorCode: ERROR_CODES.RESOURCE_NOT_FOUND,
          errorId: expect.any(String)
        })
      );
    });
  });
});
