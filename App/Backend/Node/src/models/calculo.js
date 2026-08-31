/**
 * Modelo para operaciones con cálculos de honorarios
 * Repository Pattern para encapsular acceso a datos
 * SPEC030: Manejo de errores robusto con ApiError
 * 
 * Tablas: Calculos (master), Calculo_Items (detalle)
 * SPs: Calculos_Grabar, Calculos_GetByID
 */

const db = require('../config/db');
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

function esIntPositivo(valor) {
    return Number.isInteger(valor) && valor > 0;
}

function normalizarIdEntero(calculoId) {
    const calculoIdInt = Number(calculoId);
    if (!esIntPositivo(calculoIdInt)) {
        throw new Error('calculoId debe ser un INT positivo');
    }
    return calculoIdInt;
}

/**
 * Graba un cálculo completo (master + items) en base de datos
 * El SP Calculos_Grabar recibe los datos de entrada y calcula los honorarios internamente
 * 
 * @param {Object} datosCompletos - Request completo del cálculo desde frontend
 * @param {number|null} [datosCompletos.calculoId] - ID del cálculo para actualizar; null/undefined crea uno nuevo
 * @param {number} [datosCompletos.usuarioId] - ID del usuario solicitante (actualmente se fuerza en backend)
 * @param {number} [datosCompletos.tareaId] - ID de la tarea profesional a procesar
 * @param {Object} datosCompletos.datosProyecto - Info del proyecto (opcional)
 * @param {string} datosCompletos.datosProyecto.nombre - Nombre del proyecto
 * @param {string} datosCompletos.datosProyecto.ubicacion - Ubicación del proyecto
 * @param {string} datosCompletos.datosProyecto.cliente - Cliente del proyecto
 * @param {string} datosCompletos.datosProyecto.observProyecto - Observaciones generales sobre el proyecto
 * @param {number} datosCompletos.datosProyecto.horas - Horas del proyecto
 * @param {boolean} datosCompletos.datosProyecto.hasta60km - Indica si el proyecto está dentro de los 60 km del titular
 * @param {Object} datosCompletos.datosObra - Datos de la obra
 * @param {number} datosCompletos.datosObra.valorObra - Valor de la obra
 * @param {number} datosCompletos.datosObra.superficie - Superficie en m²
 * @param {number} datosCompletos.datosObra.cotizDolar - Cotización del dólar
 * @param {string} datosCompletos.datosObra.tipologia - Tipología de la obra
 * @param {string} datosCompletos.datosObra.complejidad - Complejidad de la obra
 * @param {Object} datosCompletos.tareasProfesionales - Tareas seleccionadas
 * @param {boolean} datosCompletos.tareasProfesionales.obraProyecto - Proyecto de obra
 * @param {boolean} datosCompletos.tareasProfesionales.obraDireccion - Dirección de obra
 * @param {boolean} datosCompletos.tareasProfesionales.instalacionSanitaria - Instalación sanitaria
 * @param {boolean} datosCompletos.tareasProfesionales.instalacionElectrica - Instalación eléctrica
 * @param {boolean} datosCompletos.tareasProfesionales.instalacionContraIncendio - Instalación contra incendio
 * @param {boolean} datosCompletos.tareasProfesionales.instalacionTermomecanica - Instalación termomecánica
 * @param {boolean} datosCompletos.tareasProfesionales.proyectoEstructuras - Proyecto de estructuras
 * @param {boolean} datosCompletos.tareasProfesionales.documentacionEjecutiva - Documentación ejecutiva
 * @param {boolean} datosCompletos.tareasProfesionales.supervisionObra - Supervisión de obra
 * @param {string} datosCompletos.tareasProfesionales.observTareas - Observaciones generales sobre las tareas
 * 
 * @returns {Promise<Object>} Resultado del SP con status, calculoId y datos calculados
 * @throws {Object} Error estructurado con code, message, detail
 */
async function grabarCalculo(datosCompletos) {
    const {
        datosProyecto = {},
        datosObra,
        tareasProfesionales
    } = datosCompletos;

    // Si no llega usuario autenticado, usar 1 como fallback técnico.
    const usuarioId = Number(datosCompletos.usuarioId) > 0 ? Number(datosCompletos.usuarioId) : 1;

    // Si viene calculoId, el SP actualiza; si no viene, inserta uno nuevo.
    const calculoIdRequest =
        datosCompletos.calculoId === null || datosCompletos.calculoId === undefined
            ? null
            : normalizarIdEntero(datosCompletos.calculoId);



    // Firma mandatoria del backend (Calculos_Grabar)
    const spParamsLegacy = [
        calculoIdRequest,
        usuarioId,
        datosCompletos.tareaId,
        null,  // fecha_calculo: NULL para que MySQL use CURDATE() con timezone Argentina
        datosProyecto.nombre || null,
        datosProyecto.ubicacion || null,
        datosProyecto.cliente || null,
        datosProyecto.observProyecto || null,
        datosProyecto.horas || null,
        datosProyecto.hasta60km || false,
        datosProyecto.valorbol1 || false,
        datosProyecto.valorbol2 || false,
        datosProyecto.valorbol3 || false,
        datosProyecto.valorbol4 || false,
        datosProyecto.valorbol5 || false,
        datosProyecto.valornum1 || null,
        datosProyecto.valornum2 || null,
        datosProyecto.valornum3 || null,
        datosProyecto.valornum4 || null,
        datosProyecto.valornum5 || null,
        datosObra.valorObra,
        datosObra.superficie || null,
        datosObra.cotizDolar || null,
        datosObra.tipologia || null,
        datosObra.complejidad || null,
        datosObra.plazoEjecucion || null,
        tareasProfesionales.obraProyecto || false,
        tareasProfesionales.obraDireccion || false,
        tareasProfesionales.instalacionSanitaria || false,
        tareasProfesionales.instalacionElectrica || false,
        tareasProfesionales.instalacionContraIncendio || false,
        tareasProfesionales.instalacionTermomecanica || false,
        tareasProfesionales.proyectoEstructuras || false,
        tareasProfesionales.documentacionEjecutiva || false,
        tareasProfesionales.supervisionObra || false,
        tareasProfesionales.observTareas || null
    ];

    try {
        // Llamar al SP que graba y calcula
        const result = await db.executeStoredProcedure('Calculos_Grabar', spParamsLegacy);

        const spRows = Array.isArray(result?.[0]) ? result[0] : [];
        const spResponse = spRows[0] || {};
        const calculoId = Number(spResponse.calculo_id);

        if (!Number.isInteger(calculoId) || calculoId <= 0) {
            throw new Error('SP no retornó un calculo_id INT válido');
        }

        console.log('✅ [Model] Cálculo grabado exitosamente:', calculoId);

        return {
            success: true,
            calculoId,
            status: spResponse?.status || 'OK',
            message: 'Cálculo guardado y procesado correctamente'
        };
    } catch (error) {
        console.error('❌ [Model] Error al grabar cálculo:', error.message);
        
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'calculo.grabarCalculo');
            throw error;
        }
        
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al guardar el cálculo en la base de datos',
            statusCode: 500,
            detail: { originalError: error.message },
            metadata: { module: 'calculo', function: 'grabarCalculo' }
        });
    }
}

/**
 * Verifica si existe una tarea profesional por ID
 *
 * @param {number} tareaId - ID de la tarea a validar
 * @returns {Promise<boolean>} True si existe, false en caso contrario
 */
async function existeTareaProfesional(tareaId) {
    return true; // Temporalmente se asume que todas las tareas profesionales existen. Reemplazar con lógica real si es necesario.
    try {
        const tareaIdInt = normalizarIdEntero(tareaId);
        const rows = await db.executeQuery(
            'SELECT 1 FROM Tareas_Profesionales WHERE tarea_id = ? LIMIT 1',
            [tareaIdInt]
        );

        return Array.isArray(rows) && rows.length > 0;
    } catch (error) {
        console.error('❌ [Model] Error al validar tarea profesional:', error.message);
        
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'calculo.existeTareaProfesional');
            error.addMetadata('tareaId', tareaId);
            throw error;
        }
        
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al validar la tarea profesional',
            statusCode: 500,
            detail: { originalError: error.message, tareaId },
            metadata: { module: 'calculo', function: 'existeTareaProfesional' }
        });
    }
}

/**
 * Obtiene un cálculo completo por ID
 * 
 * @param {number} calculoId - ID del cálculo a buscar
 * @returns {Promise<Object|null>} Datos del cálculo o null si no existe
 * @throws {Object} Error estructurado si falla la query
 */
async function obtenerCalculoPorId(calculoId) {
    try {
        const calculoIdInt = normalizarIdEntero(calculoId);

        const rows = await db.executeStoredProcedure('Calculos_GetByID', [calculoIdInt]);
        const resultset = Array.isArray(rows?.[0]) ? rows[0] : [];

        if (resultset.length === 0) {
            console.log(`ℹ️  [Model] Cálculo no encontrado: ${calculoIdInt}`);
            return null;
        }

        const calculoBase = resultset[0];
        const detalleHonorarios = resultset.map((row) => ({
            calculoItemId: row.calculo_item_id,
            itemNumero: row.item_numero,
            tareaProfesional: row.tarea_profesional,
            descripcion: row.descripcion,
            importe: Number(row.importe),
            createdAt: row.created_at
        }));

        const calculo = {
            calculo_id: calculoBase.calculo_id,
            usuario_id: calculoBase.usuario_id,
            fecha_calculo: calculoBase.fecha_calculo,
            proyecto_nombre: calculoBase.proyecto_nombre,
            proyecto_ubicacion: calculoBase.proyecto_ubicacion,
            obra_valor_obra: calculoBase.obra_valor_obra,
            total_honorarios: Number(calculoBase.total_honorarios),
            metadata_rango: calculoBase.metadata_rango,
            metadata_numero_items: detalleHonorarios.length,
            detalleHonorarios
        };

        console.log(`✅ [Model] Cálculo recuperado: ${calculoIdInt}`);
        return calculo;
    } catch (error) {
        console.error('❌ [Model] Error al obtener cálculo:', error.message);
        
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'calculo.obtenerCalculoPorId');
            error.addMetadata('calculoId', calculoId);
            throw error;
        }
        
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al consultar el cálculo',
            statusCode: 500,
            detail: { originalError: error.message, calculoId },
            metadata: { module: 'calculo', function: 'obtenerCalculoPorId' }
        });
    }
}

/**
 * Guarda la experiencia del usuario sobre un cálculo
 * 
 * @param {number} calculoId - ID del cálculo
 * @param {number} puntaje - Valoración de 1 a 5
 * @param {string|null} observaciones - Comentarios del usuario (máx. 255 chars)
 * @returns {Promise<void>}
 * @throws {Object} Error estructurado con code, message, detail
 */
async function guardarExperiencia(calculoId, puntaje, observaciones) {
    try {
        const calculoIdInt = normalizarIdEntero(calculoId);
        
        await db.executeStoredProcedure('Calculo_Experiencia_Grabar', [
            calculoIdInt,
            puntaje,
            observaciones
        ]);

        console.log(`✅ [Model] Experiencia guardada para cálculo ${calculoIdInt}: ${puntaje} estrellas`);
        
    } catch (error) {
        console.error('❌ [Model] Error al guardar experiencia:', error.message);
        
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'calculo.guardarExperiencia');
            error.addMetadata('calculoId', calculoId);
            throw error;
        }
        
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al guardar la experiencia en la base de datos',
            statusCode: 500,
            detail: { originalError: error.message, calculoId },
            metadata: { module: 'calculo', function: 'guardarExperiencia' }
        });
    }
}

/**
 * Obtiene métricas agregadas para el dashboard de administración
 * SPEC-027: Dashboard de Métricas de Cálculos
 * 
 * @param {string|null} fechaDesde - Fecha inicio en formato ISO 8601 (YYYY-MM-DD) o null
 * @param {string|null} fechaHasta - Fecha fin en formato ISO 8601 (YYYY-MM-DD) o null
 * @returns {Promise<Object>} Objeto con todas las métricas del dashboard
 * @throws {Object} Error estructurado con code, message, detail
 */
async function getDashboard(fechaDesde, fechaHasta) {
    try {
        // ====================================================================
        // 1. APLICAR DEFAULTS Y VALIDACIONES
        // ====================================================================
        
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
        
        let desde = null;
        let hasta = null;
        
        // Comportamiento por defecto según SPEC
        if (!fechaDesde && !fechaHasta) {
            // Sin parámetros → últimos 30 días
            hasta = new Date(hoy);
            desde = new Date(hoy);
            desde.setDate(desde.getDate() - 30);
        } else if (fechaDesde && !fechaHasta) {
            // Solo fechaDesde → desde esa fecha hasta hoy
            desde = new Date(fechaDesde);
            hasta = new Date(hoy);
        } else if (!fechaDesde && fechaHasta) {
            // Solo fechaHasta → desde 30 días antes hasta fechaHasta
            hasta = new Date(fechaHasta);
            desde = new Date(hasta);
            desde.setDate(desde.getDate() - 30);
        } else {
            // Ambas fechas provistas
            desde = new Date(fechaDesde);
            hasta = new Date(fechaHasta);
        }
        
        // Validar que las fechas sean válidas
        if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Formato de fecha inválido. Use YYYY-MM-DD',
                statusCode: 400,
                detail: 'Las fechas deben estar en formato ISO 8601',
                metadata: { module: 'calculo', function: 'getDashboard' }
            });
        }
        
        // Validar que fechaHasta no sea mayor a hoy
        if (hasta > hoy) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'fechaHasta no puede ser mayor a la fecha actual',
                statusCode: 400,
                detail: `fechaHasta: ${hasta.toISOString().split('T')[0]}, hoy: ${hoy.toISOString().split('T')[0]}`,
                metadata: { module: 'calculo', function: 'getDashboard' }
            });
        }
        
        // Validar que fechaDesde no sea mayor a fechaHasta
        if (desde > hasta) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'fechaDesde no puede ser mayor a fechaHasta',
                statusCode: 400,
                detail: `fechaDesde: ${desde.toISOString().split('T')[0]}, fechaHasta: ${hasta.toISOString().split('T')[0]}`,
                metadata: { module: 'calculo', function: 'getDashboard' }
            });
        }
        
        // Validar rango máximo de 1 año
        const unAnioEnMs = 365 * 24 * 60 * 60 * 1000;
        const rangoMs = hasta - desde;
        if (rangoMs > unAnioEnMs) {
            throw new ApiError({
                code: ERROR_CODES.VALIDATION_ERROR,
                message: 'Rango de fechas excede el máximo permitido de 1 año',
                statusCode: 400,
                detail: `Rango solicitado: ${Math.ceil(rangoMs / (24 * 60 * 60 * 1000))} días`,
                metadata: { module: 'calculo', function: 'getDashboard' }
            });
        }
        
        // Convertir a formato MySQL (YYYY-MM-DD)
        const fechaDesdeSQL = desde.toISOString().split('T')[0];
        const fechaHastaSQL = hasta.toISOString().split('T')[0];
        
        console.log(`📊 [Model] Generando dashboard: ${fechaDesdeSQL} → ${fechaHastaSQL}`);
        
        // ====================================================================
        // 2. LLAMAR AL STORED PROCEDURE
        // ====================================================================
        
        const result = await db.executeStoredProcedure('Calculos_Dashboard', [
            fechaDesdeSQL,
            fechaHastaSQL
        ]);
        
        // El SP retorna 7 resultsets
        if (!Array.isArray(result) || result.length < 7) {
            throw new Error('SP Calculos_Dashboard no retornó los 7 resultsets esperados');
        }
        
        const [
            resumenRows,
            serieTemporalRows,
            distribucionTareasRows,
            topUsuariosRows,
            distribucionPuntajesRows,
            placeholder1Rows,
            placeholder2Rows
        ] = result;
        
        // ====================================================================
        // 3. PARSEAR RESULTSET 1: RESUMEN GENERAL
        // ====================================================================
        
        const resumenRaw = Array.isArray(resumenRows) && resumenRows.length > 0
            ? resumenRows[0]
            : {};
        
        const resumen = {
            totalUsuariosNuevos: Number(resumenRaw.totalUsuariosNuevos) || 0,
            totalCalculosNuevos: Number(resumenRaw.totalCalculosNuevos) || 0,
            totalCalculosConPuntaje: Number(resumenRaw.totalCalculosConPuntaje) || 0,
            totalCalculosConComentarios: Number(resumenRaw.totalCalculosConComentarios) || 0,
            promedioPuntaje: resumenRaw.promedioPuntaje !== null && resumenRaw.promedioPuntaje !== undefined
                ? Number(parseFloat(resumenRaw.promedioPuntaje).toFixed(1))
                : null,
            usuariosActivos: Number(resumenRaw.usuariosActivos) || 0
        };
        
        // ====================================================================
        // 4. PARSEAR RESULTSET 2: SERIE TEMPORAL
        // ====================================================================
        
        const serieTemporal = Array.isArray(serieTemporalRows)
            ? serieTemporalRows.map(row => ({
                fecha: row.fecha instanceof Date
                    ? row.fecha.toISOString().split('T')[0]
                    : row.fecha,
                usuariosNuevos: Number(row.usuariosNuevos) || 0,
                calculosNuevos: Number(row.calculosNuevos) || 0
            }))
            : [];
        
        // ====================================================================
        // 5. PARSEAR RESULTSET 3: DISTRIBUCIÓN POR TAREAS
        // ====================================================================
        
        const totalCalculosDistribucion = Array.isArray(distribucionTareasRows)
            ? distribucionTareasRows.reduce((sum, row) => sum + (Number(row.totalCalculos) || 0), 0)
            : 0;
        
        const distribucionTareas = Array.isArray(distribucionTareasRows)
            ? distribucionTareasRows.map(row => {
                const totalCalculos = Number(row.totalCalculos) || 0;
                const porcentaje = totalCalculosDistribucion > 0
                    ? parseFloat(((totalCalculos / totalCalculosDistribucion) * 100).toFixed(1))
                    : 0;
                
                return {
                    tareaCodigo: row.tareaCodigo || '',
                    tareaDescripcion: row.tareaDescripcion || '',
                    totalCalculos,
                    porcentaje
                };
            })
            : [];
        
        // ====================================================================
        // 6. PARSEAR RESULTSET 4: TOP USUARIOS
        // ====================================================================
        
        const topUsuarios = Array.isArray(topUsuariosRows)
            ? topUsuariosRows.slice(0, 5).map(row => ({
                usuarioId: Number(row.usuarioId) || 0,
                nombreCompleto: row.nombreCompleto || '',
                email: row.email || '',
                totalCalculos: Number(row.totalCalculos) || 0,
                ultimaActividad: row.ultimaActividad instanceof Date
                    ? row.ultimaActividad.toISOString()
                    : row.ultimaActividad
            }))
            : [];
        
        // ====================================================================
        // 7. PARSEAR RESULTSET 5: DISTRIBUCIÓN DE PUNTAJES
        // ====================================================================
        
        const distribucionPuntajes = Array.isArray(distribucionPuntajesRows)
            ? distribucionPuntajesRows.map(row => ({
                puntaje: Number(row.puntaje) || 0,
                cantidad: Number(row.cantidad) || 0
            }))
            : [];
        
        // ====================================================================
        // 8. ESTRUCTURAR RESPONSE FINAL
        // ====================================================================
        
        const dashboardData = {
            periodo: {
                desde: fechaDesdeSQL,
                hasta: fechaHastaSQL
            },
            resumen,
            serieTemporal,
            distribucionTareas,
            topUsuarios,
            distribucionPuntajes
        };
        
        console.log(`✅ [Model] Dashboard generado exitosamente (${serieTemporal.length} días, ${distribucionTareas.length} tareas)`);
        
        return dashboardData;
        
    } catch (error) {
        // Si ya es ApiError (validación o DB), enriquecer y propagar
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'calculo.getDashboard');
            throw error;
        }
        
        // Si es un error estructurado legacy (por compatibilidad temporal)
        if (error.code) {
            throw new ApiError({
                code: error.code === 'VALIDATION_ERROR' ? ERROR_CODES.VALIDATION_ERROR : ERROR_CODES.DB_ERROR,
                message: error.message || 'Error al generar el dashboard',
                statusCode: error.code === 'VALIDATION_ERROR' ? 400 : 500,
                detail: error.detail || { originalError: error.message },
                metadata: { module: 'calculo', function: 'getDashboard' }
            });
        }
        
        // Error inesperado
        console.error('❌ [Model] Error al generar dashboard:', error.message);
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al generar el dashboard',
            statusCode: 500,
            detail: { originalError: error.message },
            metadata: { module: 'calculo', function: 'getDashboard' }
        });
    }
}

/**
 * Lista la experiencia del usuario sobre un cálculo en base a fechas desde - hasta y si se requieren solo con observaciones
 * 
 * @param {date} fechaDesde
 * @param {date} fechaHasta
 * @param {boolean|null} soloConObservaciones - Indica si se requieren solo las experiencias con observaciones
 * @returns {Promise<void>}
 * @throws {Object} Error estructurado con code, message, detail
 */
async function listarExperiencia(fechaDesde, fechaHasta, soloConObservaciones) {
    try {
        
        const result = await db.executeStoredProcedure('Calculo_Experiencia_Listar', [
            fechaDesde,
            fechaHasta,
            soloConObservaciones
        ]);

        console.log(`✅ [Model] Experiencia listada desde ${fechaDesde} hasta ${fechaHasta} (solo con observaciones: ${soloConObservaciones})`);
        
        // Retornar el primer resultset del SP (patrón estándar)
        const [rows] = result;
        return Array.isArray(rows) ? rows : [];
        
    } catch (error) {
        console.error('❌ [Model] Error al listar experiencia:', error.message);
        
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'calculo.listarExperiencia');
            error.addMetadata('fechaDesde', fechaDesde);
            error.addMetadata('fechaHasta', fechaHasta);
            throw error;
        }
        
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al listar la experiencia en la base de datos',
            statusCode: 500,
            detail: { originalError: error.message, calculoId },
            metadata: { module: 'calculo', function: 'listarExperiencia' }
        });
    }
}


module.exports = {
    grabarCalculo,
    obtenerCalculoPorId,
    existeTareaProfesional,
    guardarExperiencia,
    listarExperiencia,
    getDashboard
};
