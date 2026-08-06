DROP PROCEDURE IF EXISTS Usuarios_Buscar_X_Email;

DELIMITER $$
CREATE PROCEDURE `Usuarios_Buscar_X_Email`
(
	IN p_user_mail varchar(150)
)

BEGIN

	SELECT
		`Usuarios`.`user_id`,
		`Usuarios`.`user_nombre`,
		`Usuarios`.`user_apellido`,
		`Usuarios`.`fec_ult_act`,
		`Usuarios`.`baja_fecha`,
        `Usuarios`.`user_mail`,
        Usuarios.rol,
		`Usuarios`.`password`,
		`Usuarios`.`modi_user_id`,
		`Usuarios`.`username_web`,
		`Usuarios`.`matricula`,
		`Usuarios`.`id_matricula`,
		`Usuarios`.`tipo_matricula`,
		`Usuarios`.`tyc_aceptado_fecha`,
		`Usuarios`.`tyc_version_aceptada`,
		`Usuarios`.`tyc_id_aceptado`
	FROM
		`Usuarios`
	WHERE
		Usuarios.user_mail = p_user_mail;


END$$
DELIMITER $$
