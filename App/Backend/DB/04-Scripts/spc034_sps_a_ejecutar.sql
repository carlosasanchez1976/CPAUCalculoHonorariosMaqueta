DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_Grabar$$

CREATE PROCEDURE Calculos_Grabar(
  -- Identificación
  IN p_calculo_id INT,
  IN p_usuario_id INT,
  IN p_tarea_id INT,
  IN p_fecha_calculo DATE,
  
  -- Datos Proyecto
  IN p_proyecto_nombre VARCHAR(200),
  IN p_proyecto_ubicacion VARCHAR(200),
  IN p_proyecto_cliente VARCHAR(200),
  IN p_proyecto_observ VARCHAR(200),
  IN p_horas DECIMAL(6,2),
  IN p_hasta_60_km BOOLEAN,
  IN p_calc_valor_bol1 BOOLEAN,
  IN p_calc_valor_bol2 BOOLEAN,
  IN p_calc_valor_bol3 BOOLEAN,
  IN p_calc_valor_bol4 BOOLEAN,
  IN p_calc_valor_bol5 BOOLEAN,
  IN p_calc_valor_num1 DECIMAL(15,2),
  IN p_calc_valor_num2 DECIMAL(15,2),
  IN p_calc_valor_num3 DECIMAL(15,2),
  IN p_calc_valor_num4 DECIMAL(15,2),
  IN p_calc_valor_num5 DECIMAL(15,2),
  IN p_calc_valor_str1 VARCHAR(255),
  IN p_calc_valor_str2 VARCHAR(255),
  IN p_calc_valor_str3 VARCHAR(255),
  IN p_calc_valor_str4 VARCHAR(255),
  IN p_calc_valor_str5 VARCHAR(255),

  -- Datos Obra
  IN p_obra_valor_obra DECIMAL(15,2),
  IN p_obra_superficie DECIMAL(10,2),
  IN p_obra_cotiz_dolar DECIMAL(15,2),
  IN p_obra_tipologia VARCHAR(100),
  IN p_obra_complejidad VARCHAR(100),
  IN p_obra_plazo_ejecucion DECIMAL(5,2),
  
  -- Tareas Profesionales
  IN p_tarea_obra_proyecto BOOLEAN,
  IN p_tarea_obra_direccion BOOLEAN,
  IN p_tarea_instalacion_sanitaria BOOLEAN,
  IN p_tarea_instalacion_electrica BOOLEAN,
  IN p_tarea_instalacion_contra_incendio BOOLEAN,
  IN p_tarea_instalacion_termomecanica BOOLEAN,
  IN p_tarea_proyecto_estructuras BOOLEAN,
  IN p_tarea_documentacion_ejecutiva BOOLEAN,
  IN p_tarea_supervision_obra BOOLEAN,
  IN p_tarea_observaciones VARCHAR(200)

)

BEGIN
  DECLARE v_error_msg VARCHAR(500);
  
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  IF p_calculo_id IS NULL THEN
    -- Insertar nuevo cálculo
    BEGIN
      INSERT INTO Calculos
        (usuario_id,
        tarea_id,
        fecha_calculo,
        proyecto_nombre,
        proyecto_ubicacion,
        proyecto_cliente,
        proyecto_observ,
        obra_valor_obra,
        obra_superficie,
        obra_cotiz_dolar,
        obra_tipologia,
        obra_complejidad,
        obra_plazo_ejecucion,
        horas,
        hasta_60_km,
        calc_valor_bol1,
        calc_valor_bol2,
        calc_valor_bol3,
        calc_valor_bol4,
        calc_valor_bol5,
        calc_valor_num1,
        calc_valor_num2,
        calc_valor_num3,
        calc_valor_num4,
        calc_valor_num5,
        calc_valor_str1,
        calc_valor_str2,
        calc_valor_str3,
        calc_valor_str4,
        calc_valor_str5,
        tarea_obra_proyecto,
        tarea_obra_direccion,
        tarea_instalacion_sanitaria,
        tarea_instalacion_electrica,
        tarea_instalacion_contra_incendio,
        tarea_instalacion_termomecanica,
        tarea_proyecto_estructuras,
        tarea_documentacion_ejecutiva,
        tarea_supervision_obra,
        tarea_observaciones)
      VALUES
        (p_usuario_id,
        p_tarea_id,
        COALESCE(p_fecha_calculo, CURDATE()),
        p_proyecto_nombre,
        p_proyecto_ubicacion,
        p_proyecto_cliente,
        p_proyecto_observ,
        p_obra_valor_obra,
        p_obra_superficie,
        p_obra_cotiz_dolar,
        p_obra_tipologia,
        p_obra_complejidad,
        p_obra_plazo_ejecucion,
        p_horas,
        p_hasta_60_km,
        p_calc_valor_bol1,
        p_calc_valor_bol2,
        p_calc_valor_bol3,
        p_calc_valor_bol4,
        p_calc_valor_bol5,
        p_calc_valor_num1,
        p_calc_valor_num2,
        p_calc_valor_num3,
        p_calc_valor_num4,
        p_calc_valor_num5,
        p_calc_valor_str1,
        p_calc_valor_str2,
        p_calc_valor_str3,
        p_calc_valor_str4,
        p_calc_valor_str5,
        p_tarea_obra_proyecto,
        p_tarea_obra_direccion,
        p_tarea_instalacion_sanitaria,
        p_tarea_instalacion_electrica,
        p_tarea_instalacion_contra_incendio,
        p_tarea_instalacion_termomecanica,
        p_tarea_proyecto_estructuras,
        p_tarea_documentacion_ejecutiva,
        p_tarea_supervision_obra,
        p_tarea_observaciones);
      
      -- Obtener el ID del cálculo recién insertado
      SET p_calculo_id = LAST_INSERT_ID();
    END;
  ELSE
    -- Actualizar cálculo existente
    UPDATE Calculos
    SET usuario_id = p_usuario_id,
        tarea_id = p_tarea_id,
        fecha_calculo = COALESCE(p_fecha_calculo, CURDATE()),
        proyecto_nombre = p_proyecto_nombre,
        proyecto_ubicacion = p_proyecto_ubicacion,
        proyecto_cliente = p_proyecto_cliente,
        proyecto_observ = p_proyecto_observ,
        obra_valor_obra = p_obra_valor_obra,
        obra_superficie = p_obra_superficie,
        obra_cotiz_dolar = p_obra_cotiz_dolar,
        obra_tipologia = p_obra_tipologia,
        obra_complejidad = p_obra_complejidad,
        obra_plazo_ejecucion = p_obra_plazo_ejecucion,
        horas = p_horas,
        hasta_60_km = p_hasta_60_km,
        calc_valor_bol1 = p_calc_valor_bol1,
        calc_valor_bol2 = p_calc_valor_bol2,
        calc_valor_bol3 = p_calc_valor_bol3,
        calc_valor_bol4 = p_calc_valor_bol4,
        calc_valor_bol5 = p_calc_valor_bol5,
        calc_valor_num1 = p_calc_valor_num1,
        calc_valor_num2 = p_calc_valor_num2,
        calc_valor_num3 = p_calc_valor_num3,
        calc_valor_num4 = p_calc_valor_num4,
        calc_valor_num5 = p_calc_valor_num5,
        calc_valor_str1 = p_calc_valor_str1,
        calc_valor_str2 = p_calc_valor_str2,
        calc_valor_str3 = p_calc_valor_str3,
        calc_valor_str4 = p_calc_valor_str4,
        calc_valor_str5 = p_calc_valor_str5,
        tarea_obra_proyecto = p_tarea_obra_proyecto,
        tarea_obra_direccion = p_tarea_obra_direccion,
        tarea_instalacion_sanitaria = p_tarea_instalacion_sanitaria,
        tarea_instalacion_electrica = p_tarea_instalacion_electrica,
        tarea_instalacion_contra_incendio = p_tarea_instalacion_contra_incendio,
        tarea_instalacion_termomecanica = p_tarea_instalacion_termomecanica,
        tarea_proyecto_estructuras = p_tarea_proyecto_estructuras,
        tarea_documentacion_ejecutiva = p_tarea_documentacion_ejecutiva,
        tarea_supervision_obra = p_tarea_supervision_obra,
        tarea_observaciones = p_tarea_observaciones
    WHERE calculo_id = p_calculo_id;
  END IF;

call Calculos_Calcular_Honorario(p_calculo_id);  

  -- Commit si todo OK
  COMMIT;
  
  -- Retornar confirmación
  SELECT 'OK' AS status, p_calculo_id AS calculo_id;
END$$

DELIMITER ;


DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_Calcular_Honorario$$

CREATE PROCEDURE Calculos_Calcular_Honorario(
  -- Identificación
  IN p_calculo_id INT
)

BEGIN
  
  declare v_Tarea_codi varchar(10);
  declare v_Tarea_id int;

  select tarea_id into v_Tarea_id from Calculos where calculo_id = p_calculo_id;

  select codi into v_Tarea_codi from Tareas_Profesionales where tarea_id = v_Tarea_id;

case v_Tarea_codi
  when 'PYDOA' then
    -- Lógica para calcular honorarios de obra proyecto
    call Calcular_Honorario_PYDOA(p_calculo_id);
  when 'REPTEC' then
    -- Lógica para calcular honorarios de reparación técnica
    call Calcular_Honorario_REPTEC(p_calculo_id);
  when 'HABI' then
    -- Lógica para calcular honorarios de habilitación
    call Calcular_Honorario_HABI(p_calculo_id);
  when 'ARBI' then
    -- Lógica para calcular honorarios de arbitraje
    call Calcular_Honorario_ARBI(p_calculo_id);
  when 'CONSULT' then
    -- Lógica para calcular honorarios de consultoría
    call Calcular_Honorario_CONSULT(p_calculo_id);
  when 'GPYC' then
    -- Lógica para calcular honorarios de gerencia de proyectos y construcciones
    call Calcular_Honorario_GPYC(p_calculo_id);
  when 'PERI' then
    -- Lógica para calcular honorarios de peritajes
    call Calcular_Honorario_PERI(p_calculo_id);
  when 'HYS' then
    -- Lógica para calcular honorarios de Higiene y Seguridad
    call Calcular_Honorario_HYS(p_calculo_id);
  when 'IMPAMB' then
    -- Lógica para calcular honorarios de Impacto Ambiental
    call Calcular_Honorario_IMPAMB(p_calculo_id);
  when 'MEDPLAN' then
    -- Lógica para calcular honorarios de Medición y ejecución de Planos
    call Calcular_Honorario_MEDPLAN(p_calculo_id);
  when 'CONFAC' then
    -- Lógica para calcular honorarios de confección de planos
    call Calcular_Honorario_CONFAC(p_calculo_id);
  when 'TASA' then
    -- Lógica para calcular honorarios de Tasaciones
    call Calcular_Honorario_TASA(p_calculo_id);
  when 'DEMO' then
    -- Lógica para calcular honorarios de Demoliciones
    call Calcular_Honorario_DEMO(p_calculo_id);
  else
    select concat('Tarea profesional con código erróneo: ', v_Tarea_codi) as mensaje_error;
end case;


END$$

DELIMITER ;


DELIMITER $$

DROP PROCEDURE IF EXISTS Calcular_Honorario_DEMO$$

/**
 * SP Nivel 3: Lógica pura de cálculo de honorarios - SISTEMA MIXTO
 * Tipo: Demoliciones (DEMO)
 * 
 * ⚠️ CONFIDENCIAL: Contiene lógica propietaria del CPAU
 *
 * ALGORITMO:
 * 1. Según Artículo 5 de la Resolución CPAU A115
 * Tareas Profesionales posibles:
 * Proyecto y Dirección Art 5.2
 * Proyecto de obra Art 5.3
 *    - Documentación de proyecto = 30 % del art 5.2
 *    - Dirección de obra = 70 % del art 5.2
 * 
 *
 ******************************************************************************
 * ALTA:
 * - 2026-11-12: 
 ******************************************************************************
 *
 * PARAMETROS:
 * @param p_calculo_id INT - ID del cálculo en tabla Calculos
 */
CREATE PROCEDURE Calcular_Honorario_DEMO(
  IN p_calculo_id INT
)

bloque_principal: BEGIN
  -- ========================================================================
  -- DECLARACIÓN DE VARIABLES LOCALES
  -- ========================================================================
  
  -- Datos del cálculo
  
-- Contiene el código de tarea profesinal a realizar
--
      
  -- Coeficientes según rango
  DECLARE v_tarea_obra_proyecto BOOLEAN;
  DECLARE v_tarea_obra_direccion BOOLEAN;

  DECLARE v_coef_F1 DECIMAL(6,5);
  DECLARE v_coef_F2 DECIMAL(6,5);
  DECLARE v_coef_F3 DECIMAL(6,5);
  DECLARE v_coef_F4 DECIMAL(6,5);
  DECLARE v_coef_F5 DECIMAL(6,5);

  declare v_texto_F1 VARCHAR(255);
  declare v_texto_F2 VARCHAR(255);
  declare v_texto_F3 VARCHAR(255);
  declare v_texto_F4 VARCHAR(255);
  declare v_texto_F5 VARCHAR(255);

  declare v_obra_cant_plantas INT;
  declare v_obra_cant_plantas_iguales INT;

  declare v_obra_valor_obra DECIMAL(15,2);
    
  -- Variables de cálculo de ítems
  DECLARE v_item_numero INT DEFAULT 0;
  DECLARE v_importe_item DECIMAL(15,2);
  DECLARE v_descripcion VARCHAR(500);
  DECLARE v_tarea_profesional VARCHAR(200);

  DECLARE v_valor_Hb DECIMAL(15,2);
  DECLARE v_valor_Ht DECIMAL(15,2);
      
  -- Acumulador de totales
  DECLARE v_total_honorarios DECIMAL(15,2) DEFAULT 0;
    
  -- ========================================================================
  -- PASO 1: LEER DATOS DEL CÁLCULO
  -- ========================================================================

  SELECT 
    tarea_obra_proyecto,
    tarea_obra_direccion,
    calc_valor_num1,
    calc_valor_num2,
    calc_valor_num3,
    calc_valor_num4,
    calc_valor_num5,
    calc_valor_str1,
    calc_valor_str2,
    calc_valor_str3,
    calc_valor_str4,
    calc_valor_str5,
    obra_valor_obra,
    obra_superficie,
    horas
  INTO
    v_tarea_obra_proyecto,
    v_tarea_obra_direccion,
    v_coef_F1,
    v_coef_F2,
    v_coef_F3,
    v_coef_F4,
    v_coef_F5,
    v_texto_F1,
    v_texto_F2,
    v_texto_F3,
    v_texto_F4,
    v_texto_F5,
    v_obra_valor_obra,
    v_obra_cant_plantas,
    v_obra_cant_plantas_iguales
  FROM Calculos
  WHERE calculo_id = p_calculo_id;
  

  -- ========================================================================
  -- PASO 2: CALCULAR HONORARIOS TOTAL ART 5.2
  -- ========================================================================

  SET v_valor_Hb = 0.015;
  SET v_valor_Ht = v_obra_valor_obra * v_valor_Hb * v_coef_F1 * v_coef_F2 * v_coef_F3 * v_coef_F4 * v_coef_F5;


  -- ========================================================================
  -- PASO 3: CALCULAR REDUCCION POR PLANTAS IGUYALES SEGUN ART. 5.2.2
  -- ========================================================================

  IF v_obra_cant_plantas_iguales > 6 THEN
    SET v_valor_Ht = v_valor_Ht * (v_obra_cant_plantas + 6 - v_obra_cant_plantas_iguales) / v_obra_cant_plantas ; -- Aplicar reducción según fórmula del Art. 5.2.2
  END IF;

  -- ========================================================================
  -- PASO 4: GENERAR ITEMS DE HONORARIOS
  -- ========================================================================

  IF v_tarea_obra_proyecto = 1 THEN
    SET v_tarea_profesional = 'Proyecto de Obra';

    SET v_importe_item = ROUND(v_valor_Ht * 0.3);
    

    SET v_descripcion = 'Honorarios por proyecto Art. 5.3 (30% del total Art 5.2)';
    SET v_item_numero = v_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;
  END IF;


  IF v_tarea_obra_direccion = 1 THEN
    SET v_tarea_profesional = 'Dirección de Obra';

    SET v_importe_item = ROUND(v_valor_Ht * 0.7);
  
    SET v_descripcion = 'Honorarios por dirección Art. 5.3 (70% del total Art 5.2)';
    SET v_item_numero = v_item_numero + 1;
    CALL Calculos_Items_Grabar(p_calculo_id, v_item_numero, v_tarea_profesional, v_descripcion, v_importe_item);
    SET v_total_honorarios = v_total_honorarios + v_importe_item;
  END IF;


  -- ========================================================================
  -- PASO 5: ACTUALIZAR METADATA EN MASTER
  -- ========================================================================
  
  UPDATE Calculos SET
    total_honorarios = v_total_honorarios,
    metadata_valor_k = v_valor_Ht,
    metadata_numero_items = v_item_numero
  WHERE calculo_id = p_calculo_id;
  
END bloque_principal$$

DELIMITER ;
