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
    // Validación básica
    const { user_mail , password } = req.body;
    if (!user_mail || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos: user_mail, password' });
    }
    
    const usuarioLogin = await Usuario.Login(req.body);

    if (!usuarioLogin) {
      return res.status(401).json({ error: 'Usuario no válido' });
    } else {
      const jwt = require('jsonwebtoken');
      // Crear token JWT
      const token = jwt.sign(
          { 
              id: usuarioLogin.user_id,
              email: usuarioLogin.user_mail,
              nombre: usuarioLogin.nombre,
              role: usuarioLogin.rol || 'admin',
          },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
      );

      // ✅ DEBUG: Verificar el token creado
      console.log('=== TOKEN CREADO ===');
      console.log('Token:', token);
      console.log('===================');


      res.json({
          message: 'Login exitoso',
          token: token,
          usuario:  { 
              id: usuarioLogin.user_id,
              email: usuarioLogin.user_mail,
              nombre: usuarioLogin.nombre,
              role: usuarioLogin.rol || 'admin'
          }
      });
    }
  } catch (err) {
    const errMessage = 'error: Error en login Usuario: ' + err.message || '';
    console.error(errMessage);
    res.status(500).json({errMessage});
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
