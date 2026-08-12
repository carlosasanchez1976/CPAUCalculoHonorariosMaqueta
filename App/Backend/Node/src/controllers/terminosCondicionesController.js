// terminosCondicionesController.js
// SPEC030: Manejo de errores robusto con ApiError
const TerminosCondiciones = require('../models/terminosCondiciones');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

/**
 * GET /api/terminos-condiciones
 * Listar histórico de Términos y Condiciones (solo admin)
 */
exports.listar = async (req, res, next) => {
  try {
    const lista = await TerminosCondiciones.Listar();
    res.json(lista);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/terminos-condiciones/vigente
 * Obtener Términos y Condiciones vigente (público - sin autenticación)
 */
exports.buscarVigente = async (req, res, next) => {
  try {
    const tyc = await TerminosCondiciones.BuscarVigente();
    
    if (!tyc) {
      throw new ApiError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'No hay términos y condiciones vigentes',
        statusCode: 404,
        metadata: { controller: 'terminosCondiciones', function: 'buscarVigente' }
      });
    }
    
    res.json(tyc);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/terminos-condiciones/:id
 * Buscar Términos y Condiciones por ID (solo admin)
 */
exports.buscar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID requerido',
        statusCode: 400,
        metadata: { controller: 'terminosCondiciones', function: 'buscar' }
      });
    }
    
    const tyc = await TerminosCondiciones.Buscar(parseInt(id));
    
    if (!tyc) {
      throw new ApiError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Términos y condiciones no encontrados',
        statusCode: 404,
        detail: { tycId: id },
        metadata: { controller: 'terminosCondiciones', function: 'buscar' }
      });
    }
    
    res.json(tyc);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/terminos-condiciones
 * Crear nuevo Términos y Condiciones (solo admin)
 * Por defecto se crea Y activa automáticamente
 */
exports.grabar = async (req, res, next) => {
  try {
    const { version, contenido_md, activar = true } = req.body;
    
    // Validación de campos requeridos
    if (!version || !contenido_md) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan campos requeridos: version, contenido_md',
        statusCode: 400,
        metadata: { controller: 'terminosCondiciones', function: 'grabar' }
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
    next(err);
  }
};

/**
 * PUT /api/terminos-condiciones/:id/activar
 * Marcar un TyC existente como vigente (solo admin)
 */
exports.marcarVigente = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID requerido',
        statusCode: 400,
        metadata: { controller: 'terminosCondiciones', function: 'marcarVigente' }
      });
    }
    
    await TerminosCondiciones.MarcarVigente(parseInt(id));
    
    res.json({
      success: true,
      message: 'TyC activado. Todos los usuarios deben re-aceptar.'
    });
  } catch (err) {
    next(err);
  }
};
