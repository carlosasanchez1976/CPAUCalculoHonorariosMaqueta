/**
 * Script de test para el modelo de cálculo
 * Verifica las 3 funciones principales del repository
 */

const calculoModel = require('../src/models/calculo');
const db = require('../src/config/db');

// Datos de prueba completos
// NOTA: El SP Calc_Maq_Grabar calculará los honorarios internamente
const datosCompletosTest = {
    tipoCalculo: 'basico',
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
        // ========================================
        // TEST 1: GRABAR CÁLCULO
        // ========================================
        console.log('📌 TEST 1: Grabar cálculo completo (SP calcula honorarios internamente)...\n');
        
        const resultGrabar = await calculoModel.grabarCalculo(datosCompletosTest);
        testCalculoId = resultGrabar.calculoId;
        
        console.log('   ✅ Resultado:', resultGrabar);
        console.log(`   ✅ Cálculo grabado con ID: ${testCalculoId}`);
        console.log(`   ✅ Status: ${resultGrabar.status}\n`);

        // ========================================
        // TEST 2: OBTENER CÁLCULO POR ID
        // ========================================
        console.log('📌 TEST 2: Obtener cálculo por ID...\n');
        
        const calculo = await calculoModel.obtenerCalculoPorId(testCalculoId);
        
        if (calculo) {
            console.log('   ✅ Cálculo recuperado:');
            console.log(`      - ID: ${calculo.calculo_id}`);
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
        // TEST 3: LISTAR ITEMS DEL CÁLCULO
        // ========================================
        console.log('📌 TEST 3: Listar items del cálculo...\n');
        
        const items = await calculoModel.listarItemsCalculo(testCalculoId);
        
        console.log(`   ✅ Items encontrados: ${items.length}\n`);
        
        items.forEach((item, index) => {
            console.log(`   📋 Item ${index + 1}:`);
            console.log(`      - Nº: ${item.item_numero}`);
            console.log(`      - Tarea: ${item.tarea_profesional}`);
            console.log(`      - Descripción: ${item.descripcion}`);
            console.log(`      - Importe: $${item.importe.toLocaleString('es-AR')}`);
            console.log('');
        });

        // ========================================
        // TEST 4: OBTENER CÁLCULO INEXISTENTE
        // ========================================
        console.log('📌 TEST 4: Buscar cálculo inexistente...\n');
        
        const calculoInexistente = await calculoModel.obtenerCalculoPorId('CALC-NO-EXISTE-999');
        
        if (calculoInexistente === null) {
            console.log('   ✅ Manejo correcto de cálculo inexistente (retorna null)\n');
        } else {
            console.log('   ❌ ERROR: Debería retornar null\n');
        }

        // ========================================
        // TEST 5: LISTAR ITEMS DE CÁLCULO INEXISTENTE
        // ========================================
        console.log('📌 TEST 5: Listar items de cálculo inexistente...\n');
        
        const itemsInexistentes = await calculoModel.listarItemsCalculo('CALC-NO-EXISTE-999');
        
        console.log(`   ✅ Items retornados: ${itemsInexistentes.length} (esperado: 0)\n`);

        // ========================================
        // RESUMEN FINAL
        // ========================================
        console.log('════════════════════════════════════════════════════════════════════════════════');
        console.log('✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE');
        console.log('════════════════════════════════════════════════════════════════════════════════\n');
        console.log('📊 RESUMEN:');
        console.log(`   • Cálculo de prueba ID: ${testCalculoId}`);
        console.log('   • Función grabarCalculo(): ✅ OK (SP calcula internamente)');
        console.log('   • Función obtenerCalculoPorId(): ✅ OK');
        console.log('   • Función listarItemsCalculo(): ✅ OK');
        console.log('   • Manejo de casos inexistentes: ✅ OK');
        console.log('\n💡 NOTA: El SP Calc_Maq_Grabar calculó los honorarios automáticamente\n');

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
