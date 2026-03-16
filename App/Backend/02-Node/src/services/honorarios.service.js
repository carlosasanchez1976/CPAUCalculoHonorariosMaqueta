/**
 * Servicio de Cálculo de Honorarios
 * Contiene la lógica de negocio para procesar cálculos
 */

import {
  calcularHonorariosBasico,
  calcularTotalHonorarios,
  obtenerMetadataCalculo
} from '../utils/calculos/honorariosBasico.js';
import { VALOR_K_DEFAULT } from '../utils/calculos/tablasCoeficientes.js';

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

  // Preparar datos para el cálculo
  const formData = {
    valorObra: datosObra.valorObra,
    superficie: datosObra.superficie,
    tipologia: datosObra.tipologia,
    complejidad: datosObra.complejidad,
    ...tareasProfesionales
  };

  // Obtener valor K (usar el del request o default)
  const valorK = parametros?.valorK || 
                process.env.VALOR_K_DEFAULT || 
                VALOR_K_DEFAULT;

  // ========================================================================
  // EJECUTAR CÁLCULO (SERVER-SIDE - NO VISIBLE EN NAVEGADOR)
  // ========================================================================

  const detalleHonorarios = calcularHonorariosBasico(formData, valorK);
  const totalHonorarios = calcularTotalHonorarios(detalleHonorarios);
  const metadata = obtenerMetadataCalculo(formData, valorK);

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
        ...metadata,
        numeroItems: detalleHonorarios.length
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

  // Log para desarrollo
  console.log('✅ Cálculo completado:', {
    calculoId,
    tipoCalculo,
    valorObra: datosObra.valorObra,
    totalHonorarios,
    rango: metadata.rango,
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
