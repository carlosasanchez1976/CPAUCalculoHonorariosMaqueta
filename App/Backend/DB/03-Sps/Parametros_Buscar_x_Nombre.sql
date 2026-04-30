DELIMITER $$
DROP PROCEDURE IF EXISTS Parametros_Buscar_x_Nombre$$

CREATE PROCEDURE Parametros_Buscar_x_Nombre(
    IN p_nombre_id VARCHAR(100)
) 
BEGIN

    SELECT 
        parametro_id, 
        nombre, 
        tipo, 
        valor, 
        descripcion, 
        fecha_creacion, 
        user_id
    FROM
        Parametros
    WHERE   
        nombre = p_nombre_id
        and (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos
END$$

DELIMITER ;