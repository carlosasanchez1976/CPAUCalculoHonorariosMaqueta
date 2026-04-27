
DELIMITER $$
CREATE PROCEDURE Tareas_Profesionales_Borrar(
    IN p_tarea_id INT,
    IN p_user_id INT
)
BEGIN

    UPDATE Tareas_Profesionales
    SET 
        baja_fecha = CURRENT_TIMESTAMP,
        baja_usuario_id = p_user_id
    WHERE tarea_id = p_tarea_id;

END$$

DELIMITER ;