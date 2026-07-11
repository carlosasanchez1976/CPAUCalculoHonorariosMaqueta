DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_MEDPLAN$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Medición y ejecución de Planos (MEDPLAN)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 3.21 de la Resolución CPAU A115
 * Ver Casos de usos de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * MPTER: Medición, nivelación del Terreno y ejecución de Planos
 * MPCON: Medición y/o replanteo de Construcciones y ejecución de Planos
 * MPEST: Medición de Estructuras o Instalaciones
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-06: 
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
CREATE PROCEDURE Calcular_Honorario_MEDPLAN(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
  DECLARE v_obra_tipologia VARCHAR(50);
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_total_horas DECIMAL(6,2);
  DECLARE v_hasta_60_km BOOLEAN;
  DECLARE v_bol1 BOOLEAN;
  DECLARE v_bol2 BOOLEAN;
  DECLARE v_bol3 BOOLEAN;
  DECLARE v_sup1 DECIMAL(15,2);
  DECLARE v_sup2 DECIMAL(15,2);
  DECLARE v_sup3 DECIMAL(15,2);
  
  declare v_valor_k DECIMAL(15,2);
  DECLARE v_coef_sup_k_a_afec DECIMAL(8,7);
  DECLARE v_coef_k_a_afec DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);

  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2);
  DECLARE v_solo_calculo BOOLEAN;



  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================


  SELECT
      obra_tipologia,
      calc_valor_str1,
      COALESCE(horas, 0),
      hasta_60_km,
      calc_valor_bol1,
      calc_valor_bol2,
      calc_valor_bol3,
      calc_valor_num1,
      calc_valor_num2,
      calc_valor_num3
    INTO
      v_obra_tipologia,
      v_descripcion_servicio,
      v_total_horas,
      v_hasta_60_km,
      v_bol1,
      v_bol2,
      v_bol3,
      v_sup1,
      v_sup2,
      v_sup3
    FROM
      Calculos
    WHERE
      calculo_id = p_calculo_id;

  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos



  SET v_tarea_profesional = 'Medición y ejecución de Planos Art. 3.21'; 
  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_obra_tipologia; -- Si no se especifica descripción, usar la tipología de obra
  END IF;



  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- MEDPLAN 
  -- ========================================================================

   
  -- CALCULAR PARA 'MPTER'
  -- Según Artículo 3.21.1 de la Resolución CPAU A115

  IF v_obra_tipologia = 'MPTER' or v_obra_tipologia = 'MPEST' THEN
      -- Lógica específica para MPTER
      -- Art 3.21.1 Terrenos y ejecución de Planos
      -- Art 3.21.3 Estructuras e instalaciones

      SET v_total_honorarios = 0;

      IF v_obra_tipologia = 'MPTER' THEN
        SET v_descripcion = 'Art. 3.21.1 ';
        ELSE
          SET v_descripcion = 'Art. 3.21.3 ';
      END IF;
      

      CALL Calcular_Hon_Art_1_13(
        p_calculo_id,
        v_tarea_profesional,
        v_total_horas, -- Cantidad de horas
        v_hasta_60_km, -- Hasta 60 km
        v_valor_k,
        v_descripcion,
        false,
        v_item_numero,
        v_total_honorarios
      );
     
      IF v_obra_tipologia = 'MPTER' THEN

        -- Agregar el 50% según Art 3.21.1
        SET v_importe_item = v_total_honorarios * 0.50; -- 50% sobre Art. 3.21.1
        SET v_descripcion = 'Adic. según Art. 3.21.1 (50%) sobre Art. 1.13'; 
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios

      END IF;


  END IF;


  IF v_obra_tipologia = 'MPCON' THEN
      -- Lógica específica para MPCON
      -- Art 3.21.2 Construcciones y ejecución de Planos

      SET v_descripcion = 'Art. 3.21.2 ';

      IF v_bol1 THEN
        SET v_descripcion = CONCAT(v_descripcion, '- Medición de construcción existente para determinar la superficie cubierta');

        -- Determinar coeficiente de afectación según Art. 3.21.2 según rango de superficie
        if v_sup1 <= 50 then
          SET v_coef_sup_k_a_afec = 0.000006;
          SET v_coef_k_a_afec = 0;
          ELSEIF v_sup1 <= 500 then
            SET v_coef_sup_k_a_afec = 0.000002;
            SET v_coef_k_a_afec = 0.0002;
          ELSEIF v_sup1 <= 2500 then
            SET v_coef_sup_k_a_afec = 0.000001;
            SET v_coef_k_a_afec = 0.0005;
          ELSE
            SET v_coef_sup_k_a_afec = 0.0000005;
            SET v_coef_k_a_afec = 0.00195;
        END IF;


        SET v_importe_item = v_sup1 * v_coef_sup_k_a_afec * v_valor_k;
        IF v_importe_item  > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_descripcion = CONCAT(v_descripcion, '- coef. sup. ', CAST(ROUND(v_coef_sup_k_a_afec * 100, 4) AS CHAR), ' por m2 (', v_sup1, ' m2) por valorK');
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios
        END IF;

        set v_importe_item = ROUND(v_coef_k_a_afec * v_valor_k);
        IF v_importe_item > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_descripcion = CONCAT('coef. k ', CAST(ROUND(v_coef_k_a_afec * 100, 4) AS CHAR), '% sobre valorK');
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
        END IF;

      END IF;
 

      IF v_bol2 THEN
        SET v_descripcion = CONCAT(v_descripcion, '- Medición de construcción existente POCO compartimentada c/ejec. de planos');

        -- Determinar coeficiente de afectación según Art. 3.21.2 según rango de superficie
        if v_sup1 <= 50 then
          SET v_coef_sup_k_a_afec = 0.000010;
          SET v_coef_k_a_afec = 0;
          ELSEIF v_sup1 <= 500 then
            SET v_coef_sup_k_a_afec = 0.000004;
            SET v_coef_k_a_afec = 0.0003;
          ELSEIF v_sup1 <= 2500 then
            SET v_coef_sup_k_a_afec = 0.000002;
            SET v_coef_k_a_afec = 0.0013;
          ELSE
            SET v_coef_sup_k_a_afec = 0.0000001;
            SET v_coef_k_a_afec = 0.00038;
        END IF;


        SET v_importe_item = v_sup2 * v_coef_sup_k_a_afec * v_valor_k;
        IF v_importe_item  > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_descripcion = CONCAT(v_descripcion, '- coef. sup. ', CAST(ROUND(v_coef_sup_k_a_afec * 100, 4) AS CHAR), ' por m2 (', v_sup2, ' m2) por valorK');
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios
        END IF;

        set v_importe_item = ROUND(v_coef_k_a_afec * v_valor_k);
        IF v_importe_item > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_descripcion = CONCAT('coef. k ', CAST(ROUND(v_coef_k_a_afec * 100, 4) AS CHAR), '% sobre valorK');
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
        END IF;

      END IF;

      IF v_bol3 THEN
        SET v_descripcion = CONCAT(v_descripcion, '- Medición de construcción existente MUY compartimentada c/ejec. de planos');

        -- Determinar coeficiente de afectación según Art. 3.21.2 según rango de superficie
        if v_sup1 <= 50 then
          SET v_coef_sup_k_a_afec = 0.000012;
          SET v_coef_k_a_afec = 0;
          ELSEIF v_sup1 <= 500 then
            SET v_coef_sup_k_a_afec = 0.000006;
            SET v_coef_k_a_afec = 0.0003;
          ELSEIF v_sup1 <= 2500 then
            SET v_coef_sup_k_a_afec = 0.000003;
            SET v_coef_k_a_afec = 0.0018;
          ELSE
            SET v_coef_sup_k_a_afec = 0.00000015;
            SET v_coef_k_a_afec = 0.00555;
        END IF;


        SET v_importe_item = v_sup3 * v_coef_sup_k_a_afec * v_valor_k;
        IF v_importe_item  > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_descripcion = CONCAT(v_descripcion, '- coef. sup. ', CAST(ROUND(v_coef_sup_k_a_afec * 100, 4) AS CHAR), ' por m2 (', v_sup3, ' m2) por valorK');
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios
        END IF;

        set v_importe_item = ROUND(v_coef_k_a_afec * v_valor_k);
        IF v_importe_item > 0 THEN
          SET v_item_numero = v_item_numero + 1;
          SET v_descripcion = CONCAT('coef. k ', CAST(ROUND(v_coef_k_a_afec * 100, 4) AS CHAR), '% sobre valorK');
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
        END IF;

       END IF;
  END IF;

  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = v_valor_k,
    metadata_rango_costo_obra = null,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
