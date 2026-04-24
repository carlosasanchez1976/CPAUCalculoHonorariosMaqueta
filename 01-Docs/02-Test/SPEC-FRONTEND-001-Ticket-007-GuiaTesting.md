# SPEC-FRONTEND-001 - TICKET #007: TESTING END-TO-END DE LA MIGRACIÓN

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Fecha:** 24/04/2026  
**Ticket:** #007 - Testing End-to-End de la Migración (Vercel → Node.js)  
**Fase:** 🧪 TESTING MANUAL  
**Tipo:** Verificación de integración frontend-backend

---

## 📋 RESUMEN EJECUTIVO

### 🎯 Objetivo del Testing

Verificar que el frontend React se comunica correctamente con el backend Node.js real (no Vercel Serverless), y que el flujo completo de cálculo de honorarios funciona end-to-end:

1. ✅ Frontend llama a `http://localhost:3000/api/calculos/calcular`
2. ✅ Backend Node.js ejecuta stored procedures de MySQL
3. ✅ Respuesta se muestra correctamente en UI
4. ✅ Datos se graban en base de datos con `calculoId`

### ⚠️ Parámetros Harcodeados (Temporal)

**IMPORTANTE:** Los siguientes valores están fijos en el código para esta versión:

```javascript
// En: App/Frontend/src/pages/ProcesoCalculoPage.jsx (línea ~159)
calculoId: null,     // Se asignará en backend al guardar
usuarioId: 2,        // Usuario temporal para testing
tareaId: 18          // Tarea "Cálculo Básico" (ID fijo)
```

**Razón:** Estos valores se enlazarán con datos reales en futuras SPECs:
- `usuarioId`: Se obtendrá del contexto de autenticación (login)
- `tareaId`: Se obtendrá del tipo de cálculo seleccionado (básico/intermedio/avanzado)

---

## 🛠️ PRECONDICIONES

### 1️⃣ Backend Node.js Configurado

**Ubicación:** `App/Backend/Node/`

**Verificar configuración:**
```bash
cd "C:\Users\Carlos Sanchez\Documents\Charly\neosis\CPAU\DesarrolloCalculoHonorarios\CH2026\App\Backend\Node"

# Verificar .env existe y tiene configuración MySQL
cat .env

# Debe contener:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<tu_password>
DB_NAME=ch2026
PORT=3000
```

### 2️⃣ Base de Datos MySQL

**Verificar que existen:**
- ✅ Tabla `calculos` (almacena cálculos)
- ✅ Tabla `calculos_detalle` (almacena ítems)
- ✅ Stored Procedure `sp_calcular_honorarios_completo` (ejecuta cálculo)

**SQL de verificación:**
```sql
USE ch2026;
SHOW TABLES LIKE 'calculos%';
SHOW PROCEDURE STATUS WHERE Db = 'ch2026' AND Name LIKE 'sp_calcular%';
```

### 3️⃣ Frontend Configurado

**Ubicación:** `App/Frontend/`

**Verificar archivo `.env.local`:**
```bash
cd "C:\Users\Carlos Sanchez\Documents\Charly\neosis\CPAU\DesarrolloCalculoHonorarios\CH2026\App\Frontend"

# Debe contener:
VITE_API_URL=http://localhost:3000/api
```

**Si no existe, crearlo:**
```bash
echo VITE_API_URL=http://localhost:3000/api > .env.local
```

---

## 🚀 PASO 1: LEVANTAR BACKEND NODE.JS

### Opción A: Modo Desarrollo (con auto-restart)

```bash
cd "C:\Users\Carlos Sanchez\Documents\Charly\neosis\CPAU\DesarrolloCalculoHonorarios\CH2026\App\Backend\Node"

# Instalar dependencias (si es primera vez)
npm install

# Levantar con nodemon (auto-restart)
npm run dev
```

**Salida esperada:**
```
[nodemon] starting `node index.js`
✅ Conexión exitosa a MySQL
🚀 Servidor corriendo en http://localhost:3000
📡 API disponible en http://localhost:3000/api
```

### Opción B: Modo Producción (sin auto-restart)

```bash
cd "C:\Users\Carlos Sanchez\Documents\Charly\neosis\CPAU\DesarrolloCalculoHonorarios\CH2026\App\Backend\Node"

npm start
```

### ⚠️ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ECONNREFUSED` | MySQL no está corriendo | Iniciar MySQL Workbench o servicio MySQL |
| `ER_ACCESS_DENIED_ERROR` | Credenciales incorrectas | Verificar `.env` (DB_USER, DB_PASSWORD) |
| `Cannot find module` | Dependencias no instaladas | Ejecutar `npm install` |
| `Port 3000 already in use` | Otra app usa puerto 3000 | Cambiar `PORT` en `.env` o cerrar otra app |

---

## 🚀 PASO 2: LEVANTAR FRONTEND REACT

### En Terminal Separado

```bash
cd "C:\Users\Carlos Sanchez\Documents\Charly\neosis\CPAU\DesarrolloCalculoHonorarios\CH2026\App\Frontend"

# Instalar dependencias (si es primera vez)
npm install

# Levantar Vite
npm run dev
```

**Salida esperada:**
```
VITE v5.1.4  ready in 823 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Verificar Variables de Entorno

Abrir navegador en `http://localhost:5173` y en DevTools Console ejecutar:

```javascript
console.log(import.meta.env.VITE_API_URL);
// Debe mostrar: "http://localhost:3000/api"
```

---

## 🧪 PASO 3: EJECUTAR CASO DE PRUEBA PRINCIPAL

### Caso de Prueba: Edificio Comercial - Todas las Tareas

**Objetivo:** Verificar cálculo completo con todas las instalaciones y tareas profesionales.

### 📝 Datos de Entrada

#### Paso 0: Datos del Proyecto
```
Nombre del Proyecto: Edificio Comercial - Centro
Cliente: Inmobiliaria ABC SA
Ubicación: CABA - Microcentro
Tipo de Obra: Edificio comercial
Destino/Uso: Oficinas
Observaciones: (opcional)
```

#### Paso 1: Datos de Obra
```
Superficie Total: 2500 m²
Valor por m²: $200.000
Valor Total: $500.000.000 (calculado automáticamente)
Complejidad: Alta
```

#### Paso 2: Tareas Profesionales
**Seleccionar TODAS las tareas:**
- ✅ Obra - Proyecto
- ✅ Obra - Dirección
- ✅ Instalación Sanitaria
- ✅ Instalación Eléctrica
- ✅ Instalación contra Incendio
- ✅ Instalación Termomecánica
- ✅ Proyecto de Estructuras

#### Paso 3: Revisión
Verificar que todos los datos se muestran correctamente.

#### Paso 4: Cálculo
Hacer clic en **"Calcular Honorarios"**.

---

## ✅ PASO 4: VERIFICACIONES TÉCNICAS

### 4.1 Verificar Request en DevTools

**Abrir:** DevTools → Network → Filtrar por "Fetch/XHR"

**Buscar:** `POST http://localhost:3000/api/calculos/calcular`

**Request Headers esperados:**
```
Content-Type: application/json
```

**Request Payload esperado:**
```json
{
  "calculoId": null,
  "usuarioId": 2,
  "tareaId": 18,
  "datosProyecto": {
    "nombre": "Edificio Comercial - Centro",
    "cliente": "Inmobiliaria ABC SA",
    "ubicacion": "CABA - Microcentro",
    "tipoObra": "Edificio comercial",
    "destinoUso": "Oficinas",
    "observaciones": ""
  },
  "datosObra": {
    "superficie": 2500,
    "valorMetro2": 200000,
    "valorObra": 500000000,
    "complejidad": "alta"
  },
  "tareasProfesionales": {
    "obraProyecto": true,
    "obraDireccion": true,
    "instalacionSanitaria": true,
    "instalacionElectrica": true,
    "instalacionContraIncendio": true,
    "instalacionTermomecanica": true,
    "proyectoEstructuras": true
  }
}
```

### 4.2 Verificar Response

**Status esperado:** `200 OK`

**Response Body esperado:**
```json
{
  "success": true,
  "data": {
    "calculoId": <número>,
    "totalHonorarios": <número cercano a 80.575.475>,
    "metadata": {
      "fechaCalculo": "2026-04-24T...",
      "rango": "B",
      "numeroItems": 16,
      "itemsAgrupados": {
        "obra": 2,
        "instalaciones": 12,
        "estructuras": 2
      }
    },
    "detalleHonorarios": [
      // Array con 16 objetos (items)
      {
        "item": 1,
        "tarea": "Obra - Proyecto",
        "concepto": "HONORARIOS POR TRABAJOS PROFESIONALES",
        "coeficiente": 0.025,
        "importe": 12500000,
        "observaciones": null
      },
      // ... 15 items más
    ]
  }
}
```

### 4.3 Verificar UI - Paso 5 (Resultado)

**Elementos esperados en pantalla:**

✅ **Resumen:**
- Proyecto: "Edificio Comercial - Centro"
- Cliente: "Inmobiliaria ABC SA"
- Valor de Obra: $500.000.000
- **Total Honorarios:** ~$80.575.475 (valor aproximado)

✅ **Detalle de Honorarios:**
- Tabla con 16 filas (ítems)
- Columnas: Ítem | Tarea | Concepto | Coeficiente | Importe
- Total al final: suma correcta de todos los ítems

✅ **Botones:**
- "Descargar PDF" → debe generar PDF con el detalle
- "Nuevo Cálculo" → debe volver al inicio
- "Ver Historial" → debe ir a lista de cálculos

### 4.4 Verificar Grabación en Base de Datos

**En MySQL Workbench o terminal:**

```sql
USE ch2026;

-- Verificar último cálculo insertado
SELECT 
    calculo_id,
    usuario_id,
    tarea_id,
    nombre_proyecto,
    valor_obra,
    total_honorarios,
    fecha_calculo
FROM calculos
ORDER BY calculo_id DESC
LIMIT 1;

-- Debe mostrar:
-- usuario_id: 2
-- tarea_id: 18
-- nombre_proyecto: "Edificio Comercial - Centro"
-- valor_obra: 500000000
-- total_honorarios: ~80575475

-- Verificar ítems del cálculo
SELECT 
    COUNT(*) as cantidad_items
FROM calculos_detalle
WHERE calculo_id = (SELECT MAX(calculo_id) FROM calculos);

-- Debe mostrar: cantidad_items: 16
```

---

## 🧪 PASO 5: CASOS DE PRUEBA ADICIONALES

### 5.1 Caso: Backend No Disponible

**Objetivo:** Verificar manejo de errores cuando el backend no responde.

**Pasos:**
1. Detener el backend Node.js (Ctrl+C en terminal del backend)
2. En el frontend, completar wizard hasta paso de revisión
3. Hacer clic en "Calcular Honorarios"

**Resultado esperado:**
- ⚠️ Muestra mensaje de error: *"No se pudo conectar con el servidor. Verifique su conexión a internet."*
- ⚠️ Vuelve al paso de revisión (no se pierde el progreso)
- ⚠️ Usuario puede intentar nuevamente

**Verificación en DevTools:**
- Network: Request muestra estado `(failed) net::ERR_CONNECTION_REFUSED`
- Console: Error capturado por `formatearErrorAPI()`

### 5.2 Caso: Error de Validación Backend

**Objetivo:** Verificar que errores de validación se muestran correctamente.

**Pasos:**
1. Modificar temporalmente el código para enviar datos inválidos
2. Por ejemplo: cambiar `superficie: 2500` a `superficie: "abc"`
3. Ejecutar cálculo

**Resultado esperado:**
- ⚠️ Backend responde con status `400 Bad Request`
- ⚠️ Mensaje de error específico: *"superficie: Debe ser un número válido"*
- ⚠️ Vuelve al paso de revisión

### 5.3 Caso: Cálculo con Pocas Tareas

**Objetivo:** Verificar cálculo con solo 2 tareas (mínimo).

**Datos de entrada:**
```
Superficie: 1000 m²
Valor m²: $150.000
Valor Obra: $150.000.000 (Rango A)
Complejidad: Baja
Tareas: Solo "Obra - Proyecto" + "Proyecto de Estructuras"
```

**Resultado esperado:**
- ✅ Muestra 4 ítems en detalleHonorarios (2 ítems por tarea)
- ✅ Total Honorarios: valor calculado correcto
- ✅ metadata.numeroItems: 4

---

## 📊 CHECKLIST DE VERIFICACIÓN FINAL

### ✅ Backend

- [ ] Backend Node.js levanta sin errores
- [ ] Puerto 3000 está disponible
- [ ] Conexión a MySQL exitosa
- [ ] Endpoint `/api/calculos/calcular` responde correctamente

### ✅ Frontend

- [ ] Frontend levanta en puerto 5173
- [ ] Variable `VITE_API_URL` configurada correctamente
- [ ] Wizard completa todos los pasos sin errores
- [ ] Request se envía a `http://localhost:3000/api/calculos/calcular`

### ✅ Integración

- [ ] Request tiene estructura correcta (según contrato)
- [ ] Response tiene estructura correcta
- [ ] UI muestra resultado correctamente
- [ ] Datos se graban en MySQL con `calculoId`
- [ ] Total de honorarios es correcto
- [ ] Detalle tiene 16 ítems (caso completo)

### ✅ Manejo de Errores

- [ ] Error de conexión se muestra correctamente
- [ ] Error de validación se muestra correctamente
- [ ] Usuario puede reintentar después de error

---

## 📝 REGISTRO DE EJECUCIÓN

### Ejecutado por: _______________________

### Fecha: _______________________

### Resultados:

| Verificación | Estado | Observaciones |
|-------------|--------|---------------|
| Backend levantado | ⬜ OK / ⬜ FAIL | |
| Frontend levantado | ⬜ OK / ⬜ FAIL | |
| Caso principal (16 ítems) | ⬜ OK / ⬜ FAIL | |
| Grabación en DB | ⬜ OK / ⬜ FAIL | |
| Error backend offline | ⬜ OK / ⬜ FAIL | |
| Error validación | ⬜ OK / ⬜ FAIL | |

### Evidencias:

- [ ] Screenshot de resultado en UI
- [ ] Screenshot de request/response en DevTools
- [ ] Screenshot de registro en MySQL

### Observaciones adicionales:

```
(Anotar aquí cualquier problema encontrado o mejora sugerida)
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

Para considerar el Ticket #007 como **COMPLETADO**, se deben cumplir:

1. ✅ Backend Node.js levanta sin errores
2. ✅ Frontend levanta y se conecta al backend correcto
3. ✅ Wizard completa el flujo end-to-end sin errores
4. ✅ Request se envía a `http://localhost:3000/api/calculos/calcular`
5. ✅ Response se muestra correctamente en UI
6. ✅ Datos se graban en MySQL con `calculoId` válido
7. ✅ Errores se manejan correctamente (backend offline, validación)
8. ✅ No quedan referencias a Vercel en el código

---

## 🎯 CONCLUSIÓN

Una vez completada esta guía, el **TICKET #007** estará **✅ COMPLETADO**, confirmando que:

- ✅ La migración de **Vercel Serverless → Node.js real** está funcionando
- ✅ El frontend se comunica correctamente con el backend
- ✅ Los datos se persisten en MySQL
- ✅ El sistema está listo para despliegue en QA

**Próximos pasos (futuras SPECs):**
- Enlazar `usuarioId` con sistema de autenticación real
- Enlazar `tareaId` con tipo de cálculo seleccionado
- Implementar historial de cálculos por usuario
- Implementar modo QA con API externa
