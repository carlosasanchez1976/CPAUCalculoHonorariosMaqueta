// auth.js - Middleware de autenticación JWT
const jwt = require('jsonwebtoken');

// ========================================
// CONFIGURACIÓN DE AUTENTICACIÓN
// ========================================
// Para habilitar autenticación JWT completa, cambiar en .env:
// REQUIRE_JWT=true
//
// Mientras REQUIRE_JWT=false:
// - Permite acceso sin token (usuario por defecto)
// - Si hay token, lo verifica y rechaza si es inválido
// ========================================

const verificarToken = (req, res, next) => {
  try {
    const requireJWT = process.env.REQUIRE_JWT === 'true';
    const authHeader = req.headers['authorization'];
    
    // MODO PERMISIVO (REQUIRE_JWT=false): Permitir acceso sin token
    if (!requireJWT && !authHeader) {
      req.usuario = {
        id: 2,
        email: 'temporal@cpau.com',
        nombre: 'Usuario Temporal',
        role: 'admin'
      };
      return next();
    }

    // MODO ESTRICTO (REQUIRE_JWT=true): Rechazar si no hay token
    if (requireJWT && !authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Si hay token, verificarlo siempre
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      if (requireJWT) {
        return res.status(401).json({ error: 'Token no proporcionado' });
      }
      // Modo permisivo: permitir sin token
      req.usuario = {
        id: 2,
        email: 'temporal@cpau.com',
        nombre: 'Usuario Temporal',
        role: 'admin'
      };
      return next();
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};

// Middleware opcional para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

module.exports = { verificarToken, verificarRol };
