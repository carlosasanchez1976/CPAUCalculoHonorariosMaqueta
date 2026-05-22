/**
 * Script de Testing - TICKET #004 - SPEC-CALC-003
 * Validación de Arrastre Progresivo para Proyecto y Dirección
 * 
 * Ejecuta todos los casos de prueba definidos en SPEC008-CALC-003-TICKETS.txt
 * 
 * Fecha: 22/05/2026
 * Valor K utilizado: $589.183.947,83
 */

const calculoModel = require('../src/models/calculo');
const db = require('../src/config/db');

// ============================================================================
// CONFIGURACIÓN DE PRUEBAS
// ============================================================================

const VALOR_K = 589183947.83;
const USUARIO_ID = 1;

// ============================================================================
// CASOS DE PRUEBA BASE (SPEC Sección 5.1)
// Valores ajustados según valor K real: $589.183.947,83
// Precio por m²: entre $1.582.000 y $2.200.000
// ============================================================================

const casosBase = [
  {
    id: 1,
    nombre: 'Obra $316.400.000 (200m² × $1.582.000) - Rango A',
    datos: {
      valorObra: 316400000,
      superficie: 200,
      tipologia: 'Vivienda unifamiliar',
      proyecto: true,
      direccion: false,
      remodelacion: false
    },
    esperado: {
      rango: 'A',
      itemsProyecto: 1 // Solo Rango A (0.54k)
    }
  },
  {
    id: 2,
    nombre: 'Obra $900.000.000 (500m² × $1.800.000) - Rango B - Proyecto + Dirección',
    datos: {
      valorObra: 900000000,
      superficie: 500,
      tipologia: 'Vivienda unifamiliar',
      proyecto: true,
      direccion: true,
      remodelacion: false
    },
    esperado: {
      rango: 'B',
      itemsProyecto: 3, // A + B + K (1.53k)
      itemsDireccion: 3 // A + B + K
    }
  },
  {
    id: 3,
    nombre: 'Obra $1.520.000.000 (800m² × $1.900.000) - Rango B',
    datos: {
      valorObra: 1520000000,
      superficie: 800,
      tipologia: 'Vivienda multifamiliar',
      proyecto: true,
      direccion: false,
      remodelacion: false
    },
    esperado: {
      rango: 'B',
      itemsProyecto: 3 // A + B + K (2.58k)
    }
  },
  {
    id: 4,
    nombre: 'Obra $3.300.000.000 (1100m² × $3.000.000) - Rango C',
    datos: {
      valorObra: 3300000000,
      superficie: 1100,
      tipologia: 'Edificio comercial',
      proyecto: true,
      direccion: false,
      remodelacion: false
    },
    esperado: {
      rango: 'C',
      itemsProyecto: 4 // A + B + C + K (5.6k)
    }
  },
  {
    id: 5,
    nombre: 'Obra $16.500.000.000 (1100m² × $15.000.000) - Rango D',
    datos: {
      valorObra: 16500000000,
      superficie: 1100,
      tipologia: 'Edificio institucional',
      proyecto: true,
      direccion: false,
      remodelacion: false
    },
    esperado: {
      rango: 'D',
      itemsProyecto: 5 // A + B + C + D + K (28k)
    }
  },
  {
    id: 6,
    nombre: 'Obra $900.000.000 (500m² × $1.800.000) - Rango B - Remodelación',
    datos: {
      valorObra: 900000000,
      superficie: 500,
      tipologia: 'Remodelación', // Trigger adicionales
      proyecto: true,
      direccion: false,
      remodelacion: true
    },
    esperado: {
      rango: 'B',
      itemsProyecto: 5 // A + adicional + B + adicional + K (1.53k)
    }
  }
];

// ============================================================================
// CASOS EXTREMOS (SPEC Sección 5.2)
// ============================================================================

const casosExtremos = [
  {
    id: 7,
    nombre: 'Obra en límite exacto (1k = $589.183.947,83)',
    datos: {
      valorObra: 589183947.83,
      superficie: 372,
      tipologia: 'Vivienda unifamiliar',
      proyecto: true,
      direccion: false,
      remodelacion: false
    },
    esperado: {
      rango: 'B', // 1k exacto cae en Rango B (límite >= 1k)
      itemsProyecto: 1, // Solo genera ítem de Rango A (no llega a cruzar a Rango B)
      verificar: 'No debe haber ítems de Rango B (solo genera A por ser límite exacto)'
    }
  },
  {
    id: 8,
    nombre: 'Todas las tareas habilitadas - Obra $3.300.000.000 (Rango C)',
    datos: {
      valorObra: 3300000000,
      superficie: 1100,
      tipologia: 'Vivienda multifamiliar',
      proyecto: true,
      direccion: true,
      instalacionSanitaria: true,
      instalacionElectrica: true,
      instalacionContraIncendio: true,
      instalacionTermomecanica: true,
      proyectoEstructuras: true,
      remodelacion: false
    },
    esperado: {
      rango: 'C',
      verificar: 'Todas las tareas generan múltiples ítems'
    }
  }
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Actualiza el valor K en la base de datos
 */
async function configurarValorK() {
  console.log(`\n🔧 Configurando Valor K = $${VALOR_K.toLocaleString('es-AR')}...`);
  
  await db.executeQuery(
    `UPDATE Parametros 
     SET valor = ? 
     WHERE nombre = 'valorK' 
     AND (baja_fecha IS NULL OR baja_fecha > NOW())`,
    [VALOR_K]
  );
  
  // Verificar que se actualizó correctamente
  const result = await db.executeQuery(
    `SELECT valor FROM Parametros WHERE nombre = 'valorK' AND (baja_fecha IS NULL OR baja_fecha > NOW())`
  );
  
  const valorActual = parseFloat(result[0].valor);
  const diferencia = Math.abs(valorActual - VALOR_K);
  
  if (diferencia < 0.01) { // Tolerancia de $0.01
    console.log('   ✅ Valor K configurado correctamente\n');
  } else {
    throw new Error(`Error al configurar Valor K. Valor actual: ${valorActual}, Esperado: ${VALOR_K}`);
  }
}

/**
 * Ejecuta un caso de prueba y valida resultados
 */
async function ejecutarCaso(caso, esExtremo = false) {
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📋 CASO ${caso.id}: ${caso.nombre}`);
  console.log(`${'═'.repeat(80)}\n`);
  
  // Preparar datos para el SP
  const datosCalculo = {
    usuarioId: USUARIO_ID,
    tareaId: 1, // PyDOA
    datosProyecto: {
      nombre: `Test Ticket 004 - Caso ${caso.id}`,
      ubicacion: 'CABA',
      cliente: 'Cliente Test'
    },
    datosObra: {
      valorObra: caso.datos.valorObra,
      superficie: caso.datos.superficie,
      tipologia: caso.datos.tipologia,
      complejidad: 'media'
    },
    tareasProfesionales: {
      obraProyecto: caso.datos.proyecto || false,
      obraDireccion: caso.datos.direccion || false,
      instalacionSanitaria: caso.datos.instalacionSanitaria || false,
      instalacionElectrica: caso.datos.instalacionElectrica || false,
      instalacionContraIncendio: caso.datos.instalacionContraIncendio || false,
      instalacionTermomecanica: caso.datos.instalacionTermomecanica || false,
      proyectoEstructuras: caso.datos.proyectoEstructuras || false
    }
  };
  
  console.log('📊 Datos de entrada:');
  console.log(`   - Valor Obra: $${caso.datos.valorObra.toLocaleString('es-AR')}`);
  console.log(`   - Tipología: ${caso.datos.tipologia}`);
  console.log(`   - Proyecto: ${caso.datos.proyecto ? '✅' : '❌'}`);
  console.log(`   - Dirección: ${caso.datos.direccion ? '✅' : '❌'}`);
  if (caso.datos.instalacionSanitaria) console.log(`   - Inst. Sanitaria: ✅`);
  if (caso.datos.instalacionElectrica) console.log(`   - Inst. Eléctrica: ✅`);
  if (caso.datos.instalacionContraIncendio) console.log(`   - Inst. Contra Incendio: ✅`);
  if (caso.datos.instalacionTermomecanica) console.log(`   - Inst. Termomecánica: ✅`);
  if (caso.datos.proyectoEstructuras) console.log(`   - Proyecto Estructuras: ✅`);
  
  try {
    // Ejecutar cálculo
    global.usuarioId = USUARIO_ID;
    const resultado = await calculoModel.grabarCalculo(datosCalculo);
    const calculoId = resultado.calculoId;
    
    // Obtener detalles del cálculo
    const calculo = await calculoModel.obtenerCalculoPorId(calculoId);
    
    // Obtener ítems del cálculo
    const items = await db.executeQuery(
      `SELECT * FROM Calculos_Items WHERE calculo_id = ? ORDER BY item_numero`,
      [calculoId]
    );
    
    console.log('\n📈 Resultados:');
    console.log(`   - Cálculo ID: ${calculoId}`);
    console.log(`   - Rango Final: ${calculo.metadata_rango}`);
    console.log(`   - Total Honorarios: $${calculo.total_honorarios.toLocaleString('es-AR')}`);
    console.log(`   - Número de Items: ${items.length}`);
    console.log(`   - Valor K usado: $${(calculo.metadata_valor_k || VALOR_K).toLocaleString('es-AR')}`);
    console.log(`   - Coef K (valorObra/valorK): ${(calculo.metadata_rango_costo_obra || 0).toFixed(4)}`);
    
    console.log('\n📝 Detalle de Items:');
    let totalProyecto = 0;
    let totalDireccion = 0;
    let itemsProyecto = 0;
    let itemsDireccion = 0;
    
    items.forEach(item => {
      console.log(`   ${item.item_numero}. ${item.tarea_profesional} - ${item.descripcion}: $${item.importe.toLocaleString('es-AR')}`);
      
      if (item.tarea_profesional.includes('Proyecto de obra')) {
        totalProyecto += item.importe;
        itemsProyecto++;
      } else if (item.tarea_profesional.includes('Dirección de obra')) {
        totalDireccion += item.importe;
        itemsDireccion++;
      }
    });
    
    // Validaciones
    console.log('\n✔️  Validaciones:');
    let errores = [];
    
    // Validar rango
    if (caso.esperado.rango) {
      if (calculo.metadata_rango === caso.esperado.rango) {
        console.log(`   ✅ Rango correcto: ${calculo.metadata_rango}`);
      } else {
        const error = `❌ Rango incorrecto. Esperado: ${caso.esperado.rango}, Obtenido: ${calculo.metadata_rango}`;
        console.log(`   ${error}`);
        errores.push(error);
      }
    }
    
    // Validar número de ítems de Proyecto
    if (caso.esperado.itemsProyecto) {
      if (itemsProyecto === caso.esperado.itemsProyecto) {
        console.log(`   ✅ Items de Proyecto correctos: ${itemsProyecto}`);
      } else {
        const error = `❌ Items de Proyecto incorrectos. Esperado: ${caso.esperado.itemsProyecto}, Obtenido: ${itemsProyecto}`;
        console.log(`   ${error}`);
        errores.push(error);
      }
    }
    
    // Validar número de ítems de Dirección
    if (caso.esperado.itemsDireccion) {
      if (itemsDireccion === caso.esperado.itemsDireccion) {
        console.log(`   ✅ Items de Dirección correctos: ${itemsDireccion}`);
      } else {
        const error = `❌ Items de Dirección incorrectos. Esperado: ${caso.esperado.itemsDireccion}, Obtenido: ${itemsDireccion}`;
        console.log(`   ${error}`);
        errores.push(error);
      }
    }
    
    // Validar que importes de Proyecto y Dirección están en proporción 60/40
    if (totalProyecto > 0 && totalDireccion > 0) {
      const proporcion = totalProyecto / totalDireccion;
      const proporcionEsperada = 0.60 / 0.40; // 1.5
      const diferenciaProporcion = Math.abs(proporcion - proporcionEsperada);
      
      if (diferenciaProporcion <= 0.05) {
        console.log(`   ✅ Proporción Proyecto/Dirección correcta: ${proporcion.toFixed(2)} (esperado: ${proporcionEsperada.toFixed(2)})`);
      } else {
        const error = `⚠️  Proporción Proyecto/Dirección fuera de rango: ${proporcion.toFixed(2)} (esperado: ${proporcionEsperada.toFixed(2)})`;
        console.log(`   ${error}`);
        // No agregar como error crítico
      }
    }
    
    // Validar metadata
    if (items.length === calculo.metadata_numero_items) {
      console.log(`   ✅ Metadata número items correcto: ${items.length}`);
    } else {
      const error = `❌ Metadata número items incorrecto. En tabla: ${items.length}, En metadata: ${calculo.metadata_numero_items}`;
      console.log(`   ${error}`);
      errores.push(error);
    }
    
    // Validar que todos los ítems tienen importe > 0
    const itemsConImporteCero = items.filter(i => i.importe <= 0);
    if (itemsConImporteCero.length === 0) {
      console.log(`   ✅ Todos los ítems tienen importe > 0`);
    } else {
      const error = `❌ Hay ${itemsConImporteCero.length} ítems con importe <= 0`;
      console.log(`   ${error}`);
      errores.push(error);
    }
    
    // Validaciones especiales para casos extremos
    if (caso.esperado.verificar) {
      console.log(`\n   ℹ️  Verificación especial: ${caso.esperado.verificar}`);
      
      if (caso.id === 7) {
        // Caso 7: Verificar que NO hay ítems de Rango B
        const itemsRangoB = items.filter(i => i.descripcion.includes('Rango B'));
        if (itemsRangoB.length === 0) {
          console.log(`   ✅ Correcto: No hay ítems de Rango B`);
        } else {
          const error = `❌ Error: Se generaron ítems de Rango B cuando no debería`;
          console.log(`   ${error}`);
          errores.push(error);
        }
      }
      
      if (caso.id === 8) {
        // Caso 8: Verificar que todas las tareas generaron ítems
        const tareasEsperadas = [
          'Proyecto de obra',
          'Dirección de obra',
          'Instalación Sanitaria',
          'Instalación Eléctrica',
          'Instalación Contra Incendio',
          'Instalación Termomecánica',
          'Proyecto de Estructuras'
        ];
        
        tareasEsperadas.forEach(tarea => {
          const itemsTarea = items.filter(i => i.tarea_profesional.includes(tarea));
          if (itemsTarea.length > 0) {
            console.log(`   ✅ ${tarea}: ${itemsTarea.length} ítems`);
          } else {
            const error = `❌ Error: No se generaron ítems para ${tarea}`;
            console.log(`   ${error}`);
            errores.push(error);
          }
        });
      }
    }
    
    // Resumen del caso
    console.log(`\n${'─'.repeat(80)}`);
    if (errores.length === 0) {
      console.log(`✅ CASO ${caso.id}: PASÓ CORRECTAMENTE`);
    } else {
      console.log(`❌ CASO ${caso.id}: FALLÓ CON ${errores.length} ERROR(ES)`);
      errores.forEach(err => console.log(`   - ${err}`));
    }
    console.log(`${'─'.repeat(80)}\n`);
    
    return {
      caso: caso.id,
      nombre: caso.nombre,
      exito: errores.length === 0,
      errores: errores,
      calculoId: calculoId
    };
    
  } catch (error) {
    console.log(`\n❌ ERROR AL EJECUTAR CASO ${caso.id}:`);
    console.log(`   ${error.message}`);
    console.log(`   ${error.stack}\n`);
    
    return {
      caso: caso.id,
      nombre: caso.nombre,
      exito: false,
      errores: [error.message],
      calculoId: null
    };
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║                    TICKET #004 - TESTING Y VALIDACIÓN                        ║');
  console.log('║                    SPEC-CALC-003: Arrastre Progresivo                        ║');
  console.log('║                    Proyecto y Dirección de Obra                              ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-AR')}`);
  console.log(`💰 Valor K: $${VALOR_K.toLocaleString('es-AR')}`);
  console.log('\n');
  
  const resultados = [];
  
  try {
    // Configurar valor K
    await configurarValorK();
    
    // Ejecutar casos base
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                         CASOS BASE (6 casos)                                 ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    
    for (const caso of casosBase) {
      const resultado = await ejecutarCaso(caso);
      resultados.push(resultado);
    }
    
    // Ejecutar casos extremos
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                       CASOS EXTREMOS (2 casos)                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    
    for (const caso of casosExtremos) {
      const resultado = await ejecutarCaso(caso, true);
      resultados.push(resultado);
    }
    
    // Reporte final
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                             REPORTE FINAL                                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    console.log('\n');
    
    const casosExitosos = resultados.filter(r => r.exito).length;
    const casosFallidos = resultados.filter(r => !r.exito).length;
    const totalCasos = resultados.length;
    
    console.log(`📊 Resumen de Ejecución:`);
    console.log(`   - Total de casos: ${totalCasos}`);
    console.log(`   - Casos exitosos: ${casosExitosos} ✅`);
    console.log(`   - Casos fallidos: ${casosFallidos} ${casosFallidos > 0 ? '❌' : ''}`);
    console.log(`   - Tasa de éxito: ${((casosExitosos / totalCasos) * 100).toFixed(1)}%`);
    console.log('\n');
    
    console.log('📋 Detalle por caso:');
    resultados.forEach(r => {
      const estado = r.exito ? '✅' : '❌';
      console.log(`   ${estado} Caso ${r.caso}: ${r.nombre}`);
      if (!r.exito && r.errores.length > 0) {
        r.errores.forEach(err => {
          console.log(`      ⚠️  ${err}`);
        });
      }
    });
    console.log('\n');
    
    // Criterios de aceptación
    console.log('✔️  CRITERIOS DE ACEPTACIÓN:');
    console.log(`   ${casosBase.every(c => resultados.find(r => r.caso === c.id)?.exito) ? '✅' : '❌'} Los 6 casos base pasan sin errores`);
    console.log(`   ${casosExtremos.every(c => resultados.find(r => r.caso === c.id)?.exito) ? '✅' : '❌'} Los 2 casos extremos pasan correctamente`);
    console.log(`   ${casosFallidos === 0 ? '✅' : '❌'} Todos los tests pasan correctamente`);
    console.log('\n');
    
    if (casosFallidos === 0) {
      console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
      console.log('║                                                                               ║');
      console.log('║                   ✅ TICKET #004 COMPLETADO EXITOSAMENTE                     ║');
      console.log('║                                                                               ║');
      console.log('║         El sistema de arrastre progresivo funciona correctamente            ║');
      console.log('║         Proyecto y Dirección generan múltiples ítems por rango              ║');
      console.log('║                                                                               ║');
      console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    } else {
      console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
      console.log('║                                                                               ║');
      console.log('║                    ❌ TICKET #004 TIENE ERRORES                              ║');
      console.log('║                                                                               ║');
      console.log('║         Revisar los casos fallidos antes de proceder al deploy              ║');
      console.log('║                                                                               ║');
      console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
    }
    console.log('\n');
    
    // Cerrar conexión
    await db.closePool();
    
    // Retornar código de salida
    process.exit(casosFallidos > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO EN LA EJECUCIÓN DE TESTS:');
    console.error(error);
    console.error('\n');
    
    await db.closePool();
    process.exit(1);
  }
}

// Ejecutar tests
runTests();
