-- =============================================================================
-- Stored Procedure: Usuarios_AceptarTerminos
-- Descripción: Registra la aceptación de Términos y Condiciones por parte
--              de un usuario. Actualiza los campos de tracking en la tabla
--              Usuarios.
-- Uso: Llamado cuando el usuario acepta TyC desde el frontend
-- Autor: Equipo CH2026
-- Fecha: 2026-08-06
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Usuarios_AceptarTerminos$$

CREATE PROCEDURE Usuarios_AceptarTerminos(
  IN p_user_id INT,
  IN p_tyc_id INT
)
BEGIN
  DECLARE v_version VARCHAR(20);
  
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  -- Obtener versión del TyC
  SELECT version INTO v_version
  FROM Terminos_Condiciones
  WHERE tyc_id = p_tyc_id;
  
  IF v_version IS NULL THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'TyC no encontrado';
  END IF;
  
  -- Actualizar usuario
  UPDATE Usuarios
  SET 
    tyc_aceptado_fecha = NOW(),
    tyc_version_aceptada = v_version,
    tyc_id_aceptado = p_tyc_id
  WHERE user_id = p_user_id;
  
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Usuario no encontrado';
  END IF;
  
  -- Commit si todo OK
  COMMIT;
END$$

DELIMITER ;
