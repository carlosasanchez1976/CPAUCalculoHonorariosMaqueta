// lambda.js
// Handler para AWS Lambda

const serverless = require('serverless-http');
const app = require('./app');

// Envolver la app de Express para Lambda
module.exports.handler = serverless(app, {
    // Opciones de configuración
    binary: ['image/*', 'application/pdf'], // Tipos MIME para archivos binarios
    request: (request, event, context) => {
        // Log del evento para debugging (opcional)
        if (process.env.NODE_ENV !== 'production') {
            console.log('Lambda Event:', JSON.stringify(event, null, 2));
        }
    },
    response: (response, event, context) => {
        // Modificaciones a la respuesta si es necesario (opcional)
    }
});
