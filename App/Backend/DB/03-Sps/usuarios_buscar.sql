drop procedure if exists usuarios_buscar;

DELIMITER $$
CREATE PROCEDURE `usuarios_buscar`
(
	IN p_user_id int
)

BEGIN

	SELECT
		`usuarios`.`user_id`,
		`usuarios`.`user_nombre`,
		`usuarios`.`user_apellido`,
		`usuarios`.`fec_ult_act`,
		`usuarios`.`baja_fecha`,
        `usuarios`.`user_mail`,
		usuarios.asesor_codi,
        usuarios.rol,
		`usuarios`.`password`,
		`usuarios`.`modi_user_id`
	FROM
		`usuarios`
	WHERE
		usuarios.user_id = p_user_id;


END$$
DELIMITER $$
