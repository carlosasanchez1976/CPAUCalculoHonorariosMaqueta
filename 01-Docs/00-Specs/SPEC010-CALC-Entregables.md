# SPEC-CALC-010: Migración del Generador de PDF a Puppeteer (Backend Lambda)

**Fecha:** 29/05/2026
**Versión:** 1.0
**Estado:** 🟡 PROPUESTA — A APROBAR
**Autor:** Equipo de Desarrollo CH2026
**Solicitante:** Charly (Tech Lead)
**Dependencias:**
- SPEC003-BACKEND-001 (Migración a Lambda — ✅ implementada)
- SPEC009-CALC-Entregable (Entregable PDF — implementación previa que se reemplaza)

> **⚠️ ALCANCE:**
> Esta SPEC **reemplaza el mecanismo de generación de PDF** del frontend (`html2pdf.js` + ventana de previsualización) por un **endpoint en el Backend Node/Lambda** que renderiza el certificado con **Puppeteer**.
> Mantiene el contrato visual del certificado definido en SPEC009 (página 1 datos + página 2 notas, header CPAU, etc.).
> **No** introduce cambios funcionales en el cálculo de honorarios.

---

## 📋 ÍNDICE

1. [Problema Original](#1-problema-original)
2. [Resumen del Trabajo Realizado](#2-resumen-del-trabajo-realizado)
3. [Propuesta Final](#3-propuesta-final-puppeteer-en-backend-lambda)
4. [Arquitectura y Flujo](#4-arquitectura-y-flujo)
5. [Modelo de Datos (Visión General)](#5-modelo-de-datos-visión-general)
6. [Estrategia de Implementación](#6-estrategia-de-implementación-incremental)
7. [Tickets](#7-tickets)
8. [Criterios de Aceptación](#8-criterios-de-aceptación-globales)
9. [Riesgos y Mitigación](#9-riesgos-y-mitigación)

---

## 1. PROBLEMA ORIGINAL

El cliente CPAU exige un **certificado PDF profesional y fiel** al diseño entregado por la Dirección de Diseño. El PDF debe:

- Reflejar exactamente el diseño aprobado (header institucional, tipografía, tablas, notas en página 2).
- Verse **idéntico independientemente** del navegador del usuario, su escala de Windows (100% / 125% / 150%), su sistema operativo o la resolución de su pantalla.
- Tener **texto seleccionable, buscable y copiable** (no una imagen).
- Permitir, a futuro, **diferentes plantillas de entregable por tarea profesional** (Proyecto y Dirección, Relevamiento, Tasación, Mensura, etc.), cada una con su layout propio.

La solución implementada en SPEC009 no cumple con este nivel de fidelidad ni con la escalabilidad multi-plantilla requerida.

---

## 2. RESUMEN DEL TRABAJO REALIZADO

En SPEC009 se desarrolló una primera versión del entregable basada en `html2pdf.js` (frontend):

**Implementación actual** (`ResultadoBasicoDetalle.jsx`):
- Botón **"Descargar PDF"** abre una **ventana de previsualización** (`window.open`) con el contenido clonado del `pdfRef`.
- Se copian los `<link>` y `<style>` del documento principal a la ventana hija (asincrónico, con Promise de `onload`).
- Las rutas de imágenes se reescriben a absolutas.
- Se inyecta un bloque `@media print` con tamaños fijos (`[class*="certificateHeader"]`, `[class*="headerLeft"] { width: 180px ... }`) para forzar el layout del header en impresión.
- La librería `html2pdf.js` se carga vía CDN dentro de la ventana hija y, al click en **"Generar PDF"**, hace `html2canvas` + `jsPDF` y descarga el archivo.
- Se creó `utils/pdfConstants.js` con `PDF_NOTAS` (página 2) y los estilos correspondientes en `ResultadoBasicoDetalle.module.css`.

**Problemas detectados con este enfoque:**

| Problema | Causa raíz |
|---|---|
| Texto del PDF **no seleccionable / no buscable** | `html2pdf` rasteriza vía `html2canvas` → el PDF contiene JPEG, no texto vectorial |
| Header se ve **distinto** entre la previsualización en pantalla y la vista previa de impresión / PDF | Dos motores de render diferentes (DOM screen vs `html2canvas` vs print engine), cada uno con sus reglas de escala (`shrink-to-fit`, DPI 96, etc.) |
| Calidad pixelada al hacer zoom en el PDF | El contenido es un bitmap |
| Dependencia del navegador del usuario y su escala de Windows | El render ocurre en el cliente |
| Page breaks frágiles | `html2canvas` "rebana" el canvas; controlar saltos exactos es difícil |
| No escalable a múltiples plantillas | Cada plantilla requeriría duplicar JSX + CSS dentro del frontend |

**Intentos de mitigación frontend** (Solución "WYSIWYG" con `width: 190mm` en preview) → resuelven la **diferencia visual** entre preview y print preview, pero **no resuelven la fidelidad del PDF final** (sigue siendo bitmap) ni la escalabilidad multi-plantilla.

---

## 3. PROPUESTA FINAL: PUPPETEER EN BACKEND LAMBDA

### 3.1 Decisión técnica

Se reemplaza el generador de PDF del frontend por un **endpoint del Backend (AWS Lambda Node.js)** que utiliza **Puppeteer + `@sparticuz/chromium`** para renderizar el certificado y exportar un PDF vectorial.

### 3.2 Por qué Puppeteer

| Aspecto | `html2pdf.js` (actual) | **Puppeteer (propuesto)** |
|---|---|---|
| Render | `html2canvas` (re-implementa CSS) | Chromium real (motor completo) |
| Texto del PDF | Bitmap (no seleccionable) | **Vectorial, seleccionable, buscable** |
| Fidelidad visual | Variable según navegador del cliente | **Idéntica** (server-side controlado) |
| Control de `@page`, márgenes, formato | Limitado | **Total** (`page.pdf({ format, margin, ... })`) |
| Numeración de página, header/footer nativos | ❌ | ✅ (opción `displayHeaderFooter`) |
| Dependencia del cliente | Alta (browser, escala, DPI) | **Nula** (cliente solo descarga) |
| Tamaño del archivo | Mayor (JPEG embebido) | Menor (texto + vectores) |
| Encaja en arquitectura objetivo (Lambda) | ❌ | ✅ |

### 3.3 Por qué AHORA

- El backend Lambda **ya está operativo** (SPEC003 completada).
- Seguir parchando `html2pdf` solo posterga el costo: cada nueva plantilla, cada ajuste de fuente, cada problema de header vuelve a aparecer.
- La arquitectura multi-plantilla (un PDF distinto por tarea profesional) **requiere** un motor servidor; hacerlo en frontend implicaría duplicar mucho código.

---

## 4. ARQUITECTURA Y FLUJO

### 4.1 Diagrama de flujo

```
┌─────────────────────────────────────┐
│  FRONTEND (React)                   │
│  ResultadoBasicoDetalle.jsx         │
│                                     │
│  Click "Descargar PDF"              │
└────────────────┬────────────────────┘
                 │ POST /api/calculos/exportar-pdf
                 │ Body: { tipoCalculo, formData, calculationResult }
                 ↓
┌─────────────────────────────────────┐
│  BACKEND (AWS Lambda Node.js)       │
│                                     │
│  1. Validar payload                 │
│  2. Resolver plantilla HTML         │
│     (según tipoCalculo / tarea)     │
│  3. Hidratar template con datos     │
│  4. Lanzar Chromium                 │
│     (@sparticuz/chromium)           │
│  5. page.setContent(html)           │
│  6. page.pdf({ format, margin })    │
│  7. Responder buffer PDF            │
│     (Content-Type: application/pdf) │
└────────────────┬────────────────────┘
                 │ application/pdf (binary)
                 ↓
┌─────────────────────────────────────┐
│  FRONTEND                           │
│  - Recibe Blob                      │
│  - Descarga: Honorarios-CPAU-{n}.pdf│v1calculos  
└─────────────────────────────────────┘
```

### 4.2 Stack técnico

**Backend:**
- Node.js (runtime Lambda existente)
- `puppeteer-core` (no descarga Chromium en `npm install`)
- `@sparticuz/chromium` (binario Chromium ~50 MB optimizado para Lambda/serverless)
- Sin dependencias adicionales del runtime

**Frontend:**
- Simplificación drástica de `ResultadoBasicoDetalle.jsx`:
  - Se elimina `html2pdf.js` (dependencia y código de ventana de preview).
  - Se elimina toda la lógica de `copiarEstilosAVentana`, `convertirRutasAAbsolutas`, `abrirVentanaPreview`.
  - El handler de "Descargar PDF" hace `fetch` al endpoint, recibe el blob y dispara la descarga.

### 4.3 Contrato del endpoint

```
POST /api/calculos/exportar-pdf

Request:
{
  "tipoCalculo": "basico-proyecto-direccion",
  "formData": { ... },
  "calculationResult": { ... },
  "calculationNumber": "20260529-001"
}

Response (200):
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="Honorarios-CPAU-20260529-001.pdf"
  Body: <binary PDF>

Response (4xx/5xx):
  Content-Type: application/json
  Body: { "success": false, "error": "..." }
```

---

## 5. MODELO DE DATOS (VISIÓN GENERAL)

Para soportar **múltiples plantillas de entregable**, una por tipo de cálculo / tarea profesional, se introduce:

- **`Tareas_Profesionales`** (ya existe — referencia conceptual): catálogo de tareas (Proyecto y Dirección, Relevamiento, Tasación, Mensura, etc.).
- **`Entregables_PDF`** (NUEVO): catálogo de plantillas HTML versionadas para generar el PDF de cada tarea.
- **Tabla de relación `Tareas_Profesionales_Entregables_PDF`** (NUEVO): mapea cada tarea profesional a la(s) plantilla(s) de entregable que le corresponden.

> **Nota:** El detalle del schema, índices, versionado y mecanismo de hidratación de la plantilla se aborda en los tickets correspondientes. Esta SPEC solo establece el **principio arquitectónico**: la plantilla HTML del certificado vive en datos (DB), no en el código del Backend.

---

## 6. ESTRATEGIA DE IMPLEMENTACIÓN (INCREMENTAL)

Se trabaja en **dos fases** para minimizar riesgo y validar el motor Puppeteer antes de abordar el modelo de datos:

### Fase 1 — Migración funcional (plantilla hardcodeada)
Implementar el endpoint Puppeteer end-to-end usando **una plantilla HTML hardcodeada** en el backend, correspondiente a **"Proyecto y Dirección Básico"** (la tarea actualmente operativa).
**Objetivo:** validar fidelidad, performance Lambda, contrato frontend/backend y descarga.

### Fase 2 — Modelo de datos multi-plantilla
Una vez validada la Fase 1, mover la plantilla hardcodeada a la tabla `Entregables_PDF` y resolver dinámicamente la plantilla en función de la tarea profesional vía la tabla de relación.

---

## 7. TICKETS

> Los tickets están definidos a alto nivel para ser **analizados y refinados** durante el grooming. El orden de ejecución recomendado es **T3 → T1 → T2** (la Fase 1 valida la solución antes de invertir en el modelo de datos).

### 🎫 T010-001 — Tabla de relación `Tareas_Profesionales` ↔ `Entregables_PDF`

**Tipo:** Backend / Base de datos
**Fase:** 2
**Estado:** ✅ REFINADO — Listo para desarrollo
**Estimación:** 4-6 horas

**Descripción:**
Diseñar e implementar la tabla `Entregables_PDF` y la tabla de relación con `Tareas_Profesionales`. Permite que cada tarea profesional tenga asociada una (o varias) plantilla(s) de entregable PDF con versionado y datos descriptivos.

---

#### **Schema SQL: Tabla `Entregables_PDF`**

```sql
-- ============================================================================
-- TABLA: Entregables_PDF
-- Almacena plantillas HTML/CSS para generar certificados PDF
-- ============================================================================
DROP TABLE IF EXISTS Entregables_PDF;

CREATE TABLE Entregables_PDF (
  -- Identificación
  entregable_id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Datos descriptivos
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo de la plantilla (ej: "Certificado Proyecto y Dirección")',
  codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único para resolver plantilla (ej: "basico-proyecto-direccion")',
  descripcion TEXT COMMENT 'Descripción detallada del entregable',
  
  -- Versionado
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0' COMMENT 'Versión semántica (MAJOR.MINOR.PATCH)',
  version_activa BOOLEAN DEFAULT TRUE COMMENT 'TRUE = versión actual en uso, FALSE = histórica',
  
  -- Contenido de la plantilla
  html_template LONGTEXT NOT NULL COMMENT 'HTML con placeholders (ej: {{formData.nombreProyecto}})',
  css_styles LONGTEXT COMMENT 'CSS específico de la plantilla (inline o <style>)',
  
  -- Configuración del PDF
  pdf_config JSON COMMENT 'Configuración Puppeteer: { format, margin, orientation, etc. }',
  
  -- Metadata del template
  template_engine ENUM('handlebars', 'mustache', 'literal') DEFAULT 'handlebars' COMMENT 'Motor de templating usado',
  placeholders JSON COMMENT 'Lista de placeholders esperados con tipo y descripción',
  
  -- Assets embebidos (opcional)
  assets JSON COMMENT 'Imágenes/logos en base64 o URLs absolutas: { "logo": "data:image/svg+xml;base64,..." }',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT COMMENT 'Usuario que creó la plantilla',
  
  -- Índices
  INDEX idx_codigo (codigo),
  INDEX idx_version_activa (version_activa),
  INDEX idx_template_engine (template_engine),
  
  -- Foreign key
  FOREIGN KEY (created_by) REFERENCES Usuarios(user_id) ON DELETE SET NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Plantillas HTML/CSS para generar entregables PDF con Puppeteer';
```

---

#### **Schema SQL: Tabla de Relación**

```sql
-- ============================================================================
-- TABLA DE RELACIÓN: Tareas_Profesionales_Entregables_PDF
-- Mapea qué plantilla PDF corresponde a cada tarea profesional
-- ============================================================================
DROP TABLE IF EXISTS Tareas_Profesionales_Entregables_PDF;

CREATE TABLE Tareas_Profesionales_Entregables_PDF (
  -- Identificación
  relacion_id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relaciones
  tarea_id INT NOT NULL,
  entregable_id INT NOT NULL,
  
  -- Configuración de la relación
  activo BOOLEAN DEFAULT TRUE COMMENT 'Permite desactivar sin borrar el registro',
  orden INT DEFAULT 1 COMMENT 'Orden de prioridad si hay múltiples entregables por tarea',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices y constraints
  UNIQUE KEY unique_tarea_entregable (tarea_id, entregable_id),
  INDEX idx_tarea_activo (tarea_id, activo),
  
  -- Foreign keys
  FOREIGN KEY (tarea_id) REFERENCES Tareas_Profesionales(tarea_id) ON DELETE CASCADE,
  FOREIGN KEY (entregable_id) REFERENCES Entregables_PDF(entregable_id) ON DELETE CASCADE
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relación N:N entre tareas profesionales y plantillas de entregables PDF';
```

---

#### **Alcance del Ticket:**

**1. Crear archivos SQL:**
- `App/Backend/DB/01-Tables/Entregables_PDF.sql`
- `App/Backend/DB/01-Tables/Tareas_Profesionales_Entregables_PDF.sql`

**2. Scripts de migración:**
- Verificar foreign keys existentes en `Tareas_Profesionales`
- Ejecutar creación de tablas en orden correcto

**3. Seed data inicial (placeholder - la plantilla real viene de T010-002):**
```sql
-- Seed: Plantilla de prueba para Proyecto y Dirección
INSERT INTO Entregables_PDF (
  nombre, codigo, descripcion, version, html_template, css_styles, 
  pdf_config, template_engine, placeholders
) VALUES (
  'Certificado Proyecto y Dirección Básico',
  'basico-proyecto-direccion',
  'Plantilla para certificado de cálculo de honorarios - Proyecto y Dirección de Obra (2 páginas)',
  '1.0.0',
  '<html><!-- Placeholder temporal --></html>',
  '/* Estilos placeholder */',
  '{"format": "A4", "printBackground": true, "margin": {"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm"}}',
  'handlebars',
  '{"formData": {"nombreProyecto": "string", "cliente": "string", "valorObra": "number"}, "calculationNumber": "string", "currentDate": "string"}'
);

-- Relación con tarea "Proyecto y Dirección"
INSERT INTO Tareas_Profesionales_Entregables_PDF (tarea_id, entregable_id, orden)
SELECT 
  t.tarea_id,
  e.entregable_id,
  1
FROM Tareas_Profesionales t
CROSS JOIN Entregables_PDF e
WHERE t.codigo = 'PROYDIR' -- Ajustar según el código real en tu tabla
  AND e.codigo = 'basico-proyecto-direccion';
```

**4. Servicio Backend: `entregablesService.js`**

Ubicación: `App/Backend/Node/src/services/entregablesService.js`

```javascript
/**
 * Resuelve la plantilla de entregable activa para una tarea profesional
 * @param {number} tareaId - ID de la tarea profesional
 * @returns {Object|null} Datos del entregable (html_template, css_styles, pdf_config, etc.)
 */
async function resolverPlantillaEntregable(tareaId) {
  const query = `
    SELECT 
      e.*
    FROM Entregables_PDF e
    INNER JOIN Tareas_Profesionales_Entregables_PDF rel 
      ON e.entregable_id = rel.entregable_id
    WHERE rel.tarea_id = ?
      AND rel.activo = TRUE
      AND e.version_activa = TRUE
    ORDER BY rel.orden ASC
    LIMIT 1
  `;
  
  const [rows] = await pool.query(query, [tareaId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Resuelve la plantilla por código (fallback si no hay tarea_id)
 * @param {string} codigo - Código del entregable (ej: 'basico-proyecto-direccion')
 * @returns {Object|null} Datos del entregable
 */
async function resolverPlantillaPorCodigo(codigo) {
  const query = `
    SELECT * 
    FROM Entregables_PDF 
    WHERE codigo = ? 
      AND version_activa = TRUE
    LIMIT 1
  `;
  
  const [rows] = await pool.query(query, [codigo]);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = {
  resolverPlantillaEntregable,
  resolverPlantillaPorCodigo
};
```

---

#### **Criterios de Aceptación:**

- [ ] **T001-CA-001:** Tablas creadas correctamente en la base de datos con todos los campos definidos
- [ ] **T001-CA-002:** Foreign keys funcionando correctamente (cascada en DELETE)
- [ ] **T001-CA-003:** Seed data cargado: 1 registro en `Entregables_PDF` + 1 relación con tarea "Proyecto y Dirección"
- [ ] **T001-CA-004:** Servicio `entregablesService.js` implementado y probado
- [ ] **T001-CA-005:** Consulta `resolverPlantillaEntregable(tareaId)` retorna el registro correcto
- [ ] **T001-CA-006:** Documentación SQL comentada en cada tabla (COMMENT)

---

#### **Notas Técnicas:**

1. **Campo `placeholders` (JSON):** Documenta qué variables espera la plantilla. Útil para validación y debugging.
2. **Campo `pdf_config` (JSON):** Permite customizar configuración Puppeteer por plantilla sin tocar código.
3. **Versionado:** `version_activa` permite mantener historial de plantillas antiguas (auditoría de PDFs ya emitidos).
4. **Campo `assets` (JSON):** Para embeder logo CPAU en base64 directamente en el registro, evitando requests HTTP durante render.

---

### 🎫 T010-002 — Almacenamiento del HTML de plantillas en `Entregables_PDF`

**Tipo:** Backend / Base de datos / Content
**Fase:** 2
**Estado:** ✅ REFINADO — Listo para desarrollo
**Depende de:** T010-001
**Estimación:** 6-8 horas

**Descripción:**
Extraer el HTML y CSS de [ResultadoBasicoDetalle.jsx](App/Frontend/src/components/wizard/ResultadoBasicoDetalle.jsx) y convertirlo en una plantilla Handlebars completa para almacenar en la tabla `Entregables_PDF`. Esta plantilla será renderizada por Puppeteer en Lambda para generar el PDF.

---

#### **Motor de Templating Seleccionado: Handlebars**

**Razón:**
- Soporta helpers nativos (`{{#each}}`, `{{#if}}`, `{{#unless}}`)
- Lógica condicional y loops (necesario para tabla de honorarios)
- Ampliamente usado, mantenido, documentado
- Ligero (~70KB, aceptable para Lambda)

**Alternativas descartadas:**
- **Mustache:** Demasiado limitado (no soporta condicionales complejos)
- **Template literals:** Requiere `eval()` o `new Function()` (riesgo de seguridad)

---

#### **Estructura de la Plantilla HTML**

**Ubicación temporal (para desarrollo):**
`App/Backend/Node/src/templates/certificado-proyecto-direccion-v1.hbs`

**Estructura:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado de Honorarios CPAU - {{calculationNumber}}</title>
  
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
      filter: brightness(0) invert(1); /* Logo blanco */
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
      flex-direction: column;
      gap: 4px;
    }
    
    .resumen-label {
      font-size: 8.5pt;
      color: #666;
      font-weight: 500;
    }
    
    .resumen-value {
      font-size: 10pt;
      color: #333;
      font-weight: 600;
    }
    
    /* ============================================================
       DISCLAIMER
       ============================================================ */
    .disclaimer {
      background: #fff9e6;
      border-left: 4px solid #f0ad4e;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .disclaimer-title {
      font-size: 10pt;
      font-weight: 700;
      color: #d9831f;
      margin-bottom: 8px;
    }
    
    .disclaimer-text {
      font-size: 8.5pt;
      line-height: 1.5;
      color: #555;
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
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
      font-size: 8.5pt;
    }
    
    tbody td {
      padding: 6px;
      border-bottom: 1px solid #eee;
    }
    
    .centered {
      text-align: center;
    }
    
    .right-align {
      text-align: right;
    }
    
    .subtotal-row {
      background: #f9f9f9;
      font-weight: 600;
    }
    
    .total-row {
      background: #2d5f3f;
      color: white;
      font-weight: 700;
      font-size: 10pt;
    }
    
    /* ============================================================
       PÁGINA 2: NOTAS
       ============================================================ */
    .notas-container {
      padding-top: 10mm;
    }
    
    .notas-title {
      font-size: 14pt;
      font-weight: 600;
      color: #2d5f3f;
      margin-bottom: 15px;
    }
    
    .notas-content {
      font-size: 9pt;
      line-height: 1.6;
      color: #444;
      white-space: pre-wrap;
    }
    
    /* ============================================================
       IMPRIMIR (Puppeteer PDF)
       ============================================================ */
    @media print {
      .page {
        page-break-after: always;
      }
      
      .page:last-child {
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>

<!-- ============================================================
     PÁGINA 1: DATOS DEL CÁLCULO
     ============================================================ -->
<div class="page">
  <!-- Header del Certificado -->
  <div class="certificate-header">
    <div class="header-left">
      <img src="{{{assets.logoCPAU}}}" alt="CPAU Logo" class="logo">
    </div>
    <div class="header-right">
      <div class="header-title">Cálculo de honorarios profesionales</div>
      <div class="header-metadata">
        <span class="metadata-item">Tipo: {{formData.tipoNombre}}</span>
        <span class="metadata-item">Fecha: {{currentDate}}</span>
        <span class="metadata-item">Nº: {{calculationNumber}}</span>
      </div>
    </div>
  </div>

  <!-- Layout de Dos Columnas -->
  <div class="two-column-layout">
    
    <!-- COLUMNA IZQUIERDA: Resumen del Proyecto -->
    <div class="left-column">
      <h4 class="section-title">Resumen del Proyecto</h4>
      
      <div class="resumen-grid">
        <div class="resumen-item">
          <span class="resumen-label">Nombre del Proyecto:</span>
          <span class="resumen-value">{{formData.nombreProyecto}}</span>
        </div>
        
        <div class="resumen-item">
          <span class="resumen-label">Comitente:</span>
          <span class="resumen-value">{{formData.cliente}}</span>
        </div>
        
        <div class="resumen-item">
          <span class="resumen-label">Tipo de obra:</span>
          <span class="resumen-value">{{formData.tipoObra}}</span>
        </div>
        
        <div class="resumen-item">
          <span class="resumen-label">Destino/Uso:</span>
          <span class="resumen-value">{{formData.destinoUso}}</span>
        </div>
        
        <div class="resumen-item">
          <span class="resumen-label">Superficie total:</span>
          <span class="resumen-value">{{formData.superficieTotal}} m²</span>
        </div>
        
        <div class="resumen-item">
          <span class="resumen-label">Costo estimado de obra (ARS):</span>
          <span class="resumen-value">{{formatCurrencyARS formData.valorObra}}</span>
        </div>
        
        {{#if formData.cotizDolar}}
        <div class="resumen-item">
          <span class="resumen-label">Costo estimado de obra (USD):</span>
          <span class="resumen-value">{{formatCurrencyARS (divide formData.valorObra formData.cotizDolar)}}</span>
        </div>
        {{/if}}
      </div>

      <!-- Disclaimer Legal -->
      <div class="disclaimer">
        <div class="disclaimer-title">IMPORTANTE</div>
        <div class="disclaimer-text">
          Este cálculo es una <strong>estimación de referencia</strong> basada en los datos proporcionados 
          y factores estándar del mercado. Los valores finales pueden variar según condiciones particulares 
          de cada proyecto. <strong>No constituye una cotización formal ni un compromiso contractual.</strong>
          <br><br>
          <span>Vigencia de índices: Febrero 2026</span><br>
          <span>Base de cálculo: arancel sugerido CPAU (versión 2026)</span>
        </div>
      </div>
    </div>

    <!-- COLUMNA DERECHA: Detalle de Honorarios -->
    <div class="right-column">
      <h4 class="section-title">Detalle de honorarios</h4>

      {{#if categorias.obra}}
      <!-- Sección: Honorarios de Obra -->
      <table>
        <thead>
          <tr>
            <th class="centered">Ítem</th>
            <th>Tarea Profesional</th>
            <th class="right-align">Importe ARS</th>
            {{#if formData.cotizDolar}}
            <th class="right-align">Importe USD</th>
            {{/if}}
            <th class="centered">% sobre costo</th>
          </tr>
        </thead>
        <tbody>
          {{#each categorias.obra}}
          <tr>
            <td class="centered">{{this.indice}}</td>
            <td>{{this.tareaProfesional}}</td>
            <td class="right-align">{{formatCurrencyARS this.importe}}</td>
            {{#if ../formData.cotizDolar}}
            <td class="right-align">{{formatCurrencyARS (divide this.importe ../formData.cotizDolar)}}</td>
            {{/if}}
            <td class="centered">{{formatPercent (multiply (divide this.importe ../formData.valorObra) 100)}}</td>
          </tr>
          {{/each}}
          
          <!-- Subtotal Obra -->
          <tr class="subtotal-row">
            <td colspan="2"><strong>Subtotal Obra</strong></td>
            <td class="right-align"><strong>{{formatCurrencyARS subtotales.obra.totalARS}}</strong></td>
            {{#if formData.cotizDolar}}
            <td class="right-align"><strong>{{formatCurrencyARS subtotales.obra.totalUSD}}</strong></td>
            {{/if}}
            <td class="centered"><strong>{{formatPercent subtotales.obra.totalPorcentaje}}</strong></td>
          </tr>
        </tbody>
      </table>
      {{/if}}

      {{!-- Repetir estructura para categorias.adicionales y categorias.especialidades --}}

      <!-- TOTAL GENERAL -->
      <table>
        <tbody>
          <tr class="total-row">
            <td colspan="2"><strong>TOTAL GENERAL</strong></td>
            <td class="right-align"><strong>{{formatCurrencyARS totales.totalARS}}</strong></td>
            {{#if formData.cotizDolar}}
            <td class="right-align"><strong>{{formatCurrencyARS totales.totalUSD}}</strong></td>
            {{/if}}
            <td class="centered"><strong>{{formatPercent totales.totalPorcentaje}}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ============================================================
     PÁGINA 2: NOTAS
     ============================================================ -->
<div class="page">
  <div class="notas-container">
    <h3 class="notas-title">Notas sobre el Cálculo de Honorarios</h3>
    <div class="notas-content">{{{notas}}}</div>
  </div>
</div>

</body>
</html>
```

---

#### **Helpers de Handlebars Necesarios**

**Ubicación:** `App/Backend/Node/src/utils/handlebarsHelpers.js`

```javascript
const Handlebars = require('handlebars');

/**
 * Formatea número como moneda ARS
 * Uso: {{formatCurrencyARS valorObra}}
 */
Handlebars.registerHelper('formatCurrencyARS', (value) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(value);
});

/**
 * Formatea número como porcentaje
 * Uso: {{formatPercent 15.5}}
 */
Handlebars.registerHelper('formatPercent', (value) => {
  if (!value && value !== 0) return 'N/A';
  return `${value.toFixed(2)}%`;
});

/**
 * División matemática
 * Uso: {{divide valorObra cotizDolar}}
 */
Handlebars.registerHelper('divide', (a, b) => {
  if (!b || b === 0) return 0;
  return a / b;
});

/**
 * Multiplicación matemática
 * Uso: {{multiply valor 100}}
 */
Handlebars.registerHelper('multiply', (a, b) => {
  return (a || 0) * (b || 0);
});

module.exports = Handlebars;
```

---

#### **Datos de Entrada (Payload)**

El servicio Puppeteer recibirá este objeto para hidratar la plantilla:

```javascript
{
  "calculationNumber": "20260610-001",
  "currentDate": "10/06/2026",
  
  "formData": {
    "nombreProyecto": "Edificio Residencial San Martín",
    "cliente": "Constructora ABC S.A.",
    "tipoObra": "Obra Nueva",
    "tipoNombre": "Proyecto y Dirección - Básico",
    "destinoUso": "Vivienda Multifamiliar",
    "superficieTotal": 1500,
    "valorObra": 150000000,
    "cotizDolar": 1050
  },
  
  "categorias": {
    "obra": [
      {
        "indice": 1,
        "tareaProfesional": "Proyecto de Arquitectura",
        "importe": 4500000
      },
      {
        "indice": 2,
        "tareaProfesional": "Dirección de Obra",
        "importe": 3750000
      }
    ],
    "adicionales": [],
    "especialidades": []
  },
  
  "subtotales": {
    "obra": {
      "totalARS": 8250000,
      "totalUSD": 7857.14,
      "totalPorcentaje": 5.5
    },
    "adicionales": { "totalARS": 0, "totalUSD": 0, "totalPorcentaje": 0 },
    "especialidades": { "totalARS": 0, "totalUSD": 0, "totalPorcentaje": 0 }
  },
  
  "totales": {
    "totalARS": 8250000,
    "totalUSD": 7857.14,
    "totalPorcentaje": 5.5
  },
  
  "notas": "Contenido de PDF_NOTAS...",
  
  "assets": {
    "logoCPAU": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0i..."
  }
}
```

---

#### **Alcance del Ticket:**

**1. Convertir JSX a HTML:**
- Extraer todo el markup de `ResultadoBasicoDetalle.jsx` (página 1 + página 2)
- Convertir CSS Modules a CSS inline en `<style>`
- Eliminar código React (useState, useRef, handlers)

**2. Implementar Handlebars:**
- Crear archivo `App/Backend/Node/src/utils/handlebarsHelpers.js`
- Registrar helpers: `formatCurrencyARS`, `formatPercent`, `divide`, `multiply`
- Probar renderizado con datos de prueba

**3. Embeber assets:**
- Convertir logo CPAU (`/assets/icons/logoBlanco.svg`) a base64
- Almacenar en campo `assets` JSON de `Entregables_PDF`

**4. Cargar plantilla en DB:**
```sql
UPDATE Entregables_PDF
SET 
  html_template = '<html>...contenido completo...</html>',
  css_styles = NULL, -- CSS ya embebido en <style>
  pdf_config = '{"format": "A4", "printBackground": true, "margin": {"top": "20mm", "right": "15mm", "bottom": "20mm", "left": "15mm"}}',
  placeholders = '{"formData": {...}, "categorias": {...}, "subtotales": {...}, "totales": {...}, "notas": "string", "calculationNumber": "string", "currentDate": "string"}',
  assets = '{"logoCPAU": "data:image/svg+xml;base64,..."}'
WHERE codigo = 'basico-proyecto-direccion';
```

**5. Testing de renderizado:**
- Script de prueba que carga la plantilla, la hidrata con Handlebars y guarda HTML resultante
- Validar que no hay errores de sintaxis Handlebars

---

#### **Criterios de Aceptación:**

- [ ] **T002-CA-001:** Plantilla HTML completa creada en `src/templates/certificado-proyecto-direccion-v1.hbs`
- [ ] **T002-CA-002:** Helpers Handlebars implementados y testeados (`formatCurrencyARS`, `formatPercent`, `divide`, `multiply`)
- [ ] **T002-CA-003:** Logo CPAU convertido a base64 y embebido en campo `assets`
- [ ] **T002-CA-004:** Plantilla cargada en tabla `Entregables_PDF` (UPDATE del registro seed)
- [ ] **T002-CA-005:** Script de test renderiza la plantilla con datos de prueba sin errores
- [ ] **T002-CA-006:** HTML resultante validado visualmente (abrir en navegador)

---

### 🎫 T010-003 — Migrar generación de PDF a Puppeteer (Proyecto y Dirección)

**Tipo:** Backend + Frontend (integración)
**Fase:** 1
**Estado:** **A desarrollar — PRIORITARIO**
**Bloquea a:** T010-001, T010-002

**Descripción:**
Implementar la solución completa end-to-end con **una plantilla hardcodeada** en el backend (la del cálculo Básico "Proyecto y Dirección" existente). Una vez validada y aprobada por el cliente, se la migra al modelo de datos de T010-001 / T010-002.

**Alcance:**

**Backend (Lambda):**
- Instalar `puppeteer-core` + `@sparticuz/chromium`.
- Crear handler `POST /api/calculos/exportar-pdf`.
- Implementar servicio `pdfService.generarCertificado(tipoCalculo, datos)`:
  - Construir HTML hardcodeado (página 1 + página 2 de notas, según SPEC009).
  - Lanzar Chromium con opciones de Lambda.
  - `page.setContent(html, { waitUntil: 'networkidle0' })`.
  - `page.pdf({ format: 'A4', printBackground: true, margin: { top, right, bottom, left } })`.
  - Retornar buffer.
- Responder con `Content-Type: application/pdf` y `Content-Disposition: attachment; filename=...`.
- Logging de duración, tamaño del PDF y errores.

**Frontend:**
- Refactor de `ResultadoBasicoDetalle.jsx`:
  - **Eliminar** todo el código de previsualización (`abrirVentanaPreview`, `copiarEstilosAVentana`, `convertirRutasAAbsolutas`, etc.).
  - **Eliminar** la dependencia `html2pdf.js` del proyecto.
  - Nuevo `handleDescargarPDF`: `fetch` POST al endpoint → recibir blob → `URL.createObjectURL` → click en `<a download>`.
  - Manejo de estados loading / error / success (deshabilitar botón, spinner, toast).
- Crear `services/pdfService.js` (capa de abstracción HTTP).

**Validación visual:**
- Ajuste del header CPAU (corrige problema pendiente de SPEC009).
- Ajuste de tamaño de tipografía interna (pendiente baja prioridad de SPEC009).

**Resultado esperado:**
- PDF vectorial, texto seleccionable.
- Idéntico independientemente del navegador del usuario.
- 2 páginas (datos + notas), header consistente, salto de página limpio.

**Detalle técnico:** se desarrolla en su propio ticket durante grooming.

---

## 8. CRITERIOS DE ACEPTACIÓN GLOBALES

### Funcionales
- [ ] **CA-001:** Click en "Descargar PDF" descarga directamente el archivo (sin ventana de previsualización intermedia).
- [ ] **CA-002:** El PDF generado contiene texto **seleccionable y buscable** (no es imagen).
- [ ] **CA-003:** El PDF se ve **idéntico** en Chrome, Edge, Firefox y Safari.
- [ ] **CA-004:** El PDF se ve **idéntico** en Windows escala 100%, 125% y 150%.
- [ ] **CA-005:** El header CPAU se respeta sin shrink-to-fit ni distorsión.
- [ ] **CA-006:** Las 2 páginas (datos + notas) están presentes con salto limpio.
- [ ] **CA-007:** Nombre de archivo: `Honorarios-CPAU-{calculationNumber}.pdf`.

### Técnicos
- [ ] **CA-008:** El endpoint responde en **< 5 segundos** en Lambda (incluyendo cold start aceptable < 8s).
- [ ] **CA-009:** El PDF generado pesa **< 500 KB**.
- [ ] **CA-010:** El frontend ya no incluye `html2pdf.js` ni `html2canvas` en el bundle.
- [ ] **CA-011:** El Backend tiene logs de duración, tamaño y errores por cada generación.
- [ ] **CA-012:** Manejo de error: si Lambda falla, el frontend muestra mensaje claro al usuario.

### Arquitectónicos
- [ ] **CA-013:** La plantilla HTML inicial queda lista para ser migrada a la tabla `Entregables_PDF` (Fase 2).
- [ ] **CA-014:** El servicio `pdfService` del backend es agnóstico del tipo de cálculo: recibe `tipoCalculo` y resuelve la plantilla.

---

## 9. RIESGOS Y MITIGACIÓN

| ID | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R-001 | Cold start de Lambda con Chromium > 8s | Media | Medio | Provisioned concurrency o warm-up programado; medir en staging |
| R-002 | Tamaño de paquete Lambda excede límite (250 MB descomprimido) | Baja | Alto | `@sparticuz/chromium` (~50 MB) + `puppeteer-core` resuelve esto; validar en deploy |
| R-003 | Fuentes custom no disponibles en Chromium de Lambda | Media | Medio | Embeber fuentes vía `@font-face` con base64 o usar fuentes del sistema |
| R-004 | Imágenes (logo CPAU) no cargan por CORS o rutas | Media | Alto | Embeber logo como base64 directamente en la plantilla HTML |
| R-005 | Diferencias sutiles entre el render de Chromium local y Lambda | Baja | Medio | Testing en staging Lambda antes de promover; pixel diff opcional |
| R-006 | Costos de Lambda por uso de CPU/RAM con Chromium | Baja | Bajo | Lambda con 1024 MB de RAM es suficiente; medir |
| R-007 | Plantilla hardcodeada en T010-003 dificulta luego migrar a T010-002 | Baja | Bajo | Escribir el HTML desde el inicio como template con placeholders claros |

---

## 10. NOTAS FINALES

### 10.1 Qué se elimina del frontend tras T010-003
- Dependencia `html2pdf.js` en `package.json`.
- Código de ventana de previsualización (`abrirVentanaPreview` y helpers).
- Bloque `@media print` específico del PDF en `ResultadoBasicoDetalle.module.css` (los estilos viven ahora en la plantilla del backend).
- `utils/pdfConstants.js` se migra al backend (texto de las notas en la plantilla HTML).

### 10.2 Qué se mantiene
- Componente `ResultadoBasicoDetalle.jsx` para la **vista en pantalla** del resultado (sin cambios visuales).
- Botón "Descargar PDF" (cambia solo su handler interno).
- Numeración del cálculo (`generateCalculationNumber`).

### 10.3 Aprobaciones pendientes
- [ ] Tech Lead (Charly) — aprobar enfoque arquitectónico
- [ ] Backend Lead — validar viabilidad Puppeteer en Lambda actual
- [ ] CPAU - Dirección de Diseño — validar PDF final de Fase 1
- [ ] QA — definir plan de testing cross-browser y multi-escala

---

**Fin de la especificación SPEC-CALC-010**

*Documento vivo — actualizar a medida que avancen los tickets T010-001/002/003.*
