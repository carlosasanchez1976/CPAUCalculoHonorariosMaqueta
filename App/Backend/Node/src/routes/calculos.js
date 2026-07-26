// calculos.js
const express = require('express');
const router = express.Router();
const honorariosController = require('../controllers/calculosController');
const { verificarToken } = require('../middlewares/auth');

// Todas las rutas protegidas (requieren autenticación)
router.post('/calcular', verificarToken, honorariosController.calcular);
router.get('/:calculoId/items', verificarToken, honorariosController.obtenerItems);
router.post('/exportar-pdf', verificarToken, honorariosController.exportarPdf);
router.post('/:calculoId/experiencia', verificarToken, honorariosController.guardarExperiencia);

module.exports = router;
