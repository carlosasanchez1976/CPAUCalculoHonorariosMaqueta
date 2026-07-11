DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_HYS$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Higiene y Seguridad (HYS)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 6 de la Resolución CPAU A115
 * Ver Casos de usos de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * GERPRO: Gerencia de Proyectos
 * GERCON: Gerencia de Construcciones
 * HYS: Higiene y Seguridad
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-03: 
 ******************************************************************************
 * MODIFICACIONES:
 * - 2026-07-05: Se agregan parametros INOUT p_descripcion, p_item_numero y p_total_importe en sp Artículo 1.13 para mantener consistencia en la generación de ítems y descripción de los mismos
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_HYS(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
  DECLARE v_obra_tipologia VARCHAR(50);
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_superficie_obra DECIMAL(10,2);
  DECLARE v_existe_monto_convenido BOOLEAN;
  DECLARE v_monto_convenido DECIMAL(15,2);
  DECLARE v_agrega_tareas_adicionales BOOLEAN;
  DECLARE v_total_horas DECIMAL(6,2);
  DECLARE v_hasta_60_km BOOLEAN;

  declare v_valor_k DECIMAL(15,2);
  
  DECLARE v_coef_a_afectar DECIMAL(6,5);

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
      COALESCE(obra_superficie, 0),
      calc_valor_bol1,
      COALESCE(calc_valor_num1, 0),
      calc_valor_bol2,
      COALESCE(horas, 0),
      hasta_60_km
    INTO
      v_obra_tipologia,
      v_descripcion_servicio,
      v_superficie_obra,
      v_existe_monto_convenido,
      v_monto_convenido,
      v_agrega_tareas_adicionales,
      v_total_horas,
      v_hasta_60_km
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



  SET v_tarea_profesional = 'Higiene y Seguridad (HYS)'; 
  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_obra_tipologia; -- Si no se especifica descripción, usar la tipología de obra
  END IF;



  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- HYS 
  -- ========================================================================

  SET v_total_honorarios = 0; -- Inicializar total de honorarios


  -- CALCULAR PARA 'HYSCONLEGT'
  -- Confección de Legajo técnico de Higiene y Seguridad (HYS) para la obra
  -- Según Artículo 6.2 de la Resolución CPAU A115

  IF v_obra_tipologia = 'HYSCONLEGT' THEN

      -- Lógica específica para HYSCONLEGT

      -- Art 6.2.1 - Monto convenido
      
      IF v_monto_convenido > 0 THEN

        SET v_importe_item = v_monto_convenido;
        SET v_descripcion = CONCAT('Monto convenido para las tareas Art. 6.2.1'); 
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        SET v_total_honorarios = v_total_honorarios + v_importe_item;
      
      END IF;
      

      -- ========================================================================
      -- PASO 3: DETERMINAR RANGO OBRA (donde cae la obra)
      -- ========================================================================
      SET v_coef_a_afectar = 0; -- Inicializar coeficiente
      IF v_superficie_obra > 0 THEN
        IF v_superficie_obra <= 100 THEN
            SET v_coef_a_afectar = 0.0015;
          ELSEIF v_superficie_obra <= 500 THEN
            SET v_coef_a_afectar = 0.0030;
          ELSEIF v_superficie_obra <= 1000 THEN
            SET v_coef_a_afectar = 0.0040;
          ELSEIF v_superficie_obra <= 10000 THEN
            SET v_coef_a_afectar = 0.0045;
          ELSE
            SET v_coef_a_afectar = 0.0050;
        END IF;

        SET v_importe_item = ROUND(v_coef_a_afectar * v_valor_k);
        SET v_descripcion = CONCAT('En función de la sup. de la obra (', v_superficie_obra, ' m2),(coef k ', CAST(ROUND(v_coef_a_afectar * 100, 2) AS CHAR), '%)'); 
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        SET v_total_honorarios = v_total_honorarios + v_importe_item;

      END IF;

      IF v_agrega_tareas_adicionales = 1 THEN

        SET v_descripcion = CONCAT('Adicionales según Art. 6.2.3 (',ROUND(v_total_horas, 2),' horas) - '); 

        -- Lógica para agregar tareas adicionales (horas)
        CALL Calcular_Hon_Art_1_13(
          p_calculo_id,
          v_tarea_profesional,
          v_total_horas, -- Cantidad de horas
          v_hasta_60_km, -- Hasta 60 km
          v_valor_k,
          v_descripcion,
          false, -- No es solo cálculo, se generan ítems
          v_item_numero,
          v_total_honorarios
        );
      END IF;

  END IF;



  IF v_obra_tipologia = 'HYSDUROBRA' OR v_obra_tipologia = 'HYSAUD' THEN
      -- Lógica específica para HYSDUROBRA Y Auditorías de Higiene y Seguridad en la obra
      -- Art 6.3 - Honorarios por tareas de Higiene y Seguridad durante la construcción de la obra
      -- Art 6.6 - Auditorías
      -- Según Artículo 6.3 y 6.6 de la Resolución CPAU A115

      IF v_obra_tipologia = 'HYSDUROBRA' THEN
        SET v_descripcion = CONCAT('Servicios durante la construcción de la obra según Art. 6.3 (',ROUND(v_total_horas, 0),' horas) - ');
        ELSE
          SET v_descripcion = CONCAT('Auditorías según Art. 6.6 (',ROUND(v_total_horas, 0),' horas) - ');
          SET v_solo_calculo = TRUE; -- Para auditorías, solo se calcula el monto sin generar ítems
          SET v_total_honorarios = 0; -- Inicializar total de honorarios para auditorías
      END IF;
      

      CALL Calcular_Hon_Art_1_13(
        p_calculo_id,
        v_tarea_profesional,
        v_total_horas, -- Cantidad de horas
        v_hasta_60_km, -- Hasta 60 km
        v_valor_k,
        v_descripcion,
        v_solo_calculo,
        v_item_numero,
        v_total_honorarios
      );

      IF v_solo_calculo THEN
        -- Para auditorías, se graba un solo ítem con el total calculado
        -- SET v_importe_item = v_total_honorarios;
        SET v_importe_item = v_total_honorarios * 0.20; -- 20% sobre Art. 6.3 para auditorías
        SET v_descripcion = CONCAT('Auditoría según Art. 6.6 (',ROUND(v_total_horas, 0),' horas) - 20% sobre Art. 6.3'); 
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios
      END IF;

  END IF;


  IF v_obra_tipologia = 'HYSCON' THEN
      -- Lógica específica para HYSCON
      -- Art 6.5 - Honorarios por inspecciones de Higiene y Seguridad en la obra
      -- Según Artículo 6.5 de la Resolución CPAU A115 - Llamada a Art 10.2

   call Calcular_Hon_Art_10_2(
      p_calculo_id,
      v_tarea_profesional,
      v_total_horas, -- Cantidad de consultas
      v_hasta_60_km, -- Hasta 60 km
      v_valor_k,
      "Art. 6.5",
      v_item_numero,
      v_total_honorarios
    );
  END IF;



  IF v_obra_tipologia = 'HYSESTUD' OR v_obra_tipologia = 'HYSASESO' THEN
      -- Lógica específica para Estudios y Asesoramiento de Higiene y Seguridad en la obra
      -- Art 6.5 - Honorarios por inspecciones de Higiene y Seguridad en la obra
      -- Según Artículo 6.5 de la Resolución CPAU A115 - Llamada a Art 10.3

    SET v_obra_tipologia = RIGHT(v_obra_tipologia, 5);

    CALL Calcular_Hon_Art_10_3(
      p_calculo_id,
      v_tarea_profesional,
      v_total_horas, -- Cantidad de horas
      v_hasta_60_km, -- Hasta 60 km
      v_valor_k,
      'Art 6.5',
      v_obra_tipologia,
      v_item_numero,
      v_total_honorarios
    );


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
