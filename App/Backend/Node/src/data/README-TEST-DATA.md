# Test Data Templates - Documentación

## 📄 Propósito

Este directorio contiene datos de prueba utilizados para hidratar templates HTML durante el preview en la herramienta Template Manager (SPEC020).

## 📂 Archivos

### `test-data-templates.json`

Payload de ejemplo que simula el request a `POST /api/calculos/exportar-pdf`.

**Basado en:** Cálculo real ID 397 - "PRUEBA" (Proyecto y Dirección de obras de arquitectura)

**Estructura:**
```json
{
  "tipoCalculo": "PYDOA",
  "tipoNombre": "Proyecto y Dirección de obras de arquitectura",
  "formData": { ... },
  "calculationResult": { ... }
}
```

## 🔄 Flujo de Datos

```
1. Usuario completa wizard frontend
   ↓
2. POST /api/calculos/calcular
   Request: { datosProyecto, datosObra, tareasProfesionales }
   Response: { calculoId, detalleHonorarios, metadata }
   ↓
3. Frontend construye payload para PDF
   Combina: datos ingresados + resultado del cálculo
   ↓
4. POST /api/calculos/exportar-pdf
   Request: { tipoCalculo, formData, calculationResult }
   ↓
5. Backend (pdfService.prepararDatosPlantilla)
   - Agrupa honorarios por tarea
   - Categoriza (obra/adicionales/especialidades)
   - Calcula subtotales y totales
   - Formatea monedas
   ↓
6. Handlebars hidrata template
   ↓
7. Puppeteer genera PDF
```

## 📋 Campos del Test Data

### `formData`

| Campo | Tipo | Origen | Descripción |
|-------|------|--------|-------------|
| `calculoId` | number | Backend | ID del cálculo en BD |
| `tareaId` | number | Request | ID de la tarea profesional |
| `tareaCodi` | string | Request | Código de la tarea (ej: "PYDOA") |
| `nombreProyecto` | string | Request | Nombre del proyecto |
| `cliente` | string | Request | Nombre del cliente/comitente |
| `ubicacion` | string | Request | Ubicación del proyecto |
| `tipoObra` | string | Request | Tipo de obra (Nueva/Ampliación/Refacción) |
| `destinoUso` | string | Inventado | Destino/uso del edificio |
| `complejidad` | string | Request | Complejidad técnica (baja/media/alta) |
| `superficieTotal` | number | Request | Superficie total en m² |
| `valorObra` | number | Request | Valor total de obra en ARS |
| `cotizDolar` | number | Request | Cotización USD usada |
| `plazoEjecucion` | number | Inventado | Plazo estimado en meses |

### `calculationResult`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `calculoId` | number | ID del cálculo |
| `status` | string | Estado del cálculo ("OK") |
| `totalHonorarios` | number | Total de honorarios calculados |
| `metadata` | object | Info adicional (rango, fecha, etc.) |
| `detalleHonorarios` | array | Array de items de honorarios |

### `detalleHonorarios[]` (item)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `calculoItemId` | number | ID del item en BD |
| `itemNumero` | number | Número secuencial del item |
| `tareaProfesional` | string | Nombre de la tarea profesional |
| `descripcion` | string | Detalle del cálculo (rango, coeficiente) |
| `importe` | number | Monto calculado en ARS |
| `createdAt` | string | Timestamp de creación |

## 🎨 Variables Disponibles en Templates

Después de procesar `prepararDatosPlantilla()`, el template recibe:

### Metadatos
- `{{calculationNumber}}` - Número formateado del cálculo (ej: "000397")
- `{{currentDate}}` - Fecha actual formato DD/MM/YYYY
- `{{tipoNombre}}` - Nombre descriptivo de la tarea
- `{{logoCPAU}}` - Logo CPAU en base64

### Datos del Proyecto
- `{{nombreProyecto}}`
- `{{cliente}}`
- `{{tipoObra}}`
- `{{destinoUso}}`
- `{{superficieTotal}}`
- `{{valorObraARS}}` - Formateado como moneda
- `{{valorObraUSD}}` - Formateado como moneda

### Honorarios (Arrays)
```handlebars
{{#if honorariosObra}}
  {{#each honorariosObra}}
    {{this.indice}}
    {{this.tareaProfesional}}
    {{this.descripcion}}
    {{this.importeARS}}
    {{this.importeUSD}}
    {{this.porcentaje}}
  {{/each}}
{{/if}}

{{#if honorariosAdicionales}}
  {{#each honorariosAdicionales}}
    ...
  {{/each}}
{{/if}}

{{#if honorariosEspecialidades}}
  {{#each honorariosEspecialidades}}
    ...
  {{/each}}
{{/if}}
```

### Subtotales y Totales
- `{{subtotalObraARS}}` / `{{subtotalObraUSD}}` / `{{subtotalObraPorcentaje}}`
- `{{subtotalAdicionalesARS}}` / `{{subtotalAdicionalesUSD}}` / `{{subtotalAdicionalesPorcentaje}}`
- `{{subtotalEspecialidadesARS}}` / `{{subtotalEspecialidadesUSD}}` / `{{subtotalEspecialidadesPorcentaje}}`
- `{{totalGeneralARS}}` / `{{totalGeneralUSD}}` / `{{totalGeneralPorcentaje}}`
- `{{plazoEjecucion}}`

### Campos Procesados en Nivel Raíz

**IMPORTANTE:** Estos campos están disponibles directamente (sin `formData.` ni `calculationResult.`):

#### Valores Monetarios Formateados
- `{{valorObraARS}}` → `"$ 500.000.000,00"` (valor de obra en pesos con formato)
- `{{valorObraUSD}}` → `"$ 344.533,10"` (valor de obra en dólares con formato)

#### Datos del Proyecto (duplicados en raíz para facilidad)
- `{{nombreProyecto}}` → `"PRUEBA"`
- `{{cliente}}` → `"Inmobiliaria ABC SA"`
- `{{ubicacion}}` → `"CABA - Microcentro"`
- `{{superficieTotal}}` → `2500`
- `{{tipoObra}}` → `"Nueva"`
- `{{destinoUso}}` → `"Residencial multifamiliar"`
- `{{plazoEjecucion}}` → `18`

#### Metadata
- `{{currentDate}}` → `"14/07/2026"` (fecha actual formateada)
- `{{calculationNumber}}` → `"397"` (número de cálculo)
- `{{logoCPAU}}` → Base64 del logo (data URI)

#### Totales Formateados
- `{{totalGeneralARS}}` → `"$ 77.200.000,00"`
- `{{totalGeneralUSD}}` → `"$ 53.219,04"`
- `{{subtotalObraARS}}` → `"$ 42.000.000,00"`
- `{{subtotalObraUSD}}` → `"$ 28.949,63"`
- `{{subtotalAdicionalesARS}}` → `"$ 35.200.000,00"`
- `{{subtotalAdicionalesUSD}}` → `"$ 24.269,41"`
- `{{subtotalEspecialidadesARS}}` → `"$ 0,00"`
- `{{subtotalEspecialidadesUSD}}` → `"$ 0,00"`

**Nota:** Estos campos se agregaron para que el preview funcione igual que el PDF real generado por `pdfService.prepararDatosPlantilla()`.

## 🔧 Cómo Actualizar

### Agregar un nuevo campo

1. **Agregar en `test-data-templates.json`**
   ```json
   "formData": {
     "nuevoCampo": "valor de prueba"
   }
   ```

2. **Usar en el template HTML**
   ```html
   <span>{{nuevoCampo}}</span>
   ```

3. **Validar que no rompa**
   - Preview en Template Manager
   - Generar PDF real desde frontend

### Cambiar los datos de prueba

Simplemente edita `test-data-templates.json` con nuevos valores. Los cambios se reflejan inmediatamente en el endpoint `/api/admin/templates/test-data`.

### Agregar más escenarios de prueba

Puedes crear archivos adicionales:
- `test-data-templates-relevamiento.json` (para otras tareas)
- `test-data-templates-tasacion.json`
- etc.

Y modificar `adminTemplatesService.obtenerTestData()` para cargar el archivo correspondiente según contexto.

## ⚠️ Notas Importantes

1. **Mantener sincronizado:** Si agregas campos en el template, asegúrate de incluirlos en este JSON.

2. **Formato de moneda:** Los importes en `detalleHonorarios` son números puros. El backend los formatea con `formatCurrency()`.

3. **Agrupación automática:** `prepararDatosPlantilla()` agrupa los items del `detalleHonorarios` por `tareaProfesional` y los categoriza según keywords en el nombre.

4. **Logo CPAU:** Actualmente usa un placeholder. Reemplazar con base64 real del logo institucional (ver T020-001 en SPEC020).

## 🧪 Testing

### Validar JSON
```bash
# Verificar sintaxis JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/test-data-templates.json')))"
```

### Probar hidratación
```bash
# Endpoint de test data
curl https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/test-data

# Preview con estos datos
curl -X POST https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/preview \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## 📞 Contacto

**Responsable:** Charly (Tech Lead)  
**SPEC:** SPEC020-ADMIN-Template-Manager  
**Ticket:** T020-001
