-- ============================================================================
-- STORED PROCEDURE: Calculos_Dashboard
-- ============================================================================
-- Fecha: 2026-08-01 (SPEC-027 v1.2)
-- Propósito: Retornar métricas agregadas para dashboard de administración
-- Endpoint: GET /api/calculos/dashboard
-- ============================================================================
-- CAMBIOS:
-- v1.1: Usa campo fecha_calculo (que tiene índice idx_fecha) en lugar de created_at
-- v1.2: Serie temporal limitada a máximo 60 días (independiente del rango solicitado)
-- 14/08/2026: se agrega total de cálculos con comentarios (app_exp_observ no nulo)
--             se quita cálculo de valor promedio de obra (se envía a frontend por compatibilidad)
-- ============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS Calculos_Dashboard$$

CREATE PROCEDURE Calculos_Dashboard(
  IN p_fecha_desde DATE,
  IN p_fecha_hasta DATE
)
BEGIN
  -- ========================================================================
  -- RESULTSET 1: RESUMEN GENERAL
  -- ========================================================================
  -- Retorna 1 fila con 7 métricas clave

  
  SELECT
    -- Total de usuarios nuevos (por fec_ult_act)
    (SELECT COUNT(*) 
     FROM Usuarios
     WHERE fec_ult_act BETWEEN p_fecha_desde AND (p_fecha_hasta + INTERVAL 1 DAY)
    ) AS totalUsuariosNuevos,
    
    -- Total de cálculos nuevos (por fecha_calculo)
    (SELECT COUNT(*) 
     FROM Calculos
     WHERE fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
    ) AS totalCalculosNuevos,
    
    -- Total de cálculos con puntaje
    (SELECT COUNT(*) 
     FROM Calculos
     WHERE fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
       AND app_exp_puntaje IS NOT NULL
    ) AS totalCalculosConPuntaje,
    
    -- Promedio de puntaje (NULL si no hay puntajes)
    (SELECT AVG(app_exp_puntaje)
     FROM Calculos
     WHERE fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
       AND app_exp_puntaje IS NOT NULL
    ) AS promedioPuntaje,

    -- Cantidad de calculos con comentarios (app_exp_observ no nulo)
    (SELECT COUNT(*)
     FROM Calculos
     WHERE fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
       AND app_exp_observ IS NOT NULL
    ) AS totalCalculosConComentarios,

    -- Usuarios activos (usuarios que hicieron al menos 1 cálculo)
    (SELECT COUNT(DISTINCT usuario_id)
     FROM Calculos
     WHERE fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
    ) AS usuariosActivos,
    0 as valorPromedioObra;

  
  
  -- ========================================================================
  -- RESULTSET 2: SERIE TEMPORAL DIARIA
  -- ========================================================================
  -- Retorna 1 fila por cada día del rango (incluye días sin datos con 0)
  -- LÍMITE: Máximo 60 días (últimos 60 días del rango solicitado)
  -- Esto mejora performance y usabilidad en gráficos del frontend
  
  WITH RECURSIVE fechas_rango AS (
    -- Generar todas las fechas del rango (limitado a últimos 60 días)
    SELECT GREATEST(
      p_fecha_desde,
      DATE_SUB(p_fecha_hasta, INTERVAL 59 DAY)
    ) AS fecha
    UNION ALL
    SELECT DATE_ADD(fecha, INTERVAL 1 DAY)
    FROM fechas_rango
    WHERE fecha < p_fecha_hasta
  )
  SELECT
    f.fecha,
    COALESCE(u.usuarios_nuevos, 0) AS usuariosNuevos,
    COALESCE(c.calculos_nuevos, 0) AS calculosNuevos
  FROM
    fechas_rango f
  LEFT JOIN (
    -- Usuarios nuevos por día
    SELECT DATE(fec_ult_act) AS fecha, COUNT(*) AS usuarios_nuevos
    FROM Usuarios
    WHERE fec_ult_act BETWEEN p_fecha_desde AND (p_fecha_hasta + INTERVAL 1 DAY)
    GROUP BY DATE(fec_ult_act)
  ) u ON f.fecha = u.fecha
  LEFT JOIN (
    -- Cálculos nuevos por día
    SELECT DATE(fecha_calculo) AS fecha, COUNT(*) AS calculos_nuevos
    FROM Calculos
    WHERE fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
    GROUP BY DATE(fecha_calculo)
  ) c ON f.fecha = c.fecha
  ORDER BY f.fecha ASC;
  
  
  -- ========================================================================
  -- RESULTSET 3: DISTRIBUCIÓN POR TAREA PROFESIONAL
  -- ========================================================================
  -- Retorna 1 fila por cada tarea con cálculos en el período
  -- Ordenado DESC por cantidad
  
  SELECT
    TP.codi AS tareaCodigo,
    TP.descripcion AS tareaDescripcion,
    COUNT(*) AS totalCalculos
  FROM
    Calculos C
    INNER JOIN Tareas_Profesionales TP ON C.tarea_id = TP.tarea_id
  WHERE
    C.fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
  GROUP BY
    TP.codi, TP.descripcion
  ORDER BY
    totalCalculos DESC;
  
  
  -- ========================================================================
  -- RESULTSET 4: TOP 5 USUARIOS MÁS ACTIVOS
  -- ========================================================================
  -- Retorna máximo 5 usuarios con más cálculos en el período
  
  SELECT
    U.user_id AS usuarioId,
    CONCAT(U.user_nombre, ' ', U.user_apellido) AS nombreCompleto,
    U.user_mail AS email,
    COUNT(C.calculo_id) AS totalCalculos,
    MAX(C.fecha_calculo) AS ultimaActividad
  FROM
    Usuarios U
    INNER JOIN Calculos C ON U.user_id = C.usuario_id
  WHERE
    C.fecha_calculo BETWEEN p_fecha_desde AND (p_fecha_hasta + INTERVAL 1 DAY)
  GROUP BY
    U.user_id, U.user_nombre, U.user_apellido, U.user_mail
  ORDER BY
    totalCalculos DESC
  LIMIT 5;
  
  
  -- ========================================================================
  -- RESULTSET 5: DISTRIBUCIÓN DE PUNTAJES
  -- ========================================================================
  -- Retorna 1 fila por cada puntaje (1-5), incluso si no hay datos (0)
  
  WITH puntajes_posibles AS (
    SELECT 1 AS puntaje
    UNION SELECT 2
    UNION SELECT 3
    UNION SELECT 4
    UNION SELECT 5
  )
  SELECT
    p.puntaje,
    COALESCE(COUNT(C.calculo_id), 0) AS cantidad
  FROM
    puntajes_posibles p
  LEFT JOIN Calculos C 
    ON C.app_exp_puntaje = p.puntaje
    AND C.fecha_calculo BETWEEN p_fecha_desde AND p_fecha_hasta
  GROUP BY
    p.puntaje
  ORDER BY
    p.puntaje ASC;
  
  
  -- ========================================================================
  -- RESULTSET 6: RESERVADO PARA FUTURAS MÉTRICAS
  -- ========================================================================
  -- Placeholder: Retorna 1 fila vacía
  
  SELECT 
    NULL AS placeholder1,
    NULL AS placeholder2;
  
  
  -- ========================================================================
  -- RESULTSET 7: RESERVADO PARA FUTURAS MÉTRICAS
  -- ========================================================================
  -- Placeholder: Retorna 1 fila vacía
  
  SELECT 
    NULL AS placeholder1,
    NULL AS placeholder2;

END$$

DELIMITER ;

