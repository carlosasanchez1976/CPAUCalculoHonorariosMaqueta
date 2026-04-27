# SPEC-FRONTEND-002: Migración de Tareas Profesionales de Hardcode a API

**Fecha:** 25/04/2026  
**Versión:** 1.0  
**Estado:** � CASI COMPLETO (10/11 tickets completados)  
**Autor:** Charly - Equipo Full Stack  
**Stack:** React 18 + Vite + Backend Node.js (Express) + MySQL

---

## 📊 PROGRESO DE TICKETS

| Ticket | Descripción | Estado |
|--------|-------------|--------|
| #001 | Modificar tabla Tareas_Profesionales (baja lógica) | ✅ COMPLETADO |
| #002 | Crear Stored Procedures | ✅ COMPLETADO |
| #003 | Crear modelo TareaProfesional | ✅ COMPLETADO |
| #004 | Crear controlador tareasProfesionalesController | ✅ COMPLETADO |
| #005 | Crear rutas /api/tareas | ✅ COMPLETADO |
| #006 | Organizar íconos SVG en carpeta pública | ✅ COMPLETADO |
| #007 | Crear servicio tareasProfesionalesService.js | ✅ COMPLETADO |
| #008 | Migrar NuevoCalculoPage a consumo de API | ✅ COMPLETADO |
| #009 | Migrar ProcesoCalculoPage (tareaId dinámica) | ✅ COMPLETADO |
| #010 | Testing End-to-End | ⏳ PENDIENTE |
| #011 | Actualizar Variables de Entorno en Vercel | ✅ COMPLETADO |

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Impacto](#2-análisis-de-impacto)
3. [Especificación de Cambios](#3-especificación-de-cambios)
4. [Plan de Implementación (Tickets)](#4-plan-de-implementación-tickets)
5. [Casos de Prueba](#5-casos-de-prueba)
6. [Criterios de Aceptación](#6-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Contexto Actual

**Estado Actual - Datos Hardcodeados:**
```javascript
// NuevoCalculoPage.jsx (línea 14-184)
const calculationTypes = [
  {
    title: 'Proyecto y Dirección de obras de arquitectura',
    shortDescription: '...',
    fullDescription: '...',
    icon: <FaBuilding />,
    path: '/proceso-calculo',
    tipoId: 'Básico',
    Vigente: 'Si'
  },
  // ... 16 tareas más hardcodeadas
];
```

**Problemas actuales:**
- ❌ **Datos duplicados** - Misma info en código y en BD
- ❌ **Mantenimiento difícil** - Cambios requieren redeploy del frontend
- ❌ **No escalable** - Agregar tarea = modificar código
- ❌ **Íconos en react-icons** - Cliente envió SVG personalizados sin usar

**Tabla actual:**
```sql
CREATE TABLE Tareas_Profesionales (
  tarea_id INT AUTO_INCREMENT PRIMARY KEY,
  codi CHAR(10) NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  descripcion_larga VARCHAR(255) NULL,
  vigente BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT NULL,
  FOREIGN KEY (user_id) REFERENCES Usuarios(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 1.2 Estado Objetivo

**Stack Definitivo:**
```
Frontend → GET /api/tareas → Stored Procedure → MySQL → JSON → Cards dinámicas
```

**Características:**
- ✅ **Tareas desde API** - Datos centralizados en BD
- ✅ **Íconos SVG personalizados** - Convención por nombre de archivo (CODI.svg)
- ✅ **CRUD completo** - Gestión de tareas desde backend
- ✅ **Baja lógica** - Auditoría de eliminaciones
- ✅ **tareaId dinámica** - Pasada desde card seleccionada al cálculo

### 1.3 Problema

El array `calculationTypes` está hardcodeado en el frontend con datos que ya existen en la tabla `Tareas_Profesionales`. Además, el `tareaId` está fijo en `18` al hacer el cálculo, cuando debería venir de la tarea seleccionada.

### 1.4 Objetivo

**Migrar las tareas profesionales a consumo completo de API**, incluyendo:
1. CRUD de tareas en backend
2. Consumo de tareas en frontend
3. Paso dinámico de `tareaId` al hacer cálculo
4. Íconos SVG personalizados del cliente

### 1.5 Alcance

**✅ INCLUYE:**
- Modificar tabla `Tareas_Profesionales` (baja lógica)
- Crear Stored Procedures para CRUD
- Crear endpoint `/api/tareas` (GET, POST, DELETE)
- Migrar `NuevoCalculoPage.jsx` a consumo de API
- Pasar `tareaId` dinámica a `ProcesoCalculoPage.jsx`
- Organizar íconos SVG del cliente

**❌ NO INCLUYE:**
- CRUD visual en frontend (se hará con ABM genérico futuro)
- Autenticación con Bearer Token (se usará middleware sin token por ahora)
- Paginación de tareas (son ~17, se devuelven todas)
- Validaciones complejas de negocio

**📝 NOTA IMPORTANTE - ABM Genérico Futuro:**
En futuras SPECs se implementará un **ABM genérico parametrizable** que se reutilizará para todas las entidades de parámetros (Tareas, Complejidades, Tipologías, etc.). Este ABM recibirá un JSON con la configuración de la entidad y realizará el CRUD completo. Se usará el `agent.md` del proyecto anterior como base.

---

## 2. ANÁLISIS DE IMPACTO

### 2.1 Archivos Afectados

#### Backend

| Archivo | Tipo de Cambio | Complejidad |
|---------|---------------|-------------|
| `Tareas_Profesionales.sql` | **MODIFICAR** - Agregar campos baja | 🟢 Baja |
| `Tareas_Profesionales_Listar.sql` | **CREAR** - SP para listar | 🟢 Baja |
| `Tareas_Profesionales_Grabar.sql` | **CREAR** - SP para insertar/actualizar | 🟡 Media |
| `Tareas_Profesionales_Buscar.sql` | **CREAR** - SP para buscar por id | 🟢 Baja |
| `Tareas_Profesionales_Borrar.sql` | **CREAR** - SP para baja lógica | 🟢 Baja |
| `src/models/tareaProfesional.js` | **CREAR** - Modelo Sequelize | 🟢 Baja |
| `src/controllers/tareasProfesionalesController.js` | **CREAR** - Controller REST | 🟡 Media |
| `src/routes/tareasProfesionales.js` | **CREAR** - Rutas Express | 🟢 Baja |
| `src/middlewares/auth.js` | **VERIFICAR** - Middleware existente | 🟢 Ninguna |

#### Frontend

| Archivo | Tipo de Cambio | Complejidad |
|---------|---------------|-------------|
| `/public/assets/icons/tareas/*.svg` | **CREAR** - Carpeta de íconos | 🟢 Baja |
| `src/services/tareasProfesionalesService.js` | **CREAR** - Service layer | 🟢 Baja |
| `src/pages/NuevoCalculoPage.jsx` | **MODIFICAR** - Consumir API | 🟡 Media |
| `src/pages/ProcesoCalculoPage.jsx` | **MODIFICAR** - tareaId dinámica | 🟢 Baja |
| `src/components/common/CalculationTypeCard.jsx` | **MODIFICAR** - Usar <img> para SVG | 🟢 Baja |

### 2.2 Mapeo de Datos

**De Hardcode a API:**

```javascript
// ANTES (hardcode)
{
  title: 'Proyecto y Dirección de obras de arquitectura',
  shortDescription: 'Proyecto y dirección de obra...',  // ❌ NO SE USA
  fullDescription: 'Cálculo de honorarios...',
  icon: <FaBuilding />,                                  // ❌ Cambiar a SVG
  path: '/proceso-calculo',                              // ✅ Se mantiene
  tipoId: 'Básico',                                      // ❌ Cambiar a codi
  Vigente: 'Si'                                          // ❌ Cambiar a boolean
}

// DESPUÉS (desde API)
{
  tarea_id: 18,                                          // ✅ NUEVO
  codi: 'PYDOA',                                         // ✅ NUEVO (para ícono)
  descripcion: 'Proyecto y Dirección de obras...',      // ← title
  descripcion_larga: 'Cálculo de honorarios...',        // ← fullDescription
  vigente: true,                                         // ← Vigente (boolean)
  iconUrl: '/assets/icons/tareas/PYDOA.svg',           // ✅ NUEVO (calculado)
  path: '/proceso-calculo',                              // ✅ Se mantiene
  created_at: '2026-04-21T16:31:39.000Z',
  updated_at: '2026-04-21T16:31:39.000Z'
}
```

### 2.3 Convención de Íconos

**Regla:** El nombre del archivo SVG = campo `codi` de la tarea

```
/public/assets/icons/tareas/
├── PYDOA.svg       ← Proyecto y Dirección
├── DEMO.svg        ← Demoliciones
├── GPYC.svg        ← Gerencia
├── HABI.svg        ← Habilitaciones
├── CONFAC.svg      ← Conservación de fachadas
├── CONSULT.svg     ← Consultas
├── MEDPLAN.svg     ← Medición y planos
├── IMPAMB.svg      ← Impacto ambiental
├── PERI.svg        ← Peritajes
├── HYS.svg         ← Higiene y Seguridad
├── SAUTO.svg       ← Sistemas autoprotección (⚠️ faltante)
├── ARBI.svg        ← Arbitraje (⚠️ faltante)
├── TASA.svg        ← Tasación (⚠️ faltante)
├── REPTEC.svg      ← Representación técnica
├── URBA.svg        ← Urbanismo (⚠️ faltante)
├── DISINT.svg      ← Diseño interiores
├── DISPAI.svg      ← Diseño paisaje
└── DEFAULT.svg     ← Fallback para íconos faltantes
```

### 2.4 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Íconos faltantes rompen UI | 🟡 Media | 🟡 Media | Ícono fallback DEFAULT.svg |
| tareaId null en cálculo | 🟢 Baja | 🔴 Alta | Validación en ProcesoCalculoPage |
| Orden incorrecto de tareas | 🟢 Baja | 🟡 Media | ORDER BY en SP |
| Datos de prueba no coinciden | 🟡 Media | 🟡 Media | Seeds actualizados |

---

## 3. ESPECIFICACIÓN DE CAMBIOS

### 3.1 Modificación de Tabla - Baja Lógica

**Archivo:** `App/Backend/DB/01-Tables/Tareas_Profesionales.sql`

**Campos a agregar:**

```sql
ALTER TABLE Tareas_Profesionales
ADD COLUMN baja_fecha DATETIME NULL COMMENT 'Fecha de baja lógica',
ADD COLUMN baja_usuario_id INT NULL COMMENT 'Usuario que realizó la baja',
ADD CONSTRAINT fk_tareas_baja_usuario 
    FOREIGN KEY (baja_usuario_id) 
    REFERENCES Usuarios(user_id) 
    ON DELETE SET NULL;
```

**Estructura final:**

```sql
CREATE TABLE Tareas_Profesionales (
  -- Identificación
  tarea_id INT AUTO_INCREMENT PRIMARY KEY,
  codi CHAR(10) NOT NULL UNIQUE COMMENT 'Código único inmutable (ej: PYDOA)',
  descripcion VARCHAR(100) NOT NULL COMMENT 'Nombre corto de la tarea',
  descripcion_larga VARCHAR(255) NULL COMMENT 'Descripción completa',
  vigente BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Tarea activa (no en construcción)',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT NULL COMMENT 'Usuario que creó/modificó',
  
  -- Baja lógica
  baja_fecha DATETIME NULL COMMENT 'Fecha de baja lógica',
  baja_usuario_id INT NULL COMMENT 'Usuario que realizó la baja',

  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES Usuarios(user_id) ON DELETE SET NULL,
  FOREIGN KEY (baja_usuario_id) REFERENCES Usuarios(user_id) ON DELETE SET NULL,
  
  -- Índices
  INDEX idx_vigente (vigente),
  INDEX idx_baja_fecha (baja_fecha),
  INDEX idx_codi (codi)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tareas profesionales del sistema de cálculo de honorarios';
```

---

### 3.2 Stored Procedures

#### 3.2.1 SP: Tareas_Profesionales_Listar

**Archivo:** `App/Backend/DB/03-Sps/Tareas_Profesionales_Listar.sql`

**Funcionalidad:** Listar todas las tareas **NO ELIMINADAS** (`baja_fecha IS NULL`), ordenadas por vigente DESC y descripción ASC.

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Tareas_Profesionales_Listar$$

CREATE PROCEDURE Tareas_Profesionales_Listar()
BEGIN
    /*
     * Lista todas las tareas profesionales activas (no eliminadas)
     * Orden: Vigentes primero, luego por nombre
     */
    SELECT 
        tarea_id,
        codi,
        descripcion,
        descripcion_larga,
        vigente,
        created_at,
        updated_at,
        user_id
    FROM Tareas_Profesionales
    WHERE baja_fecha IS NULL
    ORDER BY 
        vigente DESC,           -- Vigentes primero (1, 0)
        descripcion ASC;        -- Luego alfabéticamente
END$$

DELIMITER ;
```

---

#### 3.2.2 SP: Tareas_Profesionales_Buscar

**Archivo:** `App/Backend/DB/03-Sps/Tareas_Profesionales_Buscar.sql`

**Funcionalidad:** Buscar una tarea por `tarea_id`.

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Tareas_Profesionales_Buscar$$

CREATE PROCEDURE Tareas_Profesionales_Buscar(
    IN p_tarea_id INT
)
BEGIN
    /*
     * Busca una tarea profesional por ID
     * Incluye tareas eliminadas para auditoría
     */
    SELECT 
        tarea_id,
        codi,
        descripcion,
        descripcion_larga,
        vigente,
        created_at,
        updated_at,
        user_id,
        baja_fecha,
        baja_usuario_id
    FROM Tareas_Profesionales
    WHERE tarea_id = p_tarea_id;
END$$

DELIMITER ;
```

---

#### 3.2.3 SP: Tareas_Profesionales_Grabar

**Archivo:** `App/Backend/DB/03-Sps/Tareas_Profesionales_Grabar.sql`

**Funcionalidad:** Insertar o actualizar una tarea (UPSERT).

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Tareas_Profesionales_Grabar$$

CREATE PROCEDURE Tareas_Profesionales_Grabar(
    IN p_tarea_id INT,
    IN p_codi CHAR(10),
    IN p_descripcion VARCHAR(100),
    IN p_descripcion_larga VARCHAR(255),
    IN p_vigente BOOLEAN,
    IN p_user_id INT
)
BEGIN
    DECLARE v_existe INT DEFAULT 0;
    
    /*
     * Insertar o actualizar tarea profesional
     * - Si p_tarea_id IS NULL → INSERT
     * - Si p_tarea_id existe → UPDATE
     * - Valida que 'codi' sea único (inmutable)
     */
    
    -- Verificar si existe el ID
    IF p_tarea_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_existe
        FROM Tareas_Profesionales
        WHERE tarea_id = p_tarea_id
          AND baja_fecha IS NULL;
    END IF;
    
    IF v_existe = 0 THEN
        -- INSERT: Nueva tarea
        INSERT INTO Tareas_Profesionales (
            codi,
            descripcion,
            descripcion_larga,
            vigente,
            user_id,
            created_at,
            updated_at
        ) VALUES (
            p_codi,
            p_descripcion,
            p_descripcion_larga,
            p_vigente,
            p_user_id,
            NOW(),
            NOW()
        );
        
        -- Retornar la nueva tarea
        SELECT LAST_INSERT_ID() AS tarea_id;
        
    ELSE
        -- UPDATE: Tarea existente
        -- IMPORTANTE: 'codi' NO se puede modificar (inmutable)
        UPDATE Tareas_Profesionales
        SET 
            descripcion = p_descripcion,
            descripcion_larga = p_descripcion_larga,
            vigente = p_vigente,
            user_id = p_user_id,
            updated_at = NOW()
        WHERE tarea_id = p_tarea_id
          AND baja_fecha IS NULL;
        
        -- Retornar el ID actualizado
        SELECT p_tarea_id AS tarea_id;
    END IF;
END$$

DELIMITER ;
```

---

#### 3.2.4 SP: Tareas_Profesionales_Borrar

**Archivo:** `App/Backend/DB/03-Sps/Tareas_Profesionales_Borrar.sql`

**Funcionalidad:** Baja lógica de una tarea (graba `baja_fecha` y `baja_usuario_id`).

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Tareas_Profesionales_Borrar$$

CREATE PROCEDURE Tareas_Profesionales_Borrar(
    IN p_tarea_id INT,
    IN p_baja_usuario_id INT
)
BEGIN
    /*
     * Baja lógica de tarea profesional
     * Graba fecha y usuario que realizó la baja
     */
    UPDATE Tareas_Profesionales
    SET 
        baja_fecha = NOW(),
        baja_usuario_id = p_baja_usuario_id,
        updated_at = NOW()
    WHERE tarea_id = p_tarea_id
      AND baja_fecha IS NULL;  -- Solo si no está eliminada ya
    
    -- Retornar si se eliminó (affected rows)
    SELECT ROW_COUNT() AS affected_rows;
END$$

DELIMITER ;
```

---

### 3.3 Backend - Modelo

**Archivo:** `App/Backend/Node/src/models/tareaProfesional.js`

```javascript
// TareaProfesional.js - Modelo para gestión de tareas profesionales
const db = require('../config/database');

class TareaProfesional {
  /**
   * Listar todas las tareas activas (no eliminadas)
   * Orden: vigentes primero, luego alfabéticamente
   */
  static async Listar() {
    try {
      const [rows] = await db.query('CALL Tareas_Profesionales_Listar()');
      return rows[0]; // Primera tabla del resultado
    } catch (error) {
      console.error('Error en TareaProfesional.Listar:', error);
      throw error;
    }
  }

  /**
   * Buscar tarea por ID
   * @param {number} tareaId 
   */
  static async Buscar(tareaId) {
    try {
      const [rows] = await db.query(
        'CALL Tareas_Profesionales_Buscar(?)',
        [tareaId]
      );
      return rows[0]?.[0] || null; // Primera fila del resultado
    } catch (error) {
      console.error('Error en TareaProfesional.Buscar:', error);
      throw error;
    }
  }

  /**
   * Insertar o actualizar tarea
   * @param {Object} data - Datos de la tarea
   */
  static async Grabar(data) {
    try {
      const {
        tarea_id = null,
        codi,
        descripcion,
        descripcion_larga,
        vigente,
        user_id
      } = data;

      const [rows] = await db.query(
        'CALL Tareas_Profesionales_Grabar(?, ?, ?, ?, ?, ?)',
        [
          tarea_id,
          codi,
          descripcion,
          descripcion_larga,
          vigente,
          user_id
        ]
      );

      const result = rows[0]?.[0];
      
      // Retornar la tarea completa después de grabar
      if (result?.tarea_id) {
        return await this.Buscar(result.tarea_id);
      }
      
      return null;
    } catch (error) {
      console.error('Error en TareaProfesional.Grabar:', error);
      throw error;
    }
  }

  /**
   * Baja lógica de tarea
   * @param {number} tareaId 
   * @param {number} bajaUsuarioId 
   */
  static async Borrar(tareaId, bajaUsuarioId) {
    try {
      const [rows] = await db.query(
        'CALL Tareas_Profesionales_Borrar(?, ?)',
        [tareaId, bajaUsuarioId]
      );
      
      const result = rows[0]?.[0];
      return result?.affected_rows > 0;
    } catch (error) {
      console.error('Error en TareaProfesional.Borrar:', error);
      throw error;
    }
  }
}

module.exports = TareaProfesional;
```

---

### 3.4 Backend - Controller

**Archivo:** `App/Backend/Node/src/controllers/tareasProfesionalesController.js`

```javascript
// TareasProfesionalesController.js
const TareaProfesional = require('../models/tareaProfesional');

/**
 * Listar todas las tareas activas
 * GET /api/tareas
 */
exports.listar = async (req, res) => {
  try {
    const tareas = await TareaProfesional.Listar();
    res.json(tareas);
  } catch (err) {
    console.error('Error en listar Tareas Profesionales:', err.message);
    res.status(500).json({ error: 'Error al obtener tareas profesionales' });
  }
};

/**
 * Buscar tarea por ID
 * GET /api/tareas/:id
 */
exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID de tarea inválido' });
    }

    const tarea = await TareaProfesional.Buscar(parseInt(id));
    
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (err) {
    console.error('Error en buscar Tarea Profesional:', err.message);
    res.status(500).json({ error: 'Error al buscar tarea profesional' });
  }
};

/**
 * Crear o actualizar tarea
 * POST /api/tareas
 */
exports.grabar = async (req, res) => {
  try {
    const { 
      tarea_id,
      codi, 
      descripcion, 
      descripcion_larga, 
      vigente, 
      user_id 
    } = req.body;

    // Validación de campos requeridos
    if (!codi || !descripcion) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: codi, descripcion' 
      });
    }

    // Validar que codi tenga el formato correcto (máximo 10 caracteres)
    if (codi.length > 10) {
      return res.status(400).json({ 
        error: 'El código (codi) no puede tener más de 10 caracteres' 
      });
    }

    // Si es nuevo (sin tarea_id), validar que codi no exista
    if (!tarea_id) {
      const existe = await TareaProfesional.Buscar(codi);
      if (existe) {
        return res.status(409).json({ 
          error: 'Ya existe una tarea con ese código (codi)' 
        });
      }
    }

    const nuevaTarea = await TareaProfesional.Grabar(req.body);

    if (!nuevaTarea) {
      return res.status(500).json({ 
        error: 'Error al grabar tarea profesional' 
      });
    }

    res.json(nuevaTarea);
  } catch (err) {
    console.error('Error en grabar Tarea Profesional:', err.message);
    res.status(500).json({ error: 'Error al grabar tarea profesional' });
  }
};

/**
 * Baja lógica de tarea
 * DELETE /api/tareas
 */
exports.borrar = async (req, res) => {
  try {
    const { tarea_id, baja_usuario_id } = req.body;

    // Validación de campos requeridos
    if (!tarea_id || !baja_usuario_id) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: tarea_id, baja_usuario_id' 
      });
    }

    const eliminada = await TareaProfesional.Borrar(
      parseInt(tarea_id), 
      parseInt(baja_usuario_id)
    );

    if (!eliminada) {
      return res.status(404).json({ 
        error: 'Tarea no encontrada o ya fue eliminada' 
      });
    }

    res.json({ 
      message: 'Tarea profesional eliminada correctamente',
      tarea_id 
    });
  } catch (err) {
    console.error('Error en borrar Tarea Profesional:', err.message);
    res.status(500).json({ error: 'Error al eliminar tarea profesional' });
  }
};

module.exports = exports;
```

---

### 3.5 Backend - Routes

**Archivo:** `App/Backend/Node/src/routes/tareasProfesionales.js`

```javascript
// tareasProfesionales.js - Rutas para gestión de tareas profesionales
const express = require('express');
const router = express.Router();
const tareasProfesionalesController = require('../controllers/tareasProfesionalesController');
const { verificarToken } = require('../middlewares/auth');

// IMPORTANTE: Por ahora, usar el mismo middleware que calculos/calcular
// (sin verificación de Bearer token, solo validaciones básicas)
// En futuras SPECs se habilitará JWT completo

/**
 * GET /api/tareas
 * Listar todas las tareas activas (no eliminadas)
 * Orden: vigentes primero, luego alfabéticamente
 */
router.get('/', verificarToken, tareasProfesionalesController.listar);

/**
 * GET /api/tareas/:id
 * Buscar tarea por ID
 */
router.get('/:id', verificarToken, tareasProfesionalesController.buscar);

/**
 * POST /api/tareas
 * Crear o actualizar tarea
 * Body: { tarea_id?, codi, descripcion, descripcion_larga, vigente, user_id }
 */
router.post('/', verificarToken, tareasProfesionalesController.grabar);

/**
 * DELETE /api/tareas
 * Baja lógica de tarea
 * Body: { tarea_id, baja_usuario_id }
 */
router.delete('/', verificarToken, tareasProfesionalesController.borrar);

module.exports = router;
```

**Registrar rutas en app.js:**

```javascript
// En: App/Backend/Node/src/app.js (agregar después de las rutas existentes)

const tareasProfesionalesRoutes = require('./routes/tareasProfesionales');
app.use('/api/tareas', tareasProfesionalesRoutes);
```

---

### 3.6 Frontend - Service Layer

**Archivo:** `App/Frontend/src/services/tareasProfesionalesService.js`

```javascript
/**
 * Servicio de Tareas Profesionales - Capa de abstracción para llamadas a API
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 * Versión: 1.0
 * Fecha: 25/04/2026
 */

// Configuración de API - Backend Node.js
// DESA: http://localhost:3000/api
// QA: https://cpau-ch2026-api-qa.neosisweb.ar/api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Obtener todas las tareas profesionales activas
 * Orden: vigentes primero, luego alfabéticamente
 * @returns {Promise<Array>} Array de tareas con estructura:
 *   {
 *     tarea_id: number,
 *     codi: string,
 *     descripcion: string,
 *     descripcion_larga: string,
 *     vigente: boolean,
 *     created_at: string,
 *     updated_at: string,
 *     user_id: number
 *   }
 */
export async function obtenerTareasProfesionales() {
  try {
    const response = await fetch(`${API_BASE_URL}/tareas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tareas = await response.json();
    
    // Enriquecer cada tarea con la URL del ícono
    return tareas.map(tarea => ({
      ...tarea,
      iconUrl: `/assets/icons/tareas/${tarea.codi}.svg`
    }));

  } catch (error) {
    console.error('Error al obtener tareas profesionales:', error);
    throw new Error('No se pudieron cargar las tareas profesionales');
  }
}

/**
 * Buscar tarea por ID
 * @param {number} tareaId 
 * @returns {Promise<Object>} Tarea encontrada
 */
export async function buscarTareaProfesional(tareaId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tareas/${tareaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Tarea no encontrada');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const tarea = await response.json();
    
    return {
      ...tarea,
      iconUrl: `/assets/icons/tareas/${tarea.codi}.svg`
    };

  } catch (error) {
    console.error('Error al buscar tarea profesional:', error);
    throw error;
  }
}
```

---

### 3.7 Frontend - Migración de NuevoCalculoPage

**Archivo:** `App/Frontend/src/pages/NuevoCalculoPage.jsx`

**Cambios principales:**
1. ❌ Eliminar array `calculationTypes` hardcodeado
2. ✅ Consumir API con `useState` + `useEffect`
3. ✅ Mapear datos de API a formato de cards
4. ✅ Pasar `tareaId` al navegar a ProcesoCalculoPage
5. ✅ Manejar loading y errores

**Implementación:**

```javascript
import { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CalculationTypeCard from '../components/common/CalculationTypeCard';
import { obtenerTareasProfesionales } from '../services/tareasProfesionalesService';
import styles from './NuevoCalculoPage.module.css';

/**
 * Página de selección de tipo de cálculo de honorarios
 * Carga tareas desde API en lugar de hardcode
 */
const NuevoCalculoPage = () => {
  const navigate = useNavigate();
  
  // Estado para tareas cargadas desde API
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar tareas al montar el componente
  useEffect(() => {
    const cargarTareas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tareasAPI = await obtenerTareasProfesionales();
        setTareas(tareasAPI);
        
      } catch (err) {
        console.error('Error al cargar tareas:', err);
        setError('No se pudieron cargar las tareas profesionales. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    cargarTareas();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.main}>
        <div className={styles.content}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
            aria-label="Volver al panel"
          >
            <FaArrowLeft className={styles.backIcon} />
            <span>Volver al panel</span>
          </button>

          <div className={styles.header}>
            <h1 className={styles.title}>Nuevo cálculo de honorarios</h1>
            <p className={styles.subtitle}>
              Seleccione la tarea profesional para la cual desea realizar el cálculo de honorarios.
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className={styles.loadingContainer}>
              <p>Cargando tareas profesionales...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorMessage}>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className={styles.retryButton}
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Cards de tareas */}
          {!loading && !error && (
            <div className={styles.cardsGrid}>
              {tareas.map((tarea) => (
                <CalculationTypeCard
                  key={tarea.tarea_id}
                  tareaId={tarea.tarea_id}
                  codi={tarea.codi}
                  title={tarea.descripcion}
                  fullDescription={tarea.descripcion_larga}
                  iconUrl={tarea.iconUrl}
                  path="/proceso-calculo"
                  vigente={tarea.vigente}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NuevoCalculoPage;
```

---

### 3.8 Frontend - Actualizar CalculationTypeCard

**Archivo:** `App/Frontend/src/components/common/CalculationTypeCard.jsx`

**Cambios:**
1. Cambiar de `icon` (componente React) a `iconUrl` (string)
2. Usar `<img>` para cargar SVG
3. Implementar fallback para íconos faltantes
4. Pasar `tareaId` al navegar

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CalculationTypeCard.module.css';

/**
 * Card para seleccionar tipo de cálculo
 * @param {Object} props
 * @param {number} props.tareaId - ID de la tarea (para el cálculo)
 * @param {string} props.codi - Código de la tarea (para ícono)
 * @param {string} props.title - Título del tipo de cálculo
 * @param {string} props.fullDescription - Descripción completa del cálculo
 * @param {string} props.iconUrl - URL del ícono SVG
 * @param {string} props.path - Ruta a navegar
 * @param {boolean} props.vigente - Si está disponible o en construcción
 */
const CalculationTypeCard = ({ 
  tareaId,
  codi,
  title, 
  fullDescription, 
  iconUrl, 
  path, 
  vigente 
}) => {
  const navigate = useNavigate();
  const [iconError, setIconError] = useState(false);

  const handleClick = () => {
    if (!vigente) return; // No permitir click si no está vigente
    
    navigate(path, { 
      state: { 
        tareaId: tareaId,           // ✅ NUEVO: ID numérico para el cálculo
        tipo: codi,                  // Código de la tarea
        tipoNombre: title,           // Nombre de la tarea
        descripcion: fullDescription 
      } 
    });
  };

  // Manejar error de carga de ícono
  const handleIconError = () => {
    setIconError(true);
  };

  return (
    <div 
      className={`${styles.card} ${!vigente ? styles.noVigente : ''}`}
      onClick={handleClick}
    >
      <div className={styles.headerRow}>
        <div className={styles.iconWrapper}>
          <img 
            src={iconError ? '/assets/icons/tareas/DEFAULT.svg' : iconUrl}
            alt={`Ícono de ${title}`}
            className={styles.icon}
            onError={handleIconError}
          />
        </div>
        {!vigente && (
          <div className={styles.badge}>
            <span>En Construcción</span>
          </div>
        )}
      </div>
      
      {fullDescription && (
        <h2 className={styles.description}>{fullDescription}</h2>
      )}
      
      <div className={styles.titleBox}>
        <h3 className={styles.title}>{title}</h3>
      </div>
    </div>
  );
};

export default CalculationTypeCard;
```

**Estilos CSS a agregar:**

```css
/* En: CalculationTypeCard.module.css */

.icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) 
          saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
  /* Este filter convierte el SVG al color primario del tema */
}

.loadingContainer,
.errorContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
}

.errorMessage {
  color: var(--color-error);
  font-size: 1rem;
}

.retryButton {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.retryButton:hover {
  background-color: var(--color-primary-dark);
}
```

---

### 3.9 Frontend - Actualizar ProcesoCalculoPage

**Archivo:** `App/Frontend/src/pages/ProcesoCalculoPage.jsx`

**Cambio:** Pasar `tareaId` dinámica desde location.state en lugar de hardcode.

```javascript
// En: ProcesoCalculoPage.jsx (línea ~50)

const ProcesoCalculoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraer datos de navegación
  const { 
    tareaId,      // ✅ NUEVO: ID numérico de la tarea
    tipo, 
    tipoNombre, 
    descripcion 
  } = location.state || {};

  // Validación: si no hay tareaId, redirigir
  useEffect(() => {
    if (!tareaId) {
      console.error('No se recibió tareaId en ProcesoCalculoPage');
      navigate('/nuevo-calculo');
    }
  }, [tareaId, navigate]);

  // ...resto del código...

  // En la función performCalculation (línea ~159):
  const performCalculation = async () => {
    try {
      setIsCalculating(true);
      
      const datosAPI = {
        calculoId: null,
        usuarioId: 2,             // ⚠️ Temporal (futuro: del contexto)
        tareaId: tareaId,         // ✅ Ahora es dinámico
        datosProyecto: {
          nombre: formData.nombreProyecto,
          ubicacion: formData.ubicacion,
          cliente: formData.cliente,
          tipoObra: formData.tipoObra,
          destinoUso: formData.destinoUso,
          observaciones: formData.observaciones
        },
        datosObra: {
          valorObra: formData.valorObra,
          superficie: formData.superficieTotal,
          valorMetro2: formData.valorMetro2,
          tipologia: formData.tipoObra,
          complejidad: formData.complejidad
        },
        tareasProfesionales: {
          obraProyecto: formData.obraProyecto,
          obraDireccion: formData.obraDireccion,
          instalacionSanitaria: formData.instalacionSanitaria,
          instalacionElectrica: formData.instalacionElectrica,
          instalacionTermomecanica: formData.instalacionTermomecanica,
          instalacionContraIncendio: formData.instalacionContraIncendio,
          proyectoEstructuras: formData.proyectoEstructuras
        }
      };

      // ...resto del código...
    }
  };
};
```

---

## 4. PLAN DE IMPLEMENTACIÓN (TICKETS)

### TICKET #001 - Modificar Tabla Tareas_Profesionales

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Agregar campos para baja lógica en la tabla `Tareas_Profesionales`.

**UBICACIÓN:** `App/Backend/DB/01-Tables/Tareas_Profesionales.sql`

**SUBTAREAS:**

- [ ] **[T001.1]** Crear script ALTER TABLE con campos `baja_fecha` y `baja_usuario_id`
- [ ] **[T001.2]** Agregar foreign key a `Usuarios`
- [ ] **[T001.3]** Crear índices para optimizar consultas
- [ ] **[T001.4]** Ejecutar script en base de datos de desarrollo
- [ ] **[T001.5]** Verificar estructura final con `DESCRIBE Tareas_Profesionales`

**SCRIPT SQL:**

```sql
-- Modificación de tabla Tareas_Profesionales para baja lógica
ALTER TABLE Tareas_Profesionales
ADD COLUMN baja_fecha DATETIME NULL COMMENT 'Fecha de baja lógica',
ADD COLUMN baja_usuario_id INT NULL COMMENT 'Usuario que realizó la baja',
ADD CONSTRAINT fk_tareas_baja_usuario 
    FOREIGN KEY (baja_usuario_id) 
    REFERENCES Usuarios(user_id) 
    ON DELETE SET NULL,
ADD INDEX idx_baja_fecha (baja_fecha);
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Campos agregados correctamente
- ✅ Foreign key funcionando
- ✅ Índices creados
- ✅ No se pierden datos existentes

**TIEMPO ESTIMADO:** 10 minutos

---

### TICKET #002 - Crear Stored Procedures

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Crear los 4 stored procedures para CRUD de tareas profesionales.

**UBICACIÓN:** `App/Backend/DB/03-Sps/`

**SUBTAREAS:**

- [ ] **[T002.1]** Crear `Tareas_Profesionales_Listar.sql`
- [ ] **[T002.2]** Crear `Tareas_Profesionales_Buscar.sql`
- [ ] **[T002.3]** Crear `Tareas_Profesionales_Grabar.sql`
- [ ] **[T002.4]** Crear `Tareas_Profesionales_Borrar.sql`
- [ ] **[T002.5]** Ejecutar todos los SPs en base de datos
- [ ] **[T002.6]** Probar cada SP con datos de prueba

**PRUEBAS:**

```sql
-- Test Listar
CALL Tareas_Profesionales_Listar();

-- Test Buscar
CALL Tareas_Profesionales_Buscar(18);

-- Test Grabar (nuevo)
CALL Tareas_Profesionales_Grabar(
  NULL, 'TEST', 'Tarea Test', 'Descripción test', 1, 2
);

-- Test Grabar (actualizar)
CALL Tareas_Profesionales_Grabar(
  35, 'TEST', 'Tarea Test Modificada', 'Nueva descripción', 0, 2
);

-- Test Borrar
CALL Tareas_Profesionales_Borrar(35, 2);
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ 4 SPs creados correctamente
- ✅ Todos los SPs se ejecutan sin errores
- ✅ Orden correcto en Listar (vigente DESC, descripcion ASC)
- ✅ Campo `codi` es inmutable en UPDATE
- ✅ Baja lógica funciona correctamente

**TIEMPO ESTIMADO:** 30 minutos

---

### TICKET #003 - Crear Modelo TareaProfesional

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Crear modelo Sequelize para gestión de tareas profesionales.

**UBICACIÓN:** `App/Backend/Node/src/models/tareaProfesional.js`

**SUBTAREAS:**

- [ ] **[T003.1]** Crear archivo `tareaProfesional.js`
- [ ] **[T003.2]** Implementar método `Listar()`
- [ ] **[T003.3]** Implementar método `Buscar(tareaId)`
- [ ] **[T003.4]** Implementar método `Grabar(data)`
- [ ] **[T003.5]** Implementar método `Borrar(tareaId, bajaUsuarioId)`
- [ ] **[T003.6]** Probar cada método con console.log

**VALIDACIÓN:**

```javascript
// En Node.js REPL o script de prueba
const TareaProfesional = require('./src/models/tareaProfesional');

// Test Listar
const tareas = await TareaProfesional.Listar();
console.log('Total tareas:', tareas.length);

// Test Buscar
const tarea = await TareaProfesional.Buscar(18);
console.log('Tarea encontrada:', tarea.descripcion);

// Test Grabar
const nueva = await TareaProfesional.Grabar({
  codi: 'TEST',
  descripcion: 'Tarea Test',
  descripcion_larga: 'Descripción completa',
  vigente: true,
  user_id: 2
});
console.log('Nueva tarea ID:', nueva.tarea_id);

// Test Borrar
const eliminada = await TareaProfesional.Borrar(nueva.tarea_id, 2);
console.log('Eliminada:', eliminada);
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Modelo creado con estructura correcta
- ✅ Todos los métodos funcionan
- ✅ Manejo de errores implementado
- ✅ Retorna datos en formato esperado

**TIEMPO ESTIMADO:** 20 minutos

---

### TICKET #004 - Crear Controller tareasProfesionalesController

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Crear controller REST para gestión de tareas profesionales.

**UBICACIÓN:** `App/Backend/Node/src/controllers/tareasProfesionalesController.js`

**SUBTAREAS:**

- [ ] **[T004.1]** Crear archivo `tareasProfesionalesController.js`
- [ ] **[T004.2]** Implementar `listar()` - GET /api/tareas
- [ ] **[T004.3]** Implementar `buscar()` - GET /api/tareas/:id
- [ ] **[T004.4]** Implementar `grabar()` - POST /api/tareas
- [ ] **[T004.5]** Implementar `borrar()` - DELETE /api/tareas
- [ ] **[T004.6]** Agregar validaciones de campos requeridos
- [ ] **[T004.7]** Agregar manejo de errores HTTP

**VALIDACIONES REQUERIDAS:**

```javascript
// En grabar()
- codi requerido (máximo 10 caracteres)
- descripcion requerida
- vigente debe ser boolean
- Si es nuevo, validar que codi no exista

// En borrar()
- tarea_id requerido
- baja_usuario_id requerido
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Controller creado con 4 métodos
- ✅ Validaciones funcionan correctamente
- ✅ Errores HTTP retornan status codes correctos
- ✅ Mensajes de error son claros

**TIEMPO ESTIMADO:** 25 minutos

---

### TICKET #005 - Crear Rutas /api/tareas

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Crear rutas Express para endpoint `/api/tareas`.

**UBICACIÓN:** `App/Backend/Node/src/routes/tareasProfesionales.js`

**SUBTAREAS:**

- [ ] **[T005.1]** Crear archivo `tareasProfesionales.js`
- [ ] **[T005.2]** Definir rutas GET, POST, DELETE
- [ ] **[T005.3]** Aplicar middleware `verificarToken`
- [ ] **[T005.4]** Registrar rutas en `app.js`
- [ ] **[T005.5]** Probar endpoints con Postman

**RUTAS A CREAR:**

```javascript
GET    /api/tareas      - Listar todas las tareas activas
GET    /api/tareas/:id  - Buscar tarea por ID
POST   /api/tareas      - Crear o actualizar tarea
DELETE /api/tareas      - Baja lógica de tarea
```

**PRUEBAS EN POSTMAN:**

```bash
# GET Listar
GET http://localhost:3000/api/tareas

# GET Buscar
GET http://localhost:3000/api/tareas/18

# POST Crear
POST http://localhost:3000/api/tareas
Body: {
  "codi": "TEST",
  "descripcion": "Tarea Test",
  "descripcion_larga": "Descripción completa",
  "vigente": true,
  "user_id": 2
}

# POST Actualizar
POST http://localhost:3000/api/tareas
Body: {
  "tarea_id": 35,
  "codi": "TEST",
  "descripcion": "Tarea Test Modificada",
  "descripcion_larga": "Nueva descripción",
  "vigente": false,
  "user_id": 2
}

# DELETE Borrar
DELETE http://localhost:3000/api/tareas
Body: {
  "tarea_id": 35,
  "baja_usuario_id": 2
}
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Rutas registradas correctamente
- ✅ Middleware aplicado
- ✅ Todos los endpoints responden correctamente
- ✅ CORS funcionando para frontend local

**TIEMPO ESTIMADO:** 15 minutos

---

### TICKET #006 - Organizar Íconos SVG

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Renombrar y organizar los íconos SVG del cliente en carpeta pública.

**UBICACIÓN:** `App/Frontend/public/assets/icons/tareas/`

**SUBTAREAS:**

- [ ] **[T006.1]** Crear carpeta `/public/assets/icons/tareas/`
- [ ] **[T006.2]** Renombrar todos los SVG con código CODI
- [ ] **[T006.3]** Crear ícono DEFAULT.svg para fallback
- [ ] **[T006.4]** Validar que los 17 íconos están presentes
- [ ] **[T006.5]** Optimizar SVG (remover metadata innecesaria)

**MAPEO DE NOMBRES:**

```
Proyecto y Dirección de obras de arquitectura.svg    → PYDOA.svg
Demoliciones.svg                                      → DEMO.svg
Gerencia de proyectos y construcciones.svg            → GPYC.svg
Habilitaciones.svg                                    → HABI.svg
Conservación de fachadas.svg                          → CONFAC.svg
Consultas y otras tareas por tiempo empleado.svg      → CONSULT.svg
Medición y ejecución de planos.svg                    → MEDPLAN.svg
Impacto ambiental.svg                                 → IMPAMB.svg
Peritajes.svg                                         → PERI.svg
Higiene y Seguridad.svg                               → HYS.svg
Diseño de interiores21.svg                            → DISINT.svg
Diseño de paisaje.svg                                 → DISPAI.svg
Representación técnica.svg                            → REPTEC.svg
```

**ÍCONOS FALTANTES (usar DEFAULT.svg):**
- SAUTO.svg - Sistemas de autoprotección
- ARBI.svg - Arbitraje
- TASA.svg - Tasación
- URBA.svg - Urbanismo

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Carpeta creada en `/public/assets/icons/tareas/`
- ✅ 17 íconos renombrados correctamente
- ✅ Ícono DEFAULT.svg creado
- ✅ Tamaño de archivos optimizado (< 10KB cada uno)

**TIEMPO ESTIMADO:** 20 minutos

---

### TICKET #007 - Crear Servicio tareasProfesionalesService

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Crear service layer en frontend para consumo de API de tareas.

**UBICACIÓN:** `App/Frontend/src/services/tareasProfesionalesService.js`

**SUBTAREAS:**

- [ ] **[T007.1]** Crear archivo `tareasProfesionalesService.js`
- [ ] **[T007.2]** Implementar `obtenerTareasProfesionales()`
- [ ] **[T007.3]** Implementar `buscarTareaProfesional(tareaId)`
- [ ] **[T007.4]** Enriquecer respuesta con `iconUrl`
- [ ] **[T007.5]** Agregar manejo de errores
- [ ] **[T007.6]** Probar service con console.log

**VALIDACIÓN:**

```javascript
// En consola del navegador
import { obtenerTareasProfesionales } from './services/tareasProfesionalesService';

const tareas = await obtenerTareasProfesionales();
console.log('Total tareas:', tareas.length);
console.log('Primera tarea:', tareas[0]);
console.log('iconUrl:', tareas[0].iconUrl);
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Service creado con 2 funciones
- ✅ Consume API_BASE_URL correctamente
- ✅ Enriquece respuesta con iconUrl
- ✅ Manejo de errores implementado

**TIEMPO ESTIMADO:** 15 minutos

---

### TICKET #008 - Migrar NuevoCalculoPage a API

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Eliminar array hardcodeado y consumir tareas desde API.

**UBICACIÓN:** `App/Frontend/src/pages/NuevoCalculoPage.jsx`

**SUBTAREAS:**

- [ ] **[T008.1]** Eliminar array `calculationTypes` (líneas 14-184)
- [ ] **[T008.2]** Agregar imports de useState, useEffect
- [ ] **[T008.3]** Implementar estado para tareas, loading, error
- [ ] **[T008.4]** Llamar a `obtenerTareasProfesionales()` en useEffect
- [ ] **[T008.5]** Agregar UI de loading
- [ ] **[T008.6]** Agregar UI de error con botón reintentar
- [ ] **[T008.7]** Actualizar props de CalculationTypeCard

**ANTES Y DESPUÉS:**

```javascript
// ANTES - Hardcode
const calculationTypes = [
  { title: '...', icon: <FaBuilding />, ... },
  // ... 16 más
];

// DESPUÉS - API
const [tareas, setTareas] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const cargarTareas = async () => {
    const tareasAPI = await obtenerTareasProfesionales();
    setTareas(tareasAPI);
  };
  cargarTareas();
}, []);
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Array hardcodeado eliminado
- ✅ Tareas se cargan desde API
- ✅ Loading state visible
- ✅ Error state con reintentar
- ✅ Cards se renderizan correctamente

**TIEMPO ESTIMADO:** 30 minutos

---

### TICKET #009 - Migrar ProcesoCalculoPage (tareaId dinámica)

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Cambiar `tareaId` de hardcode (18) a valor dinámico desde location.state.

**UBICACIÓN:** `App/Frontend/src/pages/ProcesoCalculoPage.jsx`

**SUBTAREAS:**

- [x] **[T009.1]** Extraer `tareaId` desde location.state (línea ~50)
- [x] **[T009.2]** Agregar validación de tareaId presente
- [x] **[T009.3]** Redirigir si no hay tareaId
- [x] **[T009.4]** Usar tareaId en datosAPI (línea ~159)
- [x] **[T009.5]** Actualizar CalculationTypeCard para pasar tareaId

**CAMBIOS:**

```javascript
// ANTES - Hardcode
const datosAPI = {
  calculoId: null,
  usuarioId: 2,
  tareaId: 18,  // ❌ Hardcodeado
  // ...
};

// DESPUÉS - Dinámico
const { tareaId, tipo, tipoNombre, descripcion } = location.state || {};

const datosAPI = {
  calculoId: null,
  usuarioId: 2,
  tareaId: tareaId,  // ✅ Dinámico
  // ...
};
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ tareaId se extrae de location.state
- ✅ Validación de tareaId implementada
- ✅ Redirección funciona si falta tareaId
- ✅ Cálculo usa tareaId correcta
- ✅ CalculationTypeCard pasa tareaId al navegar

**TIEMPO ESTIMADO:** 20 minutos

---

### TICKET #010 - Testing End-to-End

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Probar el flujo completo desde selección de tarea hasta cálculo.

**PRECONDICIONES:**
- Backend Node.js corriendo en `http://localhost:3000`
- Frontend corriendo en `http://localhost:5173`
- Base de datos con tareas actualizadas
- Íconos SVG en `/public/assets/icons/tareas/`

**SUBTAREAS:**

- [ ] **[T010.1]** Probar carga de tareas en NuevoCalculoPage
- [ ] **[T010.2]** Verificar que íconos se muestran correctamente
- [ ] **[T010.3]** Probar fallback de ícono DEFAULT.svg
- [ ] **[T010.4]** Seleccionar tarea "PYDOA" y navegar
- [ ] **[T010.5]** Verificar que tareaId=18 llega a ProcesoCalculoPage
- [ ] **[T010.6]** Completar wizard hasta cálculo
- [ ] **[T010.7]** Verificar que cálculo usa tareaId correcta
- [ ] **[T010.8]** Probar con otra tarea (ej: DEMO)
- [ ] **[T010.9]** Probar error cuando backend está offline
- [ ] **[T010.10]** Documentar evidencias de prueba

**CASOS DE PRUEBA:**

**CP-001: Carga exitosa de tareas**
- Abrir `http://localhost:5173/nuevo-calculo`
- Verificar que se muestran 17 cards
- Verificar orden: vigentes primero (PYDOA), luego no vigentes
- Verificar íconos SVG cargados

**CP-002: Selección de tarea vigente**
- Click en card "PYDOA"
- Verificar navegación a `/proceso-calculo`
- Verificar que state tiene `tareaId: 18`
- Completar wizard
- Verificar que request tiene `"tareaId": 18`

**CP-003: Tarea no vigente**
- Click en card "Demoliciones" (no vigente)
- Verificar que no navega
- Badge "En Construcción" visible

**CP-004: Ícono faltante**
- Renombrar temporalmente `PYDOA.svg` a `PYDOA_backup.svg`
- Recargar página
- Verificar que se muestra `DEFAULT.svg`
- Restaurar archivo

**CP-005: Backend offline**
- Apagar backend Node.js
- Recargar `/nuevo-calculo`
- Verificar mensaje de error
- Click en "Reintentar"
- Encender backend
- Verificar que se cargan tareas

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Todos los casos de prueba pasan
- ✅ No hay errores en consola
- ✅ Flujo completo funciona end-to-end
- ✅ Evidencias documentadas

**TIEMPO ESTIMADO:** 40 minutos

---

### TICKET #011 - Actualizar Variables de Entorno en AWS Lambda

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Actualizar las variables de entorno de la función Lambda en AWS para incluir la nueva configuración de autenticación JWT con middleware adaptativo (REQUIRE_JWT).

**UBICACIÓN:** AWS Console → Lambda → Función del Backend CH2026 → Configuration → Environment variables

**SUBTAREAS:**

- [x] **[T011.1]** Acceder a AWS Console y navegar a la función Lambda
- [x] **[T011.2]** Agregar variable REQUIRE_JWT (false en desarrollo)
- [x] **[T011.3]** Verificar JWT_SECRET existe y es seguro
- [x] **[T011.4]** Verificar JWT_EXPIRES_IN existe (24h)
- [x] **[T011.5]** Verificar variables de base de datos
- [x] **[T011.6]** Guardar cambios en Lambda
- [x] **[T011.7]** Verificar funcionamiento post-cambio

**VARIABLES A AGREGAR/ACTUALIZAR EN AWS LAMBDA:**

**1. REQUIRE_JWT** ⭐ NUEVA
```
Key: REQUIRE_JWT
Value: false
```
⚠️ **Importante:** Cambiar a `true` cuando se implemente el login de usuarios

**2. JWT_SECRET** (verificar que existe)
```
Value: Generar valor fuerte único (mínimo 32 caracteres)
Ejemplo: openssl rand -base64 32
```

**3. JWT_EXPIRES_IN** (verificar que existe)
```
Value: 24h
```

**4. Variables de Base de Datos** (verificar)
```
DB_HOST: endpoint de la base de datos
DB_USER: usuario de conexión
DB_PASSWORD: contraseña (puede estar en Secrets Manager)
DB_NAME: nombre de la base de datos
```

**PASOS DETALLADOS:**

1. **Acceder a AWS Console**
   - URL: https://console.aws.amazon.com/
   - Servicio: Lambda
   - Región: Verificar región correcta

2. **Seleccionar la función Lambda del backend CH2026**

3. **Ir a Configuration → Environment variables**

4. **Agregar/Editar variables:**
   - Click en "Edit"
   - Agregar `REQUIRE_JWT` con valor `false`
   - Verificar JWT_SECRET, JWT_EXPIRES_IN, DB_*
   - Click en "Save"

5. **Verificar que no haya errores en CloudWatch Logs**

6. **Probar endpoint con JWT opcional:**
   ```bash
   curl https://[lambda-url]/api/tareas
   # Debe funcionar sin token si REQUIRE_JWT=false
   ```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Variable REQUIRE_JWT agregada a Lambda
- ✅ JWT_SECRET y JWT_EXPIRES_IN configurados
- ✅ Middleware adaptativo funciona correctamente
- ✅ API responde sin token cuando REQUIRE_JWT=false
- ✅ API requiere token cuando REQUIRE_JWT=true
   - Click "..." → "Redeploy"
   - Esperar deployment exitoso

**DOCUMENTACIÓN:**

Asegurar que `.env.example` incluya:
```bash
# Requerir JWT en todas las rutas protegidas
# false = permite acceso sin token (modo desarrollo)
# true = requiere token válido (modo producción)
# CAMBIAR A true CUANDO SE IMPLEMENTE EL LOGIN
REQUIRE_JWT=false
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Variable REQUIRE_JWT agregada en Vercel (todos los ambientes)
- ✅ JWT_SECRET verificado y seguro en Production
- ✅ JWT_EXPIRES_IN configurado (24h)
- ✅ Redeploy exitoso en todos los ambientes
- ✅ Backend funciona correctamente post-deploy
- ✅ Middleware JWT en modo permisivo (REQUIRE_JWT=false)

**DEPENDENCIAS:**
- Ninguna (puede hacerse en paralelo)

**TIEMPO ESTIMADO:** 15 minutos

---

## 5. CASOS DE PRUEBA

### 5.1 Caso de Prueba: Carga de Tareas desde API

**Precondiciones:**
- Backend Node.js corriendo
- Base de datos con 17 tareas
- Frontend en `http://localhost:5173`

**Pasos:**
1. Navegar a `/nuevo-calculo`
2. Esperar carga de tareas

**Resultado Esperado:**
- ✅ Se muestran 17 cards
- ✅ Orden: vigente=true primero, luego alfabético
- ✅ Primera card: "PYDOA" (vigente)
- ✅ Íconos SVG cargados correctamente
- ✅ No hay errores en consola

**Validación Técnica:**
```javascript
// En DevTools → Network
GET http://localhost:3000/api/tareas
Status: 200 OK

// Response:
[
  {
    "tarea_id": 18,
    "codi": "PYDOA",
    "descripcion": "Proyecto y Dirección...",
    "vigente": true,
    ...
  },
  // ... 16 más
]
```

---

### 5.2 Caso de Prueba: tareaId Dinámica en Cálculo

**Precondiciones:**
- Tareas cargadas correctamente
- Backend funcionando

**Pasos:**
1. Hacer clic en card "PYDOA"
2. Completar wizard hasta revisión
3. Hacer cálculo

**Resultado Esperado:**
- ✅ Navigation state tiene `tareaId: 18`
- ✅ Request a `/api/calculos/calcular` tiene `"tareaId": 18`
- ✅ Cálculo se ejecuta correctamente
- ✅ Se guarda en BD con `tarea_id = 18`

**Validación Técnica:**
```javascript
// En DevTools → Network → calcular
POST http://localhost:3000/api/calculos/calcular
Body: {
  "calculoId": null,
  "usuarioId": 2,
  "tareaId": 18,  // ✅ Dinámico desde card seleccionada
  "datosProyecto": {...},
  "datosObra": {...},
  "tareasProfesionales": {...}
}
```

---

### 5.3 Caso de Prueba: Fallback de Ícono

**Precondiciones:**
- Tarea "SAUTO" existe en BD pero no tiene ícono

**Pasos:**
1. Cargar `/nuevo-calculo`
2. Buscar card "Sistemas de autoprotección"

**Resultado Esperado:**
- ✅ Card se muestra correctamente
- ✅ Se carga `/assets/icons/tareas/DEFAULT.svg`
- ✅ No hay error en consola
- ✅ Card es clickeable (si está vigente)

---

### 5.4 Caso de Prueba: Error de Conexión

**Precondiciones:**
- Backend Node.js **APAGADO**

**Pasos:**
1. Abrir `/nuevo-calculo`

**Resultado Esperado:**
- ⚠️ Mensaje: "No se pudieron cargar las tareas profesionales. Intente nuevamente."
- ⚠️ Botón "Reintentar" visible
- ⚠️ No se muestran cards
- ⚠️ Click en reintentar recarga la página

---

### 5.5 Caso de Prueba: CRUD Backend (Postman)

**Test 1: Listar**
```bash
GET http://localhost:3000/api/tareas

Esperado:
Status: 200
Body: Array de 17 tareas
```

**Test 2: Buscar**
```bash
GET http://localhost:3000/api/tareas/18

Esperado:
Status: 200
Body: { tarea_id: 18, codi: 'PYDOA', ... }
```

**Test 3: Crear**
```bash
POST http://localhost:3000/api/tareas
Body: {
  "codi": "TEST",
  "descripcion": "Tarea Test",
  "descripcion_larga": "Descripción completa",
  "vigente": true,
  "user_id": 2
}

Esperado:
Status: 200
Body: { tarea_id: 35, codi: 'TEST', ... }
```

**Test 4: Actualizar**
```bash
POST http://localhost:3000/api/tareas
Body: {
  "tarea_id": 35,
  "codi": "TEST",
  "descripcion": "Tarea Modificada",
  "descripcion_larga": "Nueva descripción",
  "vigente": false,
  "user_id": 2
}

Esperado:
Status: 200
Body: { tarea_id: 35, descripcion: 'Tarea Modificada', ... }
```

**Test 5: Borrar**
```bash
DELETE http://localhost:3000/api/tareas
Body: {
  "tarea_id": 35,
  "baja_usuario_id": 2
}

Esperado:
Status: 200
Body: { message: 'Tarea profesional eliminada correctamente', tarea_id: 35 }
```

**Test 6: Verificar baja lógica**
```bash
GET http://localhost:3000/api/tareas

Esperado:
- Tarea 35 NO debe aparecer en listado
```

---

## 6. CRITERIOS DE ACEPTACIÓN

### 6.1 Funcionales

- [ ] ✅ **F001:** Tareas se cargan desde API en NuevoCalculoPage
- [ ] ✅ **F002:** Orden correcto: vigentes primero, luego alfabético
- [ ] ✅ **F003:** Íconos SVG se muestran correctamente
- [ ] ✅ **F004:** Fallback DEFAULT.svg funciona para íconos faltantes
- [ ] ✅ **F005:** tareaId se pasa correctamente al hacer cálculo
- [ ] ✅ **F006:** Cálculo se guarda con tarea_id correcta
- [ ] ✅ **F007:** Mensaje de error si backend no responde
- [ ] ✅ **F008:** Botón "Reintentar" funciona correctamente

### 6.2 Técnicos - Backend

- [ ] ✅ **TB001:** Tabla modificada con campos baja_fecha y baja_usuario_id
- [ ] ✅ **TB002:** 4 Stored Procedures creados y funcionando
- [ ] ✅ **TB003:** Modelo TareaProfesional implementado
- [ ] ✅ **TB004:** Controller con validaciones correctas
- [ ] ✅ **TB005:** Rutas registradas en `/api/tareas`
- [ ] ✅ **TB006:** Middleware de autenticación aplicado
- [ ] ✅ **TB007:** Baja lógica funciona (no se eliminan físicamente)

### 6.3 Técnicos - Frontend

- [ ] ✅ **TF001:** Array hardcodeado eliminado de NuevoCalculoPage
- [ ] ✅ **TF002:** Service layer creado y funcionando
- [ ] ✅ **TF003:** useState + useEffect implementados correctamente
- [ ] ✅ **TF004:** Loading state visible durante carga
- [ ] ✅ **TF005:** Error state con UI clara
- [ ] ✅ **TF006:** CalculationTypeCard usa <img> en lugar de React icons
- [ ] ✅ **TF007:** tareaId extraída de location.state en ProcesoCalculoPage
- [ ] ✅ **TF008:** Validación de tareaId implementada

### 6.4 Performance y UX

- [ ] ✅ **P001:** Carga de tareas < 500ms
- [ ] ✅ **P002:** Transición suave entre loading y contenido
- [ ] ✅ **P003:** Íconos optimizados (< 10KB cada uno)
- [ ] ✅ **P004:** No hay flash de contenido no estilizado (FOUC)
- [ ] ✅ **P005:** Experiencia idéntica a la versión hardcodeada

### 6.5 Documentación

- [ ] ✅ **D001:** Stored Procedures documentados con comentarios
- [ ] ✅ **D002:** Service layer documentado con JSDoc
- [ ] ✅ **D003:** README actualizado con nueva arquitectura
- [ ] ✅ **D004:** Casos de prueba documentados en esta SPEC

---

## 7. ROLLBACK PLAN

En caso de problemas, el rollback es **simple**:

### 7.1 Rollback Frontend (< 2 minutos)

**Restaurar array hardcodeado:**

```bash
git checkout HEAD -- App/Frontend/src/pages/NuevoCalculoPage.jsx
git checkout HEAD -- App/Frontend/src/components/common/CalculationTypeCard.jsx
```

**Condición:** Frontend vuelve a usar datos hardcodeados.

---

### 7.2 Rollback Backend (< 5 minutos)

**Si hay problemas con los SPs:**

```sql
-- Eliminar SPs nuevos
DROP PROCEDURE IF EXISTS Tareas_Profesionales_Listar;
DROP PROCEDURE IF EXISTS Tareas_Profesionales_Buscar;
DROP PROCEDURE IF EXISTS Tareas_Profesionales_Grabar;
DROP PROCEDURE IF EXISTS Tareas_Profesionales_Borrar;

-- Revertir tabla (si es necesario)
ALTER TABLE Tareas_Profesionales
DROP COLUMN baja_fecha,
DROP COLUMN baja_usuario_id,
DROP FOREIGN KEY fk_tareas_baja_usuario;
```

**Si hay problemas con el código Node.js:**

```bash
# Comentar rutas en app.js
// app.use('/api/tareas', tareasProfesionalesRoutes);

# O eliminar archivos creados
rm src/models/tareaProfesional.js
rm src/controllers/tareasProfesionalesController.js
rm src/routes/tareasProfesionales.js
```

---

## 8. NOTAS FINALES

### 8.1 Próximos Pasos (DESPUÉS de esta SPEC)

1. **ABM Genérico Parametrizable:**
   - Reutilizar para todas las entidades de parámetros
   - Usar `agent.md` de proyecto anterior como base
   - JSON de configuración por entidad

2. **Autenticación completa con JWT:**
   - Habilitar Bearer Token en middleware
   - Eliminar hardcode de `usuarioId`

3. **Gestión de íconos:**
   - Subir íconos faltantes (SAUTO, ARBI, TASA, URBA)
   - Optimizar SVG (remover metadata)
   - Implementar lazy loading de íconos

### 8.2 Dependencias

**Backend debe tener:**
- ✅ Base de datos MySQL funcionando
- ✅ Tabla `Tareas_Profesionales` con datos
- ✅ Middleware `verificarToken` configurado
- ✅ CORS habilitado para frontend local

**Frontend debe tener:**
- ✅ Variable `VITE_API_URL` configurada
- ✅ Carpeta `/public/assets/icons/tareas/` creada
- ✅ React Router funcionando

### 8.3 Notas Importantes

**⚠️ Campo `codi` es INMUTABLE:**
- No se puede cambiar después de crear la tarea
- Es la clave para asociar con el ícono SVG
- Si necesitas cambiar, debes crear una nueva tarea

**⚠️ Middleware sin Bearer Token:**
- Por ahora, endpoints usan middleware sin validación de token
- Misma configuración que `/api/calculos/calcular`
- Se habilitará JWT completo en futuras SPECs

**⚠️ ABM Visual pendiente:**
- Esta SPEC solo implementa API backend
- CRUD visual se hará con ABM genérico futuro
- Por ahora, cambios se hacen directo en BD o Postman

---

**FIN DE ESPECIFICACIÓN**

---

**Aprobación:**
- [ ] Charly (Full Stack Lead)
- [ ] Equipo Backend (validar SPs y modelo)
- [ ] Equipo Frontend (validar service y componentes)
- [ ] QA (validar casos de prueba)

**Fecha Objetivo de Implementación:** 26/04/2026  
**Esfuerzo Estimado:** 3.5 horas  
**Prioridad:** 🔴 ALTA
