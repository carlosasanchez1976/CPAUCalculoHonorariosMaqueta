// Constantes de la aplicación CH2026

// Credenciales de ejemplo para login
export const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'CPAU'
};

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
