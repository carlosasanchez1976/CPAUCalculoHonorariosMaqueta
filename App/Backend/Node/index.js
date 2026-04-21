// index.js
// Servidor local para desarrollo (NO se usa en Lambda)

const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3501;

// Iniciar servidor solo en desarrollo local
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
