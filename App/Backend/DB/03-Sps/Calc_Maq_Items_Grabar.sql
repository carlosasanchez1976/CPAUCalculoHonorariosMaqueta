DELIMITER $$
DROP PROCEDURE IF EXISTS Calc_Maq_Items_Grabar$$


CREATE PROCEDURE Calc_Maq_Items_Grabar (
  -- Identificación
  IN p_calculo_id VARCHAR(50),
  IN p_item_numero INT,
  
  -- Datos del Item
  IN p_tarea_profesional VARCHAR(200),
  IN p_descripcion TEXT,
  IN p_importe DECIMAL(15,2)
)
BEGIN
  INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe)
  VALUES (p_calculo_id, p_item_numero, p_tarea_profesional, p_descripcion, p_importe);
END;
$$