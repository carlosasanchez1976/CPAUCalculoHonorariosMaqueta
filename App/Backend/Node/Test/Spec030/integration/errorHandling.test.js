/**
 * Tests de integración para manejo de errores en controllers
 * SPEC: SPEC030-CALC-Manejo de errores en API
 * Fase: 5 - Testing
 */

const ApiError = require('../../../src/utils/ApiError');
const ERROR_CODES = require('../../../src/constants/errorCodes');
const calculosController = require('../../../src/controllers/calculosController');
const usuariosController = require('../../../src/controllers/usuariosController');
const terminosCondicionesController = require('../../../src/controllers/terminosCondicionesController');
const adminTemplatesController = require('../../../src/controllers/adminTemplatesController');
const testData = require('../fixtures/testData');

// Mock de modelos y servicios
jest.mock('../../../src/models/calculo');
jest.mock('../../../src/models/usuario');
jest.mock('../../../src/models/terminosCondiciones');
jest.mock('../../../src/services/adminTemplatesService');

const calculoModel = require('../../../src/models/calculo');
const Usuario = require('../../../src/models/usuario');
const TerminosCondiciones = require('../../../src/models/terminosCondiciones');
const adminTemplatesService = require('../../../src/services/adminTemplatesService');

describe('Error Handling - Integración Controllers', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, next
    req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      usuario: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  describe('calculosController.calcular', () => {
    test('debe lanzar VALIDATION_ERROR si falta tareaId', async () => {
      req.body = { datosObra: { valorObra: 1000000 } };
      
      await calculosController.calcular(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400,
          message: expect.stringContaining('tareaId')
        })
      );
    });
    
    test('debe lanzar VALIDATION_ERROR si tareaId no es entero positivo', async () => {
      req.body = { tareaId: 'abc', datosObra: { valorObra: 1000000 } };
      
      await calculosController.calcular(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400
        })
      );
    });
    
    test('debe lanzar RESOURCE_NOT_FOUND si tareaId no existe', async () => {
      req.body = testData.validPayloads.calcular;
      calculoModel.existeTareaProfesional.mockResolvedValue(false);
      
      await calculosController.calcular(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          statusCode: 404,
          message: expect.stringContaining('tareaId no existe')
        })
      );
    });
    
    test('debe lanzar VALIDATION_ERROR si falta valorObra en PYDOA', async () => {
      req.body = {
        tareaId: 1,
        tareaCodi: 'PYDOA',
        datosObra: {},
        tareasProfesionales: { proyecto: true }
      };
      calculoModel.existeTareaProfesional.mockResolvedValue(true);
      
      await calculosController.calcular(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400,
          message: expect.stringContaining('valorObra')
        })
      );
    });
    
    test('debe propagar ApiError del modelo', async () => {
      req.body = testData.validPayloads.calcular;
      
      const dbError = new ApiError({
        code: ERROR_CODES.DB_SP_ERROR,
        message: 'Error en stored procedure',
        statusCode: 500,
        detail: { sp: 'sp_grabar_calculo' }
      });
      
      calculoModel.existeTareaProfesional.mockResolvedValue(true);
      calculoModel.grabarCalculo.mockRejectedValue(dbError);
      
      await calculosController.calcular(req, res, next);
      
      expect(next).toHaveBeenCalledWith(dbError);
    });
  });
  
  describe('calculosController.obtenerItems', () => {
    test('debe lanzar VALIDATION_ERROR si calculoId no es válido', async () => {
      req.params = { calculoId: 'abc' };
      
      await calculosController.obtenerItems(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400
        })
      );
    });
    
    test('debe lanzar RESOURCE_NOT_FOUND si calculoId no existe', async () => {
      req.params = { calculoId: '999' };
      calculoModel.obtenerCalculoPorId.mockResolvedValue(null);
      
      await calculosController.obtenerItems(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          statusCode: 404
        })
      );
    });
  });
  
  describe('usuariosController.login', () => {
    test('debe lanzar MISSING_REQUIRED_FIELD si faltan campos', async () => {
      req.body = { username_web: 'test@example.com' };
      
      await usuariosController.login(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
          statusCode: 400,
          message: expect.stringContaining('campos requeridos')
        })
      );
    });
    
    test('debe lanzar INVALID_FIELD_TYPE si idmatricula no es entero', async () => {
      req.body = {
        username_web: 'test@example.com',
        idmatricula: 'abc',
        user_nombre_web: 'Juan',
        user_apellido_web: 'Pérez'
      };
      
      await usuariosController.login(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.INVALID_FIELD_TYPE,
          statusCode: 400
        })
      );
    });
    
    test('debe lanzar UNAUTHORIZED si usuario está inactivo', async () => {
      req.body = testData.validPayloads.login;
      Usuario.BuscarXIdMatricula.mockResolvedValue(testData.mockDbResponses.usuarioInactivo);
      
      await usuariosController.login(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.UNAUTHORIZED,
          statusCode: 403,
          message: expect.stringContaining('inactivo')
        })
      );
    });
  });
  
  describe('terminosCondicionesController.buscarVigente', () => {
    test('debe lanzar RESOURCE_NOT_FOUND si no hay TyC vigente', async () => {
      TerminosCondiciones.BuscarVigente.mockResolvedValue(null);
      
      await terminosCondicionesController.buscarVigente(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          statusCode: 404,
          message: expect.stringContaining('vigentes')
        })
      );
    });
    
    test('debe retornar TyC si existe', async () => {
      TerminosCondiciones.BuscarVigente.mockResolvedValue(testData.mockDbResponses.tycVigente);
      
      await terminosCondicionesController.buscarVigente(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(testData.mockDbResponses.tycVigente);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('adminTemplatesController.update', () => {
    test('debe lanzar INVALID_FIELD_TYPE si ID no es válido', async () => {
      req.params = { id: 'abc' };
      req.body = { html: '<html></html>' };
      
      await adminTemplatesController.update(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.INVALID_FIELD_TYPE,
          statusCode: 400,
          message: expect.stringContaining('ID')
        })
      );
    });
    
    test('debe lanzar VALIDATION_ERROR si HTML está vacío', async () => {
      req.params = { id: '1' };
      req.body = { html: '' };
      
      await adminTemplatesController.update(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400,
          message: expect.stringContaining('vacío')
        })
      );
    });
    
    test('debe lanzar VALIDATION_ERROR si HTML supera 500 KB', async () => {
      req.params = { id: '1' };
      req.body = testData.invalidPayloads.adminTemplateHtmlGrande;
      
      await adminTemplatesController.update(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400,
          message: expect.stringContaining('tamaño máximo')
        })
      );
    });
    
    test('debe lanzar RESOURCE_NOT_FOUND si entregableId no existe', async () => {
      req.params = { id: '999' };
      req.body = { html: '<html>Test</html>' };
      adminTemplatesService.actualizarTemplate.mockResolvedValue({ 
        success: false, 
        error: 'Entregable no encontrado' 
      });
      
      await adminTemplatesController.update(req, res, next);
      
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          statusCode: 404
        })
      );
    });
  });
  
  describe('Verificación de errorId', () => {
    test('todos los ApiError deben tener errorId válido', async () => {
      const controllers = [
        { fn: calculosController.calcular, setup: () => { req.body = {}; } },
        { fn: usuariosController.login, setup: () => { req.body = {}; } },
        { fn: terminosCondicionesController.buscar, setup: () => { req.params = {}; } }
      ];
      
      for (const { fn, setup } of controllers) {
        setup();
        await fn(req, res, next);
        
        if (next.mock.calls.length > 0) {
          const error = next.mock.calls[0][0];
          if (ApiError.isApiError(error)) {
            expect(error.errorId).toBeDefined();
            expect(isValidErrorId(error.errorId)).toBe(true);
          }
        }
        
        jest.clearAllMocks();
      }
    });
  });
  
  describe('Verificación de metadata', () => {
    test('todos los ApiError de controllers deben incluir metadata', async () => {
      req.body = {};
      
      await calculosController.calcular(req, res, next);
      
      const error = next.mock.calls[0][0];
      expect(error.metadata).toBeDefined();
      expect(error.metadata).toHaveProperty('controller');
      expect(error.metadata).toHaveProperty('function');
    });
  });
});
