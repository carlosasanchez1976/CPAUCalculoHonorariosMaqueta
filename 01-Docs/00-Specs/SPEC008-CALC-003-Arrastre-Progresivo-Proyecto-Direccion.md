# SPEC-CALC-003: Extensión de Arrastre Progresivo a Proyecto y Dirección de Obra

**Fecha:** 22/05/2026  
**Versión:** 1.0  
**Estado:** 🟢 APROBADO - LISTO PARA IMPLEMENTAR  
**Autor:** CPAU - Área Técnica  
**Desarrollador:** Backend Team  
**Dependencias:** SPEC-CALC-002 (Arrastre Progresivo) - IMPLEMENTADO

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Cambio Solicitado](#2-cambio-solicitado)
3. [Análisis de Impacto](#3-análisis-de-impacto)
4. [Especificación Técnica](#4-especificación-técnica)
5. [Casos de Prueba](#5-casos-de-prueba)
6. [Criterios de Aceptación](#6-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Situación Actual

Según **SPEC-CALC-002**, el sistema de arrastre progresivo está implementado con el siguiente alcance:

**✅ CON Arrastre Progresivo:**
- Instalación Sanitaria (4.3)
- Instalación Eléctrica (4.4)
- Instalación Contra Incendio (4.5)
- Instalación Termomecánica (4.6)
- Proyecto de Estructuras (4.7)

**❌ SIN Arrastre Progresivo:**
- Proyecto de Obra de Arquitectura (4.1)
- Dirección de Obra de Arquitectura (4.2)

### 1.2 Decisión Original

En SPEC-CALC-002 se decidió deliberadamente **NO aplicar arrastre progresivo** a Proyecto y Dirección por:
- Simplificación de cálculos principales
- Diferenciación conceptual: obra principal vs. especialidades
- Menor impacto económico en el resultado total

**Comportamiento actual:**
```
Obra de $3.000.000 (Rango B) - Proyecto de Obra:
- 1 ítem: Coef 9.5% × $3.000.000 × 60% = $171.000
- 1 ítem: Coef K 3% × $522.181 × 60% = $9.399
TOTAL: $180.399
```

### 1.3 Justificación del Cambio

**Solicitante:** CPAU - Dirección Técnica  
**Fecha solicitud:** 22/05/2026  
**Motivo:** Uniformidad de criterio de cálculo

El cliente CPAU solicita **aplicar el mismo sistema de arrastre progresivo** a Proyecto y Dirección de Obra para:
- **Consistencia**: Todas las tareas profesionales calculan con el mismo criterio
- **Transparencia**: Facilita explicación a profesionales matriculados
- **Equidad**: Aplicación uniforme del principio de progresividad

### 1.4 Objetivo

**Extender el sistema de arrastre progresivo** de SPEC-CALC-002 para incluir:
- Proyecto de Obra de Arquitectura (4.1)
- Dirección de Obra de Arquitectura (4.2)

---

## 2. CAMBIO SOLICITADO

### 2.1 Alcance del Cambio

| Tarea | Estado Actual | Estado Deseado |
|-------|---------------|----------------|
| Proyecto de Obra (4.1) | ❌ Sin arrastre | ✅ **CON arrastre** |
| Dirección de Obra (4.2) | ❌ Sin arrastre | ✅ **CON arrastre** |
| Instalaciones (4.3-4.6) | ✅ Con arrastre | ✅ Sin cambios |
| Estructuras (4.7) | ✅ Con arrastre | ✅ Sin cambios |

### 2.2 Comportamiento Deseado

**Nuevo cálculo para Proyecto de Obra ($3.000.000 - Rango B):**

```
Arrastre progresivo:
- Rango A: Coef 14% × $522.181 × 60% = $43.863
- Rango B: Coef 9.5% × $2.477.819 × 60% = $141.235
SUBTOTAL coef_obra: $185.098

- Rango B (K): Coef K 3% × $522.181 × 60% = $9.399
SUBTOTAL coef_k: $9.399

TOTAL: $194.497
```

**Diferencia vs. Sistema Actual:**
- Antes: $180.399
- Después: $194.497
- Incremento: **+$14.098 (+7.8%)**

### 2.3 Coeficientes a Utilizar

Los coeficientes permanecen **sin cambios** según modificación del 22/05/2026 registrada en `Calcular_Honorario_PYDOA.sql`:

| Rango | Coef Obra | Coef K | % Proyecto | % Dirección |
|-------|-----------|--------|------------|-------------|
| A     | 14%       | 0%     | 60%        | 40%         |
| B     | 9.5%      | 3%     | 60%        | 40%         |
| C     | 6%        | 13%    | 60%        | 40%         |
| D     | 2.5%      | 40%    | 60%        | 40%         |

**Nota:** El porcentaje de tarea (60% Proyecto / 40% Dirección) se aplica **después** del cálculo progresivo, como en todas las demás tareas.

---

## 3. ANÁLISIS DE IMPACTO

### 3.1 Impacto en Sistema

**✅ FAVORABLE:**
- Lógica ya existe y está probada (SPEC-CALC-002)
- Reutilización de algoritmo de arrastre existente
- Cero cambios en frontend (ya maneja múltiples ítems por tarea)
- Cero cambios en API contract (estructura compatible)

**⚠️ CONSIDERACIONES:**
- Aumentará el número de ítems en el detalle (más registros en `Calculos_Items`)
- Cambio en importes finales (validar con casos de prueba reales)
- Re-testing completo obligatorio

### 3.2 Archivos Afectados

**Backend - Stored Procedure:**

| Archivo | Cambio | Líneas Afectadas |
|---------|--------|------------------|
| `Calcular_Honorario_PYDOA.sql` | **REFACTOR** Secciones 4.1 y 4.2 | ~150-250 |

**Cambios Específicos:**
```sql
-- ANTES (4.1 - Proyecto de Obra):
IF v_tarea_obra_proyecto THEN
  SET v_tarea_profesional = 'Proyecto de obra de arquitectura';
  SET v_porcentaje_tarea = 0.60;
  
  -- Cálculo simple sobre rango final
  IF v_coef_obra > 0 THEN
    SET v_importe_item = ROUND(v_coef_obra * v_valor_obra * v_porcentaje_tarea);
    -- 1 ítem generado
  END IF;
  
  IF v_coef_k > 0 THEN
    SET v_importe_item = ROUND(v_coef_k * v_valor_k * v_porcentaje_tarea);
    -- 1 ítem generado
  END IF;
END IF;

-- DESPUÉS (4.1 - Proyecto de Obra CON arrastre):
IF v_tarea_obra_proyecto THEN
  SET v_tarea_profesional = 'Proyecto de obra de arquitectura';
  SET v_porcentaje_tarea = 0.60;
  
  -- Bucle progresivo por rangos (igual que instalaciones)
  SET v_rango_actual = 1;
  WHILE v_rango_actual <= v_rango_final_numero DO
    -- Cálculo por tramo con coeficientes específicos
    -- N ítems generados (uno por rango atravesado)
  END WHILE;
END IF;
```

**No afectados:**
- Frontend (ya maneja múltiples ítems por tarea)
- API endpoints (sin cambios)
- Tablas de base de datos (sin cambios)

### 3.3 Estimación de Esfuerzo

| Actividad | Horas | Responsable |
|-----------|-------|-------------|
| Análisis de código existente | 1h | Backend Dev |
| Refactor sección 4.1 (Proyecto) | 2h | Backend Dev |
| Refactor sección 4.2 (Dirección) | 2h | Backend Dev |
| Testing manual (5 casos) | 2h | QA |
| Validación con cliente | 1h | PM |
| Deploy y monitoreo | 1h | DevOps |
| **TOTAL** | **9h** | **~1.5 días** |

---

## 4. ESPECIFICACIÓN TÉCNICA

### 4.1 Algoritmo de Arrastre Progresivo

El algoritmo a aplicar es **idéntico** al implementado en instalaciones (4.3-4.7):

**Pseudocódigo:**
```
PARA cada tarea (Proyecto o Dirección):
  rango_actual = A
  
  MIENTRAS rango_actual <= rango_final_obra:
    1. Obtener coeficientes del rango actual
    2. Calcular límites del rango (inferior y superior)
    3. Determinar monto afectado = MIN(valor_obra, lim_superior) - lim_inferior
    4. SI monto_afectado > 0:
       4.1. Generar ítem con coef_obra × monto_afectado × % tarea
       4.2. SI coef_k > 0 Y rango_actual = rango_final:
              Generar ítem con coef_k × valor_k × % tarea
    5. rango_actual++
  FIN MIENTRAS
FIN PARA
```

### 4.2 Estructura de Output (Sin Cambios)

El output mantiene la estructura actual de SPEC-CALC-002:

```json
{
  "detalleHonorarios": [
    {
      "item": 1,
      "tareaCompleta": "Proyecto de obra de arquitectura",
      "tarea": "Proyecto de obra de arquitectura",
      "descripcion": "Rango A (coef 14%)",
      "importe": 43863
    },
    {
      "item": 2,
      "tareaCompleta": "Proyecto de obra de arquitectura",
      "tarea": "Proyecto de obra de arquitectura",
      "descripcion": "Rango B (coef 9.5%)",
      "importe": 141235
    },
    {
      "item": 3,
      "tareaCompleta": "Proyecto de obra de arquitectura",
      "tarea": "Proyecto de obra de arquitectura",
      "descripcion": "Adicional por Remodelación Art. 3.18 (coef 30%)",
      "importe": 55509
    },
    // ... más ítems
  ]
}
```

### 4.3 Lógica de Coeficientes por Rango

**Tabla de Coeficientes (sin cambios):**

```sql
CASE v_rango_actual
  WHEN 1 THEN -- Rango A (0 → 1k)
    SET v_coef_obra = 0.14;
    SET v_coef_k = 0;
    SET v_coef_remodelacion = 0.4;
    
  WHEN 2 THEN -- Rango B (1k → 5k)
    SET v_coef_obra = 0.095;
    SET v_coef_k = 0.03;
    SET v_coef_remodelacion = 0.3;
    
  WHEN 3 THEN -- Rango C (5k → 25k)
    SET v_coef_obra = 0.06;
    SET v_coef_k = 0.13;
    SET v_coef_remodelacion = 0.25;
    
  WHEN 4 THEN -- Rango D (25k → ∞)
    SET v_coef_obra = 0.025;
    SET v_coef_k = 0.4;
    SET v_coef_remodelacion = 0.2;
END CASE;
```

### 4.4 Tratamiento del Adicional por Remodelación

**IMPORTANTE:** El adicional por Remodelación se aplica **sobre el subtotal** de cada rango, manteniendo la lógica actual:

```sql
-- Después de calcular cada ítem por rango
IF v_obra_tipologia = 'Remodelación' THEN
  SET v_item_numero = v_item_numero + 1;
  SET v_importe_item = ROUND(v_coef_remodelacion * v_importe_item);
  SET v_descripcion = CONCAT('Adicional por Remodelación Art. 3.18 (coef ', 
                              CAST((v_coef_remodelacion * 100) AS CHAR), '%)');
  
  CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, 
                              v_tarea_profesional, v_descripcion, v_importe_item);
END IF;
```

---

## 5. CASOS DE PRUEBA

### 5.1 Casos Base

**CASO 1: Obra Rango A - Sin cambios esperados**
```
Valor Obra: $300.000 (Rango A)
valorK: $522.181
Coef K: 0.57

Proyecto de Obra (60%):
- ANTES: 1 ítem → $25.200
- DESPUÉS: 1 ítem → $25.200
- Diferencia: $0
```

**CASO 2: Obra Rango B - Incremento moderado**
```
Valor Obra: $3.000.000 (Rango B)
valorK: $522.181
Coef K: 5.74

Proyecto de Obra (60%):
- ANTES: 2 ítems → $180.399
- DESPUÉS: 3 ítems → $194.497
- Diferencia: +$14.098 (+7.8%)

Dirección de Obra (40%):
- ANTES: 2 ítems → $120.266
- DESPUÉS: 3 ítems → $129.665
- Diferencia: +$9.399 (+7.8%)
```

**CASO 3: Obra Rango C - Incremento significativo**
```
Valor Obra: $10.000.000 (Rango C)
valorK: $522.181
Coef K: 19.15

Proyecto de Obra (60%):
- ANTES: 2 ítems → $641.500
- DESPUÉS: 4 ítems → $696.127
- Diferencia: +$54.627 (+8.5%)
```

**CASO 4: Obra Rango D - Incremento mayor**
```
Valor Obra: $50.000.000 (Rango D)
valorK: $522.181
Coef K: 95.76

Proyecto de Obra (60%):
- ANTES: 2 ítems → $1.882.500
- DESPUÉS: 5 ítems → $2.026.986
- Diferencia: +$144.486 (+7.7%)
```

**CASO 5: Obra con Remodelación**
```
Valor Obra: $3.000.000 (Rango B)
Tipología: Remodelación

Proyecto de Obra (60%):
- ANTES: 3 ítems (base + K + remodelación) → $234.519
- DESPUÉS: 5 ítems (A + adicional + B + adicional + K) → $252.846
- Diferencia: +$18.327 (+7.8%)
```

### 5.2 Casos Extremos

**CASO 6: Obra en límite exacto de rango**
```
Valor Obra: $522.181 (exacto = 1k)
Proyecto de Obra (60%):
- Debe generar 1 ítem Rango A + 0 ítems Rango B
```

**CASO 7: Todas las tareas habilitadas**
```
Proyecto + Dirección + 4 Instalaciones + Estructuras
Verificar que el número de ítems totales sea consistente
```

---

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Funcionales

✅ **CA-001:** Proyecto de Obra (4.1) genera múltiples ítems con arrastre progresivo  
✅ **CA-002:** Dirección de Obra (4.2) genera múltiples ítems con arrastre progresivo  
✅ **CA-003:** El número de ítems generados = número de rangos atravesados  
✅ **CA-004:** Cada ítem muestra correctamente: rango, coeficiente, importe  
✅ **CA-005:** El adicional por Remodelación se aplica sobre cada rango individualmente  
✅ **CA-006:** El total de honorarios coincide con la suma de todos los ítems  
✅ **CA-007:** Los 5 casos de prueba base pasan correctamente  

### 6.2 Técnicos

✅ **CA-008:** Cero errores de SQL Syntax al ejecutar el SP  
✅ **CA-009:** El SP se ejecuta en menos de 500ms para obra estándar  
✅ **CA-010:** El output mantiene compatibilidad con frontend actual  
✅ **CA-011:** Los logs registran correctamente cada ítem generado  

### 6.3 Validación de Negocio

✅ **CA-012:** CPAU valida y aprueba los importes calculados para los 5 casos base  
✅ **CA-013:** El incremento de honorarios está dentro del rango esperado (7-9%)  
✅ **CA-014:** El cambio aplica a TODAS las obras nuevas sin excepciones  

---

## 7. PLAN DE IMPLEMENTACIÓN

### 7.1 Fases

**FASE 1: DESARROLLO (4h)**
- Refactor sección 4.1 (Proyecto de Obra)
- Refactor sección 4.2 (Dirección de Obra)
- Actualizar comentarios y documentación inline

**FASE 2: TESTING (3h)**
- Ejecutar 5 casos base manualmente
- Validar output contra expected results
- Validar integridad de metadata

**FASE 3: VALIDACIÓN Y DEPLOY (2h)**
- Presentar resultados a CPAU para aprobación
- Deploy a producción (sin feature flag necesario)
- Monitoreo post-deploy

### 7.2 Estrategia de Deploy

**Tipo de Deploy:** Reemplazo directo  
**Rollback Plan:** Restaurar versión anterior del SP desde Git  
**Downtime:** 0 segundos (reemplazo atomic de SP)

**Checklist Pre-Deploy:**
- [ ] Backup del SP actual
- [ ] Tests pasando (5 casos base)
- [ ] Aprobación CPAU documentada
- [ ] Frontend testeado con nueva salida

---

## 8. HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambio | Autor |
|-------|---------|--------|-------|
| 22/05/2026 | 1.0 | Creación de SPEC | CPAU - Backend Team |

---

## 9. REFERENCIAS

- **SPEC-CALC-001:** Coeficientes Diferenciados por Instalación
- **SPEC-CALC-002:** Sistema de Arrastre Progresivo (base técnica)
- `Calcular_Honorario_PYDOA.sql` (líneas 150-350)
- Solicitud CPAU: Email 22/05/2026 - Ref: CALC-2026-052

---

**FIN DEL DOCUMENTO**
