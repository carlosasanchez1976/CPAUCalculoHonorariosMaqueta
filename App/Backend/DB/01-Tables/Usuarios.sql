DROP TABLE IF EXISTS `Usuarios` ;

CREATE TABLE IF NOT EXISTS `Usuarios` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `user_mail` VARCHAR(150) NULL,
  `user_nombre` VARCHAR(100) NULL,
  `user_apellido` VARCHAR(100) NULL,
  `password` VARCHAR(255) NOT NULL,
  `rol` VARCHAR(10) NULL,
  `baja_fecha` DATE NULL,
  `modi_user_id` INT NULL,
  `fec_ult_act` DATETIME NULL,
  PRIMARY KEY (`user_id`))
ENGINE = InnoDB;


alter table Usuarios add column `username_web` VARCHAR(20) NULL after `user_apellido`;
alter table Usuarios add column `matricula` numeric(10,0) NULL after `username_web`;
alter table Usuarios add column `id_matricula` numeric(10,0) NULL after `matricula`;
alter table Usuarios add column `tipo_matricula` varchar(20) NULL after `id_matricula`;


alter table Usuarios modify column `password` VARCHAR(255) NULL;

alter table Usuarios add unique index `idx_id_matricula` (`id_matricula`);

alter table Usuarios modify column `username_web` VARCHAR(255) NULL;

CREATE INDEX idx_usuarios_fec_ult_act ON Usuarios(fec_ult_act);

ALTER TABLE `Usuarios` 
  ADD COLUMN `tyc_aceptado_fecha` DATETIME NULL 
    COMMENT 'Fecha-hora de aceptación TyC. NULL = debe aceptar',
  ADD COLUMN `tyc_version_aceptada` VARCHAR(20) NULL 
    COMMENT 'Versión aceptada (ej: 1.0)',
  ADD COLUMN `tyc_id_aceptado` INT NULL 
    COMMENT 'ID del documento de TyC aceptado',
  ADD INDEX `idx_tyc_aceptado` (`tyc_aceptado_fecha`);

-- FK opcional (por si se borra el TyC del histórico)
ALTER TABLE `Usuarios` 
  ADD CONSTRAINT `fk_usuarios_tyc` 
  FOREIGN KEY (`tyc_id_aceptado`) 
  REFERENCES `Terminos_Condiciones`(`tyc_id`) 
  ON DELETE SET NULL;

