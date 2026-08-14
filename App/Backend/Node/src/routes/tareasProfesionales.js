// tareasProfesionales.js
const express = require('express');
const router = express.Router();
const tareasProfesionalesController = require('../controllers/tareasProfesionalesController');
const { verificarToken } = require('../middlewares/auth');

// ========================================
// AUTENTICACIÓN JWT
// ========================================
// Para habilitar autenticación completa cuando implementes el login:
// En .env cambiar: REQUIRE_JWT=false → REQUIRE_JWT=true
//
// Mientras REQUIRE_JWT=false (actual):
// - Permite acceso sin token
// - Si hay token, lo verifica y rechaza si es inválido
//
// Cuando REQUIRE_JWT=true (después del login):
// - Requiere token en todas las peticiones
// - Rechaza si no hay token o es inválido
// ========================================

// Rutas con autenticación JWT (configurables con REQUIRE_JWT)
router.get('/', verificarToken, tareasProfesionalesController.listar);
router.get('/:id', verificarToken, tareasProfesionalesController.buscar);
router.delete('/', verificarToken, tareasProfesionalesController.borrar);
router.post('/', verificarToken, tareasProfesionalesController.activar);

module.exports = router;
