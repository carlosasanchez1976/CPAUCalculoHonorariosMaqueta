/**
 * test-handlebars-render.js
 * Script de prueba para validar renderizado de plantillas Handlebars
 * SPEC: SPEC010-CALC-Entregables (T010-002)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Handlebars = require('./src/utils/handlebarsHelpers');
const entregablesService = require('./src/services/entregablesService');

// Datos de prueba
const datosTesteo = {
  tipoCalculo: 'basico-proyecto-direccion',
  calculationNumber: '20260612-TEST-001',
  formData: {
    nombreProyecto: 'Edificio Residencial San Martín',
    cliente: 'Constructora ABC S.A.',
    tipoObra: 'Obra Nueva',
    destinoUso: 'Vivienda Multifamiliar',
    superficieTotal: 1500,
    valorObra: 150000000,
    cotizDolar: 1050
  },
  calculationResult: {
    totalGeneral: 8250000,
    tareas: [
      {
        nombre: 'Proyecto de Arquitectura',
        importe: 4500000
      },
      {
        nombre: 'Dirección de Obra',
        importe: 3750000
      }
    ]
  }
};

async function testRenderizado() {
  try {
    console.log('='.repeat(60));
    console.log('TEST: Renderizado de Plantilla Handlebars');
    console.log('='.repeat(60));
    console.log('');
    
    // 1. Cargar plantilla desde DB
    console.log('[1/4] Cargando plantilla desde DB...');
    const plantilla = await entregablesService.resolverPlantillaPorCodigo(datosTesteo.tipoCalculo);
    
    if (!plantilla) {
      throw new Error(`No se encontró plantilla para: ${datosTesteo.tipoCalculo}`);
    }
    
    console.log(`✅ Plantilla encontrada: ${plantilla.nombre}`);
    console.log(`   Versión: ${plantilla.version}`);
    console.log(`   Motor: ${plantilla.template_engine}`);
    console.log(`   Tamaño HTML: ${(plantilla.html_template.length / 1024).toFixed(2)} KB`);
    console.log('');
    
    // 2. Compilar plantilla
    console.log('[2/4] Compilando plantilla Handlebars...');
    const template = Handlebars.compile(plantilla.html_template);
    console.log('✅ Plantilla compilada correctamente');
    console.log('');
    
    // 3. Preparar datos
    console.log('[3/4] Preparando datos para renderizado...');
    
    const currentDate = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Parsear assets
    let assets = {};
    try {
      if (plantilla.assets) {
        assets = typeof plantilla.assets === 'string' 
          ? JSON.parse(plantilla.assets) 
          : plantilla.assets;
      }
    } catch (error) {
      console.warn('⚠️  Error parseando assets, usando placeholder');
    }
    
    // Organizar tareas en categorías
    const categorias = {
      obra: datosTesteo.calculationResult.tareas.map((tarea, index) => ({
        indice: index + 1,
        tareaProfesional: tarea.nombre,
        importe: tarea.importe
      })),
      adicionales: [],
      especialidades: []
    };
    
    const subtotales = {
      obra: {
        totalARS: datosTesteo.calculationResult.totalGeneral,
        totalUSD: datosTesteo.calculationResult.totalGeneral / datosTesteo.formData.cotizDolar,
        totalPorcentaje: (datosTesteo.calculationResult.totalGeneral / datosTesteo.formData.valorObra * 100)
      },
      adicionales: { totalARS: 0, totalUSD: 0, totalPorcentaje: 0 },
      especialidades: { totalARS: 0, totalUSD: 0, totalPorcentaje: 0 }
    };
    
    const totales = {
      totalARS: datosTesteo.calculationResult.totalGeneral,
      totalUSD: datosTesteo.calculationResult.totalGeneral / datosTesteo.formData.cotizDolar,
      totalPorcentaje: (datosTesteo.calculationResult.totalGeneral / datosTesteo.formData.valorObra * 100)
    };
    
    const templateData = {
      calculationNumber: datosTesteo.calculationNumber,
      currentDate,
      formData: {
        ...datosTesteo.formData,
        tipoNombre: 'Proyecto y Dirección - Básico'
      },
      categorias,
      subtotales,
      totales,
      notas: 'NOTAS SOBRE EL CÁLCULO DE HONORARIOS PROFESIONALES\n\n1. Metodología de cálculo...',
      assets
    };
    
    console.log('✅ Datos preparados:');
    console.log(`   - Proyecto: ${templateData.formData.nombreProyecto}`);
    console.log(`   - Superficie: ${templateData.formData.superficieTotal} m²`);
    console.log(`   - Total: $ ${totales.totalARS.toLocaleString('es-AR')}`);
    console.log(`   - Categorías: ${categorias.obra.length} tareas`);
    console.log('');
    
    // 4. Renderizar
    console.log('[4/4] Renderizando plantilla...');
    const htmlRenderizado = template(templateData);
    console.log(`✅ HTML renderizado: ${(htmlRenderizado.length / 1024).toFixed(2)} KB`);
    console.log('');
    
    // 5. Guardar resultado
    const outputPath = path.join(__dirname, 'test-output-certificado.html');
    fs.writeFileSync(outputPath, htmlRenderizado, 'utf-8');
    console.log(`📄 HTML guardado en: ${outputPath}`);
    console.log('');
    
    // 6. Resumen
    console.log('='.repeat(60));
    console.log('✅ TEST EXITOSO');
    console.log('='.repeat(60));
    console.log('');
    console.log('Próximos pasos:');
    console.log('1. Abrir test-output-certificado.html en un navegador');
    console.log('2. Validar que el contenido se ve correctamente');
    console.log('3. Verificar que los helpers de Handlebars funcionan');
    console.log('4. Probar la generación completa del PDF con pdfService');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ ERROR EN TEST:');
    console.error('='.repeat(60));
    console.error(error);
    console.error('='.repeat(60));
    console.error('');
    console.error('Stack trace completo:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar test
testRenderizado();
