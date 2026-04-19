-- ============================================================================
-- TABLA PRINCIPAL: CÁLCULOS DE HONORARIOS (MASTER)
-- ============================================================================
CREATE TABLE Calc_Maq (
  -- Identificación
  id INT AUTO_INCREMENT PRIMARY KEY,
  calculo_id VARCHAR(50) NOT NULL UNIQUE,
  usuario_id INT NOT NULL,
  tipo_calculo VARCHAR(50) NOT NULL,
  fecha_calculo DATETIME NOT NULL,
  
  -- Datos del Proyecto
  proyecto_nombre VARCHAR(200),
  proyecto_ubicacion VARCHAR(200),
  proyecto_cliente VARCHAR(200),
  
  -- Datos de la Obra
  obra_valor_obra DECIMAL(15,2) NOT NULL,
  obra_superficie DECIMAL(10,2),
  obra_tipologia VARCHAR(100),
  obra_complejidad VARCHAR(50),
  
  -- Tareas Profesionales (boolean flags)
  tarea_obra_proyecto BOOLEAN DEFAULT FALSE,
  tarea_obra_direccion BOOLEAN DEFAULT FALSE,
  tarea_instalacion_sanitaria BOOLEAN DEFAULT FALSE,
  tarea_instalacion_electrica BOOLEAN DEFAULT FALSE,
  tarea_instalacion_contra_incendio BOOLEAN DEFAULT FALSE,
  tarea_instalacion_termomecanica BOOLEAN DEFAULT FALSE,
  tarea_proyecto_estructuras BOOLEAN DEFAULT FALSE,
  
  -- Parámetros de Cálculo
  parametro_valor_k DECIMAL(15,2),
  
  -- Resultado Total
  total_honorarios DECIMAL(15,2) NOT NULL,
  
  -- Metadata del Resultado
  metadata_rango VARCHAR(10),
  metadata_valor_k DECIMAL(15,2),
  metadata_rango_costo_obra DECIMAL(10,4),
  metadata_numero_items INT,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_usuario (usuario_id),
  INDEX idx_fecha (fecha_calculo),
  INDEX idx_calculo_id (calculo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
