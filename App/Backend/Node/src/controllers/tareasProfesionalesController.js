// tareasProfesionalesController.js
// SPEC030: Manejo de errores robusto con ApiError
const TareaProfesional = require('../models/tareaProfesional');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

exports.listar = async (req, res, next) => {
  try {
    const tareas = await TareaProfesional.Listar();
    res.json(tareas);
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
        metadata: { controller: 'tareasProfesionales', function: 'buscar' }
      });
    }
    const tarea = await TareaProfesional.Buscar(id);
    if (!tarea) {
      throw new ApiError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'Tarea profesional no encontrada',
        statusCode: 404,
        detail: { tareaId: id },
        metadata: { controller: 'tareasProfesionales', function: 'buscar' }
      });
    }
    res.json(tarea);
  } catch (err) {
    next(err);
  }
};

exports.grabar = async (req, res, next) => {
  try {
    const { tarea_id, codi, descripcion, vigente, user_id } = req.body;
    // Validaciones básicas
    if (!codi || codi.length > 10) {
      throw new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'El campo codi es requerido y debe tener máximo 10 caracteres',
        statusCode: 400,
        metadata: { controller: 'tareasProfesionales', function: 'grabar' }
      });
    }
    if (!descripcion) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'El campo descripcion es requerido',
        statusCode: 400,
        metadata: { controller: 'tareasProfesionales', function: 'grabar' }
      });
    }
    if (typeof vigente !== 'boolean' && vigente !== 0 && vigente !== 1) {
      throw new ApiError({
        code: ERROR_CODES.INVALID_FIELD_TYPE,
        message: 'El campo vigente debe ser booleano',
        statusCode: 400,
        metadata: { controller: 'tareasProfesionales', function: 'grabar' }
      });
    }
    if (!user_id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'El campo user_id es requerido',
        statusCode: 400,
        metadata: { controller: 'tareasProfesionales', function: 'grabar' }
      });
    }
    // Si es nuevo, validar que codi no exista
    if (!tarea_id) {
      const tareas = await TareaProfesional.Listar();
      if (tareas.some(t => t.codi === codi)) {
        throw new ApiError({
          code: ERROR_CODES.DUPLICATE_RESOURCE,
          message: 'Ya existe una tarea con ese codi',
          statusCode: 409,
          detail: { codi },
          metadata: { controller: 'tareasProfesionales', function: 'grabar' }
        });
      }
    }
    const nuevaTarea = await TareaProfesional.Grabar(req.body);
    res.status(tarea_id ? 200 : 201).json(nuevaTarea);
  } catch (err) {
    next(err);
  }
};

exports.borrar = async (req, res, next) => {
  try {
    const { tarea_id, baja_usuario_id } = req.body;
    if (!tarea_id || !baja_usuario_id) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Faltan datos requeridos: tarea_id, baja_usuario_id',
        statusCode: 400,
        metadata: { controller: 'tareasProfesionales', function: 'borrar' }
      });
    }
    const resultado = await TareaProfesional.Borrar(tarea_id, baja_usuario_id);
    if (!resultado) {
      throw new ApiError({
        code: ERROR_CODES.RESOURCE_NOT_FOUND,
        message: 'La tarea ya fue eliminada o no existe',
        statusCode: 404,
        detail: { tareaId: tarea_id },
        metadata: { controller: 'tareasProfesionales', function: 'borrar' }
      });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
