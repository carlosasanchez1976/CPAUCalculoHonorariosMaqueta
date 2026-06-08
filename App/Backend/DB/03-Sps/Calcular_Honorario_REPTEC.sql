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
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_oferta_aceptada BOOLEAN;
  
  
  
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
    obra_tipologia,
    calc_valor_str1,
    tarea_obra_proyecto
  INTO
    v_valor_obra,
    v_obra_tipologia,
    v_descripcion_servicio,
    v_oferta_aceptada
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

  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_obra_tipologia; -- Si no se especifica descripción, usar la tipología de obra
  END IF;



  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- IEC Y POL SE CALCULAN CON EL MISMO ALGORITMO PERO SE DISTINGUEN EN LA DESCRIPCIÓN Y TAREA PROFESIONAL
  -- ========================================================================
  -- CALCULAR PARA 'IEC' Y 'POL'
  IF v_obra_tipologia = 'IEC' OR v_obra_tipologia = 'POL' THEN

      -- Lógica específica para (IEC y POL comparten algoritmo)

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
      SET v_tarea_profesional = CONCAT('Honorarios (', v_obra_tipologia, ') Art. 7.2 (Coef M)');
    
      
      SET v_importe_item = ROUND(v_coef_obra * v_valor_obra);
      SET v_descripcion = CONCAT('Honorarios por servicio de ', v_descripcion_servicio, ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
      
      -- Si es POL no se graba. Pero se tiene que calcular el total de honorarios para IEC y después afectarlo a coeficientes del Art 7.4
      if v_obra_tipologia = 'IEC' THEN
        SET v_item_numero = v_item_numero + 1;
        CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      END IF;
      

      SET v_total_honorarios = v_total_honorarios + v_importe_item;

      IF v_coef_k > 0 THEN
		  SET v_tarea_profesional = CONCAT('Honorarios (', v_obra_tipologia, ') Art. 7.2 (Coef K)');
        SET v_importe_item = ROUND(v_coef_k * v_valor_k);
        SET v_descripcion = CONCAT('Adicional por valor K (coef ', CAST((v_coef_k * 100) AS CHAR), '%)');
        
        if v_obra_tipologia = 'IEC' THEN
          SET v_item_numero = v_item_numero + 1;
          CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
        END IF;
        
        SET v_total_honorarios = v_total_honorarios + v_importe_item;
      END IF;


    
  END IF;


  -- CALCULAR PARA 'POL'
  IF v_obra_tipologia = 'POL' THEN

    -- Aquí se calcularán los honorarios específicos para POL, que resultan de afectar coeficientes a lo calculado para IEC.
         
    IF not v_oferta_aceptada THEN
      -- Para simplificar, asignamos una tarea profesional genérica para POL
      SET v_tarea_profesional = CONCAT('Oferta no adjudicada Art. 7.4');
    
      SET v_coef_obra = 0.05;
      SET v_importe_item = ROUND(v_total_honorarios * v_coef_obra);
      SET v_descripcion = CONCAT('Honorarios Art. 7.4 (Coef 5% de honorarios Art. 7.2)');

      ELSE

        SET v_tarea_profesional = CONCAT('Designación otro profesional Art. 7.4');
      
        SET v_coef_obra = 0.25;
        SET v_importe_item = ROUND(v_total_honorarios * v_coef_obra);
        SET v_descripcion = CONCAT('Honorarios Art. 7.4 (Coef 25% de honorarios Art. 7.2)');

    END IF;
      
    SET v_item_numero = v_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);

    SET v_total_honorarios = v_total_honorarios + v_importe_item;
     
    
  END IF;


-- CALCULAR PARA 'RTE'
  IF v_obra_tipologia = 'RTE' THEN

      -- Lógica específica para RTE

    -- ========================================================================
      -- PASO 3: DETERMINAR RANGO FINAL (donde cae la obra)
      -- ========================================================================
      
      SET v_coeficiente_k = v_valor_obra / v_valor_k;
      
      IF v_coeficiente_k <= 10 THEN
        SET v_coef_obra = 0.0004;
      ELSEIF v_coeficiente_k <= 20 THEN
        SET v_coef_obra = 0.0008;
      ELSEIF v_coeficiente_k <= 60 THEN
        SET v_coef_obra = 0.0012;
      ELSE
        SET v_coef_obra = 0.0016;
      END IF;
      
      SET v_tarea_profesional = CONCAT('Honorario Mensual (', v_obra_tipologia, ') Art. 7.3');
      
      SET v_importe_item = ROUND(v_coef_obra * v_valor_obra);
      SET v_descripcion = CONCAT('Honorarios por servicio de ', v_descripcion_servicio, ' (coef ', CAST((v_coef_obra * 100) AS CHAR), '%)');
      
      SET v_item_numero = v_item_numero + 1;
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;
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
