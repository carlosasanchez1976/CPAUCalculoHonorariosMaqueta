# 📝 Guía: Variables en Templates PDF

**Proyecto:** CH2026 - CPAU Cálculo de Honorarios  
**Fecha:** 23/07/2026  
**Versión:** 1.0

---

## 📑 Índice

1. [Introducción](#introducción)
2. [Ubicación del Código](#ubicación-del-código)
3. [Paso a Paso para Crear Variables](#paso-a-paso-para-crear-variables)
4. [Ejemplo Completo](#ejemplo-completo-agregar-costo-por-m²)
5. [Variables Condicionales](#variables-condicionales)
6. [Variables Calculadas (Helpers)](#variables-calculadas-helpers)
7. [Checklist de Implementación](#checklist-de-implementación)
8. [Flujo de Datos](#flujo-de-datos)

---

## Introducción

Este documento explica cómo crear y exponer **nuevas variables** para usar en los templates HTML de generación de PDF.

**Stack de Generación PDF:**
- **Motor de templates:** Handlebars
- **Generación PDF:** Puppeteer-core + @sparticuz/chromium
- **Formato:** A4 (210mm x 297mm)
- **Almacenamiento:** Templates en tabla `Entregables_PDF` (MySQL)

---

## Ubicación del Código

Las variables se definen en:

**Archivo:** `App/Backend/Node/src/services/pdfService.js`  
**Función:** `prepararDatosPlantilla(datos, plantilla)` (líneas ~162-350)

Esta función:
1. Recibe los datos del cálculo (`formData`, `calculationResult`)
2. Formatea y organiza los valores
3. **Retorna un objeto** con todas las variables disponibles para el template
4. Handlebars usa ese objeto para reemplazar `{{nombreVariable}}` en el HTML

---

## Paso a Paso para Crear Variables

### **Paso 1: Definir la Variable en `pdfService.js`**

Ubicación: Dentro de `prepararDatosPlantilla()`, en el objeto `return` (línea ~304)

```javascript
function prepararDatosPlantilla(datos, plantilla) {
  const { formData, calculationResult } = datos;
  
  // ... código de preparación de datos ...
  
  // ✅ Retornar objeto con todas las variables
  return {
    // Metadatos
    calculationNumber,
    currentDate,
    tipoNombre: datos.tipoNombre || obtenerNombreTipoCalculo(datos.tipoCalculo),
    logoCPAU,
    
    // Datos del proyecto
    nombreProyecto: formData.nombreProyecto || 'Sin nombre',
    cliente: formData.cliente || 'Sin especificar',
    tipoObra: formData.tipoObra || 'Sin especificar',
    destinoUso: formData.destinoUso || 'Sin especificar',
    superficieTotal: formData.superficieTotal || 0,
    valorObraARS,
    valorObraUSD,
    
    // ✅ AQUÍ AGREGAS TUS NUEVAS VARIABLES
    // Ejemplo 1: Variable simple desde formData
    // nombreArquitecto: formData.nombreArquitecto || 'Sin especificar',
    
    // Ejemplo 2: Variable calculada
    // costoM2: formatCurrency((formData.valorObra || 0) / (formData.superficieTotal || 1)),
    
    // Ejemplo 3: Variable condicional
    // observaciones: formData.observaciones || null,
    
    // Arrays de honorarios
    honorariosObra: honorariosObra.length > 0 ? honorariosObra : null,
    honorariosAdicionales: honorariosAdicionales.length > 0 ? honorariosAdicionales : null,
    honorariosEspecialidades: honorariosEspecialidades.length > 0 ? honorariosEspecialidades : null,
    
    // Subtotales y totales
    subtotalObraARS: formatCurrency(subtotalObraARS),
    subtotalObraUSD: formatCurrency(subtotalObraARS / (formData.cotizDolar || 1)),
    subtotalObraPorcentaje,
    
    // ... resto de variables ...
    
    totalGeneralARS: formatCurrency(totalGeneralARS),
    totalGeneralUSD: formatCurrency(totalGeneralUSD),
    totalGeneralPorcentaje,
    plazoEjecucion: formData.plazoEjecucion || 12
  };
}
```

---

### **Paso 2: Usar la Variable en el Template HTML**

Una vez agregada al objeto `return`, la variable está disponible en el template usando sintaxis Handlebars.

#### **Sintaxis Básica:**

```html
<!-- Variable de texto -->
<span>{{nombreVariable}}</span>

<!-- Variable con HTML alrededor -->
<div class="resumen-item">
  <span class="resumen-label">Cliente:</span>
  <span class="resumen-value">{{cliente}}</span>
</div>
```

#### **Ejemplo Real (certificado-basico-proyecto-direccion.html):**

```html
<!-- Sección Resumen del Proyecto (línea ~597) -->
<div class="resumen-item-container">
  <!-- Variable existente -->
  <div class="resumen-item">
    <span class="resumen-label">Nombre del Proyecto:</span>
    <span class="resumen-value">{{nombreProyecto}}</span>
  </div>
  
  <div class="resumen-item">
    <span class="resumen-label">Cliente:</span>
    <span class="resumen-value">{{cliente}}</span>
  </div>
  
  <!-- ✅ NUEVA VARIABLE (ejemplo) -->
  <div class="resumen-item">
    <span class="resumen-label">Arquitecto/a:</span>
    <span class="resumen-value">{{nombreArquitecto}}</span>
  </div>
  
  <div class="resumen-item">
    <span class="resumen-label">Tipo de obra:</span>
    <span class="resumen-value">{{tipoObra}}</span>
  </div>
</div>
```

---

## Ejemplo Completo: Agregar "Costo por m²"

### **Paso 1: Agregar en `pdfService.js`**

```javascript
function prepararDatosPlantilla(datos, plantilla) {
  const { formData, calculationResult } = datos;
  
  // ... código existente ...
  
  // ✅ CALCULAR COSTO POR M²
  const costoM2 = formData.valorObra && formData.superficieTotal 
    ? redondear(formData.valorObra / formData.superficieTotal)
    : 0;
  
  return {
    // ... variables existentes ...
    superficieTotal: formData.superficieTotal || 0,
    valorObraARS,
    valorObraUSD,
    
    // ✅ AGREGAR COSTO POR M²
    costoM2ARS: formatCurrency(costoM2),
    costoM2USD: formatCurrency(costoM2 / (formData.cotizDolar || 1)),
    
    // ... resto de variables ...
  };
}
```

---

### **Paso 2: Usar en el Template**

```html
<!-- En certificado-basico-proyecto-direccion.html -->
<div class="resumen-item-container">
  <div class="resumen-item">
    <span class="resumen-label">Superficie total:</span>
    <span class="resumen-value">{{superficieTotal}} m²</span>
  </div>
  
  <!-- ✅ MOSTRAR COSTO POR M² -->
  <div class="resumen-item">
    <span class="resumen-label">Costo por m²:</span>
    <span class="resumen-value">{{costoM2ARS}} / {{costoM2USD}}</span>
  </div>
  
  <div class="resumen-item">
    <span class="resumen-label">Valor de Obra:</span>
    <span class="resumen-value">{{valorObraARS}} / {{valorObraUSD}}</span>
  </div>
</div>
```

---

## Variables Condicionales

Si la variable puede ser `null` o `undefined`, usa `{{#if}}` para mostrarla solo si existe.

### **Paso 1: Definir en `pdfService.js`**

```javascript
return {
  // ... otras variables ...
  
  // ✅ VARIABLE CONDICIONAL (puede ser null)
  observaciones: formData.observaciones || null,
  numeroExpediente: formData.numeroExpediente || null,
};
```

---

### **Paso 2: Usar en Template con Condicional**

```html
<!-- Solo se muestra si la variable existe -->
{{#if observaciones}}
  <div class="nota-adicional">
    <strong>Observaciones:</strong>
    <p>{{observaciones}}</p>
  </div>
{{/if}}

{{#if numeroExpediente}}
  <div class="resumen-item">
    <span class="resumen-label">N° Expediente:</span>
    <span class="resumen-value">{{numeroExpediente}}</span>
  </div>
{{/if}}
```

---

## Variables Calculadas (Helpers)

Ya existen **helpers de Handlebars** en `handlebarsHelpers.js` para formatear datos:

### **Helpers Disponibles:**

| Helper | Uso | Resultado |
|--------|-----|-----------|
| `formatCurrency` | `{{formatCurrency valorObra}}` | `$ 1.234.567,89` |
| `formatPercentage` | `{{formatPercentage 8.4}}` | `8.40%` |
| `formatDate` | `{{formatDate currentDate}}` | `23/07/2026` |

### **Ejemplo de Uso en Template:**

```html
<!-- Usar helper directamente en template -->
<span>{{formatCurrency valorObra}}</span>

<!-- O pre-formateado desde pdfService.js (recomendado) -->
<span>{{valorObraARS}}</span>  <!-- Ya viene formateado -->
```

**Recomendación:** Preferir formatear en `pdfService.js` para tener control centralizado.

---

## Checklist de Implementación

Usa este checklist cuando agregues una nueva variable:

```
☐ Paso 1: Definir Variable en pdfService.js
  ☐ Ubicar función prepararDatosPlantilla()
  ☐ Obtener valor desde formData o calculationResult
  ☐ Aplicar formato si es necesario (formatCurrency, redondear)
  ☐ Agregar al objeto return con nombre descriptivo (camelCase)

☐ Paso 2: Usar en Template HTML
  ☐ Verificar sintaxis: {{nombreVariable}}
  ☐ Si puede ser null: {{#if nombreVariable}}...{{/if}}
  ☐ Si es array: {{#each nombreVariable}}...{{/each}}
  ☐ Verificar CSS aplicado (clases existentes)

☐ Paso 3: Probar
  ☐ Generar PDF desde frontend o Postman
  ☐ Verificar que la variable se muestra correctamente
  ☐ Validar casos edge:
    ☐ Valor null o undefined
    ☐ Valor 0
    ☐ Strings muy largos
    ☐ Caracteres especiales

☐ Paso 4: Documentar (Opcional)
  ☐ Actualizar T010-002-Documentacion-Template-PDF.md
  ☐ Agregar variable a lista de placeholders
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                              │
│  POST /api/calculos/exportar-pdf                           │
│  Body: { formData, calculationResult }                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND - Lambda Handler                   │
│  src/handlers/calculosHandler.js                           │
│  → Recibe request                                           │
│  → Llama pdfService.generarCertificado(datos)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              pdfService.js - generarCertificado()          │
│  1. htmlContent = await renderizarPlantillaDB(datos)       │
│  2. Genera PDF con Puppeteer                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          pdfService.js - renderizarPlantillaDB()           │
│  1. plantilla = entregablesService.resolverPlantillaDB()   │
│  2. template = Handlebars.compile(plantilla.html_template) │
│  3. templateData = prepararDatosPlantilla(datos, plantilla)│ ◄─ AQUÍ SE CREAN LAS VARIABLES
│  4. htmlRenderizado = template(templateData)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│       pdfService.js - prepararDatosPlantilla()             │
│  ✅ FUNCIÓN QUE CREA TODAS LAS VARIABLES                    │
│                                                             │
│  return {                                                   │
│    calculationNumber,        ◄─── Metadatos                │
│    currentDate,                                             │
│    logoCPAU,                                                │
│                                                             │
│    nombreProyecto,           ◄─── Datos del proyecto       │
│    cliente,                                                 │
│    superficieTotal,                                         │
│    valorObraARS,                                            │
│                                                             │
│    honorariosObra,           ◄─── Arrays de honorarios     │
│    honorariosAdicionales,                                   │
│                                                             │
│    subtotalObraARS,          ◄─── Subtotales               │
│    totalGeneralARS,                                         │
│                                                             │
│    // ✅ AQUÍ AGREGAS NUEVAS VARIABLES                      │
│    nuevaVariable: valor,                                    │
│  }                                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Handlebars.compile()(templateData)                │
│  Reemplaza {{nombreVariable}} en HTML con valores          │
│                                                             │
│  Ejemplo:                                                   │
│  <span>{{nombreProyecto}}</span>                           │
│     ↓                                                       │
│  <span>Edificio Torre Central</span>                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  HTML RENDERIZADO                           │
│  → Pasa a Puppeteer                                         │
│  → Genera PDF con diseño CSS aplicado                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Variables Actualmente Disponibles

### **Metadatos**
- `{{calculationNumber}}` - Número de cálculo (6 dígitos)
- `{{currentDate}}` - Fecha actual (dd/mm/yyyy)
- `{{tipoNombre}}` - Tipo de cálculo (descriptivo)
- `{{logoCPAU}}` - Logo CPAU (data URI base64)

### **Datos del Proyecto**
- `{{nombreProyecto}}` - Nombre del proyecto
- `{{cliente}}` - Cliente
- `{{tipoObra}}` - Tipo de obra
- `{{destinoUso}}` - Destino/uso
- `{{superficieTotal}}` - Superficie en m²
- `{{valorObraARS}}` - Valor de obra en ARS (formateado)
- `{{valorObraUSD}}` - Valor de obra en USD (formateado)
- `{{plazoEjecucion}}` - Plazo en meses

### **Arrays de Honorarios**
- `{{honorariosObra}}` - Array de tareas de obra
- `{{honorariosAdicionales}}` - Array de tareas adicionales
- `{{honorariosEspecialidades}}` - Array de especialidades

Cada item tiene:
- `{{indice}}` - Número de fila
- `{{tareaProfesional}}` - Nombre de la tarea
- `{{descripcion}}` - Descripción (opcional)
- `{{importeARS}}` - Importe en ARS
- `{{importeUSD}}` - Importe en USD
- `{{porcentaje}}` - Porcentaje sobre valor de obra

### **Subtotales**
- `{{subtotalObraARS}}`, `{{subtotalObraUSD}}`, `{{subtotalObraPorcentaje}}`
- `{{subtotalAdicionalesARS}}`, `{{subtotalAdicionalesUSD}}`, `{{subtotalAdicionalesPorcentaje}}`
- `{{subtotalEspecialidadesARS}}`, `{{subtotalEspecialidadesUSD}}`, `{{subtotalEspecialidadesPorcentaje}}`

### **Totales**
- `{{totalGeneralARS}}` - Total general en ARS
- `{{totalGeneralUSD}}` - Total general en USD
- `{{totalGeneralPorcentaje}}` - Total en % sobre valor de obra

---

## Notas Adicionales

### **Naming Conventions:**
- Variables: `camelCase` (ej: `nombreProyecto`)
- Constantes: `SCREAMING_SNAKE_CASE` (ej: `CPAU_LOGO`)
- Funciones: `camelCase` (ej: `prepararDatosPlantilla`)

### **Formato de Valores:**
- Moneda: Usar `formatCurrency()` → `$ 1.234.567,89`
- Redondeo: Usar `redondear()` → Sin decimales
- Porcentaje: Agregar `.toFixed(2)` → `8.40`

### **Template en Base de Datos:**
Los templates se guardan en `Entregables_PDF.html_template`. Mantener también versión en `templates/` para control de versiones.

---

## Referencias

- **Documentación oficial Handlebars:** https://handlebarsjs.com/guide/
- **Archivo principal:** `App/Backend/Node/src/services/pdfService.js`
- **Templates:** `App/Backend/Node/templates/`
- **Helpers:** `App/Backend/Node/src/utils/handlebarsHelpers.js`
- **Documentación completa:** `01-Docs/02-Test/T010-002-Documentacion-Template-PDF.md`

---

**Última actualización:** 23/07/2026  
**Mantenido por:** Charly (GitHub Copilot)
