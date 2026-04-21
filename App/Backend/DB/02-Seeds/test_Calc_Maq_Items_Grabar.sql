-- ============================================================================
-- SCRIPT DE PRUEBA DEL SP: Calc_Maq_Items_Grabar
-- ============================================================================
-- Descripción: Insertado de items para 10 cálculos de prueba
-- Fecha: 2026-04-21
-- Nota: Los registros master (TEST-2026-001 a TEST-2026-010) deben existir
--       previamente. Ejecutar primero test_Calc_Maq_Grabar.sql
-- ============================================================================

-- Limpiar items previos (opcional - comentar si no se desea)
-- DELETE FROM Calc_Maq_Items WHERE calculo_id LIKE 'TEST-%';

-- ============================================================================
-- Items para TEST-2026-001 (5 items - Edificio Residencial)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-001',
  1,
  'Proyecto de Obra',
  'Anteproyecto, proyecto ejecutivo y documentación técnica completa',
  2800000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-001',
  2,
  'Dirección de Obra',
  'Dirección técnica, certificación de avance y documentación conforme a obra',
  2450000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-001',
  3,
  'Instalación Sanitaria',
  'Proyecto y dirección de instalaciones sanitarias',
  1100000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-001',
  4,
  'Instalación Eléctrica',
  'Proyecto y dirección de instalación eléctrica de baja tensión',
  950000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-001',
  5,
  'Proyecto de Estructuras',
  'Cálculo estructural, planos de estructura y especificaciones',
  1650000.00
);

-- ============================================================================
-- Items para TEST-2026-002 (5 items - Casa Country)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-002',
  1,
  'Proyecto de Obra',
  'Proyecto arquitectónico ejecutivo y documentación municipal',
  950000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-002',
  2,
  'Dirección de Obra',
  'Dirección de obra y certificación de avance',
  850000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-002',
  3,
  'Instalación Sanitaria',
  'Proyecto de instalaciones sanitarias',
  380000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-002',
  4,
  'Instalación Eléctrica',
  'Proyecto de instalación eléctrica domiciliaria',
  350000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-002',
  5,
  'Adicionales',
  'Trámites municipales y gestión de permisos',
  320000.00
);

-- ============================================================================
-- Items para TEST-2026-003 (5 items - Local Comercial)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-003',
  1,
  'Proyecto de Obra',
  'Proyecto de reforma y habilitación comercial',
  720000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-003',
  2,
  'Instalación Sanitaria',
  'Proyecto sanitario y plomería',
  380000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-003',
  3,
  'Instalación Eléctrica',
  'Proyecto eléctrico trifásico',
  420000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-003',
  4,
  'Instalación Contra Incendio',
  'Sistema de detección y extinción de incendios',
  380000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-003',
  5,
  'Adicionales',
  'Habilitación comercial y bomberos',
  200000.00
);

-- ============================================================================
-- Items para TEST-2026-004 (7 items - Torre de Oficinas)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  1,
  'Proyecto de Obra',
  'Proyecto ejecutivo completo, renders e infografías',
  5800000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  2,
  'Dirección de Obra',
  'Dirección técnica integral y coordinación de obras',
  4950000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  3,
  'Instalación Sanitaria',
  'Instalaciones sanitarias, incendio y pluviales',
  2100000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  4,
  'Instalación Eléctrica',
  'Instalación eléctrica media tensión y tableros',
  1850000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  5,
  'Instalación Contra Incendio',
  'Sistema integral contra incendio certificado',
  1200000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  6,
  'Instalación Termomecánica',
  'HVAC, ventilación mecánica y climatización',
  1450000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-004',
  7,
  'Proyecto de Estructuras',
  'Cálculo estructural hormigón armado y metálico',
  1400000.00
);

-- ============================================================================
-- Items para TEST-2026-005 (4 items - Ampliación)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-005',
  1,
  'Proyecto de Obra',
  'Proyecto de ampliación y documentación municipal',
  520000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-005',
  2,
  'Dirección de Obra',
  'Dirección técnica de la ampliación',
  480000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-005',
  3,
  'Instalación Eléctrica',
  'Ampliación tablero eléctrico y circuitos',
  280000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-005',
  4,
  'Adicionales',
  'Trámites y certificado final',
  170000.00
);

-- ============================================================================
-- Items para TEST-2026-006 (5 items - Galpón Industrial)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-006',
  1,
  'Proyecto de Obra',
  'Proyecto industrial y layout de maquinaria',
  2100000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-006',
  2,
  'Instalación Sanitaria',
  'Instalaciones sanitarias industriales',
  720000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-006',
  3,
  'Instalación Eléctrica',
  'Instalación eléctrica industrial trifásica',
  1450000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-006',
  4,
  'Proyecto de Estructuras',
  'Estructura metálica y fundaciones',
  1850000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-006',
  5,
  'Adicionales',
  'Habilitación industrial',
  280000.00
);

-- ============================================================================
-- Items para TEST-2026-007 (6 items - Escuela)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-007',
  1,
  'Proyecto de Obra',
  'Proyecto arquitectónico educativo y planimetría',
  3850000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-007',
  2,
  'Dirección de Obra',
  'Dirección de obra y certificaciones',
  3200000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-007',
  3,
  'Instalación Sanitaria',
  'Instalaciones sanitarias y gas',
  1650000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-007',
  4,
  'Instalación Eléctrica',
  'Instalación eléctrica y tableros seccionales',
  1450000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-007',
  5,
  'Instalación Contra Incendio',
  'Sistema detección y extinción certificado',
  950000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-007',
  6,
  'Proyecto de Estructuras',
  'Cálculo estructural y especificaciones',
  1400000.00
);

-- ============================================================================
-- Items para TEST-2026-008 (7 items - Clínica)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  1,
  'Proyecto de Obra',
  'Proyecto sanitario especializado y señalética',
  4750000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  2,
  'Dirección de Obra',
  'Dirección integral y coordinación multidisciplinaria',
  4100000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  3,
  'Instalación Sanitaria',
  'Instalaciones sanitarias, gases medicinales y vapor',
  2350000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  4,
  'Instalación Eléctrica',
  'Instalación eléctrica, UPS y grupo electrógeno',
  1950000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  5,
  'Instalación Contra Incendio',
  'Sistema integral contra incendio certificado sanitario',
  850000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  6,
  'Instalación Termomecánica',
  'HVAC hospitalario y extracción de quirófanos',
  1200000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-008',
  7,
  'Proyecto de Estructuras',
  'Cálculo estructural y fundaciones especiales',
  600000.00
);

-- ============================================================================
-- Items para TEST-2026-009 (5 items - Viviendas Sociales)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-009',
  1,
  'Proyecto de Obra',
  'Proyecto de viviendas económicas y espacios comunes',
  1400000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-009',
  2,
  'Dirección de Obra',
  'Dirección de obra y certificación mensual',
  1250000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-009',
  3,
  'Instalación Sanitaria',
  'Instalaciones sanitarias domiciliarias',
  650000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-009',
  4,
  'Instalación Eléctrica',
  'Instalación eléctrica básica por vivienda',
  580000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-009',
  5,
  'Adicionales',
  'Infraestructura común y áreas verdes',
  370000.00
);

-- ============================================================================
-- Items para TEST-2026-010 (6 items - Polideportivo)
-- ============================================================================
CALL Calc_Maq_Items_Grabar(
  'TEST-2026-010',
  1,
  'Proyecto de Obra',
  'Proyecto deportivo, canchas y vestuarios',
  2550000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-010',
  2,
  'Dirección de Obra',
  'Dirección técnica y coordinación de especialidades',
  2200000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-010',
  3,
  'Instalación Sanitaria',
  'Instalaciones sanitarias vestuarios y natatorio',
  1050000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-010',
  4,
  'Instalación Eléctrica',
  'Iluminación deportiva y tableros',
  950000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-010',
  5,
  'Instalación Termomecánica',
  'Climatización natatorio y vestuarios',
  750000.00
);

CALL Calc_Maq_Items_Grabar(
  'TEST-2026-010',
  6,
  'Proyecto de Estructuras',
  'Estructura cubierta gimnasio y tribunas',
  600000.00
);

-- ============================================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================================

-- Verificar cantidad total de items insertados
SELECT 
  'Items insertados (TEST)' as Descripcion,
  COUNT(*) as Total
FROM Calc_Maq_Items
WHERE calculo_id LIKE 'TEST-%';

-- Verificar items por cálculo
SELECT 
  calculo_id,
  COUNT(*) as Cantidad_Items,
  SUM(importe) as Total_Importe
FROM Calc_Maq_Items
WHERE calculo_id LIKE 'TEST-%'
GROUP BY calculo_id
ORDER BY calculo_id;

-- Verificar detalle completo
SELECT 
  calculo_id,
  tarea_profesional,
  descripcion,
  importe,
  created_at
FROM Calc_Maq_Items
WHERE calculo_id LIKE 'TEST-%'
ORDER BY calculo_id, id;

-- Resumen comparativo con registros master
SELECT 
  c.calculo_id,
  c.proyecto_nombre,
  COUNT(i.id) as Items_Insertados,
  SUM(i.importe) as Total_Items,
  c.total_honorarios as Total_Master,
  ROUND(c.total_honorarios - COALESCE(SUM(i.importe), 0), 2) as Diferencia
FROM Calc_Maq c
LEFT JOIN Calc_Maq_Items i ON c.calculo_id = i.calculo_id
WHERE c.calculo_id LIKE 'TEST-%'
GROUP BY c.calculo_id, c.proyecto_nombre, c.total_honorarios
ORDER BY c.calculo_id;
