DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_TASA$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Tasaciones (TASA)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 10.8 de la Resolución CPAU A115
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
 * - 2026-07-05: Se agregan parametros INOUT p_descripcion, p_item_numero y p_total_importe en sp Artículo 1.13
 *               para mantener consistencia en la generación de ítems y descripción de los mismos
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_TASA(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
  DECLARE v_grupo_tasacion VARCHAR(50);
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_bol1 BOOLEAN;
  DECLARE v_bol2 BOOLEAN;
  DECLARE v_bol3 BOOLEAN;
  DECLARE v_inc_med_planos BOOLEAN;
  DECLARE v_inc_relev BOOLEAN;
  DECLARE v_sup1 DECIMAL(15,2);
  DECLARE v_sup2 DECIMAL(15,2);
  DECLARE v_sup3 DECIMAL(15,2);
  DECLARE v_valor_en_juego DECIMAL(15,2);
  DECLARE v_categoria VARCHAR(50);

  
  declare v_valor_k DECIMAL(15,2);
  DECLARE v_coef_valor_en_juego_k DECIMAL(15,2);
  DECLARE v_coef_valor_en_juego_afec DECIMAL(8,7);
  DECLARE v_coef_k_a_afec DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);
  DECLARE v_importe_ordinarias DECIMAL(15,2);

  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2);
  DECLARE v_solo_calculo BOOLEAN;



  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================


  SELECT
      obra_tipologia,
      obra_complejidad,
      calc_valor_str1,
      calc_valor_bol1,
      calc_valor_bol2,
      calc_valor_bol3,
      calc_valor_bol4,
      calc_valor_bol5,
      calc_valor_num1,
      calc_valor_num2,
      calc_valor_num3,
      calc_valor_num4
    INTO
      v_grupo_tasacion,
      v_categoria,
      v_descripcion_servicio,
      v_bol1,
      v_bol2,
      v_bol3,
      v_inc_med_planos,
      v_inc_relev,
      v_sup1,
      v_sup2,
      v_sup3,
      v_valor_en_juego
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


  SET v_tarea_profesional = 'Tasaciones Art. 10.8'; 
  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_grupo_tasacion; -- Si no se especifica descripción, usar la tipología de obra
  END IF;


  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- TASA 
  -- ========================================================================
      /*
      { value: "TASPROP", label: 'Propiedades' },
      { value: 'TASBMUE', label: 'Bienes muebles' },
      { value: 'TASINST', label: 'Instalaciones' },
      { value: 'TASOARQ', label: 'Obras de arquitectura' },
      { value: 'TASDSIN', label: 'Daños causados por siniestro' }
      */
   
  -- CALCULAR PARA GRUPOS PROPIEDADES Y BIENES MUEBLES (TASPROP, TASBMUE) SEGÚN ART. 10.8
 

  SET v_total_honorarios = 0;
  SET v_item_numero = 0;

  IF v_grupo_tasacion = 'TASPROP' or v_grupo_tasacion = 'TASBMUE' THEN
      -- Se calculan coeficientes según categorías
      /*               
      { value: "TASESTIM", label: 'Estimativa' },
      { value: 'TASORDIN', label: 'Ordinaria' },
      { value: 'TASEXTRA', label: 'Extraordinaria' },
      { value: 'TASVLOCA', label: 'de valor locativo' }
      */
      
      SET v_importe_ordinarias = 0;

      SET v_coef_valor_en_juego_k = v_valor_en_juego / v_valor_k; -- Coeficiente de valor en juego sobre valorK
      SET v_coef_valor_en_juego_afec = 0; -- Inicializar

      -- Cuadro 18
      IF v_coef_valor_en_juego_k <= 0.25 then
        SET v_coef_valor_en_juego_afec = 0.015;
        SET v_coef_k_a_afec = 0;
        ELSEIF v_coef_valor_en_juego_k <= 1 then
          SET v_coef_valor_en_juego_afec = 0.008;
          SET v_coef_k_a_afec = 0.00175;
        ELSEIF v_coef_valor_en_juego_k <= 2 then
          SET v_coef_valor_en_juego_afec = 0.005;
          SET v_coef_k_a_afec = 0.00475;
        ELSE
          SET v_coef_valor_en_juego_afec = 0.002;
          SET v_coef_k_a_afec = 0.01075;
      END IF;

      -- Calcular total tareas ordinaris
      SET v_importe_ordinarias = ROUND(v_coef_valor_en_juego_afec * v_valor_en_juego) + ROUND(v_coef_k_a_afec * v_valor_k);


      IF v_categoria = 'TASESTIM' THEN
        -- 30% de Ordinaria según Art 10.8
        SET v_importe_item = v_importe_ordinarias * 0.30; -- 30% de Ordinaria según Art. 10.8
        SET v_descripcion = CONCAT('30% sobre Tasación Ordinaria Art. 10.8.a', ' (', CAST(ROUND(v_importe_ordinarias, 2) AS CHAR), ')'); 
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios

        ELSEIF v_categoria = 'TASORDIN' or v_categoria = 'TASVLOCA' THEN

          SET v_importe_item = v_coef_valor_en_juego_afec * v_valor_en_juego;
          SET v_descripcion = CONCAT('Coef. ', ROUND(v_coef_valor_en_juego_afec * 100, 4), '% sobre Valor en juego 10.8.b'); 
          SET v_item_numero = v_item_numero + 1;
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios

          IF v_coef_k_a_afec > 0 THEN
            SET v_importe_item = ROUND(v_coef_k_a_afec * v_valor_k);
            SET v_descripcion = CONCAT('Coef. k ', ROUND(v_coef_k_a_afec * 100, 4), '% sobre valorK 10.8.b'); 
            SET v_item_numero = v_item_numero + 1;
            CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
            SET v_total_honorarios = v_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
          END IF;

        ELSEIF v_categoria = 'TASEXTRA' THEN
          -- 150% de Ordinaria según Art 10.8
          SET v_importe_item = v_importe_ordinarias * 1.50; -- 150% de Ordinaria según Art. 10.8
          SET v_descripcion = CONCAT('150% sobre Tasación Ordinaria Art. 10.8.c', ' (', CAST(ROUND(v_importe_ordinarias, 2) AS CHAR), ')'); 
          SET v_item_numero = v_item_numero + 1;
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
          SET v_total_honorarios = v_importe_item; -- Actualizar el total de honorarios
        ELSE
          -- Categoría no reconocida, no se calculan honorarios
          SET v_total_honorarios = 0;

      END IF;

      ELSE

      -- EL RESTO DE GRUPOS DE TASACION:
      -- TASINST, TASOARQ, TASDSIN
      -- SE CONSIDERAN COMO PERITAJES (PERI) SEGÚN ART. 10.8.d
      -- SE CALCULAN CON LA MISMA LOGICA DE PERITAJES (PERI) SEGÚN ART. 10.7
      -- Llamar al procedimiento para calcular honorarios según Artículo 10.7 cuando se conoce el valor en juego
      CALL Calcular_Hon_Art_10_7(
        p_calculo_id,
        v_valor_en_juego,
        v_valor_k,
        v_tarea_profesional,
        v_item_numero,
        v_total_honorarios
      );

  END IF;

  -- ========================================================================
  -- PASO 4: VERIFICAR SI SE REALIZARON TAREAS DE MEDICION Y/O RELEVAMIENTO DE PLANOS
  -- ========================================================================
  -- Aquí se reutilizan, de existir, los cálculos de honorarios de medición y ejecución de planos según Art. 3.21.2

  IF v_bol1 OR v_bol2 OR v_bol3 THEN
    -- Llamar al procedimiento para calcular honorarios según Artículo 3.21.2
    CALL Calcular_Hon_Art_3_21_2(
      p_calculo_id,
      v_tarea_profesional,
      v_valor_k,
      v_bol1,
      v_bol2,
      v_bol3,
      v_sup1,
      v_sup2,
      v_sup3,
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
