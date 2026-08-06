-- =============================================
-- Script: Limpieza de TyC de prueba
-- SPEC: SPEC029-CALC-Términos y condiciones (TICKET-029-014)
-- Fecha: 2026-08-06
-- Descripción: Limpia TyCs de prueba para resetear ambiente de testing
-- =============================================
-- 
-- USO: Ejecutar este script entre ejecuciones de la suite de tests
--      para limpiar TyCs generados en las pruebas
--
-- ⚠️ SOLO PARA QA/DEV - NO EJECUTAR EN PRODUCCIÓN
-- =============================================

-- Ver estado actual
SELECT 
    tyc_id,
    version,
    vigente,
    fecha_vigencia,
    user_id,
    created_at
FROM Terminos_Condiciones
ORDER BY created_at DESC;

-- Contar TyCs
SELECT COUNT(*) as total_tyc FROM Terminos_Condiciones;

-- Contar usuarios que aceptaron TyC
SELECT 
    COUNT(CASE WHEN tyc_aceptado_fecha IS NOT NULL THEN 1 END) as usuarios_aceptaron,
    COUNT(CASE WHEN tyc_aceptado_fecha IS NULL THEN 1 END) as usuarios_pendientes,
    COUNT(*) as total_usuarios
FROM usuarios;

-- =============================================
-- OPCIÓN 1: Eliminar solo TyCs de prueba (v1.1+)
-- =============================================

-- Borrar TyCs de prueba (mantiene v1.0 original)
DELETE FROM Terminos_Condiciones 
WHERE version NOT IN ('1.0');

-- Verificar eliminación
SELECT COUNT(*) as tyc_restantes FROM Terminos_Condiciones;

-- =============================================
-- OPCIÓN 2: Resetear todo a estado inicial
-- =============================================

-- 1. Borrar TODOS los TyC
-- DELETE FROM Terminos_Condiciones;

-- 2. Resetear usuarios
-- UPDATE usuarios SET 
--   tyc_aceptado_fecha = NULL,
--   tyc_version_aceptada = NULL,
--   tyc_id_aceptado = NULL;

-- 3. Re-insertar TyC v1.0
-- (Ejecutar script: Insert_TYC_v1.0.sql)

-- =============================================
-- OPCIÓN 3: Solo resetear usuarios
-- =============================================

-- Resetear aceptación de TyC de todos los usuarios
UPDATE usuarios SET 
  tyc_aceptado_fecha = NULL,
  tyc_version_aceptada = NULL,
  tyc_id_aceptado = NULL;

-- Verificar reset
SELECT 
    COUNT(*) as usuarios_reseteados
FROM usuarios
WHERE tyc_aceptado_fecha IS NULL;

-- =============================================
-- OPCIÓN 4: Reactivar TyC v1.0 como vigente
-- =============================================

-- Desactivar todos
UPDATE Terminos_Condiciones SET vigente = FALSE;

-- Activar solo v1.0
UPDATE Terminos_Condiciones 
SET vigente = TRUE, fecha_vigencia = CURRENT_DATE
WHERE version = '1.0';

-- Verificar
SELECT 
    tyc_id,
    version,
    vigente,
    fecha_vigencia
FROM Terminos_Condiciones
WHERE vigente = TRUE;

-- =============================================
-- Validaciones finales
-- =============================================

-- Ver TyCs actuales
SELECT 
    tyc_id,
    version,
    vigente,
    fecha_vigencia,
    CHAR_LENGTH(contenido_md) as contenido_length,
    created_at
FROM Terminos_Condiciones
ORDER BY created_at DESC;

-- Ver estado de usuarios
SELECT 
    user_id,
    user_nombre,
    rol,
    tyc_aceptado_fecha,
    tyc_version_aceptada,
    tyc_id_aceptado
FROM usuarios
ORDER BY user_id
LIMIT 10;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
