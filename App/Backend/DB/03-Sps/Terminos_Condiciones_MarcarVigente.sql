-- =============================================================================
-- Stored Procedure: Terminos_Condiciones_MarcarVigente
-- Descripción: Marca un TyC existente como vigente y resetea aceptaciones
--              de todos los usuarios (obliga a re-aceptar)
-- Uso: Solo administradores
-- Autor: Equipo CH2026
-- Fecha: 2026-08-06
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_MarcarVigente$$

CREATE PROCEDURE Terminos_Condiciones_MarcarVigente(IN p_tyc_id INT)
BEGIN
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  -- Desmarcar todos los TyC como no vigentes
  UPDATE Terminos_Condiciones SET vigente = FALSE;
  
  -- Marcar el seleccionado como vigente
  UPDATE Terminos_Condiciones 
  SET vigente = TRUE 
  WHERE tyc_id = p_tyc_id;
  
  -- Verificar que existe
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'TyC ID no encontrado';
  END IF;
  
  -- RESETEAR aceptación de TODOS los usuarios
  UPDATE Usuarios 
  SET 
    tyc_aceptado_fecha = NULL,
    tyc_version_aceptada = NULL,
    tyc_id_aceptado = NULL;
  
  -- Commit si todo OK
  COMMIT;
END$$

DELIMITER ;
