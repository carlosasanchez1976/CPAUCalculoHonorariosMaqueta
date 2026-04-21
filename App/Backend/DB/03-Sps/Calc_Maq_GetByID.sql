DELIMITER $$

DROP PROCEDURE IF EXISTS Calc_Maq_GetByID$$

CREATE PROCEDURE Calc_Maq_GetByID(
  IN p_calculo_id VARCHAR(50)
)
BEGIN
  SELECT 
    i.id,
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
  FROM Calc_Maq_Items i
  INNER JOIN Calc_Maq c ON i.calculo_id = c.calculo_id
  WHERE i.calculo_id = p_calculo_id
  ORDER BY i.item_numero;
END$$

DELIMITER ;
