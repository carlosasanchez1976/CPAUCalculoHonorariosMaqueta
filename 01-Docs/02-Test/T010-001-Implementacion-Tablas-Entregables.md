# T010-001: Implementación de Tablas para Entregables PDF

**Fecha:** 2026-06-10  
**Estado:** ✅ IMPLEMENTADO  
**SPEC:** SPEC010-CALC-Entregables  
**Tipo:** Backend / Base de datos

---

## 📋 Resumen

Se implementaron las tablas de base de datos necesarias para soportar el sistema de plantillas de entregables PDF con Puppeteer:

- ✅ Tabla `Entregables_PDF`: Almacena plantillas HTML/CSS versionadas
- ✅ Tabla `Tareas_Profesionales_Entregables_PDF`: Relación N:N entre tareas y plantillas
- ✅ Servicio `entregablesService.js`: Funciones para resolver plantillas
- ✅ Seed data inicial con plantilla placeholder

---

## 🗂️ Archivos Creados

```
App/Backend/
├── DB/
│   ├── 01-Tables/
│   │   ├── Entregables_PDF.sql
│   │   └── Tareas_Profesionales_Entregables_PDF.sql
│   ├── 02-Seeds/
│   │   └── insert_Entregables_PDF.sql
│   └── 04-Scripts/
│       └── migrate_T010-001_Entregables_PDF.sql
└── Node/
    └── src/
        └── services/
            └── entregablesService.js
```

---

## 🚀 Ejecución de la Migración

### Opción 1: Script completo de migración

```bash
# Desde el directorio App/Backend/DB/
mysql -u usuario -p -D nombre_base_datos < 04-Scripts/migrate_T010-001_Entregables_PDF.sql
```

### Opción 2: Ejecución manual paso a paso

```bash
# 1. Crear tabla Entregables_PDF
mysql -u usuario -p -D nombre_base_datos < 01-Tables/Entregables_PDF.sql

# 2. Crear tabla de relación
mysql -u usuario -p -D nombre_base_datos < 01-Tables/Tareas_Profesionales_Entregables_PDF.sql

# 3. Insertar seed data
mysql -u usuario -p -D nombre_base_datos < 02-Seeds/insert_Entregables_PDF.sql
```

### Verificación

```sql
-- Verificar que las tablas se crearon correctamente
SHOW TABLES LIKE '%Entregables%';

-- Ver entregables creados
SELECT * FROM Entregables_PDF;

-- Ver relaciones
SELECT 
  t.codi, t.descripcion AS tarea,
  e.codigo, e.nombre AS entregable
FROM Tareas_Profesionales t
JOIN Tareas_Profesionales_Entregables_PDF rel ON t.tarea_id = rel.tarea_id
JOIN Entregables_PDF e ON rel.entregable_id = e.entregable_id;
```

---

## 📚 Uso del Servicio `entregablesService.js`

### Ejemplo 1: Resolver plantilla por tarea_id

```javascript
const { resolverPlantillaEntregable } = require('./services/entregablesService');

// En un controlador o endpoint
async function generarPDF(req, res) {
  const { tareaId } = req.body;
  
  // Obtener la plantilla activa para la tarea
  const plantilla = await resolverPlantillaEntregable(tareaId);
  
  if (!plantilla) {
    return res.status(404).json({ 
      error: 'No se encontró plantilla para esta tarea' 
    });
  }
  
  console.log('Plantilla encontrada:', plantilla.nombre);
  console.log('Motor de template:', plantilla.template_engine);
  
  // Usar plantilla.html_template con Handlebars
  // Usar plantilla.pdf_config para configurar Puppeteer
  // ...
}
```

### Ejemplo 2: Resolver plantilla por código

```javascript
const { resolverPlantillaPorCodigo } = require('./services/entregablesService');

// Fallback si no hay tarea_id disponible
const plantilla = await resolverPlantillaPorCodigo('basico-proyecto-direccion');

if (plantilla) {
  const config = JSON.parse(plantilla.pdf_config);
  // config.format = "A4"
  // config.margin = { top: "20mm", ... }
}
```

### Ejemplo 3: Listar todos los entregables

```javascript
const { listarEntregables } = require('./services/entregablesService');

// GET /api/entregables
async function listarEntregablesHandler(req, res) {
  const entregables = await listarEntregables();
  res.json({ success: true, data: entregables });
}
```

---

## 🔍 Estructura de la Tabla `Entregables_PDF`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `entregable_id` | INT | PK Auto-increment |
| `nombre` | VARCHAR(100) | Nombre descriptivo |
| `codigo` | VARCHAR(50) | Código único (ej: "basico-proyecto-direccion") |
| `descripcion` | TEXT | Descripción detallada |
| `version` | VARCHAR(20) | Versión semántica (1.0.0) |
| `version_activa` | BOOLEAN | TRUE = versión en uso |
| `html_template` | LONGTEXT | HTML con placeholders Handlebars |
| `css_styles` | LONGTEXT | CSS de la plantilla |
| `pdf_config` | JSON | Config Puppeteer: `{ format, margin, ... }` |
| `template_engine` | ENUM | 'handlebars', 'mustache', 'literal' |
| `placeholders` | JSON | Documentación de variables esperadas |
| `assets` | JSON | Logos/imágenes en base64 |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última modificación |
| `created_by` | INT | FK a Usuarios |

---

## 🔗 Estructura de la Tabla de Relación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `relacion_id` | INT | PK Auto-increment |
| `tarea_id` | INT | FK a Tareas_Profesionales |
| `entregable_id` | INT | FK a Entregables_PDF |
| `activo` | BOOLEAN | Permite desactivar la relación |
| `orden` | INT | Orden de prioridad (si hay múltiples plantillas) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última modificación |

**Constraints:**
- `UNIQUE (tarea_id, entregable_id)`: No duplicar relaciones
- `ON DELETE CASCADE`: Si se borra una tarea o entregable, se borran las relaciones

---

## ✅ Criterios de Aceptación Cumplidos

- [x] **T001-CA-001:** Tablas creadas correctamente con todos los campos definidos
- [x] **T001-CA-002:** Foreign keys funcionando correctamente (cascada en DELETE)
- [x] **T001-CA-003:** Seed data cargado: 1 registro en `Entregables_PDF` + 1 relación con tarea "PYDOA"
- [x] **T001-CA-004:** Servicio `entregablesService.js` implementado y probado
- [x] **T001-CA-005:** Consulta `resolverPlantillaEntregable(tareaId)` retorna el registro correcto
- [x] **T001-CA-006:** Documentación SQL comentada en cada tabla (COMMENT)

---

## 📝 Notas Técnicas

### Campo `placeholders` (JSON)
Documenta qué variables espera la plantilla. Ejemplo:
```json
{
  "formData": {
    "nombreProyecto": "string",
    "cliente": "string",
    "valorObra": "number"
  },
  "calculationNumber": "string",
  "currentDate": "string"
}
```

### Campo `pdf_config` (JSON)
Configuración de Puppeteer sin tocar código:
```json
{
  "format": "A4",
  "printBackground": true,
  "margin": {
    "top": "20mm",
    "right": "15mm",
    "bottom": "20mm",
    "left": "15mm"
  },
  "preferCSSPageSize": false
}
```

### Versionado
- `version_activa = TRUE`: Solo una versión activa por plantilla
- Mantener versiones antiguas para auditoría de PDFs emitidos históricos

### Campo `assets` (JSON)
Para embeber logo CPAU en base64:
```json
{
  "logo": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIi4uLg=="
}
```

---

## 🔄 Próximos Pasos

Este ticket (T010-001) sienta las bases para:

- **T010-002**: Migrar el HTML/CSS real de `ResultadoBasicoDetalle.jsx` a la plantilla Handlebars
- **T010-003**: Implementar el endpoint `/api/calculos/exportar-pdf` con Puppeteer
- **T010-004**: Eliminar `html2pdf.js` del frontend y conectar al nuevo endpoint

---

## 🐛 Troubleshooting

### Error: "Table 'Usuarios' doesn't exist"
Asegurarse de ejecutar primero los scripts de creación de `Usuarios` y `Tareas_Profesionales`.

### Error: "Duplicate entry 'basico-proyecto-direccion' for key 'codigo'"
El seed ya fue ejecutado. Verificar con:
```sql
SELECT * FROM Entregables_PDF WHERE codigo = 'basico-proyecto-direccion';
```

### Error: "Cannot add foreign key constraint"
Verificar que las tablas referenciadas existen y los tipos de datos coinciden:
```sql
SHOW CREATE TABLE Tareas_Profesionales;
SHOW CREATE TABLE Usuarios;
```

---

## 📞 Contacto

Para dudas o problemas con esta implementación, contactar a:
- **Equipo de Desarrollo CH2026**
- **SPEC:** SPEC010-CALC-Entregables
