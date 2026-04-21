// usuarios.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken } = require('../middlewares/auth');

// Rutas públicas (sin autenticación)
router.post('/login', usuariosController.login);

// Rutas protegidas (requieren autenticación)
router.get('/', verificarToken, usuariosController.listar);
router.get('/:id', verificarToken, usuariosController.buscar);
router.post('/', verificarToken, usuariosController.grabar);
router.delete('/', verificarToken, usuariosController.borrar);
router.post('/:id/cambiar-password', verificarToken, usuariosController.cambiarPassword);

module.exports = router;
