// Funciones de validación para formularios

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean} - true si es válido
 */
export const isRequired = (value) => {
  return value && value.trim().length > 0;
};

/**
 * Valida longitud mínima de un campo
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima requerida
 * @returns {boolean} - true si cumple la longitud mínima
 */
export const hasMinLength = (value, minLength) => {
  return value && value.trim().length >= minLength;
};

/**
 * Valida el campo de usuario
 * @param {string} username - Nombre de usuario
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateUsername = (username) => {
  if (!isRequired(username)) {
    return 'El usuario es requerido';
  }
  if (!hasMinLength(username, 3)) {
    return 'El usuario debe tener al menos 3 caracteres';
  }
  return null;
};

/**
 * Valida el campo de contraseña
 * @param {string} password - Contraseña
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePassword = (password) => {
  if (!isRequired(password)) {
    return 'La contraseña es requerida';
  }
  if (!hasMinLength(password, 4)) {
    return 'La contraseña debe tener al menos 4 caracteres';
  }
  return null;
};

/**
 * Valida credenciales de login
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object} - Objeto con isValid y errors
 */
export const validateLoginForm = (username, password) => {
  const errors = {
    username: validateUsername(username),
    password: validatePassword(password)
  };
  
  const isValid = !errors.username && !errors.password;
  
  return { isValid, errors };
};
