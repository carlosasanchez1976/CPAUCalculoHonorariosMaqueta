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
  CALCULOS_REALIZADOS: '/calculos-realizados',
  NUEVO_PROYECTO: '/nuevo-proyecto',
  PROYECTOS_REALIZADOS: '/proyectos-realizados',
  CONSULTA_PRECIOS: '/consulta-precios',
  PERSONALIZAR: '/personalizar',
  PREFERENCIAS: '/preferencias',
  MI_CUENTA: '/mi-cuenta'
};

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  MIN_LENGTH_USERNAME: 'El usuario debe tener al menos 3 caracteres',
  MIN_LENGTH_PASSWORD: 'La contraseña debe tener al menos 4 caracteres',
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos'
};
