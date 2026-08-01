-- ============================================================================
-- ÍNDICES PARA DASHBOARD DE MÉTRICAS (SPEC-027)
-- ============================================================================
-- Fecha: 2026-08-01
-- Versión SPEC: 1.1
-- Propósito: Crear índice necesario para queries de usuarios en el dashboard
-- Impacto: Optimiza queries sobre Usuarios.fec_ult_act
-- ============================================================================
-- NOTA IMPORTANTE:
-- El índice principal sobre Calculos.fecha_calculo (idx_fecha) YA EXISTE.
-- Solo necesitamos crear el índice de Usuarios.
-- ============================================================================

USE cpau_ch_dev;

-- ----------------------------------------------------------------------------
-- VALIDACIÓN: Verificar que idx_fecha ya existe en Calculos
-- ----------------------------------------------------------------------------
-- El índice idx_fecha sobre Calculos.fecha_calculo ya existe.
-- Este índice es suficiente para las queries del dashboard.

  SELECT 
      TABLE_NAME,
      INDEX_NAME,
      COLUMN_NAME,
      SEQ_IN_INDEX,
      INDEX_TYPE
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = 'cpau_ch_dev'
    AND TABLE_NAME = 'Calculos'
    AND INDEX_NAME = 'idx_fecha';

-- Resultado esperado: idx_fecha sobre columna fecha_calculo


-- ----------------------------------------------------------------------------
-- 1. Índice para filtros por fecha de alta de usuarios
-- ----------------------------------------------------------------------------
-- Queries que beneficia:
--   - COUNT(*) FROM Usuarios WHERE fec_ult_act BETWEEN ...
--   - SELECT ... FROM Usuarios WHERE fec_ult_act BETWEEN ... GROUP BY DATE(fec_ult_act)

CREATE INDEX idx_usuarios_fec_ult_act ON Usuarios(fec_ult_act);


-- ----------------------------------------------------------------------------
-- 2. (OPCIONAL) Índice compuesto para queries con filtro de puntaje
-- ----------------------------------------------------------------------------
-- Solo crear si se detecta lentitud en queries de puntajes.
-- El índice idx_fecha existente debería ser suficiente para la mayoría de casos.
--
-- Queries que beneficia:
--   - COUNT(*) FROM Calculos WHERE fecha_calculo BETWEEN ... AND app_exp_puntaje IS NOT NULL
--   - AVG(app_exp_puntaje) FROM Calculos WHERE fecha_calculo BETWEEN ...

-- CREATE INDEX idx_calculos_fecha_puntaje ON Calculos(fecha_calculo, app_exp_puntaje);


-- ----------------------------------------------------------------------------
-- 3. ANÁLISIS DE TABLAS
-- ----------------------------------------------------------------------------
-- Actualiza las estadísticas de distribución de datos para el optimizador de MySQL

ANALYZE TABLE Usuarios;


-- ============================================================================
-- VALIDACIÓN DE ÍNDICES CREADOS
-- ============================================================================

-- Verificar índice pre-existente en tabla Calculos
SHOW INDEX FROM Calculos WHERE Key_name = 'idx_fecha';

-- Verificar índice nuevo en tabla Usuarios
SHOW INDEX FROM Usuarios WHERE Key_name = 'idx_usuarios_fec_ult_act';


-- ============================================================================
-- PRUEBAS DE PERFORMANCE
-- ============================================================================

-- Ejemplo de queries antes/después (EXPLAIN para ver el query plan)

-- Query 1: Total de cálculos por rango de fechas
EXPLAIN SELECT COUNT(*) 
FROM Calculos 
WHERE fecha_calculo BETWEEN '2026-01-01' AND '2026-07-31';
-- Resultado esperado: type=range, key=idx_fecha

-- Query 2: Cálculos con puntaje
EXPLAIN SELECT COUNT(*), AVG(app_exp_puntaje)
FROM Calculos 
WHERE fecha_calculo BETWEEN '2026-01-01' AND '2026-07-31'
  AND app_exp_puntaje IS NOT NULL;
-- Resultado esperado: type=range, key=idx_fecha

-- Query 3: Usuarios nuevos por rango de fechas
EXPLAIN SELECT COUNT(*) 
FROM Usuarios 
WHERE fec_ult_act BETWEEN '2026-01-01' AND '2026-07-31';
-- Resultado esperado: type=range, key=idx_usuarios_fec_ult_act

-- Query 4: Serie temporal de cálculos (GROUP BY DATE)
EXPLAIN SELECT DATE(fecha_calculo) AS fecha, COUNT(*) AS total
FROM Calculos 
WHERE fecha_calculo BETWEEN '2026-01-01' AND '2026-07-31'
GROUP BY DATE(fecha_calculo);
-- Resultado esperado: type=range, key=idx_fecha


-- ============================================================================
-- NOTAS DE MANTENIMIENTO
-- ============================================================================

/*
ÍNDICES UTILIZADOS:
- idx_fecha (PRE-EXISTENTE): Sobre Calculos.fecha_calculo - cubre todas las queries principales
- idx_usuarios_fec_ult_act (NUEVO): Sobre Usuarios.fec_ult_act - cubre queries de usuarios nuevos

IMPACTO EN ESCRITURA:
- Overhead estimado: ~2% en INSERT/UPDATE de tabla Usuarios
- Sin impacto en tabla Calculos (no se agregan índices nuevos)
- Aceptable para tablas de consulta frecuente

TAMAÑO APROXIMADO:
- idx_usuarios_fec_ult_act: ~10KB por cada 10,000 registros

REORGANIZACIÓN:
- Ejecutar OPTIMIZE TABLE cada 6 meses si hay muchas actualizaciones:
  OPTIMIZE TABLE Usuarios;

MONITOREO:
- Verificar uso de índices con:
  SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'cpau_ch_dev';
  
- Verificar performance de queries del dashboard:
  SELECT * FROM sys.schema_table_statistics WHERE table_schema = 'cpau_ch_dev';
*/


-- ============================================================================
-- ROLLBACK (solo si es necesario revertir cambios)
-- ============================================================================

/*
-- Descomentar solo si necesitas eliminar el índice

DROP INDEX idx_usuarios_fec_ult_act ON Usuarios;

-- Volver a analizar tabla
ANALYZE TABLE Usuarios;
*/
