
DELIMITER $$
CREATE PROCEDURE Tareas_Profesionales_Grabar(
    IN p_tarea_id INT,
    IN p_codi CHAR(10),
    IN p_descripcion VARCHAR(100),
    IN p_descripcion_larga VARCHAR(255),
    IN p_vigente BOOLEAN,
    IN p_user_id INT
)
BEGIN

    IF p_tarea_id IS NULL THEN
        BEGIN

            INSERT INTO Tareas_Profesionales (codi, descripcion, descripcion_larga, vigente, user_id,created_at)
            VALUES (p_codi, p_descripcion, p_descripcion_larga, p_vigente, p_user_id, CURRENT_TIMESTAMP);
            
            SET p_tarea_id := LAST_INSERT_ID();
        END;
        ELSE
            UPDATE Tareas_Profesionales
            SET 
                codi = p_codi,
                descripcion = p_descripcion,
                descripcion_larga = p_descripcion_larga,
                vigente = p_vigente,
                user_id = p_user_id,
                updated_at = CURRENT_TIMESTAMP
            WHERE tarea_id = p_tarea_id;
    END IF;

    SELECT p_tarea_id AS tarea_id;

END$$

DELIMITER ;