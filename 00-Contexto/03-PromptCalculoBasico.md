Actúa como un ingeniero en prompting experto. Puedes afinar el siguiente pedido para Copilot?


Vamos a trabajar con el ticket #1, desarrollando el flujo del tipo de Cálculo de Cálculo de Honorario "### 1. Honorarios de Especialidades – Básico".
Seguimos en modo "maqueta". Ninguno de estos datos los vamos a persistir por ahora, solo vamos a pedir las variables y datos necesarios para el cálculo y mostrar su flujo, y el resultado según los datos ingresados.
Para ello, completaremos los parámetros de éste Tipo de Cálculo, según el desarrollo que hemos realizado.
1)	Recuerdo el Flujo de Navegación general
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

2)	Veremos en particular el del Cálculo "### 1. Honorarios de Especialidades – Básico".
Mostrar sólo lo que se indica a continuación, no debe haber nada más de lo que se muestra para los otros tipos de Cálculo en los pasos del Wizard.
2.1) Paso 1:
  // Paso 0: Datos Principales
  nombreProyecto: string,           // Nombre descriptivo del proyecto
  cliente: string,                  // Nombre del cliente
  ubicacion: string,                // Ciudad, Provincia
  tipoObra: string,                 // "Vivienda" | "Edificio" | "Industrial" | "Comercial"
  plazoEjecucion: string,           // Meses estimados
  observaciones: string             // Texto libre
  
  // Paso 1: Datos Específicos de la Obra
1.1 -  superficieTotal: string,          // m² totales
1.2 -  valorMetro2: string              // $ estimado m2 (expresado en Dólares)
1.3 -   cotizDolar: string                 // valor de la cotización del Dólar expresada en pesos argentinos $
1.4 - valorObra: string,                // $ estimado de la obra (1.1 * 1.2 * 1.3)
1.5 –   complejidad: string,              // "Baja" | "Media" | "Alta"
Modifica el valorObra (Opcional). Baja: multiplica valorObra * 0,9. Alta multiplica valor Obra * 1.1. Mediana, no hace nada.
  
  // Paso 2: Tareas profesionales a realizar
obraProyecto: String         // Realiza Proyecto de Obra “Si” o “No”
obraDireccion: String         // Realiza Dirección de Obra “Si” o “No”
instalacionSanitaria: String  // Realiza instalación Sanitaria “Si” o “No”
instalacionElectrica: String  // Realiza instalación Sanitaria “Si” o “No”
instalacionContraIncendio: String  // Realiza instalación Sanitaria “Si” o “No”
proyectoEstructuras: String  // Realiza proyecto de Estructuras “Si” o “No”
observacionesTareas: String  // Observaciones de las tareas:
Paso 3: Revisión
Enumerar lo ingresado en los pasos 0, 1 y 2 en una grilla.

Paso 4: Cálculo
Aquí se generan registros en una grilla con el detalle de los ítems que componen el Cálculo de Honorario en base a los datos ingresados.
Cuando estemos trabajando en el desarrollo de la persistencia de los datos, el cálculo lo hará un Stored procedure que llamaremos desde una API REST en nuestro backend.
ESTE PASO EN MODO MAQUETA SE HARÁ EN OTRO PROMPT. DEJAR COMO ESTA HOY

Paso 5
Resultado
Mostrar un disclaimer, más un reporte con un texto fijo informado por el CPAU, a modo de “Certificado” o “Constancia” de que se hizo el Cálculo dede la herramienta CPAU.












Analizando tu prompt actual, voy a refinarlo para que sea más claro, estructurado y accionable para Copilot. Aquí está la versión mejorada:

---

# PROMPT MEJORADO PARA COPILOT

## CONTEXTO
Estoy trabajando en el **Ticket #001** del desarrollo del cálculo "**Honorarios de Especialidades – Básico**" en el proyecto CH2026. 

**Modo de trabajo:** MAQUETA (sin persistencia de datos, solo flujo y cálculos en memoria)

**Objetivo:** Implementar los pasos específicos del wizard para el tipo de cálculo "Honorarios de Especialidades – Básico", diferenciándolo de los otros tipos de cálculo.

---

## ESPECIFICACIONES TÉCNICAS

### PASO 0: Datos Principales del Proyecto
**Campos a implementar:**

```javascript
{
  nombreProyecto: string,      // Input text, obligatorio
  cliente: string,             // Input text, obligatorio  
  ubicacion: string,           // Input text (Ciudad, Provincia)
  tipoObra: string,            // Select: "Vivienda" | "Edificio" | "Industrial" | "Comercial"
  plazoEjecucion: string,      // Input number (meses)
  observaciones: string        // Textarea (opcional)
}
```

---

### PASO 1: Datos Específicos de la Obra
**Campos a implementar:**

```javascript
{
  superficieTotal: number,     // Input number (m²)
  valorMetro2: number,         // Input number (USD/m²)
  cotizDolar: number,          // Input number (ARS por USD)
  valorObra: number,           // Campo calculado automáticamente (read-only)
                              // Fórmula: superficieTotal × valorMetro2 × cotizDolar
  complejidad: string         // Select: "Baja" | "Media" | "Alta"
}
```

**Lógica de cálculo automático:**
- `valorObra` se actualiza en tiempo real cuando cambian: superficieTotal, valorMetro2 o cotizDolar
- El `valorObra` se ajusta según complejidad (opcional):
  - **Baja:** valorObra × 0.9
  - **Media:** sin modificación
  - **Alta:** valorObra × 1.1

**Formato requerido:**
- valorObra: formato moneda ARS con separadores de miles

---

### PASO 2: Tareas Profesionales a Realizar
**Campos a implementar:**

Usar **radio buttons** para cada tarea con opciones "Sí" / "No":

```javascript
{
  obraProyecto: boolean,              // Radio: ¿Realiza Proyecto de Obra?
  obraDireccion: boolean,             // Radio: ¿Realiza Dirección de Obra?
  instalacionSanitaria: boolean,      // Radio: ¿Realiza Instalación Sanitaria?
  instalacionElectrica: boolean,      // Radio: ¿Realiza Instalación Eléctrica?
  instalacionContraIncendio: boolean, // Radio: ¿Realiza Instalación Contra Incendio?
  proyectoEstructuras: boolean,       // Radio: ¿Realiza Proyecto de Estructuras?
  observacionesTareas: string         // Textarea (opcional)
}
```

**Validación:**
- Debe seleccionarse al menos una tarea en "Sí" para avanzar

**Diseño sugerido:**
- Cada tarea en una fila
- Radio buttons alineados (Sí | No)
- Diseño limpio y scannable
-Agrupar en mismo div o frame (se indica con +):
obraProyecto+obraDireccion
instalacionSanitaria+instalacionElectrica+instalacionContraIncendio
proyectoEstructuras
observacionesTareas

---

### PASO 3: Revisión
**Componente:** Tabla/grilla de revisión (solo lectura)

**Contenido a mostrar:**

**Sección 1: Datos Principales**
- Nombre del Proyecto: [valor]
- Cliente: [valor]
- Ubicación: [valor]
- Tipo de Obra: [valor]
- Plazo de Ejecución: [valor] meses
- Observaciones: [valor]

**Sección 2: Datos de la Obra**
- Superficie Total: [valor] m²
- Valor por m²: USD [valor]
- Cotización Dólar: ARS [valor]
- Valor de Obra: ARS [valor] (mostrar si se aplicó ajuste por complejidad)
- Complejidad: [valor]

**Sección 3: Tareas Seleccionadas**
- Proyecto de Obra: [Sí/No]
- Dirección de Obra: [Sí/No]
- Instalación Sanitaria: [Sí/No]
- Instalación Eléctrica: [Sí/No]
- Instalación Contra Incendio: [Sí/No]
- Proyecto de Estructuras: [Sí/No]
- Observaciones Tareas: [valor]

**Funcionalidad:**
- Botón "Editar" en cada sección que vuelva al paso correspondiente

---

### PASO 4: Cálculo
**NO MODIFICAR EN ESTE TICKET**

Mantener el comportamiento actual (spinner + auto-avance). La lógica de cálculo real se implementará en otro ticket.

---

### PASO 5: Resultado
**Componente a crear:** ResultadoBasicoDetalle

**Estructura del resultado:**

**1. Header del Certificado**
```
═══════════════════════════════════════════════
    CPAU - CONSEJO PROFESIONAL DE 
    ARQUITECTURA Y URBANISMO
═══════════════════════════════════════════════
       CÁLCULO DE HONORARIOS PROFESIONALES
            Tipo: Honorarios de Especialidades - Básico
            Fecha: [fecha actual]
            Nº de Cálculo: [mock: random 6 dígitos]
═══════════════════════════════════════════════
```

**2. Disclaimer Legal**
```
IMPORTANTE: Este cálculo es una estimación de referencia basada 
en los datos proporcionados y factores estándar del mercado. 
Los valores finales pueden variar según condiciones particulares 
de cada proyecto. No constituye una cotización formal ni un 
compromiso contractual. Para un cálculo definitivo, consulte 
con un profesional matriculado del CPAU.

Vigencia de índices: Febrero 2026
Base de cálculo: Resolución CPAU 3220 (adaptada)
```

**Checkbox obligatorio:**
☐ He leído y acepto las condiciones del cálculo

**3. Resumen del Proyecto**
(Mostrar datos principales en formato card/resumen)

**4. Tabla de Resultados** (usar tabla mock actual, se reemplazará después)

**5. Botones de acción:**
- [Descargar PDF] (disabled con tooltip "Próximamente")
- [Guardar Cálculo] (disabled con tooltip "Próximamente")  
- [Nuevo Cálculo]
- [Volver al Dashboard]

---

## ARCHIVOS A MODIFICAR

### Crear nuevos componentes:
1. `src/components/wizard/steps/DatosPrincipalesBasico.jsx`
2. `src/components/wizard/steps/DatosObraBasico.jsx`
3. `src/components/wizard/steps/TareasProfesionalesBasico.jsx`
4. `src/components/wizard/steps/RevisionBasico.jsx`
5. `src/components/wizard/ResultadoBasicoDetalle.jsx`
6. Archivos CSS module correspondientes

### Modificar:
- `src/pages/ProcesoCalculoPage.jsx`: Agregar lógica para renderizar componentes específicos cuando `tipoCalculo === "Honorarios de Especialidades – Básico"`

---

## CRITERIOS DE ACEPTACIÓN

✅ Los campos específicos del cálculo básico se muestran solo cuando se selecciona ese tipo
✅ El cálculo de `valorObra` es automático y se actualiza en tiempo real
✅ Se aplica el ajuste por complejidad correctamente
✅ La validación de "al menos una tarea" funciona
✅ El paso de revisión muestra todos los datos correctamente formateados
✅ El disclaimer es visible y el checkbox es obligatorio para finalizar
✅ Los otros 3 tipos de cálculo NO se ven afectados (siguen con flujo mock actual)
✅ El diseño es responsive (mobile, tablet, desktop)
✅ No hay errores en consola del navegador

---

## NOTAS TÉCNICAS

- **Estrategia de implementación:** Usar condicionales en ProcesoCalculoPage basados en `formData.tipoCalculo`
- **Componentes reutilizables:** Los componentes comunes (Input, Button, etc.) ya existen, usarlos
- **Estado:** Todo se mantiene en el estado `formData` de ProcesoCalculoPage
- **Validaciones:** Por ahora solo verificar campos obligatorios, sin validaciones complejas
- **Formato de números:** Usar `Intl.NumberFormat` para monedas y números

---

¿Procedo con la implementación según estas especificaciones?

---

Este prompt mejorado es:
- ✅ Más estructurado y escaneable
- ✅ Específico en tipos de datos y componentes UI
- ✅ Claro en las validaciones y comportamientos
- ✅ Elimina ambigüedades
- ✅ Incluye criterios de aceptación claros
- ✅ Lista archivos específicos a crear/modificar

¿Te gustaría que ajuste algo más antes de usarlo con Copilot?