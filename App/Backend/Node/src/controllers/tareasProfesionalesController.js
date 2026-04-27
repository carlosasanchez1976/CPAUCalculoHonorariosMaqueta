// tareasProfesionalesController.js
const TareaProfesional = require('../models/tareaProfesional');

exports.listar = async (req, res) => {
  try {
    const tareas = await TareaProfesional.Listar();
    res.json(tareas);
  } catch (err) {
    console.error('Error en listar tareas profesionales:', err.message);
    res.status(500).json({ error: 'Error al obtener tareas profesionales' });
  }
};

exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }
    const tarea = await TareaProfesional.Buscar(id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea profesional no encontrada' });
    }
    res.json(tarea);
  } catch (err) {
    console.error('Error en buscar tarea profesional:', err.message);
    res.status(500).json({ error: 'Error al buscar tarea profesional' });
  }
};

exports.grabar = async (req, res) => {
  try {
    const { tarea_id, codi, descripcion, vigente, user_id } = req.body;
    // Validaciones básicas
    if (!codi || codi.length > 10) {
      return res.status(400).json({ error: 'El campo codi es requerido y debe tener máximo 10 caracteres' });
    }
    if (!descripcion) {
      return res.status(400).json({ error: 'El campo descripcion es requerido' });
    }
    if (typeof vigente !== 'boolean' && vigente !== 0 && vigente !== 1) {
      return res.status(400).json({ error: 'El campo vigente debe ser booleano' });
    }
    if (!user_id) {
      return res.status(400).json({ error: 'El campo user_id es requerido' });
    }
    // Si es nuevo, validar que codi no exista
    if (!tarea_id) {
      const tareas = await TareaProfesional.Listar();
      if (tareas.some(t => t.codi === codi)) {
        return res.status(409).json({ error: 'Ya existe una tarea con ese codi' });
      }
    }
    const nuevaTarea = await TareaProfesional.Grabar(req.body);
    res.status(tarea_id ? 200 : 201).json(nuevaTarea);
  } catch (err) {
    console.error('Error en grabar tarea profesional:', err.message);
    res.status(500).json({ error: 'Error al grabar tarea profesional: ' + err.message });
  }
};

exports.borrar = async (req, res) => {
  try {
    const { tarea_id, baja_usuario_id } = req.body;
    if (!tarea_id || !baja_usuario_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos: tarea_id, baja_usuario_id' });
    }
    const resultado = await TareaProfesional.Borrar(tarea_id, baja_usuario_id);
    if (!resultado) {
      return res.status(404).json({ error: 'La tarea ya fue eliminada o no existe' });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error en borrar tarea profesional:', err.message);
    res.status(500).json({ error: 'Error al borrar tarea profesional: ' + err.message });
  }
};
