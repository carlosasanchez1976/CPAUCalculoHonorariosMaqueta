-- =============================================================================
-- Tabla: Terminos_Condiciones
-- Descripción: Histórico de Términos y Condiciones del sistema
-- Autor: Sistema CH2026
-- Fecha: 2026-08-06
-- Spec: SPEC-029
-- =============================================================================

DROP TABLE IF EXISTS `Terminos_Condiciones`;

CREATE TABLE IF NOT EXISTS `Terminos_Condiciones` (
  `tyc_id` INT NOT NULL AUTO_INCREMENT,
  `version` VARCHAR(20) NOT NULL COMMENT 'Ej: 1.0, 1.1, 2.0',
  `contenido_md` MEDIUMTEXT NOT NULL COMMENT 'Contenido en formato Markdown',
  `vigente` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Solo un registro puede tener TRUE',
  `fecha_vigencia` DATE NOT NULL COMMENT 'Fecha de vigencia',
  `user_id` INT NULL COMMENT 'Usuario que creó esta versión',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`tyc_id`),
  INDEX `idx_vigente` (`vigente`),
  INDEX `idx_fecha_vigencia` (`fecha_vigencia` DESC),
  
  CONSTRAINT `fk_terminos_condiciones_usuario`
    FOREIGN KEY (`user_id`) 
    REFERENCES `Usuarios`(`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
    
) ENGINE = InnoDB
  COMMENT = 'Histórico de Términos y Condiciones del sistema';

-- =============================================================================
-- Notas:
-- - Solo debe existir UN registro con vigente=TRUE en todo momento
-- - La lógica de activación/desactivación se maneja en stored procedures
-- - fecha_vigencia es de tipo DATE para facilitar comparaciones y ordenamiento
-- - Al borrar un usuario, user_id se setea a NULL (ON DELETE SET NULL)
-- =============================================================================
