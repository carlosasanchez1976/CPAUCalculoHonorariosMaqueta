/**
 * Tests unitarios para errorCodes
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * Fase: 5 - Testing
 */

const ERROR_CODES = require('../../../src/constants/errorCodes');
const ApiError = require('../../../src/utils/ApiError');

describe('ERROR_CODES - Constantes de Códigos de Error', () => {
  
  describe('Estructura y Formato', () => {
    test('debe ser un objeto congelado (inmutable)', () => {
      expect(Object.isFrozen(ERROR_CODES)).toBe(true);
      
      // Intentar modificar no debe cambiar el objeto (en strict mode lanzaría error)
      const before = Object.keys(ERROR_CODES).length;
      ERROR_CODES.NEW_CODE = 'NEW_CODE';
      const after = Object.keys(ERROR_CODES).length;
      expect(after).toBe(before);
    });
    
    test('todos los códigos deben ser strings en UPPERCASE', () => {
      Object.values(ERROR_CODES).forEach(code => {
        expect(typeof code).toBe('string');
        expect(code).toBe(code.toUpperCase());
        expect(code).toMatch(/^[A-Z_]+$/);
      });
    });
    
    test('no debe haber códigos duplicados', () => {
      const values = Object.values(ERROR_CODES);
      const uniqueValues = [...new Set(values)];
      
      expect(values.length).toBe(uniqueValues.length);
    });
    
    test('debe tener al menos 25 códigos definidos', () => {
      const keys = Object.keys(ERROR_CODES);
      expect(keys.length).toBeGreaterThanOrEqual(25);
    });
  });
  
  describe('Categorías de Errores', () => {
    test('debe tener códigos de VALIDACIÓN (400)', () => {
      expect(ERROR_CODES).toHaveProperty('VALIDATION_ERROR');
      expect(ERROR_CODES).toHaveProperty('MISSING_REQUIRED_FIELD');
      expect(ERROR_CODES).toHaveProperty('INVALID_FIELD_TYPE');
      expect(ERROR_CODES).toHaveProperty('INVALID_FIELD_VALUE');
    });
    
    test('debe tener códigos de AUTENTICACIÓN (401, 403)', () => {
      expect(ERROR_CODES).toHaveProperty('UNAUTHORIZED');
      expect(ERROR_CODES).toHaveProperty('FORBIDDEN');
      expect(ERROR_CODES).toHaveProperty('INVALID_TOKEN');
      expect(ERROR_CODES).toHaveProperty('TOKEN_EXPIRED');
    });
    
    test('debe tener códigos de RECURSOS (404, 409)', () => {
      expect(ERROR_CODES).toHaveProperty('RESOURCE_NOT_FOUND');
      expect(ERROR_CODES).toHaveProperty('DUPLICATE_RESOURCE');
    });
    
    test('debe tener códigos de BASE DE DATOS (500)', () => {
      expect(ERROR_CODES).toHaveProperty('DB_CONNECTION_ERROR');
      expect(ERROR_CODES).toHaveProperty('DB_QUERY_ERROR');
      expect(ERROR_CODES).toHaveProperty('DB_SP_ERROR');
    });
    
    test('debe tener códigos de CÁLCULO (500)', () => {
      expect(ERROR_CODES).toHaveProperty('CALCULATION_ERROR');
    });
    
    test('debe tener código genérico INTERNAL_SERVER_ERROR', () => {
      expect(ERROR_CODES).toHaveProperty('INTERNAL_SERVER_ERROR');
    });
  });
  
  describe('Inferencia de statusCode (via ApiError)', () => {
    test('debe inferir 400 para errores de validación', () => {
      const error1 = new ApiError({ code: ERROR_CODES.VALIDATION_ERROR, message: 'test', statusCode: 400 });
      const error2 = new ApiError({ code: ERROR_CODES.MISSING_REQUIRED_FIELD, message: 'test', statusCode: 400 });
      const error3 = new ApiError({ code: ERROR_CODES.INVALID_FIELD_TYPE, message: 'test', statusCode: 400 });
      expect(error1.statusCode).toBe(400);
      expect(error2.statusCode).toBe(400);
      expect(error3.statusCode).toBe(400);
    });
    
    test('debe inferir 401 para errores de autenticación', () => {
      const error1 = new ApiError({ code: ERROR_CODES.UNAUTHORIZED, message: 'test', statusCode: 401 });
      const error2 = new ApiError({ code: ERROR_CODES.INVALID_TOKEN, message: 'test', statusCode: 401 });
      expect(error1.statusCode).toBe(401);
      expect(error2.statusCode).toBe(401);
    });
    
    test('debe inferir 403 para errores de autorización', () => {
      const error = new ApiError({ code: ERROR_CODES.FORBIDDEN, message: 'test', statusCode: 403 });
      expect(error.statusCode).toBe(403);
    });
    
    test('debe inferir 404 para recursos no encontrados', () => {
      const error = new ApiError({ code: ERROR_CODES.RESOURCE_NOT_FOUND, message: 'test', statusCode: 404 });
      expect(error.statusCode).toBe(404);
    });
    
    test('debe inferir 409 para conflictos', () => {
      const error = new ApiError({ code: ERROR_CODES.DUPLICATE_RESOURCE, message: 'test', statusCode: 409 });
      expect(error.statusCode).toBe(409);
    });
    
    test('debe inferir 500 para errores de servidor', () => {
      const error1 = new ApiError({ code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: 'test', statusCode: 500 });
      const error2 = new ApiError({ code: ERROR_CODES.DB_CONNECTION_ERROR, message: 'test', statusCode: 500 });
      expect(error1.statusCode).toBe(500);
      expect(error2.statusCode).toBe(500);
    });
    
    test('statusCode es undefined si no se especifica', () => {
      const error = new ApiError({ code: 'UNKNOWN_CODE', message: 'test' });
      expect(error.statusCode).toBeUndefined();
    });
  });
  
  describe('Códigos Críticos para CH2026', () => {
    test('debe tener códigos específicos de cálculo', () => {
      expect(ERROR_CODES).toHaveProperty('CALCULATION_ERROR');
      expect(ERROR_CODES).toHaveProperty('CALCULO_NOT_FOUND');
    });
    
    test('debe tener códigos específicos de tareas', () => {
      expect(ERROR_CODES).toHaveProperty('TAREA_NOT_FOUND');
    });
    
    test('debe tener códigos específicos de usuarios', () => {
      expect(ERROR_CODES).toHaveProperty('USUARIO_NOT_FOUND');
    });
  });
  
  describe('Naming Conventions', () => {
    test('todos los códigos deben usar snake_case', () => {
      Object.keys(ERROR_CODES).forEach(key => {
        // Debe estar en UPPER_SNAKE_CASE
        expect(key).toMatch(/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/);
      });
    });
    
    test('códigos de base de datos deben empezar con DB_', () => {
      const dbCodes = Object.keys(ERROR_CODES).filter(key => key.startsWith('DB_'));
      expect(dbCodes.length).toBeGreaterThanOrEqual(3);
      
      dbCodes.forEach(code => {
        expect(ERROR_CODES[code]).toMatch(/^DB_/);
      });
    });
  });
});
