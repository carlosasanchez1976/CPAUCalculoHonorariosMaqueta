const fs = require('fs');
const path = require('path');

// Leer el HTML
const htmlPath = path.join(__dirname, '..', 'templates', 'certificado-otras-tareas.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Convertir a hexadecimal (método más seguro para MySQL)
const hex = Buffer.from(html, 'utf8').toString('hex');

// Generar SQL
const sql = `-- ============================================================================
-- SCRIPT: Cargar template PDF en Entregables_PDF
-- Template: Certificado Otras Tareas
-- entregable_id: 2
-- Fecha: 2026-06-11
-- ============================================================================

-- IMPORTANTE: Este archivo contiene el HTML en formato hexadecimal
-- para evitar problemas con comillas simples/dobles.

-- UPSERT: inserta el registro si no existe, o actualiza el html_template si ya existe.
-- Una sola ejecución aplica el template tanto en alta como en actualización.
INSERT INTO Entregables_PDF (
  entregable_id,
  nombre,
  codigo,
  descripcion,
  version,
  html_template,
  css_styles,
  pdf_config,
  template_engine,
  placeholders,
  user_id
) VALUES (
  2,
  'Certificado Otras Tareas',
  'otras-tareas',
  'Plantilla HTML completa para certificado PDF de honorarios profesionales - Cálculo Otras Tareas. Motor: Handlebars. Páginas: 2 (datos + notas institucionales CPAU)',
  '1.0',
  0x${hex},
  '/* CSS embebido en html_template */',
  '{"format": "A4", "margin": {"top": "20mm", "left": "15mm", "right": "15mm", "bottom": "20mm"}, "printBackground": true, "preferCSSPageSize": false}',
  'handlebars',
  '{"formData": {"cliente": "string", "tipoObra": "string", "valorObra": "number", "nombreProyecto": "string", "superficieCubierta": "number", "superficieSemicubierta": "number"}, "currentDate": "string", "calculationNumber": "string", "calculationResult": {"moneda": "string", "honorarioTotal": "number"}}',
  1
)
ON DUPLICATE KEY UPDATE
  html_template = VALUES(html_template);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT 
  entregable_id,
  nombre_plantilla,
  version,
  activo,
  LENGTH(html_template) as html_size_bytes,
  LEFT(html_template, 100) as html_preview,
  fecha_creacion
FROM Entregables_PDF
WHERE entregable_id = 1;
`;

// Guardar archivo SQL
const sqlPath = path.join(__dirname, 'insert-template-pdf.sql');
fs.writeFileSync(sqlPath, sql, 'utf8');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  ✅ ARCHIVO SQL GENERADO EXITOSAMENTE');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log(`📄 Archivo: ${sqlPath}`);
console.log(`📏 Tamaño HTML: ${(html.length / 1024).toFixed(2)} KB`);
console.log(`📏 Tamaño SQL: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
console.log('');
console.log('📋 Instrucciones:');
console.log('   1. Abrí el archivo insert-template-pdf.sql en MySQL Workbench');
console.log('   2. Ejecutá TODO el contenido');
console.log('   3. El UPSERT inserta el registro o actualiza el html_template si ya existe');
console.log('');
console.log('⚠️  NOTA: El HTML está en formato hexadecimal (0x...)');
console.log('   Esto evita problemas con comillas simples y dobles.');
console.log('');
