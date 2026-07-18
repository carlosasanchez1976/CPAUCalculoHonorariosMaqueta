# 🎨 Template Manager - Guía de Uso

## ¿Qué es esto?

Herramienta standalone para editar, previsualizar y subir templates de certificados PDF al entorno QA **sin necesidad de intervención del Tech Lead**.

**Antes:** 30-60 minutos por iteración (esperando a Charly)  
**Ahora:** 30 segundos de forma autónoma ✅

---

## 🚀 Cómo Usar

### Paso 1: Abrir la Herramienta

1. Navega a: `https://ch2026-qa.neosisweb.ar/template-manager.html`
4. ✅ **No requiere instalación ni servidor local**

---

### Paso 2: Seleccionar Template

1. En el selector **"Template a editar"**, elige el certificado que vas a modificar:
   - **Certificado Proyecto y Dirección Básico** (PYDOA)
   - **Certificado de Relevamiento** (RELE)
   - **Certificado de Tasación** (TASA)
   - etc.

2. El HTML actual se cargará automáticamente en el editor (textarea izquierdo)

---

### Paso 3: Editar HTML

1. Modifica el HTML en el **textarea izquierdo**
2. Usa sintaxis **Handlebars** para variables dinámicas:
   ```handlebars
   <h1>{{nombreProyecto}}</h1>
   <p>Cliente: {{cliente}}</p>
   <p>Superficie: {{superficieTotal}} m²</p>
   <p>Valor: {{valorObraARS}}</p>
   ```

3. **Shortcuts útiles:**
   - `Ctrl+Enter`: Preview rápido sin hacer click en el botón

---

### Paso 4: Preview

1. Click en botón **"👁️ Preview"**
2. El panel derecho mostrará cómo se ve el certificado con **datos de prueba reales**
3. ✅ Itera tantas veces como necesites (sin límite)

**Datos de prueba:**
- Basados en cálculo real ID 397 (Proyecto y Dirección)
- Superficie: 2500 m²
- Valor obra: $ 500.000.000,00
- Cliente: "Inmobiliaria ABC SA"

---

### Paso 5: Subir a QA

1. Cuando estés conforme con el diseño, click en **"⬆️ Subir a QA"**
2. Confirma la acción en el popup
3. ✅ El template se actualiza **inmediatamente** en la base de datos QA
4. Ahora puedes probar desde el frontend en QA: https://cpau-ch2026-qa.neosisweb.ar

**Tiempo total:** ⏱️ **30 segundos** vs 30-60 minutos antes

---

## 📝 Variables Disponibles

### Datos del Proyecto (nivel raíz)

```handlebars
{{nombreProyecto}}        → "PRUEBA"
{{cliente}}               → "Inmobiliaria ABC SA"
{{ubicacion}}             → "CABA - Microcentro"
{{superficieTotal}}       → 2500
{{tipoObra}}              → "Nueva"
{{destinoUso}}            → "Residencial multifamiliar"
{{plazoEjecucion}}        → 18
```

### Valores Monetarios Formateados

```handlebars
{{valorObraARS}}          → "$ 500.000.000,00"
{{valorObraUSD}}          → "$ 344.533,10"
{{totalGeneralARS}}       → "$ 77.200.000,00"
{{totalGeneralUSD}}       → "$ 53.219,04"
{{subtotalObraARS}}       → "$ 42.000.000,00"
{{subtotalObraUSD}}       → "$ 28.949,63"
```

### Metadata

```handlebars
{{currentDate}}           → "14/07/2026"
{{calculationNumber}}     → "397"
{{logoCPAU}}              → (Base64 del logo CPAU)
```

### Datos Anidados (formData / calculationResult)

También puedes acceder a datos anidados:

```handlebars
{{formData.nombreProyecto}}
{{formData.cliente}}
{{formData.superficieTotal}}
{{calculationResult.totalHonorarios}}
```

**Recomendación:** Usa los campos de nivel raíz cuando estén disponibles (más simple).

---

## 🎨 Helpers Handlebars

### Formateo de Moneda

```handlebars
{{formatCurrencyARS 500000000}}
→ "$ 500.000.000,00"

{{formatCurrencyUSD 344533.10}}
→ "$ 344.533,10"
```

### Formateo de Porcentaje

```handlebars
{{formatPercent 15.4}}
→ "15,40%"
```

### Condicionales

```handlebars
{{#if honorariosObra}}
  <section>
    <!-- Mostrar tabla de honorarios -->
  </section>
{{/if}}
```

### Iteraciones

```handlebars
{{#each honorariosObra}}
  <tr>
    <td>{{this.tareaProfesional}}</td>
    <td>{{this.importeARS}}</td>
  </tr>
{{/each}}
```

---

## ⚠️ Notas Importantes

### ✅ Buenas Prácticas

1. **Guarda tu HTML localmente antes de subir** (Git, backup)
2. **Prueba el Preview antes de subir** a QA (evita errores)
3. **Usa Ctrl+Enter** para preview rápido mientras editas
4. **No cierres el navegador** hasta confirmar que el cambio se aplicó

### ⚠️ Advertencias

1. ⚠️ **El preview usa datos de prueba, no datos reales de producción**
2. ⚠️ **Los cambios son inmediatos en QA** (no requiere re-deploy)
3. ⚠️ **No hay "undo"** — si subes, el cambio es permanente (usa Git para revertir)
4. ⚠️ **Validación de sintaxis:** El sistema valida Handlebars antes de subir

---

## 🔍 Ver Test Data Completo

Si necesitas ver **TODOS** los campos disponibles:

1. Abre: `App/Backend/Node/src/data/test-data-templates.json`
2. O consulta la documentación: `src/data/README-TEST-DATA.md`

---

## 🆘 Problemas Comunes

### ❌ "Error en sintaxis Handlebars"

**Causa:** Variables Handlebars mal cerradas o syntax error

**Solución:**
- Revisa que todos los `{{` tengan su `}}`
- Verifica que los nombres de variables coincidan exactamente
- Ejemplo correcto: `{{nombreProyecto}}`
- Ejemplo incorrecto: `{{nombreproyecto}}` (minúscula incorrecta)

---

### ❌ "Preview en blanco"

**Causa:** Error de CSS o JavaScript en el template

**Solución:**
1. Abre la consola del navegador (`F12` → Consola)
2. Busca errores en rojo
3. Revisa que todos los `<style>` y `<script>` estén bien cerrados

---

### ❌ "Template no se actualiza en frontend QA"

**Causa:** Puede haber caché del navegador

**Solución:**
1. Confirma que seleccionaste el template correcto en el selector
2. Recarga el frontend QA con `Ctrl+F5` (hard refresh)
3. Genera un nuevo PDF desde el wizard

---

### ❌ "Error cargando templates"

**Causa:** Problema de conexión con la API QA

**Solución:**
1. Verifica que tengas internet
2. Confirma que la API QA esté disponible: https://cpau-ch2026-api-qa.neosisweb.ar/api/admin/templates/list
3. Si persiste, contacta a Charly

---

## 📊 Flujo Completo

```
1. Diseñador edita HTML localmente (VS Code, Sublime, etc.)
   ↓
2. Abre template-manager.html en Chrome
   ↓
3. Selecciona template del dropdown
   ↓
4. Copia/pega HTML en el editor
   ↓
5. Click "Preview" → ve resultado con datos reales
   ↓
6. Itera cambios cuantas veces necesite
   ↓
7. Click "Subir a QA" → template actualizado en BD
   ↓
8. Prueba desde frontend QA inmediatamente
   ↓
9. Si funciona: commit a Git ✅
```

**Total:** ⏱️ **30 segundos** vs 30-60 minutos con flujo manual

---

## 🎯 Ejemplo de Uso Real

**Caso:** Cambiar título del certificado

**Antes (flujo manual):**
1. Diseñador edita HTML → commit Git → push
2. Avisa a Charly por Slack
3. Charly hace pull → ejecuta script → copia hex
4. Charly actualiza BD manualmente
5. Charly deploya frontend a QA
6. Diseñador prueba (30-60 minutos después)

**Ahora (con Template Manager):**
1. Diseñador abre `template-manager.html`
2. Edita línea: `<h1>{{nombreProyecto}}</h1>` → `<h1>Datos del Proyecto: {{nombreProyecto}}</h1>`
3. Preview → confirma cambio
4. "Subir a QA" → listo
5. Prueba en frontend inmediatamente (30 segundos totales) ✅

---

## 📞 Contacto

**Responsable:** Charly (Tech Lead)  
**SPEC:** SPEC020-ADMIN-Template-Manager  
**Ticket:** T020-004

Si tienes problemas o dudas, contacta a Charly.

---

## 🔐 Consideraciones de Seguridad

⚠️ **Solo para entorno QA/Desarrollo**

- Los endpoints NO tienen autenticación (temporal)
- NO usar en producción
- Solo accesible desde red interna/VPN

---

## 📚 Referencias

- **Test Data:** `src/data/test-data-templates.json`
- **Documentación Test Data:** `src/data/README-TEST-DATA.md`
- **Spec Completa:** `01-Docs/00-Specs/SPEC020-ADMIN-Template-Manager.md`
- **Frontend QA:** https://cpau-ch2026-qa.neosisweb.ar
- **API QA:** https://cpau-ch2026-api-qa.neosisweb.ar

---

**¡Feliz iteración autónoma! 🚀**
