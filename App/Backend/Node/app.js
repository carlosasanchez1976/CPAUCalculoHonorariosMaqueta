// app.js
// Configuración de Express (separada del servidor para compatibilidad con Lambda)

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rutas privadas
const usuariosRoutes = require('./src/routes/usuarios.js');
const calculosRoutes = require('./src/routes/calculos.js');
const tareasProfesionalesRoutes = require('./src/routes/tareasProfesionales.js');
const parametrosRoutes = require('./src/routes/parametros.js');
const adminTemplatesRoutes = require('./src/routes/adminTemplates.js');
const terminosCondicionesRoutes = require('./src/routes/terminosCondiciones.js');

require('dotenv').config();

const app = express();

// ========================================
// CONFIGURACIÓN LAMBDA: Trust Proxy
// ========================================
// Necesario para Lambda/API Gateway
app.set('trust proxy', true);

// ========================================
// SEGURIDAD: CORS - Configuración por ambiente
// ========================================

// Construcción de lista de orígenes permitidos
const allowedOrigins = [];

if (process.env.FRONTEND_URL) {
    // Soportar múltiples URLs separadas por coma o pipe
    const urls = process.env.FRONTEND_URL.split(/[,|]/).map(url => url.trim());
    allowedOrigins.push(...urls);
}

// Permitir localhost en desarrollo y QA (no en producción)
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173');
}

console.log('🌐 CORS - Orígenes permitidos:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, curl, server-to-server)
        if (!origin) {
            return callback(null, true);
        }
        
        // Validar si el origen está permitido (exacto o patrón)
        const isAllowed = allowedOrigins.some(allowed => {
            // Soporte para wildcard en subdominios (*.vercel.app)
            if (allowed.includes('*')) {
                const pattern = allowed.replace(/\*/g, '.*').replace(/\./g, '\\.');
                const regex = new RegExp(`^${pattern}$`);
                return regex.test(origin);
            }
            return allowed === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`⚠️ CORS bloqueó origen: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Version'],
    exposedHeaders: ['Content-Length', 'X-Request-Id', 'Authorization'],
    maxAge: 86400
};

app.use(cors(corsOptions));

// ========================================
// SEGURIDAD: Helmet - Headers HTTP seguros
// ========================================
app.use(helmet({
    crossOriginResourcePolicy: { policy: process.env.NODE_ENV === 'development' ? 'cross-origin' : 'same-site' },
    contentSecurityPolicy: false // Deshabilitado para permitir CORS en API
}));

// ========================================
// SEGURIDAD: Rate Limiting - Anti DDoS
// ========================================
// ⚠️ Deshabilitado en Lambda (API Gateway tiene su propio rate limiting)
if (process.env.NODE_ENV !== 'qa' && process.env.NODE_ENV !== 'production') {
    const limiter = rateLimit({
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        message: 'Demasiadas peticiones desde esta IP, intente nuevamente más tarde',
        standardHeaders: true,
        legacyHeaders: false,
        // ✅ Validar trust proxy para desarrollo local
        validate: { trustProxy: false }
    });
    app.use('/api/', limiter);
    console.log('🛡️  Rate limiting habilitado');
} else {
    console.log('⚠️  Rate limiting deshabilitado (usa API Gateway throttling)');
}

// ========================================
// Body parser con límite de tamaño
// ========================================
// ✅ Middleware custom para Lambda: convertir Buffer a JSON
app.use((req, res, next) => {
    if (req.body && Buffer.isBuffer(req.body)) {
        try {
            const bodyString = req.body.toString('utf-8');
            req.body = JSON.parse(bodyString);
            console.log('✅ Body Buffer convertido a JSON:', req.body);
        } catch (e) {
            console.error('❌ Error convirtiendo Buffer a JSON:', e);
        }
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/calculos', calculosRoutes);
app.use('/api/tareas', tareasProfesionalesRoutes);
app.use('/api/tareasProfesionales', tareasProfesionalesRoutes);
app.use('/api/parametros', parametrosRoutes);
app.use('/api/admin/templates', adminTemplatesRoutes); // SPEC020-ADMIN-Template-Manager (T020-003)
app.use('/api/terminos-condiciones', terminosCondicionesRoutes); // SPEC029-CALC-Términos y condiciones (T029-008)



// ========================================
// Health Check
// ========================================
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Ruta base
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Cálculo de Honorarios CPAU funcionando',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ========================================
// Manejo de rutas no encontradas
// ========================================
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ========================================
// Manejo global de errores
// ========================================
app.use((err, req, res, next) => {
    console.error('Error global:', err.message);
    
    // No exponer detalles internos en producción
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Error interno del servidor',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Exportar la app (sin app.listen)
module.exports = app;
