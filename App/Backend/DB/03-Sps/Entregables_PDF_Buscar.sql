DROP PROCEDURE IF EXISTS Entregables_PDF_Buscar;
DELIMITER $$

CREATE PROCEDURE Entregables_PDF_Buscar(
  p_entregable_id INT
)
BEGIN
  SELECT 
    entregable_id, nombre, codigo, descripcion, version, html_template, css_styles,
    pdf_config, template_engine, placeholders, assets, user_id, created_at, updated_at
  FROM Entregables_PDF
  WHERE entregable_id = p_entregable_id
    AND (baja_fecha IS NULL OR baja_fecha > NOW());
END$$
DELIMITER ;

