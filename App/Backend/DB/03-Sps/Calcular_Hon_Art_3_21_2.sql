DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Hon_Art_3_21_2$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Medición y ejecución de Planos (MEDPLAN) Solo ART 3.21.2
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 3.21 de la Resolución CPAU A115
 * Ver Casos de usos de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * MPCON: Medición y/o replanteo de Construcciones y ejecución de Planos
 *
 * Este sp es utilizado en el SP Calcular_Honorario_MEDPLAN (de su mismo artículo) para el cálculo de honorarios de Medición y ejecución de Planos (MEDPLAN)
 *         es reutilizado en el SP Calcular_Honorario_TASA (de su artículo 10.8) para el cálculo de honorarios 
*          de Tasaciones (TASA) cuando se requieren mediciones y/o replanteos de construcciones y ejecución de planos según Art. 3.21.2
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-18: 
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
CREATE PROCEDURE Calcular_Hon_Art_3_21_2(
  IN p_calculo_id INT,
  IN p_tarea_profesional VARCHAR(200),
  IN p_valor_k DECIMAL(15,2),
  IN p_bol1 BOOLEAN,
  IN p_bol2 BOOLEAN,
  IN p_bol3 BOOLEAN,
  IN p_sup1 DECIMAL(15,2),
  IN p_sup2 DECIMAL(15,2),
  IN p_sup3 DECIMAL(15,2),
  INOUT p_item_numero INT,
  INOUT p_total_honorarios DECIMAL(15,2)
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo


  DECLARE v_coef_sup_k_a_afec DECIMAL(8,7);
  DECLARE v_coef_k_a_afec DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descri_art VARCHAR(20);
  DECLARE v_descri_ori VARCHAR(100);
  DECLARE v_descripcion VARCHAR(500);

  -- Lógica específica para MPCON
  -- Art 3.21.2 Construcciones y ejecución de Planos

  SET v_descri_art = 'Art. 3.21.2 ';

  IF p_bol1 THEN
    SET v_descri_ori = CONCAT(v_descri_art, '- Med. construc. existente p/determinar la sup. cubierta');

    -- Determinar coeficiente de afectación según Art. 3.21.2 según rango de superficie
    if p_sup1 <= 50 then
      SET v_coef_sup_k_a_afec = 0.000006;
      SET v_coef_k_a_afec = 0;
      ELSEIF p_sup1 <= 500 then
        SET v_coef_sup_k_a_afec = 0.000002;
        SET v_coef_k_a_afec = 0.0002;
      ELSEIF p_sup1 <= 2500 then
        SET v_coef_sup_k_a_afec = 0.000001;
        SET v_coef_k_a_afec = 0.0005;
      ELSE
        SET v_coef_sup_k_a_afec = 0.0000005;
        SET v_coef_k_a_afec = 0.00195;
    END IF;


    SET v_importe_item = p_sup1 * v_coef_sup_k_a_afec * p_valor_k;
    IF v_importe_item  > 0 THEN
      SET p_item_numero = p_item_numero + 1;
      SET v_descripcion = CONCAT(v_descri_ori, '- coef. sup. ', CAST(ROUND(v_coef_sup_k_a_afec * 100, 4) AS CHAR), ' por m2 (', p_sup1, ' m2) por valorK');
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
      SET p_total_honorarios = p_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
    END IF;

    set v_importe_item = ROUND(v_coef_k_a_afec * p_valor_k);
    IF v_importe_item > 0 THEN
      SET p_item_numero = p_item_numero + 1;
      SET v_descripcion = CONCAT(v_descri_ori, '- coef. k ', CAST(ROUND(v_coef_k_a_afec * 100, 4) AS CHAR), '% sobre valorK');
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
      SET p_total_honorarios = p_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
    END IF;

  END IF;


  IF p_bol2 THEN
    SET v_descri_ori = CONCAT(v_descri_art, '- Med. construc. existente POCO compartimentada c/ejec. de planos');

    -- Determinar coeficiente de afectación según Art. 3.21.2 según rango de superficie
    if p_sup2 <= 50 then
      SET v_coef_sup_k_a_afec = 0.000010;
      SET v_coef_k_a_afec = 0;
      ELSEIF p_sup2 <= 500 then
        SET v_coef_sup_k_a_afec = 0.000004;
        SET v_coef_k_a_afec = 0.0003;
      ELSEIF p_sup2 <= 2500 then
        SET v_coef_sup_k_a_afec = 0.000002;
        SET v_coef_k_a_afec = 0.0013;
      ELSE
        SET v_coef_sup_k_a_afec = 0.0000001;
        SET v_coef_k_a_afec = 0.00038;
    END IF;


    SET v_importe_item = p_sup2 * v_coef_sup_k_a_afec * p_valor_k;
    IF v_importe_item  > 0 THEN
      SET p_item_numero = p_item_numero + 1;
      SET v_descripcion = CONCAT(v_descri_ori, '- coef. sup. ', CAST(ROUND(v_coef_sup_k_a_afec * 100, 4) AS CHAR), ' por m2 (', p_sup2, ' m2) por valorK');
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
      SET p_total_honorarios = p_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
    END IF;

    set v_importe_item = ROUND(v_coef_k_a_afec * p_valor_k);
    IF v_importe_item > 0 THEN
      SET p_item_numero = p_item_numero + 1;
      SET v_descripcion = CONCAT(v_descri_ori, '- coef. k ', CAST(ROUND(v_coef_k_a_afec * 100, 4) AS CHAR), '% sobre valorK');
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
      SET p_total_honorarios = p_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
    END IF;

  END IF;

  IF p_bol3 THEN
    SET v_descri_ori = CONCAT(v_descri_art, '- Med. construc. existente MUY compartimentada c/ejec. de planos');

    -- Determinar coeficiente de afectación según Art. 3.21.2 según rango de superficie
    if p_sup3 <= 50 then
      SET v_coef_sup_k_a_afec = 0.000012;
      SET v_coef_k_a_afec = 0;
      ELSEIF p_sup3 <= 500 then
        SET v_coef_sup_k_a_afec = 0.000006;
        SET v_coef_k_a_afec = 0.0003;
      ELSEIF p_sup3 <= 2500 then
        SET v_coef_sup_k_a_afec = 0.000003;
        SET v_coef_k_a_afec = 0.0018;
      ELSE
        SET v_coef_sup_k_a_afec = 0.00000015;
        SET v_coef_k_a_afec = 0.00555;
    END IF;


    SET v_importe_item = p_sup3 * v_coef_sup_k_a_afec * p_valor_k;
    IF v_importe_item  > 0 THEN
      SET p_item_numero = p_item_numero + 1;
      SET v_descripcion = CONCAT(v_descri_ori, '- coef. sup. ', CAST(ROUND(v_coef_sup_k_a_afec * 100, 4) AS CHAR), ' por m2 (', p_sup3, ' m2) por valorK');
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
      SET p_total_honorarios = p_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
    END IF;

    set v_importe_item = ROUND(v_coef_k_a_afec * p_valor_k);
    IF v_importe_item > 0 THEN
      SET p_item_numero = p_item_numero + 1;
      SET v_descripcion = CONCAT(v_descri_ori, '- coef. k ', CAST(ROUND(v_coef_k_a_afec * 100, 4) AS CHAR), '% sobre valorK');
      CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
      SET p_total_honorarios = p_total_honorarios + v_importe_item; -- Actualizar el total de honorarios
    END IF;

  END IF;

  
  
END bloque_principal$$

DELIMITER ;
