/**
 * adminTemplatesService.js
 * Servicio para gestión de templates PDF (admin)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 * 
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * Fecha: 2026-07-14
 */

const Handlebars = require('../utils/handlebarsHelpers');
const entregablesService = require('./entregablesService');
const { prepararDatosPlantilla } = require('./pdfService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Renderiza preview de template con test data
 * @param {string} html - Template HTML con sintaxis Handlebars
 * @returns {string} HTML renderizado con datos
 */
async function renderizarPreview(html) {
    try {
        // Cargar test data crudo
        const testDataRaw = await obtenerTestData();
        
        // ✅ PROCESAR datos igual que el PDF real (agrupar honorarios, formatear monedas, etc.)
        const testDataProcessed = prepararDatosPlantilla(
            {
                tipoCalculo: testDataRaw.tipoCalculo,
                tipoNombre: testDataRaw.tipoNombre,
                formData: testDataRaw.formData,
                calculationResult: testDataRaw.calculationResult
            },
            { assets: null } // Sin plantilla específica, usa defaults
        );
        
        console.log('[Admin Templates] Datos procesados para preview:', {
            honorariosObra: testDataProcessed.honorariosObra?.length || 0,
            honorariosAdicionales: testDataProcessed.honorariosAdicionales?.length || 0,
            totalGeneralARS: testDataProcessed.totalGeneralARS
        });
        
        // Compilar template con Handlebars
        const template = Handlebars.compile(html);
        
        // Renderizar con datos PROCESADOS
        const htmlRendered = template(testDataProcessed);
        
        return htmlRendered;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error renderizando preview:', error);
        throw new Error(`Error en sintaxis Handlebars: ${error.message}`);
    }
}

/**
 * Actualiza template en base de datos
 * @param {number} entregableId - ID del entregable
 * @param {string} html - Contenido HTML nuevo
 * @returns {Object} { success, error? }
 */
async function actualizarTemplate(entregableId, html) {
    try {
        // Validar sintaxis Handlebars (intentar compilar)
        try {
            Handlebars.compile(html);
        } catch (error) {
            throw new Error(`Sintaxis Handlebars inválida: ${error.message}`);
        }
        
        // Llamar SP para actualizar
        const resultado = await entregablesService.actualizarTemplate(entregableId, html);
        
        if (resultado.filas_afectadas === 0) {
            return {
                success: false,
                error: resultado.mensaje || 'Entregable no encontrado'
            };
        }
        
        return {
            success: true,
            mensaje: resultado.mensaje
        };
        
    } catch (error) {
        console.error('[Admin Templates Service] Error actualizando template:', error);
        throw error;
    }
}

/**
 * Obtiene datos de prueba desde JSON
 * @returns {Object} Test data completo
 */
async function obtenerTestData() {
    try {
        const testDataPath = path.join(__dirname, '../data/test-data-templates.json');
        const testDataRaw = await fs.readFile(testDataPath, 'utf8');
        const testData = JSON.parse(testDataRaw);
        
        return testData;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error cargando test data:', error);
        throw new Error('No se pudo cargar archivo de test data');
    }
}

/**
 * Obtiene un template por ID
 * @param {number} entregableId - ID del entregable
 * @returns {Object} Template completo con html_template decodificado
 */
async function obtenerTemplatePorId(entregableId) {
    try {
        const template = await entregablesService.obtenerPorID(entregableId);
        
        if (!template) {
            return null;
        }
        
        return template;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error obteniendo template:', error);
        throw error;
    }
}

/**
 * Lista templates activos desde BD
 * @returns {Array} Lista de templates
 */
async function listarTemplates() {
    try {
        const templates = await entregablesService.listarActivos();
        return templates;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error listando templates:', error);
        throw error;
    }
}

module.exports = {
    renderizarPreview,
    actualizarTemplate,
    obtenerTestData,
    obtenerTemplatePorId,
    listarTemplates
};
