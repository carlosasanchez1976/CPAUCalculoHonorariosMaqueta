Actúa como un ingeniero en prompting experto. Puedes afinar el siguiente pedido para Copilot?

Vamos a trabajar con el ticket #3, desarrollando la lógica del cálculo de honorarios para este tipo en particular.
Una vez que el usuario está en el paso “Revisión”, cuando presiona “Siguiente” y llega al paso “Calcular”, se deberán generar en la grilla de detalle de Honorarios los elementos tal cual se dictan a continuación.
LA SUMA DE LOS VALORES DE “IMPORTE” EN ESA GRILLA SERÁ EL IMPORTE DEL HONORARIO SUGERIDO FINAL.
Se deben recorrer todos los optionbuttons del paso 2 con valor TRUE:
{
  obraProyecto: boolean,              // Radio: ¿Realiza Proyecto de Obra?
  obraDireccion: boolean,             // Radio: ¿Realiza Dirección de Obra?
  instalacionSanitaria: boolean,      // Radio: ¿Realiza Instalación Sanitaria?
  instalacionElectrica: boolean,      // Radio: ¿Realiza Instalación Eléctrica?
  instalacionContraIncendio: boolean, // Radio: ¿Realiza Instalación Contra Incendio?
  proyectoEstructuras: boolean,       // Radio: ¿Realiza Proyecto de Estructuras?
}
Ellos determinan los registros que habrán en la grilla de honorarios
Pasos para el cálculo del detalle de honorarios:
1)	Establecer el Rango de Costo de Obra
Recordar:
valorObra: number,       // Campo calculado automáticamente (read-only)
                                         // Fórmula: superficieTotal × valorMetro2 × cotizDolar
valorK: Parámetro en Memoria  // Se encuentra en la opción parámetros. Por default, el valor es 530536664,44
rangoCostoDeObra: number, // Campo calculado
                                       //valorObra / valorK

Con estos valores podremos calcular los honorarios de cualquier caso.
Generar grilla Honorarios en blanco con detalle de honorarios
Columnas:
Ítem (ID): Numérico
TareaProfesional: string
Descripción: String
Importe: number

2)	Agregar los ítems de Cálculo para las tareas profesionales seleccionadas.

2.1 – Proyecto de Obra (Si obraProyecto = true)
porcentajeTarea = 0,6
Si rangoCostoDeObra < 0,5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,14
coefRangoK= 0
Ítem= Nuevo valor consecutivo
TareaProfesional=”Proyecto de Obra”
Descripción= “Rango de Costos de Obra A (coef 14%)”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 0,5 y < 5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,08
coefRangoK= 0,03
Ítem= Nuevo valor consecutivo
TareaProfesional=”Proyecto de Obra”
Descripción= “Rango de Costos de Obra B (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Agregar Ítem= Nuevo valor consecutivo
TareaProfesional=”Proyecto de Obra”
Descripción= “Rango de Costos de Obra B (coef K = [coefRangoK*100])”
Importe= coefRangoK * valorK * porcentajeTarea

Si rangoCostoDeObra >= 5 y < 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,06
coefRangoK= 0,13
Ítem= Nuevo valor consecutivo
TareaProfesional=”Proyecto de Obra”
Descripción= “Rango de Costos de Obra C (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Agregar Ítem=  Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra C (coef K = [coefRangoK*100])”
Importe= coefRangoK * valorK * porcentajeTarea

Si rangoCostoDeObra >= 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,04
coefRangoK= 0,63
Ítem= Nuevo valor consecutivo 
TareaProfesional=”Proyecto de Obra”
Descripción= “Rango de Costos de Obra D (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Agregar Ítem= Nuevo valor consecutivo 
Descripción= “Rango de Costos de Obra D (coef K = [coefRangoK*100])”
Importe= coefRangoK * valorK * porcentajeTarea


2.2 – Proyecto de Obra (Si obraProyecto = true)
TareaProfesional=”Proyecto de Obra”
porcentajeTarea = 0,4

Si rangoCostoDeObra < 0,5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,14
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra A (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 0,5 y < 5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,08
coefRangoK= 0,03
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra B (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Agregar Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra B (coef K = [coefRangoK*100])”
Importe= coefRangoK * valorK * porcentajeTarea

Si rangoCostoDeObra >= 5 y < 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,06
coefRangoK= 0,13
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra C (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Agregar Ítem=  Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra C (coef K = [coefRangoK*100])”
Importe= coefRangoK * valorK * porcentajeTarea

Si rangoCostoDeObra >= 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,04
coefRangoK= 0,63
Ítem= Nuevo valor consecutivo 
Descripción= “Rango de Costos de Obra D (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Agregar Ítem= Nuevo valor consecutivo 
Descripción= “Rango de Costos de Obra D (coef K = [coefRangoK*100])”
Importe= coefRangoK * valorK * porcentajeTarea


2.3 – Proyecto de Instalación Sanitaria (Si instalacionanitaria = true)
TareaProfesional=”Proyecto de Instalación Sanitaria”
porcentajeTarea = 1

Si rangoCostoDeObra < 0,5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,0023
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra A (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 0,5 y < 5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,0012
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra B (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 5 y < 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,0008
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra C (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,0004
coefRangoK= 0
Ítem= Nuevo valor consecutivo 
Descripción= “Rango de Costos de Obra D (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea


2.4 – Proyecto de Instalación Eléctrica (Si instalacionElectrica = true)
TareaProfesional=”Proyecto de Instalación Eléctrica”
porcentajeTarea = 1

EL CALCULO ES EXACTAMENTE IGUAL QUE 2.3. Solo en las grillas SE DIFERENCIA LA TareaProfesional.

2.5 – Proyecto de Instalación contra Incendios (Si instalacionContraIncendio = true)
TareaProfesional=”Proyecto de Instalación contra incendios”
porcentajeTarea = 1

EL CALCULO ES EXACTAMENTE IGUAL QUE 2.3. Solo en las grillas SE DIFERENCIA LA TareaProfesional.


2.6 – Proyecto de Instalación de estructuras (Si proyectoEstructuras = true)
TareaProfesional=”Proyecto de Estruturas”
porcentajeTarea = 1

Si rangoCostoDeObra < 0,5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,0030
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra A (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 0,5 y < 5 entonces agregar en grilla Honorarios:

coefRangoObra= 0,0026
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra B (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 5 y < 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,0021
coefRangoK= 0
Ítem= Nuevo valor consecutivo
Descripción= “Rango de Costos de Obra C (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea

Si rangoCostoDeObra >= 25 entonces agregar en grilla Honorarios:
coefRangoObra= 0,0016
coefRangoK= 0
Ítem= Nuevo valor consecutivo 
Descripción= “Rango de Costos de Obra D (coef = [coefRangoObra*100])”
Importe= coefRangoObra * valorObra * porcentajeTarea













Sí, tengo todo. Voy a refinar este prompt para que sea claro, sin ambigüedades y listo para implementar:

---

# PROMPT REFINADO - TICKET #003: Implementar Lógica de Cálculo de Honorarios Básico

## CONTEXTO
Implementar el cálculo real de honorarios para el tipo "Básico", reemplazando la función `generateMockResults()` actual por cálculos basados en las especificaciones oficiales del CPAU.

## OBJETIVOS
1. Crear función `calcularHonorariosBasico()` que genere el desglose detallado de honorarios
2. Integrar cálculo en el paso "Calcular" del wizard (paso 4)
3. Obtener `valorK` desde ParametrosContext (valor default: 522181756.33)
4. Generar grilla de honorarios con ítems según tareas seleccionadas
5. Retornar array de ítems cuya suma es el honorario final

## DATOS DE ENTRADA

### Desde formData (ProcesoCalculoPage):
```javascript
{
  // Paso 1: Datos de Obra
  superficieTotal: number,
  valorMetro2: number,
  cotizDolar: number,
  complejidad: 'Baja' | 'Media' | 'Alta',
  valorObra: number,  // Calculado: superficieTotal × valorMetro2 × cotizDolar × factorComplejidad
  
  // Paso 2: Tareas Profesionales (todas boolean)
  obraProyecto: boolean,              // ¿Realiza Proyecto de Obra?
  obraDireccion: boolean,             // ¿Realiza Dirección de Obra?
  instalacionSanitaria: boolean,      // ¿Realiza Instalación Sanitaria?
  instalacionElectrica: boolean,      // ¿Realiza Instalación Eléctrica?
  instalacionContraIncendio: boolean, // ¿Realiza Instalación Contra Incendio?
  proyectoEstructuras: boolean        // ¿Realiza Proyecto de Estructuras?
}
```

### Desde ParametrosContext:
```javascript
valorK = getParametro('valorK')  // Default: 522181756.33
```

## ESTRUCTURA DE SALIDA

Retornar array de objetos con esta estructura:
```javascript
[
  {
    item: number,              // ID consecutivo (1, 2, 3...)
    tareaProfesional: string,  // Nombre de la tarea
    descripcion: string,       // Descripción del ítem (incluye rango y coeficiente)
    importe: number           // Monto calculado en ARS
  },
  // ... más ítems
]
```

## ALGORITMO DE CÁLCULO

### PASO 1: Calcular Rango de Costo de Obra
```javascript
rangoCostoDeObra = valorObra / valorK
```

### PASO 2: Determinar franjas de rango
- **Rango A**: rangoCostoDeObra < 0.5
- **Rango B**: 0.5 ≤ rangoCostoDeObra < 5
- **Rango C**: 5 ≤ rangoCostoDeObra < 25
- **Rango D**: rangoCostoDeObra ≥ 25

### PASO 3: Generar ítems según tareas seleccionadas

#### 3.1 - PROYECTO DE OBRA (si obraProyecto === true)
**Constantes:**
- `tareaProfesional = "Proyecto de Obra"`
- `porcentajeTarea = 0.6`

**Coeficientes por rango:**

| Rango | coefRangoObra | coefRangoK | Descripción formato |
|-------|---------------|------------|---------------------|
| A (< 0.5) | 0.14 | 0 | "Rango A (coef 14%)" |
| B (0.5-5) | 0.08 | 0.03 | "Rango B (coef 8%)" + "Rango B (coef K 3%)" |
| C (5-25) | 0.06 | 0.13 | "Rango C (coef 6%)" + "Rango C (coef K 13%)" |
| D (≥ 25) | 0.04 | 0.63 | "Rango D (coef 4%)" + "Rango D (coef K 63%)" |

**Generar ítems:**
- Si coefRangoObra > 0: Item con `importe = coefRangoObra × valorObra × porcentajeTarea`
- Si coefRangoK > 0: Item adicional con `importe = coefRangoK × valorK × porcentajeTarea`

#### 3.2 - DIRECCIÓN DE OBRA (si obraDireccion === true)
**Constantes:**
- `tareaProfesional = "Dirección de Obra"`
- `porcentajeTarea = 0.4`

**Coeficientes:** MISMOS que 3.1 (Proyecto de Obra)

**Generar ítems:** MISMA lógica que 3.1

#### 3.3 - INSTALACIÓN SANITARIA (si instalacionSanitaria === true)
**Constantes:**
- `tareaProfesional = "Proyecto de Instalación Sanitaria"`
- `porcentajeTarea = 1.0`

**Coeficientes por rango:**

| Rango | coefRangoObra | coefRangoK |
|-------|---------------|------------|
| A | 0.0023 | 0 |
| B | 0.0012 | 0 |
| C | 0.0008 | 0 |
| D | 0.0004 | 0 |

**Generar ítems:** Solo 1 ítem por rango (coefRangoK siempre 0)

#### 3.4 - INSTALACIÓN ELÉCTRICA (si instalacionElectrica === true)
**Constantes:**
- `tareaProfesional = "Proyecto de Instalación Eléctrica"`
- `porcentajeTarea = 1.0`

**Coeficientes:** MISMOS que 3.3 (Instalación Sanitaria)

#### 3.5 - INSTALACIÓN CONTRA INCENDIO (si instalacionContraIncendio === true)
**Constantes:**
- `tareaProfesional = "Proyecto de Instalación contra Incendios"`
- `porcentajeTarea = 1.0`

**Coeficientes:** MISMOS que 3.3 (Instalación Sanitaria)

#### 3.6 - PROYECTO DE ESTRUCTURAS (si proyectoEstructuras === true)
**Constantes:**
- `tareaProfesional = "Proyecto de Estructuras"`
- `porcentajeTarea = 1.0`

**Coeficientes por rango:**

| Rango | coefRangoObra | coefRangoK |
|-------|---------------|------------|
| A | 0.0030 | 0 |
| B | 0.0026 | 0 |
| C | 0.0021 | 0 |
| D | 0.0016 | 0 |

**Generar ítems:** Solo 1 ítem por rango (coefRangoK siempre 0)

## ARCHIVOS A CREAR/MODIFICAR

### 1. Crear: `src/utils/calculos/honorariosBasico.js`
```javascript
/**
 * Calcula honorarios para tipo Básico según especificaciones CPAU
 * @param {Object} formData - Datos del formulario completo
 * @param {number} valorK - Valor K desde parámetros
 * @returns {Array} Array de ítems de honorarios
 */
export function calcularHonorariosBasico(formData, valorK) {
  // Implementar algoritmo completo
}
```

### 2. Crear: `src/utils/calculos/tablasCoeficientes.js`
```javascript
// Tablas de coeficientes por tarea y rango
export const COEFICIENTES_PROYECTO_DIRECCION = {
  rangoA: { obra: 0.14, k: 0 },
  rangoB: { obra: 0.08, k: 0.03 },
  rangoC: { obra: 0.06, k: 0.13 },
  rangoD: { obra: 0.04, k: 0.63 }
};

// ... más tablas
```

### 3. Modificar: `src/pages/ProcesoCalculoPage.jsx`
- Importar `calcularHonorariosBasico` y `useParametros`
- En handleNext() del paso 3 (Revisión):
  ```javascript
  if (formData.tipoCalculo === 'Básico') {
    const valorK = getParametro('valorK');
    const detalleHonorarios = calcularHonorariosBasico(formData, valorK);
    setFormData(prev => ({ ...prev, detalleHonorarios }));
  }
  ```

### 4. Modificar: `src/components/wizard/ResultadoBasicoDetalle.jsx`
- Reemplazar datos mock por `formData.detalleHonorarios`
- Calcular total: `formData.detalleHonorarios.reduce((sum, item) => sum + item.importe, 0)`

## CRITERIOS DE VALIDACIÓN

1. ✅ El rango se calcula correctamente (valorObra / valorK)
2. ✅ Solo se generan ítems para tareas con valor `true`
3. ✅ Los coeficientes son exactos según las tablas especificadas
4. ✅ Las descripciones muestran el porcentaje correcto (ej: "coef 14%")
5. ✅ Los importes se calculan correctamente (coef × valorObra/K × porcentajeTarea)
6. ✅ El total de honorarios es la suma de todos los importes
7. ✅ Si valorK no está disponible, usar valor default 522181756.33
8. ✅ Los números se formatean correctamente (ARS con separadores)

## EJEMPLO DE SALIDA ESPERADA

Para: `valorObra = 100000000`, `valorK = 522181756.33`, `obraProyecto = true`, `rangoCostoDeObra = 0.19` (Rango A)

```javascript
[
  {
    item: 1,
    tareaProfesional: "Proyecto de Obra",
    descripcion: "Rango de Costos de Obra A (coef 14%)",
    importe: 8400000  // 0.14 × 100000000 × 0.6
  }
]
```

## NOTAS IMPORTANTES

1. **Decimales europeos vs código:** El documento usa comas (0,14) pero en código JavaScript usar puntos (0.14)
2. **Errores tipográficos corregidos:** "Estruturas" → "Estructuras"
3. **Contador de ítems:** Usar contador incremental compartido para todos los ítems (no reiniciar por tarea)
4. **Orden de procesamiento:** Procesar tareas en orden: Proyecto → Dirección → Sanitaria → Eléctrica → Contraincendio → Estructuras

---

¿Procedo con la implementación del Ticket #003 usando estas especificaciones refinadas?