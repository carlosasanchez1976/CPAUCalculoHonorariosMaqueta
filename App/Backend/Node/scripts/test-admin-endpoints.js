/**
 * Script de prueba para endpoints de Admin Templates
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003 - Testing Manual)
 * 
 * Ejecutar con: node test-admin-endpoints.js
 * 
 * REQUISITO: Backend debe estar corriendo (npm start en otra terminal)
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000/api/admin/templates';

async function testListTemplates() {
  console.log('\n🧪 TEST 1: GET /api/admin/templates/list');
  console.log('═'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/list`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success && Array.isArray(data.data)) {
      console.log('✅ TEST PASÓ: Lista de templates obtenida correctamente');
      console.log(`   - Total templates: ${data.data.length}`);
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Response inválida');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function testGetTestData() {
  console.log('\n🧪 TEST 2: GET /api/admin/templates/test-data');
  console.log('═'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/test-data`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response (primeros 200 chars):', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    
    if (response.status === 200 && data.success && data.data) {
      console.log('✅ TEST PASÓ: Test data obtenido correctamente');
      console.log(`   - Tiene formData: ${!!data.data.formData}`);
      console.log(`   - Tiene calculationResult: ${!!data.data.calculationResult}`);
      console.log(`   - Tiene logoCPAU: ${!!data.data.logoCPAU}`);
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Response inválida');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function testPreview() {
  console.log('\n🧪 TEST 3: POST /api/admin/templates/preview');
  console.log('═'.repeat(60));
  
  const testHTML = `
    <html>
      <head><title>Test Preview</title></head>
      <body>
        <h1>Proyecto: {{formData.nombreProyecto}}</h1>
        <p>Cliente: {{formData.cliente}}</p>
        <p>Superficie: {{formData.superficieTotal}} m²</p>
      </body>
    </html>
  `;
  
  try {
    const response = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: testHTML })
    });
    
    const htmlRendered = await response.text();
    
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('HTML renderizado (primeros 200 chars):', htmlRendered.substring(0, 200) + '...');
    
    // Validar que las variables se reemplazaron
    const hasProyecto = htmlRendered.includes('PRUEBA');
    const hasCliente = htmlRendered.includes('Inmobiliaria ABC SA');
    const hasSuperficie = htmlRendered.includes('2500');
    const noHandlebars = !htmlRendered.includes('{{');
    
    console.log('Validaciones:');
    console.log(`   - Tiene nombre proyecto: ${hasProyecto}`);
    console.log(`   - Tiene cliente: ${hasCliente}`);
    console.log(`   - Tiene superficie: ${hasSuperficie}`);
    console.log(`   - Sin variables sin reemplazar: ${noHandlebars}`);
    
    if (response.status === 200 && hasProyecto && hasCliente && noHandlebars) {
      console.log('✅ TEST PASÓ: Preview generado correctamente');
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Preview con errores');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function testPreviewHTMLVacio() {
  console.log('\n🧪 TEST 4: POST /api/admin/templates/preview (HTML vacío)');
  console.log('═'.repeat(60));
  
  try {
    const response = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: '' })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 400 && !data.success && data.error.includes('vacío')) {
      console.log('✅ TEST PASÓ: Validación de HTML vacío funciona');
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Debería retornar 400 con error de validación');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function testUpdate() {
  console.log('\n🧪 TEST 5: POST /api/admin/templates/:id/update');
  console.log('═'.repeat(60));
  console.log('⚠️  ADVERTENCIA: Este test MODIFICA la BD');
  console.log('   Se actualizará el template ID 1 con HTML de prueba');
  
  const testHTML = `<html><body><h1>Template actualizado por T020-003 Test</h1><p>{{formData.nombreProyecto}}</p></body></html>`;
  
  try {
    const response = await fetch(`${API_BASE}/1/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: testHTML })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success && data.entregableId === 1) {
      console.log('✅ TEST PASÓ: Template actualizado correctamente');
      console.log(`   - Tamaño HTML: ${data.htmlSize} KB`);
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Update no funcionó correctamente');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function testUpdateInexistente() {
  console.log('\n🧪 TEST 6: POST /api/admin/templates/999/update (ID inexistente)');
  console.log('═'.repeat(60));
  
  const testHTML = `<html><body>Test</body></html>`;
  
  try {
    const response = await fetch(`${API_BASE}/999/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: testHTML })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 404 && !data.success) {
      console.log('✅ TEST PASÓ: Detectó correctamente template inexistente');
      return true;
    } else {
      console.log('❌ TEST FALLÓ: Debería retornar 404');
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  TEST SUITE: Admin Templates API Endpoints                ║');
  console.log('║  SPEC: SPEC020-ADMIN-Template-Manager (T020-003)           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📍 API Base URL: ${API_BASE}`);
  console.log('⚠️  REQUISITO: Backend debe estar corriendo\n');
  
  const resultados = [];
  
  // Ejecutar tests
  resultados.push(await testListTemplates());
  resultados.push(await testGetTestData());
  resultados.push(await testPreview());
  resultados.push(await testPreviewHTMLVacio());
  resultados.push(await testUpdate());
  resultados.push(await testUpdateInexistente());
  
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
    console.log('✅ T020-003 - Backend API Endpoints implementado correctamente\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON');
    console.log('Revisa los errores arriba y corrige los endpoints\n');
    process.exit(1);
  }
}

// Ejecutar
runAllTests().catch(error => {
  console.error('\n❌ ERROR FATAL:', error);
  process.exit(1);
});
