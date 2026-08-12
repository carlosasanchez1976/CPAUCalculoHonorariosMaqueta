// terminosCondiciones.js
// SPEC030: Manejo de errores robusto con ApiError
const { executeStoredProcedure } = require('../config/db');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

const TerminosCondiciones = {
  /**
   * Lista todos los Términos y Condiciones (histórico) con preview
   * Solo para administradores
   */
  async Listar() {
    try {
      const [rows] = await executeStoredProcedure('Terminos_Condiciones_Listar', []);
      return rows;
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'terminosCondiciones.Listar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al listar términos y condiciones',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'terminosCondiciones', function: 'Listar' }
      });
    }
  },

  /**
   * Busca el Término y Condición vigente
   * Endpoint público (sin autenticación)
   */
  async BuscarVigente() {
    try {
      console.log('Buscar TyC vigente');
      const [rows] = await executeStoredProcedure('Terminos_Condiciones_BuscarVigente', []);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'terminosCondiciones.BuscarVigente');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar términos y condiciones vigentes',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'terminosCondiciones', function: 'BuscarVigente' }
      });
    }
  },

  /**
   * Busca un Término y Condición por ID
   * Solo para administradores
   */
  async Buscar(tycId) {
    try {
      console.log('Buscar TyC con id:', tycId);
      const [rows] = await executeStoredProcedure('Terminos_Condiciones_Buscar', [tycId]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'terminosCondiciones.Buscar');
        error.addMetadata('tycId', tycId);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar términos y condiciones',
        statusCode: 500,
        detail: { originalError: error.message, tycId },
        metadata: { module: 'terminosCondiciones', function: 'Buscar' }
      });
    }
  },

  /**
   * Crea un nuevo Término y Condición
   * @param {Object} data - { version, contenido_md, user_id, activar }
   * @returns {Object} { tyc_id }
   */
  async Grabar(data) {
    try {
      const { version, contenido_md, user_id, activar = true } = data;
      
      const [rows] = await executeStoredProcedure('Terminos_Condiciones_Grabar', [
        version,
        contenido_md,
        user_id,
        activar ? 1 : 0
      ]);
      
      return { tyc_id: rows[0]?.tyc_id };
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'terminosCondiciones.Grabar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al guardar términos y condiciones',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'terminosCondiciones', function: 'Grabar' }
      });
    }
  },

  /**
   * Marca un Término y Condición existente como vigente
   * Resetea las aceptaciones de todos los usuarios
   */
  async MarcarVigente(tycId) {
    try {
      console.log('Marcar TyC como vigente:', tycId);
      await executeStoredProcedure('Terminos_Condiciones_MarcarVigente', [tycId]);
      return { success: true };
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'terminosCondiciones.MarcarVigente');
        error.addMetadata('tycId', tycId);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al marcar términos y condiciones como vigentes',
        statusCode: 500,
        detail: { originalError: error.message, tycId },
        metadata: { module: 'terminosCondiciones', function: 'MarcarVigente' }
      });
    }
  }
};

module.exports = TerminosCondiciones;
