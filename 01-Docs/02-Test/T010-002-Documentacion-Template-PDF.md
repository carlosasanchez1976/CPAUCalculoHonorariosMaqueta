# TEMPLATE PDF - CERTIFICADO DE HONORARIOS CPAU
## Básico Proyecto y Dirección

**Fecha:** 11/06/2026  
**Versión:** 1.0  
**Estado:** ✅ Diseño completo - Pendiente carga en BD  
**entregable_id:** 1

---

## 📋 ÍNDICE
1. [Descripción General](#descripción-general)
2. [Estructura del Diseño](#estructura-del-diseño)
3. [Placeholders y Datos Dinámicos](#placeholders-y-datos-dinámicos)
4. [Estilos y Formato](#estilos-y-formato)
5. [Proceso de Carga en BD](#proceso-de-carga-en-bd)
6. [Integración con pdfService](#integración-con-pdfservice)
7. [Testing y Validación](#testing-y-validación)

---

## 1. DESCRIPCIÓN GENERAL

Este template HTML corresponde al certificado PDF de honorarios profesionales para el cálculo de tipo "Básico - Proyecto y Dirección". Fue extraído del componente frontend `ResultadoBasicoDetalle.jsx` y adaptado para ser almacenado en la base de datos y procesado con Handlebars + Puppeteer en el backend.

### Características principales:
- **Formato:** A4 (210mm x 297mm)
- **Páginas:** 2
- **Motor:** Handlebars
- **Ubicación:** `App/Backend/Node/templates/certificado-basico-proyecto-direccion.html`
- **Tamaño:** ~18 KB

---

## 2. ESTRUCTURA DEL DISEÑO

### 📄 PÁGINA 1: Datos del Cálculo

```
┌─────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════╗  │
│ ║ [LOGO]  | Cálculo de honorarios profesionales ║  │
│ ║         | Tipo: xxx | Fecha: DD/MM/YYYY       ║  │
│ ╚═══════════════════════════════════════════════╝  │
│                                                      │
│ ── Resumen del Proyecto ────────────────────────   │
│ ┌──────────────────────────────────────────────┐   │
│ │ Nombre del Proyecto: [Valor]                 │   │
│ │ Comitente: [Valor]                           │   │
│ │ Tipo de obra: [Valor]                        │   │
│ │ Destino/Uso: [Valor]                         │   │
│ │ Superficie total: [Valor] m²                 │   │
│ │ Costo estimado (ARS): [Valor]                │   │
│ │ Costo estimado (USD): [Valor]                │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ ⚠️ IMPORTANTE                                 │   │
│ │ Este cálculo es una estimación de referencia │   │
│ │ [texto completo del disclaimer]              │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ── Detalle de honorarios ───────────────────────   │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ Tabla: Honorarios obra                      │    │
│ │ ├─ Ítem | Tarea | ARS | USD | %             │    │
│ │ ├─ ...                                      │    │
│ │ └─ SUBTOTAL (azul)                          │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ Tabla: Honorarios adicionales               │    │
│ │ └─ SUBTOTAL (azul)                          │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ Tabla: Especialidades                       │    │
│ │ └─ SUBTOTAL (azul)                          │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ ┌─────────────────────────────────────────────┐    │
│ │ TOTAL GENERAL (morado)                      │    │
│ │ Plazo estimado: X meses                     │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
│ NOTA: Este honorario NO incluye IVA                │
└─────────────────────────────────────────────────────┘
```

### 📄 PÁGINA 2: Notas Institucionales

```
┌─────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════╗  │
│ ║ [LOGO]  | Cálculo de honorarios profesionales ║  │
│ ║         | Tipo: xxx | Fecha: DD/MM/YYYY       ║  │
│ ╚═══════════════════════════════════════════════╝  │
│                                                      │
│ ── Notas ───────────────────────────────────────   │
│                                                      │
│ • Alcance y carácter del cálculo                   │
│   [texto completo]                                  │
│                                                      │
│ • Costo de obra considerado                        │
│   [texto completo]                                  │
│                                                      │
│ • Etapas del proyecto                              │
│   ┌─────────────────────────────┐                  │
│   │ Croquis preliminar     10%  │                  │
│   │ Anteproyecto          15%   │                  │
│   │ Proyecto básico       15%   │                  │
│   │ Doc. licitatoria      20%   │                  │
│   │ Total proyecto        60%   │                  │
│   │ Dirección de obra     40%   │                  │
│   └─────────────────────────────┘                  │
│                                                      │
│ • Alcance de los honorarios sugeridos             │
│ • Conceptos no incluidos                           │
│ • Resolución de los honorarios                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 3. PLACEHOLDERS Y DATOS DINÁMICOS

### Variables de encabezado
```handlebars
{{calculationNumber}}    - Número de cálculo (ej: 20260611-001)
{{logoCPAU}}            - Logo en base64 (data:image/png;base64,...)
{{tipoNombre}}          - Tipo de cálculo (ej: "Básico - Proyecto y Dirección")
{{currentDate}}         - Fecha actual DD/MM/YYYY
```

### Variables de proyecto
```handlebars
{{nombreProyecto}}      - Nombre del proyecto
{{cliente}}             - Comitente/Cliente
{{tipoObra}}            - Tipo de obra
{{destinoUso}}          - Destino/Uso
{{superficieTotal}}     - Superficie total (número)
{{valorObraARS}}        - Valor obra formateado $ 1.234.567,89
{{valorObraUSD}}        - Valor obra formateado USD 1,234.56
{{plazoEjecucion}}      - Plazo en meses (número)
```

### Bloques condicionales
```handlebars
{{#if honorariosObra}}
  <!-- Tabla de honorarios obra -->
{{/if}}

{{#if honorariosAdicionales}}
  <!-- Tabla de honorarios adicionales -->
{{/if}}

{{#if honorariosEspecialidades}}
  <!-- Tabla de especialidades -->
{{/if}}
```

### Iteradores de datos
```handlebars
{{#each honorariosObra}}
  <tr>
    <td class="centered">{{this.indice}}</td>
    <td>{{this.tareaProfesional}}</td>
    <td class="right-align">{{this.importeARS}}</td>
    <td class="right-align">{{this.importeUSD}}</td>
    <td class="centered">{{this.porcentaje}}%</td>
  </tr>
{{/each}}
```

### Subtotales
```handlebars
{{subtotalObraARS}}
{{subtotalObraUSD}}
{{subtotalObraPorcentaje}}

{{subtotalAdicionalesARS}}
{{subtotalAdicionalesUSD}}
{{subtotalAdicionalesPorcentaje}}

{{subtotalEspecialidadesARS}}
{{subtotalEspecialidadesUSD}}
{{subtotalEspecialidadesPorcentaje}}
```

### Total general
```handlebars
{{totalGeneralARS}}
{{totalGeneralUSD}}
```

---

## 4. ESTILOS Y FORMATO

### Paleta de colores
```css
/* CPAU Brand */
--morado-cpau: #5c4a8d          /* Header principal, total general */
--morado-claro: #7a6ba8         /* Gradiente header */
--celeste-cpau: #90dede         /* Banda título */
--celeste-claro: #b8e6e6        /* Gradiente banda */

/* Subtotales y destacados */
--azul-subtotales: #4682b4      /* Subtotales de secciones */

/* Disclaimer */
--amarillo-border: #ffd966      /* Borde del cuadro IMPORTANTE */
--amarillo-bg: #fffbf0          /* Fondo del cuadro IMPORTANTE */
--amarillo-text: #856404        /* Texto del título IMPORTANTE */

/* Backgrounds */
--gris-claro: #f9f9f9           /* Fondo resumen, hover tablas */
--gris-medio: #f0f0f0           /* Fondo nota final */
--gris-oscuro: #f5f5f5          /* Header tablas */
```

### Tipografía
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif

/* Tamaños */
body:           10pt
section-title:  11pt
total-row:      10pt (bold)
tablas:         9pt
notas:          9pt
etapas-nota:    8pt (italic)
```

### Márgenes y espaciado
```css
/* Página A4 */
width: 210mm
min-height: 297mm
padding: 20mm 15mm

/* Márgenes PDF Puppeteer */
margin: {
  top: '10mm',
  right: '10mm',
  bottom: '10mm',
  left: '10mm'
}
```

### Clases CSS clave
```css
.page                   - Contenedor de página (page-break-after)
.certificate-header     - Header CPAU con gradiente
.header-title           - Banda celeste con título
.resumen-grid           - Grid 2 columnas del resumen proyecto
.disclaimer             - Cuadro amarillo IMPORTANTE
.section-title          - Títulos de secciones
.table-section          - Contenedor de cada tabla
.subtotal-row           - Fila de subtotal (azul)
.total-row              - Fila de total general (morado)
.nota-final             - Nota sobre IVA
.notas-section          - Contenedor de notas página 2
.nota-block             - Cada sección de notas
.etapas-table           - Tabla de etapas del proyecto
```

---

## 5. PROCESO DE CARGA EN BD

### Paso 1: Verificar tabla Entregables_PDF

```sql
-- Verificar estructura de la tabla
DESCRIBE Entregables_PDF;

-- Campos esperados:
-- entregable_id (PK)
-- tarea_profesional_id (FK)
-- nombre_plantilla
-- descripcion
-- html_template (TEXT/LONGTEXT)
-- css_inline (TEXT, nullable)
-- version
-- activo (BOOLEAN)
-- fecha_creacion
-- creado_por
```

### Paso 2: Preparar el HTML

```bash
# Leer el archivo
cd App/Backend/Node/templates
cat certificado-basico-proyecto-direccion.html

# Verificar tamaño
ls -lh certificado-basico-proyecto-direccion.html
# Esperado: ~18 KB
```

### Paso 3: Insertar en la base de datos

**Opción A: INSERT directo con LOAD_FILE (MySQL)**
```sql
INSERT INTO Entregables_PDF (
  entregable_id,
  tarea_profesional_id,
  nombre_plantilla,
  descripcion,
  html_template,
  css_inline,
  version,
  activo,
  fecha_creacion,
  creado_por
) VALUES (
  1,
  1,  -- Ajustar según ID de tarea "Proyecto y Dirección Básico"
  'Certificado Básico - Proyecto y Dirección',
  'Plantilla HTML completa para certificado PDF de honorarios profesionales - Cálculo Básico Proyecto y Dirección. Motor: Handlebars. Páginas: 2 (datos + notas)',
  LOAD_FILE('/path/absoluto/certificado-basico-proyecto-direccion.html'),
  NULL,
  '1.0',
  1,
  NOW(),
  'SYSTEM'
);
```

**Opción B: INSERT con script Node.js**
```javascript
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function cargarTemplate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const htmlPath = path.join(__dirname, 'templates', 'certificado-basico-proyecto-direccion.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  const query = `
    INSERT INTO Entregables_PDF (
      entregable_id,
      tarea_profesional_id,
      nombre_plantilla,
      descripcion,
      html_template,
      css_inline,
      version,
      activo,
      fecha_creacion,
      creado_por
    ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, NOW(), ?)
  `;

  const values = [
    1,
    1, // tarea_profesional_id
    'Certificado Básico - Proyecto y Dirección',
    'Plantilla HTML completa para certificado PDF de honorarios profesionales',
    htmlContent,
    '1.0',
    1,
    'SYSTEM'
  ];

  try {
    const [result] = await connection.execute(query, values);
    console.log('✅ Template cargado exitosamente. ID:', result.insertId);
  } catch (error) {
    console.error('❌ Error cargando template:', error);
  } finally {
    await connection.end();
  }
}

cargarTemplate();
```

### Paso 4: Verificar la carga

```sql
-- Verificar que el registro existe
SELECT 
  entregable_id,
  nombre_plantilla,
  version,
  activo,
  LENGTH(html_template) as html_size_bytes,
  fecha_creacion
FROM Entregables_PDF
WHERE entregable_id = 1;

-- Esperado:
-- entregable_id: 1
-- nombre_plantilla: Certificado Básico - Proyecto y Dirección
-- version: 1.0
-- activo: 1
-- html_size_bytes: ~18000
-- fecha_creacion: fecha actual

-- Ver primeros 500 caracteres del HTML
SELECT 
  LEFT(html_template, 500) as html_preview
FROM Entregables_PDF
WHERE entregable_id = 1;
```

---

## 6. INTEGRACIÓN CON pdfService

### Paso 1: Instalar Handlebars

```bash
cd App/Backend/Node
npm install handlebars --save
```

### Paso 2: Crear templatingService.js

```javascript
// src/services/templatingService.js
const Handlebars = require('handlebars');

/**
 * Registrar helpers de formato
 */
Handlebars.registerHelper('formatCurrency', function(value) {
  if (!value || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
});

Handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
});

Handlebars.registerHelper('formatPercentage', function(value) {
  if (!value || isNaN(value)) return '0.00';
  return parseFloat(value).toFixed(2);
});

/**
 * Hidratar una plantilla Handlebars con datos
 * @param {string} templateHTML - HTML con placeholders Handlebars
 * @param {object} datos - Objeto con los datos a inyectar
 * @returns {string} - HTML completo hidratado
 */
function hidratar(templateHTML, datos) {
  const template = Handlebars.compile(templateHTML);
  return template(datos);
}

module.exports = {
  hidratar
};
```

### Paso 3: Actualizar entregablesService.js

```javascript
// src/services/entregablesService.js
const { executeStoredProcedure } = require('../config/database');

/**
 * Resolver plantilla PDF por entregable_id
 */
async function resolverPlantillaPorId(entregableId) {
  const query = `
    SELECT 
      entregable_id,
      nombre_plantilla,
      html_template,
      version
    FROM Entregables_PDF
    WHERE entregable_id = ? AND activo = 1
  `;
  
  const [rows] = await connection.execute(query, [entregableId]);
  
  if (rows.length === 0) {
    throw new Error(`No se encontró plantilla activa para entregable_id: ${entregableId}`);
  }
  
  return rows[0];
}

module.exports = {
  resolverPlantillaPorId
};
```

### Paso 4: Refactorizar pdfService.js

```javascript
// src/services/pdfService.js
const entregablesService = require('./entregablesService');
const templatingService = require('./templatingService');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function generarCertificado(datos) {
  const startTime = Date.now();
  
  // 1. Resolver plantilla desde BD
  const entregableId = 1; // Básico Proyecto y Dirección
  const plantilla = await entregablesService.resolverPlantillaPorId(entregableId);
  
  console.log(`[PDF] Plantilla: ${plantilla.nombre_plantilla} v${plantilla.version}`);
  
  // 2. Preparar datos para hidratación
  const datosTemplate = prepararDatosParaTemplate(datos);
  
  // 3. Hidratar template con Handlebars
  const htmlContent = templatingService.hidratar(plantilla.html_template, datosTemplate);
  
  // 4. Generar PDF con Puppeteer
  const browser = await puppeteer.launch({...});
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      preferCSSPageSize: true
    });
    
    const duration = Date.now() - startTime;
    console.log(`[PDF] Generado en ${duration}ms - ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

/**
 * Preparar datos en el formato que espera el template
 */
function prepararDatosParaTemplate(datos) {
  const { formData, calculationResult, calculationNumber } = datos;
  
  // Categorizar honorarios en 3 grupos
  const { obra, adicionales, especialidades } = categorizarHonorarios(
    formData.detalleHonorarios || []
  );
  
  return {
    // Variables de encabezado
    calculationNumber,
    logoCPAU: getLogoBase64(), // Cargar logo en base64
    tipoNombre: formData.tipoNombre || 'Básico - Proyecto y Dirección',
    currentDate: formatDate(new Date()),
    
    // Variables de proyecto
    nombreProyecto: formData.nombreProyecto,
    cliente: formData.cliente,
    tipoObra: formData.tipoObra || 'Obra nueva',
    destinoUso: formData.destinoUso || 'Vivienda unifamiliar',
    superficieTotal: formData.superficieTotal,
    valorObraARS: formatCurrency(formData.valorObra),
    valorObraUSD: formatCurrency(formData.valorObra / formData.cotizDolar),
    plazoEjecucion: formData.plazoEjecucion || 12,
    
    // Honorarios categorizado
    honorariosObra: obra.length > 0 ? obra : null,
    honorariosAdicionales: adicionales.length > 0 ? adicionales : null,
    honorariosEspecialidades: especialidades.length > 0 ? especialidades : null,
    
    // Subtotales
    ...calcularSubtotales(obra, adicionales, especialidades, formData),
    
    // Total general
    totalGeneralARS: formatCurrency(calculationResult.totalGeneral),
    totalGeneralUSD: formatCurrency(calculationResult.totalGeneral / formData.cotizDolar)
  };
}

module.exports = {
  generarCertificado
};
```

---

## 7. TESTING Y VALIDACIÓN

### Checklist de pruebas

```
☐ INSERT en BD exitoso
  ☐ Registro entregable_id = 1 existe
  ☐ html_template no es NULL
  ☐ html_template tiene ~18 KB

☐ Hidratación del template
  ☐ Todos los placeholders {{xxx}} se reemplazan
  ☐ Bloques {{#if}} funcionan correctamente
  ☐ Iteradores {{#each}} generan las filas de tabla
  ☐ Helpers formatCurrency, formatDate, formatPercentage funcionan

☐ Generación del PDF
  ☐ PDF se genera sin errores
  ☐ PDF tiene 2 páginas
  ☐ Texto es seleccionable (no es imagen)
  ☐ Logo CPAU se ve correctamente
  ☐ Colores coinciden con el diseño (morado, celeste, azul, amarillo)
  ☐ Tablas alineadas correctamente
  ☐ Salto de página entre página 1 y 2 es limpio
  ☐ Header repetido en página 2

☐ Validación visual
  ☐ Comparar PDF generado con screenshots del diseño aprobado
  ☐ Verificar márgenes y espaciado
  ☐ Verificar tipografía y tamaños de fuente
  ☐ Verificar alineación de columnas en tablas

☐ Testing de datos edge cases
  ☐ Proyecto con nombre muy largo (>100 caracteres)
  ☐ Honorarios con 1 sola tarea
  ☐ Honorarios con 20+ tareas
  ☐ Valores monetarios muy altos (>$1.000.000.000)
  ☐ Sin honorarios adicionales (solo obra)
  ☐ Sin honorarios especialidades

☐ Performance
  ☐ Tiempo de generación < 5 segundos
  ☐ Tamaño del PDF < 500 KB
  ☐ No hay memory leaks (Puppeteer cierra correctamente)

☐ Integración end-to-end
  ☐ POST /api/calculos/exportar-pdf funciona con template de BD
  ☐ Frontend descarga el PDF correctamente
  ☐ PDF abre en Adobe Reader sin errores
  ☐ PDF abre en Chrome PDF viewer correctamente
  ☐ PDF imprime correctamente
```

### Comandos de prueba

```bash
# Test local del servicio
node test-pdf-service.js

# Test del endpoint con Postman
curl -X POST http://localhost:5000/api/calculos/exportar-pdf \
  -H "Content-Type: application/json" \
  -d @test-payload-pdf.json \
  --output test-output.pdf

# Verificar que el PDF es válido
file test-output.pdf
# Output esperado: PDF document, version X.X

# Ver info del PDF
pdfinfo test-output.pdf
# Verificar: Pages: 2, File size: < 500 KB
```

---

## 📝 NOTAS FINALES

1. **Logo en base64:** El logo de CPAU debe estar embebido en base64 en el HTML o cargarse dinámicamente en `prepararDatosParaTemplate()`. La ruta `/assets/icons/logoBlanco.svg` del frontend no funciona en Lambda.

2. **Textos de notas:** Los textos de la página 2 están hardcodeados en el HTML. Si necesitan ser dinámicos en el futuro, moverlos a la tabla `PDF_Textos_Institucionales` con campos `seccion`, `titulo`, `contenido`.

3. **Versionado:** Cada cambio al template debe crear una nueva versión. Mantener versiones anteriores activas solo si se requiere regenerar PDFs históricos con el mismo diseño.

4. **Futuras plantillas:** Este mismo proceso se repite para otros tipos de entregables:
   - entregable_id = 2 → Relevamiento
   - entregable_id = 3 → Tasación
   - entregable_id = 4 → Mensura
   - etc.

5. **Mantenibilidad:** Evitar editar directamente en BD. Mantener la fuente en `App/Backend/Node/templates/` y re-insertar cuando haya cambios.

---

**Creado por:** GitHub Copilot  
**Última actualización:** 11/06/2026  
**Ticket:** T010-002
