# SPEC-ADMIN-020: Template Manager - Herramienta de Gestión de Templates PDF

**Fecha:** 14/07/2026
**Versión:** 1.0
**Estado:** 🟡 PROPUESTA — A APROBAR
**Autor:** Equipo de Desarrollo CH2026
**Solicitante:** Charly (Tech Lead)
**Dependencias:**
- SPEC010-CALC-Entregables (Generación de PDF con Puppeteer — ✅ implementada)

> **⚠️ ALCANCE:**
> Esta SPEC implementa una **herramienta de administración de templates PDF** para agilizar el flujo de trabajo entre el diseñador frontend y el backend. Permite subir, previsualizar y actualizar templates HTML en la base de datos sin intervención manual del Tech Lead, eliminando el cuello de botella actual en el proceso de desarrollo.

---

## 📋 ÍNDICE

1. [Problema Original](#1-problema-original)
2. [Análisis de la Situación Actual](#2-análisis-de-la-situación-actual)
3. [Propuesta de Solución](#3-propuesta-de-solución)
4. [Arquitectura y Flujo](#4-arquitectura-y-flujo)
5. [Componentes Técnicos](#5-componentes-técnicos)
6. [Tickets](#6-tickets)
7. [Criterios de Aceptación Globales](#7-criterios-de-aceptación-globales)
8. [Consideraciones de Seguridad](#8-consideraciones-de-seguridad)
9. [Plan de Testing](#9-plan-de-testing)

---

## 1. PROBLEMA ORIGINAL

### 1.1 Contexto del Problema

El proyecto CH2026 tiene implementado un sistema de generación de PDFs con plantillas HTML almacenadas en base de datos (SPEC010). El diseñador frontend necesita iterar rápidamente sobre los diseños de certificados, pero el flujo actual es extremadamente lento:

**Workflow Actual (Manual):**
```
1. Diseñador edita HTML en su editor local
2. Push a rama de Git
3. Charly hace pull
4. Charly ejecuta script generar-sql-template.js
5. Charly copia hex manualmente
6. Charly actualiza BD con UPDATE manual
7. Charly deploya Frontend a QA
8. Diseñador prueba en QA
```

⏱️ **Tiempo por iteración:** 30-60 minutos  
🔴 **Cuello de botella:** Charly es blocker en pasos 3-7

### 1.2 Pain Points Identificados

| Problema | Impacto | Frecuencia |
|----------|---------|------------|
| Diseñador no puede ver preview con datos reales | Alta fricción en diseño | Cada cambio |
| Proceso manual propenso a errores | Bugs en producción | 2-3 veces/semana |
| Charly es blocker en el proceso | Retrasa sprints | Diariamente |
| No hay feedback inmediato | Desperdicio de tiempo | Cada iteración |
| Copy/paste de hex es tedioso | Frustración del equipo | Cada deploy |

### 1.3 Impacto en el Proyecto

- **Velocidad de desarrollo reducida en 70%** debido a esperas
- **6-8 horas semanales de Charly** dedicadas a tareas mecánicas
- **Frustración del diseñador** al no poder iterar de forma autónoma
- **Riesgo de errores** en el proceso manual de actualización

---

## 2. ANÁLISIS DE LA SITUACIÓN ACTUAL

### 2.1 Entorno de Trabajo del Diseñador

**Características:**
- ✅ Tiene acceso al proyecto Frontend
- ✅ Corre Frontend local apuntando a API QA
- ❌ NO tiene acceso al Backend local
- ❌ NO tiene acceso directo a la base de datos
- ❌ NO tiene Node.js ni scripts del backend
- ✅ Puede ver resultados finales en QA después del deploy

### 2.2 Assets Actuales que Funcionan

**Backend:**
- ✅ `pdfService.js` - Generación de PDFs con Puppeteer operativo
- ✅ `entregablesService.js` - Resolución de templates desde BD
- ✅ `handlebarsHelpers.js` - Helpers para hidratar templates
- ✅ Tabla `Entregables_PDF` con estructura completa
- ✅ SPs: `Entregables_PDF_Buscar`, `Entregables_PDF_BuscarXCodigo`

**Scripts:**
- ✅ `generar-sql-template.js` - Conversión HTML → Hex (usado manualmente)

### 2.3 Limitaciones a Considerar

1. **Sin autenticación en endpoints de admin** (temporal - entorno de desarrollo)
2. **Diseñador trabaja solo con herramientas frontend** (HTML, CSS, JavaScript)
3. **Todo acceso a BD debe usar Stored Procedures** (estándar del proyecto)
4. **API Gateway configurado para binarios** (ya soporta PDF, debe soportar HTML)

---

## 3. PROPUESTA DE SOLUCIÓN

### 3.1 Solución: Template Manager API + HTML Standalone

**Arquitectura de la solución:**

```
┌──────────────────────────────────────────────────────────────┐
│  DISEÑADOR (Local)                                           │
│                                                              │
│  1. Abre template-manager.html en navegador                 │
│  2. Pega su HTML en el editor                               │
│  3. Click "Preview" → Ve resultado con datos reales         │
│  4. Ajusta diseño                                            │
│  5. Click "Subir a QA" → BD actualizada automáticamente     │
│                                                              │
│  ⏱️ Tiempo total: 30 segundos por iteración                 │
└──────────────────────────────────────────────────────────────┘
                            ↓ HTTP POST
┌──────────────────────────────────────────────────────────────┐
│  BACKEND QA (Lambda)                                         │
│                                                              │
│  POST /api/admin/templates/preview                          │
│  → Hidrata HTML con test-data                               │
│  → Retorna HTML renderizado                                 │
│                                                              │
│  POST /api/admin/templates/:id/update                       │
│  → Valida HTML                                              │
│  → Convierte a hex                                          │
│  → SP: Entregables_PDF_ActualizarTemplate                  │
│  → Retorna success                                          │
│                                                              │
│  GET /api/admin/templates/test-data                         │
│  → Retorna JSON con payload de ejemplo                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Beneficios de la Solución

| Aspecto | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo por iteración | 30-60 min | 30 seg | **98% menos** |
| Intervención de Charly | 100% | 0% | **Autonomía total** |
| Preview con datos reales | ❌ | ✅ | **Feedback inmediato** |
| Riesgo de errores | Alto | Bajo | **Validación automática** |
| Frustración del equipo | Alta | Baja | **UX mejorado** |

### 3.3 Decisiones Técnicas

**✅ Decisiones Confirmadas:**

1. **Sin autenticación**: Endpoints abiertos (temporal, solo desarrollo/QA)
2. **HTML Standalone**: Tool intermedio (textarea + preview + validación)
3. **Test Data**: Hardcodeado en archivo JSON en backend
4. **Versionado**: Sobrescribir template actual (historial en Git)
5. **Stored Procedures**: TODO acceso a BD encapsulado en SPs

---

## 4. ARQUITECTURA Y FLUJO

### 4.1 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  1. PREVIEW WORKFLOW                                            │
└─────────────────────────────────────────────────────────────────┘

Diseñador                    template-manager.html              Backend QA
    │                                │                              │
    │ 1. Edita HTML                  │                              │
    │ 2. Click "Preview"             │                              │
    │───────────────────────────────>│                              │
    │                                │ POST /api/admin/templates/   │
    │                                │      preview                 │
    │                                │─────────────────────────────>│
    │                                │                              │
    │                                │      { html, testData }      │
    │                                │                              │
    │                                │              3. Hidrata con  │
    │                                │                 Handlebars   │
    │                                │              4. Retorna HTML │
    │                                │<─────────────────────────────│
    │                                │                              │
    │ 5. Muestra en iframe           │                              │
    │<───────────────────────────────│                              │
    │                                │                              │


┌─────────────────────────────────────────────────────────────────┐
│  2. UPDATE WORKFLOW                                             │
└─────────────────────────────────────────────────────────────────┘

Diseñador                    template-manager.html              Backend QA
    │                                │                              │
    │ 1. Satisfecho con diseño       │                              │
    │ 2. Click "Subir a QA"          │                              │
    │───────────────────────────────>│                              │
    │                                │ POST /api/admin/templates/   │
    │                                │      :id/update              │
    │                                │─────────────────────────────>│
    │                                │                              │
    │                                │      { html }                │
    │                                │                              │
    │                                │              3. Valida HTML  │
    │                                │              4. Convierte hex│
    │                                │              5. SP UPDATE    │
    │                                │              6. Success      │
    │                                │<─────────────────────────────│
    │                                │                              │
    │ 7. Alerta "✅ Actualizado"     │                              │
    │<───────────────────────────────│                              │
    │                                │                              │
```

### 4.2 Endpoints de la API

#### **Endpoint 1: Preview de Template**

```http
POST /api/admin/templates/preview
Content-Type: application/json

Request:
{
  "html": "<html>...{{formData.nombreProyecto}}...</html>",
  "testData": null  // Si null, usa test-data.json del backend
}

Response (200):
Content-Type: text/html
Body: <html>...Proyecto Demo...</html>

Response (400):
{
  "success": false,
  "error": "HTML inválido o vacío"
}

Response (500):
{
  "success": false,
  "error": "Error renderizando template",
  "details": "Error en sintaxis Handlebars"
}
```

#### **Endpoint 2: Actualizar Template**

```http
POST /api/admin/templates/:id/update
Content-Type: application/json

Request:
{
  "html": "<html>...</html>"
}

Response (200):
{
  "success": true,
  "message": "Template actualizado exitosamente",
  "entregableId": 1,
  "htmlSize": 45678,
  "timestamp": "2026-07-14T15:30:00Z"
}

Response (400):
{
  "success": false,
  "error": "HTML inválido: supera tamaño máximo (500 KB)"
}

Response (404):
{
  "success": false,
  "error": "Entregable no encontrado: ID 999"
}

Response (500):
{
  "success": false,
  "error": "Error actualizando template en base de datos"
}
```

#### **Endpoint 3: Obtener Test Data**

```http
GET /api/admin/templates/test-data

Response (200):
{
  "success": true,
  "data": {
    "formData": {
      "nombreProyecto": "Edificio Residencial Centro",
      "cliente": "Inmobiliaria del Sur S.A.",
      // ... más datos
    },
    "calculationResult": {
      // ... datos de cálculo
    }
  }
}
```

---

## 5. COMPONENTES TÉCNICOS

### 5.1 Backend - Router Admin Templates

**Ubicación:** `App/Backend/Node/src/routes/admin/templates.js`

**Responsabilidades:**
- Registrar rutas `/api/admin/templates/*`
- Validar payloads de entrada
- Delegar lógica a service layer
- Manejar errores y retornar responses apropiadas

### 5.2 Backend - Service Admin Templates

**Ubicación:** `App/Backend/Node/src/services/adminTemplatesService.js`

**Responsabilidades:**
- Renderizar preview de templates con Handlebars
- Validar sintaxis HTML y Handlebars
- Convertir HTML a hexadecimal
- Llamar SPs para actualizar BD
- Cargar test data desde JSON

### 5.3 Backend - Stored Procedures

**SPs a Crear:**

1. **`Entregables_PDF_ActualizarTemplate`**
   - Input: `@entregableId INT`, `@htmlTemplate LONGTEXT`
   - Output: Filas afectadas
   - Acción: UPDATE del template

2. **`Entregables_PDF_ObtenerPorID`** (si no existe)
   - Input: `@entregableId INT`
   - Output: Row completa del entregable
   - Acción: SELECT con validación

### 5.4 Backend - Test Data

**Ubicación:** `App/Backend/Node/src/data/test-data-templates.json`

**Estructura:**
```json
{
  "tipoCalculo": "basico-proyecto-direccion",
  "tipoNombre": "Proyecto y Dirección de Obra",
  "formData": {
    "calculoId": 123456,
    "nombreProyecto": "Edificio Residencial Centro",
    "cliente": "Inmobiliaria del Sur S.A.",
    "tipoObra": "Obra Nueva",
    "destinoUso": "Residencial",
    "superficieTotal": 1500,
    "valorObraARS": 450000000,
    "valorObraUSD": 450000,
    "cotizacionDolar": 1000
  },
  "calculationResult": {
    "honorariosObra": [
      {
        "indice": "1.1",
        "tareaProfesional": "Proyecto y Dirección de Obra",
        "importeARS": "45.000.000,00",
        "importeUSD": "45.000,00",
        "porcentaje": "10.00"
      }
    ],
    "subtotalObraARS": "45.000.000,00",
    "subtotalObraUSD": "45.000,00",
    "totalGeneralARS": "45.000.000,00",
    "totalGeneralUSD": "45.000,00",
    "plazoEjecucion": 18
  }
}
```

> **NOTA:** Este JSON es un **placeholder inicial**. Charly proporcionará el payload completo con todos los campos requeridos en T020-001.

### 5.5 Frontend - HTML Standalone Tool

**Ubicación:** `App/Backend/Node/tools/template-manager.html`

**Características:**
- ✅ Textarea para editar HTML (sin syntax highlighting en v1)
- ✅ Botón "Preview" que muestra resultado en iframe
- ✅ Botón "Subir a QA" que actualiza BD
- ✅ Input para seleccionar `entregableId`
- ✅ Indicadores de loading/success/error
- ✅ Validación básica de HTML vacío
- ✅ Responsive (funciona en cualquier pantalla)

**Tecnologías:**
- HTML5 puro (sin dependencias)
- CSS3 para estilos
- JavaScript Vanilla (fetch API)
- No requiere npm install ni build

---

## 6. TICKETS

Esta SPEC se divide en **4 tickets** para facilitar el desarrollo incremental:

| Ticket | Descripción | Estimación | Depende de | Prioridad |
|--------|-------------|------------|------------|-----------|
| **T020-001** | Test Data JSON para Templates | 1-2h | - | Alta |
| **T020-002** | Stored Procedures para Gestión de Templates | 2-3h | - | Alta |
| **T020-003** | Backend API - Endpoints Admin Templates | 3-4h | T020-002 | Alta |
| **T020-004** | HTML Standalone - Template Manager Tool | 2-3h | T020-003 | Alta |

**Orden de ejecución recomendado:** T020-001 → T020-002 → T020-003 → T020-004

**Duración total estimada:** 8-12 horas

---

### 🎫 T020-001 — Test Data JSON para Templates

**Tipo:** Backend / Datos
**Estado:** ✅ REFINADO — Listo para desarrollo
**Estimación:** 1-2 horas
**Responsable:** Charly (Tech Lead)

---

#### **Descripción**

Crear archivo JSON con datos de prueba completos para hidratar templates HTML durante preview. Este archivo debe contener un payload realista que incluya todas las variables que usan los templates actuales.

---

#### **Alcance del Ticket**

**1. Crear archivo de test data**

**Ubicación:** `App/Backend/Node/src/data/test-data-templates.json`

**Estructura base (Charly completará con datos reales):**

```json
{
  "version": "1.0",
  "description": "Datos de prueba para preview de templates PDF - Proyecto y Dirección Básico",
  "lastUpdate": "2026-07-14",
  
  "tipoCalculo": "basico-proyecto-direccion",
  "tipoNombre": "Proyecto y Dirección de Obra",
  "calculationNumber": "20260714-001",
  "currentDate": "14/07/2026",
  
  "formData": {
    "calculoId": 123456,
    "nombreProyecto": "Edificio Residencial Centro",
    "cliente": "Inmobiliaria del Sur S.A.",
    "tipoObra": "Obra Nueva",
    "destinoUso": "Residencial",
    "superficieTotal": 1500,
    "valorObraARS": 450000000,
    "valorObraUSD": 450000,
    "cotizacionDolar": 1000
  },
  
  "calculationResult": {
    "honorariosObra": [
      {
        "indice": "1.1",
        "tareaProfesional": "Proyecto y Dirección de Obra",
        "importeARS": "$ 45.000.000,00",
        "importeUSD": "USD 45.000,00",
        "porcentaje": "10.00"
      }
    ],
    "honorariosAdicionales": [],
    "honorariosEspecialidades": [],
    
    "subtotalObraARS": "$ 45.000.000,00",
    "subtotalObraUSD": "USD 45.000,00",
    "subtotalObraPorcentaje": "10.00",
    
    "subtotalAdicionalesARS": "$ 0,00",
    "subtotalAdicionalesUSD": "USD 0,00",
    "subtotalAdicionalesPorcentaje": "0.00",
    
    "subtotalEspecialidadesARS": "$ 0,00",
    "subtotalEspecialidadesUSD": "USD 0,00",
    "subtotalEspecialidadesPorcentaje": "0.00",
    
    "totalGeneralARS": "$ 45.000.000,00",
    "totalGeneralUSD": "USD 45.000,00",
    "totalGeneralPorcentaje": "10.00",
    
    "plazoEjecucion": 18
  },
  
  "logoCPAU": "data:image/svg+xml;base64,..."
}
```

**2. Documentar estructura**

Crear `README-TEST-DATA.md` en el mismo directorio explicando:
- Propósito del archivo
- Cómo agregar nuevos campos
- Cómo mantener sincronizado con templates

**3. Validar con template actual**

- Cargar test data en `pdfService.js`
- Hidratar template `certificado-basico-proyecto-direccion.html`
- Verificar que todas las variables se resuelven sin errores

---

#### **Criterios de Aceptación**

- [ ] **T001-CA-001:** Archivo `test-data-templates.json` creado en `src/data/`
- [ ] **T001-CA-002:** JSON válido (sin errores de sintaxis)
- [ ] **T001-CA-003:** Incluye todos los campos usados en template actual
- [ ] **T001-CA-004:** Logo CPAU en base64 incluido
- [ ] **T001-CA-005:** README creado con documentación clara
- [ ] **T001-CA-006:** Test manual: template se hidrata sin errores usando estos datos

---

#### **Notas Técnicas**

1. **Logo CPAU:** Usar el mismo que está en `assets` del proyecto
2. **Formato de moneda:** Debe coincidir con el output de `formatCurrencyARS` helper
3. **Arrays vacíos:** Incluir `honorariosAdicionales: []` para testear condicionales `{{#if}}`
4. **Extensibilidad:** Estructura debe permitir agregar más tipos de cálculo en el futuro

---

#### **Entregables**

- `src/data/test-data-templates.json`
- `src/data/README-TEST-DATA.md`
- Prueba exitosa de hidratación del template

---

### 🎫 T020-002 — Stored Procedures para Gestión de Templates

**Tipo:** Backend / Base de Datos
**Estado:** ✅ REFINADO — Listo para desarrollo
**Estimación:** 2-3 horas
**Depende de:** -

---

#### **Descripción**

Crear Stored Procedures para encapsular toda la lógica SQL de gestión de templates. Siguiendo el estándar del proyecto, **NO debe haber SQL directo en el código del backend**, solo llamadas a SPs.

---

#### **Alcance del Ticket**

**1. SP: Actualizar Template**

**Ubicación:** `App/Backend/DB/02-StoredProcedures/Entregables_PDF_ActualizarTemplate.sql`

```sql
-- ============================================================================
-- SP: Entregables_PDF_ActualizarTemplate
-- Descripción: Actualiza el HTML template de un entregable existente
-- Parámetros:
--   @p_entregableId INT - ID del entregable a actualizar
--   @p_htmlTemplate LONGTEXT - Contenido HTML nuevo (en hexadecimal)
-- Retorna: 1 si actualizado, 0 si no existe
-- ============================================================================
DROP PROCEDURE IF EXISTS Entregables_PDF_ActualizarTemplate;

DELIMITER //

CREATE PROCEDURE Entregables_PDF_ActualizarTemplate(
    IN p_entregableId INT,
    IN p_htmlTemplate LONGTEXT
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;
    
    -- Verificar que existe el entregable
    SELECT COUNT(*) INTO v_existe
    FROM Entregables_PDF
    WHERE entregable_id = p_entregableId;
    
    IF v_existe = 0 THEN
        -- No existe, retornar 0
        SELECT 0 AS filas_afectadas, 'Entregable no encontrado' AS mensaje;
    ELSE
        -- Actualizar template
        UPDATE Entregables_PDF
        SET 
            html_template = p_htmlTemplate,
            updated_at = NOW()
        WHERE entregable_id = p_entregableId;
        
        -- Retornar éxito
        SELECT 1 AS filas_afectadas, 'Template actualizado exitosamente' AS mensaje;
    END IF;
    
END //

DELIMITER ;
```

**2. SP: Obtener Template por ID**

**Ubicación:** `App/Backend/DB/02-StoredProcedures/Entregables_PDF_ObtenerPorID.sql`

```sql
-- ============================================================================
-- SP: Entregables_PDF_ObtenerPorID
-- Descripción: Obtiene un entregable completo por su ID
-- Parámetros:
--   @p_entregableId INT - ID del entregable
-- Retorna: Row completa del entregable o NULL si no existe
-- ============================================================================
DROP PROCEDURE IF EXISTS Entregables_PDF_ObtenerPorID;

DELIMITER //

CREATE PROCEDURE Entregables_PDF_ObtenerPorID(
    IN p_entregableId INT
)
BEGIN
    SELECT 
        entregable_id,
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
        assets,
        activo,
        created_at,
        updated_at,
        created_by
    FROM Entregables_PDF
    WHERE entregable_id = p_entregableId;
    
END //

DELIMITER ;
```

**3. SP: Listar Templates Activos**

**Ubicación:** `App/Backend/DB/02-StoredProcedures/Entregables_PDF_ListarActivos.sql`

```sql
-- ============================================================================
-- SP: Entregables_PDF_ListarActivos
-- Descripción: Lista todos los templates activos (para selector en tool)
-- Parámetros: ninguno
-- Retorna: Lista de entregables con campos básicos
-- ============================================================================
DROP PROCEDURE IF EXISTS Entregables_PDF_ListarActivos;

DELIMITER //

CREATE PROCEDURE Entregables_PDF_ListarActivos()
BEGIN
    SELECT 
        entregable_id,
        nombre,
        codigo,
        descripcion,
        version,
        updated_at
    FROM Entregables_PDF
    WHERE activo = 1
    ORDER BY nombre ASC;
    
END //

DELIMITER ;
```

**4. Script de ejecución**

Crear `App/Backend/DB/99-Migrations/2026-07-14-admin-templates-sps.sql` que ejecute los 3 SPs en orden.

**5. Actualizar `entregablesService.js`**

Agregar métodos que llamen a los nuevos SPs:

```javascript
/**
 * Actualiza el HTML template de un entregable
 */
async function actualizarTemplate(entregableId, htmlTemplate) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ActualizarTemplate', [
    entregableId,
    htmlTemplate
  ]);
  return rows[0];
}

/**
 * Obtiene un entregable por ID
 */
async function obtenerPorID(entregableId) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ObtenerPorID', [entregableId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Lista templates activos
 */
async function listarActivos() {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ListarActivos', []);
  return rows;
}
```

---

#### **Criterios de Aceptación**

- [ ] **T002-CA-001:** SP `Entregables_PDF_ActualizarTemplate` creado y testeado
- [ ] **T002-CA-002:** SP `Entregables_PDF_ObtenerPorID` creado y testeado
- [ ] **T002-CA-003:** SP `Entregables_PDF_ListarActivos` creado y testeado
- [ ] **T002-CA-004:** Script de migración ejecutado sin errores
- [ ] **T002-CA-005:** `entregablesService.js` actualizado con nuevos métodos
- [ ] **T002-CA-006:** Testing manual: UPDATE de template funciona correctamente
- [ ] **T002-CA-007:** Testing manual: SELECT de template retorna datos correctos

---

#### **Testing Manual**

```sql
-- Test 1: Actualizar template existente
CALL Entregables_PDF_ActualizarTemplate(1, '<html>Test</html>');
-- Esperado: filas_afectadas = 1

-- Test 2: Actualizar template inexistente
CALL Entregables_PDF_ActualizarTemplate(999, '<html>Test</html>');
-- Esperado: filas_afectadas = 0, mensaje de error

-- Test 3: Obtener template
CALL Entregables_PDF_ObtenerPorID(1);
-- Esperado: Row completa

-- Test 4: Listar activos
CALL Entregables_PDF_ListarActivos();
-- Esperado: Lista de templates
```

---

### 🎫 T020-003 — Backend API - Endpoints Admin Templates

**Tipo:** Backend / API
**Estado:** ✅ REFINADO — Listo para desarrollo
**Depende de:** T020-002 ✅
**Estimación:** 3-4 horas

---

#### **Descripción**

Implementar los 3 endpoints RESTful para gestión de templates: preview, update y test-data. Estos endpoints serán consumidos por el HTML standalone tool.

---

#### **Alcance del Ticket**

**1. Crear Router**

**Ubicación:** `App/Backend/Node/src/routes/admin/templates.js`

```javascript
/**
 * routes/admin/templates.js
 * Router para gestión de templates PDF
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 */

const express = require('express');
const router = express.Router();
const adminTemplatesController = require('../../controllers/adminTemplatesController');

// ⚠️ NOTA: Sin middleware verificarToken (endpoints abiertos para desarrollo)

/**
 * POST /api/admin/templates/preview
 * Preview de template con datos de prueba
 */
router.post('/preview', adminTemplatesController.preview);

/**
 * POST /api/admin/templates/:id/update
 * Actualizar template en BD
 */
router.post('/:id/update', adminTemplatesController.update);

/**
 * GET /api/admin/templates/test-data
 * Obtener datos de prueba para hidratar templates
 */
router.get('/test-data', adminTemplatesController.getTestData);

/**
 * GET /api/admin/templates/list
 * Listar templates activos (para selector en tool)
 */
router.get('/list', adminTemplatesController.list);

module.exports = router;
```

**2. Registrar Router en `app.js`**

```javascript
// Importar router de admin templates
const adminTemplatesRouter = require('./routes/admin/templates');

// Registrar ruta (agregar DESPUÉS de las rutas existentes)
app.use('/api/admin/templates', adminTemplatesRouter);
```

**3. Crear Controller**

**Ubicación:** `App/Backend/Node/src/controllers/adminTemplatesController.js`

```javascript
/**
 * adminTemplatesController.js
 * Controller para gestión de templates PDF
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 */

const adminTemplatesService = require('../services/adminTemplatesService');

/**
 * POST /api/admin/templates/preview
 * Renderiza preview de template con test data
 */
exports.preview = async (req, res) => {
    try {
        const { html } = req.body;
        
        // Validación
        if (!html || html.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'HTML no puede estar vacío'
            });
        }
        
        // Renderizar preview
        const htmlRendered = await adminTemplatesService.renderizarPreview(html);
        
        // Retornar HTML (no JSON)
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(htmlRendered);
        
    } catch (error) {
        console.error('[Admin Templates] Error en preview:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error renderizando preview',
            details: error.message
        });
    }
};

/**
 * POST /api/admin/templates/:id/update
 * Actualiza template en base de datos
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { html } = req.body;
        
        // Validación de ID
        const entregableId = parseInt(id, 10);
        if (isNaN(entregableId) || entregableId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID de entregable inválido'
            });
        }
        
        // Validación de HTML
        if (!html || html.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'HTML no puede estar vacío'
            });
        }
        
        // Validar tamaño (500 KB max)
        const htmlSizeKB = Buffer.byteLength(html, 'utf8') / 1024;
        if (htmlSizeKB > 500) {
            return res.status(400).json({
                success: false,
                error: `HTML supera tamaño máximo: ${htmlSizeKB.toFixed(2)} KB (máx: 500 KB)`
            });
        }
        
        // Actualizar template
        const resultado = await adminTemplatesService.actualizarTemplate(entregableId, html);
        
        if (!resultado.success) {
            return res.status(404).json({
                success: false,
                error: resultado.error || 'Entregable no encontrado'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Template actualizado exitosamente',
            entregableId: entregableId,
            htmlSize: htmlSizeKB.toFixed(2),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error actualizando template:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error actualizando template en base de datos',
            details: error.message
        });
    }
};

/**
 * GET /api/admin/templates/test-data
 * Obtiene datos de prueba para hidratar templates
 */
exports.getTestData = async (req, res) => {
    try {
        const testData = await adminTemplatesService.obtenerTestData();
        
        return res.status(200).json({
            success: true,
            data: testData
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error obteniendo test data:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error cargando datos de prueba'
        });
    }
};

/**
 * GET /api/admin/templates/list
 * Lista templates activos
 */
exports.list = async (req, res) => {
    try {
        const templates = await adminTemplatesService.listarTemplates();
        
        return res.status(200).json({
            success: true,
            data: templates
        });
        
    } catch (error) {
        console.error('[Admin Templates] Error listando templates:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Error listando templates'
        });
    }
};
```

**4. Crear Service**

**Ubicación:** `App/Backend/Node/src/services/adminTemplatesService.js`

```javascript
/**
 * adminTemplatesService.js
 * Servicio para gestión de templates PDF (admin)
 * SPEC: SPEC020-ADMIN-Template-Manager (T020-003)
 */

const Handlebars = require('../utils/handlebarsHelpers');
const entregablesService = require('./entregablesService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Renderiza preview de template con test data
 * @param {string} html - Template HTML con sintaxis Handlebars
 * @returns {string} HTML renderizado con datos
 */
async function renderizarPreview(html) {
    try {
        // Cargar test data
        const testData = await obtenerTestData();
        
        // Compilar template con Handlebars
        const template = Handlebars.compile(html);
        
        // Renderizar con datos
        const htmlRendered = template(testData);
        
        return htmlRendered;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error renderizando preview:', error);
        throw new Error(`Error en sintaxis Handlebars: ${error.message}`);
    }
}

/**
 * Actualiza template en base de datos
 * @param {number} entregableId - ID del entregable
 * @param {string} html - Contenido HTML nuevo
 * @returns {Object} { success, error? }
 */
async function actualizarTemplate(entregableId, html) {
    try {
        // Validar sintaxis Handlebars (intentar compilar)
        try {
            Handlebars.compile(html);
        } catch (error) {
            throw new Error(`Sintaxis Handlebars inválida: ${error.message}`);
        }
        
        // Llamar SP para actualizar (NO convertir a hex aquí, lo hace el SP)
        const resultado = await entregablesService.actualizarTemplate(entregableId, html);
        
        if (resultado.filas_afectadas === 0) {
            return {
                success: false,
                error: resultado.mensaje || 'Entregable no encontrado'
            };
        }
        
        return {
            success: true,
            mensaje: resultado.mensaje
        };
        
    } catch (error) {
        console.error('[Admin Templates Service] Error actualizando template:', error);
        throw error;
    }
}

/**
 * Obtiene datos de prueba desde JSON
 * @returns {Object} Test data completo
 */
async function obtenerTestData() {
    try {
        const testDataPath = path.join(__dirname, '../data/test-data-templates.json');
        const testDataRaw = await fs.readFile(testDataPath, 'utf8');
        const testData = JSON.parse(testDataRaw);
        
        return testData;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error cargando test data:', error);
        throw new Error('No se pudo cargar archivo de test data');
    }
}

/**
 * Lista templates activos desde BD
 * @returns {Array} Lista de templates
 */
async function listarTemplates() {
    try {
        const templates = await entregablesService.listarActivos();
        return templates;
        
    } catch (error) {
        console.error('[Admin Templates Service] Error listando templates:', error);
        throw error;
    }
}

module.exports = {
    renderizarPreview,
    actualizarTemplate,
    obtenerTestData,
    listarTemplates
};
```

**5. Actualizar `entregablesService.js`**

Agregar los métodos nuevos (si no están desde T020-002):

```javascript
// En entregablesService.js

/**
 * Actualiza el HTML template de un entregable
 */
async function actualizarTemplate(entregableId, htmlTemplate) {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ActualizarTemplate', [
    entregableId,
    htmlTemplate
  ]);
  return rows[0];
}

/**
 * Lista templates activos
 */
async function listarActivos() {
  const [rows] = await executeStoredProcedure('Entregables_PDF_ListarActivos', []);
  return rows;
}

// Exportar
module.exports = {
  resolverPlantillaEntregable,
  resolverPlantillaPorCodigo,
  obtenerEntregable,
  actualizarTemplate,     // ← NUEVO
  listarActivos           // ← NUEVO
};
```

---

#### **Criterios de Aceptación**

- [ ] **T003-CA-001:** Router `admin/templates.js` creado y registrado en `app.js`
- [ ] **T003-CA-002:** Controller `adminTemplatesController.js` implementado con 4 endpoints
- [ ] **T003-CA-003:** Service `adminTemplatesService.js` implementado con lógica completa
- [ ] **T003-CA-004:** Endpoint `/preview` renderiza HTML correctamente con test data
- [ ] **T003-CA-005:** Endpoint `/:id/update` actualiza BD y retorna success
- [ ] **T003-CA-006:** Endpoint `/test-data` retorna JSON válido
- [ ] **T003-CA-007:** Endpoint `/list` retorna array de templates
- [ ] **T003-CA-008:** Validaciones funcionan (HTML vacío, ID inválido, tamaño excedido)
- [ ] **T003-CA-009:** Manejo de errores con status codes apropiados (400, 404, 500)
- [ ] **T003-CA-010:** Testing manual con Postman/cURL exitoso

---

#### **Testing Manual (Postman/cURL)**

```bash
# Test 1: Preview
curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/preview \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>{{formData.nombreProyecto}}</h1>"}'

# Test 2: Update
curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/1/update \
  -H "Content-Type: application/json" \
  -d '{"html": "<html>Test</html>"}'

# Test 3: Test Data
curl https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/test-data

# Test 4: List
curl https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/list
```

---

### 🎫 T020-004 — HTML Standalone - Template Manager Tool

**Tipo:** Frontend / Tool
**Estado:** ✅ REFINADO — Listo para desarrollo
**Depende de:** T020-003 ✅
**Estimación:** 2-3 horas

---

#### **Descripción**

Crear herramienta HTML standalone que el diseñador abrirá en su navegador para editar, previsualizar y subir templates a QA. No requiere instalación ni dependencias.

---

#### **Alcance del Ticket**

**1. Crear archivo HTML**

**Ubicación:** `App/Backend/Node/tools/template-manager.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CPAU - Template Manager</title>
  
  <style>
    /* ============================================================
       VARIABLES Y RESET
       ============================================================ */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --color-primary: #2c5f2d;
      --color-primary-dark: #1e4620;
      --color-success: #28a745;
      --color-error: #dc3545;
      --color-warning: #ffc107;
      --color-gray-light: #f8f9fa;
      --color-gray-border: #dee2e6;
      --color-text: #212529;
      --spacing-unit: 8px;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: var(--color-gray-light);
      color: var(--color-text);
      padding: calc(var(--spacing-unit) * 3);
      line-height: 1.6;
    }
    
    /* ============================================================
       LAYOUT
       ============================================================ */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: var(--color-primary);
      color: white;
      padding: calc(var(--spacing-unit) * 3);
      border-bottom: 4px solid var(--color-primary-dark);
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: calc(var(--spacing-unit));
    }
    
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(var(--spacing-unit) * 2);
      padding: calc(var(--spacing-unit) * 3);
      min-height: 600px;
    }
    
    .panel {
      display: flex;
      flex-direction: column;
      gap: calc(var(--spacing-unit) * 2);
    }
    
    .panel-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: calc(var(--spacing-unit));
    }
    
    /* ============================================================
       FORMULARIO
       ============================================================ */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: calc(var(--spacing-unit));
    }
    
    label {
      font-weight: 600;
      font-size: 14px;
    }
    
    select, input {
      padding: calc(var(--spacing-unit) * 1.5);
      border: 1px solid var(--color-gray-border);
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
    }
    
    select:focus, input:focus, textarea:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(44, 95, 45, 0.1);
    }
    
    textarea {
      width: 100%;
      min-height: 400px;
      padding: calc(var(--spacing-unit) * 1.5);
      border: 1px solid var(--color-gray-border);
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
      resize: vertical;
    }
    
    /* ============================================================
       BOTONES
       ============================================================ */
    .button-group {
      display: flex;
      gap: calc(var(--spacing-unit) * 2);
    }
    
    button {
      padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: calc(var(--spacing-unit));
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: var(--color-primary);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: var(--color-primary-dark);
    }
    
    .btn-success {
      background: var(--color-success);
      color: white;
    }
    
    /* ============================================================
       PREVIEW
       ============================================================ */
    .preview-container {
      border: 1px solid var(--color-gray-border);
      border-radius: 4px;
      background: white;
      flex: 1;
      min-height: 500px;
      position: relative;
    }
    
    .preview-container iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    
    .preview-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #6c757d;
      font-style: italic;
    }
    
    /* ============================================================
       ALERTAS
       ============================================================ */
    .alert {
      padding: calc(var(--spacing-unit) * 2);
      border-radius: 4px;
      margin-bottom: calc(var(--spacing-unit) * 2);
      display: none;
      align-items: center;
      gap: calc(var(--spacing-unit));
    }
    
    .alert.show {
      display: flex;
    }
    
    .alert-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .alert-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .alert-warning {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }
    
    /* ============================================================
       LOADING SPINNER
       ============================================================ */
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* ============================================================
       RESPONSIVE
       ============================================================ */
    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      
      .preview-container {
        min-height: 400px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎨 CPAU Template Manager</h1>
      <p>Herramienta para gestión de templates PDF - Entorno QA</p>
    </div>
    
    <!-- Alertas -->
    <div style="padding: calc(var(--spacing-unit) * 3) calc(var(--spacing-unit) * 3) 0;">
      <div id="alert" class="alert"></div>
    </div>
    
    <!-- Contenido Principal -->
    <div class="main-content">
      <!-- Panel Izquierdo: Editor -->
      <div class="panel">
        <h2 class="panel-title">📝 Editor de Template</h2>
        
        <div class="form-group">
          <label for="templateSelect">Template a editar:</label>
          <select id="templateSelect">
            <option value="">Cargando templates...</option>
          </select>
        </div>
        
        <div class="form-group" style="flex: 1;">
          <label for="htmlEditor">HTML Template (Handlebars):</label>
          <textarea 
            id="htmlEditor" 
            placeholder="Pega aquí tu HTML con sintaxis Handlebars..."
          ></textarea>
        </div>
        
        <div class="button-group">
          <button id="btnPreview" class="btn-primary">
            <span>👁️</span>
            <span>Preview</span>
          </button>
          <button id="btnUpload" class="btn-success">
            <span>⬆️</span>
            <span>Subir a QA</span>
          </button>
        </div>
      </div>
      
      <!-- Panel Derecho: Preview -->
      <div class="panel">
        <h2 class="panel-title">👀 Preview</h2>
        
        <div class="preview-container">
          <div id="previewEmpty" class="preview-empty">
            Click en "Preview" para ver el resultado con datos de prueba
          </div>
          <iframe id="previewFrame" style="display: none;"></iframe>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // ============================================================
    // CONFIGURACIÓN
    // ============================================================
    const API_BASE_URL = 'https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates';
    
    // ============================================================
    // ELEMENTOS DEL DOM
    // ============================================================
    const $alert = document.getElementById('alert');
    const $templateSelect = document.getElementById('templateSelect');
    const $htmlEditor = document.getElementById('htmlEditor');
    const $btnPreview = document.getElementById('btnPreview');
    const $btnUpload = document.getElementById('btnUpload');
    const $previewEmpty = document.getElementById('previewEmpty');
    const $previewFrame = document.getElementById('previewFrame');
    
    // ============================================================
    // FUNCIONES DE UI
    // ============================================================
    function showAlert(message, type = 'success') {
      $alert.textContent = message;
      $alert.className = `alert alert-${type} show`;
      
      if (type === 'success') {
        setTimeout(() => {
          $alert.classList.remove('show');
        }, 5000);
      }
    }
    
    function hideAlert() {
      $alert.classList.remove('show');
    }
    
    function setLoading(button, isLoading) {
      if (isLoading) {
        button.disabled = true;
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.id = 'spinner-temp';
        button.insertBefore(spinner, button.firstChild);
      } else {
        button.disabled = false;
        const spinner = document.getElementById('spinner-temp');
        if (spinner) spinner.remove();
      }
    }
    
    // ============================================================
    // FUNCIONES DE API
    // ============================================================
    async function cargarTemplates() {
      try {
        const response = await fetch(`${API_BASE_URL}/list`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Error cargando templates');
        }
        
        // Llenar selector
        $templateSelect.innerHTML = '<option value="">Selecciona un template...</option>';
        
        data.data.forEach(template => {
          const option = document.createElement('option');
          option.value = template.entregable_id;
          option.textContent = `${template.nombre} (v${template.version})`;
          option.dataset.codigo = template.codigo;
          $templateSelect.appendChild(option);
        });
        
      } catch (error) {
        console.error('Error cargando templates:', error);
        showAlert(`Error cargando templates: ${error.message}`, 'error');
        $templateSelect.innerHTML = '<option value="">Error al cargar</option>';
      }
    }
    
    async function cargarTemplate(templateId) {
      try {
        showAlert('Cargando template...', 'warning');
        
        const response = await fetch(`${API_BASE_URL}/${templateId}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Template no encontrado');
        }
        
        // Cargar HTML en el editor
        $htmlEditor.value = data.data.html_template;
        hideAlert();
        
      } catch (error) {
        console.error('Error cargando template:', error);
        showAlert(`Error: ${error.message}`, 'error');
      }
    }
    
    async function previewTemplate() {
      const html = $htmlEditor.value.trim();
      
      if (!html) {
        showAlert('El HTML no puede estar vacío', 'warning');
        return;
      }
      
      try {
        setLoading($btnPreview, true);
        hideAlert();
        
        const response = await fetch(`${API_BASE_URL}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Error en preview');
        }
        
        // Obtener HTML renderizado
        const htmlRendered = await response.text();
        
        // Mostrar en iframe
        $previewEmpty.style.display = 'none';
        $previewFrame.style.display = 'block';
        $previewFrame.srcdoc = htmlRendered;
        
        showAlert('✅ Preview generado correctamente', 'success');
        
      } catch (error) {
        console.error('Error en preview:', error);
        showAlert(`Error: ${error.message}`, 'error');
      } finally {
        setLoading($btnPreview, false);
      }
    }
    
    async function subirTemplate() {
      const templateId = $templateSelect.value;
      const html = $htmlEditor.value.trim();
      
      if (!templateId) {
        showAlert('Selecciona un template primero', 'warning');
        return;
      }
      
      if (!html) {
        showAlert('El HTML no puede estar vacío', 'warning');
        return;
      }
      
      // Confirmar acción
      if (!confirm('¿Estás seguro de actualizar este template en QA?')) {
        return;
      }
      
      try {
        setLoading($btnUpload, true);
        hideAlert();
        
        const response = await fetch(`${API_BASE_URL}/${templateId}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html })
        });
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Error actualizando template');
        }
        
        showAlert(
          `✅ Template actualizado en QA (${data.htmlSize} KB) - ${data.timestamp}`,
          'success'
        );
        
      } catch (error) {
        console.error('Error subiendo template:', error);
        showAlert(`Error: ${error.message}`, 'error');
      } finally {
        setLoading($btnUpload, false);
      }
    }
    
    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    $templateSelect.addEventListener('change', (e) => {
      const templateId = e.target.value;
      if (templateId) {
        cargarTemplate(templateId);
      }
    });
    
    $btnPreview.addEventListener('click', previewTemplate);
    $btnUpload.addEventListener('click', subirTemplate);
    
    // Shortcut: Ctrl+Enter para preview
    $htmlEditor.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        previewTemplate();
      }
    });
    
    // ============================================================
    // INICIALIZACIÓN
    // ============================================================
    document.addEventListener('DOMContentLoaded', () => {
      cargarTemplates();
    });
  </script>
</body>
</html>
```

**2. Crear README para el diseñador**

**Ubicación:** `App/Backend/Node/tools/README-TEMPLATE-MANAGER.md`

```markdown
# 🎨 Template Manager - Guía de Uso

## ¿Qué es esto?

Herramienta standalone para editar, previsualizar y subir templates de certificados PDF al entorno QA sin necesidad de intervención del Tech Lead.

## 🚀 Cómo Usar

### Paso 1: Abrir la Herramienta
- Abre el archivo `template-manager.html` en tu navegador (Chrome recomendado)
- No requiere instalación ni servidor local

### Paso 2: Seleccionar Template
- En el selector "Template a editar", elige el certificado que vas a modificar
- El HTML actual se cargará automáticamente en el editor

### Paso 3: Editar HTML
- Modifica el HTML en el textarea
- Usa sintaxis Handlebars para variables dinámicas: `{{formData.nombreProyecto}}`
- Shortcuts:
  - `Ctrl+Enter`: Preview rápido

### Paso 4: Preview
- Click en botón "👁️ Preview"
- El panel derecho mostrará cómo se ve el certificado con datos de prueba
- Itera tantas veces como necesites

### Paso 5: Subir a QA
- Cuando estés conforme con el diseño, click en "⬆️ Subir a QA"
- Confirma la acción
- El template se actualiza inmediatamente en la base de datos
- Ahora puedes probar desde el frontend en QA

## 📝 Variables Disponibles

### formData
- `{{formData.nombreProyecto}}`
- `{{formData.cliente}}`
- `{{formData.superficieTotal}}`
- `{{formData.valorObraARS}}`
- ... (ver test-data-templates.json completo)

### calculationResult
- `{{calculationResult.totalGeneralARS}}`
- `{{calculationResult.plazoEjecucion}}`
- ... (ver test-data-templates.json completo)

### Helpers Handlebars
- `{{formatCurrencyARS valor}}`
- `{{formatPercent valor}}`
- `{{#if condicion}}...{{/if}}`
- `{{#each array}}...{{/each}}`

## ⚠️ Notas Importantes

- Guarda tu HTML localmente antes de subir (Git)
- El preview usa datos de prueba, no datos reales
- Los cambios son inmediatos en QA
- No requiere re-deploy del backend

## 🆘 Problemas Comunes

**"Error en sintaxis Handlebars"**
→ Revisa que todos los `{{` tengan su `}}`

**"Preview en blanco"**
→ Puede haber un error de CSS, revisa la consola del navegador

**"Template no se actualiza"**
→ Confirma que seleccionaste el template correcto en el selector

## 📞 Contacto

Si tienes problemas, contacta a Charly (Tech Lead)
```

---

#### **Criterios de Aceptación**

- [ ] **T004-CA-001:** Archivo `template-manager.html` creado en `tools/`
- [ ] **T004-CA-002:** README creado con instrucciones claras
- [ ] **T004-CA-003:** Selector de templates carga lista desde API
- [ ] **T004-CA-004:** Editor permite editar HTML libremente
- [ ] **T004-CA-005:** Botón "Preview" muestra resultado en iframe
- [ ] **T004-CA-006:** Botón "Subir a QA" actualiza BD correctamente
- [ ] **T004-CA-007:** Alertas de éxito/error funcionan correctamente
- [ ] **T004-CA-008:** Loading states en botones durante operaciones
- [ ] **T004-CA-009:** Diseño responsive (funciona en desktop/tablet)
- [ ] **T004-CA-010:** Testing manual completo sin errores

---

#### **Testing Manual (Diseñador)**

**Escenario 1: Happy Path**
1. Abrir `template-manager.html` en Chrome
2. Selector muestra templates disponibles
3. Seleccionar "Certificado Proyecto y Dirección Básico"
4. HTML se carga en el editor
5. Modificar un texto (ej: cambiar "Resumen del Proyecto" a "Datos del Proyecto")
6. Click "Preview" → Ver cambio reflejado en panel derecho
7. Click "Subir a QA" → Alerta de éxito
8. Abrir frontend QA → Generar PDF → Verificar cambio

**Escenario 2: Errores**
1. Borrar todo el HTML
2. Click "Preview" → Alerta: "El HTML no puede estar vacío"
3. Pegar HTML con sintaxis Handlebars incorrecta (`{{formData.nombre` sin cerrar)
4. Click "Preview" → Alerta: "Error en sintaxis Handlebars"
5. Corregir sintaxis
6. Preview funciona correctamente

---

## 7. CRITERIOS DE ACEPTACIÓN GLOBALES

**Funcionales:**
- [ ] **CA-001:** Diseñador puede previsualizar template con datos reales sin intervención de Charly
- [ ] **CA-002:** Diseñador puede subir template actualizado a QA en menos de 1 minuto
- [ ] **CA-003:** Preview muestra resultado idéntico al PDF final
- [ ] **CA-004:** Sistema valida sintaxis Handlebars antes de actualizar BD
- [ ] **CA-005:** Errores se muestran claramente al usuario (no stacktraces)

**No Funcionales:**
- [ ] **CA-006:** Preview se genera en menos de 3 segundos
- [ ] **CA-007:** Update de template se completa en menos de 2 segundos
- [ ] **CA-008:** Tool funciona sin instalación (HTML standalone)
- [ ] **CA-009:** API endpoints responden correctamente en QA
- [ ] **CA-010:** Toda lógica SQL está encapsulada en SPs

**Documentación:**
- [ ] **CA-011:** README para diseñador está completo y claro
- [ ] **CA-012:** Test data JSON está documentado
- [ ] **CA-013:** SPs tienen comentarios explicativos

---

## 8. CONSIDERACIONES DE SEGURIDAD

### 8.1 Estado Actual (Sin Autenticación)

⚠️ **IMPORTANTE:** Esta implementación inicial **NO tiene autenticación** en los endpoints de admin.

**Razones de la Decisión:**
- Entorno de desarrollo/QA (no producción)
- Equipo pequeño y confiable
- Velocidad de implementación prioritaria
- BD QA no contiene datos sensibles

**Riesgos Asumidos:**
- Cualquiera con la URL puede modificar templates en QA
- No hay auditoría de quién modificó qué

**Mitigación Temporal:**
- Endpoints solo en QA (no en producción)
- URLs no documentadas públicamente
- Backend QA no expuesto a internet público (solo equipo)
- Historial de cambios en Git del template original

### 8.2 Plan de Seguridad Futuro (Post-MVP)

**Cuando se requiera en Producción:**

1. **Middleware de autenticación:**
   ```javascript
   router.post('/:id/update', verificarToken, verificarRol('admin'), adminTemplatesController.update);
   ```

2. **API Key simple:**
   - Header: `X-API-Key: <secret>`
   - Validación en router antes de procesar

3. **Auditoría:**
   - Tabla `Entregables_PDF_Audit` con log de cambios
   - Registrar: user_id, timestamp, template_anterior, template_nuevo

**Ticket futuro:** SPEC021-SECURITY-Template-Manager-Auth

---

## 9. PLAN DE TESTING

### 9.1 Testing de Desarrollo

**Durante Implementación:**

| Test | Objetivo | Herramienta |
|------|----------|-------------|
| Unit Tests SPs | Validar lógica SQL | MySQL Workbench |
| API Manual Tests | Validar endpoints | Postman |
| HTML Tool Manual | Validar UX completa | Chrome DevTools |
| Integration Test | End-to-end completo | Manual |

### 9.2 Testing de Aceptación

**Checklist para Charly:**

**Backend:**
- [ ] SP `Entregables_PDF_ActualizarTemplate` ejecuta correctamente
- [ ] SP `Entregables_PDF_ObtenerPorID` retorna datos correctos
- [ ] SP `Entregables_PDF_ListarActivos` lista templates
- [ ] Endpoint `/preview` renderiza HTML con test data
- [ ] Endpoint `/:id/update` actualiza BD correctamente
- [ ] Endpoint `/test-data` retorna JSON válido
- [ ] Endpoint `/list` retorna array de templates

**Frontend Tool:**
- [ ] HTML abre correctamente en Chrome/Firefox
- [ ] Selector carga templates desde API QA
- [ ] Editor permite editar HTML libremente
- [ ] Preview muestra resultado en iframe
- [ ] Botón "Subir" actualiza BD en QA
- [ ] Alertas funcionan correctamente
- [ ] Loading states visibles durante operaciones

**Flujo Completo (E2E):**
1. [ ] Abrir tool en navegador
2. [ ] Seleccionar template "Proyecto y Dirección"
3. [ ] Modificar texto en HTML
4. [ ] Ver preview actualizado
5. [ ] Subir a QA
6. [ ] Abrir frontend QA
7. [ ] Generar PDF
8. [ ] Validar que el cambio está reflejado

### 9.3 Testing con Diseñador

**Sesión de Onboarding (30 minutos):**

1. **Demo del tool** (Charly muestra)
   - Cómo abrir
   - Cómo seleccionar template
   - Cómo editar
   - Cómo ver preview
   - Cómo subir

2. **Práctica guiada** (Diseñador hace)
   - Cambio simple (color de texto)
   - Preview
   - Upload
   - Validación en QA

3. **Ejercicio independiente**
   - Diseñador hace cambio complejo
   - Sin ayuda de Charly
   - Confirmar autonomía

**Feedback:**
- [ ] ¿Es intuitivo?
- [ ] ¿Qué mejorarías?
- [ ] ¿Te sientes autónomo?

---

## 🎯 RESUMEN EJECUTIVO

### Problema
El proceso actual de actualización de templates PDF requiere intervención manual de Charly en cada iteración, generando un cuello de botella de 30-60 minutos por cambio.

### Solución
Template Manager: herramienta standalone (HTML) que permite al diseñador:
- Previsualizar templates con datos reales
- Subir cambios directamente a QA
- Iterar de forma autónoma en 30 segundos

### Impacto
- ✅ 98% reducción en tiempo de iteración
- ✅ Autonomía total del diseñador
- ✅ Charly liberado para tareas de alto valor
- ✅ Velocidad de desarrollo aumentada 10x

### Inversión
- 8-12 horas de desarrollo
- 4 tickets incrementales
- Sin cambios en frontend principal
- Sin dependencias externas nuevas

### Riesgos
- ⚠️ Endpoints sin autenticación (solo QA)
- ⚠️ Validación de Handlebars básica
- ✅ Mitigado con testing exhaustivo

---

**Estado:** 🟡 PROPUESTA — Pendiente de aprobación de Charly

**Próximos Pasos:**
1. Aprobar SPEC
2. Asignar tickets a desarrolladores
3. Crear rama `feature/SPEC020-template-manager`
4. Implementación incremental (T020-001 → T020-004)
5. Testing completo
6. Onboarding con diseñador
7. Monitoreo en QA
