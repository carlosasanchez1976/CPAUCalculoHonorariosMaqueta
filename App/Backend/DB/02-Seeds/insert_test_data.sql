-- ============================================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA
-- ============================================================================
-- Descripción: 10 registros de cálculos con sus respectivos items
-- Fecha: 2026-04-16
-- ============================================================================

-- ============================================================================
-- TABLA MASTER: Calc_Maq (10 registros)
-- ============================================================================

INSERT INTO Calc_Maq (
  calculo_id, usuario_id, tipo_calculo, fecha_calculo,
  proyecto_nombre, proyecto_ubicacion, proyecto_cliente,
  obra_valor_obra, obra_superficie, obra_tipologia, obra_complejidad,
  tarea_obra_proyecto, tarea_obra_direccion, tarea_instalacion_sanitaria,
  tarea_instalacion_electrica, tarea_instalacion_contra_incendio,
  tarea_instalacion_termomecanica, tarea_proyecto_estructuras,
  parametro_valor_k, total_honorarios,
  metadata_rango, metadata_valor_k, metadata_rango_costo_obra, metadata_numero_items
) VALUES
-- Registro 1: Edificio residencial completo
(
  'CALC-2026-001', 1, 'basico', '2026-01-15 10:30:00',
  'Edificio Residencial Belgrano', 'Belgrano, CABA', 'Constructora del Norte SA',
  45000000.00, 3500.00, 'Edificio Residencial', 'Media',
  TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE,
  522181756.33, 8950000.00,
  'H', 522181756.33, 0.1750, 7
),
-- Registro 2: Vivienda unifamiliar básica
(
  'CALC-2026-002', 2, 'basico', '2026-01-18 14:20:00',
  'Casa Country San Isidro', 'San Isidro, GBA', 'Familia Rodríguez',
  12000000.00, 250.00, 'Vivienda Unifamiliar', 'Baja',
  TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE,
  522181756.33, 2850000.00,
  'G', 522181756.33, 0.2150, 5
),
-- Registro 3: Local comercial
(
  'CALC-2026-003', 1, 'basico', '2026-01-22 09:45:00',
  'Local Comercial Palermo', 'Palermo, CABA', 'Inversiones Palermo SRL',
  8500000.00, 180.00, 'Local Comercial', 'Baja',
  TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE,
  522181756.33, 2100000.00,
  'F', 522181756.33, 0.2350, 5
),
-- Registro 4: Complejo de oficinas
(
  'CALC-2026-004', 3, 'basico', '2026-02-05 11:00:00',
  'Torre de Oficinas Puerto Madero', 'Puerto Madero, CABA', 'Grupo Empresarial PM',
  125000000.00, 8500.00, 'Edificio de Oficinas', 'Alta',
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
  522181756.33, 18750000.00,
  'J', 522181756.33, 0.1450, 7
),
-- Registro 5: Ampliación residencial
(
  'CALC-2026-005', 2, 'basico', '2026-02-12 16:30:00',
  'Ampliación Casa Nordelta', 'Nordelta, Tigre', 'Sr. Martínez',
  5200000.00, 85.00, 'Ampliación', 'Baja',
  TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE,
  522181756.33, 1450000.00,
  'E', 522181756.33, 0.2650, 4
),
-- Registro 6: Galpón industrial
(
  'CALC-2026-006', 4, 'basico', '2026-02-20 10:15:00',
  'Galpón Industrial Pilar', 'Parque Industrial Pilar', 'Logística del Sur SA',
  32000000.00, 2800.00, 'Industrial', 'Media',
  TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE,
  522181756.33, 6400000.00,
  'I', 522181756.33, 0.1850, 5
),
-- Registro 7: Escuela privada
(
  'CALC-2026-007', 3, 'basico', '2026-03-01 08:30:00',
  'Instituto Educativo San Martín', 'Vicente López, GBA', 'Fundación Educativa',
  68000000.00, 4200.00, 'Educativo', 'Alta',
  TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE,
  522181756.33, 12500000.00,
  'I', 522181756.33, 0.1750, 6
),
-- Registro 8: Clínica médica
(
  'CALC-2026-008', 5, 'basico', '2026-03-10 13:45:00',
  'Clínica del Centro', 'Microcentro, CABA', 'Salud Integral SA',
  95000000.00, 5500.00, 'Salud', 'Alta',
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE,
  522181756.33, 15800000.00,
  'J', 522181756.33, 0.1550, 7
),
-- Registro 9: Vivienda de interés social
(
  'CALC-2026-009', 2, 'basico', '2026-03-18 15:20:00',
  'Viviendas Sociales Quilmes', 'Quilmes, GBA Sur', 'Municipalidad de Quilmes',
  18000000.00, 1200.00, 'Vivienda Social', 'Baja',
  TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE,
  522181756.33, 4250000.00,
  'H', 522181756.33, 0.2150, 5
),
-- Registro 10: Centro deportivo
(
  'CALC-2026-010', 4, 'basico', '2026-03-25 11:00:00',
  'Polideportivo Municipal', 'San Fernando, GBA', 'Municipalidad San Fernando',
  42000000.00, 6500.00, 'Deportivo', 'Media',
  TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE,
  522181756.33, 8100000.00,
  'H', 522181756.33, 0.1850, 6
);

-- ============================================================================
-- TABLA DETALLE: Calc_Maq_Items (Items para cada cálculo)
-- ============================================================================

-- Items para CALC-2026-001 (7 items - Edificio Residencial)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-001', 1, 'Proyecto de Obra', 'Anteproyecto, proyecto ejecutivo y documentación técnica completa', 2800000.00),
('CALC-2026-001', 2, 'Dirección de Obra', 'Dirección técnica, certificación de avance y documentación conforme a obra', 2450000.00),
('CALC-2026-001', 3, 'Instalación Sanitaria', 'Proyecto y dirección de instalaciones sanitarias', 1100000.00),
('CALC-2026-001', 4, 'Instalación Eléctrica', 'Proyecto y dirección de instalación eléctrica de baja tensión', 950000.00),
('CALC-2026-001', 5, 'Proyecto de Estructuras', 'Cálculo estructural, planos de estructura y especificaciones', 1650000.00);

-- Items para CALC-2026-002 (5 items - Casa Country)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-002', 1, 'Proyecto de Obra', 'Proyecto arquitectónico ejecutivo y documentación municipal', 950000.00),
('CALC-2026-002', 2, 'Dirección de Obra', 'Dirección de obra y certificación de avance', 850000.00),
('CALC-2026-002', 3, 'Instalación Sanitaria', 'Proyecto de instalaciones sanitarias', 380000.00),
('CALC-2026-002', 4, 'Instalación Eléctrica', 'Proyecto de instalación eléctrica domiciliaria', 350000.00),
('CALC-2026-002', 5, 'Adicionales', 'Trámites municipales y gestión de permisos', 320000.00);

-- Items para CALC-2026-003 (5 items - Local Comercial)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-003', 1, 'Proyecto de Obra', 'Proyecto de reforma y habilitación comercial', 720000.00),
('CALC-2026-003', 2, 'Instalación Sanitaria', 'Proyecto sanitario y plomería', 380000.00),
('CALC-2026-003', 3, 'Instalación Eléctrica', 'Proyecto eléctrico trifásico', 420000.00),
('CALC-2026-003', 4, 'Instalación Contra Incendio', 'Sistema de detección y extinción de incendios', 380000.00),
('CALC-2026-003', 5, 'Adicionales', 'Habilitación comercial y bomberos', 200000.00);

-- Items para CALC-2026-004 (7 items - Torre de Oficinas)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-004', 1, 'Proyecto de Obra', 'Proyecto ejecutivo completo, renders e infografías', 5800000.00),
('CALC-2026-004', 2, 'Dirección de Obra', 'Dirección técnica integral y coordinación de obras', 4950000.00),
('CALC-2026-004', 3, 'Instalación Sanitaria', 'Instalaciones sanitarias, incendio y pluviales', 2100000.00),
('CALC-2026-004', 4, 'Instalación Eléctrica', 'Instalación eléctrica media tensión y tableros', 1850000.00),
('CALC-2026-004', 5, 'Instalación Contra Incendio', 'Sistema integral contra incendio certificado', 1200000.00),
('CALC-2026-004', 6, 'Instalación Termomecánica', 'HVAC, ventilación mecánica y climatización', 1450000.00),
('CALC-2026-004', 7, 'Proyecto de Estructuras', 'Cálculo estructural hormigón armado y metálico', 1400000.00);

-- Items para CALC-2026-005 (4 items - Ampliación)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-005', 1, 'Proyecto de Obra', 'Proyecto de ampliación y documentación municipal', 520000.00),
('CALC-2026-005', 2, 'Dirección de Obra', 'Dirección técnica de la ampliación', 480000.00),
('CALC-2026-005', 3, 'Instalación Eléctrica', 'Ampliación tablero eléctrico y circuitos', 280000.00),
('CALC-2026-005', 4, 'Adicionales', 'Trámites y certificado final', 170000.00);

-- Items para CALC-2026-006 (5 items - Galpón Industrial)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-006', 1, 'Proyecto de Obra', 'Proyecto industrial y layout de maquinaria', 2100000.00),
('CALC-2026-006', 2, 'Instalación Sanitaria', 'Instalaciones sanitarias industriales', 720000.00),
('CALC-2026-006', 3, 'Instalación Eléctrica', 'Instalación eléctrica industrial trifásica', 1450000.00),
('CALC-2026-006', 4, 'Proyecto de Estructuras', 'Estructura metálica y fundaciones', 1850000.00),
('CALC-2026-006', 5, 'Adicionales', 'Habilitación industrial', 280000.00);

-- Items para CALC-2026-007 (6 items - Escuela)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-007', 1, 'Proyecto de Obra', 'Proyecto arquitectónico educativo y planimetría', 3850000.00),
('CALC-2026-007', 2, 'Dirección de Obra', 'Dirección de obra y certificaciones', 3200000.00),
('CALC-2026-007', 3, 'Instalación Sanitaria', 'Instalaciones sanitarias y gas', 1650000.00),
('CALC-2026-007', 4, 'Instalación Eléctrica', 'Instalación eléctrica y tableros seccionales', 1450000.00),
('CALC-2026-007', 5, 'Instalación Contra Incendio', 'Sistema detección y extinción certificado', 950000.00),
('CALC-2026-007', 6, 'Proyecto de Estructuras', 'Cálculo estructural y especificaciones', 1400000.00);

-- Items para CALC-2026-008 (7 items - Clínica)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-008', 1, 'Proyecto de Obra', 'Proyecto sanitario especializado y señalética', 4750000.00),
('CALC-2026-008', 2, 'Dirección de Obra', 'Dirección integral y coordinación multidisciplinaria', 4100000.00),
('CALC-2026-008', 3, 'Instalación Sanitaria', 'Instalaciones sanitarias, gases medicinales y vapor', 2350000.00),
('CALC-2026-008', 4, 'Instalación Eléctrica', 'Instalación eléctrica, UPS y grupo electrógeno', 1950000.00),
('CALC-2026-008', 5, 'Instalación Contra Incendio', 'Sistema integral contra incendio certificado sanitario', 850000.00),
('CALC-2026-008', 6, 'Instalación Termomecánica', 'HVAC hospitalario y extracción de quirófanos', 1200000.00),
('CALC-2026-008', 7, 'Proyecto de Estructuras', 'Cálculo estructural y fundaciones especiales', 600000.00);

-- Items para CALC-2026-009 (5 items - Viviendas Sociales)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-009', 1, 'Proyecto de Obra', 'Proyecto de viviendas económicas y espacios comunes', 1400000.00),
('CALC-2026-009', 2, 'Dirección de Obra', 'Dirección de obra y certificación mensual', 1250000.00),
('CALC-2026-009', 3, 'Instalación Sanitaria', 'Instalaciones sanitarias domiciliarias', 650000.00),
('CALC-2026-009', 4, 'Instalación Eléctrica', 'Instalación eléctrica básica por vivienda', 580000.00),
('CALC-2026-009', 5, 'Adicionales', 'Infraestructura común y áreas verdes', 370000.00);

-- Items para CALC-2026-010 (6 items - Polideportivo)
INSERT INTO Calc_Maq_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe) VALUES
('CALC-2026-010', 1, 'Proyecto de Obra', 'Proyecto deportivo, canchas y vestuarios', 2550000.00),
('CALC-2026-010', 2, 'Dirección de Obra', 'Dirección técnica y coordinación de especialidades', 2200000.00),
('CALC-2026-010', 3, 'Instalación Sanitaria', 'Instalaciones sanitarias vestuarios y natatorio', 1050000.00),
('CALC-2026-010', 4, 'Instalación Eléctrica', 'Iluminación deportiva y tableros', 950000.00),
('CALC-2026-010', 5, 'Instalación Termomecánica', 'Climatización natatorio y vestuarios', 750000.00),
('CALC-2026-010', 6, 'Proyecto de Estructuras', 'Estructura cubierta gimnasio y tribunas', 600000.00);

-- ============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================================

-- Verificar cantidad de registros
SELECT 
  'Calc_Maq' as Tabla,
  COUNT(*) as Total_Registros
FROM Calc_Maq
UNION ALL
SELECT 
  'Calc_Maq_Items' as Tabla,
  COUNT(*) as Total_Registros
FROM Calc_Maq_Items;

-- Verificar integridad referencial (items por cálculo)
SELECT 
  c.calculo_id,
  c.proyecto_nombre,
  c.metadata_numero_items as Items_Esperados,
  COUNT(i.id) as Items_Reales,
  c.total_honorarios as Total_Master,
  SUM(i.importe) as Total_Items,
  ROUND(c.total_honorarios - SUM(i.importe), 2) as Diferencia
FROM Calc_Maq c
LEFT JOIN Calc_Maq_Items i ON c.calculo_id = i.calculo_id
GROUP BY c.calculo_id, c.proyecto_nombre, c.metadata_numero_items, c.total_honorarios
ORDER BY c.calculo_id;
