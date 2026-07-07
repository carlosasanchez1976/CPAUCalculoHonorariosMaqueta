DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Hon_Art_1_13$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Artículo 1.13
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 1.13 de la Resolución CPAU A115
 * Ver Casos de uso particular de la documentación funcional y técnica del esarrollo CH2019.
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-02: Creación del procedimiento para cálculo de honorarios según Art. 1.13
 ******************************************************************************
 * MODIFICACIONES:
 * - 2026-07-05: Se agrega parámetro INOUT p_item_numero para mantener el número de ítem actualizado
 * - 2026-07-05: Se agrega parámetro INOUT p_total_importe para mantener el total de importes actualizado
 * - 2026-07-05: Se agrega parámetro IN p_descripcion para enviar la descripción del ítem (opcional).
 * -             Se CONCATENA la descripción proporcionada con la descripción generada automáticamente.
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Hon_Art_1_13(
  IN p_calculo_id INT,
  IN p_tarea_profesional VARCHAR(200),
  IN p_cant_horas DECIMAL(10,2),
  IN p_hasta_60_km boolean,
  IN p_valor_k DECIMAL(15,2),
  IN p_descripcion VARCHAR(500),
  IN p_solo_calculo BOOLEAN,
  INOUT p_item_numero INT,
  INOUT p_total_importe DECIMAL(15,2)
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================

  -- Variables de cálculo de ítems
  
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_importe_hora_prim DECIMAL(15,2);
  DECLARE v_importe_hora_rest DECIMAL(15,2);
  DECLARE v_cant_horas_prim DECIMAL(8,2);
  DECLARE v_cant_horas_rest DECIMAL(8,2);
  DECLARE v_cant_dias_60_km DECIMAL(3,0);
  DECLARE v_importe_dia_60_km DECIMAL(15,2);
  
  DECLARE v_coef_hora_prim DECIMAL(6,5);
  DECLARE v_coef_hora_rest DECIMAL(6,5);
  DECLARE v_coef_dia_60_km DECIMAL(6,5);

  DECLARE v_descripcion VARCHAR(500);

  IF p_descripcion IS NULL THEN
      SET p_descripcion = '';
  END IF; 

  IF p_solo_calculo IS NULL THEN
      SET p_solo_calculo = FALSE;
  END IF;
 
  SET v_coef_hora_prim = 0.0003; -- Coeficiente para la primera hora
  SET v_coef_hora_rest = 0.00006; -- Coeficiente para las horas adicionales
  SET v_coef_dia_60_km = 0.0006; -- Coeficiente para los días de desplazamiento hasta 60 km

  IF NOT p_hasta_60_km THEN
    SET v_cant_dias_60_km = CEIL(p_cant_horas / 8); -- Si hay desplazamiento hasta 60 km, se considera 1 día por cada 8 horas
  ELSE
    SET v_cant_dias_60_km = 0; -- No hay desplazamiento
  END IF;

  -- Datos del cálculo
  SET v_importe_hora_prim = ROUND(v_coef_hora_prim * p_valor_k);
  SET v_importe_hora_rest = ROUND(v_coef_hora_rest * p_valor_k);
  SET v_cant_horas_prim = 5;


  -- ========================================================================
  -- PASO 1: GENERAR MOIVMIENTO POR LAS PRIMERAS 5 HORAS
  -- ========================================================================

  SET v_importe_item = v_cant_horas_prim * v_importe_hora_prim; -- Primeras 5 horas
  
  IF NOT p_solo_calculo THEN
    SET v_descripcion = CONCAT('Art. 1.13 - Primeras ', v_cant_horas_prim, ' horas (coef K ', CAST((v_coef_hora_prim * 100) AS CHAR), '%)');
    SET v_descripcion = CONCAT(p_descripcion,' - ', v_descripcion); -- Concatenar la descripción proporcionad

    SET p_item_numero = p_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
  END IF;
  SET p_total_importe = p_total_importe + v_importe_item;
  
-- ========================================================================
  -- PASO 2: GENERAR MOVIMIENTO POR LAS HORAS ADICIONALES
  -- ========================================================================

  SET v_cant_horas_rest = p_cant_horas - v_cant_horas_prim; -- Horas restantes después de las primeras 5 horas
  IF v_cant_horas_rest > 0 THEN
    SET v_importe_item = v_cant_horas_rest * v_importe_hora_rest; -- Horas restantes
    IF NOT p_solo_calculo THEN
      SET v_descripcion = CONCAT('Art. 1.13 - Horas adicionales (', v_cant_horas_rest, ' horas) - (coef K ', CAST((v_coef_hora_rest * 100) AS CHAR), '%)');
      SET v_descripcion = CONCAT(p_descripcion,' - ', v_descripcion); -- Concatenar la descripción proporcionad  
      SET p_item_numero = p_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
    END IF;
    SET p_total_importe = p_total_importe + v_importe_item;
  END IF;

  -- ========================================================================
  -- PASO 3: GENERAR MOVIMIENTO POR LOS DÍAS DE DESPLAZAMIENTO HASTA 60 KM
  -- ========================================================================

  if v_cant_dias_60_km > 0 then
    SET v_importe_dia_60_km = ROUND(v_coef_dia_60_km * p_valor_k);
    SET v_importe_item = v_cant_dias_60_km * v_importe_dia_60_km; -- Días de desplazamiento hasta 60 km
    IF NOT p_solo_calculo THEN
      SET v_descripcion = CONCAT('Art. 1.13 - Desplazamiento hasta 60 km (', v_cant_dias_60_km, ' días) - (coef K ', CAST((v_coef_dia_60_km * 100) AS CHAR), '%)');
      SET v_descripcion = CONCAT(p_descripcion,' - ', v_descripcion); -- Concatenar la descripción proporcionad
      SET p_item_numero = p_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
    END IF;
    SET p_total_importe = p_total_importe + v_importe_item;
  END IF;

END bloque_principal$$

DELIMITER ;
