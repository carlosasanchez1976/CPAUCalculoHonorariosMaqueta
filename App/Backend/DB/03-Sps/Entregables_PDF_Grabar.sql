DROP PROCEDURE IF EXISTS Entregables_PDF_Grabar;
DELIMITER $$

CREATE PROCEDURE Entregables_PDF_Grabar(
  IN p_entregable_id INT,
  IN p_nombre VARCHAR(100),
  IN p_codigo VARCHAR(50),
  IN p_descripcion TEXT,
  IN p_version VARCHAR(20),
  IN p_html_template LONGTEXT,
  IN p_css_styles LONGTEXT,
  IN p_pdf_config JSON,
  IN p_template_engine ENUM('handlebars', 'mustache', 'literal'),
  IN p_placeholders JSON,
  IN p_assets JSON,
  IN p_user_id INT
)
BEGIN

  IF p_entregable_id IS NULL THEN
    -- Insertar nuevo entregable
    INSERT INTO Entregables_PDF (
      nombre, codigo, descripcion, version, html_template, css_styles, pdf_config,
      template_engine, placeholders, assets, user_id
    ) VALUES (
      p_nombre, p_codigo, p_descripcion, p_version, p_html_template, p_css_styles,
      p_pdf_config, p_template_engine, p_placeholders, p_assets, p_user_id
    );
    SET p_entregable_id = LAST_INSERT_ID();
  ELSE
    -- Actualizar entregable existente (baja de versión anterior)
    UPDATE Entregables_PDF
    SET
      nombre = p_nombre,
      codigo = p_codigo,
      descripcion = p_descripcion,
      version = p_version,
      html_template = p_html_template,
      css_styles = p_css_styles,
      pdf_config = p_pdf_config,
      template_engine = p_template_engine,
      placeholders = p_placeholders,
      assets = p_assets,
      updated_at = CURRENT_TIMESTAMP,
      user_id = p_user_id
    WHERE entregable_id = p_entregable_id;
  END IF;

  select p_entregable_id as entregable_id;

END$$
DELIMITER ;