/**
 * terminosCondiciones.js
 * Router para gestión de Términos y Condiciones
 * SPEC: SPEC029-CALC-Términos y condiciones (T029-008)
 * 
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * Fecha: 2026-08-06
 */

const express = require('express');
const router = express.Router();
const tycController = require('../controllers/terminosCondicionesController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Ruta PÚBLICA (sin autenticación)
// Obtener TyC vigente - necesario para mostrar antes del login
router.get('/vigente', tycController.buscarVigente);

// Rutas ADMIN (requieren autenticación + rol ADMIN)
router.get('/', verificarToken, verificarRol('ADMIN'), tycController.listar);
router.get('/:id', verificarToken, verificarRol('ADMIN'), tycController.buscar);
router.post('/', verificarToken, verificarRol('ADMIN'), tycController.grabar);
router.put('/:id/activar', verificarToken, verificarRol('ADMIN'), tycController.marcarVigente);

module.exports = router;
