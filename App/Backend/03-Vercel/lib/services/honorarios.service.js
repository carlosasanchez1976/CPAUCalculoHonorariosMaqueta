/**
 * Servicio de Cálculo de Honorarios
 * Contiene la lógica de negocio para procesar cálculos
 * 
 * SPEC-CALC-002: Sistema Progresivo de Honorarios
 * @version 2.0.0 - Actualizado para usar sistema progresivo
 */

import { calcularHonorariosProgresivo } from '../utils/calculos/honorariosProgresivo.js';
import { VALOR_K_DEFAULT, calcularLimitesRangos } from '../utils/calculos/tablasCoeficientes.js';

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Determina el rango de costo de obra según la relación valorObra/valorK
 * @private
 * @param {number} coeficienteK - Relación valorObra / valorK
 * @returns {string} 'A' | 'B' | 'C' | 'D'
 */
function determinarRango(coeficienteK) {
  if (coeficienteK < 0.5) return 'A';
  if (coeficienteK < 5) return 'B';
  if (coeficienteK < 25) return 'C';
  return 'D';
}

/**
 * Extrae los rangos afectados del detalle de honorarios
 * @private
 * @param {Array<Object>} detalleHonorarios - Ítems de honorarios
 * @returns {Array<string>} Rangos únicos presentes (ej: ['A', 'B'])
 */
function extraerRangosAfectados(detalleHonorarios) {
  const rangos = new Set();
  
  for (const item of detalleHonorarios) {
    // Extraer rango de la descripción (formato: "Rango X (coef ...)")
    const match = item.descripcion.match(/Rango ([A-D])/);
    if (match) {
      rangos.add(match[1]);
    }
  }
  
  // Retornar ordenado alfabéticamente
  return Array.from(rangos).sort();
}

/**
 * Servicio principal de cálculo de honorarios
 * @param {Object} datosCompletos - Datos completos del wizard
 * @returns {Promise<Object>} Resultado del cálculo con estructura estándar
 */
export async function calcularHonorariosService(datosCompletos) {
  const {
    tipoCalculo,
    datosProyecto,
    datosObra,
    tareasProfesionales,
    parametros
  } = datosCompletos;

  // Preparar datos para el cálculo progresivo
  const formData = {
    valorObra: datosObra.valorObra,
    superficie: datosObra.superficie,
    tipologia: datosObra.tipologia,
    complejidad: datosObra.complejidad,
    tareas: tareasProfesionales  // Sistema progresivo usa objeto 'tareas'
  };

  // Obtener valor K (usar el del request o default)
  const valorK = parametros?.valorK || 
                process.env.VALOR_K_DEFAULT || 
                VALOR_K_DEFAULT;

  // ========================================================================
  // EJECUTAR CÁLCULO PROGRESIVO (SERVER-SIDE - NO VISIBLE EN NAVEGADOR)
  // ========================================================================

  // Calcular honorarios con sistema progresivo (SPEC-CALC-002)
  const detalleHonorarios = calcularHonorariosProgresivo(formData, valorK);
  
  // Calcular total
  const totalHonorarios = detalleHonorarios.reduce(
    (sum, item) => sum + item.importe, 
    0
  );
  
  // Calcular metadata ampliada
  const coeficienteK = datosObra.valorObra / valorK;
  const rangoFinal = determinarRango(coeficienteK);
  const rangosAfectados = extraerRangosAfectados(detalleHonorarios);
  const limitesRangos = calcularLimitesRangos(valorK);

  // ========================================================================
  // PREPARAR RESPONSE
  // ========================================================================

  // Generar ID único de cálculo (temporal, en Fase 2 será de base de datos)
  const calculoId = `calc_${Date.now()}`;
  const fechaCalculo = new Date().toISOString();

  const resultado = {
    calculoId,
    tipoCalculo,
    fechaCalculo,
    resultado: {
      detalleHonorarios,
      totalHonorarios,
      metadata: {
        valorK,
        coeficienteK: parseFloat(coeficienteK.toFixed(4)),  // Redondear para legibilidad
        rangoFinal,
        rangosAfectados,
        numeroItems: detalleHonorarios.length,
        limitesRangos: {
          rangoA: {
            inferior: limitesRangos.rangoA.inferior,
            superior: Math.round(limitesRangos.rangoA.superior)
          },
          rangoB: {
            inferior: Math.round(limitesRangos.rangoB.inferior),
            superior: Math.round(limitesRangos.rangoB.superior)
          },
          rangoC: {
            inferior: Math.round(limitesRangos.rangoC.inferior),
            superior: Math.round(limitesRangos.rangoC.superior)
          },
          rangoD: {
            inferior: Math.round(limitesRangos.rangoD.inferior),
            superior: limitesRangos.rangoD.superior  // MAX_SAFE_INTEGER, no redondear
          }
        }
      }
    }
  };

  // Agregar datos del proyecto si existen
  if (datosProyecto) {
    resultado.datosProyecto = {
      nombre: datosProyecto.nombre,
      ubicacion: datosProyecto.ubicacion,
      cliente: datosProyecto.cliente
    };
  }

  // Log para desarrollo (sistema progresivo)
  console.log('✅ Cálculo progresivo completado:', {
    calculoId,
    tipoCalculo,
    valorObra: datosObra.valorObra,
    totalHonorarios,
    coeficienteK: coeficienteK.toFixed(4),
    rangoFinal,
    rangosAfectados: rangosAfectados.join('+'),
    numeroItems: detalleHonorarios.length
  });

  return resultado;
}

/**
 * Servicio para obtener valor K actual
 * En Fase 2, esto consultará la base de datos
 * @returns {Promise<Object>} Valor K vigente
 */
export async function obtenerValorKService() {
  return {
    valorK: parseFloat(process.env.VALOR_K_DEFAULT || VALOR_K_DEFAULT),
    vigenciaDesde: '2026-01-01',
    vigenciaHasta: null,
    descripcion: 'Valor K para cálculo de honorarios CPAU'
  };
}
