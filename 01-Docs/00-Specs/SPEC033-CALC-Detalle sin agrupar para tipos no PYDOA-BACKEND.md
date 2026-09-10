# SPEC-033: Detalle de Honorarios sin Agrupar para Tipos de Cálculo No-PYDOA

**Proyecto**: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Módulo**: PDF / Certificado de Honorarios  
**Componente**: `pdfService.js`, templates Handlebars de certificados  
**Fecha**: 10/09/2026  
**Última Actualización**: 10/09/2026  
**Autor**: Charly  
**Estado**: ✅ IMPLEMENTADA  

---

## 📋 Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contexto y Motivación](#contexto-y-motivación)
3. [Alcance](#alcance)
4. [Comportamiento Actual](#comportamiento-actual)
5. [Comportamiento Esperado](#comportamiento-esperado)
6. [Especificación Técnica](#especificación-técnica)
7. [Impacto en Templates PDF](#impacto-en-templates-pdf)
8. [Tickets de Implementación](#tickets-de-implementación)
9. [Criterios de Aceptación](#criterios-de-aceptación)

---

## 📝 Resumen Ejecutivo

El frontend ya fue ajustado para que, en los tipos de cálculo distintos de PYDOA, el detalle de honorarios se muestre sin agrupar por `tareaProfesional`, dejando visible cada concepto individual que conforma el total. La misma regla debe aplicarse en el backend al generar el certificado PDF, para que el documento final mantenga el mismo comportamiento del paso 5 del wizard.

Actualmente, la lógica del PDF agrupa los honorarios por `tareaProfesional` sin importar el tipo de cálculo. Esto funciona para PYDOA, pero para tipos como HABI, ARBI, CONSULT, GPYC, PERI, HYS, MEDPLAN, DISPAI, CONFAC, TASA, etc. colapsa varias filas distintas en una sola, ocultando el detalle real del cálculo y contradiciendo el comportamiento ya implementado en el front.

**Objetivo**: ajustar la preparación de datos del PDF para que:
- En `PYDOA`, mantenga el comportamiento actual de agrupación por sección y subtotales.
- En los demás tipos, genere el detalle sin agrupar, mostrando cada ítem con su propia descripción y su importe.
- En la columna de descripción del PDF, muestre el campo `descripcion` del movimiento, no la `tareaProfesional` repetida.
- Mantenga el `TOTAL GENERAL` sin cambios de suma, solo con un detalle más granular en la vista del PDF.

---

## 🎯 Contexto y Motivación

### Situación Actual

En el backend, la preparación del template del PDF hace esta lógica de forma global:

```js
const agruparHonorariosPorTarea = (items) => {
  const agrupado = {};

  items.forEach((item) => {
    const { tareaProfesional, importe, descripcion } = item;
    const key = tareaProfesional;

    if (!agrupado[key]) {
      agrupado[key] = {
        tareaProfesional: tareaProfesional,
        importe: 0,
        descripcion: descripcion || null,
        conteo: 0
      };
    }

    agrupado[key].importe += parseFloat(importe) || 0;
    agrupado[key].conteo += 1;
  });

  return Object.values(agrupado);
};

const honorariosAgrupados = agruparHonorariosPorTarea(detalleHonorarios);
```

Esto se aplica siempre, sin distinguir el tipo de cálculo. El problema aparece cuando un tipo no-PYDOA tiene varios conceptos distintos con la misma `tareaProfesional` pero descripciones diferentes y coeficientes distintos.

### Necesidad del Cliente

El cliente exige mantener el formato específico de PYDOA, pero para el resto de los tipos la vista debe reflejar el detalle completo de los movimientos que integran el honorario, tal como ahora se ve en la pantalla del front end.

El certificado PDF debe reflejar la misma lógica que la vista del wizard, porque el panorama del cálculo debe ser consistente entre la aplicación y el documento exportado.

---

## 🎯 Alcance

### Dentro del Alcance
✅ Ajustar el backend PDF para que el comportamiento de agrupación dependa del tipo de cálculo.  
✅ Para `PYDOA`, mantener el formato actual sin cambios.  
✅ Para tipos no-PYDOA, listar cada concepto individual en el detalle del PDF.  
✅ Para tipos no-PYDOA, usar `descripcion` como valor visible del detalle, sin requerir modificaciones manuales en cada template.  
✅ Mantener calculado el `TOTAL GENERAL` sin alterar la suma total del honorario.  
✅ Mantener el formato de `TOTAL GENERAL` de la plantilla PDF igual al actual.  
✅ Centralizar la transformación en el servicio que hidrata el template, evitando tocar cada HTML individualmente.  
✅ Garantizar que el render HTML del PDF reciba el mismo nivel de detalle que la pantalla del frontend.  
✅ Mantener el contrato del backend intacto para tipos PYDOA y no-PYDOA, solo modificando el nivel de detalle mostrado.  

### Fuera del Alcance
❌ Cambiar la lógica de cálculo del honorario ni la fórmula de precios.  
❌ Modificar las reglas del cálculo PYDOA.  
❌ Cambiar la estructura del modal `DetalleItemsModal` del frontend.  
❌ Reescribir el mecanismo general de exportación PDF.  
❌ Agregar columnas nuevas al PDF si no forman parte del layout actual (el cambio es de contenido y render, no de estructura de datos).  

---

## 🔍 Comportamiento Actual

### Actual en backend

El servicio PDF toma `calculationResult.detalleHonorarios` o `formData.detalleHonorarios`, agrupa por `tareaProfesional` y devuelve un arreglo categorizado como `honorariosObra`, `honorariosAdicionales` y `honorariosEspecialidades`.

```js
const detalleHonorarios = calculationResult?.detalleHonorarios || formData?.detalleHonorarios || [];
const honorariosAgrupados = agruparHonorariosPorTarea(detalleHonorarios);
```

Luego cada item se transforma con:

```js
const item = {
  indice: index + 1,
  tareaProfesional: tarea.tareaProfesional || 'Tarea sin nombre',
  descripcion: tarea.descripcion || '',
  importeARS: formatCurrency(importeARS),
  importeUSD: formatCurrency(importeUSD),
  porcentaje
};
```

Y la categorización usa el nombre de la tarea:

```js
const nombreTarea = (tarea.tareaProfesional || '').toLowerCase();

if (nombreTarea.includes('proyecto de obra') || nombreTarea.includes('dirección de obra')) {
  honorariosObra.push(item);
} else if (nombreTarea.includes('documentación ejecutiva') || nombreTarea.includes('supervisión de obra')) {
  honorariosAdicionales.push(item);
} else {
  honorariosEspecialidades.push(item);
}
```

Esto tiene dos consecuencias:
1. En PYDOA, el comportamiento es el esperado.  
2. En el resto, el PDF pierde el detalle real porque varios conceptos distintos quedan fusionados en una sola fila.

---

## ✅ Comportamiento Esperado

La lógica del backend debe diferenciar el caso según `formData.tipoCalculo` o `datos.tipoCalculo`.

```js
const esPYDOA = String(tipoCalculo || formData?.tipoCalculo || '').toUpperCase() === 'PYDOA';

const honorariosBase = esPYDOA
  ? agruparHonorariosPorTarea(detalleHonorarios)
  : (detalleHonorarios || []);
```

### Para `PYDOA`
- Mantener la agrupación por tarea profesional actual.
- Mantener secciones `obra`, `adicionales` y `especialidades`.
- Mantener subtotales y total general del PDF.

### Para tipos no-PYDOA
- Usar directamente el arreglo crudo de `detalleHonorarios`.
- Renderizar un renglón por cada item del detalle.
- Mostrar la `descripcion` del item como texto principal, no la `tareaProfesional` repetida.
- Mantener el total general igual al valor real de la suma total de los conceptos.

### Ejemplo de expectativa visual

En lugar de:

```text
1  Habilitaciones Art. 10.5                                  $ 2.174.088
   TOTAL GENERAL                                            $ 2.174.088
```

Debe imprimirse algo equivalente a:

```text
1  Honorarios por servicio de H100CEP (coef K 0.18000%)      $ 1.060.531
2  Honorarios por consulta de antecedentes (2.00 hs...)      $ 176.755
3  Honorarios por mediciones y ejecución de planos ...        $ 176.755
4  Honorarios por mediciones y ejecución de planos - Horas adicionales   $ 70.702
5  Honorarios por mediciones y ejecución de planos - Adicional Art.10.3  $ 123.729
...
   TOTAL GENERAL                                             $ 2.174.088
```

Esto refleja exactamente el detalle que hoy ya se visualiza en la pantalla, y la misma estructura debe exportarse en PDF.

---

## 🏗️ Especificación Técnica

### Archivos afectados
- `App/Backend/Node/src/services/pdfService.js`
- Templates Handlebars de certificados PDF bajo `App/Backend/Node/templates/`
- Cualquier template específico de tareas que hoy asuma agrupación por tarea profesional

### Cambio necesario

#### 1. Detección del tipo de cálculo
Se debe determinar si el cálculo es `PYDOA` y, en base a eso, elegir la fuente de filas a Mostrar:

```js
const esPYDOA = String(datos.tipoCalculo || formData?.tipoCalculo || '')
  .toUpperCase() === 'PYDOA';
```

#### 2. Selección del detalle a renderizar
Debe reemplazarse la lógica actual de agrupación incondicional por la siguiente regla:

```js
const detalleBase = esPYDOA
  ? agruparHonorariosPorTarea(detalleHonorarios)
  : (detalleHonorarios || []);
```

#### 3. Normalización del item para PDF
Para cualquier item, el PDF debe disponer de:
- `indice`
- `descripcion` (prioridad)
- `tareaProfesional` (fallback)
- `importeARS`
- `importeUSD` (si el template lo usa)
- `porcentaje` (si aplica)

La clave de la solución propuesta es que el servicio complete el campo que el template ya usa como texto visible, para no tocar cada una de las plantillas manualmente.

```js
const renderItem = (item, index, esDetalleCrudo = false) => {
  const descripcionBase = item.descripcion || item.tareaProfesional || 'Sin descripción';

  return {
    indice: index + 1,
    tareaProfesional: descripcionBase,
    descripcion: descripcionBase,
    importeARS: formatCurrency(Number(item.importe || 0)),
    importeUSD: formatCurrency(Number(item.importe || 0) / (formData.cotizDolar || 1)),
    porcentaje: formData.valorObra > 0
      ? ((Number(item.importe || 0) / formData.valorObra) * 100).toFixed(2)
      : '0.00'
  };
};
```

> Esta transformación permite que el template siga renderizando `this.tareaProfesional`, pero el valor visible sea la descripción del movimiento. De este modo, el template no necesita cambiar su estructura ni su lógica condicional por archivo.

#### 4. Caso no-PYDOA
Para no-PYDOA:
- No agrupar por `tareaProfesional`.
- No crear subtotales por sección.
- Se normaliza cada item para que el campo visual del template represente la `descripcion` real del concepto.
- El valor `tareaProfesional` solo sirve como fallback en caso de que `descripcion` venga nula.

```js
const itemPdf = renderItem(item, index, true);
// La plantilla sigue leyendo this.tareaProfesional, pero ahora ya llega con la descripción correcta.
```

#### 5. Caso PYDOA
Para `PYDOA`:
- Mantener exactamente la lógica vigente de categorización en `obra`, `adicionales` y `especialidades`.
- No entrar en la rama de detalle crudo.
- Mantener impuestos, subtotales y total general del PDF como hoy.

#### 6. Cálculo del total general
La suma total del certificado no debe cambiar:

```js
const totalGeneralARS = redondear(
  subtotalObraARS + subtotalAdicionalesARS + subtotalEspecialidadesARS
);
```

Esto se mantiene igual, sin importar si en la tabla se ve cada concepto individual o uno agrupado.

---

## 📄 Impacto en Templates PDF

### Reglas homologadas con frontend
Lo que cambia en los templates no es el cálculo, sino la forma en que se construye la tabla de detalle.

#### Requerimiento para templates no-PYDOA
- La columna de texto visible debe reflejar `descripcion` del item.
- La estructura visual del template se mantiene, pero el dato que recibe llega ya normalizado.
- Se debe renderizar una fila por cada movimiento del arreglo `detalleHonorarios`.

#### Requerimiento para templates PYDOA
- Mantener la estructura de 3 secciones y subtotales como está hoy.
- No aplicar el nuevo detalle crudo a estos tipos.

### Solución elegida
La corrección no se resuelve editando cada template manualmente. La solución propuesta es centralizar la transformación en el servicio que arma los datos para Handlebars.

Esto es clave para evitar duplicación de lógica y mantener consistencia entre plantillas:
- si el tipo es `PYDOA`, se conserva la lógica actual de agrupación;
- si no lo es, cada item se transforma para que el campo visual `tareaProfesional` contenga la `descripcion` del movimiento.

### Plantillas implicadas
Las plantillas que hoy usan la misma estructura del detalle deben poder seguir intactas, ya que la variación la resuelve el servicio. Entre los templates relevantes están:
- `certificado-habilitaciones.html`
- `certificado-basico-proyecto-direccion.html`
- cualquier plantilla específica que renderice `honorariosEspecialidades` o `honorariosObra` con agrupamiento por tarea profesional

### Regla de riesgo
El comportamiento del template debe estar condicionado a `tipoCalculo` o a una bandera que derive del backend. No se debe usar una regla global de agrupación para todos los tipos. El dato entregado a Handlebars debe estar ya normalizado según el tipo de cálculo.

---

## 🔧 Tickets de Implementación

### Ticket 1: Backend - Normalizar detalle PDF por tipo de cálculo
**Objetivo**: cambiar la preparación del detalle del PDF para que evalúe `PYDOA` antes de agrupar.

**Tareas**:
- Detectar `tipoCalculo` desde `datos` o `formData`.
- Crear `detalleBase` según el tipo.
- Mantener la lógica de subtotalización actual para PYDOA.
- Usar detalle crudo para no-PYDOA.

### Ticket 2: Backend - Normalización de datos para Handlebars
**Objetivo**: centralizar la transformación del detalle para que cada plantilla reciba un contrato estable y no requiera cambios manuales.

**Tareas**:
- Detectar `tipoCalculo` y decidir si corresponde a `PYDOA` o a detalle crudo.
- Normalizar el arreglo de honorarios para no-PYDOA, sobreescribiendo el campo visual usado por el template con la `descripcion` real del concepto.
- Mantener la lógica de subtotal intermedio solo para `PYDOA`.
- Mantener el `TOTAL GENERAL` del documento final.

### Ticket 3: Verificación de entorno y regressión
**Objetivo**: validar que PYDOA no cambia su formato.

**Tareas**:
- Probar generación PDF con un cálculo PYDOA.
- Probar generación PDF con un cálculo no-PYDOA (ej. HABILITACIONES).
- Confirmar que el detalle PDF coincide con la vista del frontend.

---

## ✅ Criterios de Aceptación

### Criterio 1 - PYDOA intacto
Dado un cálculo de tipo `PYDOA`, cuando se genera el PDF, entonces:
- Se mantiene la agrupación por tarea profesional actual.
- Se siguen mostrando las secciones `obra`, `adicionales` y `especialidades`.
- El formato visual no sufre cambios respecto al estado actual.

### Criterio 2 - no-PYDOA desagregado
Dado un cálculo de tipo no-PYDOA, cuando se genera el PDF, entonces:
- Cada concepto del detalle aparece en una fila independiente.
- La fila usa `descripcion` como texto principal.
- Ya no se colapsa el detalle por `tareaProfesional`.

### Criterio 3 - total general consistente
Dado cualquier tipo de cálculo, cuando se genera el PDF, entonces:
- El `TOTAL GENERAL` corresponde a la suma real de los conceptos.
- El total general no se altera por la visualización y no pierde precisión.

### Criterio 4 - salida consistente con frontend
Dado un cálculo con detalle visible en la pantalla del frontend, cuando se exporta a PDF, entonces:
- El detalle del documento refleja el mismo nivel de desagregado que la pantalla.
- El PDF no presenta información resumida cuando el frontend muestra una lista desagregada.

---

## 🧩 Notas de Implementación

- La lógica debe ser defensiva: si `descripcion` viene vacía, usar `tareaProfesional` como fallback.
- El backend no debe asumir que todo cálculo es PYDOA; la lógica de estructuración debe ser explícitamente condicional.
- El comportamiento actual de `PYDOA` es un contrato de negocio y debe mantenerse intacto.
- El ajuste es de presentación del detalle del PDF, no de cálculo de honorarios.

---

## 📌 Resumen de decisión

La regla final a implementar es:

- `PYDOA` = agrupado, con subtotales y 3 secciones.
- `No-PYDOA` = detalle crudo, sin agrupar, mostrando `descripcion` del movimiento y total al final.

Esto alinea la exportación PDF con la lógica ya implementada en el frontend y evita inconsistencia entre la pantalla y el documento final.
