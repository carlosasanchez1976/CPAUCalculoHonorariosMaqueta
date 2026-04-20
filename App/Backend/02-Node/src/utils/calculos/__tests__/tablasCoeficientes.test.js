/**
 * Tests unitarios para tablasCoeficientes.js
 * SPEC-CALC-002: Función calcularLimitesRangos
 * 
 * @module tablasCoeficientes.test
 * @version 1.0.0
 * @since 2026-04-20
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { calcularLimitesRangos, VALOR_K_DEFAULT } from '../tablasCoeficientes.js';

describe('calcularLimitesRangos()', () => {
  
  const VALOR_K_TEST = 574813607; // Valor K del CPAU según SPEC-CALC-002
  
  // ==========================================================================
  // TESTS DE CÁLCULO CORRECTO
  // ==========================================================================
  
  describe('Cálculos con valorK válido', () => {
    
    test('debe calcular límites correctos con valorK = 574.813.607', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      // Verificar estructura del objeto retornado
      assert.ok(limites.rangoA);
      assert.ok(limites.rangoB);
      assert.ok(limites.rangoC);
      assert.ok(limites.rangoD);
      
      // Verificar que cada rango tenga inferior y superior
      assert.ok('inferior' in limites.rangoA);
      assert.ok('superior' in limites.rangoA);
      assert.ok('inferior' in limites.rangoB);
      assert.ok('superior' in limites.rangoB);
      assert.ok('inferior' in limites.rangoC);
      assert.ok('superior' in limites.rangoC);
      assert.ok('inferior' in limites.rangoD);
      assert.ok('superior' in limites.rangoD);
    });
    
    test('debe calcular Rango A superior = 287.406.803,5 (0.5 × K)', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      const esperado = 0.5 * VALOR_K_TEST; // 287.406.803,5
      
      assert.strictEqual(limites.rangoA.inferior, 0);
      assert.strictEqual(limites.rangoA.superior, esperado);
    });
    
    test('debe calcular Rango B límites correctos (0.5K a 5K)', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      const inferiorEsperado = 0.5 * VALOR_K_TEST;  // 287.406.803,5
      const superiorEsperado = 5 * VALOR_K_TEST;    // 2.874.068.035
      
      assert.strictEqual(limites.rangoB.inferior, inferiorEsperado);
      assert.strictEqual(limites.rangoB.superior, superiorEsperado);
    });
    
    test('debe calcular Rango C límites correctos (5K a 25K)', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      const inferiorEsperado = 5 * VALOR_K_TEST;    // 2.874.068.035
      const superiorEsperado = 25 * VALOR_K_TEST;   // 14.370.340.175
      
      assert.strictEqual(limites.rangoC.inferior, inferiorEsperado);
      assert.strictEqual(limites.rangoC.superior, superiorEsperado);
    });
    
    test('debe calcular Rango D límites correctos (25K a infinito)', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      const inferiorEsperado = 25 * VALOR_K_TEST;   // 14.370.340.175
      
      assert.strictEqual(limites.rangoD.inferior, inferiorEsperado);
      assert.strictEqual(limites.rangoD.superior, Number.MAX_SAFE_INTEGER);
    });
    
  });
  
  // ==========================================================================
  // TESTS DE CONTINUIDAD ENTRE RANGOS
  // ==========================================================================
  
  describe('Continuidad entre rangos', () => {
    
    test('debe tener continuidad: Rango B inferior = Rango A superior', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      assert.strictEqual(limites.rangoB.inferior, limites.rangoA.superior);
    });
    
    test('debe tener continuidad: Rango C inferior = Rango B superior', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      assert.strictEqual(limites.rangoC.inferior, limites.rangoB.superior);
    });
    
    test('debe tener continuidad: Rango D inferior = Rango C superior', () => {
      const limites = calcularLimitesRangos(VALOR_K_TEST);
      
      assert.strictEqual(limites.rangoD.inferior, limites.rangoC.superior);
    });
    
  });
  
  // ==========================================================================
  // TESTS DE VALIDACIÓN DE PARÁMETROS
  // ==========================================================================
  
  describe('Validación de parámetros', () => {
    
    test('debe lanzar Error si valorK = 0', () => {
      assert.throws(
        () => calcularLimitesRangos(0),
        { message: 'valorK debe ser un número positivo mayor a 0' }
      );
    });
    
    test('debe lanzar Error si valorK es negativo', () => {
      assert.throws(
        () => calcularLimitesRangos(-1000),
        { message: 'valorK debe ser un número positivo mayor a 0' }
      );
    });
    
    test('debe lanzar Error si valorK es null', () => {
      assert.throws(
        () => calcularLimitesRangos(null),
        { message: 'valorK debe ser un número positivo mayor a 0' }
      );
    });
    
    test('debe lanzar Error si valorK es undefined', () => {
      assert.throws(
        () => calcularLimitesRangos(undefined),
        { message: 'valorK debe ser un número positivo mayor a 0' }
      );
    });
    
    test('debe lanzar Error si valorK es string', () => {
      assert.throws(
        () => calcularLimitesRangos('574813607'),
        { message: 'valorK debe ser un número positivo mayor a 0' }
      );
    });
    
    test('debe lanzar Error si valorK es NaN', () => {
      assert.throws(
        () => calcularLimitesRangos(NaN),
        { message: 'valorK debe ser un número positivo mayor a 0' }
      );
    });
    
  });
  
  // ==========================================================================
  // TESTS CON VALOR K DEFAULT
  // ==========================================================================
  
  describe('Integración con VALOR_K_DEFAULT', () => {
    
    test('debe funcionar correctamente con VALOR_K_DEFAULT exportado', () => {
      const limites = calcularLimitesRangos(VALOR_K_DEFAULT);
      
      assert.strictEqual(limites.rangoA.superior, 0.5 * VALOR_K_DEFAULT);
      assert.strictEqual(limites.rangoB.superior, 5 * VALOR_K_DEFAULT);
      assert.strictEqual(limites.rangoC.superior, 25 * VALOR_K_DEFAULT);
    });
    
  });
  
  // ==========================================================================
  // TESTS DE VALORES EXACTOS SEGÚN SPEC-CALC-002
  // ==========================================================================
  
  describe('Validación vs valores SPEC-CALC-002', () => {
    
    test('debe coincidir exactamente con valores de la especificación', () => {
      const limites = calcularLimitesRangos(574813607);
      
      // Valores esperados según SPEC-CALC-002 Ticket #002
      assert.strictEqual(limites.rangoA.inferior, 0);
      assert.strictEqual(limites.rangoA.superior, 287406803.5);
      
      assert.strictEqual(limites.rangoB.inferior, 287406803.5);
      assert.strictEqual(limites.rangoB.superior, 2874068035);
      
      assert.strictEqual(limites.rangoC.inferior, 2874068035);
      assert.strictEqual(limites.rangoC.superior, 14370340175);
      
      assert.strictEqual(limites.rangoD.inferior, 14370340175);
      assert.strictEqual(limites.rangoD.superior, 9007199254740991); // Number.MAX_SAFE_INTEGER
    });
    
  });
  
});
