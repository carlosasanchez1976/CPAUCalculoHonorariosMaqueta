# SPEC030 - Manejo Robusto de Errores en API

**Proyecto**: CH2026 - Sistema de Cálculo de Honorarios CPAU  
**Fecha**: 2026-08-12  
**Autor**: Charly  
**Estado**: 🔴 Pendiente  
**Prioridad**: Alta  
**Módulo**: Backend API (Lambda Node.js)

---

## 📋 Problema Actual

### Síntoma
El frontend recibe errores genéricos sin información útil para debugging:
```json
{
  "success": false,
  "error": "Error al guardar el cálculo en la base de datos",
  "version": "1.0"
}
```

### Información Perdida
- ❌ Qué stored procedure falló
- ❌ Qué parámetro causó el error
- ❌ Código de error MySQL (errno, sqlState)
- ❌ Tipo de error (constraint, tipo de dato, etc.)
- ❌ Módulo/función donde ocurrió el error

### Flujo Actual (Problemático)
```
MySQL Error (detallado) 
  → db.js (loguea + lanza error completo) ✅
  → Model (reemplaza con mensaje genérico) ❌
  → Controller (envía solo el mensaje genérico) ❌
  → Frontend (recibe mensaje inútil) ❌
```

### Inventario Completo de Llamadas a BD

**Total: 42 llamadas en 7 archivos**

| Archivo | Llamadas | Estado Actual |
|---------|----------|---------------|
| `calculo.js` | 5 | 🟡 Try/catch genérico |
| `parametro.js` | 4 | 🔴 Sin try/catch |
| `tareaProfesional.js` | 4 | 🔴 Sin try/catch |
| `terminosCondiciones.js` | 5 | 🔴 Sin try/catch |
| `usuario.js` | 8 | 🔴 Sin try/catch |
| `entregablesService.js` | 6 | 🔴 Sin try/catch |
| `db.js` | 2 | 🟡 Lanza error raw |
| **Controllers** | Variable | 🔴 No maneja ApiError |

**Cobertura actual de errores: 0% robusto** ❌

---

## 🎯 Objetivo

Implementar un sistema de manejo de errores que:
1. **Preserve información detallada** en desarrollo/QA
2. **Proteja información sensible** en producción
3. **Facilite debugging** con IDs rastreables
4. **Estandarice códigos de error** para el frontend
5. **Mantenga trazabilidad** desde logs hasta consola del navegador

---

## 🏗️ Arquitectura de Solución

### 1. Códigos de Error Estandarizados

```javascript
const ERROR_CODES = {
  // Validación (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE: 'INVALID_FIELD_TYPE',
  INVALID_FIELD_VALUE: 'INVALID_FIELD_VALUE',
  
  // Base de datos (500)
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_SP_ERROR: 'DB_SP_ERROR',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  
  // Lógica de negocio (500)
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  
  // Generales
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};
```

### 2. Clase Centralizada de Error

**Ubicación**: `src/utils/ApiError.js` (nuevo archivo)

```javascript
class ApiError extends Error {
  constructor({
    code,           // ERROR_CODES
    message,        // Mensaje user-friendly
    statusCode,     // HTTP status
    detail = null,  // Info técnica (solo dev/qa)
    metadata = {}   // Data contextual
  }) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.detail = detail;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
    this.errorId = this.generateErrorId();
  }
  
  generateErrorId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `err_${timestamp}_${random}`;
  }
  
  toJSON(includeDetail = false) {
    const response = {
      success: false,
      error: this.message,
      errorCode: this.code,
      errorId: this.errorId,
      timestamp: this.timestamp,
      version: '1.0'
    };
    
    if (includeDetail && this.detail) {
      response.errorDetail = this.detail;
    }
    
    if (Object.keys(this.metadata).length > 0) {
      response.metadata = this.metadata;
    }
    
    return response;
  }
}
```

### 3. Middleware de Error Global

**Ubicación**: `src/middleware/errorHandler.js` (nuevo archivo)

```javascript
function errorHandler(err, req, res, next) {
  const isDevOrQA = ['development', 'qa'].includes(process.env.NODE_ENV);
  
  // Si es ApiError, usarlo directamente
  if (err instanceof ApiError) {
    console.error(`❌ [${err.code}] ${err.errorId}:`, err.detail || err.message);
    return res.status(err.statusCode).json(err.toJSON(isDevOrQA));
  }
  
  // Si no, crear un error genérico
  const genericError = new ApiError({
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'Error interno del servidor',
    statusCode: 500,
    detail: err.message
  });
  
  console.error(`❌ [UNHANDLED] ${genericError.errorId}:`, err);
  return res.status(500).json(genericError.toJSON(isDevOrQA));
}
```

---

## 📝 Tareas de Implementación

### Fase 1: Infraestructura Base (1-2 horas)

#### ✅ Tarea 1.1: Crear clase ApiError
- **Archivo**: `App/Backend/Node/src/utils/ApiError.js`
- **Contenido**: Clase con constructor, `toJSON()`, `generateErrorId()`
- **Test**: Instanciar y verificar estructura JSON

#### ✅ Tarea 1.2: Crear constantes de códigos de error
- **Archivo**: `App/Backend/Node/src/constants/errorCodes.js`
- **Contenido**: Object con todos los códigos definidos
- **Export**: Como constante inmutable

#### ✅ Tarea 1.3: Crear middleware errorHandler
- **Archivo**: `App/Backend/Node/src/middleware/errorHandler.js`
- **Contenido**: Middleware express de 4 parámetros
- **Integración**: Registrar en `app.js` o `lambda.js` (según arquitectura)

---

### Fase 2: Refactor Capa DB (1 hora)

#### ✅ Tarea 2.1: Mejorar executeStoredProcedure
**Archivo**: `App/Backend/Node/src/config/db.js`

**Antes**:
```javascript
catch (error) {
    console.error(`❌ Error ejecutando SP ${procedureName}:`, error.message);
    throw error;
}
```

**Después**:
```javascript
catch (error) {
    console.error(`❌ [DB] Error ejecutando SP ${procedureName}:`, {
        errno: error.errno,
        sqlState: error.sqlState,
        message: error.message
    });
    
    const ApiError = require('../utils/ApiError');
    const ERROR_CODES = require('../constants/errorCodes');
    
    throw new ApiError({
        code: ERROR_CODES.DB_SP_ERROR,
        message: 'Error al ejecutar procedimiento almacenado',
        statusCode: 500,
        detail: {
            storedProcedure: procedureName,
            sqlError: error.message,
            sqlState: error.sqlState,
            errno: error.errno
        },
        metadata: {
            module: 'db.executeStoredProcedure'
        }
    });
}
```

#### ✅ Tarea 2.2: Mejorar executeQuery
**Archivo**: `App/Backend/Node/src/config/db.js`

Aplicar mismo patrón que `executeStoredProcedure` pero con `code: ERROR_CODES.DB_QUERY_ERROR`

---

### Fase 3: Refactor Modelos (2-3 horas)

**Patrón común para TODOS los modelos:**
```javascript
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

async function miMetodo(params) {
    try {
        // ... lógica existente ...
        const [rows] = await executeStoredProcedure('MI_SP', [param1, param2]);
        return rows;
    } catch (error) {
        // Si ya es ApiError, enriquecer y re-lanzar
        if (error instanceof ApiError) {
            error.metadata.function = 'modelo.miMetodo';
            throw error;
        }
        
        // Si no, crear ApiError nuevo
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Descripción user-friendly del error',
            statusCode: 500,
            detail: {
                originalError: error.message,
                parameters: { param1, param2 }
            },
            metadata: {
                module: 'modelo.miMetodo',
                operation: 'MI_SP'
            }
        });
    }
}
```

#### ✅ Tarea 3.1: Refactor calculo.js (5 funciones)
**Archivo**: `App/Backend/Node/src/models/calculo.js`

Aplicar patrón a:
- `grabarCalculo()` - Mantener try/catch, mejorar error
- `obtenerCalculoPorId()` - Mantener try/catch, mejorar error
- `existeTareaProfesional()` - Activar código comentado + agregar try/catch
- `guardarExperiencia()` - Mantener try/catch, mejorar error
- `getDashboard()` - Mantener try/catch, mejorar error

#### ✅ Tarea 3.2: Refactor parametro.js (4 funciones)
**Archivo**: `App/Backend/Node/src/models/parametro.js`

Agregar try/catch con ApiError a:
- `Parametro.Listar()`
- `Parametro.Buscar(id)`
- `Parametro.Borrar(params)`
- `Parametro.Grabar(data)`

#### ✅ Tarea 3.3: Refactor tareaProfesional.js (4 funciones)
**Archivo**: `App/Backend/Node/src/models/tareaProfesional.js`

Agregar try/catch con ApiError a:
- `TareaProfesional.Listar()`
- `TareaProfesional.Buscar(tareaId)`
- `TareaProfesional.Grabar(data)`
- `TareaProfesional.Borrar(tareaId, bajaUsuarioId)`

#### ✅ Tarea 3.4: Refactor terminosCondiciones.js (5 funciones)
**Archivo**: `App/Backend/Node/src/models/terminosCondiciones.js`

Agregar try/catch con ApiError a:
- `TerminosCondiciones.Listar()`
- `TerminosCondiciones.BuscarVigente()` - **CRÍTICO** (endpoint público)
- `TerminosCondiciones.Buscar(tycId)`
- `TerminosCondiciones.Grabar(data)`
- `TerminosCondiciones.MarcarVigente(tycId)`

#### ✅ Tarea 3.5: Refactor usuario.js (8 funciones)
**Archivo**: `App/Backend/Node/src/models/usuario.js`

Agregar try/catch con ApiError a:
- `Usuario.Listar()`
- `Usuario.Buscar(id)`
- `Usuario.BuscarXEmail(email)`
- `Usuario.BuscarXIdMatricula(idMatricula)` - **CRÍTICO** (usado en login)
- `Usuario.Borrar(params)`
- `Usuario.Grabar(data)` (2 llamadas internas)
- `Usuario.CambiarPassword(data)`
- `Usuario.AceptarTYC(userId, tycId)`

#### ✅ Tarea 3.6: Refactor entregablesService.js (6 funciones)
**Archivo**: `App/Backend/Node/src/services/entregablesService.js`

Agregar try/catch con ApiError a:
- `resolverPlantillaEntregable(tareaId)` - **CRÍTICO** (generación PDF)
- `resolverPlantillaPorCodigo(codigo)`
- `obtenerEntregable(entregableId)`
- `actualizarTemplate(entregableId, htmlTemplate)`
- `obtenerPorID(entregableId)`
- `listarActivos()`

---

### Fase 4: Refactor Controllers (1-2 horas)

#### ✅ Tarea 4.0: Identificar todos los controllers existentes
**Acción**: Listar archivos en `src/controllers/` y `src/routes/`

Aplicar los cambios a TODOS los controllers que tengan try/catch.

#### ✅ Tarea 4.1: Refactor calculosController.js
**Archivo**: `App/Backend/Node/src/controllers/calculosController.js`

**Cambio 1 - Simplificar try/catch**:
```javascript
// ANTES
catch (error) {
    const statusCode = error?.code === 'DB_ERROR' ? 500 : 500;
    const mensaje = obtenerMensajeError(error, 'Error interno al calcular honorarios');
    console.error('Error en honorariosController.calcular:', error?.detail || error?.message || error);
    return res.status(statusCode).json({
        success: false,
        error: mensaje,
        version: '1.0'
    });
}

// DESPUÉS
catch (error) {
    next(error); // El middleware errorHandler se encarga del resto
}
```

**Cambio 2 - Mejorar errores de validación**:
```javascript
// ANTES
return res.status(400).json({
    success: false,
    error: 'tareaId es requerido y debe ser un número entero positivo',
    version: '1.0'
});

// DESPUÉS
throw new ApiError({
    code: ERROR_CODES.INVALID_FIELD_TYPE,
    message: 'tareaId es requerido y debe ser un número entero positivo',
    statusCode: 400,
    metadata: {
        field: 'tareaId',
        receivedValue: tareaId,
        expectedType: 'integer > 0'
    }
});
```

**Nota**: Eliminar función `obtenerMensajeError()` si no se usa en otro lugar.

#### ✅ Tarea 4.2: Refactor otros controllers
Aplicar mismo patrón a:
- `parametrosController.js` (si existe)
- `tareasController.js` (si existe)
- `terminosCondicionesController.js` (si existe)
- `usuariosController.js` (si existe)
- `authController.js` (si existe)
- Cualquier otro controller con manejo de errores

**Patrón general**:
```javascript
exports.miEndpoint = async (req, res, next) => {
    try {
        // Validaciones con throw new ApiError para errores 400
        if (!req.body.campo) {
            throw new ApiError({
                code: ERROR_CODES.MISSING_REQUIRED_FIELD,
                message: 'El campo "campo" es requerido',
                statusCode: 400,
                metadata: { field: 'campo' }
            });
        }
        
        // Lógica de negocio
        const resultado = await Model.operacion(req.body);
        
        // Response exitoso
        return res.status(200).json({
            success: true,
            data: resultado,
            version: '1.0'
        });
    } catch (error) {
        next(error); // Delegar al middleware
    }
};
```

---

### Fase 5: Testing y Validación (1-2 horas)

#### ✅ Tarea 5.1: Probar errores por módulo en QA

**Cálculos**:
- [ ] Calcular honorarios con datos inválidos (validación)
- [ ] Calcular con tareaId inexistente (404)
- [ ] Calcular sin superficie cuando es requerida (validación)
- [ ] Forzar error en SP Calculos_Grabar (constraint SQL)

**Usuarios**:
- [ ] Login con id_matricula inexistente (404)
- [ ] Crear usuario con email duplicado (constraint violation)
- [ ] Cambiar password sin autenticación (401)
- [ ] Aceptar TyC con userId inválido (400)

**Términos y Condiciones**:
- [ ] Buscar TyC vigente cuando no hay (404)
- [ ] Crear TyC con version duplicada (constraint)
- [ ] Marcar vigente TyC inexistente (404)

**Tareas Profesionales**:
- [ ] Crear tarea con código duplicado (constraint)
- [ ] Buscar tarea inexistente (404)
- [ ] Borrar tarea con cálculos asociados (constraint)

**Parámetros**:
- [ ] Grabar parámetro con tipo inválido (validación)
- [ ] Buscar parámetro inexistente (404)

**Entregables**:
- [ ] Resolver plantilla para tareaId inexistente (404)
- [ ] Actualizar template con HTML inválido (validación)

#### ✅ Tarea 5.2: Verificar logs en CloudWatch
- [ ] Logs contienen errorId rastreable
- [ ] Logs muestran módulo completo (ej: `calculo.grabarCalculo`)
- [ ] Logs incluyen nombre del SP que falló
- [ ] Logs contienen errno y sqlState cuando aplica
- [ ] Stack trace completo en logs (NO en response)

#### ✅ Tarea 5.3: Verificar respuestas frontend
**En QA** (NODE_ENV=qa):
```json
{
  "success": false,
  "error": "Error al ejecutar procedimiento almacenado",
  "errorCode": "DB_SP_ERROR",
  "errorId": "err_1786548238_a7k9m2",
  "timestamp": "2026-08-12T15:23:58.551Z",
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

**En PROD** (NODE_ENV=production):
```json
{
  "success": false,
  "error": "Error al ejecutar procedimiento almacenado",
  "errorCode": "DB_SP_ERROR",
  "errorId": "err_1786548238_a7k9m2",
  "timestamp": "2026-08-12T15:23:58.551Z",
  "version": "1.0"
}
```

---

## 📊 Impacto y Beneficios

### Antes ❌
- Mensajes genéricos inútiles
- No rastreables en logs
- Frontend no puede diferenciar tipos de error
- Debugging requiere acceso a DB y logs Lambda
- **31 de 42 llamadas (74%) sin try/catch** 🔴
- **11 de 42 llamadas (26%) con try/catch genérico** 🟡
- **0 de 42 llamadas (0%) con manejo robusto** ❌

### Después ✅
- Mensajes precisos con contexto
- `errorId` rastreable desde navegador hasta CloudWatch
- Frontend puede mostrar errores específicos por código
- Debugging más rápido (errorId + errorCode + módulo + SP)
- Información sensible protegida en producción
- **42 de 42 llamadas (100%) con manejo robusto** ✅

### Mejoras Cuantificables
| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Cobertura try/catch | 26% | 100% | +286% |
| Tiempo promedio debugging | 15-30 min | 2-5 min | -80% |
| Errores rastreables | 0% | 100% | ∞ |
| Info útil en consola navegador | 0% | 100% (QA) | ∞ |

### Reducción de Riesgos
- 🔴 **Riesgo Alto eliminado**: Login, TyC vigente, cálculo
- 🟡 **Riesgo Medio eliminado**: PDF, dashboard, experiencia
- ✅ **Cobertura completa**: 7 modelos/services + controllers

---

## 🔒 Seguridad

### Información NO Exponer en Producción
- ❌ Stack traces completos
- ❌ Nombres de tablas/columnas exactos
- ❌ Queries SQL raw
- ❌ Valores de parámetros sensibles (passwords, tokens)

### Información SÍ Exponer (con `errorId`)
- ✅ Código de error (`errorCode`)
- ✅ Mensaje user-friendly
- ✅ Timestamp
- ✅ `errorId` para correlación con logs

---

## ✅ Criterios de Aceptación

### Infraestructura
- [ ] Clase `ApiError` creada con todos los métodos requeridos
- [ ] Constantes `ERROR_CODES` definidas con al menos 10 códigos
- [ ] Middleware `errorHandler` registrado globalmente en app
- [ ] Middleware diferencia ambientes (dev/qa vs production)

### Cobertura de Código
- [ ] **100% de las 42 llamadas a BD** tienen try/catch con ApiError
- [ ] Todos los modelos importan y usan `ApiError` correctamente
- [ ] Todos los services importan y usan `ApiError` correctamente
- [ ] Todos los controllers delegan errores a middleware con `next(error)`

### Modelos Específicos (32 funciones)
- [ ] `calculo.js` - 5 funciones con try/catch robusto
- [ ] `parametro.js` - 4 funciones con try/catch robusto
- [ ] `tareaProfesional.js` - 4 funciones con try/catch robusto
- [ ] `terminosCondiciones.js` - 5 funciones con try/catch robusto
- [ ] `usuario.js` - 8 funciones con try/catch robusto
- [ ] `entregablesService.js` - 6 funciones con try/catch robusto

### Capa DB
- [ ] `executeStoredProcedure` lanza `ApiError` con info del SP
- [ ] `executeQuery` lanza `ApiError` con info de la query
- [ ] Logs incluyen errno, sqlState cuando aplica

### Controllers
- [ ] Todos los try/catch terminan con `next(error)`
- [ ] Errores de validación (400) usan `ApiError`
- [ ] No hay `res.status().json()` en bloques catch
- [ ] Función `obtenerMensajeError()` eliminada o deprecada

### Respuestas API
- [ ] Todos los errores tienen estructura consistente
- [ ] Todos los errores tienen `errorId` único
- [ ] QA muestra `errorDetail`, producción NO
- [ ] Campo `version: '1.0'` presente en todas las respuestas

### Testing
- [ ] Al menos 6 tipos de errores probados por módulo
- [ ] Errores de validación retornan 400 con info útil
- [ ] Errores de constraint SQL detectados y clasificados
- [ ] Errores inesperados retornan 500 con errorId

### Logs y Trazabilidad
- [ ] Frontend puede copiar `errorId` de consola
- [ ] CloudWatch logs contienen el mismo `errorId`
- [ ] Logs muestran `module` y `function` completos
- [ ] Logs incluyen nombre del SP cuando aplica
- [ ] Stack traces completos SOLO en logs, NO en response

### Documentación
- [ ] README actualizado con sección de manejo de errores
- [ ] Ejemplos de respuestas de error en docs
- [ ] Lista de `errorCodes` documentada
- [ ] Guía de debugging con `errorId` agregada

---

## 🎨 Guía para el Equipo Frontend

### Estructura de Respuesta de Error

**Todos los errores** de la API seguirán esta estructura consistente:

```typescript
interface ApiErrorResponse {
  success: false;
  error: string;              // Mensaje user-friendly en español
  errorCode: string;          // Código estandarizado (ej: 'DB_SP_ERROR')
  errorId: string;            // ID único rastreable (ej: 'err_1786548238_a7k9m2')
  timestamp: string;          // ISO 8601 (ej: '2026-08-12T15:23:58.551Z')
  version: string;            // Siempre '1.0'
  errorDetail?: object;       // SOLO en ambientes dev/qa
  metadata?: object;          // Info contextual adicional
}
```

---

### Códigos de Error (errorCode)

| Código | HTTP Status | Descripción | Acción Frontend |
|--------|-------------|-------------|-----------------|
| `VALIDATION_ERROR` | 400 | Error de validación genérico | Mostrar `error` al usuario |
| `MISSING_REQUIRED_FIELD` | 400 | Campo requerido faltante | Resaltar campo en formulario |
| `INVALID_FIELD_TYPE` | 400 | Tipo de dato incorrecto | Mostrar mensaje de validación |
| `INVALID_FIELD_VALUE` | 400 | Valor fuera de rango/formato | Mostrar regla de validación |
| `RESOURCE_NOT_FOUND` | 404 | Recurso no encontrado | Mostrar "No encontrado" |
| `DB_CONNECTION_ERROR` | 500 | Error de conexión a BD | Mensaje genérico + reintentar |
| `DB_QUERY_ERROR` | 500 | Error en query SQL | Mensaje genérico + soporte |
| `DB_SP_ERROR` | 500 | Error en stored procedure | Mensaje genérico + errorId |
| `DB_CONSTRAINT_VIOLATION` | 500 | Violación de constraint (duplicado, FK) | Mensaje específico según constraint |
| `CALCULATION_ERROR` | 500 | Error en lógica de cálculo | Mensaje genérico + errorId |
| `INTERNAL_SERVER_ERROR` | 500 | Error no clasificado | Mensaje genérico + errorId |

---

### Ejemplo de Consumo en Frontend

#### Service Layer (honorariosService.js)

```javascript
/**
 * Calcula honorarios profesionales
 * @throws {ApiError} Error estructurado con errorCode, errorId, etc.
 */
export async function calcularHonorarios(datosCompletos) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/calculos/calcular`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(datosCompletos)
    });
    
    const data = await response.json();
    
    // ✅ Success
    if (response.ok && data.success) {
      return data.data;
    }
    
    // ❌ Error estructurado de la API
    throw data; // Lanza el objeto completo con errorCode, errorId, etc.
    
  } catch (error) {
    // Si es error de red o parsing, wrapearlo
    if (!error.errorCode) {
      throw {
        success: false,
        error: 'Error de conexión con el servidor',
        errorCode: 'NETWORK_ERROR',
        errorId: null,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
}
```

---

#### Componente React (ProcesoCalculoPage.jsx)

```javascript
import { useState } from 'react';
import { calcularHonorarios } from '../services/honorariosService';
import ErrorMessage from '../components/ErrorMessage';

function ProcesoCalculoPage() {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleCalcular = async (datos) => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await calcularHonorarios(datos);
      setResultado(resultado);
      
    } catch (apiError) {
      console.error('❌ Error al calcular:', {
        errorId: apiError.errorId,
        errorCode: apiError.errorCode,
        message: apiError.error,
        detail: apiError.errorDetail // Solo visible en QA
      });
      
      setError(apiError);
      
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {error && <ErrorMessage error={error} />}
      {/* ... resto del componente */}
    </div>
  );
}
```

---

#### Componente de Error Reutilizable (ErrorMessage.jsx)

```javascript
import styles from './ErrorMessage.module.css';

/**
 * Componente para mostrar errores de la API de forma consistente
 * @param {Object} error - Objeto de error de la API con errorCode, errorId, etc.
 */
function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  
  // Determinar severidad por errorCode
  const getSeverity = (errorCode) => {
    if (errorCode?.startsWith('VALIDATION')) return 'warning';
    if (errorCode?.startsWith('DB_')) return 'error';
    return 'error';
  };
  
  // Determinar si mostrar botón de reintentar
  const canRetry = (errorCode) => {
    return ['DB_CONNECTION_ERROR', 'NETWORK_ERROR', 'INTERNAL_SERVER_ERROR']
      .includes(errorCode);
  };
  
  const severity = getSeverity(error.errorCode);
  const showRetry = canRetry(error.errorCode) && onRetry;
  
  return (
    <div className={`${styles.errorMessage} ${styles[severity]}`} role="alert">
      <div className={styles.errorHeader}>
        <span className={styles.errorIcon}>⚠️</span>
        <h4>Error al procesar la solicitud</h4>
      </div>
      
      <p className={styles.errorText}>{error.error}</p>
      
      {/* Mostrar errorId solo si existe (para copiar en soporte) */}
      {error.errorId && (
        <div className={styles.errorFooter}>
          <small>
            Código de error: <code>{error.errorId}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(error.errorId)}
              className={styles.copyButton}
              title="Copiar código de error"
            >
              📋
            </button>
          </small>
        </div>
      )}
      
      {/* Botón de reintentar para errores transitorios */}
      {showRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          🔄 Reintentar
        </button>
      )}
      
      {/* DEBUG: Mostrar errorDetail en QA (solo para desarrollo) */}
      {process.env.NODE_ENV !== 'production' && error.errorDetail && (
        <details className={styles.errorDebug}>
          <summary>Detalle técnico (QA)</summary>
          <pre>{JSON.stringify(error.errorDetail, null, 2)}</pre>
          {error.metadata && (
            <pre>Metadata: {JSON.stringify(error.metadata, null, 2)}</pre>
          )}
        </details>
      )}
    </div>
  );
}

export default ErrorMessage;
```

---

#### Hook Personalizado para Manejo de Errores (useApiError.js)

```javascript
import { useState, useCallback } from 'react';

/**
 * Hook para manejar errores de API de forma consistente
 * @returns {Object} { error, setError, clearError, handleApiError }
 */
export function useApiError() {
  const [error, setError] = useState(null);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Maneja errores de API y registra en consola
   * @param {Object} apiError - Error estructurado de la API
   * @param {string} context - Contexto del error (ej: 'calcular honorarios')
   */
  const handleApiError = useCallback((apiError, context = '') => {
    // Log estructurado para debugging
    console.error(`❌ Error en ${context}:`, {
      errorId: apiError.errorId,
      errorCode: apiError.errorCode,
      message: apiError.error,
      timestamp: apiError.timestamp,
      detail: apiError.errorDetail,
      metadata: apiError.metadata
    });
    
    // Si es error de validación, podríamos agregar lógica específica
    if (apiError.errorCode?.startsWith('VALIDATION') || 
        apiError.errorCode?.startsWith('INVALID') ||
        apiError.errorCode?.startsWith('MISSING')) {
      // Lógica adicional para errores de validación
      // Por ejemplo, resaltar campos específicos si viene en metadata
      if (apiError.metadata?.field) {
        console.log(`🔍 Campo con error: ${apiError.metadata.field}`);
      }
    }
    
    setError(apiError);
  }, []);
  
  return { error, setError, clearError, handleApiError };
}
```

**Uso del hook**:
```javascript
function MiComponente() {
  const { error, handleApiError, clearError } = useApiError();
  
  const handleSubmit = async (datos) => {
    try {
      clearError();
      const resultado = await miServicio(datos);
      // ... manejar éxito
    } catch (apiError) {
      handleApiError(apiError, 'guardar datos');
    }
  };
  
  return (
    <div>
      <ErrorMessage error={error} onRetry={() => handleSubmit(lastData)} />
      {/* ... resto del componente */}
    </div>
  );
}
```

---

### Casos de Uso Comunes

#### 1. Error de Validación (400)
```json
{
  "success": false,
  "error": "tareaId es requerido y debe ser un número entero positivo",
  "errorCode": "INVALID_FIELD_TYPE",
  "errorId": "err_1786548300_x7j2k9",
  "timestamp": "2026-08-12T16:45:00.123Z",
  "metadata": {
    "field": "tareaId",
    "receivedValue": "ABC",
    "expectedType": "integer > 0"
  },
  "version": "1.0"
}
```

**Acción Frontend**: Mostrar mensaje debajo del campo `tareaId`, resaltar en rojo.

---

#### 2. Error de Base de Datos (500)
```json
{
  "success": false,
  "error": "Error al ejecutar procedimiento almacenado",
  "errorCode": "DB_SP_ERROR",
  "errorId": "err_1786548238_a7k9m2",
  "timestamp": "2026-08-12T15:23:58.551Z",
  "version": "1.0"
}
```

**Acción Frontend**: 
- Mostrar mensaje genérico al usuario
- Incluir botón "Copiar código de error" con el `errorId`
- Instruir al usuario a contactar soporte con el `errorId`

---

#### 3. Recurso No Encontrado (404)
```json
{
  "success": false,
  "error": "El cálculo solicitado no existe",
  "errorCode": "RESOURCE_NOT_FOUND",
  "errorId": "err_1786548350_b2m5n3",
  "timestamp": "2026-08-12T16:52:30.789Z",
  "metadata": {
    "resourceType": "calculo",
    "resourceId": 999
  },
  "version": "1.0"
}
```

**Acción Frontend**: Redirigir a página de error 404 o mostrar mensaje "No encontrado".

---

### Checklist de Integración Frontend

- [ ] Service layer captura y lanza errores estructurados
- [ ] Componente `ErrorMessage` creado y reutilizable
- [ ] Hook `useApiError` implementado (opcional pero recomendado)
- [ ] Errores muestran mensaje user-friendly (`error`)
- [ ] Errores 500 muestran `errorId` copiable
- [ ] `errorDetail` solo se muestra en dev/QA (nunca en producción)
- [ ] Logs de consola incluyen `errorId` para trazabilidad
- [ ] Errores de validación resaltan campos específicos cuando aplica
- [ ] Errores transitorios (conexión) tienen botón de reintentar
- [ ] Documentación frontend actualizada con ejemplos

---

### Debugging con errorId

**Flujo completo de debugging**:

1. **Usuario reporta error** → Copia `errorId` de la interfaz
2. **Soporte busca en CloudWatch** con el `errorId`
3. **Logs muestran**:
   - Stack trace completo
   - Módulo y función exacta
   - Stored procedure que falló
   - Parámetros enviados (si aplica)
   - errno y sqlState de MySQL

**Comando CloudWatch**:
```bash
aws logs filter-log-events \
  --log-group-name "/aws/lambda/cpau-ch2026-api-qa" \
  --filter-pattern "err_1786548238_a7k9m2"
```

---

## 📚 Referencias

**Estimación Total**: 6-9 horas  
**Archivos Afectados**: 13+ archivos  
**Funciones Refactorizadas**: 42+ funciones  
**Dependencias**: Ninguna  
**Breaking Changes**: No (compatible con frontend actual)

---

## 📈 Desglose de Estimación

| Fase | Descripción | Tiempo |
|------|-------------|--------|
| **Fase 1** | Infraestructura (ApiError, errorCodes, middleware) | 1-2h |
| **Fase 2** | Refactor capa DB (2 funciones) | 1h |
| **Fase 3** | Refactor modelos (32 funciones en 6 archivos) | 2-3h |
| **Fase 4** | Refactor controllers (5+ archivos) | 1-2h |
| **Fase 5** | Testing y validación completa | 1-2h |
| **TOTAL** | **6-9 horas** | |

**Velocidad de implementación**: ~5-7 funciones por hora (fase 3)  
**Complejidad**: Media (patrón repetitivo, pero 42 puntos de cambio)

---

## 📂 Checklist de Archivos

### Crear (3 archivos nuevos)
- [ ] `src/utils/ApiError.js`
- [ ] `src/constants/errorCodes.js`
- [ ] `src/middleware/errorHandler.js`

### Modificar - Capa DB (1 archivo)
- [ ] `src/config/db.js`

### Modificar - Modelos (6 archivos, 32 funciones)
- [ ] `src/models/calculo.js` (5 funciones)
- [ ] `src/models/parametro.js` (4 funciones)
- [ ] `src/models/tareaProfesional.js` (4 funciones)
- [ ] `src/models/terminosCondiciones.js` (5 funciones)
- [ ] `src/models/usuario.js` (8 funciones)
- [ ] `src/services/entregablesService.js` (6 funciones)

### Modificar - Controllers (5+ archivos)
- [ ] `src/controllers/calculosController.js`
- [ ] `src/controllers/parametrosController.js` (si existe)
- [ ] `src/controllers/tareasController.js` (si existe)
- [ ] `src/controllers/terminosCondicionesController.js` (si existe)
- [ ] `src/controllers/usuariosController.js` (si existe)
- [ ] Otros controllers según aplicación

### Registrar Middleware (1 archivo)
- [ ] `app.js` o `lambda.js` o `index.js` (punto de entrada de la app)

### Documentar (1+ archivos)
- [ ] `README.md` (agregar sección de manejo de errores)
- [ ] Crear `ERRORS.md` (opcional, catálogo de errorCodes)

**Total archivos**: 13-17 archivos

---

## 🎯 Estrategia de Implementación Sugerida

### Opción A: Implementación Completa (Recomendado)
**Tiempo**: 6-9 horas  
**Ventaja**: Cobertura 100% inmediata, consistencia total  
**Ideal para**: Sprint dedicado o día completo de refactor

### Opción B: Implementación por Prioridad
Si el tiempo es limitado, implementar en este orden:

#### Sprint 1 - Crítico (3-4h)
1. Fase 1: Infraestructura completa
2. Fase 2: Capa DB completa
3. Fase 3: Solo modelos críticos:
   - `usuario.js` (login/auth)
   - `terminosCondiciones.js` (TyC vigente)
   - `calculo.js` (funcionalidad core)

#### Sprint 2 - Importante (2-3h)
4. Fase 3 (resto): 
   - `entregablesService.js` (PDFs)
   - `tareaProfesional.js`
   - `parametro.js`
5. Fase 4: Controllers principales

#### Sprint 3 - Testing (1-2h)
6. Fase 5: Testing exhaustivo
7. Documentación completa

---

## 🚨 Advertencias Importantes

### Durante Implementación
1. **NO** modificar firmas de funciones públicas
2. **NO** cambiar nombres de funciones exportadas
3. **MANTENER** backward compatibility con controllers existentes
4. **PROBAR** cada modelo después de refactorizar
5. **COMMITEAR** por archivo o módulo (no todo junto)

### Después de Implementar
1. **Verificar** que QA muestra `errorDetail` y PROD no
2. **Actualizar** variable de entorno `NODE_ENV` si no existe
3. **Monitorear** logs de CloudWatch primeras 24h
4. **Comunicar** al equipo frontend sobre nuevos `errorCodes`

---

## 📞 Soporte y Mantenimiento

### Agregar Nuevos Códigos de Error
```javascript
// En src/constants/errorCodes.js
const ERROR_CODES = {
  // ... códigos existentes
  MI_NUEVO_ERROR: 'MI_NUEVO_ERROR', // Agregar aquí
};
```

### Agregar Try/Catch a Nueva Función
```javascript
// Plantilla estandarizada
const ApiError = require('../utils/ApiError');
const ERROR_CODES = require('../constants/errorCodes');

async function miFuncionNueva(params) {
    try {
        const resultado = await db.executeStoredProcedure('MI_SP', [params]);
        return resultado;
    } catch (error) {
        if (error instanceof ApiError) {
            error.metadata.function = 'modelo.miFuncionNueva';
            throw error;
        }
        throw new ApiError({
            code: ERROR_CODES.DB_ERROR,
            message: 'Mensaje user-friendly',
            statusCode: 500,
            detail: { originalError: error.message },
            metadata: { module: 'modelo.miFuncionNueva' }
        });
    }
}
```

---