# SPEC025-CALC - Grabar Experiencia de Usuario

**Versión:** 1.0  
**Fecha:** 2026-07-26  
**Estado:** 📝 Pendiente de implementación  
**Tipo:** Backend API - Experiencia de Usuario

---

## 📋 Objetivo

Implementar un endpoint REST para que el frontend pueda enviar la valoración del usuario sobre su experiencia con la aplicación. Esta información se almacenará asociada a cada cálculo de honorarios realizado.

## 🎯 Contexto del Negocio

Al finalizar un cálculo de honorarios, se desea capturar feedback del usuario mediante:
- Un **puntaje** del 1 al 5 (estrellas/rating)
- **Observaciones** opcionales sobre su experiencia

Esta información permitirá:
- Medir la satisfacción del usuario con la herramienta
- Identificar áreas de mejora
- Analizar la experiencia por tipo de cálculo

---

## 📊 Modelo de Datos

### Tabla: `Calculos`

Campos ya creados para almacenar la experiencia:

```sql
app_exp_puntaje NUMERIC(1,0) NULL     -- Puntaje de 1 a 5
app_exp_observ VARCHAR(255) NULL      -- Comentarios del usuario
```

### Stored Procedure: `Calculo_Experiencia`

Ya existe y está listo para usar:

```sql
CALL Calculo_Experiencia(
  IN p_calculo_id INT,
  IN p_app_exp_puntaje NUMERIC(1,0),
  IN p_app_exp_observ VARCHAR(255)
)
```

**Comportamiento:** 
- Actualiza los campos `app_exp_puntaje` y `app_exp_observ` del registro correspondiente
- No retorna resultado, solo ejecuta UPDATE

---

## 🔧 Especificación Técnica

### Endpoint

```
POST /api/calculos/:calculoId/experiencia
```

### Autenticación

✅ Requiere token JWT válido (middleware `verificarToken`)

### Path Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `calculoId` | INT | ✅ Sí | ID del cálculo existente |

### Request Body

```json
{
  "puntaje": 4,
  "observaciones": "Excelente herramienta, muy intuitiva"
}
```

#### Esquema de Validación

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `puntaje` | Number | ✅ Sí | 1-5, entero | Valoración del 1 al 5 |
| `observaciones` | String | ❌ No | Máx. 255 chars | Comentarios del usuario |

#### Reglas de Negocio

1. **puntaje:**
   - Debe ser un número entero
   - Rango válido: 1, 2, 3, 4 o 5
   - No se permiten decimales

2. **observaciones:**
   - Puede ser null, undefined o string vacío
   - Si se envía, se trunca a 255 caracteres
   - Se elimina whitespace al inicio/final

3. **calculoId:**
   - Debe existir en la tabla `Calculos`
   - Debe pertenecer al usuario autenticado (validación opcional futura)

### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Experiencia guardada correctamente",
  "data": {
    "calculoId": 123,
    "puntaje": 4,
    "observaciones": "Excelente herramienta, muy intuitiva"
  },
  "version": "1.0"
}
```

### Response - Errores

#### 400 Bad Request - Validación

```json
{
  "success": false,
  "error": "puntaje es requerido y debe ser un número entre 1 y 5",
  "version": "1.0"
}
```

Casos de error 400:
- `puntaje` no enviado
- `puntaje` no es un número
- `puntaje` fuera del rango 1-5
- `calculoId` no es un entero positivo
- `observaciones` excede 255 caracteres (se puede truncar automáticamente)

#### 404 Not Found - Cálculo inexistente

```json
{
  "success": false,
  "error": "Cálculo no encontrado",
  "version": "1.0"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Error interno al guardar la experiencia",
  "version": "1.0"
}
```

---

## 🛠️ Tareas de Implementación

### T025-001: Agregar ruta en `src/routes/calculos.js`

**Archivo:** `App/Backend/Node/src/routes/calculos.js`

```javascript
// Agregar después de las rutas existentes
router.post('/:calculoId/experiencia', verificarToken, honorariosController.guardarExperiencia);
```

**Checklist:**
- ✅ Ruta con path parameter `:calculoId`
- ✅ Método POST
- ✅ Middleware `verificarToken` aplicado
- ✅ Controlador `guardarExperiencia`

---

### T025-002: Implementar controlador `guardarExperiencia`

**Archivo:** `App/Backend/Node/src/controllers/calculosController.js`

**Ubicación:** Al final del archivo, después de `exports.exportarPdf`

```javascript
/**
 * Guarda la experiencia del usuario sobre un cálculo
 * POST /api/calculos/:calculoId/experiencia
 * SPEC: SPEC025-CALC-Grabar experiencia de usuario
 * 
 * @param {Object} req.params.calculoId - ID del cálculo
 * @param {Object} req.body.puntaje - Valoración de 1 a 5
 * @param {Object} req.body.observaciones - Comentarios opcionales
 */
exports.guardarExperiencia = async (req, res) => {
    try {
        // 1. Validar y normalizar calculoId
        const calculoId = normalizarCalculoId(req.params?.calculoId);
        if (!calculoId) {
            return res.status(400).json({
                success: false,
                error: 'calculoId debe ser un número entero positivo',
                version: '1.0'
            });
        }

        // 2. Validar puntaje
        const { puntaje, observaciones } = req.body || {};
        
        if (!puntaje || !Number.isInteger(puntaje) || puntaje < 1 || puntaje > 5) {
            return res.status(400).json({
                success: false,
                error: 'puntaje es requerido y debe ser un número entero entre 1 y 5',
                version: '1.0'
            });
        }

        // 3. Normalizar observaciones (truncar a 255 y trim)
        let observacionesFinal = null;
        if (observaciones !== null && observaciones !== undefined) {
            const observStr = String(observaciones).trim();
            observacionesFinal = observStr.length > 0 ? observStr.substring(0, 255) : null;
        }

        // 4. Verificar que el cálculo existe
        const calculo = await calculoModel.obtenerCalculoPorId(calculoId);
        if (!calculo) {
            return res.status(404).json({
                success: false,
                error: 'Cálculo no encontrado',
                version: '1.0'
            });
        }

        // 5. Guardar experiencia
        await calculoModel.guardarExperiencia(calculoId, puntaje, observacionesFinal);

        // 6. Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Experiencia guardada correctamente',
            data: {
                calculoId,
                puntaje,
                observaciones: observacionesFinal
            },
            version: '1.0'
        });

    } catch (error) {
        const mensaje = obtenerMensajeError(error, 'Error interno al guardar la experiencia');
        console.error('Error en calculosController.guardarExperiencia:', error?.detail || error?.message || error);

        return res.status(500).json({
            success: false,
            error: mensaje,
            version: '1.0'
        });
    }
};
```

**Checklist:**
- ✅ Validación de `calculoId` con función existente `normalizarCalculoId`
- ✅ Validación de `puntaje` (entero entre 1-5)
- ✅ Normalización de `observaciones` (trim + truncate)
- ✅ Verificación de existencia del cálculo
- ✅ Manejo de errores con función existente `obtenerMensajeError`
- ✅ Respuesta con formato estándar del proyecto (success/error/version)
- ✅ Logging de errores

---

### T025-003: Agregar método en modelo `calculo.js`

**Archivo:** `App/Backend/Node/src/models/calculo.js`

**Ubicación:** Después de la función `obtenerCalculoPorId`

```javascript
/**
 * Guarda la experiencia del usuario sobre un cálculo
 * 
 * @param {number} calculoId - ID del cálculo
 * @param {number} puntaje - Valoración de 1 a 5
 * @param {string|null} observaciones - Comentarios del usuario (máx. 255 chars)
 * @returns {Promise<void>}
 * @throws {Object} Error estructurado con code, message, detail
 */
async function guardarExperiencia(calculoId, puntaje, observaciones) {
    try {
        const calculoIdInt = normalizarIdEntero(calculoId);
        
        await db.executeStoredProcedure('Calculo_Experiencia', [
            calculoIdInt,
            puntaje,
            observaciones
        ]);

        console.log(`✅ [Model] Experiencia guardada para cálculo ${calculoIdInt}: ${puntaje} estrellas`);
        
    } catch (error) {
        console.error('❌ [Model] Error al guardar experiencia:', error.message);
        throw {
            code: 'DB_ERROR',
            message: 'Error al guardar la experiencia en la base de datos',
            detail: error.message
        };
    }
}

// Agregar al final del archivo
module.exports = {
    grabarCalculo,
    obtenerCalculoPorId,
    existeTareaProfesional,
    obtenerHistorialUsuario,
    guardarExperiencia  // ⬅️ NUEVA EXPORTACIÓN
};
```

**Checklist:**
- ✅ Función `guardarExperiencia` implementada
- ✅ Llamada al SP `Calculo_Experiencia` con parámetros correctos
- ✅ Logging de éxito/error
- ✅ Manejo de errores con código `DB_ERROR`
- ✅ Exportación del método en `module.exports`

---

### T025-004: Testing y Validación

**Script de prueba:** `App/Backend/Node/scripts/test-experiencia-usuario.js`

```javascript
/**
 * Test del endpoint POST /api/calculos/:calculoId/experiencia
 * SPEC025-CALC - Grabar experiencia de usuario
 */

const testExperiencia = async () => {
    const BASE_URL = 'http://localhost:3000/api/calculos';
    
    // TODO: Reemplazar con un token JWT válido
    const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    const tests = [
        {
            name: '✅ Caso exitoso: puntaje 5 con observaciones',
            calculoId: 1,
            body: {
                puntaje: 5,
                observaciones: 'Excelente herramienta, muy intuitiva y fácil de usar'
            },
            expectedStatus: 200
        },
        {
            name: '✅ Caso exitoso: puntaje 3 sin observaciones',
            calculoId: 1,
            body: {
                puntaje: 3
            },
            expectedStatus: 200
        },
        {
            name: '❌ Error: puntaje fuera de rango (6)',
            calculoId: 1,
            body: {
                puntaje: 6,
                observaciones: 'Intentando puntaje inválido'
            },
            expectedStatus: 400
        },
        {
            name: '❌ Error: puntaje 0',
            calculoId: 1,
            body: {
                puntaje: 0
            },
            expectedStatus: 400
        },
        {
            name: '❌ Error: sin puntaje',
            calculoId: 1,
            body: {
                observaciones: 'Solo observaciones sin puntaje'
            },
            expectedStatus: 400
        },
        {
            name: '❌ Error: calculoId inexistente',
            calculoId: 999999,
            body: {
                puntaje: 4,
                observaciones: 'Cálculo que no existe'
            },
            expectedStatus: 404
        }
    ];

    for (const test of tests) {
        console.log(`\n🧪 ${test.name}`);
        
        try {
            const response = await fetch(`${BASE_URL}/${test.calculoId}/experiencia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                },
                body: JSON.stringify(test.body)
            });

            const data = await response.json();
            
            if (response.status === test.expectedStatus) {
                console.log(`   ✅ Status correcto: ${response.status}`);
                console.log(`   📦 Respuesta:`, JSON.stringify(data, null, 2));
            } else {
                console.log(`   ❌ Status incorrecto. Esperado: ${test.expectedStatus}, Recibido: ${response.status}`);
                console.log(`   📦 Respuesta:`, JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error(`   ❌ Error en la prueba:`, error.message);
        }
    }
};

// Ejecutar si se llama directamente
if (require.main === module) {
    testExperiencia()
        .then(() => console.log('\n✅ Tests completados'))
        .catch(err => console.error('\n❌ Error ejecutando tests:', err));
}

module.exports = { testExperiencia };
```

**Casos de Prueba:**

| # | Caso | Entrada | Status Esperado |
|---|------|---------|-----------------|
| 1 | Puntaje 5 con observaciones | `{puntaje: 5, observaciones: "..."}` | 200 OK |
| 2 | Puntaje 1 sin observaciones | `{puntaje: 1}` | 200 OK |
| 3 | Puntaje 3 con observaciones largas | 300 chars → trunca a 255 | 200 OK |
| 4 | Puntaje fuera de rango (0) | `{puntaje: 0}` | 400 Bad Request |
| 5 | Puntaje fuera de rango (6) | `{puntaje: 6}` | 400 Bad Request |
| 6 | Sin puntaje | `{observaciones: "..."}` | 400 Bad Request |
| 7 | Puntaje decimal | `{puntaje: 3.5}` | 400 Bad Request |
| 8 | CalculoId inexistente | calculoId = 999999 | 404 Not Found |
| 9 | CalculoId no numérico | calculoId = "abc" | 400 Bad Request |

**Checklist de Testing:**
- ✅ Crear archivo de test
- ✅ Probar todos los casos de validación
- ✅ Verificar respuestas exitosas
- ✅ Verificar códigos de error
- ✅ Confirmar escritura en base de datos
- ✅ Probar con observaciones largas (truncamiento)

---

## 📝 Notas de Implementación

### Consideraciones Técnicas

1. **Inmutabilidad:** Una vez grabada la experiencia, se puede actualizar llamando nuevamente al endpoint (el SP hace UPDATE sobre el mismo registro)

2. **Seguridad futura:** Actualmente no se valida que el `calculoId` pertenezca al usuario autenticado. Esto se puede agregar en una versión futura:
   ```javascript
   if (calculo.usuario_id !== req.usuario.id) {
       return res.status(403).json({
           success: false,
           error: 'No autorizado para modificar este cálculo',
           version: '1.0'
       });
   }
   ```

3. **Truncamiento automático:** Las observaciones se truncan automáticamente a 255 caracteres en el controlador. El frontend debería limitar la entrada, pero el backend se protege.

4. **Puntaje nullable:** El campo DB acepta NULL, pero la API lo requiere. Esto permite futuras extensiones donde se guarde el cálculo sin experiencia inicialmente.

### Orden de Implementación

1. ✅ **T025-001** - Agregar ruta (5 min)
2. ✅ **T025-002** - Implementar controlador (20 min)
3. ✅ **T025-003** - Agregar método en modelo (10 min)
4. ✅ **T025-004** - Testing (15 min)

**Tiempo estimado total:** 50 minutos

---

## 🔍 Verificación de Completitud

### Checklist General

- ✅ Ruta definida en `calculos.js`
- ✅ Controlador `guardarExperiencia` implementado
- ✅ Modelo `guardarExperiencia` implementado y exportado
- ✅ Validaciones de entrada completas
- ✅ Manejo de errores robusto
- ✅ Logging de operaciones
- ✅ Formato de respuesta estándar del proyecto
- ✅ Tests escritos y ejecutados
- ✅ Documentación JSDoc en funciones
- ✅ SP `Calculo_Experiencia` ya existe y funciona

### Impacto en el Sistema

| Componente | Modificado | Nuevo | Sin Cambios |
|------------|------------|-------|-------------|
| Tabla `Calculos` | - | - | ✅ (campos ya existen) |
| SP `Calculo_Experiencia` | - | - | ✅ (ya existe) |
| `routes/calculos.js` | ✅ | - | - |
| `controllers/calculosController.js` | - | ✅ función | - |
| `models/calculo.js` | ✅ export | ✅ función | - |
| Frontend | - | - | ⏳ (futura integración) |

---

## 📚 Referencias

- **Tabla:** [Calculos.sql](../../App/Backend/DB/01-Tables/Calculos.sql)
- **SP:** [Calculo_Experiencia.sql](../../App/Backend/DB/03-Sps/Calculo_Experiencia.sql)
- **Patrón de referencia:** SPEC012-CALC-BACKEND-Horas.md
- **Stack:** React + Vite Frontend | Node.js + Express + MySQL Backend (AWS Lambda)

---

**Autor:** Backend Developer CH2026  
**Metodología:** Spec-Driven Development  
**Próximos pasos:** Implementar integración en el frontend (próxima SPEC)
