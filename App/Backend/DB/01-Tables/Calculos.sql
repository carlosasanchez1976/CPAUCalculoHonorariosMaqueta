-- =========================10000Calculos===================================================
-- TABLA PRINCIPAL: CÁLCULOS DE HONORARIOS (MASTER)
-- ============================================================================
DROP TABLE IF EXISTS Calculos;

CREATE TABLE Calculos (
  -- Identificación
  calculo_id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tarea_id INT NOT NULL,
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
  parametro_valor_k DECIMAL(15,2) DEFAULT 0.00,
  
  -- Resultado Total
  total_honorarios DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  
  -- Metadata del Resultado
  metadata_rango VARCHAR(10),
  metadata_valor_k DECIMAL(15,2) DEFAULT 0.00,
  metadata_rango_costo_obra DECIMAL(10,4) DEFAULT 0.00,
  metadata_numero_items INT DEFAULT 0,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_usuario (usuario_id),
  INDEX idx_fecha (fecha_calculo),

  FOREIGN KEY (usuario_id) REFERENCES Usuarios(user_id) ,
  FOREIGN KEY (tarea_id) REFERENCES Tareas_Profesionales(tarea_id) 

  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


alter table Calculos add column calc_valor_num1 decimal(15,2) null after proyecto_cliente;
alter table Calculos add column calc_valor_num2 decimal(15,2) null after calc_valor_num1;
alter table Calculos add column calc_valor_num3 decimal(15,2) null after calc_valor_num2;
alter table Calculos add column calc_rel_id1 int null after calc_valor_num3;
alter table Calculos add column calc_rel_id2 int null after calc_rel_id1;
alter table Calculos add column calc_valor_bol1 boolean null after calc_rel_id2;
alter table Calculos add column calc_valor_bol2 boolean null after calc_valor_bol1;
alter table Calculos add column calc_valor_str1 varchar(255) null after calc_valor_bol2;
alter table Calculos add column calc_valor_str2 varchar(255) null after calc_valor_str1;


alter table Calculos add column proyecto_observ varchar(200) null after proyecto_cliente;
alter table Calculos add column obra_cotiz_Dolar decimal(15,2) null after obra_superficie;
alter table Calculos add column tarea_documentacion_ejecutiva boolean null after tarea_proyecto_estructuras;
alter table Calculos add column tarea_supervision_obra boolean null after tarea_documentacion_ejecutiva;
alter table Calculos add column tarea_observaciones varchar(200) null after tarea_supervision_obra;


