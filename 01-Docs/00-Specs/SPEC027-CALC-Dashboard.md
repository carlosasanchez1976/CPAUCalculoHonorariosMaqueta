# SPEC-CALC-027: Dashboard de Métricas de Cálculos

**Proyecto:** CH2026 - CPAU Cálculo de Honorarios  
**Fecha de Creación:** 2026-07-31  
**Última Actualización:** 2026-08-01  
**Versión:** 1.2  
**Autor:** Equipo Desarrollo CH2026  
**Estado:** 📝 DRAFT  
**Prioridad:** MEDIA

---

## 1. CONTEXTO Y MOTIVACIÓN

### 1.1 Problema a Resolver

Los administradores y el equipo de CPAU necesitan visibilidad sobre:
- Evolución de adopción de la plataforma (altas de usuarios y cálculos)
- Distribución de uso por tipo de tarea profesional
- Calidad de experiencia del usuario (puntajes de satisfacción)
- Métricas clave para toma de decisiones sobre mejoras

Actualmente estos datos se extraen manualmente con consultas SQL individuales.

### 1.2 Solución Propuesta

Crear un **endpoint de dashboard** que retorne métricas agregadas en formato JSON para ser visualizadas en el frontend con gráficos interactivos (Chart.js, Recharts, etc.).

**Endpoint:** `GET /api/calculos/dashboard`

---

## 2. REQUERIMIENTOS FUNCIONALES

### 2.1 Parámetros de Entrada

| Parámetro | Tipo | Requerido | Descripción | Validación |
|-----------|------|-----------|-------------|------------|
| `fechaDesde` | DATE (ISO 8601) | No | Fecha inicio del período | YYYY-MM-DD, máximo 1 año desde `fechaHasta` |
| `fechaHasta` | DATE (ISO 8601) | No | Fecha fin del período | YYYY-MM-DD, no puede ser futuro |

**Comportamiento por defecto:**
- Si **ambos parámetros son NULL** → últimos 30 días (hoy - 30 días hasta hoy)
- Si solo `fechaDesde` → desde esa fecha hasta hoy
- Si solo `fechaHasta` → desde hace 30 días hasta `fechaHasta`

**Validaciones:**
- Rango máximo: **1 año** entre `fechaDesde` y `fechaHasta`
- Formato obligatorio: ISO 8601 (`YYYY-MM-DD`)
- `fechaHasta` no puede ser mayor a fecha actual
- `fechaDesde` no puede ser mayor a `fechaHasta`

### 2.2 Métricas Retornadas

#### A. **Resumen General**
```json
{
  "resumen": {
    "totalUsuariosNuevos": 125,
    "totalCalculosNuevos": 847,
    "totalCalculosConPuntaje": 342,
    "promedioPuntaje": 4.2,
    "usuariosActivos": 98,
    "valorPromedioObra": 125000000
  }
}
```

**Definiciones:**
- `totalUsuariosNuevos`: COUNT de usuarios con `fec_ult_act` en el período
- `totalCalculosNuevos`: COUNT de cálculos con `fecha_calculo` en el período
- `totalCalculosConPuntaje`: COUNT de cálculos con `app_exp_puntaje IS NOT NULL` en el período
- `promedioPuntaje`: AVG de `app_exp_puntaje` (NULL si no hay puntajes)
- `usuariosActivos`: COUNT DISTINCT de `usuario_id` en cálculos del período
- `valorPromedioObra`: AVG de `obra_valor_obra` en cálculos del período

#### B. **Serie Temporal Diaria**
```json
{
  "serieTemporal": [
    {
      "fecha": "2026-07-01",
      "usuariosNuevos": 5,
      "calculosNuevos": 23
    },
    {
      "fecha": "2026-07-02",
      "usuariosNuevos": 3,
      "calculosNuevos": 18
    }
    // ... un registro por cada día (máximo 60 días)
  ]
}
```

**Uso:** Gráfico de líneas temporal mostrando evolución diaria.

**⚠️ LÍMITE DE 60 DÍAS:** Independientemente del rango solicitado, la serie temporal siempre mostrará **máximo los últimos 60 días** del período. Esto garantiza:
- ✅ Performance óptima del endpoint
- ✅ Gráficos legibles en el frontend
- ✅ Response size controlado

**Ejemplo:** Si se solicita `fechaDesde=2026-01-01` y `fechaHasta=2026-07-31` (7 meses), el resumen general usará todo el período, pero la serie temporal solo mostrará del 2026-06-01 al 2026-07-31 (últimos 60 días).

#### C. **Distribución por Tarea Profesional**
```json
{
  "distribucionTareas": [
    {
      "tareaCodigo": "PYDOA",
      "tareaDescripcion": "Proyecto y Dirección de Obras de Arquitectura",
      "totalCalculos": 312,
      "porcentaje": 36.8
    },
    {
      "tareaCodigo": "HABI",
      "tareaDescripcion": "Habilitaciones",
      "totalCalculos": 156,
      "porcentaje": 18.4
    }
    // ... ordenado descendente por totalCalculos
  ]
}
```

**Uso:** Gráfico de torta/dona mostrando distribución de uso.

#### D. **Top 5 Usuarios Más Activos**
```json
{
  "topUsuarios": [
    {
      "usuarioId": 42,
      "nombreCompleto": "Juan Pérez",
      "email": "jperez@ejemplo.com",
      "totalCalculos": 45,
      "ultimaActividad": "2026-07-30T14:23:00Z"
    }
    // ... máximo 5 usuarios
  ]
}
```

**Uso:** Tabla de usuarios más activos del período.

#### E. **Distribución de Puntajes**
```json
{
  "distribucionPuntajes": [
    { "puntaje": 1, "cantidad": 12 },
    { "puntaje": 2, "cantidad": 28 },
    { "puntaje": 3, "cantidad": 89 },
    { "puntaje": 4, "cantidad": 145 },
    { "puntaje": 5, "cantidad": 68 }
  ]
}
```

**Uso:** Gráfico de barras de satisfacción.

---

## 3. ESTRUCTURA DEL RESPONSE

### 3.1 Response Exitoso (200 OK)

```json
{
  "success": true,
  "data": {
    "periodo": {
      "desde": "2026-07-01",
      "hasta": "2026-07-31"
    },
    "resumen": { ... },
    "serieTemporal": [ ... ],
    "distribucionTareas": [ ... ],
    "topUsuarios": [ ... ],
    "distribucionPuntajes": [ ... ]
  },
  "version": "1.0"
}
```

### 3.2 Response de Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Rango de fechas excede el máximo permitido de 1 año",
  "version": "1.0"
}
```

**Mensajes de error posibles:**
- `"Formato de fecha inválido. Use YYYY-MM-DD"`
- `"Rango de fechas excede el máximo permitido de 1 año"`
- `"fechaHasta no puede ser mayor a la fecha actual"`
- `"fechaDesde no puede ser mayor a fechaHasta"`

---

## 4. ARQUITECTURA BACKEND

### 4.1 Stored Procedure: `Calculos_Dashboard`

**Ubicación:** `App/Backend/DB/03-Sps/Calculo_Dashboard.sql`

**Firma:**
```sql
CALL Calculos_Dashboard(
  IN p_fecha_desde DATE,
  IN p_fecha_hasta DATE
)
```

**Optimizaciones vs. versión actual:**

1. **Agregar serie temporal diaria** (nuevo SELECT)
2. **Agregar usuarios activos** (COUNT DISTINCT usuario_id)
3. **Agregar top usuarios** (nuevo SELECT con JOIN a Usuarios)
4. **Agregar distribución de puntajes** (nuevo SELECT con GROUP BY)
5. **Agregar valor promedio de obra** (AVG obra_valor_obra)
6. **Usar campo `fecha_calculo`** (que ya tiene índice `idx_fecha`) en lugar de `created_at`
7. **Optimizar filtros de fecha** usando `BETWEEN` en lugar de `>=` y `<=`

**Estructura de resultsets:**
El SP retornará **7 resultsets** en orden:
1. Resumen general (1 fila)
2. Serie temporal (N filas, una por día)
3. Distribución por tareas (N filas)
4. Top 5 usuarios (máximo 5 filas)
5. Distribución puntajes (5 filas)
6. (Reservado para futuras métricas)
7. (Reservado para futuras métricas)

### 4.2 Modelo: `calculoModel.getDashboard()`

**Ubicación:** `App/Backend/Node/src/models/calculo.js`

**Responsabilidades:**
- Validar rango de fechas (máximo 1 año)
- Aplicar defaults si fechas son NULL
- Llamar al SP `Calculos_Dashboard`
- Parsear los 7 resultsets y estructurar JSON
- Calcular porcentajes de distribución de tareas

### 4.3 Controller: `calculosController.getDashboard()`

**Ubicación:** `App/Backend/Node/src/controllers/calculosController.js`

**Responsabilidades:**
- Validar query params `fechaDesde` y `fechaHasta`
- Llamar a `calculoModel.getDashboard()`
- Manejar errores y retornar response estandarizado

### 4.4 Ruta

**Ubicación:** `App/Backend/Node/src/app.js` (o router específico)

```javascript
router.get('/api/calculos/dashboard', calculosController.getDashboard);
```

**Autenticación:** Requiere token JWT válido (NO requiere rol ADMIN).

---

## 5. ÍNDICES NECESARIOS

### 5.1 Análisis de Performance

**Consultas críticas que se ejecutarán:**

1. `SELECT COUNT(*) FROM Calculos WHERE fecha_calculo BETWEEN ... AND ...`
   - **Índice existente:** `idx_fecha` (sobre `fecha_calculo`) ✅ **SIRVE**
   - **Necesario:** Ninguno adicional

2. `SELECT COUNT(*) FROM Calculos WHERE ... AND app_exp_puntaje IS NOT NULL`
   - **Índice existente:** `idx_fecha` cubre el filtro de fechas ✅
   - **Opcional:** Índice compuesto `(fecha_calculo, app_exp_puntaje)` para mayor optimización

3. `SELECT ... FROM Usuarios WHERE fec_ult_act BETWEEN ... AND ...`
   - **Índice existente:** Ninguno ❌
   - **Necesario:** Índice sobre `fec_ult_act`

4. `SELECT ... FROM Calculos GROUP BY DATE(fecha_calculo)`
   - **Cubierto por:** `idx_fecha` ✅

5. `SELECT ... FROM Calculos GROUP BY tarea_id`
   - **Índice existente:** FK constraint ya crea índice sobre `tarea_id` ✅

### 5.2 Índices a Crear

**Script SQL:**
```sql
-- Índice compuesto OPCIONAL para queries con puntaje (optimización adicional)
CREATE INDEX idx_calculos_fecha_puntaje ON Calculos(fecha_calculo, app_exp_puntaje);

-- Índice para filtros por fecha de alta de usuarios
CREATE INDEX idx_usuarios_fec_ult_act ON Usuarios(fec_ult_act);

-- Índice para ordenar por total de cálculos en top usuarios
-- (Ya cubierto por idx_usuario existente en Calculos)
```

**Notas:**
- ✅ El índice `idx_fecha` existente sobre `Calculos.fecha_calculo` ya cubre la mayoría de queries
- ⚡ El índice compuesto `idx_calculos_fecha_puntaje` es OPCIONAL (solo si se detecta lentitud en queries de puntajes)
- ✅ El índice `idx_usuarios_fec_ult_act` es NECESARIO (no existe actualmente)

**Impacto esperado:**
- ✅ Queries de dashboard usan **index seek** (ya cubierto por `idx_fecha`)
- ✅ Tiempo de respuesta estimado: **<200ms** para rangos de 1 año
- ⚠️ Overhead en escritura: ~2% (solo el índice de Usuarios, el opcional agrega ~3% más)

---

## 6. CASOS DE USO

### 6.1 UC-001: Dashboard General (Últimos 30 Días)

**Request:**
```http
GET /api/calculos/dashboard
Authorization: Bearer <token>
```

**Response:**
Dashboard con métricas de los últimos 30 días.

### 6.2 UC-002: Dashboard de Período Específico

**Request:**
```http
GET /api/calculos/dashboard?fechaDesde=2026-01-01&fechaHasta=2026-06-30
Authorization: Bearer <token>
```

**Response:**
Dashboard del primer semestre 2026.

### 6.3 UC-003: Dashboard Mensual

**Request:**
```http
GET /api/calculos/dashboard?fechaDesde=2026-07-01&fechaHasta=2026-07-31
Authorization: Bearer <token>
```

**Response:**
Dashboard del mes de julio 2026.

---

## 7. CONSIDERACIONES TÉCNICAS

### 7.1 Performance

- **Caching:** No implementar cache por ahora (los datos cambian frecuentemente)
- **Timeout:** Configurar timeout de 10 segundos para el SP
- **Paginación:** NO necesaria (datos ya están agregados)

### 7.2 Escalabilidad Futura

**Extensiones posibles:**
- Filtro por `tarea_id` específica
- Filtro por rango de `obra_valor_obra`
- Comparación con período anterior (% de crecimiento)
- Exportación a CSV/Excel (endpoint adicional)
- Métricas de tiempo promedio de cálculo
- Tasa de conversión (usuarios registrados vs. usuarios que calculan)

**Estructura JSON preparada:**
El objeto raíz permite agregar nuevas claves sin breaking changes:
```json
{
  "success": true,
  "data": {
    "periodo": { ... },
    "resumen": { ... },
    // ... métricas existentes
    "metricasAvanzadas": { ... }  // ← Futuro
  }
}
```

### 7.3 Seguridad

- ✅ Requiere autenticación JWT
- ✅ Validación de parámetros de entrada
- ✅ Sanitización de fechas (SQL injection prevention)
- ⚠️ **NO requiere rol ADMIN** (control en frontend)
- ⚠️ Los datos son agregados (no exponen información sensible individual)

---

## 8. TESTING

### 8.1 Test Cases Backend

| ID | Caso | Input | Output Esperado |
|----|------|-------|----------------|
| TC-001 | Sin parámetros | `{}` | Últimos 30 días |
| TC-002 | Solo fechaDesde | `{ fechaDesde: "2026-07-01" }` | Desde 2026-07-01 hasta hoy |
| TC-003 | Solo fechaHasta | `{ fechaHasta: "2026-07-31" }` | Desde 2026-07-01 hasta 2026-07-31 |
| TC-004 | Ambas fechas | `{ fechaDesde: "2026-01-01", fechaHasta: "2026-06-30" }` | Semestre completo |
| TC-005 | Rango > 1 año | `{ fechaDesde: "2025-01-01", fechaHasta: "2026-07-31" }` | Error 400 |
| TC-006 | Fecha futura | `{ fechaHasta: "2027-01-01" }` | Error 400 |
| TC-007 | Fechas invertidas | `{ fechaDesde: "2026-07-31", fechaHasta: "2026-07-01" }` | Error 400 |
| TC-008 | Formato inválido | `{ fechaDesde: "31/07/2026" }` | Error 400 |

### 8.2 Test Cases SP

- Verificar que retorna exactamente 7 resultsets
- Verificar que serie temporal no tiene gaps (todos los días del rango)
- Verificar que porcentajes de distribución de tareas suman ~100%
- Verificar que top usuarios está ordenado descendente

---

## 9. TICKETS DE IMPLEMENTACIÓN

### 🎫 **T027-001: Crear Índice en Tabla Usuarios** ✅ COMPLETADO

**Prioridad:** MEDIA (prerequisito opcional para T027-002)  
**Estimación:** 0.25 horas  
**Asignado a:** DBA / Backend Developer  
**Fecha de Completado:** 2026-08-01

**Descripción:**
Crear índice necesario para optimizar queries de usuarios nuevos en el dashboard. El índice principal sobre `Calculos.fecha_calculo` ya existe (`idx_fecha`).

**Tareas:**
- [x] Verificar que índice `idx_fecha` existe en tabla `Calculos` (sobre `fecha_calculo`)
- [x] Crear índice `idx_usuarios_fec_ult_act` en DB `cpau_ch_dev`
- [x] Crear índice `idx_usuarios_fec_ult_act` en DB `cpau_ch_qa`
- [ ] (OPCIONAL) Crear índice compuesto `idx_calculos_fecha_puntaje` si se requiere optimización adicional
- [x] Validar índices creados con `SHOW INDEX FROM Usuarios`
- [x] Ejecutar `ANALYZE TABLE Usuarios`

**Archivos:**
- `App/Backend/DB/04-Indexes/dashboard_indexes.sql` ✅ CREADO

**Criterios de Aceptación:**
- ✅ Índice `idx_fecha` confirmado en `Calculos` (pre-existente)
- ✅ Índice `idx_usuarios_fec_ult_act` creado sin errores
- ✅ Query plan de `EXPLAIN SELECT ... WHERE fecha_calculo BETWEEN ...` usa `idx_fecha`
- ✅ Query plan de `EXPLAIN SELECT ... WHERE fec_ult_act BETWEEN ...` usa `idx_usuarios_fec_ult_act`

---

### 🎫 **T027-002: Actualizar Stored Procedure Calculos_Dashboard** ✅ COMPLETADO

**Prioridad:** ALTA  
**Estimación:** 3 horas  
**Asignado a:** Backend Developer  
**Fecha de Completado:** 2026-08-01  
**Depende de:** T027-001 (opcional - el índice principal `idx_fecha` ya existe)

**Descripción:**
Refactorizar el SP `Calculos_Dashboard` para retornar las 7 secciones de métricas definidas en la SPEC, usando el campo `fecha_calculo` que ya tiene índice.

**Tareas:**
- [x] Modificar firma del SP (mantener `p_fecha_desde`, `p_fecha_hasta`)
- [x] Agregar SELECT 1: Resumen general (6 métricas)
- [x] Agregar SELECT 2: Serie temporal diaria (usuarios y cálculos)
- [x] Modificar SELECT 3: Distribución por tareas (agregar ordenamiento DESC)
- [x] Agregar SELECT 4: Top 5 usuarios activos
- [x] Agregar SELECT 5: Distribución de puntajes (GROUP BY app_exp_puntaje)
- [x] Agregar SELECT 6 y 7: Placeholders vacíos para futuro
- [x] **Usar campo `fecha_calculo`** en filtros (ya tiene índice `idx_fecha`)
- [x] Optimizar filtros usando `BETWEEN` en lugar de `>=` y `<=`
- [x] Agregar comentarios SQL explicativos
- [x] Testing manual con diferentes rangos de fechas

**Archivos:**
- `App/Backend/DB/03-Sps/Calculo_Dashboard.sql` ✅ ACTUALIZADO

**Query de prueba:**
```sql
CALL Calculos_Dashboard('2026-07-01', '2026-07-31');
```

**Criterios de Aceptación:**
- ✅ SP retorna exactamente 7 resultsets
- ✅ Serie temporal cubre todos los días del rango sin gaps
- ✅ Top usuarios limitado a 5 registros máximo
- ✅ Distribución de puntajes retorna 5 filas (puntajes 1-5)
- ✅ Query ejecuta en <500ms para rango de 1 año (en DB local con datos de prueba)

---

### 🎫 **T027-003: Implementar Modelo calculoModel.getDashboard()** ✅ COMPLETADO

**Prioridad:** ALTA  
**Estimación:** 4 horas  
**Asignado a:** Backend Developer  
**Fecha de Completado:** 2026-08-01  
**Depende de:** T027-002

**Descripción:**
Crear función en el modelo para llamar al SP, validar inputs y estructurar el response JSON.

**Tareas:**
- [x] Crear función `getDashboard(fechaDesde, fechaHasta)` en `calculo.js`
- [x] Implementar lógica de defaults (si fechas NULL → últimos 30 días)
- [x] Validar rango máximo de 1 año
- [x] Validar que `fechaHasta` <= fecha actual
- [x] Validar que `fechaDesde` <= `fechaHasta`
- [x] Llamar a `db.executeStoredProcedure('Calculos_Dashboard', [fechaDesde, fechaHasta])`
- [x] Parsear los 7 resultsets del SP
- [x] Calcular porcentajes de `distribucionTareas` (campo `porcentaje`)
- [x] Formatear fechas en ISO 8601
- [x] Estructurar objeto JSON según SPEC (sección 3.1)
- [x] Manejar caso de SP sin resultados (retornar arrays vacíos)
- [x] Agregar logging de debug

**Archivos:**
- `App/Backend/Node/src/models/calculo.js` ✅ ACTUALIZADO (función agregada y exportada)

**Características implementadas:**
- ✅ Validación completa de parámetros de entrada con errores descriptivos
- ✅ Lógica de defaults según los 3 casos de la SPEC
- ✅ Parsing de los 7 resultsets del SP
- ✅ Cálculo automático de porcentajes en distribucionTareas
- ✅ Formateo de fechas a ISO 8601
- ✅ Manejo de valores NULL en puntajes y valor de obra
- ✅ Logging con emojis para debugging
- ✅ Estructura de errores estandarizada {code, message, detail}

**Criterios de Aceptación:**
- ✅ Función retorna JSON con estructura definida en SPEC 3.1
- ✅ Validaciones de rango arrojan errores descriptivos
- ✅ Defaults aplicados correctamente cuando fechas son NULL
- ✅ Porcentajes de distribución de tareas suman ~100% (± 0.1%)
- ✅ Serie temporal no tiene gaps (todos los días presentes)
- ✅ Fechas retornadas en formato ISO 8601 (`YYYY-MM-DD`)

---

### 🎫 **T027-004: Implementar Controller calculosController.getDashboard()** ✅ COMPLETADO

**Prioridad:** ALTA  
**Estimación:** 2 horas  
**Asignado a:** Backend Developer  
**Fecha de Completado:** 2026-08-01  
**Depende de:** T027-003

**Descripción:**
Crear endpoint HTTP `GET /api/calculos/dashboard` con validación de query params.

**Tareas:**
- [x] Crear función `getDashboard(req, res)` en `calculosController.js`
- [x] Validar query params `fechaDesde` y `fechaHasta` (formato ISO 8601)
- [x] Llamar a `calculoModel.getDashboard()`
- [x] Manejar errores de validación (400 Bad Request)
- [x] Manejar errores del modelo/SP (500 Internal Server Error)
- [x] Retornar response estandarizado con `success`, `data`, `version`
- [x] Agregar logging de acceso y errores

**Archivos:**
- `App/Backend/Node/src/controllers/calculosController.js` ✅ ACTUALIZADO (función agregada y exportada)

**Características implementadas:**
- ✅ Validación de formato ISO 8601 con regex `/^\d{4}-\d{2}-\d{2}$/`
- ✅ Normalización de valores vacíos a `null`
- ✅ Diferenciación de errores VALIDATION_ERROR (400) vs DB_ERROR (500)
- ✅ Logging con emojis (📊 éxito, ❌ error)
- ✅ Response estandarizado con estructura `{ success, data, version }`
- ✅ Campo `detail` en errores (solo visible en desarrollo)

**Criterios de Aceptación:**
- ✅ Endpoint responde 200 con datos válidos
- ✅ Endpoint responde 400 con mensaje descriptivo en errores de validación
- ✅ Endpoint responde 500 en errores internos
- ✅ Response tiene estructura `{ success, data, version }`
- ✅ Logs registran accesos exitosos y errores

**Archivos:**
- `App/Backend/Node/src/controllers/calculosController.js` (MODIFICAR)

**Estructura de código:**
```javascript
exports.getDashboard = async (req, res) => {
    try {
        const { fechaDesde, fechaHasta } = req.query;
        
        // Validar formatos
        if (fechaDesde && !isValidISODate(fechaDesde)) {
            return res.status(400).json({ ... });
        }
        
        const data = await calculoModel.getDashboard(fechaDesde, fechaHasta);
        
        return res.status(200).json({
            success: true,
            data,
            version: '1.0'
        });
    } catch (error) {
        // Manejar errores
    }
};
```

**Criterios de Aceptación:**
- ✅ Endpoint responde 200 con datos válidos
- ✅ Endpoint responde 400 con mensaje descriptivo en errores de validación
- ✅ Endpoint responde 500 en errores internos
- ✅ Response tiene estructura `{ success, data, version }`
- ✅ Logs registran accesos exitosos y errores

---

### 🎫 **T027-005: Registrar Ruta GET /api/calculos/dashboard** ✅ COMPLETADO

**Prioridad:** ALTA  
**Estimación:** 0.5 horas  
**Asignado a:** Backend Developer  
**Fecha de Completado:** 2026-08-01  
**Depende de:** T027-004

**Descripción:**
Registrar la nueva ruta en el router de Express con middleware de autenticación.

**Tareas:**
- [x] Agregar ruta en `src/routes/calculos.js`
- [x] Aplicar middleware `verificarToken` (JWT obligatorio)
- [x] NO aplicar middleware `requireAdmin` (acceso para todos los usuarios autenticados)
- [x] Documentar ruta en comentarios

**Archivos:**
- `App/Backend/Node/src/routes/calculos.js` ✅ ACTUALIZADO

**Código implementado:**
```javascript
// Dashboard de métricas de cálculos (SPEC-027)
// GET /api/calculos/dashboard?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
// Acceso: Todos los usuarios autenticados (NO requiere admin)
router.get('/dashboard', verificarToken, honorariosController.getDashboard);
```

**Criterios de Aceptación:**
- ✅ Ruta accesible con token JWT válido
- ✅ Ruta retorna 401 sin token
- ✅ Ruta NO retorna 403 para usuarios no-admin (acceso abierto)

---

### 🎫 **T027-006: Testing Manual y Ajustes**

**Prioridad:** MEDIA  
**Estimación:** 2 horas  
**Asignado a:** Backend Developer + QA  
**Depende de:** T027-005

**Descripción:**
Testing end-to-end del endpoint con diferentes escenarios y ajustes según hallazgos.

**Tareas:**
- [ ] Test TC-001: Sin parámetros (últimos 30 días)
- [ ] Test TC-002: Solo fechaDesde
- [ ] Test TC-003: Solo fechaHasta
- [ ] Test TC-004: Ambas fechas (semestre)
- [ ] Test TC-005: Rango > 1 año (debe fallar 400)
- [ ] Test TC-006: Fecha futura (debe fallar 400)
- [ ] Test TC-007: Fechas invertidas (debe fallar 400)
- [ ] Test TC-008: Formato inválido (debe fallar 400)
- [ ] Verificar performance con EXPLAIN en queries críticos
- [ ] Verificar logs de debug
- [ ] Ajustar mensajes de error según necesidad
- [ ] Documentar ejemplos de request/response

**Herramientas:**
- Postman / Thunder Client
- MySQL Workbench (para EXPLAIN)
- Logs del backend

**Criterios de Aceptación:**
- ✅ Todos los test cases pasan
- ✅ Response time < 500ms para rangos de 1 año
- ✅ Mensajes de error son claros y en español
- ✅ Logs registran información útil para debugging

---

### 🎫 **T027-007: Documentación de API**

**Prioridad:** BAJA  
**Estimación:** 1 hora  
**Asignado a:** Backend Developer

**Descripción:**
Documentar el nuevo endpoint en la documentación de API del proyecto.

**Tareas:**
- [ ] Agregar endpoint en README o documentación de API
- [ ] Incluir ejemplos de request con curl
- [ ] Incluir ejemplos de response exitoso
- [ ] Incluir ejemplos de errores comunes
- [ ] Documentar estructura de cada sección del response
- [ ] Documentar casos de uso recomendados

**Archivos:**
- `01-Docs/API-Documentation.md` (CREAR o MODIFICAR según exista)

**Criterios de Aceptación:**
- ✅ Documentación completa y clara
- ✅ Ejemplos ejecutables con curl
- ✅ Casos de uso documentados

---

## 10. RESUMEN DE TAREAS

| Ticket | Descripción | Estimación | Prioridad | Estado | Dependencias |
|--------|-------------|------------|-----------|--------|--------------|
| T027-001 | Crear índice en Usuarios | 0.25h | MEDIA | ✅ COMPLETADO | - |
| T027-002 | Actualizar SP Dashboard | 3h | ALTA | ✅ COMPLETADO | T027-001 (opcional) |
| T027-003 | Modelo getDashboard() | 4h | ALTA | ✅ COMPLETADO | T027-002 |
| T027-004 | Controller getDashboard() | 2h | ALTA | ✅ COMPLETADO | T027-003 |
| T027-005 | Registrar ruta | 0.5h | ALTA | ✅ COMPLETADO | T027-004 |
| T027-006 | Testing manual | 2h | MEDIA | 📋 PENDIENTE | T027-005 |
| T027-007 | Documentación API | 1h | BAJA | 📋 PENDIENTE | T027-006 |

**Estimación Total:** **12.75 horas** (aprox. 2 días de desarrollo)  
**Progreso:** 5/7 tickets completados (9.75h / 12.75h = 76.5%)

**Nota:** T027-001 reducida a 0.25h porque el índice principal (`idx_fecha` sobre `fecha_calculo`) ya existe.

---

## 11. CONSIDERACIONES DE IMPLEMENTACIÓN

### 11.1 Días sin Datos

Si un día en el rango no tiene cálculos ni usuarios nuevos, la serie temporal debe incluir ese día con valores en 0:

```json
{
  "fecha": "2026-07-15",
  "usuariosNuevos": 0,
  "calculosNuevos": 0
}
```

Esto garantiza que los gráficos de líneas no tengan "huecos".

### 11.2 Timezone

- Todas las fechas en DB están en UTC
- Las fechas de parámetros (`fechaDesde`, `fechaHasta`) deben interpretarse como **inicio y fin del día en timezone Argentina (UTC-3)**
- El SP debe usar `DATE(fecha_calculo)` para comparaciones de días completos

### 11.3 Datos Sensibles

El endpoint NO expone:
- Información personal de usuarios (excepto en top 5: nombre, email)
- Detalles de cálculos individuales
- Montos exactos de obras (solo promedios agregados)

Si en el futuro se requiere anonimizar nombres en top usuarios, usar:
```json
{
  "nombreCompleto": "Usuario #42"
}
```

---

## 12. EJEMPLO DE RESPONSE COMPLETO

### 12.1 Request de Ejemplo

```http
GET /api/calculos/dashboard?fechaDesde=2026-07-01&fechaHasta=2026-07-31
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 12.2 Response de Ejemplo (200 OK)

```json
{
  "success": true,
  "data": {
    "periodo": {
      "desde": "2026-07-01",
      "hasta": "2026-07-31"
    },
    "resumen": {
      "totalUsuariosNuevos": 28,
      "totalCalculosNuevos": 187,
      "totalCalculosConPuntaje": 89,
      "promedioPuntaje": 4.3,
      "usuariosActivos": 142,
      "valorPromedioObra": 285750000
    },
    "serieTemporal": [
      {
        "fecha": "2026-07-01",
        "usuariosNuevos": 2,
        "calculosNuevos": 8
      },
      {
        "fecha": "2026-07-02",
        "usuariosNuevos": 1,
        "calculosNuevos": 12
      },
      {
        "fecha": "2026-07-03",
        "usuariosNuevos": 0,
        "calculosNuevos": 5
      },
      {
        "fecha": "2026-07-04",
        "usuariosNuevos": 3,
        "calculosNuevos": 9
      },
      {
        "fecha": "2026-07-05",
        "usuariosNuevos": 0,
        "calculosNuevos": 3
      },
      {
        "fecha": "2026-07-06",
        "usuariosNuevos": 0,
        "calculosNuevos": 2
      },
      {
        "fecha": "2026-07-07",
        "usuariosNuevos": 1,
        "calculosNuevos": 7
      },
      {
        "fecha": "2026-07-08",
        "usuariosNuevos": 2,
        "calculosNuevos": 11
      },
      {
        "fecha": "2026-07-09",
        "usuariosNuevos": 1,
        "calculosNuevos": 9
      },
      {
        "fecha": "2026-07-10",
        "usuariosNuevos": 0,
        "calculosNuevos": 6
      },
      {
        "fecha": "2026-07-11",
        "usuariosNuevos": 3,
        "calculosNuevos": 13
      },
      {
        "fecha": "2026-07-12",
        "usuariosNuevos": 0,
        "calculosNuevos": 4
      },
      {
        "fecha": "2026-07-13",
        "usuariosNuevos": 0,
        "calculosNuevos": 1
      },
      {
        "fecha": "2026-07-14",
        "usuariosNuevos": 2,
        "calculosNuevos": 10
      },
      {
        "fecha": "2026-07-15",
        "usuariosNuevos": 1,
        "calculosNuevos": 8
      },
      {
        "fecha": "2026-07-16",
        "usuariosNuevos": 0,
        "calculosNuevos": 7
      },
      {
        "fecha": "2026-07-17",
        "usuariosNuevos": 2,
        "calculosNuevos": 12
      },
      {
        "fecha": "2026-07-18",
        "usuariosNuevos": 1,
        "calculosNuevos": 9
      },
      {
        "fecha": "2026-07-19",
        "usuariosNuevos": 0,
        "calculosNuevos": 5
      },
      {
        "fecha": "2026-07-20",
        "usuariosNuevos": 0,
        "calculosNuevos": 3
      },
      {
        "fecha": "2026-07-21",
        "usuariosNuevos": 3,
        "calculosNuevos": 11
      },
      {
        "fecha": "2026-07-22",
        "usuariosNuevos": 1,
        "calculosNuevos": 8
      },
      {
        "fecha": "2026-07-23",
        "usuariosNuevos": 0,
        "calculosNuevos": 6
      },
      {
        "fecha": "2026-07-24",
        "usuariosNuevos": 2,
        "calculosNuevos": 10
      },
      {
        "fecha": "2026-07-25",
        "usuariosNuevos": 1,
        "calculosNuevos": 7
      },
      {
        "fecha": "2026-07-26",
        "usuariosNuevos": 0,
        "calculosNuevos": 4
      },
      {
        "fecha": "2026-07-27",
        "usuariosNuevos": 0,
        "calculosNuevos": 2
      },
      {
        "fecha": "2026-07-28",
        "usuariosNuevos": 1,
        "calculosNuevos": 9
      },
      {
        "fecha": "2026-07-29",
        "usuariosNuevos": 2,
        "calculosNuevos": 11
      },
      {
        "fecha": "2026-07-30",
        "usuariosNuevos": 0,
        "calculosNuevos": 8
      },
      {
        "fecha": "2026-07-31",
        "usuariosNuevos": 1,
        "calculosNuevos": 6
      }
    ],
    "distribucionTareas": [
      {
        "tareaCodigo": "PYDOA",
        "tareaDescripcion": "Proyecto y Dirección de Obras de Arquitectura",
        "totalCalculos": 68,
        "porcentaje": 36.4
      },
      {
        "tareaCodigo": "HABI",
        "tareaDescripcion": "Habilitaciones",
        "totalCalculos": 42,
        "porcentaje": 22.5
      },
      {
        "tareaCodigo": "PYDO",
        "tareaDescripcion": "Proyecto y Dirección de Obra",
        "totalCalculos": 31,
        "porcentaje": 16.6
      },
      {
        "tareaCodigo": "CONFAC",
        "tareaDescripcion": "Conservación de Fachadas",
        "totalCalculos": 18,
        "porcentaje": 9.6
      },
      {
        "tareaCodigo": "TASA",
        "tareaDescripcion": "Tasaciones",
        "totalCalculos": 14,
        "porcentaje": 7.5
      },
      {
        "tareaCodigo": "GPYC",
        "tareaDescripcion": "Gerenciamiento de Proyectos y Construcción",
        "totalCalculos": 8,
        "porcentaje": 4.3
      },
      {
        "tareaCodigo": "HYS",
        "tareaDescripcion": "Higiene y Seguridad",
        "totalCalculos": 6,
        "porcentaje": 3.2
      }
    ],
    "topUsuarios": [
      {
        "usuarioId": 142,
        "nombreCompleto": "María Fernández",
        "email": "mfernandez@estudio-arq.com.ar",
        "totalCalculos": 23,
        "ultimaActividad": "2026-07-31T18:45:22Z"
      },
      {
        "usuarioId": 87,
        "nombreCompleto": "Carlos Rodríguez",
        "email": "crodriguez@cpau.org.ar",
        "totalCalculos": 19,
        "ultimaActividad": "2026-07-30T14:12:08Z"
      },
      {
        "usuarioId": 215,
        "nombreCompleto": "Ana López",
        "email": "alopez@arquitectura.com",
        "totalCalculos": 17,
        "ultimaActividad": "2026-07-31T11:23:45Z"
      },
      {
        "usuarioId": 53,
        "nombreCompleto": "Jorge Martínez",
        "email": "jmartinez@gmail.com",
        "totalCalculos": 15,
        "ultimaActividad": "2026-07-29T16:08:30Z"
      },
      {
        "usuarioId": 198,
        "nombreCompleto": "Laura González",
        "email": "lgonzalez@estudio.com.ar",
        "totalCalculos": 12,
        "ultimaActividad": "2026-07-31T09:15:12Z"
      }
    ],
    "distribucionPuntajes": [
      {
        "puntaje": 1,
        "cantidad": 3
      },
      {
        "puntaje": 2,
        "cantidad": 8
      },
      {
        "puntaje": 3,
        "cantidad": 15
      },
      {
        "puntaje": 4,
        "cantidad": 38
      },
      {
        "puntaje": 5,
        "cantidad": 25
      }
    ]
  },
  "version": "1.0"
}
```

### 12.3 Notas para Frontend

**Uso recomendado del ejemplo:**

1. **Mock en desarrollo local:**
   ```javascript
   // services/dashboardService.js
   const mockResponse = { /* copiar JSON de arriba */ };
   
   export const getDashboard = async (fechaDesde, fechaHasta) => {
     if (process.env.NODE_ENV === 'development' && !process.env.USE_REAL_API) {
       return Promise.resolve(mockResponse);
     }
     return axios.get('/api/calculos/dashboard', { params: { fechaDesde, fechaHasta } });
   };
   ```

2. **Librerías de gráficos recomendadas:**
   - **Recharts** (React): Componentes declarativos, fácil integración
   - **Chart.js** + react-chartjs-2: Versatilidad, muchas opciones
   - **Victory**: Muy customizable, SVG nativo
   - **Apache ECharts**: Enterprise-grade, máxima flexibilidad

3. **Transformaciones necesarias:**

   **Para gráfico de líneas temporal:**
   ```javascript
   const chartData = data.serieTemporal.map(item => ({
     fecha: new Date(item.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
     usuarios: item.usuariosNuevos,
     calculos: item.calculosNuevos
   }));
   ```

   **Para gráfico de torta de tareas:**
   ```javascript
   const pieData = data.distribucionTareas.map(item => ({
     name: item.tareaCodigo,
     value: item.totalCalculos,
     label: `${item.tareaDescripcion} (${item.porcentaje.toFixed(1)}%)`
   }));
   ```

   **Para gráfico de barras de puntajes:**
   ```javascript
   const barData = data.distribucionPuntajes.map(item => ({
     puntaje: `⭐ ${item.puntaje}`,
     cantidad: item.cantidad,
     fill: getPuntajeColor(item.puntaje) // función personalizada
   }));
   ```

4. **Formateo de números:**
   ```javascript
   // Valor promedio de obra
   const formatCurrency = (value) => {
     return new Intl.NumberFormat('es-AR', {
       style: 'currency',
       currency: 'ARS',
       minimumFractionDigits: 0
     }).format(value);
   };
   
   // Promedio de puntaje
   const formatRating = (value) => value.toFixed(1) + ' / 5.0';
   ```

5. **Manejo de casos vacíos:**
   ```javascript
   // Si no hay datos en el período
   if (data.resumen.totalCalculosNuevos === 0) {
     return <EmptyState message="No hay datos para el período seleccionado" />;
   }
   
   // Si no hay puntajes
   if (data.resumen.promedioPuntaje === null) {
     return <Badge>Sin evaluaciones</Badge>;
   }
   ```

6. **Estado de carga:**
   ```javascript
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [dashboardData, setDashboardData] = useState(null);
   
   useEffect(() => {
     const fetchData = async () => {
       try {
         setLoading(true);
         const response = await getDashboard(fechaDesde, fechaHasta);
         setDashboardData(response.data);
       } catch (err) {
         setError(err.response?.data?.error || 'Error al cargar dashboard');
       } finally {
         setLoading(false);
       }
     };
     
     fetchData();
   }, [fechaDesde, fechaHasta]);
   ```

7. **Colores recomendados (tema CPAU):**
   ```css
   --color-primary: #00a8e8;      /* Cyan CPAU */
   --color-secondary: #0077b6;    /* Azul oscuro */
   --color-success: #06d6a0;      /* Verde */
   --color-warning: #ffd60a;      /* Amarillo */
   --color-danger: #ef476f;       /* Rojo */
   
   /* Para distribución de puntajes */
   --puntaje-1: #ef476f;  /* Muy malo */
   --puntaje-2: #ff9f1c;  /* Malo */
   --puntaje-3: #ffd60a;  /* Regular */
   --puntaje-4: #06d6a0;  /* Bueno */
   --puntaje-5: #118ab2;  /* Excelente */
   ```

---

## 13. CHANGELOG

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-08-01 | 1.2 | **CAMBIO DE REQUISITO:** Serie temporal limitada a máximo 60 días (independiente del rango). Resumen y otras métricas usan rango completo. |
| 2026-07-31 | 1.0 | Creación inicial de SPEC |
| 2026-08-01 | 1.1 | **CAMBIO SENSIBLE:** Usar `fecha_calculo` en lugar de `created_at` (índice pre-existente). Simplifica T027-001. |
| 2026-08-01 | 1.1 | ✅ **T027-001 COMPLETADO:** Índice `idx_usuarios_fec_ult_act` creado. Script `dashboard_indexes.sql` listo. |
| 2026-08-01 | 1.1 | ✅ **T027-002 COMPLETADO:** SP `Calculos_Dashboard` actualizado con 7 resultsets usando `fecha_calculo`. |
| 2026-08-01 | 1.1 | ✅ **T027-003 COMPLETADO:** Función `getDashboard()` implementada en modelo con validaciones y parsing completo. |
| 2026-08-01 | 1.1 | ✅ **T027-004 COMPLETADO:** Controller `getDashboard()` implementado con validación de query params y manejo de errores. |
| 2026-08-01 | 1.1 | ✅ **T027-005 COMPLETADO:** Ruta `GET /api/calculos/dashboard` registrada con middleware `verificarToken`. |

---

## 14. APROBACIONES

| Rol | Nombre | Fecha | Aprobado |
|-----|--------|-------|----------|
| Product Owner | - | - | ⏳ Pendiente |
| Tech Lead | - | - | ⏳ Pendiente |
| Backend Developer | - | - | ⏳ Pendiente |

---

**Fin de SPEC-CALC-027**
