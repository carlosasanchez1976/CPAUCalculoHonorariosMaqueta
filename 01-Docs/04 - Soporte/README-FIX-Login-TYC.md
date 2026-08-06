# 🔧 FIX: Endpoint Login - Agregar datos de TyC

**Fecha:** 2026-08-06  
**Tipo:** Fix post-implementación  
**Relacionado con:** SPEC029-CALC-Términos y condiciones

---

## 📋 Problema Detectado

El endpoint `POST /api/usuarios/login` **NO estaba devolviendo** los datos de aceptación de Términos y Condiciones del usuario:
- `tyc_aceptado_fecha`
- `tyc_version_aceptada`
- `tyc_id_aceptado`

Esto impedía que el frontend pudiera validar si el usuario debe aceptar los TyC al iniciar sesión.

---

## ✅ Solución Implementada

### 1. Backend - Controller (Node.js)

**Archivo modificado:** `App/Backend/Node/src/controllers/usuariosController.js`

**Cambio:** La respuesta del login ahora incluye los campos de TyC:

```javascript
// ANTES:
res.json({
  token: token,
  usuario: {
    id: usuario.user_id,
    role: usuario.rol
  }
});

// DESPUÉS:
res.json({
  token: token,
  usuario: {
    id: usuario.user_id,
    role: usuario.rol,
    tyc_aceptado_fecha: usuario.tyc_aceptado_fecha,
    tyc_version_aceptada: usuario.tyc_version_aceptada,
    tyc_id_aceptado: usuario.tyc_id_aceptado
  }
});
```

---

### 2. Base de Datos - Stored Procedures

**Problema:** Los SPs de consulta de usuarios **NO incluían** los campos de TyC en el SELECT.

**4 Stored Procedures actualizados:**

1. ✅ `Usuarios_Buscar_X_Id_Matricula.sql` (usado en login)
2. ✅ `Usuarios_Buscar.sql` (usado para obtener datos completos)
3. ✅ `Usuarios_Buscar_X_Email.sql` (usado en algunos flujos)
4. ✅ `Usuarios_Listar.sql` (usado por admin para listar usuarios)

Todos ahora incluyen en el SELECT:
```sql
tyc_aceptado_fecha,
tyc_version_aceptada,
tyc_id_aceptado
```

---

## 🚀 Cómo Aplicar el Fix

### Paso 1: Ejecutar Script SQL

Ejecuta el script consolidado que actualiza los 4 SPs:

```
App/Backend/DB/04-Scripts/Update_Usuarios_SPs_Add_TYC_Fields.sql
```

Este script:
- Actualiza los 4 stored procedures
- Incluye validación final
- Es **idempotente** (puede ejecutarse múltiples veces)

### Paso 2: Reiniciar Backend (si aplica)

Si el backend está corriendo, reinícialo para que tome los cambios del controller.

### Paso 3: Probar Login

```bash
POST /api/usuarios/login
Body: {
  "username_web": "csanchez",
  "matricula": "Arquitectura",
  "idmatricula": 999778,
  "tipoMatricula": "Arquitectura",
  "user_nombre_web": "Carlos",
  "user_apellido_web": "Sánchez"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGc...",
  "usuario": {
    "id": 7,
    "role": "ADMIN",
    "tyc_aceptado_fecha": null,
    "tyc_version_aceptada": null,
    "tyc_id_aceptado": null
  }
}
```

Si `tyc_aceptado_fecha` es `null` → **el frontend debe mostrar modal de TyC**

---

## 📊 Impacto

### ✅ Beneficios:
- El frontend puede validar si el usuario debe aceptar TyC
- Información completa en el login
- Los admin pueden ver el estado de TyC de todos los usuarios

### ⚠️ Breaking Changes:
- **NINGUNO** - Solo se agregan campos nuevos
- Los clientes existentes que no lean estos campos seguirán funcionando

---

## 🧪 Testing

### Casos a validar:

1. **Usuario sin TyC aceptado:**
   ```json
   "tyc_aceptado_fecha": null,
   "tyc_version_aceptada": null,
   "tyc_id_aceptado": null
   ```
   → Frontend debe mostrar modal de TyC

2. **Usuario con TyC aceptado:**
   ```json
   "tyc_aceptado_fecha": "2026-08-06T10:30:00.000Z",
   "tyc_version_aceptada": "1.0",
   "tyc_id_aceptado": 1
   ```
   → Frontend permite acceso directo

3. **Usuario con TyC desactualizado:**
   - Si `tyc_version_aceptada` !== versión vigente actual
   - O si `tyc_aceptado_fecha` es `null` (reseteo por nueva versión)
   → Frontend debe mostrar modal nuevamente

---

## 📝 Archivos Modificados

### Backend (Node.js)
- ✅ `App/Backend/Node/src/controllers/usuariosController.js`

### Database (SQL)
- ✅ `App/Backend/DB/03-Sps/Usuarios_Buscar_X_Id_Matricula.sql`
- ✅ `App/Backend/DB/03-Sps/Usuarios_Buscar.sql`
- ✅ `App/Backend/DB/03-Sps/Usuarios_Buscar_X_Email.sql`
- ✅ `App/Backend/DB/03-Sps/Usuarios_Listar.sql`

### Nuevos archivos
- ✅ `App/Backend/DB/04-Scripts/Update_Usuarios_SPs_Add_TYC_Fields.sql` (script consolidado)
- ✅ `01-Docs/04 - Soporte/README-FIX-Login-TYC.md` (este archivo)

---

## 🔗 Referencias

- **SPEC Original:** `01-Docs/00-Specs/SPEC029-CALC-Términos y condiciones.md`
- **Tests TyC:** `01-Docs/04 - Soporte/README-SPEC029-Tests.md`
- **Postman Collection:** `01-Docs/04 - Soporte/SPEC029-TYC-Postman-Collection.json`

---

## ✅ Checklist de Implementación

- [ ] Ejecuté el script `Update_Usuarios_SPs_Add_TYC_Fields.sql`
- [ ] Verifiqué que los 4 SPs se actualizaron correctamente
- [ ] Reinicié el backend (si estaba corriendo)
- [ ] Probé el login y confirmo que devuelve los campos de TyC
- [ ] Validé el comportamiento con usuario SIN TyC aceptado (campos en null)
- [ ] Validé el comportamiento con usuario CON TyC aceptado (campos con valores)

---

**¡Fix aplicado correctamente! 🎉**
