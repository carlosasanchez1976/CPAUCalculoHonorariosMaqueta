-- =============================================================================
-- Stored Procedure: Terminos_Condiciones_Listar
-- Descripción: Lista todos los Términos y Condiciones (histórico) con preview
-- Uso: Solo administradores
-- Autor: Equipo CH2026
-- Fecha: 2026-08-06
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_Listar$$

CREATE PROCEDURE Terminos_Condiciones_Listar()
BEGIN
  SELECT 
    tyc_id,
    version,
    LEFT(contenido_md, 200) AS contenido_preview,
    vigente,
    fecha_vigencia,
    user_id,
    created_at
  FROM Terminos_Condiciones
  ORDER BY fecha_vigencia DESC;
END$$

DELIMITER ;
