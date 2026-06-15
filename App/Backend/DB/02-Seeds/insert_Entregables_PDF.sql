-- ============================================================================
-- SEED DATA: Entregables PDF - Plantilla inicial
-- Proyecto: CH2026 - CPAU Cálculo de Honorarios
-- Fecha: 2026-06-10
-- SPEC: SPEC010-CALC-Entregables (T010-001)
-- ============================================================================

-- Nota: Este seed crea una plantilla PLACEHOLDER para "Proyecto y Dirección de obras de arquitectura"
-- La plantilla HTML/CSS completa se implementará en T010-002

-- ============================================================================
-- 1. INSERT en Entregables_PDF
-- ============================================================================

INSERT INTO Entregables_PDF (
  nombre, 
  codigo, 
  descripcion, 
  version, 
  version_activa,
  html_template, 
  css_styles, 
  pdf_config, 
  template_engine, 
  placeholders,
  assets
) VALUES (
  'Certificado Proyecto y Dirección Básico',
  'basico-proyecto-direccion',
  'Plantilla para certificado de cálculo de honorarios - Proyecto y Dirección de Obra (2 páginas: datos + notas)',
  '1.0.0',
  TRUE,
  '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Certificado de Honorarios CPAU - {{calculationNumber}}</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 20mm; 
      font-size: 10pt; 
    }
    h1 { 
      color: #003366; 
      text-align: center; 
    }
    .placeholder {
      padding: 20px;
      background: #f0f0f0;
      border: 2px dashed #ccc;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>Certificado de Honorarios Profesionales CPAU</h1>
  <div class="placeholder">
    <p><strong>PLANTILLA PLACEHOLDER</strong></p>
    <p>Esta es una plantilla temporal para testing.</p>
    <p>Cálculo N°: {{calculationNumber}}</p>
    <p>Proyecto: {{formData.nombreProyecto}}</p>
    <p>Cliente: {{formData.cliente}}</p>
    <p>La plantilla HTML/CSS completa se implementará en T010-002</p>
  </div>
</body>
</html>',
  '/* CSS embebido en html_template */',
  '{"format": "A4", "printBackground": true, "margin": {"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm"}, "preferCSSPageSize": false}',
  'handlebars',
  '{
    "formData": {
      "nombreProyecto": "string",
      "cliente": "string",
      "valorObra": "number",
      "superficieCubierta": "number",
      "superficieSemicubierta": "number",
      "tipoObra": "string"
    },
    "calculationResult": {
      "honorarioTotal": "number",
      "moneda": "string"
    },
    "calculationNumber": "string",
    "currentDate": "string"
  }',
  NULL
);

-- ============================================================================
-- 2. RELACIONAR con Tarea "Proyecto y Dirección de obras de arquitectura"
-- ============================================================================

-- Obtener IDs y crear relación
INSERT INTO Tareas_Profesionales_Entregables_PDF (tarea_id, entregable_id, activo, orden)
SELECT 
  t.tarea_id,
  e.entregable_id,
  TRUE,
  1
FROM Tareas_Profesionales t
CROSS JOIN Entregables_PDF e
WHERE t.codi = 'PYDOA'  -- Proyecto y Dirección de obras de arquitectura
  AND e.codigo = 'basico-proyecto-direccion';

-- ============================================================================
-- 3. VERIFICACIÓN
-- ============================================================================

-- Verificar que la relación se creó correctamente
SELECT 
  t.codi AS tarea_codigo,
  t.descripcion AS tarea_nombre,
  e.codigo AS entregable_codigo,
  e.nombre AS entregable_nombre,
  e.version,
  rel.activo,
  rel.orden
FROM Tareas_Profesionales t
INNER JOIN Tareas_Profesionales_Entregables_PDF rel ON t.tarea_id = rel.tarea_id
INNER JOIN Entregables_PDF e ON rel.entregable_id = e.entregable_id
WHERE t.codi = 'PYDOA';
