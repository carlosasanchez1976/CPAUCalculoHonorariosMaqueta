# Testing - Ticket 004: Ventana de Previsualización PDF

**Fecha:** 28/05/2026  
**Componente:** ResultadoBasicoDetalle.jsx  
**Funcionalidad:** Previsualización del PDF antes de generar

---

## ✅ Implementación Completada

### Archivos Modificados:
- ✅ `App/Frontend/src/components/wizard/ResultadoBasicoDetalle.jsx`

### Funciones Agregadas:
1. ✅ `handleDescargarPDF()` - Ahora abre ventana de preview en lugar de generar directamente
2. ✅ `abrirVentanaPreview()` - Crea y configura la ventana de previsualización
3. ✅ `copiarEstilosAVentana()` - Copia todos los estilos CSS a la nueva ventana
4. ✅ `convertirRutasAAbsolutas()` - Convierte rutas relativas de imágenes a absolutas

### Funcionalidad de la Ventana:
- ✅ Botón "Cerrar" → Cierra la ventana
- ✅ Botón "Generar PDF" → Descarga el archivo PDF
- ✅ Carga dinámica de html2pdf.js desde CDN
- ✅ Detección de popup blocker con mensaje de ayuda
- ✅ Estados del botón (normal, generando, éxito)

---

## 🧪 Pasos de Testing Manual

### Test 1: Apertura de Ventana
1. Navegar a la página de resultados del cálculo
2. Aceptar términos y condiciones
3. Click en "Descargar PDF"
4. **Verificar:**
   - ✓ Se abre nueva ventana/pestaña
   - ✓ Ventana muestra las 2 páginas del PDF
   - ✓ Estilos se ven correctos (colores, fonts, layout)
   - ✓ Imágenes (logo CPAU) se cargan correctamente

### Test 2: Botón "Cerrar"
1. Desde la ventana de previsualización
2. Click en botón "✕ Cerrar"
3. **Verificar:**
   - ✓ Ventana se cierra
   - ✓ Aplicación principal permanece abierta

### Test 3: Botón "Generar PDF"
1. Desde la ventana de previsualización
2. Click en botón "📄 Generar PDF"
3. **Verificar:**
   - ✓ Botón cambia a "⏳ Generando PDF..."
   - ✓ Botón queda deshabilitado durante generación
   - ✓ Se descarga archivo `Honorarios-CPAU-{número}.pdf`
   - ✓ Botón cambia a "✓ PDF Generado" (2 segundos)
   - ✓ Botón vuelve a "📄 Generar PDF" y se habilita
   - ✓ Ventana permanece abierta (no se cierra)

### Test 4: Contenido del PDF Generado
1. Abrir el PDF descargado
2. **Verificar:**
   - ✓ Página 1: Datos del cálculo completos
   - ✓ Página 2: Notas institucionales
   - ✓ Header aparece en ambas páginas
   - ✓ Botones de previsualización NO aparecen en el PDF
   - ✓ Formato: Legal, vertical
   - ✓ Calidad de imagen buena

### Test 5: Inspección con F12
1. Abrir ventana de previsualización
2. Presionar F12 para abrir DevTools
3. **Verificar:**
   - ✓ Se pueden inspeccionar elementos HTML
   - ✓ Se pueden ver estilos CSS aplicados
   - ✓ No hay errores en la consola
   - ✓ Imágenes tienen rutas absolutas

### Test 6: Regeneración Múltiple
1. Desde ventana de previsualización, generar PDF
2. Esperar a que termine
3. Click en "Generar PDF" nuevamente
4. **Verificar:**
   - ✓ Se puede generar PDF múltiples veces
   - ✓ No hay errores en consola
   - ✓ Cada descarga funciona correctamente

### Test 7: Popup Blocker
1. Configurar navegador para bloquear popups
2. Click en "Descargar PDF"
3. **Verificar:**
   - ✓ Aparece alert con mensaje de instrucciones
   - ✓ Mensaje es claro y útil
   - ✓ No se genera error en consola

### Test 8: Diferentes Navegadores
Repetir Tests 1-4 en:
- ✓ Chrome
- ✓ Edge
- ✓ Firefox

### Test 9: Diferentes Escalas de Windows
Repetir Tests 1-4 en:
- ✓ Escala 100%
- ✓ Escala 125%
- ✓ Escala 150%

### Test 10: Responsive
1. Abrir ventana de previsualización
2. Cambiar tamaño de ventana (más pequeña)
3. **Verificar:**
   - ✓ Scroll vertical funciona
   - ✓ Contenido no se desborda horizontalmente
   - ✓ Botones de acción permanecen fijos al final

---

## 🐛 Casos Edge a Probar

### CE-1: Conexión Lenta
1. Throttling de red a "Slow 3G"
2. Intentar generar PDF desde previsualización
3. **Verificar:**
   - ✓ html2pdf.js se carga correctamente (puede tardar)
   - ✓ No hay timeout
   - ✓ Mensaje de error claro si falla la carga

### CE-2: Sin Conexión
1. Desconectar internet DESPUÉS de abrir la ventana
2. Intentar generar PDF
3. **Verificar:**
   - ✓ Muestra error claro
   - ✓ No se rompe la aplicación

### CE-3: Múltiples Ventanas
1. Abrir ventana de previsualización
2. Sin cerrarla, volver a app y hacer click en "Descargar PDF" nuevamente
3. **Verificar:**
   - ✓ Se abre segunda ventana sin problemas
   - ✓ Ambas ventanas funcionan independientemente

### CE-4: Datos con Caracteres Especiales
1. Crear proyecto con nombre: "Proyecto & <Test> 'Especial'"
2. Generar previsualización
3. **Verificar:**
   - ✓ Nombre se muestra correctamente
   - ✓ No hay errores de HTML mal formado
   - ✓ PDF se genera correctamente

---

## 📊 Checklist de Aceptación

### Funcional
- [ ] La ventana de previsualización se abre al hacer click en "Descargar PDF"
- [ ] El contenido muestra exactamente lo que se exportará (2 páginas)
- [ ] Botón "Cerrar" cierra la ventana
- [ ] Botón "Generar PDF" descarga el archivo correctamente
- [ ] Ventana permanece abierta después de generar PDF
- [ ] Se puede regenerar el PDF múltiples veces

### Visual
- [ ] Estilos CSS se aplican correctamente en la ventana
- [ ] Logo CPAU se ve correctamente
- [ ] Colores y tipografía coinciden con el diseño
- [ ] Layout de 2 columnas se ve bien en página 1
- [ ] Página 2 de notas se ve legible

### Técnico
- [ ] No hay errores en consola del navegador
- [ ] html2pdf.js se carga dinámicamente sin problemas
- [ ] Popup blocker detectado y mensaje mostrado
- [ ] Rutas de imágenes convertidas a absolutas
- [ ] Estilos CSS copiados correctamente

### Cross-browser
- [ ] Funciona en Chrome
- [ ] Funciona en Edge
- [ ] Funciona en Firefox

### Performance
- [ ] Ventana se abre en < 1 segundo
- [ ] PDF se genera en < 5 segundos
- [ ] No hay lag en la UI

---

## 🚀 Cómo Probar

### 1. Levantar el servidor de desarrollo
```powershell
cd App/Frontend
npm run dev
```

### 2. Navegar a la aplicación
```
http://localhost:5173
```

### 3. Completar un cálculo de honorarios
- Ir a "Nuevo Cálculo"
- Completar todos los pasos del wizard
- Llegar a ResultadoBasicoDetalle

### 4. Probar la funcionalidad
- Aceptar términos
- Click en "Descargar PDF"
- Verificar ventana de previsualización
- Probar botón "Generar PDF"
- Abrir PDF descargado y verificar contenido

---

## 📝 Notas de Implementación

### Decisiones Técnicas:
1. **Clonar vs Serializar:** Se usó `cloneNode(true)` en lugar de serializar a string HTML porque:
   - Más simple
   - Preserva event listeners si fuera necesario
   - Menos propenso a errores de encoding

2. **CDN para html2pdf:** Se carga desde CDN en la ventana en lugar de incluirlo en el bundle porque:
   - Reduce tamaño del bundle principal
   - Solo se carga cuando se necesita
   - CDN de Cloudflare es confiable

3. **Estilos inline en ventana:** Los estilos de la ventana (botones, layout) están inline porque:
   - No dependen de los CSS Modules del proyecto
   - Son específicos de esta ventana
   - Más fácil de mantener

### Mejoras Futuras (Fuera de Scope):
- [ ] Mostrar indicador de carga mientras se copia contenido
- [ ] Agregar botón "Editar" para volver al wizard
- [ ] Guardar PDF en servidor (opcional)
- [ ] Enviar PDF por email desde la ventana
- [ ] Opción de imprimir directamente desde ventana

---

## ✅ Resultado Esperado

Al completar todos los tests, el usuario debe poder:
1. ✅ Ver el contenido del PDF antes de descargarlo
2. ✅ Inspeccionar el HTML/CSS con DevTools (F12)
3. ✅ Generar el PDF desde la ventana de previsualización
4. ✅ Regenerar el PDF si es necesario
5. ✅ Cerrar la ventana cuando termine

**Estado:** ✅ IMPLEMENTADO - Listo para testing
