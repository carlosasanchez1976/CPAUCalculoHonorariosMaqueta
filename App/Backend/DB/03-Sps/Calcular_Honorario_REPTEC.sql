DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_REPTEC$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Representación Técnica (REPTEC)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 7 de la Resolución CPAU A115
 * Ver Casos de uso 101 al 103 de la documentación funcional y técnica del esarrollo CH2019.
 * Tareas Profesionales posibles:
 * IEC: Inscripción de Empresa Contructora
 * POL: Presentación de Ofertas y Licitaciones
 * RTE: Representación Técnica
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
CREATE PROCEDURE Calcular_Honorario_REPTEC(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_valor_obra DECIMAL(15,2);
-- Contiene el código de tarea profesinal a realizar
-- IEC, POL o RTE
  DECLARE v_obra_tipologia VARCHAR(50);
  
  
  -- Constantes de cálculo (CPAU 2026 - SPEC-CALC-002)
  DECLARE v_valor_k DECIMAL(15,2);
  
  -- Variables de rango
  DECLARE v_coeficiente_k DECIMAL(10,4);
      
  -- Coeficientes según rango
  DECLARE v_coef_obra DECIMAL(6,5);
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
    obra_valor_obra,
    obra_tipologia
  INTO
    v_valor_obra,
    v_obra_tipologia
  FROM Calculos
  WHERE calculo_id = p_calculo_id;
  
  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos



  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- ========================================================================
  -- CALCULAR PARA 'IEC'
  IF v_obra_tipologia = 'IEC' THEN




      -- Lógica específica para (IEC)

    -- ========================================================================
      -- PASO 3: DETERMINAR RANGO FINAL (donde cae la obra)
      -- ========================================================================
      
      SET v_coeficiente_k = v_valor_obra / v_valor_k;
      
      IF v_coeficiente_k <= 0.5 THEN
        SET v_coef_obra = 0.056;
        SET v_coef_k = 0;
      ELSEIF v_coeficiente_k <= 5 THEN
        SET v_coef_obra = 0.032;
        SET v_coef_k = 0.012;
      ELSEIF v_coeficiente_k <= 25 THEN
        SET v_coef_obra = 0.024;
        SET v_coef_k = 0.052;
      ELSE
        SET v_coef_obra = 0.016;
        SET v_coef_k = 0.252;
      END IF;


      
      -- Para simplificar, asignamos una tarea profesional genérica para IEC
      SET v_tarea_profesional = 'Honorarios (IEC) Art. 7.2 (Coef M)';
    
      
      SET v_importe_item = ROUND(v_coef_obra * v_valor_obra);
      SET v_descripcion = CONCAT('Honorarios por servicio de Inscripción de empresa constructora (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
      
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero + 1, v_tarea_profesional, v_descripcion, v_importe_item);

      SET v_total_honorarios = v_total_honorarios + v_importe_item;

      IF v_coef_k > 0 THEN
		SET v_tarea_profesional = 'Honorarios (IEC) Art. 7.2 (Coef K)';
        SET v_importe_item = ROUND(v_coef_k * v_valor_k);
        SET v_descripcion = CONCAT('Adicional por valor K (coef ', CAST((v_coef_k * 100) AS CHAR), '%)');
        
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero + 2, v_tarea_profesional, v_descripcion, v_importe_item);

        SET v_total_honorarios = v_total_honorarios + v_importe_item;
      END IF;


    
  END IF;


  
  
  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = v_valor_k,
    metadata_rango_costo_obra = v_coeficiente_k,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
