# 🔧 Deployment Manual con ZIP (Método Tradicional)


### 1. Generar el ZIP

No se hace, se debe utilizar el que estça ok en QA.

### 1. Subir ZIP a S3

No se hace, se debe utilizar el que estça ok en QA.


# Actualizar Lambda PROD usando el ZIP que ya está en S3
aws lambda update-function-code `
  --function-name cpau-ch2026-api-prod `
  --s3-bucket cpau-lambda-deployments `
  --s3-key ch2026-backend-api-lambda.zip `
  --region us-east-1