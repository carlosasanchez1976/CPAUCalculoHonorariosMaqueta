ALTER TABLE Tareas_Profesionales ADD COLUMN calc_valor_num5_des VARCHAR(100) NULL AFTER calc_valor_num4_des;
ALTER TABLE Tareas_Profesionales ADD COLUMN calc_valor_str4_des VARCHAR(100) NULL AFTER calc_valor_str3_des;
ALTER TABLE Tareas_Profesionales ADD COLUMN calc_valor_str5_des VARCHAR(100) NULL AFTER calc_valor_str4_des;


alter table Calculos add column calc_valor_str3 varchar(255) null after calc_valor_str2;
alter table Calculos add column calc_valor_str4 varchar(255) null after calc_valor_str3;
alter table Calculos add column calc_valor_str5 varchar(255) null after calc_valor_str4;


update Tareas_Profesionales set vigente = 1 where codi = 'DEMO';
update Tareas_Profesionales set calc_obra_valor_obra_des = 'Valor tasación obra a valor reposición exc terreno' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num1_des = 'Coeficiente F1 - Estado de conservación del edificio' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num2_des = 'Coeficiente F2 - Tipo de estructura resistente' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num3_des = 'Coeficiente F3 - Precauciones especiales - linderos' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num4_des = 'Coeficiente F4 - Precauciones especiales - sótanos' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_num5_des = 'Coeficiente F5 - Características de la obra' where codi = 'DEMO';
-- call Tareas_Profesionales_Entregables_Grabar(null,13,2,1,1);

update Tareas_Profesionales set calc_valor_str1_des = 'Coeficiente F1 - Estado de conservación del edificio' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_str2_des = 'Coeficiente F2 - Tipo de estructura resistente' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_str3_des = 'Coeficiente F3 - Precauciones especiales - linderos' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_str4_des = 'Coeficiente F4 - Precauciones especiales - sótanos' where codi = 'DEMO';
update Tareas_Profesionales set calc_valor_str5_des = 'Coeficiente F5 - Características de la obra' where codi = 'DEMO';
