// tareaProfesional.js
const { executeStoredProcedure } = require('../config/db');

const TareaProfesional = {
  async Listar() {
    // Lista todas las tareas NO eliminadas (baja_fecha IS NULL)
    const [rows] = await executeStoredProcedure('Tareas_Profesionales_Listar');
    return rows;
  },

  async Buscar(tareaId) {
    // Busca tarea por tarea_id (incluye eliminadas)
    const [rows] = await executeStoredProcedure('Tareas_Profesionales_Buscar', [tareaId]);
    return rows[0] || null;
  },

  async Grabar(data) {
    // UPSERT: si tarea_id IS NULL → INSERT, sino → UPDATE
    // Campo 'codi' es INMUTABLE (no se puede modificar)
    const {
      tarea_id = null,
      codi,
      descripcion,
      descripcion_larga = '',
      vigente = true,
      user_id
    } = data;
    const [rows] = await executeStoredProcedure('Tareas_Profesionales_Grabar', [
      tarea_id,
      codi,
      descripcion,
      descripcion_larga,
      vigente,
      user_id
    ]);
    // Retorna tarea completa después de grabar
    const tareaId = rows[0]?.tarea_id || rows[0]?.tareaId || rows[0]?.id || tarea_id;
    return await this.Buscar(tareaId);
  },

  async Borrar(tareaId, bajaUsuarioId) {
    // Baja lógica: graba baja_fecha y baja_usuario_id
    const [rows] = await executeStoredProcedure('Tareas_Profesionales_Borrar', [tareaId, bajaUsuarioId]);
    return rows[0]?.success === 1 || rows[0]?.affectedRows > 0;
  }
};

module.exports = TareaProfesional;
