# Contrato de API - Sistema de Cálculo de Honorarios CPAU

**Proyecto:** CH2026  
**Versión API:** 1.0  
**Fecha:** 16/03/2026  
**Estado:** Definido - Pendiente Implementación  

---

## 📘 Información General

### Base URL

**Fase 1 (Serverless - Actual):**
```
Local Development:  http://localhost:5173/api
QA Environment:     https://ch2026-qa.vercel.app/api
```

**Fase 2 (Backend Real - Futuro):**
```
Development:  https://dev-api.cpau-honorarios.com/v1
QA:           https://qa-api.cpau-honorarios.com/v1
Production:   https://api.cpau-honorarios.com/v1
```

### Headers Comunes

```http
Content-Type: application/json
Accept: application/json
X-API-Version: 1.0
```

**Fase 2 - Headers Adicionales:**
```http
Authorization: Bearer {JWT_TOKEN}
X-Request-ID: {UUID}
```

### Formato de Respuesta Estándar

Todas las respuestas siguen esta estructura:

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "version": "1.0"
}
```

**Error:**
```json
{
  "success": false,
  "error": "mensaje descriptivo",
  "details": { ... },  // opcional
  "requestId": "...",  // Fase 2
  "version": "1.0"
}
```

---

## 🎯 Endpoints

### 1. Calcular Honorarios

Calcula honorarios profesionales según tipo de cálculo y tareas profesionales seleccionadas.

#### Request

```http
POST /api/honorarios/calcular
Content-Type: application/json
```

#### Request Body

```json
{
  "tipoCalculo": "basico",
  "datosProyecto": {
    "nombre": "string",         // opcional
    "ubicacion": "string",      // opcional
    "cliente": "string"         // opcional
  },
  "datosObra": {
    "valorObra": number,        // REQUERIDO, > 0
    "superficie": number,       // opcional, m²
    "tipologia": "string",      // opcional
    "complejidad": "string"     // opcional: "baja" | "media" | "alta"
  },
  "tareasProfesionales": {
    "obraProyecto": boolean,           // REQUERIDO
    "obraDireccion": boolean,          // REQUERIDO
    "instalacionSanitaria": boolean,   // REQUERIDO
    "instalacionElectrica": boolean,   // REQUERIDO
    "instalacionContraIncendio": boolean, // REQUERIDO
    "proyectoEstructuras": boolean     // REQUERIDO
  },
  "parametros": {
    "valorK": number            // opcional, si null usa valor por defecto
  }
}
```

#### Request Body - Detalle de Campos

| Campo | Tipo | Requerido | Validación | Descripción |
|-------|------|-----------|------------|-------------|
| `tipoCalculo` | string | Sí | Enum: "basico" | Tipo de cálculo a realizar |
| `datosProyecto.nombre` | string | No | Max 200 chars | Nombre del proyecto |
| `datosProyecto.ubicacion` | string | No | Max 200 chars | Ubicación de la obra |
| `datosProyecto.cliente` | string | No | Max 200 chars | Nombre del cliente |
| `datosObra.valorObra` | number | Sí | > 0, max 15 dígitos | Valor total de la obra en ARS |
| `datosObra.superficie` | number | No | > 0 | Superficie en m² |
| `datosObra.tipologia` | string | No | Max 100 chars | Tipo de obra |
| `datosObra.complejidad` | string | No | "baja"\|"media"\|"alta" | Complejidad de la obra |
| `tareasProfesionales.*` | boolean | Sí | true/false | Tareas incluidas en el cálculo |
| `parametros.valorK` | number | No | > 0 | Valor K para cálculo (si null, usa default) |

#### Response - Éxito (HTTP 200)

```json
{
  "success": true,
  "data": {
    "calculoId": "calc_1710594600123",
    "tipoCalculo": "basico",
    "fechaCalculo": "2026-03-16T14:30:00.123Z",
    "resultado": {
      "detalleHonorarios": [
        {
          "item": 1,
          "tareaProfesional": "Proyecto de Obra",
          "descripcion": "Rango de Costos de Obra B (coef 8%) // Rango de Costos de Obra B (coef K 3%)",
          "importe": 2450000.50
        },
        {
          "item": 2,
          "tareaProfesional": "Dirección de Obra",
          "descripcion": "Rango de Costos de Obra B (coef 8%) // Rango de Costos de Obra B (coef K 3%)",
          "importe": 1633333.67
        }
        // ... más ítems
      ],
      "totalHonorarios": 4333334.17,
      "metadata": {
        "rango": "B",
        "valorK": 522181756.33,
        "rangoCostoObra": 0.0958,
        "cantidadTareas": 5
      }
    }
  },
  "version": "1.0"
}
```

#### Response Body - Detalle de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `calculoId` | string | ID único del cálculo (Fase 1: timestamp, Fase 2: DB ID) |
| `tipoCalculo` | string | Tipo de cálculo realizado |
| `fechaCalculo` | string (ISO 8601) | Fecha y hora del cálculo |
| `resultado.detalleHonorarios` | array | Lista de ítems del cálculo |
| `resultado.detalleHonorarios[].item` | number | Número de ítem (secuencial) |
| `resultado.detalleHonorarios[].tareaProfesional` | string | Nombre de la tarea profesional |
| `resultado.detalleHonorarios[].descripcion` | string | Descripción del cálculo (rangos y coeficientes) |
| `resultado.detalleHonorarios[].importe` | number | Importe calculado para esta tarea en ARS |
| `resultado.totalHonorarios` | number | Suma total de todos los honorarios |
| `resultado.metadata.rango` | string | Rango determinado (A, B, C, D) |
| `resultado.metadata.valorK` | number | Valor K utilizado en el cálculo |
| `resultado.metadata.rangoCostoObra` | number | Ratio ValorObra/ValorK |
| `resultado.metadata.cantidadTareas` | number | Cantidad de tareas calculadas |

#### Responses - Errores

**Error 400 - Datos Inválidos:**
```json
{
  "success": false,
  "error": "Datos inválidos",
  "details": {
    "field": "datosObra.valorObra",
    "message": "El valor de obra debe ser mayor a 0",
    "code": "INVALID_VALUE"
  },
  "version": "1.0"
}
```

**Error 400 - Falta Campo Requerido:**
```json
{
  "success": false,
  "error": "Campo requerido faltante",
  "details": {
    "field": "tareasProfesionales",
    "message": "Debe especificar las tareas profesionales",
    "code": "MISSING_REQUIRED_FIELD"
  },
  "version": "1.0"
}
```

**Error 400 - Ninguna Tarea Seleccionada:**
```json
{
  "success": false,
  "error": "Validación fallida",
  "details": {
    "field": "tareasProfesionales",
    "message": "Debe seleccionar al menos una tarea profesional",
    "code": "NO_TASKS_SELECTED"
  },
  "version": "1.0"
}
```

**Error 500 - Error Interno:**
```json
{
  "success": false,
  "error": "Error interno al calcular honorarios",
  "requestId": "req_1710594600123",
  "version": "1.0"
}
```

#### Códigos de Estado HTTP

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Cálculo exitoso |
| 400 | Bad Request | Datos inválidos, faltantes o tipo incorrecto |
| 401 | Unauthorized | Token JWT inválido o expirado (Fase 2) |
| 403 | Forbidden | Usuario sin permisos suficientes (Fase 2) |
| 429 | Too Many Requests | Rate limit excedido (Fase 2) |
| 500 | Internal Server Error | Error no manejado en servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

---

### 2. Guardar Cálculo

**Estado:** Fase 2 - No implementado en Fase 1

Guarda un cálculo realizado en la base de datos para consulta posterior.

#### Request

```http
POST /api/honorarios/guardar
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

#### Request Body

```json
{
  "calculoId": "calc_1710594600123",
  "datosAdicionales": {
    "notas": "string",
    "etiquetas": ["string"]
  }
}
```

#### Response - Éxito (HTTP 201)

```json
{
  "success": true,
  "data": {
    "calculoId": "calc_1710594600123",
    "mensaje": "Cálculo guardado exitosamente",
    "fechaGuardado": "2026-03-16T14:35:00.123Z"
  },
  "version": "1.0"
}
```

---

### 3. Obtener Histórico de Cálculos

**Estado:** Fase 2 - No implementado en Fase 1

Obtiene el historial de cálculos realizados por el usuario autenticado.

#### Request

```http
GET /api/honorarios/historial?limit=20&offset=0&tipoCalculo=basico&fechaDesde=2026-01-01&fechaHasta=2026-12-31
Authorization: Bearer {JWT_TOKEN}
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `limit` | number | No | 20 | Cantidad de resultados por página |
| `offset` | number | No | 0 | Offset para paginación |
| `tipoCalculo` | string | No | null | Filtrar por tipo de cálculo |
| `fechaDesde` | string (YYYY-MM-DD) | No | null | Fecha desde (inclusive) |
| `fechaHasta` | string (YYYY-MM-DD) | No | null | Fecha hasta (inclusive) |

#### Response - Éxito (HTTP 200)

```json
{
  "success": true,
  "data": {
    "calculos": [
      {
        "calculoId": "calc_123",
        "tipoCalculo": "basico",
        "fechaCalculo": "2026-03-16T14:30:00Z",
        "nombreProyecto": "Vivienda Belgrano",
        "cliente": "Juan Pérez",
        "valorObra": 50000000,
        "totalHonorarios": 4333334.17,
        "rango": "B"
      }
      // ... más cálculos
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "version": "1.0"
}
```

---

### 4. Obtener Cálculo por ID

**Estado:** Fase 2 - No implementado en Fase 1

Obtiene el detalle completo de un cálculo específico por su ID.

#### Request

```http
GET /api/honorarios/calculos/{calculoId}
Authorization: Bearer {JWT_TOKEN}
```

#### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `calculoId` | string | ID del cálculo a obtener |

#### Response - Éxito (HTTP 200)

```json
{
  "success": true,
  "data": {
    "calculoId": "calc_1710594600123",
    "tipoCalculo": "basico",
    "fechaCalculo": "2026-03-16T14:30:00.123Z",
    "datosProyecto": {
      "nombre": "Vivienda Unifamiliar en Belgrano",
      "ubicacion": "CABA - Belgrano",
      "cliente": "Juan Pérez"
    },
    "datosObra": {
      "valorObra": 50000000,
      "superficie": 250,
      "tipologia": "Vivienda unifamiliar",
      "complejidad": "media"
    },
    "tareasProfesionales": {
      "obraProyecto": true,
      "obraDireccion": true,
      "instalacionSanitaria": true,
      "instalacionElectrica": true,
      "instalacionContraIncendio": false,
      "proyectoEstructuras": true
    },
    "resultado": {
      "detalleHonorarios": [ ... ],
      "totalHonorarios": 4333334.17,
      "metadata": { ... }
    }
  },
  "version": "1.0"
}
```

#### Response - Error 404

```json
{
  "success": false,
  "error": "Cálculo no encontrado",
  "details": {
    "calculoId": "calc_invalid",
    "code": "NOT_FOUND"
  },
  "version": "1.0"
}
```

---

### 5. Obtener Valor K Vigente

**Estado:** Fase 2 - No implementado en Fase 1

Obtiene el valor K vigente para la fecha especificada (o fecha actual si no se especifica).

#### Request

```http
GET /api/parametros/valorK?fecha=2026-03-16
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `fecha` | string (YYYY-MM-DD) | No | Hoy | Fecha para la cual obtener el valor K |

#### Response - Éxito (HTTP 200)

```json
{
  "success": true,
  "data": {
    "valorK": 522181756.33,
    "vigenciaDesde": "2026-01-01",
    "vigenciaHasta": null,
    "descripcion": "Valor K para cálculo de honorarios CPAU"
  },
  "version": "1.0"
}
```

---

## 📊 Códigos de Error Detallados

### Códigos de Negocio

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `INVALID_VALUE` | Valor fuera de rango permitido | 400 |
| `MISSING_REQUIRED_FIELD` | Campo requerido no proporcionado | 400 |
| `INVALID_TYPE` | Tipo de dato incorrecto | 400 |
| `NO_TASKS_SELECTED` | No se seleccionó ninguna tarea | 400 |
| `INVALID_TIPO_CALCULO` | Tipo de cálculo no soportado | 400 |
| `VALOR_K_NOT_FOUND` | Valor K no configurado | 500 |
| `CALCULATION_ERROR` | Error durante el cálculo | 500 |
| `NOT_FOUND` | Recurso no encontrado | 404 |
| `UNAUTHORIZED` | Token inválido o expirado | 401 |
| `FORBIDDEN` | Sin permisos | 403 |
| `RATE_LIMIT_EXCEEDED` | Demasiadas peticiones | 429 |

### Estructura de Detalle de Error

```json
{
  "field": "string",      // Campo que causó el error (opcional)
  "message": "string",    // Mensaje descriptivo del error
  "code": "string",       // Código de error de negocio
  "value": any            // Valor que causó el error (opcional, solo en dev)
}
```

---

## 🔐 Autenticación (Fase 2)

### JWT Token Structure

```json
{
  "sub": "user_id_123",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "role": "professional",
  "iat": 1710594600,
  "exp": 1710681000
}
```

### Header de Autenticación

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh Token Flow

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Cálculo Simple (Solo Proyecto de Obra)

**Request:**
```bash
curl -X POST https://ch2026-qa.vercel.app/api/honorarios/calcular \
  -H "Content-Type: application/json" \
  -H "X-API-Version: 1.0" \
  -d '{
    "tipoCalculo": "basico",
    "datosObra": {
      "valorObra": 10000000
    },
    "tareasProfesionales": {
      "obraProyecto": true,
      "obraDireccion": false,
      "instalacionSanitaria": false,
      "instalacionElectrica": false,
      "instalacionContraIncendio": false,
      "proyectoEstructuras": false
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calculoId": "calc_1710594600123",
    "tipoCalculo": "basico",
    "fechaCalculo": "2026-03-16T14:30:00.123Z",
    "resultado": {
      "detalleHonorarios": [
        {
          "item": 1,
          "tareaProfesional": "Proyecto de Obra",
          "descripcion": "Rango de Costos de Obra A (coef 14%)",
          "importe": 840000.00
        }
      ],
      "totalHonorarios": 840000.00,
      "metadata": {
        "rango": "A",
        "valorK": 522181756.33,
        "rangoCostoObra": 0.0191,
        "cantidadTareas": 1
      }
    }
  },
  "version": "1.0"
}
```

---

### Ejemplo 2: Cálculo Completo (Todas las Tareas)

**Request:**
```bash
curl -X POST https://ch2026-qa.vercel.app/api/honorarios/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "tipoCalculo": "basico",
    "datosProyecto": {
      "nombre": "Edificio Residencial Palermo",
      "ubicacion": "CABA - Palermo",
      "cliente": "Desarrollos SA"
    },
    "datosObra": {
      "valorObra": 500000000,
      "superficie": 2500,
      "tipologia": "Edificio de departamentos",
      "complejidad": "alta"
    },
    "tareasProfesionales": {
      "obraProyecto": true,
      "obraDireccion": true,
      "instalacionSanitaria": true,
      "instalacionElectrica": true,
      "instalacionContraIncendio": true,
      "proyectoEstructuras": true
    },
    "parametros": {
      "valorK": 522181756.33
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "calculoId": "calc_1710594612345",
    "tipoCalculo": "basico",
    "fechaCalculo": "2026-03-16T14:31:52.345Z",
    "resultado": {
      "detalleHonorarios": [
        {
          "item": 1,
          "tareaProfesional": "Proyecto de Obra",
          "descripcion": "Rango de Costos de Obra A (coef 14%)",
          "importe": 42000000.00
        },
        {
          "item": 2,
          "tareaProfesional": "Dirección de Obra",
          "descripcion": "Rango de Costos de Obra A (coef 14%)",
          "importe": 28000000.00
        },
        {
          "item": 3,
          "tareaProfesional": "Proyecto de Instalación Sanitaria",
          "descripcion": "Rango de Costos de Obra A (coef 0.23%)",
          "importe": 1150000.00
        },
        {
          "item": 4,
          "tareaProfesional": "Proyecto de Instalación Eléctrica",
          "descripcion": "Rango de Costos de Obra A (coef 0.23%)",
          "importe": 1150000.00
        },
        {
          "item": 5,
          "tareaProfesional": "Proyecto de Instalación contra Incendios",
          "descripcion": "Rango de Costos de Obra A (coef 0.23%)",
          "importe": 1150000.00
        },
        {
          "item": 6,
          "tareaProfesional": "Proyecto de Estructuras",
          "descripcion": "Rango de Costos de Obra A (coef 0.30%)",
          "importe": 1500000.00
        }
      ],
      "totalHonorarios": 74950000.00,
      "metadata": {
        "rango": "A",
        "valorK": 522181756.33,
        "rangoCostoObra": 0.9575,
        "cantidadTareas": 6
      }
    }
  },
  "version": "1.0"
}
```

---

### Ejemplo 3: Error - Valor de Obra Faltante

**Request:**
```bash
curl -X POST https://ch2026-qa.vercel.app/api/honorarios/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "tipoCalculo": "basico",
    "tareasProfesionales": {
      "obraProyecto": true,
      "obraDireccion": false
    }
  }'
```

**Response (HTTP 400):**
```json
{
  "success": false,
  "error": "Campo requerido faltante",
  "details": {
    "field": "datosObra.valorObra",
    "message": "El valor de obra es requerido",
    "code": "MISSING_REQUIRED_FIELD"
  },
  "version": "1.0"
}
```

---

### Ejemplo 4: Error - Ninguna Tarea Seleccionada

**Request:**
```bash
curl -X POST https://ch2026-qa.vercel.app/api/honorarios/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "tipoCalculo": "basico",
    "datosObra": {
      "valorObra": 50000000
    },
    "tareasProfesionales": {
      "obraProyecto": false,
      "obraDireccion": false,
      "instalacionSanitaria": false,
      "instalacionElectrica": false,
      "instalacionContraIncendio": false,
      "proyectoEstructuras": false
    }
  }'
```

**Response (HTTP 400):**
```json
{
  "success": false,
  "error": "Validación fallida",
  "details": {
    "field": "tareasProfesionales",
    "message": "Debe seleccionar al menos una tarea profesional",
    "code": "NO_TASKS_SELECTED"
  },
  "version": "1.0"
}
```

---

## 🧪 Testing

### Variables de Entorno para Testing

```bash
# .env.test
VITE_API_URL=http://localhost:5173/api
VITE_API_VERSION=1.0
NODE_ENV=test
```

### Casos de Prueba Mínimos

| Test ID | Descripción | Valor Obra | Tareas | Rango Esperado | Status Esperado |
|---------|-------------|------------|--------|----------------|-----------------|
| TC001 | Proyecto solo, Rango A | 10,000,000 | Solo Proyecto | A | 200 |
| TC002 | Proyecto solo, Rango B | 100,000,000 | Solo Proyecto | B | 200 |
| TC003 | Proyecto solo, Rango C | 1,000,000,000 | Solo Proyecto | C | 200 |
| TC004 | Proyecto solo, Rango D | 20,000,000,000 | Solo Proyecto | D | 200 |
| TC005 | Todas las tareas, Rango B | 500,000,000 | Todas | B | 200 |
| TC006 | Sin valor de obra | N/A | Proyecto | N/A | 400 |
| TC007 | Sin tareas seleccionadas | 50,000,000 | Ninguna | N/A | 400 |
| TC008 | Valor obra negativo | -1000 | Proyecto | N/A | 400 |
| TC009 | Tipo cálculo inválido | 50,000,000 | Proyecto | N/A | 400 |

### Postman Collection

Ver archivo adjunto: `CH2026_API_Tests.postman_collection.json` (a crear)

---

## 📚 Changelog

### Version 1.0 (16/03/2026)
- ✅ Definición inicial del contrato de API
- ✅ Endpoint POST /api/honorarios/calcular
- ✅ Estructura de request/response estándar
- ✅ Códigos de error definidos
- ✅ Ejemplos de uso documentados
- ⏳ Pendiente: Implementación Fase 1 (Serverless)
- ⏳ Pendiente: Endpoints Fase 2 (Backend real)

---

## 🔗 Referencias

- [Documento de Arquitectura Backend](06-ArquitecturaBackendAPI.md)
- [Tickets de Implementación](Tareas/260316-TicketsBackendCalculo.txt)
- [Proceso de Cálculo](02-ProcesoDeCálculoDeHonorarios.md)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [REST API Best Practices](https://restfulapi.net/)

---

**Este es un documento vivo que será actualizado conforme avance el desarrollo.**

**Última actualización:** 16/03/2026  
**Próxima revisión:** Al completar Fase 1 de implementación
