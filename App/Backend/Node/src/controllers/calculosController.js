const calculoModel = require('../models/calculo');

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

function obtenerMensajeError(error, fallback) {
    if (!error) {
        return fallback;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error.message) {
        return error.message;
    }

    return fallback;
}

exports.calcular = async (req, res) => {
    try {
        const { tareaId, datosObra, tareasProfesionales , tareaCodi } = req.body || {};

        const tareaIdInt = Number(tareaId);
        if (!esEnteroPositivo(tareaIdInt)) {
            return res.status(400).json({
                success: false,
                error: 'tareaId es requerido y debe ser un número entero positivo',
                version: '1.0'
            });
        }

        const tareaExiste = await calculoModel.existeTareaProfesional(tareaIdInt);
        if (!tareaExiste) {
            return res.status(400).json({
                success: false,
                error: 'tareaId no existe en Tareas_Profesionales',
                version: '1.0'
            });
        }

        if (tareaCodi === 'PYDOA') {
        
            if (!datosObra || typeof datosObra !== 'object' || !esNumeroPositivo(datosObra.valorObra)) {
                return res.status(400).json({
                    success: false,
                    error: 'datosObra.valorObra es requerido y debe ser un número mayor a 0',
                    version: '1.0'
                });
            }

            if (!hayAlMenosUnaTareaSeleccionada(tareasProfesionales)) {
                return res.status(400).json({
                    success: false,
                    error: 'tareasProfesionales debe incluir al menos una tarea en true',
                    version: '1.0'
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
            return res.status(500).json({
                success: false,
                error: 'El cálculo fue grabado pero no se pudo recuperar el detalle',
                version: '1.0'
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
        const statusCode = error?.code === 'DB_ERROR' ? 500 : 500;
        const mensaje = obtenerMensajeError(error, 'Error interno al calcular honorarios');

        console.error('Error en honorariosController.calcular:', error?.detail || error?.message || error);

        return res.status(statusCode).json({
            success: false,
            error: mensaje,
            version: '1.0'
        });
    }
};

exports.obtenerItems = async (req, res) => {
    try {
        const calculoId = normalizarCalculoId(req.params?.calculoId);

        if (!calculoId) {
            return res.status(400).json({
                success: false,
                error: 'calculoId debe ser un número entero positivo',
                version: '1.0'
            });
        }

        const calculo = await calculoModel.obtenerCalculoPorId(calculoId);

        if (!calculo) {
            return res.status(404).json({
                success: false,
                error: 'Cálculo no encontrado',
                version: '1.0'
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
        const statusCode = error?.code === 'DB_ERROR' ? 500 : 500;
        const mensaje = obtenerMensajeError(error, 'Error interno al obtener el cálculo');

        console.error('Error en honorariosController.obtenerItems:', error?.detail || error?.message || error);

        return res.status(statusCode).json({
            success: false,
            error: mensaje,
            version: '1.0'
        });
    }
};

/**
 * Exportar certificado PDF con Puppeteer
 * POST /api/calculos/exportar-pdf
 * SPEC: SPEC010-CALC-Entregables (T010-003)
 */
exports.exportarPdf = async (req, res) => {
    const pdfService = require('../services/pdfService');
    const startTime = Date.now();
    
    try {
        const { tipoCalculo, formData, calculationResult } = req.body;

        // Validación de payload
        if (!formData || !calculationResult) {
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos: se requiere formData y calculationResult',
                version: '1.0'
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
        const mensaje = obtenerMensajeError(error, 'Error generando el certificado PDF');
        console.error('[PDF] Error generando certificado:', error?.message || error);
        
        return res.status(500).json({
            success: false,
            error: mensaje,
            details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
            version: '1.0'
        });
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
exports.guardarExperiencia = async (req, res) => {
    try {
        // 1. Validar y normalizar calculoId
        const calculoId = normalizarCalculoId(req.params?.calculoId);
        if (!calculoId) {
            return res.status(400).json({
                success: false,
                error: 'calculoId debe ser un número entero positivo',
                version: '1.0'
            });
        }

        // 2. Validar puntaje
        const { puntaje, observaciones } = req.body || {};
        
        if (!puntaje || !Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
            return res.status(400).json({
                success: false,
                error: 'puntaje es requerido y debe ser un número entero entre 1 y 5',
                version: '1.0'
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
            return res.status(404).json({
                success: false,
                error: 'Cálculo no encontrado',
                version: '1.0'
            });
        }

        // 5. Guardar experiencia
        await calculoModel.guardarExperiencia(calculoId, puntaje, observacionesFinal);

        // 6. Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Experiencia guardada correctamente',
            data: {
                calculoId,
                puntaje,
                observaciones: observacionesFinal
            },
            version: '1.0'
        });

    } catch (error) {
        const mensaje = obtenerMensajeError(error, 'Error interno al guardar la experiencia');
        console.error('Error en calculosController.guardarExperiencia:', error?.detail || error?.message || error);

        return res.status(500).json({
            success: false,
            error: mensaje,
            version: '1.0'
        });
    }
};
