// parametros.js
const express = require('express');
const router = express.Router();
const parametrosController = require('../controllers/parametrosController');
const { verificarToken } = require('../middlewares/auth');



// Rutas protegidas (requieren autenticación)
router.get('/', verificarToken, parametrosController.listar);
router.get('/:id', verificarToken, parametrosController.buscar);
router.post('/', verificarToken, parametrosController.grabar);
router.delete('/', verificarToken, parametrosController.borrar);

module.exports = router;
