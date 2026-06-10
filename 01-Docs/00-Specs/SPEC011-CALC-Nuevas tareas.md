# SPEC011-CALC-Nuevas tareas

**Fecha de creación:** 2026-06-09  
**Autor:** Charly  
**Estado:** ✅IMPLEMENTADA EN DEV Y QA!!!!!!!!!!!!!!!!!  
**Prioridad:** Alta  
**Sprint:** 2026-06  

---

## 📋 CONTEXTO Y OBJETIVOS

### Contexto
El componente `ResultadoBasicoDetalle` muestra el resultado final del cálculo de honorarios profesionales en formato de certificado/reporte. Actualmente, el backend devuelve los importes únicamente en ARS (pesos argentinos), y el frontend muestra una tabla con 4 columnas: Ítem, Tarea Profesional, Importe y % sobre costo de obra.

El cliente solicita agregar soporte multi-moneda para mostrar simultáneamente importes en ARS y USD, junto con ajustes en el layout y la implementación de subtotales categorizados por tipo de tarea profesional.

### Objetivos
1. **Agregar columna USD** en la tabla de honorarios, calculada desde el tipo de cambio `formData.cotizDolar`
2. **Mostrar "Costo estimado de obra (USD)"** en el resumen del proyecto (columna izquierda)
3. **Ajustar proporción de columnas** del layout principal de 50/50 a 33/67 para dar más espacio a la tabla ampliada
4. **Implementar subtotales categorizados** agrupando honorarios en: "Total honorarios obra", "Total honorarios adicionales" y "Total honorarios especialidades"
5. **Renderizado condicional** de secciones de subtotales (solo mostrar si tienen al menos 1 ítem)

### Alcance
**✅ Archivos en alcance:**
- `App/Frontend/src/components/ResultadoBasicoDetalle/ResultadoBasicoDetalle.jsx`
- `App/Frontend/src/components/ResultadoBasicoDetalle/ResultadoBasicoDetalle.module.css`

**⛔ Restricción:** NO modificar ningún otro archivo fuera de estos dos.

---

## 🔍 ESTADO ACTUAL

### Estructura de datos de entrada
```javascript
formData = {
  cotizDolar: 1150,           // Tipo de cambio ARS/USD
  valorObra: 500000000,       // Valor de obra en ARS
  detalleHonorarios: [
    {
      tareaProfesional: "Proyecto de obra de arquitectura",
      importe: 42000000        // Solo ARS, NO viene importe_usd desde backend
    },
    {
      tareaProfesional: "Dirección de obra de arquitectura",
      importe: 35000000
    },
    {
      tareaProfesional: "Documentación ejecutiva de obra",
      importe: 8000000
    },
    {
      tareaProfesional: "Supervisión de obra de arquitectura",
      importe: 12000000
    },
    {
      tareaProfesional: "Proyecto de instalación eléctrica",
      importe: 5000000
    },
    {
      tareaProfesional: "Proyecto de instalación sanitaria",
      importe: 4500000
    }
    // ... más especialidades
  ]
}
```

### Layout actual
- **Estructura de 2 columnas:** `grid-template-columns: 1fr 1fr` (50% / 50%)
- **Columna izquierda (leftColumn):** Resumen del Proyecto con datos básicos
- **Columna derecha (rightColumn):** Tabla de honorarios con 4 columnas

### Tabla actual
| Ítem | Tarea Profesional | Importe | % sobre costo |
|------|-------------------|---------|---------------|
| 1 | Proyecto de obra... | $42.000.000 | 8.40% |
| ... | ... | ... | ... |

**Total general** se muestra al final sin subtotales intermedios.

---

## 🎯 SOLUCIÓN PROPUESTA

### Cambios en Layout
1. **Proporción de columnas:** Cambiar de `1fr 1fr` a `1fr 2fr` (33% / 67%)
2. **Columna izquierda:** Agregar fila "Costo estimado de obra (USD)"

### Cambios en Tabla de Honorarios
**Nueva estructura de 5 columnas:**

| Ítem | Tarea Profesional | Importe ARS | Importe USD | % sobre costo |
|------|-------------------|-------------|-------------|---------------|
| 1 | Proyecto de obra... | $42.000.000 | USD 36,522 | 8.40% |
| 2 | Dirección de obra... | $35.000.000 | USD 30,435 | 7.00% |
| **Subtotal honorarios obra** | | **$77.000.000** | **USD 66,957** | **15.40%** |
| 3 | Documentación ejecutiva... | $8.000.000 | USD 6,957 | 1.60% |
| 4 | Supervisión de obra... | $12.000.000 | USD 10,435 | 2.40% |
| **Subtotal honorarios adicionales** | | **$20.000.000** | **USD 17,391** | **4.00%** |
| 5 | Proyecto instalación eléctrica | $5.000.000 | USD 4,348 | 1.00% |
| 6 | Proyecto instalación sanitaria | $4.500.000 | USD 3,913 | 0.90% |
| **Subtotal honorarios especialidades** | | **$9.500.000** | **USD 8,261** | **1.90%** |
| | **TOTAL GENERAL** | **$106.500.000** | **USD 92,609** | **21.30%** |

### Lógica de Categorización

**Criterios de matching (case-insensitive):**

| Categoría | Criterio de inclusión | Nombres esperados |
|-----------|----------------------|-------------------|
| **Honorarios Obra** | Contiene "Proyecto de obra" O "Dirección de obra" | "Proyecto de obra de arquitectura", "Dirección de obra de arquitectura" |
| **Honorarios Adicionales** | Contiene "Documentación ejecutiva" O "Supervisión de obra" | "Documentación ejecutiva de obra", "Supervisión de obra de arquitectura" |
| **Honorarios Especialidades** | **Todo lo que NO cumple criterios anteriores** | "Proyecto de instalación eléctrica", "Proyecto de instalación sanitaria", etc. |

**⚠️ Reglas importantes:**
- La categorización es **por matching de nombres**, no por posición en el array
- Los nombres de tareas pueden variar (ej: "Proyecto de obra de ingeniería civil")
- Cada subtotal solo se muestra **si tiene al menos 1 ítem**

### Cálculo de Importe USD
```javascript
const calcularImporteUSD = (importeARS, cotizDolar) => {
  if (!cotizDolar || cotizDolar === 0) return null;
  return importeARS / cotizDolar;
};

// Uso:
const importeUSD = calcularImporteUSD(42000000, 1150); // 36521.74
```

**Formato de visualización:**
- ARS: `formatCurrencyARS(42000000)` → `"$42.000.000"`
- USD: `formatCurrencyARS(36521.74)` → `"USD 36,522"` (reutilizar misma función para consistencia)

### Funciones Helper a Crear

```javascript
/**
 * Categoriza honorarios en 3 grupos según nombre de tarea
 * @param {Array} detalleHonorarios - Array de objetos { tareaProfesional, importe }
 * @returns {Object} { obra: [], adicionales: [], especialidades: [] }
 */
const categorizarHonorarios = (detalleHonorarios) => {
  const obra = [];
  const adicionales = [];
  const especialidades = [];

  detalleHonorarios.forEach((item, index) => {
    const nombreTarea = item.tareaProfesional.toLowerCase();
    
    if (nombreTarea.includes('proyecto de obra') || nombreTarea.includes('dirección de obra')) {
      obra.push({ ...item, indice: index + 1 });
    } else if (nombreTarea.includes('documentación ejecutiva') || nombreTarea.includes('supervisión de obra')) {
      adicionales.push({ ...item, indice: index + 1 });
    } else {
      especialidades.push({ ...item, indice: index + 1 });
    }
  });

  return { obra, adicionales, especialidades };
};

/**
 * Calcula subtotal de una categoría
 * @param {Array} items - Array de honorarios de la categoría
 * @returns {Object} { totalARS, totalUSD, totalPorcentaje }
 */
const calcularSubtotal = (items, cotizDolar, valorObra) => {
  const totalARS = items.reduce((sum, item) => sum + item.importe, 0);
  const totalUSD = calcularImporteUSD(totalARS, cotizDolar);
  const totalPorcentaje = (totalARS / valorObra) * 100;
  
  return { totalARS, totalUSD, totalPorcentaje };
};
```

---

## 🎫 TICKETS DE IMPLEMENTACIÓN

### TICKET #001: Ajustar proporción de columnas del layout principal
**Prioridad:** Media  
**Estimación:** 0.5h  

**Descripción:**  
Cambiar la proporción de columnas en el layout de 2 columnas de 50/50 a 33/67 para dar más espacio a la tabla de honorarios ampliada.

**Archivos a modificar:**
- `ResultadoBasicoDetalle.module.css`

**Cambios específicos:**
```css
/* ANTES */
.twoColumnLayout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
  gap: 30px;
}

/* DESPUÉS */
.twoColumnLayout {
  display: grid;
  grid-template-columns: 1fr 2fr;  /* 33% / 67% */
  gap: 30px;
}

/* Responsive: mantener stacking en mobile */
@media (max-width: 768px) {
  .twoColumnLayout {
    grid-template-columns: 1fr;
  }
}
```

**Criterios de aceptación:**
- ✅ La columna izquierda ocupa ~33% del ancho
- ✅ La columna derecha ocupa ~67% del ancho
- ✅ En pantallas < 768px, las columnas se apilan verticalmente
- ✅ El gap de 30px se mantiene

---

### TICKET #002: Agregar "Costo estimado de obra (USD)" en resumen del proyecto
**Prioridad:** Media  
**Estimación:** 0.5h  

**Descripción:**  
Agregar una nueva fila en el Resumen del Proyecto (columna izquierda) mostrando el costo estimado de obra en USD, calculado desde `formData.valorObra / formData.cotizDolar`.

**Archivos a modificar:**
- `ResultadoBasicoDetalle.jsx`

**Ubicación:**  
En la sección `leftColumn`, después de la fila "Costo estimado de obra:".

**Código propuesto:**
```jsx
<div className={styles.dataRow}>
  <span className={styles.label}>Costo estimado de obra:</span>
  <span className={styles.value}>{formatCurrencyARS(formData.valorObra)}</span>
</div>

{/* NUEVA FILA */}
<div className={styles.dataRow}>
  <span className={styles.label}>Costo estimado de obra (USD):</span>
  <span className={styles.value}>
    {formData.cotizDolar && formData.cotizDolar > 0 
      ? formatCurrencyARS(formData.valorObra / formData.cotizDolar)
      : 'N/A'}
  </span>
</div>
```

**Criterios de aceptación:**
- ✅ La fila aparece inmediatamente después de "Costo estimado de obra"
- ✅ El cálculo es correcto: `valorObra / cotizDolar`
- ✅ Si `cotizDolar === 0` o no existe, muestra "N/A"
- ✅ El formato usa `formatCurrencyARS()` para consistencia visual

---

### TICKET #003: Modificar estructura de tabla de honorarios (agregar columnas ARS/USD)
**Prioridad:** Alta  
**Estimación:** 2h  

**Descripción:**  
Modificar la tabla de honorarios para mostrar 5 columnas en lugar de 4, separando "Importe" en "Importe ARS" e "Importe USD".

**Archivos a modificar:**
- `ResultadoBasicoDetalle.jsx`

**Cambios en thead:**
```jsx
<thead>
  <tr>
    <th className={styles.centered}>Ítem</th>
    <th>Tarea Profesional</th>
    <th className={styles.rightAlign}>Importe ARS</th>  {/* NUEVO */}
    <th className={styles.rightAlign}>Importe USD</th>  {/* NUEVO */}
    <th className={styles.centered}>% sobre costo</th>
  </tr>
</thead>
```

**Cambios en tbody (renderizado de filas):**
```jsx
<tr key={index}>
  <td className={styles.centered}>{index + 1}</td>
  <td>{item.tareaProfesional}</td>
  <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
  <td className={styles.rightAlign}>
    {formData.cotizDolar && formData.cotizDolar > 0
      ? formatCurrencyARS(item.importe / formData.cotizDolar)
      : 'N/A'}
  </td>
  <td className={styles.centered}>{((item.importe / formData.valorObra) * 100).toFixed(2)}%</td>
</tr>
```

**Criterios de aceptación:**
- ✅ La tabla muestra 5 columnas: Ítem | Tarea Profesional | Importe ARS | Importe USD | % sobre costo
- ✅ Los valores USD se calculan correctamente dividiendo importe ARS por cotizDolar
- ✅ Si cotizDolar === 0, la columna USD muestra "N/A" en todas las filas
- ✅ El alineamiento es correcto: Ítem (centrado), Tarea (izquierda), Importes (derecha), % (centrado)
- ✅ Los headers tienen las clases de estilos apropiadas

---

### TICKET #004: Implementar lógica de categorización de honorarios
**Prioridad:** Alta  
**Estimación:** 2.5h  

**Descripción:**  
Crear funciones helper para categorizar los honorarios en 3 grupos (obra, adicionales, especialidades) y calcular subtotales por categoría.

**Archivos a modificar:**
- `ResultadoBasicoDetalle.jsx`

**Funciones a implementar:**

1. **`categorizarHonorarios(detalleHonorarios)`**
```javascript
const categorizarHonorarios = (detalleHonorarios) => {
  const obra = [];
  const adicionales = [];
  const especialidades = [];

  detalleHonorarios.forEach((item, index) => {
    const nombreTarea = item.tareaProfesional.toLowerCase();
    
    if (nombreTarea.includes('proyecto de obra') || nombreTarea.includes('dirección de obra')) {
      obra.push({ ...item, indice: index + 1 });
    } else if (nombreTarea.includes('documentación ejecutiva') || nombreTarea.includes('supervisión de obra')) {
      adicionales.push({ ...item, indice: index + 1 });
    } else {
      especialidades.push({ ...item, indice: index + 1 });
    }
  });

  return { obra, adicionales, especialidades };
};
```

2. **`calcularImporteUSD(importeARS, cotizDolar)`**
```javascript
const calcularImporteUSD = (importeARS, cotizDolar) => {
  if (!cotizDolar || cotizDolar === 0) return null;
  return importeARS / cotizDolar;
};
```

3. **`calcularSubtotal(items, cotizDolar, valorObra)`**
```javascript
const calcularSubtotal = (items, cotizDolar, valorObra) => {
  const totalARS = items.reduce((sum, item) => sum + item.importe, 0);
  const totalUSD = calcularImporteUSD(totalARS, cotizDolar);
  const totalPorcentaje = (totalARS / valorObra) * 100;
  
  return { totalARS, totalUSD, totalPorcentaje };
};
```

**Uso en el componente:**
```javascript
// Dentro del componente ResultadoBasicoDetalle
const { obra, adicionales, especialidades } = categorizarHonorarios(formData.detalleHonorarios);

const subtotalObra = calcularSubtotal(obra, formData.cotizDolar, formData.valorObra);
const subtotalAdicionales = calcularSubtotal(adicionales, formData.cotizDolar, formData.valorObra);
const subtotalEspecialidades = calcularSubtotal(especialidades, formData.cotizDolar, formData.valorObra);
```

**Criterios de aceptación:**
- ✅ Las funciones están definidas dentro del componente (antes del return)
- ✅ La categorización por matching de nombres funciona correctamente
- ✅ Los índices de ítems se preservan correctamente
- ✅ Los subtotales se calculan con precisión (ARS, USD, %)
- ✅ El manejo de `cotizDolar === 0` devuelve null para USD

---

### TICKET #005: Renderizar subtotales categorizados en la tabla
**Prioridad:** Alta  
**Estimación:** 3h  

**Descripción:**  
Modificar el renderizado de la tabla para mostrar los honorarios agrupados por categoría con sus respectivos subtotales. Solo mostrar cada sección si tiene al menos 1 ítem.

**Archivos a modificar:**
- `ResultadoBasicoDetalle.jsx`

**⚠️ IMPORTANTE:** Los estilos `.subtotalRow` y `.totalRow` ya existen en `ResultadoBasicoDetalle.module.css`. NO crear nuevos estilos.

**Estructura de renderizado propuesta:**
```jsx
<tbody>
  {/* SECCIÓN: Honorarios Obra */}
  {obra.length > 0 && (
    <>
      {obra.map((item) => (
        <tr key={`obra-${item.indice}`}>
          <td className={styles.centered}>{item.indice}</td>
          <td>{item.tareaProfesional}</td>
          <td className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
          <td className={styles.rightAlign}>
            {calcularImporteUSD(item.importe, formData.cotizDolar) !== null
              ? formatCurrencyARS(calcularImporteUSD(item.importe, formData.cotizDolar))
              : 'N/A'}
          </td>
          <td className={styles.centered}>
            {((item.importe / formData.valorObra) * 100).toFixed(2)}%
          </td>
        </tr>
      ))}
      
      {/* Subtotal Obra */}
      <tr className={styles.subtotalRow}>
        <td colSpan="2">
          <strong>Total honorarios obra</strong>
        </td>
        <td className={styles.rightAlign}>
          <strong>{formatCurrencyARS(subtotalObra.totalARS)}</strong>
        </td>
        <td className={styles.rightAlign}>
          <strong>
            {subtotalObra.totalUSD !== null
              ? formatCurrencyARS(subtotalObra.totalUSD)
              : 'N/A'}
          </strong>
        </td>
        <td className={styles.centered}>
          <strong>{subtotalObra.totalPorcentaje.toFixed(2)}%</strong>
        </td>
      </tr>
    </>
  )}

  {/* SECCIÓN: Honorarios Adicionales */}
  {adicionales.length > 0 && (
    <>
      {adicionales.map((item) => (
        <tr key={`adic-${item.indice}`}>
          {/* ... misma estructura que obra ... */}
        </tr>
      ))}
      
      <tr className={styles.subtotalRow}>
        <td colSpan="2">
          <strong>Total honorarios adicionales</strong>
        </td>
        {/* ... */}
      </tr>
    </>
  )}

  {/* SECCIÓN: Honorarios Especialidades */}
  {especialidades.length > 0 && (
    <>
      {especialidades.map((item) => (
        <tr key={`esp-${item.indice}`}>
          {/* ... misma estructura que obra ... */}
        </tr>
      ))}
      
      <tr className={styles.subtotalRow}>
        <td colSpan="2">
          <strong>Total honorarios especialidades</strong>
        </td>
        {/* ... */}
      </tr>
    </>
  )}

  {/* TOTAL GENERAL */}
  <tr className={styles.totalRow}>
    <td colSpan="2">
      <strong>TOTAL GENERAL</strong>
    </td>
    <td className={styles.rightAlign}>
      <strong>{formatCurrencyARS(totalGeneral.totalARS)}</strong>
    </td>
    <td className={styles.rightAlign}>
      <strong>
        {totalGeneral.totalUSD !== null
          ? formatCurrencyARS(totalGeneral.totalUSD)
          : 'N/A'}
      </strong>
    </td>
    <td className={styles.centered}>
      <strong>{totalGeneral.totalPorcentaje.toFixed(2)}%</strong>
    </td>
  </tr>
</tbody>
```

**Estilos CSS existentes a utilizar:**

**⚠️ NO agregar nuevos estilos.** El archivo `ResultadoBasicoDetalle.module.css` ya contiene las clases necesarias:

```css
/* ESTILOS YA EXISTENTES EN EL ARCHIVO */

.subtotalRow {
  background-color: var(--color-fondo);
}

.subtotalRow td {
  padding-top: 1rem;
  border-bottom: 1px solid #bae6fd;
}

.totalRow {
  background-color: var(--color-fondo);
}

.totalRow td {
  padding: 1rem;
  font-size: 1rem;
  border-bottom: none;
  color: var(--color-primary);
  transition: background-color 0.2s ease;
}

/* Clases de alineación ya disponibles */
.rightAlign {
  text-align: right;
}

.centered {
  text-align: center;
  font-weight: 600;
  color: var(--color-gray-600);
}
```

**Uso:** Aplicar directamente `className={styles.subtotalRow}` y `className={styles.totalRow}` sin modificar el archivo CSS.

**Cálculo del total general:**
```javascript
const totalGeneral = {
  totalARS: subtotalObra.totalARS + subtotalAdicionales.totalARS + subtotalEspecialidades.totalARS,
  totalUSD: 
    (subtotalObra.totalUSD !== null && 
     subtotalAdicionales.totalUSD !== null && 
     subtotalEspecialidades.totalUSD !== null)
      ? subtotalObra.totalUSD + subtotalAdicionales.totalUSD + subtotalEspecialidades.totalUSD
      : null,
  totalPorcentaje: subtotalObra.totalPorcentaje + subtotalAdicionales.totalPorcentaje + subtotalEspecialidades.totalPorcentaje
};
```

**Criterios de aceptación:**
- ✅ Las secciones solo se renderizan si `categoría.length > 0`
- ✅ Los subtotales aparecen después de cada grupo usando `.subtotalRow` existente
- ✅ El total general suma correctamente los 3 subtotales y usa `.totalRow` existente
- ✅ Los estilos visuales distinguen claramente usando clases ya disponibles en el CSS
- ✅ La fila de subtotal usa `colSpan="2"` para abarcar las primeras 2 columnas
- ✅ Las keys de React son únicas usando prefijos (`obra-`, `adic-`, `esp-`)
- ✅ Si no hay items en ninguna categoría, la tabla muestra solo headers (caso edge)

---

## ✅ CRITERIOS DE ACEPTACIÓN GENERALES

### Funcionales
- ✅ La tabla muestra 5 columnas: Ítem | Tarea Profesional | Importe ARS | Importe USD | % sobre costo
- ✅ Los valores en USD se calculan correctamente usando `importe / cotizDolar`
- ✅ El "Costo estimado de obra (USD)" aparece en el resumen del proyecto
- ✅ Las categorías se agrupan correctamente según los criterios de matching de nombres
- ✅ Los subtotales (Obra, Adicionales, Especialidades) se muestran solo si tienen ítems
- ✅ El total general suma correctamente todos los subtotales
- ✅ Si `cotizDolar === 0` o no existe, se muestra "N/A" en todas las columnas USD

### Visuales
- ✅ La proporción de columnas es 33% / 67% (1fr / 2fr)
- ✅ Los subtotales usan el estilo `.subtotalRow` existente (fondo var(--color-fondo))
- ✅ El total general usa el estilo `.totalRow` existente (fondo var(--color-fondo), texto var(--color-primary))
- ✅ Los números están alineados a la derecha, los textos a la izquierda, los % centrados
- ✅ El diseño es responsive: en < 768px las columnas se apilan

### Técnicos
- ✅ No se modifican archivos fuera del alcance definido
- ✅ Las funciones helper están bien encapsuladas dentro del componente
- ✅ No hay errores de consola ni warnings de React
- ✅ Las keys de React son únicas y estables
- ✅ El código sigue las convenciones del proyecto: camelCase, ES6+, CSS Modules

---

## 🧪 ESCENARIOS DE TESTING

### Escenario 1: Cálculo estándar con todas las categorías
**Datos de entrada:**
```javascript
formData = {
  cotizDolar: 1150,
  valorObra: 500000000,
  detalleHonorarios: [
    { tareaProfesional: "Proyecto de obra de arquitectura", importe: 42000000 },
    { tareaProfesional: "Dirección de obra de arquitectura", importe: 35000000 },
    { tareaProfesional: "Documentación ejecutiva de obra", importe: 8000000 },
    { tareaProfesional: "Supervisión de obra de arquitectura", importe: 12000000 },
    { tareaProfesional: "Proyecto de instalación eléctrica", importe: 5000000 },
    { tareaProfesional: "Proyecto de instalación sanitaria", importe: 4500000 }
  ]
}
```

**Resultado esperado:**
- 6 filas de ítems + 3 filas de subtotales + 1 fila de total = 10 filas
- Total honorarios obra: $77.000.000 / USD 66,957 / 15.40%
- Total honorarios adicionales: $20.000.000 / USD 17,391 / 4.00%
- Total honorarios especialidades: $9.500.000 / USD 8,261 / 1.90%
- Total general: $106.500.000 / USD 92,609 / 21.30%

---

### Escenario 2: Solo honorarios de obra (sin adicionales ni especialidades)
**Datos de entrada:**
```javascript
formData = {
  cotizDolar: 1200,
  valorObra: 300000000,
  detalleHonorarios: [
    { tareaProfesional: "Proyecto de obra de arquitectura", importe: 25000000 }
  ]
}
```

**Resultado esperado:**
- Solo aparece la sección "Honorarios Obra" con 1 ítem
- Subtotal obra = Total general = $25.000.000 / USD 20,833 / 8.33%
- NO aparecen las secciones de "Honorarios Adicionales" ni "Honorarios Especialidades"

---

### Escenario 3: Cotización de dólar = 0 (sin USD)
**Datos de entrada:**
```javascript
formData = {
  cotizDolar: 0,
  valorObra: 400000000,
  detalleHonorarios: [
    { tareaProfesional: "Proyecto de obra de arquitectura", importe: 30000000 },
    { tareaProfesional: "Proyecto de instalación eléctrica", importe: 5000000 }
  ]
}
```

**Resultado esperado:**
- La tabla se renderiza correctamente con las 5 columnas
- **Todas las celdas de "Importe USD" muestran "N/A"**
- La fila "Costo estimado de obra (USD)" muestra "N/A"
- Los subtotales y total general muestran "N/A" en la columna USD
- Los importes ARS y porcentajes se calculan normalmente

---

### Escenario 4: Array vacío de honorarios
**Datos de entrada:**
```javascript
formData = {
  cotizDolar: 1100,
  valorObra: 200000000,
  detalleHonorarios: []
}
```

**Resultado esperado:**
- La tabla muestra solo los headers (5 columnas)
- NO aparecen filas de ítems, subtotales ni total general
- El mensaje "No hay honorarios calculados" aparece (o comportamiento equivalente)

---

### Escenario 5: Nombres de tareas con variaciones (case-insensitive)
**Datos de entrada:**
```javascript
formData = {
  cotizDolar: 1000,
  valorObra: 600000000,
  detalleHonorarios: [
    { tareaProfesional: "PROYECTO DE OBRA de ingeniería civil", importe: 50000000 },
    { tareaProfesional: "Dirección de Obra de Ingeniería", importe: 40000000 },
    { tareaProfesional: "DOCUMENTACIÓN EJECUTIVA De Obra", importe: 10000000 },
    { tareaProfesional: "supervisión de obra ambiental", importe: 8000000 },
    { tareaProfesional: "Proyecto instalación termomecánica", importe: 6000000 }
  ]
}
```

**Resultado esperado:**
- Categoría Obra: ítems 1 y 2 (matchean "proyecto de obra" y "dirección de obra")
- Categoría Adicionales: ítems 3 y 4 (matchean "documentación ejecutiva" y "supervisión de obra")
- Categoría Especialidades: ítem 5 (no matchea ningún criterio anterior)
- El matching es **case-insensitive** y funciona correctamente

---

### Escenario 6: Responsive (pantalla móvil < 768px)
**Datos de entrada:** Cualquier dataset válido

**Resultado esperado:**
- Las columnas del layout se apilan verticalmente (grid-template-columns: 1fr)
- El resumen del proyecto aparece arriba, la tabla debajo
- La tabla mantiene las 5 columnas pero puede tener scroll horizontal si es necesario
- Los estilos se mantienen consistentes

---

## 📝 NOTAS IMPORTANTES

### Decisiones de diseño
1. **¿Por qué reutilizar `formatCurrencyARS()` para USD?**  
   Para mantener consistencia visual en el formato de números (puntos como separadores de miles). El prefijo "USD" puede agregarse manualmente.

2. **¿Por qué matching de nombres en lugar de IDs/códigos?**  
   El backend actual solo devuelve `tareaProfesional` (string) e `importe`. No hay campos adicionales como `codigoTarea` o `categoria`. El matching por nombres es la solución más pragmática sin modificar el backend.

3. **¿Por qué colSpan="2" en subtotales?**  
   Para abarcar las columnas "Ítem" y "Tarea Profesional", dejando espacio solo para los valores numéricos (ARS, USD, %).

### Validaciones pendientes
- **Backend:** Confirmar que los nombres de tareas se mantienen estables (ej: no cambian "Proyecto de obra" a "Proyecto de la obra")
- **UX:** Revisar con cliente si el orden de categorías (Obra → Adicionales → Especialidades) es el esperado
- **Performance:** Si `detalleHonorarios` crece significativamente (>100 ítems), evaluar virtualización de tabla

### Dependencias
- **Ninguna nueva:** Solo se usan funciones y estilos ya existentes en el proyecto
- **Helpers internos:** Las funciones `categorizarHonorarios`, `calcularImporteUSD` y `calcularSubtotal` son internas al componente

### Consideraciones de mantenimiento
- Si se agregan nuevas tareas profesionales, verificar que la categorización por matching las clasifique correctamente
- Si el cliente solicita nuevas categorías, actualizar la lógica de `categorizarHonorarios()`
- Si cambia el formato de números, centralizar la lógica de formato en una función helper compartida

---

## 📊 RESUMEN DE IMPACTO

| Archivo | Líneas estimadas a modificar | Tipo de cambio |
|---------|------------------------------|----------------|
| `ResultadoBasicoDetalle.jsx` | ~150 líneas | Refactor medio + lógica nueva |
| `ResultadoBasicoDetalle.module.css` | ~5 líneas | Solo ajuste de grid-template-columns |

**Tiempo total estimado:** 8.5 horas  
**Riesgo técnico:** Bajo (cambios aislados, sin dependencias externas)  
**Impacto visual:** Alto (cambio significativo en tabla de resultados)

---

**FIN DE ESPECIFICACIÓN SPEC011**