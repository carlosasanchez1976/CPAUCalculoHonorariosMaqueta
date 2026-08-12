/**
 * Setup global para tests de SPEC030
 * Se ejecuta antes de todos los tests
 */

// Configurar entorno de test por defecto
process.env.NODE_ENV = 'test';

// Configurar timeout global
jest.setTimeout(10000);

// Mock de console para evitar logs durante tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Helper para restaurar console en tests específicos
global.restoreConsole = () => {
  global.console.log.mockRestore();
  global.console.error.mockRestore();
  global.console.warn.mockRestore();
  global.console.info.mockRestore();
  global.console.debug.mockRestore();
};

// Helper para verificar formato de errorId
global.isValidErrorId = (errorId) => {
  return /^err_\d{13}_[a-z0-9]{6}$/.test(errorId);
};

// Helper para verificar timestamp ISO 8601
global.isValidISO8601 = (timestamp) => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timestamp);
};

console.log('✅ Setup de tests SPEC030 completado');
