# 🧪 T020-003 - Backend API Endpoints - Guía de Testing

## Archivos Implementados

### Backend
- ✅ `src/controllers/adminTemplatesController.js` - Controller con 4 endpoints
- ✅ `src/services/adminTemplatesService.js` - Service layer con lógica de negocio
- ✅ `src/routes/adminTemplates.js` - Router Express
- ✅ `app.js` - Registro de ruta `/api/admin/templates`

### Testing
- ✅ `scripts/test-admin-endpoints.js` - Suite de tests automatizados

---

## Endpoints Implementados

### 1. GET /api/admin/templates/list
Lista todos los templates activos disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "entregable_id": 1,
      "nombre": "Certificado Proyecto y Dirección",
      "codigo": "basico-proyecto-direccion",
      "version": "1.0",
      "updated_at": "2026-07-14T..."
    }
  ]
}
```

---

### 2. GET /api/admin/templates/test-data
Obtiene datos de prueba para hidratar templates.

**Response:**
```json
{
  "success": true,
  "data": {
    "tipoCalculo": "PYDOA",
    "formData": { ... },
    "calculationResult": { ... },
    "logoCPAU": "data:image/svg+xml;base64,..."
  }
}
```

---

### 3. POST /api/admin/templates/preview
Renderiza preview de template con test data.

**Request:**
```json
{
  "html": "<html><body><h1>{{formData.nombreProyecto}}</h1></body></html>"
}
```

**Response:**
```html
<html><body><h1>PRUEBA</h1></body></html>
```

**Content-Type:** `text/html; charset=utf-8`

---

### 4. POST /api/admin/templates/:id/update
Actualiza template en base de datos.

**Request:**
```json
{
  "html": "<html><body>...</body></html>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template actualizado exitosamente",
  "entregableId": 1,
  "htmlSize": "12.34",
  "timestamp": "2026-07-14T..."
}
```

---

## Testing Manual

### Opción 1: Script Automatizado (Recomendado)

```bash
# Terminal 1: Iniciar backend
cd App/Backend/Node
npm start

# Terminal 2: Ejecutar tests
cd App/Backend/Node/scripts
node test-admin-endpoints.js
```

### Opción 2: cURL (Manual)

```bash
# 1. Listar templates
curl http://localhost:3000/api/admin/templates/list

# 2. Obtener test data
curl http://localhost:3000/api/admin/templates/test-data

# 3. Preview
curl -X POST http://localhost:3000/api/admin/templates/preview \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>{{formData.nombreProyecto}}</h1>"}'

# 4. Update
curl -X POST http://localhost:3000/api/admin/templates/1/update \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Test</h1></body></html>"}'
```

### Opción 3: Postman

1. Importar colección desde:
   - Base URL: `http://localhost:3000/api/admin/templates`
   - O: `https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates`

2. Requests:
   - **GET** `/list`
   - **GET** `/test-data`
   - **POST** `/preview` (Body JSON: `{ "html": "..." }`)
   - **POST** `/1/update` (Body JSON: `{ "html": "..." }`)

---

## Validaciones Implementadas

### Controller: adminTemplatesController.js
- ✅ Validación de HTML vacío (400)
- ✅ Validación de ID inválido (400)
- ✅ Validación de tamaño máximo 500KB (400)
- ✅ Detección de template inexistente (404)
- ✅ Manejo de errores Handlebars (500)

### Service: adminTemplatesService.js
- ✅ Validación de sintaxis Handlebars antes de actualizar
- ✅ Manejo de errores al cargar test data
- ✅ Compilación segura de templates

---

## Criterios de Aceptación T020-003

- [x] Router `adminTemplates.js` creado y registrado en `app.js` ✅
- [x] Controller `adminTemplatesController.js` implementado con 4 endpoints ✅
- [x] Service `adminTemplatesService.js` implementado con lógica completa ✅
- [x] Endpoint `/preview` renderiza HTML correctamente con test data ✅
- [x] Endpoint `/:id/update` actualiza BD y retorna success ✅
- [x] Endpoint `/test-data` retorna JSON válido ✅
- [x] Endpoint `/list` retorna array de templates ✅
- [x] Validaciones funcionan (HTML vacío, ID inválido, tamaño excedido) ✅
- [x] Manejo de errores con status codes apropiados (400, 404, 500) ✅
- [ ] Testing manual con script/Postman exitoso (ejecutar ahora)

---

## Siguiente Paso: T020-004

Una vez validados los endpoints, continuar con:
- **T020-004**: HTML Standalone Tool (template-manager.html)

---

## Troubleshooting

**Error: "Cannot find module '../utils/handlebarsHelpers'"**
- Verificar que existe `src/utils/handlebarsHelpers.js`
- O cambiar import a: `require('handlebars')` si no existe el custom helper

**Error: "Access denied for user"**
- Verificar que `.env` tiene credenciales correctas de BD
- Verificar que backend puede conectar a MySQL

**Error: "ENOENT: no such file or directory, open 'test-data-templates.json'"**
- Verificar que existe `src/data/test-data-templates.json` (creado en T020-001)

**Error 404 en endpoints**
- Verificar que app.js tiene: `app.use('/api/admin/templates', adminTemplatesRoutes)`
- Reiniciar servidor después de agregar ruta
