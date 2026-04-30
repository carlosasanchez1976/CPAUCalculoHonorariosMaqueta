-- =============================================
-- Tabla: Parametros_Historico
-- Descripción: Historial de cambios de los parámetros de configuración general del sistema
-- =============================================

CREATE TABLE IF NOT EXISTS Parametros_Historico (
  historico_id INT AUTO_INCREMENT PRIMARY KEY,
  parametro_id INT NOT NULL COMMENT 'ID del parámetro original',
  nombre VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre identificador del parámetro (camelCase)',
  tipo VARCHAR(20) NOT NULL COMMENT 'Tipo de dato: toggle, number, text',
  valor TEXT NOT NULL COMMENT 'Valor del parámetro (almacenado como string, se interpreta según tipo)',
  descripcion TEXT COMMENT 'Descripción del parámetro',
  
  -- Auditoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT COMMENT 'ID del usuario que creó el parámetro',
  
  -- Índices
  INDEX idx_parametro_id (parametro_id),
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historial de cambios de los parámetros de configuración general del sistema';

