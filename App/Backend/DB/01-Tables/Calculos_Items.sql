-- ============================================================================
-- TABLA DE DETALLE: ITEMS DE CADA CÁLCULO (DETALLE)
-- ============================================================================
CREATE TABLE Calculos_Items (
  -- Identificación
  calculo_item_id INT AUTO_INCREMENT PRIMARY KEY,
  calculo_id INT NOT NULL,
  item_numero INT NOT NULL,
  
  -- Datos del Item
  tarea_profesional VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  importe DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (calculo_id) REFERENCES Calculos(calculo_id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_calculo (calculo_id)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;