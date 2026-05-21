# CH2026 - Gestión de Cálculo de Honorarios

Maqueta funcional desarrollada con React + Vite para demostración de funcionalidades básicas.

## 🚀 Tecnologías

- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Estilos**: CSS Modules
- **Iconos**: React Icons
- **Estado**: Context API

## 📁 Estructura del Proyecto

```
Frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizables
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Spinner.jsx
│   │   ├── layout/          # Componentes de layout
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── UserMenu.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/               # Páginas de la aplicación
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── ... (otras páginas)
│   ├── contexts/            # Context API
│   │   └── AuthContext.jsx
│   ├── utils/               # Utilidades
│   │   ├── constants.js
│   │   └── validation.js
│   ├── styles/              # Estilos globales
│   │   └── variables.css
│   ├── assets/              # Recursos estáticos
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   cd Frontend
   npm install
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Construir para producción:**
   ```bash
   npm run build
   ```

## 🔐 Credenciales de Acceso

- **Usuario:** admin
- **Contraseña:** CPAU

## 📱 Características

- ✅ Autenticación con validación en tiempo real
- ✅ Persistencia de sesión en localStorage
- ✅ Navegación SPA sin recargas
- ✅ Diseño responsive (mobile-first)
- ✅ Componentes reutilizables con CSS Modules
- ✅ Rutas protegidas
- ✅ Menú de usuario con dropdown
- ✅ Footer con redes sociales
- ✅ Accesibilidad (ARIA labels, navegación por teclado)

## 📐 Diseño Responsive

> **Guía obligatoria para implementar nuevas tareas profesionales (Arbitraje, Tasaciones, Pericias, etc.) o nuevos componentes.**

El proyecto soporta **3 escalas de Windows** (100%, 125%, 150%) además de **mobile** (≤768px). Esto se logra **sin sacrificar el diseño aprobado por el cliente** (escala 100%) usando una combinación de variables CSS adaptativas, unidades fluidas y queries `min-resolution`.

### 🔑 Variables clave (`src/styles/variables.css`)

```css
:root {
  --layout-padding-x: 150px;              /* Margen lateral base (escala 100%) */
  --layout-padding-x-mobile: 16px;        /* Margen lateral mobile */
}

@media (min-resolution: 1.25dppx) {
  :root { --layout-padding-x: 100px; }    /* Windows 125% */
}

@media (min-resolution: 1.5dppx) {
  :root { --layout-padding-x: 70px; }     /* Windows 150% */
}

@media (max-width: 768px) {
  :root { --layout-padding-x: var(--layout-padding-x-mobile); }
}
```

La clase global `.content` ya aplica `padding: 0 var(--layout-padding-x)`. **Todo nuevo componente debe heredar este padding del contenedor `.content` de la página, NO duplicarlo.**

### ✅ Reglas de oro (checklist obligatorio antes de PR)

1. **NUNCA usar píxeles fijos** para márgenes laterales de página. Usar `var(--layout-padding-x)` o heredar del contenedor.
2. **Grids con `minmax(0, 1fr)`** en lugar de `1fr` para evitar overflow:
   ```css
   /* ❌ Mal — puede desbordar si un hijo tiene contenido ancho */
   grid-template-columns: 1fr 1fr;
   
   /* ✅ Bien — defensivo, permite que las columnas se compriman */
   grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
   ```
3. **Anchos máximos con `min(Xpx, 100%)`** para hijos de ancho fijo:
   ```css
   /* ✅ La card ocupa 430px, pero nunca más que el contenedor */
   .cardSection > * { width: min(430px, 100%); }
   ```
4. **Tipografía fluida con `clamp()`** para títulos y textos que deben adaptarse:
   ```css
   /* min 14px, ideal escalable, max 16px */
   font-size: clamp(0.875rem, 0.5vw + 0.6rem, 1rem);
   ```
5. **Tablas siempre dentro de `.tableContainer` con `overflow-x: auto`** para evitar romper el layout:
   ```css
   .tableContainer { overflow-x: auto; }
   .table { width: 100%; min-width: 600px; }
   ```
6. **Auto-fit + minmax para grids de cards** (colapsa a menos columnas cuando no entra):
   ```css
   grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
   ```
7. **Mobile-first**: estilos base son mobile, breakpoints suman a partir de ahí. Breakpoint principal: `768px`.

### 🪟 Cuándo usar `min-resolution` vs `max-width`

| Query | Caso de uso |
|-------|-------------|
| `@media (min-resolution: 1.25dppx)` | Ajustar **márgenes / paddings / tamaños fijos** que dependen del zoom de Windows (afecta a viewport efectivo). |
| `@media (min-resolution: 1.5dppx)` | Idem, escala 150%. |
| `@media (max-width: 1280px)` | Ajustes por **ancho real del viewport** (laptops chicas, ventanas no maximizadas). |
| `@media (max-width: 768px)` | **Mobile**. Cambia layout (1 columna, padding mínimo). |

Las dos primeras se combinan con las dos últimas: una pantalla 1920×1080 a 150% se comporta como viewport ~1280px. Ambos tipos de query pueden disparar al mismo tiempo y eso está OK.

### 🧱 Patrón recomendado para una página nueva

```jsx
// MiNuevaPagina.jsx
import styles from './MiNuevaPagina.module.css';

export default function MiNuevaPagina() {
  return (
    <div className={styles.container}>
      <Header />
      <main className={`content ${styles.content}`}>  {/* ← .content global da el padding lateral */}
        <section className={styles.miSeccion}>
          {/* contenido */}
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

```css
/* MiNuevaPagina.module.css */
.content {
  /* NO duplicar padding lateral aquí — viene de .content global */
  padding-top: var(--spacing-6);
  padding-bottom: var(--spacing-6);
}

.miSeccion {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: var(--spacing-4);
}
```

### 🧪 Testing manual obligatorio antes de mergear

Para cada componente/página nueva probar en **las 3 escalas Windows**:

1. Configuración → Pantalla → Escala y diseño → **100%** → recargar Chrome → validar.
2. Cambiar a **125%** → recargar → validar (sin overflow horizontal, sin texto cortado, sin elementos pisados).
3. Cambiar a **150%** → recargar → validar.
4. DevTools → toggle device toolbar → **mobile (375px)** → validar layout en columna única.

**Criterios de aceptación universales:**
- ✅ Sin scroll horizontal en ninguna escala.
- ✅ Tipografía legible (mínimo 13px efectivo).
- ✅ Cards y formularios no se solapan.
- ✅ Diseño 100% **idéntico al aprobado por el cliente** (no degradar lo aprobado para arreglar 125/150).

### 📚 Referencias

- **Spec completa**: [`01-Docs/00-Specs/SPEC007-FRONTEND RESPONSIVE.md`](../../01-Docs/00-Specs/SPEC007-FRONTEND%20RESPONSIVE.md)
- **Implementaciones ejemplares** (copiar patrones de aquí):
  - `src/pages/DashboardPage.module.css` — grid 2 columnas defensivo
  - `src/pages/ProcesoCalculoPage.module.css` — formulario 2 columnas
  - `src/components/wizard/StepperProgress.module.css` — anchos adaptativos por escala
  - `src/components/wizard/ResultadoBasicoDetalle.module.css` — tabla + clase `.pdfExport`
  - `src/components/common/CalculationTypeCard.module.css` — card con título `clamp()` + descripción adaptativa

## 🎨 Paleta de Colores

- **Verde Principal:** #2D5016
- **Marrón Claro:** #D4A574
- **Celeste Claro:** #A8DADC
- **Grises:** #F8F9FA, #E9ECEF, #DEE2E6, #495057

## 📄 Páginas Implementadas

1. **Login** - Autenticación de usuarios
2. **Dashboard** - Panel principal con 6 opciones
3. **Nuevo Cálculo de Honorarios** - Placeholder
4. **Cálculos Realizados** - Placeholder
5. **Nuevo Proyecto de Obra** - Placeholder
6. **Proyectos Realizados** - Placeholder
7. **Consulta de Precios** - Placeholder
8. **Personalizar** - Placeholder
9. **Preferencias** - Placeholder
10. **Mi Cuenta** - Placeholder

## 📝 Notas

- Esta es una **maqueta funcional** sin conexión a backend
- Todos los datos son estáticos/de ejemplo
- Preparada para futura integración con API REST
- Código comentado en español
- Sigue mejores prácticas de React

## 👥 Público Objetivo

- Arquitectos
- Ingenieros
- Empresas Constructoras
- Contratistas
- Corralones
- Servicios de construcción
- Pinturerías y ferreterías

## 📧 Contacto

© 2026 CPAU | Desarrollado por neosis
