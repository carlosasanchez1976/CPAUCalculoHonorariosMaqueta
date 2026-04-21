CALL Calculos_Grabar(
  null,                                      -- calculo_id
  1,                                         -- usuario_id
  18,                                       -- tarea_id
  '2026-04-21 10:30:00',                    -- fecha_calculo
  'Edificio Guemes',          -- proyecto_nombre
  'Lincoln, Bs As',                         -- proyecto_ubicacion
  'Constructora del Norte SA',              -- proyecto_cliente
  1692000000.00,                              -- obra_valor_obra
  800.00,                                  -- obra_superficie
  'Edificio Residencial',                   -- obra_tipologia
  'Media',                                  -- obra_complejidad
  TRUE,                                     -- tarea_obra_proyecto
  TRUE,                                     -- tarea_obra_direccion
  TRUE,                                     -- tarea_instalacion_sanitaria
  TRUE,                                     -- tarea_instalacion_electrica
  TRUE,                                    -- tarea_instalacion_contra_incendio
  TRUE,                                    -- tarea_instalacion_termomecanica
  TRUE                                      -- tarea_proyecto_estructuras
);




CALL Calculos_Grabar(
  null,                                      -- calculo_id
  1,                                         -- usuario_id
  18,                                       -- tarea_id
  '2026-04-21 10:30:00',                    -- fecha_calculo
  'Edificio Guemes',          -- proyecto_nombre
  'Lincoln, Bs As',                         -- proyecto_ubicacion
  'Constructora del Norte SA',              -- proyecto_cliente
  1692000000.00,                              -- obra_valor_obra
  800.00,                                  -- obra_superficie
  'Edificio Residencial',                   -- obra_tipologia
  'Media',                                  -- obra_complejidad
  TRUE,                                     -- tarea_obra_proyecto
  FALSE,                                     -- tarea_obra_direccion
  FALSE,                                     -- tarea_instalacion_sanitaria
  FALSE,                                     -- tarea_instalacion_electrica
  FALSE,                                    -- tarea_instalacion_contra_incendio
  FALSE,                                    -- tarea_instalacion_termomecanica
  FALSE                                      -- tarea_proyecto_estructuras
);