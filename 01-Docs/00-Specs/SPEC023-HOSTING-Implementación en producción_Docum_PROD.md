# Documentación Configuración Lambda PROD - cpau-ch2026-api-prod

**Fecha Documentación:** 24/07/2026  
**Estado:** 🚧 EN CONFIGURACIÓN  
**Propósito:** Documentación de configuración productiva

---

## ⚠️ ESTADO ACTUAL

| Componente | Estado | Notas |
|------------|--------|-------|
| Lambda Function | ✅ Creada | Sin código ni configuración |
| API Gateway | ✅ Completado | ID: pgufu9oj5 - Rutas y CORS configurados |
| Certificado SSL | ⏳ Validación pendiente | Solicitado - Esperando cliente configure DNS |
| Custom Domain | ⏳ Pendiente | Requiere certificado validado |
| Base de Datos | ⏳ Pendiente | Crear `cpau_ch_production` |
| Variables Entorno | ⏳ Pendiente | Configurar |
| VPC/Security Groups | ⏳ Pendiente | Replicar de QA |
| IAM Permissions | ⏳ Pendiente | Verificar |
| Deployment Código | ⏳ Pendiente | Upload ZIP |

---

## 1. Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre Función** | `cpau-ch2026-api-prod` |
| **ARN** | `[PENDIENTE - Obtener de AWS Console]` |
| **Runtime** | Node.js 24.x (mismo que QA) |
| **Architecture** | x86_64 |
| **Handler** | `lambda.handler` |
| **Estado** | Active (sin código) |
| **Package Type** | Zip |
| **Región** | us-east-1 |
| **Account ID** | 848685497128 |

**Obtener ARN:**
```bash
aws lambda get-function-configuration --function-name cpau-ch2026-api-prod --query 'FunctionArn'
```

---

## 2. Configuración de Recursos

### Configuración Objetivo (basada en QA + ajustes)

| Recurso | Valor QA | Valor PROD | Justificación |
|---------|----------|------------|---------------|
| **Memory** | 1024 MB | **1024 MB** | Suficiente para Puppeteer + margen |
| **Timeout** | 30 segundos | **30 segundos** | Generación PDF + cold start |
| **Ephemeral Storage** | 1024 MB | **1024 MB** | Chromium temporal |
| **Reserved Concurrency** | Sin configurar | **15** | Priorizar sobre QA (5) para RDS compartida |

### ✅ **Tarea 2.1 - Configurar Parámetros Básicos**

**Pasos:**
1. AWS Console → Lambda → `cpau-ch2026-api-prod`
2. Configuration → General configuration → Edit
3. Aplicar valores PROD arriba
4. **Save**

**Verificar:**
```bash
aws lambda get-function-configuration --function-name cpau-ch2026-api-prod --query '{Memory:MemorySize,Timeout:Timeout,Storage:EphemeralStorage.Size}'
```

**Status:** ⏳ Pendiente

---

## 3. Variables de Entorno

### Variables a Configurar

| Variable | Valor PROD | Notas |
|----------|------------|-------|
| `NODE_ENV` | `production` | Identifica ambiente |
| `DB_HOST` | `gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com` | Mismo RDS que QA (instancia compartida) |
| `DB_PORT` | `3306` | Puerto MySQL |
| `DB_NAME` | `cpau_ch_production` | ⚠️ Nueva DB a crear (Tarea 2.2) |
| `DB_USER` | `cpau_prod` | ⚠️ Nuevo usuario a crear (Tarea 2.2) |
| `DB_PASSWORD` | `[OBTENER_DE_SECRETS_MANAGER]` | ⚠️ Ver sección Secrets Manager |
| `SECRET_NAME` | `cpau-ch-prod-db-credentials` | ARN del secret en Secrets Manager |
| `FRONTEND_URL` | `https://calculadora-beta.cpau.org` | URL frontend PROD |
| `REQUIRE_JWT` | `false` | Cambiar a `true` cuando auth esté listo |
| `AWS_REGION` | `us-east-1` | Región AWS |

### 🔐 **Opción SEGURA (Recomendada): Usar Secrets Manager**

**En lugar de `DB_PASSWORD` hardcodeado, usar:**

1. **Crear secret:**
   ```bash
   aws secretsmanager create-secret \
     --name cpau-ch-prod-db-credentials \
     --description "Credenciales DB producción CH2026" \
     --secret-string '{"username":"cpau_prod","password":"[GENERAR_PASSWORD_SEGURO]","host":"gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com","port":3306,"database":"cpau_ch_production"}'
   ```

2. **Anotar ARN del secret:**
   ```bash
   aws secretsmanager describe-secret --secret-id cpau-ch-prod-db-credentials --query 'ARN'
   ```

3. **Variables de entorno quedan:**
   - `SECRET_NAME=cpau-ch-prod-db-credentials`
   - `AWS_REGION=us-east-1`
   - **NO incluir `DB_PASSWORD`**

4. **El código ya está preparado** en `src/config/db.js` para leer de Secrets Manager cuando `NODE_ENV=production`.

### ✅ **Tarea 2.3 - Configurar Variables**

**Pasos:**
1. AWS Console → Lambda → `cpau-ch2026-api-prod`
2. Configuration → Environment variables → Edit
3. Agregar todas las variables de la tabla
4. **Save**

**Status:** ⏳ Pendiente (requiere Tarea 2.2 completa primero)

---

## 4. Configuración VPC y Networking

### VPC Configuration (Replicar de QA)

| Propiedad | Valor |
|-----------|-------|
| **VPC ID** | `vpc-066d4888f63caa083` (mismo que QA) |
| **Subnets** | `subnet-060c328529aebf1ff`, `subnet-022b80884a384c3c0` (mismas que QA) |
| **Security Groups** | `sg-0db09a975dc27c479` (mismo que QA - compartido) |
| **IPv6 Dual Stack** | Deshabilitado |

**Justificación:** Al usar la misma instancia RDS, compartimos VPC y Security Groups con QA.

### ✅ **Tarea 2.4 - Configurar VPC**

**Pasos:**
1. AWS Console → Lambda → `cpau-ch2026-api-prod`
2. Configuration → VPC → Edit
3. VPC: `vpc-066d4888f63caa083`
4. Subnets: Seleccionar ambas (diferentes AZs)
5. Security groups: `sg-0db09a975dc27c479`
6. **Save**
7. ⏰ Esperar 3-5 minutos (Lambda crea ENIs)

**Verificar:**
```bash
aws lambda get-function-configuration --function-name cpau-ch2026-api-prod --query 'VpcConfig'
```

**Status:** ⏳ Pendiente

---

## 5. IAM y Permisos

### Execution Role

| Propiedad | Valor |
|-----------|-------|
| **Role Name** | `[AWS auto-genera al crear Lambda]` |
| **Role ARN** | `[OBTENER DE AWS]` |
| **Tipo** | Service Role (Lambda) |

**Obtener role actual:**
```bash
aws lambda get-function-configuration --function-name cpau-ch2026-api-prod --query 'Role'
```

### Policies Requeridas

| Policy | Propósito | Status |
|--------|-----------|--------|
| `AWSLambdaBasicExecutionRole` | CloudWatch Logs | ⏳ Verificar |
| `AWSLambdaVPCAccessExecutionRole` | Acceso VPC | ⏳ Verificar |
| **Custom: Secrets Manager** | Leer credenciales DB | ⏳ Crear |

### ✅ **Tarea 2.5 - Configurar Permisos**

**1. Verificar policies actuales:**
```bash
ROLE_NAME=$(aws lambda get-function-configuration --function-name cpau-ch2026-api-prod --query 'Role' --output text | awk -F'/' '{print $NF}')
aws iam list-attached-role-policies --role-name $ROLE_NAME
```

**2. Si falta Secrets Manager, crear policy:**

Archivo `lambda-secrets-policy.json`:
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

**3. Aplicar:**
```bash
aws iam put-role-policy \
  --role-name $ROLE_NAME \
  --policy-name LambdaSecretsAccess \
  --policy-document file://lambda-secrets-policy.json
```

**Status:** ⏳ Pendiente

---

## 6. CloudWatch Logs y Monitoreo

### Configuración

| Propiedad | Valor |
|-----------|-------|
| **Log Group** | `/aws/lambda/cpau-ch2026-api-prod` |
| **Log Format** | Text |
| **Retención** | **30 días** (vs 7 en QA) |
| **Tracing** | PassThrough (considerar habilitar X-Ray) |

### ✅ **Tarea 2.6 - Configurar Logs y Alarmas**

**1. Configurar retención:**
```bash
aws logs put-retention-policy \
  --log-group-name /aws/lambda/cpau-ch2026-api-prod \
  --retention-in-days 30
```

**2. Crear alarma de ERRORES:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name CH2026-Prod-Lambda-Errors \
  --alarm-description "Alerta cuando Lambda PROD tiene errores" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod \
  --treat-missing-data notBreaching
```

**3. Crear alarma de DURACIÓN:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name CH2026-Prod-Lambda-Duration \
  --alarm-description "Alerta cuando Lambda PROD tarda >25s" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 25000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod
```

**Status:** ⏳ Pendiente

---

## 7. API Gateway

### Información

| Propiedad | Valor |
|-----------|-------|
| **API Name** | `CH2026-Backend-API-Production` |
| **API ID** | `pgufu9oj5` |
| **API Type** | HTTP API (v2) |
| **Stage** | `$default` (auto-deploy) |
| **Endpoint Base** | `https://pgufu9oj5.execute-api.us-east-1.amazonaws.com` |
| **Custom Domain** | ⏳ `cpau-ch2026-api-prod.cpau.org` (pendiente validación certificado) |
| **Fecha Creación** | 24/07/2026 |

### Routes Configuradas ✅

| Método | Ruta | Integration | Status |
|--------|------|-------------|--------|
| `ANY` | `/api` | Lambda `cpau-ch2026-api-prod` | ✅ Creada 24/07/2026 |
| `ANY` | `/api/{proxy+}` | Lambda `cpau-ch2026-api-prod` | ✅ Creada 24/07/2026 |

### CORS Configuration

✅ **CONFIGURADO - 24/07/2026**

**Valores aplicados:**
```
Access-Control-Allow-Origin: 
  - https://calculadora-beta.cpau.org

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

### ✅ **Tarea 0.2 - Configurar CORS** 

**Status:** ✅ **COMPLETADO - 24/07/2026**

---

## 8. Custom Domain (URGENTE para Cliente)

### Objetivo

**URL Final:** `https://cpau-ch2026-api-prod.cpau.org/api`

### Componentes

| Componente | Status | Valor |
|------------|--------|-------|
| **Certificado SSL** | ⏳ **Solicitado - Validación pendiente** | ID: 82ab07c3-a288-4b72-8849-8e8454ee3601 |
| **ARN Certificado** | ⏳ Pendiente validación | `arn:aws:acm:us-east-1:848685497128:certificate/82ab07c3-a288-4b72-8849-8e8454ee3601` |
| **Custom Domain Name** | ⏳ Pendiente | `cpau-ch2026-api-prod.cpau.org` (requiere cert validado) |
| **API Mapping** | ⏳ Pendiente | API pgufu9oj5 → Stage `$default` |
| **Target Domain (DNS)** | ⏳ Pendiente | Se obtiene al crear Custom Domain |

### ✅ **Tarea 0.3 - Certificado SSL**

**Status:** ⏳ **SOLICITADO - Esperando validación DNS del cliente - 24/07/2026**

**Certificado ID:** `82ab07c3-a288-4b72-8849-8e8454ee3601`  
**ARN:** `arn:aws:acm:us-east-1:848685497128:certificate/82ab07c3-a288-4b72-8849-8e8454ee3601`  
**Dominio:** `cpau-ch2026-api-prod.cpau.org`  
**Estado:** Pendiente de validación  

**Datos DNS enviados al cliente CPAU (24/07/2026):**

```
Tipo:    CNAME
Nombre:  _9d685b4a353cbd68260a1dce7e7574b6.cpau-ch2026-api-prod
Valor:   _5ee887e35061d8cacceee961ccd97892.jkddzztszm.acm-validations.aws.
TTL:     300
```

**⏰ Tiempo estimado de validación:** 5-30 minutos después de que cliente configure DNS

---

**Opción A: Certificado wildcard existente** (más rápido - NO aplicable)

1. Verificar si existe `*.cpau.org`:
   ```bash
   aws acm list-certificates --region us-east-1 --query 'CertificateSummaryList[?DomainName==`*.cpau.org`]'
   ```

2. Si existe, anotar ARN y saltar a Tarea 0.4

**Opción B: Solicitar certificado nuevo**

1. **Solicitar:**
   ```bash
   aws acm request-certificate \
     --domain-name cpau-ch2026-api-prod.cpau.org \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Obtener valores DNS para validación:**
   ```bash
   CERT_ARN=[ARN_GENERADO]
   aws acm describe-certificate --certificate-arn $CERT_ARN --region us-east-1 --query 'Certificate.DomainValidationOptions[0].ResourceRecord'
   ```

3. **Salida esperada:**
   ```json
   {
       "Name": "_abc123xyz.cpau-ch2026-api-prod.cpau.org",
       "Type": "CNAME",
       "Value": "_xyz456abc.acm-validations.aws."
   }
   ```

4. **Enviar al cliente CPAU:**
   
   ```
   Asunto: URGENTE - Validación Certificado SSL Backend
   
   Necesitamos este registro DNS TEMPORAL para validar el certificado:
   
   Tipo:    CNAME
   Nombre:  _abc123xyz.cpau-ch2026-api-prod
   Valor:   _xyz456abc.acm-validations.aws.
   TTL:     300
   
   Esto tarda 2-10 minutos. Una vez validado, les enviamos el registro definitivo.
   ```

**Status:** ⏳ Pendiente

---

### ✅ **Tarea 0.4 - Crear Custom Domain**

**Prerequisito:** Certificado SSL validado (Status: Issued)

**Pasos:**

1. **Crear Custom Domain:**
   ```bash
   CERT_ARN=[ARN_CERTIFICADO_VALIDADO]
   
   aws apigatewayv2 create-domain-name \
     --domain-name cpau-ch2026-api-prod.cpau.org \
     --domain-name-configurations CertificateArn=$CERT_ARN
   ```

2. **Obtener Target Domain:**
   ```bash
   aws apigatewayv2 get-domain-name \
     --domain-name cpau-ch2026-api-prod.cpau.org \
     --query 'DomainNameConfigurations[0].ApiGatewayDomainName'
   ```

   **Salida (ejemplo):**
   ```
   "d-abc123xyz.execute-api.us-east-1.amazonaws.com"
   ```
   
   ⚠️ **ANOTAR ESTE VALOR** - Es el que va al cliente para DNS

3. **Crear API Mapping:**
   ```bash
   API_ID=pgufu9oj5  # Tu API ID
   
   aws apigatewayv2 create-api-mapping \
     --domain-name cpau-ch2026-api-prod.cpau.org \
     --api-id $API_ID \
     --stage '$default'
   ```

4. **Verificar mapping:**
   ```bash
   aws apigatewayv2 get-api-mappings \
     --domain-name cpau-ch2026-api-prod.cpau.org
   ```

**Status:** ⏳ Pendiente

---

### ✅ **Tarea 0.5 - Entregar Datos DNS al Cliente**

**Email para Cliente CPAU:**

```
Asunto: Configuración DNS Backend - cpau-ch2026-api-prod.cpau.org

Estimado equipo CPAU,

Ya tenemos el backend listo en AWS. Necesitamos que configuren:

═══════════════════════════════════════════════════════════════════
REGISTRO DNS - BACKEND API
═══════════════════════════════════════════════════════════════════

Tipo:    CNAME
Nombre:  cpau-ch2026-api-prod
Valor:   [TARGET_DOMAIN_DE_TAREA_0.4]
         Ejemplo: d-abc123xyz.execute-api.us-east-1.amazonaws.com
TTL:     3600

Resultado: https://cpau-ch2026-api-prod.cpau.org

═══════════════════════════════════════════════════════════════════

INSTRUCCIONES:
1. Ingresar al panel DNS de cpau.org
2. Agregar nuevo registro CNAME con los valores arriba
3. Guardar cambios

VERIFICACIÓN:
https://dnschecker.org → cpau-ch2026-api-prod.cpau.org → CNAME

TIEMPO PROPAGACIÓN: 4-6 horas (hasta 48 horas máximo)

TEST FINAL (cuando propague):
https://cpau-ch2026-api-prod.cpau.org/api/health

Por favor confirmar cuando lo hayan configurado.

Saludos,
[Tu nombre]
```

**Status:** ⏳ Pendiente (enviar después de Tarea 0.4)

---

## 9. Base de Datos RDS MySQL

### Información Objetivo

| Propiedad | Valor |
|-----------|-------|
| **Endpoint** | `gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com` (compartida con QA) |
| **Port** | `3306` |
| **Database** | `cpau_ch_production` (nueva - a crear) |
| **Usuario** | `cpau_prod` (nuevo - a crear) |
| **Password** | `[GENERAR_SEGURO]` → Secrets Manager |
| **Connection Pool** | 5 conexiones (mismo código que QA) |
| **Max Connections** | 75 (vs 25 para QA) |

### ✅ **Tarea 2.2 - Crear Base de Datos**

**1. Conectar a RDS:**
```bash
mysql -h gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com -u [ADMIN_USER] -p
```

**2. Crear database:**
```sql
CREATE DATABASE cpau_ch_production 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

SHOW DATABASES;
```

**3. Generar password seguro:**
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) + @(33,35,36,37,38,42) | Get-Random -Count 24 | ForEach-Object {[char]$_})
```

**4. Crear usuario:**
```sql
CREATE USER 'cpau_prod'@'%' IDENTIFIED BY '[PASSWORD_GENERADO]';

GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP 
ON cpau_ch_production.* TO 'cpau_prod'@'%';

FLUSH PRIVILEGES;
```

**5. Exportar schema desde QA:**
```bash
mysqldump -h gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com \
  -u cpau_qa -p \
  --no-data \
  cpau_ch_qa > schema_prod.sql
```

**6. Importar a producción:**
```bash
mysql -h gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com \
  -u cpau_prod -p \
  cpau_ch_production < schema_prod.sql
```

**7. Poblar datos maestros:**
```sql
USE cpau_ch_production;

-- Copiar datos de configuración (NO transaccionales)
INSERT INTO Parametros SELECT * FROM cpau_ch_qa.Parametros;
INSERT INTO Tareas_Profesionales SELECT * FROM cpau_ch_qa.Tareas_Profesionales;
INSERT INTO Categorias SELECT * FROM cpau_ch_qa.Categorias;
INSERT INTO Instalaciones SELECT * FROM cpau_ch_qa.Instalaciones;
INSERT INTO Rangos_Superficie SELECT * FROM cpau_ch_qa.Rangos_Superficie;
INSERT INTO Entregables_PDF SELECT * FROM cpau_ch_qa.Entregables_PDF;
INSERT INTO Tareas_Profesionales_Entregables_PDF 
SELECT * FROM cpau_ch_qa.Tareas_Profesionales_Entregables_PDF;

-- NO copiar: Usuarios, Calculos, Logs
```

**8. Validar:**
```sql
SHOW TABLES;
SELECT COUNT(*) FROM Parametros;
SELECT COUNT(*) FROM Tareas_Profesionales;
SELECT COUNT(*) FROM Usuarios;  -- debe ser 0
SELECT COUNT(*) FROM Calculos;  -- debe ser 0
```

**9. Configurar límites:**
```sql
ALTER USER 'cpau_qa'@'%' WITH MAX_USER_CONNECTIONS 25;
ALTER USER 'cpau_prod'@'%' WITH MAX_USER_CONNECTIONS 75;

SELECT user, host, max_user_connections FROM mysql.user WHERE user LIKE 'cpau%';
```

**10. Guardar en Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name cpau-ch-prod-db-credentials \
  --secret-string '{"username":"cpau_prod","password":"[PASSWORD]","host":"gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com","port":3306,"database":"cpau_ch_production"}'
```

**Status:** ⏳ Pendiente

---

## 10. Deployment de Código

### Package Info

| Propiedad | Valor |
|-----------|-------|
| **Archivo** | `ch2026-backend-api-lambda.zip` |
| **Tamaño** | ~79.6 MB |
| **SHA256** | `[Generar con npm run package]` |
| **Método** | AWS CLI (excede 50 MB límite directo) |

### ✅ **Tarea 3.1 y 3.2 - Generar y Subir Código**

**1. Preparar código:**
```bash
cd [directorio_backend]
git checkout main
git pull origin main
git status  # Verificar clean
```

**2. Generar paquete:**
```bash
npm install
npm run package
```

**3. Verificar:**
```bash
dir ch2026-backend-api-lambda.zip
type deployment-info.json
```

**4. Upload a Lambda PROD:**
```bash
npm run upload:prod

# Equivalente a:
aws lambda update-function-code \
  --function-name cpau-ch2026-api-prod \
  --zip-file fileb://ch2026-backend-api-lambda.zip
```

**5. Esperar procesamiento (~5-7 minutos):**
```bash
# Verificar estado
aws lambda get-function --function-name cpau-ch2026-api-prod --query 'Configuration.State'
# Debe retornar: "Active"
```

**6. Publicar versión:**
```bash
aws lambda publish-version \
  --function-name cpau-ch2026-api-prod \
  --description "First production deployment - $(Get-Date -Format 'yyyy-MM-dd')"
```

**7. Crear alias:**
```bash
aws lambda create-alias \
  --function-name cpau-ch2026-api-prod \
  --name production \
  --function-version 1
```

**Status:** ⏳ Pendiente (requiere todas las config previas)

---

## 11. Testing y Validación

### Tests a Realizar

| Test | Comando | Resultado Esperado | Status |
|------|---------|-------------------|--------|
| **Lambda → DB** | Test event `/api/health` | `{"status":"ok","database":"connected"}` | ⏳ Pendiente |
| **API Gateway** | `curl $ENDPOINT/api/health` | 200 OK | ⏳ Pendiente |
| **Custom Domain** | `curl https://cpau-ch2026-api-prod.cpau.org/api/health` | 200 OK (después DNS) | ⏳ Pendiente |
| **CORS** | Preflight OPTIONS | Headers correctos | ⏳ Pendiente |
| **PDF Generation** | POST `/api/calculos/exportar-pdf` | PDF válido | ⏳ Pendiente |

### Scripts de Test

**Health Check:**
```powershell
$endpoint = "https://cpau-ch2026-api-prod.cpau.org"
curl "$endpoint/api/health"
```

**CORS Test:**
```powershell
curl -X OPTIONS "$endpoint/api/health" `
  -H "Origin: https://calculadora-beta.cpau.org" `
  -H "Access-Control-Request-Method: GET" `
  -v
```

**PDF Test:**
```powershell
$payload = Get-Content test-payload-pdf.json
curl -X POST "$endpoint/api/calculos/exportar-pdf" `
  -H "Content-Type: application/json" `
  -d $payload `
  --output certificado-prod-test.pdf
```

---

## 12. URLs Finales

| Tipo | URL | Status |
|------|-----|--------|
| **API Gateway Autogenerada** | `https://pgufu9oj5.execute-api.us-east-1.amazonaws.com` | ✅ Activa |
| **Custom Domain (objetivo)** | `https://cpau-ch2026-api-prod.cpau.org/api` | ⏳ Pendiente DNS |
| **Health Check** | `https://cpau-ch2026-api-prod.cpau.org/api/health` | ⏳ Pendiente |

---

## 13. Checklist General

### Configuración Infraestructura

- [ ] Lambda: Parámetros básicos (Memory, Timeout) - Tarea 2.1
- [ ] Lambda: Variables de entorno - Tarea 2.3
- [ ] Lambda: VPC y Security Groups - Tarea 2.4
- [ ] Lambda: Permisos IAM (Secrets Manager) - Tarea 2.5
- [ ] Lambda: Reserved Concurrency (15) - Tarea 2.7
- [ ] CloudWatch: Logs retención 30 días - Tarea 2.6
- [ ] CloudWatch: Alarmas (Errors, Duration) - Tarea 2.6

### Base de Datos

- [ ] Database `cpau_ch_production` creada - Tarea 2.2
- [ ] Usuario `cpau_prod` con permisos - Tarea 2.2
- [ ] Schema importado - Tarea 2.2
- [ ] Datos maestros poblados - Tarea 2.2
- [ ] Límites de conexiones (75) - Tarea 2.2
- [ ] Credentials en Secrets Manager - Tarea 2.2

### API Gateway

- [x] API Gateway creado ✅ - 24/07/2026
- [x] Rutas configuradas ✅ - 24/07/2026
- [x] CORS configurado ✅ - Tarea 0.2 - 24/07/2026
- [x] Certificado SSL solicitado ✅ - Tarea 0.3 - 24/07/2026 (⏳ validación pendiente)
- [ ] Custom Domain creado - Tarea 0.4 (requiere certificado validado)
- [x] DNS validación enviados a cliente ✅ - Tarea 0.5 - 24/07/2026

### Deployment

- [ ] Código preparado (main branch) - Tarea 3.1
- [ ] Package generado - Tarea 3.1
- [ ] Upload a Lambda exitoso - Tarea 3.2
- [ ] Versión 1 publicada - Tarea 3.3
- [ ] Alias `production` creado - Tarea 3.3

### Testing

- [ ] Test Lambda → DB - Tarea 4.1
- [ ] Test API Gateway - Tarea 4.2
- [ ] Test Custom Domain (post-DNS) - Tarea 4.2
- [ ] Test CORS - Tarea 4.2
- [ ] Test generación PDF - Tarea 4.3

---

## 14. Próximos Pasos

### ✅ COMPLETADO (24/07/2026)

1. ✅ **API Gateway creado** - ID: pgufu9oj5
2. ✅ **Rutas configuradas** - ANY /api, ANY /api/{proxy+}
3. ✅ **CORS configurado** - calculadora-beta.cpau.org habilitado
4. ✅ **Certificado SSL solicitado** - ID: 82ab07c3... 
5. ✅ **Datos DNS enviados al cliente** - Esperando validación

### ⏰ ESPERANDO CLIENTE (Bloqueante)

6. **⏳ Cliente CPAU configure DNS de validación**
   - Registro CNAME temporal para validar certificado
   - Tiempo estimado: 5-30 minutos después de configuración
   - Una vez validado, proceder con Tarea 0.4

### SIGUIENTE (Después de Validación Certificado)

7. **Crear Custom Domain** en API Gateway - Tarea 0.4
8. **Obtener Target Domain** (d-xxxxx.execute-api.us-east-1.amazonaws.com)
9. **Enviar segundo DNS** al cliente (CNAME definitivo)

### MIENTRAS ESPERAMOS (Paralelo - Puede iniciarse ahora)

10. ✅ **Crear Base de Datos** `cpau_ch_production` - Tarea 2.2
11. ✅ **Configurar Lambda** (Memory, Timeout, Env Vars, VPC) - Tareas 2.1, 2.3, 2.4
12. ✅ **Configurar Permisos IAM** - Tarea 2.5
13. ✅ **Deployment de Código** - Tareas 3.1, 3.2

### POST-DNS PROPAGADO (Final)

14. ✅ **Testing completo** - FASE 4
15. ✅ **Monitoreo y ajustes** - FASE 5

---

**Última Actualización:** 24/07/2026 - 16:30  
**Estado:** 🚧 Esperando validación DNS del cliente para continuar con Custom Domain  
**Progreso FASE 0:** 80% completado (5/6 tareas - falta Custom Domain)
