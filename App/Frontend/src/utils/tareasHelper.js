import { TAREAS_A_VALID_POR_ROL } from './constants';

/**
 * ============================================================================
 * CAPA INTERMEDIA PARA PRUEBAS - AJUSTE DE VIGENCIA DE TAREAS PROFESIONALES
 * ============================================================================
 * 
 * Este módulo proporciona funciones para ajustar la vigencia de tareas 
 * profesionales según el rol del usuario, permitiendo que el cliente realice 
 * pruebas en tareas que están marcadas como "no vigentes" (EN CONSTRUCCIÓN) 
 * en la base de datos.
 * 
 * CONTEXTO:
 * - La API devuelve todas las tareas con su estado real (vigente: 0 o 1)
 * - vigente=1 → Tarea disponible (sin badge "EN CONSTRUCCIÓN")
 * - vigente=0 → Tarea no disponible (con badge "EN CONSTRUCCIÓN", deshabilitada)
 * - Para testing, ciertos roles (ej: admin) necesitan ver tareas habilitadas
 *   aunque estén marcadas como vigente=0 en la base de datos
 * 
 * IMPORTANTE: Esta es una capa de PRESENTACIÓN temporal. No modifica datos
 * en la API ni en la base de datos. Solo ajusta el campo vigente antes de 
 * renderizar las cards en UI.
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
 * Ajusta la vigencia de tareas profesionales según el rol del usuario
 * 
 * LÓGICA:
 * 1. Si la tarea tiene vigente=1 → Se mantiene vigente=1 (disponible)
 * 2. Si la tarea tiene vigente=0:
 *    - Se verifica si existe en TAREAS_A_VALID_POR_ROL para el rol del usuario
 *    - Si existe → se fuerza vigente=1 (disponible para testing)
 *    - Si NO existe → se mantiene vigente=0 (EN CONSTRUCCIÓN)
 * 
 * RESULTADO:
 * - Devuelve TODAS las tareas (no filtra)
 * - Ajusta el campo "vigente" según configuración de rol
 * - Las cards muestran/ocultan badge "EN CONSTRUCCIÓN" según vigente ajustado
 * 
 * @param {Array} tareas - Array de tareas profesionales desde la API
 * @param {string|null} rolUsuario - Rol del usuario actual (puede ser null si no hay sesión)
 * @returns {Array} Array completo de tareas con vigencia ajustada
 * 
 * @example
 * // Usuario con rol "admin" verá:
 * // - PYDOA: disponible (vigente=1 original)
 * // - CONFAC: disponible (vigente forzado a 1 por rol)
 * // - ARBI: disponible (vigente forzado a 1 por rol)
 * const tareasAjustadas = ajustarVigenciaPorRol(todasLasTareas, 'admin');
 * 
 * @example
 * // Usuario con rol "user" verá:
 * // - PYDOA: disponible (vigente=1 original)
 * // - CONFAC: EN CONSTRUCCIÓN (vigente=0 original)
 * // - ARBI: EN CONSTRUCCIÓN (vigente=0 original)
 * const tareasAjustadas = ajustarVigenciaPorRol(todasLasTareas, 'user');
 */
export function ajustarVigenciaPorRol(tareas, rolUsuario) {
  if (!tareas || !Array.isArray(tareas)) {
    return [];
  }

  // Retornar todas las tareas, pero ajustando el campo "vigente" según rol
  return tareas.map(tarea => {
    // Si ya es vigente, mantener como está
    if (tarea.vigente === 1) {
      return tarea;
    }

    // Si NO es vigente, verificar si debe forzarse para este rol
    if (debeForZarseComoVigente(tarea.codi, rolUsuario)) {
      // Retornar una copia con vigente=1 para habilitar la tarea
      return {
        ...tarea,
        vigente: 1
      };
    }

    // Mantener como está (vigente=0, EN CONSTRUCCIÓN)
    return tarea;
  });
}
