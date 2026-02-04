Continuando con el proyecto, ahora vamos a desarrollar la funcionalidad del botón "Nuevo Cálculo de Honorarios”.
Como información, debo decirte que gran parte de éste proyecto ya lo he hecho anteriormente, hace muchos años, en Visual Studio 2010, con C#. Poseo el código por si puede resultar beneficioso para nuestro trabajo.
Esta página servirá como derivador de tareas. Le permitirá seleccionar al usuario sobre qué tipos de Fórmulas y procedimientos prefiere realizar su Cálculo de Honorarios.
Tenemos cuatro tipos de Cálculos:
1)	Honorarios de Especialidades – Básico
“Cálculo de honorarios desarrollado para utilizarse como referencia a partir de obras de construcción stándares con materiales y procedimientos involucrados comunes en el mercado.”
2)	Arancel CPAU
“Arancel propuesto por el CPAU en su resolución número 3220 y actualizaciones, a partir de un índice K de referencia y haciendo hincapié de manera detallada en cada tarea y rol que puede desarrollar el profesional matriculado”
3)	Cálculo Costo de Obra + Arancel CPAU
“Cálculo basado en el Arancel CPAU, tomando como base el Cálculo de Costo de Obra realizado previamente de manera detallada”
4)	Cálculo Personalizado
“Cálculo que permite al usuario cambiar los valores de referencia y los índices para poder analizar impacto de esos cambios en el resultado final”
Cada uno de éstos tipos de cálculos debe tener su card, que puede ser igual a la utilizada en el dashboard, con una profundidad mayor del borde (simulando un botón más alto) o algún detalle que los diferencie.
Cada selección Derivará a una misma página que le permitirá al usuario, según el tipo de Cálculo seleccionado, ingresar distintos datos que se le irá pìdiendo en el formato de solapas “Siguiente” + “Anterior” hasta llegar a la última solapa donde se efectuará el cálculo de Honorarios en base al tipo de Cálculo seleccionado y los datos ingresados.
Flujo del Cálculo de Honorarios:
1)	Página “nuevo-calculo”: Selección de tipo de Cálculo
2)	Página “proceso-cálculo”
2.1) Mostrará header con título del tipo de cálculo seleccionado y debajo un div con la descripción de cada tipo de Cálculo.
2.2) Solapa “Datos principales”:
2.2.1) Desplegable con el dato Tarea Profesional a realizar. Lista de Tareas a mostrar en el desplegable (se alimentará al despeglabe con datos de una API REST, pero en esta maqueta se mostrarán datos harcodeados):

Código	Descripción
PTA	Planificación, Territorio y Ambiente
PYDOA	Proyecto y Dirección de Obras de Arquitectura
PYDEI	Proyecto y Dirección de estructuras e instalaciones
PYDD	Proyecto y Dirección de Demoliciones
HYS	Higiene y Seguridad
RT	Representaciones técnicas
SA	Supervisiones/Auditorías
GPGC	Gerencia de Proyecto/Gerencia de Construcciones
CONS	Consultas
ASE	Asesoramientos
EST	Estudios
HAB	Habilitaciones
PER	Peritajes
TAS	Tasaciones
ARB	Arbitrajes
MED	Medianería

2.3) Solapa “Datos específicos”
Solicitar algunos datos para ingresar valores de ejemplo:
-Cantidad de metros cuadrados (Textbox)
-Costo del metro cuadrado (Textbox)
-Realiza recálculo final (checkbox)

2.4) Solapa “Datos adicionales”
Solicitar algunos datos para ingresar valores de ejemplo:
-Gastos de viáticos
-Gastos operativos
-Cantidad de operarios
-Otros gastos

2.5) Solapa “Revisión”
Mostrará una grilla con cuatro columnas:
2.5.1 – ítem calculado
2.5.2 – Cantidad
2.5.3 – Precio unitario
2.5.4 – Total

2.6) Solapa “Resultado”
Mostrará un detalle de Costos en una grilla de dos columnas
2.6.1 – ítem
2.6.2 – Costo
Mostrar total y debajo un disclaimer de ejemplo “Los valores informados aquí son resultado del cálculo de múltiples variables e índices afectados a éste momento. Los resultados pueden variar entre cálculos de obras del mismo tipo en diferentes momentos. El arancel propuesto debe ser ocnsiderado como referencia y de ninguna manera el CPAU dispone el valor final que el profesional debe informar”
Con un check de “Acepta las condiciones del servicio y el reglamento de uso de datos del CPAU”

Entre solapa y solapa se debe poder mover con botones de “Anterior” y “Siguiente”.

Detallo mockup de funcionalidad de la que estamos migrando.


	Con lo que te he dado, puedes avanzar con el desarrollo de ésta funcionalidad en la maqueta?
RECUERDO QUE EL OBJETIVO DE ESTO ES MOSTRARLE AL CLIENTE EL FLUJO DE TRABAJO DE UN CALCULO DE HONORARIOS TAL CUAL LO QUIERO IMPLEMENTAR.
No dudes en pedirme información o datos que necesites.


Pregnta Copilot:

Excelente información! Como ingeniero de prompting, necesito aclarar algunos detalles clave para crear un prompt preciso para Copilot:

## 📋 **Preguntas Críticas:**

### 1. **Gestión de Estado y Navegación**
- ¿Quieres que el progreso del cálculo se guarde en `localStorage` para que si el usuario sale y vuelve, continúe donde estaba? ¿O solo en memoria durante la sesión?
- ¿Al hacer click en "Volver al Dashboard" desde el proceso, debe mostrar un mensaje de confirmación tipo "¿Seguro que quieres salir? Perderás el progreso"?

### 2. **Datos Mock para las Grillas (Revisión y Resultado)**
Para la **Solapa "Revisión"** necesito ejemplos concretos:
- ¿Qué ítems específicos debo mostrar? Por ejemplo:
  - "Honorarios profesionales - Proyecto"
  - "Honorarios profesionales - Dirección de obra"
  - "Viáticos y gastos operativos"
  - ¿Otros?
- ¿Cantidades y precios de ejemplo para cada ítem?

Para la **Solapa "Resultado"**:
- ¿Qué ítems de costo debo mostrar? Por ejemplo:
  - "Subtotal honorarios"
  - "Gastos adicionales"
  - "IVA 21%"
  - "Total final"

### 3. **Validaciones**
- ¿Debe validar que los campos obligatorios estén completos antes de permitir "Siguiente"?
- ¿Campos numéricos deben validar que sean números positivos?

### 4. **Diseño de Solapas/Wizard**
- ¿Prefieres un **indicador de progreso** tipo "Paso 1 de 6, Paso 2 de 6..." arriba?
- ¿O prefieres un **stepper visual** con círculos/pasos como muchos wizards modernos?
- Los mockups muestran botones circulares abajo (anterior/siguiente/ayuda). ¿Mantenemos ese estilo?

### 5. **Cards de Selección de Tipo**
- ¿Usamos el mismo componente Card del Dashboard o creamos uno nuevo con más "profundidad"?
- ¿Algún color o estilo distintivo para cada tipo de cálculo?

### 6. **Responsive en Móvil**
- En móvil, ¿las solapas se mantienen como tabs o se convierte en un flujo más vertical/simple?

### 7. **Cálculos Simulados**
- Para la maqueta, ¿quieres que haga cálculos reales (ejemplo: m² × precio) o solo mostrar valores hardcodeados que parezcan calculados?
- ¿Los 4 tipos de cálculo deben mostrar resultados diferentes o puede ser el mismo flujo para todos en esta maqueta?

## 💡 **Sugerencias:**

1. **Rutas propuestas:**
   - `/nuevo-calculo` - Selección de tipo
   - `/proceso-calculo/:tipo` - Wizard de cálculo (tipo: basico, arancel, costo-obra, personalizado)

2. **Componentes a crear:**
   - `TipoCalculoSelector` - Cards de selección
   - `ProcesoCalculoWizard` - Container principal
   - `StepIndicator` - Indicador de progreso
   - `FormSteps` - Componentes para cada paso

¿Puedes darme claridad en estos puntos? Con eso podré crear un prompt perfecto para Copilot. 🚀


Respuesta a preguntas:
1) Solo que lo datos estén en memoria en la sesión.
Sí, totalmente, mostrar mensaje de confirmación de volver al Dashboard
2) Muestra datos aleatorios. 
En resultado lo mismo, los que has puesto están ok
Yo luego, para cada tipo de Cálculo, realizaré un pedido minucioso
3) POr ahora no hagas validaciones de datos
4) Si, me gusta el indicador de proceso moderno stepper visual
El estilo de los botones siguiente y anterior te pido que lo puedas definir o asesorarme tú con tu experiencia. Debe ser moderno. Recuerda que vamos a diseñar ésto de manera responsive.
5) Creemos un nuevo componente Card. Y que cada botón tenga un color distinto, en lo posible de la misma paleta de colores, paraq ue no sea tan agresivo el cambio entre un botón y otro
6) En móvil realiza lo mejor. Creoque el flujo vertical es lo mejor.
7) Cadas tipo de Cálculo pedirá datos distintos. COmo quiero mostrar el avance de la maqueta, no cambiemos nada por ahora, es decir, todos los Tipos de cálculos mostrarán lo mismo a excepción de la Descripción que detallé para cada uno.
Excelentes sugerencias. GRACIAS

Puedes darme un prompt con ésto para avanzar?





Respuesta:

Summarized conversation history# Prompt para Implementar "Nuevo Cálculo de Honorarios" - Wizard Multi-Step

## Contexto del Proyecto
CH2026 es un mockup de gestión de cálculo de honorarios para CPAU, desarrollado con React+Vite. Ya tiene autenticación, dashboard y estructura base. Ahora implementaremos el flujo completo del wizard de cálculo.

## Objetivo
Implementar dos páginas principales:
1. **Página de Selección** (`/nuevo-calculo`): Muestra 4 tipos de cálculo en cards con colores distintivos
2. **Página de Proceso** (`/proceso-calculo`): Wizard de 6 pasos con stepper visual moderno

---

## 1. PÁGINA DE SELECCIÓN DE TIPO DE CÁLCULO

### Ruta y Componente
- **Path**: `/nuevo-calculo`
- **Componente**: NuevoCalculoPage.jsx

### Diseño Visual
- **Layout**: Grid responsivo de 4 cards con espaciado uniforme
- **Responsive**: 
  - Desktop: 2 columnas (2x2)
  - Tablet: 2 columnas
  - Mobile: 1 columna (flujo vertical)

### Cards de Tipo de Cálculo
Crear componente reutilizable `App/Frontend/src/components/common/CalculationTypeCard.jsx`:

**4 Tipos de Cálculo** (cada uno con color de acento diferente de la paleta):

1. **Cálculo Básico**
   - Color: `#2D5016` (verde - primary)
   - Ícono: `FaCalculator`
   - Descripción: "Cálculo rápido basado en parámetros básicos del proyecto"

2. **Arancel CPAU**
   - Color: `#D4A574` (marrón - secondary)
   - Ícono: `FaFileInvoiceDollar`
   - Descripción: "Cálculo según tablas oficiales de aranceles del CPAU"

3. **Costo + Arancel**
   - Color: `#A8DADC` (celeste - accent)
   - Ícono: `FaChartLine`
   - Descripción: "Cálculo combinado de costos del proyecto más arancel profesional"

4. **Personalizado**
   - Color: `#457B9D` (azul más oscuro - complementario)
   - Ícono: `FaCog`
   - Descripción: "Cálculo personalizado con parámetros definidos por el usuario"

### Diseño del Card
```jsx
// Características del CalculationTypeCard:
- Elevación/sombra sutil (box-shadow)
- Hover: elevación mayor + escala sutil (transform: scale(1.02))
- Borde superior grueso (4px) con el color distintivo
- Padding generoso (24px)
- Ícono grande (48px) en el color distintivo
- Título bold
- Descripción en texto gris
- Cursor pointer
- Transición suave en hover (0.3s ease)
```

### Navegación
Al hacer clic en cualquier card:
```javascript
navigate('/proceso-calculo', { 
  state: { 
    tipo: 'Básico' | 'Arancel CPAU' | 'Costo+Arancel' | 'Personalizado',
    descripcion: '[descripción del tipo]'
  } 
})
```

---

## 2. PÁGINA DE PROCESO DE CÁLCULO (WIZARD)

### Ruta y Componente
- **Path**: `/proceso-calculo`
- **Componente**: `App/Frontend/src/pages/ProcesoCalculoPage.jsx`

### Estado del Wizard
```javascript
// State management en memoria (useState)
const [currentStep, setCurrentStep] = useState(0);
const [formData, setFormData] = useState({
  // Paso 1: Datos Principales
  nombreProyecto: '',
  cliente: '',
  ubicacion: '',
  tipoObra: '',
  
  // Paso 2: Datos Específicos
  superficieCubierta: '',
  superficieTotal: '',
  valorObra: '',
  
  // Paso 3: Datos Adicionales
  complejidad: '',
  plazoEjecucion: '',
  observaciones: '',
  
  // Metadata
  tipoCalculo: location.state?.tipo || 'Básico',
  descripcionTipo: location.state?.descripcion || ''
});
```

### Estructura de 6 Pasos

**PASO 0: Datos Principales**
- Nombre del Proyecto (input text)
- Cliente (input text)
- Ubicación (input text)
- Tipo de Obra (select: Vivienda, Edificio, Industrial, Comercial)

**PASO 1: Datos Específicos**
- Superficie Cubierta m² (input number)
- Superficie Total m² (input number)
- Valor Estimado de Obra $ (input number)

**PASO 2: Datos Adicionales**
- Complejidad (select: Baja, Media, Alta)
- Plazo de Ejecución meses (input number)
- Observaciones (textarea)

**PASO 3: Revisión**
- Mostrar TODOS los datos ingresados en formato tabla/lista
- Descripción del tipo de cálculo seleccionado
- Sin campos editables (solo lectura)

**PASO 4: Cálculo**
- Mostrar spinner/loading durante 1.5 segundos
- Simular procesamiento
- Avanzar automáticamente al resultado

**PASO 5: Resultado**
Mostrar tabla con datos aleatorios (mock):
```javascript
// Ejemplo de datos a mostrar:
{
  honorariosProfesionales: [valor aleatorio entre 500000-2000000],
  impuestos: [21% del valor],
  gastosAdministrativos: [5% del valor],
  totalGeneral: [suma total],
  
  // Grid adicional con desglose
  items: [
    { concepto: 'Proyecto arquitectónico', horas: random(50-150), tarifa: 15000, subtotal: horas*tarifa },
    { concepto: 'Dirección de obra', horas: random(100-300), tarifa: 18000, subtotal: horas*tarifa },
    { concepto: 'Cómputos y presupuestos', horas: random(30-80), tarifa: 12000, subtotal: horas*tarifa },
    { concepto: 'Documentación municipal', horas: random(20-60), tarifa: 14000, subtotal: horas*tarifa }
  ]
}
```

---

## 3. STEPPER VISUAL MODERNO

### Diseño del Stepper
Crear componente `App/Frontend/src/components/wizard/StepperProgress.jsx`:

```jsx
// Características del Stepper:
- Posición: Top de la página, sticky o fijo
- Layout horizontal con 6 círculos conectados por líneas
- Cada paso muestra:
  * Número del paso (1-6)
  * Label del paso (ocultar en móvil, solo mostrar en tablet+)
  * Estado: completed (✓), current (activo), pending (gris)

// Estilos de estados:
- Completed: círculo con fondo verde (#2D5016), ícono check blanco
- Current: círculo con fondo celeste (#A8DADC), borde grueso, número destacado
- Pending: círculo gris claro (#E5E7EB), número gris

// Líneas conectoras:
- Completed: línea verde sólida
- Pending: línea gris discontinua (dashed)

// Responsive:
- Desktop: mostrar números + labels
- Tablet: mostrar números + labels cortos
- Mobile: solo números, más compacto
```

### Labels de los Pasos
1. "Datos Principales"
2. "Datos Específicos"
3. "Datos Adicionales"
4. "Revisión"
5. "Cálculo"
6. "Resultado"

---

## 4. NAVEGACIÓN Y BOTONES

### Botones Anterior/Siguiente

**Diseño Moderno Recomendado**:
```jsx
// Contenedor de botones:
- Position: Fixed bottom con backdrop blur o sticky
- Flex: space-between
- Padding: 20px
- Background: blur(10px) con opacity
- Box-shadow sutil hacia arriba

// Botón "Anterior":
- Variante: Secondary/Outline
- Ícono: FaChevronLeft
- Color: gris con hover más oscuro
- Disabled en paso 0

// Botón "Siguiente":
- Variante: Primary/Solid
- Ícono: FaChevronRight (al final)
- Color: gradiente sutil del verde primary
- Texto: "Siguiente" (pasos 0-3), "Revisar" (paso 3), "Calcular" (paso 4), "Finalizar" (paso 5)
- Animación: pulse sutil en hover

// Responsive:
- Desktop: botones con padding generoso, width auto
- Mobile: botones fullwidth con menos padding vertical
```

### Lógica de Navegación
```javascript
// Paso 4 (Cálculo): auto-avanzar tras 1.5s
// Paso 5 (Resultado): botón "Finalizar" → mostrar modal de confirmación

// Al hacer clic en "Finalizar":
Modal de confirmación:
- Título: "¿Desea volver al Dashboard?"
- Mensaje: "El cálculo ha sido completado. Los datos no se guardarán."
- Botones:
  * "Volver al Dashboard" → navigate('/dashboard')
  * "Permanecer aquí" → cerrar modal
```

---

## 5. RESPONSIVE DESIGN

### Breakpoints
```css
/* Mobile: < 768px */
- Stepper compacto (solo números)
- Cards de selección: 1 columna
- Wizard: formulario full-width
- Botones: full-width stacked

/* Tablet: 768px - 1024px */
- Stepper con labels cortos
- Cards: 2 columnas
- Wizard: formulario con max-width 600px centrado
- Botones: inline con espacio between

/* Desktop: > 1024px */
- Stepper completo con labels
- Cards: 2x2 grid con max-width 900px
- Wizard: formulario con max-width 700px centrado
- Botones: inline con padding generoso
```

---

## 6. COMPONENTES A CREAR

### Nuevos Archivos
1. NuevoCalculoPage.jsx
2. `App/Frontend/src/pages/NuevoCalculoPage.module.css`
3. `App/Frontend/src/pages/ProcesoCalculoPage.jsx`
4. `App/Frontend/src/pages/ProcesoCalculoPage.module.css`
5. `App/Frontend/src/components/common/CalculationTypeCard.jsx`
6. `App/Frontend/src/components/common/CalculationTypeCard.module.css`
7. `App/Frontend/src/components/wizard/StepperProgress.jsx`
8. `App/Frontend/src/components/wizard/StepperProgress.module.css`
9. `App/Frontend/src/components/wizard/WizardNavigation.jsx`
10. `App/Frontend/src/components/wizard/WizardNavigation.module.css`

### Actualizar Archivos
- App.jsx: Añadir rutas `/nuevo-calculo` y `/proceso-calculo`

---

## 7. ESPECIFICACIONES TÉCNICAS

### Sin Validaciones
- **NO implementar validaciones de campos por ahora**
- Permitir avanzar sin datos completos
- Focus en flujo visual y UX

### Datos Aleatorios
```javascript
// Función helper para generar valores random
const generateMockResults = () => ({
  honorariosProfesionales: Math.floor(Math.random() * (2000000 - 500000) + 500000),
  // ... resto de cálculos basados en este valor
});
```

### Mismos Datos para Todos los Tipos
- Los 4 tipos de cálculo mostrarán los mismos pasos y campos
- **ÚNICA DIFERENCIA**: Descripción del tipo de cálculo en paso de Revisión y Resultado
- Preparar estructura para futura diferenciación

---

## 8. PALETA DE COLORES DEFINITIVA

```css
:root {
  --color-primary: #2D5016;      /* Verde oscuro - Básico */
  --color-secondary: #D4A574;     /* Marrón - Arancel CPAU */
  --color-accent: #A8DADC;        /* Celeste - Costo+Arancel */
  --color-complementary: #457B9D; /* Azul - Personalizado */
  
  --color-success: #10B981;       /* Para estados completados */
  --color-gray-100: #F3F4F6;
  --color-gray-300: #D1D5DB;
  --color-gray-500: #6B7280;
  --color-gray-700: #374151;
}
```

---

## 9. ICONOS NECESARIOS (React Icons)

```javascript
import { 
  FaCalculator,           // Cálculo Básico
  FaFileInvoiceDollar,    // Arancel CPAU
  FaChartLine,            // Costo+Arancel
  FaCog,                  // Personalizado
  FaChevronLeft,          // Anterior
  FaChevronRight,         // Siguiente
  FaCheck,                // Completado en stepper
  FaSpinner               // Loading en paso Cálculo
} from 'react-icons/fa';
```

---

## 10. COMPORTAMIENTO ESPERADO

1. Usuario hace clic en "Nuevo Cálculo de Honorarios" desde Dashboard
2. Se muestra página con 4 cards de tipos de cálculo
3. Usuario selecciona un tipo (ej: "Arancel CPAU")
4. Navega a wizard mostrando stepper con 6 pasos
5. Usuario completa formularios (puede dejar campos vacíos)
6. Usa botones Anterior/Siguiente para navegar
7. En paso "Revisión" ve resumen de datos
8. En paso "Cálculo" ve loading 1.5s y avanza auto
9. En paso "Resultado" ve tabla con datos mock aleatorios
10. Hace clic en "Finalizar"
11. Modal pregunta si volver a Dashboard
12. Usuario confirma y vuelve a Dashboard (datos no persisten)

---

**IMPORTANTE**: 
- Priorizar UX fluida y diseño moderno
- Código limpio y componentizado
- CSS Modules para todos los estilos
- Mobile-first approach
- Accesibilidad básica (aria-labels, keyboard navigation)

¿Listo para implementar? 🚀