-- ============================================================================
-- TABLA DE DETALLE: ITEMS DE CADA CÁLCULO (DETALLE)
-- ============================================================================
CREATE TABLE Calc_Maq_Items (
  -- Identificación
  id INT AUTO_INCREMENT PRIMARY KEY,
  calculo_id VARCHAR(50) NOT NULL,
  item_numero INT NOT NULL,
  
  -- Datos del Item
  tarea_profesional VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  importe DECIMAL(15,2) NOT NULL,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key
  FOREIGN KEY (calculo_id) REFERENCES Calc_Maq(calculo_id) ON DELETE CASCADE,
  
  -- Índices
  INDEX idx_calculo (calculo_id),
  INDEX idx_item (item_numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;