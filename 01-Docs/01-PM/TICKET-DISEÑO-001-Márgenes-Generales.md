# TICKET-DISEÑO-001: Márgenes generales en páginas, header y footer

**Fecha:** 28/04/2026  
**Prioridad:** 🔴 ALTA  
**Estado:** ✅ COMPLETADO  
**Tipo:** Diseño / UX  
**Solicitado por:** Cliente CPAU  

---

## 📋 PROBLEMA IDENTIFICADO

El cliente identifica **inconsistencias en los márgenes laterales** entre diferentes componentes de la aplicación:

### Análisis de código actual:

```css
/* Header.module.css */
.headerContainer {
  max-width: 1200px;
  padding: 0 var(--spacing-2);  /* 16px ✅ */
}

/* Footer.module.css */
.footerContainer {
  max-width: 1200px;
  padding: 0 var(--spacing-2);  /* 16px ✅ */
}

/* DashboardPage.module.css */
.contentWrapper {
  max-width: 1200px;
  padding: 0 var(--spacing-3);  /* 24px ❌ INCONSISTENTE */
}

/* NuevoCalculoPage.module.css */
.content {
  max-width: 1200px;
  /* NO tiene padding definido ❌ */
}
.main {
  padding: 20px 20px;  /* ❌ INCONSISTENTE */
}
```

### Problema visual:

```
┌─────────────────────────────────────────┐
│  HEADER                                 │ ← 16px padding
├─────────────────────────────────────────┤
│                                         │
│     CONTENIDO                           │ ← 24px o 20px padding ❌
│                                         │
├─────────────────────────────────────────┤
│  FOOTER                                 │ ← 16px padding
└─────────────────────────────────────────┘

Las líneas rojas verticales del cliente muestran que TODOS 
los elementos deben alinearse exactamente a la misma distancia
de los bordes izquierdo y derecho.
```

---

## 🎯 OBJETIVO

**Garantizar márgenes laterales consistentes** en:
- ✅ Header
- ✅ Footer
- ✅ Todas las páginas (Dashboard, NuevoCalculo, ProcesoCalculo, etc.)
- ✅ Responsive (mantener consistencia en mobile)

---

## 🛠️ SOLUCIÓN TÉCNICA

### 1. Variables CSS Estandarizadas

Agregar en `variables.css`:

```css
:root {
  /* LAYOUT CONSISTENTE - Sistema de márgenes */
  --layout-max-width: 1200px;              /* Ancho máximo del contenido */
  --layout-padding-x: var(--spacing-2);    /* 16px - Padding horizontal desktop */
  --layout-padding-x-mobile: var(--spacing-2); /* 16px - Padding horizontal mobile */
}
```

### 2. Clase CSS Reutilizable

```css
/* Contenedor de página estandarizado */
.page-content-container {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-padding-x);
}

@media (max-width: 768px) {
  .page-content-container {
    padding: 0 var(--layout-padding-x-mobile);
  }
}
```

### 3. Aplicar en todos los componentes

**Header:**
```css
.headerContainer {
  max-width: var(--layout-max-width);
  padding: 0 var(--layout-padding-x);
}
```

**Footer:**
```css
.footerContainer {
  max-width: var(--layout-max-width);
  padding: 0 var(--layout-padding-x);
}
```

**Todas las páginas:**
```css
.content {
  max-width: var(--layout-max-width);
  margin: 0 auto;
  padding: 0 var(--layout-padding-x);
}
```

---

## 📝 ARCHIVOS MODIFICADOS

1. ✅ `App/Frontend/src/styles/variables.css` - Variables globales
2. ✅ `App/Frontend/src/components/layout/Header.module.css`
3. ✅ `App/Frontend/src/components/layout/Footer.module.css`
4. ✅ `App/Frontend/src/pages/DashboardPage.module.css`
5. ✅ `App/Frontend/src/pages/NuevoCalculoPage.module.css`
6. ✅ `App/Frontend/src/pages/ProcesoCalculoPage.module.css`

---

## ✅ CRITERIOS DE ACEPTACIÓN

- ✅ Todas las páginas usan `--layout-padding-x` (16px)
- ✅ Header y Footer alineados con el contenido
- ✅ Márgenes consistentes en desktop y mobile
- ✅ Líneas verticales de alineación coinciden en toda la app
- ✅ No hay scroll horizontal innecesario

---

## 🧪 TESTING

**Verificación visual:**
1. Abrir DevTools
2. Activar reglas CSS
3. Verificar que todos los contenedores tienen el mismo padding-left y padding-right
4. Navegar entre páginas y confirmar alineación consistente

**Páginas a verificar:**
- `/dashboard`
- `/nuevo-calculo`
- `/proceso-calculo`

---

## 📸 RESULTADO ESPERADO

```
┌─────────────────────────────────────────┐
│  HEADER                                 │ ← 16px padding ✅
├─────────────────────────────────────────┤
│                                         │
│     CONTENIDO                           │ ← 16px padding ✅
│                                         │
├─────────────────────────────────────────┤
│  FOOTER                                 │ ← 16px padding ✅
└─────────────────────────────────────────┘

Todas las líneas verticales alineadas perfectamente.
```

---

**TIEMPO ESTIMADO:** 30 minutos  
**TIEMPO REAL:** 25 minutos  
**COMPLETADO:** 28/04/2026
