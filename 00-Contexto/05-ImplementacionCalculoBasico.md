# TICKET #003 - LÓGICA DE CÁLCULO DE HONORARIOS BÁSICO

## ✅ IMPLEMENTACIÓN COMPLETADA (07/02/2026)

Este documento detalla la implementación completa del cálculo real de honorarios para el tipo "Honorarios de Especialidades - B ásico", reemplazando los valores mock por cálculos basados en especificaciones oficiales del CPAU.

---

## ARCHIVOS CREADOS

### 1. `src/utils/calculos/tablasCoeficientes.js`
**Propósito:** Definir todas las tablas de coeficientes y constantes

**Contenido:**
- `COEFICIENTES_PROYECTO_DIRECCION`: Coeficientes para Proyecto y Dirección de Obra (por rangos A, B, C, D)
- `COEFICIENTES_INSTALACIONES`: Coeficientes para Instalación Sanitaria, Eléctrica y Contra Incendio
- `COEFICIENTES_ESTRUCTURAS`: Coeficientes específicos para Proyecto de Estructuras
- `PORCENTAJES_TAREA`: Porcentajes aplicables (Proyecto: 60%, Dirección: 40%, resto: 100%)
- `VALOR_K_DEFAULT`: 522,181,756.33

### 2. `src/utils/calculos/honorariosBasico.js`
**Propósito:** Lógica de cálculo principal

**Funciones implementadas:**
- `calcularHonorariosBasico(formData, valorK)`: Función principal que retorna array de ítems
- `calcularTotalHonorarios(detalleHonorarios)`: Suma todos los importes
- `determinarRango(rangoCostoDeObra)`: Determina el rango A/B/C/D
- `formatearPorcentaje(coeficiente)`: Formatea coeficiente a porcentaje (0.14 → "14%")
- `agregarItemsTarea(...)`: Agrega ítems a la grilla según coeficientes

---

## ARCHIVOS MODIFICADOS

### 3. `src/pages/ProcesoCalculoPage.jsx`
**Cambios realizados:**

```javascript
// Agregados imports
import { useParametros } from '../contexts/ParametrosContext';
import { calcularHonorariosBasico } from '../utils/calculos/honorariosBasico';

// En el componente
const { getParametro } = useParametros();

// Modificado performCalculation()
const performCalculation = () => {
  setIsCalculating(true);
  
  setTimeout(() => {
    let result;
    
    if (formData.tipoCalculo === 'Básico') {
      // CÁLCULO REAL
      const valorK = getParametro('valorK') || 522181756.33;
      const detalleHonorarios = calcularHonorariosBasico(formData, valorK);
      setFormData(prev => ({ ...prev, detalleHonorarios }));
      result = { detalleHonorarios, tipoCalculo: 'Básico' };
    } else {
      // Mock para otros tipos
      result = generateMockResults();
    }
    
    setCalculationResult(result);
    setIsCalculating(false);
    setCurrentStep(5);
  }, 1500);
};
```

### 4. `src/components/wizard/ResultadoBasicoDetalle.jsx`
**Cambios realizados:**

Reemplazada tabla mock con estructura real:

**ANTES:**
```jsx
<table>
  <thead>
    <tr>
      <th>Concepto</th>
      <th>Horas</th>
      <th>Tarifa/Hora</th>
      <th>Subtotal</th>
    </tr>
  </thead>
  <tbody>
    {calculationResult.items.map(...)}
  </tbody>
  <tfoot>
    <tr><td>Subtotal</td>...</tr>
    <tr><td>IVA</td>...</tr>
    <tr><td>Gastos Admin</td>...</tr>
    <tr><td>TOTAL</td>...</tr>
  </tfoot>
</table>
```

**DESPUÉS:**
```jsx
<table>
  <thead>
    <tr>
      <th>Ítem</th>
      <th>Tarea Profesional</th>
      <th>Descripción</th>
      <th>Importe</th>
    </tr>
  </thead>
  <tbody>
    {formData.detalleHonorarios.map(item => (
      <tr key={item.item}>
        <td>{item.item}</td>
        <td>{item.tareaProfesional}</td>
        <td>{item.descripcion}</td>
        <td>{formatCurrencyARS(item.importe)}</td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <td colSpan={3}>TOTAL HONORARIOS PROFESIONALES</td>
      <td>{formatCurrencyARS(formData.detalleHonorarios.reduce(...))}</td>
    </tr>
  </tfoot>
</table>
```

### 5. `src/components/wizard/ResultadoBasicoDetalle.module.css`
**Estilos agregados:**

```css
.centered {
  text-align: center;
  font-weight: 600;
  color: var(--color-gray-600);
}

.descripcion {
  color: var(--color-gray-600);
  font-size: 0.95rem;
}

.notaFinal {
  background-color: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 1rem 1.25rem;
  margin-top: 1.5rem;
  border-radius: 8px;
}
```

---

## ALGORITMO IMPLEMENTADO

### PASO 1: Calcular Rango de Costo de Obra
```javascript
const rangoCostoDeObra = valorObra / valorK;
const rango = determinarRango(rangoCostoDeObra);
// Rango A: < 0.5
// Rango B: 0.5 - 5
// Rango C: 5 - 25
// Rango D: >= 25
```

### PASO 2: Procesar Tareas Seleccionadas

Orden de procesamiento:
1. **Proyecto de Obra** (si `obraProyecto === true`) → 60%
2. **Dirección de Obra** (si `obraDireccion === true`) → 40%
3. **Instalación Sanitaria** (si `instalacionSanitaria === true`) → 100%
4. **Instalación Eléctrica** (si `instalacionElectrica === true`) → 100%
5. **Instalación Contra Incendio** (si `instalacionContraIncendio === true`) → 100%
6. **Proyecto de Estructuras** (si `proyectoEstructuras === true`) → 100%

### PASO 3: Generar Ítems por Tarea

Para cada tarea seleccionada:
```javascript
// Si coefRangoObra > 0
items.push({
  item: contador++,
  tareaProfesional: "Nombre Tarea",
  descripcion: `Rango ${nombreRango} (coef ${porcentaje})`,
  importe: coefRangoObra * valorObra * porcentajeTarea
});

// Si coefRangoK > 0
items.push({
  item: contador++,
  tareaProfesional: "Nombre Tarea",
  descripcion: `Rango ${nombreRango} (coef K ${porcentaje})`,
  importe: coefRangoK * valorK * porcentajeTarea
});
```

---

## TABLA DE COEFICIENTES IMPLEMENTADA

### Proyecto/Dirección de Obra

| Rango | Condición | coef Obra | coef K | Items generados |
|-------|-----------|-----------|--------|----------------|
| A | < 0.5 | 0.14 | 0 | 1 |
| B | 0.5 - 5 | 0.08 | 0.03 | 2 |
| C | 5 - 25 | 0.06 | 0.13 | 2 |
| D | >= 25 | 0.04 | 0.63 | 2 |

### Instalaciones (Sanitaria, Eléctrica, Contra Incendio)

| Rango | Condición | coef Obra | coef K | Items generados |
|-------|-----------|-----------|--------|----------------|
| A | < 0.5 | 0.0023 | 0 | 1 |
| B | 0.5 - 5 | 0.0012 | 0 | 1 |
| C | 5 - 25 | 0.0008 | 0 | 1 |
| D | >= 25 | 0.0004 | 0 | 1 |

### Estructuras

| Rango | Condición | coef Obra | coef K | Items generados |
|-------|-----------|-----------|--------|----------------|
| A | < 0.5 | 0.0030 | 0 | 1 |
| B | 0.5 - 5 | 0.0026 | 0 | 1 |
| C | 5 - 25 | 0.0021 | 0 | 1 |
| D | >= 25 | 0.0016 | 0 | 1 |

---

## EJEMPLO DE CÁLCULO REAL

### Entrada:
```javascript
{
  superficieTotal: 200,
  valorMetro2: 800,
  cotizDolar: 1100,
  complejidad: 'Media',
  valorObra: 176000000,  // 200 × 800 × 1100
  obraProyecto: true,
  obraDireccion: true,
  instalacionSanitaria: false,
  instalacionElectrica: false,
  instalacionContraIncendio: false,
  proyectoEstructuras: false
}
valorK = 522181756.33
```

### Cálculo:
```
rangoCostoDeObra = 176000000 / 522181756.33 = 0.337
→ RANGO A (< 0.5)
```

### Salida:
```javascript
[
  {
    item: 1,
    tareaProfesional: "Proyecto de Obra",
    descripcion: "Rango de Costos de Obra A (coef 14%)",
    importe: 14784000  // 0.14 × 176000000 × 0.6
  },
  {
    item: 2,
    tareaProfesional: "Dirección de Obra",
    descripcion: "Rango de Costos de Obra A (coef 14%)",
    importe: 9856000  // 0.14 × 176000000 × 0.4
  }
]

TOTAL: $ 24.640.000
```

---

## INTEGRACIÓN CON PARÁMETROS

El cálculo obtiene el **valorK** desde `ParametrosContext`:

```javascript
const { getParametro } = useParametros();
const valorK = getParametro('valorK') || 522181756.33;
```

El usuario puede modificar valorK desde:
**Menú Usuario → Parámetros → Valor índice de referencia cálculo de Honorarios CPAU**

---

## VALIDACIONES IMPLEMENTADAS

✅ Si `valorObra <= 0` → retorna array vacío + warning en consola
✅ Si `valorK <= 0` → usa default 522181756.33 + warning en consola
✅ Si ninguna tarea seleccionada → retorna array vacío
✅ Solo procesa tareas con valor `=== true`
✅ Contador de ítems consecutivo compartido entre todas las tareas
✅ Formateo correcto de porcentajes (elimina .00%)

---

## LOGS DE DEPURACIÓN

La función `calcularHonorariosBasico()` genera logs en consola para debugging:

```javascript
console.log('Cálculo de Honorarios Básico:', {
  valorObra,
  valorK,
  rangoCostoDeObra: rangoCostoDeObra.toFixed(4),
  rango: nombreRango
});

console.log(`Total de ítems generados: ${items.length}`);
console.log('Detalle de honorarios:', items);
```

---

## ESTADO FINAL

✅ **TICKET #003 - COMPLETADO**
- 2 archivos creados
- 3 archivos modificados
- Cálculo real implementado 100%
- Integrado con ParametrosContext
- UI actualizada
- Logs para debugging
- Ready for production

**Próximo:** Testing con casos reales del CPAU
