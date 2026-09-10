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


-- INSERT de tareas profesionales desde array calculationTypes del frontend
-- Tabla: Tareas_Profesionales
-- Fecha: 21/04/2026

INSERT INTO Tareas_Profesionales (codi, descripcion, descripcion_larga, vigente, user_id) VALUES

-- 1. Proyecto y Dirección de obras de arquitectura
('PYDOA', 'Proyecto y Dirección de obras de arquitectura', 
 'Cálculo de honorarios profesionales para tareas de proyecto y dirección de obra de baja, mediana y alta complejidad. Incluye la opción de incorporar proyecto de instalaciones y cálculo de estructuras.', 
 TRUE, NULL),

-- 2. Demoliciones
('DEMO', 'Demoliciones', 
 'Cálculo de honorarios profesionales para tareas de proyecto y dirección de obras de demolición.', 
 FALSE, NULL),

-- 3. Gerencia de proyectos y construcciones
('GPYC', 'Gerencia de proyectos y construcciones', 
 'Cálculo de honorarios profesionales para tareas de gerenciamiento de proyecto y de dirección de obras.', 
 FALSE, NULL),

-- 4. Habilitaciones
('HABI', 'Habilitaciones', 
 'Cálculo de honorarios profesionales para tareas de habilitaciones de locales, comercios e industrias.', 
 FALSE, NULL),

-- 5. Conservación de fachadas
('CONFAC', 'Conservación de fachadas', 
 'Cálculo de honorarios profesionales para tareas de conservación de fachadas.', 
 FALSE, NULL),

-- 6. Consultas y otras tareas por tiempo empleado
('CONSULT', 'Consultas y otras tareas por tiempo empleado', 
 'Cálculo de honorarios profesionales en base al valor hora profesional. Incluye Consultas, Estudios e Informe Técnico, Asesoramiento, y Liquidación de Medianería.', 
 FALSE, NULL),

-- 7. Medición y ejecución de planos
('MEDPLAN', 'Medición y ejecución de planos', 
 'Cálculo de honorarios profesionales para tareas de medición y ejecución de planos.', 
 FALSE, NULL),

-- 8. Impacto ambiental
('IMPAMB', 'Impacto ambiental', 
 'Cálculo de honorarios profesionales para tareas de impacto ambiental para todo tipo de uso.', 
 FALSE, NULL),

-- 9. Peritajes
('PERI', 'Peritajes', 
 'Cálculo de honorarios profesionales para tareas de peritaje.', 
 FALSE, NULL),

-- 10. Higiene y Seguridad
('HYS', 'Higiene y Seguridad', 
 'Cálculo de honorarios profesionales para tareas de higiene y seguridad.', 
 FALSE, NULL),

-- 11. Sistemas de autoprotección
('SAUTO', 'Sistemas de autoprotección', 
 'Cálculo de honorarios profesionales para tareas de diseño, implementación y actualización de planes de emergencia en edificios y establecimientos.', 
 FALSE, NULL),

-- 12. Arbitraje
('ARBI', 'Arbitraje', 
 'Cálculo de honorarios profesionales para tareas de arbitraje.', 
 FALSE, NULL),

-- 13. Tasación
('TASA', 'Tasación', 
 'Cálculo de honorarios profesionales para tareas de estudio que realiza el/la profesional tendiente a justipreciar bienes muebles o inmuebles o su valor locativo.', 
 FALSE, NULL),

-- 14. Representación técnica
('REPTEC', 'Representación técnica', 
 'Cálculo de honorarios profesionales para tareas de Representación Técnica en Obra.', 
 FALSE, NULL),

-- 15. Urbanismo
('URBA', 'Urbanismo', 
 'Cálculo de honorarios profesionales para tareas de planificación y diseño urbano.', 
 FALSE, NULL),

-- 16. Diseño de interiores
('DISINT', 'Diseño de interiores', 
 'Cálculo de honorarios profesionales para tareas de diseño de interiores y equipamiento.', 
 FALSE, NULL),

-- 17. Diseño de paisaje
('DISPAI', 'Diseño de paisaje', 
 'Cálculo de honorarios profesionales para tareas de planificación y diseño del paisaje.', 
 FALSE, NULL);
 
 select * from Tareas_Profesionales

 update Tareas_Profesionales set descripcion_larga = 'Cálculo de honorarios profesionales para tareas de habilitación de actividades económicas' where codi = 'HABI'