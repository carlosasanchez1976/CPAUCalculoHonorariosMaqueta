// terminosCondiciones.js
const { executeStoredProcedure } = require('../config/db');

const TerminosCondiciones = {
  /**
   * Lista todos los Términos y Condiciones (histórico) con preview
   * Solo para administradores
   */
  async Listar() {
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_Listar', []);
    return rows;
  },

  /**
   * Busca el Término y Condición vigente
   * Endpoint público (sin autenticación)
   */
  async BuscarVigente() {
    console.log('Buscar TyC vigente');
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_BuscarVigente', []);
    return rows[0];
  },

  /**
   * Busca un Término y Condición por ID
   * Solo para administradores
   */
  async Buscar(tycId) {
    console.log('Buscar TyC con id:', tycId);
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_Buscar', [tycId]);
    return rows[0];
  },

  /**
   * Crea un nuevo Término y Condición
   * @param {Object} data - { version, contenido_md, user_id, activar }
   * @returns {Object} { tyc_id }
   */
  async Grabar(data) {
    const { version, contenido_md, user_id, activar = true } = data;
    
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_Grabar', [
      version,
      contenido_md,
      user_id,
      activar ? 1 : 0
    ]);
    
    return { tyc_id: rows[0]?.tyc_id };
  },

  /**
   * Marca un Término y Condición existente como vigente
   * Resetea las aceptaciones de todos los usuarios
   */
  async MarcarVigente(tycId) {
    console.log('Marcar TyC como vigente:', tycId);
    await executeStoredProcedure('Terminos_Condiciones_MarcarVigente', [tycId]);
    return { success: true };
  }
};

module.exports = TerminosCondiciones;
