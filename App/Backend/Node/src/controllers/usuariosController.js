// UsuariosController.js
// SPEC030: Manejo de errores robusto con ApiError
const Usuario = require('../models/usuario');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

exports.listar = async (req, res, next) => {
  try {
    const Usuarios = await Usuario.Listar();
    res.json(Usuarios);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // 1. Validación de datos de entrada
    const {
      username_web,
      matricula,
      idmatricula,
      tipoMatricula,
      user_nombre_web,
      user_apellido_web
    } = req.body;

    // Validar campos requeridos
    if (!username_web || !idmatricula || !user_nombre_web || !user_apellido_web) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan campos requeridos',
        statusCode: 400,
        detail: { campos_requeridos: ['username_web', 'idmatricula', 'user_nombre_web', 'user_apellido_web'] },
        metadata: { controller: 'usuarios', function: 'login' }
      });
    }

    // Validar formato de idmatricula
    if (!Number.isInteger(idmatricula) || idmatricula <= 0) {
      throw new ApiError({
        code: ERROR_CODES.INVALID_FIELD_TYPE,
        message: 'idmatricula debe ser un número entero positivo',
        statusCode: 400,
        detail: { idmatricula },
        metadata: { controller: 'usuarios', function: 'login' }
      });
    }

    // 2. Buscar usuario existente por id_matricula
    let usuario = await Usuario.BuscarXIdMatricula(idmatricula);

    // 3. Si no existe, crear nuevo usuario con role WEBUSER
    if (!usuario) {
      console.log('Usuario no encontrado - Creando nuevo usuario WEBUSER');

      const nuevoUsuarioData = {
        user_id: null,
        user_mail: null, // El frontend no envía email
        user_nombre: user_nombre_web,
        user_apellido: user_apellido_web,
        password: null, // Sin password para usuarios web
        rol: 'WEBUSER',
        username_web,
        matricula,
        id_matricula: idmatricula,
        tipo_matricula: tipoMatricula
      };

      const resultado = await Usuario.Grabar(nuevoUsuarioData);

      // Buscar el usuario recién creado para obtener todos sus datos
      usuario = await Usuario.Buscar(resultado.user_id);
    }

    // 4. Verificar que el usuario esté activo
    if (usuario.baja_fecha && new Date(usuario.baja_fecha) <= new Date()) {
      throw new ApiError({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Usuario inactivo. Contacte al administrador.',
        statusCode: 403,
        metadata: { controller: 'usuarios', function: 'login', userId: usuario.user_id }
      });
    }

    // 5. Generar token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: usuario.user_id,
        email: usuario.user_mail,
        nombre: usuario.user_nombre,
        apellido: usuario.user_apellido,
        role: usuario.rol,
        username_web: usuario.username_web,
        matricula: usuario.id_matricula
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // 6. Log de auditoría
    console.log('=== LOGIN EXITOSO ===');
    console.log('Usuario:', usuario.username_web);
    console.log('ID Matrícula:', usuario.id_matricula);
    console.log('Role:', usuario.rol);
    console.log('TyC aceptado:', usuario.tyc_aceptado_fecha ? 'SI' : 'NO');
    console.log('Token generado:', token.substring(0, 50) + '...');
    console.log('=====================');

    // 7. Devolver respuesta (incluye datos de TyC para validación en frontend)
    res.json({
      token: token,
      usuario: {
        id: usuario.user_id,
        role: usuario.rol,
        tyc_aceptado_fecha: usuario.tyc_aceptado_fecha,
        tyc_version_aceptada: usuario.tyc_version_aceptada,
        tyc_id_aceptado: usuario.tyc_id_aceptado
      }
    });

  } catch (err) {
    next(err);
  }
};



exports.grabar = async (req, res, next) => {
  try {
    // Validación básica
    const { user_id, user_mail, user_nombre, user_apellido, rol } = req.body;
    
    // Para nuevo usuario, validar que tenga password
    if (!user_id && !req.body.password) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'La contraseña es requerida para nuevos usuarios',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'grabar' }
      });
    }
    
    if (!user_mail || !user_nombre || !user_apellido || !rol) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan campos requeridos: user_mail, user_nombre, user_apellido, rol',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'grabar' }
      });
    }
    
    const nuevoUsuario = await Usuario.Grabar(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    next(err);
  }
};

exports.borrar = async (req, res, next) => {
  try {
    const { user_id, user_modi_id } = req.query;
  
    
    // Validación de parámetros
    if (!user_id || !user_modi_id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan datos requeridos',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'borrar' }
      });
    }
    
    await Usuario.Borrar({ user_id, user_modi_id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};



exports.buscar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID requerido',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'buscar' }
      });
    }
    
    const usuarioEncontrado = await Usuario.Buscar(id);
    
    if (!usuarioEncontrado) {
      throw new ApiError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Usuario no encontrado',
        statusCode: 404,
        detail: { userId: id },
        metadata: { controller: 'usuarios', function: 'buscar' }
      });
    }
    
    res.json(usuarioEncontrado);
  } catch (err) {
    next(err);
  }
};

exports.cambiarPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!id || !password) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID y password requeridos',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'cambiarPassword' }
      });
    }
    
    await Usuario.CambiarPassword({ user_id: id, password });
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/usuarios/:id/aceptar-terminos
 * Registrar aceptación de Términos y Condiciones por parte del usuario
 */
exports.aceptarTerminos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tyc_id } = req.body;
    
    // Validación de parámetros
    if (!id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID de usuario requerido',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'aceptarTerminos' }
      });
    }
    
    if (!tyc_id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID de TyC requerido',
        statusCode: 400,
        metadata: { controller: 'usuarios', function: 'aceptarTerminos' }
      });
    }
    
    // Verificar que el usuario del token coincide con el parámetro
    // (un usuario solo puede aceptar TyC para sí mismo)
    if (req.usuario && req.usuario.id !== parseInt(id)) {
      throw new ApiError({
        code: ERROR_CODES.FORBIDDEN,
        message: 'No autorizado para aceptar TyC de otro usuario',
        statusCode: 403,
        metadata: { controller: 'usuarios', function: 'aceptarTerminos' }
      });
    }
    
    await Usuario.AceptarTYC(parseInt(id), parseInt(tyc_id));
    
    res.json({
      success: true,
      message: 'Términos y condiciones aceptados correctamente'
    });
  } catch (err) {
    next(err);
  }
};
