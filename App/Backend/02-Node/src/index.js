/**
 * Servidor Express Principal - Backend Node.js
 * CH2026 - Sistema de Cálculo de Honorarios CPAU
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { calcularHonorariosHandler } from './handlers/honorarios.handler.js';
import { errorHandler } from './middleware/errorHandler.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Node.js funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    node: process.version
  });
});

// API v1 routes
const apiRouter = express.Router();

// POST /api/v1/honorarios/calcular
apiRouter.post('/honorarios/calcular', calcularHonorariosHandler);

// Mount API router
app.use(`/api/${API_VERSION}`, apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CH2026 Backend API',
    version: API_VERSION,
    endpoints: {
      health: '/health',
      calcular: `/api/${API_VERSION}/honorarios/calcular`
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method
  });
});

// Error handler (debe ser el último middleware)
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  CH2026 - Sistema de Cálculo de Honorarios CPAU           ║');
  console.log('║  Backend Node.js + Express                                 ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Servidor iniciado en: http://localhost:${PORT}${' '.repeat(20 - PORT.toString().length)}║`);
  console.log(`║  📡 API Endpoint: /api/${API_VERSION}/honorarios/calcular${' '.repeat(19 - API_VERSION.length)}║`);
  console.log(`║  ❤️  Health Check: /health                                  ║`);
  console.log(`║  🌍 Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(31 - (process.env.NODE_ENV || 'development').length)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
});

export default app;
