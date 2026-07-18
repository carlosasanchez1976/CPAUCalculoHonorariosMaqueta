-- ============================================================================
-- SP: Entregables_PDF_ObtenerPorID
-- Descripción: Obtiene un entregable completo por su ID
-- Parámetros:
--   @p_entregableId INT - ID del entregable
-- Retorna: Row completa del entregable o NULL si no existe
-- ============================================================================
DROP PROCEDURE IF EXISTS Entregables_PDF_ObtenerPorID;

DELIMITER //

CREATE PROCEDURE Entregables_PDF_ObtenerPorID(
    IN p_entregableId INT
)
BEGIN
    SELECT 
        entregable_id,
        nombre,
        codigo,
        descripcion,
        html_template,
        css_styles,
        pdf_config,
        template_engine,
        placeholders,
        assets,
        created_at,
        updated_at,
        user_id
    FROM Entregables_PDF
    WHERE entregable_id = p_entregableId;
    
END //

DELIMITER ;
