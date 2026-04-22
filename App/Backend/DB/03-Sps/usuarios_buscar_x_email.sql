drop procedure if exists usuarios_buscar_x_email;

DELIMITER $$
CREATE PROCEDURE `usuarios_buscar_x_email`
(
	IN p_user_mail varchar(150)
)

BEGIN

	SELECT
		`usuarios`.`user_id`,
		`usuarios`.`user_nombre`,
		`usuarios`.`user_apellido`,
		`usuarios`.`fec_ult_act`,
		`usuarios`.`baja_fecha`,
        `usuarios`.`user_mail`,
        usuarios.rol,
		`usuarios`.`password`,
		`usuarios`.`modi_user_id`
	FROM
		`usuarios`
	WHERE
		usuarios.user_mail = p_user_mail;


END$$
DELIMITER $$
