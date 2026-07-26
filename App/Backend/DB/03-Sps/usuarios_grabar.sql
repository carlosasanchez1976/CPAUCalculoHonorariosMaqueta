drop procedure if exists usuarios_grabar;

DELIMITER $$
CREATE PROCEDURE `usuarios_grabar`(
    IN p_user_id INT,
    IN p_user_mail VARCHAR(150),
    IN p_user_nombre VARCHAR(100),
    IN p_user_apellido VARCHAR(100),
    IN p_password VARCHAR(255),
    IN p_rol VARCHAR(10),
    IN p_modi_user_id INT,
    -- NUEVOS PARÁMETROS PARA AUTENTICACIÓN WEB
    IN p_username_web VARCHAR(20),
    IN p_matricula NUMERIC(10,0),
    IN p_id_matricula NUMERIC(10,0),
    IN p_tipo_matricula VARCHAR(20)
)
BEGIN

IF EXISTS (SELECT 1 FROM usuarios WHERE user_id = p_user_id) THEN
    -- ACTUALIZAR USUARIO EXISTENTE
    UPDATE usuarios
    SET
        user_mail = p_user_mail,
        user_nombre = p_user_nombre,
        user_apellido = p_user_apellido,
        password = COALESCE(p_password, password),
        rol = p_rol,
        username_web = p_username_web,
        matricula = p_matricula,
        id_matricula = p_id_matricula,
        tipo_matricula = p_tipo_matricula,
        modi_user_id = p_modi_user_id,
        fec_ult_act = NOW()
    WHERE
        user_id = p_user_id;

ELSE
    -- INSERTAR NUEVO USUARIO
    BEGIN
        INSERT INTO usuarios (
            user_mail,
            user_nombre,
            user_apellido,
            password,
            rol,
            username_web,
            matricula,
            id_matricula,
            tipo_matricula,
            modi_user_id,
            fec_ult_act
        )
        VALUES (
            p_user_mail,
            p_user_nombre,
            p_user_apellido,
            p_password,
            p_rol,
            p_username_web,
            p_matricula,
            p_id_matricula,
            p_tipo_matricula,
            p_modi_user_id,
            NOW()
        );

        SET p_user_id = LAST_INSERT_ID();
    END;

END IF;

SELECT p_user_id AS user_id;


END$$
DELIMITER ;