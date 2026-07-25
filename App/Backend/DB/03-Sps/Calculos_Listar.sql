DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_Listar$$

CREATE PROCEDURE Calculos_Listar
(
  IN p_calculo_id_desde INT,
  IN p_calculo_id_hasta INT,
  IN p_fecha_desde DATETIME,
  IN p_fecha_hasta DATETIME,
  IN p_usuario_id INT,
  IN p_tarea_id INT
)

BEGIN

  SELECT
    cal.calculo_id,
    cal.tarea_id,
    t.codi AS tarea_codi,
    t.descripcion AS tarea_descripcion,
    cal.fecha_calculo,
    cal.proyecto_nombre,
    cal.proyecto_ubicacion,
    cal.proyecto_cliente,
    cal.proyecto_observ,
    cal.calc_valor_num1,
    cal.calc_valor_num2,
    cal.calc_valor_num3,
    cal.calc_valor_num4,
    cal.calc_valor_bol1,
    cal.calc_valor_bol2,
    cal.calc_valor_bol3,
    cal.calc_valor_bol4,
    cal.calc_valor_bol5,
    cal.calc_valor_str1,
    cal.calc_valor_str2,
    cal.obra_valor_obra,
    cal.obra_superficie,
    cal.obra_tipologia,
    cal.obra_complejidad,
    cal.horas,
    cal.hasta_60_km,
    cal.tarea_obra_proyecto,
    cal.tarea_obra_direccion,
    cal.tarea_instalacion_sanitaria,
    cal.tarea_instalacion_electrica,
    cal.tarea_instalacion_contra_incendio,
    cal.tarea_instalacion_termomecanica,
    cal.tarea_proyecto_estructuras,
    cal.tarea_documentacion_ejecutiva,
    cal.tarea_supervision_obra,
    cal.parametro_valor_k,
    cal.total_honorarios,
    cal.metadata_rango,
    cal.metadata_numero_items,
    cal.metadata_valor_k,
    cal.metadata_rango_costo_obra,
    cal.created_at,
    cal.usuario_id,
    u.user_nombre,
    u.user_apellido
  FROM
    Calculos cal
    INNER JOIN Usuarios u ON cal.usuario_id = u.user_id
    INNER JOIN Tareas_Profesionales t ON cal.tarea_id = t.tarea_id
  WHERE (p_calculo_id_desde IS NULL OR cal.calculo_id >= p_calculo_id_desde)
    AND (p_calculo_id_hasta IS NULL OR cal.calculo_id <= p_calculo_id_hasta)
    AND (p_fecha_desde IS NULL OR cal.fecha_calculo >= p_fecha_desde)
    AND (p_fecha_hasta IS NULL OR cal.fecha_calculo <= p_fecha_hasta)
    AND (p_usuario_id IS NULL OR cal.usuario_id = p_usuario_id)
    AND (p_tarea_id IS NULL OR cal.tarea_id = p_tarea_id);
    
END$$
