// calculos.js
const express = require('express');
const router = express.Router();
const honorariosController = require('../controllers/calculosController');
const { verificarToken } = require('../middlewares/auth');

// Ruta pública para validación técnica desde Postman (Ticket #016)
router.post('/calcular', honorariosController.calcular);

// Rutas protegidas (requieren autenticación)
router.get('/:calculoId/items', verificarToken, honorariosController.obtenerItems);

module.exports = router;
