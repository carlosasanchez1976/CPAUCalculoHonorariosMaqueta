// tareaProfesional.js
// SPEC030: Manejo de errores robusto con ApiError
const { executeStoredProcedure } = require('../config/db');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

const TareaProfesional = {
  async Listar() {
    try {
      // Lista todas las tareas NO eliminadas (baja_fecha IS NULL)
      const [rows] = await executeStoredProcedure('Tareas_Profesionales_Listar');
      return rows;
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'tareaProfesional.Listar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al listar tareas profesionales',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'tareaProfesional', function: 'Listar' }
      });
    }
  },

  async Buscar(tareaId) {
    try {
      // Busca tarea por tarea_id (incluye eliminadas)
      const [rows] = await executeStoredProcedure('Tareas_Profesionales_Buscar', [tareaId]);
      return rows[0] || null;
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'tareaProfesional.Buscar');
        error.addMetadata('tareaId', tareaId);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar tarea profesional',
        statusCode: 500,
        detail: { originalError: error.message, tareaId },
        metadata: { module: 'tareaProfesional', function: 'Buscar' }
      });
    }
  },

  async Grabar(data) {
    try {
      // UPSERT: si tarea_id IS NULL → INSERT, sino → UPDATE
      // Campo 'codi' es INMUTABLE (no se puede modificar)
      const {
        tarea_id = null,
        codi,
        descripcion,
        descripcion_larga = '',
        vigente = true,
        user_id
      } = data;
      const [rows] = await executeStoredProcedure('Tareas_Profesionales_Grabar', [
        tarea_id,
        codi,
        descripcion,
        descripcion_larga,
        vigente,
        user_id
      ]);
      // Retorna tarea completa después de grabar
      const tareaId = rows[0]?.tarea_id || rows[0]?.tareaId || rows[0]?.id || tarea_id;
      return await this.Buscar(tareaId);
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'tareaProfesional.Grabar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al guardar tarea profesional',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'tareaProfesional', function: 'Grabar' }
      });
    }
  },

  async Borrar(tareaId, bajaUsuarioId) {
    try {
      // Baja lógica: graba baja_fecha y baja_usuario_id
      const [rows] = await executeStoredProcedure('Tareas_Profesionales_Borrar', [tareaId, bajaUsuarioId]);
      return rows[0]?.success === 1 || rows[0]?.affectedRows > 0;
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'tareaProfesional.Borrar');
        error.addMetadata('tareaId', tareaId);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al eliminar tarea profesional',
        statusCode: 500,
        detail: { originalError: error.message, tareaId },
        metadata: { module: 'tareaProfesional', function: 'Borrar' }
      });
    }
  }
};

module.exports = TareaProfesional;
