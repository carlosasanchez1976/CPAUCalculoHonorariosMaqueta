DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_PERI$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Peritajes (PERI)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 10.7 de la Resolución CPAU A115
 * Ver Casos de usos de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * PERI: Peritajes
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-04: 
 ******************************************************************************
 * MODIFICACIONES:
 * - 2026-05-22: 
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_PERI(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_valor_en_juego DECIMAL(15,2);
  DECLARE v_desconoce_valor_en_juego BOOLEAN;
  DECLARE v_cant_horas NUMERIC(10,2);
  DECLARE v_hasta_60_km BOOLEAN;

  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_coef_k DECIMAL(10,2);
  DECLARE v_coef_K_a_afectar DECIMAL(6,5);
  DECLARE v_coef_V_a_afectar DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);

  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;

  -- Constantes de cálculo (CPAU 2026 - SPEC-CALC-002)
  DECLARE v_valor_k DECIMAL(15,2);
  



  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================


  SELECT
      COALESCE(calc_valor_num1, 0),
      calc_valor_bol1,
      hasta_60_km,
      COALESCE(horas, 0)
    INTO
      v_valor_en_juego,
      v_desconoce_valor_en_juego,
      v_hasta_60_km,
      v_cant_horas
    FROM
      Calculos
    WHERE
      calculo_id = p_calculo_id;


  SET v_tarea_profesional = 'Peritajes (PERI)'; 
  


  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos


  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS
  -- ========================================================================

  
  IF v_desconoce_valor_en_juego THEN

      -- Lógica específica para Cálculo de Honorarios de Peritajes cuando NO se conoce el valor en juego

    CALL Calcular_Hon_Art_1_13(
      p_calculo_id,
      v_tarea_profesional,
      v_cant_horas, -- Cantidad de horas
      v_hasta_60_km, -- Hasta 60 km
      v_valor_k
    );


  ELSE

    -- Lógica específica para Cálculo de Honorarios de Peritajes cuando se SI conoce el valor en juego

      SET v_coef_k = v_valor_en_juego / v_valor_k;

      -- Determinar el coeficiente a afectar según el coef V / K
      IF v_coef_k <= 0.25 THEN
        SET v_coef_K_a_afectar = 0;
        SET v_coef_V_a_afectar = 0.012;
      ELSEIF v_coef_k <= 1 THEN
        SET v_coef_K_a_afectar = 0.002;
        SET v_coef_V_a_afectar = 0.004;
      ELSEIF v_coef_k <= 2 THEN
        SET v_coef_K_a_afectar = 0.003;
        SET v_coef_V_a_afectar = 0.003;
      ELSE
        SET v_coef_K_a_afectar = 0.009;
        SET v_coef_V_a_afectar = 0.001;
      END IF;
             
      
      SET v_importe_item = ROUND(v_valor_en_juego * v_coef_V_a_afectar);
      SET v_descripcion = CONCAT('Según Art. 10.7 s/valor en juego (coef ', CAST(ROUND(v_coef_V_a_afectar * 100, 2) AS CHAR), '%)'); 
      SET v_item_numero = v_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;

      if v_coef_K_a_afectar > 0 THEN
        SET v_importe_item = ROUND(v_valor_k * v_coef_K_a_afectar);
        SET v_descripcion = CONCAT('Según Art. 10.7 s/valor K (coef ', CAST(ROUND(v_coef_K_a_afectar * 100, 2) AS CHAR), '%)'); 
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        SET v_total_honorarios = v_total_honorarios + v_importe_item;
      END IF;


  END IF;
 
  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = 0,
    metadata_rango_costo_obra = null,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
