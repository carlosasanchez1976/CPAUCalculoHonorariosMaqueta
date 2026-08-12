/**
 * adminTemplatesController.js
 * Controller para gestión de templates PDF (admin)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 * SPEC030: Manejo de errores robusto con ApiError
 * 
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * Fecha: 2026-07-14
 */

const adminTemplatesService = require('../services/adminTemplatesService');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * POST /api/admin/templates/preview
 * Renderiza preview de template con test data
 */
exports.preview = async (req, res, next) => {
    try {
        const { html } = req.body;
        
        // Validación
        if (!html || html.trim() === '') {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'HTML no puede estar vacío',
                statusCode: 400,
                metadata: { controller: 'adminTemplates', function: 'preview' }
            });
        }
        
        // Renderizar preview
        const htmlRendered = await adminTemplatesService.renderizarPreview(html);
        
        // Retornar HTML (no JSON)
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(htmlRendered);
        
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/templates/:id/update
 * Actualiza template en base de datos
 */
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { html } = req.body;
        
        // Validación de ID
        const entregableId = parseInt(id, 10);
        if (isNaN(entregableId) || entregableId <= 0) {
            throw new ApiError({
                code: ERROR_CODES.INVALID_FIELD_TYPE,
                message: 'ID de entregable inválido',
                statusCode: 400,
                detail: { entregableId: id },
                metadata: { controller: 'adminTemplates', function: 'update' }
            });
        }
        
        // Validación de HTML
        if (!html || html.trim() === '') {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'HTML no puede estar vacío',
                statusCode: 400,
                metadata: { controller: 'adminTemplates', function: 'update' }
            });
        }
        
        // Validar tamaño (500 KB max)
        const htmlSizeKB = Buffer.byteLength(html, 'utf8') / 1024;
        if (htmlSizeKB > 500) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: `HTML supera tamaño máximo: ${htmlSizeKB.toFixed(2)} KB (máx: 500 KB)`,
                statusCode: 400,
                detail: { htmlSizeKB: htmlSizeKB.toFixed(2), maxSizeKB: 500 },
                metadata: { controller: 'adminTemplates', function: 'update' }
            });
        }
        
        // Actualizar template
        const resultado = await adminTemplatesService.actualizarTemplate(entregableId, html);
        
        if (!resultado.success) {
            throw new ApiError({
                code: ERROR_CODES.RESOURCE_NOT_FOUND,
                message: resultado.error || 'Entregable no encontrado',
                statusCode: 404,
                detail: { entregableId },
                metadata: { controller: 'adminTemplates', function: 'update' }
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
        next(error);
    }
};

/**
 * GET /api/admin/templates/:id
 * Obtiene template específico por ID
 */
exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Validación de ID
        const entregableId = parseInt(id, 10);
        if (isNaN(entregableId) || entregableId <= 0) {
            throw new ApiError({
                code: ERROR_CODES.INVALID_FIELD_TYPE,
                message: 'ID de entregable inválido',
                statusCode: 400,
                detail: { entregableId: id },
                metadata: { controller: 'adminTemplates', function: 'getById' }
            });
        }
        
        // Obtener template
        const template = await adminTemplatesService.obtenerTemplatePorId(entregableId);
        
        if (!template) {
            throw new ApiError({
                code: ERROR_CODES.RESOURCE_NOT_FOUND,
                message: 'Template no encontrado',
                statusCode: 404,
                detail: { entregableId },
                metadata: { controller: 'adminTemplates', function: 'getById' }
            });
        }
        
        return res.status(200).json({
            success: true,
            data: template
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/templates/test-data
 * Obtiene datos de prueba para hidratar templates
 */
exports.getTestData = async (req, res, next) => {
    try {
        const testData = await adminTemplatesService.obtenerTestData();
        
        return res.status(200).json({
            success: true,
            data: testData
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/templates/list
 * Lista templates activos
 */
exports.list = async (req, res, next) => {
    try {
        const templates = await adminTemplatesService.listarTemplates();
        
        return res.status(200).json({
            success: true,
            data: templates
        });
        
    } catch (error) {
        next(error);
    }
};
