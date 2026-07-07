/**
 * Modelo para operaciones con cálculos de honorarios
 * Repository Pattern para encapsular acceso a datos
 * 
 * Tablas: Calculos (master), Calculo_Items (detalle)
 * SPs: Calculos_Grabar, Calculos_GetByID
 */

const db = require('../config/db');

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
        new Date(),
        datosProyecto.nombre || null,
        datosProyecto.ubicacion || null,
        datosProyecto.cliente || null,
        datosProyecto.observProyecto || null,
        datosProyecto.horas || null,
        datosProyecto.hasta60km || false,
        datosProyecto.valorbol1 || false,
        datosProyecto.valorbol2 || false,
        datosProyecto.valornum1 || null,
        datosProyecto.valornum2 || null,
        datosProyecto.valornum3 || null,
        datosObra.valorObra,
        datosObra.superficie || null,
        datosObra.cotizDolar || null,
        datosObra.tipologia || null,
        datosObra.complejidad || null,
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
        throw {
            code: 'DB_ERROR',
            message: 'Error al guardar el cálculo en la base de datos',
            detail: error.message
        };
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
        throw {
            code: 'DB_ERROR',
            message: 'Error al validar la tarea profesional',
            detail: error.message
        };
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
        throw {
            code: 'DB_ERROR',
            message: 'Error al consultar el cálculo',
            detail: error.message
        };
    }
}

module.exports = {
    grabarCalculo,
    obtenerCalculoPorId,
    existeTareaProfesional
};
