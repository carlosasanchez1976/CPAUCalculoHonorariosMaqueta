/**
 * pdfService.js
 * Servicio para descargar certificados PDF desde el backend
 * SPEC: SPEC010-CALC-Entregables (T010-004)
 * 
 * @module services/pdfService
 */

import { procesarErrorApi } from '../utils/apiErrorHandler.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Descarga el PDF del certificado de honorarios desde el backend
 * @param {Object} datos - Datos del cálculo
 * @param {string} datos.tipoCalculo - Tipo de cálculo (ej: 'basico-proyecto-direccion')
 * @param {Object} datos.formData - Datos del formulario (incluye formData.calculoId para el nombre del archivo)
 * @param {Object} datos.calculationResult - Resultado del cálculo
 * @returns {Promise<Blob>} Blob del PDF
 * @throws {Error} Si el backend responde con error
 */
export async function descargarCertificadoPDF(datos) {
  try {
    console.log('📄 [PDF Export] Body request:', JSON.stringify(datos, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/calculos/exportar-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    if (!response.ok) {
      // Intentar extraer mensaje de error del backend
      const error = await response.json().catch(() => null);
      
      // Si el backend devuelve un mensaje específico, usarlo
      if (error?.error || error?.message) {
        throw new Error(error.error || error.message);
      }
      
      // Si no, usar el manejador centralizado
      throw procesarErrorApi(new Error(`HTTP ${response.status}`), response, 'al generar el PDF');
    }

    return response.blob();
  } catch (error) {
    // Si ya es un error procesado, re-lanzarlo
    if (error.type) {
      console.error('Error en descargarCertificadoPDF:', error.message, error.type);
      throw error;
    }
    
    // Si es error de red/CORS, procesarlo
    const errorProcesado = procesarErrorApi(error, null, 'al generar el PDF');
    console.error('Error en descargarCertificadoPDF:', errorProcesado.message, errorProcesado.type);
    throw errorProcesado;
  }
}
