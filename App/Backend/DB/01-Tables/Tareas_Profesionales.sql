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
ADD COLUMN baja_usuario_id INT NULL COMMENT 'Usuario que realizó la baja'