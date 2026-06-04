// usuario.js
const bcrypt = require('bcryptjs');
const { executeStoredProcedure } = require('../config/db');

const Usuario = {
  async Listar() {
    const [rows] = await executeStoredProcedure('usuarios_listar');
    return rows;
  },
  async Buscar(id) {
    console.log('Buscar usuario con id:', id);
    const [rows] = await executeStoredProcedure('usuarios_buscar', [id]);
    return rows[0];
  },
  async BuscarXEmail(email) {
    console.log('Buscar usuario con email:', email);
    const [rows] = await executeStoredProcedure('usuarios_buscar_x_email', [email]);
    return rows[0];
  },
  async Borrar(params) {
    const [rows] = await executeStoredProcedure('usuarios_borrar', [params.user_id, params.user_modi_id]);
    return rows[0];
  },
  async Grabar(data) {
    const { user_id, user_mail, user_nombre, user_apellido, password, rol } = data;
    
    let hashedPassword;
    
    // Si es edición sin cambio de password, mantener el password actual
    if (user_id && !password) {
      const usuarioActual = await this.Buscar(user_id);
      hashedPassword = usuarioActual.password;
    } else {
      // Hash del nuevo password
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    // Parámetros: user_id, user_mail, user_nombre, user_apellido, password, rol, modi_user_id
    const [rows] = await executeStoredProcedure('usuarios_grabar', [
      user_id || null,
      user_mail,
      user_nombre,
      user_apellido,
      hashedPassword,
      rol,
      user_id || 1 // modi_user_id
    ]);
    
    return { user_id: rows[0]?.user_id };
  },

  async Login(data) {
    const { user_mail, password } = data;

    console.log('Login usuario con email:', user_mail);
    const usuarioBus = await this.BuscarXEmail(user_mail);

    console.log('Usuario encontrado:', usuarioBus);
    
    if (!usuarioBus) {
      throw new Error('Usuario no encontrado');
    }
    
    //const isPasswordValid = await bcrypt.compare(password, usuarioBus.password);
    const isPasswordValid = password === usuarioBus.password; // Para testing sin hash
    if (!isPasswordValid) {
      throw new Error('Contraseña incorrecta');
    }
    
    return usuarioBus;
  },

  async CambiarPassword(data) {
    const { user_id, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Usar el stored procedure de grabar solo para actualizar password
    // Primero obtener los datos actuales del usuario
    const usuarioActual = await this.Buscar(user_id);
    if (!usuarioActual) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar solo el password
    const [rows] = await executeStoredProcedure('usuarios_grabar', [
      user_id,
      usuarioActual.user_mail,
      usuarioActual.user_nombre,
      usuarioActual.user_apellido,
      hashedPassword,
      usuarioActual.rol,
      user_id // modi_user_id (el mismo usuario)
    ]);
    
    return { user_id: rows[0]?.user_id };
  }
};

module.exports = Usuario;