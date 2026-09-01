DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Hon_Art_10_3$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Artículo 10.3
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
 * - 2026-07-06: Creación del procedimiento para cálculo de honorarios según Art. 10.3
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
CREATE PROCEDURE Calcular_Hon_Art_10_3(
  IN p_calculo_id INT,
  IN p_tarea_profesional VARCHAR(200),
  IN p_total_horas DECIMAL(10,2),
  IN p_hasta_60_km boolean,
  IN p_valor_k DECIMAL(15,2),
  IN p_descripcion VARCHAR(500),
  IN p_tipo_consulta VARCHAR(100),
  INOUT p_item_numero INT,
  INOUT p_total_importe DECIMAL(15,2)
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================

  -- Variables de cálculo de ítems
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_coef_consulta DECIMAL(3,2);
  DECLARE v_importe_dif DECIMAL(15,2);
  DECLARE v_importe_base DECIMAL(15,2);

  IF p_descripcion IS NULL THEN
      SET p_descripcion = '';
  END IF;  

  SET v_importe_base = p_total_importe; -- Guardar el importe base antes de aplicar el coeficiente adicional

  CALL Calcular_Hon_Art_1_13(
    p_calculo_id,
    p_tarea_profesional,
    p_total_horas, -- Cantidad de horas
    p_hasta_60_km, -- Hasta 60 km
    p_valor_k,
    p_descripcion,
    false,
    p_item_numero,
    p_total_importe
  );

   SET v_importe_dif = p_total_importe - v_importe_base; -- Calcular la diferencia generada por el SP Calcular_Hon_Art_1_13

    -- ========================================================================
    -- PASO 3: GENERAR ADICIONALES POR TIPO DE CONSULTA
    -- ========================================================================


    -- El p_item_numero ya viene actualizado del SP Calcular_Hon_Art_1_13 (parámetro INOUT)
    SET p_item_numero = p_item_numero + 1;


    SET v_coef_consulta = 1.5; -- Coeficiente para honorarios de ESTUD y ASESOR según Art. 10.3 y 10.4

    IF p_tipo_consulta = 'ESTUD' THEN
      SET v_descripcion = 'Adicional por Estudios según Art. 10.3';
    END IF;

    IF p_tipo_consulta = 'ASESO' THEN
      SET v_descripcion = 'Adicional por Asesor según Art. 10.4';
    END IF;

    IF p_tipo_consulta = 'LIQME' THEN
      SET v_descripcion = 'Adicional por Liquidación de medianería según Art. 10.6';
      SET v_coef_consulta = 2; -- Coeficiente para honorarios de LIQME según Art. 10.6
    END IF;

    SET v_descripcion = CONCAT(v_descripcion, ' (coef. ', (v_coef_consulta-1) * 100, '%)');
    IF p_descripcion <> '' THEN
      SET v_descripcion = CONCAT(p_descripcion, ' - ', v_descripcion);
    END IF;
    
    SET v_coef_consulta = v_coef_consulta - 1; -- Convertir para cálculo

    SET v_importe_item = ROUND(v_importe_dif * v_coef_consulta);
   
    CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);

    SET p_total_importe = p_total_importe + v_importe_item;

END bloque_principal$$

DELIMITER ;
