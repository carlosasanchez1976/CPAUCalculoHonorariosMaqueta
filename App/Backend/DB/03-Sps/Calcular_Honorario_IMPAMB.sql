DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_IMPAMB$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Impacto Ambiental (IMPAMB)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo X.XX de la Resolución CPAU A115
 * Tipo de Cálculo no implementado en el desarrollo CH2019.
 *
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-07-06: Creación del procedimiento para cálculo de honorarios de impacto ambiental (IMPAMB)
 ******************************************************************************
 * MODIFICACIONES:
 * - 2026-08-29: Se modifica en base a reunión con Amalia. Se agrega dato
 * -             fachada_en_condiciones en bol1 que reemplaza "realiza estudios"
 ******************************************************************************
 * - 2026-05-22: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_IMPAMB(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
  DECLARE v_obra_tipologia VARCHAR(50);
  DECLARE v_descripcion_servicio VARCHAR(200);
  DECLARE v_total_horas DECIMAL(6,2);
  DECLARE v_fachada_en_condiciones BOOLEAN;
  DECLARE v_hasta_60_km BOOLEAN;
  DECLARE v_cant_inspecciones DECIMAL(15,2);
  
  declare v_valor_k DECIMAL(15,2);
  DECLARE v_coef_sup_k_a_afec DECIMAL(8,7);
  DECLARE v_coef_k_a_afec DECIMAL(6,5);

  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);

  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2);
  DECLARE v_solo_calculo BOOLEAN;

  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================

  SELECT
      obra_tipologia,
      calc_valor_str1,
      COALESCE(horas, 0),
      hasta_60_km,
      calc_valor_num1
    INTO
      v_obra_tipologia,
      v_descripcion_servicio,
      v_total_horas,
      v_hasta_60_km,
      v_cant_inspecciones
    FROM
      Calculos
    WHERE
      calculo_id = p_calculo_id;

  -- Obtener valorK desde Parámetros
  SELECT
      valor INTO v_valor_k
    FROM
      Parametros
    WHERE
      nombre = 'valorK'
      AND (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos



  SET v_tarea_profesional = 'Estudio de Impacto Ambiental';
  IF v_descripcion_servicio IS NULL THEN
    SET v_descripcion_servicio = v_obra_tipologia; -- Si no se especifica descripción, usar la tipología de obra
  END IF;



  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS POR TAREA PROFESIONAL
  -- IMPAMB
  -- ========================================================================

   
  SET v_total_honorarios = 0;

 
    -- Procsar resto del Cálculo como un ESTUDIO (Art.)
    CALL Calcular_Hon_Art_10_3(
      p_calculo_id,
      v_tarea_profesional,
      v_total_horas, -- Cantidad de horas
      v_hasta_60_km, -- Hasta 60 km
      v_valor_k,
      'Art 10',
      'ESTUD', -- Tipo de consulta
      v_item_numero,
      v_total_honorarios
    );

 

  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = v_valor_k,
    metadata_rango_costo_obra = null,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
