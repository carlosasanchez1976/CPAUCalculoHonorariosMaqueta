/**
 * pdfService.js
 * Servicio para generar certificados PDF con Puppeteer
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * SPEC: SPEC010-CALC-Entregables (T010-003, T010-002)
 */

// Importar Handlebars con helpers registrados
const Handlebars = require('../utils/handlebarsHelpers');
const entregablesService = require('./entregablesService');

// Detectar si estamos en Lambda o local
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Genera un certificado PDF con Puppeteer
 * @param {Object} datos - { tipoCalculo, tipoNombre, formData, calculationResult }
 * @returns {Buffer} Buffer del PDF generado
 */
async function generarCertificado(datos) {
  let browser;
  
  try {
    console.log('[PDF] Iniciando generación de certificado...');
    console.log('[PDF] Tipo de cálculo:', datos.tipoCalculo);
    console.log('[PDF] Tipo nombre:', datos.tipoNombre);
    console.log('[PDF] Tarea ID:', datos.formData?.tareaId);
    
    // Dynamic imports de módulos ESM
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');
    
    // FASE 2: Intentar cargar plantilla desde DB
    let htmlContent;
    try {
      htmlContent = await renderizarPlantillaDB(datos);
      console.log('[PDF] Plantilla cargada desde DB');
    } catch (error) {
      console.warn('[PDF] No se pudo cargar plantilla desde DB, usando fallback hardcodeado:', error.message);
      // FALLBACK: Usar plantilla hardcodeada (Fase 1)
      htmlContent = construirHTMLCertificado(datos);
    }

    // Configuración de Puppeteer según entorno
    const launchOptions = isLambda
      ? {
          args: chromium.default.args,
          defaultViewport: chromium.default.defaultViewport,
          executablePath: await chromium.default.executablePath(),
          headless: chromium.default.headless,
        }
      : {
          // Configuración local (Windows)
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

    console.log(`[PDF] Entorno: ${isLambda ? 'Lambda' : 'Local'}`);

    // Lanzar navegador (usar .default para ESM)
    browser = await puppeteer.default.launch(launchOptions);
    const page = await browser.newPage();

    // Setear contenido HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0' // Espera a que carguen imágenes embebidas
    });

    console.log('[PDF] HTML cargado, generando PDF...');

    // Generar PDF con footer de numeración
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      
      // Header vacío (no necesitamos header adicional)
      headerTemplate: '<div></div>',
      
      // Footer con numeración de páginas (línea respeta márgenes laterales)
      footerTemplate: `
        <div style="
          width: 100%;
          padding: 0 12mm;
          box-sizing: border-box;
        ">
          <div style="
            width: 100%;
            padding-top: 5mm;
            font-size: 9pt; 
            color: #6b6b6b;
            text-align: right;
            border-top: 1px solid #6b6b6b;
          ">
            <span class="pageNumber"></span>/<span class="totalPages"></span>
          </div>
        </div>
      `,
      
      margin: {
        top: '15mm',     // Margen superior
        right: '12mm',   // Margen derecho
        bottom: '20mm',  // ← AUMENTAR para dar espacio al footer (de 15mm a 20mm)
        left: '12mm'     // Margen izquierdo
      },
      
      preferCSSPageSize: false
    });

    await browser.close();
    
    console.log(`[PDF] Generado exitosamente: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    return pdfBuffer;

  } catch (error) {
    console.error('[PDF] Error generando certificado:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

/**
 * Renderiza la plantilla del certificado desde la base de datos usando Handlebars
 * FASE 2: T010-002
 * @param {Object} datos - { tipoCalculo, tipoNombre, formData, calculationResult }
 * @returns {string} HTML renderizado
 */
async function renderizarPlantillaDB(datos) {
  const { tipoCalculo, tipoNombre, formData, calculationResult } = datos;
  
  // Resolver plantilla desde DB por tareaId (relación con Tareas_Profesionales)
  const plantilla = await entregablesService.resolverPlantillaEntregable(formData.tareaId);
  
  if (!plantilla) {
    throw new Error(`No se encontró plantilla para tareaId: ${formData.tareaId} (${tipoCalculo} - ${tipoNombre})`);
  }
  
  console.log(`[PDF] Plantilla encontrada: ${plantilla.nombre} (v${plantilla.version})`);
  
  // Compilar plantilla Handlebars
  const template = Handlebars.compile(plantilla.html_template);
  
  // Preparar datos para la plantilla
  const templateData = prepararDatosPlantilla(datos, plantilla);
  
  // Renderizar
  const htmlRenderizado = template(templateData);
  
  return htmlRenderizado;
}

/**
 * Prepara los datos en el formato esperado por la plantilla Handlebars
 * @param {Object} datos - Datos originales del request
 * @param {Object} plantilla - Plantilla de la DB
 * @returns {Object} Datos formateados para Handlebars (aplanados para el template)
 */
function prepararDatosPlantilla(datos, plantilla) {
  const { formData, calculationResult } = datos;
  
  // Generar número de cálculo formateado desde formData.calculoId
  const calculationNumber = formData.calculoId 
    ? String(formData.calculoId).padStart(6, '0')
    : '000000';
  
  
  // Función auxiliar para redondear
  const redondear = (valor) => Math.round(valor);

  // Parsear assets (logo CPAU)
  let logoCPAU = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+Q1BBVTWV4dD48L3N2Zz4=';
  
  try {
    if (plantilla.assets) {
      const assets = typeof plantilla.assets === 'string' 
        ? JSON.parse(plantilla.assets) 
        : plantilla.assets;
      
      if (assets.logoCPAU) {
        logoCPAU = assets.logoCPAU;
      }
    }
  } catch (error) {
    console.warn('[PDF] Error parseando assets, usando logo placeholder');
  }
  
  // Formatear valores monetarios
  const valorObraARS = formatCurrency(formData.valorObra || 0);
  const valorObraUSD = formatCurrency((formData.valorObra || 0) / (formData.cotizDolar || 1));
  
  // Organizar tareas por categoría
  const honorariosObra = [];
  const honorariosAdicionales = [];
  const honorariosEspecialidades = [];
  
  console.log('[PDF] calculationResult recibido:', JSON.stringify(calculationResult, null, 2));
  
  // Usar detalleHonorarios de calculationResult (enviado desde frontend)
  const detalleHonorarios = calculationResult?.detalleHonorarios || formData?.detalleHonorarios || [];
  
  console.log(`[PDF] Procesando ${detalleHonorarios.length} items de detalleHonorarios`);
  
  // AGRUPAR POR TAREA PROFESIONAL (igual que en el frontend)
  const agruparHonorariosPorTarea = (items) => {
    const agrupado = {};
    
    items.forEach((item) => {
      const { tareaProfesional, importe, descripcion } = item;
      const key = tareaProfesional;
      
      if (!agrupado[key]) {
        agrupado[key] = {
          tareaProfesional: tareaProfesional,
          importe: 0,
          descripcion: descripcion || null,
          conteo: 0
        };
      }
      
      agrupado[key].importe += parseFloat(importe) || 0;
      agrupado[key].conteo += 1;
    });
    
    return Object.values(agrupado);
  };
  
  const honorariosAgrupados = agruparHonorariosPorTarea(detalleHonorarios);
  
  console.log(`[PDF] Después de agrupar: ${honorariosAgrupados.length} tareas únicas`);
  
  if (Array.isArray(honorariosAgrupados) && honorariosAgrupados.length > 0) {
    honorariosAgrupados.forEach((tarea, index) => {
      const importeARS = redondear(tarea.importe || 0);
      const importeUSD = redondear(importeARS / (formData.cotizDolar || 1));
      const porcentaje = formData.valorObra > 0 
        ? (importeARS / formData.valorObra * 100).toFixed(2)
        : '0.00';
      
      const item = {
        indice: index + 1,
        tareaProfesional: tarea.tareaProfesional || 'Tarea sin nombre',
        descripcion: tarea.descripcion || '',
        importeARS: formatCurrency(importeARS),
        importeUSD: formatCurrency(importeUSD),
        porcentaje
      };
      
      // Categorizar según el nombre de la tarea
      const nombreTarea = (tarea.tareaProfesional || '').toLowerCase();
      
      if (nombreTarea.includes('proyecto de obra') || nombreTarea.includes('dirección de obra')) {
        honorariosObra.push(item);
      } else if (nombreTarea.includes('documentación ejecutiva') || nombreTarea.includes('supervisión de obra')) {
        honorariosAdicionales.push(item);
      } else {
        honorariosEspecialidades.push(item);
      }
    });
    
    console.log(`[PDF] Categorizado: ${honorariosObra.length} obra, ${honorariosAdicionales.length} adicionales, ${honorariosEspecialidades.length} especialidades`);
  } else {
    console.warn('[PDF] No se encontraron tareas en calculationResult.detalleHonorarios ni en formData.detalleHonorarios');
  }
  
  // Calcular subtotales desde los arrays categorizados
  const calcularSubtotalCategoria = (items) => {
    return items.reduce((sum, item) => {
      const valorStr = item.importeARS.replace(/[$.]/g, '').replace(',', '.');
      return sum + (parseFloat(valorStr) || 0);
    }, 0);
  };
  
  const subtotalObraARS = redondear(honorariosObra.length > 0 
    ? calcularSubtotalCategoria(honorariosObra)
    : (honorariosAgrupados.reduce((sum, t) => sum + (t.importe || 0), 0)));
  const subtotalAdicionalesARS = redondear(calcularSubtotalCategoria(honorariosAdicionales));
  const subtotalEspecialidadesARS = redondear(calcularSubtotalCategoria(honorariosEspecialidades));
  
  const totalGeneralARS = redondear(subtotalObraARS + subtotalAdicionalesARS + subtotalEspecialidadesARS);
  const totalGeneralUSD = redondear(totalGeneralARS / (formData.cotizDolar || 1));
  
  const subtotalObraPorcentaje = formData.valorObra > 0 ? (subtotalObraARS / formData.valorObra * 100).toFixed(2) : '0.00';
  const subtotalAdicionalesPorcentaje = formData.valorObra > 0 ? (subtotalAdicionalesARS / formData.valorObra * 100).toFixed(2) : '0.00';
  const subtotalEspecialidadesPorcentaje = formData.valorObra > 0 ? (subtotalEspecialidadesARS / formData.valorObra * 100).toFixed(2) : '0.00';
  const totalGeneralPorcentaje = formData.valorObra > 0 ? (totalGeneralARS / formData.valorObra * 100).toFixed(2) : '0.00';
  
  // Retornar objeto APLANADO (todos los campos en el nivel raíz)
  return {
    // Metadatos
    calculationNumber,
    fechaCalculo: formData.fechaCalculo || 'Sin especificar',
    tipoNombre: datos.tipoNombre || obtenerNombreTipoCalculo(datos.tipoCalculo), // Preferir el nombre del frontend
    logoCPAU,
    vigenciaFE: formData.vigenciaFE || '<span>Vigencia de índices: No especificada</span><br /><span>Base de cálculo: arancel sugerido CPAU</span>',
    
    // Datos del proyecto (del formData)
    nombreProyecto: formData.nombreProyecto || 'Sin nombre',
    cliente: formData.cliente || 'Sin especificar',
    tipoObra: formData.tipoObra || 'Sin especificar',
    destinoUso: formData.destinoUso || 'Sin especificar',
    labelTipoDeObra: formData.labelTipoDeObra || 'Tipo de obra',
    observProyecto: formData.observProyecto || 'Sin observaciones',
    superficieTotal: formData.superficieTotal || 0,
    valorMetro2ARS: formatCurrency(formData.valorMetro2 || 0),
    valorObraARS,
    valorObraUSD,
    horas: formData.horas || 'No especificadas',
    proyectoLabel: formData.proyectoLabel || 'encargo',
    valorObraLabel: formData.valorObraLabel || 'Valor de la obra',
    
    // Arrays de honorarios (null si están vacíos para que {{#if}} funcione)
    honorariosObra: honorariosObra.length > 0 ? honorariosObra : null,
    honorariosAdicionales: honorariosAdicionales.length > 0 ? honorariosAdicionales : null,
    honorariosEspecialidades: honorariosEspecialidades.length > 0 ? honorariosEspecialidades : null,
    
    // Subtotales
    subtotalObraARS: formatCurrency(subtotalObraARS),
    subtotalObraUSD: formatCurrency(subtotalObraARS / (formData.cotizDolar || 1)),
    subtotalObraPorcentaje,
    
    subtotalAdicionalesARS: formatCurrency(subtotalAdicionalesARS),
    subtotalAdicionalesUSD: formatCurrency(subtotalAdicionalesARS / (formData.cotizDolar || 1)),
    subtotalAdicionalesPorcentaje,
    
    subtotalEspecialidadesARS: formatCurrency(subtotalEspecialidadesARS),
    subtotalEspecialidadesUSD: formatCurrency(subtotalEspecialidadesARS / (formData.cotizDolar || 1)),
    subtotalEspecialidadesPorcentaje,
    
    // Totales
    totalGeneralARS: formatCurrency(totalGeneralARS),
    totalGeneralUSD: formatCurrency(totalGeneralUSD),
    totalGeneralPorcentaje,
    plazoEjecucion: formData.plazoEjecucion || 'Sin especificar',
    ubicacion: formData.ubicacion || 'Sin especificar'
  };
}

/**
 * Obtiene el nombre descriptivo del tipo de cálculo
 * FALLBACK: Solo se usa si no viene tipoNombre desde el frontend
 * @param {string} tipoCalculo - Código del tipo de cálculo desde la DB
 * @returns {string} Nombre descriptivo
 */
function obtenerNombreTipoCalculo(tipoCalculo) {
  const tiposNombres = {
    // Códigos reales de la tabla Tareas_Profesionales
    'PYDOA': 'Proyecto y Dirección de obras de arquitectura',
    'DEMO': 'Demoliciones',
    'GPYC': 'Gerencia de proyectos y construcciones',
    'HABI': 'Habilitaciones',
    'CONFAC': 'Conservación de fachadas',
    'CONSULT': 'Consultas y otras tareas por tiempo empleado',
    'MEDPLAN': 'Medición y ejecución de planos',
    'IMPAMB': 'Impacto ambiental',
    'PERI': 'Peritajes',
    'HYS': 'Higiene y Seguridad',
    'SAUTO': 'Sistemas de autoprotección',
    'ARBI': 'Arbitraje',
    'TASA': 'Tasación',
    'REPTEC': 'Representación técnica',
    'URBA': 'Urbanismo',
    'DISINT': 'Diseño de interiores',
    'DISPAI': 'Diseño de paisaje',
    
    // Códigos legacy (por compatibilidad)
    'basico-proyecto-direccion': 'Proyecto y Dirección - Básico',
    'completo-proyecto-direccion': 'Proyecto y Dirección - Completo',
    'relevamiento': 'Relevamiento',
    'tasacion': 'Tasación',
    'mensura': 'Mensura'
  };
  
  return tiposNombres[tipoCalculo] || 'Cálculo de Honorarios';
}

/**
 * Construye el HTML del certificado (plantilla hardcodeada)
 * FASE 1 FALLBACK: Se mantiene para compatibilidad si no hay plantilla en DB
 */
function construirHTMLCertificado(datos) {
  const { formData, calculationResult } = datos;
  
  // Generar número de cálculo formateado desde formData.calculoId
  const calculationNumber = formData.calculoId 
    ? String(formData.calculoId).padStart(6, '0')
    : '000000';
  

  // Logo CPAU embebido en base64 (SVG del header verde)
  // TODO: Reemplazar con logo real convertido a base64
  const logoCPAU = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCI+Q1BBVTWV4dD48L3N2Zz4=';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificado de Honorarios CPAU - ${calculationNumber}</title>
      
      <style>
        /* ============================================================
           ESTILOS BASE
           ============================================================ */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        /* ============================================================
           PÁGINA (A4)
           ============================================================ */
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 15mm;
          page-break-after: always;
          page-break-inside: avoid;
          background: white;
        }
        
        .page:last-child {
          page-break-after: auto;
        }
        
        /* Evitar cortes de página en elementos */
        table, .section-title, .resumen-item, .certificate-header {
          page-break-inside: avoid;
        }
        
        thead {
          display: table-header-group;
        }
        
        tr {
          page-break-inside: avoid;
        }
        
        /* ============================================================
           HEADER DEL CERTIFICADO
           ============================================================ */
        .certificate-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2d5f3f 0%, #4a8c63 100%);
          border-radius: 8px;
          margin-bottom: 25px;
          color: white;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          width: 180px;
        }
        
        .logo {
          width: 140px;
          height: auto;
        }
        
        .header-right {
          flex: 1;
          text-align: right;
        }
        
        .header-title {
          font-size: 18pt;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        
        .header-metadata {
          font-size: 9pt;
          opacity: 0.95;
        }
        
        .metadata-item {
          display: inline-block;
          margin-right: 15px;
        }
        
        /* ============================================================
           LAYOUT DE DOS COLUMNAS
           ============================================================ */
        .two-column-layout {
          display: flex;
          gap: 20px;
          margin-top: 20px;
        }
        
        .left-column {
          flex: 1;
          min-width: 0;
        }
        
        .right-column {
          flex: 1.2;
          min-width: 0;
        }
        
        /* ============================================================
           SECCIONES
           ============================================================ */
        .section-title {
          font-size: 12pt;
          font-weight: 600;
          color: #2d5f3f;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        /* ============================================================
           RESUMEN DEL PROYECTO
           ============================================================ */
        .resumen-grid {
          display: grid;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .resumen-item {
          display: flex;
          padding: 8px;
          background: #f9f9f9;
          border-radius: 4px;
        }
        
        .resumen-label {
          font-weight: 600;
          color: #555;
          min-width: 120px;
        }
        
        .resumen-value {
          color: #333;
        }
        
        /* ============================================================
           TABLA DE HONORARIOS
           ============================================================ */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 9pt;
        }
        
        thead th {
          background: #f5f5f5;
          padding: 10px 8px;
          text-align: left;
          border-bottom: 2px solid #ddd;
          font-weight: 600;
          color: #333;
        }
        
        tbody td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        
        tbody tr:hover {
          background: #f9f9f9;
        }
        
        .total-row {
          background: #2d5f3f !important;
          color: white !important;
          font-weight: 700;
          font-size: 10pt;
        }
        
        .total-row td {
          padding: 12px 8px;
          border-bottom: none;
        }
        
        .text-right {
          text-align: right;
        }
        
        /* ============================================================
           NOTAS (PÁGINA 2)
           ============================================================ */
        .notas-section {
          margin-top: 30px;
        }
        
        .notas-content {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          font-size: 9pt;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        
        /* ============================================================
           FOOTER
           ============================================================ */
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 8pt;
          color: #777;
        }
      </style>
    </head>
    <body>
      <!-- PÁGINA 1: Datos del cálculo -->
      <div class="page">
        <div class="certificate-header">
          <div class="header-left">
            <img src="${logoCPAU}" alt="CPAU Logo" class="logo">
          </div>
          <div class="header-right">
            <div class="header-title">Cálculo de honorarios profesionales</div>
            <div class="header-metadata">
              <span class="metadata-item">Fecha: </span>
              <span class="metadata-item">Nº: ${calculationNumber}</span>
            </div>
          </div>
        </div>
        
        <div class="two-column-layout">
          <div class="left-column">
            <h3 class="section-title">Resumen del Proyecto</h3>
            <div class="resumen-grid">
              <div class="resumen-item">
                <span class="resumen-label">Nombre:</span>
                <span class="resumen-value">${formData.nombreProyecto || 'N/A'}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Cliente:</span>
                <span class="resumen-value">${formData.cliente || 'N/A'}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Superficie:</span>
                <span class="resumen-value">${formData.superficieTotal || 0} m²</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Costo estimado:</span>
                <span class="resumen-value">${formatCurrency(formData.valorObra || 0)}</span>
              </div>
            </div>
          </div>
          
          <div class="right-column">
            <h3 class="section-title">Detalle de honorarios</h3>
            <table>
              <thead>
                <tr>
                  <th>Tarea Profesional</th>
                  <th class="text-right">Importe ARS</th>
                </tr>
              </thead>
              <tbody>
                ${generarFilasTabla(calculationResult)}
                <tr class="total-row">
                  <td><strong>TOTAL GENERAL</strong></td>
                  <td class="text-right"><strong>${formatCurrency(calculationResult.totalGeneral || 0)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>Consejo Profesional de Arquitectura y Urbanismo</p>
          <p>www.cpau.org | Cálculo generado automáticamente por sistema CH2026</p>
        </div>
      </div>
      
      <!-- PÁGINA 2: Notas -->
      <div class="page">
        <div class="certificate-header">
          <div class="header-left">
            <img src="${logoCPAU}" alt="CPAU Logo" class="logo">
          </div>
          <div class="header-right">
            <div class="header-title">Cálculo de honorarios profesionales</div>
            <div class="header-metadata">
              <span class="metadata-item">Fecha: </span>
              <span class="metadata-item">Nº: ${calculationNumber}</span>
            </div>
          </div>
        </div>
        
        <h3 class="section-title">Notas sobre el Cálculo de Honorarios</h3>
        <div class="notas-content">${getNotasPDF()}</div>
        
        <div class="footer">
          <p>Consejo Profesional de Arquitectura y Urbanismo</p>
          <p>www.cpau.org | Cálculo generado automáticamente por sistema CH2026</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Genera filas de la tabla de honorarios
 * TODO: Implementar según estructura real de calculationResult
 */
function generarFilasTabla(calculationResult) {
  // Placeholder - implementar con datos reales del resultado del cálculo
  // Por ahora retorna una fila de ejemplo
  if (!calculationResult || !calculationResult.tareas) {
    return `
      <tr>
        <td>Proyecto y Dirección de Obra</td>
        <td class="text-right">${formatCurrency(calculationResult?.totalGeneral || 0)}</td>
      </tr>
    `;
  }
  
  // TODO: Iterar sobre calculationResult.tareas y generar filas reales
  return '<tr><td colspan="2">Implementar con estructura real de datos</td></tr>';
}

/**
 * Formatea número como moneda ARS sin decimales
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Obtiene el texto de las notas del PDF
 * TODO: Migrar de pdfConstants.js del frontend
 */
function getNotasPDF() {
  return `NOTAS SOBRE EL CÁLCULO DE HONORARIOS PROFESIONALES

1. Metodología de cálculo:
   - Los honorarios se calculan según la legislación vigente del CPAU
   - Se aplican coeficientes específicos por tarea profesional
   - Los valores se actualizan según los parámetros vigentes

2. Tareas profesionales incluidas:
   - Proyecto y Dirección de Obra
   - Instalaciones especiales (según corresponda)
   - Estructuras (según corresponda)

3. Consideraciones importantes:
   - Los honorarios indicados son valores orientativos
   - Consultar aranceles vigentes en www.cpau.org
   - Verificar actualización de parámetros (valor K, cotización dólar)

4. Validez del cálculo:
   - Este cálculo es válido a la fecha de emisión
   - Sujeto a variaciones según normativa vigente

Para consultas: www.cpau.org`;
}

module.exports = {
  generarCertificado,
  prepararDatosPlantilla
};
