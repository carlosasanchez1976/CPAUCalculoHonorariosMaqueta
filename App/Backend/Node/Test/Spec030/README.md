# Tests SPEC030 - Manejo de Errores en API

Suite de tests para validar la implementación de SPEC030 (Manejo de errores robusto con ApiError).

## 📋 Estructura

```
Test/Spec030/
├── jest.config.js              # Configuración de Jest
├── setup.js                    # Setup global para tests
├── package.json                # Scripts de ejecución
├── fixtures/
│   └── testData.js            # Datos de prueba
├── unit/
│   ├── ApiError.test.js       # Tests unitarios de ApiError
│   ├── errorCodes.test.js     # Tests de códigos de error
│   └── errorHandler.test.js   # Tests de middleware
└── integration/
    ├── errorHandling.test.js  # Tests de controllers
    └── environment.test.js    # Tests por NODE_ENV
```

## 🚀 Ejecución

### Ejecutar todos los tests
```bash
cd Test/Spec030
npm test
```

### Tests unitarios solamente
```bash
npm run test:unit
```

### Tests de integración solamente
```bash
npm run test:integration
```

### Con cobertura
```bash
npm run test:coverage
```

### Modo watch (desarrollo)
```bash
npm run test:watch
```

## 📊 Cobertura Esperada

- **ApiError.js:** 95%+
- **errorCodes.js:** 100%
- **errorHandler.js:** 90%+
- **Controllers:** 80%+

## ✅ Tests Implementados

### Tests Unitarios (3 archivos, ~50 tests)

#### ApiError.test.js
- Constructor con parámetros mínimos y completos
- `generateErrorId()` con formato correcto
- `toJSON()` con/sin errorDetail
- `addMetadata()` para enriquecimiento
- Static `isApiError()` y `fromError()`
- Integración con Error nativo

#### errorCodes.test.js
- Estructura inmutable (Object.freeze)
- Formato UPPERCASE para todos los códigos
- Sin códigos duplicados
- Categorías completas (validación, autenticación, recursos, DB)
- `getStatusCodeForError()` retorna códigos HTTP correctos
- Naming conventions

#### errorHandler.test.js
- `errorHandler()` maneja ApiError correctamente
- Incluye errorDetail en dev/qa
- Oculta errorDetail en production
- Convierte Error genérico a ApiError
- `notFoundHandler()` retorna 404
- `asyncHandler()` captura errores async
- Integración entre middlewares

### Tests de Integración (2 archivos, ~30 tests)

#### errorHandling.test.js
- `calculosController.calcular`: validaciones de tareaId, valorObra, tareas
- `calculosController.obtenerItems`: validación de calculoId
- `usuariosController.login`: campos requeridos, usuario inactivo
- `terminosCondicionesController.buscarVigente`: TyC no encontrado
- `adminTemplatesController.update`: validaciones de ID, HTML, tamaño
- Verificación de errorId en todos los errores
- Verificación de metadata en todos los ApiError

#### environment.test.js
- **NODE_ENV=development**: incluye errorDetail, SQL details, stack traces
- **NODE_ENV=qa**: incluye errorDetail para debugging
- **NODE_ENV=production**: 
  - NO incluye errorDetail
  - NO incluye SQL details
  - NO incluye stack traces
  - Solo retorna {errorId, code, message, timestamp}
- **Seguridad**: passwords y tokens no filtrados

## 🔧 Configuración

### jest.config.js
- Test environment: Node.js
- Timeout: 10 segundos
- Coverage threshold: 80%
- Setup: `setup.js` ejecutado antes de tests

### setup.js
- Mock de console para evitar logs
- Helpers globales: `isValidErrorId()`, `isValidISO8601()`
- NODE_ENV por defecto: 'test'

## 📝 Convenciones

### Estructura de un test
```javascript
describe('Módulo', () => {
  describe('Función específica', () => {
    test('debe hacer X cuando Y', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = ...;
      
      // Assert
      expect(result).toBe(...);
    });
  });
});
```

### Naming
- Archivos: `*.test.js`
- Suites: nombres descriptivos en español
- Tests: `debe [acción] [condición]`

## 🐛 Debugging

### Ver logs de tests
```bash
npm run test:verbose
```

### Test específico
```bash
npx jest ApiError.test.js
```

### Test con patrón
```bash
npx jest --testNamePattern="debe incluir errorDetail"
```

## 📚 Referencias

- **SPEC030:** Especificación de manejo de errores
- **Fase 1-4:** Implementación completa de infraestructura y refactorización
- **Jest Docs:** https://jestjs.io/docs/getting-started

## ✅ Criterios de Aceptación

Tests pasan cuando:
- ✅ 90%+ cobertura en archivos críticos
- ✅ Todos los tests passing sin warnings
- ✅ errorDetail oculto en producción
- ✅ errorId presente en todos los errores
- ✅ Status codes HTTP correctos (400, 404, 500, etc.)

---

**Estado:** ✅ Suite completa implementada  
**Última actualización:** 2026-08-12
