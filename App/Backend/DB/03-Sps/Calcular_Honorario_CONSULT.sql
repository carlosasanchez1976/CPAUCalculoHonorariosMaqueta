
DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_CONSULT$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Consultoría (CONSULT)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 10 de la Resolución CPAU A115
 * Incluye:
 * Consultas (Art 10.2)
 * Estudios (Art 10.3)
 * Asesoramiento (Art 10.4)
 * Derechos de Medianería (Art 10.6)
 *
 * Ver Casos de uso particular de la documentación funcional y técnica del esarrollo CH2019.
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-02: Creación del procedimiento para cálculo de honorarios de consultoría (CONSULT)
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
CREATE PROCEDURE Calcular_Honorario_CONSULT(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_cant_horas NUMERIC(10,2);
  DECLARE v_tipo_consulta VARCHAR(100);
  DECLARE v_hasta_60_km BOOLEAN;
  DECLARE v_tipo_consulta_descri VARCHAR(100);

  -- Constantes de cálculo (CPAU 2026 - SPEC-CALC-002)
  DECLARE v_valor_k DECIMAL(15,2);
  
  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);
  DECLARE v_coef_consulta DECIMAL(3,2);
  
  DECLARE v_coef_10_2_cant DECIMAL(5,4);
  DECLARE v_coef_10_2_h60 DECIMAL(5,4);
  
  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;
    
  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================

  SELECT 
    horas,
    obra_tipologia,
    hasta_60_km,
    obra_complejidad
  INTO
    v_cant_horas,
    v_tipo_consulta,
    v_hasta_60_km,
    v_tipo_consulta_descri
  FROM Calculos
  WHERE calculo_id = p_calculo_id;

  SET v_tarea_profesional = 'Consultas Art. 10';

  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos


  -- ========================================================================
  -- PASO 2: PROCESAR REGISTROS DE CALCULO POR HORAS ARTICULO 1.13
  -- NO CORRESPONDE A TIPO DE CONSULTA 'CONSUL'
  -- ========================================================================

  IF v_tipo_consulta != 'CONSU' THEN
    CALL Calcular_Hon_Art_1_13(
      p_calculo_id,
      v_tarea_profesional,
      v_cant_horas, -- Cantidad de horas
      v_hasta_60_km, -- Hasta 60 km
      v_valor_k
    );

    -- ========================================================================
    -- PASO 3: GENERAR ADICIONALES POR TIPO DE CONSULTA
    -- ========================================================================

    SELECT
        SUM(importe) INTO v_total_honorarios
      FROM
        Calculos_Items
      WHERE
        calculo_id = p_calculo_id;

    SELECT
        COUNT(importe) + 1 INTO v_item_numero
      FROM
        Calculos_Items
      WHERE
        calculo_id = p_calculo_id;


    SET v_coef_consulta = 1.5; -- Coeficiente para honorarios de ESTUD y ASESOR según Art. 10.3 y 10.4

    IF v_tipo_consulta = 'ESTUD' THEN
      SET v_descripcion = 'Adicional por Estudios según Art. 10.3';
    END IF;

    IF v_tipo_consulta = 'ASESO' THEN
      SET v_descripcion = 'Adicional por Asesor según Art. 10.4';
    END IF;

    IF v_tipo_consulta = 'LIQME' THEN
      SET v_descripcion = 'Adicional por Liquidación de medianería según Art. 10.6';
      SET v_coef_consulta = 2; -- Coeficiente para honorarios de LIQME según Art. 10.6
    END IF;

    SET v_descripcion = CONCAT(v_descripcion, ' (coef. ', (v_coef_consulta-1) * 100, '%)');
    
    SET v_coef_consulta = v_coef_consulta - 1; -- Convertir para cálculo

    SET v_importe_item = ROUND(v_total_honorarios * v_coef_consulta);
   
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);

    SET v_total_honorarios = v_total_honorarios + v_importe_item;


  ELSE

    
    SET v_coef_10_2_cant = 0.0001; -- Coeficiente para honorarios de CONSULT según Art. 10.2 por cantidad de horas
    SET v_coef_10_2_h60 = 0.0003; -- Coeficiente para honorarios de CONSULT según Art. 10.2 por distancia hasta 60 km

    
    SET v_item_numero = 1; -- Primer ítem para CONSULT

    SET v_importe_item = ROUND(v_cant_horas * v_coef_10_2_cant * v_valor_k);
    SET v_descripcion = CONCAT('Honorarios por Consultas según Art. 10.2 (', ROUND(v_cant_horas, 0), ' consultas, coef. ', v_coef_10_2_cant, ' K)');
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;

    IF v_hasta_60_km THEN
      
      SET v_item_numero = v_item_numero + 1; -- Segundo ítem para CONSULT
      SET v_importe_item = ROUND(v_cant_horas * v_coef_10_2_h60 * v_valor_k);
      SET v_descripcion = CONCAT('Adicional por inspección ocular hasta 60 km según Art. 10.2 (', ROUND(v_cant_horas, 0), ' consultas, coef. ', v_coef_10_2_h60, ' K)');
      CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
      SET v_total_honorarios = v_total_honorarios + v_importe_item;
    END IF;


  END IF;
  
   
  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = v_valor_k,
    metadata_rango_costo_obra = 0,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
