DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_GetByID$$

CREATE PROCEDURE Calculos_GetByID(
  IN p_calculo_id INT
)
BEGIN
  SELECT 
    c.calculo_id,
    c.usuario_id,
    i.calculo_item_id,
    i.item_numero,
    i.tarea_profesional,
    i.descripcion,
    i.importe,
    i.created_at,
    c.total_honorarios,
    c.metadata_rango,
    c.fecha_calculo,
    c.proyecto_nombre,
    c.proyecto_ubicacion,
    c.obra_valor_obra
  FROM Calculos c
  INNER JOIN Calculos_Items i ON i.calculo_id = c.calculo_id
  WHERE c.calculo_id = p_calculo_id
  ORDER BY i.item_numero;
END$$

DELIMITER ;
