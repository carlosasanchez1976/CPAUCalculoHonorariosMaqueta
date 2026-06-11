/**
 * pdfService.js
 * Servicio para generar certificados PDF con Puppeteer
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * SPEC: SPEC010-CALC-Entregables (T010-003)
 */

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// Detectar si estamos en Lambda o local
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

/**
 * Genera un certificado PDF con Puppeteer
 * @param {Object} datos - { tipoCalculo, formData, calculationResult, calculationNumber }
 * @returns {Buffer} Buffer del PDF generado
 */
async function generarCertificado(datos) {
  let browser;
  
  try {
    console.log('[PDF] Iniciando generación de certificado...');
    
    // Construir HTML del certificado (hardcodeado en Fase 1)
    const htmlContent = construirHTMLCertificado(datos);

    // Configuración de Puppeteer según entorno
    const launchOptions = isLambda
      ? {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        }
      : {
          // Configuración local (Windows)
          executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };

    console.log(`[PDF] Entorno: ${isLambda ? 'Lambda' : 'Local'}`);

    // Lanzar navegador
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Setear contenido HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0' // Espera a que carguen imágenes embebidas
    });

    console.log('[PDF] HTML cargado, generando PDF...');

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      preferCSSPageSize: false // Forzar formato A4
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
 * Construye el HTML del certificado (plantilla hardcodeada)
 * TODO: Migrar a tabla Entregables_PDF en Fase 2 (T010-002)
 */
function construirHTMLCertificado(datos) {
  const { formData, calculationResult, calculationNumber } = datos;
  const currentDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

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
          background: white;
        }
        
        .page:last-child {
          page-break-after: auto;
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
              <span class="metadata-item">Fecha: ${currentDate}</span>
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
        <h3 class="section-title">Notas sobre el Cálculo de Honorarios</h3>
        <div class="notas-content">${getNotasPDF()}</div>
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
 * Formatea número como moneda ARS
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
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
  generarCertificado
};
