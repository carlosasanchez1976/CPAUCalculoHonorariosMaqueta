================================================================================
TICKET #001 - ANÁLISIS Y DISEÑO TÉCNICO
================================================================================
Proyecto: CH2026 - SPEC-CALC-003
Fecha de análisis: 22/05/2026
Analista: Backend Dev
Estado: ✅ COMPLETADO

================================================================================
SECCIÓN 1: ANÁLISIS DEL CÓDIGO ACTUAL
================================================================================

1.1 UBICACIÓN DE SECCIONES EN Calcular_Honorario_PYDOA.sql
─────────────────────────────────────────────────────────────
Líneas 93-180:  PASOS 1-3 (Lectura datos, cálculo límites, determinar rango)
Líneas 182-240: SECCIÓN 4.1 - Proyecto de Obra (SIN arrastre) ⚠️ MODIFICAR
Líneas 241-300: SECCIÓN 4.2 - Dirección de Obra (SIN arrastre) ⚠️ MODIFICAR
Líneas 301-360: SECCIÓN 4.3 - Instalación Sanitaria (CON arrastre) ✅ REFERENCIA
Líneas 361-420: SECCIÓN 4.4 - Instalación Eléctrica (CON arrastre)
Líneas 421-480: SECCIÓN 4.5 - Instalación Contra Incendio (CON arrastre)
Líneas 481-540: SECCIÓN 4.6 - Instalación Termomecánica (CON arrastre)
Líneas 541-600: SECCIÓN 4.7 - Proyecto de Estructuras (CON arrastre)
Líneas 601-620: PASO 5 - Actualizar metadata

1.2 ESTRUCTURA ACTUAL - SECCIÓN 4.1 (Proyecto de Obra - SIN ARRASTRE)
─────────────────────────────────────────────────────────────────────

```sql
-- ANTES DEL IF: Obtiene coeficientes del RANGO FINAL solamente
CASE v_rango_final_numero
  WHEN 1 THEN -- Rango A
    SET v_coef_obra = 0.14;
    SET v_coef_k = 0;
    SET v_coef_remodelacion = 0.4;
  WHEN 2 THEN -- Rango B
    SET v_coef_obra = 0.095;
    SET v_coef_k = 0.03;
    SET v_coef_remodelacion = 0.3;
  WHEN 3 THEN -- Rango C
    SET v_coef_obra = 0.06;
    SET v_coef_k = 0.13;
    SET v_coef_remodelacion = 0.25;
  WHEN 4 THEN -- Rango D
    SET v_coef_obra = 0.025;
    SET v_coef_k = 0.4;
    SET v_coef_remodelacion = 0.2;
END CASE;

IF v_tarea_obra_proyecto THEN
  SET v_tarea_profesional = 'Proyecto de obra de arquitectura';
  SET v_porcentaje_tarea = 0.60;
  
  -- Ítem por coeficiente de obra (CÁLCULO SIMPLE)
  IF v_coef_obra > 0 THEN
    SET v_item_numero = v_item_numero + 1;
    SET v_importe_item = ROUND(v_coef_obra * v_valor_obra * v_porcentaje_tarea);
    ─────────────────────────────────────────────────────────
                                      ↑↑↑↑↑↑↑↑↑↑↑↑↑
                    Usa VALOR TOTAL de obra (sin separar por rangos)
    
    SET v_descripcion = CONCAT('Rango ', v_rango_final, 
                                ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
    
    CALL Calculos_Items_Grabar(...);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;
    
    -- Adicional por Remodelación (sobre el ítem recién calculado)
    IF v_obra_tipologia = 'Remodelación' THEN
      SET v_item_numero = v_item_numero + 1;
      SET v_importe_item = ROUND(v_coef_remodelacion * v_importe_item);
      SET v_descripcion = CONCAT('Adicional por Remodelación Art. 3.18 (coef ', 
                                  CAST((v_coef_remodelacion * 100) AS CHAR), '%)');
      CALL Calculos_Items_Grabar(...);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;
    END IF;
  END IF;
  
  -- Ítem por coeficiente K (CÁLCULO SIMPLE)
  IF v_coef_k > 0 THEN
    SET v_item_numero = v_item_numero + 1;
    SET v_importe_item = ROUND(v_coef_k * v_valor_k * v_porcentaje_tarea);
    SET v_descripcion = CONCAT('Rango ', v_rango_final, 
                                ' (coef K ', CAST((v_coef_k * 100) AS CHAR), '%)');
    CALL Calculos_Items_Grabar(...);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;
  END IF;
END IF;
```

**CARACTERÍSTICAS CLAVE:**
✓ Obtiene coeficientes UNA SOLA VEZ antes del IF (del rango final)
✓ Calcula sobre v_valor_obra completo (no separa por rangos)
✓ Genera 1 ítem por coef_obra + 1 ítem opcional por Remodelación
✓ Genera 1 ítem por coef_k si corresponde
✓ Total ítems: 2-3 (sin Remodelación) o 3-4 (con Remodelación)

1.3 ESTRUCTURA ACTUAL - SECCIÓN 4.2 (Dirección de Obra - SIN ARRASTRE)
───────────────────────────────────────────────────────────────────────

```sql
IF v_tarea_obra_direccion THEN
  SET v_tarea_profesional = 'Dirección de obra de arquitectura';
  SET v_porcentaje_tarea = 0.40;  ← ÚNICA DIFERENCIA con 4.1
  
  -- [RESTO IDÉNTICO A 4.1]
END IF;
```

**CARACTERÍSTICAS CLAVE:**
✓ Estructura 100% idéntica a 4.1
✓ Reutiliza los coeficientes del CASE previo
✓ Solo cambia v_porcentaje_tarea = 0.40 (vs. 0.60 en Proyecto)

1.4 ESTRUCTURA DE REFERENCIA - SECCIÓN 4.3 (Instalación - CON ARRASTRE)
────────────────────────────────────────────────────────────────────────

```sql
IF v_tarea_instalacion_sanitaria THEN
  SET v_tarea_profesional = 'Instalación Sanitaria';
  SET v_porcentaje_tarea = 1.0;
  
  SET v_rango_actual = 1;  ← Inicia en Rango A
  WHILE v_rango_actual <= v_rango_final_numero DO  ← Itera hasta rango final
    
    -- CASE DENTRO DEL BUCLE: obtiene coeficientes de CADA rango
    CASE v_rango_actual
      WHEN 1 THEN
        SET v_rango_nombre = 'A';
        SET v_lim_inferior = 0;
        SET v_lim_superior = v_limite_a_sup;
        SET v_coef_obra = 0.0040;  ← Coef específico de este rango
        SET v_coef_k = 0;
      WHEN 2 THEN
        SET v_rango_nombre = 'B';
        SET v_lim_inferior = v_limite_b_inf;
        SET v_lim_superior = v_limite_b_sup;
        SET v_coef_obra = 0.0014;  ← Coef específico de este rango
        SET v_coef_k = 0;
      -- ... más rangos
    END CASE;
    
    -- Calcular límite superior efectivo (no exceder valor de obra)
    SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, 
                                 v_lim_superior, v_valor_obra);
    
    -- Solo procesar si hay monto afectado en este rango
    IF v_lim_sup_efectivo > v_lim_inferior THEN
      SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
      ─────────────────────────────────────────────────────────────
                          ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
            Calcula PORCIÓN del valor que cae en ESTE rango
      
      IF v_coef_obra > 0 THEN
        SET v_item_numero = v_item_numero + 1;
        SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
        ──────────────────────────────────────────────────────────
                                             ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                       Aplica coef de ESTE rango sobre porción afectada
        
        SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                    ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
        
        CALL Calculos_Items_Grabar(...);
        SET v_total_honorarios = v_total_honorarios + v_importe_item;
      END IF;
    END IF;
    
    -- Control de salida del bucle
    IF v_valor_obra <= v_lim_superior THEN
      SET v_rango_actual = v_rango_final_numero + 1;  ← Forzar salida
    ELSE
      SET v_rango_actual = v_rango_actual + 1;  ← Continuar al siguiente rango
    END IF;
  END WHILE;
END IF;
```

**CARACTERÍSTICAS CLAVE:**
✓ Bucle WHILE que itera desde rango 1 hasta rango final
✓ CASE v_rango_actual DENTRO del bucle (ejecuta varias veces)
✓ Calcula v_monto_afectado específico para cada rango
✓ Genera 1 ítem por cada rango atravesado
✓ Total ítems: N (donde N = número de rangos atravesados)

================================================================================
SECCIÓN 2: COMPARATIVA ESTRUCTURAL
================================================================================

2.1 DIFERENCIAS CLAVE ENTRE SISTEMAS
─────────────────────────────────────

| Aspecto | SIN Arrastre (4.1/4.2) | CON Arrastre (4.3-4.7) |
|---------|------------------------|-------------------------|
| **Ubicación CASE** | ANTES del IF principal | DENTRO del bucle WHILE |
| **Ejecución CASE** | 1 vez (rango final) | N veces (cada rango) |
| **Base de cálculo** | v_valor_obra (total) | v_monto_afectado (porción) |
| **Ítems generados** | 1-2 por tarea | N por tarea (N = rangos) |
| **Coeficientes** | Solo del rango final | De cada rango específico |
| **Complejidad** | Lineal O(1) | Iterativa O(N) |

2.2 FLUJO LÓGICO - SIN ARRASTRE (Actual 4.1/4.2)
─────────────────────────────────────────────────

Obra de $3.000.000 → Rango B (coef K = 5.74)

1. PASO 3: Determina v_rango_final = 'B', v_rango_final_numero = 2
2. CASE v_rango_final_numero: Obtiene coef_obra = 0.095, coef_k = 0.03
3. IF v_tarea_obra_proyecto:
   └─ Calcula: 0.095 × $3.000.000 × 0.60 = $171.000 (Rango B)
   └─ Calcula: 0.03 × $522.181 × 0.60 = $9.399 (Rango B - K)
4. Total: $180.399

ÍTEMS GENERADOS:
- Ítem 1: Proyecto - Rango B (coef 9.5%) → $171.000
- Ítem 2: Proyecto - Rango B (coef K 3%) → $9.399

2.3 FLUJO LÓGICO - CON ARRASTRE (Deseado 4.1/4.2)
──────────────────────────────────────────────────

Obra de $3.000.000 → Rango B (coef K = 5.74)

1. PASO 3: Determina v_rango_final_numero = 2
2. IF v_tarea_obra_proyecto:
   SET v_rango_actual = 1
   
   ITERACIÓN 1 (Rango A):
   ├─ CASE v_rango_actual = 1: coef_obra = 0.14, coef_k = 0
   ├─ Límites: inf = 0, sup = $522.181
   ├─ Monto afectado: $522.181 - 0 = $522.181
   └─ Calcula: 0.14 × $522.181 × 0.60 = $43.863
   
   ITERACIÓN 2 (Rango B):
   ├─ CASE v_rango_actual = 2: coef_obra = 0.095, coef_k = 0.03
   ├─ Límites: inf = $522.181, sup = $2.610.906
   ├─ Monto afectado: $3.000.000 - $522.181 = $2.477.819
   ├─ Calcula: 0.095 × $2.477.819 × 0.60 = $141.235
   └─ Calcula K: 0.03 × $522.181 × 0.60 = $9.399 (solo en rango final)
   
3. Total: $43.863 + $141.235 + $9.399 = $194.497

ÍTEMS GENERADOS:
- Ítem 1: Proyecto - Rango A (coef 14%) → $43.863
- Ítem 2: Proyecto - Rango B (coef 9.5%) → $141.235
- Ítem 3: Proyecto - Rango B (coef K 3%) → $9.399

DIFERENCIA: +$14.098 (+7.8%)

================================================================================
SECCIÓN 3: DISEÑO DEL CAMBIO
================================================================================

3.1 ESTRATEGIA DE REFACTOR
───────────────────────────

✅ OPCIÓN SELECCIONADA: Mover el CASE dentro del IF y agregar bucle WHILE

**Ventajas:**
- Reutiliza estructura probada de instalaciones (4.3-4.7)
- Código consistente en todo el SP
- Mantenimiento simplificado

**Pasos:**
1. Eliminar el CASE v_rango_final_numero que está ANTES de los IFs
2. Dentro de cada IF (4.1 y 4.2):
   a. Agregar bucle WHILE v_rango_actual <= v_rango_final_numero
   b. Mover el CASE v_rango_actual DENTRO del bucle
   c. Adaptar coeficientes de Proyecto/Dirección (usar los actualizados 22/05)
   d. Calcular límites y monto_afectado
   e. Generar ítems por rango
   f. Mantener lógica de Remodelación después de cada ítem de rango

3.2 VALIDACIÓN DE COEFICIENTES (Actualización 22/05/2026)
──────────────────────────────────────────────────────────

✅ CONFIRMADO: Los coeficientes en el SP están actualizados:

| Rango | Coef Obra | Coef K | Coef Remodelación |
|-------|-----------|--------|-------------------|
| A     | 14%       | 0%     | 40%               |
| B     | 9.5%      | 3%     | 30%               |
| C     | 6%        | 13%    | 25%               |
| D     | 2.5%      | 40%    | 20%               |

Estos coeficientes se usarán en el CASE v_rango_actual de cada iteración.

3.3 TRATAMIENTO DEL ADICIONAL POR REMODELACIÓN
───────────────────────────────────────────────

✅ MANTENER LÓGICA ACTUAL: El adicional se aplica DESPUÉS de cada ítem de rango

**Comportamiento deseado:**
```
Obra $3.000.000 Remodelación + Proyecto:

Rango A:
  - Ítem base: 14% × $522.181 × 60% = $43.863
  - Adicional: 40% × $43.863 = $17.545

Rango B:
  - Ítem base: 9.5% × $2.477.819 × 60% = $141.235
  - Adicional: 30% × $141.235 = $42.370

Rango B (K):
  - Ítem K: 3% × $522.181 × 60% = $9.399
  - Sin adicional (solo aplica a coef_obra)

Total: $43.863 + $17.545 + $141.235 + $42.370 + $9.399 = $254.412
```

**Implementación:**
```sql
IF v_coef_obra > 0 THEN
  -- Generar ítem base
  SET v_item_numero = v_item_numero + 1;
  SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
  CALL Calculos_Items_Grabar(...);
  SET v_total_honorarios = v_total_honorarios + v_importe_item;
  
  -- Adicional por Remodelación (guardar importe_item antes de reutilizar variable)
  IF v_obra_tipologia = 'Remodelación' THEN
    SET v_item_numero = v_item_numero + 1;
    SET v_importe_adicional = ROUND(v_coef_remodelacion * v_importe_item);
    -- ⚠️ IMPORTANTE: Necesitamos v_importe_adicional temporal porque v_importe_item se reutiliza
    CALL Calculos_Items_Grabar(..., v_importe_adicional);
    SET v_total_honorarios = v_total_honorarios + v_importe_adicional;
  END IF;
END IF;
```

⚠️ PROBLEMA IDENTIFICADO: El código actual reutiliza v_importe_item:
```sql
SET v_importe_item = ROUND(v_coef_remodelacion * v_importe_item);
```

Esto funciona SOLO si hay un único cálculo. Con arrastre progresivo, necesitamos:
- Variable auxiliar para guardar el importe del adicional
- O calcular el adicional directamente en la llamada

**DECISIÓN:** Calcular directamente sin variable temporal:
```sql
IF v_obra_tipologia = 'Remodelación' THEN
  SET v_item_numero = v_item_numero + 1;
  SET v_importe_adicional_remodelacion = ROUND(v_coef_remodelacion * v_importe_item);
  SET v_descripcion = CONCAT('Adicional por Remodelación Art. 3.18 (coef ', 
                              CAST((v_coef_remodelacion * 100) AS CHAR), '%)');
  CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, 
                              v_descripcion, v_importe_adicional_remodelacion);
  SET v_total_honorarios = v_total_honorarios + v_importe_adicional_remodelacion;
END IF;
```

3.4 VERIFICACIÓN DE VARIABLES DECLARADAS
─────────────────────────────────────────

✅ VARIABLES NECESARIAS (todas ya declaradas en líneas 24-52):

| Variable | Tipo | Uso | Declarada |
|----------|------|-----|-----------|
| v_rango_actual | INT | Iterador del bucle | ✅ Línea 38 |
| v_rango_nombre | VARCHAR(1) | 'A', 'B', 'C', 'D' | ✅ Línea 39 |
| v_lim_inferior | DECIMAL(15,2) | Límite inf del rango | ✅ Línea 40 |
| v_lim_superior | DECIMAL(15,2) | Límite sup del rango | ✅ Línea 41 |
| v_lim_sup_efectivo | DECIMAL(15,2) | MIN(valor_obra, lim_sup) | ✅ Línea 42 |
| v_monto_afectado | DECIMAL(15,2) | Porción en este rango | ✅ Línea 43 |
| v_coef_obra | DECIMAL(6,5) | Coeficiente del rango | ✅ Línea 45 |
| v_coef_k | DECIMAL(6,5) | Coeficiente K | ✅ Línea 46 |
| v_coef_remodelacion | DECIMAL(6,5) | Adicional Remodelación | ✅ Línea 47 |

⚠️ VARIABLE FALTANTE:
| v_importe_adicional_remodelacion | DECIMAL(15,2) | Importe del adicional | ❌ AGREGAR |

**ACCIÓN REQUERIDA:** Declarar nueva variable en la sección de declaraciones:
```sql
DECLARE v_importe_adicional_remodelacion DECIMAL(15,2);
```

3.5 IDENTIFICACIÓN DE POSIBLES CONFLICTOS
──────────────────────────────────────────

⚠️ CONFLICTO #1: CASE v_rango_final_numero duplicado
El CASE actual está ANTES de los IFs 4.1 y 4.2, pero TAMBIÉN se usa
implícitamente en el código. Si movemos el CASE dentro del IF,
debemos ELIMINAR el CASE previo.

**SOLUCIÓN:** Eliminar el CASE que está en líneas ~193-205 (antes de 4.1).

⚠️ CONFLICTO #2: Orden de coeficientes en CASE
Los coeficientes de Proyecto/Dirección son DIFERENTES a los de instalaciones.
Debemos usar los correctos según la modificación del 22/05/2026.

**SOLUCIÓN:** Copiar la estructura del CASE de instalaciones pero con
coeficientes de Proyecto/Dirección (ya validados en sección 3.2).

⚠️ CONFLICTO #3: Coeficiente K solo en rango final
En instalaciones, NO hay coeficiente K. En Proyecto/Dirección, el coef_k
se aplica SOLO en el rango final (no en todos los rangos).

**SOLUCIÓN:** Agregar condición dentro del bucle:
```sql
IF v_coef_k > 0 AND v_rango_actual = v_rango_final_numero THEN
  -- Generar ítem por coef_k
END IF;
```

⚠️ CONFLICTO #4: Límites de rangos ya calculados
Los límites (v_limite_a_sup, v_limite_b_inf, etc.) ya están calculados
en PASO 2 del SP. No necesitamos recalcularlos.

**SOLUCIÓN:** Reutilizar las variables globales calculadas en PASO 2.

================================================================================
SECCIÓN 4: PREPARACIÓN DEL ENTORNO
================================================================================

4.1 BACKUP DEL SP ACTUAL
────────────────────────

✅ ESTRATEGIA: Git commit antes de cualquier cambio

**Acciones:**
1. Verificar que archivo actual está en Git
2. Estado actual: Última modificación 22/05/2026 (coeficientes actualizados)
3. Crear commit antes de implementar Ticket #002

**Comando sugerido para Charly:**
```bash
git status
git add App/Backend/DB/03-Sps/Calcular_Honorario_PYDOA.sql
git commit -m "chore: backup SP antes de implementar SPEC008-CALC-003"
```

⚠️ RECORDATORIO: NO ejecutar git push (según preferencias globales de Charly)

4.2 AMBIENTE DE TESTING
───────────────────────

✅ CASOS BASE A PREPARAR (según SPEC008 Sección 5.1):

| Caso | Valor Obra | Rango | Tareas | Observaciones |
|------|------------|-------|--------|---------------|
| 1 | $300.000 | A | Proyecto | Sin cambios esperados |
| 2 | $3.000.000 | B | Proy + Dir | Incremento ~7.8% |
| 3 | $10.000.000 | C | Proyecto | Incremento ~8.5% |
| 4 | $50.000.000 | D | Proyecto | Incremento ~7.7% |
| 5 | $3.000.000 | B | Proyecto (Remodelación) | Múltiples adicionales |

**Preparación requerida:**
1. Limpiar tabla Calculos_Items
2. Insertar 5 registros en tabla Calculos con valores de prueba
3. Configurar Parametros: valorK = $522.181
4. Verificar coeficientes actualizados en todas las secciones

4.3 ESTRATEGIA DE ROLLBACK
───────────────────────────

✅ PLAN DE ROLLBACK (si hay errores en testing):

**Opción 1: Rollback desde Git (RECOMENDADO)**
1. Verificar que hay commit previo al cambio
2. Restaurar archivo desde Git:
   ```bash
   git checkout HEAD~1 -- App/Backend/DB/03-Sps/Calcular_Honorario_PYDOA.sql
   ```
3. Ejecutar DROP PROCEDURE y recrear desde archivo restaurado

**Opción 2: Backup manual**
1. Copiar contenido actual del SP a archivo temporal
2. Guardar como: Calcular_Honorario_PYDOA.sql.backup.20260522
3. En caso de rollback, restaurar desde backup manual

**Opción 3: Rollback de cambios específicos**
Si solo una sección falla (4.1 o 4.2):
1. Revertir solo esa sección manualmente
2. Mantener el resto del SP sin cambios
3. Re-ejecutar testing solo para esa sección

**DECISIÓN:** Usar Git como fuente de verdad (Opción 1)

================================================================================
SECCIÓN 5: LÍNEAS EXACTAS A MODIFICAR
================================================================================

5.1 SECCIÓN A ELIMINAR
──────────────────────

ELIMINAR: Líneas ~193-205 (CASE v_rango_final_numero)
Motivo: Se moverá DENTRO de los IFs 4.1 y 4.2 como CASE v_rango_actual

```sql
-- ⚠️ ELIMINAR ESTE BLOQUE COMPLETO:
CASE v_rango_final_numero
  WHEN 1 THEN -- Rango A
    SET v_coef_obra = 0.14;
    SET v_coef_k = 0;
    SET v_coef_remodelacion = 0.4;
  WHEN 2 THEN -- Rango B
    SET v_coef_obra = 0.095;
    SET v_coef_k = 0.03;
    SET v_coef_remodelacion = 0.3;
  WHEN 3 THEN -- Rango C
    SET v_coef_obra = 0.06;
    SET v_coef_k = 0.13;
    SET v_coef_remodelacion = 0.25;
  WHEN 4 THEN -- Rango D
    SET v_coef_obra = 0.025;
    SET v_coef_k = 0.4;
    SET v_coef_remodelacion = 0.2;
END CASE;
```

5.2 SECCIÓN 4.1 A REEMPLAZAR
────────────────────────────

REEMPLAZAR: Líneas ~210-240 (todo el IF v_tarea_obra_proyecto)

INICIO: Línea `IF v_tarea_obra_proyecto THEN`
FIN: Línea `END IF;` (correspondiente al IF de Proyecto)

**Estructura nueva:**
- Bucle WHILE con v_rango_actual
- CASE v_rango_actual dentro del bucle
- Cálculo de límites y monto_afectado
- Generación de ítems por rango
- Lógica de Remodelación después de cada ítem de rango
- Coeficiente K solo en rango final

5.3 SECCIÓN 4.2 A REEMPLAZAR
────────────────────────────

REEMPLAZAR: Líneas ~241-271 (todo el IF v_tarea_obra_direccion)

INICIO: Línea `IF v_tarea_obra_direccion THEN`
FIN: Línea `END IF;` (correspondiente al IF de Dirección)

**Estructura nueva:**
- Idéntica a 4.1
- Solo cambia v_porcentaje_tarea = 0.40

5.4 DECLARACIÓN DE VARIABLE NUEVA
──────────────────────────────────

AGREGAR: En sección de declaraciones (líneas 24-52)

```sql
-- Después de la línea:
DECLARE v_coef_remodelacion DECIMAL(6,5);

-- AGREGAR:
DECLARE v_importe_adicional_remodelacion DECIMAL(15,2);
```

================================================================================
SECCIÓN 6: RESUMEN Y RECOMENDACIONES
================================================================================

6.1 RESUMEN DEL ANÁLISIS
────────────────────────

✅ ANÁLISIS COMPLETADO CON ÉXITO

**Hallazgos clave:**
1. El código actual usa cálculo simple sobre valor total (SIN arrastre)
2. La lógica de arrastre progresivo YA EXISTE en secciones 4.3-4.7
3. Los coeficientes están actualizados según modificación 22/05/2026
4. Todas las variables necesarias están declaradas (excepto 1)
5. No hay conflictos mayores identificados

**Complejidad del cambio:**
- 🟢 BAJA: Refactor de código existente y probado
- 🟢 BAJA: Reutilización de estructura de instalaciones
- 🟡 MEDIA: Cuidado con lógica de Remodelación y coef_k

6.2 RIESGOS IDENTIFICADOS
─────────────────────────

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Error de sintaxis SQL | 🟢 Baja | 🔴 Alto | Testing exhaustivo antes de deploy |
| Lógica de Remodelación incorrecta | 🟡 Media | 🟡 Medio | Caso de prueba específico (Caso 5) |
| Coef_k en rango incorrecto | 🟢 Baja | 🟡 Medio | Validar condición AND v_rango_actual = v_rango_final_numero |
| Incremento inesperado de honorarios | 🟢 Baja | 🔴 Alto | Validar con 5 casos base aprobados por CPAU |

6.3 PRÓXIMOS PASOS (Ticket #002)
─────────────────────────────────

✅ PRERREQUISITOS CUMPLIDOS:
- [x] Análisis de código completado
- [x] Diferencias estructurales identificadas
- [x] Coeficientes validados
- [x] Variables verificadas
- [x] Líneas exactas documentadas
- [x] Estrategia de rollback definida

🎯 LISTOS PARA PROCEDER CON:
- Ticket #002: Refactor de sección 4.1 (Proyecto de Obra)
- Estimación: 3 horas
- Complejidad: 🟡 Media

6.4 RECOMENDACIONES FINALES
────────────────────────────

1. ✅ Realizar commit de backup antes de Ticket #002
2. ✅ Implementar sección 4.1 primero, testear, luego 4.2
3. ✅ Validar cada cambio con al menos 2 casos de prueba
4. ✅ Mantener código comentado durante desarrollo
5. ✅ No modificar instalaciones ni estructuras (sin cambios necesarios)

================================================================================
FIN DEL ANÁLISIS - TICKET #001 COMPLETADO ✅
================================================================================
Fecha: 22/05/2026
Tiempo invertido: ~1 hora (estimación cumplida)
Analista: Backend Dev
Aprobado para continuar con Ticket #002: ✅ SÍ

Próximo ticket: TICKET #002 - Refactor Proyecto de Obra (4.1)
