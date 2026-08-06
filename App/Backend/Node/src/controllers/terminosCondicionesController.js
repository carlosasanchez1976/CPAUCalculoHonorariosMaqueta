// terminosCondicionesController.js
const TerminosCondiciones = require('../models/terminosCondiciones');

/**
 * GET /api/terminos-condiciones
 * Listar histórico de Términos y Condiciones (solo admin)
 */
exports.listar = async (req, res) => {
  try {
    const lista = await TerminosCondiciones.Listar();
    res.json(lista);
  } catch (err) {
    console.error('Error en listar Términos y Condiciones:', err.message);
    res.status(500).json({ error: 'Error al obtener términos y condiciones' });
  }
};

/**
 * GET /api/terminos-condiciones/vigente
 * Obtener Términos y Condiciones vigente (público - sin autenticación)
 */
exports.buscarVigente = async (req, res) => {
  try {
    const tyc = await TerminosCondiciones.BuscarVigente();
    
    if (!tyc) {
      return res.status(404).json({ 
        error: 'No hay términos y condiciones vigentes' 
      });
    }
    
    res.json(tyc);
  } catch (err) {
    console.error('Error en buscar TyC vigente:', err.message);
    res.status(500).json({ error: 'Error al obtener términos y condiciones' });
  }
};

/**
 * GET /api/terminos-condiciones/:id
 * Buscar Términos y Condiciones por ID (solo admin)
 */
exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }
    
    const tyc = await TerminosCondiciones.Buscar(parseInt(id));
    
    if (!tyc) {
      return res.status(404).json({ error: 'Términos y condiciones no encontrados' });
    }
    
    res.json(tyc);
  } catch (err) {
    console.error('Error en buscar Términos y Condiciones:', err.message);
    res.status(500).json({ error: 'Error al buscar términos y condiciones' });
  }
};

/**
 * POST /api/terminos-condiciones
 * Crear nuevo Términos y Condiciones (solo admin)
 * Por defecto se crea Y activa automáticamente
 */
exports.grabar = async (req, res) => {
  try {
    const { version, contenido_md, activar = true } = req.body;
    
    // Validación de campos requeridos
    if (!version || !contenido_md) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: version, contenido_md' 
      });
    }
    
    // Obtener user_id del token JWT
    const user_id = req.usuario?.id || null;
    
    const resultado = await TerminosCondiciones.Grabar({
      version,
      contenido_md,
      user_id,
      activar
    });
    
    res.status(201).json({
      success: true,
      data: resultado,
      message: activar 
        ? 'TyC creado y activado. Todos los usuarios deben re-aceptar.'
        : 'TyC creado como borrador.'
    });
  } catch (err) {
    console.error('Error en grabar Términos y Condiciones:', err.message);
    res.status(500).json({ error: 'Error al crear términos y condiciones' });
  }
};

/**
 * PUT /api/terminos-condiciones/:id/activar
 * Marcar un TyC existente como vigente (solo admin)
 */
exports.marcarVigente = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID requerido' });
    }
    
    await TerminosCondiciones.MarcarVigente(parseInt(id));
    
    res.json({
      success: true,
      message: 'TyC activado. Todos los usuarios deben re-aceptar.'
    });
  } catch (err) {
    console.error('Error en marcar TyC vigente:', err.message);
    
    // Manejo específico de errores del SP
    if (err.message && err.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'TyC no encontrado' });
    }
    
    res.status(500).json({ error: 'Error al activar términos y condiciones' });
  }
};
