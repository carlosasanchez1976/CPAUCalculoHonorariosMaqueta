DROP PROCEDURE IF EXISTS Usuarios_Buscar_X_Id_Matricula;

DELIMITER $$
CREATE PROCEDURE `Usuarios_Buscar_X_Id_Matricula`(
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
        fec_ult_act,
        tyc_aceptado_fecha,
        tyc_version_aceptada,
        tyc_id_aceptado
    FROM Usuarios
    WHERE id_matricula = p_id_matricula
      AND (baja_fecha IS NULL OR baja_fecha > NOW());
END$$
DELIMITER ;
