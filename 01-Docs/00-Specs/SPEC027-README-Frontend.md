# 📊 DASHBOARD ENDPOINT - DOCUMENTACIÓN PARA FRONTEND

## 📁 Archivos de Ejemplo Incluidos

Este directorio contiene todos los recursos necesarios para que el equipo de frontend pueda trabajar en paralelo con backend:

| Archivo | Descripción | Uso |
|---------|-------------|-----|
| **SPEC027-CALC-Dashboard.md** | Especificación completa del endpoint | Referencia técnica completa |
| **SPEC027-Response-Example.json** | JSON de ejemplo del response exitoso | Mock de datos para desarrollo |
| **SPEC027-Errores-Example.js** | Ejemplos de errores y manejo | Referencia de error handling |
| **SPEC027-Dashboard-React-Example.jsx** | Componente React completo con gráficos | Punto de partida para implementación |
| **SPEC027-Dashboard.css** | Estilos responsive mobile-first | Diseño acorde a brand CPAU |
| **README-Frontend.md** | Este archivo | Guía de inicio rápido |

---

## 🚀 Inicio Rápido

### 1️⃣ Instalar Dependencias

```bash
# Con npm
npm install recharts date-fns

# Con pnpm
pnpm add recharts date-fns

# Con yarn
yarn add recharts date-fns
```

### 2️⃣ Copiar Archivos de Ejemplo

```bash
# Copiar componente React
cp SPEC027-Dashboard-React-Example.jsx src/components/Dashboard/Dashboard.jsx

# Copiar estilos
cp SPEC027-Dashboard.css src/components/Dashboard/Dashboard.css

# Copiar JSON mock
cp SPEC027-Response-Example.json src/mocks/dashboardMock.json
```

### 3️⃣ Configurar Variable de Entorno

**Archivo: `.env.local` o `.env.development`**

```env
# Usar mock en desarrollo (sin llamar al backend real)
REACT_APP_USE_REAL_API=false

# Usar API real (cuando el backend esté listo)
# REACT_APP_USE_REAL_API=true
```

### 4️⃣ Importar y Usar el Componente

```jsx
// src/pages/AdminPage.jsx
import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';

const AdminPage = () => {
  return (
    <div className="admin-page">
      <Dashboard />
    </div>
  );
};

export default AdminPage;
```

---

## 📋 Especificación del Endpoint

### Request

```http
GET /api/calculos/dashboard?fechaDesde=YYYY-MM-DD&fechaHasta=YYYY-MM-DD
Authorization: Bearer <JWT_TOKEN>
```

**Parámetros Query (opcionales):**
- `fechaDesde`: Fecha inicio del período (formato ISO 8601: `YYYY-MM-DD`)
- `fechaHasta`: Fecha fin del período (formato ISO 8601: `YYYY-MM-DD`)

**Si no se envían parámetros:** retorna datos de los últimos 30 días.

**Validaciones:**
- ✅ Rango máximo: 1 año
- ✅ `fechaHasta` no puede ser futuro
- ✅ `fechaDesde` <= `fechaHasta`
- ✅ Formato obligatorio: `YYYY-MM-DD`

### Response Exitoso (200 OK)

Ver archivo: **SPEC027-Response-Example.json**

```json
{
  "success": true,
  "data": {
    "periodo": { "desde": "...", "hasta": "..." },
    "resumen": { ... },
    "serieTemporal": [ ... ],
    "distribucionTareas": [ ... ],
    "topUsuarios": [ ... ],
    "distribucionPuntajes": [ ... ]
  },
  "version": "1.0"
}
```

### Errores (400 / 401 / 500)

Ver archivo: **SPEC027-Errores-Example.js** para todos los casos de error.

```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "version": "1.0"
}
```

---

## 🎨 Diseño Visual

### Paleta de Colores CPAU

```css
--color-primary: #00a8e8;      /* Cyan CPAU */
--color-secondary: #0077b6;    /* Azul oscuro */
--color-success: #06d6a0;      /* Verde */
--color-warning: #ffd60a;      /* Amarillo */
--color-danger: #ef476f;       /* Rojo */
```

### Layout del Dashboard

```
┌─────────────────────────────────────────────────┐
│  Dashboard de Cálculos CPAU                     │
├─────────────────────────────────────────────────┤
│  Filtros: [Desde] [Hasta] [Filtrar]            │
├─────────────────────────────────────────────────┤
│  [Card 1]  [Card 2]  [Card 3]  [Card 4] ...     │  ← Resumen
├─────────────────────────────────────────────────┤
│  📈 Gráfico de Líneas: Serie Temporal           │
├──────────────────────┬──────────────────────────┤
│  🥧 Gráfico de Torta │  📊 Gráfico de Barras    │  ← Distribución
│  (Tareas)            │  (Puntajes)              │
├──────────────────────┴──────────────────────────┤
│  📋 Tabla: Top 5 Usuarios                       │
└─────────────────────────────────────────────────┘
```

---

## 📊 Gráficos Implementados

### 1. Serie Temporal (LineChart)

**Libería:** Recharts - LineChart  
**Datos:** `data.serieTemporal`  
**Ejes:**
- X: Fecha (formato: `dd/MM`)
- Y1: Usuarios nuevos (línea cyan)
- Y2: Cálculos nuevos (línea azul)

### 2. Distribución de Tareas (PieChart)

**Libería:** Recharts - PieChart  
**Datos:** `data.distribucionTareas`  
**Muestra:** Código de tarea + porcentaje  
**Tooltip:** Descripción completa + total cálculos

### 3. Distribución de Puntajes (BarChart)

**Libería:** Recharts - BarChart  
**Datos:** `data.distribucionPuntajes`  
**Colores:**
- 1 estrella: Rojo (#ef476f)
- 2 estrellas: Naranja (#ff9f1c)
- 3 estrellas: Amarillo (#ffd60a)
- 4 estrellas: Verde (#06d6a0)
- 5 estrellas: Azul (#118ab2)

### 4. Top Usuarios (Tabla)

**Formato:** Tabla HTML con hover effects  
**Datos:** `data.topUsuarios`  
**Columnas:**
- Posición (🥇🥈🥉 para top 3)
- Nombre completo
- Email
- Total cálculos
- Última actividad (formato: `dd/MM/yyyy HH:mm`)

---

## 🔧 Funcionalidades del Componente

### Estado y Loading

```jsx
const [loading, setLoading] = useState(true);   // Spinner de carga
const [error, setError] = useState(null);       // Manejo de errores
const [data, setData] = useState(null);         // Datos del dashboard
```

### Filtros de Fecha

- Inputs tipo `date` para selección fácil
- Validación de fechas en frontend (antes de llamar API)
- Botón "Últimos 30 días" para resetear filtros
- Muestra el período actual aplicado

### Formato de Números

```javascript
// Moneda argentina
formatCurrency(285750000)  // → "$ 285.750.000"

// Puntaje promedio
promedioPuntaje.toFixed(1)  // → "4.3"

// Porcentajes
porcentaje.toFixed(1) + '%'  // → "36.4%"
```

### Formato de Fechas

```javascript
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Fecha corta
format(parseISO('2026-07-31'), 'dd/MM')  // → "31/07"

// Fecha completa
format(parseISO('2026-07-31'), 'dd MMM yyyy', { locale: es })  
// → "31 jul 2026"

// Fecha con hora
format(parseISO('2026-07-31T18:45:22Z'), "dd/MM/yyyy HH:mm", { locale: es })  
// → "31/07/2026 18:45"
```

---

## ✅ Checklist de Implementación

### Fase 1: Desarrollo con Mock (Backend en progreso)

- [ ] Instalar dependencias (`recharts`, `date-fns`)
- [ ] Copiar archivos de ejemplo a tu proyecto
- [ ] Configurar `.env` con `REACT_APP_USE_REAL_API=false`
- [ ] Verificar que el componente renderiza con datos mock
- [ ] Probar filtros de fecha (validaciones frontend)
- [ ] Ajustar estilos según tu theme/framework
- [ ] Verificar responsive en mobile (Chrome DevTools)

### Fase 2: Integración con Backend Real

- [ ] Cambiar `.env` a `REACT_APP_USE_REAL_API=true`
- [ ] Actualizar URL del endpoint según tu configuración
- [ ] Configurar token JWT en headers (usar store de auth)
- [ ] Probar casos de error (401, 400, 500)
- [ ] Verificar loading states
- [ ] Validar formato de fechas en response
- [ ] Testing con diferentes rangos de fechas

### Fase 3: Optimizaciones

- [ ] Implementar cache de queries (React Query / SWR)
- [ ] Agregar skeleton loaders en vez de spinner genérico
- [ ] Implementar debounce en cambios de filtros
- [ ] Agregar export a CSV/Excel (si requerido)
- [ ] Optimizar renders con `React.memo` si es necesario
- [ ] Agregar tests unitarios (Jest + React Testing Library)

---

## 🧪 Testing

### Casos de Prueba Manual

| Test | Acción | Resultado Esperado |
|------|--------|-------------------|
| TC-01 | Cargar dashboard sin filtros | Muestra últimos 30 días |
| TC-02 | Filtrar por rango válido (7 días) | Actualiza datos correctamente |
| TC-03 | Filtrar por rango > 1 año | Muestra error 400 |
| TC-04 | Ingresar fecha futura | Muestra error 400 |
| TC-05 | Ingresar fechas invertidas | Muestra error 400 |
| TC-06 | Cargar sin token JWT | Muestra error 401 / redirige a login |
| TC-07 | Error de red | Muestra mensaje de error genérico |
| TC-08 | Resize a mobile | Layout responsive sin scroll horizontal |

### Ejemplo de Test Unitario (Jest)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

test('renderiza título del dashboard', async () => {
  render(<Dashboard />);
  
  await waitFor(() => {
    expect(screen.getByText('Dashboard de Cálculos CPAU')).toBeInTheDocument();
  });
});

test('muestra loading spinner inicialmente', () => {
  render(<Dashboard />);
  expect(screen.getByText('Cargando dashboard...')).toBeInTheDocument();
});
```

---

## 📚 Recursos Adicionales

### Documentación de Librerías

- **Recharts:** https://recharts.org/
- **date-fns:** https://date-fns.org/
- **React:** https://react.dev/

### Alternativas a Recharts

Si necesitan otra librería de gráficos:

| Librería | Ventajas | Casos de Uso |
|----------|----------|--------------|
| **Chart.js** | Ligera, muy popular | Dashboards simples |
| **Victory** | Muy customizable | Diseños complejos |
| **Apache ECharts** | Enterprise-grade | Grandes volúmenes de datos |
| **Nivo** | Hermosa, React-first | Apps modernas |

### Herramientas de Desarrollo

- **React DevTools:** Para debuggear componentes
- **Redux DevTools:** Si usan Redux para state management
- **Postman / Thunder Client:** Para probar endpoint manualmente

---

## 🐛 Troubleshooting

### El gráfico no se renderiza

**Problema:** Contenedor del gráfico sin altura definida.

**Solución:**
```css
.chart-section {
  min-height: 400px; /* Asegurar altura mínima */
}
```

### Fecha en formato incorrecto

**Problema:** Backend retorna fecha en formato no ISO.

**Solución:**
```javascript
// Convertir a ISO antes de parsear
const fecha = new Date(rawFecha).toISOString();
```

### Error CORS al llamar API

**Problema:** Backend no permite requests desde frontend.

**Solución temporal (desarrollo):**
```javascript
// En package.json (solo development)
"proxy": "http://localhost:3000"
```

**Solución definitiva:** Backend debe configurar CORS headers correctamente.

### Token JWT expirado

**Problema:** 401 después de tiempo sin actividad.

**Solución:**
```javascript
// Interceptor de Axios
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Limpiar token y redirigir
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📞 Contacto

**Dudas sobre el endpoint:**
- Revisar: `SPEC027-CALC-Dashboard.md` (especificación completa)
- Contactar: Equipo Backend CH2026

**Dudas sobre implementación frontend:**
- Revisar: Este README y archivos de ejemplo
- Buscar en: Documentación de Recharts / date-fns

---

## 📝 Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2026-07-31 | 1.0 | Creación inicial de documentación frontend |

---

**¡Éxito con la implementación! 🚀**
