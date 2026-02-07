/**
 * Utilidades de formateo para números y monedas
 */

/**
 * Formatea un número como moneda en pesos argentinos (ARS)
 * @param {number} value - Valor a formatear
 * @param {boolean} includeSymbol - Si debe incluir el símbolo $
 * @returns {string} - Valor formateado
 */
export const formatCurrencyARS = (value, includeSymbol = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return includeSymbol ? '$ 0' : '0';
  }

  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

  return includeSymbol ? `$ ${formatted}` : formatted;
};

/**
 * Formatea un número como moneda en dólares estadounidenses (USD)
 * @param {number} value - Valor a formatear
 * @param {boolean} includeSymbol - Si debe incluir el símbolo USD
 * @returns {string} - Valor formateado
 */
export const formatCurrencyUSD = (value, includeSymbol = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return includeSymbol ? 'USD 0' : '0';
  }

  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

  return includeSymbol ? `USD ${formatted}` : formatted;
};

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('es-AR').format(value);
};

/**
 * Convierte un string a número, eliminando separadores
 * @param {string} value - String a convertir
 * @returns {number} - Número parseado
 */
export const parseFormattedNumber = (value) => {
  if (!value) return 0;
  
  // Eliminar puntos de separador de miles y convertir coma decimal a punto
  const cleaned = value.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Genera un número de cálculo mock de 6 dígitos
 * @returns {string} - Número de cálculo
 */
export const generateCalculationNumber = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};
