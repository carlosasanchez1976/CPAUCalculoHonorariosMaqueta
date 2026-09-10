# SPEC-033: Detalle de Honorarios sin Agrupar para Tipos de Cálculo No-PYDOA

**Proyecto**: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Módulo**: Wizard - Paso 5 (Resultado del Cálculo)  
**Componente**: `ResultadoBasicoDetalle.jsx`  
**Fecha**: 10/09/2026  
**Última Actualización**: 10/09/2026  
**Autor**: Charly  
**Estado**: 🟡 PENDIENTE  

---

## 📋 Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Contexto y Motivación](#contexto-y-motivación)
3. [Alcance](#alcance)
4. [Comportamiento Actual](#comportamiento-actual)
5. [Comportamiento Esperado](#comportamiento-esperado)
6. [Especificación Técnica](#especificación-técnica)
7. [Layout de Grilla Simplificada (CSS)](#layout-de-grilla-simplificada-css)
8. [Impacto en PDF (Backend)](#impacto-en-pdf-backend)
9. [Tickets de Implementación](#tickets-de-implementación)
10. [Criterios de Aceptación](#criterios-de-aceptación)

---

## 📝 Resumen Ejecutivo

El componente `ResultadoBasicoDetalle.jsx` (Paso 5 del wizard, resultado del cálculo) agrupa hoy el detalle de honorarios por `tareaProfesional` antes de mostrarlo, colapsando en una sola fila todos los ítems que comparten la misma tarea profesional. Para el tipo de cálculo **PYDOA** (Proyecto y Dirección de Obra) esto es correcto y deseado: el cliente exigió específicamente 3 secciones (Obra / Adicionales / Especialidades) con subtotales propios.

Para **cualquier otro tipo de cálculo** (HABI, ARBI, CONSULT, GYPC, PERI, HYS, MEDPLAN, DISPAI, CONFAC, TASA, etc.), esa agrupación **oculta información**: varios ítems con importes y fórmulas distintas (ej. 10 líneas de "Habilitaciones Art. 10.5" con distintos coeficientes) terminan mostrándose como un único renglón sumarizado, y el usuario solo puede ver el detalle real haciendo doble click sobre `TOTAL GENERAL`.

**Objetivo**: para tipos de cálculo distintos de PYDOA, mostrar en pantalla (y en el PDF) **todos los ítems tal cual vienen en `formData.detalleHonorarios`**, sin agrupar por tarea profesional y sin subtotales intermedios, dejando únicamente el renglón de `TOTAL GENERAL` al final. Como varios ítems comparten la misma `tareaProfesional`, la columna que hoy muestra ese campo debe pasar a mostrar `item.descripcion` (el mismo campo que ya se ve en `DetalleItemsModal`) para que cada fila sea distinguible. El comportamiento de PYDOA no se modifica.

---

## 🎯 Contexto y Motivación

### Situación Actual
- `agruparHonorariosPorTarea()` se ejecuta **siempre**, sin importar el tipo de cálculo, y combina todos los ítems que comparten `tareaProfesional` en un solo registro (sumando importes).
- Para PYDOA esto no genera pérdida de información porque cada tarea profesional es única dentro del cálculo (Proyecto de obra, Dirección de obra, Instalación sanitaria, Instalación eléctrica, Estructuras, Documentación ejecutiva).
- Para el resto de los tipos, es común que **varios ítems compartan la misma tarea profesional** con descripciones/coeficientes distintos (ver ejemplo Habilitaciones: 10 ítems bajo "Habilitaciones Art. 10.5" agrupados en 1 sola fila de $2.174.088).
- El detalle real solo es visible haciendo doble click en `TOTAL GENERAL`, que abre `DetalleItemsModal` con la lista completa sin agrupar.

### Necesidad del Cliente
- Para PYDOA: mantener el comportamiento actual sin cambios (3 secciones + subtotales), por ser un cálculo complejo donde esa estructura fue expresamente solicitada.
- Para el resto de los tipos: mostrar el detalle **completo y desagregado** directamente en la página de resultado (no solo en el modal), sin subtotales por sección, terminando únicamente con el `TOTAL GENERAL`.

---

## 🎯 Alcance

### Dentro del Alcance
✅ Modificar `ResultadoBasicoDetalle.jsx` para que la agrupación por tarea profesional (`agruparHonorariosPorTarea`) se aplique **solo cuando `formData.tipoCalculo === 'PYDOA'`**.  
✅ Para tipos no-PYDOA, categorizar y renderizar los ítems **crudos** de `formData.detalleHonorarios` (uno por fila, con su propio índice secuencial).  
✅ Para tipos no-PYDOA, la columna "Tarea Profesional" debe mostrar `item.descripcion` en lugar de `item.tareaProfesional` (que se repite entre ítems de la misma tarea), evitando así filas idénticas.  
✅ Aplicar el mismo criterio en la columna derecha desktop (`rightColumn`) y en la versión mobile (`rightColumnMobile`).  
✅ Mantener sin cambios el subtotal por sección y las 3 secciones (obra/adicionales/especialidades) para PYDOA.  
✅ Mantener el `TOTAL GENERAL` con el mismo valor que hoy (la suma total no cambia, solo cambia el nivel de detalle mostrado arriba).  
✅ Mantener el modal `DetalleItemsModal` (doble click en `TOTAL GENERAL`) disponible para todos los tipos de cálculo, sin cambios.  
✅ Coordinar con backend el ajuste equivalente en la generación del PDF (`/api/calculos/exportar-pdf`).  
✅ Para no-PYDOA, rediseñar visualmente la grilla de "Detalle de honorarios" (y la fila `TOTAL GENERAL`) para que la columna "Tarea Profesional" ocupe el espacio de 2 columnas y "Importe ARS" se desplace a la posición de la quinta columna, aprovechando el espacio libre que dejan las columnas "Importe USD" y "% sobre costo" (no utilizadas fuera de PYDOA).  
✅ Implementar este nuevo layout mediante una clase CSS modificadora nueva y aditiva, sin modificar ninguna regla CSS existente que utiliza PYDOA.  

### Fuera del Alcance
❌ Agregar una columna nueva al DOM de la tabla (se mantienen 3 celdas reales por fila para no-PYDOA, igual que hoy cuando USD/% están ocultas; el cambio es de `colSpan` y ancho, no de cantidad de celdas).  
❌ Cambiar el comportamiento del modal de detalle (`DetalleItemsModal`).  
❌ Cambiar la lógica de cálculo de honorarios en el backend.  
❌ Cambiar el criterio de secciones, anchos o columnas para PYDOA (permanece 100% igual, incluyendo Importe USD y % sobre costo cuando corresponda).  

---

## 🔍 Comportamiento Actual

```jsx
const honorariosAgrupados = agruparHonorariosPorTarea(formData.detalleHonorarios);
const { obra, adicionales, especialidades } = categorizarHonorarios(honorariosAgrupados);
```

- `honorariosAgrupados` siempre colapsa ítems con igual `tareaProfesional`, para **cualquier** tipo de cálculo.
- `categorizarHonorarios` clasifica esos registros ya agrupados en `obra` / `adicionales` / `especialidades` según el nombre de la tarea.
- Para tipos no-PYDOA, `obra` y `adicionales` quedan vacíos (los nombres de tarea no matchean los patrones "proyecto de obra"/"dirección de obra"/"documentación ejecutiva"/"supervisión de obra"), y todo cae en `especialidades`, pero **ya agrupado** → se pierde el detalle por ítem.

---

## ✅ Comportamiento Esperado

```jsx
const esPYDOA = formData.tipoCalculo === 'PYDOA';

const honorariosBase = esPYDOA
  ? agruparHonorariosPorTarea(formData.detalleHonorarios)
  : (formData.detalleHonorarios || []);

const { obra, adicionales, especialidades } = categorizarHonorarios(honorariosBase);
```

- **PYDOA**: sin cambios. `honorariosBase` es el resultado agrupado, y se renderizan las 3 secciones con subtotales como hasta ahora.
- **No-PYDOA**: `honorariosBase` es el arreglo crudo de `formData.detalleHonorarios`. Como los nombres de tarea de estos tipos no matchean los patrones de "obra"/"adicionales", todos los ítems seguirán cayendo en `especialidades`, pero **ítem por ítem**, sin colapsar.
  - La sección "especialidades" ya oculta su subtotal cuando `tipoCalculo !== 'PYDOA'` (código existente: `{formData.tipoCalculo === 'PYDOA' && (...)}`), por lo que no requiere cambios adicionales para cumplir "sin subtotalizar".
  - `TOTAL GENERAL` sigue calculándose igual (`subtotalObra + subtotalAdicionales + subtotalEspecialidades`); su valor numérico no cambia porque agrupar o no agrupar no altera la suma total, solo la cantidad de filas mostradas.

### Resultado visual esperado (ejemplo Habilitaciones)
En vez de:
```
1  Habilitaciones Art. 10.5                                              $2.174.088
   TOTAL GENERAL                                                         $2.174.088
```
Se debe ver (columna "Tarea Profesional" mostrando `item.descripcion`):
```
1  Honorarios por servicio de H100CEP (coef K 0.18000%)                  $1.060.531
2  Honorarios por consulta de antecedentes (2.00 hs a Art. 1.13)...      $  176.755
3  Honorarios por mediciones y ejecución de planos (6.00 hs...)          $  176.755
4  Honorarios por mediciones y ejecución de planos - Horas adicionales   $   35.351
5  Honorarios por mediciones y ejecución de planos - Adicional Art.10.3  $  106.053
6  Honorarios por asesoramiento de diseño local (7.00 hs...)             $  176.755
...
   TOTAL GENERAL                                                         $2.174.088
```
(igual al detalle que hoy solo se ve en el modal de doble click, campo `descripcion`).

---

## 🏗️ Especificación Técnica

### Archivo afectado
- [ResultadoBasicoDetalle.jsx](../../App/Frontend/src/components/wizard/ResultadoBasicoDetalle.jsx)

### Cambios puntuales
1. Reemplazar la línea de agrupación incondicional por el condicional `esPYDOA` descrito arriba (una sola definición, reutilizada tanto por el bloque desktop como por el mobile, ya que ambos consumen las mismas variables `obra`/`adicionales`/`especialidades`/`totalGeneral`).
2. En las filas de la sección "especialidades" (única sección que renderiza para no-PYDOA), cambiar la celda que hoy imprime `item.tareaProfesional` por un valor condicional:
   ```jsx
   {esPYDOA ? item.tareaProfesional : (item.descripcion || item.tareaProfesional)}
   ```
   El fallback a `item.tareaProfesional` cubre el caso borde de que `descripcion` venga vacía/nula desde la API.
3. No se requieren cambios en:
   - `categorizarHonorarios` (ya funciona sobre arrays de `{ tareaProfesional, importe }`, y como hace `{ ...item }` al construir cada registro, `descripcion` viaja intacta sin cambios adicionales).
   - El render condicional de subtotal de "especialidades" (ya gateado a PYDOA).
   - El render de `TOTAL GENERAL` y `DetalleItemsModal`.
4. Verificar que `formData.detalleHonorarios` para tipos no-PYDOA tenga `importe` numérico por ítem (no acumulado) y `descripcion` poblado — validar contra la respuesta real de la API antes de dar por cerrado el ticket.

### Riesgo / Puntos de atención
- Si algún tipo no-PYDOA tuviera nombres de tarea que casualmente matcheen los patrones de "obra"/"adicionales" (poco probable, pero a validar), esos ítems se moverían a esas secciones. Se recomienda revisar los nombres de `tareaProfesional` reales de HABI/ARBI/CONSULT/GYPC/PERI/HYS/MEDPLAN/DISPAI/CONFAC/TASA para descartar falsos positivos.
- Las `key` de React en las filas (`obra-${item.indice}`, `esp-${item.indice}`) deben seguir siendo únicas: al no agrupar, el índice ahora corresponde a la posición del ítem crudo, lo cual es consistente con lo que ya hace `categorizarHonorarios` (asigna `indice: index + 1` sobre el array recibido).

---

## 🎨 Layout de Grilla Simplificada (CSS)

### Objetivo
Para no-PYDOA, las columnas "Importe USD" y "% sobre costo" no se usan (los flags `mostrarColumnaImporteUSD` / `mostrarColumnaPorcentaje` ya las ocultan hoy). Ese espacio queda libre y sin aprovechar justo cuando la columna "Tarea Profesional" empieza a mostrar `descripcion` (textos más largos, ver sección anterior). Se propone fusionar visualmente el layout de 5 columnas en 3, sin tocar el layout de PYDOA.

### Por qué requiere cuidado
El `.table` usa `table-layout: fixed` con anchos definidos por posición (`nth-child`) del `<td>`/`<th>` en el DOM:
- `td:first-child` → 50px (Ítem)
- `td:nth-child(2)` → 34% (Tarea Profesional)
- `td:nth-child(3)` → 22.5% (Importe ARS)

La fila `TOTAL GENERAL` (bloque `.resultsSection.resultFinal`) reutiliza las mismas reglas con un override puntual sobre el 2° `<td>` real (por el `colSpan={2}` que ya tiene el label). Cualquier cambio en estas reglas base afectaría también a PYDOA. Por eso el layout simplificado se implementa como **una clase modificadora adicional**, nunca modificando las reglas existentes.

### Diseño propuesto
Para no-PYDOA, la cabecera y las filas de la sección "especialidades" siguen teniendo las mismas **3 celdas reales** que hoy (Ítem, Tarea Profesional, Importe ARS — USD y % ya no se renderizan), solo se les agrega `colSpan`:

```jsx
// Header (dentro del if que ya existe: (obra.length + adicionales.length) === 0)
<th className={styles.centered}>Ítem</th>
<th colSpan={!esPYDOA ? 2 : undefined}>Tarea Profesional</th>
<th colSpan={!esPYDOA ? 2 : undefined} className={styles.rightAlign}>Importe ARS</th>
{esPYDOA && formData.mostrarColumnaImporteUSD && <th className={styles.rightAlign}>Importe USD</th>}
{esPYDOA && formData.mostrarColumnaPorcentaje && <th className={styles.centered}>% sobre costo</th>}
```

```jsx
// Body (especialidades.map)
<td className={styles.centered}>{item.indice}</td>
<td colSpan={!esPYDOA ? 2 : undefined}>
  {esPYDOA ? item.tareaProfesional : (item.descripcion || item.tareaProfesional)}
</td>
<td colSpan={!esPYDOA ? 2 : undefined} className={styles.rightAlign}>{formatCurrencyARS(item.importe)}</td>
{esPYDOA && formData.mostrarColumnaImporteUSD && (
  <td className={styles.rightAlign}>{/* ...importe USD... */}</td>
)}
{esPYDOA && (
  <td className={styles.centered}>{/* ...% sobre costo... */}</td>
)}
```

> Nota: hoy la celda de "% sobre costo" se renderiza siempre en el body (vacía si el flag es `false`). Se agrega el guard `esPYDOA &&` para eliminarla del DOM en no-PYDOA y no depender solo del flag.

La fila `TOTAL GENERAL` (compartida por ambos casos) ajusta sus `colSpan` de forma análoga:

```jsx
<td colSpan={esPYDOA ? 2 : 3}><strong>TOTAL GENERAL</strong></td>
<td colSpan={esPYDOA ? 1 : 2} className={styles.rightAlign}><strong>{formatCurrencyARS(totalGeneral.totalARS)}</strong></td>
{esPYDOA && formData.mostrarColumnaImporteUSD && <td className={styles.rightAlign}>{/* ...USD... */}</td>}
{esPYDOA && <td className={styles.centered}>{/* ...%... */}</td>}
```

### Clase CSS modificadora (aditiva, no invasiva)
Se agrega una clase nueva al `<table>` (ej. `styles.tableSimplificada`) **solo cuando `!esPYDOA`**, con anchos propios para las 2 celdas reales que ahora abarcan 2 columnas cada una. Esta clase no reemplaza ninguna regla existente, solo agrega selectores más específicos:

```css
/* Nueva - no reemplaza .table td:nth-child(2)/(3) usadas por PYDOA */
.table.tableSimplificada td:nth-child(2),
.table.tableSimplificada th:nth-child(2) {
  width: 65%; /* Tarea Profesional / Descripción: ocupa el lugar de 2 columnas */
}

.table.tableSimplificada td:nth-child(3),
.table.tableSimplificada th:nth-child(3) {
  width: auto; /* Importe ARS: ocupa el espacio libre de USD + % */
}
```

Mismo criterio para la fila `TOTAL GENERAL`, agregando la clase al `<table>` de `.resultFinal` cuando `!esPYDOA` (los selectores con clase + `nth-child` tienen mayor especificidad que la regla base y no afectan a PYDOA, que no lleva la clase).

### Riesgo / Puntos de atención
- `table-layout: fixed` combinado con `colSpan` puede comportarse distinto entre navegadores si el ancho no se declara explícitamente en la celda que abarca columnas; por eso se fija `width` explícito en la clase modificadora en vez de confiar en el reparto automático.
- Validar visualmente (no solo por CSS) en al menos Chrome y Firefox antes de dar por cerrado el ticket, dado que `table-layout: fixed` + `colspan` es un combo sensible.
- El `<colgroup>` de 5 `<col>` en el bloque `TOTAL GENERAL` se mantiene sin cambios; solo se ajustan los `colSpan` de las celdas reales.

---

## 📄 Impacto en PDF (Backend)

El botón "Descargar PDF" invoca `descargarCertificadoPDF()` ([pdfService.js](../../App/Frontend/src/services/pdfService.js)), que llama al endpoint backend `POST /api/calculos/exportar-pdf`. La generación del PDF es responsabilidad del backend y hoy replica la misma lógica de agrupación por tarea profesional.

**Acción requerida**: coordinar con el equipo de backend para aplicar el mismo criterio — el PDF exportado para tipos no-PYDOA debe listar los ítems sin agrupar (igual que la pantalla), manteniendo el formato actual para PYDOA. Este ajuste queda fuera del repositorio frontend y debe trackearse como dependencia externa.

---

## 🎫 Tickets de Implementación

| # | Ticket | Descripción | Estado |
|---|--------|--------------|--------|
| 1 | Condicional de agrupación | Aplicar `agruparHonorariosPorTarea` solo si `tipoCalculo === 'PYDOA'` en `ResultadoBasicoDetalle.jsx` | ✅ Completado |
| 2 | Validación de datos | Confirmar que `formData.detalleHonorarios` trae `importe` por ítem (no acumulado) y `descripcion` poblado para todos los tipos no-PYDOA | ✅ Completado |
| 3 | Revisión de falsos positivos | Verificar nombres de `tareaProfesional` de todos los tipos no-PYDOA contra los patrones de `categorizarHonorarios` | ⬜ Pendiente |
| 3b | Columna "Tarea Profesional" → `descripcion` | Reemplazar el valor mostrado en esa columna por `item.descripcion` (con fallback a `tareaProfesional`) para filas no-PYDOA | ✅ Completado |
| 4 | Prueba visual desktop + mobile | Validar render en `rightColumn` y `rightColumnMobile` para al menos 2 tipos no-PYDOA (ej. HABI, ARBI) | 🟡 Parcial (desktop OK, mobile bloqueado por bug documentado) |
| 5 | Coordinación backend PDF | Comunicar el requerimiento al equipo backend para replicar el criterio en `/api/calculos/exportar-pdf` | ⬜ Pendiente |
| 6 | Clase CSS modificadora | Crear clase `tableSimplificada` (o equivalente) en `ResultadoBasicoDetalle.module.css` con anchos para `nth-child(2)`/`(3)`, sin tocar reglas existentes | ✅ Completado |
| 7 | ColSpan en tabla de detalle | Agregar `colSpan={2}` condicional (`!esPYDOA`) a las celdas de Tarea/Descripción e Importe ARS, en header y body | ✅ Completado |
| 8 | Eliminar celdas USD/% en no-PYDOA | Envolver con `esPYDOA &&` las celdas de Importe USD y % sobre costo (hoy la de % se renderiza vacía siempre) para sacarlas del DOM | ✅ Completado |
| 9 | ColSpan en fila TOTAL GENERAL | Ajustar `colSpan` de label (3) e Importe ARS (2) cuando `!esPYDOA`, ocultando también USD/% en esa fila | ✅ Completado |
| 10 | QA cross-browser del layout | Validar visualmente en Chrome/Firefox, desktop y mobile, que PYDOA no sufrió ningún cambio y que no-PYDOA muestra el layout de 3 columnas correctamente alineado | 🟡 Parcial (desktop confirmado por Charly) |

---

## ✅ Criterios de Aceptación

1. Para `tipoCalculo === 'PYDOA'`, la pantalla de resultado se ve exactamente igual que antes de este cambio (3 secciones, subtotales, total general).
2. Para cualquier otro `tipoCalculo`, la tabla de detalle muestra **todos los ítems de `formData.detalleHonorarios`** sin agrupar por tarea profesional, cada uno en su propia fila, sin ningún subtotal intermedio.
3. Para tipos no-PYDOA, el único total visible al pie de la tabla es `TOTAL GENERAL`, con el mismo valor numérico que se mostraba antes del cambio (la suma no varía).
4. El modal `DetalleItemsModal` (doble click en `TOTAL GENERAL`) sigue funcionando igual para todos los tipos de cálculo.
5. El comportamiento se replica igual en la vista desktop y en la vista mobile.
6. No se agregan columnas nuevas (se mantienen Ítem / Tarea Profesional / Importe ARS / Importe USD / % sobre costo, según los flags `mostrarColumnaImporteUSD` / `mostrarColumnaPorcentaje`).
7. Para tipos no-PYDOA, la columna "Tarea Profesional" muestra `item.descripcion` (no `item.tareaProfesional`), de modo que filas de una misma tarea sean distinguibles entre sí.
8. Backend notificado del requerimiento equivalente para el PDF exportado.
9. Para tipos no-PYDOA, la columna "Tarea Profesional"/Descripción ocupa visualmente el espacio de 2 columnas, e "Importe ARS" se desplaza a la posición de la quinta columna, sin reservar espacio para Importe USD ni % sobre costo.
10. El mismo ajuste de ancho/posición se aplica a la fila `TOTAL GENERAL` para no-PYDOA.
11. El layout de PYDOA (5 columnas, anchos y posiciones actuales) permanece exactamente igual, sin ningún cambio visual ni de CSS.
12. No se rompe la responsividad existente (scroll horizontal en `tableContainer`, comportamiento mobile) para ningún tipo de cálculo.
