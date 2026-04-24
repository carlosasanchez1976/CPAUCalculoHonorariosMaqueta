# 🚀 Guía de Deployment - AWS Lambda

Guía completa para desplegar el backend CH2026 en AWS Lambda con Serverless Framework.

---

## 📋 Pre-requisitos

### 1. Software Local
```powershell
# Node.js 18.x o superior
node --version  # v18.x.x

# npm
npm --version

# Serverless Framework CLI
npm install -g serverless

# Verificar instalación
serverless --version
```

### 2. Cuenta y Credenciales AWS

#### A. Crear usuario IAM para deployment

1. Ir a AWS Console → IAM → Users → Create User
2. Nombre: `serverless-deploy-user`
3. Permisos necesarios (policies):
   - `AWSLambdaFullAccess`
   - `IAMFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `CloudWatchLogsFullAccess`
   - `SecretsManagerReadWrite`
   - O crear una policy personalizada (recomendado para producción)

4. Crear Access Key:
   - Security Credentials → Create Access Key
   - Guardar:
     - **Access Key ID**: `AKIAXXXXXXXXXXXXXXXX`
     - **Secret Access Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### B. Configurar credenciales localmente

```powershell
# Opción 1: Usando AWS CLI
aws configure
# AWS Access Key ID: [tu access key]
# AWS Secret Access Key: [tu secret key]
# Default region name: us-east-1
# Default output format: json

# Opción 2: Usando Serverless Framework
serverless config credentials --provider aws --key AKIAXXXXXXXXXXXXXXXX --secret xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🗄️ Configurar Base de Datos RDS (si no existe)

### 1. Crear RDS MySQL en AWS

```
AWS Console → RDS → Create Database
- Engine: MySQL 8.0
- Template: Dev/Test (o Production según ambiente)
- DB Instance Identifier: cpau-ch-qa
- Master username: CPAU_qa
- Master password: [guardar en Secrets Manager]
- Instance size: db.t3.micro (dev/qa) o db.t3.medium (prod)
- Storage: 20 GB SSD
- VPC: Default o crear una VPC privada
- Public Access: No (conectar via Lambda en VPC)
- Security Group: Permitir puerto 3306 desde Lambda
```

### 2. Anotar endpoint de RDS

Ejemplo: `cpau-ch-qa.c9a1b2c3d4e5.us-east-1.rds.amazonaws.com`

---

## 🔐 Configurar AWS Secrets Manager

### Crear Secret para credenciales de DB

```powershell
# Via AWS CLI (PowerShell)
aws secretsmanager create-secret `
  --name cpau-ch-dev-db-credentials `
  --description "Credenciales DB para CH2026 Backend (DEV)" `
  --secret-string '{\"DB_HOST\":\"localhost\",\"DB_USER\":\"CPAU_dev\",\"DB_PASSWORD\":\"cpau_dev!2026\",\"DB_NAME\":\"cpau_ch_dev\",\"DB_PORT\":\"3306\"}'

# Para QA
aws secretsmanager create-secret `
  --name cpau-ch-qa-db-credentials `
  --description "Credenciales DB para CH2026 Backend (QA)" `
  --secret-string '{\"DB_HOST\":\"cpau-ch-qa.xxxxx.us-east-1.rds.amazonaws.com\",\"DB_USER\":\"CPAU_qa\",\"DB_PASSWORD\":\"tu_password_seguro\",\"DB_NAME\":\"cpau_ch_qa\",\"DB_PORT\":\"3306\"}'
```

O crear via AWS Console:
1. AWS Console → Secrets Manager → Store a new secret
2. Secret type: Other type of secret
3. Key/value pairs:
   ```
   DB_HOST: cpau-ch-qa.xxxxx.us-east-1.rds.amazonaws.com
   DB_USER: CPAU_qa
   DB_PASSWORD: tu_password_seguro
   DB_NAME: cpau_ch_qa
   DB_PORT: 3306
   ```
4. Secret name: `cpau-ch-qa-db-credentials`

---

## 🔧 Configurar el Proyecto

### 1. Instalar dependencias

```powershell
cd App\Backend\Node

# Instalar dependencias
npm install

# Instalar Serverless Framework localmente (opcional)
npm install --save-dev serverless serverless-offline
```

### 2. Verificar archivos de configuración

✅ `serverless.yml` - Configuración de deployment (ya creado)  
✅ `.env.example` - Template de variables (ya creado)  
✅ `lambda.js` - Handler de Lambda (ya existe)  
✅ `app.js` - Express app (ya existe)

### 3. Actualizar `src/config/database.js` para leer Secrets Manager

```javascript
// src/config/database.js
const mysql = require('mysql2/promise');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let pool = null;

// Función para obtener credenciales desde Secrets Manager (Lambda)
async function getDbCredentialsFromSecretsManager() {
    const secretName = process.env.SECRET_NAME;
    
    if (!secretName) {
        throw new Error('SECRET_NAME no está configurado');
    }

    const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'us-east-1' });
    
    try {
        const response = await client.send(
            new GetSecretValueCommand({ SecretId: secretName })
        );
        
        return JSON.parse(response.SecretString);
    } catch (error) {
        console.error('Error obteniendo secret:', error);
        throw error;
    }
}

async function createPool() {
    if (pool) {
        return pool;
    }

    let dbConfig;

    // En Lambda, leer desde Secrets Manager
    if (process.env.AWS_EXECUTION_ENV) {
        console.log('🔐 Obteniendo credenciales desde Secrets Manager...');
        const secrets = await getDbCredentialsFromSecretsManager();
        
        dbConfig = {
            host: secrets.DB_HOST,
            port: parseInt(secrets.DB_PORT || '3306'),
            user: secrets.DB_USER,
            password: secrets.DB_PASSWORD,
            database: secrets.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        };
    } else {
        // En desarrollo local, leer desde .env
        console.log('🔧 Usando credenciales locales desde .env');
        require('dotenv').config();
        
        dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0
        };
    }

    pool = mysql.createPool(dbConfig);
    console.log('✅ Pool de conexiones MySQL creado');
    
    return pool;
}

async function getConnection() {
    if (!pool) {
        await createPool();
    }
    return pool.getConnection();
}

module.exports = {
    getConnection,
    createPool
};
```

---

## 🚀 Deployment

### Opción A: Deployment Manual (Serverless Framework)

```powershell
# Asegurarse de estar en la carpeta correcta
cd App\Backend\Node

# 1. Deploy a DEV
serverless deploy --stage dev

# 2. Deploy a QA
serverless deploy --stage qa

# 3. Ver información del deployment
serverless info --stage qa
```

Salida esperada:
```
Service Information
service: ch2026-backend-api
stage: qa
region: us-east-1
stack: ch2026-backend-api-qa
api keys:
  None
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api/{proxy+}
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api
functions:
  api: ch2026-backend-api-qa
```

### Opción B: Deployment Manual (AWS Console)

Si prefieres crear la función manualmente:

1. **Crear archivo ZIP**:
   ```powershell
   npm run package
   ```
   Esto genera `ch2026-backend-api-lambda.zip`

2. **Crear función Lambda**:
   - AWS Console → Lambda → Create Function
   - Function name: `ch2026-backend-api-qa`
   - Runtime: Node.js 18.x
   - Architecture: x86_64
   - Permissions: Create new role (o usar rol existente con los permisos necesarios)

3. **Subir código**:
   - Upload from → .zip file
   - Seleccionar `ch2026-backend-api-lambda.zip`

4. **Configurar**:
   - Handler: `lambda.handler`
   - Memory: 512 MB
   - Timeout: 30 seconds
   - Environment variables:
     - `NODE_ENV`: qa
     - `SECRET_NAME`: cpau-ch-qa-db-credentials
     - `AWS_REGION`: us-east-1

5. **Crear API Gateway**:
   - API Gateway → Create API → HTTP API
   - Integrations → Add Integration → Lambda
   - Select Lambda function: ch2026-backend-api-qa
   - Routes:
     - `ANY /api/{proxy+}`
     - `ANY /api`
   - CORS: Configure según necesidad

---

## ✅ Verificar Deployment

### 1. Test desde PowerShell

```powershell
# Reemplazar con tu endpoint real
$endpoint = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com"

# Test GET (health check si existe)
Invoke-RestMethod -Uri "$endpoint/api/health" -Method GET

# Test POST - Calcular honorarios
$body = @{
    usuarioId = 2
    tareaId = 18
    datosProyecto = @{
        nombre = "Test Lambda"
        cliente = "CPAU Test"
        ubicacion = "Buenos Aires"
        tipoObra = "Vivienda Unifamiliar"
        destinoUso = "Residencial"
    }
    datosObra = @{
        valorObra = 50000000
        superficie = 150
        valorMetro2 = 333333
        tipologia = "Vivienda Unifamiliar"
        complejidad = "Media"
    }
    tareasProfesionales = @{
        obraProyecto = $true
        obraDireccion = $true
        instalacionSanitaria = $false
        instalacionElectrica = $false
        instalacionTermomecanica = $false
        instalacionContraIncendio = $false
        proyectoEstructuras = $false
    }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "$endpoint/api/calculos/calcular" -Method POST -Body $body -ContentType "application/json"
```

### 2. Ver logs en CloudWatch

```powershell
# Ver logs en tiempo real
serverless logs -f api --stage qa --tail

# O via AWS Console
# CloudWatch → Log Groups → /aws/lambda/ch2026-backend-api-qa
```

---

## 🔄 Actualizar Lambda (Re-deployment)

```powershell
# Cuando hagas cambios en el código
serverless deploy --stage qa

# Solo actualizar función (más rápido)
serverless deploy function -f api --stage qa
```

---

## 🐛 Troubleshooting

### Error: No se puede conectar a RDS

**Causa**: Lambda no está en la misma VPC que RDS, o el Security Group no permite conexión.

**Solución**:
1. Descomentar sección `vpc` en `serverless.yml`
2. Agregar Lambda al mismo VPC/Subnet que RDS
3. Configurar Security Group de RDS para permitir tráfico desde Security Group de Lambda

### Error: Access Denied al leer Secrets Manager

**Causa**: El rol IAM de Lambda no tiene permisos.

**Solución**:
```powershell
# Agregar policy al rol de Lambda
aws iam attach-role-policy `
  --role-name ch2026-backend-api-qa-us-east-1-lambdaRole `
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

### Error: Timeout después de 3 segundos

**Causa**: Timeout por defecto muy bajo.

**Solución**: Aumentar timeout en `serverless.yml`:
```yaml
provider:
  timeout: 30
```

---

## 📚 Recursos Adicionales

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [API Gateway](https://docs.aws.amazon.com/apigateway/)

---

## 🔒 Seguridad - Checklist

- [ ] Credenciales en Secrets Manager (no en código)
- [ ] Lambda en VPC privada (si RDS está en VPC privada)
- [ ] Security Groups configurados correctamente
- [ ] CORS configurado solo para dominios autorizados
- [ ] Rate limiting habilitado
- [ ] CloudWatch logs habilitados
- [ ] IAM roles con permisos mínimos necesarios
- [ ] Variables de entorno no exponen datos sensibles
