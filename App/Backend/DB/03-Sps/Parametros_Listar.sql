DELIMITER $$
DROP PROCEDURE IF EXISTS Parametros_Listar$$

CREATE PROCEDURE Parametros_Listar()
    
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
        baja_fecha IS NULL OR baja_fecha > NOW(); -- Solo parámetros activos
END$$

DELIMITER ;