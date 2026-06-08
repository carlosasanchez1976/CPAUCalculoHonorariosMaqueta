CREATE TABLE Tareas_Profesionales (
  -- Identificación
  tarea_id INT AUTO_INCREMENT PRIMARY KEY,
  codi CHAR(10) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  descripcion_larga varchar(255) NULL,
  vigente BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT NULL,

  -- Foreign Key
  FOREIGN KEY (user_id) REFERENCES Usuarios(user_id) ON DELETE CASCADE
  
  
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


ALTER TABLE Tareas_Profesionales
ADD COLUMN baja_fecha DATETIME NULL COMMENT 'Fecha de baja lógica',
ADD COLUMN baja_usuario_id INT NULL COMMENT 'Usuario que realizó la baja';


ALTER TABLE Tareas_Profesionales
ADD COLUMN calc_valor_num1_des VARCHAR(100) NULL AFTER vigente,
ADD COLUMN calc_valor_num2_des VARCHAR(100) NULL AFTER calc_valor_num1_des,
ADD COLUMN calc_rel_id1_des VARCHAR(100) NULL AFTER calc_valor_num2_des,
ADD COLUMN calc_rel_id2_des VARCHAR(100) NULL AFTER calc_rel_id1_des,
ADD COLUMN calc_valor_bol1_des VARCHAR(100) NULL AFTER calc_rel_id2_des,
ADD COLUMN calc_valor_bol2_des VARCHAR(100) NULL AFTER calc_valor_bol1_des;
ADD COLUMN calc_valor_str1_des VARCHAR(100) NULL AFTER calc_valor_bol2_des;
ADD COLUMN calc_valor_str2_des VARCHAR(100) NULL AFTER calc_valor_str1_des;


update Tareas_Profesionales set calc_rel_id1_des = 'Servicio a prestar' where codi = 'REPTEC';
update Tareas_Profesionales set calc_valor_num1_des = 'Capacidad de contratación de la empresa constructora' where codi = 'REPTEC';
update Tareas_Profesionales set calc_valor_num2_des = 'Monto de Obra estimado' where codi = 'REPTEC';
update Tareas_Profesionales set calc_valor_num3_des = 'Monto de Obra' where codi = 'REPTEC';
update tareas_Profesionales set calc_valor_bol1_des = 'La oferta de licitación no fué adjudicada' where codi = 'REPTEC';
update tareas_Profesionales set calc_valor_bol2_des = 'La empresa ha designado otro profesional' where codi = 'REPTEC';


ALTER TABLE Tareas_Profesionales
ADD COLUMN orden tinyint NULL AFTER tarea_id






