// ParametrosController.js
// SPEC030: Manejo de errores robusto con ApiError
const Parametro = require('../models/parametro');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

exports.listar = async (req, res, next) => {
  try {
    const Parametros = await Parametro.Listar();
    res.json(Parametros);
  } catch (err) {
    next(err);
  }
};

exports.grabar = async (req, res, next) => {
  try {
    // Validación básica
    const { id, nombre, tipo, valor, descripcion, user_id } = req.body;
    
    
    if (!nombre || !valor || !user_id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan campos requeridos: nombre, valor, user_id',
        statusCode: 400,
        metadata: { controller: 'parametros', function: 'grabar' }
      });
    }
    
    const nuevoParametro = await Parametro.Grabar(req.body);
    res.status(201).json(nuevoParametro);
  } catch (err) {
    next(err);
    }
  }
;

exports.borrar = async (req, res, next) => {
  try {
    const { user_id, user_modi_id } = req.query;
  
    
    // Validación de parámetros
    if (!user_id || !user_modi_id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan datos requeridos',
        statusCode: 400,
        metadata: { controller: 'parametros', function: 'borrar' }
      });
    }
    
    await Parametro.Borrar({ user_id, user_modi_id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};



exports.buscar = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'ID requerido',
        statusCode: 400,
        metadata: { controller: 'parametros', function: 'buscar' }
      });
    }
    
    const ParametroEncontrado = await Parametro.Buscar(id);
    
    if (!ParametroEncontrado) {
      throw new ApiError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Parametro no encontrado',
        statusCode: 404,
        detail: { parametroId: id },
        metadata: { controller: 'parametros', function: 'buscar' }
      });
    }
    
    res.json(ParametroEncontrado);
  } catch (err) {
    next(err);
  }
};
