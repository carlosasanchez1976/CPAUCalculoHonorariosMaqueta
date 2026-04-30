// parametro.js
const bcrypt = require('bcryptjs');
const { executeStoredProcedure } = require('../config/db');

const Parametro = {
  async Listar() {
    const [rows] = await executeStoredProcedure('parametros_listar');
    return rows;
  },
  async Buscar(id) {
    console.log('Buscar parametro con id:', id);
    const [rows] = await executeStoredProcedure('parametros_buscar', [id]);
    return rows[0];
  },
  async Borrar(params) {
    const [rows] = await executeStoredProcedure('parametros_borrar', [params.id, params.user_modi_id]);
    return rows[0];
  },
  async Grabar(data) {
    const { id, nombre, tipo, valor, descripcion, user_id } = data;
    
    
    // Parámetros: id, nombre, valor, user_id
    const [rows] = await executeStoredProcedure('parametros_grabar', [
      id || null,
      nombre,
      tipo,
      valor,
      descripcion,
      user_id || 1 // user_id
    ]);
    
    return { id: rows[0]?.parametro_id };
  }

};

module.exports = Parametro;