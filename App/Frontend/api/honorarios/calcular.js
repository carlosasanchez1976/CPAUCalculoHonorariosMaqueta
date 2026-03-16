/**
 * Vercel Serverless Function - Cálculo de Honorarios
 * 
 * Proyecto: CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU
 * Versión: 1.0 - Maqueta (Fase 1)
 * Endpoint: POST /api/honorarios/calcular
 * 
 * FUTURO (Fase 2): Reemplazar por backend real con:
 * - Base de datos SQL Server
 * - Stored Procedures
 * - Autenticación JWT
 * - Auditoría completa
 * 
 * IMPORTANTE: El contrato de API (request/response) permanecerá igual en Fase 2
 */

// Imports - Lógica de cálculo (solo accesible desde servidor)
import { calcularHonorariosBasico } from '../../src/utils/calculos/honorariosBasico.js';

/**
 * Handler principal de la función serverless
 * 
 * @param {Object} req - Request object de Vercel
 * @param {Object} res - Response object de Vercel
 */
export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Version');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido',
      details: {
        message: 'Solo se permiten peticiones POST',
        code: 'METHOD_NOT_ALLOWED'
      },
      version: '1.0'
    });
  }

  try {
    // Parsear request body
    const { tipoCalculo, datosProyecto, datosObra, tareasProfesionales, parametros } = req.body;

    // ========================================================================
    // VALIDACIONES SERVER-SIDE
    // ========================================================================

    // Validar que existan datos de obra
    if (!datosObra) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido faltante',
        details: {
          field: 'datosObra',
          message: 'Los datos de la obra son requeridos',
          code: 'MISSING_REQUIRED_FIELD'
        },
        version: '1.0'
      });
    }

    // Validar valor de obra
    if (!datosObra.valorObra || datosObra.valorObra <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: {
          field: 'datosObra.valorObra',
          message: 'El valor de obra debe ser mayor a 0',
          code: 'INVALID_VALUE'
        },
        version: '1.0'
      });
    }

    // Validar que existan tareas profesionales
    if (!tareasProfesionales) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido faltante',
        details: {
          field: 'tareasProfesionales',
          message: 'Debe especificar las tareas profesionales',
          code: 'MISSING_REQUIRED_FIELD'
        },
        version: '1.0'
      });
    }

    // Validar que al menos una tarea esté seleccionada
    const tareasSeleccionadas = Object.values(tareasProfesionales).some(tarea => tarea === true);
    if (!tareasSeleccionadas) {
      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        details: {
          field: 'tareasProfesionales',
          message: 'Debe seleccionar al menos una tarea profesional',
          code: 'NO_TASKS_SELECTED'
        },
        version: '1.0'
      });
    }

    // Validar tipo de cálculo
    if (tipoCalculo && tipoCalculo !== 'basico') {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: {
          field: 'tipoCalculo',
          message: `Tipo de cálculo '${tipoCalculo}' no soportado`,
          code: 'INVALID_TIPO_CALCULO'
        },
        version: '1.0'
      });
    }

    // ========================================================================
    // PREPARAR DATOS PARA CÁLCULO
    // ========================================================================

    const formData = {
      valorObra: datosObra.valorObra,
      superficie: datosObra.superficie,
      tipologia: datosObra.tipologia,
      complejidad: datosObra.complejidad,
      ...tareasProfesionales
    };

    const valorK = parametros?.valorK || 522181756.33; // Default si no se proporciona

    // ========================================================================
    // EJECUTAR CÁLCULO (SERVER-SIDE - NO VISIBLE EN NAVEGADOR)
    // ========================================================================

    const detalleHonorarios = calcularHonorariosBasico(formData, valorK);

    // Calcular total
    const totalHonorarios = detalleHonorarios.reduce(
      (sum, item) => sum + item.importe,
      0
    );

    // Determinar rango
    const rangoCostoObra = datosObra.valorObra / valorK;
    const rango = determinarRangoNombre(rangoCostoObra);

    // ========================================================================
    // CONSTRUIR RESPONSE SEGÚN CONTRATO DE API
    // ========================================================================

    const response = {
      success: true,
      data: {
        calculoId: `calc_${Date.now()}`, // HOY: timestamp, FUTURO: DB ID
        tipoCalculo: tipoCalculo || 'basico',
        fechaCalculo: new Date().toISOString(),
        resultado: {
          detalleHonorarios: detalleHonorarios,
          totalHonorarios: totalHonorarios,
          metadata: {
            rango: rango,
            valorK: valorK,
            rangoCostoObra: parseFloat(rangoCostoObra.toFixed(4)),
            cantidadTareas: detalleHonorarios.length
          }
        }
      },
      version: '1.0'
    };

    // Log exitoso (visible en Vercel logs)
    console.log(`✅ Cálculo exitoso - Rango: ${rango}, Total: ${totalHonorarios.toFixed(2)}`);

    return res.status(200).json(response);

  } catch (error) {
    // Log de error (visible en Vercel logs)
    console.error('❌ Error en cálculo de honorarios:', error);

    // Response de error
    return res.status(500).json({
      success: false,
      error: 'Error interno al calcular honorarios',
      details: {
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error inesperado en el servidor',
        code: 'INTERNAL_SERVER_ERROR'
      },
      version: '1.0'
    });
  }
}

/**
 * Determina el nombre del rango según el ratio valorObra/valorK
 * 
 * @param {number} ratio - Relación valorObra / valorK
 * @returns {string} Nombre del rango: 'A', 'B', 'C' o 'D'
 */
function determinarRangoNombre(ratio) {
  if (ratio < 0.5) return 'A';
  if (ratio < 5) return 'B';
  if (ratio < 25) return 'C';
  return 'D';
}
