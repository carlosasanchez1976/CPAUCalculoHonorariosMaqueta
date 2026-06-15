/**
 * pdfService.js
 * Servicio para descargar certificados PDF desde el backend
 * SPEC: SPEC010-CALC-Entregables (T010-004)
 * 
 * @module services/pdfService
 */

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
      const error = await response.json().catch(() => ({ 
        error: `Error ${response.status}: ${response.statusText}` 
      }));
      throw new Error(error.error || error.message || 'Error generando el PDF');
    }

    return response.blob();
  } catch (error) {
    // Re-throw para que el componente maneje el error
    if (error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión.');
    }
    throw error;
  }
}
