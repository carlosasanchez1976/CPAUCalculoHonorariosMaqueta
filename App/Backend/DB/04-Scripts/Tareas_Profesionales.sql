update Tareas_Profesionales set calc_rel_id1_des = 'Servicio a prestar' where codi = 'REPTEC';
update Tareas_Profesionales set calc_valor_num1_des = 'Capacidad de contratación de la empresa constructora' where codi = 'REPTEC';
update Tareas_Profesionales set calc_valor_num2_des = 'Monto de Obra estimado' where codi = 'REPTEC';
update Tareas_Profesionales set calc_valor_num3_des = 'Monto de Obra' where codi = 'REPTEC';
update tareas_Profesionales set calc_valor_bol1_des = 'La oferta de licitación no fué adjudicada' where codi = 'REPTEC';
update tareas_Profesionales set calc_valor_bol2_des = 'La empresa ha designado otro profesional' where codi = 'REPTEC';



update tareas_profesionales set orden = 1 where codi = 'PYDOA';
update tareas_profesionales set orden = 2 where codi = 'HABI';
update tareas_profesionales set orden = 3 where codi = 'CONFAC';
update tareas_profesionales set orden = 4 where codi = 'REPTEC';
update tareas_profesionales set orden = 5 where codi = 'MEDPLAN';
update tareas_profesionales set orden = 6 where codi = 'IMPAMB';
update tareas_profesionales set orden = 7 where codi = 'PERI';
update tareas_profesionales set orden = 8 where codi = 'CONSULT';
update tareas_profesionales set orden = 8 where codi = 'ARBI';
update tareas_profesionales set orden = 9 where codi = 'TASA';
update tareas_profesionales set orden = 10 where codi = 'DEMO';
update tareas_profesionales set orden = 11 where codi = 'HYS';
update tareas_profesionales set orden = 12 where codi = 'GPYC';
update tareas_profesionales set orden = 13 where codi = 'SAUTO';
update tareas_profesionales set orden = 14 where codi = 'URBA';
update tareas_profesionales set orden = 15 where codi = 'DISINT';
update tareas_profesionales set orden = 16 where codi = 'DISPAI';


update Usuarios set rol = 'ADMIN' where matricula = 28003;