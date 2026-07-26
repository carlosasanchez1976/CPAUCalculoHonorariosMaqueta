DROP PROCEDURE IF EXISTS Usuarios_Borrar;

DELIMITER $$
CREATE PROCEDURE `Usuarios_Borrar`
(
	IN p_user_id int,
	IN p_user_modi int
)

BEGIN

	UPDATE
		`Usuarios`
	SET
		baja_fecha = NOW(),
		modi_user_id = p_user_modi,
		fec_ult_act = NOW()
	WHERE
		Usuarios.user_id = p_user_id;


END$$
DELIMITER $$
