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

Esta SPEC se divide en **4 tickets** para facilitar el desarrollo incremental y testing independiente:

| Ticket | Descripción | Fase | Duración | Depende de |
|--------|-------------|------|----------|------------|
| **T010-001** | Tablas `Entregables_PDF` y relaciones | 2 | 4-6h | - |
| **T010-002** | Plantilla HTML Handlebars en DB | 2 | 6-8h | T010-001 |
| **T010-003** | Endpoint Puppeteer (Backend) | 1 | 4-6h | - |
| **T010-004** | Integración Frontend | 1 | 3-4h | T010-003 |

**Orden de ejecución recomendado:** T010-003 → T010-004 → T010-001 → T010-002

> **Nota:** La Fase 1 (T010-003 + T010-004) valida la solución completa antes de invertir en el modelo de datos de Fase 2.

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

### 🎫 T010-003 — Endpoint Puppeteer para PDF (Backend)

**Tipo:** Backend / AWS Lambda
**Fase:** 1
**Estado:** ✅ REFINADO — Listo para desarrollo
**Estimación:** 4-6 horas
**Stack:** Node.js 18, AWS Lambda, Puppeteer, Express

**Descripción:**
Implementar el endpoint backend que genera certificados PDF con Puppeteer. Utiliza **una plantilla HTML hardcodeada** en el servicio (Fase 1) que luego se migrará al modelo de datos en Fase 2.

---

#### **Alcance del Ticket**

**1. Instalación de Dependencias**
```bash
cd App/Backend/Node
npm install puppeteer-core @sparticuz/chromium
```

**2. Configuración de AWS Lambda (AWS Console)**

Aumentar recursos de la función Lambda para soportar Puppeteer + Chromium:

1. Ir a: **AWS Console → Lambda → `ch2026-backend-api-qa`**
2. Tab **Configuration** → **General configuration** → **Edit**
3. Ajustes:
   - **Memory:** `1024 MB` (actualmente 512 MB)
   - **Timeout:** `30 segundos` (mantener)
4. **Save**

> **Nota:** La ruta `/api/calculos/exportar-pdf` ya será manejada por API Gateway porque la función Lambda tiene configurado `httpApi: '*'` (wildcard).

**3. Crear Router `/api/calculos/exportar-pdf`**

**Ubicación:** `App/Backend/Node/src/routes/calculos/exportarPdf.js`

```javascript
const express = require('express');
const router = express.Router();
const pdfService = require('../../services/pdfService');

/**
 * POST /api/calculos/exportar-pdf
 * Genera certificado PDF con Puppeteer
 */
router.post('/exportar-pdf', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { tipoCalculo, formData, calculationResult, calculationNumber } = req.body;

    // Validación de payload
    if (!formData || !calculationResult || !calculationNumber) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos: se requiere formData, calculationResult y calculationNumber'
      });
    }

    // Generar PDF
    const pdfBuffer = await pdfService.generarCertificado({
      tipoCalculo,
      formData,
      calculationResult,
      calculationNumber
    });

    const duration = Date.now() - startTime;
    console.log(`[PDF] Generado en ${duration}ms, tamaño: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    // Responder con PDF binario
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Honorarios-CPAU-${calculationNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF] Error generando certificado:', error);
    return res.status(500).json({
      success: false,
      error: 'Error generando el certificado PDF',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

module.exports = router;
```

**4. Crear Servicio `pdfService.js`**

**Ubicación:** `App/Backend/Node/src/services/pdfService.js`

```javascript
/**
 * pdfService.js
 * Servicio para generar certificados PDF con Puppeteer
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

    // Lanzar navegador
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Setear contenido HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0' // Espera a que carguen imágenes embebidas
    });

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
    return pdfBuffer;

  } catch (error) {
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
  const currentDate = new Date().toLocaleDateString('es-AR');

  // Logo CPAU embebido en base64
  // TODO: Obtener de assets/icons/logoBlanco.svg y convertir
  const logoCPAU = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIi4uLg==';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Certificado de Honorarios CPAU - ${calculationNumber}</title>
      <style>
        /* Estilos del certificado - Ver SPEC010-T010-002 para plantilla completa */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm 15mm;
          page-break-after: always;
        }
        .page:last-child { page-break-after: auto; }
        
        /* Header */
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
        .logo { width: 140px; height: auto; filter: brightness(0) invert(1); }
        .header-title { font-size: 18pt; font-weight: 600; }
        
        /* Layout */
        .two-column-layout { display: flex; gap: 20px; margin-top: 20px; }
        .left-column { flex: 1; }
        .right-column { flex: 1.2; }
        
        /* Tablas */
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        thead th { background: #f5f5f5; padding: 8px; border-bottom: 2px solid #ddd; }
        tbody td { padding: 6px; border-bottom: 1px solid #eee; }
        .total-row { background: #2d5f3f; color: white; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="certificate-header">
          <img src="${logoCPAU}" alt="CPAU Logo" class="logo">
          <div>
            <div class="header-title">Cálculo de honorarios profesionales</div>
            <div>Fecha: ${currentDate} | Nº: ${calculationNumber}</div>
          </div>
        </div>
        
        <div class="two-column-layout">
          <div class="left-column">
            <h4>Resumen del Proyecto</h4>
            <p><strong>Nombre:</strong> ${formData.nombreProyecto || 'N/A'}</p>
            <p><strong>Cliente:</strong> ${formData.cliente || 'N/A'}</p>
            <p><strong>Superficie:</strong> ${formData.superficieTotal || 0} m²</p>
            <p><strong>Costo estimado:</strong> ${formatCurrency(formData.valorObra || 0)}</p>
          </div>
          
          <div class="right-column">
            <h4>Detalle de honorarios</h4>
            <table>
              <thead>
                <tr>
                  <th>Tarea Profesional</th>
                  <th>Importe ARS</th>
                </tr>
              </thead>
              <tbody>
                ${generarFilasTabla(calculationResult)}
                <tr class="total-row">
                  <td><strong>TOTAL GENERAL</strong></td>
                  <td><strong>${formatCurrency(calculationResult.totalGeneral || 0)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Página 2: Notas -->
      <div class="page">
        <h3>Notas sobre el Cálculo de Honorarios</h3>
        <pre>${getNotasPDF()}</pre>
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
  // Placeholder - implementar con datos reales
  return '<tr><td>Proyecto y Dirección</td><td>$ 0,00</td></tr>';
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
  return 'Notas sobre el cálculo de honorarios...';
}

module.exports = {
  generarCertificado
};
```

**5. Registrar Router en `app.js`**

```javascript
// Importar nuevo router
const exportarPdfRouter = require('./routes/calculos/exportarPdf');

// Registrar ruta
app.use('/api/calculos', exportarPdfRouter);
```

**6. Validar `lambda.js` (Binary Support)**

Asegurar que tiene soporte para PDFs binarios:

```javascript
module.exports.handler = serverless(app, {
    binary: ['image/*', 'application/pdf'], // ✅ Ya configurado
    // ...
});
```

---

#### **Criterios de Aceptación**

- [ ] **T003-CA-001:** Dependencias instaladas (`puppeteer-core`, `@sparticuz/chromium`)
- [ ] **T003-CA-002:** Endpoint `POST /api/calculos/exportar-pdf` responde correctamente
- [ ] **T003-CA-003:** PDF se genera con texto seleccionable (vectorial)
- [ ] **T003-CA-004:** Response tiene headers correctos (`Content-Type`, `Content-Disposition`, `Content-Length`)
- [ ] **T003-CA-005:** Manejo de errores con status 400/500 + JSON de error
- [ ] **T003-CA-006:** Logs de duración y tamaño del PDF en CloudWatch
- [ ] **T003-CA-007:** Testing local (fuera de Lambda) funciona con Chrome local
- [ ] **T003-CA-008:** Deploy a Lambda QA exitoso
- [ ] **T003-CA-009:** Cold start < 8 segundos, warm start < 3 segundos
- [ ] **T003-CA-010:** PDF generado < 500 KB

---

#### **Testing Manual**

```bash
# Payload de prueba
curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/calculos/exportar-pdf \
  -H "Content-Type: application/json" \
  -d @test-payload.json \
  --output certificado-test.pdf
```

**test-payload.json:**
```json
{
  "tipoCalculo": "basico-proyecto-direccion",
  "calculationNumber": "20260611-001",
  "formData": {
    "nombreProyecto": "Edificio Residencial San Martín",
    "cliente": "Constructora ABC S.A.",
    "superficieTotal": 1500,
    "valorObra": 150000000,
    "cotizDolar": 1050
  },
  "calculationResult": {
    "totalGeneral": 8250000
  }
}
```

---

#### **Deployment Manual**

**Flujo de trabajo:**

1. **Desarrollo y pruebas locales:**
   ```bash
   cd App/Backend/Node
   npm start  # Probar con Postman en localhost:3000
   ```

2. **Generar ZIP de deployment:**
   ```bash
   npm run package
   ```
   > Esto ejecuta `create-deployment-package.js` y genera `ch2026-backend-api-lambda.zip`

3. **Subir a AWS Lambda:**
   
   **Opción A - AWS CLI (recomendado):**
   ```bash
   npm run upload:qa
   ```
   
   **Opción B - AWS Console:**
   - Ir a: https://console.aws.amazon.com/lambda/
   - Seleccionar función: `ch2026-backend-api-qa`
   - Sección **Code** → **Upload from** → **.zip file**
   - Seleccionar: `ch2026-backend-api-lambda.zip`
   - Click **Save**

4. **Configurar memoria de Lambda (solo primera vez):**
   - AWS Console → Lambda → `ch2026-backend-api-qa`
   - **Configuration** → **General configuration** → **Edit**
   - **Memory:** `1024 MB` (para Puppeteer + Chromium)
   - **Save**

5. **Probar en QA:**
   ```bash
   curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/calculos/exportar-pdf \
     -H "Content-Type: application/json" \
     -d @test-payload.json \
     --output certificado-test.pdf
   ```

> **Nota:** El archivo `DEPLOY-MANUAL.md` en la raíz del proyecto Backend contiene la documentación completa de este flujo.

---

### 🎫 T010-004 — Integración Frontend para PDF Backend

**Tipo:** Frontend / React
**Fase:** 1
**Estado:** ✅ REFINADO — Listo para desarrollo
**Depende de:** T010-003 ✅
**Estimación:** 3-4 horas
**Stack:** React 18, Vite, Service Layer Pattern

**Descripción:**
Refactorizar el componente `ResultadoBasicoDetalle.jsx` para consumir el endpoint backend de generación de PDF. Eliminar toda la lógica de `html2pdf.js` y la ventana de previsualización.

---

#### **Alcance del Ticket**

**0. LIMPIEZA DE CÓDIGO LEGACY (PRE-REQUISITO)**

Antes de implementar la nueva funcionalidad, eliminar TODO el código relacionado con la página 2 de notas y la funcionalidad de preview que NO se ve en pantalla:

**A. Eliminar imports no utilizados:**
- `import { useRef } from 'react'` → mantener solo `useState`
- `import { PDF_NOTAS } from '../../utils/pdfConstants'`
- `import { FaExclamationTriangle } from 'react-icons/fa'` (si solo se usa en modal de mantenimiento)

**B. Eliminar estados y refs:**
- `const pdfRef = useRef(null)`
- `const [showMaintenanceModal, setShowMaintenanceModal]`

**C. Eliminar funciones de preview:**
- `abrirVentanaPreview()`
- `copiarEstilosAVentana()`
- `convertirRutasAAbsolutas()`
- `mostrarModalMantenimiento()`

**D. Eliminar wrapper con ref:**
- Quitar `<div ref={pdfRef}>` que envuelve todo el contenido
- Mantener solo el contenido visible en pantalla

**E. Eliminar PÁGINA 2 completa:**
- Todo el bloque `<div className={`${styles.page} ${styles.pageBreak}`}>` (líneas ~887-952)
- Incluye: header repetido, sección de notas con PDF_NOTAS

**F. Eliminar Modal de Mantenimiento:**
- Todo el componente `<Modal isOpen={showMaintenanceModal}...>`

**Resultado esperado:** El componente debe tener SOLO el código que se ve en pantalla (header, resumen, disclaimer, checkbox, botón, tablas de honorarios).

---

**1. Crear Service Layer `pdfService.js`**

**Ubicación:** `App/Frontend/src/services/pdfService.js`

```javascript
/**
 * pdfService.js
 * Servicio para descargar certificados PDF desde el backend
 * SPEC: SPEC010-CALC-Entregables (T010-004)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Descarga el PDF del certificado de honorarios
 * @param {Object} datos - { tipoCalculo, formData, calculationResult, calculationNumber }
 * @returns {Blob} Blob del PDF
 */
export async function descargarCertificadoPDF(datos) {
  const response = await fetch(`${API_BASE_URL}/api/calculos/exportar-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error generando el PDF');
  }

  return response.blob();
}
```

**2. Refactorizar `ResultadoBasicoDetalle.jsx`**

**Cambios a realizar:**

**A. Eliminar:**
- Función `abrirVentanaPreview`
- Función `copiarEstilosAVentana`
- Función `convertirRutasAAbsolutas`
- Ref `pdfRef`
- Todo el código relacionado con `html2pdf.js`

**B. Agregar:**

```javascript
import { descargarCertificadoPDF } from '../../services/pdfService';
import { toast } from 'react-toastify';
import { FaDownload, FaSpinner } from 'react-icons/fa';

// Estados
const [loadingPDF, setLoadingPDF] = useState(false);
const [errorPDF, setErrorPDF] = useState(null);

/**
 * Handler para descargar PDF desde el backend
 */
async function handleDescargarPDF() {
  setLoadingPDF(true);
  setErrorPDF(null);

  try {
    // Llamar al backend
    const blob = await descargarCertificadoPDF({
      tipoCalculo: 'basico-proyecto-direccion',
      formData,
      calculationResult,
      calculationNumber
    });

    // Crear URL temporal y disparar descarga
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Honorarios-CPAU-${calculationNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('PDF descargado correctamente');

  } catch (error) {
    console.error('Error descargando PDF:', error);
    setErrorPDF(error.message);
    toast.error('Error al descargar el PDF');
  } finally {
    setLoadingPDF(false);
  }
}
```

**C. Actualizar botón:**

```jsx
<button
  onClick={handleDescargarPDF}
  disabled={loadingPDF}
  className={styles.downloadButton}
  aria-label="Descargar certificado PDF"
>
  {loadingPDF ? (
    <>
      <FaSpinner className={styles.spinner} />
      Generando PDF...
    </>
  ) : (
    <>
      <FaDownload />
      Descargar Certificado PDF
    </>
  )}
</button>

{errorPDF && (
  <p className={styles.errorMessage} role="alert">
    {errorPDF}
  </p>
)}
```

**D. Agregar estilos en `ResultadoBasicoDetalle.module.css`:**

```css
.downloadButton {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.downloadButton:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.downloadButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.errorMessage {
  color: var(--color-error);
  font-size: 0.9rem;
  margin-top: 8px;
}
```

**3. Eliminar Dependencias**

```bash
cd App/Frontend
npm uninstall html2pdf.js  # Si está en package.json
```

**4. Limpiar Código Legacy**

- **Eliminar:** `App/Frontend/src/utils/pdfConstants.js` (migrado al backend)
- **Eliminar:** Bloque `@media print` de `ResultadoBasicoDetalle.module.css`
- **Eliminar:** Cualquier referencia a `html2pdf` en el código

**5. Actualizar `.env` / `.env.dev`**

Asegurar que `VITE_API_URL` apunta al backend correcto:

```env
# .env.dev
VITE_API_URL=https://cpau-ch2026-api-qa.neosisweb.ar
```

---

#### **Criterios de Aceptación**

- [ ] **T004-CA-001:** Servicio `pdfService.js` implementado y testeado
- [ ] **T004-CA-002:** Click en "Descargar PDF" llama al endpoint backend correcto
- [ ] **T004-CA-003:** Descarga se dispara automáticamente (sin ventana de preview)
- [ ] **T004-CA-004:** Spinner y estado loading funcionan correctamente
- [ ] **T004-CA-005:** Manejo de errores con toast y mensaje visible
- [ ] **T004-CA-006:** Dependencia `html2pdf.js` eliminada del `package.json`
- [ ] **T004-CA-007:** Código legacy de preview completamente eliminado
- [ ] **T004-CA-008:** Bundle size reducido (~100 KB menos por eliminación de html2pdf)
- [ ] **T004-CA-009:** Testing en dev local contra backend QA sin errores
- [ ] **T004-CA-010:** Deploy a producción exitoso, PDF se descarga correctamente

---

#### **Testing Manual**

1. **Escenario exitoso:**
   - Completar cálculo de honorarios
   - Click en "Descargar PDF"
   - Verificar spinner mientras se genera
   - Verificar descarga automática del PDF
   - Abrir PDF y validar contenido

2. **Escenario de error:**
   - Simular backend caído (cambiar URL en `.env`)
   - Click en "Descargar PDF"
   - Verificar mensaje de error claro
   - Verificar toast de error

3. **Testing cross-browser:**
   - Chrome, Edge, Firefox, Safari
   - Validar descarga funciona en todos

---

#### **Estado de Implementación**

**Fecha de implementación:** 2025-06-04  
**Estado:** ✅ **COMPLETADO**

**Archivos modificados:**
1. ✅ **App/Frontend/src/services/pdfService.js** - CREADO
   - Servicio para llamar al endpoint `/api/calculos/exportar-pdf`
   - Manejo de errores con mensajes descriptivos
   - Retorna blob del PDF generado

2. ✅ **App/Frontend/src/components/wizard/ResultadoBasicoDetalle.jsx** - REFACTORIZADO
   - ELIMINADO: Imports de `useRef`, `PDF_NOTAS`, `FaExclamationTriangle`
   - ELIMINADO: Estados `pdfRef`, `showMaintenanceModal`
   - ELIMINADO: Funciones legacy (abrirVentanaPreview, copiarEstilosAVentana, etc.)
   - ELIMINADO: Wrapper `<div ref={pdfRef}>`
   - ELIMINADO: PÁGINA 2 completa (líneas 887-952)
   - ELIMINADO: Modal de mantenimiento
   - AGREGADO: Import de `descargarCertificadoPDF` desde pdfService
   - AGREGADO: Import de `FaDownload`, `FaSpinner` desde react-icons/fa
   - AGREGADO: Estados `loadingPDF` y `errorPDF`
   - REFACTORIZADO: `handleDescargarPDF()` usa backend endpoint
   - ACTUALIZADO: Botón con spinner y estado de loading
   - AGREGADO: Mensaje de error visible bajo el botón

3. ✅ **App/Frontend/src/components/wizard/ResultadoBasicoDetalle.module.css** - ACTUALIZADO
   - AGREGADO: `.spinner` con animación de rotación
   - AGREGADO: `.errorMessage` con estilos de error

4. ✅ **App/Frontend/src/utils/pdfConstants.js** - ELIMINADO
   - Archivo completo eliminado (contenido migrado al backend)

5. ✅ **App/Frontend/package.json** - ACTUALIZADO
   - ELIMINADO: Dependencia `html2pdf.js`

**Configuración:**
- ⚠️ **VITE_API_URL** en `.env` apunta a `http://localhost:3000/api`
  - Para usar backend QA: cambiar a `https://cpau-ch2026-api-qa.neosisweb.ar`
  - Ejecutar `npm install` después de clonar para sincronizar dependencias

**Notas técnicas:**
- El componente ahora es ~200 líneas más corto (eliminación de código legacy)
- Bundle size reducido en ~100 KB (eliminación de html2pdf.js)
- Descarga directa sin ventana de preview intermedia
- Manejo de errores robusto con mensajes descriptivos

---

---

## 8. CRITERIOS DE ACEPTACIÓN GLOBALES

> **Nota:** Estos criterios aplican a la solución completa (T010-003 + T010-004). Los criterios específicos de cada ticket están detallados en la sección 7.

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

### 10.1 Qué se elimina del frontend tras T010-004
- Dependencia `html2pdf.js` en `package.json`.
- Código de ventana de previsualización (`abrirVentanaPreview` y helpers relacionados).
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

*Documento vivo — actualizar a medida que avancen los tickets T010-001/002/003/004.*
