/**
 * entregablesService.js
 * Servicio para resolver plantillas de entregables PDF
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * SPEC: SPEC010-CALC-Entregables (T010-001)
 */

const { executeQuery , executeStoredProcedure } = require('../config/db');

/**
 * Resuelve la plantilla de entregable activa para una tarea profesional
 * @param {number} tareaId - ID de la tarea profesional
 * @returns {Object|null} Datos del entregable (html_template, css_styles, pdf_config, etc.)
 */
async function resolverPlantillaEntregable(tareaId) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_BuscarXTareaID', [tareaId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Resuelve la plantilla por código (fallback si no hay tarea_id)
 * @param {string} codigo - Código del entregable (ej: 'basico-proyecto-direccion')
 * @returns {Object|null} Datos del entregable
 */
async function resolverPlantillaPorCodigo(codigo) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_BuscarXCodigo', [codigo]);
  return rows.length > 0 ? rows[0] : null;
}


/**
 * Obtiene un entregable por ID
 * @param {number} entregableId - ID del entregable
 * @returns {Object|null} Datos del entregable
 */
async function obtenerEntregable(entregableId) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_Buscar', [entregableId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Actualiza el HTML template de un entregable
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002)
 * @param {number} entregableId - ID del entregable a actualizar
 * @param {string} htmlTemplate - Contenido HTML nuevo
 * @returns {Object} { filas_afectadas, mensaje }
 */
async function actualizarTemplate(entregableId, htmlTemplate) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ActualizarTemplate', [
    entregableId,
    htmlTemplate
  ]);
  return rows[0];
}

/**
 * Obtiene un entregable completo por ID (incluye template completo)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002)
 * @param {number} entregableId - ID del entregable
 * @returns {Object|null} Datos completos del entregable
 */
async function obtenerPorID(entregableId) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ObtenerPorID', [entregableId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Lista todos los templates activos
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002)
 * @returns {Array} Lista de templates activos con campos básicos
 */
async function listarActivos() {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ListarActivos', []);
  return rows;
}

module.exports = {
  resolverPlantillaEntregable,
  resolverPlantillaPorCodigo,
  obtenerEntregable,
  actualizarTemplate,
  obtenerPorID,
  listarActivos
};
