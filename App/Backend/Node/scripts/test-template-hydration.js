/**
 * Script de prueba para validar hidratación de templates
 * Ejecutar con: node test-template-hydration.js
 * 
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-001 - Criterio de Aceptación)
 * 
 * Objetivo: Verificar que test-data-templates.json puede hidratar
 * un template HTML sin errores de Handlebars.
 */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Helpers de Handlebars (mismos que usa pdfService.js)
Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('or', (...args) => {
  args.pop(); // Eliminar options
  return args.some(arg => arg);
});
Handlebars.registerHelper('formatNumber', (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('es-AR').format(num);
});
Handlebars.registerHelper('formatCurrency', (num) => {
  if (!num) return '$ 0';
  return `$ ${new Intl.NumberFormat('es-AR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(num)}`;
});
Handlebars.registerHelper('json', (context) => JSON.stringify(context, null, 2));

console.log('🧪 TEST: Hidratación de Template con Test Data\n');
console.log('═'.repeat(60));

try {
  // 1. Cargar test data
  const testDataPath = path.join(__dirname, '../src/data/test-data-templates.json');
  console.log('📂 Cargando test data...');
  const testDataRaw = fs.readFileSync(testDataPath, 'utf8');
  const testData = JSON.parse(testDataRaw);
  console.log('✅ Test data cargado OK\n');

  // 2. Simular prepararDatosPlantilla (versión simplificada)
  console.log('🔧 Preparando datos para template...');
  
  // Helper de formato (mismo que pdfService)
  const formatCurrency = (num) => {
    if (!num) return '$ 0,00';
    return `$ ${new Intl.NumberFormat('es-AR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(num)}`;
  };
  
  const datosPlantilla = {
    ...testData.formData,
    ...testData.calculationResult,
    logoCPAU: testData.logoCPAU,
    tipoCalculoNombre: testData.tipoNombre,
    currentDate: new Date().toLocaleDateString('es-AR'),
    calculationNumber: testData.formData.calculoId,
    
    // Valores monetarios formateados
    valorObraARS: formatCurrency(testData.formData.valorObra || 0),
    valorObraUSD: formatCurrency((testData.formData.valorObra || 0) / (testData.formData.cotizDolar || 1)),
    
    // Agrupar honorarios por tarea (igual que pdfService.js)
    honorariosObra: [],
    honorariosAdicionales: [],
    honorariosEspecialidades: []
  };

  // Agrupar detalleHonorarios
  if (testData.calculationResult.detalleHonorarios) {
    const tareasPrincipales = ['Proyecto de obra de arquitectura', 'Dirección de obra de arquitectura'];
    
    testData.calculationResult.detalleHonorarios.forEach(item => {
      const grupoItem = {
        descripcion: item.descripcion,
        importe: item.importe,
        importeARS: formatCurrency(item.importe),
        importeUSD: formatCurrency(item.importe / (testData.formData.cotizDolar || 1))
      };

      if (tareasPrincipales.includes(item.tareaProfesional)) {
        datosPlantilla.honorariosObra.push(grupoItem);
      } else if (item.tareaProfesional.includes('Especialidad')) {
        datosPlantilla.honorariosEspecialidades.push(grupoItem);
      } else {
        datosPlantilla.honorariosAdicionales.push(grupoItem);
      }
    });
  }

  // Calcular subtotales
  datosPlantilla.subtotalObra = datosPlantilla.honorariosObra.reduce((sum, h) => sum + h.importe, 0);
  datosPlantilla.subtotalAdicionales = datosPlantilla.honorariosAdicionales.reduce((sum, h) => sum + h.importe, 0);
  datosPlantilla.subtotalEspecialidades = datosPlantilla.honorariosEspecialidades.reduce((sum, h) => sum + h.importe, 0);
  
  // Formatear subtotales y totales
  datosPlantilla.subtotalObraARS = formatCurrency(datosPlantilla.subtotalObra);
  datosPlantilla.subtotalObraUSD = formatCurrency(datosPlantilla.subtotalObra / (testData.formData.cotizDolar || 1));
  
  datosPlantilla.subtotalAdicionalesARS = formatCurrency(datosPlantilla.subtotalAdicionales);
  datosPlantilla.subtotalAdicionalesUSD = formatCurrency(datosPlantilla.subtotalAdicionales / (testData.formData.cotizDolar || 1));
  
  datosPlantilla.subtotalEspecialidadesARS = formatCurrency(datosPlantilla.subtotalEspecialidades);
  datosPlantilla.subtotalEspecialidadesUSD = formatCurrency(datosPlantilla.subtotalEspecialidades / (testData.formData.cotizDolar || 1));
  
  const totalGeneral = datosPlantilla.subtotalObra + datosPlantilla.subtotalAdicionales + datosPlantilla.subtotalEspecialidades;
  datosPlantilla.totalGeneralARS = formatCurrency(totalGeneral);
  datosPlantilla.totalGeneralUSD = formatCurrency(totalGeneral / (testData.formData.cotizDolar || 1));
  
  console.log('✅ Datos preparados OK');
  console.log(`   - Honorarios Obra: ${datosPlantilla.honorariosObra.length} items`);
  console.log(`   - Honorarios Adicionales: ${datosPlantilla.honorariosAdicionales.length} items`);
  console.log(`   - Honorarios Especialidades: ${datosPlantilla.honorariosEspecialidades.length} items`);
  console.log(`   - Total General ARS: ${datosPlantilla.totalGeneralARS}\n`);

  // 3. Cargar template HTML
  const templatePath = path.join(__dirname, '../templates/certificado-basico-proyecto-direccion.html');
  console.log('📂 Cargando template HTML...');
  const templateHTML = fs.readFileSync(templatePath, 'utf8');
  console.log('✅ Template cargado OK\n');

  // 4. Compilar y renderizar
  console.log('🔄 Compilando template con Handlebars...');
  const compiledTemplate = Handlebars.compile(templateHTML);
  
  console.log('🔄 Hidratando template con test data...');
  const htmlRenderizado = compiledTemplate(datosPlantilla);
  
  console.log('✅ Template hidratado SIN ERRORES\n');

  // Guardar HTML renderizado para inspección
  const outputPath = path.join(__dirname, 'test-output-hydrated.html');
  fs.writeFileSync(outputPath, htmlRenderizado, 'utf8');
  console.log(`💾 HTML renderizado guardado en: ${outputPath}\n`);

  // 5. Verificaciones de contenido
  console.log('🔍 Verificando contenido renderizado...');
  
  const checks = [
    { test: htmlRenderizado.includes('PRUEBA'), desc: 'Nombre proyecto presente' },
    { test: htmlRenderizado.includes('Inmobiliaria ABC SA'), desc: 'Cliente presente' },
    { test: htmlRenderizado.includes('2500'), desc: 'Superficie presente (2500 m²)' },
    { test: htmlRenderizado.includes('$ 500.000.000,00'), desc: 'Valor obra ARS formateado' },
    { test: /\$ 344[.,]?\d{3}[.,]\d{2}/.test(htmlRenderizado), desc: 'Valor obra USD presente' },
    { test: !htmlRenderizado.includes('{{'), desc: 'Sin variables sin reemplazar' },
    { test: !htmlRenderizado.includes('undefined'), desc: 'Sin valores undefined' },
    { test: htmlRenderizado.includes('<img'), desc: 'Logo CPAU presente' },
    { test: htmlRenderizado.includes('$ 77.200.000,00'), desc: 'Total honorarios presente' }
  ];

  let allPassed = true;
  checks.forEach(check => {
    const status = check.test ? '✅' : '❌';
    console.log(`${status} ${check.desc}`);
    if (!check.test) allPassed = false;
  });

  console.log('\n' + '═'.repeat(60));
  
  if (allPassed) {
    console.log('\n✅ ¡PRUEBA DE HIDRATACIÓN EXITOSA!');
    console.log('   El test-data-templates.json es 100% funcional.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Prueba completada con advertencias');
    console.log('   Revisar los checks fallidos arriba.\n');
    process.exit(1);
  }

} catch (error) {
  console.error('\n❌ ERROR en prueba de hidratación:\n');
  console.error(error);
  console.error('\n' + '═'.repeat(60));
  console.error('\nPosibles causas:');
  console.error('- Test data JSON con sintaxis incorrecta');
  console.error('- Template HTML con errores Handlebars');
  console.error('- Falta algún campo requerido en test data');
  console.error('- Helpers de Handlebars no registrados\n');
  process.exit(1);
}
