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
