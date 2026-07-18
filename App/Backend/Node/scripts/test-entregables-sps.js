/**
 * Script de prueba para los nuevos métodos de entregablesService
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-002 - Testing Manual)
 * 
 * Ejecutar con: node test-entregables-sps.js
 */

const entregablesService = require('../src/services/entregablesService');

async function testActualizarTemplate() {
  console.log('\n🧪 TEST 1: Actualizar Template Existente');
  console.log('═'.repeat(60));
  
  try {
    const testHTML = '<html><body><h1>Template de prueba actualizado</h1><p>{{formData.nombreProyecto}}</p></body></html>';
    const resultado = await entregablesService.actualizarTemplate(1, testHTML);
    
    console.log('✅ Resultado:', resultado);
    console.log('   - Filas afectadas:', resultado.filas_afectadas);
    console.log('   - Mensaje:', resultado.mensaje);
    
    if (resultado.filas_afectadas === 1) {
      console.log('✅ TEST PASÓ: Template actualizado correctamente');
      return true;
    } else {
      console.log('❌ TEST FALLÓ: No se actualizó el template');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR en test:', error.message);
    return false;
  }
}

async function testActualizarTemplateInexistente() {
  console.log('\n🧪 TEST 2: Actualizar Template Inexistente');
  console.log('═'.repeat(60));
  
  try {
    const testHTML = '<html><body>Test</body></html>';
    const resultado = await entregablesService.actualizarTemplate(999, testHTML);
    
    console.log('✅ Resultado:', resultado);
    console.log('   - Filas afectadas:', resultado.filas_afectadas);
    console.log('   - Mensaje:', resultado.mensaje);
    
    if (resultado.filas_afectadas === 0) {
      console.log('✅ TEST PASÓ: Detectó correctamente entregable inexistente');
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Debería retornar 0 filas afectadas');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR en test:', error.message);
    return false;
  }
}

async function testObtenerPorID() {
  console.log('\n🧪 TEST 3: Obtener Template por ID');
  console.log('═'.repeat(60));
  
  try {
    const entregable = await entregablesService.obtenerPorID(1);
    
    if (!entregable) {
      console.log('❌ TEST FALLÓ: No se encontró el entregable ID 1');
      return false;
    }
    
    console.log('✅ Entregable encontrado:');
    console.log('   - ID:', entregable.entregable_id);
    console.log('   - Nombre:', entregable.nombre);
    console.log('   - Código:', entregable.codigo);
    console.log('   - Versión:', entregable.version);
    console.log('   - Activo:', entregable.activo);
    console.log('   - Template HTML:', entregable.html_template ? `${entregable.html_template.substring(0, 50)}...` : 'NULL');
    console.log('   - Updated:', entregable.updated_at);
    
    // Validar campos obligatorios
    const camposRequeridos = ['entregable_id', 'nombre', 'codigo', 'html_template'];
    const camposFaltantes = camposRequeridos.filter(campo => !entregable[campo]);
    
    if (camposFaltantes.length > 0) {
      console.log(`❌ TEST FALLÓ: Faltan campos: ${camposFaltantes.join(', ')}`);
      return false;
    }
    
    console.log('✅ TEST PASÓ: Todos los campos presentes');
    return true;
    
  } catch (error) {
    console.error('❌ ERROR en test:', error.message);
    return false;
  }
}

async function testListarActivos() {
  console.log('\n🧪 TEST 4: Listar Templates Activos');
  console.log('═'.repeat(60));
  
  try {
    const templates = await entregablesService.listarActivos();
    
    if (!Array.isArray(templates)) {
      console.log('❌ TEST FALLÓ: No retornó un array');
      return false;
    }
    
    console.log(`✅ Templates activos encontrados: ${templates.length}`);
    
    templates.forEach((template, index) => {
      console.log(`\n   ${index + 1}. ${template.nombre}`);
      console.log(`      - ID: ${template.entregable_id}`);
      console.log(`      - Código: ${template.codigo}`);
      console.log(`      - Versión: ${template.version}`);
      console.log(`      - Última actualización: ${template.updated_at}`);
    });
    
    if (templates.length === 0) {
      console.log('⚠️  ADVERTENCIA: No hay templates activos en la BD');
      return true; // No es un error si la tabla está vacía
    }
    
    // Validar estructura de cada template
    const camposRequeridos = ['entregable_id', 'nombre', 'codigo'];
    let todosValidos = true;
    
    templates.forEach((template, index) => {
      const camposFaltantes = camposRequeridos.filter(campo => !template[campo]);
      if (camposFaltantes.length > 0) {
        console.log(`❌ Template ${index + 1}: Faltan campos ${camposFaltantes.join(', ')}`);
        todosValidos = false;
      }
    });
    
    if (todosValidos) {
      console.log('\n✅ TEST PASÓ: Todos los templates tienen estructura correcta');
      return true;
    } else {
      console.log('\n❌ TEST FALLÓ: Algunos templates tienen campos faltantes');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ERROR en test:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  TEST SUITE: entregablesService - Nuevos Métodos SPs      ║');
  console.log('║  SPEC: SPEC020-ADMIN-Template-Manager (T020-002)           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const resultados = [];
  
  // Ejecutar tests
  resultados.push(await testListarActivos());
  resultados.push(await testObtenerPorID());
  resultados.push(await testActualizarTemplate());
  resultados.push(await testActualizarTemplateInexistente());
  
  // Resumen
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMEN DE TESTS');
  console.log('═'.repeat(60));
  
  const pasados = resultados.filter(r => r === true).length;
  const fallidos = resultados.filter(r => r === false).length;
  
  console.log(`Total tests: ${resultados.length}`);
  console.log(`✅ Pasados: ${pasados}`);
  console.log(`❌ Fallidos: ${fallidos}`);
  
  if (fallidos === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
    console.log('✅ T020-002 - Paso 5: entregablesService.js actualizado correctamente');
    process.exit(0);
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON');
    console.log('Revisa los errores arriba y corrige los SPs o los métodos del service');
    process.exit(1);
  }
}

// Ejecutar
runAllTests().catch(error => {
  console.error('\n❌ ERROR FATAL:', error);
  process.exit(1);
});
