# SPEC-CALC-002: Sistema de Arrastre Progresivo de Coeficientes entre Rangos

**Fecha:** 20/04/2026  
**Versión:** 1.0  
**Estado:** 🟡 EN REVISIÓN - PENDIENTE APROBACIÓN CPAU  
**Autor:** CPAU - Área Técnica  
**Desarrollador:** Backend Team  
**Dependencias:** SPEC-CALC-001 (Coeficientes Diferenciados)

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Impacto](#2-análisis-de-impacto)
3. [Especificación Matemática](#3-especificación-matemática)
4. [Especificación de Algoritmo](#4-especificación-de-algoritmo)
5. [Contratos de API](#5-contratos-de-api)
6. [Casos de Prueba](#6-casos-de-prueba)
7. [Plan de Implementación](#7-plan-de-implementación)
8. [Criterios de Aceptación](#8-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Contexto

El sistema actual de cálculo de honorarios utiliza un **modelo plano de aplicación de coeficientes**:

```
Valor Obra: $1.692.000.000
Valor K: 574.813.607
Coef K = 1.692.000.000 / 574.813.607 = 2.94 → RANGO B

Cálculo:
- Coeficiente Obra: 0.08 (todo el valor)
- Coeficiente K: 0.03 (todo el valor K)
- Importe = (0.08 × 1.692.000.000) + (0.03 × 574.813.607)
- Importe = 135.360.000 + 17.244.408 = 152.604.408
```

**Problema:** Este sistema no refleja la progresividad de los costos profesionales según aumenta la escala de la obra.

### 1.2 Problema

El CPAU establece que los honorarios deben calcularse de forma **progresiva escalonada**, similar al sistema impositivo por tramos:

- Cada porción del valor de obra debe tributar al coeficiente de su rango correspondiente
- Obras que atraviesan múltiples rangos deben "arrastrar" los cálculos de rangos inferiores

### 1.3 Objetivo

**Implementar un sistema de cálculo progresivo escalonado** donde cada tramo del valor de obra aplique los coeficientes de su rango correspondiente.

### 1.4 Alcance

**✅ INCLUYE:**
- Nuevo algoritmo de cálculo progresivo por tramos
- Cálculo de límites de rangos en base a Valor K
- Generación de múltiples ítems por tarea (uno por rango afectado)
- Actualización de contrato de API (cambio en estructura de respuesta)
- Tests unitarios completos con 4 modelos de obra
- Documentación de fórmulas matemáticas

**❌ NO INCLUYE:**
- Cambios en coeficientes (se usan los de SPEC-CALC-001)
- Cambios en la UI (el frontend debe adaptarse al nuevo output)
- Modo de compatibilidad con sistema anterior
- Cambios en lógica de porcentajes de tarea

### 1.5 Cambio Crítico - Breaking Change

**⚠️ BREAKING CHANGE:**
- El output de `detalleHonorarios` cambiará radicalmente
- Una tarea puede generar múltiples ítems (uno por rango)
- Frontend deberá agrupar/sumarizar por tarea profesional

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Archivos Afectados

**Desarrollo (Fuente de Verdad - 02-Node):**

| Archivo | Tipo de Cambio | Complejidad |
|---------|---------------|-------------|
| `tablasCoeficientes.js` | **NUEVA FUNCIÓN** calcularLimitesRangos() | 🟢 Baja |
| `honorariosProgresivo.js` | **ARCHIVO NUEVO** con algoritmo progresivo | 🔴 Alta |
| `honorariosProgresivo.test.js` | **TESTS NUEVOS** 5 casos de prueba | 🟡 Media |
| `honorariosBasico.js` | **DEPRECAR** (mantener para rollback) | 🟢 Baja |
| **Contrato API** | **BREAKING CHANGE** en response | 🔴 Alta |

**Deploy (03-Vercel):**
- Los archivos se sincronizan de 02-Node a 03-Vercel antes del deploy
| **Frontend** | Adaptar visualización de resultados | 🟡 Media |

### 2.2 Backward Compatibility

**❌ NO HAY COMPATIBILIDAD HACIA ATRÁS:**

```javascript
// ❌ SISTEMA VIEJO (se elimina completamente)
// 1 tarea = 1 ítem (máximo 2 si hay coef K)
detalleHonorarios: [
  { item: 1, tarea: "Proyecto", descripcion: "Rango B", importe: 152604408 }
]

// ✅ SISTEMA NUEVO (reemplazo total)
// 1 tarea = N ítems (uno por cada rango atravesado)
detalleHonorarios: [
  { item: 1, tarea: "Proyecto", descripcion: "Rango A - Coef Obra 14%", importe: 24142171 },
  { item: 2, tarea: "Proyecto", descripcion: "Rango B - Coef Obra 8%", importe: 67420473 },
  { item: 3, tarea: "Proyecto", descripcion: "Rango B - Coef K 3%", importe: 10346645 }
]
```

**Estrategia de migración:**
1. Deploy de backend nuevo en ambiente QA
2. Validación de cálculos vs resultados CPAU
3. Actualización de frontend para manejar múltiples ítems
4. Deploy sincronizado frontend + backend a producción

### 2.3 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Error en cálculo de límites de rangos | 🟡 Media | 🔴 Alta | Tests con valores conocidos |
| Desincronización frontend/backend | 🟢 Baja | 🔴 Alta | Deploy atómico con feature flag |
| Pérdida de performance (más ítems) | 🟢 Baja | 🟡 Media | Cálculo sigue siendo O(n) lineal |
| Confusión en agrupación de ítems | 🟡 Media | 🟡 Media | Documentación clara para frontend |

---

## 3. ESPECIFICACIÓN MATEMÁTICA

### 3.1 Definición de Rangos y Límites

**Parámetros:**
- `valorObra`: Valor total de la obra en ARS
- `valorK`: Índice CPAU (actualizado periódicamente)
- `coefK = valorObra / valorK`: Coeficiente determinante del rango

**Rangos definidos por coeficiente K:**

| Rango | Condición Coef K | Límite Inferior (ARS) | Límite Superior (ARS) |
|-------|------------------|----------------------|----------------------|
| **A** | `coefK < 0.5` | `0` | `0.5 × valorK` |
| **B** | `0.5 ≤ coefK < 5` | `0.5 × valorK` | `5 × valorK` |
| **C** | `5 ≤ coefK < 25` | `5 × valorK` | `25 × valorK` |
| **D** | `coefK ≥ 25` | `25 × valorK` | `∞` |

**Ejemplo con valorK = 574.813.607:**

```javascript
LIMITES_RANGOS = {
  rangoA: { inferior: 0, superior: 287406804 },           // 0.5K
  rangoB: { inferior: 287406804, superior: 2874068035 },  // 5K
  rangoC: { inferior: 2874068035, superior: 14370340175 },// 25K
  rangoD: { inferior: 14370340175, superior: Infinity }
};
```

### 3.2 Fórmula de Cálculo Progresivo

Para cada **tarea profesional** y cada **rango** atravesado:

```
PARA cada rango R desde A hasta D:
  
  // Determinar límite superior efectivo
  SI valorObra > limiteSuperiorRango ENTONCES:
    limSuperiorAUtilizar = limiteSuperiorRango
  SINO:
    limSuperiorAUtilizar = valorObra
  FIN SI
  
  // Calcular solo si la obra alcanza este rango
  SI limSuperiorAUtilizar > limiteInferiorRango ENTONCES:
    
    montoAfectado = limSuperiorAUtilizar - limiteInferiorRango
    
    // Aplicar coeficiente de obra (si existe)
    SI coeficienteObra[R] > 0 ENTONCES:
      importeObra = coeficienteObra[R] × montoAfectado × porcentajeTarea
      AGREGAR_ITEM(tarea, "Rango R - Coef Obra X%", importeObra)
    FIN SI
    
    // Aplicar coeficiente K (si existe y solo en el rango final)
    SI coeficienteK[R] > 0 Y esRangoFinal ENTONCES:
      importeK = coeficienteK[R] × valorK × porcentajeTarea
      AGREGAR_ITEM(tarea, "Rango R - Coef K Y%", importeK)
    FIN SI
    
  FIN SI

FIN PARA
```

### 3.3 Ejemplo Completo (Modelo X)

**Datos:**
- Valor Obra: `$1.692.000.000`
- Valor K: `$574.813.607`
- Coef K: `1.692.000.000 / 574.813.607 = 2.94` → **Atraviesa Rangos A y B**
- Tarea: Proyecto de Arquitectura
- Porcentaje: `60%`
- Coeficientes (COEFICIENTES_PROYECTO_DIRECCION):
  - Rango A: `{ obra: 0.14, k: 0 }`
  - Rango B: `{ obra: 0.08, k: 0.03 }`

**Cálculo Tramo por Tramo:**

#### Tramo Rango A (0 → 287.406.804)

```
limInferior = 0
limSuperior = 287.406.804
valorObra = 1.692.000.000 > limSuperior → usar limSuperior

montoAfectado = 287.406.804 - 0 = 287.406.804

// Coef Obra
importeObra = 0.14 × 287.406.804 × 0.6 = 24.142.171,54

// Coef K (no existe en Rango A)
importeK = 0

Item 1: "Proyecto de Arquitectura - Rango A (coef 14%)" → $24.142.171
```

#### Tramo Rango B (287.406.804 → 2.874.068.035)

```
limInferior = 287.406.804
limSuperior = 2.874.068.035
valorObra = 1.692.000.000 < limSuperior → usar valorObra

montoAfectado = 1.692.000.000 - 287.406.804 = 1.404.593.196

// Coef Obra
importeObra = 0.08 × 1.404.593.196 × 0.6 = 67.420.473,41

// Coef K (se aplica porque es el rango final)
importeK = 0.03 × 574.813.607 × 0.6 = 10.346.644,93

Item 2: "Proyecto de Arquitectura - Rango B (coef 8%)" → $67.420.473
Item 3: "Proyecto de Arquitectura - Rango B (coef K 3%)" → $10.346.645
```

**Total Proyecto = $24.142.171 + $67.420.473 + $10.346.645 = $101.909.289**

---

## 4. ESPECIFICACIÓN DE ALGORITMO

### 4.1 Pseudocódigo Detallado

```javascript
FUNCIÓN calcularHonorariosProgresivo(formData, valorK):
  
  // 1. VALIDACIONES
  SI valorObra <= 0 O valorK <= 0 ENTONCES:
    RETORNAR []
  FIN SI
  
  // 2. CALCULAR LÍMITES DE RANGOS EN PESOS
  limites = calcularLimitesRangos(valorK)
  
  // 3. DETERMINAR RANGO FINAL (para saber dónde aplicar coef K)
  coefK = valorObra / valorK
  rangoFinal = determinarRango(coefK)
  
  // 4. INICIALIZAR ARRAY DE ITEMS
  items = []
  
  // 5. PROCESAR CADA TAREA PROFESIONAL SELECCIONADA
  
  SI formData.obraProyecto ENTONCES:
    procesarTareaProgresiva(
      items,
      "Proyecto de obra de arquitectura",
      COEFICIENTES_PROYECTO_DIRECCION,
      limites,
      valorObra,
      valorK,
      PORCENTAJES_TAREA.proyectoObra,
      rangoFinal
    )
  FIN SI
  
  SI formData.obraDireccion ENTONCES:
    procesarTareaProgresiva(
      items,
      "Dirección de obra de arquitectura",
      COEFICIENTES_PROYECTO_DIRECCION,
      limites,
      valorObra,
      valorK,
      PORCENTAJES_TAREA.direccionObra,
      rangoFinal
    )
  FIN SI
  
  SI formData.instalacionSanitaria ENTONCES:
    procesarTareaProgresiva(
      items,
      "Proyecto de instalación sanitaria",
      COEFICIENTES_SANITARIA_ELECTRICA,
      limites,
      valorObra,
      valorK,
      PORCENTAJES_TAREA.instalaciones,
      rangoFinal
    )
  FIN SI
  
  // ... (resto de tareas)
  
  RETORNAR items

FIN FUNCIÓN


FUNCIÓN procesarTareaProgresiva(
  items,
  nombreTarea,
  coeficientes,
  limites,
  valorObra,
  valorK,
  porcentajeTarea,
  rangoFinal
):
  
  PARA CADA rango EN ['rangoA', 'rangoB', 'rangoC', 'rangoD']:
    
    limInferior = limites[rango].inferior
    limSuperior = limites[rango].superior
    
    // Determinar límite superior efectivo
    SI valorObra > limSuperior ENTONCES:
      limSupEfectivo = limSuperior
    SINO:
      limSupEfectivo = valorObra
    FIN SI
    
    // Solo procesar si la obra alcanza este rango
    SI limSupEfectivo > limInferior ENTONCES:
      
      montoAfectado = limSupEfectivo - limInferior
      coef = coeficientes[rango]
      nombreRango = NOMBRES_RANGO[rango]
      
      // Agregar ítem de coeficiente obra
      SI coef.obra > 0 ENTONCES:
        items.push({
          item: items.length + 1,
          tareaProfesional: nombreTarea,
          descripcion: `Rango ${nombreRango} (coef ${formatPorcentaje(coef.obra)})`,
          importe: coef.obra × montoAfectado × porcentajeTarea
        })
      FIN SI
      
      // Agregar ítem de coeficiente K (solo en rango final)
      SI coef.k > 0 Y rango === rangoFinal ENTONCES:
        items.push({
          item: items.length + 1,
          tareaProfesional: nombreTarea,
          descripcion: `Rango ${nombreRango} (coef K ${formatPorcentaje(coef.k)})`,
          importe: coef.k × valorK × porcentajeTarea
        })
      FIN SI
      
    FIN SI
    
    // Si no llegamos al límite superior, no seguir a rangos superiores
    SI valorObra <= limSuperior ENTONCES:
      ROMPER_BUCLE
    FIN SI
    
  FIN PARA

FIN FUNCIÓN


FUNCIÓN calcularLimitesRangos(valorK):
  RETORNAR {
    rangoA: { inferior: 0, superior: 0.5 × valorK },
    rangoB: { inferior: 0.5 × valorK, superior: 5 × valorK },
    rangoC: { inferior: 5 × valorK, superior: 25 × valorK },
    rangoD: { inferior: 25 × valorK, superior: Infinity }
  }
FIN FUNCIÓN
```

### 4.2 Diagrama de Flujo

```
┌─────────────────────────────────────┐
│ INPUT: valorObra, valorK, tareas    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Validar: valorObra > 0, valorK > 0  │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Calcular Límites de Rangos (0.5K,  │
│ 5K, 25K)                            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ Calcular coefK = valorObra / valorK │
│ Determinar rangoFinal               │
└─────────────┬───────────────────────┘
              │
              ▼
      ┌───────┴────────┐
      │ Para cada tarea │
      │ seleccionada    │
      └───────┬─────────┘
              │
              ▼
      ┌──────────────────────────┐
      │ Para cada rango (A→D):   │◄──────┐
      └───────┬──────────────────┘       │
              │                          │
              ▼                          │
      ┌──────────────────────────┐       │
      │ ¿valorObra alcanza        │      │
      │  este rango?              │      │
      └───────┬──────────────────┘       │
              │ Sí                       │
              ▼                          │
      ┌──────────────────────────┐       │
      │ montoAfectado =           │      │
      │ min(valorObra,limSup) -   │      │
      │ limInf                    │      │
      └───────┬──────────────────┘       │
              │                          │
              ▼                          │
      ┌──────────────────────────┐       │
      │ Calcular importe con      │      │
      │ coef.obra × monto         │      │
      └───────┬──────────────────┘       │
              │                          │
              ▼                          │
      ┌──────────────────────────┐       │
      │ ¿Es rango final?          │      │
      │ ¿Tiene coef.k > 0?        │      │
      └───────┬──────────────────┘       │
              │ Sí                       │
              ▼                          │
      ┌──────────────────────────┐       │
      │ Calcular importe K        │      │
      │ coef.k × valorK           │      │
      └───────┬──────────────────┘       │
              │                          │
              ▼                          │
      ┌──────────────────────────┐       │
      │ Agregar ítems a array     │      │
      └───────┬──────────────────┘       │
              │                          │
              ▼                          │
      ┌──────────────────────────┐       │
      │ ¿Hay más rangos?          │      │
      │ ¿valorObra > limSup?      │──Sí──┘
      └───────┬──────────────────┘
              │ No
              ▼
┌─────────────────────────────────────┐
│ OUTPUT: Array de ítems (múltiples   │
│ por tarea si atraviesa rangos)      │
└─────────────────────────────────────┘
```

---

## 5. CONTRATOS DE API

### 5.1 Contrato de Entrada (NO CAMBIA)

```typescript
// ✅ PERMANECE EXACTAMENTE IGUAL A SPEC-CALC-001
interface RequestCalculoHonorarios {
  tipoCalculo: 'basico';
  datosObra: {
    valorObra: number;
    superficie?: number;
    tipologia?: string;
    complejidad?: string;
  };
  tareasProfesionales: {
    obraProyecto?: boolean;
    obraDireccion?: boolean;
    instalacionSanitaria?: boolean;
    instalacionElectrica?: boolean;
    instalacionContraIncendio?: boolean;
    instalacionTermomecanica?: boolean;
    proyectoEstructuras?: boolean;
  };
}
```

### 5.2 Contrato de Salida ⚠️ BREAKING CHANGE

```typescript
// ⚠️ CAMBIO CRÍTICO: Estructura de detalleHonorarios
interface ResponseCalculoHonorarios {
  calculoId: string;
  tipoCalculo: 'basico';
  fechaCalculo: string;
  resultado: {
    detalleHonorarios: Array<{
      item: number;
      tareaProfesional: string;
      descripcion: string;  // ← Ahora incluye rango y tipo de coef
      importe: number;
    }>;
    totalHonorarios: number;
    metadata: {
      valorK: number;
      coeficienteK: number;  // ← NUEVO: valorObra / valorK
      rangoFinal: string;    // ← NUEVO: A, B, C o D
      rangosAfectados: string[];  // ← NUEVO: ['A', 'B']
      numeroItems: number;
      limitesRangos: {       // ← NUEVO: Para trazabilidad
        rangoA: { inferior: number; superior: number };
        rangoB: { inferior: number; superior: number };
        rangoC: { inferior: number; superior: number };
        rangoD: { inferior: number; superior: number };
      };
    };
  };
}
```

### 5.3 Comparativa Request/Response

**Escenario:** Obra $1.692.000.000, solo Proyecto de Arquitectura

#### Sistema Anterior (SPEC-CALC-001)

**Response:**
```json
{
  "resultado": {
    "detalleHonorarios": [
      {
        "item": 1,
        "tareaProfesional": "Proyecto de obra de arquitectura",
        "descripcion": "Rango de Costos de Obra B (coef 8%)",
        "importe": 81216000
      },
      {
        "item": 2,
        "tareaProfesional": "Proyecto de obra de arquitectura",
        "descripcion": "Rango de Costos de Obra B (coef K 3%)",
        "importe": 9398654
      }
    ],
    "totalHonorarios": 90614654,
    "metadata": {
      "rango": "B",
      "valorK": 574813607,
      "numeroItems": 2
    }
  }
}
```

#### Sistema Nuevo (SPEC-CALC-002)

**Response:**
```json
{
  "resultado": {
    "detalleHonorarios": [
      {
        "item": 1,
        "tareaProfesional": "Proyecto de obra de arquitectura",
        "descripcion": "Rango A (coef 14%)",
        "importe": 24142171
      },
      {
        "item": 2,
        "tareaProfesional": "Proyecto de obra de arquitectura",
        "descripcion": "Rango B (coef 8%)",
        "importe": 67420473
      },
      {
        "item": 3,
        "tareaProfesional": "Proyecto de obra de arquitectura",
        "descripcion": "Rango B (coef K 3%)",
        "importe": 10346645
      }
    ],
    "totalHonorarios": 101909289,
    "metadata": {
      "valorK": 574813607,
      "coeficienteK": 2.94,
      "rangoFinal": "B",
      "rangosAfectados": ["A", "B"],
      "numeroItems": 3,
      "limitesRangos": {
        "rangoA": { "inferior": 0, "superior": 287406804 },
        "rangoB": { "inferior": 287406804, "superior": 2874068035 },
        "rangoC": { "inferior": 2874068035, "superior": 14370340175 },
        "rangoD": { "inferior": 14370340175, "superior": 999999999999 }
      }
    }
  }
}
```

**Diferencia:** `$101.909.289 - $90.614.654 = +$11.294.635 (+12.46%)`

---

## 6. CASOS DE PRUEBA

### 6.1 Configuración de Tests

**Datos comunes:**
- Valor K: `574.813.607`
- Costo Unitario: `$1.500/m² USD` → `$2.115.000/m² ARS` (TC = 1410)
- Tarea: Proyecto de Arquitectura (60%)
- Coeficientes: COEFICIENTES_PROYECTO_DIRECCION

**Límites de rangos (en ARS):**
```javascript
const LIMITES = {
  rangoA: { inferior: 0, superior: 287406804 },
  rangoB: { inferior: 287406804, superior: 2874068035 },
  rangoC: { inferior: 2874068035, superior: 14370340175 },
  rangoD: { inferior: 14370340175, superior: Infinity }
};
```

### 6.2 Caso de Prueba #1: Modelo 1 (Solo Rango A)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 253800000,  // 120 m² × $2.115.000/m²
    superficie: 120
  },
  tareasProfesionales: {
    obraProyecto: true
  },
  parametros: {
    valorK: 574813607
  }
}
```

**Análisis:**
```
coefK = 253.800.000 / 574.813.607 = 0.44 → RANGO A
Rangos afectados: Solo A
```

**Cálculos:**

| Rango | Lím Inferior | Lím Superior | Monto Afectado | Coef Obra | Importe Obra | Coef K | Importe K |
|-------|-------------|-------------|---------------|-----------|--------------|--------|-----------|
| **A** | 0 | 287.406.804 | 253.800.000 | 0.14 | 21.319.200 | 0 | 0 |

**Output Esperado:**
```json
{
  "detalleHonorarios": [
    {
      "item": 1,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango A (coef 14%)",
      "importe": 21319200
    }
  ],
  "totalHonorarios": 21319200,
  "metadata": {
    "valorK": 574813607,
    "coeficienteK": 0.44,
    "rangoFinal": "A",
    "rangosAfectados": ["A"],
    "numeroItems": 1
  }
}
```

---

### 6.3 Caso de Prueba #2: Modelo X (Rangos A + B)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 1692000000,  // 800 m² × $2.115.000/m²
    superficie: 800
  },
  tareasProfesionales: {
    obraProyecto: true
  },
  parametros: {
    valorK: 574813607
  }
}
```

**Análisis:**
```
coefK = 1.692.000.000 / 574.813.607 = 2.94 → RANGO B
Rangos afectados: A, B
```

**Cálculos:**

| Rango | Lím Inferior | Lím Superior | Monto Afectado | Coef Obra | Importe Obra | Coef K | Importe K |
|-------|-------------|-------------|---------------|-----------|--------------|--------|-----------|
| **A** | 0 | 287.406.804 | 287.406.804 | 0.14 | 24.142.171 | 0 | 0 |
| **B** | 287.406.804 | 2.874.068.035 | 1.404.593.196 | 0.08 | 67.420.473 | 0.03 | 10.346.645 |

**Output Esperado:**
```json
{
  "detalleHonorarios": [
    {
      "item": 1,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango A (coef 14%)",
      "importe": 24142171
    },
    {
      "item": 2,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango B (coef 8%)",
      "importe": 67420473
    },
    {
      "item": 3,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango B (coef K 3%)",
      "importe": 10346645
    }
  ],
  "totalHonorarios": 101909289,
  "metadata": {
    "valorK": 574813607,
    "coeficienteK": 2.94,
    "rangoFinal": "B",
    "rangosAfectados": ["A", "B"],
    "numeroItems": 3
  }
}
```

---

### 6.4 Caso de Prueba #3: Modelo 2 (Rangos A + B + C)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 4230000000,  // 2.000 m² × $2.115.000/m²
    superficie: 2000
  },
  tareasProfesionales: {
    obraProyecto: true
  },
  parametros: {
    valorK: 574813607
  }
}
```

**Análisis:**
```
coefK = 4.230.000.000 / 574.813.607 = 7.36 → RANGO C
Rangos afectados: A, B, C
```

**Cálculos:**

| Rango | Lím Inferior | Lím Superior | Monto Afectado | Coef Obra | Importe Obra | Coef K | Importe K |
|-------|-------------|-------------|---------------|-----------|--------------|--------|-----------|
| **A** | 0 | 287.406.804 | 287.406.804 | 0.14 | 24.142.171 | 0 | 0 |
| **B** | 287.406.804 | 2.874.068.035 | 2.586.661.231 | 0.08 | 124.159.739 | 0 | 0 |
| **C** | 2.874.068.035 | 14.370.340.175 | 1.355.931.965 | 0.06 | 48.813.551 | 0.13 | 44.744.561 |

**Output Esperado:**
```json
{
  "detalleHonorarios": [
    {
      "item": 1,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango A (coef 14%)",
      "importe": 24142171
    },
    {
      "item": 2,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango B (coef 8%)",
      "importe": 124159739
    },
    {
      "item": 3,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango C (coef 6%)",
      "importe": 48813551
    },
    {
      "item": 4,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango C (coef K 13%)",
      "importe": 44744561
    }
  ],
  "totalHonorarios": 241860022,
  "metadata": {
    "valorK": 574813607,
    "coeficienteK": 7.36,
    "rangoFinal": "C",
    "rangosAfectados": ["A", "B", "C"],
    "numeroItems": 4
  }
}
```

---

### 6.5 Caso de Prueba #4: Modelo 3 (Rangos A + B + C + D)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 21150000000,  // 10.000 m² × $2.115.000/m²
    superficie: 10000
  },
  tareasProfesionales: {
    obraProyecto: true
  },
  parametros: {
    valorK: 574813607
  }
}
```

**Análisis:**
```
coefK = 21.150.000.000 / 574.813.607 = 36.79 → RANGO D
Rangos afectados: A, B, C, D
```

**Cálculos:**

| Rango | Lím Inferior | Lím Superior | Monto Afectado | Coef Obra | Importe Obra | Coef K | Importe K |
|-------|-------------|-------------|---------------|-----------|--------------|--------|-----------|
| **A** | 0 | 287.406.804 | 287.406.804 | 0.14 | 24.142.171 | 0 | 0 |
| **B** | 287.406.804 | 2.874.068.035 | 2.586.661.231 | 0.08 | 124.159.739 | 0 | 0 |
| **C** | 2.874.068.035 | 14.370.340.175 | 11.496.272.140 | 0.06 | 413.865.837 | 0 | 0 |
| **D** | 14.370.340.175 | ∞ | 6.779.659.825 | 0.04 | 162.711.836 | 0.63 | 217.496.316 |

**Output Esperado:**
```json
{
  "detalleHonorarios": [
    {
      "item": 1,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango A (coef 14%)",
      "importe": 24142171
    },
    {
      "item": 2,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango B (coef 8%)",
      "importe": 124159739
    },
    {
      "item": 3,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango C (coef 6%)",
      "importe": 413865837
    },
    {
      "item": 4,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango D (coef 4%)",
      "importe": 162711836
    },
    {
      "item": 5,
      "tareaProfesional": "Proyecto de obra de arquitectura",
      "descripcion": "Rango D (coef K 63%)",
      "importe": 217496316
    }
  ],
  "totalHonorarios": 942375899,
  "metadata": {
    "valorK": 574813607,
    "coeficienteK": 36.79,
    "rangoFinal": "D",
    "rangosAfectados": ["A", "B", "C", "D"],
    "numeroItems": 5
  }
}
```

---

### 6.6 Caso de Prueba #5: Múltiples Tareas (Validación Completa)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 1692000000,
    superficie: 800
  },
  tareasProfesionales: {
    obraProyecto: true,
    obraDireccion: true,
    instalacionSanitaria: true
  },
  parametros: {
    valorK: 574813607
  }
}
```

**Output Esperado (resumen):**
```json
{
  "detalleHonorarios": [
    // Proyecto (60%) - 3 ítems
    { "item": 1, "tarea": "Proyecto...", "descripcion": "Rango A (14%)", "importe": 24142171 },
    { "item": 2, "tarea": "Proyecto...", "descripcion": "Rango B (8%)", "importe": 67420473 },
    { "item": 3, "tarea": "Proyecto...", "descripcion": "Rango B (K 3%)", "importe": 10346645 },
    
    // Dirección (40%) - 3 ítems
    { "item": 4, "tarea": "Dirección...", "descripcion": "Rango A (14%)", "importe": 16094781 },
    { "item": 5, "tarea": "Dirección...", "descripcion": "Rango B (8%)", "importe": 44946982 },
    { "item": 6, "tarea": "Dirección...", "descripcion": "Rango B (K 3%)", "importe": 6897763 },
    
    // Instalación Sanitaria (100%) - 2 ítems (coef diferentes)
    { "item": 7, "tarea": "Instalación...", "descripcion": "Rango A (0.4%)", "importe": 1149627 },
    { "item": 8, "tarea": "Instalación...", "descripcion": "Rango B (0.14%)", "importe": 1966430 }
  ],
  "totalHonorarios": 172964872,
  "metadata": {
    "numeroItems": 8,
    "rangosAfectados": ["A", "B"]
  }
}
```

---

## 7. PLAN DE IMPLEMENTACIÓN

### 7.1 Orden de Implementación (TDD Estricto)

```
FASE 1: PREPARACIÓN (Día 1)
├─ PASO 1.1: Crear rama feature/SPEC-CALC-002
├─ PASO 1.2: Actualizar tablasCoeficientes.js
│  └─ Agregar función calcularLimitesRangos(valorK)
├─ PASO 1.3: Documentar en JSDoc todas las funciones nuevas
└─ PASO 1.4: Commit: "feat(calc): agregar cálculo de límites de rangos"

FASE 2: TESTS (Día 2-3)
├─ PASO 2.1: Crear honorariosProgresivo.test.js
├─ PASO 2.2: Test Caso #1 (Modelo 1 - Solo Rango A)
│  └─ ❌ RED: Test falla (función no existe)
├─ PASO 2.3: Test Caso #2 (Modelo X - Rangos A+B)
│  └─ ❌ RED: Test falla
├─ PASO 2.4: Test Caso #3 (Modelo 2 - Rangos A+B+C)
│  └─ ❌ RED: Test falla
├─ PASO 2.5: Test Caso #4 (Modelo 3 - Rangos A+B+C+D)
│  └─ ❌ RED: Test falla
├─ PASO 2.6: Test Caso #5 (Múltiples tareas)
│  └─ ❌ RED: Test falla
└─ PASO 2.7: Commit: "test(calc): agregar tests SPEC-CALC-002 (RED)"

FASE 3: IMPLEMENTACIÓN (Día 4-5)
├─ PASO 3.1: Crear honorariosProgresivo.js
│  ├─ Implementar calcularLimitesRangos()
│  ├─ Implementar determinarRango()
│  ├─ Implementar procesarTareaProgresiva()
│  └─ Implementar calcularHonorariosProgresivo()
├─ PASO 3.2: Ejecutar tests
│  └─ Iterar hasta que todos pasen ✅ GREEN
├─ PASO 3.3: Refactorizar código
│  ├─ Extraer funciones auxiliares
│  ├─ Optimizar cálculos
│  └─ Mejorar legibilidad
└─ PASO 3.4: Commit: "feat(calc): implementar sistema progresivo SPEC-CALC-002 (GREEN)"

FASE 4: INTEGRACIÓN API (Día 6)
├─ PASO 4.1: Actualizar /api/v1/honorarios/calcular.js
│  ├─ Reemplazar import de honorariosBasico
│  ├─ Cambiar a honorariosProgresivo
│  └─ Actualizar metadata de response
├─ PASO 4.2: Actualizar contrato TypeScript (si existe)
├─ PASO 4.3: Tests de integración API
│  └─ Validar request/response completo
└─ PASO 4.4: Commit: "feat(api): integrar SPEC-CALC-002 en endpoint"

FASE 5: VALIDACIÓN (Día 7)
├─ PASO 5.1: Comparar resultados con cálculos CPAU manuales
├─ PASO 5.2: Validar redondeos y decimales
├─ PASO 5.3: Pruebas de performance (tiempo de respuesta)
├─ PASO 5.4: Validar logs y trazabilidad
└─ PASO 5.5: Documentación final

FASE 6: DEPRECACIÓN (Día 8)
├─ PASO 6.1: Marcar honorariosBasico.js como @deprecated
├─ PASO 6.2: Agregar warning en logs si se usa sistema viejo
└─ PASO 6.3: Commit: "chore(calc): deprecar sistema plano"

FASE 7: DEPLOY (Día 9-10)
├─ PASO 7.1: Merge a develop
├─ PASO 7.2: Deploy a QA
├─ PASO 7.3: Validación en QA con frontend
├─ PASO 7.4: Deploy a producción (ventana de mantenimiento)
└─ PASO 7.5: Monitoreo post-deploy 48 horas
```

### 7.2 Archivos a Crear/Modificar

#### Archivo 1: `tablasCoeficientes.js` (AGREGAR)

```javascript
/**
 * Calcula los límites en pesos de cada rango según el valor K vigente
 * @param {number} valorK - Índice CPAU actualizado
 * @returns {Object} Objeto con límites inferior/superior por rango
 */
export function calcularLimitesRangos(valorK) {
  return {
    rangoA: {
      inferior: 0,
      superior: 0.5 * valorK
    },
    rangoB: {
      inferior: 0.5 * valorK,
      superior: 5 * valorK
    },
    rangoC: {
      inferior: 5 * valorK,
      superior: 25 * valorK
    },
    rangoD: {
      inferior: 25 * valorK,
      superior: Number.MAX_SAFE_INTEGER  // Infinity práctica
    }
  };
}
```

#### Archivo 2: `honorariosProgresivo.js` (CREAR NUEVO)

```javascript
/**
 * Algoritmo de cálculo de honorarios CPAU - Sistema Progresivo
 * SPEC-CALC-002: Arrastre de coeficientes entre rangos
 * 
 * ⚠️ CONFIDENCIAL: Este archivo contiene lógica propietaria del CPAU
 * Solo debe ejecutarse en servidor, NUNCA en navegador del cliente
 * 
 * @module honorariosProgresivo
 */

import {
  COEFICIENTES_PROYECTO_DIRECCION,
  COEFICIENTES_SANITARIA_ELECTRICA,
  COEFICIENTES_INCENDIO,
  COEFICIENTES_TERMOMECANICA,
  COEFICIENTES_ESTRUCTURAS,
  PORCENTAJES_TAREA,
  NOMBRES_RANGO,
  VALOR_K_DEFAULT,
  calcularLimitesRangos
} from './tablasCoeficientes.js';

// ... (implementación según pseudocódigo sección 4.1)
```

#### Archivo 3: `honorariosProgresivo.test.js` (CREAR NUEVO)

```javascript
import { describe, it, expect } from 'vitest';
import { calcularHonorariosProgresivo } from './honorariosProgresivo.js';

describe('SPEC-CALC-002: Sistema Progresivo de Honorarios', () => {
  
  const VALOR_K = 574813607;
  
  describe('Caso #1: Modelo 1 (Solo Rango A)', () => {
    it('debe calcular correctamente obra de $253.800.000', () => {
      const formData = {
        valorObra: 253800000,
        obraProyecto: true
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      expect(resultado).toHaveLength(1);
      expect(resultado[0].importe).toBe(21319200);
      expect(resultado[0].descripcion).toContain('Rango A');
    });
  });
  
  // ... (resto de tests según sección 6)
});
```

#### Archivo 4: `src/handlers/honorarios.handler.js` (MODIFICAR - en 02-Node)

**Nota:** La lógica se desarrolla en 02-Node y luego se sincroniza a 03-Vercel para deploy serverless.

```javascript
// ❌ DEPRECADO
// import { calcularHonorariosBasico } from '../utils/calculos/honorariosBasico.js';

// ✅ NUEVO - Desarrollo en 02-Node/src/
import { calcularHonorariosProgresivo } from '../utils/calculos/honorariosProgresivo.js';

export default async function handler(req, res) {
  // ... validaciones ...
  
  // ✅ Usar sistema progresivo
  const detalleHonorarios = calcularHonorariosProgresivo(
    req.body.datosObra,
    valorK
  );
  
  // ... (resto de lógica)
}
```

### 7.3 Estimación de Esfuerzo

| Fase | Tareas | Tiempo Estimado | Riesgo |
|------|--------|-----------------|--------|
| **FASE 1: Preparación** | Setup + límites rangos | 4 horas | 🟢 Bajo |
| **FASE 2: Tests** | 5 casos de prueba | 8 horas | 🟡 Medio |
| **FASE 3: Implementación** | Algoritmo progresivo | 12 horas | 🔴 Alto |
| **FASE 4: Integración API** | Endpoint + contrato | 4 horas | 🟡 Medio |
| **FASE 5: Validación** | Comparación CPAU | 6 horas | 🟡 Medio |
| **FASE 6: Deprecación** | Marcar código viejo | 2 horas | 🟢 Bajo |
| **FASE 7: Deploy** | QA + Producción | 6 horas | 🔴 Alto |
| **Buffer** | Contingencia | 8 horas | - |
| **TOTAL** | - | **50 horas (~7 días)** | 🟡 Medio |

---

## 8. CRITERIOS DE ACEPTACIÓN

### 8.1 Funcionales

- [ ] **CA-001:** Modelo 1 ($253.8M) calcula 1 ítem en Rango A: $21.319.200
- [ ] **CA-002:** Modelo X ($1.692M) calcula 3 ítems (A+B): $101.909.289
- [ ] **CA-003:** Modelo 2 ($4.230M) calcula 4 ítems (A+B+C): $241.860.022
- [ ] **CA-004:** Modelo 3 ($21.150M) calcula 5 ítems (A+B+C+D): $942.375.899
- [ ] **CA-005:** Límites de rangos se calculan correctamente según Valor K
- [ ] **CA-006:** Coeficiente K se aplica solo en el rango final
- [ ] **CA-007:** Múltiples tareas generan ítems independientes por tarea
- [ ] **CA-008:** Todas las tareas (Proyecto, Dirección, Instalaciones, Estructuras) usan sistema progresivo
- [ ] **CA-009:** Porcentajes de tarea (60%, 40%, 100%) se aplican correctamente
- [ ] **CA-010:** Response incluye metadata: coeficienteK, rangoFinal, rangosAfectados, limitesRangos

### 8.2 No Funcionales

- [ ] **CA-011:** Cálculo de 10 tareas en obra Rango D < 100ms
- [ ] **CA-012:** Tests unitarios con cobertura >95% en honorariosProgresivo.js
- [ ] **CA-013:** JSDoc completo en todas las funciones públicas
- [ ] **CA-014:** Sin dependencias adicionales (usar solo JavaScript nativo)
- [ ] **CA-015:** Código cumple convenciones CH2026 (camelCase, español)
- [ ] **CA-016:** Redondeo de importes sin pérdida de precisión
- [ ] **CA-017:** Logs detallados para debugging (coefK, rangos, montos)

### 8.3 Validación con CPAU

- [ ] **CA-018:** Caso Modelo 1 validado vs cálculo manual CPAU
- [ ] **CA-019:** Caso Modelo X validado vs cálculo manual CPAU
- [ ] **CA-020:** Caso Modelo 2 validado vs cálculo manual CPAU
- [ ] **CA-021:** Caso Modelo 3 validado vs cálculo manual CPAU
- [ ] **CA-022:** Diferencias <$1 aceptadas por redondeo
- [ ] **CA-023:** Fórmulas documentadas coinciden con normativa CPAU 2026

### 8.4 Integración

- [ ] **CA-024:** Endpoint `/api/v1/honorarios/calcular` responde con nueva estructura
- [ ] **CA-025:** Response incluye todos los campos de metadata
- [ ] **CA-026:** Frontend puede agrupar ítems por tareaProfesional
- [ ] **CA-027:** Sin errores 500 en tests de integración
- [ ] **CA-028:** Backward incompatibility documentada en CHANGELOG

### 8.5 Checklist de Deployment

- [ ] **CA-029:** Tests ejecutados exitosamente en local (100% pass)
- [ ] **CA-030:** Code review aprobado por Tech Lead
- [ ] **CA-031:** Documentación actualizada (README, API docs)
- [ ] **CA-032:** Deploy a QA exitoso
- [ ] **CA-033:** Validación manual en QA con 4 modelos
- [ ] **CA-034:** Frontend actualizado y desplegado a QA
- [ ] **CA-035:** Aprobación CPAU para deploy a producción
- [ ] **CA-036:** Deploy a producción en ventana de mantenimiento
- [ ] **CA-037:** Monitoreo post-deploy sin errores (48 horas)
- [ ] **CA-038:** Rollback plan documentado y probado

---

## 9. ANEXOS

### 9.1 Referencia CPAU

**Documento Origen:** Resolución Aranceles CPAU 2026  
**Sección:** Sistema Progresivo de Honorarios Profesionales  
**Fecha de Vigencia:** 01/01/2026  
**Aprobado por:** Comisión de Aranceles CPAU

### 9.2 Comparativa Sistema Plano vs Progresivo

| Valor Obra | Sistema Plano | Sistema Progresivo | Diferencia | % |
|-----------|---------------|-------------------|-----------|---|
| $253.800.000 (Modelo 1) | $21.319.200 | $21.319.200 | $0 | 0% |
| $1.692.000.000 (Modelo X) | $90.614.654 | $101.909.289 | +$11.294.635 | +12.46% |
| $4.230.000.000 (Modelo 2) | $206.604.408 | $241.860.022 | +$35.255.614 | +17.06% |
| $21.150.000.000 (Modelo 3) | $778.644.408 | $942.375.899 | +$163.731.491 | +21.03% |

**Observación:** El sistema progresivo incrementa los honorarios en obras de gran escala, reflejando mejor la complejidad real del trabajo profesional.

### 9.3 Impacto en Honorarios por Tarea

**Escenario:** Obra $4.230.000.000 con todas las tareas

| Tarea | Sistema Plano | Sistema Progresivo | Diferencia |
|-------|---------------|-------------------|-----------|
| Proyecto Arquitectura | $152.604.408 | $145.116.013 | -$7.488.395 |
| Dirección Arquitectura | $101.736.272 | $96.744.009 | -$4.992.263 |
| Instalación Sanitaria | $5.076.000 | $13.753.931 | +$8.677.931 |
| Instalación Eléctrica | $5.076.000 | $13.753.931 | +$8.677.931 |
| Proyecto Estructuras | $8.883.600 | $19.079.069 | +$10.195.469 |
| **TOTAL** | $273.376.280 | $288.446.953 | **+$15.070.673 (+5.5%)** |

### 9.4 Fórmulas de Verificación (Excel)

```excel
// Cálculo Límite Superior Rango A
=0.5 * ValorK

// Cálculo Límite Superior Rango B
=5 * ValorK

// Cálculo Límite Superior Rango C
=25 * ValorK

// Monto Afectado Rango A
=MIN(ValorObra, LimSupRangoA) - 0

// Monto Afectado Rango B
=IF(ValorObra > LimSupRangoA,
   MIN(ValorObra, LimSupRangoB) - LimSupRangoA,
   0)

// Importe Rango A (Proyecto 60%)
=MontoAfectadoA * 0.14 * 0.6
```

---

## 10. HISTORIAL DE CAMBIOS

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 20/04/2026 | Backend Team | Versión inicial - pendiente aprobación CPAU |

---

## 11. APROBACIONES

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| **Product Owner** | CPAU - Área Técnica | - | ⏳ PENDIENTE |
| **Tech Lead** | Backend Team | 20/04/2026 | ✅ APROBADO |
| **QA Lead** | QA Team | - | ⏳ PENDIENTE |
| **Frontend Lead** | Frontend Team | - | ⏳ PENDIENTE (revisar impacto UI) |

---

**🎯 ESPECIFICACIÓN LISTA PARA REVISIÓN**

**Siguiente paso:** Presentar a CPAU para validación de fórmulas y casos de prueba.

**Impacto estimado:** Breaking change en API requiere coordinación frontend/backend para deploy.
