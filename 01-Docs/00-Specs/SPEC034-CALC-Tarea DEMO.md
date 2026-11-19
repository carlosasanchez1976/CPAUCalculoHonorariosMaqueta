Implementar cambios en el backend para agregar EL TIPO DE CALCULO:

DEMOLICIONES

0 - Realizar modificaciones al backend (tablas)
1 - Identificar y modificar sps de cálculo de honorarios
2 - Modificar APIs de cálculo (si corresponde)
3 - Se debe modificar template de PDF. Analizar e implementar.
4 - Asignar template correspondiente al tipo de tarea_id



0 - TABLES

-- DEMO - Demoliciones
ALTER TABLE Tareas_Profesionales ADD COLUMN calc_valor_num5_des VARCHAR(100) NULL AFTER calc_valor_num4_des;

update Tareas_Profesionales set vigente = 1 where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num1_des = 'Coeficiente F1 - Estado de conservación del edificio' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num2_des = 'Coeficiente F2 - Tipo de estructura resistente' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num3_des = 'Coeficiente F3 - Precauciones especiales - linderos' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num4_des = 'Coeficiente F4 - Precauciones especiales - sótanos' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num5_des = 'Coeficiente F5 - Características de la obra' where codi = 'DEMO';



--call Tareas_Profesionales_Entregables_Grabar(null,13,2,1,1);


alter table Calculos add column calc_valor_str3 varchar(255) null after calc_valor_str2;
alter table Calculos add column calc_valor_str4 varchar(255) null after calc_valor_str3;
alter table Calculos add column calc_valor_str5 varchar(255) null after calc_valor_str4;


1 - SPs

Calculos_Grabar


