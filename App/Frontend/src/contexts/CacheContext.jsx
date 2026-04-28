import { createContext, useState, useContext, useCallback } from 'react';

const CacheContext = createContext(null);

/**
 * Provider para gestionar caché en memoria de datos de API
 * Almacena datos con TTL (Time To Live) configurable
 * Útil para reducir llamadas redundantes a API de datos parametricos
 */
export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState(new Map());
  
  /**
   * Obtiene un valor del caché si existe y no ha expirado
   * @param {string} key - Clave única del caché
   * @returns {any|null} Datos cacheados o null si no existe/expiró
   */
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
  
  /**
   * Guarda datos en el caché con TTL
   * @param {string} key - Clave única del caché
   * @param {any} data - Datos a cachear
   * @param {number} ttl - Tiempo de vida en milisegundos (default: 5 minutos)
   */
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
  
  /**
   * Elimina una entrada específica del caché
   * @param {string} key - Clave a eliminar
   */
  const invalidate = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);
  
  /**
   * Limpia todo el caché
   */
  const invalidateAll = useCallback(() => {
    setCache(new Map());
  }, []);
  
  /**
   * Obtiene estadísticas del caché (útil para debug)
   * @returns {Object} Objeto con size, keys, items
   */
  const getStats = useCallback(() => {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
      items: Array.from(cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
        ttl: value.ttl,
        remainingTime: value.ttl - (Date.now() - value.timestamp)
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

/**
 * Hook para acceder al contexto de caché
 * @returns {Object} Objeto con métodos get, set, invalidate, invalidateAll, getStats
 * @throws {Error} Si se usa fuera de CacheProvider
 */
export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache debe usarse dentro de CacheProvider');
  }
  return context;
};
