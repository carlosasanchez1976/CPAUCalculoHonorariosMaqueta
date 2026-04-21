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

