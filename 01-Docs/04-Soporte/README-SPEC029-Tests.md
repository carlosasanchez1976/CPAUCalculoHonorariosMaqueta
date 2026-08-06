# 🧪 SPEC029 - Tests Automatizados de Términos y Condiciones

**SPEC:** SPEC029-CALC-Términos y condiciones  
**TICKET:** T029-014  
**Fecha:** 2026-08-06  
**Ambiente:** QA

---

## 📋 ¿Qué incluye este test suite?

Una colección completa de Postman con **12 requests automatizados** que prueban:

✅ Endpoints públicos (sin autenticación)  
✅ Endpoints protegidos (con JWT)  
✅ Permisos por rol (ADMIN vs WEBUSER)  
✅ Validaciones de negocio  
✅ Casos de error (401, 403, 404)  
✅ Flujo completo de gestión de TyC  

---

## 🚀 Guía de Uso Rápido

### Paso 1: Importar en Postman

1. Abre **Postman** (Desktop o Web)
2. Click en **"Import"** (arriba izquierda)
3. Selecciona los 2 archivos:
   - `SPEC029-TYC-Postman-Collection.json`
   - `SPEC029-TYC-QA-Environment.json`
4. Click **"Import"**

---

### Paso 2: Configurar Credenciales

1. En Postman, ve a **Environments** (icono ⚙️)
2. Selecciona **"SPEC029 TyC - QA Environment"**
3. Edita las variables:

   ```
   admin_email      → email real de un usuario ADMIN en QA
   admin_password   → password real del usuario ADMIN
   webuser_email    → email real de un usuario WEBUSER en QA
   webuser_password → password real del usuario WEBUSER
   ```

4. Click **"Save"** o `Ctrl+S`

⚠️ **Importante:** Necesitas 2 usuarios reales en la BD de QA:
- Uno con `rol = 'ADMIN'`
- Otro con `rol = 'WEBUSER'`

---

### Paso 3: Ejecutar Tests

**Opción A: Ejecutar todos los tests automáticamente** (recomendado)

1. Click derecho en la colección **"SPEC029 - Términos y Condiciones - Tests"**
2. Selecciona **"Run collection"**
3. Asegúrate que el environment **"SPEC029 TyC - QA Environment"** esté seleccionado
4. Click **"Run SPEC029..."**
5. ⏱️ **Espera ~10 segundos** mientras corre la suite completa
6. ✅ Revisa el reporte: **Verde = Pasó**, **Rojo = Falló**

**Opción B: Ejecutar requests uno por uno**

1. Selecciona el environment **"SPEC029 TyC - QA Environment"**
2. Abre cada request en orden (01 → 12)
3. Click **"Send"**
4. Revisa la pestaña **"Test Results"** (abajo)

---

## 📊 Requests Incluidos

### 🟢 1. PÚBLICO - Obtener TyC Vigente
- **Método:** `GET /api/terminos-condiciones/vigente`
- **Auth:** Ninguna (público)
- **Tests:**
  - ✅ Status 200 OK
  - ✅ Respuesta tiene tyc_id
  - ✅ Campo vigente es true
  - ✅ Versión es 1.0
  - ✅ Contenido Markdown presente (>10k chars)

---

### 🔐 2. LOGIN - Obtener Token ADMIN
- **Método:** `POST /api/usuarios/login`
- **Body:** `{ email, password }` (admin)
- **Tests:**
  - ✅ Status 200 OK
  - ✅ Respuesta tiene token JWT
  - ✅ Usuario es ADMIN
  - 💾 Guarda `admin_token` y `admin_user_id` en environment

---

### 🔐 3. LOGIN - Obtener Token WEBUSER
- **Método:** `POST /api/usuarios/login`
- **Body:** `{ email, password }` (webuser)
- **Tests:**
  - ✅ Status 200 OK
  - ✅ Respuesta tiene token JWT
  - ✅ Usuario es WEBUSER
  - 💾 Guarda `webuser_token` y `webuser_user_id` en environment

---

### 🔒 4. ADMIN - Listar Histórico TyC
- **Método:** `GET /api/terminos-condiciones`
- **Auth:** Bearer `{{admin_token}}`
- **Tests:**
  - ✅ Status 200 OK
  - ✅ Respuesta es array
  - ✅ Hay al menos 1 TyC
  - ✅ Contenido truncado a 200 chars

---

### 🔒 5. ADMIN - Buscar TyC por ID
- **Método:** `GET /api/terminos-condiciones/{{tyc_id_vigente}}`
- **Auth:** Bearer `{{admin_token}}`
- **Tests:**
  - ✅ Status 200 OK
  - ✅ tyc_id correcto
  - ✅ Contenido completo (>10k chars)

---

### 👤 6. WEBUSER - Usuario Acepta TyC
- **Método:** `POST /api/usuarios/{{webuser_user_id}}/aceptar-terminos`
- **Auth:** Bearer `{{webuser_token}}`
- **Body:** `{ tyc_id: {{tyc_id_vigente}} }`
- **Tests:**
  - ✅ Status 200 OK
  - ✅ success = true
  - ✅ Mensaje de confirmación

---

### ❌ 7. ERROR - Usuario intenta aceptar por otro
- **Método:** `POST /api/usuarios/{{admin_user_id}}/aceptar-terminos`
- **Auth:** Bearer `{{webuser_token}}` (intenta aceptar para admin)
- **Tests:**
  - ✅ Status 403 Forbidden
  - ✅ Error "No autorizado"

---

### ❌ 8. ERROR - WEBUSER intenta listar TyC (sin permiso)
- **Método:** `GET /api/terminos-condiciones`
- **Auth:** Bearer `{{webuser_token}}`
- **Tests:**
  - ✅ Status 403 Forbidden
  - ✅ Error de rol

---

### ❌ 9. ERROR - Sin token intenta listar TyC
- **Método:** `GET /api/terminos-condiciones`
- **Auth:** Ninguna
- **Tests:**
  - ✅ Status 401 Unauthorized
  - ✅ Error de autenticación

---

### 🔒 10. ADMIN - Crear Nuevo TyC (v1.1) sin activar
- **Método:** `POST /api/terminos-condiciones`
- **Auth:** Bearer `{{admin_token}}`
- **Body:**
  ```json
  {
    "version": "1.1",
    "contenido_md": "# Términos y Condiciones v1.1...",
    "activar": false
  }
  ```
- **Tests:**
  - ✅ Status 201 Created
  - ✅ Versión = 1.1
  - ✅ vigente = false (borrador)
  - 💾 Guarda `tyc_id_nuevo` en environment

---

### 🔒 11. ADMIN - Activar TyC v1.1 (resetea usuarios)
- **Método:** `PUT /api/terminos-condiciones/{{tyc_id_nuevo}}/activar`
- **Auth:** Bearer `{{admin_token}}`
- **Tests:**
  - ✅ Status 200 OK
  - ✅ Mensaje "activado"
  - 💾 Actualiza `tyc_id_vigente` con el nuevo

---

### 🟢 12. VERIFICAR - Nuevo TyC vigente
- **Método:** `GET /api/terminos-condiciones/vigente`
- **Auth:** Ninguna
- **Tests:**
  - ✅ Status 200 OK
  - ✅ Versión ahora es 1.1
  - ✅ vigente = true

---

## 🎯 Resultados Esperados

### ✅ Todos los tests PASAN (verde):

```
Test Results
✅ Status 200 OK
✅ Respuesta tiene tyc_id
✅ Campo vigente es true
✅ Versión es 1.0
✅ Contenido Markdown presente

12/12 tests passed
```

### 📊 Estadísticas Finales:

- **Total requests:** 12
- **Assertions:** ~40+
- **Duración:** ~10 segundos
- **Pass rate esperado:** 100%

---

## 🔍 Variables de Environment (automáticas)

Estas variables se guardan **automáticamente** durante la ejecución:

| Variable           | Se guarda en          | Valor                      |
|--------------------|-----------------------|----------------------------|
| `admin_token`      | Request 02 (Login)    | JWT del admin              |
| `admin_user_id`    | Request 02 (Login)    | ID del usuario admin       |
| `webuser_token`    | Request 03 (Login)    | JWT del webuser            |
| `webuser_user_id`  | Request 03 (Login)    | ID del usuario webuser     |
| `tyc_id_vigente`   | Request 01 (Vigente)  | ID del TyC vigente actual  |
| `tyc_id_nuevo`     | Request 10 (Crear)    | ID del nuevo TyC creado    |

✅ **No necesitas configurarlas manualmente** — se populan solas al correr los tests.

---

## ⚠️ Notas Importantes

### 🔄 Estado de la BD después de ejecutar

Al finalizar la suite completa:

1. ✅ Existirá un TyC **v1.0** (el original)
2. ✅ Existirá un TyC **v1.1** (creado en test 10)
3. ✅ El TyC **v1.1** estará **vigente** (activado en test 11)
4. ✅ El TyC **v1.0** estará **NO vigente** (desactivado automáticamente)
5. ⚠️ **TODOS los usuarios** tendrán `tyc_aceptado_fecha = NULL` (reseteados al activar v1.1)
6. ✅ El usuario WEBUSER habrá aceptado TyC en el test 06 (pero se resetea en test 11)

### 🔁 ¿Puedo ejecutar los tests múltiples veces?

**SÍ**, pero considera:

- El test 10 **creará un nuevo TyC v1.1** cada vez que se ejecute
- Si ya existe un TyC v1.1, se creará otro registro (versionado)
- Los tests están diseñados para ser **idempotentes** cuando sea posible

**Recomendación:** Limpia la BD de TyC de prueba antes de re-ejecutar:

```sql
-- Borrar TyCs de prueba (SOLO en QA)
DELETE FROM Terminos_Condiciones WHERE version LIKE '1.1%';

-- Reactivar TyC v1.0
UPDATE Terminos_Condiciones SET vigente = TRUE WHERE version = '1.0';

-- Resetear usuarios
UPDATE usuarios SET 
  tyc_aceptado_fecha = NULL,
  tyc_version_aceptada = NULL,
  tyc_id_aceptado = NULL;
```

---

## 🆘 Troubleshooting

### ❌ Error: "401 Unauthorized" en request 02 o 03

**Causa:** Credenciales incorrectas en el environment

**Solución:**
1. Verifica que `admin_email` y `admin_password` sean correctos
2. Verifica que el usuario exista en la BD de QA
3. Prueba el login manualmente con esas credenciales

---

### ❌ Error: "Cannot read property 'tyc_id' of undefined"

**Causa:** No se ejecutó el request 01 primero

**Solución:**
- **Siempre ejecuta los requests en orden** (01 → 12)
- O ejecuta toda la colección con "Run collection"

---

### ❌ Error: "404 Not Found" en request 05

**Causa:** No existe TyC vigente en la BD

**Solución:**
1. Ejecuta el script `Insert_TYC_v1.0.sql` (TICKET-029-013)
2. O verifica que existe un TyC con `vigente = TRUE`

---

### ❌ Error: Test falla en "Versión es 1.0"

**Causa:** Ya existe un TyC v1.1 vigente de ejecuciones anteriores

**Solución:**
- Limpia la BD con el script SQL de arriba
- O actualiza el test para esperar la versión correcta

---

### ❌ "Error connecting to API"

**Causa:** API de QA no está disponible

**Solución:**
1. Verifica que la URL sea correcta: `https://cpau-ch2026-api-qa.neosisweb.ar`
2. Prueba el health check: `GET /health`
3. Verifica conectividad con: `ping cpau-ch2026-api-qa.neosisweb.ar`

---

## 📝 Logs y Debugging

### Ver respuestas completas:

1. Click en un request
2. Pestaña **"Body"** → ver JSON de respuesta
3. Pestaña **"Test Results"** → ver assertions
4. Pestaña **"Console"** (abajo) → ver logs HTTP

### Ver variables actuales:

1. Click en **Environment** (icono ⚙️)
2. Selecciona **"SPEC029 TyC - QA Environment"**
3. Ve columna **"Current Value"**

---

## 🎓 Tips Avanzados

### Ejecutar solo tests específicos:

1. Desmarca los requests que no quieras ejecutar
2. Run collection → solo correrá los marcados

### Exportar resultados:

1. Run collection → cuando termine
2. Click **"Export Results"**
3. Guarda el JSON o PDF del reporte

### Integración CI/CD:

Puedes ejecutar esta colección desde Newman (CLI):

```bash
npm install -g newman
newman run SPEC029-TYC-Postman-Collection.json \
  -e SPEC029-TYC-QA-Environment.json \
  --reporters cli,json
```

---

## 📚 Referencias

- **SPEC Completa:** `01-Docs/00-Specs/SPEC029-CALC-Términos y condiciones.md`
- **Script de inserción:** `App/Backend/DB/04-Scripts/Insert_TYC_v1.0.sql`
- **API Base URL:** https://cpau-ch2026-api-qa.neosisweb.ar
- **Frontend QA:** https://cpau-ch2026-qa.neosisweb.ar

---

## ✅ Checklist Final

Antes de marcar TICKET-029-014 como completado:

- [ ] Importé la colección en Postman
- [ ] Importé el environment en Postman
- [ ] Configuré credenciales reales de QA
- [ ] Ejecuté toda la colección con "Run collection"
- [ ] Todos los tests pasaron (12/12 verde)
- [ ] Revisé que TyC v1.1 quedó vigente
- [ ] Documenté cualquier issue encontrado

---

**¡Happy Testing! 🧪🚀**
