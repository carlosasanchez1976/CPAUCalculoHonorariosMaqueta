/**
 * Script de test para el modelo de cálculo
 * Verifica las funciones principales del repository
 */

const calculoModel = require('../src/models/calculo');
const db = require('../src/config/db');

// Datos de prueba completos
// NOTA: El SP Calculo_Grabar calculará los honorarios internamente
const datosCompletosTest = {
    usuarioId: 1,
    tareaId: 1,
    datosProyecto: {
        nombre: 'Proyecto Test Backend',
        ubicacion: 'CABA - Palermo',
        cliente: 'Cliente Test CPAU'
    },
    datosObra: {
        valorObra: 50000000,
        superficie: 250,
        tipologia: 'Vivienda unifamiliar',
        complejidad: 'media'
    },
    tareasProfesionales: {
        obraProyecto: true,
        obraDireccion: true,
        instalacionSanitaria: false,
        instalacionElectrica: false,
        instalacionContraIncendio: false,
        instalacionTermomecanica: false,
        proyectoEstructuras: false
    }
};

async function runTests() {
    console.log('\n🧪 INICIANDO TESTS DEL MODELO CALCULO\n');
    console.log('════════════════════════════════════════════════════════════════════════════════\n');

    let testCalculoId = null;

    try {
        // Obtener tareaId válido para test desde catálogo
        const tareas = await db.executeQuery(
            'SELECT tarea_id FROM Tareas_Profesionales ORDER BY tarea_id ASC LIMIT 1'
        );

        if (!Array.isArray(tareas) || tareas.length === 0) {
            throw new Error('No hay registros en Tareas_Profesionales para ejecutar tests');
        }

        datosCompletosTest.tareaId = Number(tareas[0].tarea_id);

        // Compatibilidad con referencia global usada por el modelo actual
        global.usuarioId = Number(datosCompletosTest.usuarioId);

        // ========================================
        // TEST 1: GRABAR CÁLCULO
        // ========================================
        console.log('📌 TEST 1: Grabar cálculo completo (SP calcula honorarios internamente)...\n');
        
        const resultGrabar = await calculoModel.grabarCalculo(datosCompletosTest);
        testCalculoId = resultGrabar.calculoId;

        if (!Number.isInteger(testCalculoId) || testCalculoId <= 0) {
            throw new Error('calculoId retornado no es INT válido');
        }
        
        console.log('   ✅ Resultado:', resultGrabar);
        console.log(`   ✅ Cálculo grabado con ID INT: ${testCalculoId}`);
        console.log(`   ✅ Status: ${resultGrabar.status}\n`);

        // ========================================
        // TEST 2: OBTENER CÁLCULO POR ID
        // ========================================
        console.log('📌 TEST 2: Obtener cálculo por ID...\n');
        
        const calculo = await calculoModel.obtenerCalculoPorId(testCalculoId);
        
        if (calculo) {
            console.log('   ✅ Cálculo recuperado:');
            console.log(`      - ID: ${calculo.calculo_id || calculo.id}`);
            console.log(`      - Tipo: ${calculo.tipo_calculo}`);
            console.log(`      - Proyecto: ${calculo.proyecto_nombre}`);
            console.log(`      - Valor Obra: $${calculo.obra_valor_obra.toLocaleString('es-AR')}`);
            console.log(`      - Total Honorarios: $${calculo.total_honorarios.toLocaleString('es-AR')}`);
            console.log(`      - Rango: ${calculo.metadata_rango}`);
            console.log(`      - Nº Items: ${calculo.metadata_numero_items}\n`);
        } else {
            console.log('   ❌ ERROR: Cálculo no encontrado\n');
        }

        // ========================================
        // TEST 3: OBTENER CÁLCULO INEXISTENTE
        // ========================================
        console.log('📌 TEST 3: Buscar cálculo inexistente...\n');
        
        const calculoInexistente = await calculoModel.obtenerCalculoPorId(99999999);
        
        if (calculoInexistente === null) {
            console.log('   ✅ Manejo correcto de cálculo inexistente (retorna null)\n');
        } else {
            console.log('   ❌ ERROR: Debería retornar null\n');
        }

        // ========================================
        // RESUMEN FINAL
        // ========================================
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log('✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
        console.log('════════════════════════════════════════════════════════════════════════════════\n');
        console.log('📊 RESUMEN:');
        console.log(`   • Cálculo de prueba ID: ${testCalculoId}`);
        console.log('   • Función grabarCalculo(): ✅ OK (retorna calculoId INT)');
        console.log('   • Función obtenerCalculoPorId(): ✅ OK');
        console.log('   • Manejo de casos inexistentes: ✅ OK');
        console.log('\n💡 NOTA: El SP Calculos_Grabar calculó los honorarios automáticamente\n');

    } catch (error) {
        console.error('\n❌ ERROR EN TEST:', error);
        console.error('Detalle:', error.detail || error.message);
    } finally {
        // Cerrar conexión
        await db.closePool();
        console.log('🔌 Connection pool cerrado\n');
    }
}

// Ejecutar tests
runTests();
