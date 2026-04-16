# CH2026 Backend API - AWS Lambda + Node.js + MySQL

Backend API para el Sistema de Gestión de Cálculo de Honorarios CPAU.

## 📋 Descripción

API RESTful desarrollada con Node.js y Express, diseñada para ejecutarse en AWS Lambda con persistencia en MySQL (AWS RDS). Calcula honorarios profesionales según legislación CPAU y guarda los resultados en base de datos.

## 🏗️ Stack Tecnológico

- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: MySQL 8.0 (AWS RDS)
- **Driver DB**: mysql2 (con connection pooling)
- **Deployment**: AWS Lambda via Serverless Framework
- **Secrets**: AWS Secrets Manager
- **Logging**: AWS CloudWatch
- **Testing**: Jest + Supertest

## 📁 Estructura del Proyecto

```
App/Backend/Node/
├── src/
│   ├── config/
│   │   └── database.js           # Configuración de conexión MySQL
│   ├── controllers/
│   │   └── honorarios.controller.js  # Controllers HTTP
│   ├── middlewares/
│   │   ├── errorHandler.js       # Manejo global de errores
│   │   └── validator.js          # Validación de requests
│   ├── models/
│   │   └── calculo.model.js      # Repository pattern
│   ├── routes/
│   │   └── honorarios.routes.js  # Definición de rutas
│   ├── services/
│   │   └── honorarios.service.js # Lógica de negocio
│   └── utils/
│       └── calculos/
│           ├── honorariosBasico.js      # Algoritmo de cálculo
│           └── tablasCoeficientes.js    # Coeficientes CPAU
├── __tests__/                    # Tests unitarios e integración
├── scripts/                      # Scripts de deployment
├── .env                          # Variables de entorno (no commitear)
├── .env.example                  # Template de variables
├── .gitignore
├── app.js                        # Express app principal
├── index.js                      # Servidor local
├── lambda.js                     # Handler para AWS Lambda
├── package.json
├── serverless.yml                # Configuración Serverless Framework
└── README.md
```

## 🚀 Setup Local

### Pre-requisitos

- Node.js >= 18.0.0
- MySQL 8.0+
- npm o yarn
- Git

### Instalación

1. **Clonar el repositorio** (si aplica)
```bash
cd App/Backend/Node
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar template
cp .env.example .env

# Editar .env con tus credenciales locales
# DB_HOST=localhost
# DB_USER=CPAU_dev
# DB_PASSWORD=cpau_dev!2026
# DB_NAME=cpau_ch_dev
```

4. **Verificar base de datos**
```bash
# Asegurarse que MySQL está corriendo
# Verificar que el schema cpau_ch_dev existe
mysql -u CPAU_dev -p -e "SHOW DATABASES LIKE 'cpau_ch_dev';"
```

5. **Iniciar servidor local**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## 🧪 Testing

### Ejecutar tests
```bash
# Todos los tests
npm test

# Tests en watch mode
npm run test:watch

# Tests con cobertura
npm run test:coverage
```

### Estructura de tests
```
__tests__/
├── models/
│   └── calculo.model.test.js
├── services/
│   └── honorarios.service.test.js
├── controllers/
│   └── honorarios.controller.test.js
├── middlewares/
│   ├── validator.test.js
│   └── errorHandler.test.js
├── routes/
│   └── honorarios.routes.test.js
├── integration/
│   └── honorarios.test.js
└── app.test.js
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Calcular Honorarios
```
POST /api/v1/honorarios/calcular
Content-Type: application/json

{
  "tipoCalculo": "basico",
  "datosProyecto": {
    "nombre": "Proyecto Test",
    "ubicacion": "CABA",
    "cliente": "Cliente Test"
  },
  "datosObra": {
    "valorObra": 50000000,
    "superficie": 250,
    "tipologia": "Vivienda unifamiliar",
    "complejidad": "media"
  },
  "tareasProfesionales": {
    "obraProyecto": true,
    "obraDireccion": true,
    "instalacionSanitaria": false,
    "instalacionElectrica": false,
    "instalacionContraIncendio": false,
    "instalacionTermomecanica": false,
    "proyectoEstructuras": false
  },
  "parametros": {
    "valorK": 522181756.33
  }
}
```

### Obtener Items de un Cálculo
```
GET /api/v1/honorarios/:calculoId/items
```

## 🔧 Comandos Disponibles

### Desarrollo
```bash
npm run dev          # Iniciar servidor con nodemon (auto-reload)
npm start            # Iniciar servidor en producción
```

### Testing
```bash
npm test             # Ejecutar todos los tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con reporte de cobertura
```

### Deployment
```bash
npm run deploy:dev   # Deploy a ambiente DEV (AWS Lambda)
npm run deploy:qa    # Deploy a ambiente QA (AWS Lambda)
```

### Logs
```bash
npm run logs:dev     # Ver logs de Lambda DEV (tail)
npm run logs:qa      # Ver logs de Lambda QA (tail)
```

### Serverless
```bash
npm run invoke:local # Invocar Lambda localmente
```

## 🌍 Ambientes

### DEV (Local)
- Base de datos: MySQL localhost
- Puerto: 3000
- Logs: Console
- Secrets: Variables de entorno (.env)

### QA (AWS)
- Base de datos: AWS RDS (cpau_ch_qa)
- Runtime: AWS Lambda
- Logs: CloudWatch
- Secrets: AWS Secrets Manager

### PROD (AWS) - Futuro
- Base de datos: AWS RDS (cpau_ch_prod)
- Runtime: AWS Lambda
- Logs: CloudWatch
- Secrets: AWS Secrets Manager

## 🔐 Variables de Entorno

Ver `.env.example` para la lista completa de variables.

### Variables Críticas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Ambiente de ejecución | development, qa, production |
| `DB_HOST` | Host de MySQL | localhost, rds-endpoint |
| `DB_USER` | Usuario de MySQL | CPAU_dev |
| `DB_PASSWORD` | Contraseña de MySQL | ********** |
| `DB_NAME` | Nombre de la base de datos | cpau_ch_dev |
| `VALOR_K_DEFAULT` | Valor K para cálculos | 522181756.33 |

## 🗄️ Base de Datos

### Schema
- **cpau_ch_dev** (localhost)
- **cpau_ch_qa** (AWS RDS)

### Tablas Principales
- `Calc_Maq` - Cálculos de honorarios (master)
- `Calc_Maq_Items` - Items de cada cálculo (detalle)

### Stored Procedures
- `Calc_Maq_Grabar` - Guarda cálculo completo
- `Calc_Maq_Listar_Calculo_Items` - Lista items de un cálculo

Ver documentación completa en `App/Backend/BD/SCHEMA_DOC.md`

## 📚 Documentación Adicional

- [Arquitectura del Sistema](docs/ARCHITECTURE.md) - ⏳ Pendiente
- [Guía de Deployment](docs/DEPLOYMENT.md) - ⏳ Pendiente
- [Troubleshooting](docs/TROUBLESHOOTING.md) - ⏳ Pendiente
- [Ejemplos de API](docs/API_EXAMPLES.md) - ⏳ Pendiente

## 🐛 Troubleshooting

### Error: Cannot connect to MySQL
```bash
# Verificar que MySQL está corriendo
systemctl status mysql   # Linux
brew services list       # Mac
net start MySQL          # Windows

# Verificar credenciales en .env
# Verificar que el usuario tiene permisos
```

### Error: EADDRINUSE (puerto ocupado)
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
lsof -ti:3000 | xargs kill   # Mac/Linux
netstat -ano | findstr :3000 # Windows
```

### Tests fallan con error de DB
```bash
# Asegurarse que existe schema de test
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cpau_ch_test;"

# Verificar que .env.test tiene configuración correcta
```

## 👥 Equipo

- **Product Owner**: Carlos Sánchez
- **Tech Lead**: [A definir]
- **Backend Dev**: [A definir]
- **DevOps**: [A definir]
- **QA**: [A definir]

## 📞 Contacto

Para dudas o problemas, contactar a:
- Email: [email@example.com]
- Slack: #ch2026-backend

## 📄 Licencia

ISC - Uso interno de Neosis/CPAU

---

**Última actualización**: 16/04/2026  
**Versión**: 2.0.0  
**Estado**: En Desarrollo
