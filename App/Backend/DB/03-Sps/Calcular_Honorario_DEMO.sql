DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_DEMO$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Demoliciones (DEMO)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 5 de la Resolución CPAU A115
 * Tareas Profesionales posibles:
 * Proyecto y Dirección Art 5.2
 * Proyecto de obra Art 5.3
 *    - Documentación de proyecto = 30 % del art 5.2
 *    - Dirección de obra = 70 % del art 5.2
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-11-12: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_DEMO(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
-- Contiene el código de tarea profesinal a realizar
--
      
  -- Coeficientes según rango
  DECLARE v_tarea_obra_proyecto BOOLEAN;
  DECLARE v_tarea_obra_direccion BOOLEAN;

  DECLARE v_coef_F1 DECIMAL(6,5);
  DECLARE v_coef_F2 DECIMAL(6,5);
  DECLARE v_coef_F3 DECIMAL(6,5);
  DECLARE v_coef_F4 DECIMAL(6,5);
  DECLARE v_coef_F5 DECIMAL(6,5);

  declare v_texto_F1 VARCHAR(255);
  declare v_texto_F2 VARCHAR(255);
  declare v_texto_F3 VARCHAR(255);
  declare v_texto_F4 VARCHAR(255);
  declare v_texto_F5 VARCHAR(255);

  declare v_obra_cant_plantas INT;
  declare v_obra_cant_plantas_iguales INT;

  declare v_obra_valor_obra DECIMAL(15,2);
    
  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);

  DECLARE v_valor_Hb DECIMAL(15,2);
  DECLARE v_valor_Ht DECIMAL(15,2);
      
  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;
    
  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================

  SELECT 
    tarea_obra_proyecto,
    tarea_obra_direccion,
    calc_valor_num1,
    calc_valor_num2,
    calc_valor_num3,
    calc_valor_num4,
    calc_valor_num5,
    calc_valor_str1,
    calc_valor_str2,
    calc_valor_str3,
    calc_valor_str4,
    calc_valor_str5,
    obra_valor_obra,
    obra_superficie,
    horas
  INTO
    v_tarea_obra_proyecto,
    v_tarea_obra_direccion,
    v_coef_F1,
    v_coef_F2,
    v_coef_F3,
    v_coef_F4,
    v_coef_F5,
    v_texto_F1,
    v_texto_F2,
    v_texto_F3,
    v_texto_F4,
    v_texto_F5,
    v_obra_valor_obra,
    v_obra_cant_plantas,
    v_obra_cant_plantas_iguales
  FROM Calculos
  WHERE calculo_id = p_calculo_id;
  

  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS TOTAL ART 5.2
  -- ========================================================================

  SET v_valor_Hb = 0.015;
  SET v_valor_Ht = v_obra_valor_obra * v_valor_Hb * v_coef_F1 * v_coef_F2 * v_coef_F3 * v_coef_F4 * v_coef_F5;


  -- ========================================================================
  -- PASO 3: CALCULAR REDUCCION POR PLANTAS IGUYALES SEGUN ART. 5.2.2
  -- ========================================================================

  IF v_obra_cant_plantas_iguales > 6 THEN
    SET v_valor_Ht = v_valor_Ht * (v_obra_cant_plantas + 6 - v_obra_cant_plantas_iguales) / v_obra_cant_plantas ; -- Aplicar reducción según fórmula del Art. 5.2.2
  END IF;

  -- ========================================================================
  -- PASO 4: GENERAR ITEMS DE HONORARIOS
  -- ========================================================================

  IF v_tarea_obra_proyecto = 1 THEN
    SET v_tarea_profesional = 'Proyecto de Obra';

    SET v_importe_item = ROUND(v_valor_Ht * 0.3);
    

    SET v_descripcion = 'Honorarios por proyecto Art. 5.3 (30% del total Art 5.2)';
    SET v_item_numero = v_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;
  END IF;


  IF v_tarea_obra_direccion = 1 THEN
    SET v_tarea_profesional = 'Dirección de Obra';

    SET v_importe_item = ROUND(v_valor_Ht * 0.7);
  
    SET v_descripcion = 'Honorarios por dirección Art. 5.3 (70% del total Art 5.2)';
    SET v_item_numero = v_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;
  END IF;


  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = v_valor_Ht,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
