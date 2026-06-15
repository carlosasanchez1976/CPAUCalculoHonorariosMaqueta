-- ============================================================================
-- SCRIPT DE MIGRACIÓN: T010-001 - Tablas de Entregables PDF
-- Proyecto: CH2026 - CPAU Cálculo de Honorarios
-- Fecha: 2026-06-10
-- SPEC: SPEC010-CALC-Entregables (T010-001)
-- ============================================================================

-- Este script ejecuta la creación de las tablas y seed data necesarios
-- para implementar el sistema de plantillas de entregables PDF

-- ============================================================================
-- ORDEN DE EJECUCIÓN:
-- ============================================================================
-- 1. Verificar dependencias (Tareas_Profesionales, Usuarios)
-- 2. Crear tabla Entregables_PDF
-- 3. Crear tabla de relación Tareas_Profesionales_Entregables_PDF
-- 4. Insertar seed data

-- ============================================================================
-- 1. VERIFICACIÓN DE DEPENDENCIAS
-- ============================================================================

-- Verificar que existe la tabla Usuarios (requerida por FK en Entregables_PDF)
SELECT 'Verificando tabla Usuarios...' AS paso;
SELECT COUNT(*) AS usuarios_count FROM Usuarios;

-- Verificar que existe la tabla Tareas_Profesionales
SELECT 'Verificando tabla Tareas_Profesionales...' AS paso;
SELECT COUNT(*) AS tareas_count FROM Tareas_Profesionales;

-- Verificar que existe la tarea 'PYDOA' para el seed
SELECT 'Verificando tarea PYDOA (Proyecto y Dirección)...' AS paso;
SELECT tarea_id, codi, descripcion, vigente 
FROM Tareas_Profesionales 
WHERE codi = 'PYDOA';

-- ============================================================================
-- 2. CREAR TABLA: Entregables_PDF
-- ============================================================================

SELECT 'Creando tabla Entregables_PDF...' AS paso;
SOURCE 01-Tables/Entregables_PDF.sql;

-- ============================================================================
-- 3. CREAR TABLA: Tareas_Profesionales_Entregables_PDF
-- ============================================================================

SELECT 'Creando tabla Tareas_Profesionales_Entregables_PDF...' AS paso;
SOURCE 01-Tables/Tareas_Profesionales_Entregables_PDF.sql;

-- ============================================================================
-- 4. INSERTAR SEED DATA
-- ============================================================================

SELECT 'Insertando seed data...' AS paso;
SOURCE 02-Seeds/insert_Entregables_PDF.sql;

-- ============================================================================
-- 5. VERIFICACIÓN FINAL
-- ============================================================================

SELECT 'Verificación final...' AS paso;

-- Mostrar entregables creados
SELECT 'Entregables PDF creados:' AS resultado;
SELECT 
  entregable_id,
  nombre,
  codigo,
  version,
  version_activa,
  template_engine
FROM Entregables_PDF;

-- Mostrar relaciones creadas
SELECT 'Relaciones Tarea-Entregable creadas:' AS resultado;
SELECT 
  t.codi AS tarea_codigo,
  t.descripcion AS tarea_nombre,
  e.codigo AS entregable_codigo,
  e.nombre AS entregable_nombre,
  rel.activo,
  rel.orden
FROM Tareas_Profesionales t
INNER JOIN Tareas_Profesionales_Entregables_PDF rel ON t.tarea_id = rel.tarea_id
INNER JOIN Entregables_PDF e ON rel.entregable_id = e.entregable_id;

SELECT '✅ Migración T010-001 completada exitosamente' AS resultado;
