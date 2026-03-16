/**
 * Servicio de Honorarios - Capa de abstracción para llamadas a API
 * 
 * IMPORTANTE: Este es el ÚNICO lugar que debe cambiar al migrar al backend real
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 * Versión: 1.0
 * Fecha: 16/03/2026
 */

// Configuración de API
// HOY: serverless en mismo dominio (/api)
// FUTURO: backend real (cambiar solo esta variable en .env)
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
    const response = await fetch(`${API_BASE_URL}/v1/honorarios/calcular`, {
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
      
      // Extraer mensaje de error
      const errorMessage = errorData?.error || 
                          errorData?.message || 
                          `Error ${response.status}: ${response.statusText}`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorData?.details;
      throw error;
    }

    // Parsear respuesta exitosa
    const resultado = await response.json();
    
    // Validar estructura de respuesta
    if (!resultado.success || !resultado.data) {
      throw new Error('Respuesta inválida del servidor');
    }

    return resultado.data;

  } catch (error) {
    // Si es error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Error de red al calcular honorarios:', error);
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    }

    // Re-lanzar otros errores
    console.error('Error en calcularHonorarios:', error);
    throw error;
  }
}

/**
 * FUTURO: Guarda un cálculo en la base de datos
 * HOY: Función stub que no hace nada (maqueta)
 * 
 * @param {string} calculoId - ID del cálculo a guardar
 * @param {Object} datosAdicionales - Datos adicionales (notas, etiquetas, etc.)
 * @returns {Promise<Object>} Confirmación del guardado
 */
export async function guardarCalculo(calculoId, datosAdicionales = {}) {
  // HOY: No hace nada (maqueta sin persistencia)
  console.info('guardarCalculo - Función disponible en backend real (Fase 2)');
  console.debug('Parámetros recibidos:', { calculoId, datosAdicionales });
  
  // Simular respuesta exitosa
  return {
    success: true,
    message: 'Función disponible en backend real con base de datos',
    calculoId
  };

  // FUTURO: Implementación real
  // const response = await fetch(`${API_BASE_URL}/honorarios/guardar`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${getAuthToken()}`
  //   },
  //   body: JSON.stringify({ calculoId, datosAdicionales })
  // });
  // return await response.json();
}

/**
 * FUTURO: Obtiene el histórico de cálculos realizados por el usuario
 * HOY: Función stub que retorna array vacío (maqueta)
 * 
 * @param {Object} filtros - Filtros de búsqueda (fechaDesde, fechaHasta, tipoCalculo, etc.)
 * @returns {Promise<Object>} Lista de cálculos históricos
 */
export async function obtenerHistoricoCalculos(filtros = {}) {
  // HOY: No hace nada (maqueta sin persistencia)
  console.info('obtenerHistoricoCalculos - Función disponible en backend real (Fase 2)');
  console.debug('Filtros recibidos:', filtros);
  
  // Simular respuesta vacía
  return {
    success: true,
    data: {
      calculos: [],
      pagination: {
        total: 0,
        limit: 20,
        offset: 0,
        hasNext: false,
        hasPrev: false
      }
    },
    message: 'Función disponible en backend real con base de datos'
  };

  // FUTURO: Implementación real
  // const queryParams = new URLSearchParams(filtros).toString();
  // const response = await fetch(`${API_BASE_URL}/honorarios/historial?${queryParams}`, {
  //   headers: {
  //     'Authorization': `Bearer ${getAuthToken()}`
  //   }
  // });
  // return await response.json();
}

/**
 * FUTURO: Obtiene un cálculo específico por su ID
 * HOY: Función stub que retorna null (maqueta)
 * 
 * @param {string} calculoId - ID del cálculo a recuperar
 * @returns {Promise<Object>} Datos completos del cálculo
 */
export async function obtenerCalculoPorId(calculoId) {
  // HOY: No hace nada (maqueta sin persistencia)
  console.info('obtenerCalculoPorId - Función disponible en backend real (Fase 2)');
  console.debug('CalculoID solicitado:', calculoId);
  
  // Simular respuesta vacía
  return {
    success: false,
    error: 'Función disponible en backend real con base de datos',
    calculoId
  };

  // FUTURO: Implementación real
  // const response = await fetch(`${API_BASE_URL}/honorarios/calculos/${calculoId}`, {
  //   headers: {
  //     'Authorization': `Bearer ${getAuthToken()}`
  //   }
  // });
  // return await response.json();
}

/**
 * Helper: Obtener token de autenticación (para Fase 2)
 * 
 * @returns {string|null} JWT token o null si no está autenticado
 */
function getAuthToken() {
  // HOY: No implementado (AuthContext es mock)
  // FUTURO: Obtener de localStorage o context
  return null;
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
