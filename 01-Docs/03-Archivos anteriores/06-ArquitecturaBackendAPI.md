# Arquitectura Backend API - Sistema de Cálculo de Honorarios

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Fecha:** 16/03/2026  
**Versión:** 1.0  
**Estado:** En Implementación - Fase Serverless

---

## 📋 Tabla de Contenidos

1. [Contexto y Motivación](#contexto-y-motivación)
2. [Problema Actual](#problema-actual)
3. [Solución Propuesta](#solución-propuesta)
4. [Arquitectura Fase 1: Serverless (Actual)](#arquitectura-fase-1-serverless-actual)
5. [Arquitectura Fase 2: Backend Real (Futuro)](#arquitectura-fase-2-backend-real-futuro)
6. [Contrato de API](#contrato-de-api)
7. [Estrategia de Migración](#estrategia-de-migración)
8. [Consideraciones Técnicas](#consideraciones-técnicas)
9. [Plan de Datos y Stored Procedures](#plan-de-datos-y-stored-procedures)

---

## Contexto y Motivación

### Objetivo del Proyecto
Desarrollar una aplicación web para el CPAU (Consejo Profesional de Arquitectura y Urbanismo) que permita calcular honorarios profesionales según diferentes tipos de tareas y legislación vigente.

### Fase Actual
Maqueta funcional para presentar al cliente y obtener aprobación del desarrollo completo.

### Necesidad de Backend
El cliente (departamento de imagen corporativa) ha preguntado sobre la visibilidad del código de cálculo, evidenciando preocupación por la propiedad intelectual. Se requiere ocultar:
- Fórmulas de cálculo
- Coeficientes por rango
- Lógica de negocio
- Valor K (índice base)
- Algoritmos de determinación de rangos

---

## Problema Actual

### Código Expuesto en Frontend

**Archivos visibles en navegador:**
```
src/utils/calculos/
├── honorariosBasico.js          ← Lógica completa de cálculo
└── tablasCoeficientes.js        ← Todos los coeficientes
```

**Información expuesta:**
```javascript
// VISIBLE en DevTools del navegador
export const COEFICIENTES_PROYECTO_DIRECCION = {
  rangoA: { obra: 0.14, k: 0 },      // 14% visible
  rangoB: { obra: 0.08, k: 0.03 },   // 8% + 3% visible
  rangoC: { obra: 0.06, k: 0.13 },   // etc.
  rangoD: { obra: 0.04, k: 0.63 }
};

export const VALOR_K_DEFAULT = 522181756.33;  // Completamente visible
```

**Riesgos:**
- ❌ Competidores pueden copiar fórmulas y coeficientes
- ❌ Clientes podrían calcular sin usar la aplicación
- ❌ Pérdida de propiedad intelectual
- ❌ Usuarios técnicos pueden manipular valores localmente

---

## Solución Propuesta

### Estrategia: "API Contract First"

Implementación en **dos fases** con contrato de API estable que no cambia entre fases.

#### Principios de Diseño:
1. **Contrato API inmutable** - Define estructura de request/response desde día 1
2. **Capa de abstracción** - Frontend solo conoce el servicio, no el backend
3. **Backend intercambiable** - Cambiar de serverless a backend real sin tocar frontend
4. **Migración progresiva** - Sin downtime, rollback fácil

#### Beneficios:
- ✅ Protege propiedad intelectual desde HOY
- ✅ Mínimo esfuerzo de implementación
- ✅ Compatible con plan Free de Vercel
- ✅ Preparado para crecimiento futuro
- ✅ Testing más robusto (separación de concerns)

---

## Arquitectura Fase 1: Serverless (Actual)

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     User Interface Layer                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │ │
│  │  │ Dashboard    │  │ Wizard Steps │  │ Revision & Results   │ │ │
│  │  │ Page         │  │ (1, 2, 3, 4) │  │ Components           │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │ │
│  │         │                 │                      │             │ │
│  │         └─────────────────┴──────────────────────┘             │ │
│  │                           │                                    │ │
│  │                  ┌────────▼────────┐                          │ │
│  │                  │ Service Layer   │                          │ │
│  │                  │                 │                          │ │
│  │        ┏━━━━━━━━━▼━━━━━━━━━━━━━━━━━▼━━━━━━━┓                │ │
│  │        ┃  honorariosService.js              ┃  ◄── ÚNICA     │ │
│  │        ┃  • calcularHonorarios()            ┃      CAPA DE   │ │
│  │        ┃  • guardarCalculo() [stub]         ┃      CAMBIO    │ │
│  │        ┃  • obtenerHistorico() [stub]       ┃                │ │
│  │        ┗━━━━━━━━━━━━━━┬━━━━━━━━━━━━━━━━━━━━┛                │ │
│  └────────────────────────┼─────────────────────────────────────┘ │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                   HTTP POST /api/honorarios/calcular
                           │ { tipoCalculo, datosObra, tareas... }
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    VERCEL SERVERLESS FUNCTIONS                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  /api/honorarios/calcular.js                               │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │  Handler Function                                     │  │  │
│  │  │  • Validación de request                             │  │  │
│  │  │  • Parsing de datos                                  │  │  │
│  │  │  • Llamada a lógica de cálculo                       │  │  │
│  │  │  • Formateo de response                              │  │  │
│  │  │  • Manejo de errores                                 │  │  │
│  │  └────────────┬─────────────────────────────────────────┘  │  │
│  └───────────────┼────────────────────────────────────────────┘  │
│                  │                                                │
│  ┌───────────────▼────────────────────────────────────────────┐  │
│  │  /api/utils/calculos/                                      │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  honorariosBasico.js                                 │ │  │
│  │  │  • calcularHonorariosBasico()                        │ │  │
│  │  │  • determinarRango()                                 │ │  │
│  │  │  • agregarItemsTarea()                              │ │  │
│  │  │  • agruparItemsPorTarea()                           │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  tablasCoeficientes.js                              │ │  │
│  │  │  • COEFICIENTES_PROYECTO_DIRECCION                  │ │  │
│  │  │  • COEFICIENTES_INSTALACIONES                       │ │  │
│  │  │  • COEFICIENTES_ESTRUCTURAS                         │ │  │
│  │  │  • VALOR_K_DEFAULT = 522181756.33                   │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ⚠️  CÓDIGO NO ACCESIBLE DESDE NAVEGADOR                         │
└────────────────────────────────────────────────────────────────────┘
                           │
                   HTTP 200 OK
                           │ { success, data: { detalleHonorarios, 
                           │   totalHonorarios, metadata } }
                           ▼
                    Frontend recibe resultado
```

### Componentes

#### 1. Frontend - Service Layer
**Archivo:** `src/services/honorariosService.js`

**Responsabilidades:**
- Encapsular comunicación con backend
- Manejar configuración de URL (env variables)
- Parsing de responses
- Manejo de errores
- Loading states

**Funciones:**
```javascript
// Implementada HOY
export async function calcularHonorarios(datosCompletos)

// Stubs para FUTURO
export async function guardarCalculo(calculoId, datosAdicionales)
export async function obtenerHistoricoCalculos(filtros)
export async function obtenerCalculoPorId(id)
```

#### 2. Backend - Serverless Function
**Archivo:** `api/honorarios/calcular.js`

**Responsabilidades:**
- Recibir request HTTP POST
- Validar estructura y datos
- Ejecutar lógica de cálculo (server-side)
- Formatear response según contrato
- Logging y error handling

#### 3. Backend - Business Logic (Oculta)
**Archivos:** 
- `api/utils/calculos/honorariosBasico.js`
- `api/utils/calculos/tablasCoeficientes.js`

**Contenido:**
- Fórmulas de cálculo completas
- Coeficientes por rango
- Valor K
- Lógica de determinación de rangos
- Cálculos de honorarios

⚠️ **CRÍTICO:** Estos archivos NO están en `/src`, por lo tanto NO se incluyen en el bundle del frontend y NO son visibles en el navegador.

### Flujo de Datos

```
Usuario completa wizard
         ↓
RevisionBasico.jsx
         ↓
honorariosService.calcularHonorarios(datosCompletos)
         ↓
POST /api/honorarios/calcular
         ↓
Vercel Serverless Function Handler
         ↓
Validaciones server-side
         ↓
calcularHonorariosBasico(formData, valorK)  ← SERVIDOR
         ↓
Aplicar coeficientes y fórmulas  ← OCULTO
         ↓
Return { detalleHonorarios, totalHonorarios }
         ↓
Response HTTP 200 con resultado
         ↓
honorariosService parsea response
         ↓
RevisionBasico.jsx muestra resultado
         ↓
Usuario ve resultado (sin ver cómo se calculó)
```

### Tecnologías - Fase 1

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Frontend | React | 18.3.1 |
| Build Tool | Vite | 5.1.4 |
| Routing | React Router | 6.22.0 |
| Backend | Vercel Serverless | Node.js 18.x |
| Hosting | Vercel | Free Plan |
| API Protocol | REST | HTTP/1.1 |
| Data Format | JSON | - |

### Limitaciones - Fase 1

#### Vercel Free Plan
- ✅ Serverless Functions incluidas
- ✅ 100 GB-Hrs/mes de ejecución
- ✅ 12 segundos de timeout
- ✅ Sin límite de funciones
- ⚠️ Cold start (~100-200ms primer request)
- ⚠️ Solo dominio .vercel.app

#### Sin Persistencia
- ❌ No hay base de datos
- ❌ No se guardan cálculos históricos
- ❌ No hay usuarios con login persistente
- ❌ No hay auditoría de operaciones

#### Sin Autenticación Real
- ❌ AuthContext es solo mock
- ❌ No hay JWT tokens
- ❌ No hay gestión de sesiones

**Nota:** Estas limitaciones son aceptables para la maqueta y serán resueltas en Fase 2.

---

## Arquitectura Fase 2: Backend Real (Futuro)

### Diagrama de Arquitectura Objetivo

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        honorariosService.js                            │ │
│  │        ✓ MISMO CÓDIGO que Fase 1                       │ │
│  │        ✓ Solo cambia: VITE_API_URL                     │ │
│  └───────────────────────┬────────────────────────────────┘ │
└──────────────────────────┼──────────────────────────────────┘
                           │
               HTTPS POST /api/v1/honorarios/calcular
               Header: Authorization: Bearer <JWT>
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    API GATEWAY / BACKEND                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Node.js/Express o ASP.NET Core                        │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Middleware Stack                                 │  │ │
│  │  │  • CORS                                           │  │ │
│  │  │  • Authentication (JWT)                           │  │ │
│  │  │  • Rate Limiting                                  │  │ │
│  │  │  • Request Validation                             │  │ │
│  │  │  • Logging/Auditing                               │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Controllers                                      │  │ │
│  │  │  • HonorariosController                           │  │ │
│  │  │  • CalculosController                             │  │ │
│  │  │  • UsuariosController                             │  │ │
│  │  └────────────┬─────────────────────────────────────┘  │ │
│  └───────────────┼────────────────────────────────────────┘ │
└──────────────────┼──────────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services                                              │ │
│  │  • HonorariosService                                   │ │
│  │  • ParametrosService                                   │ │
│  │  • AuditoriaService                                    │ │
│  └────────────┬───────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SQL Server / PostgreSQL                               │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Stored Procedures                                │  │ │
│  │  │  • SP_CALCULAR_HONORARIOS_BASICO                  │  │ │
│  │  │  • SP_OBTENER_COEFICIENTES                        │  │ │
│  │  │  • SP_GUARDAR_CALCULO                             │  │ │
│  │  │  • SP_OBTENER_VALOR_K                             │  │ │
│  │  │  • SP_AUDITORIA_CALCULO                           │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  Tablas                                           │  │ │
│  │  │  • Calculos                                       │  │ │
│  │  │  • Coeficientes                                   │  │ │
│  │  │  • Parametros                                     │  │ │
│  │  │  • Usuarios                                       │  │ │
│  │  │  • AuditoriaCalculos                              │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Cambios Necesarios en Frontend

**ÚNICO cambio requerido:**
```javascript
// .env.local - ANTES (Fase 1)
VITE_API_URL=/api

// .env.local - DESPUÉS (Fase 2)
VITE_API_URL=https://api.cpau-honorarios.com/v1
```

**El código de `honorariosService.js` NO cambia.**  
**Los componentes del wizard NO cambian.**  
**El contrato de API permanece igual.**

### Stack Tecnológico Sugerido - Fase 2

#### Opción A: Node.js Stack
```yaml
Backend Framework: Express.js o NestJS
Language: TypeScript
Database: PostgreSQL
ORM: Prisma o TypeORM
Auth: JWT con bcrypt
Cache: Redis
Testing: Jest + Supertest
Documentation: Swagger/OpenAPI
```

#### Opción B: .NET Stack (Recomendado para CPAU)
```yaml
Backend Framework: ASP.NET Core
Language: C#
Database: SQL Server
ORM: Entity Framework Core
Auth: ASP.NET Core Identity + JWT
Cache: Redis o MemoryCache
Testing: xUnit + Moq
Documentation: Swagger (Swashbuckle)
```

**Recomendación:** Opción B (.NET) por:
- Mayor adopción en sector corporativo argentino
- Excelente integración con SQL Server
- Soporte empresarial de Microsoft
- Stored procedures nativos y eficientes
- Seguridad robusta out-of-the-box

---

## Contrato de API

### Endpoint: Calcular Honorarios

**URL:** `POST /api/honorarios/calcular` (Fase 1) o `POST /api/v1/honorarios/calcular` (Fase 2)

#### Request

```json
{
  "tipoCalculo": "basico",
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
  "parametros": {
    "valorK": 522181756.33
  }
}
```

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
        },
        {
          "item": 3,
          "tareaProfesional": "Proyecto de Instalación Sanitaria",
          "descripcion": "Rango de Costos de Obra B (coef 0.12%)",
          "importe": 60000.00
        },
        {
          "item": 4,
          "tareaProfesional": "Proyecto de Instalación Eléctrica",
          "descripcion": "Rango de Costos de Obra B (coef 0.12%)",
          "importe": 60000.00
        },
        {
          "item": 5,
          "tareaProfesional": "Proyecto de Estructuras",
          "descripcion": "Rango de Costos de Obra B (coef 0.26%)",
          "importe": 130000.00
        }
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

#### Response - Error Validación (HTTP 400)

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

#### Response - Error Servidor (HTTP 500)

```json
{
  "success": false,
  "error": "Error interno al calcular honorarios",
  "requestId": "req_1710594600123",
  "version": "1.0"
}
```

### Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Cálculo exitoso |
| 400 | Bad Request | Datos inválidos o faltantes |
| 401 | Unauthorized | Token JWT inválido (Fase 2) |
| 403 | Forbidden | Sin permisos (Fase 2) |
| 429 | Too Many Requests | Rate limit excedido (Fase 2) |
| 500 | Internal Server Error | Error en servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

---

## Estrategia de Migración

### Checklist de Migración (Fase 1 → Fase 2)

#### Pre-Migración
- [ ] Diseñar esquema de base de datos
- [ ] Crear stored procedures (SP)
- [ ] Implementar backend API con mismo contrato
- [ ] Testing exhaustivo de backend
- [ ] Configurar infraestructura (servidor, DB, etc.)
- [ ] Configurar dominio y certificados SSL
- [ ] Implementar autenticación JWT
- [ ] Crear documentación de API (Swagger)

#### Durante Migración
- [ ] Deploy de backend en producción
- [ ] Verificar que backend funciona standalone
- [ ] Cambiar variable de entorno `VITE_API_URL` en frontend
- [ ] Deploy de frontend con nueva configuración
- [ ] Testing de integración end-to-end
- [ ] Monitorear logs y errores
- [ ] Rollback plan listo

#### Post-Migración
- [ ] Validar que todos los usuarios pueden calcular
- [ ] Verificar que cálculos son correctos (comparar con Fase 1)
- [ ] Monitorear performance
- [ ] Recopilar feedback de usuarios
- [ ] Deshabilitar serverless functions antiguas (si aplica)
- [ ] Documentar lecciones aprendidas

### Estrategia de Rollback

**Si algo falla en Fase 2:**

1. Cambiar `VITE_API_URL` de vuelta a `/api` (Fase 1)
2. Redeploy frontend
3. Serverless functions siguen funcionando
4. ~5 minutos de downtime máximo

**Pre-requisito:**
- Mantener serverless functions activas durante período de transición (ej: 2 semanas)

---

## Consideraciones Técnicas

### Seguridad

#### Fase 1 (Actual)
- ✅ Código de cálculo oculto en servidor
- ⚠️ No hay autenticación real (mock)
- ⚠️ No hay rate limiting
- ⚠️ No hay HTTPS (manejado por Vercel)

#### Fase 2 (Futuro)
- ✅ Autenticación JWT con refresh tokens
- ✅ Rate limiting por usuario/IP
- ✅ HTTPS obligatorio
- ✅ Validaciones server-side robustas
- ✅ Auditoría completa de operaciones
- ✅ Encriptación de datos sensibles en DB
- ✅ CORS configurado apropiadamente
- ✅ SQL Injection protection (stored procedures)

### Performance

#### Fase 1 (Estimado)
- Cold start: ~100-200ms (Vercel)
- Ejecución cálculo: ~50-100ms
- Response time total: ~150-300ms
- Throughput: Ilimitado para demo (plan Free suficiente)

#### Fase 2 (Objetivo)
- Response time: < 500ms (p95)
- Throughput: 100+ req/sec
- Database queries: < 50ms
- Cache hit ratio: > 80% (parámetros frecuentes)

### Escalabilidad

#### Fase 1
- Escala automáticamente (Vercel)
- Sin límites prácticos para maqueta
- Free tier: 100 GB-Hrs/mes

#### Fase 2
- Horizontal scaling de API servers
- Connection pooling en DB
- Read replicas para consultas
- Cache distribuido (Redis)
- Load balancer

### Monitoreo

#### Fase 1
- Logs de Vercel
- Network tab de DevTools
- Console logs (desarrollo)

#### Fase 2
- APM (Application Performance Monitoring)
- Logging centralizado (ELK/Splunk)
- Alertas en tiempo real
- Dashboard de métricas
- Health checks

---

## Plan de Datos y Stored Procedures

### Esquema de Base de Datos (Propuesto)

```sql
-- Tabla: Calculos
CREATE TABLE Calculos (
    CalculoID           BIGINT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID           INT NOT NULL,
    TipoCalculo         VARCHAR(50) NOT NULL,
    FechaCalculo        DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Datos del proyecto
    NombreProyecto      NVARCHAR(200),
    Ubicacion           NVARCHAR(200),
    Cliente             NVARCHAR(200),
    
    -- Datos de la obra
    ValorObra           DECIMAL(18,2) NOT NULL,
    Superficie          DECIMAL(10,2),
    Tipologia           NVARCHAR(100),
    Complejidad         VARCHAR(20),
    
    -- Tareas seleccionadas (JSON o columnas booleanas)
    TareasProfesionales NVARCHAR(MAX), -- JSON o XML
    
    -- Resultados
    TotalHonorarios     DECIMAL(18,2) NOT NULL,
    DetalleHonorarios   NVARCHAR(MAX), -- JSON
    Rango               CHAR(1),
    ValorK              DECIMAL(18,2),
    
    -- Audit
    CreadoPor           INT,
    FechaCreacion       DATETIME2 DEFAULT GETDATE(),
    ModificadoPor       INT,
    FechaModificacion   DATETIME2,
    Activo              BIT DEFAULT 1,
    
    CONSTRAINT FK_Calculos_Usuarios FOREIGN KEY (UsuarioID) 
        REFERENCES Usuarios(UsuarioID)
);

-- Tabla: Coeficientes
CREATE TABLE Coeficientes (
    CoeficienteID       INT IDENTITY(1,1) PRIMARY KEY,
    TipoCalculo         VARCHAR(50) NOT NULL,
    TipoTarea           VARCHAR(100) NOT NULL,
    Rango               CHAR(1) NOT NULL, -- A, B, C, D
    CoeficienteObra     DECIMAL(10,6),
    CoeficienteK        DECIMAL(10,6),
    VigenciaDesde       DATE NOT NULL,
    VigenciaHasta       DATE,
    Activo              BIT DEFAULT 1,
    
    CONSTRAINT UQ_Coeficientes UNIQUE (TipoCalculo, TipoTarea, Rango, VigenciaDesde)
);

-- Tabla: Parametros
CREATE TABLE Parametros (
    ParametroID         INT IDENTITY(1,1) PRIMARY KEY,
    Nombre              VARCHAR(100) NOT NULL UNIQUE,
    Valor               NVARCHAR(500) NOT NULL,
    Tipo                VARCHAR(50), -- 'DECIMAL', 'STRING', 'DATE', etc.
    Descripcion         NVARCHAR(500),
    VigenciaDesde       DATE NOT NULL,
    VigenciaHasta       DATE,
    Activo              BIT DEFAULT 1
);

-- Insertar valor K
INSERT INTO Parametros (Nombre, Valor, Tipo, Descripcion, VigenciaDesde, Activo)
VALUES ('VALOR_K', '522181756.33', 'DECIMAL', 'Valor K para cálculo de honorarios CPAU', '2026-01-01', 1);

-- Tabla: AuditoriaCalculos
CREATE TABLE AuditoriaCalculos (
    AuditoriaID         BIGINT IDENTITY(1,1) PRIMARY KEY,
    CalculoID           BIGINT,
    UsuarioID           INT,
    Accion              VARCHAR(50), -- 'CREAR', 'MODIFICAR', 'ELIMINAR', 'CONSULTAR'
    FechaAccion         DATETIME2 DEFAULT GETDATE(),
    IPAddress           VARCHAR(50),
    UserAgent           NVARCHAR(500),
    DatosAnteriores     NVARCHAR(MAX), -- JSON
    DatosNuevos         NVARCHAR(MAX), -- JSON
    
    CONSTRAINT FK_Auditoria_Calculos FOREIGN KEY (CalculoID) 
        REFERENCES Calculos(CalculoID)
);
```

### Stored Procedure Principal

```sql
CREATE PROCEDURE SP_CALCULAR_HONORARIOS_BASICO
    @UsuarioID          INT,
    @ValorObra          DECIMAL(18,2),
    @ObraProyecto       BIT,
    @ObraDireccion      BIT,
    @InstSanitaria      BIT,
    @InstElectrica      BIT,
    @InstContraIncendio BIT,
    @ProyectoEstructuras BIT,
    @ValorK             DECIMAL(18,2) = NULL, -- Si NULL, buscar en Parametros
    @NombreProyecto     NVARCHAR(200) = NULL,
    @Ubicacion          NVARCHAR(200) = NULL,
    @Cliente            NVARCHAR(200) = NULL,
    @Superficie         DECIMAL(10,2) = NULL,
    @Tipologia          NVARCHAR(100) = NULL,
    @Complejidad        VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CalculoID BIGINT;
    DECLARE @RangoCostoObra DECIMAL(18,6);
    DECLARE @Rango CHAR(1);
    DECLARE @TotalHonorarios DECIMAL(18,2) = 0;
    DECLARE @DetalleHonorarios NVARCHAR(MAX);
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 1. Obtener Valor K si no fue proporcionado
        IF @ValorK IS NULL
        BEGIN
            SELECT TOP 1 @ValorK = CAST(Valor AS DECIMAL(18,2))
            FROM Parametros
            WHERE Nombre = 'VALOR_K'
              AND Activo = 1
              AND VigenciaDesde <= GETDATE()
              AND (VigenciaHasta IS NULL OR VigenciaHasta >= GETDATE())
            ORDER BY VigenciaDesde DESC;
        END
        
        IF @ValorK IS NULL OR @ValorK <= 0
        BEGIN
            RAISERROR('Valor K no configurado o inválido', 16, 1);
            RETURN;
        END
        
        -- 2. Determinar Rango
        SET @RangoCostoObra = @ValorObra / @ValorK;
        
        SET @Rango = CASE
            WHEN @RangoCostoObra < 0.5 THEN 'A'
            WHEN @RangoCostoObra < 5 THEN 'B'
            WHEN @RangoCostoObra < 25 THEN 'C'
            ELSE 'D'
        END;
        
        -- 3. Crear tabla temporal para detalle
        CREATE TABLE #DetalleHonorarios (
            Item INT IDENTITY(1,1),
            TareaProfesional NVARCHAR(100),
            Descripcion NVARCHAR(500),
            Importe DECIMAL(18,2)
        );
        
        -- 4. Calcular honorarios por tarea
        
        -- 4.1. Proyecto de Obra
        IF @ObraProyecto = 1
        BEGIN
            INSERT INTO #DetalleHonorarios (TareaProfesional, Descripcion, Importe)
            SELECT 
                'Proyecto de Obra',
                'Rango ' + @Rango + ' (' + 
                    CAST(CAST(CoeficienteObra * 100 AS DECIMAL(10,2)) AS VARCHAR) + '%)' +
                    CASE WHEN CoeficienteK > 0 
                        THEN ' // Rango ' + @Rango + ' K (' + 
                             CAST(CAST(CoeficienteK * 100 AS DECIMAL(10,2)) AS VARCHAR) + '%)'
                        ELSE ''
                    END,
                (CoeficienteObra * @ValorObra * 0.6) + (CoeficienteK * @ValorK * 0.6)
            FROM Coeficientes
            WHERE TipoCalculo = 'basico'
              AND TipoTarea = 'PROYECTO_DIRECCION'
              AND Rango = @Rango
              AND Activo = 1;
        END
        
        -- 4.2. Dirección de Obra
        IF @ObraDireccion = 1
        BEGIN
            INSERT INTO #DetalleHonorarios (TareaProfesional, Descripcion, Importe)
            SELECT 
                'Dirección de Obra',
                'Rango ' + @Rango + ' (' + 
                    CAST(CAST(CoeficienteObra * 100 AS DECIMAL(10,2)) AS VARCHAR) + '%)' +
                    CASE WHEN CoeficienteK > 0 
                        THEN ' // Rango ' + @Rango + ' K (' + 
                             CAST(CAST(CoeficienteK * 100 AS DECIMAL(10,2)) AS VARCHAR) + '%)'
                        ELSE ''
                    END,
                (CoeficienteObra * @ValorObra * 0.4) + (CoeficienteK * @ValorK * 0.4)
            FROM Coeficientes
            WHERE TipoCalculo = 'basico'
              AND TipoTarea = 'PROYECTO_DIRECCION'
              AND Rango = @Rango
              AND Activo = 1;
        END
        
        -- 4.3-4.5. Instalaciones (similar pattern)
        -- ... (código similar para cada tipo de instalación)
        
        -- 4.6. Estructuras
        IF @ProyectoEstructuras = 1
        BEGIN
            INSERT INTO #DetalleHonorarios (TareaProfesional, Descripcion, Importe)
            SELECT 
                'Proyecto de Estructuras',
                'Rango ' + @Rango + ' (' + 
                    CAST(CAST(CoeficienteObra * 100 AS DECIMAL(10,4)) AS VARCHAR) + '%)',
                CoeficienteObra * @ValorObra
            FROM Coeficientes
            WHERE TipoCalculo = 'basico'
              AND TipoTarea = 'ESTRUCTURAS'
              AND Rango = @Rango
              AND Activo = 1;
        END
        
        -- 5. Calcular total
        SELECT @TotalHonorarios = SUM(Importe)
        FROM #DetalleHonorarios;
        
        -- 6. Convertir detalle a JSON
        SELECT @DetalleHonorarios = (
            SELECT 
                Item as 'item',
                TareaProfesional as 'tareaProfesional',
                Descripcion as 'descripcion',
                Importe as 'importe'
            FROM #DetalleHonorarios
            FOR JSON PATH
        );
        
        -- 7. Guardar cálculo en BD
        INSERT INTO Calculos (
            UsuarioID, TipoCalculo, NombreProyecto, Ubicacion, Cliente,
            ValorObra, Superficie, Tipologia, Complejidad,
            TareasProfesionales, TotalHonorarios, DetalleHonorarios,
            Rango, ValorK, CreadoPor
        )
        VALUES (
            @UsuarioID, 'basico', @NombreProyecto, @Ubicacion, @Cliente,
            @ValorObra, @Superficie, @Tipologia, @Complejidad,
            (SELECT 
                ObraProyecto = @ObraProyecto,
                ObraDireccion = @ObraDireccion,
                InstSanitaria = @InstSanitaria,
                InstElectrica = @InstElectrica,
                InstContraIncendio = @InstContraIncendio,
                ProyectoEstructuras = @ProyectoEstructuras
             FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            @TotalHonorarios, @DetalleHonorarios,
            @Rango, @ValorK, @UsuarioID
        );
        
        SET @CalculoID = SCOPE_IDENTITY();
        
        -- 8. Auditoría
        INSERT INTO AuditoriaCalculos (CalculoID, UsuarioID, Accion, DatosNuevos)
        VALUES (@CalculoID, @UsuarioID, 'CREAR', 
                (SELECT * FROM Calculos WHERE CalculoID = @CalculoID FOR JSON PATH, WITHOUT_ARRAY_WRAPPER));
        
        COMMIT TRANSACTION;
        
        -- 9. Retornar resultado
        SELECT 
            @CalculoID as calculoId,
            'basico' as tipoCalculo,
            GETDATE() as fechaCalculo,
            @DetalleHonorarios as detalleHonorarios,
            @TotalHonorarios as totalHonorarios,
            JSON_QUERY((
                SELECT 
                    @Rango as rango,
                    @ValorK as valorK,
                    @RangoCostoObra as rangoCostoObra,
                    (SELECT COUNT(*) FROM #DetalleHonorarios) as cantidadTareas
                FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
            )) as metadata;
            
        DROP TABLE #DetalleHonorarios;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        DROP TABLE IF EXISTS #DetalleHonorarios;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
```

### Otros Stored Procedures Necesarios

```sql
-- Obtener histórico de cálculos
CREATE PROCEDURE SP_OBTENER_HISTORICO_CALCULOS
    @UsuarioID INT,
    @FechaDesde DATE = NULL,
    @FechaHasta DATE = NULL,
    @TipoCalculo VARCHAR(50) = NULL
AS
BEGIN
    SELECT 
        CalculoID,
        TipoCalculo,
        FechaCalculo,
        NombreProyecto,
        Cliente,
        ValorObra,
        TotalHonorarios,
        Rango
    FROM Calculos
    WHERE UsuarioID = @UsuarioID
      AND Activo = 1
      AND (@FechaDesde IS NULL OR FechaCalculo >= @FechaDesde)
      AND (@FechaHasta IS NULL OR FechaCalculo <= @FechaHasta)
      AND (@TipoCalculo IS NULL OR TipoCalculo = @TipoCalculo)
    ORDER BY FechaCalculo DESC;
END
GO

-- Obtener cálculo por ID
CREATE PROCEDURE SP_OBTENER_CALCULO_POR_ID
    @CalculoID BIGINT,
    @UsuarioID INT
AS
BEGIN
    SELECT 
        CalculoID,
        TipoCalculo,
        FechaCalculo,
        NombreProyecto,
        Ubicacion,
        Cliente,
        ValorObra,
        Superficie,
        Tipologia,
        Complejidad,
        TareasProfesionales,
        DetalleHonorarios,
        TotalHonorarios,
        Rango,
        ValorK
    FROM Calculos
    WHERE CalculoID = @CalculoID
      AND UsuarioID = @UsuarioID
      AND Activo = 1;
END
GO

-- Obtener valor K vigente
CREATE PROCEDURE SP_OBTENER_VALOR_K
    @Fecha DATE = NULL
AS
BEGIN
    IF @Fecha IS NULL
        SET @Fecha = GETDATE();
        
    SELECT TOP 1
        ParametroID,
        Nombre,
        CAST(Valor AS DECIMAL(18,2)) AS ValorK,
        VigenciaDesde,
        VigenciaHasta
    FROM Parametros
    WHERE Nombre = 'VALOR_K'
      AND Activo = 1
      AND VigenciaDesde <= @Fecha
      AND (VigenciaHasta IS NULL OR VigenciaHasta >= @Fecha)
    ORDER BY VigenciaDesde DESC;
END
GO

-- Obtener coeficientes por rango
CREATE PROCEDURE SP_OBTENER_COEFICIENTES
    @TipoCalculo VARCHAR(50),
    @Rango CHAR(1),
    @Fecha DATE = NULL
AS
BEGIN
    IF @Fecha IS NULL
        SET @Fecha = GETDATE();
        
    SELECT 
        CoeficienteID,
        TipoTarea,
        Rango,
        CoeficienteObra,
        CoeficienteK,
        VigenciaDesde,
        VigenciaHasta
    FROM Coeficientes
    WHERE TipoCalculo = @TipoCalculo
      AND Rango = @Rango
      AND Activo = 1
      AND VigenciaDesde <= @Fecha
      AND (VigenciaHasta IS NULL OR VigenciaHasta >= @Fecha);
END
GO
```

---

## Referencias y Recursos

### Documentación
- Vercel Serverless Functions: https://vercel.com/docs/functions
- React + Vite: https://vitejs.dev/guide/
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

### Herramientas Útiles
- Thunder Client (VS Code): Testing de API
- Postman: Testing de API avanzado
- SQL Server Management Studio: Para Fase 2
- Swagger Editor: Documentación de API

### Consideraciones de Negocio
- Coeficientes y Valor K son datos sensibles de CPAU
- Deben actualizarse según legislación vigente
- Requieren validación y aprobación formal
- Histórico de cambios debe mantenerse para auditoría

---

## Conclusión

Esta arquitectura proporciona:

✅ **Protección inmediata** de propiedad intelectual (Fase 1)  
✅ **Facilidad de implementación** con cero infraestructura (Fase 1)  
✅ **Camino claro de migración** a backend empresarial (Fase 2)  
✅ **Costo cero** para maqueta (Vercel Free Plan)  
✅ **Escalabilidad futura** sin reescribir frontend  
✅ **Mantenibilidad** con código bien estructurado  
✅ **Testabilidad** con separación de concerns clara  

La clave está en el **contrato de API estable** que permite cambiar el backend sin impactar el frontend, protegiendo la inversión en desarrollo.

---

**Documento vivo - Última actualización:** 16/03/2026  
**Autor:** Equipo de Desarrollo CH2026  
**Próxima revisión:** Al finalizar Fase 1
