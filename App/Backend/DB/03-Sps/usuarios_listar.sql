DELIMITER $$

DROP PROCEDURE IF EXISTS usuarios_listar$$

CREATE PROCEDURE usuarios_listar()
BEGIN
    SELECT 
        user_id,
        user_mail,
        user_nombre,
        user_apellido,
        asesor_codi,
        rol,
        baja_fecha,
        modi_user_id,
        fec_ult_act
    FROM usuarios
    WHERE baja_fecha IS NULL
    ORDER BY user_apellido, user_nombre;
END$$

DELIMITER ;
