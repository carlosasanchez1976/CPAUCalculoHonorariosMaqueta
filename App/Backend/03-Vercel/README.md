# Backend Vercel Functions - CH2026

## Descripción
Backend implementado como Vercel Serverless Functions para ambiente QA/Staging.

## Estructura
```
03-Vercel/
├── api/                          # Serverless Functions
│   └── v1/
│       └── honorarios/
│           └── calcular.js       # POST /api/v1/honorarios/calcular
├── lib/                          # Código compartido
│   ├── services/
│   │   └── honorarios.service.js
│   └── utils/
│       └── calculos/
│           ├── honorariosBasico.js
│           └── tablasCoeficientes.js
├── package.json
├── vercel.json                   # Configuración de Vercel
└── .env.example
```

## Diferencias vs Express (02-Node)

### Express (Desarrollo Local):
- Servidor persistente en puerto 3001
- Middleware stack compartido
- Enrutamiento con express.Router()

### Vercel Functions (QA/Staging):
- Funciones serverless independientes
- Cada archivo en `api/` es un endpoint
- Se ejecutan solo cuando se llaman

## Variables de Entorno (Vercel Dashboard)
```
NODE_ENV=production
API_VERSION=v1
CORS_ORIGIN=https://tu-frontend.vercel.app
```

## Deploy
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde esta carpeta
cd App/Backend/03-Vercel
vercel --prod
```

## Endpoints
- `POST /api/v1/honorarios/calcular` - Calcular honorarios

## Notas
- El código de negocio (services, utils) es el mismo que en 02-Node
- Solo cambia la capa de presentación (handlers)
- Vercel detecta automáticamente la carpeta `api/`
