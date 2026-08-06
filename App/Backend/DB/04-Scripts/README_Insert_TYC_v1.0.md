# Instrucciones: Inserción de Términos y Condiciones v1.0

**SPEC:** SPEC029-CALC-Términos y condiciones (TICKET-029-013)  
**Fecha:** 2026-08-06  
**Script:** `Insert_TYC_v1.0.sql`

---

## ⚠️ IMPORTANTE - PREREQUISITOS

Antes de ejecutar este script, **verifica que estén creados**:

1. ✅ Tabla `Terminos_Condiciones` (TICKET-029-001)
2. ✅ Campos TyC en tabla `Usuarios` (TICKET-029-002)
3. ✅ Stored Procedure `Terminos_Condiciones_Grabar` (TICKET-029-003)

---

## 📋 PASOS PARA EJECUTAR

### 1. Identificar un usuario ADMIN

Ejecuta esta consulta para obtener un usuario con rol ADMIN:

```sql
SELECT user_id, user_nombre, user_mail, rol
FROM usuarios 
WHERE rol = 'ADMIN' 
LIMIT 1;
```

**Anota el `user_id`** que vas a usar (ejemplo: `1`).

---

### 2. Editar el script

Abre el archivo `Insert_TYC_v1.0.sql` y busca la línea:

```sql
SET @user_id = NULL; -- ⚠️ CAMBIAR ESTO por un user_id de ADMIN válido (ej: 1)
```

Cámbiala por el `user_id` real, ejemplo:

```sql
SET @user_id = 1; -- Usuario admin obtenido en el paso 1
```

---

### 3. Ejecutar el script

En tu cliente MySQL (Workbench, DBeaver, o línea de comandos), ejecuta el script completo.

El script realizará automáticamente:

- ✅ Insertar el nuevo TyC con versión '1.0'
- ✅ Marcarlo como `vigente = TRUE`
- ✅ Resetear `tyc_aceptado_fecha = NULL` para **TODOS** los usuarios
- ✅ Mostrar validaciones para confirmar la inserción

---

### 4. Verificar los resultados

El script muestra 3 consultas de validación:

#### a) Validación del registro insertado:
```
tyc_id | version | vigente | fecha_vigencia | user_id | created_at | contenido_length
-------|---------|---------|----------------|---------|------------|------------------
   1   |   1.0   |    1    |   2026-08-05   |    1    | 2026-08-06 |      33868
```

**Esperado:**
- `vigente = 1` (TRUE)
- `contenido_length ≈ 33868` caracteres
- `fecha_vigencia = 2026-08-05`

#### b) Validación del TyC vigente:
```
tyc_id | version | vigente | fecha_vigencia
-------|---------|---------|---------------
   1   |   1.0   |    1    |   2026-08-05
```

**Esperado:** Solo 1 registro con `vigente = 1`.

#### c) Validación de usuarios pendientes:
```
usuarios_pendientes | total_usuarios
--------------------|---------------
         10         |       10
```

**Esperado:** `usuarios_pendientes` debe ser **igual** a `total_usuarios` (todos con `tyc_aceptado_fecha = NULL`).

---

## 🧪 5. Probar el endpoint público

Abre un navegador o Postman y ejecuta:

```
GET https://cpau-ch2026-api-qa.neosisweb.ar/api/terminos-condiciones/vigente
```

**Respuesta esperada (200 OK):**
```json
{
  "tyc_id": 1,
  "version": "1.0",
  "contenido_md": "# Términos y Condiciones de Uso\n## Calculadora de Honorarios del CPAU...",
  "vigente": true,
  "fecha_vigencia": "2026-08-05",
  "created_at": "2026-08-06T12:00:00.000Z"
}
```

---

## ❌ Posibles Errores

### Error: "Debes configurar @user_id con el ID de un usuario ADMIN válido"
**Causa:** No editaste la línea `SET @user_id = NULL;`  
**Solución:** Vuelve al paso 2 y edita el script.

### Error: "PROCEDURE Terminos_Condiciones_Grabar does not exist"
**Causa:** No se ejecutó el script del TICKET-029-003  
**Solución:** Ejecuta primero los stored procedures en `03-Sps/`.

### Error: "Table 'Terminos_Condiciones' doesn't exist"
**Causa:** No se ejecutó el script del TICKET-029-001  
**Solución:** Ejecuta primero el script de creación de tabla en `01-Tables/`.

---

## ✅ Ticket completado cuando:

- [x] Script ejecutado sin errores
- [x] Registro insertado con `tyc_id = 1`
- [x] Campo `vigente = TRUE`
- [x] Todos los usuarios tienen `tyc_aceptado_fecha = NULL`
- [x] Endpoint `/vigente` devuelve el TyC correctamente

---

## 📝 Notas

- **Contenido:** El script contiene el documento completo de TyC v1.0 (~34 KB)
- **Escapado:** Las comillas simples se escaparon automáticamente (`'` → `''`)
- **Transacción:** El SP `Terminos_Condiciones_Grabar` maneja transacciones internamente
- **Rollback:** Si algo falla, el SP hace rollback automático

---

**¿Dudas?** Consulta el SPEC completo en `01-Docs/00-Specs/SPEC029-CALC-Términos y condiciones.md`
