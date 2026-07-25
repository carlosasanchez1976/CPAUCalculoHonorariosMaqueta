# Guía Rápida: Variables en Templates de PDF

## Agregar Variable de formData al Template

### Paso 1: Agregar en el Template HTML
```html
<!-- templates/certificado-*.html -->
<span>{{nombreVariable}}</span>
```

### Paso 2: Agregar en pdfService.js
```javascript
// Archivo: src/services/pdfService.js
// Función: prepararDatosPlantilla() - línea ~145

return {
  // ... otras variables existentes
  nombreVariable: formData.nombreVariable || 'Valor por defecto',
}
```

### Paso 3: Testing
1. Guardar cambios
2. Redesplegar backend a Lambda
3. Probar PDF desde frontend

---

## Variables Disponibles (fuera de formData)

### Metadatos Generados
```javascript
calculationNumber    // string - Nº de cálculo (formateado 000001)
currentDate          // string - Fecha actual DD/MM/YYYY
tipoNombre           // string - Nombre del tipo de cálculo
logoCPAU             // string - Logo en base64
vigenciaFE           // string - HTML con vigencia de índices
```

### Arrays de Honorarios
```javascript
honorariosObra             // array | null - Items de obra
honorariosAdicionales      // array | null - Items adicionales
honorariosEspecialidades   // array | null - Items especialidades

// Estructura de cada item:
{
  indice: 1,                           // number
  tareaProfesional: "Nombre tarea",    // string
  descripcion: "Descripción",          // string
  importeARS: "$ 1.234.567",           // string formateado
  importeUSD: "$ 1.234",               // string formateado
  porcentaje: "5.50"                   // string
}
```

### Subtotales y Totales
```javascript
// Subtotales por categoría
subtotalObraARS              // string - "$ 1.234.567"
subtotalObraUSD              // string - "$ 1.234"
subtotalObraPorcentaje       // string - "5.50"

subtotalAdicionalesARS       // string
subtotalAdicionalesUSD       // string
subtotalAdicionalesPorcentaje // string

subtotalEspecialidadesARS    // string
subtotalEspecialidadesUSD    // string
subtotalEspecialidadesPorcentaje // string

// Total general
totalGeneralARS              // string - "$ 10.234.567"
totalGeneralUSD              // string - "$ 10.234"
totalGeneralPorcentaje       // string - "15.50"

// Otros
plazoEjecucion               // number - Meses
```

---

## Tratamiento por Tipo de Dato

### String Simple
```javascript
// Backend
nombreProyecto: formData.nombreProyecto || 'Sin nombre',

// Template
{{nombreProyecto}}
```

### Number Simple
```javascript
// Backend
superficieTotal: formData.superficieTotal || 0,

// Template
{{superficieTotal}} m²
```

### Moneda (formatear)
```javascript
// Backend - usar helper formatCurrency()
valorObraARS: formatCurrency(formData.valorObra || 0),

// Template
{{valorObraARS}}  <!-- Ya viene formateado como "$ 1.234.567" -->
```

### HTML (sin escapar)
```javascript
// Backend - devolver string con HTML
vigenciaFE: formData.vigenciaFE || '<span>Texto</span>',

// Template - usar triple llave para no escapar
{{{vigenciaFE}}}
```

### Arrays (iterar con #each)
```javascript
// Backend
honorariosObra: honorariosObra.length > 0 ? honorariosObra : null,

// Template
{{#if honorariosObra}}
  {{#each honorariosObra}}
    <tr>
      <td>{{this.indice}}</td>
      <td>{{this.tareaProfesional}}</td>
      <td>{{this.importeARS}}</td>
    </tr>
  {{/each}}
{{/if}}
```

### Condicionales
```javascript
// Backend - devolver valor o null
cotizDolar: formData.cotizDolar || null,

// Template
{{#if cotizDolar}}
  <p>Cotización: {{cotizDolar}}</p>
{{/if}}
```

---

## Helpers de Handlebars Disponibles

```javascript
// Formateo de moneda (ya aplicado en backend, no usar en template)
formatCurrencyARS    // Convierte 1234567 → "$ 1.234.567"

// Formateo de porcentaje (ya aplicado en backend)
formatPercent        // Convierte 5.5 → "5.50%"

// Operaciones matemáticas (usar en template)
{{divide valorA valorB}}     // División
{{multiply valorA valorB}}   // Multiplicación
```

---

## Checklist de Implementación

- [ ] Variable agregada en template HTML
- [ ] Variable extraída en `prepararDatosPlantilla()` con valor por defecto
- [ ] Tipo de dato correcto (string, number, array, etc.)
- [ ] Formateo aplicado si es moneda o porcentaje
- [ ] Frontend envía la variable en `formData`
- [ ] Código testeado localmente
- [ ] Backend redesployado a Lambda
- [ ] PDF validado en QA
