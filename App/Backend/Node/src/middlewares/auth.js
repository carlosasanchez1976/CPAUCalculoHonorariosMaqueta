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
    
    // 🔍 DEBUG: Log de estado de autenticación
    console.log('🔐 [AUTH DEBUG]', {
      ruta: req.path,
      requireJWT,
      tieneAuthHeader: !!authHeader,
      REQUIRE_JWT_ENV: process.env.REQUIRE_JWT
    });
    
    // MODO PERMISIVO (REQUIRE_JWT=false): Permitir acceso sin token
    if (!requireJWT && !authHeader) {
      console.log('✅ [AUTH DEBUG] Modo permisivo: acceso sin token');
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
      console.log('❌ [AUTH DEBUG] Modo estricto: token no proporcionado');
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
    
    console.log('✅ [AUTH DEBUG] Token verificado exitosamente:', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role
    });
    
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.log('❌ [AUTH DEBUG] Error en verificación:', error.name, error.message);
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
