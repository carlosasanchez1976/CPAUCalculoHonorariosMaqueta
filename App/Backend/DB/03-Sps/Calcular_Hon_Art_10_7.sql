DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Hon_Art_10_7$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Peritajes (PERI) - Art. 10.7.1
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 10.7.1 de la Resolución CPAU A115
 * Cuadro 17
 * Se reutiliza este procedimiento para el cálculo de honorarios de Peritajes (PERI) según Art. 10.7.2 cuando se conoce el valor en juego
 *    es utilizado en el SP Calcular_Honorario_PERI (de su mismo artículo)
 *    y se reutiliza en el SP Calcular_Honorario_TASA (de su artículo 10.8) para el cálculo de honorarios de Tasaciones (TASA) para
 *    los grupos de tasación: Instalaciones, Obras de Arquitectura y Daños causados por siniestros, cuando se conoce el valor en juego
 * Ver Casos de usos de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * PERI: Peritajes
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-18: 
 ******************************************************************************
 * MODIFICACIONES:
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Hon_Art_10_7(
  IN p_calculo_id INT,
  IN p_valor_en_juego DECIMAL(15,2),
  IN p_valor_k DECIMAL(15,2),
  IN p_tarea_profesional VARCHAR(200),
  INOUT p_item_numero INT,
  INOUT p_total_honorarios DECIMAL(15,2)
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_coef_k DECIMAL(10,2);
  DECLARE v_coef_K_a_afectar DECIMAL(6,5);
  DECLARE v_coef_V_a_afectar DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  

  
  
  -- Lógica específica para Cálculo de Honorarios de Peritajes cuando se SI conoce el valor en juego 10.7.1

  SET v_coef_k = p_valor_en_juego / p_valor_k;

  -- Determinar el coeficiente a afectar según el coef V / K
  IF v_coef_k <= 0.25 THEN
    SET v_coef_K_a_afectar = 0;
    SET v_coef_V_a_afectar = 0.012;
  ELSEIF v_coef_k <= 1 THEN
    SET v_coef_K_a_afectar = 0.002;
    SET v_coef_V_a_afectar = 0.004;
  ELSEIF v_coef_k <= 2 THEN
    SET v_coef_K_a_afectar = 0.003;
    SET v_coef_V_a_afectar = 0.003;
  ELSE
    SET v_coef_K_a_afectar = 0.009;
    SET v_coef_V_a_afectar = 0.001;
  END IF;
          
  
  SET v_importe_item = ROUND(p_valor_en_juego * v_coef_V_a_afectar);
  SET v_descripcion = CONCAT('Según Art. 10.7 s/valor en juego (coef ', CAST(ROUND(v_coef_V_a_afectar * 100, 2) AS CHAR), '%)'); 
  SET p_item_numero = p_item_numero + 1;
  CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
  SET p_total_honorarios = p_total_honorarios + v_importe_item;

  if v_coef_K_a_afectar > 0 THEN
    SET v_importe_item = ROUND(p_valor_k * v_coef_K_a_afectar);
    SET v_descripcion = CONCAT('Según Art. 10.7 s/valor K (coef ', CAST(ROUND(v_coef_K_a_afectar * 100, 2) AS CHAR), '%)'); 
    SET p_item_numero = p_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, p_item_numero, p_tarea_profesional, v_descripcion, v_importe_item);
    SET p_total_honorarios = p_total_honorarios + v_importe_item;
  END IF;


  
END bloque_principal$$

DELIMITER ;
