/**
 * Handler para cálculo de honorarios
 * Endpoint: POST /api/v1/honorarios/calcular
 */

import { calcularHonorariosService } from '../services/honorarios.service.js';

/**
 * Handler HTTP para cálculo de honorarios
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next middleware
 */
export async function calcularHonorariosHandler(req, res, next) {
  try {
    // Validar método
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Método no permitido',
        details: {
          message: 'Solo se permiten peticiones POST',
          code: 'METHOD_NOT_ALLOWED'
        },
        version: '1.0'
      });
    }

    // Extraer datos del request
    const {
      tipoCalculo,
      datosProyecto,
      datosObra,
      tareasProfesionales,
      parametros
    } = req.body;

    // ========================================================================
    // VALIDACIONES
    // ========================================================================

    // Validar que existan datos de obra
    if (!datosObra) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido faltante',
        details: {
          field: 'datosObra',
          message: 'Los datos de la obra son requeridos',
          code: 'MISSING_REQUIRED_FIELD'
        },
        version: '1.0'
      });
    }

    // Validar valor de obra
    if (!datosObra.valorObra || datosObra.valorObra <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: {
          field: 'datosObra.valorObra',
          message: 'El valor de obra debe ser mayor a 0',
          code: 'INVALID_VALUE'
        },
        version: '1.0'
      });
    }

    // Validar que existan tareas profesionales
    if (!tareasProfesionales) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido faltante',
        details: {
          field: 'tareasProfesionales',
          message: 'Debe especificar las tareas profesionales',
          code: 'MISSING_REQUIRED_FIELD'
        },
        version: '1.0'
      });
    }

    // Validar que al menos una tarea esté seleccionada
    const tareasSeleccionadas = Object.values(tareasProfesionales).some(
      tarea => tarea === true
    );
    
    if (!tareasSeleccionadas) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: {
          field: 'tareasProfesionales',
          message: 'Debe seleccionar al menos una tarea profesional',
          code: 'NO_TASKS_SELECTED'
        },
        version: '1.0'
      });
    }

    // Validar tipo de cálculo
    if (tipoCalculo && tipoCalculo !== 'basico') {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: {
          field: 'tipoCalculo',
          message: `Tipo de cálculo '${tipoCalculo}' no soportado`,
          code: 'INVALID_TIPO_CALCULO'
        },
        version: '1.0'
      });
    }

    // ========================================================================
    // EJECUTAR SERVICIO
    // ========================================================================

    const resultado = await calcularHonorariosService({
      tipoCalculo: tipoCalculo || 'basico',
      datosProyecto,
      datosObra,
      tareasProfesionales,
      parametros
    });

    // ========================================================================
    // RESPONSE
    // ========================================================================

    res.status(200).json({
      success: true,
      data: resultado,
      version: '1.0'
    });

  } catch (error) {
    // Pasar al error handler middleware
    next(error);
  }
}
