import { TAREAS_A_VALID_POR_ROL } from './constants';

/**
 * ============================================================================
 * CAPA INTERMEDIA PARA PRUEBAS - FILTRADO DE TAREAS PROFESIONALES
 * ============================================================================
 * 
 * Este módulo proporciona funciones para filtrar tareas profesionales según
 * el rol del usuario, permitiendo que el cliente realice pruebas en tareas
 * que están marcadas como "no vigentes" en la base de datos.
 * 
 * CONTEXTO:
 * - La API devuelve todas las tareas con su estado real (vigente: 0 o 1)
 * - En producción, solo se muestran tareas con vigente=1
 * - Para testing, ciertos roles (ej: admin) necesitan ver tareas no vigentes
 * 
 * IMPORTANTE: Esta es una capa de PRESENTACIÓN temporal. No modifica datos
 * en la API ni en la base de datos. Solo afecta qué cards se muestran en UI.
 */

/**
 * Verifica si una tarea debe forzarse como vigente para un rol específico
 * @param {string} codiTarea - Código de la tarea profesional (ej: "CONFAC")
 * @param {string} rolUsuario - Rol del usuario actual (ej: "admin", "user", "guest")
 * @returns {boolean} True si debe forzarse como vigente, false en caso contrario
 */
function debeForZarseComoVigente(codiTarea, rolUsuario) {
  if (!rolUsuario) return false;
  
  return TAREAS_A_VALID_POR_ROL.some(
    config => config.role === rolUsuario && config.codi === codiTarea
  );
}

/**
 * Filtra tareas profesionales según el rol del usuario
 * 
 * LÓGICA:
 * 1. Si la tarea tiene vigente=1 → SIEMPRE se muestra (independiente del rol)
 * 2. Si la tarea tiene vigente=0:
 *    - Se verifica si existe en TAREAS_A_VALID_POR_ROL para el rol del usuario
 *    - Si existe → se muestra (para facilitar testing)
 *    - Si NO existe → NO se muestra
 * 
 * @param {Array} tareas - Array de tareas profesionales desde la API
 * @param {string|null} rolUsuario - Rol del usuario actual (puede ser null si no hay sesión)
 * @returns {Array} Array filtrado de tareas que deben mostrarse
 * 
 * @example
 * // Usuario con rol "admin" verá PYDOA (vigente=1) + CONFAC + ARBI (vigente=0 pero forzadas)
 * const tareasFiltradas = filtrarTareasPorRol(todasLasTareas, 'admin');
 * 
 * @example
 * // Usuario con rol "user" solo verá PYDOA (vigente=1)
 * const tareasFiltradas = filtrarTareasPorRol(todasLasTareas, 'user');
 */
export function filtrarTareasPorRol(tareas, rolUsuario) {
  if (!tareas || !Array.isArray(tareas)) {
    return [];
  }

  return tareas.filter(tarea => {
    // Caso 1: Tarea vigente según la API → siempre mostrar
    if (tarea.vigente === 1) {
      return true;
    }

    // Caso 2: Tarea NO vigente → verificar si debe forzarse para este rol
    return debeForZarseComoVigente(tarea.codi, rolUsuario);
  });
}
