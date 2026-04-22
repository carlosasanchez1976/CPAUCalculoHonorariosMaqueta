drop procedure if exists usuarios_grabar;

DELIMITER $$
CREATE PROCEDURE `usuarios_grabar`(
    in p_user_id INT,
    IN p_user_mail VARCHAR(150),
    IN p_user_nombre VARCHAR(100),
    IN p_user_apellido VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_asesor_codi VARCHAR(10),
    IN p_rol VARCHAR(10),
    IN p_modi_user_id INT
)
BEGIN

IF EXISTS (SELECT 1 FROM usuarios WHERE user_id = p_user_id) THEN

    update usuarios
    set
        user_mail = p_user_mail,
        user_nombre = p_user_nombre,
        user_apellido = p_user_apellido,
        password = p_password,
        asesor_codi = p_asesor_codi,
        rol = p_rol,
        modi_user_id = p_modi_user_id,
        fec_ult_act = NOW()
    where
        user_id = p_user_id;

  else

    BEGIN

    
        INSERT INTO usuarios (user_mail, user_nombre, user_apellido, password, asesor_codi, rol, modi_user_id, fec_ult_act)
        VALUES (p_user_mail, p_user_nombre, p_user_apellido, p_password, p_asesor_codi, p_rol, p_modi_user_id, NOW());

        SET p_user_id = LAST_INSERT_ID();
    END;

END IF;

select p_user_id as user_id;


END$$