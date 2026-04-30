DELIMITER $$
DROP PROCEDURE IF EXISTS Parametros_Buscar$$

CREATE PROCEDURE Parametros_Buscar(
    IN p_parametro_id INT
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
        parametro_id = p_parametro_id
        and (baja_fecha IS NULL OR baja_fecha > NOW()); -- Solo parámetros activos
END$$

DELIMITER ;