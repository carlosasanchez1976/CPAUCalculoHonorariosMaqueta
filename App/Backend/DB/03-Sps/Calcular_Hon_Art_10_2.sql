DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Hon_Art_10_2$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Artículo 10.2
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 10.2 de la Resolución CPAU A115
 * Ver Casos de uso particular de la documentación funcional y técnica del esarrollo CH2019.
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-06: Creación del procedimiento para cálculo de honorarios según Art. 10.2
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
CREATE PROCEDURE Calcular_Hon_Art_10_2(
  IN p_calculo_id INT,
  IN p_tarea_profesional VARCHAR(200),
  IN p_cant_consultas DECIMAL(10,2),
  IN p_hasta_60_km boolean,
  IN p_valor_k DECIMAL(15,2),
  IN p_descripcion VARCHAR(500),
  INOUT p_item_numero INT,
  INOUT p_total_importe DECIMAL(15,2)
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================

  -- Variables de cálculo de ítems
  DECLARE v_coef_10_2_cant DECIMAL(5,4);
  DECLARE v_coef_10_2_h60 DECIMAL(5,4);
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);

  IF p_descripcion IS NULL THEN
      SET p_descripcion = '';
  END IF;  

  SET v_coef_10_2_cant = 0.0001; -- Coeficiente para honorarios de CONSULT según Art. 10.2 por cantidad de horas
  SET v_coef_10_2_h60 = 0.0003; -- Coeficiente para honorarios de CONSULT según Art. 10.2 por distancia hasta 60 km

  SET p_item_numero = p_item_numero + 1;

  SET v_importe_item = ROUND(p_cant_consultas * v_coef_10_2_cant * p_valor_k);
  SET v_descripcion = CONCAT('Honorarios por Consultas según Art. 10.2 (', ROUND(p_cant_consultas, 0), ' consultas, coef. ', v_coef_10_2_cant, ' K)');
  IF p_descripcion != '' THEN
      SET v_descripcion = CONCAT(p_descripcion, ' - ', v_descripcion);
  END IF;
  CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
  SET p_total_importe = p_total_importe + v_importe_item;

  IF p_hasta_60_km THEN
    
    SET p_item_numero = p_item_numero + 1; -- Segundo ítem para CONSULT
    SET v_importe_item = ROUND(p_cant_consultas * v_coef_10_2_h60 * p_valor_k);
    SET v_descripcion = CONCAT('Adicional por inspección ocular hasta 60 km según Art. 10.2 (', ROUND(p_cant_consultas, 0), ' consultas, coef. ', v_coef_10_2_h60, ' K)');
    IF p_descripcion != '' THEN
        SET v_descripcion = CONCAT(p_descripcion, ' - ', v_descripcion);
    END IF;
    CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
    SET p_total_importe = p_total_importe + v_importe_item;
  END IF;


END bloque_principal$$

DELIMITER ;
