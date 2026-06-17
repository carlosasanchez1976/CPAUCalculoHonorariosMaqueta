import { useState, useEffect, useCallback } from 'react';
import { useCache } from '../contexts/CacheContext';

/**
 * Hook para cachear llamadas a API con gestión de estados
 * 
 * @param {string} cacheKey - Clave única para identificar el caché
 * @param {Function} fetchFn - Función async que obtiene los datos
 * @param {Object} options - Opciones de configuración
 * @param {number} options.ttl - Tiempo de vida en ms (default: 5min)
 * @param {Function} options.onError - Callback cuando hay error
 * @param {boolean} options.autoFetch - Auto-ejecutar fetch (default: true)
 * 
 * @returns {Object} Objeto con propiedades:
 *   - data: Datos obtenidos (null si aún no se cargó)
 *   - loading: Boolean indicando si está cargando
 *   - error: String con mensaje de error (null si no hay error)
 *   - refresh: Función para forzar recarga desde API
 *   - clear: Función para limpiar entrada del caché
 *   - isFromCache: Boolean indicando si los datos vienen del caché
 * 
 * @example
 * const { data, loading, error, refresh } = useApiCache(
 *   'tareas_profesionales',
 *   obtenerTareasProfesionales,
 *   { ttl: 600000 }
 * );
 */
export const useApiCache = (cacheKey, fetchFn, options = {}) => {
  const {
    ttl = 300000,           // 5 minutos por defecto
    onError = null,
    autoFetch = true
  } = options;
  
  const { get, set, invalidate } = useCache();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  /**
   * Función interna para obtener datos (desde caché o API)
   * @param {boolean} forceRefresh - Si true, ignora caché y hace petición
   */
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
  
  /**
   * Fuerza una recarga desde la API ignorando el caché
   * @returns {Promise} Promesa con los datos actualizados
   */
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);
  
  /**
   * Limpia la entrada del caché y resetea el estado local
   */
  const clear = useCallback(() => {
    invalidate(cacheKey);
    setData(null);
  }, [cacheKey, invalidate]);
  
  // Auto-fetch al montar el componente (si autoFetch es true)
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Solo ejecutar cuando cambie autoFetch o al montar
  
  return {
    data,
    loading,
    error,
    refresh,
    clear,
    isFromCache: data !== null && !loading
  };
};
