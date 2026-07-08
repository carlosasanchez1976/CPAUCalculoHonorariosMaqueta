DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_Grabar$$

CREATE PROCEDURE Calculos_Grabar(
  -- Identificación
  IN p_calculo_id INT,
  IN p_usuario_id INT,
  IN p_tarea_id INT,
  IN p_fecha_calculo DATETIME,
  
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
  IN p_calc_valor_num1 DECIMAL(15,2),
  IN p_calc_valor_num2 DECIMAL(15,2),
  IN p_calc_valor_num3 DECIMAL(15,2),

  -- Datos Obra
  IN p_obra_valor_obra DECIMAL(15,2),
  IN p_obra_superficie DECIMAL(10,2),
  IN p_obra_cotiz_dolar DECIMAL(15,2),
  IN p_obra_tipologia VARCHAR(100),
  IN p_obra_complejidad VARCHAR(50),
  
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
        horas,
        hasta_60_km,
        calc_valor_bol1,
        calc_valor_bol2,
        calc_valor_bol3,
        calc_valor_num1,
        calc_valor_num2,
        calc_valor_num3,
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
        p_fecha_calculo,
        p_proyecto_nombre,
        p_proyecto_ubicacion,
        p_proyecto_cliente,
        p_proyecto_observ,
        p_obra_valor_obra,
        p_obra_superficie,
        p_obra_cotiz_dolar,
        p_obra_tipologia,
        p_obra_complejidad,
        p_horas,
        p_hasta_60_km,
        p_calc_valor_bol1,
        p_calc_valor_bol2,
        p_calc_valor_bol3,
        p_calc_valor_num1,
        p_calc_valor_num2,
        p_calc_valor_num3,
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
        fecha_calculo = p_fecha_calculo,
        proyecto_nombre = p_proyecto_nombre,
        proyecto_ubicacion = p_proyecto_ubicacion,
        proyecto_cliente = p_proyecto_cliente,
        proyecto_observ = p_proyecto_observ,
        obra_valor_obra = p_obra_valor_obra,
        obra_superficie = p_obra_superficie,
        obra_cotiz_dolar = p_obra_cotiz_dolar,
        obra_tipologia = p_obra_tipologia,
        obra_complejidad = p_obra_complejidad,
        horas = p_horas,
        hasta_60_km = p_hasta_60_km,
        calc_valor_bol1 = p_calc_valor_bol1,
        calc_valor_bol2 = p_calc_valor_bol2,
        calc_valor_bol3 = p_calc_valor_bol3,
        calc_valor_num1 = p_calc_valor_num1,
        calc_valor_num2 = p_calc_valor_num2,
        calc_valor_num3 = p_calc_valor_num3,
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
