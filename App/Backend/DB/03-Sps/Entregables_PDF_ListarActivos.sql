-- ============================================================================
-- SP: Entregables_PDF_ListarActivos
-- Descripción: Lista todos los templates activos (para selector en tool)
-- Parámetros: ninguno
-- Retorna: Lista de entregables con campos básicos
-- ============================================================================
DROP PROCEDURE IF EXISTS Entregables_PDF_ListarActivos;

DELIMITER //

CREATE PROCEDURE Entregables_PDF_ListarActivos()
BEGIN
    SELECT 
        entregable_id,
        nombre,
        codigo,
        descripcion,
        version,
        updated_at
    FROM Entregables_PDF
    WHERE baja_fecha IS NULL OR baja_fecha > NOW() -- Solo activos
    ORDER BY nombre ASC;
    
END //

DELIMITER ;
