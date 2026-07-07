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
  when 'HABI' then
    -- Lógica para calcular honorarios de habilitación
    call Calcular_Honorario_HABI(p_calculo_id);
  when 'ARBI' then
    -- Lógica para calcular honorarios de arbitraje
    call Calcular_Honorario_ARBI(p_calculo_id);
  when 'CONSULT' then
    -- Lógica para calcular honorarios de consultoría
    call Calcular_Honorario_CONSULT(p_calculo_id);
  when 'GPYC' then
    -- Lógica para calcular honorarios de gerencia de proyectos y construcciones
    call Calcular_Honorario_GPYC(p_calculo_id);
  when 'PERI' then
    -- Lógica para calcular honorarios de peritajes
    call Calcular_Honorario_PERI(p_calculo_id);
  when 'HYS' then
    -- Lógica para calcular honorarios de Higiene y Seguridad
    call Calcular_Honorario_HYS(p_calculo_id);
  else
    select concat('Tarea profesional con código erróneo: ', v_Tarea_codi) as mensaje_error;
end case;


END$$

DELIMITER ;
