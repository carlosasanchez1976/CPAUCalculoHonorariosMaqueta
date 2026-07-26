/**
 * adminTemplates.js
 * Router para gestión de templates PDF (admin)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 * 
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * Fecha: 2026-07-14
 */

const express = require('express');
const router = express.Router();
const adminTemplatesController = require('../controllers/adminTemplatesController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Todas las rutas protegidas (requieren autenticación)
// TODO: En futuro, agregar verificarRol('admin') para restringir solo a administradores

/**
 * POST /api/admin/templates/preview
 * Preview de template con datos de prueba
 */
router.post('/preview', verificarToken, adminTemplatesController.preview);

/**
 * POST /api/admin/templates/:id/update
 * Actualizar template en BD
 */
router.post('/:id/update', verificarToken, adminTemplatesController.update);

/**
 * GET /api/admin/templates/test-data
 * Obtener datos de prueba para hidratar templates
 */
router.get('/test-data', verificarToken, adminTemplatesController.getTestData);

/**
 * GET /api/admin/templates/list
 * Listar templates activos (para selector en tool)
 */
router.get('/list', verificarToken, adminTemplatesController.list);

/**
 * GET /api/admin/templates/:id
 * Obtener template específico por ID
 */
router.get('/:id', verificarToken, adminTemplatesController.getById);

module.exports = router;
