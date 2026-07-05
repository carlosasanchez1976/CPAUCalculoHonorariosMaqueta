DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_GPYC$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Gerencia de proyectos y construcciones (GPYC)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 9 de la Resolución CPAU A115
 * Ver Casos de usos de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * GERPRO: Gerencia de Proyectos
 * GERCON: Gerencia de Construcciones
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
CREATE PROCEDURE Calcular_Honorario_GPYC(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_valor_obra DECIMAL(15,2);
  DECLARE v_obra_tipologia VARCHAR(50);
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_total_honor_gerenciados DECIMAL(15,2);
  DECLARE v_incluye_trabajos_adm BOOLEAN;
  DECLARE v_total_honor_proy_manager DECIMAL(15,2);
  DECLARE v_total_honor_proy_direccion DECIMAL(15,2);
  DECLARE v_total_trabajos_adm DECIMAL(15,2);


  DECLARE v_coef_a_afectar DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);

  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;



  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================


  SELECT
      obra_tipologia,
      calc_valor_str1,
      COALESCE(obra_valor_obra, 0),
      calc_valor_bol1,
      COALESCE(calc_valor_num1, 0),
      COALESCE(calc_valor_num2, 0),
      COALESCE(calc_valor_num3, 0)
    INTO
      v_obra_tipologia,
      v_descripcion_servicio,
      v_total_honor_gerenciados,
      v_incluye_trabajos_adm,
      v_total_honor_proy_manager,
      v_total_honor_proy_direccion,
      v_total_trabajos_adm
    FROM
      Calculos
    WHERE
      calculo_id = p_calculo_id;


  SET v_tarea_profesional = 'Gerencia de Proyectos y Construcciones (GPYC)'; 
  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_obra_tipologia; -- Si no se especifica descripción, usar la tipología de obra
  END IF;


 


  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- GERPRO 
  -- ========================================================================

  SET v_coef_a_afectar = 0.15;

  -- CALCULAR PARA 'GERPRO'
  IF v_obra_tipologia = 'GERPRO' THEN

      -- Lógica específica para GERPRO

    -- ========================================================================
      -- PASO 3: DETERMINAR RANGO FINAL (donde cae la obra)
      -- ========================================================================
      
      
                
      
      SET v_importe_item = ROUND(v_coef_a_afectar * v_total_honor_gerenciados);
      

      SET v_descripcion = CONCAT('Gerencia de proyectos (coef ', CAST(ROUND(v_coef_a_afectar * 100) AS CHAR), '%)'); 

      SET v_item_numero = v_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;


    ELSE

      -- Lógica para GERCON

      SET v_importe_item = ROUND(v_coef_a_afectar * v_total_honor_proy_manager);
      SET v_descripcion = CONCAT('Sobre los Honorarios del profesional a cargo del proyecto (coef ', CAST(ROUND(v_coef_a_afectar * 100) AS CHAR), '%)');
      SET v_item_numero = v_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;


      SET v_importe_item = ROUND(v_coef_a_afectar * v_total_honor_proy_direccion);
      SET v_descripcion = CONCAT('Sobre los Honorarios del profesional a cargo de la dirección (coef ', CAST(ROUND(v_coef_a_afectar * 100) AS CHAR), '%)');
      SET v_item_numero = v_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;

      if v_incluye_trabajos_adm = 1 THEN
        -- Si se incluyen trabajos administrativos, calcular el ítem correspondiente
        SET v_coef_a_afectar = 0.10;
        SET v_importe_item = ROUND(v_coef_a_afectar * v_total_trabajos_adm);
        SET v_descripcion = CONCAT('Sobre el monto de los trabajos administrativos (coef ', CAST(ROUND(v_coef_a_afectar * 100) AS CHAR), '%)');
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
