// ParametrosController.js
const Parametro = require('../models/parametro');

exports.listar = async (req, res) => {
  try {
    const Parametros = await Parametro.Listar();
    res.json(Parametros);
  } catch (err) {
    console.error('Error en listar Parametros:', err.message);
    res.status(500).json({ error: 'Error al obtener Parametros' });
  }
};

exports.grabar = async (req, res) => {
  try {
    // Validación básica
    const { id, nombre, tipo, valor, descripcion, user_id } = req.body;
    
    
    if (!nombre || !valor || !user_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos: nombre, valor, user_id' });
    }
    
    const nuevoParametro = await Parametro.Grabar(req.body);
    res.status(201).json(nuevoParametro);
  } catch (err) {
    console.error('Error en grabar Parametro:', err.message);
    res.status(500).json({ error: 'Error al crear Parámetro: ' + err.message });
    }
  }
;

exports.borrar = async (req, res) => {
  try {
    const { user_id, user_modi_id } = req.query;
  
    
    // Validación de parámetros
    if (!user_id || !user_modi_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    await Parametro.Borrar({ user_id, user_modi_id });
    res.status(204).send();
  } catch (err) {
    console.error('Error en borrar Parametro:', err.message);
    res.status(500).json({ error: 'Error al borrar Parametro '+ err.message });
  }
};



exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }
    
    const ParametroEncontrado = await Parametro.Buscar(id);
    
    if (!ParametroEncontrado) {
      return res.status(404).json({ error: 'Parametro no encontrado' });
    }
    
    res.json(ParametroEncontrado);
  } catch (err) {
    console.error('Error en buscar Parametro:', err.message);
    res.status(500).json({ error: 'Error al buscar Parametro' });
  }
};
