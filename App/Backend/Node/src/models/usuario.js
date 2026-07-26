// usuario.js
const bcrypt = require('bcryptjs');
const { executeStoredProcedure } = require('../config/db');

const Usuario = {
  async Listar() {
    const [rows] = await executeStoredProcedure('Usuarios_Listar');
    return rows;
  },
  async Buscar(id) {
    console.log('Buscar usuario con id:', id);
    const [rows] = await executeStoredProcedure('Usuarios_Buscar', [id]);
    return rows[0];
  },
  async BuscarXEmail(email) {
    console.log('Buscar usuario con email:', email);
    const [rows] = await executeStoredProcedure('Usuarios_Buscar_X_Email', [email]);
    return rows[0];
  },
  async BuscarXIdMatricula(idMatricula) {
    console.log('Buscar usuario con id_matricula:', idMatricula);
    const [rows] = await executeStoredProcedure('Usuarios_Buscar_X_Id_Matricula', [idMatricula]);
    return rows[0];
  },
  async Borrar(params) {
    const [rows] = await executeStoredProcedure('Usuarios_Borrar', [params.user_id, params.user_modi_id]);
    return rows[0];
  },
  async Grabar(data) {
    const {
      user_id,
      user_mail,
      user_nombre,
      user_apellido,
      password,
      rol,
      username_web,
      matricula,
      id_matricula,
      tipo_matricula
    } = data;
    
    let hashedPassword = null;
    
    // Hash de password solo si se proporciona
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else if (user_id) {
      // Si es edición sin cambio de password, mantener el actual
      const usuarioActual = await this.Buscar(user_id);
      hashedPassword = usuarioActual.password;
    }
    
    // Parámetros: user_id, user_mail, user_nombre, user_apellido, password, rol, modi_user_id,
    //             username_web, matricula, id_matricula, tipo_matricula
    const [rows] = await executeStoredProcedure('Usuarios_Grabar', [
      user_id || null,
      user_mail,
      user_nombre,
      user_apellido,
      hashedPassword,
      rol,
      user_id || 1, // modi_user_id
      username_web || null,
      matricula || null,
      id_matricula || null,
      tipo_matricula || null
    ]);
    
    return { user_id: rows[0]?.user_id };
  },

  // ==================================================================================
  // MÉTODO OBSOLETO - Login con email/password deprecado
  // ==================================================================================
  // El login ahora se maneja en el controller usando BuscarXIdMatricula
  // Este método se mantiene comentado por si se necesita en el futuro
  /*
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
  */
  // ==================================================================================

  async CambiarPassword(data) {
    const { user_id, password } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Usar el stored procedure de grabar solo para actualizar password
    // Primero obtener los datos actuales del usuario
    const usuarioActual = await this.Buscar(user_id);
    if (!usuarioActual) {
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar solo el password (pasar todos los parámetros incluyendo los nuevos)
    const [rows] = await executeStoredProcedure('Usuarios_Grabar', [
      user_id,
      usuarioActual.user_mail,
      usuarioActual.user_nombre,
      usuarioActual.user_apellido,
      hashedPassword,
      usuarioActual.rol,
      user_id, // modi_user_id (el mismo usuario)
      usuarioActual.username_web || null,
      usuarioActual.matricula || null,
      usuarioActual.id_matricula || null,
      usuarioActual.tipo_matricula || null
    ]);
    
    return { user_id: rows[0]?.user_id };
  }
};

module.exports = Usuario;