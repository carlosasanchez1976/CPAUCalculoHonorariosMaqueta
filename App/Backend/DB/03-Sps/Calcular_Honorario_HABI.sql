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
 * - 2026-05-22: 
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
  
  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;
    
  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================

  SELECT 
    obra_tipologia,
    calc_valor_str1
  INTO
    v_obra_tipologia,
    v_descripcion_servicio
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
