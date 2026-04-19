# SPEC-CALC-001: Coeficientes Diferenciados por Tipo de Instalación

**Fecha:** 19/04/2026  
**Versión:** 1.0  
**Estado:** ✅ APROBADO PARA IMPLEMENTACIÓN  
**Autor:** CPAU - Área Técnica  
**Desarrollador:** Backend Team

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Impacto](#2-análisis-de-impacto)
3. [Especificación de Datos](#3-especificación-de-datos)
4. [Especificación de Algoritmo](#4-especificación-de-algoritmo)
5. [Contratos de API](#5-contratos-de-api)
6. [Casos de Prueba](#6-casos-de-prueba)
7. [Plan de Implementación](#7-plan-de-implementación)
8. [Criterios de Aceptación](#8-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Contexto

El sistema actual utiliza **un único conjunto de coeficientes** para todas las instalaciones:
- Instalación Sanitaria
- Instalación Eléctrica
- Instalación Contra Incendio
- Instalación Termomecánica

Esto está implementado como `COEFICIENTES_INSTALACIONES` en `tablasCoeficientes.js`.

### 1.2 Problema

El CPAU ha actualizado sus tablas de honorarios y ahora **cada tipo de instalación tiene coeficientes específicos** según su complejidad y especialización técnica.

### 1.3 Objetivo

**Diferenciar los coeficientes de cálculo por tipo de instalación** para reflejar con precisión los honorarios profesionales según las nuevas tablas CPAU 2026.

### 1.4 Alcance

**✅ INCLUYE:**
- Modificar estructura de datos de coeficientes
- Actualizar algoritmo de cálculo para usar coeficientes específicos
- Mantener compatibilidad con el contrato de API existente
- Tests unitarios actualizados

**❌ NO INCLUYE:**
- Cambios en el contrato de API (input/output permanecen iguales)
- Cambios en coeficientes de Proyecto/Dirección de Obra
- Cambios en coeficientes de Estructuras
- Cambios en UI/Frontend (transparente para el usuario)

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Archivos Afectados

| Archivo | Tipo de Cambio | Complejidad |
|---------|---------------|-------------|
| `tablasCoeficientes.js` | **BREAKING CHANGE** | 🟡 Media |
| `honorariosBasico.js` | **LÓGICA MODIFICADA** | 🟡 Media |
| `honorariosBasico.test.js` | **TESTS ACTUALIZADOS** | 🟢 Baja |

### 2.2 Backward Compatibility

**⚠️ BREAKING CHANGE INTERNO (no afecta API):**

```javascript
// ❌ DEPRECADO (se elimina)
export const COEFICIENTES_INSTALACIONES = {...}

// ✅ NUEVO (reemplaza al anterior)
export const COEFICIENTES_SANITARIA_ELECTRICA = {...}
export const COEFICIENTES_INCENDIO = {...}
export const COEFICIENTES_TERMOMECANICA = {...}
```

**✅ COMPATIBILIDAD DE API:** El contrato de entrada/salida **NO cambia**. El frontend no requiere modificaciones.

### 2.3 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Valores incorrectos en tablas | 🟢 Baja | 🔴 Alta | Tests con casos conocidos del CPAU |
| Regresión en cálculos existentes | 🟡 Media | 🔴 Alta | Tests de comparación con resultados actuales |
| Confusión en naming de constantes | 🟢 Baja | 🟡 Media | Documentación clara y JSDoc |

---

## 3. ESPECIFICACIÓN DE DATOS

### 3.1 Estructura Actual (v1.0)

```javascript
/**
 * ❌ DEPRECADO - Se eliminará
 * Coeficientes únicos para todas las instalaciones
 */
export const COEFICIENTES_INSTALACIONES = {
  rangoA: { obra: 0.0023, k: 0 },
  rangoB: { obra: 0.0012, k: 0 },
  rangoC: { obra: 0.0008, k: 0 },
  rangoD: { obra: 0.0004, k: 0 }
};
```

### 3.2 Estructura Nueva (v2.0)

```javascript
/**
 * ✅ NUEVO
 * Coeficientes para Instalación Sanitaria/Gas e Instalación Eléctrica
 * NOTA: Ambas tareas comparten los mismos coeficientes según CPAU 2026
 * Porcentaje: 100%
 */
export const COEFICIENTES_SANITARIA_ELECTRICA = {
  rangoA: { obra: 0.0040, k: 0 },  // Hasta 0.5k
  rangoB: { obra: 0.0014, k: 0 },  // 0.5k a 5k
  rangoC: { obra: 0.0012, k: 0 },  // 5k a 25k
  rangoD: { obra: 0.0005, k: 0 }   // Más de 25k
};

/**
 * ✅ NUEVO
 * Coeficientes para Instalación Contra Incendio
 * Porcentaje: 100%
 */
export const COEFICIENTES_INCENDIO = {
  rangoA: { obra: 0.0010, k: 0 },  // Hasta 0.5k
  rangoB: { obra: 0.0007, k: 0 },  // 0.5k a 5k
  rangoC: { obra: 0.0006, k: 0 },  // 5k a 25k
  rangoD: { obra: 0.00025, k: 0 }  // Más de 25k
};

/**
 * ✅ NUEVO
 * Coeficientes para Instalación Termomecánica
 * Porcentaje: 100%
 */
export const COEFICIENTES_TERMOMECANICA = {
  rangoA: { obra: 0.0010, k: 0 },  // Hasta 0.5k
  rangoB: { obra: 0.0007, k: 0 },  // 0.5k a 5k
  rangoC: { obra: 0.0006, k: 0 },  // 5k a 25k
  rangoD: { obra: 0.00025, k: 0 }  // Más de 25k
};
```

### 3.3 Tabla Comparativa de Coeficientes

| Rango | Valor/K | Sanitaria/Eléctrica | Incendio | Termomecánica | Estructuras (sin cambio) |
|-------|---------|---------------------|----------|---------------|--------------------------|
| **A** | < 0.5   | **0.0040** (+74%)   | 0.0010   | 0.0010        | 0.0030                   |
| **B** | 0.5-5   | **0.0014** (+17%)   | 0.0007   | 0.0007        | 0.0026                   |
| **C** | 5-25    | **0.0012** (+50%)   | 0.0006   | 0.0006        | 0.0021                   |
| **D** | > 25    | **0.0005** (+25%)   | 0.00025  | 0.00025       | 0.0016                   |

**Observaciones:**
- Sanitaria/Eléctrica tienen **incrementos significativos** vs. valores anteriores
- Incendio y Termomecánica tienen coeficientes **más bajos** (menor complejidad técnica)
- Estructuras **no cambia** (ya tenía coeficientes propios)

---

## 4. ESPECIFICACIÓN DE ALGORITMO

### 4.1 Lógica Actual

```javascript
// ❌ LÓGICA ACTUAL (4 tareas → 1 coeficiente)
if (formData.instalacionSanitaria) {
  agregarItemsTarea(items, 'Sanitaria', COEFICIENTES_INSTALACIONES, ...);
}
if (formData.instalacionElectrica) {
  agregarItemsTarea(items, 'Eléctrica', COEFICIENTES_INSTALACIONES, ...);
}
if (formData.instalacionContraIncendio) {
  agregarItemsTarea(items, 'Incendio', COEFICIENTES_INSTALACIONES, ...);
}
if (formData.instalacionTermomecanica) {
  agregarItemsTarea(items, 'Termomecánica', COEFICIENTES_INSTALACIONES, ...);
}
```

### 4.2 Lógica Nueva

```javascript
// ✅ LÓGICA NUEVA (cada tarea → su coeficiente)
if (formData.instalacionSanitaria) {
  agregarItemsTarea(
    items, 
    'Proyecto de instalación sanitaria', 
    COEFICIENTES_SANITARIA_ELECTRICA,  // ← Específico
    nombreRango,
    formData.valorObra,
    valorK,
    PORCENTAJES_TAREA.instalaciones
  );
}

if (formData.instalacionElectrica) {
  agregarItemsTarea(
    items,
    'Proyecto de instalación eléctrica',
    COEFICIENTES_SANITARIA_ELECTRICA,  // ← Específico (mismo que sanitaria)
    nombreRango,
    formData.valorObra,
    valorK,
    PORCENTAJES_TAREA.instalaciones
  );
}

if (formData.instalacionContraIncendio) {
  agregarItemsTarea(
    items,
    'Proyecto de instalación contra incendios',
    COEFICIENTES_INCENDIO,  // ← Específico
    nombreRango,
    formData.valorObra,
    valorK,
    PORCENTAJES_TAREA.instalaciones
  );
}

if (formData.instalacionTermomecanica) {
  agregarItemsTarea(
    items,
    'Proyecto de instalación termomecánica',
    COEFICIENTES_TERMOMECANICA,  // ← Específico
    nombreRango,
    formData.valorObra,
    valorK,
    PORCENTAJES_TAREA.instalaciones
  );
}
```

### 4.3 Diagrama de Flujo

```
Input: formData, valorK
│
├─ Calcular rango (A, B, C, D)
│
├─ Si instalacionSanitaria = true
│  └─→ Usar COEFICIENTES_SANITARIA_ELECTRICA[rango]
│
├─ Si instalacionElectrica = true
│  └─→ Usar COEFICIENTES_SANITARIA_ELECTRICA[rango]
│
├─ Si instalacionContraIncendio = true
│  └─→ Usar COEFICIENTES_INCENDIO[rango]
│
├─ Si instalacionTermomecanica = true
│  └─→ Usar COEFICIENTES_TERMOMECANICA[rango]
│
└─ Output: detalleHonorarios[]
```

---

## 5. CONTRATOS DE API

### 5.1 Contrato de Entrada (NO CAMBIA)

```typescript
// ✅ PERMANECE EXACTAMENTE IGUAL
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
    instalacionSanitaria?: boolean;      // ← Sin cambios
    instalacionElectrica?: boolean;      // ← Sin cambios
    instalacionContraIncendio?: boolean; // ← Sin cambios
    instalacionTermomecanica?: boolean;  // ← Sin cambios
    proyectoEstructuras?: boolean;
  };
  parametros?: {
    valorK?: number;
  };
}
```

### 5.2 Contrato de Salida (NO CAMBIA)

```typescript
// ✅ PERMANECE EXACTAMENTE IGUAL
interface ResponseCalculoHonorarios {
  calculoId: string;
  tipoCalculo: 'basico';
  fechaCalculo: string;
  resultado: {
    detalleHonorarios: Array<{
      item: number;
      tareaProfesional: string;
      descripcion: string;
      importe: number;  // ← VALOR CAMBIA (nuevo coeficiente) pero ESTRUCTURA NO
    }>;
    totalHonorarios: number;  // ← VALOR CAMBIA pero TIPO NO
    metadata: {
      rango: string;
      valorK: number;
      rangoCostoObra: number;
      numeroItems: number;
    };
  };
}
```

### 5.3 Garantía de Compatibilidad

**✅ FRONTEND NO REQUIERE CAMBIOS:**
- Request schema → Sin cambios
- Response schema → Sin cambios
- Solo cambian los **valores calculados** (honorarios más precisos)

---

## 6. CASOS DE PRUEBA

### 6.1 Caso de Prueba #1: Sanitaria + Eléctrica (Rango A)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 100000000  // $100M
  },
  tareasProfesionales: {
    instalacionSanitaria: true,
    instalacionElectrica: true
  },
  parametros: {
    valorK: 522181756.33
  }
}
```

**Cálculos:**
```
rangoCostoObra = 100000000 / 522181756.33 = 0.1915 → RANGO A

Sanitaria:
  - coef = 0.0040 (NUEVO, antes era 0.0023)
  - importe = 0.0040 * 100000000 * 1.0 = $400,000

Eléctrica:
  - coef = 0.0040 (NUEVO, antes era 0.0023)
  - importe = 0.0040 * 100000000 * 1.0 = $400,000

Total Instalaciones: $800,000
```

**Output Esperado:**
```javascript
{
  detalleHonorarios: [
    {
      item: 1,
      tareaProfesional: 'Proyecto de instalación sanitaria',
      descripcion: 'Rango de Costos de Obra A (coef 0.4%)',
      importe: 400000
    },
    {
      item: 2,
      tareaProfesional: 'Proyecto de instalación eléctrica',
      descripcion: 'Rango de Costos de Obra A (coef 0.4%)',
      importe: 400000
    }
  ],
  totalHonorarios: 800000,
  metadata: {
    rango: 'A',
    valorK: 522181756.33,
    rangoCostoObra: 0.1915
  }
}
```

**Validación:**
- ✅ Coeficiente correcto (0.0040 vs 0.0023 anterior)
- ✅ Sanitaria y Eléctrica usan mismo coeficiente
- ✅ Importes incrementados por nuevo coeficiente

---

### 6.2 Caso de Prueba #2: Todas las Instalaciones (Rango B)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 2000000000  // $2,000M
  },
  tareasProfesionales: {
    instalacionSanitaria: true,
    instalacionElectrica: true,
    instalacionContraIncendio: true,
    instalacionTermomecanica: true
  },
  parametros: {
    valorK: 522181756.33
  }
}
```

**Cálculos:**
```
rangoCostoObra = 2000000000 / 522181756.33 = 3.83 → RANGO B

Sanitaria:
  - coef = 0.0014
  - importe = 0.0014 * 2000000000 * 1.0 = $2,800,000

Eléctrica:
  - coef = 0.0014
  - importe = 0.0014 * 2000000000 * 1.0 = $2,800,000

Incendio:
  - coef = 0.0007
  - importe = 0.0007 * 2000000000 * 1.0 = $1,400,000

Termomecánica:
  - coef = 0.0007
  - importe = 0.0007 * 2000000000 * 1.0 = $1,400,000

Total Instalaciones: $8,400,000
```

**Output Esperado:**
```javascript
{
  detalleHonorarios: [
    {
      item: 1,
      tareaProfesional: 'Proyecto de instalación sanitaria',
      descripcion: 'Rango de Costos de Obra B (coef 0.14%)',
      importe: 2800000
    },
    {
      item: 2,
      tareaProfesional: 'Proyecto de instalación eléctrica',
      descripcion: 'Rango de Costos de Obra B (coef 0.14%)',
      importe: 2800000
    },
    {
      item: 3,
      tareaProfesional: 'Proyecto de instalación contra incendios',
      descripcion: 'Rango de Costos de Obra B (coef 0.07%)',
      importe: 1400000
    },
    {
      item: 4,
      tareaProfesional: 'Proyecto de instalación termomecánica',
      descripcion: 'Rango de Costos de Obra B (coef 0.07%)',
      importe: 1400000
    }
  ],
  totalHonorarios: 8400000,
  metadata: {
    rango: 'B',
    valorK: 522181756.33,
    rangoCostoObra: 3.83
  }
}
```

**Validación:**
- ✅ Coeficientes diferenciados por tipo de instalación
- ✅ Sanitaria = Eléctrica (mismo coef)
- ✅ Incendio = Termomecánica (mismo coef)
- ✅ Sanitaria/Eléctrica (0.0014) > Incendio/Termomecánica (0.0007)

---

### 6.3 Caso de Prueba #3: Solo Incendio (Rango D)

**Input:**
```javascript
{
  tipoCalculo: 'basico',
  datosObra: {
    valorObra: 20000000000  // $20,000M
  },
  tareasProfesionales: {
    instalacionContraIncendio: true
  },
  parametros: {
    valorK: 522181756.33
  }
}
```

**Cálculos:**
```
rangoCostoObra = 20000000000 / 522181756.33 = 38.30 → RANGO D

Incendio:
  - coef = 0.00025
  - importe = 0.00025 * 20000000000 * 1.0 = $5,000,000

Total: $5,000,000
```

**Output Esperado:**
```javascript
{
  detalleHonorarios: [
    {
      item: 1,
      tareaProfesional: 'Proyecto de instalación contra incendios',
      descripcion: 'Rango de Costos de Obra D (coef 0.025%)',
      importe: 5000000
    }
  ],
  totalHonorarios: 5000000,
  metadata: {
    rango: 'D',
    valorK: 522181756.33,
    rangoCostoObra: 38.30
  }
}
```

---

### 6.4 Tests de Regresión

**Validar que NO cambian:**

| Tarea | Coeficientes Usados | Debe Permanecer Igual |
|-------|---------------------|----------------------|
| Proyecto de Obra | `COEFICIENTES_PROYECTO_DIRECCION` | ✅ Sí |
| Dirección de Obra | `COEFICIENTES_PROYECTO_DIRECCION` | ✅ Sí |
| Proyecto de Estructuras | `COEFICIENTES_ESTRUCTURAS` | ✅ Sí |

**Test Case:**
```javascript
// Cálculo con SOLO Proyecto + Dirección + Estructuras
// (sin instalaciones)
// → Resultado debe ser IDÉNTICO a versión anterior
```

---

## 7. PLAN DE IMPLEMENTACIÓN

### 7.1 Orden de Implementación (TDD)

```
PASO 1: Actualizar tablasCoeficientes.js
  ├─ Agregar COEFICIENTES_SANITARIA_ELECTRICA
  ├─ Agregar COEFICIENTES_INCENDIO
  ├─ Agregar COEFICIENTES_TERMOMECANICA
  └─ ⚠️ DEPRECAR (pero NO eliminar aún) COEFICIENTES_INSTALACIONES

PASO 2: Escribir tests PRIMERO
  ├─ Test: Caso #1 (Sanitaria + Eléctrica, Rango A)
  ├─ Test: Caso #2 (Todas las instalaciones, Rango B)
  ├─ Test: Caso #3 (Solo Incendio, Rango D)
  └─ Test: Regresión (Proyecto + Dirección sin cambios)

PASO 3: Implementar cambios en honorariosBasico.js
  ├─ Modificar bloque instalacionSanitaria
  ├─ Modificar bloque instalacionElectrica
  ├─ Modificar bloque instalacionContraIncendio
  └─ Modificar bloque instalacionTermomecanica

PASO 4: Ejecutar tests
  └─ Todos los tests deben pasar ✅

PASO 5: Validación manual
  ├─ Probar con datos reales del CPAU
  └─ Comparar resultados con cálculos esperados

PASO 6: Eliminar código deprecado
  └─ Eliminar COEFICIENTES_INSTALACIONES de tablasCoeficientes.js

PASO 7: Actualizar documentación
  ├─ JSDoc en código
  └─ README.md con nota de cambio
```

### 7.2 Archivos a Modificar

**Archivo 1: `tablasCoeficientes.js`**
```javascript
// Líneas ~20-30 (modificar)

// ❌ ELIMINAR:
export const COEFICIENTES_INSTALACIONES = {...}

// ✅ AGREGAR:
export const COEFICIENTES_SANITARIA_ELECTRICA = {
  rangoA: { obra: 0.0040, k: 0 },
  rangoB: { obra: 0.0014, k: 0 },
  rangoC: { obra: 0.0012, k: 0 },
  rangoD: { obra: 0.0005, k: 0 }
};

export const COEFICIENTES_INCENDIO = {
  rangoA: { obra: 0.0010, k: 0 },
  rangoB: { obra: 0.0007, k: 0 },
  rangoC: { obra: 0.0006, k: 0 },
  rangoD: { obra: 0.00025, k: 0 }
};

export const COEFICIENTES_TERMOMECANICA = {
  rangoA: { obra: 0.0010, k: 0 },
  rangoB: { obra: 0.0007, k: 0 },
  rangoC: { obra: 0.0006, k: 0 },
  rangoD: { obra: 0.00025, k: 0 }
};
```

**Archivo 2: `honorariosBasico.js`**
```javascript
// Líneas ~100-150 (modificar imports y lógica)

// ✅ MODIFICAR IMPORT:
import {
  COEFICIENTES_PROYECTO_DIRECCION,
  COEFICIENTES_SANITARIA_ELECTRICA,  // ← NUEVO
  COEFICIENTES_INCENDIO,              // ← NUEVO
  COEFICIENTES_TERMOMECANICA,         // ← NUEVO
  COEFICIENTES_ESTRUCTURAS,
  PORCENTAJES_TAREA,
  NOMBRES_RANGO,
  VALOR_K_DEFAULT
} from './tablasCoeficientes.js';

// ✅ MODIFICAR LÓGICA (ver sección 4.2)
```

**Archivo 3: `honorariosBasico.test.js`** (crear si no existe)
```javascript
// Agregar tests según sección 6
```

### 7.3 Estimación de Esfuerzo

| Tarea | Tiempo Estimado | Riesgo |
|-------|-----------------|--------|
| Modificar `tablasCoeficientes.js` | 30 min | 🟢 Bajo |
| Escribir tests (casos 1-3) | 2 horas | 🟡 Medio |
| Modificar `honorariosBasico.js` | 1 hora | 🟡 Medio |
| Testing manual y validación | 1 hora | 🟡 Medio |
| Documentación | 30 min | 🟢 Bajo |
| **TOTAL** | **5 horas** | 🟡 Medio |

---

## 8. CRITERIOS DE ACEPTACIÓN

### 8.1 Funcionales

- [ ] **CA-001:** Instalación Sanitaria usa `COEFICIENTES_SANITARIA_ELECTRICA`
- [ ] **CA-002:** Instalación Eléctrica usa `COEFICIENTES_SANITARIA_ELECTRICA`
- [ ] **CA-003:** Instalación Contra Incendio usa `COEFICIENTES_INCENDIO`
- [ ] **CA-004:** Instalación Termomecánica usa `COEFICIENTES_TERMOMECANICA`
- [ ] **CA-005:** Sanitaria y Eléctrica calculan el mismo importe para mismos inputs
- [ ] **CA-006:** Incendio y Termomecánica calculan el mismo importe para mismos inputs
- [ ] **CA-007:** Sanitaria/Eléctrica tienen honorarios mayores que Incendio/Termomecánica
- [ ] **CA-008:** Estructuras sigue usando `COEFICIENTES_ESTRUCTURAS` sin cambios
- [ ] **CA-009:** Proyecto/Dirección siguen usando `COEFICIENTES_PROYECTO_DIRECCION` sin cambios

### 8.2 No Funcionales

- [ ] **CA-010:** Contrato de API request permanece igual
- [ ] **CA-011:** Contrato de API response permanece igual (solo valores cambian)
- [ ] **CA-012:** Frontend no requiere modificaciones
- [ ] **CA-013:** Tests unitarios con cobertura >90% en código modificado
- [ ] **CA-014:** Todos los tests de regresión pasan
- [ ] **CA-015:** JSDoc actualizado en funciones modificadas
- [ ] **CA-016:** Código deprecado eliminado

### 8.3 Validación con CPAU

- [ ] **CA-017:** Caso de prueba #1 validado contra cálculo manual CPAU
- [ ] **CA-018:** Caso de prueba #2 validado contra cálculo manual CPAU
- [ ] **CA-019:** Caso de prueba #3 validado contra cálculo manual CPAU
- [ ] **CA-020:** Decimales y redondeo según especificación CPAU

### 8.4 Checklist de Deployment

- [ ] **CA-021:** Tests ejecutados exitosamente en local
- [ ] **CA-022:** Commit con mensaje descriptivo: "feat(calc): diferenciar coeficientes por tipo de instalación - SPEC-CALC-001"
- [ ] **CA-023:** Code review aprobado
- [ ] **CA-024:** Deploy a ambiente QA
- [ ] **CA-025:** Validación en QA con datos de producción anonimizados
- [ ] **CA-026:** Deploy a producción
- [ ] **CA-027:** Monitoreo post-deploy (24 horas)

---

## 9. ANEXOS

### 9.1 Referencia CPAU

**Documento Origen:** Tablas de Honorarios CPAU 2026  
**Sección:** Honorarios de Especialidades - Instalaciones  
**Fecha de Vigencia:** 01/01/2026

### 9.2 Tabla de Conversión de Coeficientes

| Tarea | Rango A | Rango B | Rango C | Rango D | Cambio |
|-------|---------|---------|---------|---------|--------|
| **ANTES (todas)** | 0.0023 | 0.0012 | 0.0008 | 0.0004 | - |
| **DESPUÉS (Sanit/Elec)** | 0.0040 | 0.0014 | 0.0012 | 0.0005 | ⬆️ +74%, +17%, +50%, +25% |
| **DESPUÉS (Incendio)** | 0.0010 | 0.0007 | 0.0006 | 0.00025 | ⬇️ -57%, -42%, -25%, -37% |
| **DESPUÉS (Termomec)** | 0.0010 | 0.0007 | 0.0006 | 0.00025 | ⬇️ -57%, -42%, -25%, -37% |

### 9.3 Impacto Financiero (Ejemplo)

**Escenario:** Obra de $1,000M con 4 instalaciones

| Instalación | ANTES | DESPUÉS | Diferencia |
|-------------|-------|---------|-----------|
| Sanitaria | $2,300,000 | $4,000,000 | +$1,700,000 (+74%) |
| Eléctrica | $2,300,000 | $4,000,000 | +$1,700,000 (+74%) |
| Incendio | $2,300,000 | $1,000,000 | -$1,300,000 (-57%) |
| Termomecánica | $2,300,000 | $1,000,000 | -$1,300,000 (-57%) |
| **TOTAL** | **$9,200,000** | **$10,000,000** | **+$800,000 (+8.7%)** |

**Conclusión:** El cambio refleja mejor la complejidad real de cada especialidad.

---

## 10. HISTORIAL DE CAMBIOS

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 19/04/2026 | Backend Team | Versión inicial aprobada |

---

## 11. APROBACIONES

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| **Product Owner** | CPAU - Área Técnica | 19/04/2026 | ✅ APROBADO |
| **Tech Lead** | Backend Team | 19/04/2026 | ✅ APROBADO |
| **QA Lead** | QA Team | - | ⏳ PENDIENTE |

---

**🎯 ESPECIFICACIÓN LISTA PARA IMPLEMENTACIÓN**

**Siguiente paso:** Crear ticket en sistema de gestión (GitHub Issues/Jira) referenciando `SPEC-CALC-001`.
