// UsuariosController.js
const Usuario = require('../models/usuario');

exports.listar = async (req, res) => {
  try {
    const Usuarios = await Usuario.Listar();
    res.json(Usuarios);
  } catch (err) {
    console.error('Error en listar Usuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener Usuarios' });
  }
};

exports.login = async (req, res) => {
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
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        campos_requeridos: ['username_web', 'idmatricula', 'user_nombre_web', 'user_apellido_web']
      });
    }

    // Validar formato de idmatricula
    if (!Number.isInteger(idmatricula) || idmatricula <= 0) {
      return res.status(400).json({
        error: 'idmatricula debe ser un número entero positivo'
      });
    }

    // 2. Buscar usuario existente por id_matricula
    let usuario = await Usuario.BuscarXIdMatricula(idmatricula);

    // 3. Si no existe, crear nuevo usuario con role WEBUSER
    if (!usuario) {
      console.log('Usuario no encontrado - Creando nuevo usuario WEBUSER');

      const nuevoUsuarioData = {
        user_id: null,
        user_mail: `${username_web}@cpau.web`, // Email generado
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
      throw new Error('Usuario dado de baja');
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
    console.log('Token generado:', token.substring(0, 50) + '...');
    console.log('=====================');

    // 7. Devolver respuesta
    res.json({
      token: token,
      usuario: {
        id: usuario.user_id,
        role: usuario.rol
      }
    });

  } catch (err) {
    console.error('Error en login:', err.message);

    // Manejo específico de errores
    if (err.message === 'Usuario dado de baja') {
      return res.status(403).json({
        error: 'Usuario inactivo. Contacte al administrador.'
      });
    }

    res.status(500).json({
      error: 'Error en el proceso de autenticación',
      detalle: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



exports.grabar = async (req, res) => {
  try {
    // Validación básica
    const { user_id, user_mail, user_nombre, user_apellido, rol } = req.body;
    
    // Para nuevo usuario, validar que tenga password
    if (!user_id && !req.body.password) {
      return res.status(400).json({ error: 'La contraseña es requerida para nuevos usuarios' });
    }
    
    if (!user_mail || !user_nombre || !user_apellido || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos: user_mail, user_nombre, user_apellido, rol' });
    }
    
    const nuevoUsuario = await Usuario.Grabar(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (err) {
    console.error('Error en grabar Usuario:', err.message);
    if (err.message && err.message.includes('duplicate')) {
      res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    } else {
      res.status(500).json({ error: 'Error al crear Usuario: ' + err.message });
    }
  }
};

exports.borrar = async (req, res) => {
  try {
    const { user_id, user_modi_id } = req.query;
  
    
    // Validación de parámetros
    if (!user_id || !user_modi_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    await Usuario.Borrar({ user_id, user_modi_id });
    res.status(204).send();
  } catch (err) {
    console.error('Error en borrar Usuario:', err.message);
    res.status(500).json({ error: 'Error al borrar Usuario '+ err.message });
  }
};



exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }
    
    const usuarioEncontrado = await Usuario.Buscar(id);
    
    if (!usuarioEncontrado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(usuarioEncontrado);
  } catch (err) {
    console.error('Error en buscar Usuario:', err.message);
    res.status(500).json({ error: 'Error al buscar Usuario' });
  }
};

exports.cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!id || !password) {
      return res.status(400).json({ error: 'ID y password requeridos' });
    }
    
    await Usuario.CambiarPassword({ user_id: id, password });
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en cambiar password:', err.message);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};
