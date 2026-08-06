DELIMITER $$

DROP PROCEDURE IF EXISTS Usuarios_Listar$$

CREATE PROCEDURE Usuarios_Listar()
BEGIN
    SELECT 
        user_id,
        user_mail,
        user_nombre,
        user_apellido,
        rol,
        baja_fecha,
        modi_user_id,
        fec_ult_act,
        username_web,
        matricula,
        id_matricula,
        tipo_matricula,
        tyc_aceptado_fecha,
        tyc_version_aceptada,
        tyc_id_aceptado
    FROM Usuarios
    WHERE baja_fecha IS NULL
    ORDER BY user_apellido, user_nombre;
END$$

DELIMITER ;
