# 🔧 Deployment Manual con ZIP (Método Tradicional)

Si ya tienes una función Lambda existente en AWS y quieres actualizarla manualmente (como en tu otro proyecto).

---

## 📦 Método Rápido: 2 pasos

### 1. Generar el ZIP
```powershell
npm run package
```

Esto crea: `ch2026-backend-api-lambda.zip`

### 2. Subir a Lambda

**Opción A - AWS CLI (más rápido):**
```powershell
# QA
npm run upload:qa

# Producción
npm run upload:prod
```

**Opción B - AWS Console (más visual):**
1. Ir a: https://console.aws.amazon.com/lambda/
2. Seleccionar tu función: `ch2026-backend-api-qa`
3. Sección "Code" → Upload from → .zip file
4. Seleccionar: `ch2026-backend-api-lambda.zip`
5. Click "Save"

---

## ⚙️ Configuración Inicial (Una sola vez)

Si es la **primera vez** que creas la función Lambda, necesitas:

### 1. Crear función Lambda en AWS Console

1. AWS Console → Lambda → Create Function
2. Configuración:
   - **Name**: `ch2026-backend-api-qa`
   - **Runtime**: Node.js 18.x
   - **Architecture**: x86_64
   - **Permissions**: Create new role with basic Lambda permissions

3. Después de crear, configurar:

#### Handler:
```
lambda.handler
```

#### Memory:
```
512 MB (QA)
1024 MB (Prod recomendado)
```

#### Timeout:
```
30 segundos
```

#### Environment Variables:
```
NODE_ENV=qa
SECRET_NAME=cpau-ch-qa-db-credentials
AWS_REGION=us-east-1
```

### 2. Crear API Gateway HTTP API

1. AWS Console → API Gateway → Create API → HTTP API
2. Add Integration:
   - Type: Lambda
   - Lambda function: `ch2026-backend-api-qa`
   - Version: 2.0
3. Configure routes:
   - `ANY /api/{proxy+}`
   - `ANY /api`
4. Configure CORS:
   - Allowed origins: 
     - `http://localhost:5173`
     - `https://*.vercel.app`
     - Tu dominio de producción
   - Allowed headers:
     - `Content-Type`
     - `Authorization`
     - `X-Requested-With`
     - `X-API-Version`
   - Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`
5. Deploy

Anotar el endpoint generado:
```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

### 3. Configurar permisos IAM

La función Lambda necesita permisos para:

#### Secrets Manager (leer credenciales DB):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:cpau-ch-*"
    }
  ]
}
```

Agregar policy al rol de Lambda:
1. Lambda → Configuration → Permissions
2. Click en el rol (se abre IAM)
3. Add permissions → Attach policies
4. Buscar: `SecretsManagerReadWrite` (o crear policy personalizada arriba)

#### VPC Access (si RDS está en VPC privada):
1. Lambda → Configuration → VPC
2. Edit:
   - VPC: Mismo que RDS
   - Subnets: Subnets privadas (mínimo 2)
   - Security groups: Crear o usar uno que permita:
     - Outbound: MySQL port 3306 al Security Group de RDS
3. El rol Lambda necesitará automáticamente:
   - `AWSLambdaVPCAccessExecutionRole`

### 4. Configurar Security Group de RDS

1. RDS → Tu instancia → Security
2. Security Group → Edit inbound rules
3. Add rule:
   - Type: MySQL/Aurora (port 3306)
   - Source: Security Group de Lambda
   - Description: "Lambda access"

---

## 🔄 Workflow Diario (Updates)

Cada vez que hagas cambios en el código:

```powershell
# 1. Generar ZIP
npm run package

# 2. Subir a Lambda
npm run upload:qa
```

O manualmente desde AWS Console (Upload .zip).

---

## ✅ Verificar Deployment

### Test desde PowerShell:

```powershell
# Tu endpoint de API Gateway
$endpoint = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com"

# Test
$body = @{
    usuarioId = 2
    tareaId = 18
    datosProyecto = @{
        nombre = "Test Deployment"
        cliente = "Test"
        ubicacion = "CABA"
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

### Ver logs:

AWS Console → CloudWatch → Log Groups → `/aws/lambda/ch2026-backend-api-qa`

---

## 🐛 Troubleshooting

### Error: "Unable to import module 'lambda'"
- Verificar que el handler esté configurado como: `lambda.handler`
- Verificar que `lambda.js` esté en la raíz del ZIP

### Error: "Task timed out after 3.00 seconds"
- Aumentar timeout en Lambda Configuration
- Verificar que RDS esté accesible (VPC/Security Groups)

### Error: "Cannot connect to MySQL"
- Verificar variables de entorno: `SECRET_NAME`, `AWS_REGION`
- Verificar permisos IAM para Secrets Manager
- Verificar Security Groups (Lambda → RDS)
- Verificar que Lambda esté en la VPC correcta

### Error: "Access Denied" en Secrets Manager
- Agregar policy `SecretsManagerReadWrite` al rol de Lambda

---

## 📋 Checklist Deployment

- [ ] Secret creado en Secrets Manager
- [ ] Función Lambda creada
- [ ] Handler configurado: `lambda.handler`
- [ ] Variables de entorno configuradas
- [ ] Permisos IAM (Secrets Manager + VPC si aplica)
- [ ] API Gateway HTTP API creada
- [ ] Routes configuradas: `ANY /api/{proxy+}`
- [ ] CORS configurado
- [ ] Security Groups configurados (Lambda → RDS)
- [ ] ZIP generado: `npm run package`
- [ ] ZIP subido a Lambda
- [ ] Endpoint testeado

---

## 🆚 Comparación con Serverless Framework

| Aspecto | Manual (ZIP) | Serverless Framework |
|---------|--------------|---------------------|
| Setup inicial | Manual (AWS Console) | Automático (1 comando) |
| Updates | `npm run package` + upload | `npm run deploy:qa` |
| Infraestructura | Manual | Como código (YAML) |
| Rollback | Manual | Automático |
| Multi-ambiente | Duplicar recursos | Gestión automática |
| Curva aprendizaje | ✅ Simple | 🟡 Media |
| Recomendado para | Proyectos pequeños, equipos chicos | Proyectos grandes, CI/CD |

---

## 💡 Tip

Si vas a deployar frecuentemente, considera usar Serverless Framework. Pero si ya tienes todo configurado y solo quieres actualizar código, el método ZIP es perfectamente válido.













Sí, lo tengo en el contexto. El proceso fue:

## 📦 Deployment vía S3 (por tamaño > 50 MB)

### Comandos que usamos:

```powershell
# 1. Empaquetar (genera ch2026-backend-api-lambda.zip ~80 MB)
npm run package

# 2. Subir a S3
aws s3 cp ch2026-backend-api-lambda.zip s3://cpau-lambda-deployments/ --region us-east-1

# 3. Actualizar Lambda desde S3
aws lambda update-function-code --function-name cpau-ch2026-api-qa --s3-bucket cpau-lambda-deployments --s3-key ch2026-backend-api-lambda.zip --region us-east-1
```

### Configuración Lambda:
- **Memoria:** 1024 MB (requerido para Puppeteer + Chromium)
- **Timeout:** 30 segundos
- **Runtime:** Node.js 24.x

### Dependencias que aumentan el tamaño:
- `puppeteer-core`: ^25.1.0
- `@sparticuz/chromium`: ^149.0.0 (~50 MB del binario Chromium)
- **Ahora con Handlebars:** añade ~500 KB más

**Handlebars no debería cambiar mucho el tamaño del ZIP** (es liviano), así que seguís usando el mismo proceso S3.

¿Ya generaste el nuevo ZIP con Handlebars incluido? ¿Necesitás ayuda con algún paso del deployment?
