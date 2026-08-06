# TICKET DE SOPORTE #[NNN] - [Título breve del problema]

> **INSTRUCCIONES:** Reemplazar todos los textos entre corchetes `[...]` con la información correspondiente. Eliminar secciones no aplicables. Este template está diseñado para mantener consistencia en la documentación de incidentes de producción.

**Fecha de reporte:** [DD/MM/AAAA]  
**Fecha de resolución:** [DD/MM/AAAA] *(completar al cerrar el ticket)*  
**Severidad:** [🔴 ALTA / 🟡 MEDIA / 🟢 BAJA] - [Breve justificación]  
**Estado:** [🔴 ABIERTO / 🟡 EN PROGRESO / ✅ RESUELTO / ⏸️ EN ESPERA]  
**Módulo afectado:** [Nombre del módulo/funcionalidad]  
**Archivo(s):** `[Ruta/del/archivo/principal.js]`  
**Reportado por:** [Cliente CPAU / Usuario / Equipo interno]  
**Asignado a:** [Nombre del desarrollador o equipo]

---

## 📋 RESUMEN EJECUTIVO

*Descripción breve y clara del problema en 2-3 líneas, comprensible para stakeholders no técnicos.*

[Ejemplo: "El sistema presentó un error al guardar cálculos cuando el usuario no completaba todos los campos opcionales, impidiendo generar certificados PDF."]

---

## 🔍 DESCRIPCIÓN DEL ERROR

### Síntoma
*Descripción detallada de lo que el usuario observa o experimenta.*

[Ejemplo: "Al hacer clic en 'Guardar cálculo', aparece un error 500 y no se guarda la información ingresada."]

**Pasos para reproducir:**
1. [Paso 1]
2. [Paso 2]
3. [Paso 3]
4. **Resultado esperado:** [Qué debería pasar]
5. **Resultado actual:** [Qué pasa realmente]

### Impacto
*Evaluar el impacto en las tres dimensiones principales:*

- **Funcional:** [Qué funcionalidad queda bloqueada o afectada]
- **Usuarios afectados:** [Todos / Grupo específico / Casos edge]
- **Workaround disponible:** [SÍ/NO - Si existe, describir brevemente]
- **Criticidad de negocio:** [Alta/Media/Baja - Justificar]

### Evidencia
*Adjuntar capturas, logs, mensajes de error, etc.*

- **Captura de pantalla:** [Link o referencia a imagen]
- **Console logs:** 
  ```
  [Pegar logs relevantes del navegador o servidor]
  ```
- **Network request/response:**
  ```json
  [Ejemplo de request/response con error]
  ```

---

## 🐛 ANÁLISIS DE CAUSA RAÍZ

### Código problemático
**Archivo:** [Nombre del archivo] - Líneas [XX-YY]  
**Función/Componente:** `[nombreFuncion()]` o `<ComponenteReact />`

```javascript
// ❌ CÓDIGO CON ERROR
[Pegar fragmento de código que contiene el bug, con contexto suficiente]
```

### Causa del error

*Explicar EN DETALLE la causa raíz del problema. Responder:*
- ¿Por qué ocurrió?
- ¿Qué condiciones lo desencadenan?
- ¿Qué lógica de negocio es incorrecta?

[Ejemplo estructurado:]

1. **Condición inicial:** [Descripción del estado antes del error]
2. **Evento desencadenante:** [Qué acción/datos causan el problema]
3. **Lógica incorrecta:** [Qué parte del código falla y por qué]
4. **Resultado:** [Consecuencia técnica del error]

### Contexto técnico adicional

*Si aplica, incluir:*
- Variables de entorno involucradas
- Configuraciones específicas
- Dependencias con otras funcionalidades
- Historial de cambios recientes relacionados

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Corrección aplicada

**Archivo:** [Nombre del archivo] - Líneas [XX-YY]  
**Commit:** `[Hash del commit o ID]`  
**Branch:** [nombre-del-branch]  
**PR/MR:** [Link al Pull Request si aplica]

```javascript
// ✅ CÓDIGO CORREGIDO
[Pegar código corregido con el mismo contexto que el código con error]
```

### Justificación técnica

*Explicar POR QUÉ esta solución resuelve el problema:*

1. **[Punto clave 1]:** [Explicación]
2. **[Punto clave 2]:** [Explicación]
3. **[Punto clave 3]:** [Explicación]

### Cambios adicionales (si aplica)

*Si se modificaron otros archivos o se agregaron validaciones:*

- **Archivo:** `[ruta/archivo.js]` - [Breve descripción del cambio]
- **Archivo:** `[ruta/otro-archivo.js]` - [Breve descripción del cambio]

---

## 🧪 VALIDACIÓN Y TESTING

### Casos de prueba ejecutados

| ID | Descripción | Resultado | Comentarios |
|----|-------------|-----------|-------------|
| **TC-001** | [Descripción del caso de prueba] | ✅ PASS / ❌ FAIL | [Observaciones] |
| **TC-002** | [Descripción del caso de prueba] | ✅ PASS / ❌ FAIL | [Observaciones] |
| **TC-003** | [Descripción del caso de prueba] | ✅ PASS / ❌ FAIL | [Observaciones] |

### Validación de datos (si aplica)

*Si el bug involucra cálculos, transformaciones de datos, etc.:*

```
Input de prueba:
  - [Campo 1]: [Valor]
  - [Campo 2]: [Valor]

Cálculo esperado:
  - [Paso 1]: [Resultado intermedio]
  - [Paso 2]: [Resultado intermedio]
  - [Resultado final]: [Valor esperado] ✅

Output del sistema (post-corrección):
  - [Resultado final]: [Valor obtenido] ✅ CORRECTO / ❌ INCORRECTO
```

### Pruebas de regresión

*Validar que la corrección no rompe funcionalidad existente:*

- [ ] [Funcionalidad relacionada 1] → ✅ Funcionando correctamente
- [ ] [Funcionalidad relacionada 2] → ✅ Funcionando correctamente
- [ ] [Flujo crítico completo] → ✅ Funcionando correctamente

---

## 📊 IMPACTO DEL CAMBIO

### Archivos modificados
- ✅ `[Archivo 1]` ([N] líneas modificadas)
- ✅ `[Archivo 2]` ([N] líneas modificadas)
- ✅ `[Archivo 3]` (nuevo archivo)

### Análisis de regresión
- **Riesgo de regresión:** [ALTO / MEDIO / BAJO]
- **Justificación:** [Por qué es bajo/medio/alto el riesgo]
- **Cobertura de testing:** [X casos de prueba ejecutados]

### Plan de deployment

- **Ambientes:**
  - [ ] Dev → ✅ Deployado [fecha]
  - [ ] QA → ✅ Validado [fecha]
  - [ ] Staging → ⏳ Pendiente
  - [ ] Producción → ⏳ Pendiente [fecha planeada]
- **Downtime requerido:** [SÍ/NO - Cuánto tiempo]
- **Rollback plan:** [Disponible / No aplica - Explicación breve]
- **Migraciones de DB:** [SÍ/NO - Scripts adjuntos si aplica]

---

## 📝 RECOMENDACIONES

### Acciones inmediatas
*Qué hacer ahora para cerrar el incidente:*

1. ✅ [Acción 1] → (completado)
2. ⏳ [Acción 2] → (pendiente)
3. ⏳ [Acción 3] → (pendiente)

### Mejoras preventivas
*Cómo evitar que este tipo de error vuelva a ocurrir:*

1. **Testing automatizado:**
   - [Tipo de test a implementar]
   - [Cobertura específica necesaria]

2. **Code review:**
   - [Lineamiento a reforzar]
   - [Patrón a evitar en el futuro]

3. **Documentación:**
   - [Qué documentar]
   - [Dónde documentar]

4. **Refactoring futuro (si aplica):**
   - [Deuda técnica identificada]
   - [Propuesta de mejora arquitectónica]

### Auditoría de impacto (si aplica)
*Si el bug afectó datos en producción:*

- **Período afectado:** [Fecha inicio - Fecha fin]
- **Registros afectados:** [Cantidad estimada]
- **Acción correctiva:** [Plan de corrección de datos si es necesario]

---

## 📎 REFERENCIAS

*Links a documentación relevante:*

- **SPEC relacionada:** [SPECXXX-Nombre.md]
- **Ticket relacionado:** [TK-XXX]
- **Documentación técnica:** [Link]
- **Archivo(s) modificado(s):** 
  - `[Ruta completa al archivo 1]`
  - `[Ruta completa al archivo 2]`
- **Función/Componente principal:** `[nombreFuncionPrincipal()]`

---

## ✍️ FIRMAS Y APROBACIONES

**Desarrollador:** [Nombre]  
**Fecha implementación:** [DD/MM/AAAA]

**Revisado por:** [Nombre - Rol]  
**Fecha revisión:** [DD/MM/AAAA]

**Aprobado por:** [Nombre - Rol]  
**Fecha aprobación:** [DD/MM/AAAA]

**Deploy a producción:** [Nombre - Rol]  
**Fecha deploy:** [DD/MM/AAAA]

---

## 📌 NOTAS ADICIONALES

*Espacio para cualquier información relevante que no encaje en las secciones anteriores:*

[Notas, observaciones, lecciones aprendidas, etc.]

---

**Clasificación:** Interno - Documentación de Soporte  
**Versión del documento:** 1.0  
**Última actualización:** [DD/MM/AAAA]

---

## 🎯 CHECKLIST DE CIERRE

Antes de cerrar el ticket, verificar:

- [ ] Código corregido y commiteado
- [ ] Tests ejecutados y pasando
- [ ] Documentación actualizada
- [ ] Deploy a producción completado
- [ ] Cliente/Usuario notificado
- [ ] Ticket documentado completamente
- [ ] Lecciones aprendidas registradas
- [ ] Mejoras preventivas planificadas (si aplica)