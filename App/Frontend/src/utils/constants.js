// Constantes de la aplicación CH2026

// Credenciales de ejemplo para login
// Múltiples usuarios con diferentes roles para testing
export const VALID_CREDENTIALS = [
  {
    username: 'admin',
    password: 'cpau!2026',
    role: 'admin',
    displayName: 'Administrador del Sistema'
  },
  {
    username: 'test',
    password: 'CPAU',
    role: 'user',
    displayName: 'Usuario de Prueba'
  },
  {
    username: 'invitado',
    password: 'guest2026',
    role: 'guest',
    displayName: 'Invitado'
  }
];

// Keys para localStorage
export const STORAGE_KEYS = {
  SESSION: 'ch2026_session',
  REMEMBER: 'ch2026_remember'
};

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  NUEVO_CALCULO: '/nuevo-calculo',
  PREFERENCIAS: '/preferencias',
  MI_CUENTA: '/mi-cuenta',
  PARAMETROS: '/parametros'
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  MIN_LENGTH_USERNAME: 'El usuario debe tener al menos 3 caracteres',
  MIN_LENGTH_PASSWORD: 'La contraseña debe tener al menos 4 caracteres',
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos'
};

// ============================================================================
// CONFIGURACIÓN DE TESTING - CAPA INTERMEDIA PARA PRUEBAS DEL CLIENTE
// ============================================================================
/**
 * Tareas profesionales que deben forzarse como "vigentes" para roles específicos
 * 
 * PROPÓSITO: Permitir al cliente realizar pruebas en tareas profesionales que
 * están marcadas como "no vigentes" en la base de datos, pero que necesitan
 * ser visibles para ciertos roles (ej: admin) durante el período de testing.
 * 
 * FUNCIONAMIENTO:
 * - Si una tarea tiene vigente=0 en la API pero su "codi" aparece aquí 
 *   asociado a un rol, se mostrará la card para ese rol específico.
 * - Los demás roles seguirán viendo solo las tareas con vigente=1.
 * 
 * NOTA: Esta es una capa de presentación TEMPORAL para facilitar pruebas.
 * No modifica los datos en la base de datos ni en la API.
 */
export const TAREAS_A_VALID_POR_ROL = [
  // {
  //   role: 'admin',
  //   codi: 'HABI'
  // },
  // {
  //   role: 'admin',
  //   codi: 'CONFAC'
  // },
  // {
  //   role: 'admin',
  //   codi: 'REPTEC'
  // }
];

// Configuración de caché (TTL en milisegundos)
export const CACHE_TTL = {
  TAREAS_PROFESIONALES: 3600000,    // 1 hora - Cambian raramente
  COMPLEJIDADES: 3600000,          // 1 hora - Datos muy estables
  TIPOLOGIAS: 3600000,             // 1 hora - Catálogo fijo
  PARAMETROS_SISTEMA: 3600000,     // 1 hora - Configuración
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
