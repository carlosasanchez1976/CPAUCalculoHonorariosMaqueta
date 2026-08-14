DROP PROCEDURE IF EXISTS Tareas_Profesionales_Activar;

DELIMITER $$
CREATE PROCEDURE Tareas_Profesionales_Activar(
  IN p_tarea_id INT,
  IN p_vigente BOOLEAN,
  IN p_user_id INT
)
BEGIN

    UPDATE Tareas_Profesionales
      SET
        vigente = p_vigente,
        updated_at = CURRENT_TIMESTAMP,
        user_id = p_user_id
      WHERE
        tarea_id = p_tarea_id;

  select p_tarea_id as tarea_id;

END$$

DELIMITER ;
