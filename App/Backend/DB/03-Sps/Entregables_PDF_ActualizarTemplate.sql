-- ============================================================================
-- SP: Entregables_PDF_ActualizarTemplate
-- Descripción: Actualiza el HTML template de un entregable existente
-- Parámetros:
--   @p_entregableId INT - ID del entregable a actualizar
--   @p_htmlTemplate LONGTEXT - Contenido HTML nuevo (en hexadecimal)
-- Retorna: 1 si actualizado, 0 si no existe
-- ============================================================================
DROP PROCEDURE IF EXISTS Entregables_PDF_ActualizarTemplate;

DELIMITER //

CREATE PROCEDURE Entregables_PDF_ActualizarTemplate(
    IN p_entregableId INT,
    IN p_htmlTemplate LONGTEXT
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;
    
    -- Verificar que existe el entregable
    SELECT COUNT(*) INTO v_existe
    FROM Entregables_PDF
    WHERE entregable_id = p_entregableId;
    
    IF v_existe = 0 THEN
        -- No existe, retornar 0
        SELECT 0 AS filas_afectadas, 'Entregable no encontrado' AS mensaje;
    ELSE
        -- Actualizar template
        UPDATE Entregables_PDF
        SET 
            html_template = p_htmlTemplate,
            updated_at = NOW()
        WHERE entregable_id = p_entregableId;
        
        -- Retornar éxito
        SELECT 1 AS filas_afectadas, 'Template actualizado exitosamente' AS mensaje;
    END IF;
    
END //

DELIMITER ;