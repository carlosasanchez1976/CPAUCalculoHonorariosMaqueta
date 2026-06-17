/**
 * apiErrorHandler.js
 * Utilidad centralizada para manejo consistente de errores de API
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 */

/**
 * Procesa errores de fetch y genera mensajes amigables para el usuario
 * 
 * @param {Error} error - Error capturado del fetch
 * @param {Response|null} response - Respuesta HTTP (si existe)
 * @param {string} contexto - Contexto de la operación (ej: "al obtener tareas")
 * @returns {Error} Error procesado con mensaje amigable
 */
export function procesarErrorApi(error, response = null, contexto = '') {
  const contextoTexto = contexto ? ` ${contexto}` : '';
  
  // 1. Error de red o CORS (no se pudo completar el fetch)
  if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
    // CORS específicamente bloquea el acceso y aparece como TypeError
    if (error.message.includes('CORS') || 
        error.message.includes('blocked') ||
        error.message.includes('Access to fetch')) {
      const newError = new Error(`Acceso bloqueado por política CORS${contextoTexto}`);
      newError.type = 'CORS';
      newError.originalError = error;
      return newError;
    }
    
    // Error de red genérico
    const newError = new Error(`No se pudo conectar con el servidor${contextoTexto}. Verifique su conexión a internet.`);
    newError.type = 'NETWORK';
    newError.originalError = error;
    return newError;
  }
  
  // 2. Response con código de estado específico
  if (response) {
    const status = response.status;
    
    switch (status) {
      case 404:
        const error404 = new Error(`URL no encontrada (404)${contextoTexto}. Verifique la configuración de la API.`);
        error404.type = 'NOT_FOUND';
        error404.status = 404;
        return error404;
        
      case 401:
        const error401 = new Error(`No autorizado (401)${contextoTexto}. Verifique sus credenciales.`);
        error401.type = 'UNAUTHORIZED';
        error401.status = 401;
        return error401;
        
      case 403:
        const error403 = new Error(`Acceso denegado (403)${contextoTexto}.`);
        error403.type = 'FORBIDDEN';
        error403.status = 403;
        return error403;
        
      case 500:
      case 502:
      case 503:
        const error5xx = new Error(`Error del servidor (${status})${contextoTexto}. Intente nuevamente más tarde.`);
        error5xx.type = 'SERVER_ERROR';
        error5xx.status = status;
        return error5xx;
        
      default:
        const errorGenerico = new Error(`Error ${status}${contextoTexto}: ${response.statusText}`);
        errorGenerico.type = 'HTTP_ERROR';
        errorGenerico.status = status;
        return errorGenerico;
    }
  }
  
  // 3. Error desconocido - devolver tal cual con contexto
  if (error.message) {
    const newError = new Error(`${error.message}${contextoTexto}`);
    newError.type = 'UNKNOWN';
    newError.originalError = error;
    return newError;
  }
  
  // 4. Fallback
  const fallbackError = new Error(`Error desconocido${contextoTexto}`);
  fallbackError.type = 'UNKNOWN';
  fallbackError.originalError = error;
  return fallbackError;
}

/**
 * Wrapper para fetch que automáticamente procesa errores
 * 
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch
 * @param {string} contexto - Contexto de la operación
 * @returns {Promise<Response>} Respuesta HTTP
 * @throws {Error} Error procesado con mensaje amigable
 */
export async function fetchConManejadorErrores(url, options = {}, contexto = '') {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw procesarErrorApi(new Error(`HTTP ${response.status}`), response, contexto);
    }
    
    return response;
  } catch (error) {
    // Si ya es un error procesado, re-lanzarlo
    if (error.type) {
      throw error;
    }
    
    // Si es error de red/CORS, procesarlo
    throw procesarErrorApi(error, null, contexto);
  }
}
