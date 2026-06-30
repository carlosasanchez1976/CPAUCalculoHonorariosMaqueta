-- ============================================================================
-- SCRIPT: Corrección SP Entregables_PDF_BuscarXTareaID
-- Fecha: 2026-06-30
-- Autor: Charly
-- Descripción: Agrega campos faltantes (html_template, css_styles, etc.) 
--              al SP para poder renderizar plantillas desde DB
-- Issue: Backend no podía renderizar plantillas porque el SP no devolvía
--        los campos necesarios (html_template, css_styles, pdf_config, assets)
-- ============================================================================



-- Recrear stored procedure con campos completos
DROP PROCEDURE IF EXISTS Entregables_PDF_BuscarXTareaID;

DELIMITER $$

CREATE PROCEDURE Entregables_PDF_BuscarXTareaID(
  p_tarea_id INT
)
BEGIN
    -- Buscar plantilla activa para la tarea profesional
    -- Devuelve TODOS los campos necesarios para renderizar el PDF
    SELECT 
      e.entregable_id, 
      e.nombre, 
      e.codigo, 
      e.descripcion, 
      e.version,
      e.html_template,
      e.css_styles,
      e.pdf_config,
      e.template_engine,
      e.placeholders,
      e.assets,
      rel.orden
    FROM Entregables_PDF e
    INNER JOIN Tareas_Profesionales_Entregables_PDF rel 
      ON e.entregable_id = rel.entregable_id
    WHERE rel.tarea_id = p_tarea_id
      AND rel.baja_fecha IS NULL  -- Solo relaciones activas (sin fecha de baja)
      AND (e.baja_fecha IS NULL OR e.baja_fecha > NOW())
    ORDER BY rel.orden ASC
    LIMIT 1;  -- Tomar solo la primera plantilla activa

END$$

DELIMITER ;

-- Verificar que el SP se creó correctamente
SELECT 'SP Entregables_PDF_BuscarXTareaID actualizado correctamente' AS resultado;

-- Probar el SP con la tarea PYDOA (tarea_id = 1)
SELECT 'Probando SP con tarea_id de PYDOA...' AS paso;

CALL Entregables_PDF_BuscarXTareaID(
  (SELECT tarea_id FROM Tareas_Profesionales WHERE codi = 'PYDOA' LIMIT 1)
);
