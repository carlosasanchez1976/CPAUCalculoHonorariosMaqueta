-- ============================================================================
-- TABLA DE RELACIÓN: Tareas_Profesionales_Entregables_PDF
-- Mapea qué plantilla PDF corresponde a cada tarea profesional
-- Proyecto: CH2026 - CPAU Cálculo de Honorarios
-- Fecha: 2026-06-10
-- SPEC: SPEC010-CALC-Entregables (T010-001)
-- ============================================================================

DROP TABLE IF EXISTS Tareas_Profesionales_Entregables_PDF;

CREATE TABLE Tareas_Profesionales_Entregables_PDF (
  -- Identificación
  taen_id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Relaciones
  tarea_id INT NOT NULL,
  entregable_id INT NOT NULL,
  
  -- Configuración de la relación
  activo BOOLEAN DEFAULT TRUE COMMENT 'Permite desactivar sin borrar el registro',
  orden INT DEFAULT 1 COMMENT 'Orden de prioridad si hay múltiples entregables por tarea',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT COMMENT 'Usuario que creó/modificó la relación',
  baja_fecha DATETIME DEFAULT NULL COMMENT 'Fecha de baja de la relación, NULL = activa',
  
  -- Índices y constraints
  UNIQUE KEY unique_tarea_entregable (tarea_id, entregable_id),
  INDEX idx_tarea_activo (tarea_id, activo),
  
  -- Foreign keys
  FOREIGN KEY (tarea_id) REFERENCES Tareas_Profesionales(tarea_id) ON DELETE CASCADE,
  FOREIGN KEY (entregable_id) REFERENCES Entregables_PDF(entregable_id) ON DELETE CASCADE
  
) 
COMMENT='Relación N:N entre tareas profesionales y plantillas de entregables PDF';
