// calculos.js
const express = require('express');
const router = express.Router();
const honorariosController = require('../controllers/calculosController');
const pdfService = require('../services/pdfService');
const { verificarToken } = require('../middlewares/auth');

// Ruta pública para validación técnica desde Postman (Ticket #016)
router.post('/calcular', honorariosController.calcular);

// Rutas protegidas (requieren autenticación)
router.get('/:calculoId/items', verificarToken, honorariosController.obtenerItems);

/**
 * POST /api/calculos/exportar-pdf
 * Genera certificado PDF con Puppeteer
 * SPEC: SPEC010-CALC-Entregables (T010-003)
 */
router.post('/exportar-pdf', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { tipoCalculo, formData, calculationResult, calculationNumber } = req.body;

    // Validación de payload
    if (!formData || !calculationResult || !calculationNumber) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos: se requiere formData, calculationResult y calculationNumber'
      });
    }

    // Generar PDF
    const pdfBuffer = await pdfService.generarCertificado({
      tipoCalculo,
      formData,
      calculationResult,
      calculationNumber
    });

    const duration = Date.now() - startTime;
    console.log(`[PDF] Generado en ${duration}ms, tamaño: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    // Responder con PDF binario
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Honorarios-CPAU-${calculationNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('[PDF] Error generando certificado:', error);
    return res.status(500).json({
      success: false,
      error: 'Error generando el certificado PDF',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

module.exports = router;
