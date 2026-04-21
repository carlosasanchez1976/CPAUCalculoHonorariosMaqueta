/**
 * Modelo para operaciones con cálculos de honorarios
 * Repository Pattern para encapsular acceso a datos
 * 
 * Tablas: Calc_Maq (master), Calc_Maq_Items (detalle)
 * SPs: Calc_Maq_Grabar, Calc_Maq_Listar_Calculo_Items
 */

const db = require('../config/db');

/**
 * Graba un cálculo completo (master + items) en base de datos
 * El SP Calc_Maq_Grabar recibe los datos de entrada y calcula los honorarios internamente
 * 
 * @param {Object} datosCompletos - Request completo del cálculo desde frontend
 * @param {string} datosCompletos.tipoCalculo - Tipo de cálculo (ej: 'basico')
 * @param {Object} datosCompletos.datosProyecto - Info del proyecto (opcional)
 * @param {string} datosCompletos.datosProyecto.nombre - Nombre del proyecto
 * @param {string} datosCompletos.datosProyecto.ubicacion - Ubicación del proyecto
 * @param {string} datosCompletos.datosProyecto.cliente - Cliente del proyecto
 * @param {Object} datosCompletos.datosObra - Datos de la obra
 * @param {number} datosCompletos.datosObra.valorObra - Valor de la obra
 * @param {number} datosCompletos.datosObra.superficie - Superficie en m²
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
 * 
 * @returns {Promise<Object>} Resultado del SP con status, calculoId y datos calculados
 * @throws {Object} Error estructurado con code, message, detail
 */
async function grabarCalculo(datosCompletos) {
    const {
        tipoCalculo,
        datosProyecto = {},
        datosObra,
        tareasProfesionales
    } = datosCompletos;

    // Generar ID único para el cálculo
    const calculoId = `CALC-${Date.now()}`;
    const fechaCalculo = new Date();

    // Preparar parámetros para SP Calc_Maq_Grabar (18 parámetros)
    // El SP calculará los honorarios internamente
    const spParams = [
        // Identificación (4 parámetros)
        calculoId,
        1,  // usuario_id hardcoded por ahora (sin autenticación)
        tipoCalculo,
        fechaCalculo,

        // Datos Proyecto (3 parámetros - opcionales)
        datosProyecto.nombre || null,
        datosProyecto.ubicacion || null,
        datosProyecto.cliente || null,

        // Datos Obra (4 parámetros)
        datosObra.valorObra,
        datosObra.superficie || null,
        datosObra.tipologia || null,
        datosObra.complejidad || null,

        // Tareas Profesionales (7 booleans)
        tareasProfesionales.obraProyecto || false,
        tareasProfesionales.obraDireccion || false,
        tareasProfesionales.instalacionSanitaria || false,
        tareasProfesionales.instalacionElectrica || false,
        tareasProfesionales.instalacionContraIncendio || false,
        tareasProfesionales.instalacionTermomecanica || false,
        tareasProfesionales.proyectoEstructuras || false
    ];

    try {
        // Llamar al SP que graba y calcula
        const result = await db.executeStoredProcedure('Calc_Maq_Grabar', spParams);

        console.log('✅ [Model] Cálculo grabado exitosamente:', calculoId);

        // El SP retorna: SELECT 'OK' AS status, p_calculo_id AS calculo_id
        const spResponse = result[0] && result[0][0];

        return {
            success: true,
            calculoId: spResponse?.calculo_id || calculoId,
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
 * Obtiene un cálculo completo por ID
 * 
 * @param {string} calculoId - ID del cálculo a buscar
 * @returns {Promise<Object|null>} Datos del cálculo o null si no existe
 * @throws {Object} Error estructurado si falla la query
 */
async function obtenerCalculoPorId(calculoId) {
    try {
        const sql = 'SELECT * FROM Calc_Maq WHERE calculo_id = ?';
        const rows = await db.executeQuery(sql, [calculoId]);

        if (rows.length === 0) {
            console.log(`ℹ️  [Model] Cálculo no encontrado: ${calculoId}`);
            return null;
        }

        console.log(`✅ [Model] Cálculo recuperado: ${calculoId}`);
        return rows[0];
    } catch (error) {
        console.error('❌ [Model] Error al obtener cálculo:', error.message);
        throw {
            code: 'DB_ERROR',
            message: 'Error al consultar el cálculo',
            detail: error.message
        };
    }
}

/**
 * Lista los items de un cálculo específico con información del master
 * Usa el SP Calc_Maq_Listar_Calculo_Items que hace JOIN entre tablas
 * 
 * @param {string} calculoId - ID del cálculo
 * @returns {Promise<Array>} Items del cálculo con info del master (total, rango, fecha, etc)
 * @throws {Object} Error estructurado si falla la consulta
 */
async function listarItemsCalculo(calculoId) {
    try {
        const result = await db.executeStoredProcedure(
            'Calc_Maq_Listar_Calculo_Items',
            [calculoId]
        );

        // El SP retorna un array de resultsets, tomamos el primero
        const items = result[0] || [];

        console.log(`📋 [Model] Items recuperados: ${items.length} para cálculo: ${calculoId}`);

        return items;
    } catch (error) {
        console.error('❌ [Model] Error al listar items:', error.message);
        throw {
            code: 'DB_ERROR',
            message: 'Error al consultar los items del cálculo',
            detail: error.message
        };
    }
}

module.exports = {
    grabarCalculo,
    obtenerCalculoPorId,
    listarItemsCalculo
};
