# SPEC-029: Gestión de Términos y Condiciones

**Fecha:** 2026-08-05  
**Versión:** 1.0  
**Estado:** Backend Completado - Frontend Pendiente  
**Prioridad:** ALTA

**Progreso de Implementación:**
- ✅ **Tickets 001-014:** Backend completo (Base de datos + API + Testing)
- ⏳ **Ticket 015:** Documentación frontend pendiente

---

## 1. CONTEXTO Y PROBLEMÁTICA

### 1.1. Situación Actual
- El sistema CH2026 no cuenta con gestión de Términos y Condiciones (TyC)
- No existe mecanismo para que los usuarios acepten TyC al ingresar al sistema
- No hay registro de qué usuarios aceptaron qué versión de TyC
- El cliente CPAU ha proporcionado el primer borrador de TyC para implementar

### 1.2. Requerimiento del Cliente
El cliente CPAU requiere:
- **Gestión de documento de TyC** con histórico de versiones
- **Solo una versión vigente** en todo momento
- **Control de aceptación** por usuario (fecha/hora)
- **Bloqueo de acceso** si el usuario no aceptó los TyC vigentes
- Cuando se publica un nuevo TyC, **todos los usuarios** deben re-aceptar

### 1.3. Alcance del Backend (Esta Spec)
Esta especificación cubre **exclusivamente el Backend**:
- CRUD de Términos y Condiciones (solo para administradores)
- Endpoint público para obtener TyC vigentes
- Registro de aceptación de TyC por usuario
- Estructura de base de datos (tablas, índices, stored procedures)
- APIs REST para gestión y consulta

**El Frontend (no incluido en esta spec) será responsable de:**
- Mostrar los TyC al usuario durante el login
- Bloquear acceso si `tyc_aceptado_fecha IS NULL`
- Llamar al endpoint de aceptación cuando el usuario confirme
- Renderizar el Markdown de los TyC

### 1.4. Observación - Validación Futura
**PENDIENTE DE CONFIRMACIÓN CON CLIENTE:**  
Evaluar si se debe validar la aceptación de TyC antes de permitir guardar un cálculo de honorarios. Escenario:
- Usuario se loguea → acepta TyC → comienza a cargar un cálculo
- Durante la carga, se publica un nuevo TyC (su campo `tyc_aceptado_fecha` pasa a `NULL`)
- Usuario intenta guardar el cálculo

**Solución propuesta (a confirmar):**  
El endpoint `POST /api/calculos` debería validar `usuarios.tyc_aceptado_fecha IS NOT NULL` antes de permitir el guardado, y devolver error 403 si es null, obligando al frontend a mostrar nuevamente los TyC.

**Estado:** Dejamos la observación documentada. La implementación en el endpoint de cálculos se realizará cuando el cliente confirme el requerimiento.

---

## 2. ARQUITECTURA DE SOLUCIÓN

### 2.1. Flujo de Aceptación de TyC

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USUARIO SE LOGUEA (SPEC-024)                                 │
│    - POST /api/usuarios/login                                    │
│    - Recibe token JWT + datos usuario                            │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│ 2. FRONTEND - Verificar aceptación TyC                          │
│    - Si usuario.tyc_aceptado_fecha === null                      │
│      → Bloquear acceso y mostrar modal de TyC                    │
│    - Llamar GET /api/terminos-condiciones/vigente (público)      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│ 3. FRONTEND - Mostrar TyC                                       │
│    - Renderizar contenido Markdown                               │
│    - Mostrar checkbox "Acepto los Términos y Condiciones"        │
│    - Botón "Continuar" deshabilitado hasta aceptar               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│ 4. BACKEND - Registrar aceptación                               │
│    - POST /api/usuarios/:id/aceptar-terminos                     │
│    - Actualiza usuarios.tyc_aceptado_fecha = NOW()               │
│    - Actualiza usuarios.tyc_version_aceptada                     │
│    - Actualiza usuarios.tyc_id_aceptado                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│ 5. FRONTEND - Permitir acceso a la aplicación                   │
└──────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────┐
│ FLUJO ADMIN: Publicar nuevo TyC                                  │
│                                                                   │
│  1. ADMIN - POST /api/terminos-condiciones                       │
│     - Crea nuevo TyC con vigente=TRUE                            │
│     - Desactiva todos los anteriores (vigente=FALSE)             │
│     - RESETEA tyc_aceptado_fecha=NULL en TODOS los usuarios      │
│                                                                   │
│  2. Próximo login de usuarios:                                   │
│     - tyc_aceptado_fecha es NULL → Deben re-aceptar              │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2. Componentes Involucrados

#### Base de Datos (MySQL)
```
DB/
├── 01-Tables/
│   ├── Terminos_Condiciones.sql              [NUEVO]
│   │   - tyc_id (PK)
│   │   - version (ej: "1.0", "2.0")
│   │   - contenido_md (MEDIUMTEXT - Markdown)
│   │   - vigente (BOOLEAN - solo uno en TRUE)
│   │   - fecha_vigencia (DATE NOT NULL)
│   │   - user_id (FK a Usuarios)
│   │   - created_at
│   │
│   └── Usuarios.sql                          [MODIFICAR]
│       - Agregar campos:
│         * tyc_aceptado_fecha DATETIME NULL
│         * tyc_version_aceptada VARCHAR(20) NULL
│         * tyc_id_aceptado INT NULL (FK a Terminos_Condiciones)
│
└── 03-Sps/
    ├── Terminos_Condiciones_Listar.sql       [NUEVO]
    ├── Terminos_Condiciones_BuscarVigente.sql [NUEVO]
    ├── Terminos_Condiciones_Buscar.sql       [NUEVO]
    ├── Terminos_Condiciones_Grabar.sql       [NUEVO]
    ├── Terminos_Condiciones_MarcarVigente.sql [NUEVO]
    └── Usuarios_AceptarTerminos.sql         [NUEVO]
```

#### Backend Node.js
```
src/
├── models/
│   ├── terminosCondiciones.js                [NUEVO]
│   │   - Listar()
│   │   - BuscarVigente()
│   │   - Buscar(id)
│   │   - Grabar(data)
│   │   - MarcarVigente(id)
│   │
│   └── usuario.js                           [MODIFICAR]
│       - Agregar: AceptarTYC(user_id, tyc_id)
│
├── controllers/
│   ├── terminosCondicionesController.js      [NUEVO]
│   │   - listar (admin)
│   │   - buscar (admin)
│   │   - buscarVigente (público)
│   │   - grabar (admin)
│   │   - marcarVigente (admin)
│   │
│   └── usuariosController.js                [MODIFICAR]
│       - Agregar: aceptarTerminos
│
├── routes/
│   ├── terminosCondiciones.js                [NUEVO]
│   │   - GET  /                (admin - listar histórico)
│   │   - GET  /vigente         (público - obtener vigente)
│   │   - GET  /:id             (admin - buscar por ID)
│   │   - POST /                (admin - crear Y activar)
│   │   - PUT  /:id/activar     (admin - marcar como vigente)
│   │
│   └── usuarios.js                          [MODIFICAR]
│       - POST /:id/aceptar-terminos
│
└── app.js                                   [MODIFICAR]
    - Agregar: app.use('/api/terminos-condiciones', tycRoutes)
```

---

## 3. ESPECIFICACIÓN TÉCNICA DETALLADA

### 3.1. Base de Datos - Tablas

#### 3.1.1. Tabla: Terminos_Condiciones

**Archivo:** `App/Backend/DB/01-Tables/Terminos_Condiciones.sql`

```sql
DROP TABLE IF EXISTS `Terminos_Condiciones`;

CREATE TABLE IF NOT EXISTS `Terminos_Condiciones` (
  `tyc_id` INT NOT NULL AUTO_INCREMENT,
  `version` VARCHAR(20) NOT NULL COMMENT 'Ej: 1.0, 1.1, 2.0',
  `contenido_md` MEDIUMTEXT NOT NULL COMMENT 'Contenido en formato Markdown',
  `vigente` BOOLEAN NOT NULL DEFAULT FALSE,
  `fecha_vigencia` DATE NOT NULL COMMENT 'Fecha de vigencia',
  `user_id` INT NULL COMMENT 'Usuario que creó esta versión',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tyc_id`),
  INDEX `idx_vigente` (`vigente`),
  INDEX `idx_fecha_vigencia` (`fecha_vigencia` DESC),
  FOREIGN KEY (`user_id`) REFERENCES `Usuarios`(`user_id`)
) ENGINE = InnoDB
COMMENT = 'Histórico de Términos y Condiciones del sistema';
```

**Descripción:**
- `tyc_id`: Identificador único
- `version`: Versión semántica (ej: "1.0", "2.0") - campo informativo
- `contenido_md`: Texto completo en formato Markdown
- `vigente`: Flag booleano - **solo un registro puede tener TRUE**
- `fecha_vigencia`: Fecha de vigencia (DATE NOT NULL)
- `user_id`: Administrador que creó el documento
- `created_at`: Fecha de creación
- Índices para búsquedas rápidas por vigencia y fecha

#### 3.1.2. Modificación: Tabla Usuarios

**Archivo:** `App/Backend/DB/04-Alteraciones/Usuarios_TYC_Fields.sql`

```sql
-- Agregar campos para tracking de aceptación de TyC
ALTER TABLE `Usuarios` 
  ADD COLUMN `tyc_aceptado_fecha` DATETIME NULL 
    COMMENT 'Fecha-hora de aceptación TyC. NULL = debe aceptar',
  ADD COLUMN `tyc_version_aceptada` VARCHAR(20) NULL 
    COMMENT 'Versión aceptada (ej: 1.0)',
  ADD COLUMN `tyc_id_aceptado` INT NULL 
    COMMENT 'ID del documento de TyC aceptado',
  ADD INDEX `idx_tyc_aceptado` (`tyc_aceptado_fecha`);

-- FK opcional (por si se borra el TyC del histórico)
ALTER TABLE `Usuarios` 
  ADD CONSTRAINT `fk_usuarios_tyc` 
  FOREIGN KEY (`tyc_id_aceptado`) 
  REFERENCES `Terminos_Condiciones`(`tyc_id`) 
  ON DELETE SET NULL;
```

**Lógica:**
- `tyc_aceptado_fecha IS NULL` → Usuario **debe aceptar** TyC
- `tyc_aceptado_fecha IS NOT NULL` → Usuario ya aceptó TyC vigentes
- Cuando se publica nuevo TyC → se setea a NULL en todos los usuarios

---

### 3.2. Base de Datos - Stored Procedures

#### 3.2.1. Terminos_Condiciones_Listar

**Archivo:** `App/Backend/DB/03-Sps/Terminos_Condiciones_Listar.sql`

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_Listar$$

CREATE PROCEDURE Terminos_Condiciones_Listar()
BEGIN
  SELECT 
    tyc_id,
    version,
    LEFT(contenido_md, 200) AS contenido_preview,
    vigente,
    fecha_vigencia,
    user_id,
    created_at
  FROM Terminos_Condiciones
  ORDER BY fecha_vigencia DESC;
END$$

DELIMITER ;
```

**Descripción:** Lista todos los TyC (histórico) con preview del contenido. Solo para administradores.

#### 3.2.2. Terminos_Condiciones_BuscarVigente

**Archivo:** `App/Backend/DB/03-Sps/Terminos_Condiciones_BuscarVigente.sql`

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_BuscarVigente$$

CREATE PROCEDURE Terminos_Condiciones_BuscarVigente()
BEGIN
  SELECT 
    tyc_id,
    version,
    contenido_md,
    vigente,
    fecha_vigencia,
    created_at
  FROM Terminos_Condiciones
  WHERE vigente = TRUE
  LIMIT 1;
END$$

DELIMITER ;
```

**Descripción:** Devuelve el TyC vigente con contenido completo. Endpoint público.

#### 3.2.3. Terminos_Condiciones_Buscar

**Archivo:** `App/Backend/DB/03-Sps/Terminos_Condiciones_Buscar.sql`

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_Buscar$$

CREATE PROCEDURE Terminos_Condiciones_Buscar(IN p_tyc_id INT)
BEGIN
  SELECT * 
  FROM Terminos_Condiciones
  WHERE tyc_id = p_tyc_id;
END$$

DELIMITER ;
```

**Descripción:** Busca un TyC específico por ID. Solo para administradores.

#### 3.2.4. Terminos_Condiciones_Grabar

**Archivo:** `App/Backend/DB/03-Sps/Terminos_Condiciones_Grabar.sql`

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_Grabar$$

CREATE PROCEDURE Terminos_Condiciones_Grabar(
  IN p_version VARCHAR(20),
  IN p_contenido_md MEDIUMTEXT,
  IN p_user_id INT,
  IN p_activar BOOLEAN
)
BEGIN
  DECLARE v_tyc_id INT;
  
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  -- Insertar nuevo TyC
  INSERT INTO Terminos_Condiciones (
    version,
    contenido_md,
    vigente,
    fecha_vigencia,
    user_id
  ) VALUES (
    p_version,
    p_contenido_md,
    FALSE, -- Inicialmente no vigente
    CURDATE(),
    p_user_id
  );
  
  SET v_tyc_id = LAST_INSERT_ID();
  
  -- Si p_activar = TRUE, marcar como vigente automáticamente
  IF p_activar = TRUE THEN
    -- Desmarcar todos
    UPDATE Terminos_Condiciones SET vigente = FALSE;
    
    -- Marcar el nuevo como vigente
    UPDATE Terminos_Condiciones 
    SET vigente = TRUE 
    WHERE tyc_id = v_tyc_id;
    
    -- RESETEAR aceptación de TODOS los usuarios
    UPDATE Usuarios 
    SET 
      tyc_aceptado_fecha = NULL,
      tyc_version_aceptada = NULL,
      tyc_id_aceptado = NULL;
  END IF;
  
  -- Commit si todo OK
  COMMIT;
  
  SELECT v_tyc_id AS tyc_id;
END$$

DELIMITER ;
```

**Descripción:** 
- Crea un nuevo TyC
- Si `p_activar = TRUE`: lo marca como vigente, desactiva los anteriores y resetea aceptaciones
- Si `p_activar = FALSE`: lo crea sin activar (queda como borrador)

**Nota según requerimiento:** El cliente indicó que se crean **ya activos**, por lo que siempre se llamará con `p_activar = TRUE`.

#### 3.2.5. Terminos_Condiciones_MarcarVigente

**Archivo:** `App/Backend/DB/03-Sps/Terminos_Condiciones_MarcarVigente.sql`

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Terminos_Condiciones_MarcarVigente$$

CREATE PROCEDURE Terminos_Condiciones_MarcarVigente(IN p_tyc_id INT)
BEGIN
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  -- Desmarcar todos los TyC como no vigentes
  UPDATE Terminos_Condiciones SET vigente = FALSE;
  
  -- Marcar el seleccionado como vigente
  UPDATE Terminos_Condiciones 
  SET vigente = TRUE 
  WHERE tyc_id = p_tyc_id;
  
  -- Verificar que existe
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'TyC ID no encontrado';
  END IF;
  
  -- RESETEAR aceptación de TODOS los usuarios
  UPDATE Usuarios 
  SET 
    tyc_aceptado_fecha = NULL,
    tyc_version_aceptada = NULL,
    tyc_id_aceptado = NULL;
  
  -- Commit si todo OK
  COMMIT;
END$$

DELIMITER ;
```

**Descripción:** Marca un TyC existente como vigente y resetea aceptaciones de usuarios.

#### 3.2.6. Usuarios_AceptarTerminos

**Archivo:** `App/Backend/DB/03-Sps/Usuarios_AceptarTerminos.sql`

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS Usuarios_AceptarTerminos$$

CREATE PROCEDURE Usuarios_AceptarTerminos(
  IN p_user_id INT,
  IN p_tyc_id INT
)
BEGIN
  DECLARE v_version VARCHAR(20);
  
  -- Handler para errores: rollback automático
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  -- Iniciar transacción
  START TRANSACTION;
  
  -- Obtener versión del TyC
  SELECT version INTO v_version
  FROM Terminos_Condiciones
  WHERE tyc_id = p_tyc_id;
  
  IF v_version IS NULL THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'TyC no encontrado';
  END IF;
  
  -- Actualizar usuario
  UPDATE Usuarios
  SET 
    tyc_aceptado_fecha = NOW(),
    tyc_version_aceptada = v_version,
    tyc_id_aceptado = p_tyc_id
  WHERE user_id = p_user_id;
  
  IF ROW_COUNT() = 0 THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Usuario no encontrado';
  END IF;
  
  -- Commit si todo OK
  COMMIT;
END$$

DELIMITER ;
```

**Descripción:** Registra la aceptación de TyC por parte de un usuario.

---

### 3.3. Backend - Model

#### 3.3.1. Model: Terminos_Condiciones.js

**Archivo:** `App/Backend/Node/src/models/terminosCondiciones.js`

```javascript
// terminosCondiciones.js
const { executeStoredProcedure } = require('../config/db');

const TerminosCondiciones = {
  /**
   * Lista todos los TyC (histórico) - Solo Admin
   */
  async Listar() {
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_Listar', []);
    return rows;
  },

  /**
   * Busca el TyC vigente - Público
   */
  async BuscarVigente() {
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_BuscarVigente', []);
    return rows[0];
  },

  /**
   * Busca un TyC por ID - Solo Admin
   */
  async Buscar(tycId) {
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_Buscar', [tycId]);
    return rows[0];
  },

  /**
   * Crea un nuevo TyC
   * @param {Object} data - { version, contenido_md, user_id, activar }
   */
  async Grabar(data) {
    const { version, contenido_md, user_id, activar = true } = data;
    
    const [rows] = await executeStoredProcedure('Terminos_Condiciones_Grabar', [
      version,
      contenido_md,
      user_id,
      activar ? 1 : 0
    ]);
    
    return { tyc_id: rows[0]?.tyc_id };
  },

  /**
   * Marca un TyC existente como vigente
   */
  async MarcarVigente(tycId) {
    await executeStoredProcedure('Terminos_Condiciones_MarcarVigente', [tycId]);
    return { success: true };
  }
};

module.exports = TerminosCondiciones;
```

#### 3.3.2. Modificación: usuario.js

**Archivo:** `App/Backend/Node/src/models/usuario.js`

Agregar el siguiente método al modelo existente:

```javascript
/**
 * Registra la aceptación de Términos y Condiciones por parte del usuario
 * @param {number} userId - ID del usuario
 * @param {number} tycId - ID del documento de TyC aceptado
 * @returns {Object} { success: true }
 */
async AceptarTYC(userId, tycId) {
  console.log('Registrar aceptación de TyC - Usuario:', userId, 'TyC ID:', tycId);
  await executeStoredProcedure('Usuarios_AceptarTerminos', [userId, tycId]);
  return { success: true };
}
```

---

### 3.4. Backend - Controller

#### 3.4.1. Controller: terminosCondicionesController.js

**Archivo:** `App/Backend/Node/src/controllers/terminosCondicionesController.js`

```javascript
// terminosCondicionesController.js
const TerminosCondiciones = require('../models/terminosCondiciones');

/**
 * GET /api/terminos-condiciones
 * Listar histórico de TyC (solo admin)
 */
exports.listar = async (req, res) => {
  try {
    const lista = await TerminosCondiciones.Listar();
    res.json(lista);
  } catch (err) {
    console.error('Error en listar TyC:', err.message);
    res.status(500).json({ error: 'Error al obtener términos y condiciones' });
  }
};

/**
 * GET /api/terminos-condiciones/vigente
 * Obtener TyC vigente (público)
 */
exports.buscarVigente = async (req, res) => {
  try {
    const tyc = await TerminosCondiciones.BuscarVigente();
    
    if (!tyc) {
      return res.status(404).json({ 
        error: 'No hay términos y condiciones vigentes' 
      });
    }
    
    res.json(tyc);
  } catch (err) {
    console.error('Error en buscar TyC vigente:', err.message);
    res.status(500).json({ error: 'Error al obtener términos y condiciones' });
  }
};

/**
 * GET /api/terminos-condiciones/:id
 * Buscar TyC por ID (solo admin)
 */
exports.buscar = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    const tyc = await TerminosCondiciones.Buscar(parseInt(id));
    
    if (!tyc) {
      return res.status(404).json({ error: 'Términos y condiciones no encontrados' });
    }
    
    res.json(tyc);
  } catch (err) {
    console.error('Error en buscar TyC:', err.message);
    res.status(500).json({ error: 'Error al buscar términos y condiciones' });
  }
};

/**
 * POST /api/terminos-condiciones
 * Crear nuevo TyC (solo admin)
 * Por defecto se crea Y activa automáticamente
 */
exports.grabar = async (req, res) => {
  try {
    const { version, contenido_md, activar = true } = req.body;
    
    // Validación
    if (!version || !contenido_md) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: version, contenido_md' 
      });
    }
    
    // Obtener user_id del token JWT
    const user_id = req.usuario?.id || null;
    
    const resultado = await TerminosCondiciones.Grabar({
      version,
      contenido_md,
      user_id,
      activar
    });
    
    res.status(201).json({
      success: true,
      data: resultado,
      message: activar 
        ? 'TyC creado y activado. Todos los usuarios deben re-aceptar.'
        : 'TyC creado como borrador.'
    });
  } catch (err) {
    console.error('Error en grabar TyC:', err.message);
    res.status(500).json({ error: 'Error al crear términos y condiciones' });
  }
};

/**
 * PUT /api/terminos-condiciones/:id/activar
 * Marcar un TyC existente como vigente (solo admin)
 */
exports.marcarVigente = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    
    await TerminosCondiciones.MarcarVigente(parseInt(id));
    
    res.json({
      success: true,
      message: 'TyC activado. Todos los usuarios deben re-aceptar.'
    });
  } catch (err) {
    console.error('Error en marcar TyC vigente:', err.message);
    
    if (err.message && err.message.includes('no encontrado')) {
      return res.status(404).json({ error: 'TyC no encontrado' });
    }
    
    res.status(500).json({ error: 'Error al activar términos y condiciones' });
  }
};
```

#### 3.4.2. Modificación: usuariosController.js

**Archivo:** `App/Backend/Node/src/controllers/usuariosController.js`

Agregar el siguiente método al controller existente:

```javascript
/**
 * POST /api/usuarios/:id/aceptar-terminos
 * Registrar aceptación de Términos y Condiciones por parte del usuario
 */
exports.aceptarTerminos = async (req, res) => {
  try {
    const { id } = req.params;
    const { tyc_id } = req.body;
    
    // Validación de parámetros
    if (!id) {
      return res.status(400).json({ error: 'ID de usuario requerido' });
    }
    
    if (!tyc_id) {
      return res.status(400).json({ error: 'ID de TyC requerido' });
    }
    
    // Verificar que el usuario del token coincide con el parámetro
    // (un usuario solo puede aceptar TyC para sí mismo)
    if (req.usuario && req.usuario.id !== parseInt(id)) {
      return res.status(403).json({ 
        error: 'No autorizado para aceptar TyC de otro usuario' 
      });
    }
    
    await Usuario.AceptarTYC(parseInt(id), parseInt(tyc_id));
    
    res.json({
      success: true,
      message: 'Términos y condiciones aceptados correctamente'
    });
  } catch (err) {
    console.error('Error en aceptar TyC:', err.message);
    
    // Manejo específico de errores del SP
    if (err.message && err.message.includes('no encontrado')) {
      return res.status(404).json({ 
        error: err.message.includes('Usuario') 
          ? 'Usuario no encontrado' 
          : 'TyC no encontrado' 
      });
    }
    
    res.status(500).json({ error: 'Error al registrar aceptación de TyC' });
  }
};
```

---

### 3.5. Backend - Routes

#### 3.5.1. Routes: Terminos_Condiciones.js

**Archivo:** `App/Backend/Node/src/routes/terminosCondiciones.js`

```javascript
// terminosCondiciones.js
const express = require('express');
const router = express.Router();
const tycController = require('../controllers/terminosCondicionesController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// Ruta PÚBLICA (sin autenticación)
// Obtener TyC vigente
router.get('/vigente', tycController.buscarVigente);

// Rutas ADMIN (requieren autenticación + rol ADMIN)
router.get('/', verificarToken, verificarRol('ADMIN'), tycController.listar);
router.get('/:id', verificarToken, verificarRol('ADMIN'), tycController.buscar);
router.post('/', verificarToken, verificarRol('ADMIN'), tycController.grabar);
router.put('/:id/activar', verificarToken, verificarRol('ADMIN'), tycController.marcarVigente);

module.exports = router;
```

**Notas:**
- `/vigente` es público (necesario para mostrar TyC antes del login)
- Las demás rutas requieren autenticación y rol ADMIN
- El middleware `verificarRol` ya existe en el proyecto

#### 3.5.2. Modificación: usuarios.js

**Archivo:** `App/Backend/Node/src/routes/usuarios.js`

Agregar la siguiente ruta al archivo existente:

```javascript
// Aceptar términos y condiciones (requiere autenticación)
router.post('/:id/aceptar-terminos', verificarToken, usuariosController.aceptarTerminos);
```

#### 3.5.3. Modificación: app.js

**Archivo:** `App/Backend/Node/app.js`

Agregar la ruta de TyC al archivo principal:

```javascript
// Importar rutas
const tycRoutes = require('./src/routes/terminosCondiciones');

// Registrar rutas
app.use('/api/terminos-condiciones', tycRoutes);
```

---

### 3.6. Middleware: verificarRol

**Archivo:** `App/Backend/Node/src/middlewares/auth.js`

✅ **El middleware `verificarRol` ya existe en el proyecto.**

Uso en rutas:
```javascript
// Para un solo rol
router.get('/', verificarToken, verificarRol('ADMIN'), controller.listar);

// Para múltiples roles (acepta cualquiera de ellos)
router.post('/', verificarToken, verificarRol('ADMIN', 'SUPERVISOR'), controller.crear);
```

---

## 4. DATOS DE REFERENCIA

### 4.1. Contenido Inicial de TyC (Versión 1.0)

El cliente CPAU proporcionó el borrador inicial de Términos y Condiciones en formato Word. El contenido debe ser convertido a Markdown y almacenado en el campo `contenido_md`.

**Ubicación del archivo original:**  
`01-Docs/04-Soporte/Terminos_y_Condiciones_Calculadora_Honorarios_CPAU_Borrador.docx`

**Versión:** 1.0  
**Fecha publicación:** 2026-08-05 (o la fecha que defina el cliente)

**Estructura del documento:**
- Identificación del responsable
- Objeto y ámbito de aplicación
- Definiciones
- Aceptación de términos
- Usuarios habilitados y gratuidad
- Autenticación y seguridad
- Funcionalidades y disponibilidad
- (... 25 secciones en total)

**Responsabilidad:** El equipo de implementación debe:
1. Convertir el Word a Markdown preservando estructura
2. Realizar la primera inserción manual en la base de datos
3. Validar el rendering del Markdown en el frontend

---

## 5. CONTRATO DE API - REQUEST/RESPONSE (Para Frontend)

### 5.1. GET /api/terminos-condiciones/vigente

**Descripción:** Obtener Términos y Condiciones vigentes (público - sin autenticación)

**Request:**
```http
GET /api/terminos-condiciones/vigente
```

**Response 200 OK:**
```json
{
  "tyc_id": 1,
  "version": "1.0",
  "contenido_md": "# TÉRMINOS Y CONDICIONES\n\n## 1. Identificación...",
  "vigente": true,
  "fecha_vigencia": "2026-08-05",
  "created_at": "2026-08-05T09:30:00.000Z"
}
```

**Response 404 Not Found:**
```json
{
  "error": "No hay términos y condiciones vigentes"
}
```

---

### 5.2. POST /api/usuarios/:id/aceptar-terminos

**Descripción:** Registrar que el usuario aceptó los TyC (requiere autenticación)

**Request:**
```http
POST /api/usuarios/123/aceptar-terminos
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "tyc_id": 1
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Términos y condiciones aceptados correctamente"
}
```

**Response 400 Bad Request:**
```json
{
  "error": "ID de TyC inválido"
}
```

**Response 403 Forbidden:**
```json
{
  "error": "No autorizado para aceptar TyC de otro usuario"
}
```

**Response 404 Not Found:**
```json
{
  "error": "Usuario no encontrado"
}
```

---

### 5.3. POST /api/terminos-condiciones (ADMIN)

**Descripción:** Crear nuevo TyC y activarlo automáticamente (solo admin)

**Request:**
```http
POST /api/terminos-condiciones
Authorization: Bearer {JWT_TOKEN_ADMIN}
Content-Type: application/json

{
  "version": "2.0",
  "contenido_md": "# TÉRMINOS Y CONDICIONES V2.0\n\n...",
  "activar": true
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "tyc_id": 2
  },
  "message": "TyC creado y activado. Todos los usuarios deben re-aceptar."
}
```

**Response 400 Bad Request:**
```json
{
  "error": "Faltan campos requeridos: version, contenido_md"
}
```

**Response 403 Forbidden:**
```json
{
  "error": "No autorizado. Se requiere rol: ADMIN"
}
```

---

### 5.4. GET /api/terminos-condiciones (ADMIN)

**Descripción:** Listar histórico de TyC (solo admin)

**Request:**
```http
GET /api/terminos-condiciones
Authorization: Bearer {JWT_TOKEN_ADMIN}
```

**Response 200 OK:**
```json
[
  {
    "tyc_id": 2,
    "version": "2.0",
    "contenido_preview": "# TÉRMINOS Y CONDICIONES V2.0\n\n## 1. Identificación del responsable\n\nLa Gerencia Técnica es el área institucional responsable...",
    "vigente": true,
    "fecha_vigencia": "2026-08-10",
    "user_id": 5,
    "created_at": "2026-08-10T09:45:00.000Z"
  },
  {
    "tyc_id": 1,
    "version": "1.0",
    "contenido_preview": "# TÉRMINOS Y CONDICIONES\n\n## 1. Identificación del responsable\n\nEl Consejo Profesional de Arquitectura y Urbanismo —CPAU—...",
    "vigente": false,
    "fecha_vigencia": "2026-08-05",
    "user_id": 5,
    "created_at": "2026-08-05T09:30:00.000Z"
  }
]
```

---

### 5.5. PUT /api/terminos-condiciones/:id/activar (ADMIN)

**Descripción:** Marcar un TyC existente como vigente (solo admin)

**Request:**
```http
PUT /api/terminos-condiciones/1/activar
Authorization: Bearer {JWT_TOKEN_ADMIN}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "TyC activado. Todos los usuarios deben re-aceptar."
}
```

**Response 404 Not Found:**
```json
{
  "error": "TyC no encontrado"
}
```

---

## 6. FLUJO DE INTEGRACIÓN FRONTEND (Guía de Implementación)

### 6.1. Login Flow

```

---

## 7. RENDERIZADO DE MARKDOWN PARA FRONTEND

**⚠️ SECCIÓN EXCLUSIVA PARA EQUIPO FRONTEND ⚠️**


**Fin de Sección Frontend**

---

## 8. TICKETS DE IMPLEMENTACIÓN

### TICKET-029-001: Crear tabla Terminos_Condiciones
**Tipo:** Base de Datos  
**Prioridad:** Alta  
**Estimación:** 1h  
**Estado:** ✅ Completado

**Descripción:**  
Crear tabla `Terminos_Condiciones` con estructura para almacenar versiones históricas de TyC.

**Tareas:**
- [x] Crear archivo `App/Backend/DB/01-Tables/Terminos_Condiciones.sql`
- [x] Definir campos: tyc_id, version, contenido_md, vigente, fecha_vigencia, user_id, created_at
- [x] Crear índices: idx_vigente, idx_fecha_vigencia
- [x] Definir FK a Usuarios (user_id)
- [x] Ejecutar script en DB de desarrollo
- [x] Validar estructura creada

**Criterios de Aceptación:**
- ✅ Tabla creada exitosamente
- ✅ Índices aplicados
- ✅ Foreign key funcionando
- ✅ Consulta `SHOW CREATE TABLE Terminos_Condiciones` devuelve estructura correcta

**Archivos:**
- `App/Backend/DB/01-Tables/Terminos_Condiciones.sql`

---

### TICKET-029-002: Modificar tabla Usuarios - Campos TyC
**Tipo:** Base de Datos  
**Prioridad:** Alta  
**Estimación:** 1h  
**Estado:** ✅ Completado

**Descripción:**  
Agregar campos a tabla Usuarios para tracking de aceptación de TyC.

**Tareas:**
- [x] Crear archivo `App/Backend/DB/04-Alteraciones/Usuarios_TYC_Fields.sql`
- [x] Agregar campos: tyc_aceptado_fecha, tyc_version_aceptada, tyc_id_aceptado
- [x] Crear índice: idx_tyc_aceptado
- [x] Agregar FK a Terminos_Condiciones (tyc_id_aceptado) con ON DELETE SET NULL
- [x] Ejecutar script en DB de desarrollo
- [x] Validar campos agregados correctamente

**Criterios de Aceptación:**
- ✅ 3 campos nuevos agregados
- ✅ Índice creado
- ✅ FK funcionando con SET NULL
- ✅ Consulta `DESC Usuarios` muestra nuevos campos

**Archivos:**
- `App/Backend/DB/04-Alteraciones/Usuarios_TYC_Fields.sql`

---

### TICKET-029-003: Crear Stored Procedures de TyC
**Tipo:** Base de Datos  
**Prioridad:** Alta  
**Estimación:** 3h  
**Estado:** ✅ Completado

**Descripción:**  
Implementar stored procedures para operaciones CRUD de Términos y Condiciones.

**Tareas:**
- [x] Crear `Terminos_Condiciones_Listar.sql` - Listar histórico
- [x] Crear `Terminos_Condiciones_BuscarVigente.sql` - Obtener vigente
- [x] Crear `Terminos_Condiciones_Buscar.sql` - Buscar por ID
- [x] Crear `Terminos_Condiciones_Grabar.sql` - Crear nuevo TyC (con parámetro activar)
- [x] Crear `Terminos_Condiciones_MarcarVigente.sql` - Activar TyC existente y resetear usuarios
- [x] Crear `Usuarios_AceptarTerminos.sql` - Registrar aceptación de usuario
- [x] Ejecutar scripts en DB de desarrollo
- [x] Probar cada SP manualmente con datos de prueba

**Criterios de Aceptación:**
- ✅ 6 stored procedures creados exitosamente
- ✅ Terminos_Condiciones_Grabar con parámetro `p_activar` funcionando
- ✅ Terminos_Condiciones_MarcarVigente resetea todos los usuarios (tyc_aceptado_fecha = NULL)
- ✅ Usuarios_AceptarTerminos actualiza correctamente los 3 campos del usuario
- ✅ Validación de errores funcionando (usuario/tyc no encontrado)
- ✅ Transacciones con rollback automático funcionando
- ✅ Scripts ejecutados en DB de desarrollo
- ✅ SPs probados manualmente

**Archivos:**
- `App/Backend/DB/03-Sps/Terminos_Condiciones_Listar.sql`
- `App/Backend/DB/03-Sps/Terminos_Condiciones_BuscarVigente.sql`
- `App/Backend/DB/03-Sps/Terminos_Condiciones_Buscar.sql`
- `App/Backend/DB/03-Sps/Terminos_Condiciones_Grabar.sql`
- `App/Backend/DB/03-Sps/Terminos_Condiciones_MarcarVigente.sql`
- `App/Backend/DB/03-Sps/Usuarios_AceptarTerminos.sql`

---

### TICKET-029-004: Crear Model terminosCondiciones.js
**Tipo:** Backend - Model  
**Prioridad:** Alta  
**Estimación:** 2h  
**Estado:** ✅ Completado

**Descripción:**  
Implementar modelo para gestión de Términos y Condiciones con métodos que llaman a los stored procedures.

**Tareas:**
- [x] Crear archivo `src/models/terminosCondiciones.js`
- [x] Implementar método `Listar()`
- [x] Implementar método `BuscarVigente()`
- [x] Implementar método `Buscar(id)`
- [x] Implementar método `Grabar(data)`
- [x] Implementar método `MarcarVigente(id)`
- [x] Documentar cada método con JSDoc en español
- [x] Manejar errores de SP apropiadamente

**Criterios de Aceptación:**
- ✅ Modelo exporta 5 métodos
- ✅ Todos los métodos usan `executeStoredProcedure`
- ✅ Manejo de errores implementado
- ✅ Documentación JSDoc completa
- ✅ Métodos devuelven formato consistente
- ✅ Sigue patrones del proyecto (nomenclatura camelCase, destructuring [rows])

**Archivos:**
- `App/Backend/Node/src/models/terminosCondiciones.js`

---

### TICKET-029-005: Modificar Model usuario.js - Método AceptarTYC
**Tipo:** Backend - Model  
**Prioridad:** Alta  
**Estimación:** 0.5h  
**Estado:** ✅ Completado

**Descripción:**  
Agregar método `AceptarTYC` al modelo Usuario existente.

**Tareas:**
- [x] Abrir archivo `src/models/usuario.js`
- [x] Agregar método `AceptarTYC(userId, tycId)`
- [x] Llamar a SP `Usuarios_AceptarTerminos`
- [x] Documentar con JSDoc
- [x] Manejar errores del SP

**Criterios de Aceptación:**
- ✅ Método agregado sin romper funcionalidad existente
- ✅ Llama correctamente al SP
- ✅ Devuelve `{ success: true }` en caso exitoso
- ✅ Propaga errores del SP apropiadamente
- ✅ Incluye console.log para debug

**Archivos:**
- `App/Backend/Node/src/models/usuario.js`

---

### TICKET-029-006: Crear Controller terminosCondicionesController.js
**Tipo:** Backend - Controller  
**Prioridad:** Alta  
**Estimación:** 3h  
**Estado:** ✅ Completado

**Descripción:**  
Implementar controlador con métodos para endpoints de Términos y Condiciones.

**Tareas:**
- [x] Crear archivo `src/controllers/terminosCondicionesController.js`
- [x] Implementar `exports.listar` (admin)
- [x] Implementar `exports.buscarVigente` (público)
- [x] Implementar `exports.buscar` (admin)
- [x] Implementar `exports.grabar` (admin) - obtener user_id del token JWT
- [x] Implementar `exports.marcarVigente` (admin)
- [x] Validación de parámetros en cada método
- [x] Manejo de errores con códigos HTTP apropiados
- [x] Logs informativos con console.error

**Criterios de Aceptación:**
- ✅ 5 métodos exportados
- ✅ Validación de datos de entrada implementada
- ✅ Códigos HTTP correctos (200, 201, 400, 403, 404, 500)
- ✅ Mensajes de error descriptivos en español
- ✅ user_id obtenido del token JWT en `grabar` (req.usuario.id)
- ✅ Sigue patrones del proyecto (try-catch, console.error, validaciones)

**Archivos:**
- `App/Backend/Node/src/controllers/terminosCondicionesController.js`

---

### TICKET-029-007: Modificar Controller usuariosController.js - Método aceptarTerminos
**Tipo:** Backend - Controller  
**Prioridad:** Alta  
**Estimación:** 1.5h  
**Estado:** ✅ Completado

**Descripción:**  
Agregar método `aceptarTerminos` al controlador Usuarios existente.

**Tareas:**
- [x] Abrir archivo `src/controllers/usuariosController.js`
- [x] Implementar `exports.aceptarTerminos`
- [x] Validar parámetros: user_id, tyc_id
- [x] Verificar que req.usuario.id coincide con parámetro id (seguridad)
- [x] Llamar a Usuario.AceptarTYC()
- [x] Manejar errores apropiadamente
- [x] Documentar con JSDoc

**Criterios de Aceptación:**
- ✅ Método agregado sin romper funcionalidad existente
- ✅ Validación de autorización implementada (usuario solo acepta para sí mismo)
- ✅ Códigos HTTP correctos (200, 400, 403, 404, 500)
- ✅ Mensajes descriptivos en español
- ✅ Manejo específico de errores del SP
- ✅ Sigue patrones del proyecto

**Archivos:**
- `App/Backend/Node/src/controllers/usuariosController.js`

---

### TICKET-029-008: Crear Routes Terminos_Condiciones.js
**Tipo:** Backend - Routes  
**Prioridad:** Alta  
**Estimación:** 1h  
**Estado:** ✅ Completado

**Descripción:**  
Crear rutas para endpoints de Términos y Condiciones.

**Tareas:**
- [x] Crear archivo `src/routes/terminosCondiciones.js`
- [x] Definir ruta `GET /vigente` (público - sin middlewares)
- [x] Definir ruta `GET /` (admin - con verificarToken + verificarRol)
- [x] Definir ruta `GET /:id` (admin)
- [x] Definir ruta `POST /` (admin)
- [x] Definir ruta `PUT /:id/activar` (admin)
- [x] Importar controller
- [x] Importar middlewares auth
- [x] Exportar router

**Criterios de Aceptación:**
- ✅ 5 rutas definidas
- ✅ Ruta `/vigente` sin autenticación
- ✅ Rutas admin con middlewares apropiados
- ✅ Router exportado correctamente

**Archivos:**
- `App/Backend/Node/src/routes/Terminos_Condiciones.js`

---

### TICKET-029-009: Modificar Routes usuarios.js - Ruta aceptar-terminos
**Tipo:** Backend - Routes  
**Prioridad:** Alta  
**Estimación:** 0.5h  
**Estado:** ✅ Completado

**Descripción:**  
Agregar ruta para aceptación de TyC en archivo de rutas de usuarios.

**Tareas:**
- [x] Abrir archivo `src/routes/usuarios.js`
- [x] Agregar ruta `POST /:id/aceptar-terminos` con middleware verificarToken
- [x] Mapear a `usuariosController.aceptarTerminos`
- [x] Validar que no rompe rutas existentes

**Criterios de Aceptación:**
- ✅ Ruta agregada correctamente
- ✅ Middleware verificarToken aplicado
- ✅ Rutas existentes funcionando

**Archivos:**
- `App/Backend/Node/src/routes/usuarios.js`

---

### TICKET-029-010: Modificar app.js - Registrar rutas TyC
**Tipo:** Backend - Configuration  
**Prioridad:** Alta  
**Estimación:** 0.5h  
**Estado:** ✅ Completado

**Descripción:**  
Registrar rutas de Términos y Condiciones en app.js principal.

**Tareas:**
- [x] Abrir archivo `app.js`
- [x] Importar `const terminosCondicionesRoutes = require('./src/routes/terminosCondiciones')`
- [x] Agregar `app.use('/api/terminos-condiciones', terminosCondicionesRoutes)`
- [x] Validar orden de registro de middlewares

**Criterios de Aceptación:**
- ✅ Rutas registradas correctamente
- ✅ Endpoint `/api/terminos-condiciones/vigente` accesible
- ✅ No rompe rutas existentes

**Archivos:**
- `App/Backend/Node/app.js`

---

### TICKET-029-011: Verificar Middleware verificarRol
**Tipo:** Backend - Middleware  
**Prioridad:** Alta  
**Estimación:** 0.5h  
**Estado:** ✅ Completado (Ya existe)  
**Prerequisito:** N/A

**Descripción:**  
Verificar que existe el middleware verificarRol para validar roles de usuario.

**Tareas:**
- [x] Verificar que existe `verificarRol` en `src/middlewares/auth.js`
- [x] Confirmar que funciona con spread operator `verificarRol(...roles)`
- [x] Validar que devuelve 401 si no hay usuario
- [x] Validar que devuelve 403 si rol no coincide

**Criterios de Aceptación:**
- ✅ Middleware ya existe y funciona correctamente
- ✅ Devuelve 401 si no hay req.usuario
- ✅ Devuelve 403 si rol no coincide
- ✅ Permite continuar si rol es correcto
- ✅ Uso: `verificarRol('ADMIN')` o `verificarRol('ADMIN', 'SUPERVISOR')`

**Archivos:**
- `App/Backend/Node/src/middlewares/auth.js`

---

### TICKET-029-012: Convertir documento Word a Markdown
**Tipo:** Datos  
**Prioridad:** Media  
**Estimación:** 2h  
**Estado:** ✅ Completado

**Descripción:**  
Convertir el documento Word proporcionado por el cliente a formato Markdown.

**Tareas:**
- [x] Abrir archivo `Terminos_y_Condiciones_Calculadora_Honorarios_CPAU_Borrador.docx`
- [x] Convertir a Markdown preservando:
  - Estructura de títulos (##, ###)
  - Listas numeradas y con viñetas
  - Negritas y cursivas
  - Tablas (si las hay)
- [x] Validar rendering en un previewer Markdown
- [x] Guardar como `TYC_v1.0.md` temporal para referencia
- [x] Preparar contenido para inserción en DB

**Criterios de Aceptación:**
- ✅ Documento convertido sin pérdida de información
- ✅ Formato Markdown válido
- ✅ Rendering correcto en previewer
- ✅ Contenido listo para insertar en `contenido_md`

**Archivos:**
- ✅ `01-Docs/04 - Soporte/TYC_v1.0.md` (creado)

---

### TICKET-029-013: Insertar TyC inicial en Base de Datos
**Tipo:** Datos  
**Prioridad:** Media  
**Estimación:** 1h  
**Estado:** ✅ COMPLETADO  
**Prerequisito:** TICKET-029-001, TICKET-029-003, TICKET-029-012

**Descripción:**  
Insertar el primer documento de TyC (versión 1.0) en la base de datos.

**Tareas:**
- [x] Tomar contenido Markdown del TICKET-029-012
- [x] Escapar caracteres especiales para SQL
- [x] Generar script SQL con CALL a SP `Terminos_Condiciones_Grabar`
- [x] Incluir validaciones en el script
- [x] Crear instrucciones de ejecución
- [x] Usuario ejecutó el script manualmente
- [x] Validado que vigente=TRUE
- [x] Endpoint `GET /api/terminos-condiciones/vigente` probado exitosamente

**Resultado de la ejecución:**

✅ **Script ejecutado exitosamente**
- Registro TyC v1.0 insertado en la base de datos
- Campo `vigente = TRUE` confirmado
- Todos los usuarios reseteados (`tyc_aceptado_fecha = NULL`)
- Endpoint público respondiendo correctamente desde Postman

**Criterios de Aceptación:**
- ✅ Script SQL generado (34.79 KB)
- ✅ Contenido Markdown escapado correctamente
- ✅ Validaciones incluidas en el script
- ✅ README con instrucciones detalladas creado
- ✅ Script ejecutado manualmente sin errores
- ✅ Registro insertado con vigente=TRUE
- ✅ Endpoint `/api/terminos-condiciones/vigente` funcionando

**Archivos generados:**
- ✅ `App/Backend/DB/04-Scripts/Insert_TYC_v1.0.sql` (script de inserción)
- ✅ `App/Backend/DB/04-Scripts/README_Insert_TYC_v1.0.md` (instrucciones)

---

### TICKET-029-014: Testing - Endpoints TyC
**Tipo:** Testing  
**Prioridad:** Alta  
**Estimación:** 3h  
**Estado:** ✅ COMPLETADO  
**Prerequisito:** TICKET-029-001 a TICKET-029-013

**Descripción:**  
Probar todos los endpoints de Términos y Condiciones con diferentes escenarios usando Postman Collection automatizada.

**Tareas:**
- [x] Crear Postman Collection con 12 requests automatizados
- [x] Crear Environment con variables de configuración
- [x] Crear README con instrucciones detalladas
- [x] Crear script de limpieza para resetear BD entre ejecuciones
- [x] Incluir tests para:
  - ✅ `GET /api/terminos-condiciones/vigente` (público)
  - ✅ `POST /api/usuarios/:id/aceptar-terminos` (autenticado)
  - ✅ `GET /api/terminos-condiciones` (admin)
  - ✅ `GET /api/terminos-condiciones/:id` (admin)
  - ✅ `POST /api/terminos-condiciones` (admin - crear)
  - ✅ `PUT /api/terminos-condiciones/:id/activar` (admin - activar)
  - ✅ Validaciones de seguridad (401, 403)
  - ✅ Validaciones de negocio
  - ✅ Reset automático de usuarios al activar TyC
- [x] Suite de tests lista para ejecutar en QA

**Archivos generados:**
- ✅ `01-Docs/04 - Soporte/SPEC029-TYC-Postman-Collection.json` (12 requests + 40+ assertions)
- ✅ `01-Docs/04 - Soporte/SPEC029-TYC-QA-Environment.json` (variables configurables)
- ✅ `01-Docs/04 - Soporte/README-SPEC029-Tests.md` (guía completa de uso)
- ✅ `01-Docs/04 - Soporte/Cleanup_TYC_Tests.sql` (script de limpieza BD)

**Cómo ejecutar:**
1. Importar Collection + Environment en Postman
2. Configurar credenciales de usuarios QA (admin_email, admin_password, etc.)
3. Ejecutar "Run collection" → verifica automáticamente 40+ assertions
4. Revisar reporte: Verde = Pasó, Rojo = Falló
5. Duración estimada: ~10 segundos
6. Entre ejecuciones: usar `Cleanup_TYC_Tests.sql` para resetear BD

**Criterios de Aceptación:**
- ✅ Suite de tests creada con 12 requests
- ✅ Tests automáticos con assertions (~40+)
- ✅ Environment con variables configurables
- ✅ README con instrucciones paso a paso
- ✅ Casos de éxito y error incluidos
- ✅ Validaciones de auth y roles
- ✅ Script de limpieza para resetear BD
- ✅ Suite lista para ejecutar en QA

---

### TICKET-029-015: Documentación de Integración Frontend
**Tipo:** Documentación  
**Prioridad:** Media  
**Estimación:** 1h  
**Estado:** Pendiente

**Descripción:**  
Crear guía de integración para el equipo de frontend.

**Tareas:**
- [ ] Documentar flujo de login con verificación de TyC
- [ ] Documentar endpoints disponibles
- [ ] Proporcionar ejemplos de Request/Response
- [ ] Incluir ejemplo de código JavaScript para modal de TyC
- [ ] Documentar librería recomendada para renderizar Markdown (ej: marked.js)
- [ ] Incluir consideraciones de UX

**Criterios de Aceptación:**
- Documento claro y completo
- Ejemplos de código funcionales
- Endpoints documentados con ejemplos
- Guía de UX incluida

**Archivos:**
- `01-Docs/00-Specs/SPEC029-Frontend-Integration-Guide.md` (nuevo)

---

## 9. RESUMEN DE ARCHIVOS A CREAR/MODIFICAR

### Archivos NUEVOS (13):
```
App/Backend/DB/
├── 01-Tables/
│   └── Terminos_Condiciones.sql
├── 03-Sps/
│   ├── Terminos_Condiciones_Listar.sql
│   ├── Terminos_Condiciones_BuscarVigente.sql
│   ├── Terminos_Condiciones_Buscar.sql
│   ├── Terminos_Condiciones_Grabar.sql
│   ├── Terminos_Condiciones_MarcarVigente.sql
│   └── Usuarios_AceptarTerminos.sql
└── 04-Alteraciones/
    └── Usuarios_TYC_Fields.sql

App/Backend/Node/
└── src/
    ├── models/
    │   └── terminosCondiciones.js
    ├── controllers/
    │   └── terminosCondicionesController.js
    └── routes/
        └── terminosCondiciones.js
```

### Archivos MODIFICADOS (4):
```
App/Backend/Node/
├── app.js
└── src/
    ├── models/
    │   └── usuario.js
    ├── controllers/
    │   └── usuariosController.js
    ├── routes/
    │   └── usuarios.js
    └── middlewares/
        └── auth.js (si no existe verificarRol)
```

---

## 10. ESTIMACIÓN TOTAL

**Total de Tickets:** 15  
**Estimación Total:** 21.5 horas

**Distribución:**
- Base de Datos: 5h (Tickets 001-003)
- Backend Models: 2.5h (Tickets 004-005)
- Backend Controllers: 4.5h (Tickets 006-007)
- Backend Routes/Config: 2h (Tickets 008-010)
- Middleware: 1h (Ticket 011)
- Datos: 3h (Tickets 012-013)
- Testing: 3h (Ticket 014)
- Documentación: 1h (Ticket 015)

---

## 11. DEPENDENCIAS ENTRE TICKETS

```
001 (Tabla TyC) ──┐
                  ├──> 003 (SPs) ──> 004 (Model TyC) ──> 006 (Controller TyC)
002 (Tabla Usr) ──┘                                           │
                                                              ├──> 008 (Routes TyC)
005 (Model Usr) ──> 007 (Controller Usr) ──> 009 (Routes Usr)│
                                                              │
011 (Middleware verificarRol) ────────────────────────────────┤
                                                              │
                                                              ├──> 010 (app.js)
                                                              │
012 (Convertir Word a MD) ────────────────────────────────────┤
                                                              │
                                                              └──> 013 (Insert datos)
                                                                    │
                                                                    └──> 014 (Testing)
                                                                          │
                                                                          └──> 015 (Docs)
```

---

## 12. CRITERIOS DE ACEPTACIÓN GENERAL

La implementación se considerará completa cuando:

- [x] Todas las tablas creadas y campos agregados
- [x] Todos los stored procedures funcionando correctamente
- [x] Models implementados y probados
- [x] Controllers implementados con validación apropiada
- [x] Routes registradas y funcionando
- [x] Endpoint público `/vigente` accesible sin autenticación
- [x] Endpoints admin protegidos con JWT + verificación de rol
- [x] Al crear/activar TyC, se resetean aceptaciones de usuarios
- [x] Usuario solo puede aceptar TyC para sí mismo
- [x] Contenido inicial de TyC insertado en DB
- [x] **Testing de todos los endpoints - Suite automatizada preparada**
- [ ] Documentación de integración frontend completa (TICKET-029-015)

---

## 13. NOTAS TÉCNICAS ADICIONALES

### 12.1. Seguridad
- El endpoint `/vigente` es público por necesidad (mostrar TyC antes del login)
- No expone información sensible, solo el texto de los TyC
- Validar en frontend que el usuario acepta antes de permitir acceso
- Validar en backend que req.user.id coincide con parámetro al aceptar

### 12.2. Performance
- Índice en `vigente` permite búsqueda rápida del TyC actual
- Solo se devuelve preview en listado histórico (no contenido completo)
- Contenido completo solo en `/vigente` y `/:id`

### 12.3. Escalabilidad
- Si en el futuro se requiere auditoría legal completa, crear tabla `UsuariosTyCAceptaciones` con histórico
- Actualmente un solo flag en Usuarios es suficiente

### 12.4. Observación - Validación en Cálculo
Como se mencionó en sección 1.4, queda pendiente confirmar con el cliente si se debe validar `tyc_aceptado_fecha IS NOT NULL` antes de permitir guardar un cálculo. Si se confirma, agregar validación en:

**Archivo:** `App/Backend/Node/src/controllers/calculosController.js`

```javascript
exports.grabar = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Validar que el usuario aceptó TyC vigentes
    const usuario = await Usuario.Buscar(user_id);
    if (!usuario.tyc_aceptado_fecha) {
      return res.status(403).json({
        error: 'Debe aceptar los Términos y Condiciones vigentes',
        requiere_aceptacion_tyc: true
      });
    }
    
    // Continuar con lógica de guardado...
  } catch (err) {
    // ...
  }
};
```

---

**Fin de SPEC-029**
