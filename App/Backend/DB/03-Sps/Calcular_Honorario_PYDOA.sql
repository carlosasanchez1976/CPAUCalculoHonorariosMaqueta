DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_PYDOA$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Proyecto y Dirección de Obra de Arquitectura (PYDOA)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 * Migrado desde: App/Backend/02-Node/src/utils/calculos/honorariosProgresivo.js
 * 
 * SPEC: SPEC-CALC-002 - Arrastre Progresivo (solo para instalaciones y estructuras)
 * 
 * ALGORITMO:
 * 1. Calcula límites de rangos en pesos según valorK
 * 2. Determina rango final donde cae la obra (A/B/C/D)
 * 3. Proyecto y Dirección: aplica coeficientes del rango final sobre valor total
 * 4. Instalaciones y Estructuras: aplica arrastre progresivo entre rangos
 * 5. Genera ítems separados para coef_obra y coef_k cuando corresponda
 * 6. Aplica coeficiente K solo en el rango final
 * 7. Debe agregar adicional en el caso de tipología de obra = 'Remodelación'
 *
 ******************************************************************************
 * MODIFICACIONES:
 * - 2026-05-19: Se agrega adicionales para 'Remodelación' (CPAU)
 ******************************************************************************
 * - 2026-05-22: Se modifican coeficientes para Proyecto y Dirección según rango (CPAU)
 ******************************************************************************
 * - 2026-05-22: Spec008 - Implementacion de arrastre progresivo para proyecto y dirección (CPAU)
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_PYDOA(
  IN p_calculo_id INT
)

BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_valor_obra DECIMAL(15,2);
  DECLARE v_obra_tipologia VARCHAR(50);
  DECLARE v_tarea_obra_proyecto BOOLEAN;
  DECLARE v_tarea_obra_direccion BOOLEAN;
  DECLARE v_tarea_instalacion_sanitaria BOOLEAN;
  DECLARE v_tarea_instalacion_electrica BOOLEAN;
  DECLARE v_tarea_instalacion_contra_incendio BOOLEAN;
  DECLARE v_tarea_instalacion_termomecanica BOOLEAN;
  DECLARE v_tarea_proyecto_estructuras BOOLEAN;
  
  -- Constantes de cálculo (CPAU 2026 - SPEC-CALC-002)
  DECLARE v_valor_k DECIMAL(15,2);
  
  -- Variables de rango
  DECLARE v_coeficiente_k DECIMAL(10,4);
  DECLARE v_rango_final VARCHAR(1);
  DECLARE v_rango_final_numero INT; -- 1=A, 2=B, 3=C, 4=D
  
  -- Límites de rangos en pesos (SPEC-CALC-002)
  DECLARE v_limite_a_sup DECIMAL(15,2);
  DECLARE v_limite_b_inf DECIMAL(15,2);
  DECLARE v_limite_b_sup DECIMAL(15,2);
  DECLARE v_limite_c_inf DECIMAL(15,2);
  DECLARE v_limite_c_sup DECIMAL(15,2);
  DECLARE v_limite_d_inf DECIMAL(15,2);
  
  -- Variables de iteración por rangos
  DECLARE v_rango_actual INT DEFAULT 1;
  DECLARE v_rango_nombre VARCHAR(1);
  DECLARE v_lim_inferior DECIMAL(15,2);
  DECLARE v_lim_superior DECIMAL(15,2);
  DECLARE v_lim_sup_efectivo DECIMAL(15,2);
  DECLARE v_monto_afectado DECIMAL(15,2);
  
  -- Coeficientes según rango
  DECLARE v_coef_obra DECIMAL(6,5);
  DECLARE v_coef_k DECIMAL(6,5);
  DECLARE v_coef_remodelacion DECIMAL(6,5);
  
  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_importe_adicional_remodelacion DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);
  DECLARE v_porcentaje_tarea DECIMAL(4,2);
  
  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;
  
  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================
  
  SELECT 
    obra_valor_obra,
    obra_tipologia,
    tarea_obra_proyecto,
    tarea_obra_direccion,
    tarea_instalacion_sanitaria,
    tarea_instalacion_electrica,
    tarea_instalacion_contra_incendio,
    tarea_instalacion_termomecanica,
    tarea_proyecto_estructuras
  INTO
    v_valor_obra,
    v_obra_tipologia,
    v_tarea_obra_proyecto,
    v_tarea_obra_direccion,
    v_tarea_instalacion_sanitaria,
    v_tarea_instalacion_electrica,
    v_tarea_instalacion_contra_incendio,
    v_tarea_instalacion_termomecanica,
    v_tarea_proyecto_estructuras
  FROM Calculos
  WHERE calculo_id = p_calculo_id;
  
  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos



  -- ========================================================================
  -- PASO 2: CALCULAR LÍMITES DE RANGOS EN PESOS (SPEC-CALC-002)
  -- ========================================================================
  
  -- Rango A: 0 → 1k
  SET v_limite_a_sup = 1 * v_valor_k;
  
  -- Rango B: 1k → 5k
  SET v_limite_b_inf = v_limite_a_sup;
  SET v_limite_b_sup = 5 * v_valor_k;
  
  -- Rango C: 5k → 25k
  SET v_limite_c_inf = v_limite_b_sup;
  SET v_limite_c_sup = 25 * v_valor_k;
  
  -- Rango D: 25k → ∞
  SET v_limite_d_inf = v_limite_c_sup;
  
  -- ========================================================================
  -- PASO 3: DETERMINAR RANGO FINAL (donde cae la obra)
  -- ========================================================================
  
  SET v_coeficiente_k = v_valor_obra / v_valor_k;
  
  IF v_coeficiente_k < 1 THEN
    SET v_rango_final = 'A';
    SET v_rango_final_numero = 1;
  ELSEIF v_coeficiente_k < 5 THEN
    SET v_rango_final = 'B';
    SET v_rango_final_numero = 2;
  ELSEIF v_coeficiente_k < 25 THEN
    SET v_rango_final = 'C';
    SET v_rango_final_numero = 3;
  ELSE
    SET v_rango_final = 'D';
    SET v_rango_final_numero = 4;
  END IF;
  
  -- ========================================================================
  -- PASO 4: CALCULAR HONORARIOS POR TAREA - SISTEMA PROGRESIVO
  -- ========================================================================
  
  -- -----------------------------------------------------------------------
  -- 4.1 PROYECTO DE OBRA (60% del coeficiente) - CON ARRASTRE PROGRESIVO
  -- SPEC-CALC-003: Arrastre progresivo entre rangos
  -- -----------------------------------------------------------------------
  
  IF v_tarea_obra_proyecto THEN
    SET v_tarea_profesional = 'Proyecto de obra de arquitectura';
    SET v_porcentaje_tarea = 0.60;
    
    -- Bucle progresivo: itera desde Rango A hasta el rango final donde cae la obra
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      -- Obtener coeficientes específicos de este rango
      CASE v_rango_actual
        WHEN 1 THEN -- Rango A
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.14;
          SET v_coef_k = 0;
          SET v_coef_remodelacion = 0.4;
        WHEN 2 THEN -- Rango B
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.095;
          SET v_coef_k = 0.03;
          SET v_coef_remodelacion = 0.3;
        WHEN 3 THEN -- Rango C
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.06;
          SET v_coef_k = 0.13;
          SET v_coef_remodelacion = 0.25;
        WHEN 4 THEN -- Rango D
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.025;
          SET v_coef_k = 0.4;
          SET v_coef_remodelacion = 0.2;
      END CASE;
      
      -- Calcular límite superior efectivo (no exceder valor de obra)
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      -- Solo procesar si hay monto afectado en este rango
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        -- Ítem por coeficiente de obra (porción que cae en este rango)
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
          
          -- Adicional por Remodelación (se aplica sobre cada ítem de rango)
          IF v_obra_tipologia = 'Remodelación' THEN
            SET v_item_numero = v_item_numero + 1;
            SET v_importe_adicional_remodelacion = ROUND(v_coef_remodelacion * v_importe_item);
            SET v_descripcion = CONCAT('Adicional por Remodelación Art. 3.18 (coef ', 
                                        CAST((v_coef_remodelacion * 100) AS CHAR), '%)');
            
            CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, 
                                        v_descripcion, v_importe_adicional_remodelacion);
            
            SET v_total_honorarios = v_total_honorarios + v_importe_adicional_remodelacion;
          END IF;
        END IF;
        
        -- Ítem por coeficiente K (solo en rango final)
        IF v_coef_k > 0 AND v_rango_actual = v_rango_final_numero THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_k * v_valor_k * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef K ', CAST((v_coef_k * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      -- Control de salida del bucle
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1; -- Forzar salida
      ELSE
        SET v_rango_actual = v_rango_actual + 1; -- Continuar al siguiente rango
      END IF;
    END WHILE;
  END IF;
  
  -- -----------------------------------------------------------------------
  -- 4.2 DIRECCIÓN DE OBRA (40% del coeficiente) - CON ARRASTRE PROGRESIVO
  -- SPEC-CALC-003: Arrastre progresivo entre rangos
  -- -----------------------------------------------------------------------
  
  IF v_tarea_obra_direccion THEN
    SET v_tarea_profesional = 'Dirección de obra de arquitectura';
    SET v_porcentaje_tarea = 0.40;
    
    -- Bucle progresivo: itera desde Rango A hasta el rango final donde cae la obra
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      -- Obtener coeficientes específicos de este rango
      CASE v_rango_actual
        WHEN 1 THEN -- Rango A
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.14;
          SET v_coef_k = 0;
          SET v_coef_remodelacion = 0.4;
        WHEN 2 THEN -- Rango B
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.095;
          SET v_coef_k = 0.03;
          SET v_coef_remodelacion = 0.3;
        WHEN 3 THEN -- Rango C
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.06;
          SET v_coef_k = 0.13;
          SET v_coef_remodelacion = 0.25;
        WHEN 4 THEN -- Rango D
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.025;
          SET v_coef_k = 0.4;
          SET v_coef_remodelacion = 0.2;
      END CASE;
      
      -- Calcular límite superior efectivo (no exceder valor de obra)
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      -- Solo procesar si hay monto afectado en este rango
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        -- Ítem por coeficiente de obra (porción que cae en este rango)
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
          
          -- Adicional por Remodelación (se aplica sobre cada ítem de rango)
          IF v_obra_tipologia = 'Remodelación' THEN
            SET v_item_numero = v_item_numero + 1;
            SET v_importe_adicional_remodelacion = ROUND(v_coef_remodelacion * v_importe_item);
            SET v_descripcion = CONCAT('Adicional por Remodelación Art. 3.18 (coef ', 
                                        CAST((v_coef_remodelacion * 100) AS CHAR), '%)');
            
            CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, 
                                        v_descripcion, v_importe_adicional_remodelacion);
            
            SET v_total_honorarios = v_total_honorarios + v_importe_adicional_remodelacion;
          END IF;
        END IF;
        
        -- Ítem por coeficiente K (solo en rango final)
        IF v_coef_k > 0 AND v_rango_actual = v_rango_final_numero THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_k * v_valor_k * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef K ', CAST((v_coef_k * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      -- Control de salida del bucle
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1; -- Forzar salida
      ELSE
        SET v_rango_actual = v_rango_actual + 1; -- Continuar al siguiente rango
      END IF;
    END WHILE;
  END IF;
  
  -- -----------------------------------------------------------------------
  -- 4.3 INSTALACIÓN SANITARIA (100%) - ARRASTRE PROGRESIVO
  -- Coeficientes SPEC-CALC-001 (diferenciados por instalación)
  -- -----------------------------------------------------------------------
  IF v_tarea_instalacion_sanitaria THEN
    SET v_tarea_profesional = 'Instalación Sanitaria';
    SET v_porcentaje_tarea = 1.0;
    
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      CASE v_rango_actual
        WHEN 1 THEN
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.0040; -- SPEC-CALC-001
          SET v_coef_k = 0;
        WHEN 2 THEN
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.0014;
          SET v_coef_k = 0;
        WHEN 3 THEN
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.0012;
          SET v_coef_k = 0;
        WHEN 4 THEN
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.0005;
          SET v_coef_k = 0;
      END CASE;
      
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1;
      ELSE
        SET v_rango_actual = v_rango_actual + 1;
      END IF;
    END WHILE;
  END IF;
  
  -- -----------------------------------------------------------------------
  -- 4.4 INSTALACIÓN ELÉCTRICA (100%) - ARRASTRE PROGRESIVO
  -- Coeficientes iguales a Sanitaria (SPEC-CALC-001)
  -- -----------------------------------------------------------------------
  IF v_tarea_instalacion_electrica THEN
    SET v_tarea_profesional = 'Instalación Eléctrica';
    SET v_porcentaje_tarea = 1.0;
    
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      CASE v_rango_actual
        WHEN 1 THEN
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.0040;
          SET v_coef_k = 0;
        WHEN 2 THEN
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.0014;
          SET v_coef_k = 0;
        WHEN 3 THEN
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.0012;
          SET v_coef_k = 0;
        WHEN 4 THEN
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.0005;
          SET v_coef_k = 0;
      END CASE;
      
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1;
      ELSE
        SET v_rango_actual = v_rango_actual + 1;
      END IF;
    END WHILE;
  END IF;
  
  -- -----------------------------------------------------------------------
  -- 4.5 INSTALACIÓN CONTRA INCENDIO (100%) - ARRASTRE PROGRESIVO
  -- Coeficientes propios (SPEC-CALC-001)
  -- -----------------------------------------------------------------------
  IF v_tarea_instalacion_contra_incendio THEN
    SET v_tarea_profesional = 'Instalación Contra Incendio';
    SET v_porcentaje_tarea = 1.0;
    
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      CASE v_rango_actual
        WHEN 1 THEN
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.0010; -- SPEC-CALC-001
          SET v_coef_k = 0;
        WHEN 2 THEN
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.0007;
          SET v_coef_k = 0;
        WHEN 3 THEN
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.0006;
          SET v_coef_k = 0;
        WHEN 4 THEN
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.00025;
          SET v_coef_k = 0;
      END CASE;
      
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1;
      ELSE
        SET v_rango_actual = v_rango_actual + 1;
      END IF;
    END WHILE;
  END IF;
  
  -- -----------------------------------------------------------------------
  -- 4.6 INSTALACIÓN TERMOMECÁNICA (100%) - ARRASTRE PROGRESIVO
  -- Coeficientes iguales a Contra Incendio (SPEC-CALC-001)
  -- -----------------------------------------------------------------------
  IF v_tarea_instalacion_termomecanica THEN
    SET v_tarea_profesional = 'Instalación Termomecánica';
    SET v_porcentaje_tarea = 1.0;
    
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      CASE v_rango_actual
        WHEN 1 THEN
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.0010;
          SET v_coef_k = 0;
        WHEN 2 THEN
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.0007;
          SET v_coef_k = 0;
        WHEN 3 THEN
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.0006;
          SET v_coef_k = 0;
        WHEN 4 THEN
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.00025;
          SET v_coef_k = 0;
      END CASE;
      
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1;
      ELSE
        SET v_rango_actual = v_rango_actual + 1;
      END IF;
    END WHILE;
  END IF;
  
  -- -----------------------------------------------------------------------
  -- 4.7 PROYECTO DE ESTRUCTURAS (100%) - ARRASTRE PROGRESIVO
  -- Coeficientes específicos (SPEC-CALC-001)
  -- -----------------------------------------------------------------------
  IF v_tarea_proyecto_estructuras THEN
    SET v_tarea_profesional = 'Proyecto de Estructuras';
    SET v_porcentaje_tarea = 1.0;
    
    SET v_rango_actual = 1;
    WHILE v_rango_actual <= v_rango_final_numero DO
      
      CASE v_rango_actual
        WHEN 1 THEN
          SET v_rango_nombre = 'A';
          SET v_lim_inferior = 0;
          SET v_lim_superior = v_limite_a_sup;
          SET v_coef_obra = 0.0060; -- SPEC-CALC-001
          SET v_coef_k = 0;
        WHEN 2 THEN
          SET v_rango_nombre = 'B';
          SET v_lim_inferior = v_limite_b_inf;
          SET v_lim_superior = v_limite_b_sup;
          SET v_coef_obra = 0.0028;
          SET v_coef_k = 0;
        WHEN 3 THEN
          SET v_rango_nombre = 'C';
          SET v_lim_inferior = v_limite_c_inf;
          SET v_lim_superior = v_limite_c_sup;
          SET v_coef_obra = 0.0021;
          SET v_coef_k = 0;
        WHEN 4 THEN
          SET v_rango_nombre = 'D';
          SET v_lim_inferior = v_limite_d_inf;
          SET v_lim_superior = 999999999999.99;
          SET v_coef_obra = 0.0016;
          SET v_coef_k = 0;
      END CASE;
      
      SET v_lim_sup_efectivo = IF(v_valor_obra > v_lim_superior, v_lim_superior, v_valor_obra);
      
      IF v_lim_sup_efectivo > v_lim_inferior THEN
        SET v_monto_afectado = v_lim_sup_efectivo - v_lim_inferior;
        
        IF v_coef_obra > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_importe_item = ROUND(v_coef_obra * v_monto_afectado * v_porcentaje_tarea);
          SET v_descripcion = CONCAT('Rango ', v_rango_nombre, 
                                      ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
          
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          
          SET v_total_honorarios = v_total_honorarios + v_importe_item;
        END IF;
      END IF;
      
      IF v_valor_obra <= v_lim_superior THEN
        SET v_rango_actual = v_rango_final_numero + 1;
      ELSE
        SET v_rango_actual = v_rango_actual + 1;
      END IF;
    END WHILE;
  END IF;
  
  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_rango = v_rango_final,
    metadata_valor_k = v_valor_k,
    metadata_rango_costo_obra = v_coeficiente_k,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END$$

DELIMITER ;
