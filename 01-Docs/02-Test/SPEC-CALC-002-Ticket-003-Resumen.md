# SPEC-CALC-002 - TICKET #003: EVIDENCIA DE TESTS (FASE RED)

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Fecha:** 20/04/2026  
**Ticket:** #003 - TESTS: CASOS DE PRUEBA COMPLETOS (RED PHASE)  
**Fase:** 🔴 RED (Tests escritos PRIMERO, DEBEN FALLAR)  
**Metodología:** Test-Driven Development (TDD)  

---

## 📋 RESUMEN EJECUTIVO

### ✅ Completado - Fase RED

- [x] 11 tests unitarios implementados para `calcularHonorariosProgresivo()`
- [x] 4 casos de modelo según SPEC-CALC-002 (A, A+B, A+B+C, A+B+C+D)
- [x] 2 tests de múltiples tareas profesionales
- [x] 4 tests de validación (valorObra 0, negativo, sin tareas, valorK default)
- [x] **FASE RED CONFIRMADA**: 7 de 11 tests FALLAN ❌ (esperado)
- [x] **FASE RED PARCIAL**: 3 de 4 tests de validación PASAN ✅ (comportamiento correcto del stub)

### 📊 Resultados de Ejecución

```
# tests 34
# suites 19
# pass 27     ← 27 tests pasando (SPEC-CALC-001 + calcularLimitesRangos + validaciones stub)
# fail 7      ← 7 tests fallando (ESPERADO en fase RED) ❌
# cancelled 0
# skipped 0
# todo 0
# duration_ms 246.96
```

**Estado:** 🔴 **FASE RED CORRECTA** - Los tests de cálculo FALLAN porque la función no está implementada (retorna `[]` vacío)

---

## 🎯 OBJETIVO DEL TICKET

Implementar todos los tests unitarios para el sistema progresivo de cálculo de honorarios **ANTES** de escribir el código de implementación. Esto sigue la metodología TDD (Test-Driven Development):

1. **🔴 RED**: Escribir tests que fallan (Ticket #003 - ESTE TICKET)
2. **🟢 GREEN**: Implementar código para que pasen (Ticket #004 - siguiente)
3. **♻️ REFACTOR**: Optimizar y limpiar (Ticket #005)

### Contexto TDD

Los tests **DEBEN FALLAR** en esta fase porque:
- La función `calcularHonorariosProgresivo()` solo retorna `[]` (stub)
- Esto garantiza que los tests son válidos y realmente prueban la funcionalidad
- En Ticket #004 se implementará la lógica para que los tests pasen (GREEN)

---

## 💻 TESTS IMPLEMENTADOS

### Archivo: `App/Backend/02-Node/src/utils/calculos/__tests__/honorariosProgresivo.test.js`

**Total:** 318 líneas  
**Tests:** 11 tests en 6 suites  
**Framework:** `node:test` + `node:assert`  

---

## 🧪 CASOS DE PRUEBA DETALLADOS

### 1️⃣ Caso #1: Modelo 1 (Solo Rango A)

**Test:** `debe calcular honorarios para obra de $253.800.000 (solo Rango A)`

**Input:**
```javascript
{
  valorObra: 253800000,
  tareas: {
    obraProyecto: true
  }
}
```

**Valores Esperados (según SPEC-CALC-002):**
- Cantidad de ítems: 1
- Ítem 1: Rango A (coef 14%) → $21.319.200
- Total: $21.319.200

**Estado:** ❌ **FALLA** (expected 1, actual 0)
```
AssertionError: Debe haber 1 ítem (solo Rango A)
  0 !== 1
```

**Razón:** La función retorna `[]` porque solo tiene el stub implementado.

---

### 2️⃣ Caso #2: Modelo X (Rangos A+B)

**Test:** `debe calcular honorarios para obra de $1.692.000.000 (Rangos A+B)`

**Input:**
```javascript
{
  valorObra: 1692000000,
  tareas: {
    obraProyecto: true
  }
}
```

**Valores Esperados (según SPEC-CALC-002):**
- Cantidad de ítems: 3
- Ítem 1: Rango A (coef 14%) → $24.142.171
- Ítem 2: Rango B (coef 8%) → $67.420.473
- Ítem 3: Rango B (coef K 3%) → $10.346.645
- Total: $101.909.289

**Estado:** ❌ **FALLA** (expected 3, actual 0)
```
AssertionError: Debe haber 3 ítems (Rango A + Rango B obra + Rango B K)
  0 !== 3
```

**Razón:** Función retorna array vacío, no calcula los 3 ítems esperados.

---

### 3️⃣ Caso #3: Modelo 2 (Rangos A+B+C)

**Test:** `debe calcular honorarios para obra de $4.230.000.000 (Rangos A+B+C)`

**Input:**
```javascript
{
  valorObra: 4230000000,
  tareas: {
    obraProyecto: true
  }
}
```

**Valores Esperados (según SPEC-CALC-002):**
- Cantidad de ítems: 4
- Ítem 1: Rango A (coef 14%) → $24.142.171
- Ítem 2: Rango B (coef 8%) → $124.159.739
- Ítem 3: Rango C (coef 6%) → $48.813.551
- Ítem 4: Rango C (coef K 13%) → $44.744.561
- Total: $241.860.022

**Estado:** ❌ **FALLA** (expected 4, actual 0)
```
AssertionError: Debe haber 4 ítems (A + B + C obra + C K)
  0 !== 4
```

---

### 4️⃣ Caso #4: Modelo 3 (Rangos A+B+C+D)

**Test:** `debe calcular honorarios para obra de $21.150.000.000 (Rangos A+B+C+D)`

**Input:**
```javascript
{
  valorObra: 21150000000,
  tareas: {
    obraProyecto: true
  }
}
```

**Valores Esperados (según SPEC-CALC-002):**
- Cantidad de ítems: 5
- Ítem 1: Rango A (coef 14%) → $24.142.171
- Ítem 2: Rango B (coef 8%) → $124.159.739
- Ítem 3: Rango C (coef 6%) → $413.865.837
- Ítem 4: Rango D (coef 4%) → $162.711.836
- Ítem 5: Rango D (coef K 63%) → $217.496.316
- Total: $942.375.899

**Estado:** ❌ **FALLA** (expected 5, actual 0)
```
AssertionError: Debe haber 5 ítems (A + B + C + D obra + D K)
  0 !== 5
```

---

### 5️⃣ Caso #5: Múltiples Tareas

#### Test 5.1: `debe generar ítems para múltiples tareas profesionales`

**Input:**
```javascript
{
  valorObra: 1692000000,
  tareas: {
    obraProyecto: true,
    obraDireccion: true,
    instalacionSanitaria: true
  }
}
```

**Valores Esperados:**
- Mínimo 8 ítems (3 tareas × múltiples rangos)
- Debe incluir: "Proyecto de obra de arquitectura"
- Debe incluir: "Dirección de obra de arquitectura"
- Debe incluir: "Instalación Sanitaria"

**Estado:** ❌ **FALLA**
```
AssertionError: Debe haber al menos 8 ítems para 3 tareas
```

---

#### Test 5.2: `debe calcular correctamente con porcentajes de tarea aplicados`

**Input:**
```javascript
{
  valorObra: 1692000000,
  tareas: {
    obraProyecto: true  // 60% según PORCENTAJES_TAREA
  }
}
```

**Valores Esperados:**
- Total con porcentaje 60% aplicado: $101.909.289

**Estado:** ❌ **FALLA**
```
AssertionError: Total debe ser mayor a 0
```

---

### 6️⃣ Tests de Validación

#### Test 6.1: `debe retornar array vacío si valorObra = 0`

**Input:**
```javascript
{
  valorObra: 0,
  tareas: { obraProyecto: true }
}
```

**Valor Esperado:** `[]` (array vacío)

**Estado:** ✅ **PASA**

**Razón:** El stub retorna `[]` vacío, que es el comportamiento esperado.

---

#### Test 6.2: `debe retornar array vacío si valorObra es negativo`

**Input:**
```javascript
{
  valorObra: -1000000,
  tareas: { obraProyecto: true }
}
```

**Valor Esperado:** `[]` (array vacío)

**Estado:** ✅ **PASA**

**Razón:** El stub retorna `[]` vacío, que es correcto.

---

#### Test 6.3: `debe retornar array vacío si no hay tareas seleccionadas`

**Input:**
```javascript
{
  valorObra: 1692000000,
  tareas: {}  // Sin tareas
}
```

**Valor Esperado:** `[]` (array vacío)

**Estado:** ✅ **PASA**

**Razón:** Comportamiento correcto del stub.

---

#### Test 6.4: `debe usar VALOR_K_DEFAULT si no se proporciona valorK`

**Input:**
```javascript
{
  valorObra: 253800000,
  tareas: { obraProyecto: true }
}
// Sin segundo parámetro valorK
```

**Valor Esperado:** Debe calcular usando VALOR_K_DEFAULT

**Estado:** ❌ **FALLA**
```
AssertionError: Debe calcular con VALOR_K_DEFAULT
```

**Razón:** La función retorna array vacío, no realiza cálculo.

---

## 📊 RESUMEN DE RESULTADOS

### Desglose por Estado

| Categoría | Tests | Pasan ✅ | Fallan ❌ | Esperado |
|-----------|-------|---------|----------|----------|
| **Casos de Modelo** | 4 | 0 | 4 | ❌ Deben fallar |
| **Múltiples Tareas** | 2 | 0 | 2 | ❌ Deben fallar |
| **Validaciones** | 4 | 3 | 1 | ✅ Algunos pasan (stub) |
| **TOTAL SPEC-CALC-002** | **10** | **3** | **7** | **🔴 Fase RED** |

### Tests de Otros Módulos (No afectados)

| Módulo | Tests | Estado |
|--------|-------|--------|
| SPEC-CALC-001: Coeficientes Diferenciados | 8 | ✅ Todos pasan |
| calcularLimitesRangos() | 17 | ✅ Todos pasan |
| **TOTAL PREVIOS** | **25** | **✅ 100% GREEN** |

### Totales Generales

```
✅ 27 tests pasando (SPEC-CALC-001 + calcularLimitesRangos + 3 validaciones)
❌ 7 tests fallando (Casos de modelo + múltiples tareas + 1 validación)
📊 34 tests totales ejecutados
⏱️  246.96 ms duración total
🔴 FASE RED confirmada correctamente
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

| ID | Criterio | Estado | Evidencia |
|----|----------|--------|-----------|
| CA-010 | 5 casos de prueba completos implementados | ✅ PASS | 11 tests creados |
| CA-011 | Tests adicionales de validación | ✅ PASS | 4 tests de validación |
| CA-012 | Tests principales FALLAN (RED phase) | ✅ PASS | 7/11 tests FALLAN |
| CA-013 | Descripciones de tests claras | ✅ PASS | Mensajes descriptivos |
| CA-014 | Valores esperados coinciden con SPEC | ✅ PASS | Valores extraídos del SPEC |
| CA-015 | Tests de validación comportamiento correcto | ✅ PASS | 3 tests PASAN (stub correcto) |

---

## 🔍 ANÁLISIS TDD

### ✅ Fase RED Correcta

**Confirmaciones:**
1. ✅ Los 4 casos de modelo FALLAN (función retorna `[]` vacío)
2. ✅ Los 2 tests de múltiples tareas FALLAN (no calculan ítems)
3. ✅ 3 tests de validación PASAN (stub retorna `[]` para casos inválidos)
4. ✅ 1 test de valorK default FALLA (no realiza cálculo)

**Interpretación:**
- Los tests de cálculo FALLAN porque la función NO ESTÁ IMPLEMENTADA ✅
- Los tests de validación PASAN porque el stub retorna `[]` correctamente ✅
- Esto es el comportamiento esperado en fase RED de TDD ✅

### ⚠️ Warnings en Console

Durante la ejecución se observan 10 warnings:
```
⚠️ calcularHonorariosProgresivo no implementado aún - Ticket #004
```

**Interpretación:** Correctos, indican que la función es un stub.

---

## 📝 ESTRUCTURA DE TESTS

### Organización por Suites

```javascript
describe('SPEC-CALC-002: Sistema Progresivo de Honorarios', () => {
  
  describe('Caso #1: Modelo 1 (Solo Rango A)', () => {
    test('debe calcular honorarios para obra de $253.800.000 (solo Rango A)')
  });
  
  describe('Caso #2: Modelo X (Rangos A+B)', () => {
    test('debe calcular honorarios para obra de $1.692.000.000 (Rangos A+B)')
  });
  
  describe('Caso #3: Modelo 2 (Rangos A+B+C)', () => {
    test('debe calcular honorarios para obra de $4.230.000.000 (Rangos A+B+C)')
  });
  
  describe('Caso #4: Modelo 3 (Rangos A+B+C+D)', () => {
    test('debe calcular honorarios para obra de $21.150.000.000 (Rangos A+B+C+D)')
  });
  
  describe('Caso #5: Múltiples Tareas', () => {
    test('debe generar ítems para múltiples tareas profesionales')
    test('debe calcular correctamente con porcentajes de tarea aplicados')
  });
  
  describe('Validaciones', () => {
    test('debe retornar array vacío si valorObra = 0')
    test('debe retornar array vacío si valorObra es negativo')
    test('debe retornar array vacío si no hay tareas seleccionadas')
    test('debe usar VALOR_K_DEFAULT si no se proporciona valorK')
  });
});
```

### Características de los Tests

1. **Valores precisos:** Todos los importes esperados vienen del SPEC-CALC-002
2. **Assertions múltiples:** Cada test verifica estructura, cantidad, importes, totales
3. **Validación completa:** Se verifica `tareaProfesional`, `descripcion`, `importe`
4. **Coverage completo:** Cubren los 4 rangos (A, B, C, D) y sus combinaciones

---

## 📁 ARCHIVOS CREADOS/MODIFICADOS

### Archivos Modificados:

1. **`App/Backend/02-Node/src/utils/calculos/__tests__/honorariosProgresivo.test.js`**
   - Líneas: 318 (incremento de ~240 líneas desde stub)
   - Tests: 11 tests en 6 suites
   - Conversión: placeholders → tests completos con valores SPEC

2. **`01-Docs/01-PM/SPEC-CALC-002-TICKETS.txt`**
   - Estado Ticket #003: ⏳ PENDIENTE → ✅ COMPLETADO
   - Subtareas: ☐ → ✅
   - Resultados documentados

### Archivos de Evidencia (NUEVOS):

1. **`01-Docs/02-Test/SPEC-CALC-002-Ticket-003-Evidencia-Tests-RED.txt`**
   - Output completo de `npm test` en formato TAP
   - 34 tests ejecutados, 27 pass, 7 fail
   - Detalles de errores de fase RED

2. **`01-Docs/02-Test/SPEC-CALC-002-Ticket-003-Resumen.md`** (este archivo)
   - Documentación completa del ticket
   - Casos de prueba detallados
   - Análisis TDD de fase RED

---

## 🚀 PRÓXIMOS PASOS

### Ticket #004: CORE - IMPLEMENTACIÓN (GREEN PHASE)

**Objetivo:** Implementar la función `calcularHonorariosProgresivo()` para que TODOS los tests pasen.

**Funciones a implementar:**
1. `determinarRango(coeficienteK)` → retorna 'A', 'B', 'C', o 'D'
2. `formatearPorcentaje(coeficiente)` → retorna "14%" desde 0.14
3. `procesarTareaProgresiva(...)` → calcula ítems para una tarea
4. `calcularHonorariosProgresivo(formData, valorK)` → función principal

**Algoritmo principal:**
```
1. Calcular límites de rangos con calcularLimitesRangos(valorK)
2. Para cada tarea seleccionada:
   a. Obtener coeficientes de la tarea
   b. Para cada rango (A, B, C, D):
      - Determinar qué porción del valorObra cae en este rango
      - Aplicar coeficiente del rango a esa porción
      - Generar ítems (coef obra + coef K si aplica)
3. Retornar array de ítems
```

**Criterio de éxito:**
- ✅ 34/34 tests PASAN (100% GREEN)
- ✅ Todos los importes coinciden exactamente con SPEC
- ✅ 0 tests fallando

**Estimación:** 12 horas

**Dependencia:** ✅ Ticket #003 completado

---

## 📌 NOTAS TÉCNICAS

### Decisiones de Tests

1. **Estructura de formData:** Simplificada para tests, solo `valorObra` y `tareas`
2. **Valores esperados:** Extraídos directamente de SPEC-CALC-002 Sección 6
3. **Redondeo:** Los importes se comparan con valores enteros (sin decimales)
4. **Framework:** `node:test` (no vitest), consistente con Ticket #002

### Comportamiento Stub Actual

```javascript
export function calcularHonorariosProgresivo(formData, valorK = VALOR_K_DEFAULT) {
  console.warn('⚠️ calcularHonorariosProgresivo no implementado aún - Ticket #004');
  return [];
}
```

**Retorna:** Array vacío `[]`  
**Esperado en Ticket #004:** Array de objetos con estructura:
```javascript
[
  {
    item: 1,
    tareaProfesional: string,
    descripcion: string,
    importe: number
  },
  // ...
]
```

---

## ✍️ COMMIT ESPERADO

```
test(calc): implementar tests completos SPEC-CALC-002 (RED phase)

- Implementados 11 tests unitarios para calcularHonorariosProgresivo()
- 4 casos de modelo: A, A+B, A+B+C, A+B+C+D (según SPEC)
- 2 tests de múltiples tareas profesionales
- 4 tests de validación (valorObra 0, negativo, sin tareas, valorK default)
- Valores esperados extraídos de SPEC-CALC-002 Sección 6
- Fase RED confirmada: 7/11 tests FALLAN (esperado en TDD)
- 3 tests de validación PASAN (stub retorna [] correctamente)
- Tests listos para implementación en Ticket #004 (GREEN phase)

Evidencias:
- 01-Docs/02-Test/SPEC-CALC-002-Ticket-003-Evidencia-Tests-RED.txt
- 01-Docs/02-Test/SPEC-CALC-002-Ticket-003-Resumen.md

Ref: 01-Docs/00-Specs/SPEC-CALC-002-Arrastre-Coeficientes-Progresivo.md
```

---

**Elaborado por:** Backend Team - CH2026  
**Revisado por:** QA Team  
**Metodología:** Test-Driven Development (TDD)  
**Fase actual:** 🔴 RED (Tests fallan)  
**Próxima fase:** 🟢 GREEN (Implementar código)  
**Fecha de cierre:** 20/04/2026  
