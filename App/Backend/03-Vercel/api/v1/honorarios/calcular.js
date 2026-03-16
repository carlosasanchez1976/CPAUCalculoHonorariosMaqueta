/**
 * Vercel Serverless Function - Calcular Honorarios
 * Endpoint: POST /api/v1/honorarios/calcular
 * 
 * Este archivo adapta el handler de Express al formato de Vercel Functions
 */

import { calcularHonorariosService } from '../../../lib/services/honorarios.service.js';

/**
 * Vercel Serverless Function Handler
 * @param {VercelRequest} req - Request object
 * @param {VercelResponse} res - Response object
 */
export default async function handler(req, res) {
  // ============================================================================
  // CORS Headers
  // ============================================================================
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5173',
    'https://ch2026-frontend.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // ============================================================================
  // OPTIONS (Preflight)
  // ============================================================================
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================================================
  // POST Handler
  // ============================================================================
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido',
      message: 'Solo se acepta POST',
      method: req.method
    });
  }

  try {
    // Validar body
    const datosCompletos = req.body;

    if (!datosCompletos || typeof datosCompletos !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'El body debe contener los datos del cálculo'
      });
    }

    // Validar campos requeridos
    const { tipoCalculo, datosObra, tareasProfesionales } = datosCompletos;

    if (!tipoCalculo) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: tipoCalculo'
      });
    }

    if (!datosObra || !datosObra.valorObra) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: datosObra.valorObra'
      });
    }

    if (!tareasProfesionales) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: tareasProfesionales'
      });
    }

    // ========================================================================
    // EJECUTAR CÁLCULO
    // ========================================================================
    const resultado = await calcularHonorariosService(datosCompletos);

    // ========================================================================
    // SUCCESS RESPONSE
    // ========================================================================
    return res.status(200).json({
      success: true,
      data: resultado
    });

  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    console.error('Error en calcular honorarios:', error);

    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Ocurrió un error procesando el cálculo'
    });
  }
}
