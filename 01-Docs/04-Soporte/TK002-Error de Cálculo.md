# TICKET DE SOPORTE #002 - Error en Cálculo de Total General PDF

**Fecha de reporte:** 03/08/2026  
**Fecha de resolución:** 03/08/2026  
**Severidad:** 🔴 **ALTA** - Error en cálculo de honorarios  
**Estado:** ✅ **RESUELTO**  
**Módulo afectado:** Generación de PDF - Certificado de Honorarios  
**Archivo:** `App/Backend/Node/src/services/pdfService.js`  
**Reportado por:** Cliente CPAU  
**Asignado a:** Equipo de Desarrollo CH2026

---

## 📋 RESUMEN EJECUTIVO

El certificado PDF de honorarios presentaba un error crítico en el cálculo del **Total General**, mostrando el doble del valor correcto cuando el cálculo no incluía tareas categorizadas como "Obra".

---

## 🔍 DESCRIPCIÓN DEL ERROR

### Síntoma
Al generar el certificado PDF de honorarios, el campo **"TOTAL GENERAL"** mostraba un valor duplicado.

**Ejemplo del error:**
- Subtotal honorarios adicionales: **$ 2.084.400**
- Subtotal honorarios especialidades: **$ 720.000**
- **Total esperado:** $ 2.804.400
- **Total mostrado:** $ 5.608.800 ❌ (exactamente el doble)

### Impacto
- **Funcional:** Certificados emitidos con valores incorrectos
- **Legal:** Documentos oficiales con errores de cálculo
- **Reputacional:** Pérdida de confianza del cliente en la precisión del sistema

### Evidencia
![Error en PDF - Total duplicado](../02-Test/evidencia-tk002-total-duplicado.png)

---

## 🐛 ANÁLISIS DE CAUSA RAÍZ

### Código problemático
**Archivo:** `pdfService.js` - Líneas 286-288  
**Función:** `prepararDatosPlantilla()`

```javascript
// ❌ CÓDIGO CON ERROR
const subtotalObraARS = redondear(honorariosObra.length > 0 
  ? calcularSubtotalCategoria(honorariosObra)
  : (honorariosAgrupados.reduce((sum, t) => sum + (t.importe || 0), 0)));
```

### Causa del error

El código implementaba un **fallback incorrecto** cuando no existían tareas categorizadas como "Obra":

1. **Escenario normal** (con tareas de obra):
   - `subtotalObraARS` = suma de tareas de obra ✅
   - `subtotalAdicionalesARS` = suma de adicionales ✅
   - `subtotalEspecialidadesARS` = suma de especialidades ✅
   - Total = correcto ✅

2. **Escenario del bug** (sin tareas de obra):
   - `subtotalObraARS` = suma de **TODOS** los `honorariosAgrupados` (adicionales + especialidades) ❌
   - `subtotalAdicionalesARS` = suma de adicionales ❌ (ya estaba en subtotalObra)
   - `subtotalEspecialidadesARS` = suma de especialidades ❌ (ya estaba en subtotalObra)
   - **Total = duplicado** ❌

### Lógica de negocio incorrecta

El fallback asumía erróneamente que si no había tareas de "obra", debía sumar todas las tareas agrupadas. Sin embargo:
- Las tareas **ya estaban categorizadas** en `honorariosAdicionales` y `honorariosEspecialidades`
- El fallback causaba que esas tareas se sumaran **dos veces**:
  1. Primera vez: en `subtotalObraARS` (fallback)
  2. Segunda vez: en sus respectivos subtotales

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Corrección aplicada

**Archivo:** `pdfService.js` - Líneas 286-288  
**Commit:** [Hash del commit]  
**Branch:** main/producción

```javascript
// ✅ CÓDIGO CORREGIDO
const subtotalObraARS = redondear(calcularSubtotalCategoria(honorariosObra));
const subtotalAdicionalesARS = redondear(calcularSubtotalCategoria(honorariosAdicionales));
const subtotalEspecialidadesARS = redondear(calcularSubtotalCategoria(honorariosEspecialidades));
```

### Justificación técnica

1. **Eliminación del fallback innecesario:**
   - La función `calcularSubtotalCategoria()` ya maneja correctamente arrays vacíos, retornando `0`
   - No es necesario un fallback alternativo

2. **Consistencia en el cálculo:**
   - Todas las categorías (obra, adicionales, especialidades) se calculan con el mismo método
   - Se elimina la lógica condicional que causaba inconsistencias

3. **Simplicidad y mantenibilidad:**
   - Código más limpio y fácil de entender
   - Reduce la superficie de error para futuros cambios

---

## 🧪 VALIDACIÓN Y TESTING

### Casos de prueba ejecutados

| Caso | Descripción | Resultado |
|------|-------------|-----------|
| **TC-001** | Cálculo con solo tareas adicionales (sin obra) | ✅ PASS |
| **TC-002** | Cálculo con solo tareas especialidades (sin obra) | ✅ PASS |
| **TC-003** | Cálculo con obra + adicionales + especialidades | ✅ PASS |
| **TC-004** | Cálculo con solo tareas de obra | ✅ PASS |
| **TC-005** | Verificación de formato de moneda | ✅ PASS |
| **TC-006** | Verificación de porcentajes sobre valor de obra | ✅ PASS |

### Validación matemática

**Ejemplo de prueba (TC-001):**
```
Input:
  - Supervisión de obra: $ 882.000
  - Documentación ejecutiva: $ 1.202.400
  - Proyecto instalación sanitaria: $ 315.000
  - Proyecto estructuras: $ 405.000

Cálculo esperado:
  - Total adicionales: $ 2.084.400 (882.000 + 1.202.400)
  - Total especialidades: $ 720.000 (315.000 + 405.000)
  - Total general: $ 2.804.400 ✅

Output del sistema (post-corrección):
  - Total general: $ 2.804.400 ✅ CORRECTO
```

---

## 📊 IMPACTO DEL CAMBIO

### Archivos modificados
- ✅ `App/Backend/Node/src/services/pdfService.js` (1 archivo, 3 líneas)

### Regresión
- ❌ **Sin riesgo de regresión:** La simplificación del código reduce complejidad
- ✅ **Cobertura de testing:** Todos los casos de uso validados

### Deployment
- **Ambiente:** QA → Producción
- **Downtime:** Ninguno (hotfix aplicable sin reinicio)
- **Rollback plan:** Disponible (versión anterior en control de versiones)

---

## 📝 RECOMENDACIONES

### Inmediatas
1. ✅ **Aplicar hotfix a producción** (completado)
2. ✅ **Validar certificados generados post-corrección**
3. ⏳ **Notificar al cliente sobre la corrección**

### Preventivas
1. **Testing automatizado:**
   - Implementar tests unitarios para `calcularSubtotalCategoria()`
   - Agregar tests de integración para generación de PDF con diferentes combinaciones de tareas

2. **Code review:**
   - Revisar otras funciones con fallbacks similares
   - Establecer lineamientos para manejo de arrays vacíos

3. **Auditoría de certificados emitidos:**
   - Identificar certificados generados con el error (período: [fecha inicio] - 03/08/2026)
   - Evaluar necesidad de re-emisión para clientes afectados

---

## 📎 REFERENCIAS

- **SPEC relacionada:** SPEC010-CALC-Entregables.md
- **Documentación de variables:** SPEC010-CALC-Entregables_Variables.md
- **Archivo de servicio:** `App/Backend/Node/src/services/pdfService.js`
- **Función afectada:** `prepararDatosPlantilla()`

---

## ✍️ FIRMAS

**Desarrollador:** Equipo CH2026  
**Revisado por:** Tech Lead  
**Aprobado por:** Project Manager  
**Fecha de cierre:** 03/08/2026

---

**Clasificación:** Interno - Documentación de Soporte  
**Versión del documento:** 1.0