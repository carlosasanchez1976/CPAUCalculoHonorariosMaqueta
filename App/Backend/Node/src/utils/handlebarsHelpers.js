/**
 * handlebarsHelpers.js
 * Helpers personalizados para renderizar plantillas Handlebars
 * Proyecto: CH2026 - CPAU Cálculo de Honorarios
 * SPEC: SPEC010-CALC-Entregables (T010-002)
 */

const Handlebars = require('handlebars');

/**
 * Formatea número como moneda ARS
 * Uso: {{formatCurrencyARS valorObra}}
 */
Handlebars.registerHelper('formatCurrencyARS', (value) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
});

/**
 * Formatea número como porcentaje
 * Uso: {{formatPercent 15.5}}
 */
Handlebars.registerHelper('formatPercent', (value) => {
  if (!value && value !== 0) return 'N/A';
  return `${value.toFixed(2)}%`;
});

/**
 * División matemática
 * Uso: {{divide valorObra cotizDolar}}
 */
Handlebars.registerHelper('divide', (a, b) => {
  if (!b || b === 0) return 0;
  return a / b;
});

/**
 * Multiplicación matemática
 * Uso: {{multiply valor 100}}
 */
Handlebars.registerHelper('multiply', (a, b) => {
  return (a || 0) * (b || 0);
});

/**
 * Comparación de igualdad
 * Uso: {{#ifEquals valor1 valor2}}...{{/ifEquals}}
 */
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

/**
 * Comparación mayor que
 * Uso: {{#ifGreaterThan valor1 valor2}}...{{/ifGreaterThan}}
 */
Handlebars.registerHelper('ifGreaterThan', function(arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

/**
 * Formatea fecha en formato DD/MM/YYYY
 * Uso: {{formatDate fecha}}
 */
Handlebars.registerHelper('formatDate', (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
});

/**
 * Renderiza un número con separadores de miles
 * Uso: {{formatNumber 1500000}}
 */
Handlebars.registerHelper('formatNumber', (value) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('es-AR').format(value);
});

/**
 * Suma dos valores
 * Uso: {{add valor1 valor2}}
 */
Handlebars.registerHelper('add', (a, b) => {
  return (a || 0) + (b || 0);
});

/**
 * Resta dos valores
 * Uso: {{subtract valor1 valor2}}
 */
Handlebars.registerHelper('subtract', (a, b) => {
  return (a || 0) - (b || 0);
});

/**
 * OR lógico
 * Uso: {{#ifOr condicion1 condicion2}}...{{/ifOr}}
 */
Handlebars.registerHelper('ifOr', function() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  const options = arguments[arguments.length - 1];
  
  const result = args.some(arg => !!arg);
  return result ? options.fn(this) : options.inverse(this);
});

/**
 * AND lógico
 * Uso: {{#ifAnd condicion1 condicion2}}...{{/ifAnd}}
 */
Handlebars.registerHelper('ifAnd', function() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  const options = arguments[arguments.length - 1];
  
  const result = args.every(arg => !!arg);
  return result ? options.fn(this) : options.inverse(this);
});

/**
 * Incrementa un valor en 1
 * Uso: {{increment index}}
 */
Handlebars.registerHelper('increment', (value) => {
  return parseInt(value) + 1;
});

/**
 * Obtiene el valor de una propiedad anidada de forma segura
 * Uso: {{get objeto 'propiedad.anidada'}}
 */
Handlebars.registerHelper('get', (obj, path) => {
  if (!obj || !path) return '';
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return '';
    }
  }
  
  return result;
});

console.log('[Handlebars] Helpers registrados correctamente');

module.exports = Handlebars;
