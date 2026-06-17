// tareasProfesionalesService.js
// Service layer para consumo de API de tareas profesionales

import { fetchConManejadorErrores } from '../utils/apiErrorHandler.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';


/**
 * Obtener todas las tareas profesionales activas
 * Enriquece cada tarea con iconUrl
 */
export async function obtenerTareasProfesionales() {
  try {
    const response = await fetchConManejadorErrores(
      `${API_BASE_URL}/tareas`,
      {},
      'al obtener tareas profesionales'
    );
    const tareas = await response.json();
    return tareas.map(t => ({
      ...t,
      iconUrl: `/assets/icons/tareas/${t.codi}.svg`
    }));
  } catch (err) {
    console.error('Error en obtenerTareasProfesionales:', err.message, err.type);
    throw err;
  }
}

/**
 * Buscar tarea profesional por ID
 * Enriquece la tarea con iconUrl
 */
export async function buscarTareaProfesional(tareaId) {
  try {
    const response = await fetchConManejadorErrores(
      `${API_BASE_URL}/tareas/${tareaId}`,
      {},
      'al buscar tarea profesional'
    );
    const tarea = await response.json();
    return tarea ? { ...tarea, iconUrl: `/assets/icons/tareas/${tarea.codi}.svg` } : null;
  } catch (err) {
    console.error('Error en buscarTareaProfesional:', err.message, err.type);
    throw err;
  }
}
