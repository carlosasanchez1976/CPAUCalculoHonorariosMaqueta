# Manejo de Errores API - Fase 3 Implementada ✅

**Fecha**: 2026-08-12  
**SPEC**: SPEC030-CALC-Manejo de errores en API  
**Estado**: Fase 3 Completa (Refactor Modelos y Services)

---

## 📦 Archivos Refactorizados

### 1. `src/models/usuario.js` ✅
**8 funciones** refactorizadas con try/catch usando ApiError.

**Funciones modificadas**:
- `Listar()` - Lista todos los usuarios
- `Buscar(id)` - Busca usuario por ID
- `BuscarXEmail(email)` - Busca por email
- `BuscarXIdMatricula(idMatricula)` - **CRÍTICO** para login desde web CPAU
- `Borrar(params)` - Baja lógica
- `Grabar(data)` - Crear/actualizar con bcrypt
- `CambiarPassword(data)` - Cambio de contraseña con validación
- `AceptarTYC(userId, tycId)` - Registro de aceptación T&C

**Mejoras especiales**:
- `CambiarPassword()` ahora lanza `ApiError` con `RESOURCE_NOT_FOUND` si usuario no existe
- `BuscarXIdMatricula()` incluye `idMatricula` en metadata para debugging de login
- `Grabar()` maneja errores de bcrypt correctamente

---

### 2. `src/models/terminosCondiciones.js` ✅
**5 funciones** refactorizadas con try/catch usando ApiError.

**Funciones modificadas**:
- `Listar()` - Lista histórico de T&C (admin)
- `BuscarVigente()` - **CRÍTICO** endpoint público sin autenticación
- `Buscar(tycId)` - Busca T&C por ID
- `Grabar(data)` - Crear nuevo T&C
- `MarcarVigente(tycId)` - Activar versión y resetear aceptaciones

**Importancia**:
- `BuscarVigente()` es endpoint público usado por frontend para mostrar T&C actuales

---

### 3. `src/models/calculo.js` ✅
**5 funciones** refactorizadas, **convirtiendo objetos genéricos a ApiError**.

**Funciones modificadas**:
- `grabarCalculo(datosCompletos)` - Grabar cálculo completo con items
- `obtenerCalculoPorId(calculoId)` - Recuperar cálculo con detalle
- `existeTareaProfesional(tareaId)` - Validar existencia de tarea
- `guardarExperiencia(calculoId, puntaje, observaciones)` - Guardar feedback
- `getDashboard(fechaDesde, fechaHasta)` - **COMPLEJO** con 4 validaciones

**Características especiales**:
- **Antes**: Lanzaban objetos genéricos `{ code: 'DB_ERROR', message: '...', detail: '...' }`
- **Ahora**: Lanzan `new ApiError({ code: ERROR_CODES.DB_ERROR, ... })`
- `getDashboard()` tiene 4 validaciones que ahora usan `ERROR_CODES.VALIDATION_ERROR` con statusCode 400
- Manejo inteligente: si error ya es ApiError, solo enriquece metadata

---

### 4. `src/services/entregablesService.js` ✅
**6 funciones** refactorizadas con try/catch usando ApiError.

**Funciones modificadas**:
- `resolverPlantillaEntregable(tareaId)` - **CRÍTICO** para generación de PDF
- `resolverPlantillaPorCodigo(codigo)` - Fallback por código
- `obtenerEntregable(entregableId)` - Obtener template
- `actualizarTemplate(entregableId, htmlTemplate)` - Actualizar HTML
- `obtenerPorID(entregableId)` - Obtener completo
- `listarActivos()` - Listar templates disponibles

**Importancia**:
- Crítico para generación de PDFs de honorarios
- Errores bien documentados ayudan a debugging de templates

---

### 5. `src/models/parametro.js` ✅
**4 funciones** refactorizadas con try/catch usando ApiError.

**Funciones modificadas**:
- `Listar()` - Lista parámetros del sistema
- `Buscar(id)` - Busca parámetro por ID
- `Borrar(params)` - Elimina parámetro
- `Grabar(data)` - Crear/actualizar parámetro

---

### 6. `src/models/tareaProfesional.js` ✅
**4 funciones** refactorizadas con try/catch usando ApiError.

**Funciones modificadas**:
- `Listar()` - Lista tareas activas
- `Buscar(tareaId)` - Busca tarea por ID
- `Grabar(data)` - UPSERT de tarea
- `Borrar(tareaId, bajaUsuarioId)` - Baja lógica

---

## 📊 Resumen de Cobertura

| Archivo | Funciones | Estado | Tipo Original |
|---------|-----------|--------|---------------|
| usuario.js | 8 | ✅ | Sin try/catch |
| terminosCondiciones.js | 5 | ✅ | Sin try/catch |
| calculo.js | 5 | ✅ | **Con try/catch genérico** |
| entregablesService.js | 6 | ✅ | Sin try/catch |
| parametro.js | 4 | ✅ | Sin try/catch |
| tareaProfesional.js | 4 | ✅ | Sin try/catch |
| **TOTAL** | **32** | **✅** | - |

---

## 🎯 Patrón Aplicado

### Para funciones SIN try/catch anterior:
```javascript
async Listar() {
  try {
    const [rows] = await executeStoredProcedure('MI_SP');
    return rows;
  } catch (error) {
    if (ApiError.isApiError(error)) {
      error.addMetadata('function', 'modelo.Listar');
      throw error;
    }
    
    throw new ApiError({
      code: ERROR_CODES.DB_ERROR,
      message: 'Error al listar recursos',
      statusCode: 500,
      detail: { originalError: error.message },
      metadata: { module: 'modelo', function: 'Listar' }
    });
  }
}
```

### Para funciones CON try/catch genérico (calculo.js):
**Antes**:
```javascript
catch (error) {
    console.error('❌ Error:', error.message);
    throw {
        code: 'DB_ERROR',
        message: 'Error al grabar',
        detail: error.message
    };
}
```

**Después**:
```javascript
catch (error) {
    console.error('❌ [Model] Error:', error.message);
    
    if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'calculo.grabarCalculo');
        throw error;
    }
    
    throw new ApiError({
        code: ERROR_CODES.DB_ERROR,
        message: 'Error al grabar el cálculo',
        statusCode: 500,
        detail: { originalError: error.message },
        metadata: { module: 'calculo', function: 'grabarCalculo' }
    });
}
```

### Para validaciones (getDashboard):
**Antes**:
```javascript
if (isNaN(desde.getTime())) {
    throw {
        code: 'VALIDATION_ERROR',
        message: 'Formato de fecha inválido',
        detail: 'Use YYYY-MM-DD'
    };
}
```

**Después**:
```javascript
if (isNaN(desde.getTime())) {
    throw new ApiError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD',
        statusCode: 400,
        detail: 'Las fechas deben estar en formato ISO 8601',
        metadata: { module: 'calculo', function: 'getDashboard' }
    });
}
```

---

## 🔍 Propagación de Errores

### Flujo completo desde DB hasta Frontend:

```
┌─────────────────────────────────────────────────────────┐
│  1. MySQL genera error nativo                          │
│     { errno: 1048, sqlState: '23000',                  │
│       message: "Column 'nombre' cannot be null" }      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  2. db.executeStoredProcedure() captura                │
│     throw new ApiError({                                │
│       code: DB_QUERY_ERROR,                            │
│       errorId: "err_1786556234_a7k9m2",                │
│       detail: { errno, sqlState, storedProcedure }     │
│     })                                                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  3. Model (ej: usuario.Grabar) captura                 │
│     if (ApiError.isApiError(error)) {                  │
│       error.addMetadata('function', 'usuario.Grabar'); │
│       throw error;                                      │
│     }                                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  4. Controller delega al middleware                     │
│     } catch (error) {                                   │
│       next(error);                                      │
│     }                                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  5. errorHandler middleware responde                    │
│     res.status(500).json({                             │
│       errorId: "err_1786556234_a7k9m2",                │
│       errorCode: "DB_QUERY_ERROR",                     │
│       error: "Error al guardar usuario",               │
│       errorDetail: { ... } // solo dev/qa              │
│       metadata: {                                       │
│         module: "db",                                   │
│         function: "executeStoredProcedure",            │
│         storedProcedure: "Usuarios_Grabar",            │
│         "function": "usuario.Grabar" // enriquecido    │
│       }                                                 │
│     })                                                  │
└─────────────────────────────────────────────────────────┘
```

**Ventaja**: El errorId permite rastrear el error desde el browser console hasta CloudWatch logs.

---

## 📈 Metadata Enriquecida

Cada nivel enriquece la metadata con información contextual:

### Nivel DB (executeStoredProcedure):
```javascript
metadata: {
  module: 'db',
  function: 'executeStoredProcedure',
  storedProcedure: 'Usuarios_Grabar',
  paramsCount: 11
}
```

### Nivel Model (usuario.Grabar):
```javascript
// El modelo AGREGA a la metadata existente:
error.addMetadata('function', 'usuario.Grabar');

// Resultado final en metadata:
{
  module: 'db',
  function: 'usuario.Grabar',  // ← Sobrescribe para mayor especificidad
  storedProcedure: 'Usuarios_Grabar',
  paramsCount: 11
}
```

---

## 🧪 Testing Recomendado

### Test manual por archivo:

1. **usuario.js** - Probar login con matrícula inexistente
2. **terminosCondiciones.js** - Llamar `/api/terminos-condiciones/vigente`
3. **calculo.js** - Llamar `/api/calculos/dashboard` con fechas inválidas
4. **entregablesService.js** - Generar PDF con tarea inexistente
5. **parametro.js** - Borrar parámetro inexistente
6. **tareaProfesional.js** - Grabar tarea con código duplicado

### Comandos de test:
```bash
# Test integración (requiere servidor corriendo)
curl http://localhost:3000/api/usuarios/9999999
# Debe retornar errorId y errorCode

curl http://localhost:3000/api/terminos-condiciones/vigente
# Debe retornar T&C o error estructurado

curl -X POST http://localhost:3000/api/calculos/dashboard \
  -H "Content-Type: application/json" \
  -d '{"fechaDesde": "2026-12-31", "fechaHasta": "2026-01-01"}'
# Debe retornar VALIDATION_ERROR con statusCode 400
```

---

## ✅ Checklist Fase 3

- [x] usuario.js - 8 funciones refactorizadas
- [x] terminosCondiciones.js - 5 funciones refactorizadas
- [x] calculo.js - 5 funciones convertidas de objetos genéricos a ApiError
- [x] entregablesService.js - 6 funciones refactorizadas
- [x] parametro.js - 4 funciones refactorizadas
- [x] tareaProfesional.js - 4 funciones refactorizadas
- [x] Imports de ApiError y ERROR_CODES agregados en todos los archivos
- [x] Metadata enriquecida con module/function en todos los catch
- [x] Validaciones de getDashboard usan ERROR_CODES.VALIDATION_ERROR
- [x] Sin errores de lint/compilación
- [x] Documentación completa

---

## 🎯 Próximos Pasos (Fase 4)

**Refactor Controllers** (1-2 horas estimada):

Archivos a modificar:
- [ ] `src/controllers/calculosController.js`
- [ ] `src/controllers/usuariosController.js`
- [ ] `src/controllers/terminosCondicionesController.js`
- [ ] `src/controllers/parametrosController.js`
- [ ] `src/controllers/tareasController.js`

**Patrón a aplicar**:
```javascript
exports.miEndpoint = async (req, res, next) => {
  try {
    // Validaciones manuales → ApiError
    if (!req.body.campo) {
      throw new ApiError({
        code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: 'Campo requerido faltante',
        statusCode: 400,
        metadata: { field: 'campo' }
      });
    }
    
    const resultado = await Model.operacion(req.body);
    
    return res.status(200).json({
      success: true,
      data: resultado,
      version: '1.0'
    });
  } catch (error) {
    next(error); // ← El middleware errorHandler se encarga
  }
};
```

**Cambios clave**:
1. Reemplazar `res.status().json()` en catch con `next(error)`
2. Validaciones manuales → `throw new ApiError`
3. Eliminar función `obtenerMensajeError()` de calculosController
4. Mensajes de éxito estandarizados con `version: '1.0'`

---

## 📝 Notas Importantes

1. **32 funciones** ahora lanzan errores estructurados con errorId único
2. **Metadata enriquecida** en cada nivel facilita debugging
3. **Validaciones** ahora retornan 400 en lugar de 500
4. **Login (BuscarXIdMatricula)** tiene metadata especial para rastrear errores de autenticación
5. **PDF (entregablesService)** ahora documenta qué template falló
6. **Dashboard** valida 4 condiciones antes de consultar DB
7. **CambiarPassword** diferencia entre "usuario no encontrado" (404) y error DB (500)

---

**Implementado por**: Copilot + Charly  
**Revisión**: Pendiente  
**Deploy**: Pendiente  
**Testing E2E**: Pendiente
