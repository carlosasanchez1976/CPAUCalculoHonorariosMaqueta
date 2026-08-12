/**
 * Tests unitarios para ApiError
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * Fase: 5 - Testing
 */

const ApiError = require('../../../src/utils/ApiError');
const ERROR_CODES = require('../../../src/constants/errorCodes');

describe('ApiError - Clase de Error Personalizada', () => {
  
  describe('Constructor', () => {
    test('debe crear instancia con parámetros requeridos', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Error de validación',
        statusCode: 400
      });
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
      expect(error.message).toBe('Error de validación');
      expect(error.statusCode).toBe(400);
    });
    
    test('debe crear instancia con todos los parámetros', () => {
      const metadata = { controller: 'test', function: 'testFunc' };
      const detail = { field: 'email', value: 'invalid' };
      
      const error = new ApiError({
        code: ERROR_CODES.INVALID_FIELD_TYPE,
        message: 'Tipo de campo inválido',
        statusCode: 422,
        detail,
        metadata
      });
      
      expect(error.code).toBe(ERROR_CODES.INVALID_FIELD_TYPE);
      expect(error.message).toBe('Tipo de campo inválido');
      expect(error.statusCode).toBe(422);
      expect(error.detail).toEqual(detail);
      expect(error.metadata).toEqual(metadata);
    });
    
    test('debe generar timestamp y errorId automáticamente', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test',
        statusCode: 400
      });
      
      expect(error.timestamp).toBeDefined();
      expect(error.errorId).toBeDefined();
      expect(isValidErrorId(error.errorId)).toBe(true);
      expect(isValidISO8601(error.timestamp)).toBe(true);
    });
  });
  
  describe('generateErrorId()', () => {
    test('debe generar errorId con formato correcto', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test'
      });
      
      expect(error.errorId).toBeDefined();
      expect(isValidErrorId(error.errorId)).toBe(true);
    });
    
    test('debe generar errorIds únicos', () => {
      const error1 = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test 1'
      });
      
      const error2 = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test 2'
      });
      
      expect(error1.errorId).not.toBe(error2.errorId);
    });
    
    test('errorId debe tener formato err_{timestamp}_{random}', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test'
      });
      
      const parts = error.errorId.split('_');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('err');
      expect(parts[1]).toMatch(/^\d{13}$/); // 13 dígitos timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]{6}$/); // 6 caracteres aleatorios
    });
  });
  
  describe('toJSON()', () => {
    test('debe serializar sin incluir errorDetail por defecto', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de consulta',
        statusCode: 500,
        detail: { query: 'SELECT * FROM users', sqlError: 'Syntax error' },
        metadata: { model: 'Usuario' }
      });
      
      const json = error.toJSON();
      
      expect(json).toHaveProperty('errorId');
      expect(json).toHaveProperty('errorCode', ERROR_CODES.DB_QUERY_ERROR);
      expect(json).toHaveProperty('error', 'Error de consulta');
      expect(json).toHaveProperty('timestamp');
      expect(json).toHaveProperty('success', false);
      expect(json).toHaveProperty('version', '1.0');
      expect(json).toHaveProperty('metadata', { model: 'Usuario' });
      expect(json).not.toHaveProperty('errorDetail');
    });
    
    test('debe incluir errorDetail cuando includeDetail=true', () => {
      const detail = { query: 'SELECT * FROM users', sqlError: 'Syntax error' };
      const metadata = { model: 'Usuario', function: 'Listar' };
      
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de consulta',
        statusCode: 500,
        detail,
        metadata
      });
      
      const json = error.toJSON(true);
      
      expect(json).toHaveProperty('errorDetail', detail);
      expect(json).toHaveProperty('metadata', metadata);
    });
    
    test('timestamp debe ser ISO 8601 válido', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test'
      });
      
      const json = error.toJSON();
      expect(isValidISO8601(json.timestamp)).toBe(true);
    });
  });
  
  describe('addMetadata()', () => {
    test('debe agregar metadata con clave-valor', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test',
        statusCode: 400
      });
      
      error.addMetadata('step', 'validation');
      error.addMetadata('field', 'email');
      
      expect(error.metadata).toEqual({ step: 'validation', field: 'email' });
    });
    
    test('debe fusionar metadata existente', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test',
        statusCode: 400,
        metadata: { controller: 'test' }
      });
      
      error.addMetadata('function', 'testFunc');
      error.addMetadata('step', 'validation');
      
      expect(error.metadata).toEqual({
        controller: 'test',
        function: 'testFunc',
        step: 'validation'
      });
    });
  });
  
  describe('Static: isApiError()', () => {
    test('debe retornar true para instancias de ApiError', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test'
      });
      
      expect(ApiError.isApiError(error)).toBe(true);
    });
    
    test('debe retornar false para Error genérico', () => {
      const error = new Error('Generic error');
      expect(ApiError.isApiError(error)).toBe(false);
    });
    
    test('debe retornar false para null/undefined', () => {
      expect(ApiError.isApiError(null)).toBe(false);
      expect(ApiError.isApiError(undefined)).toBe(false);
      expect(ApiError.isApiError('error')).toBe(false);
      expect(ApiError.isApiError({})).toBe(false);
    });
  });
  
  describe('Static: fromError()', () => {
    test('debe convertir Error genérico a ApiError', () => {
      const genericError = new Error('Something went wrong');
      
      const apiError = ApiError.fromError(genericError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.code).toBe('UNKNOWN_ERROR');
      expect(apiError.message).toBe('Error inesperado');
      expect(apiError.statusCode).toBe(500);
      expect(apiError.detail).toHaveProperty('originalError', 'Something went wrong');
    });
    
    test('debe preservar información del error original en detail', () => {
      const genericError = new Error('Original error');
      
      const apiError = ApiError.fromError(genericError);
      
      expect(apiError.detail).toHaveProperty('originalError', 'Original error');
      expect(apiError.detail).toHaveProperty('stack');
      expect(apiError.metadata).toHaveProperty('errorType', 'Error');
    });
    
    test('debe aceptar código y mensaje personalizados', () => {
      const genericError = new Error('Test error');
      
      const apiError = ApiError.fromError(genericError, 'CUSTOM_ERROR', 'Error personalizado');
      
      expect(apiError.code).toBe('CUSTOM_ERROR');
      expect(apiError.message).toBe('Error personalizado');
    });
    
    test('debe retornar misma instancia si ya es ApiError', () => {
      const originalError = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Already ApiError'
      });
      
      const result = ApiError.fromError(originalError);
      
      expect(result).toBe(originalError);
    });
  });
  
  describe('Integración con Error nativo', () => {
    test('debe capturarse con try/catch', () => {
      expect(() => {
        throw new ApiError({
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Test error'
        });
      }).toThrow(ApiError);
    });
    
    test('debe tener stack trace', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test'
      });
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });
  });
});
