-- =============================================================================
-- Stored Procedure: Terminos_Condiciones_Buscar
-- Descripción: Busca un Término y Condición específico por ID
-- Uso: Solo administradores
-- Autor: Equipo CH2026
-- Fecha: 2026-08-06
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_Buscar$$

CREATE PROCEDURE Terminos_Condiciones_Buscar(IN p_tyc_id INT)
BEGIN
  SELECT * 
  FROM Terminos_Condiciones
  WHERE tyc_id = p_tyc_id;
END$$

DELIMITER ;
