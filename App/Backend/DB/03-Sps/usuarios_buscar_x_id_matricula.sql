DROP PROCEDURE IF EXISTS usuarios_buscar_x_id_matricula;

DELIMITER $$
CREATE PROCEDURE `usuarios_buscar_x_id_matricula`(
    IN p_id_matricula NUMERIC(10,0)
)
BEGIN
    SELECT
        user_id,
        user_mail,
        user_nombre,
        user_apellido,
        username_web,
        matricula,
        id_matricula,
        tipo_matricula,
        rol,
        baja_fecha,
        fec_ult_act
    FROM usuarios
    WHERE id_matricula = p_id_matricula
      AND (baja_fecha IS NULL OR baja_fecha > NOW());
END$$
DELIMITER ;
