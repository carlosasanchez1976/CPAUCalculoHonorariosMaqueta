# Templates PDF - CPAU CH2026

Este directorio contiene las plantillas HTML para generar los certificados PDF de honorarios profesionales.

## 📁 Contenido

- `certificado-basico-proyecto-direccion.html` - Plantilla para el cálculo básico de Proyecto y Dirección

## 🚀 Carga en Base de Datos

Para cargar una plantilla en la base de datos `Entregables_PDF`:

### Requisitos previos

1. Asegurarse de que las variables de entorno estén configuradas:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=cpau_ch2026
   DB_PORT=3306
   ```

2. Tener instalado `mysql2`:
   ```bash
   npm install mysql2
   ```

### Ejecutar el script de carga

```bash
# Desde la raíz del backend
cd App/Backend/Node

# Ejecutar el script
node scripts/cargar-template-pdf.js
```

El script:
- ✅ Lee el archivo HTML
- ✅ Verifica si ya existe un registro (entregable_id = 1)
- ✅ Pregunta si desea sobrescribir en caso de existir
- ✅ Inserta el nuevo template en la BD
- ✅ Verifica la inserción exitosa
- ✅ Muestra un preview del HTML insertado

## 📝 Estructura del Template

### Motor de templating: Handlebars

```handlebars
<!-- Variables simples -->
{{nombreProyecto}}
{{cliente}}
{{superficieTotal}}

<!-- Bloques condicionales -->
{{#if honorariosObra}}
  <!-- contenido -->
{{/if}}

<!-- Iteradores -->
{{#each honorariosObra}}
  {{this.indice}}
  {{this.tareaProfesional}}
  {{this.importeARS}}
{{/each}}
```

### Helpers disponibles

```javascript
formatCurrency(value)      // $ 1.234.567,89
formatDate(date)           // DD/MM/YYYY
formatPercentage(value)    // 7.75
```

## 🎨 Diseño Visual

### Página 1: Datos del Cálculo
- Header CPAU con logo y metadata
- Resumen del proyecto (grid 2 columnas)
- Cuadro IMPORTANTE (disclaimer)
- Detalle de honorarios (3 tablas):
  - Honorarios obra → Subtotal azul
  - Honorarios adicionales → Subtotal azul
  - Especialidades → Subtotal azul
- Total general (fondo morado)
- Plazo de ejecución
- Nota sobre IVA

### Página 2: Notas Institucionales CPAU
- Header CPAU (repetido)
- 6 secciones de texto:
  - Alcance y carácter del cálculo
  - Costo de obra considerado
  - Etapas del proyecto (con tabla)
  - Alcance de los honorarios
  - Conceptos no incluidos
  - Resolución de los honorarios

## 🎨 Paleta de Colores

```css
--morado-cpau: #5c4a8d          /* Header, total general */
--celeste-cpau: #90dede         /* Banda título */
--azul-subtotales: #4682b4      /* Subtotales */
--amarillo-border: #ffd966      /* Cuadro IMPORTANTE */
--amarillo-bg: #fffbf0          /* Fondo disclaimer */
```

## 📐 Especificaciones

- **Formato:** A4 (210mm x 297mm)
- **Márgenes:** 20mm superior/inferior, 15mm izq/der
- **Tipografía:** Segoe UI, 10pt base
- **Páginas:** 2
- **Tamaño archivo:** ~18 KB
- **Salto de página:** CSS `page-break-after: always`

## 🔧 Mantenimiento

### Modificar un template existente

1. Editar el archivo HTML en esta carpeta
2. Ejecutar el script de carga: `node scripts/cargar-template-pdf.js`
3. Confirmar sobrescritura cuando se solicite
4. Probar generación de PDF: `npm run test:pdf`

### Crear un nuevo template

1. Duplicar `certificado-basico-proyecto-direccion.html`
2. Renombrar (ej: `certificado-relevamiento.html`)
3. Modificar el HTML y placeholders según necesidad
4. Actualizar script de carga con nuevo `entregable_id`
5. Ejecutar script de carga
6. Actualizar `pdfService.js` para resolver el nuevo template

## ✅ Validación

Después de cargar un template, verificar en BD:

```sql
SELECT 
  entregable_id,
  nombre_plantilla,
  version,
  activo,
  LENGTH(html_template) as html_size_bytes
FROM Entregables_PDF
WHERE entregable_id = 1;
```

## 📚 Documentación Completa

Ver: `01-Docs/02-Test/T010-002-Documentacion-Template-PDF.md`

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verificar variables de entorno DB_*
- Verificar que MySQL esté corriendo
- Verificar credenciales

### Error: "File not found"
- Verificar que el archivo HTML existe en `templates/`
- Verificar ruta relativa desde `scripts/`

### Template no se carga correctamente
- Verificar sintaxis HTML
- Verificar que placeholders Handlebars sean válidos
- Verificar tamaño del archivo (< 1 MB)

---

**Última actualización:** 11/06/2026  
**Ticket:** T010-002
