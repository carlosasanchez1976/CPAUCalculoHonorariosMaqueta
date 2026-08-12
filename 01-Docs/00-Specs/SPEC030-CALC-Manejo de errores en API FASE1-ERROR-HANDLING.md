# Manejo de Errores API - Fase 1 Implementada ✅

**Fecha**: 2026-08-12  
**SPEC**: SPEC030-CALC-Manejo de errores en API  
**Estado**: Fase 1 Completa (Infraestructura Base)

---

## 📦 Archivos Creados

### 1. `src/constants/errorCodes.js`
Constantes de códigos de error estandarizados.

- **29 códigos** definidos y categorizados
- Función helper `getStatusCodeForError()` incluida
- Object.freeze() para inmutabilidad

**Categorías**:
- Validación (400)
- Autenticación/Autorización (401, 403)
- Recursos (404, 409)
- Base de datos (500)
- Lógica de negocio (500)
- Externos y generales (500, 503)

### 2. `src/utils/ApiError.js`
Clase centralizada de errores.

**Características**:
- ✅ Constructor con code, message, statusCode, detail, metadata
- ✅ Generación automática de `errorId` único y rastreable
- ✅ Método `toJSON(includeDetail)` para diferenciar dev/qa vs producción
- ✅ Método `addMetadata()` para enriquecer contexto
- ✅ Método estático `isApiError()` para verificar tipo
- ✅ Método estático `fromError()` para convertir errores nativos
- ✅ Método `toLog()` para logging completo con stack trace

### 3. `src/middlewares/errorHandler.js`
Middleware global de manejo de errores.

**Exports**:
- `errorHandler` - Middleware principal (4 parámetros)
- `notFoundHandler` - Middleware para rutas 404
- `asyncHandler` - Wrapper para funciones async (opcional)

**Características**:
- ✅ Captura ApiError y errores nativos
- ✅ Diferencia ambientes (dev/qa vs production)
- ✅ Logs estructurados con errorId
- ✅ Respuestas JSON consistentes

### 4. `app.js` (modificado)
Registra middlewares de error al final de la cadena.

**Cambios**:
- Import de `notFoundHandler` y `errorHandler`
- Reemplaza middlewares de error anteriores
- Orden correcto: notFoundHandler → errorHandler

### 5. `src/utils/test-error-infrastructure.js`
Suite de tests automatizados.

**8 tests incluidos**:
1. Crear ApiError básico
2. toJSON sin detail (producción)
3. toJSON con detail (QA/dev)
4. addMetadata (enriquecimiento)
5. isApiError (verificación de tipo)
6. fromError (conversión)
7. Verificar ERROR_CODES
8. Formato de errorId

**Resultado**: ✅ Todos los tests pasaron

---

## 🚀 Uso Inmediato

### En Modelos/Services

```javascript
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

async function miMetodo(params) {
    try {
        const resultado = await db.executeStoredProcedure('MI_SP', [params]);
        return resultado;
    } catch (error) {
        // Si ya es ApiError, enriquecer y re-lanzar
        if (ApiError.isApiError(error)) {
            error.addMetadata('function', 'modelo.miMetodo');
            throw error;
        }
        
        // Si no, crear nuevo ApiError
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Error al ejecutar operación',
            statusCode: 500,
            detail: { originalError: error.message },
            metadata: { module: 'modelo.miMetodo', operation: 'MI_SP' }
        });
    }
}
```

### En Controllers

```javascript
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

exports.miEndpoint = async (req, res, next) => {
    try {
        // Validación con ApiError
        if (!req.body.campo) {
            throw new ApiError({
                code: ERROR_CODES.MISSING_REQUIRED_FIELD,
                message: 'El campo "campo" es requerido',
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
        next(error); // El middleware errorHandler se encarga
    }
};
```

---

## 🧪 Testing

Ejecutar tests:
```bash
cd App/Backend/Node
node src/utils/test-error-infrastructure.js
```

**Output esperado**: 8 tests ✓ pasados

---

## 📊 Respuestas de Error

### Producción (NODE_ENV=production)
```json
{
  "success": false,
  "error": "Error al ejecutar procedimiento almacenado",
  "errorCode": "DB_SP_ERROR",
  "errorId": "err_1786556234_a7k9m2",
  "timestamp": "2026-08-12T17:37:14.571Z",
  "version": "1.0"
}
```

### QA/Development (NODE_ENV=qa o development)
```json
{
  "success": false,
  "error": "Error al ejecutar procedimiento almacenado",
  "errorCode": "DB_SP_ERROR",
  "errorId": "err_1786556234_a7k9m2",
  "timestamp": "2026-08-12T17:37:14.571Z",
  "errorDetail": {
    "storedProcedure": "Calculos_Grabar",
    "sqlError": "Column 'superficie' cannot be null",
    "sqlState": "23000",
    "errno": 1048
  },
  "metadata": {
    "module": "db.executeStoredProcedure",
    "function": "calculo.grabarCalculo"
  },
  "version": "1.0"
}
```

---

## ✅ Checklist Fase 1

- [x] Clase ApiError creada con todos los métodos
- [x] Constantes ERROR_CODES definidas (29 códigos)
- [x] Middleware errorHandler implementado
- [x] Middleware notFoundHandler implementado
- [x] Middleware asyncHandler helper incluido
- [x] Middlewares registrados en app.js
- [x] Tests automatizados creados y pasando
- [x] Sin errores de lint/compilación
- [x] Documentación README creada

---

## 🎯 Próximos Pasos (Fase 2)

**Refactor Capa DB** (1 hora estimada):
- [ ] Modificar `src/config/db.js`
  - [ ] executeStoredProcedure → lanzar ApiError con SP info
  - [ ] executeQuery → lanzar ApiError con query info

**Archivo a modificar**: `App/Backend/Node/src/config/db.js`

---

## 📝 Notas Importantes

1. **errorId** es único y rastreable desde frontend hasta CloudWatch
2. **errorDetail** SOLO se muestra en ambientes dev/qa
3. **metadata** siempre se incluye si tiene contenido
4. Middleware `errorHandler` DEBE ser el último en app.js
5. Usar `next(error)` en controllers para delegar al middleware

---

**Implementado por**: Copilot + Charly  
**Revisión**: Pendiente  
**Deploy**: Pendiente
