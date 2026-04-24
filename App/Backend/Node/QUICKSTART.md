# 🚀 Quick Start - Deployment a AWS Lambda

Comandos esenciales para desplegar el backend CH2026 a AWS Lambda.

---

## ⚡ Pre-requisitos Rápidos

```powershell
# 1. Instalar Serverless Framework
npm install -g serverless

# 2. Instalar dependencias del proyecto
cd App\Backend\Node
npm install

# 3. Configurar credenciales AWS
serverless config credentials --provider aws --key TU_ACCESS_KEY --secret TU_SECRET_KEY
```

---

## 🔐 Configurar Secret en AWS (una sola vez)

### Opción A: Via AWS Console (más fácil)
1. Ir a: https://console.aws.amazon.com/secretsmanager/
2. Click en "Store a new secret"
3. Tipo: "Other type of secret"
4. Key/value pairs:
   ```
   DB_HOST: cpau-ch-qa.xxxxx.us-east-1.rds.amazonaws.com
   DB_USER: CPAU_qa
   DB_PASSWORD: tu_password_seguro
   DB_NAME: cpau_ch_qa
   DB_PORT: 3306
   ```
5. Secret name: `cpau-ch-qa-db-credentials`
6. Next → Next → Store

### Opción B: Via AWS CLI

```powershell
aws secretsmanager create-secret `
  --name cpau-ch-qa-db-credentials `
  --description "DB credentials para CH2026 (QA)" `
  --secret-string '{\"DB_HOST\":\"tu-rds-endpoint.us-east-1.rds.amazonaws.com\",\"DB_USER\":\"CPAU_qa\",\"DB_PASSWORD\":\"password_seguro\",\"DB_NAME\":\"cpau_ch_qa\",\"DB_PORT\":\"3306\"}'
```

---

## 🚀 Deploy a AWS

### Deploy completo (primera vez)

```powershell
# QA
npm run deploy:qa

# Producción (cuando esté listo)
npm run deploy:prod
```

### Deploy solo función (más rápido para updates)

```powershell
serverless deploy function -f api --stage qa
```

---

## ✅ Verificar que funciona

Después del deploy, Serverless te dará un endpoint como:
```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
```

### Test desde PowerShell

```powershell
# 1. Guardar el endpoint
$endpoint = "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com"

# 2. Test POST - Calcular honorarios
$body = @{
    usuarioId = 2
    tareaId = 18
    datosProyecto = @{
        nombre = "Test Lambda Deployment"
        cliente = "Cliente Test"
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

# 3. Ejecutar request
$response = Invoke-RestMethod -Uri "$endpoint/api/calculos/calcular" -Method POST -Body $body -ContentType "application/json"

# 4. Ver respuesta
$response | ConvertTo-Json -Depth 10
```

---

## 📊 Ver Logs en CloudWatch

```powershell
# Logs en tiempo real
npm run logs

# O manualmente
serverless logs -f api --stage qa --tail
```

---

## 🔄 Actualizar Frontend con nuevo endpoint

```javascript
// En Frontend: src/services/honorariosService.js
const API_BASE_URL = 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/api';
```

---

## 🗑️ Eliminar deployment (si necesitas)

```powershell
serverless remove --stage qa
```

---

## 🐛 Si algo falla

### Error: "Unable to get credentials"
```powershell
# Reconfigurar credentials
aws configure
```

### Error: "Access Denied" en Secrets Manager
1. Ir a IAM → Roles
2. Buscar: `ch2026-backend-api-qa-us-east-1-lambdaRole`
3. Attach policy: `SecretsManagerReadWrite`

### Error: "Connection timeout" a RDS
- Tu Lambda necesita estar en la misma VPC que RDS
- Descomentar sección `vpc` en `serverless.yml`
- Configurar Security Group para permitir conexión desde Lambda

---

## 📝 Comandos útiles

```powershell
# Ver info del deployment
npm run info

# Deploy completo
npm run deploy:qa

# Deploy solo función (rápido)
serverless deploy function -f api --stage qa

# Ver logs
npm run logs

# Información detallada
serverless info --stage qa --verbose

# Eliminar stack completo
npm run remove
```

---

## 🎯 Próximos pasos

1. ✅ Deploy exitoso a Lambda
2. ✅ Test del endpoint
3. 📝 Actualizar URL en frontend
4. 🔒 Configurar dominio personalizado (opcional)
5. 📊 Configurar alertas en CloudWatch (opcional)
6. 🚀 Deploy a producción cuando esté listo
