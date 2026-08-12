/**
 * Configuración de Jest para tests de SPEC030
 * Proyecto: CH2026 - Sistema de Cálculo de Honorarios CPAU
 */

module.exports = {
  // Entorno de ejecución
  testEnvironment: 'node',
  
  // Directorio raíz para resolver módulos
  rootDir: '../..',
  
  // Patrón de archivos de test
  testMatch: [
    '**/Test/Spec030/**/*.test.js'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Setup global antes de tests
  setupFilesAfterEnv: ['<rootDir>/Test/Spec030/setup.js'],
  
  // Cobertura de código
  collectCoverageFrom: [
    'src/constants/errorCodes.js',
    'src/utils/ApiError.js',
    'src/middlewares/errorHandler.js',
    'src/controllers/**/*.js'
  ],
  
  coverageDirectory: '<rootDir>/Test/Spec030/coverage',
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Mostrar errores individuales
  bail: false,
  
  // Limpiar mocks entre tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
