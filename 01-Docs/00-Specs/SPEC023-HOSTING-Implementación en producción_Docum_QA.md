# Documentación Configuración Lambda QA - cpau-ch2026-api-qa

**Fecha Documentación:** 24/07/2026  
**Estado:** Ambiente operativo  
**Propósito:** Referencia para configuración de Lambda PROD

---

## 1. Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre Función** | `cpau-ch2026-api-qa` |
| **ARN** | `arn:aws:lambda:us-east-1:848685497128:function:cpau-ch2026-api-qa` |
| **Runtime** | Node.js 24.x |
| **Architecture** | x86_64 |
| **Handler** | `lambda.handler` |
| **Estado** | Active |
| **Package Type** | Zip |
| **Última Modificación** | 23/07/2026 21:36:28 UTC |

---

## 2. Configuración de Recursos

| Recurso | Valor | Notas |
|---------|-------|-------|
| **Memory** | 1024 MB | Suficiente para Puppeteer + Chromium |
| **Timeout** | 30 segundos | Permite generación PDF con cold start |
| **Ephemeral Storage** | 1024 MB | Espacio temporal para Chromium |
| **Code Size** | 83,472,014 bytes (~79.6 MB) | Incluye Puppeteer + Chromium |
| **Reserved Concurrency** | No configurado | ⚠️ Recomendado: 5 (para RDS compartida) |

**Nota:** El tamaño excede el límite de 50 MB para upload directo. Se usa AWS CLI para deployment.

---

## 3. Variables de Entorno

| Variable | Valor | Propósito |
|----------|-------|-----------|
| `NODE_ENV` | `qa` | Identifica ambiente de ejecución |
| `DB_HOST` | `gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com` | Endpoint RDS MySQL |
| `DB_PORT` | `3306` | Puerto MySQL |
| `DB_NAME` | `cpau_ch_qa` | Base de datos QA |
| `DB_USER` | `cpau_qa` | Usuario de conexión DB |
| `DB_PASSWORD` | `***` (hardcodeado) | ⚠️ **PROBLEMA SEGURIDAD**: Debería usar Secrets Manager |
| `FRONTEND_URL` | `https://ch2026-qa.neosisweb.ar` | URL frontend para CORS |
| `REQUIRE_JWT` | `false` | Autenticación JWT deshabilitada en QA |

### ⚠️ Recomendaciones de Seguridad:

**Para PRODUCCIÓN**, se debe:
1. **Eliminar `DB_PASSWORD` de variables de entorno**
2. **Crear secret en AWS Secrets Manager:**
   ```bash
   aws secretsmanager create-secret \
     --name cpau-ch-prod-db-credentials \
     --secret-string '{"username":"cpau_prod","password":"[SECURE_PASSWORD]","host":"[RDS_ENDPOINT]","port":3306,"database":"cpau_ch_production"}'
   ```
3. **Agregar variable `SECRET_NAME=cpau-ch-prod-db-credentials`**
4. **Modificar código en `src/config/db.js` para leer de Secrets Manager**

---

## 4. Configuración VPC y Networking

### VPC Configuration

| Propiedad | Valor |
|-----------|-------|
| **VPC ID** | `vpc-066d4888f63caa083` |
| **Subnets** | `subnet-060c328529aebf1ff`, `subnet-022b80884a384c3c0` |
| **Security Groups** | `sg-0db09a975dc27c479` |
| **IPv6 Dual Stack** | Deshabilitado |

**Propósito:** Lambda necesita acceso a RDS MySQL que está en VPC privada.

### Security Group `sg-0db09a975dc27c479`

**Reglas Outbound esperadas:**
- Protocol: TCP
- Port: 3306
- Destination: Security Group de RDS
- Description: "Lambda access to MySQL RDS"

**Verificar con:**
```bash
aws ec2 describe-security-groups --group-ids sg-0db09a975dc27c479
```

---

## 5. IAM y Permisos

### Execution Role

| Propiedad | Valor |
|-----------|-------|
| **Role Name** | `cpau-ch2026-api-qa-role-nlvvrei9` |
| **Role ARN** | `arn:aws:iam::848685497128:role/service-role/cpau-ch2026-api-qa-role-nlvvrei9` |
| **Tipo** | Service Role (Lambda) |

### Policies Adjuntas (Esperadas)

| Policy | Propósito |
|--------|-----------|
| `AWSLambdaBasicExecutionRole` | Escribir logs en CloudWatch |
| `AWSLambdaVPCAccessExecutionRole` | Crear ENIs para acceso VPC |
| ⚠️ **Faltante:** Secrets Manager | Leer credenciales de DB (requerido para PROD) |

**Verificar policies:**
```bash
aws iam list-attached-role-policies --role-name cpau-ch2026-api-qa-role-nlvvrei9
```

**Para PRODUCCIÓN agregar:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:us-east-1:848685497128:secret:cpau-ch-prod-*"
    }
  ]
}
```

---

## 6. CloudWatch Logs y Monitoreo

| Propiedad | Valor |
|-----------|-------|
| **Log Group** | `/aws/lambda/cpau-ch2026-api-qa` |
| **Log Format** | Text |
| **Retención** | 7 días (estimado - verificar en consola) |
| **Tracing** | PassThrough (X-Ray deshabilitado) |

### Queries Útiles CloudWatch Insights

**1. Errores recientes:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 20
```

**2. Duración promedio de generación PDF:**
```
fields @timestamp, @message
| filter @message like /\[PDF\] Generado en/
| parse @message /\[PDF\] Generado en (?<duration>\d+)ms/
| stats avg(duration) as avg_duration, max(duration) as max_duration, count() as total_pdfs
```

**3. Cold starts:**
```
fields @timestamp, @message
| filter @message like /INIT_START/
| stats count() as cold_starts
```

---

## 7. API Gateway Asociado

| Propiedad | Valor |
|-----------|-------|
| **API Name** | `CH2026-Backend-API-QA` (estimado) |
| **API Type** | HTTP API (API Gateway v2) |
| **Stage** | `$default` |
| **Custom Domain** | `cpau-ch2026-api-qa.neosisweb.ar` |
| **URL Base** | `https://cpau-ch2026-api-qa.neosisweb.ar/api` |

### Routes Configuradas

| Método | Ruta | Integration |
|--------|------|-------------|
| `ANY` | `/api/{proxy+}` | Lambda Proxy Integration |
| `ANY` | `/api` | Lambda Proxy Integration |

### CORS Configuration

```
Access-Control-Allow-Origin: 
  - https://ch2026-qa.neosisweb.ar
  - http://localhost:5173

Access-Control-Allow-Headers:
  - Content-Type
  - Authorization
  - X-Requested-With
  - X-API-Version

Access-Control-Allow-Methods:
  - GET, POST, PUT, DELETE, OPTIONS

Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

**Obtener API ID:**
```bash
aws apigatewayv2 get-apis --query 'Items[?Name==`CH2026-Backend-API-QA`].[ApiId,ApiEndpoint]'
```

---

## 8. Base de Datos RDS MySQL

| Propiedad | Valor |
|-----------|-------|
| **Endpoint** | `gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com` |
| **Port** | `3306` |
| **Database** | `cpau_ch_qa` |
| **Usuario** | `cpau_qa` |
| **Password** | `***` (en variable de entorno - NO seguro) |
| **Connection Pool** | 5 conexiones (configurado en código) |
| **Charset** | utf8mb4 |
| **Timezone** | UTC |

### Connection Pool Settings (en código)

```javascript
// src/config/db.js
{
  connectionLimit: 5,          // BAJO para Lambda
  maxIdle: 2,
  idleTimeout: 60000,          // 60 segundos
  queueLimit: 0,
  enableKeepAlive: true,
  connectTimeout: 10000         // 10 segundos
}
```

**Justificación:** Con Reserved Concurrency de 5 instancias Lambda y 5 conexiones por pool = 25 conexiones máx, dejando margen para producción (75 conexiones).

---

## 9. Deployment

### Método Actual

**Comando:**
```bash
npm run upload:qa
```

**Equivalente:**
```bash
# 1. Generar paquete
npm run package

# 2. Upload
aws lambda update-function-code \
  --function-name cpau-ch2026-api-qa \
  --zip-file fileb://ch2026-backend-api-lambda.zip
```

### Proceso de Empaquetado

El script `create-deployment-package.js` ejecuta:

1. Crea carpeta temporal
2. Copia archivos necesarios: `lambda.js`, `app.js`, `src/`, `package.json`
3. Instala dependencias de producción: `npm install --production`
4. Genera ZIP (~79.6 MB)
5. Limpia temporales

**Archivos excluidos:**
- `.git/`, `node_modules/aws-sdk/`, `*.md`, `test-*.js`, `.env`

### Deployment Info (último)

```json
{
  "timestamp": "2026-07-23T21:32:00.595Z",
  "version": "1.0.0",
  "zipFile": "ch2026-backend-api-lambda.zip",
  "zipSizeMB": "79.61",
  "sha256": "14e7edfaa6ef569b0c82db6fb25f3b4989861f5afb45f3dd7229f5117725ed0a",
  "nodeVersion": "v22.18.0",
  "platform": "win32"
}
```

---

## 10. Dependencias Críticas

### Principales (package.json)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `@sparticuz/chromium` | ^149.0.0 | Binario Chromium optimizado para Lambda |
| `puppeteer-core` | ^25.1.0 | Control de Chromium headless |
| `serverless-http` | ^3.2.0 | Wrapper Express → Lambda |
| `express` | ^5.2.1 | Framework HTTP |
| `mysql2` | ^3.16.0 | Driver MySQL con promises |
| `handlebars` | ^4.7.9 | Motor de templates para PDF |
| `bcryptjs` | ^3.0.3 | Hash de passwords |
| `jsonwebtoken` | ^9.0.3 | Autenticación JWT |
| `@aws-sdk/client-secrets-manager` | ^3.700.0 | Leer secrets de AWS |

**Tamaño total con dependencias:** ~79.6 MB (incluye Chromium ~50 MB)

---

## 11. Configuración Específica Lambda

### Binary Response Types (en código)

```javascript
// lambda.js
module.exports.handler = serverless(app, {
    binary: ['image/*', 'application/pdf']
});
```

**Propósito:** Permitir que Lambda devuelva PDFs y imágenes como binarios (no base64).

### Handler Entry Point

```javascript
// lambda.js
const serverless = require('serverless-http');
const app = require('./app');

module.exports.handler = serverless(app, {
    binary: ['image/*', 'application/pdf']
});
```

**Flujo:**
1. API Gateway recibe request HTTP
2. Invoca Lambda con evento proxy
3. `serverless-http` convierte evento → request Express
4. `app.js` procesa con Express
5. `serverless-http` convierte response → formato Lambda
6. API Gateway devuelve HTTP response al cliente

---

## 12. Endpoints Disponibles

### Públicos (sin auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (DB + sistema) |
| `GET` | `/api/parametros` | Obtener parámetros del sistema |
| `GET` | `/api/tareas-profesionales` | Listar tareas profesionales |

### Protegidos (con JWT - si `REQUIRE_JWT=true`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/calculos` | Crear nuevo cálculo |
| `POST` | `/api/calculos/exportar-pdf` | Generar PDF del certificado |
| `POST` | `/api/auth/login` | Login usuario |
| `POST` | `/api/auth/refresh` | Refresh JWT token |

### Admin

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/admin/templates` | Listar plantillas PDF |
| `POST` | `/api/admin/templates` | Crear plantilla PDF |
| `PUT` | `/api/admin/templates/:id` | Actualizar plantilla |

---

## 13. Troubleshooting Common Issues

### Error: "Cannot connect to MySQL"

**Causa:** VPC/Security Groups mal configurados

**Solución:**
1. Verificar Lambda en misma VPC que RDS
2. Verificar Security Group de Lambda permite outbound 3306
3. Verificar Security Group de RDS permite inbound desde SG de Lambda
4. Verificar subnets tienen route a NAT Gateway (si RDS es privada)

**Verificar conectividad:**
```bash
# Test desde Lambda (crear test event)
{
  "httpMethod": "GET",
  "path": "/api/health"
}
```

### Error: Lambda timeout (30s)

**Causa:** Cold start de Puppeteer + Chromium

**Solución:**
1. Primera generación PDF puede tomar 5-8 segundos
2. Warm starts: 1-3 segundos
3. Considerar aumentar timeout a 60s si es frecuente
4. Implementar warming (EventBridge → Lambda cada 5 min)

### Error: "Out of memory"

**Causa:** Chromium + múltiples PDFs simultáneos

**Solución:**
1. Aumentar memoria a 2048 MB
2. Configurar Reserved Concurrency para limitar instancias
3. Revisar logs: `fields @maxMemoryUsed`

### Error: PDF corrupto o vacío

**Causa:** Assets (logo) no encontrados

**Solución:**
1. Verificar que logo CPAU está embebido en base64 en tabla `Entregables_PDF`
2. Verificar template Handlebars correcto
3. Ver logs: `[PDF] Generado en XXms`

---

## 14. Métricas y Performance

### Métricas Esperadas

| Métrica | Valor Típico | Umbral Alerta |
|---------|--------------|---------------|
| **Invocations/min** | 5-20 | > 50 |
| **Duration (warm)** | 800-2000 ms | > 5000 ms |
| **Duration (cold)** | 3000-8000 ms | > 15000 ms |
| **Errors** | 0-2% | > 5% |
| **Throttles** | 0 | > 0 |
| **Concurrent Executions** | 1-5 | > 10 |

### CloudWatch Dashboard (recomendado crear)

Widgets:
1. Invocations (count)
2. Duration (avg, p50, p99)
3. Errors (count)
4. Throttles (count)
5. Concurrent Executions (max)

---

## 15. Rollback Procedure

### Si deployment PROD falla:

1. **Identificar última versión estable:**
   ```bash
   aws lambda list-versions-by-function --function-name cpau-ch2026-api-prod
   ```

2. **Actualizar alias a versión anterior:**
   ```bash
   aws lambda update-alias \
     --function-name cpau-ch2026-api-prod \
     --name production \
     --function-version [VERSION_ANTERIOR]
   ```

3. **Verificar:**
   ```bash
   curl https://cpau-ch2026-api-prod.cpau.org/api/health
   ```

---

## 16. Mejoras Pendientes para PROD

### Seguridad

- [ ] Migrar `DB_PASSWORD` a Secrets Manager
- [ ] Habilitar `REQUIRE_JWT=true`
- [ ] Configurar WAF en API Gateway
- [ ] Rate limiting por IP

### Performance

- [ ] Configurar Reserved Concurrency: 15
- [ ] Implementar warming con EventBridge
- [ ] Habilitar X-Ray tracing
- [ ] Optimizar tamaño de Chromium

### Monitoreo

- [ ] Crear alarmas CloudWatch (errors, duration)
- [ ] Dashboard de métricas
- [ ] SNS topic para notificaciones
- [ ] Log retention: 30 días (vs 7 en QA)

### Alta Disponibilidad

- [ ] Multi-AZ subnets (ya configurado ✅)
- [ ] Provisioned Concurrency (considerar)
- [ ] DLQ para errores no recuperables

---

## 17. Checklist Pre-PROD

Antes de replicar en PROD, verificar:

- [ ] ✅ Lambda QA funciona correctamente
- [ ] ✅ Todos los endpoints responden
- [ ] ✅ Generación PDF exitosa
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Performance aceptable (< 5s PDF)
- [ ] ⚠️ Secrets Manager para DB credentials
- [ ] ⚠️ Reserved Concurrency configurado
- [ ] ⚠️ Alarmas CloudWatch activas
- [ ] ⚠️ Documentación actualizada

---

## 18. Contactos y Referencias

**Responsable Técnico:** [Nombre]  
**Última Actualización:** 24/07/2026  
**Revisión:** v1.0

**Referencias:**
- SPEC-023: Implementación Backend en Producción
- SPEC-010: Migración PDF a Puppeteer
- Código: `App/Backend/Node/`

---

**Fin del Documento - Configuración Lambda QA**
