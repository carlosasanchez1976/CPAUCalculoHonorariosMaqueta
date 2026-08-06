-- =============================================================================
-- Stored Procedure: Terminos_Condiciones_BuscarVigente
-- Descripción: Devuelve el Término y Condición vigente con contenido completo
-- Uso: Endpoint público (sin autenticación)
-- Autor: Equipo CH2026
-- Fecha: 2026-08-06
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_BuscarVigente$$

CREATE PROCEDURE Terminos_Condiciones_BuscarVigente()
BEGIN
  SELECT 
    tyc_id,
    version,
    contenido_md,
    vigente,
    fecha_vigencia,
    created_at
  FROM Terminos_Condiciones
  WHERE vigente = TRUE
  LIMIT 1;
END$$

DELIMITER ;
