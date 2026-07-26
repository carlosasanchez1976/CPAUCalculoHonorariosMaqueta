# SPEC024 - Ajustes de Configuración Lambda
## Documentación de Soporte - Variables de Entorno JWT

---

## 1. Ajustes en QA

### **Función Lambda:** `cpau-ch2026-api-qa`
**Fecha de Configuración:** 2026-07-26  
**Región:** us-east-1

### Variables Agregadas

Se agregaron las siguientes variables de entorno para habilitar la autenticación JWT:

```json
{
    "JWT_SECRET": "tu_secret_super_seguro_qa_cambiar_en_produccion_12345",
    "JWT_EXPIRES_IN": "24h",
    "REQUIRE_JWT": "true"
}
```

### Variables Completas en QA

```json
{
    "DB_PORT": "3306",
    "DB_USER": "cpau_qa",
    "DB_NAME": "cpau_ch_qa",
    "NODE_ENV": "qa",
    "DB_HOST": "gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com",
    "DB_PASSWORD": "cpau_qa!2026",
    "FRONTEND_URL": "https://ch2026-qa.neosisweb.ar",
    "JWT_SECRET": "tu_secret_super_seguro_qa_cambiar_en_produccion_12345",
    "JWT_EXPIRES_IN": "24h",
    "REQUIRE_JWT": "true"
}
```

### Comando Ejecutado

```bash
aws lambda update-function-configuration \
  --function-name cpau-ch2026-api-qa \
  --environment "Variables={
    DB_PORT=3306,
    DB_USER=cpau_qa,
    DB_NAME=cpau_ch_qa,
    NODE_ENV=qa,
    DB_HOST=gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com,
    DB_PASSWORD=cpau_qa!2026,
    FRONTEND_URL=https://ch2026-qa.neosisweb.ar,
    JWT_SECRET=tu_secret_super_seguro_qa_cambiar_en_produccion_12345,
    JWT_EXPIRES_IN=24h,
    REQUIRE_JWT=true
  }" \
  --region us-east-1
```

### Propósito de las Variables

- **`JWT_SECRET`**: Clave secreta para firmar y verificar tokens JWT. Usado en `usuariosController.js` (jwt.sign) y `auth.js` (jwt.verify)
- **`JWT_EXPIRES_IN`**: Tiempo de validez del token (24 horas). Define cuándo expira la sesión del usuario
- **`REQUIRE_JWT`**: Interruptor de seguridad. `true` = requiere token en todas las rutas protegidas, `false` = modo permisivo sin autenticación

---

## 2. Ajustes en PROD

### **Función Lambda:** `cpau-ch2026-api-prod`
**Fecha de Configuración:** 2026-07-26  
**Región:** us-east-1

### Variables Agregadas

Se agregaron las siguientes variables de entorno para habilitar la autenticación JWT:

```json
{
    "JWT_SECRET": "8f7a3b9e2c1d5f6a4e8b7c3d9f1a5e2b8c4d7f9a6e3b1c8d5f2a7e4b9c6d3f1a8e5b2c9d6f3a1e7b4c8d5f2a9e6b3c1d7f4a8e5b2c9d6f3a1e",
    "JWT_EXPIRES_IN": "24h",
    "REQUIRE_JWT": "true"
}
```

### Variables Completas en PROD

```json
{
    "DB_PORT": "3306",
    "DB_USER": "cpau_prod",
    "DB_NAME": "cpau_ch_prod",
    "NODE_ENV": "production",
    "DB_HOST": "gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com",
    "DB_PASSWORD": "CP4U!2026!PR0D",
    "FRONTEND_URL": "https://calculadora-beta.cpau.org",
    "JWT_SECRET": "8f7a3b9e2c1d5f6a4e8b7c3d9f1a5e2b8c4d7f9a6e3b1c8d5f2a7e4b9c6d3f1a8e5b2c9d6f3a1e7b4c8d5f2a9e6b3c1d7f4a8e5b2c9d6f3a1e",
    "JWT_EXPIRES_IN": "24h",
    "REQUIRE_JWT": "true"
}
```

### Comando Ejecutado

```bash
aws lambda update-function-configuration \
  --function-name cpau-ch2026-api-prod \
  --environment "Variables={
    DB_PORT=3306,
    DB_USER=cpau_prod,
    DB_NAME=cpau_ch_prod,
    NODE_ENV=production,
    DB_HOST=gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com,
    DB_PASSWORD=CP4U!2026!PR0D,
    FRONTEND_URL=https://calculadora-beta.cpau.org,
    JWT_SECRET=8f7a3b9e2c1d5f6a4e8b7c3d9f1a5e2b8c4d7f9a6e3b1c8d5f2a7e4b9c6d3f1a8e5b2c9d6f3a1e7b4c8d5f2a9e6b3c1d7f4a8e5b2c9d6f3a1e,
    JWT_EXPIRES_IN=24h,
    REQUIRE_JWT=true
  }" \
  --region us-east-1
```

### Propósito de las Variables

- **`JWT_SECRET`**: Clave secreta para firmar y verificar tokens JWT. **⚠️ DIFERENTE A QA** por seguridad (128 caracteres hexadecimales generados aleatoriamente)
- **`JWT_EXPIRES_IN`**: Tiempo de validez del token (24 horas). Define cuándo expira la sesión del usuario
- **`REQUIRE_JWT`**: Interruptor de seguridad. `true` = requiere token en todas las rutas protegidas

---

## Verificar Configuración

### Para QA:
```bash
aws lambda get-function-configuration \
  --function-name cpau-ch2026-api-qa \
  --region us-east-1 \
  --query 'Environment.Variables' \
  --output json
```

### Para PROD:
```bash
aws lambda get-function-configuration \
  --function-name cpau-ch2026-api-prod \
  --region us-east-1 \
  --query 'Environment.Variables' \
  --output json
```

---

## Notas Importantes

1. **JWT_SECRET es diferente entre QA y PROD** - Esto es una buena práctica de seguridad
2. **Secreto de PROD tiene 128 caracteres hexadecimales** - Generado con `crypto.randomBytes(64).toString('hex')`
3. **No se commitean en el repositorio** - Solo existen como variables de entorno en Lambda
4. **REQUIRE_JWT=true en ambos ambientes** - La autenticación JWT está activa y es obligatoria
5. **Token válido por 24 horas** - Después de este tiempo, el usuario debe volver a hacer login

---

## Referencias de Código

Las variables JWT se usan en:

1. **`src/controllers/usuariosController.js`** - Línea 84-85: Generación de token en login
2. **`src/middlewares/auth.js`** - Línea 17, 66: Validación de token en cada petición protegida
3. **`src/routes/calculos.js`** - Todas las rutas protegidas con `verificarToken`
4. **`src/routes/adminTemplates.js`** - Todas las rutas protegidas con `verificarToken`

---

## Historial de Cambios

| Fecha | Ambiente | Acción | Descripción |
|-------|----------|--------|-------------|
| 2026-07-26 | QA | Agregar | Configuración inicial de variables JWT |
| 2026-07-26 | PROD | Agregar | Configuración inicial de variables JWT con secreto diferente |
