# SPEC-FRONTEND-003: Sistema de Caché y Loading States

**Fecha:** 27/04/2026  
**Versión:** 1.0  
**Estado:** 📋 PENDIENTE  
**Autor:** Charly - Equipo Full Stack  
**Stack:** React 18 + Vite + Vercel

---

## 📊 PROGRESO DE TICKETS

| Ticket | Descripción | Estado |
|--------|-------------|--------|
| #001 | Crear sistema genérico de caché (CacheContext) | ✅ COMPLETADO |
| #002 | Crear hook personalizado useApiCache | ✅ COMPLETADO |
| #003 | Migrar tareasProfesionalesService a usar caché | ✅ COMPLETADO |
| #004 | Implementar componente LoadingSpinner reutilizable | ✅ COMPLETADO |
| #005 | Agregar loading states en NuevoCalculoPage | ✅ COMPLETADO |
| #006 | Agregar loading states en ProcesoCalculoPage | ✅ COMPLETADO |
| #007 | Configurar headers de caché HTTP en Vercel | ✅ COMPLETADO |
| #008 | Agregar botones manuales de recarga de caché | 🔄 EN PROGRESO (PARTE B ✅) |
| #009 | Testing de performance y casos edge | ⏳ PENDIENTE |

---

## 📋 ÍNDICE

1. [Contexto y Objetivo](#1-contexto-y-objetivo)
2. [Análisis de Performance Actual](#2-análisis-de-performance-actual)
3. [Arquitectura de la Solución](#3-arquitectura-de-la-solución)
4. [Plan de Implementación (Tickets)](#4-plan-de-implementación-tickets)
5. [Casos de Prueba](#5-casos-de-prueba)
6. [Criterios de Aceptación](#6-criterios-de-aceptación)

---

## 1. CONTEXTO Y OBJETIVO

### 1.1 Problema Actual

**Performance medida en producción:**
```
📊 Tiempos de carga en /nuevo-calculo:
├─ GET /api/tareas          → 330ms  ❌ LENTO
├─ 17 SVG icons (paralelo)  → ~1.5s  ⚠️ MEJORABLE
└─ Total first paint        → ~2.0s  ❌ MAL UX

🐛 Problemas de UX:
├─ Usuario no sabe si la app está cargando o colgada
├─ Cada navegación a /nuevo-calculo hace petición a API
├─ Íconos se descargan en cada visita (sin caché HTTP)
└─ No hay feedback visual durante operaciones asíncronas
```

**Datos que cambian poco:**
- ✅ **Tareas Profesionales**: se modifican raramente (alta/baja de servicios)
- ✅ **Complejidades**: parámetros fijos del sistema
- ✅ **Tipologías**: catálogo estable
- ✅ **Íconos SVG**: assets estáticos

### 1.2 Objetivo

**Implementar un sistema de caché robusto y reutilizable** para:

1. ✅ **Reducir llamadas a API** - Cachear datos de parámetros en memoria
2. ✅ **Mejorar UX** - Loading states visuales y consistentes
3. ✅ **Optimizar assets** - Headers HTTP para caché de navegador
4. ✅ **Reutilizable** - Patrón aplicable a otras tablas paramétricas

**Metas de performance:**
- 🎯 Reducir tiempo de carga subsecuente a **<500ms** (desde 2s)
- 🎯 Feedback visual en todas las operaciones asíncronas
- 🎯 Primera carga optimizada con headers de caché HTTP

### 1.3 Alcance

**✅ INCLUYE:**
- Sistema genérico de caché con React Context
- Hook personalizado `useApiCache` reutilizable
- Componente `LoadingSpinner` con variantes
- Migración de `tareasProfesionalesService` a caché
- Headers de caché HTTP para assets estáticos en Vercel
- **Botón de refresh en NuevoCalculoPage** (refresca tareas específicas)
- **Botón de "Recarga de Parámetros" en ParametrosPage** (invalida TODO el caché)
- Estrategia de invalidación configurable (por entidad o global)

**❌ NO INCLUYE:**
- Caché persistente (localStorage/IndexedDB) - fase 2
- Service Workers o PWA - fase 2
- Optimización del backend (330ms de API) - SPEC separada
- Lazy loading de íconos - fase 2
- CDN para assets - fuera de alcance

**📝 DEPENDENCIAS:**
- SPEC005 completada (migración a API de tareas)

---

## 2. ANÁLISIS DE PERFORMANCE ACTUAL

### 2.1 Mediciones de Red

**Endpoint `/api/tareas`:**
```
Request URL: https://ch2026-qa.neosisweb.ar/api/tareas
Request Method: GET
Status: 200 OK
Response Time: 330ms
Response Size: ~2.5 KB (17 registros JSON)

⚠️ Análisis:
- Sin caché HTTP (Cache-Control: no-cache)
- Se ejecuta en cada navegación a /nuevo-calculo
- Sin validación condicional (If-None-Match / ETag)
```

**Íconos SVG:**
```
18 archivos × ~90ms cada uno = ~1.5s total
Tamaño: 0.1 KB cada uno
Status: 200 OK (sin 304 Not Modified)

⚠️ Análisis:
- Sin headers de caché (Cache-Control ausente)
- Se descargan en cada visita
- Múltiples peticiones HTTP (overhead de conexión)
```

### 2.2 Análisis de Código Actual

**NuevoCalculoPage.jsx (línea 14-40):**
```javascript
const [tareas, setTareas] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const cargarTareas = async () => {
    try {
      setLoading(true);
      const data = await obtenerTareasProfesionales(); // ❌ Petición directa sin caché
      setTareas(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas...');
    } finally {
      setLoading(false);
    }
  };
  cargarTareas();
}, []); // ❌ Se ejecuta en cada mount del componente
```

**Problemas:**
- ❌ No hay caché en memoria
- ❌ `useEffect` se ejecuta cada vez que se monta el componente
- ⚠️ Loading state básico (solo texto, sin spinner)
- ❌ No hay estrategia de invalidación

### 2.3 Impacto Esperado

**Escenario: Usuario navega Home → Nuevo Cálculo → Home → Nuevo Cálculo**

```
SIN CACHÉ (actual):
├─ Primera carga: 2.0s
├─ Segunda carga: 2.0s (repite petición)
└─ Total: 4.0s

CON CACHÉ (objetivo):
├─ Primera carga: 2.0s
├─ Segunda carga: 0.1s (desde memoria)
└─ Total: 2.1s
```

**Ahorro: 50% de tiempo, 50% de peticiones al servidor**

---

## 3. ARQUITECTURA DE LA SOLUCIÓN

### 3.1 Sistema de Caché Genérico

**Patrón: React Context + Custom Hook**

```
┌─────────────────────────────────────────────────┐
│  CacheProvider (Context)                        │
│  ┌───────────────────────────────────────────┐ │
│  │ Cache Store (Map)                         │ │
│  │ ┌─────────────────────────────────────┐   │ │
│  │ │ Key: 'tareas_profesionales'         │   │ │
│  │ │ Value: {                            │   │ │
│  │ │   data: [...],                      │   │ │
│  │ │   timestamp: 1714234567890,         │   │ │
│  │ │   ttl: 300000 (5min)                │   │ │
│  │ │ }                                   │   │ │
│  │ └─────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ▲
                    │ provides
                    │
        ┌───────────┴───────────┐
        │  useApiCache Hook     │
        │  - get(key)           │
        │  - set(key, data)     │
        │  - invalidate(key)    │
        │  - refresh(key, fn)   │
        └───────────────────────┘
                    ▲
                    │ uses
                    │
        ┌───────────┴───────────┐
        │  Component            │
        │  const { data,        │
        │          loading,     │
        │          error,       │
        │          refresh      │
        │  } = useApiCache(     │
        │    'tareas',          │
        │    fetchFn            │
        │  )                    │
        └───────────────────────┘
```

### 3.2 Estructura de Archivos

```
App/Frontend/src/
├── contexts/
│   └── CacheContext.jsx                 ✨ NUEVO
│
├── hooks/
│   └── useApiCache.js                   ✨ NUEVO
│
├── components/
│   └── common/
│       ├── LoadingSpinner/              ✨ NUEVO
│       │   ├── LoadingSpinner.jsx
│       │   ├── LoadingSpinner.module.css
│       │   └── index.js
│       └── LoadingOverlay/              ✨ NUEVO (opcional)
│           ├── LoadingOverlay.jsx
│           └── LoadingOverlay.module.css
│
├── services/
│   └── tareasProfesionalesService.js    🔄 MODIFICAR
│
└── pages/
    ├── NuevoCalculoPage.jsx             🔄 MODIFICAR
    └── ProcesoCalculoPage.jsx           🔄 MODIFICAR
```

### 3.3 API del Sistema de Caché

**CacheContext.jsx:**
```javascript
const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());
  
  const get = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    // Verificar TTL (Time To Live)
    if (Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  };
  
  const set = (key, data, ttl = 300000) => { // TTL default: 5 minutos
    setCache(prev => new Map(prev).set(key, {
      data,
      timestamp: Date.now(),
      ttl
    }));
  };
  
  const invalidate = (key) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  };
  
  const invalidateAll = () => {
    setCache(new Map());
  };
  
  const getStats = () => ({
    size: cache.size,
    keys: Array.from(cache.keys())
  });
  
  return (
    <CacheContext.Provider value={{ get, set, invalidate, invalidateAll, getStats }}>
      {children}
    </CacheContext.Provider>
  );
};
```

**useApiCache Hook:**
```javascript
export const useApiCache = (cacheKey, fetchFn, options = {}) => {
  const { 
    ttl = 300000,           // 5 minutos default
    staleWhileRevalidate = false,
    onError = null 
  } = options;
  
  const { get, set, invalidate } = useContext(CacheContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      // 1. Intentar obtener de caché
      if (!forceRefresh) {
        const cached = get(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }
      
      // 2. Si no hay caché, hacer petición
      setLoading(true);
      const result = await fetchFn();
      
      // 3. Guardar en caché
      set(cacheKey, result, ttl);
      setData(result);
      setError(null);
      
      return result;
    } catch (err) {
      setError(err.message);
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, ttl, get, set, onError]);
  
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  const clear = useCallback(() => {
    invalidate(cacheKey);
    setData(null);
  }, [cacheKey, invalidate]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { 
    data, 
    loading, 
    error, 
    refresh,
    clear 
  };
};
```

**Uso en componentes:**
```javascript
// NuevoCalculoPage.jsx
import { useApiCache } from '../hooks/useApiCache';
import { obtenerTareasProfesionales } from '../services/tareasProfesionalesService';

const NuevoCalculoPage = () => {
  const { 
    data: tareas, 
    loading, 
    error,
    refresh 
  } = useApiCache(
    'tareas_profesionales',           // Cache key
    obtenerTareasProfesionales,       // Fetch function
    { ttl: 600000 }                   // 10 minutos
  );
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refresh} />;
  
  return (
    <div>
      {tareas.map(tarea => <CalculationTypeCard key={tarea.tarea_id} {...tarea} />)}
    </div>
  );
};
```

### 3.4 Loading States - Componente Reutilizable

**LoadingSpinner.jsx:**
```javascript
/**
 * Spinner de carga reutilizable con variantes
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - 'spinner' | 'dots' | 'pulse'
 * @param {string} message - Texto opcional debajo del spinner
 * @param {boolean} overlay - Mostrar sobre overlay oscuro
 */
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'spinner',
  message = 'Cargando...',
  overlay = false 
}) => {
  const content = (
    <div className={`${styles.container} ${styles[size]}`}>
      {variant === 'spinner' && <SpinnerIcon />}
      {variant === 'dots' && <DotsAnimation />}
      {variant === 'pulse' && <PulseAnimation />}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
  
  if (overlay) {
    return (
      <div className={styles.overlay}>
        {content}
      </div>
    );
  }
  
  return content;
};
```

**Variantes de uso:**
```javascript
// Inline spinner (dentro de un componente)
<LoadingSpinner size="sm" message="Cargando tareas..." />

// Spinner con overlay (pantalla completa)
<LoadingSpinner size="lg" overlay message="Procesando cálculo..." />

// Skeleton loading (futuro - fase 2)
<CalculationCardSkeleton count={6} />
```

### 3.5 Headers de Caché HTTP en Vercel

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/assets/icons/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/(fonts|images)/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).svg",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Explicación:**
- `public`: Puede ser cacheado por navegadores y CDNs
- `max-age=31536000`: Cachear por 1 año (365 días)
- `immutable`: El contenido nunca cambia (versionado por hash en build)

---

## 4. PLAN DE IMPLEMENTACIÓN (TICKETS)

### TICKET #001 - Crear CacheContext

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Crear el contexto de React para gestionar caché en memoria de forma global.

**UBICACIÓN:** `App/Frontend/src/contexts/CacheContext.jsx`

**SUBTAREAS:**

- [x] **[T001.1]** Crear archivo CacheContext.jsx
- [x] **[T001.2]** Implementar estado con Map para almacenar caché
- [x] **[T001.3]** Implementar método `get(key)` con validación de TTL
- [x] **[T001.4]** Implementar método `set(key, data, ttl)`
- [x] **[T001.5]** Implementar método `invalidate(key)`
- [x] **[T001.6]** Implementar método `invalidateAll()`
- [x] **[T001.7]** Implementar método `getStats()` para debug
- [x] **[T001.8]** Exportar Provider y hook useCache
- [x] **[T001.9]** Agregar CacheProvider en App.jsx (envolver rutas)

**CÓDIGO:**

```javascript
// App/Frontend/src/contexts/CacheContext.jsx
import { createContext, useState, useContext, useCallback } from 'react';

const CacheContext = createContext(null);

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());
  
  const get = useCallback((key) => {
    const item = cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      // Expiró, eliminar y retornar null
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return item.data;
  }, [cache]);
  
  const set = useCallback((key, data, ttl = 300000) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
      return newCache;
    });
  }, []);
  
  const invalidate = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);
  
  const invalidateAll = useCallback(() => {
    setCache(new Map());
  }, []);
  
  const getStats = useCallback(() => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      items: Array.from(cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
        ttl: value.ttl
      }))
    };
  }, [cache]);
  
  const value = {
    get,
    set,
    invalidate,
    invalidateAll,
    getStats
  };
  
  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache debe usarse dentro de CacheProvider');
  }
  return context;
};
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ CacheProvider se puede envolver en App.jsx
- ✅ Métodos get/set/invalidate funcionan correctamente
- ✅ TTL se respeta y expira datos viejos
- ✅ getStats devuelve información del caché

**TIEMPO ESTIMADO:** 40 minutos

---

### TICKET #002 - Crear Hook useApiCache

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Hook personalizado que combina caché con llamadas a API, gestiona loading/error states.

**UBICACIÓN:** `App/Frontend/src/hooks/useApiCache.js`

**SUBTAREAS:**

- [x] **[T002.1]** Crear archivo useApiCache.js
- [x] **[T002.2]** Implementar lógica de fetch con caché
- [x] **[T002.3]** Gestionar estados loading/error/data
- [x] **[T002.4]** Implementar función refresh (forzar recarga)
- [x] **[T002.5]** Implementar función clear (limpiar caché)
- [x] **[T002.6]** Agregar soporte para opciones (ttl, onError)
- [x] **[T002.7]** Documentar con JSDoc
- [x] **[T002.8]** Crear tests unitarios (opcional)

**CÓDIGO:**

```javascript
// App/Frontend/src/hooks/useApiCache.js
import { useState, useEffect, useCallback } from 'react';
import { useCache } from '../contexts/CacheContext';

/**
 * Hook para cachear llamadas a API con gestión de estados
 * @param {string} cacheKey - Clave única para identificar el caché
 * @param {Function} fetchFn - Función async que obtiene los datos
 * @param {Object} options - Opciones de configuración
 * @param {number} options.ttl - Tiempo de vida en ms (default: 5min)
 * @param {Function} options.onError - Callback cuando hay error
 * @param {boolean} options.autoFetch - Auto-ejecutar fetch (default: true)
 * @returns {Object} { data, loading, error, refresh, clear }
 */
export const useApiCache = (cacheKey, fetchFn, options = {}) => {
  const {
    ttl = 300000,           // 5 minutos
    onError = null,
    autoFetch = true
  } = options;
  
  const { get, set, invalidate } = useCache();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Intentar obtener de caché si no es refresh forzado
      if (!forceRefresh) {
        const cached = get(cacheKey);
        if (cached !== null) {
          console.log(`✅ Cache HIT para: ${cacheKey}`);
          setData(cached);
          setLoading(false);
          return cached;
        }
        console.log(`❌ Cache MISS para: ${cacheKey}`);
      } else {
        console.log(`🔄 Refresh forzado para: ${cacheKey}`);
      }
      
      // 2. Hacer petición a API
      const result = await fetchFn();
      
      // 3. Guardar en caché
      set(cacheKey, result, ttl);
      setData(result);
      
      return result;
    } catch (err) {
      console.error(`❌ Error en ${cacheKey}:`, err);
      setError(err.message || 'Error al cargar datos');
      if (onError) onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKey, fetchFn, ttl, get, set, onError]);
  
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  const clear = useCallback(() => {
    invalidate(cacheKey);
    setData(null);
  }, [cacheKey, invalidate]);
  
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);
  
  return {
    data,
    loading,
    error,
    refresh,
    clear,
    isFromCache: data !== null && !loading
  };
};
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Hook devuelve data/loading/error correctamente
- ✅ Primera llamada hace petición a API
- ✅ Segunda llamada usa caché (no hace petición)
- ✅ refresh() fuerza nueva petición
- ✅ TTL expira correctamente

**TIEMPO ESTIMADO:** 50 minutos

---

### TICKET #003 - Migrar tareasProfesionalesService a Caché

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Actualizar NuevoCalculoPage para usar useApiCache en lugar de useState + useEffect.

**UBICACIÓN:** `App/Frontend/src/pages/NuevoCalculoPage.jsx`

**SUBTAREAS:**

- [x] **[T003.1]** Importar useApiCache
- [x] **[T003.2]** Reemplazar useState/useEffect por useApiCache
- [x] **[T003.3]** Actualizar lógica de loading state
- [x] **[T003.4]** Mantener lógica de error con retry
- [x] **[T003.5]** Verificar que funciona en dev
- [x] **[T003.6]** Verificar caché funciona (segunda navegación)

**CÓDIGO:**

```javascript
// App/Frontend/src/pages/NuevoCalculoPage.jsx

// ANTES (líneas 14-41)
const [tareas, setTareas] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const cargarTareas = async () => {
    try {
      setLoading(true);
      const data = await obtenerTareasProfesionales();
      setTareas(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas profesionales. Por favor, intente nuevamente.');
      console.error('Error al cargar tareas:', err);
    } finally {
      setLoading(false);
    }
  };
  cargarTareas();
}, []);

// DESPUÉS
import { useApiCache } from '../hooks/useApiCache';

const { 
  data: tareas, 
  loading, 
  error,
  refresh 
} = useApiCache(
  'tareas_profesionales',           // Cache key único
  obtenerTareasProfesionales,       // Función de fetch
  { 
    ttl: 600000,                    // 10 minutos (datos cambian poco)
    onError: (err) => {
      console.error('Error al cargar tareas:', err);
    }
  }
);

// Actualizar botón retry para usar refresh
<button className={styles.retryButton} onClick={refresh}>
  Reintentar
</button>
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Página carga tareas correctamente
- ✅ Loading state se muestra durante primera carga
- ✅ Caché funciona al volver a la página
- ✅ Botón "Reintentar" fuerza refresh

**TIEMPO ESTIMADO:** 20 minutos

---

### TICKET #004 - Implementar LoadingSpinner Reutilizable

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Crear componente de loading visual consistente para toda la app.

**UBICACIÓN:** `App/Frontend/src/components/common/LoadingSpinner/`

**SUBTAREAS:**

- [ ] **[T004.1]** Crear carpeta LoadingSpinner/
- [ ] **[T004.2]** Crear LoadingSpinner.jsx con variantes
- [ ] **[T004.3]** Crear LoadingSpinner.module.css con animaciones
- [ ] **[T004.4]** Crear index.js para export limpio
- [ ] **[T004.5]** Implementar variantes: spinner, dots, pulse
- [ ] **[T004.6]** Implementar tamaños: sm, md, lg, xl
- [ ] **[T004.7]** Implementar modo overlay
- [ ] **[T004.8]** Documentar props con JSDoc

**CÓDIGO:**

```javascript
// App/Frontend/src/components/common/LoadingSpinner/LoadingSpinner.jsx
import styles from './LoadingSpinner.module.css';

/**
 * Componente de loading visual reutilizable
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - Tipo: 'spinner' | 'dots' | 'pulse'
 * @param {string} message - Mensaje opcional
 * @param {boolean} overlay - Mostrar sobre overlay oscuro
 * @param {string} color - Color personalizado (CSS var o hex)
 */
const LoadingSpinner = ({ 
  size = 'md',
  variant = 'spinner',
  message = '',
  overlay = false,
  color = 'var(--color-primary)'
}) => {
  const spinnerContent = (
    <div className={`${styles.container} ${styles[size]}`}>
      {variant === 'spinner' && (
        <div 
          className={styles.spinner} 
          style={{ borderTopColor: color }}
        />
      )}
      
      {variant === 'dots' && (
        <div className={styles.dots}>
          <span style={{ backgroundColor: color }} />
          <span style={{ backgroundColor: color }} />
          <span style={{ backgroundColor: color }} />
        </div>
      )}
      
      {variant === 'pulse' && (
        <div 
          className={styles.pulse}
          style={{ backgroundColor: color }}
        />
      )}
      
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
  
  if (overlay) {
    return (
      <div className={styles.overlay}>
        {spinnerContent}
      </div>
    );
  }
  
  return spinnerContent;
};

export default LoadingSpinner;
```

```css
/* App/Frontend/src/components/common/LoadingSpinner/LoadingSpinner.module.css */

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

/* Spinner circular */
.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dots animados */
.dots {
  display: flex;
  gap: var(--spacing-1);
}

.dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.dots span:nth-child(1) { animation-delay: -0.32s; }
.dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Pulse */
.pulse {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

/* Tamaños */
.sm .spinner { width: 20px; height: 20px; border-width: 2px; }
.md .spinner { width: 40px; height: 40px; border-width: 3px; }
.lg .spinner { width: 60px; height: 60px; border-width: 4px; }
.xl .spinner { width: 80px; height: 80px; border-width: 5px; }

.sm .dots span { width: 6px; height: 6px; }
.lg .dots span { width: 10px; height: 10px; }
.xl .dots span { width: 12px; height: 12px; }

/* Mensaje */
.message {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Spinner renderiza correctamente
- ✅ Variantes (spinner, dots, pulse) funcionan
- ✅ Tamaños (sm, md, lg, xl) funcionan
- ✅ Modo overlay funciona
- ✅ Animaciones son suaves

**TIEMPO ESTIMADO:** 45 minutos

---

### TICKET #005 - Agregar Loading States en NuevoCalculoPage

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Reemplazar loading text simple por componente LoadingSpinner visual.

**UBICACIÓN:** `App/Frontend/src/pages/NuevoCalculoPage.jsx`

**SUBTAREAS:**

- [ ] **[T005.1]** Importar LoadingSpinner
- [ ] **[T005.2]** Reemplazar div de loading por LoadingSpinner
- [ ] **[T005.3]** Agregar mensaje descriptivo
- [ ] **[T005.4]** Mantener lógica de error existente
- [ ] **[T005.5]** Verificar UX en dev

**CÓDIGO:**

```javascript
// ANTES (línea ~55)
{loading && (
  <div className={styles.loading}>
    <p>Cargando tareas profesionales...</p>
  </div>
)}

// DESPUÉS
import LoadingSpinner from '../components/common/LoadingSpinner';

{loading && (
  <div className={styles.loadingContainer}>
    <LoadingSpinner 
      size="lg"
      variant="spinner"
      message="Cargando tareas profesionales..."
    />
  </div>
)}
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Spinner se muestra durante carga inicial
- ✅ Mensaje es claro y descriptivo
- ✅ Spinner desaparece cuando carga completa
- ✅ UX mejorada vs texto simple

**TIEMPO ESTIMADO:** 15 minutos

---

### TICKET #006 - Agregar Loading States en ProcesoCalculoPage

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Agregar LoadingSpinner durante cálculo de honorarios (paso 4 → 5).

**UBICACIÓN:** `App/Frontend/src/pages/ProcesoCalculoPage.jsx`

**SUBTAREAS:**

- [ ] **[T006.1]** Importar LoadingSpinner
- [ ] **[T006.2]** Mostrar overlay durante isCalculating
- [ ] **[T006.3]** Mensaje descriptivo "Calculando honorarios..."
- [ ] **[T006.4]** Verificar que overlay bloquea interacción
- [ ] **[T006.5]** Verificar transición suave

**CÓDIGO:**

```javascript
// App/Frontend/src/pages/ProcesoCalculoPage.jsx

import LoadingSpinner from '../components/common/LoadingSpinner';

// En el render (después del return principal)
return (
  <div className={styles.container}>
    <Header />
    
    {/* Loading overlay durante cálculo */}
    {isCalculating && (
      <LoadingSpinner 
        size="xl"
        variant="spinner"
        message="Calculando honorarios profesionales..."
        overlay
      />
    )}
    
    <main className={styles.main}>
      {/* ... resto del contenido ... */}
    </main>
    
    <Footer />
  </div>
);
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Overlay se muestra al calcular
- ✅ Usuario no puede interactuar durante cálculo
- ✅ Mensaje claro y profesional
- ✅ Overlay desaparece al completar

**TIEMPO ESTIMADO:** 20 minutos

---

### TICKET #007 - Configurar Headers de Caché HTTP en Vercel

**ESTADO:** ✅ COMPLETADO

**DESCRIPCIÓN:**
Agregar headers de caché para assets estáticos (SVG, fuentes, imágenes).

**UBICACIÓN:** `App/Frontend/vercel.json`

**SUBTAREAS:**

- [x] **[T007.1]** Crear/actualizar vercel.json en raíz de Frontend
- [x] **[T007.2]** Agregar headers para /assets/icons/
- [x] **[T007.3]** Agregar headers para otros assets estáticos
- [ ] **[T007.4]** Hacer commit y push
- [ ] **[T007.5]** Desplegar en Vercel (preview)
- [ ] **[T007.6]** Verificar headers en DevTools Network
- [ ] **[T007.7]** Verificar caché en segunda visita
- [ ] **[T007.8]** Desplegar a producción

**CÓDIGO:**

```json
// App/Frontend/vercel.json
{
  "headers": [
    {
      "source": "/assets/icons/tareas/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/assets/(fonts|images)/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*\\.(svg|jpg|jpeg|png|gif|ico|woff|woff2|ttf|otf))",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Verificación:**
```bash
# Verificar headers en producción
curl -I https://ch2026-qa.neosisweb.ar/assets/icons/tareas/PYDOA.svg

# Debe mostrar:
# Cache-Control: public, max-age=31536000, immutable
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ vercel.json creado/actualizado
- ✅ Headers configurados para SVG
- ✅ Desplegado en preview y producción
- ✅ DevTools muestra Cache-Control correcto
- ✅ Segunda visita carga desde cache (status 304 o from cache)

**TIEMPO ESTIMADO:** 30 minutos

---

### TICKET #008 - Botones Manuales de Recarga de Caché

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Agregar botones de administrador para forzar recarga de caché en diferentes contextos:
1. **Botón en NuevoCalculoPage**: Refresca solo tareas profesionales
2. **Botón en ParametrosPage**: Invalida TODO el caché del sistema (útil después de modificar parámetros)

**UBICACIONES:** 
- `App/Frontend/src/pages/NuevoCalculoPage.jsx`
- `App/Frontend/src/pages/ParametrosPage.jsx`

---

#### PARTE A: Botón de Refresh en NuevoCalculoPage

**SUBTAREAS:**

- [ ] **[T008.A1]** Agregar botón "Actualizar datos" en header de página
- [ ] **[T008.A2]** Conectar con función `refresh()` de useApiCache
- [ ] **[T008.A3]** Agregar estado de loading durante refresh
- [ ] **[T008.A4]** Agregar ícono de reload girando
- [ ] **[T008.A5]** Verificar funcionamiento

**CÓDIGO:**

```javascript
// App/Frontend/src/pages/NuevoCalculoPage.jsx
import { FaSync } from 'react-icons/fa';
import { LOADING_MESSAGES } from '../utils/constants';

const { 
  data: tareas, 
  loading, 
  error,
  refresh 
} = useApiCache(...);

const [isRefreshing, setIsRefreshing] = useState(false);

const handleManualRefresh = async () => {
  setIsRefreshing(true);
  try {
    await refresh();
    console.log('✅ Tareas actualizadas');
  } catch (err) {
    console.error('❌ Error al actualizar:', err);
  } finally {
    setIsRefreshing(false);
  }
};

return (
  <div className={styles.container}>
    <Header />
    
    <main className={styles.main}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Nuevo cálculo de honorarios</h1>
        
        <button 
          className={styles.refreshButton}
          onClick={handleManualRefresh}
          disabled={isRefreshing || loading}
          title="Actualizar lista de tareas"
        >
          <FaSync className={isRefreshing ? styles.spinning : ''} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </div>
      
      {/* ... resto del contenido ... */}
    </main>
  </div>
);
```

**CSS:**
```css
.headerRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.refreshButton {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 0.875rem;
  font-weight: 500;
}

.refreshButton:hover:not(:disabled) {
  background: var(--color-primary);
  color: var(--color-white);
}

.refreshButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

#### PARTE B: Botón de Recarga Global en ParametrosPage

**OBJETIVO:** Después de modificar parámetros del sistema, el administrador necesita invalidar TODO el caché para que la aplicación recargue datos actualizados.

**SUBTAREAS:**

- [x] **[T008.B1]** Importar `useCache` en ParametrosPage
- [x] **[T008.B2]** Agregar botón "Recargar Parámetros" en la página
- [x] **[T008.B3]** Conectar con función `invalidateAll()` del CacheContext
- [x] **[T008.B4]** Agregar Modal de confirmación (acción destructiva)
- [x] **[T008.B5]** Mostrar feedback visual de éxito
- [x] **[T008.B6]** Verificar que todo el caché se limpia correctamente

**CÓDIGO:**

```javascript
// App/Frontend/src/pages/ParametrosPage.jsx
import { useState } from 'react';
import { FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { useCache } from '../contexts/CacheContext';
import Modal from '../components/common/Modal';

const ParametrosPage = () => {
  const { invalidateAll, getStats } = useCache();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  
  /**
   * Invalida todo el caché del sistema
   * Útil después de modificar parámetros que afectan cálculos
   */
  const handleReloadCache = async () => {
    setIsReloading(true);
    try {
      // Limpiar todo el caché
      invalidateAll();
      
      console.log('✅ Caché limpiado completamente');
      console.log('📊 Stats:', getStats());
      
      // Cerrar modal
      setShowConfirmModal(false);
      
      // Opcional: Mostrar toast de éxito
      alert('Caché renovado exitosamente. Los datos se recargarán en la próxima navegación.');
    } catch (err) {
      console.error('❌ Error al limpiar caché:', err);
      alert('Error al renovar el caché');
    } finally {
      setIsReloading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        {/* Header con título y botón de recarga */}
        <div className={styles.pageHeader}>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            Volver al Dashboard
          </button>
          
          <button
            className={styles.reloadCacheButton}
            onClick={() => setShowConfirmModal(true)}
            title="Limpiar caché y forzar recarga de datos"
          >
            <FaSync />
            Recargar Parámetros
          </button>
        </div>

        <div className={styles.contentWrapper}>
          <h1 className={styles.title}>Parámetros Generales</h1>
          <p className={styles.description}>
            Configure los parámetros del sistema que afectan el cálculo de honorarios.
            <br />
            <strong>Importante:</strong> Después de modificar parámetros, use el botón "Recargar Parámetros" 
            para que los cambios se apliquen en toda la aplicación.
          </p>

          {/* ... lista de parámetros ... */}
        </div>
      </main>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <Modal onClose={() => setShowConfirmModal(false)}>
          <div className={styles.confirmModal}>
            <div className={styles.modalIcon}>
              <FaExclamationTriangle />
            </div>
            <h2 className={styles.modalTitle}>¿Recargar todos los parámetros?</h2>
            <p className={styles.modalMessage}>
              Esta acción limpiará el caché completo del sistema.
              <br />
              Todos los datos se recargarán desde el servidor en la próxima navegación.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
                disabled={isReloading}
              >
                Cancelar
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleReloadCache}
                disabled={isReloading}
              >
                <FaSync className={isReloading ? styles.spinning : ''} />
                {isReloading ? 'Recargando...' : 'Recargar Caché'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
};
```

**CSS:**

```css
/* ParametrosPage.module.css */

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.reloadCacheButton {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 0.938rem;
  font-weight: 600;
}

.reloadCacheButton:hover {
  background: #4A25B8;
  transform: translateY(-1px);
}

.reloadCacheButton:active {
  transform: translateY(0);
}

/* Modal de confirmación */
.confirmModal {
  padding: var(--spacing-4);
  text-align: center;
}

.modalIcon {
  font-size: 3rem;
  color: var(--color-warning, #ff9800);
  margin-bottom: var(--spacing-3);
}

.modalTitle {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0 0 var(--spacing-2) 0;
}

.modalMessage {
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0 0 var(--spacing-4) 0;
  line-height: 1.6;
}

.modalActions {
  display: flex;
  gap: var(--spacing-2);
  justify-content: center;
}

.cancelButton {
  padding: var(--spacing-2) var(--spacing-4);
  background: transparent;
  border: 1px solid var(--color-gris);
  color: var(--color-gray-700);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 0.938rem;
  font-weight: 600;
}

.cancelButton:hover:not(:disabled) {
  background: var(--color-gris);
}

.confirmButton {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  font-size: 0.938rem;
  font-weight: 600;
}

.confirmButton:hover:not(:disabled) {
  background: #4A25B8;
}

.confirmButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}
```

---

**DIFERENCIAS CLAVE:**

| Aspecto | NuevoCalculoPage | ParametrosPage |
|---------|------------------|----------------|
| **Acción** | `refresh()` - Refresca solo tareas | `invalidateAll()` - Limpia TODO el caché |
| **Alcance** | Una entidad específica | Toda la aplicación |
| **Confirmación** | No requiere (acción segura) | Sí requiere Modal (acción destructiva) |
| **Uso** | Actualizar lista de tareas | Después de modificar parámetros del sistema |

---

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Botón en NuevoCalculoPage refresca solo tareas
- ✅ Botón en ParametrosPage limpia todo el caché
- ✅ Modal de confirmación se muestra en ParametrosPage
- ✅ Loading states durante operaciones
- ✅ Feedback visual (ícono girando)
- ✅ Console muestra logs de operación
- ✅ `getStats()` confirma que caché se limpió

**TIEMPO ESTIMADO:** 45 minutos

---

### TICKET #009 - Testing de Performance y Casos Edge

**ESTADO:** ⏳ PENDIENTE

**DESCRIPCIÓN:**
Verificar que el sistema de caché funciona correctamente en todos los escenarios.

**UBICACIÓN:** Navegador + DevTools

**SUBTAREAS:**

- [ ] **[T009.1]** Test: Primera carga (debe hacer petición API)
- [ ] **[T009.2]** Test: Segunda carga (debe usar caché, 0 peticiones)
- [ ] **[T009.3]** Test: Esperar TTL expirado (debe revalidar)
- [ ] **[T009.4]** Test: Botón refresh fuerza petición
- [ ] **[T009.5]** Test: Headers de caché HTTP funcionan
- [ ] **[T009.6]** Test: LoadingSpinner se muestra correctamente
- [ ] **[T009.7]** Test: Error handling funciona
- [ ] **[T009.8]** Test: Navegación rápida no causa race conditions
- [ ] **[T009.9]** Medir tiempos y documentar mejoras
- [ ] **[T009.10]** Verificar en diferentes navegadores

**CASOS DE PRUEBA:**

**CP-001: Primera carga desde caché vacío**
```
1. Limpiar localStorage y cookies
2. Navegar a /nuevo-calculo
3. Abrir DevTools → Network
4. Verificar:
   ✅ Se hace petición GET /api/tareas
   ✅ LoadingSpinner se muestra
   ✅ Tareas se cargan correctamente
   ✅ Tiempo total < 2s
```

**CP-002: Segunda carga desde caché**
```
1. Con tareas ya cargadas
2. Navegar a /home
3. Volver a /nuevo-calculo
4. Verificar:
   ✅ NO se hace petición a API
   ✅ Tareas aparecen instantáneamente
   ✅ Console muestra "Cache HIT"
   ✅ Tiempo total < 200ms
```

**CP-003: TTL expirado**
```
1. Esperar 5-10 minutos (según TTL configurado)
2. Navegar a /nuevo-calculo
3. Verificar:
   ✅ Se hace nueva petición a API
   ✅ Console muestra "Cache MISS"
   ✅ Datos se actualizan
```

**CP-004: Refresh manual**
```
1. Con tareas cargadas
2. Click en botón "Actualizar datos"
3. Verificar:
   ✅ Ícono gira (loading)
   ✅ Se hace petición a API
   ✅ Caché se actualiza
   ✅ Mensaje de confirmación
```

**CP-005: Headers de caché HTTP**
```
1. Primera carga de PYDOA.svg
2. Verificar en Network:
   ✅ Status: 200 OK
   ✅ Header: Cache-Control: public, max-age=31536000
3. Recargar página (F5)
4. Verificar:
   ✅ Status: 304 Not Modified O (from disk cache)
   ✅ Tiempo: <5ms
```

**CP-006: Error handling**
```
1. Detener backend Node.js
2. Limpiar caché y navegar a /nuevo-calculo
3. Verificar:
   ✅ Error se muestra claramente
   ✅ Botón "Reintentar" visible
   ✅ No hay crash de la app
4. Iniciar backend
5. Click en "Reintentar"
6. Verificar:
   ✅ Tareas se cargan correctamente
```

**CP-007: Race conditions**
```
1. Navegar rápidamente: home → nuevo-calculo → home → nuevo-calculo
2. Verificar:
   ✅ No hay errores en console
   ✅ Estado final es correcto
   ✅ No hay peticiones duplicadas
```

**MEDICIÓN DE PERFORMANCE:**

```
Métrica                    | Antes    | Después  | Mejora
---------------------------|----------|----------|--------
Primera carga              | 2000ms   | 1800ms   | -10%
Segunda carga              | 2000ms   | 150ms    | -92%
Carga de íconos (2da vez)  | 1500ms   | 50ms     | -97%
Peticiones API (10 nav)    | 10       | 1        | -90%
```

**CRITERIOS DE ACEPTACIÓN:**
- ✅ Todos los casos de prueba pasan
- ✅ Performance mejora significativamente
- ✅ No hay errores en console
- ✅ UX es fluida y responsiva

**TIEMPO ESTIMADO:** 60 minutos

---

## 5. CASOS DE PRUEBA

### CP-001: Flujo Completo con Caché

**Precondiciones:**
- Backend corriendo en localhost:3000
- Frontend corriendo en localhost:5173
- Caché vacío (primera vez)

**Pasos:**
1. Abrir DevTools → Network tab
2. Navegar a http://localhost:5173/nuevo-calculo
3. Observar petición a `/api/tareas` (330ms)
4. Observar carga de 17 SVG icons (~1.5s)
5. Navegar a /home
6. Volver a /nuevo-calculo
7. Observar que NO hay petición a `/api/tareas`
8. Observar que íconos cargan desde cache (~50ms)

**Resultado Esperado:**
- Primera carga: ~2s
- Segunda carga: <200ms
- Console muestra: "✅ Cache HIT para: tareas_profesionales"

---

### CP-002: Invalidación Manual de Caché

**Pasos:**
1. Cargar /nuevo-calculo (datos en caché)
2. Modificar una tarea en la BD
3. Click en botón "Actualizar datos"
4. Observar petición a API
5. Verificar que datos nuevos se muestran

**Resultado Esperado:**
- Botón muestra loading state
- Datos se actualizan correctamente
- Console muestra: "🔄 Refresh forzado para: tareas_profesionales"

---

### CP-003: Headers de Caché en Producción

**Pasos:**
1. Deploy a Vercel
2. Navegar a https://ch2026-qa.neosisweb.ar/nuevo-calculo
3. Abrir DevTools → Network
4. Buscar PYDOA.svg
5. Inspeccionar headers

**Resultado Esperado:**
```
Response Headers:
Cache-Control: public, max-age=31536000, immutable
```

---

## 6. CRITERIOS DE ACEPTACIÓN

### Funcionales

- ✅ **Caché funciona correctamente**
  - Primera carga hace petición a API
  - Segunda carga usa caché (sin petición)
  - TTL se respeta y expira datos viejos

- ✅ **Loading states visibles**
  - Spinner se muestra durante cargas
  - Mensajes claros y descriptivos
  - Overlay bloquea durante cálculos

- ✅ **Headers HTTP configurados**
  - SVG icons se cachean 1 año
  - Segunda visita carga desde cache (304)
  - Tiempo de carga de assets < 50ms

- ✅ **Botón de refresh funciona**
  - Fuerza recarga de datos
  - Feedback visual (spinner)
  - Caché se actualiza correctamente

### Performance

- ✅ **Primera carga**: <2s (aceptable, limitado por API 330ms)
- ✅ **Segunda carga**: <200ms (excelente, desde caché)
- ✅ **Reducción de peticiones**: 90% menos a lo largo de la sesión
- ✅ **Íconos**: de 1.5s a <50ms en cargas subsecuentes

### UX

- ✅ Usuario ve feedback visual durante operaciones asíncronas
- ✅ No hay "pantallas en blanco" sin indicación
- ✅ Transiciones suaves entre estados
- ✅ Errores se manejan gracefully con retry

### Código

- ✅ Sistema de caché es genérico y reutilizable
- ✅ Hook `useApiCache` puede usarse con otras entidades
- ✅ Componente `LoadingSpinner` es flexible y consistente
- ✅ Código documentado con JSDoc

---

## 7. CONFIGURACIÓN Y VARIABLES

### Constantes de Caché - ✅ IMPLEMENTADO

**Ubicación:** `App/Frontend/src/utils/constants.js`

```javascript
// Configuración de caché (TTL en milisegundos)
export const CACHE_TTL = {
  TAREAS_PROFESIONALES: 600000,    // 10 minutos - Cambian raramente
  COMPLEJIDADES: 3600000,          // 1 hora - Datos muy estables
  TIPOLOGIAS: 3600000,             // 1 hora - Catálogo fijo
  PARAMETROS_SISTEMA: 1800000,     // 30 minutos - Configuración
  DEFAULT: 300000,                 // 5 minutos - Valor por defecto
  MIN: 60000,                      // 1 minuto - Mínimo recomendado
  MAX: 3600000                     // 1 hora - Máximo recomendado
};

// Mensajes de loading
export const LOADING_MESSAGES = {
  TAREAS: 'Cargando tareas profesionales...',
  CALCULO: 'Calculando honorarios profesionales...',
  GUARDANDO: 'Guardando información...',
  ACTUALIZANDO: 'Actualizando datos...',
  CARGANDO: 'Cargando...'
};
```

**Uso en componentes:**

```javascript
import { CACHE_TTL, LOADING_MESSAGES } from '../utils/constants';

// En useApiCache
const { data } = useApiCache(
  'tareas_profesionales',
  obtenerTareasProfesionales,
  { ttl: CACHE_TTL.TAREAS_PROFESIONALES }
);

// En LoadingSpinner
<LoadingSpinner message={LOADING_MESSAGES.TAREAS} />
```

---

## 8. NOTAS TÉCNICAS

### Limitaciones del Caché en Memoria

- ⚠️ **Se pierde al refrescar la página** (F5)
- ⚠️ **No persiste entre sesiones**
- ⚠️ **Limitado a ~50MB** (típico)

**Solución futura (Fase 2):**
- Implementar persistencia con `localStorage` o `IndexedDB`
- Agregar estrategia de sincronización con backend
- Implementar Service Worker para offline-first

### Estrategias de Invalidación

**Automática:**
- TTL expira automáticamente
- Cada entrada tiene su propio timestamp

**Manual:**
- Botón "Actualizar datos"
- Función `refresh()` del hook

**Por eventos:**
- Después de crear/editar/eliminar entidad
- Webhook desde backend (futuro)

### Debug del Caché

```javascript
// En DevTools Console:
window.__CACHE_DEBUG__ = {
  stats: () => {
    const cacheContext = document.querySelector('[data-cache-provider]');
    return cacheContext?.getStats();
  },
  clear: () => {
    const cacheContext = document.querySelector('[data-cache-provider]');
    cacheContext?.invalidateAll();
  }
};

// Uso:
window.__CACHE_DEBUG__.stats();  // Ver estado del caché
window.__CACHE_DEBUG__.clear();  // Limpiar todo
```

---

## 9. PRÓXIMOS PASOS (FASE 2)

1. **Caché persistente** con `localStorage`
2. **Skeleton loading** para mejor UX
3. **Optimistic updates** (actualizar UI antes de API)
4. **Background sync** con Service Worker
5. **Lazy loading** de íconos con Intersection Observer
6. **Bundle de SVG** (sprite sheet único)
7. **CDN** para assets estáticos

---

## 10. REFERENCIAS

- [React Context API](https://react.dev/reference/react/useContext)
- [Cache-Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Vercel Headers Configuration](https://vercel.com/docs/projects/project-configuration#headers)
- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

**FIN DE ESPECIFICACIÓN**
