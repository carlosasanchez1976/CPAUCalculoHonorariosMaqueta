# SPEC-CALC-004: Entregable PDF - Certificado de Honorarios Profesionales

**Fecha:** 28/05/2026  
**Versión:** 1.0  
**Estado:** 🟢 APROBADO - LISTO PARA IMPLEMENTAR  
**Autor:** CPAU - Dirección de Diseño  
**Desarrollador:** Frontend Team  
**Dependencias:** Componente ResultadoBasicoDetalle.jsx (actual)

> **⚠️ ALCANCE CRÍTICO:**  
> Esta SPEC modifica **ÚNICAMENTE el PDF exportado** mediante el botón "Descargar PDF".  
> **NO debe cambiar la interfaz de usuario visible en pantalla.**  
> La página 2 de "Notas" solo debe aparecer en el archivo PDF descargado, no en la aplicación web.

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Situación Actual](#2-análisis-de-situación-actual)
3. [Diseño Solicitado](#3-diseño-solicitado)
4. [Especificación Técnica](#4-especificación-técnica)
5. [Casos de Prueba](#5-casos-de-prueba)
6. [Criterios de Aceptación](#6-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Situación Actual

La aplicación CH2026 actualmente genera un entregable PDF desde el componente `ResultadoBasicoDetalle.jsx` utilizando la librería `html2pdf.js`. 

**Contenido actual del PDF:**
- ✅ Header azul con logo CPAU y metadata (tipo de cálculo + fecha)
- ✅ Resumen del Proyecto (6 campos de datos del proyecto)
- ✅ Detalle de honorarios (tabla con ítems agrupados por tarea profesional)
- ✅ Disclaimer legal (texto de referencia y vigencia)
- ✅ Nota final sobre alcance

**Características técnicas:**
- Formato: Legal, vertical
- Biblioteca: html2pdf.js v0.10.x
- Nombre archivo: `Honorarios-CPAU-{número}.pdf`
- Clase CSS especial: `.pdfExport` para ajustes de impresión

### 1.2 Solicitud del Cliente

**Solicitante:** CPAU - Dirección de Diseño  
**Fecha:** 28/05/2026  
**Canal:** Reunión + diseño en PDF

El cliente CPAU entregó un nuevo diseño de 2 páginas para el certificado imprimible:

**📄 Página 1:** Datos del cálculo (similar al actual)
- Header institucional con branding CPAU
- Resumen del Proyecto
- Detalle de honorarios

**📄 Página 2:** Notas explicativas (NUEVA)
- Alcance y carácter del cálculo
- Costos de obra considerados
- Etapas del proyecto
- Encargos profesionales
- Conceptos no incluidos
- Resolución de honorarios

**🔄 Solicitud Adicional de Desarrollo (28/05/2026):**

Para facilitar el debugging y revisión del contenido, se solicita implementar un **paso intermedio de previsualización**:

```
Flujo Anterior:                    Flujo Nuevo:
Usuario → "Descargar PDF"          Usuario → "Descargar PDF"
       ↓                                  ↓
    Genera PDF                      Abre ventana de preview
                                           ↓
                                    Usuario revisa (F12)
                                           ↓
                                    "Generar PDF" → Descarga
```

**Beneficios:**
- ✅ Usuario puede revisar contenido antes de descargar
- ✅ Desarrollador puede inspeccionar HTML/CSS con F12
- ✅ Evita descargas innecesarias si hay errores
- ✅ Permite regenerar PDF múltiples veces

### 1.3 Objetivo

**Actualizar el entregable PDF** para incluir:
1. ✅ Mantener el contenido de la página 1 (ya implementado)
2. ✅ Agregar una segunda página con las "Notas" institucionales (texto fijo)
3. ✅ **[NUEVO]** Implementar ventana de previsualización antes de generar PDF
4. ✅ Asegurar formato profesional y consistencia visual entre ambas páginas
5. ✅ Validar que el PDF se genere correctamente en diferentes escalas de Windows

**Flujo de Usuario Final:**

```
1. Usuario completa el cálculo de honorarios
2. Acepta términos y condiciones (checkbox)
3. Click en botón "Descargar PDF"
4. Se abre NUEVA VENTANA con previsualización del PDF
   - Muestra las 2 páginas completas
   - Botón "Cerrar" → Cierra ventana
   - Botón "Generar PDF" → Descarga el archivo
5. Usuario puede inspeccionar con F12 si lo desea
6. Click en "Generar PDF" para descargar el archivo
7. La ventana permanece abierta (puede regenerar si es necesario)
```

---

## 2. ANÁLISIS DE SITUACIÓN ACTUAL

### 2.1 Estructura Actual del Componente

**Archivo:** `App/Frontend/src/components/wizard/ResultadoBasicoDetalle.jsx`

```jsx
const ResultadoBasicoDetalle = ({ formData, calculationResult, ... }) => {
  const pdfRef = useRef(null);
  
  const handleDescargarPDF = () => {
    const element = pdfRef.current;
    element.classList.add(styles.pdfExport);
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Honorarios-CPAU-${calculationNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1000 },
      jsPDF: { unit: 'mm', format: 'legal', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      element.classList.remove(styles.pdfExport);
    });
  };

  return (
    <div className={styles.container}>
      <div ref={pdfRef}>
        {/* Contenido actual: header + resumen + tabla + disclaimer */}
      </div>
    </div>
  );
};
```

### 2.2 Header Actual (Reutilizable)

El header actual **coincide exactamente** con el diseño de la página 1 del nuevo entregable:

```jsx
<div className={styles.certificateHeader}>
  <div className={styles.headerLeft}>
    <img src="/assets/icons/logoBlanco.svg" alt="CPAU Logo" />
  </div>
  <div className={styles.headerRight}>
    <h3>Cálculo de honorarios profesionales</h3>
    <div className={styles.metadata}>
      <div className={styles.metadataItem}>
        <span>Tipo:</span>
        <span>{formData.tipoNombre}</span>
      </div>
      <div className={styles.metadataItem}>
        <span>Fecha:</span>
        <span>{currentDate}</span>
      </div>
    </div>
  </div>
</div>
```

**Conclusión:** ✅ No requiere cambios. El header es correcto y debe mantenerse.

### 2.3 Contenido de Página 1 (Actual)

```jsx
<div className={styles.twoColumnLayout}>
  <div className={styles.leftColumn}>
    {/* Resumen del Proyecto */}
    <h4>Resumen del Proyecto</h4>
    <div className={styles.proyectoResumen}>
      {/* 6 campos: nombre, comitente, tipo, destino, superficie, costo */}
    </div>
    
    {/* Disclaimer */}
    <div className={styles.disclaimer}>
      <h4>IMPORTANTE</h4>
      <p>Este cálculo es una estimación...</p>
    </div>
  </div>

  <div className={styles.rightColumn}>
    {/* Tabla de honorarios */}
    <h4>Detalle de honorarios</h4>
    <table className={styles.table}>
      {/* Tabla con ítems agrupados */}
    </table>
    
    <div className={styles.notaFinal}>
      <p>NOTA: Este honorario corresponde únicamente...</p>
    </div>
  </div>
</div>
```

**Conclusión:** ✅ La estructura es correcta. Solo necesita ajustes CSS menores para mejorar espaciado en PDF.

### 2.4 Gap Identificado: Página 2 de Notas

**Falta implementar:**
- ❌ Segunda página con las "Notas" institucionales
- ❌ Salto de página entre contenido y notas
- ❌ Estructura y estilos para las secciones de texto

---

## 3. DISEÑO SOLICITADO

### 3.1 Estructura General del PDF

**Diagrama de Flujo Completo:**

```
┌─────────────────────────────────────────┐
│  APLICACIÓN PRINCIPAL                   │
│  ResultadoBasicoDetalle.jsx             │
│                                         │
│  [✓] Acepto términos                   │
│  [ Descargar PDF ]  ← Click usuario    │
└──────────────────┬──────────────────────┘
                   │
                   ↓ window.open()
┌─────────────────────────────────────────┐
│  VENTANA DE PREVISUALIZACIÓN (NUEVA)    │
│  Nueva pestaña/ventana del navegador    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ PÁGINA 1: DATOS DEL CÁLCULO        │ │
│ ├─────────────────────────────────────┤ │
│ │ Header azul (Logo + Título + Meta) │ │
│ │                                     │ │
│ │ ┌─────────────┬─────────────────┐  │ │
│ │ │ Resumen del │ Detalle de      │  │ │
│ │ │ Proyecto    │ honorarios      │  │ │
│ │ │             │ (tabla)         │  │ │
│ │ │ Disclaimer  │                 │  │ │
│ │ └─────────────┴─────────────────┘  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ PÁGINA 2: NOTAS                    │ │
│ ├─────────────────────────────────────┤ │
│ │ Header azul (igual a página 1)     │ │
│ │                                     │ │
│ │ Notas                               │ │
│ │ • Alcance y carácter               │ │
│ │ • Costo de obra                    │ │
│ │ • Etapas del proyecto              │ │
│ │ • Encargos                         │ │
│ │ • Conceptos no incluidos           │ │
│ │ • Resolución de honorarios         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │    ACCIONES DE PREVISUALIZACIÓN    │ │
│ │  [ Cerrar ]    [ Generar PDF ]     │ │
│ └─────────────────────────────────────┘ │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┴───────────┐
      ↓                       ↓
  window.close()        html2pdf.js
   (vuelve a app)       (descarga PDF)
```

**Contenido visual:**

```
┌─────────────────────────────────────┐
│  PÁGINA 1: DATOS DEL CÁLCULO        │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Header azul (Logo + Título)     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────┬─────────────────┐  │
│ │ Resumen del │ Detalle de      │  │
│ │ Proyecto    │ honorarios      │  │
│ │             │ (tabla)         │  │
│ │ Disclaimer  │                 │  │
│ └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PÁGINA 2: NOTAS                    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Header azul (Logo + Título)     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Notas                               │
│                                     │
│ • Alcance y carácter del cálculo   │
│ • Costo de obra considerado        │
│ • Etapas del proyecto              │
│ • Encargos                         │
│ • Conceptos no incluidos           │
│ • Resolución de los honorarios     │
└─────────────────────────────────────┘
```

### 3.2 Contenido de Página 2: Notas

**Sección: Alcance y carácter del cálculo**
```
La presente calculadora de honorarios profesionales sugeridos, de carácter orientativo, 
calculado a partir de las variables ingresadas (tipo de obra, superficie, costo estimado 
por m2, alcance del encargo, entre otros), con el objetivo de obtener un honorario equitativo.

El monto resultante podrá pactarse como honorario fijo o ajustable según lo que acuerden las partes.
Tanto el cambio en el alcance de las tareas profesionales encomendadas, como cualquiera de las variables 
ingresadas habilita la revisión de los honorarios originalmente pactados.
```

**Sección: Costo de obra considerado**
```
El costo de obra por m2 utilizado en el cálculo constituye una estimación consensuada entre 
profesional y comitente. El CPAU publica mensualmente índices de referencia de costos 
de construcción, elaborados por distintos organismos y/o medios, disponibles en la web 
institucional, quedando a criterio del/la profesional y del comitente 
seleccionar el valor que consideren adecuado.
```

**Sección: Etapas del proyecto**
```
Croquis preliminar           10%
Anteproyecto                 15%
Proyecto básico              15%
Documentación licitatoria    20%
Total proyecto               60%
Dirección de obra            40%

A fin de conocer el contenido y alcance de cada una de las etapas del proyecto, 
se recomienda consultar el MEPAU.
```

**Sección: Alcance de los honorarios sugeridos**
```
Los honorarios resultantes de esta calculadora contemplan las tareas profesionales 
correspondientes a un encargo ordinario, de acuerdo con los alcances definidos
por la normativa y usos profesionales vigentes, ver MEPAU.
Para los encargos de Proyecto y Dirección, las tareas profesionales vinculadas al 
interiorismo, equipamiento no edilicio, mobiliario, iluminación, cortinas u otros elementos 
no habituales en una propiedad vacía del mercado inmobiliario no están incluidas y
requerirán honorarios adicionales a pactar.
Se recomienda a los profesionales acompañar la encomienda con el detalle de tareas, la modalidad de prestación y la lista de
documentos entregables, pudiendo indicarse también su modo de ejecución (AutoCAD, BIM), a fin de clarificar el alcance del
encargo y evitar confusiones.

```

**Sección: Conceptos no incluidos en los honorarios**
```
IVA, en caso de corresponder.
Gestión municipal, derechos de construcción y/o cualquier tipo de gravámenes, tasas o derechos.
Cálculo estructural, salvo el caso que se encuentre específicamente agregado al cálculo realizado.
Proyecto de instalaciones, salvo el caso que se encuentren específicamente agregados al cálculo realizado.
Documentación y planos comerciales, renders, maquetas, etc.
Cualquier otro concepto que no esté expresado en el cálculo.
```

**Sección: Resolución de los honorarios**
```
En caso de que alguna de las partes decida no continuar con la totalidad del encargo, deberán abonarse los honorarios de las tareas
efectivamente realizadas según lo acordado por las partes, y considerando las etapas de proyecto previamente mencionadas en este
documento.
En caso de rescisión unilateral por parte del comitente, se deberá convenir un resarcimiento en favor del profesional por las tareas
encomendadas y no ejecutadas, de acuerdo a la normativa vigente.

Para ampliar la información consultar al MEPAU, capítulo 02 Honorarios, o ponerse en 
contacto con tecnica@cpau.org
```

### 3.3 Estilos Visuales

**Header (ambas páginas):**
- Fondo: Azul institucional CPAU (`#007bff` o similar según variables)
- Alto: ~80-100px
- Logo: Izquierda, blanco
- Título + metadata: Derecha, blanco

**Página 1:**
- Layout: 2 columnas (40% / 60% aprox)
- Tipografía: System font stack del proyecto
- Tabla: Bordes sutiles, header en gris claro
- Disclaimer: Fondo amarillo suave (#fffacd)

**Página 2:**
- Layout: Columna única
- Título "Notas": Bold, tamaño grande (h2)
- Subtítulos: Bold, tamaño mediano (h4)
- Párrafos: Interlineado generoso (1.5-1.6)
- Listas: Márgenes adecuados

---

## 4. ESPECIFICACIÓN TÉCNICA

### 4.1 Cambios en ResultadoBasicoDetalle.jsx

**⚠️ NUEVO FLUJO DE PREVISUALIZACIÓN:**

El usuario debe poder **revisar el contenido HTML antes de generar el PDF**. El flujo cambia a:

```
Usuario → Click "Descargar PDF" 
         ↓
Se abre NUEVA VENTANA con el HTML completo
         ↓
Usuario revisa contenido (puede usar F12)
         ↓
Click "Generar PDF" → Descarga el PDF
Click "Cerrar" → Cierra la ventana
```

**Acción 1:** Crear nueva función para abrir ventana de previsualización

```jsx
const handleDescargarPDF = () => {
  // CAMBIO: Ya no genera PDF directamente
  // Ahora abre ventana de previsualización
  abrirVentanaPreview();
};

const abrirVentanaPreview = () => {
  // Construir HTML completo de las 2 páginas
  const htmlContent = construirHTMLParaPDF();
  
  // Abrir nueva ventana
  const ventanaPreview = window.open('', '_blank', 'width=900,height=1200');
  
  // Escribir contenido en la ventana
  ventanaPreview.document.write(htmlContent);
  ventanaPreview.document.close();
};

const construirHTMLParaPDF = () => {
  // Obtener estilos del módulo CSS
  const estilosCSS = obtenerEstilosCompilados();
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Previsualización - Honorarios CPAU ${calculationNumber}</title>
      <style>${estilosCSS}</style>
    </head>
    <body>
      <div class="pdfExport">
        <!-- PÁGINA 1 -->
        <div class="page">
          ${construirPagina1HTML()}
        </div>
        
        <!-- PÁGINA 2 -->
        <div class="page pageBreak">
          ${construirPagina2HTML()}
        </div>
        
        <!-- BOTONES DE ACCIÓN -->
        <div class="previewActions">
          <button onclick="window.close()" class="btnCerrar">Cerrar</button>
          <button onclick="generarPDFDesdeVentana()" class="btnGenerarPDF">Generar PDF</button>
        </div>
      </div>
      
      <script>
        function generarPDFDesdeVentana() {
          // Importar html2pdf dinámicamente
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => {
            const elemento = document.querySelector('.pdfExport');
            const opt = {
              margin: [10, 10, 10, 10],
              filename: 'Honorarios-CPAU-${calculationNumber}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1000 },
              jsPDF: { unit: 'mm', format: 'legal', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(elemento).save();
          };
          document.head.appendChild(script);
        }
      </script>
    </body>
    </html>
  `;
};

const construirPagina1HTML = () => {
  // Renderizar página 1 como string HTML
  return `
    <div class="certificateHeader">
      <div class="headerLeft">
        <img src="/assets/icons/logoBlanco.svg" alt="CPAU Logo" class="logo" />
      </div>
      <div class="headerRight">
        <h3 class="title">Cálculo de honorarios profesionales</h3>
        <div class="metadata">
          <div class="metadataItem">
            <span class="metadataLabel">Tipo:</span>
            <span class="metadataValue">${formData.tipoNombre}</span>
          </div>
          <div class="metadataItem">
            <span>Fecha:</span>
            <span>${currentDate}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="twoColumnLayout">
      <!-- Resumen del proyecto -->
      ${construirResumenProyecto()}
      
      <!-- Tabla de honorarios -->
      ${construirTablaHonorarios()}
    </div>
  `;
};

const construirPagina2HTML = () => {
  // Renderizar página 2 con las notas
  return `
    <div class="certificateHeader">
      <!-- Header repetido -->
    </div>
    
    <div class="notasSection">
      <h2 class="notasTitle">Notas</h2>
      ${PDF_NOTAS.alcance.titulo}
      ${PDF_NOTAS.alcance.contenido}
      <!-- ... resto de notas ... -->
    </div>
  `;
};
```

**Acción 2:** Estructura JSX del componente (sin cambios en el render principal)

```jsx
return (
  <div className={styles.container}>
    {/* Vista en pantalla - SIN CAMBIOS */}
    <div ref={pdfRef}>
      {/* PÁGINA 1: Contenido actual */}
      <div className={styles.page}>
        <div className={styles.certificateHeader}>
          {/* Header actual */}
        </div>
        <div className={styles.twoColumnLayout}>
          {/* Resumen + Tabla actual */}
        </div>
      </div>

      {/* PÁGINA 2: Notas (oculta en pantalla) */}
      <div className={`${styles.page} ${styles.pageBreak}`}>
        <div className={styles.certificateHeader}>
          {/* Mismo header */}
        </div>
        <div className={styles.notasSection}>
          <h2 className={styles.notasTitle}>Notas</h2>
          
          <section className={styles.notaBlock}>
            <h4>Alcance y carácter del cálculo</h4>
            <p>...</p>
          </section>

          <section className={styles.notaBlock}>
            <h4>Costo de obra considerado</h4>
            <p>...</p>
          </section>

          {/* ... resto de secciones ... */}
        </div>
      </div>
    </div>
    
    {/* Botón modificado */}
    <Button onClick={handleDescargarPDF}>
      Descargar PDF
    </Button>
  </div>
);
```

**Consideraciones técnicas:**

1. **Extracción de estilos:** Necesitamos exportar los estilos CSS del módulo como string
2. **Ventana popup:** Usar `window.open()` con dimensiones adecuadas
3. **html2pdf en ventana:** Cargar librería dinámicamente vía CDN en la ventana
4. **Rutas de imágenes:** Usar rutas absolutas (`window.location.origin + '/assets/...'`)
5. **Serialización de datos:** Convertir `formData` a JSON para inyectar en el HTML

**Alternativa más simple (Recomendada para MVP):**

Si la extracción de estilos es compleja, usar approach más directo:

```jsx
const handleDescargarPDF = () => {
  // Aplicar clase temporal
  pdfRef.current.classList.add(styles.pdfExport);
  
  // Clonar el elemento
  const clonado = pdfRef.current.cloneNode(true);
  
  // Abrir nueva ventana y montar el elemento clonado
  const ventana = window.open('', '_blank');
  ventana.document.body.innerHTML = `
    <div id="preview-container"></div>
    <div style="text-align: center; padding: 20px; position: fixed; bottom: 0; width: 100%; background: white; border-top: 2px solid #ccc;">
      <button onclick="window.close()" style="padding: 10px 20px; margin-right: 10px;">Cerrar</button>
      <button onclick="generarPDF()" style="padding: 10px 20px; background: #007bff; color: white;">Generar PDF</button>
    </div>
  `;
  
  // Copiar estilos del documento principal
  copiarEstilosAVentana(ventana);
  
  // Insertar contenido clonado
  ventana.document.getElementById('preview-container').appendChild(clonado);
  
  // Remover clase temporal del original
  pdfRef.current.classList.remove(styles.pdfExport);
};
```

### 4.2 Cambios en ResultadoBasicoDetalle.module.css

**Agregar estilos:**

```css
/* Salto de página en PDF */
.pageBreak {
  page-break-before: always;
}

/* Página individual */
.page {
  min-height: 100vh; /* Para visualización en pantalla */
  background: white;
}

/* Solo en PDF: ajustar altura */
.pdfExport .page {
  min-height: auto;
  padding-bottom: 20px;
}

/* Sección de notas */
.notasSection {
  padding: 40px 60px;
  max-width: 900px;
  margin: 0 auto;
}

.notasTitle {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
}

.notaBlock {
  margin-bottom: 28px;
}

.notaBlock h4 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.notaBlock p,
.notaBlock ul {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.notaBlock ul {
  padding-left: 20px;
  list-style-type: disc;
}

.notaBlock ul li {
  margin-bottom: 6px;
}

/* Tabla de etapas */
.etapasTable {
  width: 100%;
  max-width: 400px;
  border-collapse: collapse;
  margin: 15px 0;
}

.etapasTable td {
  padding: 6px 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.etapasTable td:first-child {
  text-align: left;
}

.etapasTable td:last-child {
  text-align: right;
  font-weight: 500;
}
```

### 4.3 Componente Reutilizable (Opcional - Para limpieza)

**Opción:** Extraer el header a un componente separado para evitar duplicación

```jsx
// components/wizard/PDFHeader.jsx
const PDFHeader = ({ formData, currentDate }) => (
  <div className={styles.certificateHeader}>
    <div className={styles.headerLeft}>
      <img src="/assets/icons/logoBlanco.svg" alt="CPAU Logo" className={styles.logo} />
    </div>
    <div className={styles.headerRight}>
      <h3 className={styles.title}>Cálculo de honorarios profesionales</h3>
      <div className={styles.metadata}>
        <div className={styles.metadataItem}>
          <span className={styles.metadataLabel}>Tipo:</span>
          <span className={styles.metadataValue}>{formData.tipoNombre}</span>
        </div>
        <div className={styles.metadataItem}>
          <span>Fecha:</span>
          <span>{currentDate}</span>
        </div>
      </div>
    </div>
  </div>
);
```

**Nota:** Esto es opcional. Si se prefiere mantener simplicidad, duplicar el markup es aceptable.

### 4.4 Texto Completo de las Notas

**Crear constante en el archivo o en utils:**

```jsx
// utils/pdfConstants.js
export const PDF_NOTAS = {
  alcance: {
    titulo: 'Alcance y carácter del cálculo',
    contenido: `El presente cálculo de honorarios profesionales sugeridos, de carácter informativo, calculado a partir de las variables ingresadas (tipo de obra, superficie, costo estimado por m2, alcance del encargo, entre otros), con el objetivo de obtener un honorario resultante.

Tanto el cambio, de las tareas profesionales encomendadas, como cualquiera de las variables ingresadas habilitaría la revisión de los honorarios originalmente pactados.`
  },
  
  costo: {
    titulo: 'Costo de obra considerado',
    contenido: `El costo de obra ingresado en el cálculo constituye una estimación consensuada entre profesional y comitente. El CPAU publica mensualmente índices de referencia de costos de construcción, elaborados por distintos organismos y medios, disponibles en la web institucional, quedando a criterio y responsabilidad del profesional y del comitente seleccionar el valor que consideren más apropiado.`
  },

  etapas: {
    titulo: 'Etapas del proyecto',
    contenido: [
      { etapa: 'Croquis preliminar', porcentaje: '10%' },
      { etapa: 'Anteproyecto', porcentaje: '15%' },
      { etapa: 'Proyecto básico', porcentaje: '15%' },
      { etapa: 'Documentación licitatoria', porcentaje: '20%' },
      { etapa: 'Total proyecto', porcentaje: '60%' },
      { etapa: 'Dirección de obra', porcentaje: '40%' }
    ],
    nota: 'A fin de conocer el contenido y alcance de cada una de las etapas del proyecto, se recomienda consultar el MEPAU.'
  },

  encargos: {
    titulo: 'Encargos',
    contenido: `Los honorarios resultantes de esta calculadora contemplan las tareas profesionales correspondientes a un encargo ordinario, de acuerdo con la normativa vigente.

Para los encargos de Proyecto y Dirección, las tareas profesionales vinculadas al anteproyecto, equipamiento no edilicio, mobiliario, luminotecnia, cortinas y elementos análogos del interiorismo y del mercado inmobiliario no están incluidos y se recomienda a los profesionales acompañar un encuentro con el detalle de tareas, la modalidad de prestación y la lista de documentos entregables.

En el caso de los proyectos de coordinación o revisión de proyectos y de Dirección, no se incluyen en el cálculo de los honorarios cualquier tipo de requerimientos, documentación y planos generales: renders, maquetas, etc.

Cualquier otro concepto que no esté expresado en el cálculo.`
  },

  noIncluidos: {
    titulo: 'Conceptos no incluidos en los honorarios',
    contenido: `IVA, en caso de corresponder.

Gestión municipal, derechos de construcción y cualquier tipo de gravámenes, tasas o derechos correspondientes al proyecto que se encuentre específicamente agregado al cálculo realizado: Proyecto de instalaciones, salvo el caso que se encuentre agregado o en caso de formar parte de un proyecto de revisión y/o coordinación en el cual se incluyen.

Documentación licitatoria, renders, maquetas, etc.`
  },

  resolucion: {
    titulo: 'Resolución de los honorarios',
    contenido: `En caso de que alguna de las partes decida no continuar con la totalidad del encargo, deberán abonarse los honorarios de las tareas efectivamente encomendadas hasta ese momento, incluyendo los gastos en documentos.

En el caso de revisión unilateral por parte del comitente, se deberá convenir un recargo a favor del profesional por las tareas efectivamente realizadas. El porcentaje adicional surge de la normativa vigente.

Para ampliar la información consultar al MEPAU, capítulo 02 Honorarios, o ponerse en contacto con tecnica@cpau.org`
  }
};
```

### 4.5 Opciones de html2pdf

**Mantener configuración actual:**
```javascript
const opt = {
  margin: [10, 10, 10, 10],
  filename: `Honorarios-CPAU-${calculationNumber}.pdf`,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { 
    scale: 2, 
    useCORS: true,
    logging: false,
    windowWidth: 1000
  },
  jsPDF: { 
    unit: 'mm', 
    format: 'legal',      // Legal size es correcto para 2 páginas
    orientation: 'portrait' 
  }
};
```

**Consideración:** El formato "legal" (216 × 356 mm) es más largo que "letter" y acomoda mejor el contenido de 2 páginas. Mantener.

### 4.6 Implementación Detallada de la Ventana de Previsualización

**4.6.1 Detección de Popup Blocker**

```jsx
const abrirVentanaPreview = () => {
  const ventana = window.open('', '_blank', 'width=900,height=1200,scrollbars=yes');
  
  // Verificar si fue bloqueada
  if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
    alert('Por favor, habilita las ventanas emergentes para ver la previsualización del PDF.\n\nInstrucciones:\n1. Haz click en el ícono de configuración en la barra de direcciones\n2. Permite ventanas emergentes para este sitio\n3. Intenta nuevamente');
    return;
  }
  
  // Continuar con la carga de contenido...
  cargarContenidoEnVentana(ventana);
};
```

**4.6.2 Copia de Estilos CSS**

```jsx
const copiarEstilosAVentana = (ventanaDestino) => {
  // Copiar todos los <link> de CSS
  const linksCSS = document.querySelectorAll('link[rel="stylesheet"]');
  linksCSS.forEach(link => {
    const nuevoLink = ventanaDestino.document.createElement('link');
    nuevoLink.rel = 'stylesheet';
    nuevoLink.href = link.href;
    ventanaDestino.document.head.appendChild(nuevoLink);
  });
  
  // Copiar todos los <style> inline
  const stylesInline = document.querySelectorAll('style');
  stylesInline.forEach(style => {
    const nuevoStyle = ventanaDestino.document.createElement('style');
    nuevoStyle.textContent = style.textContent;
    ventanaDestino.document.head.appendChild(nuevoStyle);
  });
  
  // Agregar estilos específicos para la ventana de preview
  const stylePreview = ventanaDestino.document.createElement('style');
  stylePreview.textContent = `
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
    }
    .preview-container {
      max-width: 900px;
      margin: 20px auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .preview-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 2px solid #ddd;
      padding: 15px;
      text-align: center;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }
    .preview-actions button {
      padding: 12px 30px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 0 10px;
    }
    .btnCerrar {
      background: #6c757d;
      color: white;
    }
    .btnCerrar:hover {
      background: #5a6268;
    }
    .btnGenerarPDF {
      background: #007bff;
      color: white;
    }
    .btnGenerarPDF:hover {
      background: #0056b3;
    }
    .btnGenerarPDF:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `;
  ventanaDestino.document.head.appendChild(stylePreview);
};
```

**4.6.3 Estructura HTML de la Ventana**

```jsx
const construirHTMLVentana = () => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Previsualización - Honorarios CPAU ${calculationNumber}</title>
    </head>
    <body>
      <div class="preview-container" id="pdf-content">
        <!-- Contenido se insertará aquí -->
      </div>
      
      <div class="preview-actions">
        <button class="btnCerrar" onclick="window.close()">
          ✕ Cerrar
        </button>
        <button class="btnGenerarPDF" id="btn-generar" onclick="generarPDFDesdeVentana()">
          📄 Generar PDF
        </button>
      </div>
      
      <script>
        let html2pdfCargado = false;
        
        function cargarHtml2Pdf() {
          return new Promise((resolve, reject) => {
            if (html2pdfCargado) {
              resolve();
              return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = () => {
              html2pdfCargado = true;
              resolve();
            };
            script.onerror = () => reject(new Error('No se pudo cargar html2pdf.js'));
            document.head.appendChild(script);
          });
        }
        
        async function generarPDFDesdeVentana() {
          const btn = document.getElementById('btn-generar');
          btn.disabled = true;
          btn.textContent = '⏳ Generando PDF...';
          
          try {
            await cargarHtml2Pdf();
            
            const elemento = document.getElementById('pdf-content');
            const opt = {
              margin: [10, 10, 10, 10],
              filename: 'Honorarios-CPAU-${calculationNumber}.pdf',
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1000 },
              jsPDF: { unit: 'mm', format: 'legal', orientation: 'portrait' }
            };
            
            await html2pdf().set(opt).from(elemento).save();
            
            btn.textContent = '✓ PDF Generado';
            setTimeout(() => {
              btn.disabled = false;
              btn.textContent = '📄 Generar PDF';
            }, 2000);
            
          } catch (error) {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF. Por favor, intenta nuevamente.');
            btn.disabled = false;
            btn.textContent = '📄 Generar PDF';
          }
        }
      </script>
    </body>
    </html>
  `;
};
```

**4.6.4 Manejo de Rutas de Imágenes**

```jsx
const convertirRutasAAbsolutas = (elemento) => {
  const imagenes = elemento.querySelectorAll('img');
  imagenes.forEach(img => {
    if (img.src && !img.src.startsWith('http')) {
      img.src = window.location.origin + img.src.replace(window.location.origin, '');
    }
  });
};
```

---

## 5. CASOS DE PRUEBA

### 5.1 Escenarios de Validación

**CP-001: Apertura de ventana de previsualización**
```
DADO: Usuario completó el cálculo
CUANDO: Click en "Descargar PDF"
ENTONCES:
  ✅ Se abre nueva ventana/pestaña
  ✅ Ventana muestra el contenido del PDF (2 páginas)
  ✅ Botones "Cerrar" y "Generar PDF" visibles al final
  ✅ Usuario puede inspeccionar con F12
```

**CP-001b: Generación de PDF desde previsualización**
```
DADO: Ventana de previsualización abierta
CUANDO: Click en "Generar PDF"
ENTONCES:
  ✅ Se genera PDF con 2 páginas
  ✅ Página 1 contiene datos del cálculo
  ✅ Página 2 contiene notas institucionales
  ✅ Ambas páginas tienen header azul
  ✅ Ventana de previsualización permanece abierta
```

**CP-002: Contenido de Página 1**
```
DADO: PDF generado
CUANDO: Se visualiza la página 1
ENTONCES:
  ✅ Header con logo + título + metadata
  ✅ Resumen del proyecto con 6 campos
  ✅ Tabla de honorarios agrupados
  ✅ Total de honorarios correcto
  ✅ Disclaimer legal visible
```

**CP-003: Contenido de Página 2**
```
DADO: PDF generado
CUANDO: Se visualiza la página 2
ENTONCES:
  ✅ Header igual a página 1
  ✅ Título "Notas" visible
  ✅ 6 secciones de notas presentes:
    1. Alcance y carácter del cálculo
    2. Costo de obra considerado
    3. Etapas del proyecto (con tabla)
    4. Encargos
    5. Conceptos no incluidos
    6. Resolución de los honorarios
  ✅ Texto legible, bien espaciado
```

**CP-004: Salto de página correcto**
```
DADO: PDF generado
CUANDO: Se visualiza el PDF completo
ENTONCES:
  ✅ Contenido de página 1 NO se mezcla con página 2
  ✅ Salto de página limpio entre ambas
  ✅ No hay elementos cortados entre páginas
```

**CP-005: Elementos excluidos del PDF**
```
DADO: Usuario en pantalla de resultados
CUANDO: Genera el PDF
ENTONCES:
  ✅ Checkbox "Acepto términos" NO aparece en PDF
  ✅ Botón "Descargar PDF" NO aparece en PDF
  ✅ Botón "Nuevo Cálculo" NO aparece en PDF
  ✅ Botones "Cerrar" y "Generar PDF" NO aparecen en PDF final
  ✅ Solo contenido dentro de pdfRef se exporta
```

**CP-005b: Funcionalidad de botones en ventana de previsualización**
```
DADO: Ventana de previsualización abierta
CUANDO: Click en "Cerrar"
ENTONCES:
  ✅ Ventana se cierra
  ✅ Usuario vuelve a la aplicación principal

CUANDO: Click en "Generar PDF"
ENTONCES:
  ✅ Se descarga el PDF correctamente
  ✅ Ventana permanece abierta (para regenerar si es necesario)
```

**CP-006: Formato visual en diferentes escalas**
```
DADO: Windows en escala 100%, 125%, 150%
CUANDO: Se genera el PDF
ENTONCES:
  ✅ PDF se ve igual en todas las escalas
  ✅ Texto legible en todas las escalas
  ✅ Layout no se rompe
  ✅ Tamaño del archivo ~200-500 KB
```

**CP-007: Datos dinámicos correctos**
```
DADO: Diferentes datos de entrada (proyectos variados)
CUANDO: Se genera el PDF
ENTONCES:
  ✅ Nombre del proyecto correcto
  ✅ Fecha actual en formato DD/MM/YYYY
  ✅ Tipo de obra correcto
  ✅ Valores monetarios con formato ARS correcto
  ✅ Porcentajes con 2 decimales
```

### 5.2 Casos Edge

**CE-001: Proyectos con muchos ítems**
```
DADO: Proyecto con 10+ tareas profesionales
CUANDO: Se genera el PDF
ENTONCES:
  ✅ Tabla de página 1 se ajusta (reducir font si necesario)
  ✅ No hay overflow en la tabla
  ✅ Página 2 se mantiene igual (no se ve afectada)
```

**CE-002: Nombres muy largos**
```
DADO: Nombre de proyecto con >100 caracteres
CUANDO: Se genera el PDF
ENTONCES:
  ✅ Texto hace wrap
  ✅ No desborda del contenedor
  ✅ Sigue legible
```

**CE-003: Valores monetarios altos**
```
DADO: Honorarios > $1.000.000.000
CUANDO: Se genera el PDF
ENTONCES:
  ✅ Formato mantiene separadores de miles
  ✅ No se corta el número
  ✅ Alineación derecha se mantiene
```

---

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Funcionales

- [ ] **CA-001:** Al hacer click en "Descargar PDF" se abre una nueva ventana de previsualización
- [ ] **CA-001b:** La ventana de previsualización muestra exactamente el contenido que se exportará (2 páginas)
- [ ] **CA-001c:** Los botones "Cerrar" y "Generar PDF" están visibles al final de la ventana de previsualización
- [ ] **CA-002:** La página 1 contiene todos los datos del cálculo (header, resumen, tabla, disclaimer)
- [ ] **CA-003:** La página 2 contiene las 6 secciones de notas institucionales
- [ ] **CA-004:** El header se repite en ambas páginas con el mismo formato
- [ ] **CA-005:** El salto de página es limpio (sin contenido cortado)
- [ ] **CA-006:** Los elementos interactivos de la app principal (checkbox, botones) NO aparecen en el PDF final
- [ ] **CA-006b:** Los botones de la ventana de previsualización ("Cerrar", "Generar PDF") NO aparecen en el PDF final
- [ ] **CA-007:** El nombre del archivo sigue el patrón `Honorarios-CPAU-{número}.pdf`
- [ ] **CA-007b:** El botón "Cerrar" cierra la ventana de previsualización correctamente
- [ ] **CA-007c:** El botón "Generar PDF" descarga el archivo sin cerrar la ventana

### 6.2 Visuales

- [ ] **CA-008:** Header azul con logo blanco visible en ambas páginas
- [ ] **CA-009:** Tabla de honorarios alineada correctamente (números a la derecha)
- [ ] **CA-010:** Texto de notas legible, con interlineado adecuado (1.5-1.6)
- [ ] **CA-011:** Tabla de etapas (página 2) formateada correctamente
- [ ] **CA-012:** Disclaimer en página 1 con fondo amarillo suave
- [ ] **CA-013:** Márgenes consistentes en ambas páginas

### 6.3 Técnicos

- [ ] **CA-014:** PDF se genera en todas las escalas de Windows (100%, 125%, 150%)
- [ ] **CA-015:** Tamaño del archivo PDF < 1 MB
- [ ] **CA-016:** Calidad de imagen JPEG: 0.98 (como está configurado)
- [ ] **CA-017:** Formato del PDF: Legal, vertical
- [ ] **CA-018:** No hay errores en consola durante la generación
- [ ] **CA-019:** El PDF se descarga correctamente en Chrome, Edge, Firefox

### 6.4 Performance

- [ ] **CA-020:** Generación del PDF toma < 5 segundos
- [ ] **CA-021:** No hay lag en la UI durante la generación
- [ ] **CA-022:** La clase `.pdfExport` se aplica y remueve correctamente

### 6.5 Contenido

- [ ] **CA-023:** Todos los textos de las notas son los correctos (según diseño del cliente)
- [ ] **CA-024:** No hay errores ortográficos ni de puntuación
- [ ] **CA-025:** Los porcentajes de etapas suman 100% (proyecto) + 40% (dirección)
- [ ] **CA-026:** El texto del disclaimer en página 1 se mantiene sin cambios
- [ ] **CA-027:** La fecha del PDF es la fecha actual del sistema

---

## 7. PLAN DE IMPLEMENTACIÓN (TICKETS)

Ver archivo: `01-Docs/01-PM/SPEC009-CALC-Entregable-TICKETS.txt`

**Resumen de tickets:**
- **T001:** Crear constantes de texto para las notas (utils/pdfConstants.js)
- **T002:** Agregar estilos CSS para página 2 y saltos de página
- **T003:** Implementar markup de página 2 con secciones de notas
- **T004:** **[NUEVO]** Implementar funcionalidad de ventana de previsualización
  - Función `abrirVentanaPreview()` para abrir nueva ventana
  - Función `construirHTMLParaPDF()` para serializar contenido
  - Copiar estilos CSS a la ventana nueva
  - Implementar botones "Cerrar" y "Generar PDF" en ventana
  - Cargar html2pdf.js dinámicamente en ventana de previsualización
- **T005:** (Opcional) Extraer header a componente reutilizable
- **T006:** Testing manual de ventana de previsualización en diferentes navegadores
- **T007:** Testing manual en diferentes escalas de Windows
- **T008:** Validación con cliente (envío de PDF de prueba)
- **T009:** Ajustes finales según feedback del cliente

**Estimación:** 3-4 días de desarrollo + 1.5 días de testing y ajustes

---

## 8. RIESGOS Y MITIGACIÓN

### 8.1 Riesgos Identificados

**R-001: Contenido de página 1 muy largo causa overflow a página 2**
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:** 
  - Ajustar tamaños de fuente en `.pdfExport`
  - Reducir márgenes internos en PDF
  - Validar con casos reales de clientes (proyectos con 8-10 tareas)

**R-002: html2pdf no respeta salto de página en algunos navegadores**
- **Probabilidad:** Baja
- **Impacto:** Alto
- **Mitigación:**
  - Testing en Chrome, Edge, Firefox
  - Si falla, considerar alternativa: `jsPDF` + `html2canvas` manual

**R-003: Texto de notas desactualizado o con errores**
- **Probabilidad:** Baja
- **Impacto:** Medio
- **Mitigación:**
  - Validar texto final con CPAU antes de implementar
  - Hacer constantes fácilmente editables (archivo separado)

**R-004: PDF muy pesado (>2 MB) por imágenes**
- **Probabilidad:** Baja
- **Impacto:** Medio
- **Mitigación:**
  - Optimizar logo CPAU (SVG a PNG si es necesario)
  - Mantener quality JPEG en 0.98 (ya configurado)
  - Validar tamaño final del PDF

**R-005: Cambios en el diseño de página 1 rompen el PDF**
- **Probabilidad:** Media
- **Impacto:** Medio
- **Mitigación:**
  - Documentar dependencias entre pantalla y PDF
  - Testing de regresión al modificar ResultadoBasicoDetalle
  - Considerar separar estilos de pantalla vs PDF más claramente

**R-006: Ventana de previsualización bloqueada por navegador (popup blocker)**
- **Probabilidad:** Alta
- **Impacto:** Medio
- **Mitigación:**
  - Mostrar mensaje al usuario si `window.open()` retorna `null`
  - Instruir al usuario para habilitar popups para el sitio
  - Alternativa: Usar modal interno en lugar de ventana nueva
  - Considerar usar `target="_blank"` con anchor tag como fallback

**R-007: Estilos no se copian correctamente a la ventana de previsualización**
- **Probabilidad:** Media
- **Impacto:** Alto
- **Mitigación:**
  - Copiar todos los `<link>` y `<style>` del documento principal
  - Usar rutas absolutas para imágenes y recursos
  - Incluir estilos inline como fallback
  - Testing exhaustivo en diferentes navegadores

**R-008: html2pdf.js no carga en ventana de previsualización**
- **Probabilidad:** Baja
- **Impacto:** Alto
- **Mitigación:**
  - Usar CDN confiable (cdnjs.cloudflare.com o unpkg)
  - Implementar timeout y mensaje de error
  - Alternativa: Incluir librería en el bundle principal y pasarla a la ventana
  - Verificar políticas CORS

---

## 9. DEPENDENCIAS Y REFERENCIAS

### 9.1 Archivos Afectados

```
App/Frontend/src/
├── components/wizard/
│   ├── ResultadoBasicoDetalle.jsx          ← Modificar (página 2)
│   └── ResultadoBasicoDetalle.module.css   ← Agregar estilos
├── utils/
│   ├── pdfConstants.js                     ← Crear (textos de notas)
│   └── formatters.js                       ← Sin cambios
└── assets/
    └── icons/logoBlanco.svg                ← Verificar optimización
```

### 9.2 Bibliotecas

- **html2pdf.js:** v0.10.x (ya instalado)
  - Docs: https://github.com/eKoopmans/html2pdf.js
  - API: html2pdf().set(opt).from(element).save()

### 9.3 Referencias del Cliente

- Diseño entregado: Ver imágenes adjuntas en el ticket
- Archivo de referencia: `01-Docs/00-Archs CPAU/Imprimible_ok.pdf` (diseño anterior)
- Contacto: tecnica@cpau.org (para validaciones de texto)

### 9.4 SPECs Relacionadas

- **SPEC007:** Responsive Design (validar que PDF no se afecta por escalas)
- **SPEC008:** Arrastre Progresivo (datos correctos en la tabla de honorarios)

---

## 10. NOTAS FINALES

### 10.1 Consideraciones de Diseño

El cliente CPAU es una institución profesional seria. El PDF debe transmitir:
- ✅ **Profesionalismo:** Formato limpio, tipografía clara
- ✅ **Confiabilidad:** Datos correctos, cálculos verificables
- ✅ **Legalidad:** Disclaimers visibles, notas explicativas completas

### 10.2 Beneficios de la Ventana de Previsualización

**Para el usuario:**
- ✅ Puede revisar el contenido antes de generar el PDF
- ✅ Evita descargas innecesarias si detecta errores
- ✅ Puede copiar texto directamente desde la ventana
- ✅ Puede regenerar el PDF múltiples veces si es necesario

**Para el desarrollador:**
- ✅ Facilita debugging con F12 (ver HTML y CSS antes de conversión)
- ✅ Permite verificar que los datos se inyectan correctamente
- ✅ Identifica problemas de layout antes de la conversión a PDF
- ✅ Testing más rápido (no necesita abrir PDF cada vez)

### 10.3 Futuras Mejoras (Fuera de Scope)

- Agregar número de página (1/2, 2/2) en footer
- Marca de agua "Copia informativa"
- Opción de enviar PDF por email desde la app
- Versión imprimible sin colores (blanco y negro)
- Opción de agregar logo del profesional
- Botón "Editar" en ventana de previsualización para volver al wizard

### 10.3 Aprobaciones

**Pendiente de aprobación:**
- [ ] CPAU - Dirección de Diseño (validar diseño final)
- [ ] CPAU - Dirección Técnica (validar textos de notas)
- [ ] Equipo de Desarrollo (estimación de esfuerzo)
- [ ] QA (plan de testing)

---

**Fin de la especificación SPEC-CALC-004**

*Documento vivo - actualizar según feedback del cliente y hallazgos de implementación*






















## 🔍 **Análisis Profundo del Problema**

### **Diagnóstico:**

Observo las dos imágenes y veo que:
- **Previsualización**: contenido ancho ~750px, header proporcionado
- **Vista previa de impresión**: contenido ~720px (A4 con márgenes), header se ve más pequeño

### **¿Por qué pasa esto?**

El navegador hace **escalado automático** al imprimir:

1. **Diferentes "unidades reales"**:
   - Pantalla: 1px = 1px de monitor
   - Impresión: el navegador convierte px → mm usando **96 DPI**
   - 180px en pantalla = 47.6mm en papel
   - Pero el navegador puede **re-escalar** para encajar todo en A4

2. **El navegador aplica "Shrink to Fit"** automáticamente:
   - Si tu contenido es ligeramente más ancho que el área imprimible
   - Chrome/Edge lo reducen un % para que entre
   - Esto comprime visualmente todo, incluido el header

3. **CSS Responsive aún se ejecuta**:
   - Aunque puse valores fijos en `@media print`, otras propiedades CSS (no del header) siguen siendo responsive
   - Esto puede causar que el navegador recalcule todo

---

## 💡 **Posibles Soluciones (de mejor a peor):**

### **🥇 SOLUCIÓN 1: "WYSIWYG" - Previsualización idéntica al PDF** ⭐⭐⭐
**Hacer que la previsualización tenga EXACTAMENTE las mismas dimensiones que A4**

```javascript
#preview-container {
  width: 190mm;  // A4 (210mm) menos márgenes (10mm × 2)
  // En lugar de max-width: 900px
}
```

**Ventajas:**
- ✅ Lo que ves es **exactamente** lo que imprimes
- ✅ El cliente nunca verá diferencia
- ✅ El header se ve igual en ambas vistas (porque tienen el mismo ancho)
- ✅ No hay sorpresas

**Desventajas:**
- La previsualización se ve un poco más estrecha (~720px en lugar de 900px)
- Pero **es real** y coincidirá con el PDF

---

### **🥈 SOLUCIÓN 2: Usar unidades milímetros (mm)** ⭐⭐
**Cambiar px por mm en los estilos de impresión**

```css
@media print {
  [class*="headerLeft"] {
    width: 48mm;        // En lugar de 180px
    min-height: 27mm;
  }
  [class*="logo"] {
    width: 35mm;
    max-height: 18mm;
  }
}
```

**Ventajas:**
- ✅ El navegador no necesita convertir unidades
- ✅ Tamaños exactos en papel

**Desventajas:**
- ⚠️ Las unidades mm no funcionan bien en pantalla (la previsualización seguiría usando px)

---

### **🥉 SOLUCIÓN 3: Combinar ambas (RECOMENDADA)** ⭐⭐⭐⭐
1. **Previsualización**: ancho 190mm (igual que A4 imprimible)
2. **Impresión**: misma estructura, ya coinciden naturalmente
3. **Resultado**: previsualización y vista de impresión son **idénticas**

---

### **🏅 SOLUCIÓN 4: Forzar zoom 100% en impresión** ⭐
```css
@media print {
  html {
    zoom: 1 !important;
    transform: scale(1) !important;
  }
}
```
**Riesgo:** Puede no funcionar consistentemente en todos los navegadores

---

### **🎯 SOLUCIÓN 5: Pre-renderizar a tamaño A4 desde el inicio** ⭐⭐⭐⭐⭐
Mostrar la previsualización con dimensiones EXACTAS de papel:
- Ancho fijo: 793px (A4 a 96 DPI) o 190mm
- Header con valores fijos en px y/o mm
- Renderizar TODO en el tamaño final

---

## 🎯 **MI RECOMENDACIÓN: Solución 1 + 3 (Híbrido)**

**Estrategia "What You See Is What You Get":**

1. La ventana de previsualización tiene un contenedor de **190mm de ancho** (= A4 imprimible)
2. Visualmente se ve un poco más estrecho, pero **es el tamaño real del PDF**
3. Cuando el usuario imprima, la vista previa de Windows se verá **idéntica** porque el contenido ya tiene el tamaño correcto
4. No hay shrink-to-fit, no hay recalculación responsive
5. El header se ve igual porque el contexto es el mismo

**Pros:**
- ✅ Cliente satisfecho: ambas vistas son idénticas
- ✅ Implementación mínima (5 líneas de cambio)
- ✅ No rompe nada
- ✅ Resultado profesional

**Cons:**
- Previsualización se ve ~20% más estrecha que ahora
- Pero **es la realidad del PDF**

---

**¿Te parece bien que implementemos la Solución 1+3 (preview con dimensiones reales de A4)?**