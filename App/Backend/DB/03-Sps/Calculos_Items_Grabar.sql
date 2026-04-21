DELIMITER $$
DROP PROCEDURE IF EXISTS Calculos_Items_Grabar$$


CREATE PROCEDURE Calculos_Items_Grabar (
  -- Identificación
  IN p_calculo_id INT,
  IN p_item_numero INT,
  
  -- Datos del Item
  IN p_tarea_profesional VARCHAR(200),
  IN p_descripcion TEXT,
  IN p_importe DECIMAL(15,2)
)
BEGIN
  INSERT INTO Calculos_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe)
  VALUES (p_calculo_id, p_item_numero, p_tarea_profesional, p_descripcion, p_importe);
END;
$$