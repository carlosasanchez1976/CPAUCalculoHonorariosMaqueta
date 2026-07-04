
DROP PROCEDURE IF EXISTS Tareas_Profesionales_Entregables_Grabar;

DELIMITER $$

CREATE PROCEDURE Tareas_Profesionales_Entregables_Grabar(
  IN p_taen_id INT,
  IN p_tarea_id INT,
  IN p_entregable_id INT,
  IN p_orden INT,
  IN p_user_id INT
)
BEGIN

  IF  p_taen_id IS NULL THEN
    -- Insertar un nuevo registro
    INSERT INTO Tareas_Profesionales_Entregables_PDF (tarea_id, entregable_id, orden, user_id)
    VALUES (p_tarea_id, p_entregable_id, p_orden, p_user_id);

    set p_taen_id = LAST_INSERT_ID();
    
  ELSE

    -- Actualizar el registro existente
    UPDATE Tareas_Profesionales_Entregables_PDF
      SET
        tarea_id = p_tarea_id,
        entregable_id = p_entregable_id,
        orden = p_orden,
        updated_at = CURRENT_TIMESTAMP,
        user_id = p_user_id,
        baja_fecha = NULL
      WHERE
        taen_id = p_taen_id;
  END IF;

  select p_taen_id as taen_id;

END;

DELIMITER ;