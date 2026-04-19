/**
 * Tests unitarios para honorariosBasico.js
 * SPEC: SPEC-CALC-001 - Coeficientes Diferenciados por Instalación
 * Metodología: Test-Driven Development (TDD)
 * 
 * FASE: RED - Estos tests deben FALLAR antes de implementar cambios
 */

import { describe, test } from 'node:test';
import assert from 'node:assert';
import {
  calcularHonorariosBasico,
  calcularTotalHonorarios,
  obtenerMetadataCalculo
} from '../honorariosBasico.js';

describe('SPEC-CALC-001: Coeficientes Diferenciados por Instalación', () => {
  
  const VALOR_K = 522181756.33;
  
  // ========================================================================
  // CASO DE PRUEBA #1: Sanitaria + Eléctrica (Rango A)
  // ========================================================================
  describe('Caso #1: Sanitaria + Eléctrica - Rango A', () => {
    test('debe usar COEFICIENTES_SANITARIA_ELECTRICA para ambas tareas', () => {
      const formData = {
        valorObra: 100000000,  // $100M → Rango A
        instalacionSanitaria: true,
        instalacionElectrica: true
      };
      
      const resultado = calcularHonorariosBasico(formData, VALOR_K);
      
      // Validar número de items
      assert.strictEqual(resultado.length, 2, 'Debe haber 2 items');
      
      // Validar Sanitaria
      const itemSanitaria = resultado.find(
        item => item.tareaProfesional === 'Proyecto de instalación sanitaria'
      );
      assert.ok(itemSanitaria, 'Debe existir item de Sanitaria');
      assert.strictEqual(itemSanitaria.importe, 400000, 'Importe Sanitaria debe ser 400,000 (0.0040 * 100M)');
      assert.ok(itemSanitaria.descripcion.match(/0\.4(0)?%/), 'Descripción debe contener 0.4% o 0.40%');
      
      // Validar Eléctrica
      const itemElectrica = resultado.find(
        item => item.tareaProfesional === 'Proyecto de instalación eléctrica'
      );
      assert.ok(itemElectrica, 'Debe existir item de Eléctrica');
      assert.strictEqual(itemElectrica.importe, 400000, 'Importe Eléctrica debe ser 400,000 (0.0040 * 100M)');
      assert.ok(itemElectrica.descripcion.match(/0\.4(0)?%/), 'Descripción debe contener 0.4% o 0.40%');
      
      // Validar que ambas usan el mismo coeficiente
      assert.strictEqual(itemSanitaria.importe, itemElectrica.importe, 'Sanitaria y Eléctrica deben tener el mismo importe');
      
      // Validar total
      const total = calcularTotalHonorarios(resultado);
      assert.strictEqual(total, 800000, 'Total debe ser 800,000');
    });
  });
  
  // ========================================================================
  // CASO DE PRUEBA #2: Todas las Instalaciones (Rango B)
  // ========================================================================
  describe('Caso #2: Todas las Instalaciones - Rango B', () => {
    test('debe usar coeficientes diferenciados por tipo de instalación', () => {
      const formData = {
        valorObra: 2000000000,  // $2,000M → Rango B
        instalacionSanitaria: true,
        instalacionElectrica: true,
        instalacionContraIncendio: true,
        instalacionTermomecanica: true
      };
      
      const resultado = calcularHonorariosBasico(formData, VALOR_K);
      
      // Validar número de items
      assert.strictEqual(resultado.length, 4, 'Debe haber 4 items');
      
      // Validar Sanitaria (0.0014)
      const itemSanitaria = resultado.find(
        item => item.tareaProfesional === 'Proyecto de instalación sanitaria'
      );
      assert.strictEqual(itemSanitaria.importe, 2800000, 'Importe Sanitaria debe ser 2,800,000 (0.0014 * 2,000M)');
      assert.ok(itemSanitaria.descripcion.includes('0.14%'), 'Descripción Sanitaria debe contener 0.14%');
      
      // Validar Eléctrica (0.0014)
      const itemElectrica = resultado.find(
        item => item.tareaProfesional === 'Proyecto de instalación eléctrica'
      );
      assert.strictEqual(itemElectrica.importe, 2800000, 'Importe Eléctrica debe ser 2,800,000 (0.0014 * 2,000M)');
      assert.ok(itemElectrica.descripcion.includes('0.14%'), 'Descripción Eléctrica debe contener 0.14%');
      
      // Validar Incendio (0.0007)
      const itemIncendio = resultado.find(
        item => item.tareaProfesional === 'Proyecto de instalación contra incendios'
      );
      assert.strictEqual(itemIncendio.importe, 1400000, 'Importe Incendio debe ser 1,400,000 (0.0007 * 2,000M)');
      assert.ok(itemIncendio.descripcion.includes('0.07%'), 'Descripción Incendio debe contener 0.07%');
      
      // Validar Termomecánica (0.0007)
      const itemTermomecanica = resultado.find(
        item => item.tareaProfesional === 'Proyecto de instalación termomecánica'
      );
      assert.strictEqual(itemTermomecanica.importe, 1400000, 'Importe Termomecánica debe ser 1,400,000 (0.0007 * 2,000M)');
      assert.ok(itemTermomecanica.descripcion.includes('0.07%'), 'Descripción Termomecánica debe contener 0.07%');
      
      // Validar relaciones entre coeficientes
      assert.strictEqual(itemSanitaria.importe, itemElectrica.importe, 'Sanitaria y Eléctrica deben tener el mismo importe');
      assert.strictEqual(itemIncendio.importe, itemTermomecanica.importe, 'Incendio y Termomecánica deben tener el mismo importe');
      assert.ok(itemSanitaria.importe > itemIncendio.importe, 'Sanitaria debe ser mayor que Incendio');
      
      // Validar total
      const total = calcularTotalHonorarios(resultado);
      assert.strictEqual(total, 8400000, 'Total debe ser 8,400,000');
    });
  });
  
  // ========================================================================
  // CASO DE PRUEBA #3: Solo Incendio (Rango D)
  // ========================================================================
  describe('Caso #3: Solo Incendio - Rango D', () => {
    test('debe usar COEFICIENTES_INCENDIO para rango D', () => {
      const formData = {
        valorObra: 20000000000,  // $20,000M → Rango D
        instalacionContraIncendio: true
      };
      
      const resultado = calcularHonorariosBasico(formData, VALOR_K);
      
      // Validar número de items
      assert.strictEqual(resultado.length, 1, 'Debe haber 1 item');
      
      // Validar Incendio
      const itemIncendio = resultado[0];
      assert.strictEqual(itemIncendio.tareaProfesional, 'Proyecto de instalación contra incendios');
      assert.strictEqual(itemIncendio.importe, 5000000, 'Importe debe ser 5,000,000 (0.00025 * 20,000M)');
      assert.ok(itemIncendio.descripcion.match(/0\.0(2|3)5?%/), 'Descripción debe contener porcentaje aproximado (0.025% o 0.03% por redondeo)');
      
      // Validar metadata
      const metadata = obtenerMetadataCalculo(formData, VALOR_K);
      assert.strictEqual(metadata.rango, 'D', 'Rango debe ser D');
    });
  });
  
  // ========================================================================
  // TESTS DE REGRESIÓN: Proyecto/Dirección/Estructuras NO CAMBIAN
  // ========================================================================
  describe('Tests de Regresión: Otras tareas sin cambios', () => {
    test('Proyecto y Dirección de Obra deben mantener coeficientes anteriores', () => {
      const formData = {
        valorObra: 100000000,
        obraProyecto: true,
        obraDireccion: true
      };
      
      const resultado = calcularHonorariosBasico(formData, VALOR_K);
      
      // Validar que existen
      const itemProyecto = resultado.find(
        item => item.tareaProfesional === 'Proyecto de Obra'
      );
      const itemDireccion = resultado.find(
        item => item.tareaProfesional === 'Dirección de Obra'
      );
      
      assert.ok(itemProyecto, 'Debe existir item de Proyecto de Obra');
      assert.ok(itemDireccion, 'Debe existir item de Dirección de Obra');
      
      // Validar que usan COEFICIENTES_PROYECTO_DIRECCION (0.14 para Rango A)
      // Proyecto = 60%, Dirección = 40%
      assert.ok(Math.abs(itemProyecto.importe - 8400000) < 1, 'Importe Proyecto debe ser aproximadamente 8,400,000 (0.14 * 100M * 0.6)');
      assert.ok(Math.abs(itemDireccion.importe - 5600000) < 1, 'Importe Dirección debe ser aproximadamente 5,600,000 (0.14 * 100M * 0.4)');
    });
    
    test('Proyecto de Estructuras debe mantener coeficientes anteriores', () => {
      const formData = {
        valorObra: 100000000,
        proyectoEstructuras: true
      };
      
      const resultado = calcularHonorariosBasico(formData, VALOR_K);
      
      const itemEstructuras = resultado.find(
        item => item.tareaProfesional === 'Proyecto de estructuras'
      );
      
      assert.ok(itemEstructuras, 'Debe existir item de Estructuras');
      // Estructuras Rango A: 0.0060
      assert.strictEqual(itemEstructuras.importe, 600000, 'Importe debe ser 600,000 (0.0060 * 100M)');
    });
    
    test('Cálculo mixto: Proyecto + Estructuras (sin instalaciones) debe ser idéntico', () => {
      const formData = {
        valorObra: 100000000,  // Cambiado de 500M a 100M para asegurar Rango A
        obraProyecto: true,
        proyectoEstructuras: true
      };
      
      const resultado = calcularHonorariosBasico(formData, VALOR_K);
      const total = calcularTotalHonorarios(resultado);
      
      // Este total debe ser EXACTAMENTE igual al cálculo con versión anterior
      // Proyecto Rango A: 0.14 * 100M * 0.6 = 8.4M
      // Estructuras Rango A: 0.0060 * 100M = 0.6M
      // Total: 9.0M
      assert.ok(Math.abs(total - 9000000) < 1, 'Total debe ser aproximadamente 9,000,000');
    });
  });
  
  // ========================================================================
  // TESTS DE VALIDACIÓN DE COEFICIENTES
  // ========================================================================
  describe('Validación de coeficientes por rango', () => {
    test('Sanitaria/Eléctrica - Todos los rangos', () => {
      const rangos = [
        { valorObra: 100000000, rango: 'A', coef: 0.0040 },
        { valorObra: 2000000000, rango: 'B', coef: 0.0014 },
        { valorObra: 10000000000, rango: 'C', coef: 0.0012 },
        { valorObra: 20000000000, rango: 'D', coef: 0.0005 }
      ];
      
      rangos.forEach(({ valorObra, rango, coef }) => {
        const formData = {
          valorObra,
          instalacionSanitaria: true
        };
        
        const resultado = calcularHonorariosBasico(formData, VALOR_K);
        const item = resultado[0];
        const importeEsperado = coef * valorObra;
        
        assert.strictEqual(item.importe, importeEsperado, `Rango ${rango}: Importe debe ser ${importeEsperado}`);
        
        const metadata = obtenerMetadataCalculo(formData, VALOR_K);
        assert.strictEqual(metadata.rango, rango, `Metadata rango debe ser ${rango}`);
      });
    });
    
    test('Incendio/Termomecánica - Todos los rangos', () => {
      const rangos = [
        { valorObra: 100000000, rango: 'A', coef: 0.0010 },
        { valorObra: 2000000000, rango: 'B', coef: 0.0007 },
        { valorObra: 10000000000, rango: 'C', coef: 0.0006 },
        { valorObra: 20000000000, rango: 'D', coef: 0.00025 }
      ];
      
      rangos.forEach(({ valorObra, rango, coef }) => {
        const formData = {
          valorObra,
          instalacionContraIncendio: true
        };
        
        const resultado = calcularHonorariosBasico(formData, VALOR_K);
        const item = resultado[0];
        const importeEsperado = coef * valorObra;
        
        assert.strictEqual(item.importe, importeEsperado, `Rango ${rango}: Importe debe ser ${importeEsperado}`);
        
        const metadata = obtenerMetadataCalculo(formData, VALOR_K);
        assert.strictEqual(metadata.rango, rango, `Metadata rango debe ser ${rango}`);
      });
    });
  });
});
