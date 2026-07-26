DROP PROCEDURE IF EXISTS Calculo_Experiencia;
DELIMITER $$

CREATE PROCEDURE Calculo_Experiencia(
  IN p_calculo_id INT,
  IN p_app_exp_puntaje NUMERIC(1,0),
  IN p_app_exp_observ VARCHAR(255)
)
BEGIN
  UPDATE Calculos
  SET app_exp_puntaje = p_app_exp_puntaje,
      app_exp_observ = p_app_exp_observ
  WHERE calculo_id = p_calculo_id;
END$$
DELIMITER ;
