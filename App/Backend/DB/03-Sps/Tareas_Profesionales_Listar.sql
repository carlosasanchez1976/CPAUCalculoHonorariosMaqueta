DELIMITER $$

CREATE PROCEDURE Tareas_Profesionales_Listar()
BEGIN
    SELECT 
        tarea_id,
        codi,
        descripcion,
        descripcion_larga,
        vigente,
        created_at,
        updated_at,
        user_id,
        baja_fecha,
        baja_usuario_id
    FROM Tareas_Profesionales
    WHERE baja_fecha IS NULL -- Solo listar tareas que no han sido dadas de baja
    ORDER BY
        vigente DESC, -- Primero las vigentes
        descripcion ASC; -- Luego por descripción
END$$

DELIMITER ;