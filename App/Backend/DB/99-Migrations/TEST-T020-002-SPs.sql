-- ============================================================================
-- TESTS MANUALES: T020-002 - Stored Procedures Template Manager
-- Proyecto: CH2026 - CPAU Cálculo de Honorarios
-- SPEC: SPEC020-ADMIN-Template-Manager
-- Fecha: 2026-07-14
-- ============================================================================
-- Ejecutar estos tests en MySQL Workbench para validar los SPs
-- ============================================================================

USE ch2026_qa;

-- ============================================================================
-- TEST 1: Listar Templates Activos
-- ============================================================================
SELECT '🧪 TEST 1: Listar Templates Activos' AS test_name;

CALL Entregables_PDF_ListarActivos();

-- Validación manual:
-- ✅ Retorna array de templates
-- ✅ Cada template tiene: entregable_id, nombre, codigo, version, updated_at
-- ✅ Solo muestra templates con activo = 1


-- ============================================================================
-- TEST 2: Obtener Template por ID (existente)
-- ============================================================================
SELECT '🧪 TEST 2: Obtener Template por ID 1' AS test_name;

CALL Entregables_PDF_ObtenerPorID(1);

-- Validación manual:
-- ✅ Retorna 1 fila con todos los campos
-- ✅ Campos presentes: entregable_id, nombre, codigo, html_template, css_styles, 
--    pdf_config, template_engine, placeholders, assets, activo, created_at, updated_at
-- ✅ html_template NO es NULL


-- ============================================================================
-- TEST 3: Obtener Template por ID (inexistente)
-- ============================================================================
SELECT '🧪 TEST 3: Obtener Template por ID 999 (inexistente)' AS test_name;

CALL Entregables_PDF_ObtenerPorID(999);

-- Validación manual:
-- ✅ Retorna 0 filas (vacío)
-- ✅ No genera error


-- ============================================================================
-- TEST 4: Actualizar Template (ID existente)
-- ============================================================================
SELECT '🧪 TEST 4: Actualizar Template ID 1' AS test_name;

CALL Entregables_PDF_ActualizarTemplate(1, '<html><body><h1>Template de Prueba T020-002</h1><p>{{formData.nombreProyecto}}</p></body></html>');

-- Validación manual:
-- ✅ filas_afectadas = 1
-- ✅ mensaje = "Template actualizado exitosamente"

-- Verificar que se actualizó:
SELECT 
    entregable_id,
    nombre,
    SUBSTRING(html_template, 1, 100) AS html_preview,
    updated_at
FROM Entregables_PDF
WHERE entregable_id = 1;

-- ✅ html_template contiene el nuevo HTML
-- ✅ updated_at se actualizó a timestamp reciente


-- ============================================================================
-- TEST 5: Actualizar Template (ID inexistente)
-- ============================================================================
SELECT '🧪 TEST 5: Actualizar Template ID 999 (inexistente)' AS test_name;

CALL Entregables_PDF_ActualizarTemplate(999, '<html><body>Test</body></html>');

-- Validación manual:
-- ✅ filas_afectadas = 0
-- ✅ mensaje = "Entregable no encontrado"


-- ============================================================================
-- TEST 6: Restaurar template original (si lo modificaste)
-- ============================================================================
-- Si modificaste el template ID 1 en TEST 4, puedes restaurarlo aquí
-- Copia el HTML original desde tu backup o Git

-- Ejemplo:
-- CALL Entregables_PDF_ActualizarTemplate(1, '<html>... HTML ORIGINAL ...</html>');


-- ============================================================================
-- RESUMEN DE VALIDACIONES
-- ============================================================================
/*
┌─────────────────────────────────────────────────────────────────┐
│  CHECKLIST DE VALIDACIÓN T020-002                               │
└─────────────────────────────────────────────────────────────────┘

Stored Procedures:
  □ Entregables_PDF_ActualizarTemplate existe y funciona
  □ Entregables_PDF_ObtenerPorID existe y funciona
  □ Entregables_PDF_ListarActivos existe y funciona

Comportamiento:
  □ ActualizarTemplate retorna filas_afectadas = 1 cuando existe
  □ ActualizarTemplate retorna filas_afectadas = 0 cuando NO existe
  □ ActualizarTemplate actualiza el campo html_template
  □ ActualizarTemplate actualiza el campo updated_at
  □ ObtenerPorID retorna todos los campos del entregable
  □ ObtenerPorID retorna vacío cuando NO existe
  □ ListarActivos solo retorna templates con activo = 1
  □ ListarActivos retorna campos básicos correctamente

Código Backend:
  □ entregablesService.js tiene método actualizarTemplate()
  □ entregablesService.js tiene método obtenerPorID()
  □ entregablesService.js tiene método listarActivos()
  □ Los 3 métodos están exportados en module.exports

┌─────────────────────────────────────────────────────────────────┐
│  SI TODOS LOS TESTS PASAN → T020-002 COMPLETADO ✅              │
│  SIGUIENTE PASO → T020-003 (Backend API Endpoints)             │
└─────────────────────────────────────────────────────────────────┘
*/
