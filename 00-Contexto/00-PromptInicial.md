Eres un ingeniero en prompting senior muy experimentado. Necesito que me afines el siguiente pedido para desarrollar un sitio web con Copilot.
Debemos realizar una maqueta para poder mostrar a mis clientes la funcionalidad básica que tendrá un sitio web según un proyecto que me solicitaron.
El proyecto se llama “Gestión de Cálculo de Honorarios”, y a la aplicación le he puesto el nombre “CH2026”.
La maqueta debe ser realizada con las siguientes tecnologías:
Front End: React VITE
Back End: API REST en Node JS (Fastity) + (MySQL)
Arquitectura ambiente QA: Front End Vercel, + AWS Lambda + AWS RDS
(Ya tengo varias aplicaciones funcionando sobre ese esquema)

PARA ESTA ETAPA, ME VOY A CONCENTRAR EN DESARROLLAR RÁPIDAMENTE EL FRONT END, SIN DESARROLLO DE BACKEND.
DEBO MOSTRAR EL FLUJO DEL PROGRAMA AL CLIENTE, Y LO VOY A HACER SIN ACCESO A BASE DE DATOS POR AHORA, PARA OPTIMIZAR EL TIEMPO Y TRATAR DE VENDER EL PROYECTO.

La maqueta debe tener las siguientes funcionalidades:
1)	Formulario básico de login
1.1	- Ingreso de credenciales (usuario y contraseña)
1.2	– Checkbox de “Recordarme en éste equipo”
1.3	– link de “Olvidó su contraseña” – NO dirije a ningún lado.
1.4	– Link de “Regístrese” NO dirije a ningún lado.
1.5	– Credenciales válidas de ejemplo: usuario “admin” y clave “CPAU”. Con esas credenciales, ingresa al dashboard.

2)	Dashboard de gestión de consultas
2.1 – Debe tener un Div donde colocar el logo y descripción del cliente en el Header. El título será “Gestión de Cálculo de Honorarios”.
2.2 – Debe contener un link que indique el usuario en uso (debe tener allí su nombre, al estilo Google). La opción deberá tener el siguiente menú:
2.2.1 – Preferencias
2.2.2 – Mi Cuenta
2.2.3 – Salir. Si el usuario selecciona esta opción, se debe volver al login (opción 1)
2.3 – En su cuerpo principal debe contener botones de acciones principales.
Los botones de acción serán una card con los siguientes componentes:
Título (por ejemplo “Nuevo Cálculo de Honorario”) 
Imagen (ïcono, dibujo o fotografía) bien profesional y minimalista
Descripción breve (“Genera un nuevo proyecto para cálculo de honorarios profesionales”) 

Los botones deben ser grandes, para que en un móvil se vean en dos columnas aproximadamente.

2.4 - Detalle de botones de acción:

2.4.1 – Título: “Nuevo Cálculo de Honorarios”
Acción: (Su selección (click) se describe en el punto 4)
Descripción: “Genera un nuevo proyecto para cálculo de honorarios profesionales”
2.4.2 – Título: “Cálculos realizados”
Acción: (Su selección (click) se describe en el punto 5)
Descripción: “Permite consultar cálculos realizados anteriormente”
2.4.3 – Título: “Nuevo Proyecto de Obra”
(Su selección (click) se describe en el punto 6)
Descripción: “Genera un nuevo proyecto para la gestión de una obra de construcción”
2.4.4 – Título:“Proyectos realizados”
(Su selección (click) se describe en el punto 7)
Descripción: “Permite consultar proyectos de gestión de obra realizados”
2.4.5 – Título: “Consulta de Precios”
(Su selección (click) se describe en el punto 8)
Descripción: “Permite consultar precios de materiales, insumos y servicios en la Base de Datos”
2.4.6 - Título: “Personalizar”
(Su selección (click) se describe en el punto 9)
Descripción: “Permite al usuario preestablecer opciones para una experiencia personalizada”
2.5 – generar footer con copyrigth y redes sociales 
Adjunto ícono de ejemplo. Descargarlo luego en la carpeta de recursos y luego utilízalo desde allí.
3)	Otros Aspectos

4)	Página a desarrollar

5)	Página a desarrollar
6)	Página a desarrollar
7)	Página a desarrollar
8)	Página a desarrollar
9)	Página a desarrollar


Debes seguir las especificaciones técnicas del proyecto. Las indico:

ESPECIFICACIONES TÉCNICAS:
- Estilos: CSS Modules
- Diseño: Mobile-first, responsive, minimalista
- Convención: camelCase para todas las variables y funciones
- Comentarios: Documentación clara en español

REQUERIMIENTOS DE DISEÑO:
- Paleta de colores PROPUESTA: Verde, marrón claro, celeste claro,  blanco, grises suaves
- Tipografía: Sans-serif moderna (Inter, Roboto)
- Componentes: Input con labels floating, botón con loading spinner
- Estados visuales: hover, focus, disabled, error
- Responsive: 320px móvil hasta 1200px desktop
- Accesibilidad: ARIA labels, tab navigation

ESTRUCTURA DE ARCHIVOS:
Genera toda la estructura de archivos dentro de la carpeta App/Frontend

CARACTERÍSTICAS ADICIONALES:
- Mostrar/ocultar nombre de usuario con ícono
- Mostrar ícono y Texto para desplegar menú de gestión de Usuario logueado (Mi Cuenta)
- Animaciones suaves (CSS transitions)
- Loading states con skeleton o spinner
- Pie de Página (Footer) con ícono de red social Instagram, Facebook y el texto de copyright para la empresa “CPAU(2025), desarrollado por neosis”

BUENAS PRÁCTICAS A INCLUIR:
- Manejo de errores con try/catch
- Limpieza de efectos (cleanup)
- Optimización de re-renders
- Código comentado en español
- Nombres descriptivos para variables y funciones
- Separación de lógica y presentación

**NOTA FINAL:** Esta es una maqueta funcional, no conectada a backend. Todos los datos son estáticos/de ejemplo. La navegación entre páginas debe ser fluida sin recargas innecesarias.

Necesitas algo más?


******RESPUESTA
Crea un proyecto React + Vite llamado "CH2026" - Maqueta de Gestión de Cálculo de Honorarios.

SETUP INICIAL:
1. Crear proyecto con: npm create vite@latest ch2026 -- --template react
2. Instalar dependencias:
   - react-router-dom
   - react-icons (para iconografía)
3. Configurar estructura de carpetas en /src:
   /components
     /common (Button, Input, Card, Spinner, etc)
     /layout (Header, Footer, UserMenu)
   /pages
     LoginPage.jsx
     DashboardPage.jsx
     NuevoCalculoPage.jsx
     CalculosRealizadosPage.jsx
     NuevoProyectoPage.jsx
     ProyectosRealizadosPage.jsx
     ConsultaPreciosPage.jsx
     PersonalizarPage.jsx
     PreferenciasPage.jsx
     MiCuentaPage.jsx
   /contexts
     AuthContext.jsx
   /styles
     variables.css
     [componente].module.css para cada componente
   /assets
     /images
   /utils
     validation.js
     constants.js

CONFIGURACIÓN DE ESTILOS GLOBALES (variables.css):
:root {
  /* Paleta de colores */
  --color-primary: #2D5016;        /* Verde */
  --color-secondary: #D4A574;      /* Marrón claro */
  --color-accent: #A8DADC;         /* Celeste claro */
  --color-white: #FFFFFF;
  --color-gray-50: #F8F9FA;
  --color-gray-100: #E9ECEF;
  --color-gray-200: #DEE2E6;
  --color-gray-700: #495057;
  --color-error: #DC3545;
  --color-success: #28A745;
  
  /* Tipografía */
  --font-family: 'Inter', 'Roboto', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  
  /* Espaciado (sistema 8px) */
  --spacing-1: 8px;
  --spacing-2: 16px;
  --spacing-3: 24px;
  --spacing-4: 32px;
  --spacing-5: 40px;
  
  /* Bordes */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  /* Transiciones */
  --transition: 300ms ease;
}

COMPONENTE: AuthContext.jsx
Contexto de autenticación con:
- Estado: user (null o {username: 'admin'}), isAuthenticated
- Funciones: login(username, password), logout()
- login() valida: username === 'admin' && password === 'CPAU'
- Guardar/leer sesión de localStorage (key: 'ch2026_session')
- Función para verificar "Recordarme" (key: 'ch2026_remember')

COMPONENTE: LoginPage.jsx
- Formulario centrado vertical y horizontalmente
- Inputs con floating labels (email/usuario y password)
- Validación en tiempo real:
  * Usuario requerido (mínimo 3 caracteres)
  * Contraseña requerida (mínimo 4 caracteres)
  * Mostrar mensajes de error debajo de cada input
- Checkbox "Recordarme en este equipo"
- Botón "Iniciar Sesión" con loading spinner
- Links no funcionales (href="#"): "¿Olvidó su contraseña?", "Regístrese"
- Mostrar error si credenciales incorrectas
- Al autenticar: guardar sesión y redirigir a /dashboard
- Diseño card centrado con logo placeholder arriba
- Responsive: ancho máximo 400px en desktop

COMPONENTE: Header (layout)
- Fondo: var(--color-primary)
- Contiene:
  * Área logo cliente (placeholder con borde punteado + texto "Logo Cliente")
  * Título: "Gestión de Cálculo de Honorarios" (centrado o izquierda)
  * UserMenu (derecha)
- Sticky top en scroll
- Responsive: en móvil puede colapsar título

COMPONENTE: UserMenu (dropdown)
- Mostrar nombre usuario con ícono (FaUser de react-icons)
- Al hacer click: despliega menú con:
  * Preferencias → /preferencias
  * Mi Cuenta → /mi-cuenta
  * Divider
  * Salir (icono FaSignOutAlt) → ejecuta logout y redirige a /login
- Cerrar dropdown al click fuera (useEffect + ref)
- Animación smooth al abrir/cerrar
- Positioned absolute, alineado a la derecha

COMPONENTE: Footer (layout)
- Fondo: var(--color-gray-100)
- Contenido centrado:
  * Iconos redes sociales: Instagram (FaInstagram), Facebook (FaFacebook)
  * Links a "#"
  * Texto: "© 2026 CPAU | Desarrollado por neosis"
- Sticky bottom o normal según diseño
- Responsive: stack vertical en móvil

COMPONENTE: Card (common)
Props: title, description, icon, onClick
- Card grande clickeable
- Hover: elevación (shadow-lg), transform translateY(-4px)
- Contiene:
  * Ícono grande arriba (60x60px o más)
  * Título (font-size-lg, bold)
  * Descripción (font-size-sm, color-gray-700)
- Grid responsive: 1 col móvil, 2 cols tablet (768px), 3 cols desktop (1024px)
- Padding generoso
- Border-radius: var(--radius-lg)

COMPONENTE: Button (common)
Props: children, onClick, loading, disabled, variant (primary/secondary)
- Estados visuales: default, hover, active, disabled, loading
- Primary: fondo var(--color-primary), texto blanco
- Secondary: fondo var(--color-secondary), texto oscuro
- Loading: mostrar spinner, deshabilitar click
- Transiciones smooth
- Padding: 12px 24px
- Border-radius: var(--radius-md)

COMPONENTE: Input (common)
Props: label, type, value, onChange, error, required
- Floating label (label flota cuando input tiene valor o focus)
- Estados: default, focus (borde color-primary), error (borde color-error)
- Mostrar mensaje error debajo si existe
- Padding: 12px
- Border-radius: var(--radius-sm)
- Transiciones en label

COMPONENTE: Spinner (common)
- Loading spinner CSS puro (border animation)
- Props: size (sm/md/lg)
- Color: heredar o var(--color-primary)

PÁGINA: DashboardPage.jsx
- Layout: Header + Body + Footer
- Body contiene grid de 6 Cards:
  
  1. "Nuevo Cálculo de Honorarios"
     Icon: FaCalculator
     Descripción: "Genera un nuevo proyecto para cálculo de honorarios profesionales"
     onClick: navigate('/nuevo-calculo')
  
  2. "Cálculos Realizados"
     Icon: FaListAlt
     Descripción: "Permite consultar cálculos realizados anteriormente"
     onClick: navigate('/calculos-realizados')
  
  3. "Nuevo Proyecto de Obra"
     Icon: FaHardHat
     Descripción: "Genera un nuevo proyecto para la gestión de una obra de construcción"
     onClick: navigate('/nuevo-proyecto')
  
  4. "Proyectos Realizados"
     Icon: FaFolderOpen
     Descripción: "Permite consultar proyectos de gestión de obra realizados"
     onClick: navigate('/proyectos-realizados')
  
  5. "Consulta de Precios"
     Icon: FaSearchDollar
     Descripción: "Permite consultar precios de materiales, insumos y servicios"
     onClick: navigate('/consulta-precios')
  
  6. "Personalizar"
     Icon: FaCog
     Descripción: "Permite preestablecer opciones para una experiencia personalizada"
     onClick: navigate('/personalizar')

- Grid responsive con gap de var(--spacing-3)
- Máximo ancho contenedor: 1200px, centrado

PÁGINAS PLACEHOLDER (resto):
Todas las páginas secundarias tienen:
- Mismo Header con UserMenu
- Título de la página
- Mensaje: "Página [Nombre] - En desarrollo"
- Botón "Volver al Dashboard" → navigate('/dashboard')
- Footer
- Preparadas para agregar contenido después

ROUTING (App.jsx):
- BrowserRouter
- Rutas públicas: /login
- Rutas protegidas (ProtectedRoute): /, /dashboard, y todas las demás
- Redirect de / a /dashboard si autenticado, sino a /login
- ProtectedRoute verifica isAuthenticated, sino redirect a /login

ACCESIBILIDAD:
- Todos los inputs con labels apropiados
- Botones con aria-label cuando solo tienen íconos
- Tab navigation funcional
- Contraste WCAG AA mínimo

RESPONSIVE:
- Mobile: 320px - 767px (1 columna cards)
- Tablet: 768px - 1023px (2 columnas cards)
- Desktop: 1024px+ (3 columnas cards)
- Media queries en cada módulo CSS

CONVENCIONES:
- camelCase: variables, funciones
- PascalCase: componentes React
- Comentarios en español explicando lógica compleja
- Imports organizados: React, third-party, local
- Manejo de errores con try/catch donde sea necesario
- useEffect cleanup cuando hay listeners

NOTAS IMPORTANTES:
- NO conectar a backend
- Todos los datos son estáticos/mock
- Navegación SPA sin recargas
- Código limpio, modular, reutilizable
- CSS Modules para evitar conflictos de estilos
- Importar Google Fonts (Inter) en index.html

INICIALIZACIÓN:
Después de crear todos los archivos, proveer instrucciones para:
npm install
npm run dev
