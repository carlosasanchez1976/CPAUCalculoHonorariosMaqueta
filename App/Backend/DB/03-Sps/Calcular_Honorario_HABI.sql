DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_HABI$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Habilitación (HABI)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 7 de la Resolución CPAU A115
 * Ver Casos de uso 104 de la documentación funcional y técnica del esarrollo CH2019.
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-06-07: 
 ******************************************************************************
 * MODIFICACIONES:
 * - 2026-08-29: Modificaciones solicitas por Amalia según reunión del 2026-08-28. 
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_HABI(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_obra_tipologia VARCHAR(50);
  DECLARE v_descripcion_servicio VARCHAR(200);
  
  -- Constantes de cálculo (CPAU 2026 - SPEC-CALC-002)
  DECLARE v_valor_k DECIMAL(15,2);
  
     
  -- Coeficientes según rango
  DECLARE v_coef_k DECIMAL(6,5);
  
  
  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_importe_adicional_remodelacion DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);
  DECLARE v_porcentaje_tarea DECIMAL(4,2);

  DECLARE v_consulta_antecedentes boolean DEFAULT FALSE;
  DECLARE v_mediciones_ejec_planos boolean DEFAULT FALSE;
  DECLARE v_consulta_usos boolean DEFAULT FALSE;
  DECLARE v_asesoramiento_disenio_local boolean DEFAULT FALSE;
  DECLARE v_estudio_impacto_ambiental boolean DEFAULT FALSE;

  DECLARE v_horas_cons_antecedentes DECIMAL(6,2) DEFAULT 0;
  DECLARE v_horas_mediciones DECIMAL(6,2) DEFAULT 0;
  DECLARE v_horas_cons_usos DECIMAL(6,2) DEFAULT 0;
  DECLARE v_horas_asesoramiento DECIMAL(6,2) DEFAULT 0;
  DECLARE v_horas_estudio_impacto DECIMAL(6,2) DEFAULT 0;

  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;
    
  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================

  SELECT 
    obra_tipologia,
    calc_valor_str1,
    calc_valor_bol1,
    calc_valor_bol2,
    calc_valor_bol3,
    calc_valor_bol4,
    calc_valor_bol5,
    calc_valor_num1,
    calc_valor_num2,
    calc_valor_num3,
    calc_valor_num4,
    calc_valor_num5
  INTO
    v_obra_tipologia,
    v_descripcion_servicio,
    v_consulta_antecedentes,
    v_mediciones_ejec_planos,
    v_consulta_usos,
    v_asesoramiento_disenio_local,
    v_estudio_impacto_ambiental,
    v_horas_cons_antecedentes,
    v_horas_mediciones,
    v_horas_cons_usos,
    v_horas_asesoramiento,
    v_horas_estudio_impacto
  FROM Calculos
  WHERE calculo_id = p_calculo_id;

  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_obra_tipologia; -- Si no se especifica descripción, usar la tipología de obra
  END IF;


  
  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos


  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS SEGUN TAMAÑO LOCAL
  -- ========================================================================
  
  IF v_obra_tipologia = 'H100SEP' THEN
    SET v_coef_k = 0.0012;
  ELSEIF v_obra_tipologia = 'H100CEP' THEN
    SET v_coef_k = 0.0018;
  ELSEIF v_obra_tipologia = 'H500SEP' THEN
    SET v_coef_k = 0.0025;
  ELSEIF v_obra_tipologia = 'H500CEP' THEN
    SET v_coef_k = 0.0030;
  ELSE
    SET v_coef_k = 0.0040; -- Para obras mayores a 500SM
  END IF;

  SET v_tarea_profesional = CONCAT('Habilitaciones Art. 10.5');
  
  SET v_importe_item = ROUND(v_coef_k * v_valor_k);
  SET v_descripcion = CONCAT('Honorarios por servicio de ', v_descripcion_servicio, ' (coef K ', CAST((v_coef_k * 100) AS CHAR), '%)');
  
  SET v_item_numero = v_item_numero + 1;
  CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
  SET v_total_honorarios = v_total_honorarios + v_importe_item;

  -- Si realizo consulta de antecedentes, agregar ítem adicional
  IF v_consulta_antecedentes THEN

    SET v_descripcion = CONCAT('Honorarios por consulta de antecedentes (', CAST(v_horas_cons_antecedentes AS CHAR), ' hs a Art. 1.13)');
    
    CALL Calcular_Hon_Art_1_13(
        p_calculo_id,
        v_tarea_profesional,
        v_horas_cons_antecedentes, -- Cantidad de horas
        false, -- Hasta 60 km
        v_valor_k,
        v_descripcion,
        false,
        v_item_numero,
        v_total_honorarios
      );

  END IF;

  -- Si realizo mediciones y ejecución de planos, agregar ítem adicional con art. 10.3
  IF v_mediciones_ejec_planos THEN
    SET v_descripcion = CONCAT('Honorarios por mediciones y ejecución de planos (', CAST(v_horas_mediciones AS CHAR), ' hs a Art. 10.3)');

     CALL Calcular_Hon_Art_10_3(
      p_calculo_id,
      v_tarea_profesional,
      v_horas_mediciones,
      false, -- Hasta 60 km
      v_valor_k,
      v_descripcion,
      'ESTUD',
      v_item_numero,
      v_total_honorarios
    );

  END IF;


  -- Si realizo consulta de usos, agregar ítem adicional con art. 1.13
  IF v_consulta_usos THEN
    SET v_descripcion = CONCAT('Honorarios por consulta de usos (', CAST(v_horas_cons_usos AS CHAR), ' hs a Art. 1.13)');
    
    CALL Calcular_Hon_Art_1_13(
        p_calculo_id,
        v_tarea_profesional,
        v_horas_cons_usos, -- Cantidad de horas
        false, -- Hasta 60 km
        v_valor_k,
        v_descripcion,
        false,
        v_item_numero,
        v_total_honorarios
      );

  END IF;

  -- Si realizo asesoramiento de diseño local, agregar ítem adicional con art. 1.13
  IF v_asesoramiento_disenio_local THEN
    SET v_descripcion = CONCAT('Honorarios por asesoramiento de diseño local (', CAST(v_horas_asesoramiento AS CHAR), ' hs a Art. 1.13)');
    
    CALL Calcular_Hon_Art_1_13(
        p_calculo_id,
        v_tarea_profesional,
        v_horas_asesoramiento, -- Cantidad de horas
        false, -- Hasta 60 km
        v_valor_k,
        v_descripcion,
        false,
        v_item_numero,
        v_total_honorarios
      );

  END IF;

  -- Si realizo estudio de impacto ambiental, agregar ítem adicional con art. 10.3
  IF v_estudio_impacto_ambiental THEN
    SET v_descripcion = CONCAT('Honorarios por estudio de impacto ambiental (', CAST(v_horas_estudio_impacto AS CHAR), ' hs a Art. 10.3)');
    
     CALL Calcular_Hon_Art_10_3(
      p_calculo_id,
      v_tarea_profesional,
      v_horas_estudio_impacto, -- Cantidad de horas
      false, -- Hasta 60 km
      v_valor_k,
      v_descripcion,
      'ESTUD',
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
    metadata_rango_costo_obra = v_coef_k,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
