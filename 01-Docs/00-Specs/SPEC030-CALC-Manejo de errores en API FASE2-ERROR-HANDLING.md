# Manejo de Errores API - Fase 2 Implementada ✅

**Fecha**: 2026-08-12  
**SPEC**: SPEC030-CALC-Manejo de errores en API  
**Estado**: Fase 2 Completa (Refactor Capa DB)

---

## 📦 Archivos Modificados

### 1. `src/config/db.js`
Capa de acceso a datos con manejo robusto de errores.

**Cambios realizados**:
- ✅ Import de `ApiError` y `ERROR_CODES`
- ✅ `executeQuery()` lanza `ApiError` con detalles SQL completos
- ✅ `executeStoredProcedure()` lanza `ApiError` y enriquece metadata

**Información capturada en errores**:
- `query` / `storedProcedure` - Consulta o SP ejecutado (limitado a 200 chars)
- `sqlError` - Mensaje de error MySQL
- `errno` - Código numérico del error MySQL
- `sqlState` - Estado SQL estándar (ej: 42S02, 23000)
- `paramsCount` - Cantidad de parámetros recibidos
- `module` y `function` en metadata

---

## 🔍 Comportamiento Implementado

### executeQuery()
```javascript
catch (error) {
    console.error('❌ Error en consulta DB:', error.message);
    
    throw new ApiError({
        code: ERROR_CODES.DB_QUERY_ERROR,
        message: 'Error al ejecutar consulta en la base de datos',
        statusCode: 500,
        detail: {
            query: query.substring(0, 200),
            sqlError: error.message,
            errno: error.errno,
            sqlState: error.sqlState,
            paramsCount: params.length
        },
        metadata: {
            module: 'db',
            function: 'executeQuery'
        }
    });
}
```

### executeStoredProcedure()
```javascript
catch (error) {
    console.error(`❌ Error ejecutando SP ${procedureName}:`, error.message);
    
    // Si ya es ApiError de executeQuery, enriquecer
    if (ApiError.isApiError(error)) {
        error.addMetadata('storedProcedure', procedureName);
        error.addMetadata('paramsCount', params.length);
        throw error;
    }
    
    // Si no es ApiError, crear uno (fallback)
    throw new ApiError({
        code: ERROR_CODES.DB_SP_ERROR,
        message: 'Error al ejecutar procedimiento almacenado',
        statusCode: 500,
        detail: {
            storedProcedure: procedureName,
            sqlError: error.message,
            errno: error.errno,
            sqlState: error.sqlState,
            paramsCount: params.length
        },
        metadata: {
            module: 'db',
            function: 'executeStoredProcedure'
        }
    });
}
```

**Estrategia**: `executeStoredProcedure` llama internamente a `executeQuery`, por lo que si falla la query, el ApiError ya viene creado. Solo se enriquece con metadata adicional (nombre del SP).

---

## 🧪 Testing

### Archivo creado: `src/config/test-db-errors.js`
Suite de 4 tests automatizados que validan:

1. ✅ **Query con tabla inexistente** - Verifica ApiError con errno 1146
2. ✅ **Stored Procedure inexistente** - Verifica enrichment con storedProcedure en metadata
3. ✅ **Sintaxis SQL incorrecta** - Verifica errno 1064 y sqlState capturados
4. ✅ **Formato JSON por ambiente** - Verifica errorDetail visible/oculto según ambiente

### Ejecutar tests:
```bash
cd App/Backend/Node
node src/config/test-db-errors.js
```

**Resultado**: ✅ **4/4 tests pasados**

---

## 📊 Ejemplo de Error Capturado

### Error de tabla inexistente

**Console Log**:
```
❌ Error en consulta DB: Table 'cpau_ch_dev.tabla_que_no_existe' doesn't exist
```

**ApiError generado**:
```json
{
  "errorId": "err_1786556452199_rexgvo",
  "code": "DB_QUERY_ERROR",
  "message": "Error al ejecutar consulta en la base de datos",
  "statusCode": 500,
  "detail": {
    "query": "SELECT * FROM tabla_que_no_existe",
    "sqlError": "Table 'cpau_ch_dev.tabla_que_no_existe' doesn't exist",
    "errno": 1146,
    "sqlState": "42S02",
    "paramsCount": 0
  },
  "metadata": {
    "module": "db",
    "function": "executeQuery"
  }
}
```

### Error de SP inexistente (con enrichment)

**Console Log**:
```
❌ Error ejecutando SP SP_Que_No_Existe: Error al ejecutar consulta en la base de datos
```

**ApiError enriquecido**:
```json
{
  "errorId": "err_1786556452211_fi1wvb",
  "code": "DB_QUERY_ERROR",
  "message": "Error al ejecutar consulta en la base de datos",
  "detail": {
    "query": "CALL SP_Que_No_Existe(?, ?, ?);",
    "sqlError": "PROCEDURE cpau_ch_dev.SP_Que_No_Existe does not exist",
    "errno": 1305,
    "sqlState": "42000",
    "paramsCount": 3
  },
  "metadata": {
    "module": "db",
    "function": "executeQuery",
    "storedProcedure": "SP_Que_No_Existe",  // ← Enriquecido
    "paramsCount": 3                          // ← Enriquecido
  }
}
```

---

## 📈 Impacto en Capas Superiores

### Modelos (Fase 3)
**Antes**:
```javascript
const resultado = await db.executeStoredProcedure('Calculos_Grabar', params);
// Error nativo MySQL se propaga
```

**Ahora**:
```javascript
try {
    const resultado = await db.executeStoredProcedure('Calculos_Grabar', params);
    return resultado;
} catch (error) {
    // Ya reciben ApiError con toda la información
    if (ApiError.isApiError(error)) {
        error.addMetadata('function', 'calculo.grabarCalculo');
        throw error;
    }
}
```

### Controllers (Fase 4)
```javascript
try {
    const resultado = await Model.operacion(params);
    res.json({ success: true, data: resultado });
} catch (error) {
    next(error); // El middleware errorHandler captura el ApiError
}
```

---

## 🎯 Cobertura de Errores MySQL

La implementación captura correctamente:

| errno | sqlState | Descripción | Ejemplo |
|-------|----------|-------------|---------|
| 1146  | 42S02    | Tabla no existe | `Table 'db.table' doesn't exist` |
| 1305  | 42000    | SP no existe | `PROCEDURE db.sp does not exist` |
| 1064  | 42000    | Sintaxis SQL | `You have an error in your SQL syntax` |
| 1048  | 23000    | Campo NULL no permitido | `Column 'name' cannot be null` |
| 1062  | 23000    | Duplicate entry | `Duplicate entry 'value' for key 'PRIMARY'` |
| 1452  | 23000    | Foreign key constraint | `Cannot add or update a child row` |

**Todos estos errores** ahora se exponen como ApiError con:
- errorId único para tracking
- Código estandarizado (DB_QUERY_ERROR, DB_SP_ERROR)
- Mensaje user-friendly
- Detalles técnicos en errorDetail (solo dev/qa)

---

## ✅ Checklist Fase 2

- [x] Import ApiError y ERROR_CODES en db.js
- [x] executeQuery lanza ApiError con detalles completos
- [x] executeStoredProcedure lanza ApiError
- [x] executeStoredProcedure enriquece ApiError si ya existe
- [x] Captura errno, sqlState, sqlError, query/SP
- [x] Tests automatizados creados (4 tests)
- [x] Todos los tests pasando
- [x] Sin errores de lint
- [x] Documentación actualizada

---

## 🔄 Propagación de Errores

```
┌─────────────────────────────────────────────┐
│  1. MySQL genera error nativo              │
│     { errno: 1146, sqlState: '42S02', ... }│
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  2. db.executeQuery() captura y convierte  │
│     throw new ApiError({                    │
│       code: DB_QUERY_ERROR,                │
│       detail: { errno, sqlState, ... }     │
│     })                                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  3. db.executeStoredProcedure() enriquece  │
│     error.addMetadata('storedProcedure')   │
│     throw error                             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  4. Model enriquece con contexto           │
│     error.addMetadata('function', 'XXX')   │
│     throw error                             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  5. Controller delega a middleware         │
│     next(error)                             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  6. errorHandler middleware responde       │
│     res.status(500).json({                 │
│       errorId, errorCode, error,           │
│       errorDetail (si dev/qa)              │
│     })                                      │
└─────────────────────────────────────────────┘
```

---

## 📝 Notas Importantes

1. **executeQuery** limita la query a 200 caracteres en `detail.query` para evitar logs excesivos
2. **executeStoredProcedure** NO duplica código - reutiliza executeQuery y solo enriquece metadata
3. **paramsCount** se captura pero NO los valores de params (seguridad)
4. **Todos los errores MySQL** ahora pasan por ApiError - no se pierden detalles técnicos
5. **errorDetail** con SQL info SOLO visible en dev/qa - producción ve mensaje genérico

---

## 🎯 Próximos Pasos (Fase 3)

**Refactor Modelos** (2-3 horas estimada):

Archivos a modificar (orden priorizado):
1. [ ] `src/models/usuario.js` - 8 funciones (CRÍTICO - login)
2. [ ] `src/models/terminosCondiciones.js` - 5 funciones (CRÍTICO - público)
3. [ ] `src/models/calculo.js` - 5 funciones (CORE)
4. [ ] `src/services/entregablesService.js` - 6 funciones (PDF)
5. [ ] `src/models/parametro.js` - 4 funciones
6. [ ] `src/models/tareaProfesional.js` - 4 funciones

**Total**: 32 funciones a refactorizar

**Patrón a aplicar**:
```javascript
async function miFuncion(params) {
    try {
        const resultado = await db.executeStoredProcedure('MI_SP', [params]);
        return resultado;
    } catch (error) {
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'modelo.miFuncion');
            throw error;
        }
        
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error en operación',
            statusCode: 500,
            detail: { originalError: error.message },
            metadata: { module: 'modelo', function: 'miFuncion' }
        });
    }
}
```

---

**Implementado por**: Copilot + Charly  
**Revisión**: Pendiente  
**Deploy**: Pendiente
