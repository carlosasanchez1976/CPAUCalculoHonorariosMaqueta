-- ============================================================================
-- SCRIPT DE PRUEBA DEL SP: Calc_Maq_Grabar
-- ============================================================================
-- Descripción: 10 llamadas al procedimiento almacenado con datos de prueba
-- Fecha: 2026-04-21
-- ============================================================================

-- Limpiar datos previos (opcional - comentar si no se desea)
-- DELETE FROM Calc_Maq_Items WHERE calculo_id LIKE 'TEST-%';
-- DELETE FROM Calc_Maq WHERE calculo_id LIKE 'TEST-%';

-- ============================================================================
-- TEST 1: Edificio residencial completo
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-001',                          -- calculo_id
  1,                                         -- usuario_id
  'basico',                                  -- tipo_calculo
  '2026-04-21 10:30:00',                    -- fecha_calculo
  'Edificio Residencial Belgrano',          -- proyecto_nombre
  'Belgrano, CABA',                         -- proyecto_ubicacion
  'Constructora del Norte SA',              -- proyecto_cliente
  45000000.00,                              -- obra_valor_obra
  3500.00,                                  -- obra_superficie
  'Edificio Residencial',                   -- obra_tipologia
  'Media',                                  -- obra_complejidad
  TRUE,                                     -- tarea_obra_proyecto
  TRUE,                                     -- tarea_obra_direccion
  TRUE,                                     -- tarea_instalacion_sanitaria
  TRUE,                                     -- tarea_instalacion_electrica
  FALSE,                                    -- tarea_instalacion_contra_incendio
  FALSE,                                    -- tarea_instalacion_termomecanica
  TRUE                                      -- tarea_proyecto_estructuras
);

-- ============================================================================
-- TEST 2: Vivienda unifamiliar básica
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-002',
  2,
  'basico',
  '2026-04-21 11:15:00',
  'Casa Country San Isidro',
  'San Isidro, GBA',
  'Familia Rodríguez',
  12000000.00,
  250.00,
  'Vivienda Unifamiliar',
  'Baja',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  FALSE
);

-- ============================================================================
-- TEST 3: Local comercial
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-003',
  1,
  'basico',
  '2026-04-21 12:00:00',
  'Local Comercial Palermo',
  'Palermo, CABA',
  'Inversiones Palermo SRL',
  8500000.00,
  180.00,
  'Local Comercial',
  'Baja',
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE
);

-- ============================================================================
-- TEST 4: Torre de oficinas
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-004',
  3,
  'basico',
  '2026-04-21 13:30:00',
  'Torre de Oficinas Puerto Madero',
  'Puerto Madero, CABA',
  'Grupo Empresarial PM',
  125000000.00,
  8500.00,
  'Edificio de Oficinas',
  'Alta',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
);

-- ============================================================================
-- TEST 5: Ampliación residencial
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-005',
  2,
  'basico',
  '2026-04-21 14:00:00',
  'Ampliación Casa Nordelta',
  'Nordelta, Tigre',
  'Sr. Martínez',
  5200000.00,
  85.00,
  'Ampliación',
  'Baja',
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  FALSE,
  FALSE,
  FALSE
);

-- ============================================================================
-- TEST 6: Galpón industrial
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-006',
  4,
  'basico',
  '2026-04-21 14:45:00',
  'Galpón Industrial Pilar',
  'Parque Industrial Pilar',
  'Logística del Sur SA',
  32000000.00,
  2800.00,
  'Industrial',
  'Media',
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  TRUE
);

-- ============================================================================
-- TEST 7: Escuela privada
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-007',
  3,
  'basico',
  '2026-04-21 15:20:00',
  'Instituto Educativo San Martín',
  'Vicente López, GBA',
  'Fundación Educativa',
  68000000.00,
  4200.00,
  'Educativo',
  'Alta',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  TRUE
);

-- ============================================================================
-- TEST 8: Clínica médica
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-008',
  5,
  'basico',
  '2026-04-21 16:00:00',
  'Clínica del Centro',
  'Microcentro, CABA',
  'Salud Integral SA',
  95000000.00,
  5500.00,
  'Salud',
  'Alta',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE
);

-- ============================================================================
-- TEST 9: Vivienda de interés social
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-009',
  2,
  'basico',
  '2026-04-21 16:30:00',
  'Viviendas Sociales Quilmes',
  'Quilmes, GBA Sur',
  'Municipalidad de Quilmes',
  18000000.00,
  1200.00,
  'Vivienda Social',
  'Baja',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  FALSE,
  FALSE
);

-- ============================================================================
-- TEST 10: Centro deportivo
-- ============================================================================
CALL Calc_Maq_Grabar(
  'TEST-2026-010',
  4,
  'basico',
  '2026-04-21 17:00:00',
  'Polideportivo Municipal',
  'San Fernando, GBA',
  'Municipalidad San Fernando',
  42000000.00,
  6500.00,
  'Deportivo',
  'Media',
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  TRUE
);

-- ============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================================

-- Verificar cantidad de registros de prueba
SELECT 
  'Calc_Maq (TEST)' as Tabla,
  COUNT(*) as Total_Registros
FROM Calc_Maq
WHERE calculo_id LIKE 'TEST-%'
UNION ALL
SELECT 
  'Calc_Maq_Items (TEST)' as Tabla,
  COUNT(*) as Total_Registros
FROM Calc_Maq_Items
WHERE calculo_id LIKE 'TEST-%';

-- Verificar datos insertados
SELECT 
  calculo_id,
  proyecto_nombre,
  obra_valor_obra,
  total_honorarios,
  fecha_calculo,
  created_at
FROM Calc_Maq
WHERE calculo_id LIKE 'TEST-%'
ORDER BY calculo_id;

-- Verificar items generados (si el SP los crea)
SELECT 
  c.calculo_id,
  c.proyecto_nombre,
  COUNT(i.id) as Cantidad_Items,
  SUM(i.importe) as Total_Items
FROM Calc_Maq c
LEFT JOIN Calc_Maq_Items i ON c.calculo_id = i.calculo_id
WHERE c.calculo_id LIKE 'TEST-%'
GROUP BY c.calculo_id, c.proyecto_nombre
ORDER BY c.calculo_id;
