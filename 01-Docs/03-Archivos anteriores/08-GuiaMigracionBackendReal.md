# Guía de Migración a Backend Real - CH2026

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Fecha:** 16/03/2026  
**Versión:** 2.0 (AWS Lambda + Node.js)  
**Audiencia:** Equipo Backend, DevOps, Tech Lead  
**Stack:** AWS Lambda, Node.js, Express/Fastify, AWS RDS (MySQL/SQL Server)  

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Pre-requisitos](#pre-requisitos)
3. [Stack Tecnológico Recomendado](#stack-tecnológico-recomendado)
4. [Plan de Implementación](#plan-de-implementación)
5. [Diseño de Base de Datos](#diseño-de-base-de-datos)
6. [Stored Procedures](#stored-procedures)
7. [Backend API](#backend-api)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Proceso de Migración](#proceso-de-migración)
10. [Testing y Validación](#testing-y-validación)
11. [Monitoreo y Observabilidad](#monitoreo-y-observabilidad)
12. [Rollback Plan](#rollback-plan)

---

## Visión General

### Estado Actual (Fase 1)
```
Frontend (React) → Vercel Serverless Function → Cálculo en JavaScript
```
- ✅ Código de cálculo oculto
- ⚠️ Sin persistencia
- ⚠️ Sin autenticación real
- ⚠️ Sin auditoría

### Estado Objetivo (Fase 2)
```
Frontend (React) → AWS Lambda (Node.js) → Stored Procedures → AWS RDS (MySQL/SQL Server)
```
- ✅ Base de datos completa (AWS RDS)
- ✅ Autenticación JWT
- ✅ Auditoría total
- ✅ Escalabilidad serverless (AWS Lambda)
- ✅ Stack ya probado por el equipo

### Principio Fundamental
**El frontend NO cambia** (excepto 1 variable de entorno).  
El contrato de API permanece idéntico.

---

## Pre-requisitos

### Conocimientos Requeridos
- [ ] Node.js 18+ (requerido)
- [ ] Express.js o Fastify (framework API)
- [ ] AWS Lambda y API Gateway
- [ ] AWS RDS (MySQL o SQL Server según cliente)
- [ ] Stored Procedures y optimización de queries
- [ ] REST API design
- [ ] JWT Authentication
- [ ] Serverless Framework o SAM CLI
- [ ] CI/CD con AWS CodePipeline o GitHub Actions

### Accesos Necesarios
- [ ] Repositorio Git del proyecto
- [ ] AWS Account con permisos para:
  - [ ] AWS Lambda
  - [ ] API Gateway
  - [ ] RDS (MySQL/SQL Server)
  - [ ] CloudWatch Logs
  - [ ] Secrets Manager
  - [ ] IAM Roles
- [ ] RDS existente del cliente (si aplica)
- [ ] Dominio personalizado (ej: api.cpau-honorarios.com)
- [ ] AWS ACM para certificados SSL

### Información del Cliente
- [ ] Datos de conexión actuales (si existen)
- [ ] Políticas de seguridad corporativas
- [ ] Requisitos de auditoría
- [ ] SLA esperado
- [ ] Volumen de usuarios estimado

---

## Stack Tecnológico (Confirmado)

### AWS Lambda + Node.js Stack

**Stack ya implementado y funcionando en el equipo:**

```yaml
Backend:
  Platform: AWS Lambda
  Runtime: Node.js 18.x
  Framework: Express.js o Fastify (a elegir según proyecto)
  Language: JavaScript / TypeScript
  API Gateway: AWS API Gateway (REST o HTTP API)
  
Database:
  Platform: AWS RDS
  Engine: MySQL 8.0+ o SQL Server (según infraestructura del cliente)
  Connection: mysql2 / tedious (SQL Server driver)
  Query Builder: Queries directas o knex.js (opcional)
  
Authentication:
  Library: jsonwebtoken (JWT)
  Strategy: JWT Bearer Tokens
  Session: Stateless
  
Secrets Management:
  Service: AWS Secrets Manager
  Rotation: Automática cada 90 días
  
Caching:
  Service: AWS ElastiCache (Redis) - opcional para Fase 2
  Library: ioredis
  
Logging:
  Service: AWS CloudWatch Logs
  Library: winston o pino
  Structured: JSON format
  
Monitoring:
  Service: AWS CloudWatch Metrics + X-Ray
  Alerting: CloudWatch Alarms → SNS
  
Testing:
  Unit: Jest
  Integration: Supertest + jest
  Mocking: aws-sdk-mock
  
API Documentation:
  Tool: Swagger (swagger-jsdoc + swagger-ui-express)
  
Deployment:
  Tool: Serverless Framework o AWS SAM
  CI/CD: AWS CodePipeline o GitHub Actions
  IaC: CloudFormation (SAM) o Terraform
```

### Ventajas del Stack Elegido

✅ **Stack ya conocido:** El equipo tiene experiencia con AWS Lambda + Node.js  
✅ **Serverless:** Escalado automático, pago por uso  
✅ **Mismo lenguaje:** JavaScript tanto en frontend como backend  
✅ **Reutilización:** Lógica de cálculo actual puede adaptarse fácilmente  
✅ **RDS del cliente:** Se puede conectar directamente a la infraestructura existente  
✅ **Cold start aceptable:** Para aplicación de cálculo de honorarios (~500ms es tolerable)  
✅ **Costo optimizado:** Solo se paga por ejecuciones reales  

### Consideraciones Importantes

⚠️ **Cold Start:** Primera invocación puede tardar 500ms-2s. Mitigar con:  
   - Provisioned Concurrency (costo adicional)
   - Keep-warm ping cada 5 minutos
   - Optimización del bundle (< 10MB)

⚠️ **Tiempo máximo:** Lambda tiene timeout de 15 minutos (más que suficiente para cálculos)

⚠️ **Conexiones DB:** Lambda crea nueva conexión por invocación. Usar:  
   - RDS Proxy para connection pooling
   - O gestionar conexiones con singleton pattern

⚠️ **VPC:** Si RDS está en VPC privada, Lambda debe estar en misma VPC (aumenta cold start)

### Opción de Base de Datos

**El cliente ya tiene implementado uno de estos motores:**

#### Opción 1: MySQL 8.0+ (AWS RDS)
```yaml
Driver: mysql2
Connection Pool: Si (configurar max 5-10 conexiones por Lambda)
StoredProcs: Soporte completo con CALL statement
JSON Support: Nativo desde MySQL 5.7+
```

#### Opción 2: SQL Server (AWS RDS)
```yaml
Driver: tedious (bajo nivel) o mssql (wrapper)
Connection Pool: Si (crucial para Lambda)
StoredProcs: Soporte de primera clase con EXEC
JSON Support: FOR JSON PATH nativo
```

**Recomendación:** Usar el motor que el cliente **ya tiene implementado** para aprovechar:
- Infraestructura existente
- Conocimiento del equipo DBA
- Backups y procesos ya establecidos
- Reducir curva de aprendizaje

---

## Plan de Implementación

### Fase 2.1: Infraestructura y Base de Datos (Sprint 1-2)

**Duración Estimada:** 2-3 semanas

#### Tareas
- [ ] Provisionar AWS RDS (MySQL o SQL Server según cliente)
- [ ] Configurar Security Groups y VPC
- [ ] Habilitar backups automáticos (retention 7 días)
- [ ] Configurar RDS Proxy (opcional, recomendado para Lambda)
- [ ] Crear base de datos y esquema inicial
- [ ] Implementar stored procedures
- [ ] Poblar datos iniciales (Coeficientes, Parámetros)
- [ ] Testing de stored procedures
- [ ] Configurar CloudWatch Alarms para RDS
- [ ] Documentar manual de DBA

**Entregables:**
- Base de datos funcional
- Stored procedures probados manualmente
- Script de población de datos (`seed.sql`)
- Documentación de DB

---

### Fase 2.2: Backend API Core (Sprint 3-5)

**Duración Estimada:** 3-4 semanas

#### Tareas
- [ ] Setup de proyecto AWS Lambda con Serverless Framework o SAM
- [ ] Configurar handler principal (Express/Fastify)
- [ ] Configuración de conexión a RDS (con connection pooling)
- [ ] Implementar capa de datos (repositorios con stored procedures)
- [ ] Implementar servicios de negocio
- [ ] Implementar routes (Express/Fastify)
- [ ] Crear endpoint POST /api/v1/honorarios/calcular
- [ ] Validaciones de request (Joi o Zod)
- [ ] Manejo de errores global (middleware)
- [ ] Logging estructurado (CloudWatch Logs)
- [ ] Health check endpoint (GET /health)
- [ ] Swagger documentation (swagger-jsdoc)
- [ ] Configurar AWS API Gateway
- [ ] Configurar Lambda timeout y memory (recomendado: 512-1024MB, 30s timeout)
- [ ] Setup AWS Secrets Manager para credenciales DB

**Entregables:**
- API funcional con endpoint de cálculo
- Tests unitarios (cobertura >80%)
- Documentación Swagger
- Manual de deployment
- **Comunicación a Frontend:** Informar que VITE_API_URL debe incluir `/v1` y remover hardcode de honorariosService.js

---

### Fase 2.3: Autenticación y Seguridad (Sprint 6-7)

**Duración Estimada:** 2 semanas

#### Tareas
- [ ] Implementar JWT authentication (jsonwebtoken)
- [ ] Crear endpoints de login/logout
- [ ] Refresh token mechanism (guardar en DB)
- [ ] Role-based access control (middleware)
- [ ] Rate limiting (API Gateway throttling + custom middleware)
- [ ] CORS configuration (API Gateway)
- [ ] SQL injection protection (parameterized queries)
- [ ] Security headers middleware
- [ ] HTTPS enforcement (API Gateway + custom domain)
- [ ] Secrets management (AWS Secrets Manager)
- [ ] Lambda Authorizer para validar JWT

**Entregables:**
- Autenticación JWT funcional
- Tests de seguridad
- Documentación de auth flow
- Checklist de seguridad

---

### Fase 2.4: Funcionalidades Adicionales (Sprint 8-9)

**Duración Estimada:** 2 semanas

#### Tareas
- [ ] Endpoint: Guardar cálculo
- [ ] Endpoint: Obtener histórico
- [ ] Endpoint: Obtener cálculo por ID
- [ ] Endpoint: Obtener valor K
- [ ] Paginación en listados
- [ ] Filtros y búsquedas
- [ ] Exportación a PDF (si aplica)
- [ ] Auditoría de operaciones

**Entregables:**
- API completa con todos endpoints
- Tests de integración E2E
- Documentación actualizada

---

### Fase 2.5: Migración y Go-Live (Sprint 10)

**Duración Estimada:** 1 semana

#### Tareas
- [ ] Deploy de Lambda functions a producción (con alias prod)
- [ ] Configurar API Gateway custom domain (api.cpau-honorarios.com)
- [ ] Configurar SSL/TLS con AWS Certificate Manager
- [ ] Configuración de CloudWatch Logs retention (30 días)
- [ ] Configuración de CloudWatch Alarms (errores, latencia, throttling)
- [ ] Testing exhaustivo en producción
- [ ] Actualizar variable de entorno en frontend (VITE_API_URL)
- [ ] Deploy de frontend a Vercel
- [ ] Smoke testing post-deployment
- [ ] Monitoreo intensivo primeras 48hs (CloudWatch Dashboard)
- [ ] Retrospectiva

**Entregables:**
- Sistema en producción
- Dashboard de monitoreo activo
- Plan de rollback listo
- Documentación final

---

## Diseño de Base de Datos

### Esquema Relacional

**Nota:** El script a continuación está en sintaxis de **SQL Server**. Si el cliente utiliza **MySQL**, se proporcionará versión MySQL equivalente.

#### Versión SQL Server

```sql
-- ============================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS - CH2026
-- Sistema de Gestión de Cálculo de Honorarios CPAU
-- Motor: SQL Server / MySQL (versión SQL Server mostrada)
-- ============================================================================

USE master;
GO

-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'CH2026_Honorarios')
BEGIN
    CREATE DATABASE CH2026_Honorarios
    COLLATE Modern_Spanish_CI_AS;
END
GO

USE CH2026_Honorarios;
GO

-- ============================================================================
-- TABLA: Usuarios
-- ============================================================================
CREATE TABLE Usuarios (
    UsuarioID           INT IDENTITY(1,1) PRIMARY KEY,
    Email               NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash        NVARCHAR(255) NOT NULL,
    Nombre              NVARCHAR(200) NOT NULL,
    Apellido            NVARCHAR(200) NOT NULL,
    Matricula           NVARCHAR(50),
    Rol                 VARCHAR(50) NOT NULL DEFAULT 'professional',
    Activo              BIT NOT NULL DEFAULT 1,
    FechaCreacion       DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaModificacion   DATETIME2,
    UltimoLogin         DATETIME2,
    
    CONSTRAINT CHK_Rol CHECK (Rol IN ('admin', 'professional', 'guest'))
);

CREATE INDEX IX_Usuarios_Email ON Usuarios(Email);
CREATE INDEX IX_Usuarios_Matricula ON Usuarios(Matricula);

-- ============================================================================
-- TABLA: RefreshTokens
-- ============================================================================
CREATE TABLE RefreshTokens (
    TokenID             INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID           INT NOT NULL,
    Token               NVARCHAR(500) NOT NULL UNIQUE,
    FechaCreacion       DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaExpiracion     DATETIME2 NOT NULL,
    Revocado            BIT NOT NULL DEFAULT 0,
    ReemplazadoPor      NVARCHAR(500),
    
    CONSTRAINT FK_RefreshTokens_Usuarios FOREIGN KEY (UsuarioID) 
        REFERENCES Usuarios(UsuarioID) ON DELETE CASCADE
);

CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IX_RefreshTokens_UsuarioID ON RefreshTokens(UsuarioID);

-- ============================================================================
-- TABLA: Parametros
-- ============================================================================
CREATE TABLE Parametros (
    ParametroID         INT IDENTITY(1,1) PRIMARY KEY,
    Nombre              VARCHAR(100) NOT NULL,
    Valor               NVARCHAR(500) NOT NULL,
    Tipo                VARCHAR(50) NOT NULL,
    Descripcion         NVARCHAR(500),
    VigenciaDesde       DATE NOT NULL,
    VigenciaHasta       DATE,
    Activo              BIT NOT NULL DEFAULT 1,
    CreadoPor           INT,
    FechaCreacion       DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPor       INT,
    FechaModificacion   DATETIME2,
    
    CONSTRAINT UQ_Parametros_Nombre_Vigencia UNIQUE (Nombre, VigenciaDesde),
    CONSTRAINT CHK_Parametros_Tipo CHECK (Tipo IN ('DECIMAL', 'STRING', 'INTEGER', 'DATE', 'BOOLEAN'))
);

CREATE INDEX IX_Parametros_Nombre ON Parametros(Nombre);
CREATE INDEX IX_Parametros_Vigencia ON Parametros(VigenciaDesde, VigenciaHasta);

-- ============================================================================
-- TABLA: Coeficientes
-- ============================================================================
CREATE TABLE Coeficientes (
    CoeficienteID       INT IDENTITY(1,1) PRIMARY KEY,
    TipoCalculo         VARCHAR(50) NOT NULL,
    TipoTarea           VARCHAR(100) NOT NULL,
    Rango               CHAR(1) NOT NULL,
    CoeficienteObra     DECIMAL(10,6),
    CoeficienteK        DECIMAL(10,6),
    VigenciaDesde       DATE NOT NULL,
    VigenciaHasta       DATE,
    Activo              BIT NOT NULL DEFAULT 1,
    CreadoPor           INT,
    FechaCreacion       DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPor       INT,
    FechaModificacion   DATETIME2,
    
    CONSTRAINT UQ_Coeficientes UNIQUE (TipoCalculo, TipoTarea, Rango, VigenciaDesde),
    CONSTRAINT CHK_Coeficientes_TipoCalculo CHECK (TipoCalculo IN ('basico', 'demoliciones', 'gerencia')),
    CONSTRAINT CHK_Coeficientes_Rango CHECK (Rango IN ('A', 'B', 'C', 'D')),
    CONSTRAINT CHK_Coeficientes_Valores CHECK (
        (CoeficienteObra IS NOT NULL AND CoeficienteObra >= 0) OR
        (CoeficienteK IS NOT NULL AND CoeficienteK >= 0)
    )
);

CREATE INDEX IX_Coeficientes_TipoCalculo_Rango ON Coeficientes(TipoCalculo, Rango);
CREATE INDEX IX_Coeficientes_Vigencia ON Coeficientes(VigenciaDesde, VigenciaHasta);

-- ============================================================================
-- TABLA: Calculos
-- ============================================================================
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
    
    -- Tareas seleccionadas (JSON)
    TareasProfesionales NVARCHAR(MAX) NOT NULL,
    
    -- Resultados
    TotalHonorarios     DECIMAL(18,2) NOT NULL,
    DetalleHonorarios   NVARCHAR(MAX) NOT NULL,
    Rango               CHAR(1) NOT NULL,
    ValorK              DECIMAL(18,2) NOT NULL,
    
    -- Metadata
    Notas               NVARCHAR(MAX),
    Etiquetas           NVARCHAR(500),
    
    --Audit
    Activo              BIT NOT NULL DEFAULT 1,
    CreadoPor           INT,
    FechaCreacion       DATETIME2 NOT NULL DEFAULT GETDATE(),
    ModificadoPor       INT,
    FechaModificacion   DATETIME2,
    
    CONSTRAINT FK_Calculos_Usuarios FOREIGN KEY (UsuarioID) 
        REFERENCES Usuarios(UsuarioID),
    CONSTRAINT CHK_Calculos_TipoCalculo CHECK (TipoCalculo IN ('basico', 'demoliciones', 'gerencia')),
    CONSTRAINT CHK_Calculos_Rango CHECK (Rango IN ('A', 'B', 'C', 'D')),
    CONSTRAINT CHK_Calculos_ValorObra CHECK (ValorObra > 0),
    CONSTRAINT CHK_Calculos_TotalHonorarios CHECK (TotalHonorarios >= 0),
    CONSTRAINT CHK_TareasProfesionales_IsJson CHECK (ISJSON(TareasProfesionales) = 1),
    CONSTRAINT CHK_DetalleHonorarios_IsJson CHECK (ISJSON(DetalleHonorarios) = 1)
);

CREATE INDEX IX_Calculos_UsuarioID ON Calculos(UsuarioID);
CREATE INDEX IX_Calculos_FechaCalculo ON Calculos(FechaCalculo DESC);
CREATE INDEX IX_Calculos_TipoCalculo ON Calculos(TipoCalculo);
CREATE INDEX IX_Calculos_UsuarioID_FechaCalculo ON Calculos(UsuarioID, FechaCalculo DESC);

-- ============================================================================
-- TABLA: AuditoriaCalculos
-- ============================================================================
CREATE TABLE AuditoriaCalculos (
    AuditoriaID         BIGINT IDENTITY(1,1) PRIMARY KEY,
    CalculoID           BIGINT,
    UsuarioID           INT,
    Accion              VARCHAR(50) NOT NULL,
    FechaAccion         DATETIME2 NOT NULL DEFAULT GETDATE(),
    IPAddress           VARCHAR(50),
    UserAgent           NVARCHAR(500),
    DatosAnteriores     NVARCHAR(MAX),
    DatosNuevos         NVARCHAR(MAX),
    
    CONSTRAINT FK_AuditoriaCalculos_Calculos FOREIGN KEY (CalculoID) 
        REFERENCES Calculos(CalculoID) ON DELETE CASCADE,
    CONSTRAINT FK_AuditoriaCalculos_Usuarios FOREIGN KEY (UsuarioID) 
        REFERENCES Usuarios(UsuarioID),
    CONSTRAINT CHK_Auditoria_Accion CHECK (Accion IN ('CREAR', 'MODIFICAR', 'ELIMINAR', 'CONSULTAR'))
);

CREATE INDEX IX_AuditoriaCalculos_CalculoID ON AuditoriaCalculos(CalculoID);
CREATE INDEX IX_AuditoriaCalculos_UsuarioID ON AuditoriaCalculos(UsuarioID);
CREATE INDEX IX_AuditoriaCalculos_FechaAccion ON AuditoriaCalculos(FechaAccion DESC);

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar Valor K
INSERT INTO Parametros (Nombre, Valor, Tipo, Descripcion, VigenciaDesde, Activo)
VALUES ('VALOR_K', '522181756.33', 'DECIMAL', 'Valor K para cálculo de honorarios CPAU', '2026-01-01', 1);

-- Insertar Coeficientes - Proyecto y Dirección
INSERT INTO Coeficientes (TipoCalculo, TipoTarea, Rango, CoeficienteObra, CoeficienteK, VigenciaDesde, Activo)
VALUES 
    ('basico', 'PROYECTO_DIRECCION', 'A', 0.14, 0, '2026-01-01', 1),
    ('basico', 'PROYECTO_DIRECCION', 'B', 0.08, 0.03, '2026-01-01', 1),
    ('basico', 'PROYECTO_DIRECCION', 'C', 0.06, 0.13, '2026-01-01', 1),
    ('basico', 'PROYECTO_DIRECCION', 'D', 0.04, 0.63, '2026-01-01', 1);

-- Insertar Coeficientes - Instalaciones
INSERT INTO Coeficientes (TipoCalculo, TipoTarea, Rango, CoeficienteObra, CoeficienteK, VigenciaDesde, Activo)
VALUES 
    ('basico', 'INSTALACIONES', 'A', 0.0023, 0, '2026-01-01', 1),
    ('basico', 'INSTALACIONES', 'B', 0.0012, 0, '2026-01-01', 1),
    ('basico', 'INSTALACIONES', 'C', 0.0008, 0, '2026-01-01', 1),
    ('basico', 'INSTALACIONES', 'D', 0.0004, 0, '2026-01-01', 1);

-- Insertar Coeficientes - Estructuras
INSERT INTO Coeficientes (TipoCalculo, TipoTarea, Rango, CoeficienteObra, CoeficienteK, VigenciaDesde, Activo)
VALUES 
    ('basico', 'ESTRUCTURAS', 'A', 0.0030, 0, '2026-01-01', 1),
    ('basico', 'ESTRUCTURAS', 'B', 0.0026, 0, '2026-01-01', 1),
    ('basico', 'ESTRUCTURAS', 'C', 0.0021, 0, '2026-01-01', 1),
    ('basico', 'ESTRUCTURAS', 'D', 0.0016, 0, '2026-01-01', 1);

GO

PRINT 'Base de datos CH2026_Honorarios creada exitosamente';
PRINT 'Tablas creadas: Usuarios, RefreshTokens, Parametros, Coeficientes, Calculos, AuditoriaCalculos';
PRINT 'Datos iniciales poblados: Valor K y Coeficientes';
```

---

### Diferencias MySQL vs SQL Server (Implementación)

#### Conexión y Drivers

**MySQL:**
```javascript
// package.json
"dependencies": {
  "mysql2": "^3.6.0"
}

// Llamada a stored procedure
const [rows] = await connection.query(
  'CALL SP_CALCULAR_HONORARIOS_BASICO(?, ?, ?, ?)',
  [param1, param2, param3, param4]
);
const resultado = rows[0][0];  // Primera fila del primer resultset
```

**SQL Server:**
```javascript
// package.json
"dependencies": {
  "mssql": "^10.0.0"
}

// Llamada a stored procedure
const pool = await sql.connect(config);
const result = await pool.request()
  .input('param1', sql.Int, param1)
  .input('param2', sql.Decimal(18,2), param2)
  .execute('SP_CALCULAR_HONORARIOS_BASICO');
  
const resultado = result.recordset[0];  // Primera fila
```

#### Sintaxis de Stored Procedures

**MySQL:**
```sql
DELIMITER //

CREATE PROCEDURE SP_CALCULAR_HONORARIOS_BASICO(
    IN p_UsuarioID INT,
    IN p_ValorObra DECIMAL(18,2),
    IN p_TareasJSON JSON,
    IN p_NombreProyecto VARCHAR(200)
)
BEGIN
    DECLARE v_CalculoID BIGINT;
    DECLARE v_TotalHonorarios DECIMAL(18,2);
    
    -- Lógica del cálculo
    -- ...
    
    -- Retornar resultado
    SELECT 
        v_CalculoID AS calculoId,
        v_TotalHonorarios AS totalHonorarios,
        'A' AS rango
    FROM DUAL;
END //

DELIMITER ;
```

**SQL Server:**
```sql
CREATE PROCEDURE SP_CALCULAR_HONORARIOS_BASICO
    @UsuarioID INT,
    @ValorObra DECIMAL(18,2),
    @TareasJSON NVARCHAR(MAX),
    @NombreProyecto NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CalculoID BIGINT;
    DECLARE @TotalHonorarios DECIMAL(18,2);
    
    -- Lógica del cálculo
    -- ...
    
    -- Retornar resultado
    SELECT 
        @CalculoID AS calculoId,
        @TotalHonorarios AS totalHonorarios,
        'A' AS rango;
END
```

#### Manejo de JSON

**MySQL:**
```sql
-- Validar JSON
SELECT JSON_VALID(p_TareasJSON);

-- Extraer valor
SELECT JSON_EXTRACT(p_TareasJSON, '$.obraProyecto');

-- Crear JSON
SELECT JSON_OBJECT(
    'calculoId', v_CalculoID,
    'total', v_Total
) INTO v_ResultadoJSON;
```

**SQL Server:**
```sql
-- Validar JSON
SELECT ISJSON(@TareasJSON);

-- Extraer valor
SELECT JSON_VALUE(@TareasJSON, '$.obraProyecto');

-- Crear JSON
SELECT 
    @CalculoID AS calculoId,
    @Total AS total
FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
```

#### Recomendación Final

**Usar SQL Server si:**
- ✅ El cliente ya tiene SQL Server implementado
- ✅ El equipo DBA tiene más experiencia con SQL Server
- ✅ Ya existe infraestructura de respaldos y mantenimiento
- ✅ Integración con otros sistemas Microsoft

**Usar MySQL si:**
- ✅ El cliente prefiere código abierto
- ✅ Menor costo de licenciamiento (AWS RDS MySQL es más económico)
- ✅ Mayor portabilidad entre clouds

**Ambos motores son completamente viables para este proyecto.**

---

### Diagrama ER

```
┌──────────────┐       ┌────────────────┐       ┌──────────────────┐
│  Usuarios    │←──────│ RefreshTokens  │       │ Parametros       │
│──────────────│       │────────────────│       │──────────────────│
│ UsuarioID PK │       │ TokenID PK     │       │ ParametroID PK   │
│ Email        │       │ UsuarioID FK   │       │ Nombre           │
│ PasswordHash │       │ Token          │       │ Valor            │
│ Nombre       │       │ FechaExpiracion│       │ Tipo             │
│ Rol          │       └────────────────┘       │ VigenciaDesde    │
└──────┬───────┘                                └──────────────────┘
       │
       │                                         ┌──────────────────┐
       │                                         │ Coeficientes     │
       │                                         │──────────────────│
       │                                         │ CoeficienteID PK │
       │                                         │ TipoCalculo      │
       │                                         │ TipoTarea        │
       │                                         │ Rango            │
       │                                         │ CoeficienteObra  │
       │                                         │ CoeficienteK     │
       │                                         │ VigenciaDesde    │
       │                                         └──────────────────┘
       │
       │         ┌──────────────────┐
       └────────►│ Calculos         │
                 │──────────────────│
                 │ CalculoID PK     │
                 │ UsuarioID FK     │◄─────┐
                 │ TipoCalculo      │      │
                 │ ValorObra        │      │
                 │ TotalHonorarios  │      │
                 │ DetalleHonorarios│      │
                 │ (JSON)           │      │
                 └────────┬─────────┘      │
                          │                │
                          │                │
                          │         ┌──────┴────────────────┐
                          └────────►│ AuditoriaCalculos     │
                                    │───────────────────────│
                                    │ AuditoriaID PK        │
                                    │ CalculoID FK          │
                                    │ UsuarioID FK          │
                                    │ Accion                │
                                    │ FechaAccion           │
                                    │ DatosAnteriores (JSON)│
                                    │ DatosNuevos (JSON)    │
                                    └───────────────────────┘
```

---

## Stored Procedures

Los stored procedures completos están documentados en [06-ArquitecturaBackendAPI.md](06-ArquitecturaBackendAPI.md), sección "Plan de Datos y Stored Procedures".

### SPs Principales a Implementar:

1. **SP_CALCULAR_HONORARIOS_BASICO** - Cálculo principal
2. **SP_OBTENER_HISTORICO_CALCULOS** - Listado paginado
3. **SP_OBTENER_CALCULO_POR_ID** - Detalle de cálculo
4. **SP_OBTENER_VALOR_K** - Valor K vigente
5. **SP_OBTENER_COEFICIENTES** - Coeficientes por rango
6. **SP_GUARDAR_CALCULO** - Persistir cálculo
7. **SP_AUDITORIA_REGISTRAR** - Log de auditoría

---

## Backend API

### Estructura de Proyecto (AWS Lambda + Node.js)

```
CH2026-Backend/
├── src/
│   ├── handlers/
│   │   ├── honorarios.handler.js      # Lambda handler principal
│   │   ├── auth.handler.js            # Handler de autenticación
│   │   └── parametros.handler.js      # Handler de parámetros
│   │
│   ├── routes/
│   │   ├── honorarios.routes.js       # Rutas de honorarios
│   │   ├── auth.routes.js             # Rutas de auth
│   │   └── parametros.routes.js       # Rutas de parámetros
│   │
│   ├── services/
│   │   ├── honorarios.service.js      # Lógica de negocio
│   │   ├── auth.service.js            # Lógica de autenticación
│   │   └── parametros.service.js      # Lógica de parámetros
│   │
│   ├── repositories/
│   │   ├── calculos.repository.js     # Acceso a datos (stored procedures)
│   │   ├── coeficientes.repository.js
│   │   └── usuarios.repository.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js         # Validación JWT
│   │   ├── error.middleware.js        # Manejo de errores
│   │   ├── logger.middleware.js       # Logging
│   │   └── validator.middleware.js    # Validación de schemas
│   │
│   ├── config/
│   │   ├── database.js                # Configuración DB (singleton)
│   │   ├── secrets.js                 # AWS Secrets Manager
│   │   └── constants.js               # Constantes
│   │
│   ├── utils/
│   │   ├── db-connection.js           # Connection pool helper
│   │   ├── response.helper.js         # Respuestas estandarizadas
│   │   └── jwt.helper.js              # Helpers JWT
│   │
│   ├── schemas/
│   │   ├── calculo.schema.js          # Validaciones Joi/Zod
│   │   └── auth.schema.js
│   │
│   └── app.js                         # Express/Fastify app setup
│
├── database/
│   ├── migrations/                    # Scripts SQL versionados
│   ├── stored-procedures/             # SPs SQL
│   │   ├── sp_calcular_honorarios.sql
│   │   ├── sp_obtener_historico.sql
│   │   └── ...
│   └── seeds/                         # Datos iniciales
│       └── initial-data.sql
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── repositories/
│   ├── integration/
│   │   └── api/
│   └── mocks/
│       └── aws-sdk.mock.js
│
├── serverless.yml                     # Serverless Framework config
│ (o template.yaml para SAM)
│
├── package.json
├── .env.example
├── .eslintrc.js
├── .gitignore
└── README.md
```

### Ejemplo de Controller (.NET)

```csharp
[ApiController]
[Route("api/v1/honorarios")]
[Authorize]
public class HonorariosController : ControllerBase
{
    private readonly IHonorariosService _honorariosService;
    private readonly ILogger<HonorariosController> _logger;

    public HonorariosController(
        IHonorariosService honorariosService,
        ILogger<HonorariosController> logger)
    {
        _honorariosService = honorariosService;
        _logger = logger;
    }

    [HttpPost("calcular")]
    [ProducesResponseType(typeof(CalculoResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CalcularHonorarios(
        [FromBody] CalculoRequest request)
    {
        try
        {
            // Validar request
            if (!ModelState.IsValid)
            {
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Error = "Datos inválidos",
                    Details = ModelState.Select(e => new
                    {
                        Field = e.Key,
                        Errors = e.Value?.Errors.Select(er => er.ErrorMessage)
                    })
                });
            }

            // Obtener usuario autenticado
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Ejecutar cálculo
            var resultado = await _honorariosService.CalcularHonorariosBasicoAsync(
                userId,
                request);

            // Log success
            _logger.LogInformation(
                "Cálculo exitoso. UsuarioID: {UserId}, CalculoID: {CalculoId}",
                userId,
                resultado.CalculoId);

            return Ok(new
            {
                Success = true,
                Data = resultado,
                Version = "1.0"
            });
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning(ex, "Validación fallida: {Message}", ex.Message);
            return BadRequest(new ErrorResponse
            {
                Success = false,
                Error = ex.Message,
                Details = new { Code = "VALIDATION_ERROR" }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al calcular honorarios");
            return StatusCode(500, new ErrorResponse
            {
                Success = false,
                Error = "Error interno al calcular honorarios",
                RequestId = HttpContext.TraceIdentifier
            });
        }
    }
}
```

---

## Autenticación y Seguridad

### JWT Configuration (Node.js)

```javascript
// Almacenar en AWS Secrets Manager
// Secret Name: CH2026/prod/jwt-secret
{
  "jwtSecret": "your-256-bit-secret-key-here-min-32-chars-generate-with-crypto",
  "jwtIssuer": "CH2026-API",
  "jwtAudience": "CH2026-Frontend",
  "jwtExpiryMinutes": 60,
  "refreshTokenExpiryDays": 7
}
```

```javascript
// src/config/secrets.js
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

let cachedSecrets = null;

async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;
  
  const secretName = process.env.SECRETS_NAME || 'CH2026/prod/jwt-secret';
  
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    cachedSecrets = JSON.parse(data.SecretString);
    return cachedSecrets;
  } catch (error) {
    console.error('Error obteniendo secrets:', error);
    throw error;
  }
}

module.exports = { getSecrets };
```

```javascript
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { getSecrets } = require('../config/secrets');
const { UnauthorizedError } = require('../utils/errors');

class AuthMiddleware {
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Token no proporcionado');
      }
      
      const token = authHeader.substring(7);
      const secrets = await getSecrets();
      
      // Verificar token
      const decoded = jwt.verify(token, secrets.jwtSecret, {
        issuer: secrets.jwtIssuer,
        audience: secrets.jwtAudience
      });
      
      // Agregar usuario al request
      req.user = {
        userId: decoded.sub,
        email: decoded.email,
        rol: decoded.rol
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        });
      }
      
      next(error);
    }
  }
  
  authorize(...rolesPermitidos) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'No autenticado'
        });
      }
      
      if (rolesPermitidos.length && !rolesPermitidos.includes(req.user.rol)) {
        return res.status(403).json({
          success: false,
          error: 'No autorizado',
          code: 'FORBIDDEN'
        });
      }
      
      next();
    };
  }
}

module.exports = new AuthMiddleware();
```

### Rate Limiting

**Nivel 1: API Gateway Throttling (AWS Console)**
```yaml
# En serverless.yml o template.yaml
provider:
  apiGateway:
    throttle:
      burstLimit: 100    # Máximo de requests simultáneos
      rateLimit: 50      # Requests por segundo
```

**Nivel 2: Custom Rate Limiting Middleware**
```javascript
// src/middleware/rate-limiter.middleware.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const RATE_LIMITS = {
  default: { window: 60, max: 60 },           // 60 req/min
  calcular: { window: 60, max: 20 },          // 20 req/min para cálculo
};

async function rateLimiter(req, res, next) {
  const userId = req.user?.userId || req.ip;
  const endpoint = req.path.includes('calcular') ? 'calcular' : 'default';
  const limit = RATE_LIMITS[endpoint];
  
  const key = `ratelimit:${endpoint}:${userId}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, limit.window);
  }
  
  const ttl = await redis.ttl(key);
  
  res.setHeader('X-RateLimit-Limit', limit.max);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit.max - current));
  res.setHeader('X-RateLimit-Reset', Date.now() + (ttl * 1000));
  
  if (current > limit.max) {
    return res.status(429).json({
      success: false,
      error: 'Demasiadas solicitudes',
      retryAfter: ttl
    });
  }
  
  next();
}

module.exports = rateLimiter;
```

### Configuración de Serverless Framework

```yaml
# serverless.yml
service: ch2026-honorarios-api

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  stage: ${opt:stage, 'dev'}
  region: us-east-1
  memorySize: 1024
  timeout: 30
  
  # Variables de entorno
  environment:
    STAGE: ${self:provider.stage}
    DB_HOST: ${ssm:/ch2026/${self:provider.stage}/db-host}
    DB_NAME: ${ssm:/ch2026/${self:provider.stage}/db-name}
    DB_USER: ${ssm:/ch2026/${self:provider.stage}/db-user~true}
    DB_PASSWORD: ${ssm:/ch2026/${self:provider.stage}/db-password~true}
    SECRETS_NAME: CH2026/${self:provider.stage}/jwt-secret
    
  # VPC Configuration (si RDS está en VPC privada)
  vpc:
    securityGroupIds:
      - ${ssm:/ch2026/${self:provider.stage}/security-group-id}
    subnetIds:
      - ${ssm:/ch2026/${self:provider.stage}/subnet-1}
      - ${ssm:/ch2026/${self:provider.stage}/subnet-2}
  
  # IAM Permissions
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - secretsmanager:GetSecretValue
          Resource: 
            - arn:aws:secretsmanager:us-east-1:*:secret:CH2026/*
        - Effect: Allow
          Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
          Resource: '*'

  # API Gateway
  apiGateway:
    shouldStartNameWithService: true
    throttle:
      burstLimit: 100
      rateLimit: 50

functions:
  honorarios:
    handler: src/handlers/honorarios.handler.handler
    events:
      - http:
          path: /api/v1/honorarios/{proxy+}
          method: ANY
          cors:
            origin: '*'
            headers:
              - Content-Type
              - Authorization
            allowCredentials: false
    # Provisioned Concurrency (opcional, para evitar cold starts)
    # provisionedConcurrency: 2

  auth:
    handler: src/handlers/auth.handler.handler
    events:
      - http:
          path: /api/v1/auth/{proxy+}
          method: ANY
          cors: true

  health:
    handler: src/handlers/health.handler.handler
    events:
      - http:
          path: /health
          method: GET

plugins:
  - serverless-offline
  - serverless-plugin-warmup  # Evita cold starts

package:
  exclude:
    - node_modules/**
    - tests/**
    - .git/**
  include:
    - src/**
```

### Gestión de Conexiones a Base de Datos (CRÍTICO para Lambda)

**Problema:** Lambda crea una nueva instancia por cada invocación concurrente. Sin gestión adecuada, cada Lambda intentará crear su propia conexión, saturando el connection pool de RDS.

**Solución 1: RDS Proxy (Recomendado para producción)**

```yaml
# En serverless.yml, agregar:
provider:
  environment:
    DB_HOST: your-rds-proxy-endpoint.proxy-xxx.us-east-1.rds.amazonaws.com
    USE_IAM_AUTH: true
```

RDS Proxy maneja automáticamente el connection pooling y multiplexing.

**Solución 2: Connection Singleton Pattern (Alternativa económica)**

```javascript
// src/config/database.js
const mysql = require('mysql2/promise');

let pool = null;

async function getConnection() {
  if (!pool) {
    console.log('Creando nuevo connection pool...');
    
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
      
      // Configuración crítica para Lambda
      waitForConnections: true,
      connectionLimit: 5,        // BAJO: Lambda crea muchas instancias
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      
      // Timeouts
      connectTimeout: 10000,
      acquireTimeout: 10000
    });
    
    // Test de conexión
    try {
      const conn = await pool.getConnection();
      console.log('✅ Conexión a DB establecida');
      conn.release();
    } catch (error) {
      console.error('❌ Error conectando a DB:', error);
      throw error;
    }
  }
  
  return pool.getConnection();
}

// Para SQL Server, usar tedious/mssql:
// const sql = require('mssql');
// 
// async function getConnection() {
//   if (!pool) {
//     pool = await sql.connect({
//       server: process.env.DB_HOST,
//       database: process.env.DB_NAME,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       options: {
//         encrypt: true,
//         trustServerCertificate: false,
//         connectTimeout: 30000,
//       },
//       pool: {
//         max: 5,
//         min: 0,
//         idleTimeoutMillis: 30000
//       }
//     });
//   }
//   return pool;
// }

module.exports = { getConnection };
```

**Keep-Warm Strategy (Evitar cold starts):**

```javascript
// src/handlers/warmup.handler.js
module.exports.handler = async (event) => {
  if (event.source === 'serverless-plugin-warmup') {
    console.log('WarmUp - Lambda is warm!');
    return { statusCode: 200, body: 'Lambda warmed' };
  }
  
  // Código normal...
};
```

```yaml
# En serverless.yml
plugins:
  - serverless-plugin-warmup

custom:
  warmup:
    default:
      enabled: true
      events:
        - schedule: 'cron(0/5 8-20 ? * MON-FRI *)'  # Cada 5 min, horario laboral
      concurrency: 1
```

---

## Proceso de Migración

### Checklist Pre-Migración

- [ ] Backend desplegado y funcionando
- [ ] Base de datos poblada con datos reales
- [ ] Todos los tests E2E pasan
- [ ] Documentación actualizada
- [ ] Monitoreo configurado
- [ ] Logs centralizados funcionando
- [ ] Backups automáticos configurados
- [ ] Plan de rollback revisado y aprobado
- [ ] Equipo de soporte notificado
- [ ] Cliente informado de ventana de mantenimiento
- [ ] **Frontend refactorizado:** `/v1` movido de hardcode a variable de entorno VITE_API_URL

### Pasos de Migración

#### 1. Backend en Producción (Día -7)

**Con Serverless Framework:**
```bash
# Deploy a producción
git tag v2.0.0-backend
git push origin v2.0.0-backend

cd CH2026-Backend

# Deploy con Serverless Framework
serverless deploy --stage prod --region us-east-1

# O con AWS SAM
sam build
sam deploy --stack-name ch2026-api-prod --guided

# Verificar
curl https://api.cpau-honorarios.com/health
curl https://api.cpau-honorarios.com/api/v1/parametros/valor-k
```

**Salida esperada del deploy:**
```
Service deployed to stack ch2026-api-prod (112s)

endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/prod/api/v1/honorarios/calcular
  GET - https://abc123.execute-api.us-east-1.amazonaws.com/prod/health
  
functions:
  honorarios: ch2026-api-prod-honorarios (15 MB)
  auth: ch2026-api-prod-auth (12 MB)
```

#### 2. Testing Paralelo (Día -6 a -2)
- Ejecutar ambos sistemas en paralelo
- Comparar resultados (serverless vs backend real)
- Monitorear performance
- Ajustar optimizaciones

#### 3. Migración Frontend (Día 0)

**3.1. Actualizar variable de entorno**

⚠️ **IMPORTANTE - Refactorización de Versión de API:**  
En la maqueta actual (Fase 1), el `/v1` está hardcodeado en `honorariosService.js`.  
Al migrar al backend real, **mover el versionado a la variable de entorno** para mayor flexibilidad:

```bash
# .env.production - ANTES (Maqueta - Fase 1)
VITE_API_URL=/api
# Nota: /v1 hardcodeado en honorariosService.js línea ~32

# .env.production - DESPUÉS (Backend Real - Fase 2)
VITE_API_URL=https://api.cpau-honorarios.com/v1
# Nota: /v1 ahora está en la variable, remover hardcodeo de honorariosService.js
```

**Cambio requerido en código:**
```javascript
// App/Frontend/src/services/honorariosService.js

// ANTES (Fase 1 - Maqueta):
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const response = await fetch(`${API_BASE_URL}/v1/honorarios/calcular`, { ... });

// DESPUÉS (Fase 2 - Backend Real):
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const response = await fetch(`${API_BASE_URL}/honorarios/calcular`, { ... });
// El /v1 ya viene en VITE_API_URL
```

**Ventajas de mover /v1 a variable de entorno:**
- ✅ Permite cambiar versión de API sin tocar código
- ✅ Facilita pruebas de diferentes versiones (v1, v2, beta)
- ✅ Configuración centralizada por ambiente

**3.2. Deploy frontend**
```bash
git checkout main
git merge release/v2.0.0
git tag v2.0.0-frontend
git push origin v2.0.0-frontend
git push origin main

# Vercel desplegará automáticamente
```

**3.3. Smoke Testing** (15 minutos)
- [ ] Login funciona
- [ ] Wizard completo funciona
- [ ] Cálculo se ejecuta correctamente
- [ ] Resultados son idénticos a versión anterior
- [ ] No hay errores en console
- [ ] No hay errores en logs de backend

**3.4. Monitoreo Intensivo** (48 horas)
- Verificar errores cada 2 horas
- Revisar métricas de performance
- Monitorear uso de DB
- Verificar que usuarios no reportan problemas

#### 4. Post-Migración (Día +1 a +7)
- [ ] Deshabilitar serverless functions antiguas (Día +3)
- [ ] Eliminar código obsoleto de frontend (Día +7)
- [ ] Actualizar documentación (Día +7)
- [ ] Retrospectiva de migración (Día +7)

---

## Testing y Validación

### Test de Equivalencia de Resultados

**Objetivo:** Verificar que Backend real produce resultados idénticos a Serverless.

```javascript
// script: test-equivalence.js
const testCases = [
  { valorObra: 10000000, tareas: { obraProyecto: true }, expectedRango: 'A' },
  { valorObra: 100000000, tareas: { obraProyecto: true }, expectedRango: 'B' },
  { valorObra: 1000000000, tareas: { obraProyecto: true }, expectedRango: 'C' },
  { valorObra: 20000000000, tareas: { obraProyecto: true }, expectedRango: 'D' },
];

for (const testCase of testCases) {
  // Call serverless
  const resultServerless = await fetchServerless(testCase);
  
  // Call backend real
  const resultBackend = await fetchBackend(testCase);
  
  // Compare
  assert.equal(resultBackend.rango, resultServerless.rango);
  assert.equal(
    resultBackend.totalHonorarios.toFixed(2), 
    resultServerless.totalHonorarios.toFixed(2)
  );
}
```

---

## Monitoreo y Observabilidad

### Métricas Clave (KPIs)

| Métrica | Objetivo | Alerta Si |
|---------|----------|-----------|
| Response Time (p95) | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Availability | > 99.9% | < 99% |
| DB Connection Pool | < 80% uso | > 90% uso |
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |

### Logs Importantes

```javascript
// Configuración de winston para CloudWatch
// src/config/logger.js
const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'ch2026-api',
    stage: process.env.STAGE 
  },
  transports: [
    // Console (para desarrollo local)
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    
    // CloudWatch (para AWS)
    new WinstonCloudWatch({
      logGroupName: `/aws/lambda/ch2026-api-${process.env.STAGE}`,
      logStreamName: () => {
        const date = new Date().toISOString().split('T')[0];
        return `${date}-${process.env.AWS_LAMBDA_FUNCTION_NAME}`;
      },
      awsRegion: 'us-east-1',
      jsonMessage: true
    })
  ]
});

module.exports = logger;

// Uso en servicios:
const logger = require('../config/logger');

logger.info('Cálculo completado', {
  userId: 123,
  calculoId: 456,
  valorObra: 10000000,
  totalHonorarios: 1400000,
  duration: 234  // ms
});

logger.error('Error al calcular honorarios', {
  userId: 123,
  error: error.message,
  stack: error.stack
});
```

### Dashboard de Monitoreo

**Herramientas recomendadas (AWS):**
- AWS CloudWatch Logs + Insights
- AWS X-Ray para tracing distribuido
- CloudWatch Dashboard personalizado
- Grafana + CloudWatch datasource (opcional)
- AWS Lambda Insights

**Paneles mínimos:**
1. Request Rate (req/sec)
2. Response Time Distribution
3. Error Rate over time
4. Database Query Performance
5. Top 10 Slowest Endpoints

---

## Rollback Plan

### Escenarios de Rollback

#### Escenario 1: Errores Críticos en Backend
**Síntomas:** Error rate > 5%, usuarios no pueden calcular

**Acción:**
```bash
# 1. Revertir variable de entorno en Vercel
VITE_API_URL=/api  # Volver a serverless

# 2. Redeploy frontend
git revert HEAD
git push origin main

# 3. Tiempo de downtime: ~5 minutos
```

#### Escenario 2: Performance Inaceptable
**Síntomas:** Response time > 3 segundos consistentemente

**Acción:**
- Identificar query lenta en DB
- Optimizar SP o agregar índices
- Si no se puede resolver rápido: rollback temporal

#### Escenario 3: Problemas de Autenticación
**Síntomas:** Usuarios no pueden autenticarse

**Acción:**
- Verificar JWT secret y configuración
- Revisar logs de auth
- Si persiste: rollback y debug offline

### Criterios de Rollback

**Ejecutar rollback SI:**
- Error rate > 5% por más de 15 minutos
- Response time p95 > 5 segundos
- Usuarios críticos bloqueados
- Pérdida de datos detectada
- Vulnerabilidad de seguridad descubierta

**NO ejecutar rollback SI:**
- Errores aislados (< 1% error rate)
- Performance degradada pero aceptable (< 2 seg)
- Usuarios pueden continuar trabajando

---

## Contactos y Responsables

| Rol | Nombre | Email | Teléfono |
|-----|--------|-------|----------|
| Tech Lead | [Nombre] | tech@example.com | +54 11... |
| Backend Dev | [Nombre] | backend@example.com | +54 11... |
| DevOps | [Nombre] | devops@example.com | +54 11... |
| DBA | [Nombre] | dba@example.com | +54 11... |
| QA Lead | [Nombre] | qa@example.com | +54 11... |
| Product Owner | [Nombre] | po@example.com | +54 11... |

---

## Recursos Adicionales

### Documentación de Referencia
- [Arquitectura Backend API](06-ArquitecturaBackendAPI.md)
- [Contrato de API](07-ContratoAPI-Honorarios.md)
- [Tickets de Implementación](Tareas/260316-TicketsBackendCalculo.txt)

### Enlaces Útiles
- Repositorio Git: [URL]
- AWS Lambda Console: https://console.aws.amazon.com/lambda
- AWS RDS Console: https://console.aws.amazon.com/rds
- CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/logs
- API Gateway: https://console.aws.amazon.com/apigateway
- Documentación Swagger: https://api.cpau-honorarios.com/api-docs
- Base de Conocimiento: [URL]

### Recursos de Referencia AWS
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [RDS Proxy for Lambda](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Node.js Driver - MySQL2](https://github.com/sidorares/node-mysql2)
- [Node.js Driver - MSSQL](https://github.com/tediousjs/node-mssql)

---

## Notas de Implementación

### Stack Confirmado por el Cliente
Este documento ha sido actualizado para reflejar el **stack específico ya implementado** por el equipo:
- ✅ **AWS Lambda** con Node.js 18.x
- ✅ **Express o Fastify** para routing
- ✅ **AWS RDS** con MySQL o SQL Server (según infraestructura existente del cliente)
- ✅ Experiencia previa del equipo con este stack

### Ventajas del Enfoque Serverless
1. **Escalado automático:** Lambda escala de 0 a miles de invocaciones concurrentes
2. **Pago por uso:** Solo se cobra por tiempo de ejecución real (no por servidor idle)
3. **Alta disponibilidad:** Multi-AZ por defecto
4. **Zero maintenance:** AWS gestiona infraestructura, patching, actualizaciones
5. **Integración nativa:** Con todo el ecosistema AWS

### Deuda Técnica de Fase 1 (Maqueta Serverless)
Durante la implementación de la **maqueta serverless** (Fase 1, solo para ocultar lógica de cálculo), se tomaron decisiones temporales que deben resolverse en la migración a backend real (Fase 2):

⚠️ **Hardcode de Versión de API:**
- **Ubicación:** `App/Frontend/src/services/honorariosService.js` línea ~32
- **Problema:** El `/v1` está hardcodeado en la URL del endpoint
- **Código actual:** `fetch(\`\${API_BASE_URL}/v1/honorarios/calcular\`)`
- **Solución en Fase 2:** Mover `/v1` a la variable de entorno `VITE_API_URL`
- **Beneficio:** Permite cambiar versión de API sin tocar código, configuración por ambiente

**Justificación temporal:**  
En maqueta no hay versionado real de API, todo es versión 1. Al migrar a backend con DB y posibilidad de múltiples versiones (v1, v2), esto debe estar en configuración.

**Cambio requerido al migrar:**
```javascript
// ANTES (Maqueta):
VITE_API_URL=/api
const response = await fetch(`${API_BASE_URL}/v1/honorarios/calcular`);

// DESPUÉS (Backend Real):
VITE_API_URL=https://api.cpau-honorarios.com/v1
const response = await fetch(`${API_BASE_URL}/honorarios/calcular`);
```

---

**Este documento será actualizado conforme avance la implementación del backend real.**

**Última actualización:** 16/03/2026  
**Próxima revisión:** Al iniciar desarrollo de Fase 2  
**Versión:** 2.0 - Actualizado con stack AWS Lambda + Node.js
