DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_Calcular_Honorario$$

CREATE PROCEDURE Calculos_Calcular_Honorario(
  -- Identificación
  IN p_calculo_id INT
)

BEGIN
  
  declare v_Tarea_codi varchar(10);
  declare v_Tarea_id int;

  select tarea_id into v_Tarea_id from Calculos where calculo_id = p_calculo_id;

  select codi into v_Tarea_codi from Tareas_Profesionales where tarea_id = v_Tarea_id;

case v_Tarea_codi
  when 'PYDOA' then
    -- Lógica para calcular honorarios de obra proyecto
    call Calcular_Honorario_PYDOA(p_calculo_id);
  when 'REPTEC' then
    -- Lógica para calcular honorarios de reparación técnica
    call Calcular_Honorario_REPTEC(p_calculo_id);
  else
    select concat('Tarea profesional no reconocida: ', v_Tarea_codi) as mensaje_error;
end case;


END$$

DELIMITER ;
