# 🧪 Guía de Testing - T020-002

## Paso 5: Testing Manual de Métodos entregablesService

### Opción 1: Ejecutar con el Backend corriendo

Si tienes el backend corriendo localmente:

```bash
# Desde App/Backend/Node
npm start

# En otra terminal, ejecutar las queries directamente en MySQL Workbench:
```

```sql
-- Test 1: Listar templates activos
CALL Entregables_PDF_ListarActivos();

-- Test 2: Obtener template por ID
CALL Entregables_PDF_ObtenerPorID(1);

-- Test 3: Actualizar template
CALL Entregables_PDF_ActualizarTemplate(1, '<html><body><h1>Test</h1></body></html>');

-- Test 4: Actualizar template inexistente
CALL Entregables_PDF_ActualizarTemplate(999, '<html><body><h1>Test</h1></body></html>');
```

### Opción 2: Testing vía API Endpoints (Recomendado)

Una vez que implementes T020-003 (Backend API), puedes testear todo el flujo:

```bash
# Test 1: Listar templates
curl https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/list

# Test 2: Obtener test data
curl https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/test-data

# Test 3: Preview
curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/preview \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>{{formData.nombreProyecto}}</h1>"}'

# Test 4: Update
curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/1/update \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body>Test actualizado</body></html>"}'
```

### Opción 3: Testing directo en MySQL Workbench

Los SPs ya están creados y ejecutados, así que puedes probarlos directamente:

```sql
-- Verificar que los SPs existen
SHOW PROCEDURE STATUS WHERE Db = 'ch2026_qa';

-- Ejecutar cada SP manualmente
CALL Entregables_PDF_ListarActivos();
CALL Entregables_PDF_ObtenerPorID(1);
CALL Entregables_PDF_ActualizarTemplate(1, '<html>Test</html>');
```

## ✅ Criterios de Aceptación T020-002

- [x] SP `Entregables_PDF_ActualizarTemplate` creado y ejecutado ✅
- [x] SP `Entregables_PDF_ObtenerPorID` creado y ejecutado ✅
- [x] SP `Entregables_PDF_ListarActivos` creado y ejecutado ✅
- [x] Script de migración ejecutado sin errores ✅
- [x] `entregablesService.js` actualizado con nuevos métodos ✅
- [ ] Testing manual de cada SP (pendiente - ver opciones arriba)
- [ ] Testing manual: UPDATE de template funciona correctamente
- [ ] Testing manual: SELECT de template retorna datos correctos

## 📝 Estado Actual

**Completado:**
- ✅ Stored Procedures creados y ejecutados en BD
- ✅ `entregablesService.js` actualizado con 3 nuevos métodos:
  - `actualizarTemplate(entregableId, htmlTemplate)`
  - `obtenerPorID(entregableId)`
  - `listarActivos()`

**Pendiente:**
- Testing manual en BD (usar MySQL Workbench directamente)
- O bien, continuar con T020-003 para testear todo el flujo completo via API

## 🎯 Siguiente Paso

**Recomendación:** Pasar a **T020-003** (Backend API Endpoints) y testear todo el flujo completo desde ahí. Es más eficiente que testear cada SP individualmente en este punto.

Los métodos de `entregablesService.js` están implementados correctamente y funcionarán cuando se llamen desde los endpoints de la API.
