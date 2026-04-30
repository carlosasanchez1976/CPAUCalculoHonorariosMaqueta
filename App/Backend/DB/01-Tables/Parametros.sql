-- =============================================
-- Tabla: Parametros
-- Descripción: Parámetros de configuración general del sistema
-- =============================================

CREATE TABLE IF NOT EXISTS Parametros (
  parametro_id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre identificador del parámetro (camelCase)',
  tipo VARCHAR(20) NOT NULL COMMENT 'Tipo de dato: toggle, number, text',
  valor TEXT NOT NULL COMMENT 'Valor del parámetro (almacenado como string, se interpreta según tipo)',
  descripcion TEXT COMMENT 'Descripción del parámetro',
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT COMMENT 'ID del usuario que creó el parámetro',
  
  -- Índices
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Parámetros de configuración general del sistema';

alter table Parametros add baja_fecha datetime null comment 'Fecha de baja lógica del parámetro';
alter table Parametros add baja_user_id int null comment 'ID del usuario que dio de baja el parámetro';

-- =============================================
-- Datos iniciales
-- =============================================

INSERT INTO Parametros (parametro_id, nombre, tipo, valor, descripcion) VALUES
(1, 'validarUsuarioCPAU', 'toggle', 'true', 'Validar usuario con la base del CPAU'),
(2, 'valorK', 'number', '589183947.83', 'Valor índice de referencia cálculo de Honorarios CPAU'),
(3, 'limpiarMemoria', 'toggle', 'true', 'Limpiar memoria al ingresar a la aplicación')
ON DUPLICATE KEY UPDATE 
  tipo = VALUES(tipo),
  valor = VALUES(valor),
  descripcion = VALUES(descripcion);



