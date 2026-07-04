
DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_ARBI$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Arbitraje (ARBI)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 10.9 de la Resolución CPAU A115
 * Ver Casos de uso particular de la documentación funcional y técnica del esarrollo CH2019.
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-02: Creación del procedimiento para cálculo de honorarios de arbitraje (ARBI)
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
CREATE PROCEDURE Calcular_Honorario_ARBI(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  DECLARE v_cant_horas NUMERIC(10,2);
  DECLARE v_tipo_arbitraje VARCHAR(100);
  DECLARE v_hasta_60_km BOOLEAN;
  DECLARE v_tipo_arbitraje_descri VARCHAR(100);

  -- Constantes de cálculo (CPAU 2026 - SPEC-CALC-002)
  DECLARE v_valor_k DECIMAL(15,2);
  
  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);
  DECLARE v_coef_arbitraje DECIMAL(1,0);
  
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
    v_tipo_arbitraje,
    v_hasta_60_km,
    v_tipo_arbitraje_descri
  FROM Calculos
  WHERE calculo_id = p_calculo_id;

  SET v_tarea_profesional = 'Arbitraje Art. 10.9 ';
   

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
  -- ========================================================================

  CALL Calcular_Hon_Art_1_13(
    p_calculo_id,
    v_tarea_profesional,
    v_cant_horas, -- Cantidad de horas (no aplica para arbitraje)
    v_hasta_60_km, -- Hasta 60 km (no aplica para arbitraje)
    v_valor_k
  );

  -- ========================================================================
  -- PASO 3: GENERAR ADICIONALES POR TIPO ARBITRAJE ART 10.9
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


  SET v_coef_arbitraje = 2; -- Coeficiente para honorarios de arbitraje según Art. 10.9

  IF v_tipo_arbitraje = 'JUICARBI' THEN
    SET v_coef_arbitraje = 3; -- Coeficiente para arbitraje judicial
  END IF;

  SET v_coef_arbitraje = v_coef_arbitraje - 1; -- Convertir para cálculo


  SET v_importe_item = ROUND(v_total_honorarios * v_coef_arbitraje);
  SET v_descripcion = CONCAT('Adicional por tipo Arbitraje según Art. 10.9 (', v_tipo_arbitraje, ')');

  call Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);

  SET v_total_honorarios = v_total_honorarios + v_importe_item;

    
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
