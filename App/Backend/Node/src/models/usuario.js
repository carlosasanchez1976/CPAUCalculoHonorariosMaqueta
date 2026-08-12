// usuario.js
// SPEC030: Manejo de errores robusto con ApiError
const bcrypt = require('bcryptjs');
const { executeStoredProcedure } = require('../config/db');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

const Usuario = {
  async Listar() {
    try {
      const [rows] = await executeStoredProcedure('Usuarios_Listar');
      return rows;
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.Listar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al listar usuarios',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'usuario', function: 'Listar' }
      });
    }
  },
  async Buscar(id) {
    try {
      console.log('Buscar usuario con id:', id);
      const [rows] = await executeStoredProcedure('Usuarios_Buscar', [id]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.Buscar');
        error.addMetadata('userId', id);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar usuario',
        statusCode: 500,
        detail: { originalError: error.message, userId: id },
        metadata: { module: 'usuario', function: 'Buscar' }
      });
    }
  },
  async BuscarXEmail(email) {
    try {
      console.log('Buscar usuario con email:', email);
      const [rows] = await executeStoredProcedure('Usuarios_Buscar_X_Email', [email]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.BuscarXEmail');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar usuario por email',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'usuario', function: 'BuscarXEmail' }
      });
    }
  },
  async BuscarXIdMatricula(idMatricula) {
    try {
      console.log('Buscar usuario con id_matricula:', idMatricula);
      const [rows] = await executeStoredProcedure('Usuarios_Buscar_X_Id_Matricula', [idMatricula]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.BuscarXIdMatricula');
        error.addMetadata('idMatricula', idMatricula);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al buscar usuario por matrícula',
        statusCode: 500,
        detail: { originalError: error.message, idMatricula },
        metadata: { module: 'usuario', function: 'BuscarXIdMatricula' }
      });
    }
  },
  async Borrar(params) {
    try {
      const [rows] = await executeStoredProcedure('Usuarios_Borrar', [params.user_id, params.user_modi_id]);
      return rows[0];
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.Borrar');
        error.addMetadata('userId', params.user_id);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al eliminar usuario',
        statusCode: 500,
        detail: { originalError: error.message, userId: params.user_id },
        metadata: { module: 'usuario', function: 'Borrar' }
      });
    }
  },
  async Grabar(data) {
    try {
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
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.Grabar');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al guardar usuario',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'usuario', function: 'Grabar' }
      });
    }
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
    try {
      const { user_id, password } = data;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Usar el stored procedure de grabar solo para actualizar password
      // Primero obtener los datos actuales del usuario
      const usuarioActual = await this.Buscar(user_id);
      if (!usuarioActual) {
        throw new ApiError({
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Usuario no encontrado',
          statusCode: 404,
          detail: { userId: user_id },
          metadata: { module: 'usuario', function: 'CambiarPassword' }
        });
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
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.CambiarPassword');
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al cambiar contraseña',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'usuario', function: 'CambiarPassword' }
      });
    }
  },

  /**
   * Registra la aceptación de Términos y Condiciones por parte del usuario
   * @param {number} userId - ID del usuario
   * @param {number} tycId - ID del documento de TyC aceptado
   * @returns {Object} { success: true }
   */
  async AceptarTYC(userId, tycId) {
    try {
      console.log('Registrar aceptación de TyC - Usuario:', userId, 'TyC ID:', tycId);
      await executeStoredProcedure('Usuarios_AceptarTerminos', [userId, tycId]);
      return { success: true };
    } catch (error) {
      if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'usuario.AceptarTYC');
        error.addMetadata('userId', userId);
        error.addMetadata('tycId', tycId);
        throw error;
      }
      
      throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al registrar aceptación de términos y condiciones',
        statusCode: 500,
        detail: { originalError: error.message, userId, tycId },
        metadata: { module: 'usuario', function: 'AceptarTYC' }
      });
    }
  }
};

module.exports = Usuario;