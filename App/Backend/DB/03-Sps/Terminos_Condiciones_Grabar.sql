-- =============================================================================
-- Stored Procedure: Terminos_Condiciones_Grabar
-- Descripción: Crea un nuevo Término y Condición
--              Si p_activar = TRUE: lo marca como vigente, desactiva los 
--              anteriores y resetea aceptaciones de todos los usuarios
-- Uso: Solo administradores
-- Autor: Equipo CH2026
-- Fecha: 2026-08-06
-- =============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_Grabar$$

CREATE PROCEDURE Terminos_Condiciones_Grabar(
  IN p_version VARCHAR(20),
  IN p_contenido_md MEDIUMTEXT,
  IN p_user_id INT,
  IN p_activar BOOLEAN
)
BEGIN
  DECLARE v_tyc_id INT;
  
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  -- Insertar nuevo TyC
  INSERT INTO Terminos_Condiciones (
    version,
    contenido_md,
    vigente,
    fecha_vigencia,
    user_id
  ) VALUES (
    p_version,
    p_contenido_md,
    FALSE, -- Inicialmente no vigente
    CURDATE(),
    p_user_id
  );
  
  SET v_tyc_id = LAST_INSERT_ID();
  
  -- Si p_activar = TRUE, marcar como vigente automáticamente
  IF p_activar = TRUE THEN
    -- Desmarcar todos
    UPDATE Terminos_Condiciones SET vigente = FALSE;
    
    -- Marcar el nuevo como vigente
    UPDATE Terminos_Condiciones 
    SET vigente = TRUE 
    WHERE tyc_id = v_tyc_id;
    
    -- RESETEAR aceptación de TODOS los usuarios
    UPDATE Usuarios 
    SET 
      tyc_aceptado_fecha = NULL,
      tyc_version_aceptada = NULL,
      tyc_id_aceptado = NULL;
  END IF;
  
  -- Commit si todo OK
  COMMIT;
  
  SELECT v_tyc_id AS tyc_id;
END$$

DELIMITER ;
