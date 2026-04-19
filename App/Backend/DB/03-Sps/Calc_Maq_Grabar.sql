DELIMITER $$

DROP PROCEDURE IF EXISTS Calc_Maq_Grabar$$

CREATE PROCEDURE Calc_Maq_Grabar(
  -- Identificación
  IN p_calculo_id VARCHAR(50),
  IN p_usuario_id INT,
  IN p_tipo_calculo VARCHAR(50),
  IN p_fecha_calculo DATETIME,
  
  -- Datos Proyecto
  IN p_proyecto_nombre VARCHAR(200),
  IN p_proyecto_ubicacion VARCHAR(200),
  IN p_proyecto_cliente VARCHAR(200),
  
  -- Datos Obra
  IN p_obra_valor_obra DECIMAL(15,2),
  IN p_obra_superficie DECIMAL(10,2),
  IN p_obra_tipologia VARCHAR(100),
  IN p_obra_complejidad VARCHAR(50),
  
  -- Tareas Profesionales
  IN p_tarea_obra_proyecto BOOLEAN,
  IN p_tarea_obra_direccion BOOLEAN,
  IN p_tarea_instalacion_sanitaria BOOLEAN,
  IN p_tarea_instalacion_electrica BOOLEAN,
  IN p_tarea_instalacion_contra_incendio BOOLEAN,
  IN p_tarea_instalacion_termomecanica BOOLEAN,
  IN p_tarea_proyecto_estructuras BOOLEAN
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
  
  -- Insertar registro principal (master)
  INSERT INTO Calc_Maq (
    calculo_id, usuario_id, tipo_calculo, fecha_calculo,
    proyecto_nombre, proyecto_ubicacion, proyecto_cliente,
    obra_valor_obra, obra_superficie, obra_tipologia, obra_complejidad,
    tarea_obra_proyecto, tarea_obra_direccion,
    tarea_instalacion_sanitaria, tarea_instalacion_electrica,
    tarea_instalacion_contra_incendio, tarea_instalacion_termomecanica,
    tarea_proyecto_estructuras
  ) VALUES (
    p_calculo_id, p_usuario_id, p_tipo_calculo, p_fecha_calculo,
    p_proyecto_nombre, p_proyecto_ubicacion, p_proyecto_cliente,
    p_obra_valor_obra, p_obra_superficie, p_obra_tipologia, p_obra_complejidad,
    p_tarea_obra_proyecto, p_tarea_obra_direccion,
    p_tarea_instalacion_sanitaria, p_tarea_instalacion_electrica,
    p_tarea_instalacion_contra_incendio, p_tarea_instalacion_termomecanica,
    p_tarea_proyecto_estructuras
  );
  
  -- Insertar items desde JSON array
  -- Aquí de debe ejecutar sp que calcule honorarios en base a los datos de entrada recibidos y grabados

/*
  INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe)
  SELECT 
    p_calculo_id,
    JSON_UNQUOTE(JSON_EXTRACT(item, '$.item')),
    JSON_UNQUOTE(JSON_EXTRACT(item, '$.tareaProfesional')),
    JSON_UNQUOTE(JSON_EXTRACT(item, '$.descripcion')),
    JSON_UNQUOTE(JSON_EXTRACT(item, '$.importe'))
  FROM JSON_TABLE(
    p_items_json,
    '$[*]' COLUMNS(
      item JSON PATH '$'
    )
  ) AS jt;
*/

  -- Commit si todo OK
  COMMIT;
  
  -- Retornar confirmación
  SELECT 'OK' AS status, p_calculo_id AS calculo_id;
END$$

DELIMITER ;
