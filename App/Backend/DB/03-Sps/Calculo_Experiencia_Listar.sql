DROP PROCEDURE IF EXISTS Calculo_Experiencia_Listar;
DELIMITER $$

CREATE PROCEDURE Calculo_Experiencia_Listar(
  IN p_fecha_desde date,
  IN p_fecha_hasta date,
  IN p_con_observaciones boolean
)
BEGIN

  SELECT
      calculo_id,
      fecha_calculo,
      usuario_id,
      Usuarios.user_nombre,
      Usuarios.user_apellido,
      Usuarios.id_matricula,
      app_exp_puntaje,
      app_exp_observ
    FROM
      Calculos
      inner join Usuarios on Calculos.usuario_id = Usuarios.user_id
    WHERE
      fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
      AND (p_con_observaciones = false OR app_exp_observ IS NOT NULL);
END$$
DELIMITER ;
