/**
 * Tests unitarios para honorariosProgresivo.js
 * SPEC-CALC-002: Sistema Progresivo de Honorarios
 * 
 * Metodología: TDD (Test-Driven Development)
 * Fase: RED - Tests escritos PRIMERO, deben FALLAR
 * 
 * @module honorariosProgresivo.test
 * @version 1.0.0
 * @since 2026-04-20
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import { calcularHonorariosProgresivo } from '../honorariosProgresivo.js';
import { VALOR_K_DEFAULT } from '../tablasCoeficientes.js';

describe('SPEC-CALC-002: Sistema Progresivo de Honorarios', () => {
  
  const VALOR_K = VALOR_K_DEFAULT; // 574.813.607
  
  // ============================================================================
  // CASO #1: MODELO 1 (SOLO RANGO A)
  // ============================================================================
  describe('Caso #1: Modelo 1 (Solo Rango A)', () => {
    
    test('debe calcular honorarios para obra de $253.800.000 (solo Rango A)', () => {
      const formData = {
        valorObra: 253800000,
        tareas: {
          obraProyecto: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      // Verificar estructura
      assert.ok(Array.isArray(resultado), 'El resultado debe ser un array');
      assert.strictEqual(resultado.length, 1, 'Debe haber 1 ítem (solo Rango A)');
      
      // Verificar ítem 1: Rango A (coef 14%)
      const item1 = resultado[0];
      assert.strictEqual(item1.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item1.descripcion, 'Rango A (coef 14%)');
      assert.strictEqual(item1.importe, 21319200, 'Importe Rango A debe ser $21.319.200');
      
      // Verificar total
      const total = resultado.reduce((sum, item) => sum + item.importe, 0);
      assert.strictEqual(total, 21319200, 'Total debe ser $21.319.200');
    });
    
  });
  
  // ============================================================================
  // CASO #2: MODELO X (RANGOS A+B)
  // ============================================================================
  describe('Caso #2: Modelo X (Rangos A+B)', () => {
    
    test('debe calcular honorarios para obra de $1.692.000.000 (Rangos A+B)', () => {
      const formData = {
        valorObra: 1692000000,
        tareas: {
          obraProyecto: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      // Verificar estructura
      assert.ok(Array.isArray(resultado), 'El resultado debe ser un array');
      assert.strictEqual(resultado.length, 3, 'Debe haber 3 ítems (Rango A + Rango B obra + Rango B K)');
      
      // Verificar ítem 1: Rango A (coef 14%)
      const item1 = resultado[0];
      assert.strictEqual(item1.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item1.descripcion, 'Rango A (coef 14%)');
      assert.strictEqual(item1.importe, 24142171, 'Importe Rango A debe ser $24.142.171');
      
      // Verificar ítem 2: Rango B (coef 8%)
      const item2 = resultado[1];
      assert.strictEqual(item2.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item2.descripcion, 'Rango B (coef 8%)');
      assert.strictEqual(item2.importe, 67420473, 'Importe Rango B obra debe ser $67.420.473');
      
      // Verificar ítem 3: Rango B (coef K 3%)
      const item3 = resultado[2];
      assert.strictEqual(item3.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item3.descripcion, 'Rango B (coef K 3%)');
      assert.strictEqual(item3.importe, 10346645, 'Importe Rango B K debe ser $10.346.645');
      
      // Verificar total
      const total = resultado.reduce((sum, item) => sum + item.importe, 0);
      assert.strictEqual(total, 101909289, 'Total debe ser $101.909.289');
    });
    
  });
  
  // ============================================================================
  // CASO #3: MODELO 2 (RANGOS A+B+C)
  // ============================================================================
  describe('Caso #3: Modelo 2 (Rangos A+B+C)', () => {
    
    test('debe calcular honorarios para obra de $4.230.000.000 (Rangos A+B+C)', () => {
      const formData = {
        valorObra: 4230000000,
        tareas: {
          obraProyecto: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      // Verificar estructura
      assert.ok(Array.isArray(resultado), 'El resultado debe ser un array');
      assert.strictEqual(resultado.length, 4, 'Debe haber 4 ítems (A + B + C obra + C K)');
      
      // Verificar ítem 1: Rango A (coef 14%)
      const item1 = resultado[0];
      assert.strictEqual(item1.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item1.descripcion, 'Rango A (coef 14%)');
      assert.strictEqual(item1.importe, 24142171, 'Importe Rango A debe ser $24.142.171');
      
      // Verificar ítem 2: Rango B (coef 8%)
      const item2 = resultado[1];
      assert.strictEqual(item2.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item2.descripcion, 'Rango B (coef 8%)');
      assert.strictEqual(item2.importe, 124159739, 'Importe Rango B debe ser $124.159.739');
      
      // Verificar ítem 3: Rango C (coef 6%)
      const item3 = resultado[2];
      assert.strictEqual(item3.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item3.descripcion, 'Rango C (coef 6%)');
      assert.strictEqual(item3.importe, 48813551, 'Importe Rango C obra debe ser $48.813.551');
      
      // Verificar ítem 4: Rango C (coef K 13%)
      const item4 = resultado[3];
      assert.strictEqual(item4.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item4.descripcion, 'Rango C (coef K 13%)');
      assert.strictEqual(item4.importe, 44744561, 'Importe Rango C K debe ser $44.744.561');
      
      // Verificar total
      const total = resultado.reduce((sum, item) => sum + item.importe, 0);
      assert.strictEqual(total, 241860022, 'Total debe ser $241.860.022');
    });
    
  });
  
  // ============================================================================
  // CASO #4: MODELO 3 (RANGOS A+B+C+D)
  // ============================================================================
  describe('Caso #4: Modelo 3 (Rangos A+B+C+D)', () => {
    
    test('debe calcular honorarios para obra de $21.150.000.000 (Rangos A+B+C+D)', () => {
      const formData = {
        valorObra: 21150000000,
        tareas: {
          obraProyecto: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      // Verificar estructura
      assert.ok(Array.isArray(resultado), 'El resultado debe ser un array');
      assert.strictEqual(resultado.length, 5, 'Debe haber 5 ítems (A + B + C + D obra + D K)');
      
      // Verificar ítem 1: Rango A (coef 14%)
      const item1 = resultado[0];
      assert.strictEqual(item1.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item1.descripcion, 'Rango A (coef 14%)');
      assert.strictEqual(item1.importe, 24142171, 'Importe Rango A debe ser $24.142.171');
      
      // Verificar ítem 2: Rango B (coef 8%)
      const item2 = resultado[1];
      assert.strictEqual(item2.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item2.descripcion, 'Rango B (coef 8%)');
      assert.strictEqual(item2.importe, 124159739, 'Importe Rango B debe ser $124.159.739');
      
      // Verificar ítem 3: Rango C (coef 6%)
      const item3 = resultado[2];
      assert.strictEqual(item3.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item3.descripcion, 'Rango C (coef 6%)');
      assert.strictEqual(item3.importe, 413865837, 'Importe Rango C debe ser $413.865.837');
      
      // Verificar ítem 4: Rango D (coef 4%)
      const item4 = resultado[3];
      assert.strictEqual(item4.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item4.descripcion, 'Rango D (coef 4%)');
      assert.strictEqual(item4.importe, 162711836, 'Importe Rango D obra debe ser $162.711.836');
      
      // Verificar ítem 5: Rango D (coef K 63%)
      const item5 = resultado[4];
      assert.strictEqual(item5.tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(item5.descripcion, 'Rango D (coef K 63%)');
      assert.strictEqual(item5.importe, 217496316, 'Importe Rango D K debe ser $217.496.316');
      
      // Verificar total
      const total = resultado.reduce((sum, item) => sum + item.importe, 0);
      assert.strictEqual(total, 942375899, 'Total debe ser $942.375.899');
    });
    
  });
  
  // ============================================================================
  // CASO #5: MÚLTIPLES TAREAS
  // ============================================================================
  describe('Caso #5: Múltiples Tareas', () => {
    
    test('debe generar ítems para múltiples tareas profesionales', () => {
      const formData = {
        valorObra: 1692000000,
        tareas: {
          obraProyecto: true,
          obraDireccion: true,
          instalacionSanitaria: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      // Verificar estructura
      assert.ok(Array.isArray(resultado), 'El resultado debe ser un array');
      
      // Debe haber ítems para las 3 tareas
      // Cada tarea genera ítems según los rangos afectados
      // obraProyecto: 3 ítems (A, B obra, B K)
      // obraDireccion: 3 ítems (A, B obra, B K)
      // instalacionSanitaria: 2 ítems (A, B) - sin coef K
      assert.ok(resultado.length >= 8, 'Debe haber al menos 8 ítems para 3 tareas');
      
      // Verificar que existen ítems de cada tarea
      const tareasEnResultado = new Set(resultado.map(item => item.tareaProfesional));
      assert.ok(tareasEnResultado.has('Proyecto de obra de arquitectura'), 'Debe incluir Proyecto de arquitectura');
      assert.ok(tareasEnResultado.has('Dirección de obra de arquitectura'), 'Debe incluir Dirección de arquitectura');
      assert.ok(tareasEnResultado.has('Instalación Sanitaria'), 'Debe incluir Instalación Sanitaria');
    });
    
    test('debe calcular correctamente con porcentajes de tarea aplicados', () => {
      const formData = {
        valorObra: 1692000000,
        tareas: {
          obraProyecto: true  // 60% según PORCENTAJES_TAREA
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      // El porcentaje de tarea debe estar aplicado en los importes
      // Para obraProyecto (60%), el total debe reflejar este porcentaje
      const total = resultado.reduce((sum, item) => sum + item.importe, 0);
      
      // Verificar que el total es consistente con aplicar 60%
      // Total sin porcentaje sería mayor, con 60% debe ser el calculado
      assert.ok(total > 0, 'Total debe ser mayor a 0');
      assert.strictEqual(total, 101909289, 'Total con porcentaje 60% debe ser $101.909.289');
    });
    
  });
  
  // ============================================================================
  // TESTS DE VALIDACIÓN
  // ============================================================================
  describe('Validaciones', () => {
    
    test('debe retornar array vacío si valorObra = 0', () => {
      const formData = {
        valorObra: 0,
        tareas: {
          obraProyecto: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      assert.ok(Array.isArray(resultado), 'Debe retornar un array');
      assert.strictEqual(resultado.length, 0, 'Array debe estar vacío para valorObra = 0');
    });
    
    test('debe retornar array vacío si valorObra es negativo', () => {
      const formData = {
        valorObra: -1000000,
        tareas: {
          obraProyecto: true
        }
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      assert.ok(Array.isArray(resultado), 'Debe retornar un array');
      assert.strictEqual(resultado.length, 0, 'Array debe estar vacío para valorObra negativo');
    });
    
    test('debe retornar array vacío si no hay tareas seleccionadas', () => {
      const formData = {
        valorObra: 1692000000,
        tareas: {}  // Sin tareas
      };
      
      const resultado = calcularHonorariosProgresivo(formData, VALOR_K);
      
      assert.ok(Array.isArray(resultado), 'Debe retornar un array');
      assert.strictEqual(resultado.length, 0, 'Array debe estar vacío sin tareas seleccionadas');
    });
    
    test('debe usar VALOR_K_DEFAULT si no se proporciona valorK', () => {
      const formData = {
        valorObra: 253800000,
        tareas: {
          obraProyecto: true
        }
      };
      
      // Llamar sin segundo parámetro
      const resultado = calcularHonorariosProgresivo(formData);
      
      assert.ok(Array.isArray(resultado), 'Debe retornar un array');
      assert.ok(resultado.length > 0, 'Debe calcular con VALOR_K_DEFAULT');
    });
    
  });
  
});
