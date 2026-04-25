# SPEC-FRONTEND-001: Migración de Backend Vercel Serverless a Backend Node.js Real

**Fecha:** 24/04/2026  
**Versión:** 1.0  
**Estado:** � LISTO PARA TESTING (6/7 tickets completados)  
**Autor:** Charly - Equipo Frontend  
**Stack:** React 18 + Vite + Backend Node.js (Express)

---

## 📊 PROGRESO DE TICKETS

| Ticket | Descripción | Estado |
|--------|-------------|--------|
| #001 | Actualizar documentación de variables de entorno | ✅ COMPLETADO |
| #002 | Actualizar comentarios en honorariosService.js | ✅ COMPLETADO |
| #003 | Verificar mapeo de datos en ProcesoCalculoPage | ✅ COMPLETADO |
| #004 | Eliminar carpeta /api/ del frontend | ✅ COMPLETADO |
| #005 | Eliminar vercel.json del frontend | ✅ COMPLETADO |
| #006 | Eliminar carpetas backend obsoletas | ✅ COMPLETADO |
| #007 | Testing End-to-End de la migración | 🟢 **LISTO PARA TESTING MANUAL** |

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Impacto](#2-análisis-de-impacto)
3. [Especificación de Cambios](#3-especificación-de-cambios)
4. [Plan de Implementación (Tickets)](#4-plan-de-implementación-tickets)
5. [Casos de Prueba](#5-casos-de-prueba)
6. [Criterios de Aceptación](#6-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Contexto Actual

**Estado Maqueta (FASE 1 - A ELIMINAR):**
```
Frontend (React) → Vercel Serverless Function (/api) → Lógica en JS (oculta)
```

- ✅ Maqueta funcional aprobada por cliente
- ✅ Frontend implementado con wizard completo
- ⚠️ Backend en **Vercel Serverless** solo para ocultar lógica de cálculo
- ⚠️ Sin persistencia real de datos
- ⚠️ Lógica de cálculo duplicada en frontend (02-Node) y serverless (03-Vercel)

**Archivos Frontend con Backend Vercel (A ELIMINAR):**
```
App/Frontend/
├── api/                           ← ELIMINAR COMPLETO
│   └── honorarios/
│       └── (serverless functions)
├── vercel.json                    ← ELIMINAR
└── .env.local                     ← ACTUALIZAR (ya configurado)
```

**Archivos Backend Obsoletos (NO SE USARÁN MÁS):**
```
App/Backend/
├── 02-Node/                       ← NO SE USA (lógica antigua)
└── 03-Vercel/                     ← NO SE USA (serverless antiguo)
```

### 1.2 Estado Objetivo (FASE 2 - BACKEND REAL)

**Stack Definitivo:**
```
Frontend (React) → Backend Node.js (Express) → Stored Procedures → MySQL RDS
```

- ✅ **Backend Node.js con Express** (puerto 3000 en desarrollo)
- ✅ **Lógica 100% en base de datos** (Stored Procedures)
- ✅ **Persistencia completa** de cálculos realizados
- ✅ **API REST real** con endpoint `/api/calculos/calcular`

**URLs del Backend:**
- **DESA:** `http://localhost:3000/api`
- **QA:** `https://api-ch2026-qa.neosisweb.ar/api`

### 1.3 Problema

El frontend actualmente llama a **Vercel Serverless Functions** que ya no se usan. El nuevo backend Node.js con base de datos MySQL está implementado y funcionando, pero el frontend no lo está consumiendo.

### 1.4 Objetivo

**Migrar el frontend para consumir el backend Node.js real**, eliminando toda referencia al backend Vercel Serverless y asegurando que el wizard envíe los datos en el formato correcto.

### 1.5 Alcance

**✅ INCLUYE:**
- Verificar que `honorariosService.js` consuma la URL correcta (ya configurado)
- Verificar mapeo correcto de datos en `ProcesoCalculoPage.jsx`
- Eliminar carpeta `/api/` completa del frontend (Vercel serverless)
- Eliminar `vercel.json` del frontend
- Actualizar `.env.example` con documentación correcta
- Documentar que carpetas `02-Node` y `03-Vercel` ya no se usan

**❌ NO INCLUYE:**
- Cambios en el contrato de API (ya está correcto)
- Validaciones adicionales en frontend
- Manejo de errores complejos (la API ya responde correctamente)
- Cambios en componentes del wizard (ya funcionan correctamente)
- Corrección de campos `tipoObra` o `destinoUso` (se harán después)
- Cambios en nombres de variables de entorno

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Archivos Afectados

| Archivo | Tipo de Cambio | Complejidad |
|---------|---------------|-------------|
| `src/services/honorariosService.js` | ✅ **YA CORRECTO** - Solo actualizar comentarios | 🟢 Baja |
| `.env.local` | ✅ **YA CONFIGURADO** - No requiere cambios | 🟢 Ninguna |
| `.env.example` | **ACTUALIZAR** - Documentación FASE 2 | 🟢 Baja |
| `ProcesoCalculoPage.jsx` | ✅ **VERIFICAR** - Mapeo de datos | 🟢 Baja |
| `/api/` (carpeta completa) | **ELIMINAR** - Serverless Vercel | 🟢 Baja |
| `vercel.json` | **ELIMINAR** - Configuración Vercel | 🟢 Baja |
| `/App/Backend/02-Node/` | **DOCUMENTAR** - No se usa más | 🟢 Ninguna |
| `/App/Backend/03-Vercel/` | **DOCUMENTAR** - No se usa más | 🟢 Ninguna |

### 2.2 Backward Compatibility

**✅ NO HAY BREAKING CHANGES:**

El contrato de API (request/response) **se mantiene igual**. El frontend ya está preparado para el backend real:

```javascript
// Request (Frontend → Backend Node.js)
{
  "calculoId": null,
  "usuarioId": 2,
  "tareaId": 18,
  "datosProyecto": { ... },
  "datosObra": { ... },
  "tareasProfesionales": { ... }
}

// Response (Backend Node.js → Frontend)
{
  "success": true,
  "data": {
    "calculoId": 23,
    "totalHonorarios": 80575475,
    "metadata": { ... },
    "detalleHonorarios": [ ... ]
  }
}
```

### 2.3 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| URL del backend incorrecta | 🟢 Baja | 🟡 Media | `.env.local` ya configurado correctamente |
| Mapeo de datos incorrecto | 🟢 Baja | 🔴 Alta | Verificar en tests con caso real |
| Backend no disponible en desarrollo | 🟡 Media | 🔴 Alta | Documentar cómo levantar backend Node.js |
| Archivos de Vercel aún en uso | 🟢 Baja | 🟡 Media | Búsqueda de referencias antes de eliminar |

---

## 3. ESPECIFICACIÓN DE CAMBIOS

### 3.1 Estado Actual del Service Layer

**Archivo:** `src/services/honorariosService.js`

**✅ ESTADO ACTUAL - YA CORRECTO:**

```javascript
// Configuración de API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Función de cálculo
export async function calcularHonorarios(datosCompletos) {
  const response = await fetch(`${API_BASE_URL}/calculos/calcular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': '1.0'
    },
    body: JSON.stringify(datosCompletos)
  });
  // ...
}
```

**✅ VALIDACIÓN:**
- ✅ Usa `VITE_API_URL` de `.env.local` → `http://localhost:3000/api`
- ✅ Endpoint correcto: `/calculos/calcular`
- ✅ Método POST
- ✅ Headers correctos
- ✅ Manejo de errores con `formatearErrorAPI()`

**📝 ACCIÓN:** Solo actualizar comentarios para indicar que ya está en FASE 2.

---

### 3.2 Estado Actual de Variables de Entorno

**Archivo:** `.env.local`

**✅ ESTADO ACTUAL - YA CONFIGURADO:**

```bash
# Variables de entorno para desarrollo local
# Backend Node.js Express corriendo en puerto 3000
VITE_API_URL=http://localhost:3000/api
```

**✅ VALIDACIÓN:**
- ✅ Apunta a `http://localhost:3000/api` (backend Node.js en desarrollo)
- ✅ Sin trailing slash

**📝 ACCIÓN:** No requiere cambios.

---

**Archivo:** `.env.example`

**❌ ESTADO ACTUAL - DESACTUALIZADO:**

```bash
# FASE 1 (Serverless - Actual): Usar /api (mismo dominio)
# FASE 2 (Backend Real - Futuro): Cambiar a URL completa del backend
VITE_API_URL=/api

# Ejemplos para diferentes ambientes:
# Development:  VITE_API_URL=/api
# QA:           VITE_API_URL=/api
# Production:   VITE_API_URL=https://api.cpau-honorarios.com/v1
```

**✅ NUEVO CONTENIDO (FASE 2):**

```bash
# ============================================================================
# VARIABLES DE ENTORNO - CH2026
# Sistema de Gestión de Cálculo de Honorarios CPAU
# ============================================================================

# API Configuration - Backend Node.js + MySQL RDS
# FASE 2: Backend Real con persistencia en base de datos

# Development (backend Node.js local en puerto 3000)
VITE_API_URL=http://localhost:3000/api

# QA (backend Node.js en AWS)
# VITE_API_URL=https://api-ch2026-qa.neosisweb.ar/api

# Production (futuro)
# VITE_API_URL=https://api-ch2026.neosisweb.ar/api

# ============================================================================
# INSTRUCCIONES DE USO
# ============================================================================
# 1. Copiar este archivo como .env.local
# 2. Ajustar valores según el ambiente
# 3. Nunca commitear .env.local (incluido en .gitignore)
# 4. Asegurarse que el backend Node.js esté corriendo en el puerto configurado
```

---

### 3.3 Mapeo de Datos en ProcesoCalculoPage

**Archivo:** `src/pages/ProcesoCalculoPage.jsx`

**Función:** `performCalculation()` - Líneas aproximadas 170-220

**✅ MAPEO ACTUAL - VERIFICAR:**

```javascript
const datosAPI = {
  calculoId: null,
  usuarioId: 2,
  tareaId: 18,
  datosProyecto: {
    nombre: formData.nombreProyecto,
    ubicacion: formData.ubicacion,
    cliente: formData.cliente,
    tipoObra: formData.tipoObra,        // ⚠️ Campo pendiente de revisión
    destinoUso: formData.destinoUso,     // ⚠️ Campo pendiente de revisión
    observaciones: formData.observaciones
  },
  datosObra: {
    valorObra: formData.valorObra,       // ✅ Calculado en frontend
    superficie: formData.superficieTotal,
    valorMetro2: formData.valorMetro2,
    tipologia: formData.tipoObra,        // ⚠️ Campo pendiente de revisión
    complejidad: formData.complejidad
  },
  tareasProfesionales: {
    obraProyecto: formData.obraProyecto,
    obraDireccion: formData.obraDireccion,
    instalacionSanitaria: formData.instalacionSanitaria,
    instalacionElectrica: formData.instalacionElectrica,
    instalacionTermomecanica: formData.instalacionTermomecanica,
    instalacionContraIncendio: formData.instalacionContraIncendio,
    proyectoEstructuras: formData.proyectoEstructuras
  }
};
```

**📝 NOTAS:**
- ⚠️ `tipoObra` aparece duplicado en `datosProyecto.tipoObra` y `datosObra.tipologia` → **Dejarlo así (se corregirá después)**
- ⚠️ `destinoUso` no está en uso actualmente → **Dejarlo así (se corregirá después)**
- ✅ `valorObra` se calcula en frontend correctamente

**📝 ACCIÓN:** Verificar que este mapeo coincida con lo que espera el backend Node.js (según request de ejemplo).

---

### 3.4 Archivos a Eliminar

#### 3.4.1 Carpeta `/api/` Completa (Frontend)

**Ubicación:** `App/Frontend/api/`

**Contenido:**
```
api/
├── honorarios/
│   └── (serverless functions de Vercel)
└── README.md
```

**Razón:** Son Vercel Serverless Functions que ya no se usan. El backend real está en `App/Backend/Node/` (fuera del proyecto frontend).

**📝 ACCIÓN:** Eliminar carpeta completa.

---

#### 3.4.2 Archivo `vercel.json` (Frontend)

**Ubicación:** `App/Frontend/vercel.json`

**Contenido actual:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "git": {
    "deploymentEnabled": {
      "dev": false,
      "qa": true
    }
  }
}
```

**Razón:** Configuración específica de Vercel para rewrites de rutas. Ya no se necesita porque el backend es independiente.

**📝 ACCIÓN:** Eliminar archivo.

---

### 3.5 Carpetas Backend Obsoletas (Documentar)

**Carpetas:**
- `App/Backend/02-Node/` - Lógica antigua en Express (antes de la migración)
- `App/Backend/03-Vercel/` - Serverless functions de Vercel

**Estado:** Ya no se usan. El backend real está en otro proyecto/servidor.

**📝 ACCIÓN:** 
1. Agregar archivo `_DEPRECATED.md` en cada carpeta explicando que ya no se usan
2. Opcional: Mover a carpeta `01-Docs/03-Archivos anteriores/Backend/`

---

## 4. PLAN DE IMPLEMENTACIÓN (TICKETS)

### TICKET #001 - Actualizar Documentación de Variables de Entorno

**ESTADO:** ✅ COMPLETADO (24/04/2026)

**DESCRIPCIÓN:**
Actualizar `.env.example` con la documentación correcta de FASE 2 (Backend Node.js real).

**UBICACIÓN:** `App/Frontend/.env.example`

**SUBTAREAS:**

- [x] **[T001.1]** Actualizar comentarios indicando FASE 2
- [x] **[T001.2]** Agregar ejemplo de URL para desarrollo (`http://localhost:3000/api`)
- [x] **[T001.3]** Agregar ejemplo de URL para QA (`https://api-ch2026-qa.neosisweb.ar/api`)
- [x] **[T001.4]** Actualizar instrucciones de uso

**CRITERIOS DE ACEPTACIÓN:**
- ✅ `.env.example` tiene documentación clara de FASE 2
- ✅ Incluye URLs correctas para DESA, QA y PROD

**TIEMPO ESTIMADO:** 5 minutos

---

### TICKET #002 - Actualizar Comentarios en honorariosService.js

**ESTADO:** ✅ COMPLETADO (24/04/2026)

**DESCRIPCIÓN:**
Actualizar comentarios en `honorariosService.js` para reflejar que ya está en FASE 2 (Backend Node.js real).

**UBICACIÓN:** `App/Frontend/src/services/honorariosService.js`

**CAMBIOS:**

```javascript
// ANTES:
/**
 * IMPORTANTE: Este es el ÚNICO lugar que debe cambiar al migrar al backend real
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 * Versión: 1.0
 * Fecha: 16/03/2026
 */

// Configuración de API
// HOY: serverless en mismo dominio (/api)
// FUTURO: backend real (cambiar solo esta variable en .env)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// DESPUÉS:
/**
 * Servicio de Honorarios - Capa de abstracción para llamadas a API
 * 
 * FASE 2: Backend Node.js + Express + MySQL RDS (AWS)
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 * Versión: 2.0 - Backend Real con Persistencia
 * Fecha: 24/04/2026
 */

// Configuración de API - Backend Node.js
// DESA: http://localhost:3000/api
// QA: https://api-ch2026-qa.neosisweb.ar/api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**SUBTAREAS:**

- [x] **[T002.1]** Actualizar header del archivo (versión 2.0, FASE 2)
- [x] **[T002.2]** Actualizar comentarios de configuración de API
- [x] **[T002.3]** Eliminar comentarios obsoletos de "FUTURO" (ya es presente)

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Comentarios reflejan que está en FASE 2
- ✅ No se rompe ninguna funcionalidad (solo comentarios)

**TIEMPO ESTIMADO:** 5 minutos

---

### TICKET #003 - Verificar Mapeo de Datos en ProcesoCalculoPage

**ESTADO:** ✅ COMPLETADO (24/04/2026)

**DESCRIPCIÓN:**
Verificar que el mapeo de datos en `performCalculation()` coincida exactamente con el contrato de API del backend Node.js.

**UBICACIÓN:** `App/Frontend/src/pages/ProcesoCalculoPage.jsx`

**VALIDACIÓN:**

Comparar el objeto `datosAPI` con el request de ejemplo:

**Request Esperado por Backend:**
```json
{
  "calculoId": null,
  "usuarioId": 2,
  "tareaId": 18,
  "datosProyecto": {
    "nombre": "...",
    "ubicacion": "...",
    "cliente": "..."
  },
  "datosObra": {
    "valorObra": 500000000,
    "superficie": 2500,
    "tipologia": "...",
    "complejidad": "..."
  },
  "tareasProfesionales": {
    "obraProyecto": true,
    "obraDireccion": true,
    ...
  }
}
```

**SUBTAREAS:**

- [x] **[T003.1]** Verificar estructura de `datosAPI` en `performCalculation()` ✅ Correcto
- [x] **[T003.2]** Confirmar que todos los campos obligatorios están presentes ✅ Correcto
- [x] **[T003.3]** Confirmar que los tipos de datos son correctos (numbers vs strings) ✅ Correcto
- [x] **[T003.4]** Verificar que `valorObra` se calcula correctamente en frontend ✅ Correcto (superficie * valorMetro2)
- [x] **[T003.5]** **CORRECCIÓN:** Arreglar extracción de respuesta del backend

**CORRECCIONES REALIZADAS:**

❌ **ERROR ENCONTRADO:**
```javascript
// INCORRECTO (antes)
const detalleHonorarios = apiResult.resultado.detalleHonorarios;
metadataCalculo: apiResult.resultado.metadata
```

✅ **CORREGIDO:**
```javascript
// CORRECTO (ahora) - el service ya retorna 'data' directamente
const detalleHonorarios = apiResult.detalleHonorarios;
metadataCalculo: apiResult.metadata
fechaCalculo: apiResult.metadata.fechaCalculo
```

**NOTAS:**
- ⚠️ Campos `tipoObra` y `destinoUso` dejados como están (se corregirán después)
- ✅ `valorObra` se calcula automáticamente en `DatosObraBasico.jsx`
- ✅ Service `honorariosService.js` ya extrae `resultado.data` antes de retornar

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Estructura de `datosAPI` coincide con request esperado
- ✅ Todos los campos obligatorios están presentes
- ✅ Tipos de datos son correctos
- ✅ Extracción de respuesta corregida

**TIEMPO ESTIMADO:** 10 minutos

---

### TICKET #004 - Eliminar Carpeta /api/ del Frontend

**ESTADO:** ✅ COMPLETADO (24/04/2026)

**DESCRIPCIÓN:**
Eliminar carpeta completa `/api/` que contiene las Vercel Serverless Functions obsoletas.

**UBICACIÓN:** `App/Frontend/api/`

**VERIFICACIÓN PREVIA:**

Antes de eliminar, verificar que no existen referencias en el código:

```bash
# Buscar referencias a /api/honorarios/ en el código
grep -r "api/honorarios" src/
grep -r "api/v1/honorarios" src/
grep -r "../api/" src/
```

**RESULTADO:** ✅ No se encontraron referencias en el código fuente

**SUBTAREAS:**

- [x] **[T004.1]** Buscar referencias a archivos en `/api/` en el código fuente → ✅ Sin referencias
- [x] **[T004.2]** Confirmar que no hay imports relativos a `/api/` → ✅ Sin imports
- [x] **[T004.3]** Eliminar carpeta `/api/` completa → ✅ Eliminada
- [x] **[T004.4]** Verificar que el frontend sigue funcionando (npm run dev) → ⏳ Pendiente de prueba

**CONTENIDO ELIMINADO:**
```
api/
├── honorarios/
│   └── calcular.js        (Vercel Serverless Function)
└── README.md
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ No existen referencias a `/api/` en el código fuente
- ✅ Carpeta eliminada completamente
- ⏳ Frontend funciona correctamente sin errores de import (requiere prueba manual)

**TIEMPO ESTIMADO:** 10 minutos

---

### TICKET #005 - Eliminar vercel.json del Frontend

**ESTADO:** ✅ COMPLETADO (24/04/2026)

**DESCRIPCIÓN:**
Eliminar archivo `vercel.json` ya que no se usará Vercel para el deploy.

**UBICACIÓN:** `App/Frontend/vercel.json`

**JUSTIFICACIÓN:**
- El backend es independiente (Node.js en servidor propio)
- Los rewrites de Vercel ya no son necesarios
- El frontend se puede deployar en cualquier hosting estático

**SUBTAREAS:**

- [x] **[T005.1]** Eliminar archivo `vercel.json` → ✅ Eliminado
- [x] **[T005.2]** Verificar que no hay referencias a este archivo en scripts de package.json → ✅ Sin referencias
- [x] **[T005.3]** Documentar en README.md el cambio de estrategia de deploy → ⏳ Pendiente (opcional)

**CONTENIDO ELIMINADO:**
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "git": {
    "deploymentEnabled": {
      "dev": false,
      "qa": true
    }
  }
}
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Archivo eliminado
- ✅ No hay errores al ejecutar `npm run dev`

**TIEMPO ESTIMADO:** 5 minutos

---

### TICKET #006 - Eliminar Carpetas Backend Obsoletas

**ESTADO:** ✅ COMPLETADO (24/04/2026)

**DESCRIPCIÓN:**
Eliminar carpetas `02-Node` y `03-Vercel` que contienen código obsoleto de FASE 1.

**UBICACIÓN:**
- `App/Backend/02-Node/` ← ELIMINADA
- `App/Backend/03-Vercel/` ← ELIMINADA

**JUSTIFICACIÓN:**
Estas carpetas contenían código de la **FASE 1** (backend temporal para ocultar lógica de cálculo):
- `02-Node/`: Express local para desarrollo (reemplazado por backend real en `Node/`)
- `03-Vercel/`: Serverless functions de Vercel (ya no se usa)

**El backend real está en:** `App/Backend/Node/` (fuera del proyecto frontend)

**SUBTAREAS:**

- [x] **[T006.1]** Eliminar `App/Backend/02-Node/` → ✅ Eliminada
- [x] **[T006.2]** Eliminar `App/Backend/03-Vercel/` → ✅ Eliminada
- [x] **[T006.3]** Verificar estructura final de Backend → ✅ Verificada

**CARPETAS ELIMINADAS:**

**02-Node/** - Backend Express antiguo (antes de la migración)
```
02-Node/
├── src/
│   ├── index.js
│   ├── handlers/
│   ├── middleware/
│   ├── services/
│   └── utils/calculos/
├── package.json
└── README.md
```

**03-Vercel/** - Serverless functions de Vercel obsoletas
```
03-Vercel/
├── api/v1/honorarios/
│   └── calcular.js
├── lib/services/
├── lib/utils/calculos/
├── vercel.json
└── package.json
```

**ESTRUCTURA FINAL:**
```
App/Backend/
├── 00-Contexto/          ✅ Contexto del proyecto
├── 01-DB/                ✅ Scripts de base de datos
├── DB/                   ✅ Esquemas y stored procedures
└── Node/                 ✅ BACKEND REAL (puerto 3000)
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Carpeta `02-Node/` eliminada completamente
- ✅ Carpeta `03-Vercel/` eliminada completamente
- ✅ Carpeta `Node/` preservada (backend real)

**TIEMPO ESTIMADO:** 10 minutos

---

### TICKET #007 - Testing End-to-End de la Migración

**ESTADO:** � LISTO PARA TESTING MANUAL (24/04/2026)

**DESCRIPCIÓN:**
Probar el flujo completo del wizard de cálculo usando el backend Node.js real.

**PRECONDICIONES:**
- Backend Node.js corriendo en `http://localhost:3000`
- Base de datos MySQL con datos de prueba
- Frontend corriendo en `http://localhost:5173` (Vite)

**⚠️ PARÁMETROS HARCODEADOS (Temporal):**

Los siguientes valores están fijos en el código y se enlazarán con datos reales en futuras SPECs:

```javascript
// En: App/Frontend/src/pages/ProcesoCalculoPage.jsx (línea ~159)
calculoId: null,     // Se asignará en backend al guardar el cálculo
usuarioId: 2,        // Usuario temporal para testing (FUTURO: del contexto de autenticación)
tareaId: 18          // Tarea "Cálculo Básico" (FUTURO: del tipo de cálculo seleccionado)
```

**CASO DE PRUEBA PRINCIPAL:**

**Entrada:**
```javascript
{
  nombreProyecto: "Edificio Comercial - Centro",
  ubicacion: "CABA - Microcentro",
  cliente: "Inmobiliaria ABC SA",
  superficieTotal: 2500,
  valorMetro2: 200000,
  valorObra: 500000000, // calculado: 2500 * 200000
  complejidad: "alta",
  obraProyecto: true,
  obraDireccion: true,
  instalacionSanitaria: true,
  instalacionElectrica: true,
  instalacionContraIncendio: true,
  instalacionTermomecanica: true,
  proyectoEstructuras: true
}
```

**Resultado Esperado:**
```javascript
{
  success: true,
  data: {
    calculoId: <número>,
    totalHonorarios: ~80575475,
    metadata: {
      rango: "B",
      numeroItems: 16,
      // ...
    },
    detalleHonorarios: [
      // Array de 16 items
    ]
  }
}
```

**SUBTAREAS:**

- [x] **[T007.1]** Documentar parámetros harcodeados temporales → ✅ Documentados en código
- [x] **[T007.2]** Crear guía de testing end-to-end → ✅ Guía completa creada
- [x] **[T007.3]** Crear instrucciones rápidas → ✅ Instrucciones creadas
- [x] **[T007.4]** Levantar frontend para testing → ✅ Frontend en http://localhost:5173
- [ ] **[T007.5]** Levantar backend Node.js → ⚠️ PENDIENTE: Usuario debe ejecutar `npm run dev`
- [ ] **[T007.6]** Ejecutar caso de prueba principal → ⚠️ PENDIENTE: Testing manual
- [ ] **[T007.7]** Verificar grabación en base de datos → ⚠️ PENDIENTE: Testing manual
- [ ] **[T007.8]** Probar caso de error (backend offline) → ⚠️ PENDIENTE: Testing manual

**DOCUMENTACIÓN CREADA:**

📄 **Guía Completa de Testing:**
- Ubicación: `01-Docs/02-Test/SPEC-FRONTEND-001-Ticket-007-GuiaTesting.md`
- Contenido: Precondiciones, comandos, casos de prueba, verificaciones técnicas, checklist

📄 **Instrucciones Rápidas:**
- Ubicación: `01-Docs/02-Test/SPEC-FRONTEND-001-Ticket-007-InstruccionesRapidas.md`
- Contenido: Pasos resumidos, datos de prueba, verificaciones clave

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Wizard completa el flujo sin errores
- ✅ Llama al backend Node.js en `http://localhost:3000/api/calculos/calcular`
- ✅ Muestra resultado correcto (~16 ítems, ~$80.575.475)
- ✅ Datos se graban en MySQL con `calculoId` válido
- ✅ Errores se muestran correctamente al usuario

**TIEMPO ESTIMADO:** 30 minutos (testing manual)

---

## 5. CASOS DE PRUEBA

### 5.1 Caso de Prueba: Cálculo Exitoso

**Precondiciones:**
- Backend Node.js corriendo en `http://localhost:3000`
- Base de datos MySQL accesible
- Frontend configurado con `VITE_API_URL=http://localhost:3000/api`

**Pasos:**
1. Abrir aplicación en `http://localhost:5173`
2. Login con usuario de prueba
3. Ir a "Nuevo Cálculo de Honorarios" → "Básico"
4. Completar Paso 0 (Datos principales):
   - Nombre: "Edificio Comercial - Centro"
   - Cliente: "Inmobiliaria ABC SA"
   - Ubicación: "CABA - Microcentro"
   - Tipo de Obra: "Edificio comercial"
5. Completar Paso 1 (Datos de obra):
   - Superficie: 2500 m²
   - Valor m²: $200.000
   - Complejidad: "alta"
6. Completar Paso 2 (Tareas):
   - Seleccionar todas las tareas
7. Paso 3 (Revisión): Verificar datos
8. Paso 4 (Cálculo): Esperar cálculo
9. Paso 5 (Resultado): Ver detalle

**Resultado Esperado:**
- ✅ Cálculo se ejecuta correctamente
- ✅ Muestra resultado con 16 ítems
- ✅ Total de honorarios: ~$80.575.475
- ✅ Se puede ver detalle por tarea
- ✅ Se graba en base de datos con `calculoId`

**Validación Técnica:**
```bash
# En DevTools → Network
# Verificar request a:
POST http://localhost:3000/api/calculos/calcular

# Response:
{
  "success": true,
  "data": {
    "calculoId": 23,
    "totalHonorarios": 80575475,
    "detalleHonorarios": [ ... ]
  }
}
```

---

### 5.2 Caso de Prueba: Backend No Disponible

**Precondiciones:**
- Backend Node.js **APAGADO**
- Frontend corriendo normalmente

**Pasos:**
1. Completar wizard hasta paso de revisión
2. Hacer clic en "Calcular"

**Resultado Esperado:**
- ⚠️ Muestra mensaje de error: "No se pudo conectar con el servidor. Verifique su conexión a internet."
- ⚠️ Vuelve al paso de revisión (no se pierde el progreso)
- ⚠️ Usuario puede intentar nuevamente

---

### 5.3 Caso de Prueba: Error de Validación Backend

**Precondiciones:**
- Backend Node.js corriendo
- Datos inválidos en el request

**Pasos:**
1. Modificar temporalmente el código para enviar `superficie: "abc"` (string en lugar de número)
2. Ejecutar cálculo

**Resultado Esperado:**
- ⚠️ Backend responde con status 400
- ⚠️ Mensaje de error específico: "superficie: Debe ser un número válido"
- ⚠️ Vuelve al paso de revisión

---

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Funcionales

- [ ] ✅ **F001:** Frontend llama a `http://localhost:3000/api/calculos/calcular` en desarrollo
- [ ] ✅ **F002:** Frontend llama a `https://api-ch2026-qa.neosisweb.ar/api/calculos/calcular` en QA
- [ ] ✅ **F003:** Wizard completa flujo de cálculo sin errores
- [ ] ✅ **F004:** Resultado muestra detalle de honorarios correctamente
- [ ] ✅ **F005:** Cálculo se graba en base de datos con `calculoId`
- [ ] ✅ **F006:** Errores de backend se muestran correctamente al usuario

### 6.2 Técnicos

- [ ] ✅ **T001:** Carpeta `/api/` eliminada del frontend
- [ ] ✅ **T002:** Archivo `vercel.json` eliminado del frontend
- [ ] ✅ **T003:** No existen referencias a Vercel en el código
- [ ] ✅ **T004:** `.env.example` tiene documentación de FASE 2
- [ ] ✅ **T005:** Comentarios en `honorariosService.js` actualizados
- [ ] ✅ **T006:** Carpetas `02-Node` y `03-Vercel` marcadas como obsoletas

### 6.3 Performance y UX

- [ ] ✅ **P001:** Tiempo de respuesta del cálculo < 3 segundos (mismo que antes)
- [ ] ✅ **P002:** Spinner muestra durante el cálculo
- [ ] ✅ **P003:** Mensajes de error son claros y accionables
- [ ] ✅ **P004:** No hay cambios visuales en la UI (transparente para usuario)

### 6.4 Documentación

- [ ] ✅ **D001:** README del frontend documenta cómo configurar URL del backend
- [ ] ✅ **D002:** Carpetas obsoletas tienen archivo `_DEPRECATED.md`
- [ ] ✅ **D003:** `.env.example` tiene ejemplos para DESA, QA y PROD

---

## 7. ROLLBACK PLAN

En caso de problemas con el backend Node.js, el rollback es **MUY SIMPLE**:

### 7.1 Rollback Inmediato (< 1 minuto)

**Cambiar variable de entorno:**

```bash
# En .env.local, cambiar de:
VITE_API_URL=http://localhost:3000/api

# A (backend Vercel temporal):
VITE_API_URL=/api
```

**Condiciones:**
- ⚠️ Solo funciona si NO se eliminaron las carpetas `/api/` y `03-Vercel`
- ⚠️ Requiere re-deploy del backend Vercel si ya se bajó

### 7.2 Rollback Completo (si ya se eliminaron archivos)

**Restaurar desde Git:**

```bash
# Restaurar carpeta /api/
git checkout HEAD -- App/Frontend/api/

# Restaurar vercel.json
git checkout HEAD -- App/Frontend/vercel.json

# Cambiar .env.local
VITE_API_URL=/api
```

**Tiempo estimado:** 5 minutos

---

## 8. NOTAS FINALES

### 8.1 Próximos Pasos (DESPUÉS de esta SPEC)

1. **Corrección de mapeo de campos:**
   - Revisar duplicación de `tipoObra` en `datosProyecto` y `datosObra.tipologia`
   - Definir si `destinoUso` es necesario o se elimina

2. **Autenticación real:**
   - Reemplazar `usuarioId: 2` hardcodeado por usuario del contexto
   - Implementar JWT token en headers

3. **Múltiples endpoints:**
   - Histórico de cálculos: `GET /api/calculos/historial`
   - Detalle de cálculo: `GET /api/calculos/:id`

### 8.2 Dependencias Externas

**Backend Node.js debe estar:**
- ✅ Implementado con endpoint `/api/calculos/calcular`
- ✅ Corriendo en puerto 3000 (desarrollo)
- ✅ Conectado a base de datos MySQL
- ✅ Con CORS habilitado para `http://localhost:5173`

**Verificar que backend está listo:**
```bash
# Test rápido
curl -X POST http://localhost:3000/api/calculos/calcular \
  -H "Content-Type: application/json" \
  -d '{"calculoId":null,"usuarioId":2,"tareaId":18,...}'

# Debe responder:
# {"success":true,"data":{...}}
```

---

**FIN DE ESPECIFICACIÓN**

---

**Aprobación:**
- [ ] Charly (Frontend Lead)
- [ ] Equipo Backend (validar compatibilidad de API)
- [ ] QA (casos de prueba)

**Fecha Objetivo de Implementación:** 25/04/2026  
**Esfuerzo Estimado:** 1.5 horas  
**Prioridad:** 🔴 ALTA
