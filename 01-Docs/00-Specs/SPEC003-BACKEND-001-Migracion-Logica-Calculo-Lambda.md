# SPEC-BACKEND-001: Implementación Backend Definitivo - Cálculo de Honorarios

**Fecha:** 21/04/2026  
**Versión:** 1.1  
**Estado:** 🚧 EN IMPLEMENTACIÓN  
**Autor:** Charly - Equipo Backend  
**Stack:** AWS Lambda + Node.js 18.x + MySQL 8.0 (AWS RDS)

**CAMBIO ESTRATÉGICO v1.1:**  
❌ Eliminado enfoque de "backend para maqueta" seguido de "backend definitivo"  
✅ **Implementación directa de backend definitivo**  
✅ Tablas definitivas: `Calculos` y `Calculo_Items` (antes: Calc_Maq, Calc_Maq_Items)

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Impacto](#2-análisis-de-impacto)
3. [Cambios de Esquema de Base de Datos](#3-cambios-de-esquema-de-base-de-datos)
4. [Arquitectura de Stored Procedures](#4-arquitectura-de-stored-procedures)
5. [Especificación de Implementación](#5-especificación-de-implementación)
6. [Plan de Implementación (Tickets)](#6-plan-de-implementación-tickets)
7. [Casos de Prueba](#7-casos-de-prueba)
8. [Criterios de Aceptación](#8-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Contexto Actual

**Estado Maqueta (Referencia):**
```
Frontend (React) → Vercel Serverless Function → Cálculo en JavaScript
```

- ✅ Maqueta funcional aprobada por cliente (solo frontend)
- ✅ Lógica de cálculo validada en JavaScript
- ⚠️ **Sin backend real** (solo simulación en Vercel)
- ⚠️ **Sin persistencia** en base de datos
- ⚠️ **Sin autenticación** real

**Archivos de Lógica en Maqueta (Referencia para migración):**
```
App/Backend/03-Vercel/api/v1/honorarios/calcular.js
App/Backend/03-Vercel/lib/utils/calculos/
├── honorariosBasico.js        ← Algoritmo de cálculo (migrar a SPs)
└── tablasCoeficientes.js      ← Coeficientes por rango (migrar a SPs)
```

**DECISIÓN ESTRATÉGICA:**
- ❌ NO implementar backend intermedio para maqueta
- ✅ Implementar **backend definitivo directamente**
- ✅ Tablas definitivas desde inicio: `Calculos`, `Calculo_Items`

### 1.2 Estado Objetivo (Backend Definitivo)

**Stack Definitivo:**
```
Frontend (React) → AWS Lambda (Node.js) → Stored Procedures → AWS RDS MySQL
```

- ✅ **Lógica de cálculo 100% en base de datos** (Stored Procedures)
- ✅ **Máxima protección de propiedad intelectual** (imposible extraer desde código)
- ✅ **Persistencia completa** de cálculos realizados
- ✅ **Auditoría** de operaciones
- ✅ **Escalabilidad** mediante arquitectura serverless (AWS Lambda)

### 1.3 Problema

La lógica de cálculo actualmente en JavaScript debe migrar a **Stored Procedures de MySQL** para:
1. **Proteger propiedad intelectual** - Coeficientes y fórmulas no extraíbles
2. **Centralizar lógica de negocio** - Un solo lugar de mantenimiento
3. **Preparar para múltiples tipos de cálculo** - Arquitectura extensible
4. **Mejorar performance** - Todo server-side sin roundtrips

### 1.4 Objetivo

**Migrar completamente la lógica de cálculo de honorarios desde JavaScript (maqueta) a Stored Procedures de MySQL**, implementando una arquitectura de 3 niveles que permita:
- ✅ Grabar datos de entrada
- ✅ Calcular honorarios (lógica 100% en DB)
- ✅ Persistir resultados
- ✅ Retornar ítems calculados al backend

### 1.5 Alcance

**✅ INCLUYE:**
- Modificar esquema de BD (calculo_id: VARCHAR → INT AUTO_INCREMENT)
- Crear arquitectura de 3 niveles de Stored Procedures
- Migrar lógica de cálculo JavaScript → SQL
- Implementar capa de servicios en Node.js
- Implementar controllers y routes
- Tests de integración completos
- Actualizar modelo (calculo.js) según nueva estructura

**❌ NO INCLUYE:**
- Cambios en el contrato de API (request/response igual para frontend)
- Autenticación/autorización (fase futura)
- Histórico de cálculos para usuarios (fase futura)
- Múltiples tipos de cálculo (solo "basico" en esta SPEC)
- Cambios en el frontend

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Componentes Afectados

| Componente | Cambio | Complejidad | Prioridad |
|------------|--------|-------------|-----------|
| **Schema BD** | ✅ BREAKING (calculo_id INT) | 🟢 Baja | 🔴 Alta |
| **SP Calc_Maq_Grabar** | 🔄 Modificación completa | 🔴 Alta | 🔴 Alta |
| **Nuevos SPs** | ✅ 2 SPs nuevos (Nivel 2 y 3) | 🔴 Alta | 🔴 Alta |
| **calculo.js (modelo)** | 🔄 Ajustar a INT | 🟢 Baja | 🟡 Media |
| **honorarios.service.js** | ✅ Crear nuevo | 🟡 Media | 🟡 Media |
| **honorarios.controller.js** | ✅ Crear nuevo | 🟢 Baja | 🟡 Media |
| **honorarios.routes.js** | ✅ Crear nuevo | 🟢 Baja | 🟡 Media |

### 2.2 Backward Compatibility

**⚠️ BREAKING CHANGES:**

1. **Base de Datos:**
   ```sql
   -- ❌ ANTES (Maqueta - no había DB)
   calculoId: "calc_1713312000123" (timestamp string)
   
   -- ✅ AHORA (Backend Real)
   id: 1, 2, 3... (INT AUTO_INCREMENT)
   ```

2. **Response del Backend:**
   ```javascript
   // El backend retornará:
   {
     calculoId: 123,  // ⚠️ Ahora es número, antes era string
     // ... resto igual
   }
   ```

**🔧 MITIGACIÓN:**
- El frontend debe adaptarse a recibir `calculoId` numérico
- O backend puede retornar string: `calculoId: String(id)`

### 2.3 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Error en migración de lógica JS → SQL | 🟡 Media | 🔴 Alta | Tests exhaustivos con casos conocidos |
| Performance de SPs anidados | 🟢 Baja | 🟡 Media | EXPLAIN ANALYZE en queries críticas |
| Dificultad debugging SPs | 🟡 Media | 🟡 Media | Logging detallado en cada SP |
| Cambio de calculo_id rompe frontend | 🔴 Alta | 🔴 Alta | Retornar como string o actualizar frontend |

---

## 3. CAMBIOS DE ESQUEMA DE BASE DE DATOS

### 3.1 Cambio Principal: calculo_id

**CAMBIO ESTRATÉGICO:**

❌ **ELIMINADO:** Enfoque de tablas temporales para maqueta (Calc_Maq, Calc_Maq_Items)  
✅ **IMPLEMENTADO:** Tablas definitivas desde el inicio

**TABLAS DEFINITIVAS:**

**Tabla Master:**
```sql
CREATE TABLE Calculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo_calculo VARCHAR(50) NOT NULL,
  fecha_calculo DATETIME NOT NULL,
  
  -- Datos Proyecto (opcionales)
  proyecto_nombre VARCHAR(200),
  proyecto_ubicacion VARCHAR(200),
  proyecto_cliente VARCHAR(200),
  
  -- Datos Obra
  obra_valor_obra DECIMAL(15,2) NOT NULL,
  obra_superficie DECIMAL(10,2),
  obra_tipologia VARCHAR(100),
  obra_complejidad VARCHAR(50),
  
  -- Tareas Profesionales
  tarea_obra_proyecto BOOLEAN DEFAULT FALSE,
  tarea_obra_direccion BOOLEAN DEFAULT FALSE,
  tarea_instalacion_sanitaria BOOLEAN DEFAULT FALSE,
  tarea_instalacion_electrica BOOLEAN DEFAULT FALSE,
  tarea_instalacion_contra_incendio BOOLEAN DEFAULT FALSE,
  tarea_instalacion_termomecanica BOOLEAN DEFAULT FALSE,
  tarea_proyecto_estructuras BOOLEAN DEFAULT FALSE,
  
  -- Resultados
  total_honorarios DECIMAL(15,2),
  
  -- Metadata
  metadata_rango VARCHAR(1),
  metadata_valor_k DECIMAL(15,2),
  metadata_rango_costo_obra DECIMAL(10,4),
  metadata_numero_items INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_usuario_fecha (usuario_id, fecha_calculo),
  INDEX idx_tipo_calculo (tipo_calculo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Tabla Detalle:**
```sql
CREATE TABLE Calculo_Items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  calculo_id INT NOT NULL,
  item_numero INT NOT NULL,
  tarea_profesional VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  importe DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (calculo_id) REFERENCES Calculos(id) ON DELETE CASCADE,
  INDEX idx_calculo (calculo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 Script de Creación (Ambiente Limpio)

**Creación en DEV/QA:**
```sql
-- Eliminar tablas anteriores de maqueta (si existieran)
DROP TABLE IF EXISTS Calc_Maq_Items;
DROP TABLE IF EXISTS Calc_Maq;

-- Crear tablas definitivas
DROP TABLE IF EXISTS Calculo_Items;
DROP TABLE IF EXISTS Calculos;

-- Ejecutar CREATEs de tablas definitivas (ver sección 3.1)
-- ...

-- Verificar estructura
SHOW CREATE TABLE Calculos;
SHOW CREATE TABLE Calculo_Items;

-- Verificar integridad referencial
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'cpau_ch_dev'
  AND TABLE_NAME = 'Calculo_Items'
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 3.3 Datos de Semilla (Seeds)

**Tabla de Coeficientes (si aplicara - futuro):**
```sql
-- Para fase futura: Tabla de coeficientes dinámicos
-- Por ahora, coeficientes hardcoded en SP
```

---

## 4. ARQUITECTURA DE STORED PROCEDURES

### 4.1 Diseño de 3 Niveles

```
NIVEL 1: Entry Point
├─ Calculo_Grabar(18 params)
│  ├─ Graba master en Calculos
│  ├─ Llama NIVEL 2 →
│  └─ Retorna items calculados

NIVEL 2: Orquestador
├─ Calcular_Honorario(calculo_id)
│  ├─ Lee tipo_calculo desde Calculos
│  ├─ IF tipo = 'basico' → Llama NIVEL 3 (PYDO)
│  ├─ IF tipo = 'avanzado' → Llama NIVEL 3 (Avanzado)
│  └─ ... extensible para futuros tipos

NIVEL 3: Lógica Específica
├─ Calcular_Honorario_PYDO(calculo_id)
│  ├─ Lee datos de Calculos
│  ├─ EJECUTA LÓGICA DE CÁLCULO
│  │  • Determinar rango (A, B, C, D)
│  │  • Calcular cada tarea (Proyecto, Dirección, Instalaciones, etc)
│  │  • Aplicar coeficientes
│  ├─ INSERT items en Calculo_Items
│  └─ UPDATE metadata en Calculos
```

### 4.2 Responsabilidades por Nivel

| Nivel | SP | Responsabilidad Única |
|-------|----|-----------------------|
| **1** | `Calculo_Grabar` | Entry point, grabar master, coordinar, retornar |
| **2** | `Calcular_Honorario` | Orquestar según tipo_calculo |
| **3** | `Calcular_Honorario_PYDO` | Lógica pura de cálculo para tipo "basico" |

### 4.3 Flujo de Datos

```
Backend Node.js
  │
  └─ CALL Calculo_Grabar(18 params)
      │
      ├─ INSERT INTO Calculos → genera id (ej: 123)
      │
      ├─ CALL Calcular_Honorario(123)
      │   │
      │   ├─ SELECT tipo_calculo FROM Calculos WHERE id = 123
      │   │
      │   └─ IF tipo = 'basico'
      │       │
      │       └─ CALL Calcular_Honorario_PYDO(123)
      │           │
      │           ├─ SELECT * FROM Calculos WHERE id = 123
      │           ├─ CALCULAR rango, coeficientes, items
      │           ├─ INSERT INTO Calculo_Items (123, item 1)
      │           ├─ INSERT INTO Calculo_Items (123, item 2)
      │           ├─ INSERT INTO Calculo_Items (123, item 3)
      │           └─ UPDATE Calculos SET metadata WHERE id = 123
      │
      └─ SELECT items FROM Calculo_Items WHERE calculo_id = 123
          │
          └─ RETURN resultset al backend
```

---

## 5. ESPECIFICACIÓN DE IMPLEMENTACIÓN

### 5.1 SP Nivel 1: Calculo_Grabar

**Firma:**
```sql
CREATE PROCEDURE Calculo_Grabar(
  -- Identificación (4 params)
  IN p_usuario_id INT,
  IN p_tipo_calculo VARCHAR(50),
  IN p_fecha_calculo DATETIME,
  
  -- Datos Proyecto (3 params - opcionales)
  IN p_proyecto_nombre VARCHAR(200),
  IN p_proyecto_ubicacion VARCHAR(200),
  IN p_proyecto_cliente VARCHAR(200),
  
  -- Datos Obra (4 params)
  IN p_obra_valor_obra DECIMAL(15,2),
  IN p_obra_superficie DECIMAL(10,2),
  IN p_obra_tipologia VARCHAR(100),
  IN p_obra_complejidad VARCHAR(50),
  
  -- Tareas Profesionales (7 booleans)
  IN p_tarea_obra_proyecto BOOLEAN,
  IN p_tarea_obra_direccion BOOLEAN,
  IN p_tarea_instalacion_sanitaria BOOLEAN,
  IN p_tarea_instalacion_electrica BOOLEAN,
  IN p_tarea_instalacion_contra_incendio BOOLEAN,
  IN p_tarea_instalacion_termomecanica BOOLEAN,
  IN p_tarea_proyecto_estructuras BOOLEAN
)
```

**Lógica:**
```sql
BEGIN
  DECLARE v_calculo_id INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  -- 1. Insertar master
  INSERT INTO Calculos (...) VALUES (...);
  SET v_calculo_id = LAST_INSERT_ID();
  
  -- 2. Llamar orquestador
  CALL Calcular_Honorario(v_calculo_id);
  
  -- 3. Retornar items calculados
  SELECT 
    v_calculo_id as calculo_id,
    i.item_numero,
    i.tarea_profesional,
    i.descripcion,
    i.importe,
    c.total_honorarios,
    c.metadata_rango
  FROM Calculo_Items i
  INNER JOIN Calculos c ON i.calculo_id = c.id
  WHERE i.calculo_id = v_calculo_id
  ORDER BY i.item_numero;
  
  COMMIT;
END
```

### 5.2 SP Nivel 2: Calcular_Honorario (Orquestador)

**Firma:**
```sql
CREATE PROCEDURE Calcular_Honorario(
  IN p_calculo_id INT
)
```

**Lógica:**
```sql
BEGIN
  DECLARE v_tipo_calculo VARCHAR(50);
  
  -- Leer tipo de cálculo
  SELECT tipo_calculo INTO v_tipo_calculo
  FROM Calculos
  WHERE id = p_calculo_id;
  
  -- Ejecutar SP específico según tipo
  IF v_tipo_calculo = 'basico' THEN
    CALL Calcular_Honorario_PYDO(p_calculo_id);
  ELSEIF v_tipo_calculo = 'avanzado' THEN
    CALL Calcular_Honorario_Avanzado(p_calculo_id);
  ELSE
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Tipo de cálculo no soportado';
  END IF;
END
```

### 5.3 SP Nivel 3: Calcular_Honorario_PYDO (Lógica de Cálculo)

**Firma:**
```sql
CREATE PROCEDURE Calcular_Honorario_PYDO(
  IN p_calculo_id INT
)
```

**Lógica (resumen - implementación completa en código):**
```sql
BEGIN
  -- Variables locales
  DECLARE v_valor_obra DECIMAL(15,2);
  DECLARE v_rango VARCHAR(1);
  DECLARE v_valor_k DECIMAL(15,2);
  DECLARE v_ratio DECIMAL(10,4);
  DECLARE v_total DECIMAL(15,2) DEFAULT 0;
  DECLARE v_item_num INT DEFAULT 0;
  
  -- Constante Valor K (hardcoded por ahora)
  SET v_valor_k = 522181756.33;
  
  -- 1. Leer datos del cálculo
  SELECT obra_valor_obra INTO v_valor_obra
  FROM Calculos WHERE id = p_calculo_id;
  
  -- 2. Determinar rango
  SET v_ratio = v_valor_obra / v_valor_k;
  
  IF v_ratio <= 0.5 THEN
    SET v_rango = 'A';
  ELSEIF v_ratio <= 5 THEN
    SET v_rango = 'B';
  ELSEIF v_ratio <= 25 THEN
    SET v_rango = 'C';
  ELSE
    SET v_rango = 'D';
  END IF;
  
  -- 3. Calcular cada tarea (si está seleccionada)
  
  -- 3.1 Proyecto de Obra
  IF (SELECT tarea_obra_proyecto FROM Calculos WHERE id = p_calculo_id) THEN
    SET v_item_num = v_item_num + 1;
    -- Lógica de cálculo según rango y coeficientes
    -- INSERT INTO Calculo_Items (calculo_id, item_numero, tarea_profesional, descripcion, importe)
    -- ...
  END IF;
  
  -- 3.2 Dirección de Obra
  -- ... (similar)
  
  -- 3.3 Instalaciones
  -- ... (similar)
  
  -- 4. Actualizar metadata en master
  UPDATE Calculos SET
    total_honorarios = v_total,
    metadata_rango = v_rango,
    metadata_valor_k = v_valor_k,
    metadata_rango_costo_obra = v_ratio,
    metadata_numero_items = v_item_num
  WHERE id = p_calculo_id;
END
```

**NOTA:** La implementación completa incluirá:
- Lógica detallada de cada tipo de tarea
- Coeficientes diferenciados por instalación (SPEC-CALC-001)
- Arrastre progresivo de coeficientes (SPEC-CALC-002)

---

## 6. PLAN DE IMPLEMENTACIÓN (TICKETS)

### TICKET #006 ✅ COMPLETADO
**Modelo de Datos (calculo.js)**
- ✅ Creado con Repository Pattern
- 🔄 **PENDIENTE:** Adaptar a calculo_id INT (en lugar de string)

### TICKET #007 🚧 REDEFINIDO
**Modificar Schema de Base de Datos**

**Subtareas:**
- [ ] Modificar CREATE TABLE Calc_Maq (id INT PK, eliminar calculo_id VARCHAR)
- [ ] Modificar CREATE TABLE Calc_Maq_Items (calculo_id INT FK)
- [ ] Ejecutar en DEV (localhost)
- [ ] Ejecutar en QA (AWS RDS)
- [ ] Actualizar seeds si existen
- [ ] Verificar índices optimizados

**Archivos:**
- `App/Backend/DB/01-Tables/Calc_Maq.sql`
- `App/Backend/DB/01-Tables/Calc_Maq_Items.sql`

**Criterios:**
- ✅ Tablas creadas con id INT AUTO_INCREMENT
- ✅ FK funcionando correctamente
- ✅ Tests de inserción manual OK

---

### TICKET #008 ⏳ NUEVO
**SP Nivel 3: Calcular_Honorario_PYDO (Lógica Pura)**

**Descripción:**
Crear SP que implementa la lógica de cálculo de honorarios para tipo "basico" (Proyecto + Dirección + Instalaciones).

**Subtareas:**
- [ ] Crear archivo `App/Backend/DB/03-Sps/Calcular_Honorario_PYDO.sql`
- [ ] Implementar determinación de rango (A/B/C/D)
- [ ] Implementar cálculo Proyecto de Obra (según rango)
- [ ] Implementar cálculo Dirección de Obra
- [ ] Implementar cálculo Instalación Sanitaria
- [ ] Implementar cálculo Instalación Eléctrica
- [ ] Implementar cálculo Instalación Contra Incendio
- [ ] Implementar cálculo Instalación Termomecánica
- [ ] Implementar cálculo Proyecto de Estructuras
- [ ] INSERT items en Calc_Maq_Items
- [ ] UPDATE metadata en Calc_Maq (total, rango, valor_k, etc)
- [ ] Documentar coeficientes utilizados
- [ ] Tests manuales con casos conocidos

**Criterios:**
- ✅ SP crea items correctos para cada tarea seleccionada
- ✅ Cálculos coinciden con maqueta actual
- ✅ Metadata actualizada correctamente
- ✅ Manejo de errores implementado

---

### TICKET #009 ⏳ NUEVO
**SP Nivel 2: Calcular_Honorario (Orquestador)**

**Descripción:**
Crear SP orquestador que detecta tipo de cálculo y llama al SP específico.

**Subtareas:**
- [ ] Crear archivo `App/Backend/DB/03-Sps/Calcular_Honorario.sql`
- [ ] Implementar lectura de tipo_calculo
- [ ] Implementar IF para 'basico' → Calcular_Honorario_PYDO
- [ ] Implementar ELSE para tipos no soportados (error)
- [ ] Preparar estructura para futuros tipos (avanzado, etc)
- [ ] Tests de llamada con tipo 'basico'
- [ ] Tests de error con tipo inválido

**Criterios:**
- ✅ Orquestador llama correctamente a SP de nivel 3
- ✅ Error controlado para tipos no soportados
- ✅ Extensible para agregar nuevos tipos

---

### TICKET #010 ⏳ NUEVO
**SP Nivel 1: Calc_Maq_Grabar (Modificación Completa)**

**Descripción:**
Modificar SP existente para implementar arquitectura de 3 niveles.

**Subtareas:**
- [ ] Modificar `App/Backend/DB/03-Sps/Calc_Maq_Grabar.sql`
- [ ] Eliminar parámetro p_calculo_id (ahora es AUTO_INCREMENT)
- [ ] Insertar en Calc_Maq y obtener LAST_INSERT_ID()
- [ ] Llamar a Calcular_Honorario(v_calculo_id)
- [ ] SELECT items desde Calc_Maq_Items para retornar
- [ ] Implementar transacción completa (START/COMMIT/ROLLBACK)
- [ ] Tests con datos completos
- [ ] Verificar resultset retornado

**Criterios:**
- ✅ SP graba master correctamente
- ✅ SP llama a orquestador
- ✅ SP retorna items calculados
- ✅ Transacción funciona con rollback en errores

---

### TICKET #011 ⏳ NUEVO
**Actualizar Modelo calculo.js**

**Descripción:**
Adaptar modelo a nueva estructura (calculo_id INT).

**Subtareas:**
- [ ] Modificar `grabarCalculo()` - eliminar generación de calculoId string
- [ ] Actualizar response para usar id numérico del SP
- [ ] Modificar `obtenerCalculoPorId()` - recibir INT
- [ ] Modificar `listarItemsCalculo()` - recibir INT
- [ ] Actualizar tests del modelo
- [ ] Actualizar script de test

**Archivos:**
- `App/Backend/Node/src/models/calculo.js`
- `App/Backend/Node/scripts/test-calculo-model.js`

**Criterios:**
- ✅ Modelo funciona con calculo_id INT
- ✅ Tests actualizados pasan correctamente
- ✅ Response del SP procesado correctamente

---

### TICKET #012 ⏳ NUEVO
**Servicio honorarios.service.js (Simplificado)**

**Descripción:**
Crear servicio que llama al modelo (sin lógica de cálculo JS).

**Subtareas:**
- [ ] Crear `App/Backend/Node/src/services/honorarios.service.js`
- [ ] Implementar `calcularYGuardar()`:
  - Recibe datosCompletos del request
  - Llama a calculoModel.grabarCalculo()
  - Procesa resultset del SP
  - Retorna estructura estándar para API
- [ ] Implementar `obtenerItemsPorCalculoId()`
- [ ] Manejo de errores estructurado
- [ ] Logging apropiado
- [ ] Tests unitarios con mocks

**Criterios:**
- ✅ Servicio actúa como capa delgada sobre modelo
- ✅ No contiene lógica de cálculo
- ✅ Errores manejados correctamente
- ✅ Tests con >80% cobertura

---

### TICKET #013 ⏳ NUEVO
**Controller honorarios.controller.js**

**Descripción:**
Crear controller para manejar HTTP requests.

**Subtareas:**
- [ ] Crear `App/Backend/Node/src/controllers/honorarios.controller.js`
- [ ] Implementar `calcular()` - POST handler
  - Validar request body
  - Llamar a honorarios.service.calcularYGuardar()
  - Formatear response según contrato API
  - Manejo de errores HTTP
- [ ] Implementar `obtenerItems()` - GET handler
- [ ] Tests con supertest

**Criterios:**
- ✅ Controllers siguen convenciones Express
- ✅ Validación de inputs implementada
- ✅ Response codes correctos (200, 400, 500)
- ✅ Tests de integración pasan

---

### TICKET #014 ⏳ NUEVO
**Routes honorarios.routes.js**

**Descripción:**
Configurar rutas Express para endpoints de honorarios.

**Subtareas:**
- [ ] Crear `App/Backend/Node/src/routes/honorarios.routes.js`
- [ ] POST /api/v1/honorarios/calcular → controller.calcular
- [ ] GET /api/v1/honorarios/:calculoId/items → controller.obtenerItems
- [ ] Integrar con app.js
- [ ] Tests de rutas

**Criterios:**
- ✅ Rutas configuradas correctamente
- ✅ Middlewares aplicados (validación, errors)
- ✅ Integración con app.js funcional

---

### TICKET #015 ⏳ NUEVO
**Integración y Tests E2E**

**Descripción:**
Tests end-to-end completos del flujo.

**Subtareas:**
- [ ] Crear `__tests__/integration/honorarios.e2e.test.js`
- [ ] Test: POST /calcular con datos válidos
- [ ] Test: GET /items con id válido
- [ ] Test: POST con datos inválidos (400)
- [ ] Test: GET con id inexistente (404)
- [ ] Verificar datos en DB después de cada test
- [ ] Cleanup de datos de prueba

**Criterios:**
- ✅ Flujo completo funciona (request → SP → response)
- ✅ Datos persisten correctamente en DB
- ✅ Cálculos coinciden con maqueta
- ✅ Todos los tests pasan

---

## 7. CASOS DE PRUEBA

### 7.1 Caso Base: Proyecto + Dirección (Rango B)

**Input:**
```json
{
  "tipoCalculo": "basico",
  "datosObra": {
    "valorObra": 50000000
  },
  "tareasProfesionales": {
    "obraProyecto": true,
    "obraDireccion": true,
    "instalacionSanitaria": false,
    "instalacionElectrica": false,
    "instalacionContraIncendio": false,
    "instalacionTermomecanica": false,
    "proyectoEstructuras": false
  }
}
```

**Expected Output:**
```json
{
  "calculoId": 1,
  "resultado": {
    "detalleHonorarios": [
      {
        "item": 1,
        "tareaProfesional": "Proyecto de Obra",
        "importe": 3150000
      },
      {
        "item": 2,
        "tareaProfesional": "Dirección de Obra",
        "importe": 2100000
      }
    ],
    "totalHonorarios": 5250000,
    "metadata": {
      "rango": "B"
    }
  }
}
```

### 7.2 Caso: Todas las Tareas (Rango A)

**Input:**
```json
{
  "tipoCalculo": "basico",
  "datosObra": {
    "valorObra": 10000000
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

**Expected:** 7 items calculados, rango A

### 7.3 Caso: Solo Instalaciones (Rango D)

**Input:**
```json
{
  "tipoCalculo": "basico",
  "datosObra": {
    "valorObra": 500000000
  },
  "tareasProfesionales": {
    "obraProyecto": false,
    "obraDireccion": false,
    "instalacionSanitaria": true,
    "instalacionElectrica": true,
    "instalacionContraIncendio": false,
    "instalacionTermomecanica": false,
    "proyectoEstructuras": false
  }
}
```

**Expected:** 2 items (Sanitaria + Eléctrica), rango D

---

## 8. CRITERIOS DE ACEPTACIÓN

### 8.1 Funcionales

- ✅ **Schema BD actualizado** con calculo_id INT
- ✅ **3 SPs implementados** y funcionando en cascada
- ✅ **Lógica de cálculo migrada** desde JS a SQL
- ✅ **Cálculos coinciden** con maqueta actual (diferencia < 0.01%)
- ✅ **Modelo, servicio, controller, routes** implementados
- ✅ **API responde** según contrato existente
- ✅ **Persistencia completa** de cálculos en DB

### 8.2 Técnicos

- ✅ **Transacciones** implementadas con rollback
- ✅ **Manejo de errores** en cada nivel (SP, modelo, servicio, controller)
- ✅ **Logging estructurado** en cada operación
- ✅ **Tests unitarios** con >80% cobertura
- ✅ **Tests de integración** E2E pasando
- ✅ **Performance** aceptable (< 500ms por cálculo)

### 8.3 Documentación

- ✅ **Comentarios en SPs** explicando lógica
- ✅ **JSDoc** en código Node.js
- ✅ **README actualizado** con instrucciones de deployment
- ✅ **Esta SPEC** como referencia técnica

---

## 9. DEPENDENCIAS Y PREREQUISITOS

### 9.1 Completados

- ✅ Ticket #001: Estructura de proyecto
- ✅ Ticket #002: Schema de tablas definitivas (Calculos, Calculo_Items)
- ✅ Ticket #003: SP Calculo_Grabar (se implementará)
- ✅ Ticket #004: SP Calculo_Listar_Items
- ✅ Ticket #005: Módulo de conexión db.js
- ✅ Ticket #006: Modelo calculo.js (se modificará)

### 9.2 Requeridos Antes de Implementar

- ✅ Acceso a MySQL localhost (cpau_ch_dev)
- ✅ Acceso a AWS RDS (cpau_ch_qa)
- ✅ Node.js 18+ instalado
- ✅ npm install completado
- ✅ Lógica de cálculo en maqueta funcionando (referencia)

---

## 10. NOTAS TÉCNICAS

### 10.1 Valor K

**Constante hardcoded en SP por ahora:**
```sql
DECLARE v_valor_k DECIMAL(15,2) DEFAULT 522181756.33;
```

**Fase futura:** Mover a tabla de parámetros para actualizaciones sin modificar SPs.

### 10.2 Coeficientes

**Implementación:**
- Coeficientes diferenciados por instalación (SPEC-CALC-001)
- Arrastre progresivo según rango (SPEC-CALC-002)

**Ubicación en código:**
- SP Nivel 3: `Calcular_Honorario_PYDO`
- Sección de variables locales con coeficientes

### 10.3 Extensibilidad

**Para agregar nuevo tipo de cálculo:**
1. Crear nuevo SP Nivel 3: `Calcular_Honorario_NuevoTipo`
2. Modificar SP Nivel 2: Agregar ELSEIF para nuevo tipo
3. No tocar Nivel 1 ni backend Node.js

---

**FIN DE ESPECIFICACIÓN**

---

**Aprobaciones:**

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| **Tech Lead** | Charly | 21/04/2026 | ✅ |
| **Backend Dev** | - | - | - |
| **QA** | - | - | - |
| **Product Owner** | CPAU | - | ⏳ Pendiente |
