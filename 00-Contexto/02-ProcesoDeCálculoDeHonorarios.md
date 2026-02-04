# Proceso de Cálculo de Honorarios - Documentación Técnica

**Proyecto**: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Versión**: 1.0 - Mockup Inicial  
**Fecha**: Febrero 2026  
**Objetivo**: Mockup funcional para demostración al cliente

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Tipos de Cálculo](#tipos-de-cálculo)
3. [Arquitectura de Componentes](#arquitectura-de-componentes)
4. [Flujo de Navegación](#flujo-de-navegación)
5. [Estructura de Datos](#estructura-de-datos)
6. [Consideraciones para Desarrollo Futuro](#consideraciones-para-desarrollo-futuro)
7. [Mejoras Planificadas](#mejoras-planificadas)

---

## 🎯 Descripción General

El módulo de **Cálculo de Honorarios** permite a los profesionales matriculados del CPAU calcular sus honorarios según diferentes metodologías, cada una adaptada a distintos tipos de proyectos y complejidades.

### Características Principales

- **Multi-metodología**: 4 tipos de cálculo distintos
- **Wizard interactivo**: Proceso guiado paso a paso
- **Datos en memoria**: No persiste datos (versión mockup)
- **Responsive**: Diseño adaptable a móvil, tablet y desktop
- **UX moderna**: Stepper visual con indicadores de progreso

---

## 🧮 Tipos de Cálculo

### 1. Honorarios de Especialidades – Básico

**Descripción**: Cálculo de honorarios desarrollado para utilizarse como referencia a partir de obras de construcción estándares con materiales y procedimientos involucrados comunes en el mercado.

**Características**:
- **Complejidad**: Baja
- **Datos requeridos**: Mínimos (proyecto, cliente, superficies básicas)
- **Pasos**: 6 (Datos Principales → Específicos → Adicionales → Revisión → Cálculo → Resultado)
- **Color identificador**: `#2D5016` (Verde - Primary)
- **Ícono**: `FaCalculator`

**Casos de uso**:
- Proyectos estándar residenciales
- Construcciones con procedimientos comunes
- Cálculos rápidos de referencia

---

### 2. Arancel CPAU

**Descripción**: Arancel propuesto por el CPAU en su resolución número 3220 y actualizaciones, a partir de un índice K de referencia y haciendo hincapié de manera detallada en cada tarea y rol que puede desarrollar el profesional matriculado.

**Características**:
- **Complejidad**: Alta (el más completo)
- **Datos requeridos**: Extensos y detallados
- **Pasos**: 6+ (ampliable según tareas profesionales)
- **Color identificador**: `#D4A574` (Marrón - Secondary)
- **Ícono**: `FaFileInvoiceDollar`

**Casos de uso**:
- Proyectos formales con documentación oficial
- Cálculos según normativa CPAU
- Proyectos con múltiples tareas profesionales

**Variables específicas**:
- Índice K de referencia
- Tabla de tareas profesionales (17 categorías)
- Multiplicadores por complejidad
- Coeficientes por rol profesional

---

### 3. Cálculo Costo de Obra + Arancel CPAU

**Descripción**: Cálculo basado en el Arancel CPAU, tomando como base el Cálculo de Costo de Obra realizado previamente de manera detallada.

**Características**:
- **Complejidad**: Media-Alta
- **Datos requeridos**: Costo de obra detallado + datos CPAU
- **Pasos**: 6+ (incluye análisis de costos)
- **Color identificador**: `#A8DADC` (Celeste - Accent)
- **Ícono**: `FaChartLine`

**Casos de uso**:
- Proyectos con presupuesto detallado previo
- Obras con análisis de costos completo
- Honorarios basados en porcentaje de obra

**Variables específicas**:
- Costo total de obra
- Porcentajes por partida
- Índices de ajuste temporal
- Multiplicadores por etapa

---

### 4. Cálculo Personalizado

**Descripción**: Cálculo que permite al usuario cambiar los valores de referencia y los índices para poder analizar impacto de esos cambios en el resultado final.

**Características**:
- **Complejidad**: Variable (configurable)
- **Datos requeridos**: Personalizables por el usuario
- **Pasos**: 6+ (flexibles según configuración)
- **Color identificador**: `#457B9D` (Azul - Complementary)
- **Ícono**: `FaCog`

**Casos de uso**:
- Análisis de escenarios (what-if)
- Proyectos con particularidades únicas
- Calibración de parámetros
- Estudios comparativos

**Variables específicas**:
- Todos los índices modificables
- Factores de ajuste personalizados
- Fórmulas paramétricas
- Ponderaciones configurables

---

## 🏗️ Arquitectura de Componentes

### Estructura de Archivos

```
app/frontend/src/
├── pages/
│   ├── NuevoCalculoPage.jsx              # Selección de tipo de cálculo
│   ├── NuevoCalculoPage.module.css
│   ├── ProcesoCalculoPage.jsx            # Wizard de cálculo
│   └── ProcesoCalculoPage.module.css
│
├── components/
│   ├── common/
│   │   ├── CalculationTypeCard.jsx      # Card de selección de tipo
│   │   └── CalculationTypeCard.module.css
│   │
│   └── wizard/
│       ├── StepperProgress.jsx          # Indicador de progreso visual
│       ├── StepperProgress.module.css
│       ├── WizardNavigation.jsx         # Botones Anterior/Siguiente
│       └── WizardNavigation.module.css
│
└── App.jsx                               # Rutas configuradas
```

---

### Componentes Principales

#### 1. **NuevoCalculoPage** (Página de Selección)

**Responsabilidad**: Presentar los 4 tipos de cálculo disponibles

**Props**: Ninguno (página raíz)

**State**: Ninguno (stateless, solo navegación)

**Navegación**:
```javascript
navigate('/proceso-calculo', { 
  state: { 
    tipo: string,           // Nombre del tipo de cálculo
    descripcion: string     // Descripción completa
  } 
})
```

---

#### 2. **CalculationTypeCard** (Tarjeta de Tipo)

**Responsabilidad**: Renderizar una opción de tipo de cálculo

**Props**:
```javascript
{
  title: string,          // Título del tipo de cálculo
  description: string,    // Descripción breve
  icon: ReactComponent,   // Ícono de React Icons
  color: string,          // Color de acento (hex)
  tipo: string           // Identificador para navegación
}
```

**Características**:
- Hover interactivo (escala + elevación)
- Borde superior con color distintivo
- Accesible (keyboard navigation, aria-labels)

---

#### 3. **ProcesoCalculoPage** (Wizard de Cálculo)

**Responsabilidad**: Gestionar el flujo completo de 6 pasos del cálculo

**State Management**:
```javascript
const [currentStep, setCurrentStep] = useState(0);        // Paso actual (0-5)
const [formData, setFormData] = useState({...});          // Datos del formulario
const [calculating, setCalculating] = useState(false);    // Estado de cálculo
const [results, setResults] = useState(null);             // Resultados generados
const [showModal, setShowModal] = useState(false);        // Modal de confirmación
const [acceptedTerms, setAcceptedTerms] = useState(false);// Aceptación de términos
```

**Pasos del Wizard**:
1. **Paso 0 - Datos Principales**: Nombre proyecto, cliente, ubicación, tipo de obra
2. **Paso 1 - Datos Específicos**: Superficies, valor estimado
3. **Paso 2 - Datos Adicionales**: Complejidad, plazo, observaciones
4. **Paso 3 - Revisión**: Resumen de todos los datos (solo lectura)
5. **Paso 4 - Cálculo**: Spinner con auto-avance (1.5s)
6. **Paso 5 - Resultado**: Tabla de honorarios + disclaimer + checkbox de términos

---

#### 4. **StepperProgress** (Indicador de Progreso)

**Responsabilidad**: Mostrar progreso visual del wizard

**Props**:
```javascript
{
  currentStep: number,    // Paso actual (0-5)
  steps: string[]        // Array de labels de pasos
}
```

**Estados Visuales**:
- **Completed** (completado): Círculo verde con check ✓
- **Current** (actual): Círculo celeste con borde grueso
- **Pending** (pendiente): Círculo gris claro

**Responsive**:
- Desktop: Círculos + labels completos
- Tablet: Círculos + labels abreviados
- Mobile: Solo círculos compactos

---

#### 5. **WizardNavigation** (Navegación)

**Responsabilidad**: Botones de navegación entre pasos

**Props**:
```javascript
{
  currentStep: number,      // Paso actual
  totalSteps: number,       // Total de pasos
  onPrevious: Function,     // Callback anterior
  onNext: Function,         // Callback siguiente
  nextLabel?: string        // Label personalizado (opcional)
}
```

**Comportamiento**:
- **Paso 0**: Botón "Anterior" = "Cambiar Tipo de Cálculo" → vuelve a selección
- **Pasos 1-2**: "Anterior" / "Siguiente"
- **Paso 3**: "Anterior" / "Revisar"
- **Paso 4**: No muestra botones (auto-avance)
- **Paso 5**: "Anterior" / "Finalizar" → modal de confirmación

---

## 🔄 Flujo de Navegación

### Diagrama de Flujo

```
Dashboard
    ↓
[Nuevo Cálculo de Honorarios]
    ↓
NuevoCalculoPage (Selección)
    ├─→ Honorarios Básico ─────┐
    ├─→ Arancel CPAU ──────────┤
    ├─→ Costo + Arancel ───────┼─→ ProcesoCalculoPage
    └─→ Personalizado ─────────┘
                ↓
        [Wizard 6 Pasos]
                ↓
    Paso 0: Datos Principales
                ↓
    Paso 1: Datos Específicos
                ↓
    Paso 2: Datos Adicionales
                ↓
    Paso 3: Revisión
                ↓
    Paso 4: Cálculo (auto)
                ↓
    Paso 5: Resultado
                ↓
         [Finalizar]
                ↓
    Modal: "¿Volver al Dashboard?"
        ├─→ Sí → Dashboard
        └─→ No → Permanece en Resultado
```

---

## 💾 Estructura de Datos

### FormData (Estado del Wizard)

```javascript
{
  // Metadata del tipo de cálculo
  tipoCalculo: string,              // "Honorarios de Especialidades – Básico"
  descripcionTipo: string,          // Descripción completa del tipo
  
  // Paso 0: Datos Principales
  nombreProyecto: string,           // Nombre descriptivo del proyecto
  cliente: string,                  // Nombre del cliente
  ubicacion: string,                // Ciudad, Provincia
  tipoObra: string,                 // "Vivienda" | "Edificio" | "Industrial" | "Comercial"
  
  // Paso 1: Datos Específicos
  superficieCubierta: string,       // m² cubiertos
  superficieTotal: string,          // m² totales
  valorObra: string,                // $ estimado de la obra
  
  // Paso 2: Datos Adicionales
  complejidad: string,              // "Baja" | "Media" | "Alta"
  plazoEjecucion: string,           // Meses estimados
  observaciones: string             // Texto libre
}
```

---

### Results (Resultados del Cálculo)

```javascript
{
  // Resumen financiero
  honorariosProfesionales: number,  // Monto base de honorarios
  impuestos: number,                // 21% IVA
  gastosAdministrativos: number,    // 5% gastos
  totalGeneral: number,             // Suma total
  
  // Desglose detallado
  items: [
    {
      concepto: string,             // "Proyecto arquitectónico"
      horas: number,                // Horas estimadas
      tarifa: number,               // Tarifa por hora
      subtotal: number              // horas × tarifa
    },
    // ... más ítems
  ]
}
```

**Generación de Datos Mock**:
```javascript
const generateMockResults = () => {
  const baseHonorarios = Math.floor(Math.random() * (2000000 - 500000) + 500000);
  const impuestos = Math.floor(baseHonorarios * 0.21);
  const gastosAdmin = Math.floor(baseHonorarios * 0.05);
  const total = baseHonorarios + impuestos + gastosAdmin;
  
  const items = [
    { concepto: 'Proyecto arquitectónico', horas: random(50-150), tarifa: 15000 },
    { concepto: 'Dirección de obra', horas: random(100-300), tarifa: 18000 },
    { concepto: 'Cómputos y presupuestos', horas: random(30-80), tarifa: 12000 },
    { concepto: 'Documentación municipal', horas: random(20-60), tarifa: 14000 }
  ].map(item => ({ ...item, subtotal: item.horas * item.tarifa }));
  
  return { honorariosProfesionales: baseHonorarios, impuestos, gastosAdmin, total, items };
};
```

---

## 🔮 Consideraciones para Desarrollo Futuro

### 1. Características Comunes a Todos los Tipos de Cálculo

Aunque cada tipo de cálculo tiene sus particularidades, **todos comparten**:

#### a) **Datos Principales Comunes**
- Información básica del proyecto (nombre, cliente, ubicación)
- Tipo de obra o actividad profesional
- Superficie o alcance general

**Implementación futura**:
```javascript
// Base común para todos los tipos
const baseFormFields = {
  proyecto: { required: true, type: 'text' },
  cliente: { required: true, type: 'text' },
  ubicacion: { required: true, type: 'text' },
  tipoActividad: { required: true, type: 'select', options: [...] }
};

// Extensión específica por tipo
const especificoPorTipo = {
  'Arancel CPAU': {
    ...baseFormFields,
    tareaProfesional: { required: true, type: 'select', options: tareasProfesionales },
    indiceK: { required: true, type: 'number' },
    // ... más campos específicos
  },
  'Básico': {
    ...baseFormFields,
    superficieCubierta: { required: true, type: 'number' }
  }
  // ... otros tipos
};
```

---

#### b) **Pasos Dinámicos (1 a N)**

Cada tipo de cálculo puede tener diferente cantidad de pasos:
- **Básico**: 6 pasos fijos
- **Arancel CPAU**: 8-10 pasos (dependiendo de tareas seleccionadas)
- **Costo + Arancel**: 7-9 pasos (incluye análisis de costos)
- **Personalizado**: Variable (configurado por usuario)

**Arquitectura recomendada**:
```javascript
// Configuración de pasos por tipo de cálculo
const stepConfigByType = {
  'Honorarios de Especialidades – Básico': {
    steps: [
      { id: 'main', label: 'Datos Principales', component: MainDataStep },
      { id: 'specific', label: 'Datos Específicos', component: SpecificDataStep },
      { id: 'additional', label: 'Datos Adicionales', component: AdditionalDataStep },
      { id: 'review', label: 'Revisión', component: ReviewStep },
      { id: 'calculate', label: 'Cálculo', component: CalculateStep },
      { id: 'result', label: 'Resultado', component: ResultStep }
    ]
  },
  'Arancel CPAU': {
    steps: [
      { id: 'main', label: 'Datos Principales', component: MainDataStep },
      { id: 'tasks', label: 'Tareas Profesionales', component: TasksStep },
      { id: 'coefficients', label: 'Coeficientes', component: CoefficientsStep },
      { id: 'multipliers', label: 'Multiplicadores', component: MultipliersStep },
      // ... más pasos específicos
    ]
  }
  // ... otros tipos
};

// Renderizado dinámico
const renderCurrentStep = () => {
  const config = stepConfigByType[formData.tipoCalculo];
  const StepComponent = config.steps[currentStep].component;
  return <StepComponent data={formData} onChange={handleInputChange} />;
};
```

---

#### c) **Variables, Índices y Condiciones Específicas**

Cada tipo tiene su propia lógica de cálculo:

**Arancel CPAU**:
```javascript
const calcularArancelCPAU = (datos) => {
  const { indiceK, superficieCubierta, tareaProfesional, complejidad } = datos;
  
  // Tabla de tareas con factores base
  const factoresTarea = {
    'PYDOA': 1.0,
    'PYDEI': 0.85,
    'HYS': 0.60,
    // ... 17 tareas
  };
  
  // Multiplicadores por complejidad
  const multiplicadoresComplejidad = {
    'Baja': 0.8,
    'Media': 1.0,
    'Alta': 1.3
  };
  
  // Fórmula CPAU
  const honorarioBase = indiceK * superficieCubierta * factoresTarea[tareaProfesional];
  const honorarioAjustado = honorarioBase * multiplicadoresComplejidad[complejidad];
  
  return {
    base: honorarioBase,
    ajustado: honorarioAjustado,
    impuestos: honorarioAjustado * 0.21,
    total: honorarioAjustado * 1.21
  };
};
```

**Costo + Arancel**:
```javascript
const calcularCostoMasArancel = (datos) => {
  const { costoObra, etapasProyecto, porcentajeHonorarios } = datos;
  
  // Porcentajes por etapa
  const porcentajesPorEtapa = {
    'Anteproyecto': 0.15,
    'Proyecto': 0.35,
    'Dirección': 0.40,
    'Certificación final': 0.10
  };
  
  let honorarioTotal = 0;
  etapasProyecto.forEach(etapa => {
    honorarioTotal += costoObra * porcentajeHonorarios * porcentajesPorEtapa[etapa];
  });
  
  return {
    porEtapa: etapasProyecto.map(e => ({
      etapa: e,
      monto: costoObra * porcentajeHonorarios * porcentajesPorEtapa[e]
    })),
    total: honorarioTotal
  };
};
```

**Personalizado**:
```javascript
const calcularPersonalizado = (datos, configuracion) => {
  // Fórmula completamente configurable
  const { formula, parametros, condiciones } = configuracion;
  
  // Evaluar fórmula con parámetros personalizados
  const resultado = evaluarFormula(formula, {
    ...datos,
    ...parametros
  });
  
  // Aplicar condiciones if-then
  condiciones.forEach(cond => {
    if (evaluarCondicion(cond.if, datos)) {
      resultado[cond.variable] *= cond.factor;
    }
  });
  
  return resultado;
};
```

---

#### d) **Persistencia de Datos (Futuro)**

**Datos importantes a persistir** para estadísticas y análisis:

```javascript
// Modelo de base de datos propuesto
const CalculoHonorarios = {
  id: UUID,
  
  // Metadata
  fechaCalculo: DateTime,
  usuarioId: UUID,
  tipoCalculo: string,
  
  // Datos del proyecto
  proyecto: {
    nombre: string,
    cliente: string,
    ubicacion: string,
    tipoObra: string
  },
  
  // Datos específicos (JSON flexible por tipo)
  datosEspecificos: JSON,
  
  // Resultados
  resultados: {
    honorariosProfesionales: decimal,
    impuestos: decimal,
    gastosAdministrativos: decimal,
    totalGeneral: decimal,
    desglose: JSON
  },
  
  // Para comparaciones futuras
  indicesUtilizados: JSON,      // Registro de índices en ese momento
  variablesAplicadas: JSON,      // Variables y factores usados
  
  // Control
  estado: 'BORRADOR' | 'CALCULADO' | 'APROBADO' | 'FACTURADO',
  version: integer,              // Versionado de cálculos
  
  // Auditoría
  creadoEn: DateTime,
  actualizadoEn: DateTime
};
```

**API REST propuesta**:
```javascript
// Endpoints necesarios
POST   /api/calculos                    // Crear nuevo cálculo
GET    /api/calculos/:id                // Obtener cálculo específico
PUT    /api/calculos/:id                // Actualizar cálculo
DELETE /api/calculos/:id                // Eliminar cálculo
GET    /api/calculos/usuario/:userId    // Listar cálculos del usuario
GET    /api/calculos/estadisticas       // Estadísticas generales

// Comparación de cálculos
POST   /api/calculos/comparar           // Comparar 2 o más cálculos
GET    /api/calculos/:id/historico      // Historial de versiones
```

---

#### e) **Informe Final (PDF)**

Todos los tipos generan un informe final descargable:

**Estructura del informe**:
```
┌─────────────────────────────────────────┐
│  CPAU - Consejo Profesional de         │
│  Arquitectura y Urbanismo               │
├─────────────────────────────────────────┤
│  CÁLCULO DE HONORARIOS PROFESIONALES    │
│  Tipo: [Tipo de Cálculo]                │
│  Fecha: [dd/mm/yyyy]                    │
└─────────────────────────────────────────┘

1. DATOS DEL PROYECTO
   - Nombre: ...
   - Cliente: ...
   - Ubicación: ...
   - Tipo de Obra: ...

2. DATOS ESPECÍFICOS
   [Variables según tipo de cálculo]

3. CÁLCULO DETALLADO
   [Tabla con desglose]

4. RESUMEN FINANCIERO
   - Honorarios Profesionales: $ ...
   - Impuestos (21%): $ ...
   - Gastos Administrativos: $ ...
   - TOTAL GENERAL: $ ...

5. CONDICIONES Y OBSERVACIONES
   [Disclaimer legal]
   
6. FIRMA Y SELLO
   Profesional: ...
   Matrícula: ...
```

**Implementación con React-PDF**:
```javascript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const InformeHonorariosPDF = ({ calculo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>CPAU - Cálculo de Honorarios</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.title}>1. DATOS DEL PROYECTO</Text>
        <Text>Nombre: {calculo.proyecto.nombre}</Text>
        {/* ... más datos */}
      </View>
      
      {/* ... más secciones */}
    </Page>
  </Document>
);
```

---

#### f) **Comparación de Cálculos (Futuro Estratégico)**

**Funcionalidad clave**: Permitir comparar cálculos para:
- Analizar variación de precios en el tiempo
- Comparar metodologías (Básico vs Arancel)
- Detectar tendencias de mercado
- Optimizar estrategia de honorarios

**Vista de comparación propuesta**:
```javascript
const ComparacionCalculos = ({ calculosIds }) => {
  const [calculos, setCalculos] = useState([]);
  
  useEffect(() => {
    // Cargar cálculos seleccionados
    fetchCalculos(calculosIds).then(setCalculos);
  }, [calculosIds]);
  
  return (
    <div className={styles.comparison}>
      <h2>Comparación de Cálculos</h2>
      
      {/* Tabla comparativa */}
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            {calculos.map(c => (
              <th key={c.id}>{c.proyecto.nombre}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tipo de Cálculo</td>
            {calculos.map(c => <td>{c.tipoCalculo}</td>)}
          </tr>
          <tr>
            <td>Fecha</td>
            {calculos.map(c => <td>{formatDate(c.fechaCalculo)}</td>)}
          </tr>
          <tr>
            <td>Total Honorarios</td>
            {calculos.map(c => <td>${c.resultados.totalGeneral}</td>)}
          </tr>
          {/* ... más filas */}
        </tbody>
      </table>
      
      {/* Gráfico comparativo */}
      <Chart 
        type="bar"
        data={calculos.map(c => ({
          label: c.proyecto.nombre,
          value: c.resultados.totalGeneral
        }))}
      />
      
      {/* Análisis de variación */}
      <div className={styles.analysis}>
        <h3>Análisis de Variación</h3>
        <p>Variación promedio: {calcularVariacion(calculos)}%</p>
        <p>Cálculo más alto: {encontrarMaximo(calculos)}</p>
        <p>Cálculo más bajo: {encontrarMinimo(calculos)}</p>
      </div>
    </div>
  );
};
```

---

## 🚀 Mejoras Planificadas

### Fase 1: Backend y Persistencia
- [ ] API REST con Node.js/Express o .NET Core
- [ ] Base de datos PostgreSQL o SQL Server
- [ ] Autenticación JWT con roles (Profesional, Admin)
- [ ] CRUD completo de cálculos
- [ ] Versionado de cálculos (historial)

### Fase 2: Lógica de Cálculo Real
- [ ] Implementar fórmulas del Arancel CPAU oficial
- [ ] Tablas de tareas profesionales (API)
- [ ] Sistema de índices y actualizaciones
- [ ] Validaciones de negocio
- [ ] Reglas de cálculo por tipo

### Fase 3: Reportes y Exportación
- [ ] Generación de PDF con React-PDF
- [ ] Exportación a Excel
- [ ] Envío por email
- [ ] Plantillas personalizables
- [ ] Firma digital (futuro)

### Fase 4: Estadísticas y Comparación
- [ ] Dashboard de estadísticas
- [ ] Comparador de cálculos
- [ ] Gráficos y tendencias
- [ ] Alertas de variación de índices
- [ ] Recomendaciones automáticas

### Fase 5: Integraciones
- [ ] Integración con sistema de facturación
- [ ] API pública para terceros
- [ ] Sincronización con calendario
- [ ] Webhooks para notificaciones
- [ ] Integración con CRM

---

## 📊 Datos de Referencia

### Tareas Profesionales (Arancel CPAU)

Lista completa de tareas para implementar en desplegable:

| Código | Descripción                                        | Factor Base |
|--------|---------------------------------------------------|-------------|
| PTA    | Planificación, Territorio y Ambiente              | 1.10        |
| PYDOA  | Proyecto y Dirección de Obras de Arquitectura     | 1.00        |
| PYDEI  | Proyecto y Dirección de estructuras e instalaciones | 0.85      |
| PYDD   | Proyecto y Dirección de Demoliciones              | 0.70        |
| HYS    | Higiene y Seguridad                               | 0.60        |
| RT     | Representaciones técnicas                         | 0.50        |
| SA     | Supervisiones/Auditorías                          | 0.75        |
| GPGC   | Gerencia de Proyecto/Gerencia de Construcciones   | 0.90        |
| CONS   | Consultas                                         | 0.40        |
| ASE    | Asesoramientos                                    | 0.45        |
| EST    | Estudios                                          | 0.80        |
| HAB    | Habilitaciones                                    | 0.55        |
| PER    | Peritajes                                         | 0.85        |
| TAS    | Tasaciones                                        | 0.65        |
| ARB    | Arbitrajes                                        | 0.95        |
| MED    | Medianería                                        | 0.50        |

*(Nota: Factores base son ejemplos, deben ajustarse según normativa oficial)*

---

## 🎨 Paleta de Colores

```css
:root {
  /* Colores principales por tipo de cálculo */
  --calc-basico: #2D5016;          /* Verde oscuro */
  --calc-arancel: #D4A574;         /* Marrón */
  --calc-costo-arancel: #A8DADC;   /* Celeste */
  --calc-personalizado: #457B9D;   /* Azul */
  
  /* Estados */
  --color-success: #10B981;        /* Verde éxito */
  --color-warning: #F59E0B;        /* Amarillo advertencia */
  --color-error: #EF4444;          /* Rojo error */
  --color-info: #3B82F6;           /* Azul información */
  
  /* Grises */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;
}
```

---

## 📝 Notas de Implementación Actual (v1.0 Mockup)

### Decisiones de Diseño

1. **Datos en Memoria**: Los datos del formulario solo existen durante la sesión del navegador. No se persisten en localStorage ni backend.

2. **Sin Validaciones**: Por decisión del cliente, no se implementaron validaciones de campos para esta versión mockup. Se puede avanzar entre pasos sin completar datos.

3. **Resultados Aleatorios**: Los cálculos generan valores aleatorios dentro de rangos predefinidos. No aplican fórmulas reales del CPAU.

4. **Tipos Unificados**: Los 4 tipos de cálculo muestran los mismos pasos y campos. Solo difieren en descripción y color.

5. **Labels Fijos**: Se implementaron labels siempre visibles en el borde superior de los inputs (estilo Material Design) para evitar confusión con placeholders.

### Limitaciones Conocidas

- No hay persistencia de datos
- No hay integración con backend
- Cálculos son simulados (mock)
- No hay exportación a PDF
- No hay comparación de cálculos
- Todos los tipos usan el mismo formulario

### Próximos Pasos Recomendados

1. **Implementar diferenciación por tipo**: Crear formularios específicos para cada tipo de cálculo
2. **Agregar backend**: API REST para persistencia
3. **Fórmulas reales**: Implementar lógica de cálculo del Arancel CPAU
4. **Validaciones**: Agregar validación de campos requeridos
5. **Exportación**: Generar PDF del informe final

---

## 🔗 Referencias

- **Resolución CPAU 3220**: Arancel oficial de honorarios
- **React Router v6**: Navegación entre páginas
- **React Icons**: Biblioteca de íconos
- **CSS Modules**: Sistema de estilos con scope local

---

## 👥 Contacto y Soporte

**Desarrollador**: neosis  
**Cliente**: CPAU (Consejo Profesional de Arquitectura y Urbanismo)  
**Proyecto**: CH2026 - Sistema de Gestión de Cálculo de Honorarios  

---

**Última actualización**: Febrero 2026  
**Versión del documento**: 1.0