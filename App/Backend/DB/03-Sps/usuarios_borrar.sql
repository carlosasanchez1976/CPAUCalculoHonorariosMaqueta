drop procedure if exists usuarios_borrar;

DELIMITER $$
CREATE PROCEDURE `usuarios_borrar`
(
	IN p_user_id int,
	IN p_user_modi int
)

BEGIN

	UPDATE
		`usuarios`
	SET
		baja_fecha = NOW(),
		modi_user_id = p_user_modi,
		fec_ult_act = NOW()
	WHERE
		usuarios.user_id = p_user_id;


END$$
DELIMITER $$
