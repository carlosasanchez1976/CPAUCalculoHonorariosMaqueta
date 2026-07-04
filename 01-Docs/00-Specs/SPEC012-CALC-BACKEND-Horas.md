Implementar cambios en el backend para agregar el campo "horas" en calculo de honorarios
dado la gran cantidd de tipos de cálculos que lo utilizan.

Con el resto de cálculos se cargan los valores en otros campos creados originalemente para el tipo de cálculo
PYDOA, pero dada la magnitud e importancia del campo "horas", se necesita modificar tablas, sps y APIs con ese agregado.

alter table Calculos add column horas decimal(6,2) null after obra_complejidad;
alter table Calculos add column hasta_60_km boolean null after horas;

Agregar estos campos en esturctura de tabla, en sps dependientes y en API body request y responses.

Luego se enviará el cambio al frontend

tareas

OK 1 - Modificar tabla calculos
OK 2 - Identificar y modificar sps dependientes
OK 3 - Modificar APIs de datos de tabla calculos
4 - Identificar y modificar sps de cálculo de honorarios
5 - Modificar APIs de cálculo (si corresponde)
6 - Se debe modificar template de PDF. Analizar e implementar.

********************
*** IMPLEMENTADA ***
********************