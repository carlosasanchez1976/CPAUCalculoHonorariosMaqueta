// calculosController.js
// SPEC030: Manejo de errores robusto con ApiError
const calculoModel = require('../models/calculo');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

function esNumeroPositivo(valor) {
    return typeof valor === 'number' && Number.isFinite(valor) && valor > 0;
}

function esEnteroPositivo(valor) {
    return Number.isInteger(valor) && valor > 0;
}

function hayAlMenosUnaTareaSeleccionada(tareasProfesionales) {
    if (!tareasProfesionales || typeof tareasProfesionales !== 'object') {
        return false;
    }

    return Object.values(tareasProfesionales).some((valor) => valor === true);
}

function normalizarCalculoId(valor) {
    const calculoId = Number(valor);

    if (!esEnteroPositivo(calculoId)) {
        return null;
    }

    return calculoId;
}

// SPEC030: Eliminada función obtenerMensajeError - ya no es necesaria con ApiError

exports.calcular = async (req, res, next) => {
    try {
        const { tareaId, datosObra, tareasProfesionales , tareaCodi } = req.body || {};

        const tareaIdInt = Number(tareaId);
        if (!esEnteroPositivo(tareaIdInt)) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'tareaId es requerido y debe ser un número entero positivo',
                statusCode: 400,
                metadata: { controller: 'calculos', function: 'calcular' }
            });
        }

        const tareaExiste = await calculoModel.existeTareaProfesional(tareaIdInt);
        if (!tareaExiste) {
            throw new ApiError({
                code: ERROR_CODES.RESOURCE_NOT_FOUND,
                message: 'tareaId no existe en Tareas_Profesionales',
                statusCode: 404,
                detail: { tareaId: tareaIdInt },
                metadata: { controller: 'calculos', function: 'calcular' }
            });
        }

        if (tareaCodi === 'PYDOA') {
        
            if (!datosObra || typeof datosObra !== 'object' || !esNumeroPositivo(datosObra.valorObra)) {
                throw new ApiError({
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'datosObra.valorObra es requerido y debe ser un número mayor a 0',
                    statusCode: 400,
                    metadata: { controller: 'calculos', function: 'calcular' }
                });
            }

            if (!hayAlMenosUnaTareaSeleccionada(tareasProfesionales)) {
                throw new ApiError({
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'tareasProfesionales debe incluir al menos una tarea en true',
                    statusCode: 400,
                    metadata: { controller: 'calculos', function: 'calcular' }
                });
            }
        }
        
        const payload = {
            ...req.body,
            tareaId: tareaIdInt,
            usuarioId: req.usuario?.id || req.body?.usuarioId || 1
        };

        const resultado = await calculoModel.grabarCalculo(payload);
        const calculo = await calculoModel.obtenerCalculoPorId(resultado.calculoId);

        if (!calculo) {
            throw new ApiError({
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'El cálculo fue grabado pero no se pudo recuperar el detalle',
                statusCode: 500,
                detail: { calculoId: resultado.calculoId },
                metadata: { controller: 'calculos', function: 'calcular' }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                calculoId: resultado.calculoId,
                status: resultado.status,
                totalHonorarios: Number(calculo.total_honorarios),
                metadata: {
                    rango: calculo.metadata_rango,
                    numeroItems: calculo.metadata_numero_items,
                    fechaCalculo: calculo.fecha_calculo,
                    proyectoNombre: calculo.proyecto_nombre,
                    proyectoUbicacion: calculo.proyecto_ubicacion,
                    valorObra: calculo.obra_valor_obra
                },
                detalleHonorarios: calculo.detalleHonorarios
            },
            version: '1.0'
        });
    } catch (error) {
        next(error);
    }
};

exports.obtenerItems = async (req, res, next) => {
    try {
        const calculoId = normalizarCalculoId(req.params?.calculoId);

        if (!calculoId) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'calculoId debe ser un número entero positivo',
                statusCode: 400,
                metadata: { controller: 'calculos', function: 'obtenerItems' }
            });
        }

        const calculo = await calculoModel.obtenerCalculoPorId(calculoId);

        if (!calculo) {
            throw new ApiError({
                code: ERROR_CODES.RESOURCE_NOT_FOUND,
                message: 'Cálculo no encontrado',
                statusCode: 404,
                detail: { calculoId },
                metadata: { controller: 'calculos', function: 'obtenerItems' }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                calculoId: calculo.calculo_id,
                totalHonorarios: Number(calculo.total_honorarios),
                metadata: {
                    rango: calculo.metadata_rango,
                    numeroItems: calculo.metadata_numero_items,
                    fechaCalculo: calculo.fecha_calculo,
                    proyectoNombre: calculo.proyecto_nombre,
                    proyectoUbicacion: calculo.proyecto_ubicacion,
                    valorObra: calculo.obra_valor_obra
                },
                detalleHonorarios: calculo.detalleHonorarios
            },
            version: '1.0'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Exportar certificado PDF con Puppeteer
 * POST /api/calculos/exportar-pdf
 * SPEC: SPEC010-CALC-Entregables (T010-003)
 */
exports.exportarPdf = async (req, res, next) => {
    const pdfService = require('../services/pdfService');
    const startTime = Date.now();
    
    try {
        const { tipoCalculo, formData, calculationResult } = req.body;

        // Validación de payload
        if (!formData || !calculationResult) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Datos incompletos: se requiere formData y calculationResult',
                statusCode: 400,
                metadata: { controller: 'calculos', function: 'exportarPdf' }
            });
        }

        // Generar PDF
        const pdfBuffer = await pdfService.generarCertificado({
            tipoCalculo,
            formData,
            calculationResult
        });

        const duration = Date.now() - startTime;
        console.log(`[PDF] Generado en ${duration}ms, tamaño: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

        // Generar nombre de archivo desde formData.calculoId
        const calculoIdStr = formData.calculoId 
            ? String(formData.calculoId).padStart(6, '0')
            : '000000';

        // Responder con PDF binario
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Honorarios-CPAU-${calculoIdStr}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        return res.send(pdfBuffer);

    } catch (error) {
        next(error);
    }
};

/**
 * Guarda la experiencia del usuario sobre un cálculo
 * POST /api/calculos/:calculoId/experiencia
 * SPEC: SPEC025-CALC-Grabar experiencia de usuario
 * 
 * @param {Object} req.params.calculoId - ID del cálculo
 * @param {Object} req.body.puntaje - Valoración de 1 a 5
 * @param {Object} req.body.observaciones - Comentarios opcionales
 */
exports.guardarExperiencia = async (req, res, next) => {
    try {
        // 1. Validar y normalizar calculoId
        const calculoId = normalizarCalculoId(req.params?.calculoId);
        if (!calculoId) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'calculoId debe ser un número entero positivo',
                statusCode: 400,
                metadata: { controller: 'calculos', function: 'guardarExperiencia' }
            });
        }

        // 2. Validar puntaje
        const { puntaje, observaciones } = req.body || {};
        
        if (!puntaje || !Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'puntaje es requerido y debe ser un número entero entre 1 y 5',
                statusCode: 400,
                metadata: { controller: 'calculos', function: 'guardarExperiencia' }
            });
        }

        // 3. Normalizar observaciones (truncar a 255 y trim)
        let observacionesFinal = null;
        if (observaciones !== null && observaciones !== undefined) {
            const observStr = String(observaciones).trim();
            observacionesFinal = observStr.length > 0 ? observStr.substring(0, 255) : null;
        }

        // 4. Verificar que el cálculo existe
        const calculo = await calculoModel.obtenerCalculoPorId(calculoId);
        if (!calculo) {
            throw new ApiError({
                code: ERROR_CODES.RESOURCE_NOT_FOUND,
                message: 'Cálculo no encontrado',
                statusCode: 404,
                detail: { calculoId },
                metadata: { controller: 'calculos', function: 'guardarExperiencia' }
            });
        }

        // 5. Guardar experiencia
        await calculoModel.guardarExperiencia(calculoId, puntaje, observacionesFinal);

        // 6. Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Experiencia guardada correctamente'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Obtiene métricas agregadas para el dashboard de administración
 * GET /api/calculos/dashboard
 * SPEC: SPEC027-CALC-Dashboard
 * 
 * Query params:
 * @param {string} [req.query.fechaDesde] - Fecha inicio en formato ISO 8601 (YYYY-MM-DD)
 * @param {string} [req.query.fechaHasta] - Fecha fin en formato ISO 8601 (YYYY-MM-DD)
 * 
 * Comportamiento por defecto:
 * - Sin params → últimos 30 días
 * - Solo fechaDesde → desde esa fecha hasta hoy
 * - Solo fechaHasta → desde 30 días antes hasta fechaHasta
 */
exports.getDashboard = async (req, res, next) => {
    try {
        // 1. Extraer query params
        const { fechaDesde, fechaHasta } = req.query || {};
        
        // 2. Validar formato de fechas (si se proveen)
        const regexISO8601 = /^\d{4}-\d{2}-\d{2}$/;
        
        if (fechaDesde !== undefined && fechaDesde !== null && fechaDesde !== '') {
            if (!regexISO8601.test(fechaDesde)) {
                throw new ApiError({
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Formato de fecha inválido. Use YYYY-MM-DD',
                    statusCode: 400,
                    detail: `fechaDesde: "${fechaDesde}" no cumple formato ISO 8601`,
                    metadata: { controller: 'calculos', function: 'getDashboard' }
                });
            }
        }
        
        if (fechaHasta !== undefined && fechaHasta !== null && fechaHasta !== '') {
            if (!regexISO8601.test(fechaHasta)) {
                throw new ApiError({
                    code: ERROR_CODES.VALIDATION_ERROR,
                    message: 'Formato de fecha inválido. Use YYYY-MM-DD',
                    statusCode: 400,
                    detail: `fechaHasta: "${fechaHasta}" no cumple formato ISO 8601`,
                    metadata: { controller: 'calculos', function: 'getDashboard' }
                });
            }
        }
        
        // 3. Normalizar valores vacíos a null
        const fechaDesdeNorm = fechaDesde && fechaDesde.trim() !== '' ? fechaDesde.trim() : null;
        const fechaHastaNorm = fechaHasta && fechaHasta.trim() !== '' ? fechaHasta.trim() : null;
        
        // 4. Llamar al modelo (las validaciones de negocio están allí)
        const dashboardData = await calculoModel.getDashboard(fechaDesdeNorm, fechaHastaNorm);
        
        // 5. Logging de acceso exitoso
        const periodo = `${dashboardData.periodo.desde} → ${dashboardData.periodo.hasta}`;
        console.log(`📊 [Controller] Dashboard generado exitosamente: ${periodo}`);
        
        // 6. Respuesta exitosa
        return res.status(200).json({
            success: true,
            data: dashboardData,
            version: '1.0'
        });
        
    } catch (error) {
        next(error);
    }
};


/**
 * Lista el detalle de cálculos con experiencia de usuario (puntaje y observaciones)
 * POST /api/calculos/experiencia/listar
 * SPEC: SPEC032-CALC-Experiencia-Listar
 * 
 * Body params:
 * @param {string} [req.body.fechaDesde] - Fecha inicio en formato ISO 8601 (YYYY-MM-DD)
 * @param {string} [req.body.fechaHasta] - Fecha fin en formato ISO 8601 (YYYY-MM-DD)
 * @param {boolean} [req.body.conObservaciones] - Filtrar solo cálculos con observaciones (true/false)
 * 
 */
exports.listarExperiencia = async (req, res, next) => {
    try {
        // 1. Extraer parámetros del body y convertir undefined a null
        const { fechaDesde, fechaHasta, conObservaciones } = req.body || {};
        
        // 2. Llamar al modelo (convertir undefined a null para MySQL)
        const experienciaData = await calculoModel.listarExperiencia(
            fechaDesde ?? null,
            fechaHasta ?? null,
            conObservaciones ?? null
        );
        
        console.log(`📊 [Controller] Experiencia listada exitosamente desde ${fechaDesde} hasta ${fechaHasta} (solo con observaciones: ${conObservaciones})`);

        // 6. Respuesta exitosa
        return res.status(200).json({
            success: true,
            data: experienciaData,
            version: '1.0'
        });
        
    } catch (error) {
        next(error);
    }
};
