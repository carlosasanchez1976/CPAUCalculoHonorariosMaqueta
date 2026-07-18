/**
 * Script para agregar el logo CPAU al archivo test-data-templates.json
 * Ejecutar con: node add-logo-to-testdata.js
 * 
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-001)
 * 
 * NOTA: Usa el logo placeholder que está en pdfService.js
 * Cuando tengan el logo real, reemplazar esta variable logoDataUri
 */

const fs = require('fs');
const path = require('path');

// Path al archivo test-data
const testDataPath = path.join(__dirname, '../src/data/test-data-templates.json');

// Logo CPAU (mismo placeholder que usa pdfService.js)
const logoDataUri = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+Q1BBVTWV4dD48L3N2Zz4=';

try {
  console.log('📂 Usando logo placeholder (compatible con pdfService.js)');
  console.log('✅ Logo base64 (%d caracteres)', logoDataUri.length);
  
  // 3. Leer test-data actual
  console.log('📂 Leyendo test-data desde:', testDataPath);
  const testDataRaw = fs.readFileSync(testDataPath, 'utf8');
  const testData = JSON.parse(testDataRaw);
  
  // 4. Agregar logo al formData
  if (!testData.formData) {
    testData.formData = {};
  }
  
  // Agregar también al nivel raíz para que esté disponible directamente
  testData.logoCPAU = logoDataUri;
  
  // 5. Guardar archivo actualizado (con formato bonito)
  const testDataUpdated = JSON.stringify(testData, null, 2);
  fs.writeFileSync(testDataPath, testDataUpdated, 'utf8');
  
  console.log('✅ Test data actualizado con logo CPAU');
  console.log('📄 Archivo guardado:', testDataPath);
  console.log('');
  console.log('🧪 Para probar:');
  console.log('   curl https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/test-data');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('');
  console.error('Posible causa:');
  console.error('- El archivo test-data-templates.json no existe en src/data/');
  console.error('');
  process.exit(1);
}
