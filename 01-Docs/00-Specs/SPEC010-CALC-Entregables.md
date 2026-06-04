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
                 │ POST /api/v1/honorarios/exportar-pdf
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
│  - Descarga: Honorarios-CPAU-{n}.pdf│
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
POST /api/v1/honorarios/exportar-pdf

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
**Estado:** A analizar

**Descripción:**
Diseñar e implementar la tabla `Entregables_PDF` y la tabla de relación con `Tareas_Profesionales`. Permite que cada tarea profesional tenga asociada una (o varias) plantilla(s) de entregable PDF.

**Alcance (alto nivel):**
- Definir schema de `Entregables_PDF` (id, nombre, versión, HTML, estilos, metadata).
- Definir schema de relación `Tareas_Profesionales_Entregables_PDF`.
- Migración/seed con la plantilla inicial de "Proyecto y Dirección Básico" (extraída de T010-003).
- Endpoint/servicio para resolver: dada una tarea, ¿qué plantilla usar?

**Detalle:** se desarrolla en su propio ticket técnico durante el grooming.

---

### 🎫 T010-002 — Almacenamiento del HTML de plantillas en `Entregables_PDF`

**Tipo:** Backend / Base de datos / Content
**Fase:** 2
**Estado:** A analizar
**Depende de:** T010-001

**Descripción:**
Cargar en la tabla `Entregables_PDF` el código HTML (y CSS asociado) de las plantillas de cada entregable. Estas plantillas son las que el servicio Puppeteer renderiza y exporta a PDF.

**Alcance (alto nivel):**
- Definir formato de la plantilla: HTML + placeholders (ej. `{{formData.nombreProyecto}}`, `{{tabla_honorarios}}`).
- Definir motor de templating mínimo (Handlebars / Mustache / template literals).
- Cargar la plantilla de "Proyecto y Dirección Básico" como primer registro.
- Estrategia de versionado de plantillas (para auditoría histórica de PDFs ya emitidos).

**Detalle:** se desarrolla en su propio ticket técnico durante el grooming.

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
- Crear handler `POST /api/v1/honorarios/exportar-pdf`.
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
