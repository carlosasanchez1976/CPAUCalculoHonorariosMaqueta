/**
 * entregablesService.js
 * Servicio para resolver plantillas de entregables PDF
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * SPEC: SPEC010-CALC-Entregables (T010-001)
 * SPEC030: Manejo de errores robusto con ApiError
 */

const { executeQuery , executeStoredProcedure } = require('../config/db');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * Resuelve la plantilla de entregable activa para una tarea profesional
 * @param {number} tareaId - ID de la tarea profesional
 * @returns {Object|null} Datos del entregable (html_template, css_styles, pdf_config, etc.)
 */
async function resolverPlantillaEntregable(tareaId) {
  try {
    const [rows] = await executeStoredProcedure('Entregables_PDF_BuscarXTareaID', [tareaId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'entregablesService.resolverPlantillaEntregable');
      error.addMetadata('tareaId', tareaId);
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al resolver plantilla de entregable',
      statusCode: 500,
      detail: { originalError: error.message, tareaId },
      metadata: { module: 'entregablesService', function: 'resolverPlantillaEntregable' }
    });
  }
}

/**
 * Resuelve la plantilla por código (fallback si no hay tarea_id)
 * @param {string} codigo - Código del entregable (ej: 'basico-proyecto-direccion')
 * @returns {Object|null} Datos del entregable
 */
async function resolverPlantillaPorCodigo(codigo) {
  try {
    const [rows] = await executeStoredProcedure('Entregables_PDF_BuscarXCodigo', [codigo]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'entregablesService.resolverPlantillaPorCodigo');
      error.addMetadata('codigo', codigo);
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al resolver plantilla por código',
      statusCode: 500,
      detail: { originalError: error.message, codigo },
      metadata: { module: 'entregablesService', function: 'resolverPlantillaPorCodigo' }
    });
  }
}


/**
 * Obtiene un entregable por ID
 * @param {number} entregableId - ID del entregable
 * @returns {Object|null} Datos del entregable
 */
async function obtenerEntregable(entregableId) {
  try {
    const [rows] = await executeStoredProcedure('Entregables_PDF_Buscar', [entregableId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'entregablesService.obtenerEntregable');
      error.addMetadata('entregableId', entregableId);
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al obtener entregable',
      statusCode: 500,
      detail: { originalError: error.message, entregableId },
      metadata: { module: 'entregablesService', function: 'obtenerEntregable' }
    });
  }
}

/**
 * Actualiza el HTML template de un entregable
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002)
 * @param {number} entregableId - ID del entregable a actualizar
 * @param {string} htmlTemplate - Contenido HTML nuevo
 * @returns {Object} { filas_afectadas, mensaje }
 */
async function actualizarTemplate(entregableId, htmlTemplate) {
  try {
    const [rows] = await executeStoredProcedure('Entregables_PDF_ActualizarTemplate', [
      entregableId,
      htmlTemplate
    ]);
    return rows[0];
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'entregablesService.actualizarTemplate');
      error.addMetadata('entregableId', entregableId);
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al actualizar template de entregable',
      statusCode: 500,
      detail: { originalError: error.message, entregableId },
      metadata: { module: 'entregablesService', function: 'actualizarTemplate' }
    });
  }
}

/**
 * Obtiene un entregable completo por ID (incluye template completo)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002)
 * @param {number} entregableId - ID del entregable
 * @returns {Object|null} Datos completos del entregable
 */
async function obtenerPorID(entregableId) {
  try {
    const [rows] = await executeStoredProcedure('Entregables_PDF_ObtenerPorID', [entregableId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'entregablesService.obtenerPorID');
      error.addMetadata('entregableId', entregableId);
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al obtener entregable completo',
      statusCode: 500,
      detail: { originalError: error.message, entregableId },
      metadata: { module: 'entregablesService', function: 'obtenerPorID' }
    });
  }
}

/**
 * Lista todos los templates activos
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002)
 * @returns {Array} Lista de templates activos con campos básicos
 */
async function listarActivos() {
  try {
    const [rows] = await executeStoredProcedure('Entregables_PDF_ListarActivos', []);
    return rows;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'entregablesService.listarActivos');
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al listar templates activos',
      statusCode: 500,
      detail: { originalError: error.message },
      metadata: { module: 'entregablesService', function: 'listarActivos' }
    });
  }
}

module.exports = {
  resolverPlantillaEntregable,
  resolverPlantillaPorCodigo,
  obtenerEntregable,
  actualizarTemplate,
  obtenerPorID,
  listarActivos
};
