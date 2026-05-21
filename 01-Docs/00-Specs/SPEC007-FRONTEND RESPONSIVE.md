# SPEC-FRONTEND-004: Responsive Design para Escalas de Windows

**Fecha:** 21/05/2026  
**Versión:** 1.0  
**Estado:** 📋 EN ANÁLISIS  
**Autor:** Charly - Equipo Full Stack  
**Stack:** React 18 + Vite + CSS Modules  
**Pages afectadas:** DashboardPage, NuevoCalculoPage, ProcesoCalculoPage, ResultadoBasicoDetalle

---

## 📊 PROGRESO DE TICKETS

| Ticket | Descripción | Estado |
|--------|-------------|--------|
| #001 | Revertir cambios globales de variables.css (rollback parcial) | ⏳ PENDIENTE |
| #002 | Implementar media queries por escala en variables.css | ⏳ PENDIENTE |
| #003 | Corregir grid responsive en NuevoCalculoPage | ⏳ PENDIENTE |
| #004 | Verificar alineación en DashboardPage | ⏳ PENDIENTE |
| #005 | Verificar márgenes en ProcesoCalculoPage | ⏳ PENDIENTE |
| #006 | Verificar ResultadoBasicoDetalle en escalas 125%/150% | ⏳ PENDIENTE |
| #007 | Testing manual en 3 escalas (100%, 125%, 150%) | ⏳ PENDIENTE |
| #008 | Documentar convenciones responsive en README | ⏳ PENDIENTE |

---

## 📋 ÍNDICE

1. [Contexto y Problema](#1-contexto-y-problema)
2. [Análisis Técnico](#2-análisis-técnico)
3. [Solución Propuesta](#3-solución-propuesta)
4. [Arquitectura CSS](#4-arquitectura-css)
5. [Plan de Implementación (Tickets)](#5-plan-de-implementación-tickets)
6. [Casos de Prueba](#6-casos-de-prueba)
7. [Criterios de Aceptación](#7-criterios-de-aceptación)
8. [Convenciones Frontend](#8-convenciones-frontend)
9. [Riesgos y Mitigación](#9-riesgos-y-mitigación)

---

## 1. CONTEXTO Y PROBLEMA

### 1.1 Antecedentes

La aplicación CH2026 fue diseñada y validada por el cliente en **resolución 1920×1080 con escala Windows al 100%**, alcanzando el diseño aprobado. Sin embargo, en QA se detectaron problemas visuales graves al cambiar la escala de Windows a 125% o 150%, configuraciones cada vez más comunes en monitores modernos y laptops.

### 1.2 Problema Detectado por el Cliente

**Página afectada inicialmente:** `NuevoCalculoPage`

```
🐛 Síntoma en escala 125%:
├─ Botones desbordan el margen
├─ Cards se ven exageradamente grandes
├─ Algunos elementos salen de la pantalla
└─ Imposible ver el diseño completo sin scroll horizontal
```

### 1.3 Problema Generado por Intento de Solución

Al aplicar un cambio global en `variables.css`:
```css
/* Cambio aplicado (incorrecto) */
--layout-padding-x: clamp(16px, 2vw, 150px);
```

Se introdujeron nuevos problemas:
```
🐛 Efectos colaterales:
├─ DashboardPage: márgenes desaparecieron (~38px en 100%)
├─ Elementos internos no se alinean con header/footer
├─ NuevoCalculoPage: cards no respetan márgenes laterales
└─ Diseño global del cliente se desconfiguró en escala 100%
```

### 1.4 Objetivo

Implementar una solución responsive que:

1. ✅ **Preserve el diseño del cliente** en escala 100% (márgenes ~150px)
2. ✅ **Mantenga márgenes visibles** en todas las escalas (100%, 125%, 150%)
3. ✅ **Evite overflow horizontal** en cualquier escala
4. ✅ **No requiera refactor masivo** de componentes existentes
5. ✅ **Sea predecible y testeable** (3 estados discretos vs valores continuos)

### 1.5 Restricciones del Cliente

- 🎯 **Mandatorio:** Siempre debe haber márgenes laterales visibles (sensación visual de amplitud)
- 🎯 **Negociable:** El valor exacto de 150px puede reducirse en escalas altas
- 🎯 **No negociable:** El diseño en escala 100% debe quedar idéntico al actual aprobado

---

## 2. ANÁLISIS TÉCNICO

### 2.1 ¿Qué es la Escala de Windows?

La escala de Windows (DPI Scaling) es un ajuste del sistema operativo que multiplica el tamaño visual de todos los elementos. **No es zoom del navegador**, sino una configuración del sistema.

**Matemática del viewport efectivo:**

| Escala Windows | Resolución física | Viewport CSS efectivo |
|----------------|-------------------|----------------------|
| 100% | 1920×1080 | 1920px |
| 125% | 1920×1080 | **1536px** (1920 / 1.25) |
| 150% | 1920×1080 | **1280px** (1920 / 1.5) |
| 175% | 1920×1080 | **1097px** (1920 / 1.75) |

### 2.2 Causa Raíz del Problema

**Variables y valores con píxeles fijos:**

```css
/* variables.css (original) */
--layout-padding-x: 150px;  /* ← Fijo, no escala con viewport */

/* NuevoCalculoPage.module.css */
.cardsGrid {
  grid-template-columns: repeat(4, 1fr);  /* ← 4 columnas obligatorias */
}
```

**Cálculo del problema en escala 125%:**
```
Viewport disponible: 1536px
Márgenes laterales:  150px × 2 = 300px
Espacio contenido:   1236px
Gap entre cards:     24px × 3 = 72px
Ancho por card:      (1236 - 72) / 4 = 291px

Pero las cards tienen contenido interno (íconos, textos, badges)
que requieren un mínimo de ~310px para no desbordar.
```

### 2.3 ¿Por Qué Falló el Primer Intento?

El cambio global `clamp(16px, 2vw, 150px)` afectó **todas las páginas** por igual, sin distinguir cuáles tenían el problema real. Esto causó:

- **Sobrecorrección:** En escala 100%, márgenes se redujeron de 150px a ~38px
- **Pérdida de diseño aprobado:** El cliente ya tenía validado el diseño con márgenes amplios
- **Desalineación:** Elementos internos se alinean según diseño pero los contenedores cambiaron

### 2.4 Patrón Correcto: Detección por Escala

Los navegadores exponen la escala de Windows mediante:

```css
@media (min-resolution: 1.25dppx) {
  /* Aplica solo en escala 125% o superior */
}

@media (min-resolution: 1.5dppx) {
  /* Aplica solo en escala 150% o superior */
}
```

Donde `dppx` = "dots per pixel" (1.25dppx = escala 125%).

**Compatibilidad:** Chrome, Edge, Firefox, Safari modernos (>95% de usuarios).

---

## 3. SOLUCIÓN PROPUESTA

### 3.1 Estrategia: Opción B - Márgenes Adaptativos por Escala

Implementación **discreta** (por escalones), no continua (clamp), porque:

| Aspecto | Discreta (Media Queries) | Continua (clamp) |
|---------|--------------------------|------------------|
| **Predictibilidad** | ✅ 3 valores conocidos | ❌ Valores variables |
| **Testing** | ✅ Solo 3 casos | ❌ Muchos casos |
| **Ajustes finos** | ✅ Cambiar 1 valor | ❌ Ajustar curva |
| **QA** | ✅ Fácil documentar | ❌ Difícil verificar |

### 3.2 Valores Propuestos

```css
/* variables.css */

:root {
  --layout-padding-x: 150px;  /* Escala 100% - Diseño aprobado del cliente */
}

@media (min-resolution: 1.25dppx) {
  :root {
    --layout-padding-x: 100px;  /* Escala 125% - Reducción del 33% */
  }
}

@media (min-resolution: 1.5dppx) {
  :root {
    --layout-padding-x: 70px;   /* Escala 150% - Reducción del 53% */
  }
}
```

### 3.3 Comportamiento Esperado

| Escala | Viewport | Margen | % Viewport | Contenido | Diagnóstico |
|--------|----------|--------|------------|-----------|-------------|
| **100%** | 1920px | 150px | 7.8% | 1620px | 🟢 Diseño original |
| **125%** | 1536px | 100px | 6.5% | 1336px | 🟢 Amplio visible |
| **150%** | 1280px | 70px | 5.5% | 1140px | 🟢 Visible ajustado |

### 3.4 Correcciones Adicionales por Página

#### A. NuevoCalculoPage - Grid Responsive

```css
/* ANTES */
.cardsGrid {
  grid-template-columns: repeat(4, 1fr);
}

/* DESPUÉS */
.cardsGrid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  /* minmax(0, 1fr) permite que las columnas se reduzcan sin desbordar */
}

@media (min-resolution: 1.25dppx) {
  .cardsGrid {
    gap: 20px;  /* Reduce gap para más espacio interno */
  }
}
```

#### B. DashboardPage - Card con Ancho Limitado

```css
/* ANTES */
.cardSection > * {
  width: 430px;
  max-width: 430px;
}

/* DESPUÉS */
.cardSection > * {
  width: min(430px, 100%);  /* Previene overflow */
  max-width: 430px;
}
```

#### C. ProcesoCalculoPage - Sin Cambios Necesarios

Esta página usa `--layout-padding-x` y se beneficia automáticamente.

---

## 4. ARQUITECTURA CSS

### 4.1 Capas de Responsive

```
┌─────────────────────────────────────────┐
│  CAPA 1: Variables Globales (base)     │
│  --layout-padding-x: 150px              │
├─────────────────────────────────────────┤
│  CAPA 2: Escalas de Windows             │
│  @media (min-resolution: 1.25dppx)      │
│  @media (min-resolution: 1.5dppx)       │
├─────────────────────────────────────────┤
│  CAPA 3: Breakpoints de Dispositivo     │
│  @media (max-width: 1024px) - Tablet    │
│  @media (max-width: 768px)  - Mobile    │
└─────────────────────────────────────────┘
```

### 4.2 Prioridad de Reglas (cascada)

1. **Base:** 150px (desktop 100%)
2. **Si escala 125%+ en desktop:** 100px
3. **Si escala 150%+ en desktop:** 70px
4. **Si tablet (max-width: 1024px):** valores específicos
5. **Si mobile (max-width: 768px):** 16px

### 4.3 Variables que SÍ deben ser escalables

Estas deben permanecer con `clamp()` para escalar con viewport:

```css
--font-size-sm:   clamp(0.75rem, 0.8vw + 0.5rem, 0.875rem);
--font-size-base: clamp(0.875rem, 0.9vw + 0.6rem, 1rem);
--font-size-lg:   clamp(1rem, 1vw + 0.65rem, 1.125rem);
--font-size-xl:   clamp(1.25rem, 1.2vw + 0.8rem, 1.5rem);
--font-size-2xl:  clamp(1.5rem, 1.5vw + 1rem, 2rem);

--spacing-1: clamp(6px, 0.5vw, 8px);
--spacing-2: clamp(12px, 1vw, 16px);
--spacing-3: clamp(18px, 1.5vw, 24px);
--spacing-4: clamp(24px, 2vw, 32px);
--spacing-5: clamp(32px, 2.5vw, 40px);
```

### 4.4 Variables que NO deben ser escalables

```css
--layout-padding-x: 150px;  /* Discreta por escala (media queries) */
--radius-sm: 4px;            /* Bordes: siempre fijos */
--radius-md: 8px;
--radius-lg: 12px;
```

---

## 5. PLAN DE IMPLEMENTACIÓN (TICKETS)

### TICKET #001 - Revertir cambios globales en variables.css

**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 15 min

**Tareas:**
1. Revertir `--layout-padding-x` a valor fijo `150px`
2. Mantener variables de `--font-size-*` con `clamp()` (esto sí ayuda)
3. Mantener variables de `--spacing-*` con `clamp()` (esto sí ayuda)

**Archivos afectados:**
- `App/Frontend/src/styles/variables.css`

**Criterio de aceptación:**
- ✅ Escala 100% recupera el diseño original aprobado del cliente
- ✅ Márgenes laterales visibles ~150px en DashboardPage y NuevoCalculoPage

---

### TICKET #002 - Implementar media queries por escala

**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 30 min  
**Dependencias:** Ticket #001

**Tareas:**
1. Agregar bloque de media queries para escala 125% y 150% en variables.css
2. Definir valores: 150px → 100px → 70px
3. Documentar con comentarios el propósito de cada breakpoint

**Archivos afectados:**
- `App/Frontend/src/styles/variables.css`

**Código a agregar:**
```css
/* Escala de Windows 125% */
@media (min-resolution: 1.25dppx) {
  :root {
    --layout-padding-x: 100px;
  }
}

/* Escala de Windows 150% */
@media (min-resolution: 1.5dppx) {
  :root {
    --layout-padding-x: 70px;
  }
}
```

**Criterio de aceptación:**
- ✅ Cambiar escala de Windows actualiza márgenes automáticamente
- ✅ Sin necesidad de recargar la página, los márgenes se ajustan

---

### TICKET #003 - Corregir grid responsive en NuevoCalculoPage

**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 45 min  
**Dependencias:** Ticket #002

**Tareas:**
1. Cambiar `repeat(4, 1fr)` → `repeat(4, minmax(0, 1fr))` para prevenir overflow
2. Reducir gap en escala 125%+ vía media query
3. Verificar que cards mantienen alineación con márgenes
4. Probar con 8 cards (visible scroll vertical)

**Archivos afectados:**
- `App/Frontend/src/pages/NuevoCalculoPage.module.css`

**Criterio de aceptación:**
- ✅ Escala 100%: Cards alineadas con header, sin overflow
- ✅ Escala 125%: Cards visibles completas, sin desborde
- ✅ Escala 150%: Cards se mantienen en 4 columnas (o 2 si es necesario)

---

### TICKET #004 - Verificar alineación en DashboardPage

**Prioridad:** 🟡 MEDIA  
**Tiempo estimado:** 30 min  
**Dependencias:** Ticket #002

**Tareas:**
1. Verificar que `cardSection > *` no genere overflow
2. Aplicar `width: min(430px, 100%)` para card de bienvenida
3. Validar alineación de texto de bienvenida con márgenes
4. Comparar lado a lado con diseño original del cliente

**Archivos afectados:**
- `App/Frontend/src/pages/DashboardPage.module.css`

**Criterio de aceptación:**
- ✅ Escala 100%: Layout idéntico al diseño original
- ✅ Escala 125%: Texto y card mantienen proporciones
- ✅ Sin overflow horizontal en ninguna escala

---

### TICKET #005 - Verificar márgenes en ProcesoCalculoPage

**Prioridad:** 🟡 MEDIA  
**Tiempo estimado:** 30 min  
**Dependencias:** Ticket #002

**Tareas:**
1. Verificar que `formContainer` respeta márgenes
2. Validar wizard steps (StepperProgress) en todas las escalas
3. Confirmar que `reviewItem` no se desborda
4. Probar todos los steps (0 al 5)

**Archivos afectados:**
- `App/Frontend/src/pages/ProcesoCalculoPage.module.css`

**Criterio de aceptación:**
- ✅ Wizard navegable en escala 100%, 125% y 150%
- ✅ Campos de formulario alineados correctamente
- ✅ Sin scroll horizontal en ninguna pantalla

---

### TICKET #006 - Verificar ResultadoBasicoDetalle

**Prioridad:** 🟡 MEDIA  
**Tiempo estimado:** 30 min  
**Dependencias:** Ticket #002

**Tareas:**
1. Verificar header del certificado en 3 escalas
2. Validar tabla de honorarios sin desborde
3. Confirmar layout de 2 columnas (resumen + disclaimer)
4. Probar generación de PDF (debe verse igual)

**Archivos afectados:**
- `App/Frontend/src/components/wizard/ResultadoBasicoDetalle.module.css`

**Criterio de aceptación:**
- ✅ Certificado se ve idéntico en pantalla y PDF
- ✅ Tabla de honorarios legible en todas las escalas
- ✅ Sin overflow horizontal

---

### TICKET #007 - Testing manual en 3 escalas

**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 90 min  
**Dependencias:** Tickets #001 a #006

**Tareas:**
1. Configurar Windows en escala 100% y probar todas las páginas
2. Cambiar a escala 125% y volver a probar
3. Cambiar a escala 150% y volver a probar
4. Documentar capturas comparativas
5. Reportar cualquier desviación encontrada

**Páginas a verificar:**
- DashboardPage (`/dashboard`)
- NuevoCalculoPage (`/nuevo-calculo`)
- ProcesoCalculoPage (`/proceso-calculo`) - todos los steps
- ResultadoBasicoDetalle (paso 5 del wizard)

**Criterio de aceptación:**
- ✅ 3 escalas funcionales sin overflow
- ✅ Diseño original preservado en 100%
- ✅ Capturas adjuntas en evidencia

---

### TICKET #008 - Documentar convenciones responsive

**Prioridad:** 🟢 BAJA  
**Tiempo estimado:** 30 min  
**Dependencias:** Tickets #001 a #007

**Tareas:**
1. Agregar sección "Responsive Design" en README del frontend
2. Documentar uso de `--layout-padding-x` y media queries
3. Listar convenciones para nuevos componentes:
   - Usar variables, no píxeles fijos
   - Probar en 3 escalas antes de PR
4. Agregar ejemplo de patrón correcto

**Archivos afectados:**
- `App/Frontend/README.md`

**Criterio de aceptación:**
- ✅ Sección documentada con ejemplos
- ✅ Convenciones claras para futuros desarrollos

---

## 6. CASOS DE PRUEBA

### 6.1 Matriz de Testing

| Escala | Resolución | DashboardPage | NuevoCalculoPage | ProcesoCalculoPage | ResultadoBasicoDetalle |
|--------|------------|---------------|------------------|---------------------|------------------------|
| **100%** | 1920×1080 | TEST-001 | TEST-002 | TEST-003 | TEST-004 |
| **125%** | 1920×1080 | TEST-005 | TEST-006 | TEST-007 | TEST-008 |
| **150%** | 1920×1080 | TEST-009 | TEST-010 | TEST-011 | TEST-012 |

### 6.2 Casos Específicos

**TEST-001 a TEST-004 (Escala 100%):**
- ✅ Márgenes laterales: ~150px visibles
- ✅ Sin overflow horizontal
- ✅ Diseño idéntico al original aprobado

**TEST-005 a TEST-008 (Escala 125%):**
- ✅ Márgenes laterales: ~100px visibles
- ✅ Cards completas sin desborde
- ✅ Texto legible sin compresión

**TEST-009 a TEST-012 (Escala 150%):**
- ✅ Márgenes laterales: ~70px visibles
- ✅ Contenido funcional y navegable
- ✅ Sin scroll horizontal forzado

### 6.3 Casos de Regresión

**TEST-REG-001:** Generación de PDF en `ResultadoBasicoDetalle`
- Debe verse igual independientemente de la escala usada

**TEST-REG-002:** Mobile (max-width: 768px)
- Márgenes laterales: 16px
- Diseño en columna única
- Sin afectación por la escala de Windows

---

## 7. CRITERIOS DE ACEPTACIÓN

### 7.1 Funcionales

- ✅ **Escala 100%:** Diseño idéntico al aprobado por el cliente
- ✅ **Escala 125%:** Sin overflow, márgenes ~100px visibles
- ✅ **Escala 150%:** Sin overflow, márgenes ~70px visibles
- ✅ **Mobile:** Diseño en columna única, márgenes 16px
- ✅ **PDF:** Generación correcta en cualquier escala

### 7.2 Técnicos

- ✅ No hay valores `XXpx` hardcodeados en márgenes de páginas
- ✅ Todas las páginas usan `var(--layout-padding-x)`
- ✅ Media queries por `min-resolution` documentadas
- ✅ Variables de fuente y spacing escalables con `clamp()`

### 7.3 Visuales

- ✅ Márgenes siempre visibles en escritorio (sensación de amplitud)
- ✅ Contenido nunca toca los bordes de la ventana
- ✅ Cards y elementos alineados con márgenes del contenedor

### 7.4 Performance

- ✅ Sin re-renders adicionales por cambios de CSS
- ✅ Cambios de escala se reflejan instantáneamente (sin reload)
- ✅ Sin JavaScript adicional (solución 100% CSS)

---

## 8. CONVENCIONES FRONTEND

### 8.1 Reglas para Nuevos Componentes

#### ❌ NO HACER:
```css
.miComponente {
  padding: 0 150px;          /* Píxeles fijos */
  font-size: 24px;            /* No escala */
  grid-template-columns: repeat(4, 1fr);  /* Sin minmax */
}
```

#### ✅ SÍ HACER:
```css
.miComponente {
  padding: 0 var(--layout-padding-x);    /* Variable adaptativa */
  font-size: var(--font-size-xl);         /* Variable escalable */
  grid-template-columns: repeat(4, minmax(0, 1fr));  /* Previene overflow */
}
```

### 8.2 Checklist Pre-Commit

Antes de hacer commit de un componente nuevo:

- [ ] ¿Usa `var(--layout-padding-x)` para márgenes laterales?
- [ ] ¿Usa `var(--font-size-*)` en vez de píxeles?
- [ ] ¿Usa `var(--spacing-*)` para padding/gap?
- [ ] ¿Los grids usan `minmax(0, 1fr)` o `auto-fit`?
- [ ] ¿Se probó en escala 100%, 125% y 150%?
- [ ] ¿Sin scroll horizontal en ninguna escala?

### 8.3 Cómo Probar Escalas en Windows

1. **Configuración → Sistema → Pantalla → Escala**
2. Cambiar entre 100%, 125%, 150%
3. **No requiere reiniciar** (los navegadores detectan automáticamente)
4. **Recargar página** con `Ctrl + Shift + R` para limpiar caché

### 8.4 Cómo Probar en DevTools (sin cambiar escala real)

```javascript
// En la consola del navegador:
document.documentElement.style.zoom = "0.8";  // Simula escala 125%
document.documentElement.style.zoom = "0.67"; // Simula escala 150%
document.documentElement.style.zoom = "1";    // Vuelve a 100%
```

⚠️ **Nota:** Esto no activa las media queries de `min-resolution`. Solo sirve para previsualización rápida.

---

## 9. RIESGOS Y MITIGACIÓN

### 9.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Media queries `min-resolution` no soportadas en navegador antiguo | Baja | Alto | Fallback: usar valores base (150px) |
| Componentes con píxeles fijos no se ajustan | Media | Medio | Auditoría progresiva (sprint siguiente) |
| Cliente reporta que no es "exactamente 150px" en escala 125% | Media | Bajo | Documentación clara de la solución |
| PDF se ve diferente entre escalas | Baja | Alto | Test específico TEST-REG-001 |

### 9.2 Riesgos de Diseño

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Márgenes 70px (escala 150%) se ven muy pequeños | Media | Medio | Ajustar a 80-90px si cliente lo solicita |
| Cards de 4 columnas no caben en 150% | Alta | Alto | Cambiar a 3 columnas con media query |
| Elementos internos con `width: 430px` desbordan | Media | Medio | Usar `width: min(430px, 100%)` |

### 9.3 Plan de Rollback

Si la solución no es aceptada:

1. **Revertir** los cambios en `variables.css` al estado actual del commit anterior
2. **Restaurar** valores fijos en NuevoCalculoPage y DashboardPage
3. **Documentar** decisión y proponer alternativa con presupuesto adicional

---

## 10. REFERENCIAS

- **Diseño aprobado:** Imágenes del cliente (escala 100%)
- **TICKET-DISEÑO-001:** Definición original de márgenes 150px
- **MDN - min-resolution:** https://developer.mozilla.org/en-US/docs/Web/CSS/@media/resolution
- **Can I Use - dppx:** Compatibilidad >95% en navegadores modernos

---

## 📝 NOTAS DE IMPLEMENTACIÓN

**Filosofía del cliente:**
> "Lo importante es que siempre, siempre, haya márgenes visibles a los costados, como el diseño original."

**Esto significa:**
- ✅ El valor exacto (150px) es flexible
- ✅ La presencia visual de márgenes es obligatoria
- ✅ Nunca debe haber contenido pegado a los bordes

**Esta especificación honra ese principio** mediante márgenes adaptativos que mantienen la sensación visual de amplitud en todas las escalas de Windows.
