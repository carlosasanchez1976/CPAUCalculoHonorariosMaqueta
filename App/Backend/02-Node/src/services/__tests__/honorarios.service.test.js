/**
 * Tests de Integración - Servicio de Honorarios
 * SPEC-CALC-002: Sistema Progresivo
 * 
 * Verifica la integración completa del servicio con el sistema progresivo
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calcularHonorariosService } from '../honorarios.service.js';

const VALOR_K = 574813607;

describe('SPEC-CALC-002: Integración API - Sistema Progresivo', () => {
  
  describe('Caso #1: Request válido - Modelo X (Rangos A+B)', () => {
    
    it('debe retornar response 200 con estructura completa', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosProyecto: {
          nombre: 'Edificio Ejemplo',
          ubicacion: 'Buenos Aires',
          cliente: 'Cliente Test'
        },
        datosObra: {
          valorObra: 1692000000,
          superficie: 500,
          tipologia: 'residencial',
          complejidad: 'media'
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      
      // Verificar estructura básica
      assert.ok(resultado.calculoId, 'Debe tener calculoId');
      assert.strictEqual(resultado.tipoCalculo, 'basico', 'Debe ser tipo basico');
      assert.ok(resultado.fechaCalculo, 'Debe tener fechaCalculo');
      
      // Verificar resultado
      assert.ok(resultado.resultado, 'Debe tener objeto resultado');
      assert.ok(Array.isArray(resultado.resultado.detalleHonorarios), 'detalleHonorarios debe ser array');
      assert.ok(resultado.resultado.totalHonorarios > 0, 'totalHonorarios debe ser > 0');
      assert.ok(resultado.resultado.metadata, 'Debe tener metadata');
    });
    
    it('debe incluir metadata ampliada (coeficienteK, rangoFinal, rangosAfectados)', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500,
          tipologia: 'residencial',
          complejidad: 'media'
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { metadata } = resultado.resultado;
      
      // Verificar campos de metadata ampliada
      assert.strictEqual(metadata.valorK, VALOR_K, 'Debe incluir valorK');
      assert.ok(metadata.coeficienteK > 0, 'Debe incluir coeficienteK');
      assert.strictEqual(typeof metadata.coeficienteK, 'number', 'coeficienteK debe ser número');
      
      assert.strictEqual(metadata.rangoFinal, 'B', 'Para valorObra=1.692B, rangoFinal debe ser B');
      
      assert.ok(Array.isArray(metadata.rangosAfectados), 'rangosAfectados debe ser array');
      assert.deepStrictEqual(metadata.rangosAfectados, ['A', 'B'], 'Debe afectar rangos A y B');
      
      assert.ok(metadata.numeroItems > 0, 'Debe tener numeroItems');
      assert.ok(metadata.limitesRangos, 'Debe incluir limitesRangos');
    });
    
    it('debe incluir limitesRangos con 4 rangos (A, B, C, D)', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { limitesRangos } = resultado.resultado.metadata;
      
      // Verificar estructura de límites
      assert.ok(limitesRangos.rangoA, 'Debe tener rangoA');
      assert.ok(limitesRangos.rangoB, 'Debe tener rangoB');
      assert.ok(limitesRangos.rangoC, 'Debe tener rangoC');
      assert.ok(limitesRangos.rangoD, 'Debe tener rangoD');
      
      // Verificar que cada rango tiene inferior y superior
      for (const rango of ['rangoA', 'rangoB', 'rangoC', 'rangoD']) {
        assert.ok(typeof limitesRangos[rango].inferior === 'number', `${rango} debe tener inferior numérico`);
        assert.ok(typeof limitesRangos[rango].superior === 'number', `${rango} debe tener superior numérico`);
      }
      
      // Verificar valores específicos con valorK = 574.813.607
      assert.strictEqual(limitesRangos.rangoA.inferior, 0, 'Rango A inferior = 0');
      assert.strictEqual(limitesRangos.rangoA.superior, 287406804, 'Rango A superior = 287.406.804 (0.5K redondeado)');
    });
    
    it('debe generar múltiples ítems por tarea (sistema progresivo)', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { detalleHonorarios } = resultado.resultado;
      
      // Para Modelo X (Rangos A+B), debe haber 3 ítems:
      // 1. Rango A (coef obra)
      // 2. Rango B (coef obra)
      // 3. Rango B (coef K)
      assert.strictEqual(detalleHonorarios.length, 3, 'Debe generar 3 ítems para Modelo X');
      
      // Verificar que todos tienen la misma tarea
      assert.strictEqual(detalleHonorarios[0].tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(detalleHonorarios[1].tareaProfesional, 'Proyecto de obra de arquitectura');
      assert.strictEqual(detalleHonorarios[2].tareaProfesional, 'Proyecto de obra de arquitectura');
      
      // Verificar que las descripciones mencionan rangos
      assert.ok(detalleHonorarios[0].descripcion.includes('Rango A'), 'Primer ítem debe ser Rango A');
      assert.ok(detalleHonorarios[1].descripcion.includes('Rango B'), 'Segundo ítem debe ser Rango B');
      assert.ok(detalleHonorarios[2].descripcion.includes('Rango B'), 'Tercer ítem debe ser Rango B');
    });
    
    it('debe calcular totales correctos según SPEC (Modelo X = $101.909.289)', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { totalHonorarios } = resultado.resultado;
      
      // Verificar total según SPEC-CALC-002 Modelo X
      assert.strictEqual(totalHonorarios, 101909289, 'Total debe ser $101.909.289');
    });
  });
  
  describe('Caso #2: Múltiples rangos - Modelo 3 (Rangos A+B+C+D)', () => {
    
    it('debe calcular correctamente obra que atraviesa 4 rangos', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 21150000000,  // $21.150M
          superficie: 10000
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { detalleHonorarios, metadata } = resultado.resultado;
      
      // Verificar rango final
      assert.strictEqual(metadata.rangoFinal, 'D', 'Rango final debe ser D');
      
      // Verificar rangos afectados
      assert.deepStrictEqual(metadata.rangosAfectados, ['A', 'B', 'C', 'D'], 'Debe afectar todos los rangos');
      
      // Verificar número de ítems (5: A obra, B obra, B K, C obra, C K, D obra, D K)
      // Nota: Verificar según implementación real
      assert.ok(detalleHonorarios.length === 5, 'Debe generar 5 ítems para Modelo 3');
    });
  });
  
  describe('Caso #3: Múltiples tareas profesionales', () => {
    
    it('debe procesar múltiples tareas correctamente', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true,
          obraDireccion: true,
          instalacionSanitaria: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { detalleHonorarios } = resultado.resultado;
      
      // Debe tener ítems para las 3 tareas
      const tareasEncontradas = new Set(
        detalleHonorarios.map(item => item.tareaProfesional)
      );
      
      assert.ok(tareasEncontradas.has('Proyecto de obra de arquitectura'), 'Debe incluir Proyecto');
      assert.ok(tareasEncontradas.has('Dirección de obra de arquitectura'), 'Debe incluir Dirección');
      assert.ok(tareasEncontradas.has('Instalación Sanitaria'), 'Debe incluir Sanitaria');
      
      // Verificar que hay más ítems que una sola tarea
      assert.ok(detalleHonorarios.length > 3, 'Debe generar múltiples ítems (sistema progresivo)');
    });
  });
  
  describe('Caso #4: Validación de parámetros', () => {
    
    it('debe usar VALOR_K_DEFAULT si no se proporciona', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {}  // Sin valorK
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      const { metadata } = resultado.resultado;
      
      // Debe usar el valor K por defecto
      assert.ok(metadata.valorK > 0, 'Debe tener valorK');
      assert.ok(metadata.coeficienteK > 0, 'Debe calcular coeficienteK');
    });
  });
  
  describe('Caso #5: Datos del proyecto opcionales', () => {
    
    it('debe incluir datosProyecto si se proporcionan', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosProyecto: {
          nombre: 'Torre Ejemplo',
          ubicacion: 'CABA',
          cliente: 'Cliente XYZ'
        },
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      
      assert.ok(resultado.datosProyecto, 'Debe incluir datosProyecto');
      assert.strictEqual(resultado.datosProyecto.nombre, 'Torre Ejemplo');
      assert.strictEqual(resultado.datosProyecto.ubicacion, 'CABA');
      assert.strictEqual(resultado.datosProyecto.cliente, 'Cliente XYZ');
    });
    
    it('debe funcionar sin datosProyecto', async () => {
      const datosCompletos = {
        tipoCalculo: 'basico',
        datosObra: {
          valorObra: 1692000000,
          superficie: 500
        },
        tareasProfesionales: {
          obraProyecto: true
        },
        parametros: {
          valorK: VALOR_K
        }
      };
      
      const resultado = await calcularHonorariosService(datosCompletos);
      
      // No debe fallar
      assert.ok(resultado.calculoId, 'Debe generar resultado válido sin datosProyecto');
    });
  });
});
