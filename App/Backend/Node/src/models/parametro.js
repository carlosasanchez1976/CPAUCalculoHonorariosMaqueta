// parametro.js
// SPEC030: Manejo de errores robusto con ApiError
const bcrypt = require('bcryptjs');
const { executeStoredProcedure } = require('../config/db');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

const Parametro = {
  async Listar() {
    try {
      const [rows] = await executeStoredProcedure('parametros_listar');
      return rows;
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'parametro.Listar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al listar parámetros',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'parametro', function: 'Listar' }
      });
    }
  },
  async Buscar(id) {
    try {
      console.log('Buscar parametro con id:', id);
      const [rows] = await executeStoredProcedure('parametros_buscar', [id]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'parametro.Buscar');
        error.addMetadata('parametroId', id);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar parámetro',
        statusCode: 500,
        detail: { originalError: error.message, parametroId: id },
        metadata: { module: 'parametro', function: 'Buscar' }
      });
    }
  },
  async Borrar(params) {
    try {
      const [rows] = await executeStoredProcedure('parametros_borrar', [params.id, params.user_modi_id]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'parametro.Borrar');
        error.addMetadata('parametroId', params.id);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al eliminar parámetro',
        statusCode: 500,
        detail: { originalError: error.message, parametroId: params.id },
        metadata: { module: 'parametro', function: 'Borrar' }
      });
    }
  },
  async Grabar(data) {
    try {
      const { id, nombre, tipo, valor, descripcion, user_id } = data;
      
      
      // Parámetros: id, nombre, valor, user_id
      const [rows] = await executeStoredProcedure('parametros_grabar', [
        id || null,
        nombre,
        tipo,
        valor,
        descripcion,
        user_id || 1 // user_id
      ]);
      
      return { id: rows[0]?.parametro_id };
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'parametro.Grabar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al guardar parámetro',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'parametro', function: 'Grabar' }
      });
    }
  }

};

module.exports = Parametro;