
DROP PROCEDURE IF EXISTS Entregables_PDF_BuscarXTareaID;
DELIMITER $$

CREATE PROCEDURE Entregables_PDF_BuscarXTareaID(
  p_tarea_id INT
)
BEGIN

    SELECT 
      e.entregable_id, e.nombre, e.codigo, e.descripcion, e.version,
      rel.orden
    FROM Entregables_PDF e
    INNER JOIN Tareas_Profesionales_Entregables_PDF rel 
      ON e.entregable_id = rel.entregable_id
    WHERE rel.tarea_id = p_tarea_id
      AND (e.baja_fecha IS NULL OR e.baja_fecha > NOW())
    ORDER BY rel.orden ASC;




END$$
DELIMITER ;