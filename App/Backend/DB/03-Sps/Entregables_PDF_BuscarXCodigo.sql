DROP PROCEDURE IF EXISTS Entregables_PDF_BuscarXCodigo;
DELIMITER $$

CREATE PROCEDURE Entregables_PDF_BuscarXCodigo(
  p_codigo VARCHAR(50)
)
BEGIN
  SELECT 
    entregable_id, nombre, codigo, descripcion, version, html_template, css_styles,
    pdf_config, template_engine, placeholders, assets, created_at, updated_at
  FROM Entregables_PDF
  WHERE codigo = p_codigo
    AND (baja_fecha IS NULL OR baja_fecha > NOW());
END$$
DELIMITER ;