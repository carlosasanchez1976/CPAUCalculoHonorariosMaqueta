
-- GPYC - Gerencia de Proyectos y Construcciones
update Tareas_Profesionales set vigente = 1 where codi = 'GPYC';
update Tareas_Profesionales set calc_obra_valor_obra_des = 'Honorarios y retribuciones de los agentes gerenciados' where codi = 'GPYC';
update Tareas_Profesionales set calc_valor_num1_des = 'Honorarios del profesional a cargo del proyecto' where codi = 'GPYC';
update Tareas_Profesionales set calc_valor_num2_des = 'Honorarios del profesional a cargo de la dirección de las obras' where codi = 'GPYC';
update Tareas_Profesionales set calc_valor_num3_des = 'Monto de los trabajos que se ejecutan por administración' where codi = 'GPYC';
update Tareas_Profesionales set calc_valor_bol1_des = 'Incluye trabajos de administración' where codi = 'GPYC';


-- PERI Peritajes
update Tareas_Profesionales set vigente = 1 where codi = 'PERI';
update Tareas_Profesionales set calc_valor_bol1_des = 'Desconoce el valor en juego' where codi = 'PERI';
update Tareas_Profesionales set calc_valor_num1_des = 'Monto del Valor en juego' where codi = 'PERI';
call Tareas_Profesionales_Entregables_Grabar(null,9,2,1,1);


-- HYS Higiene y Seguridad
update Tareas_Profesionales set vigente = 1 where codi = 'HYS';
call Tareas_Profesionales_Entregables_Grabar(null,10,2,1,1);
update Tareas_Profesionales set calc_valor_bol1_des = 'Existe monto convenido para las tareas' where codi = 'HYS';
update Tareas_Profesionales set calc_valor_bol2_des = 'Agrega tareas adicionales(hs)' where codi = 'HYS';
update Tareas_Profesionales set calc_valor_num1_des = 'Monto convenido para las tareas' where codi = 'HYS';


-- MEDPLAN - Medición y ejecución de Planos
update Tareas_Profesionales set vigente = 1 where codi = 'MEDPLAN';
call Tareas_Profesionales_Entregables_Grabar(null,7,2,1,1);
update Tareas_Profesionales set calc_valor_bol1_des = 'Medición de construcción existente para determinar la superficie cubierta' where codi = 'MEDPLAN';
update Tareas_Profesionales set calc_valor_bol2_des = 'Med. de construcciones poco compartimentadas c/ejec. de planos inc/locales, muros, vanos, etc.' where codi = 'MEDPLAN';
update Tareas_Profesionales set calc_valor_bol3_des = 'Med. de construcciones muy compartimentadas c/ejec. de planos inc/locales, muros, vanos, etc.' where codi = 'MEDPLAN';
update Tareas_Profesionales set calc_valor_num1_des = 'Superficie m2' where codi = 'MEDPLAN';
update Tareas_Profesionales set calc_valor_num2_des = 'Superficie m2' where codi = 'MEDPLAN';
update Tareas_Profesionales set calc_valor_num3_des = 'Superficie m2' where codi = 'MEDPLAN';








