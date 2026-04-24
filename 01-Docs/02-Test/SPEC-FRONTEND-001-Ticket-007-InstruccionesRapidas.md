# 🧪 INSTRUCCIONES RÁPIDAS - TESTING TICKET #007

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Fecha:** 24/04/2026  
**Ticket:** #007 - Testing End-to-End de la Migración

---

## ✅ ESTADO ACTUAL

- ✅ Frontend levantado en: **http://localhost:5173/**
- ⚠️ Backend Node.js: **DEBE ESTAR CORRIENDO** en http://localhost:3000

---

## 🚀 PASO 1: LEVANTAR BACKEND (Si no está corriendo)

Abrir un terminal y ejecutar:

```bash
cd "C:\Users\Carlos Sanchez\Documents\Charly\neosis\CPAU\DesarrolloCalculoHonorarios\CH2026\App\Backend\Node"
npm run dev
```

**Verificar:** Debe mostrar `🚀 Servidor corriendo en http://localhost:3000`

---

## 🧪 PASO 2: EJECUTAR CASO DE PRUEBA

### 1. Abrir aplicación
   - Ir a: **http://localhost:5173/**

### 2. Completar Wizard con estos datos:

**Paso 0 - Datos del Proyecto:**
```
Nombre: Edificio Comercial - Centro
Cliente: Inmobiliaria ABC SA
Ubicación: CABA - Microcentro
Tipo de Obra: Edificio comercial
Destino: Oficinas
```

**Paso 1 - Datos de Obra:**
```
Superficie: 2500 m²
Valor m²: $200.000
Valor Obra: $500.000.000 (se calcula automáticamente)
Complejidad: Alta
```

**Paso 2 - Tareas Profesionales:**
```
✅ Seleccionar TODAS las tareas:
  - Obra - Proyecto
  - Obra - Dirección
  - Instalación Sanitaria
  - Instalación Eléctrica
  - Instalación contra Incendio
  - Instalación Termomecánica
  - Proyecto de Estructuras
```

**Paso 3 - Revisión:**
```
Verificar que todos los datos se muestran correctamente
Clic en "Calcular Honorarios"
```

---

## ✅ PASO 3: VERIFICAR RESULTADO

### En la UI (Paso 5 - Resultado):

✅ **Debe mostrar:**
- Total Honorarios: **~$80.575.475** (aproximado)
- Detalle: **16 ítems** en la tabla
- Botones: "Descargar PDF", "Nuevo Cálculo", "Ver Historial"

### En DevTools (F12 → Network → Fetch/XHR):

✅ **Buscar request:**
- URL: `POST http://localhost:3000/api/calculos/calcular`
- Status: **200 OK**
- Response: `{ "success": true, "data": { "calculoId": <número>, ... } }`

### En Base de Datos (MySQL Workbench):

```sql
USE ch2026;

-- Verificar último cálculo
SELECT calculo_id, nombre_proyecto, total_honorarios
FROM calculos
ORDER BY calculo_id DESC
LIMIT 1;

-- Debe mostrar: 
-- nombre_proyecto: "Edificio Comercial - Centro"
-- total_honorarios: ~80575475

-- Verificar ítems
SELECT COUNT(*) FROM calculos_detalle
WHERE calculo_id = (SELECT MAX(calculo_id) FROM calculos);

-- Debe mostrar: 16 ítems
```

---

## ⚠️ PRUEBA DE ERROR (Opcional)

**Objetivo:** Verificar que los errores se manejan correctamente.

### Test 1: Backend Offline

1. Detener backend (Ctrl+C en terminal del backend)
2. En frontend, completar wizard y hacer clic en "Calcular"
3. ✅ Debe mostrar: *"No se pudo conectar con el servidor..."*

---

## 📝 CHECKLIST FINAL

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo en http://localhost:5173
- [ ] Wizard completa sin errores
- [ ] Resultado muestra 16 ítems
- [ ] Total honorarios: ~$80.575.475
- [ ] Request va a http://localhost:3000/api/calculos/calcular
- [ ] Se graba en DB con calculoId válido
- [ ] Errores se muestran correctamente

---

## ✅ CRITERIOS DE ACEPTACIÓN

Para considerar el **Ticket #007 COMPLETADO**:

1. ✅ Frontend se conecta al backend Node.js (no Vercel)
2. ✅ Cálculo se ejecuta correctamente end-to-end
3. ✅ Resultado se muestra en UI
4. ✅ Datos se graban en MySQL
5. ✅ Errores se manejan correctamente

---

## 📄 DOCUMENTACIÓN COMPLETA

Ver guía detallada en:
- [SPEC-FRONTEND-001-Ticket-007-GuiaTesting.md](./SPEC-FRONTEND-001-Ticket-007-GuiaTesting.md)

---

## 💡 IMPORTANTE: Parámetros Harcodeados

Los siguientes valores están fijos temporalmente en el código:

```javascript
calculoId: null     // Se asigna en backend
usuarioId: 2        // Usuario temporal (se enlazará con auth en futuras SPECs)
tareaId: 18         // Tarea "Cálculo Básico" (se enlazará con tipo de cálculo)
```

**Ver:** [ProcesoCalculoPage.jsx](../../App/Frontend/src/pages/ProcesoCalculoPage.jsx) línea ~159
