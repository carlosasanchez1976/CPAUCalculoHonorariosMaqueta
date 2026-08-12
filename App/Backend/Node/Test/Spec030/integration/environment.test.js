/**
 * Tests de comportamiento según NODE_ENV
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * Fase: 5 - Testing
 */

const ApiError = require('../../../src/utils/ApiError');
const ERROR_CODES = require('../../../src/constants/errorCodes');
const errorHandlerModule = require('../../../src/middlewares/errorHandler');
const errorHandler = errorHandlerModule;

describe('Environment-Specific Behavior', () => {
  let req, res, next;
  let originalEnv;
  
  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
  });
  
  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });
  
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
  
  describe('NODE_ENV = development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });
    
    test('debe incluir errorDetail en respuesta', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error en consulta',
        statusCode: 500,
        detail: { query: 'SELECT * FROM users WHERE id = ?', params: [123] },
        metadata: { model: 'Usuario', function: 'Buscar' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('errorDetail');
      expect(response.errorDetail).toHaveProperty('query');
      expect(response).toHaveProperty('metadata');
    });
    
    test('debe incluir SQL details en errores de DB', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de sintaxis SQL',
        statusCode: 500,
        detail: {
          query: 'SELECT * FROM nonexistent_table',
          sqlError: 'Table does not exist',
          errno: 1146,
          sqlState: '42S02'
        }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response.errorDetail).toHaveProperty('query');
      expect(response.errorDetail).toHaveProperty('sqlError');
      expect(response.errorDetail).toHaveProperty('errno');
    });
    
    test('debe incluir stack traces', () => {
      const error = new ApiError({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Error inesperado',
        statusCode: 500,
        detail: { info: 'test' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('errorDetail');
    });
  });
  
  describe('NODE_ENV = qa', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'qa';
    });
    
    test('debe incluir errorDetail en respuesta', () => {
      const error = new ApiError({
        code: ERROR_CODES.CALCULATION_ERROR,
        message: 'Error en cálculo de honorarios',
        statusCode: 400,
        detail: { tareaId: 1, valorObra: 1000000 },
        metadata: { controller: 'calculos', function: 'calcular' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('errorDetail');
      expect(response).toHaveProperty('metadata');
    });
    
    test('debe incluir SQL details para debugging', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_SP_ERROR,
        message: 'Error en stored procedure',
        statusCode: 500,
        detail: {
          storedProcedure: 'sp_grabar_calculo',
          sqlError: 'Parameter count mismatch',
          errno: 1318
        }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response.errorDetail).toHaveProperty('storedProcedure');
      expect(response.errorDetail).toHaveProperty('sqlError');
    });
  });
  
  describe('NODE_ENV = production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });
    
    test('NO debe incluir errorDetail en respuesta', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error en base de datos',
        statusCode: 500,
        detail: { 
          query: 'SELECT * FROM users WHERE password = ?',
          password: 'secret123' // ¡Información sensible!
        },
        metadata: { model: 'Usuario' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('errorDetail');
      expect(response).not.toHaveProperty('detail');
      expect(response).toHaveProperty('metadata'); // metadata sí se incluye
    });
    
    test('NO debe incluir SQL details', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_SP_ERROR,
        message: 'Error en operación',
        statusCode: 500,
        detail: {
          storedProcedure: 'sp_sensitive_operation',
          sqlError: 'Internal database error with sensitive info',
          databaseName: 'production_db',
          host: 'db.internal.company.com'
        }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('errorDetail');
      
      // Verificar que NO se filtraron datos sensibles
      const responseStr = JSON.stringify(response);
      expect(responseStr).not.toContain('sp_sensitive_operation');
      expect(responseStr).not.toContain('production_db');
      expect(responseStr).not.toContain('db.internal.company.com');
    });
    
    test('NO debe incluir stack traces', () => {
      const error = new ApiError({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Error del servidor',
        statusCode: 500
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('stack');
      
      const responseStr = JSON.stringify(response);
      // No debe contener rastros de stack traces
      expect(responseStr).not.toContain(' at ');
    });
    
    test('solo debe retornar campos seguros', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Datos inválidos',
        statusCode: 400,
        detail: { field: 'email', value: 'admin@company.com' },
        metadata: { controller: 'usuarios', function: 'grabar', ip: '192.168.1.100' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      
      // En producción, debe incluir metadata pero no errorDetail
      expect(response).toHaveProperty('success', false);
      expect(response).toHaveProperty('error');
      expect(response).toHaveProperty('errorCode');
      expect(response).toHaveProperty('errorId');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('version');
      expect(response).toHaveProperty('metadata');
      expect(response).not.toHaveProperty('errorDetail');
    });
    
    test('debe mantener errorId para trazabilidad', () => {
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error en operación',
        statusCode: 500,
        detail: { sensitiveData: 'hidden' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      
      // errorId debe estar presente para tracking en CloudWatch
      expect(response).toHaveProperty('errorId');
      expect(isValidErrorId(response.errorId)).toBe(true);
    });
  });
  
  describe('NODE_ENV = test', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });
    
    test('debe comportarse como development', () => {
      const error = new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Test error',
        statusCode: 400,
        detail: { test: true },
        metadata: { testSuite: 'unit' }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      // En entorno 'test', errorDetail NO se incluye (solo se incluye en dev/qa)
      expect(response).not.toHaveProperty('errorDetail');
    });
  });
  
  describe('Seguridad de Información Sensible', () => {
    test('passwords no deben filtrarse en production', () => {
      process.env.NODE_ENV = 'production';
      
      const error = new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error de autenticación',
        detail: {
          username: 'admin',
          password: 'SuperSecret123!',
          query: "SELECT * FROM users WHERE username='admin' AND password='SuperSecret123!'"
        }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      const responseStr = JSON.stringify(response);
      
      expect(responseStr).not.toContain('SuperSecret123!');
      expect(responseStr).not.toContain('password');
      expect(responseStr).not.toContain('admin');
    });
    
    test('tokens no deben filtrarse en production', () => {
      process.env.NODE_ENV = 'production';
      
      const error = new ApiError({
        code: ERROR_CODES.INVALID_TOKEN,
        message: 'Token inválido',
        detail: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
          reason: 'expired'
        }
      });
      
      errorHandler(error, req, res, next);
      
      const response = res.json.mock.calls[0][0];
      const responseStr = JSON.stringify(response);
      
      expect(responseStr).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(responseStr).not.toContain('token');
    });
  });
});
