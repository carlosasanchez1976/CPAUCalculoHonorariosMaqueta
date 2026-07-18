/**
 * adminTemplatesController.js
 * Controller para gestión de templates PDF (admin)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 * 
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * Fecha: 2026-07-14
 */

const adminTemplatesService = require('../services/adminTemplatesService');

/**
 * POST /api/admin/templates/preview
 * Renderiza preview de template con test data
 */
exports.preview = async (req, res) => {
    try {
        const { html } = req.body;
        
        // Validación
        if (!html || html.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'HTML no puede estar vacío'
            });
        }
        
        // Renderizar preview
        const htmlRendered = await adminTemplatesService.renderizarPreview(html);
        
        // Retornar HTML (no JSON)
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(htmlRendered);
        
    } catch (error) {
        console.error('[Admin Templates] Error en preview:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error renderizando preview',
            details: error.message
        });
    }
};

/**
 * POST /api/admin/templates/:id/update
 * Actualiza template en base de datos
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { html } = req.body;
        
        // Validación de ID
        const entregableId = parseInt(id, 10);
        if (isNaN(entregableId) || entregableId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID de entregable inválido'
            });
        }
        
        // Validación de HTML
        if (!html || html.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'HTML no puede estar vacío'
            });
        }
        
        // Validar tamaño (500 KB max)
        const htmlSizeKB = Buffer.byteLength(html, 'utf8') / 1024;
        if (htmlSizeKB > 500) {
            return res.status(400).json({
                success: false,
                error: `HTML supera tamaño máximo: ${htmlSizeKB.toFixed(2)} KB (máx: 500 KB)`
            });
        }
        
        // Actualizar template
        const resultado = await adminTemplatesService.actualizarTemplate(entregableId, html);
        
        if (!resultado.success) {
            return res.status(404).json({
                success: false,
                error: resultado.error || 'Entregable no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Template actualizado exitosamente',
            entregableId: entregableId,
            htmlSize: htmlSizeKB.toFixed(2),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error actualizando template:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error actualizando template en base de datos',
            details: error.message
        });
    }
};

/**
 * GET /api/admin/templates/:id
 * Obtiene template específico por ID
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validación de ID
        const entregableId = parseInt(id, 10);
        if (isNaN(entregableId) || entregableId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID de entregable inválido'
            });
        }
        
        // Obtener template
        const template = await adminTemplatesService.obtenerTemplatePorId(entregableId);
        
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: template
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error obteniendo template:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error cargando template'
        });
    }
};

/**
 * GET /api/admin/templates/test-data
 * Obtiene datos de prueba para hidratar templates
 */
exports.getTestData = async (req, res) => {
    try {
        const testData = await adminTemplatesService.obtenerTestData();
        
        return res.status(200).json({
            success: true,
            data: testData
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error obteniendo test data:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error cargando datos de prueba'
        });
    }
};

/**
 * GET /api/admin/templates/list
 * Lista templates activos
 */
exports.list = async (req, res) => {
    try {
        const templates = await adminTemplatesService.listarTemplates();
        
        return res.status(200).json({
            success: true,
            data: templates
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error listando templates:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error listando templates'
        });
    }
};
