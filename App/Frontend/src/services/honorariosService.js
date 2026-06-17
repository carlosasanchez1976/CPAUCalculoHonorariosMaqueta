/**
 * Servicio de Honorarios - Capa de abstracción para llamadas a API
 * 
 * FASE 2: Backend Node.js + Express + MySQL RDS (AWS)
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 * Versión: 2.0 - Backend Real con Persistencia
 * Fecha: 24/04/2026
 */

import { procesarErrorApi } from '../utils/apiErrorHandler.js';

// Configuración de API - Backend Node.js
// DESA: http://localhost:3000/api
// QA: https://api-ch2026-qa.neosisweb.ar/api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_VERSION = '1.0';

/**
 * Calcula honorarios profesionales según tipo de cálculo y tareas seleccionadas
 * 
 * @param {Object} datosCompletos - Todos los datos del wizard
 * @param {string} datosCompletos.tipoCalculo - Tipo de cálculo ("basico")
 * @param {Object} datosCompletos.datosProyecto - Datos del proyecto (opcional)
 * @param {Object} datosCompletos.datosObra - Datos de la obra
 * @param {number} datosCompletos.datosObra.valorObra - Valor total de la obra
 * @param {Object} datosCompletos.tareasProfesionales - Tareas seleccionadas
 * @param {Object} datosCompletos.parametros - Parámetros adicionales
 * @returns {Promise<Object>} Resultado del cálculo con detalleHonorarios y totalHonorarios
 * @throws {Error} Si hay error en la petición o validación
 */
export async function calcularHonorarios(datosCompletos) {
  try {
    const response = await fetch(`${API_BASE_URL}/calculos/calcular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': API_VERSION
      },
      body: JSON.stringify(datosCompletos)
    });

    // Manejar respuestas no exitosas
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      
      // Si el backend devuelve un mensaje específico, usarlo
      if (errorData?.error || errorData?.message) {
        const errorMessage = errorData.error || errorData.message;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.details = errorData?.details;
        throw error;
      }
      
      // Si no, usar el manejador centralizado
      throw procesarErrorApi(new Error(`HTTP ${response.status}`), response, 'al calcular honorarios');
    }

    // Parsear respuesta exitosa
    const resultado = await response.json();
    
    // Validar estructura de respuesta
    if (!resultado.success || !resultado.data) {
      throw new Error('Respuesta inválida del servidor');
    }

    return resultado.data;

  } catch (error) {
    // Si ya es un error procesado, re-lanzarlo
    if (error.status || error.type) {
      console.error('Error en calcularHonorarios:', error.message, error.type || error.status);
      throw error;
    }
    
    // Si es error de red/CORS, procesarlo
    const errorProcesado = procesarErrorApi(error, null, 'al calcular honorarios');
    console.error('Error en calcularHonorarios:', errorProcesado.message, errorProcesado.type);
    throw errorProcesado;
  }
}


/**
 * Helper: Formatear errores de API para mostrar al usuario
 * 
 * @param {Error} error - Error capturado
 * @returns {string} Mensaje user-friendly
 */
export function formatearErrorAPI(error) {
  if (!error) return 'Error desconocido';

  // Errores de validación (400)
  if (error.status === 400) {
    if (error.details?.field) {
      return `${error.details.field}: ${error.message}`;
    }
    return error.message || 'Datos inválidos. Verifique la información ingresada.';
  }

  // Errores de autenticación (401)
  if (error.status === 401) {
    return 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
  }

  // Errores de permisos (403)
  if (error.status === 403) {
    return 'No tiene permisos para realizar esta acción.';
  }

  // Errores del servidor (500)
  if (error.status >= 500) {
    return 'Error en el servidor. Intente nuevamente en unos momentos.';
  }

  // Error genérico
  return error.message || 'Ocurrió un error inesperado. Intente nuevamente.';
}

// Exportar constantes útiles
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  VERSION: API_VERSION
};
