# Backend Node.js - CH2026 Honorarios

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Stack:** Node.js 18+ + Express  
**Propósito:** API REST para cálculo de honorarios profesionales

---

## 📋 Descripción

Backend Node.js que implementa la lógica de cálculo de honorarios para el CPAU. Este código está preparado para:

- **Fase 1 (Actual):** Desarrollo local y Vercel Serverless Functions
- **Fase 2 (Futuro):** AWS Lambda con API Gateway
- **Fase 3 (Futuro):** Servidor completo con base de datos

---

## 🚀 Inicio Rápido

### Instalación

```bash
# Navegar a la carpeta
cd App/Backend/02-Node

# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

### Testing del endpoint

```powershell
# PowerShell
Invoke-RestMethod -Uri http://localhost:3001/api/v1/honorarios/calcular `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "tipoCalculo": "basico",
    "datosProyecto": { "nombre": "Test", "ubicacion": "CABA" },
    "datosObra": { "valorObra": 10000000, "superficie": 100, "tipologia": "Vivienda" },
    "tareasProfesionales": { "obraProyecto": true },
    "parametros": { "valorK": 522181756.33 }
  }'
```

---

## 📁 Estructura del Proyecto

```
02-Node/
├── src/
│   ├── index.js                    # Servidor Express principal
│   ├── handlers/
│   │   └── honorarios.handler.js   # Handler de cálculo
│   ├── services/
│   │   └── honorarios.service.js   # Lógica de negocio
│   ├── utils/
│   │   └── calculos/
│   │       ├── honorariosBasico.js  # Algoritmo de cálculo
│   │       └── tablasCoeficientes.js # Coeficientes y valor K
│   ├── middleware/
│   │   └── errorHandler.js         # Manejo centralizado de errores
│   └── config/
│       └── constants.js             # Constantes de configuración
├── tests/
│   └── honorarios.test.js          # Tests unitarios
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### POST /api/v1/honorarios/calcular

Calcula honorarios profesionales basados en los datos del proyecto.

**Request:**
```json
{
  "tipoCalculo": "basico",
  "datosProyecto": {
    "nombre": "Proyecto ejemplo",
    "ubicacion": "CABA",
    "cliente": "Cliente ejemplo"
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
    "instalacionSanitaria": true,
    "instalacionElectrica": true,
    "proyectoEstructuras": true
  },
  "parametros": {
    "valorK": 522181756.33
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "calculoId": "calc_1710594600123",
    "tipoCalculo": "basico",
    "fechaCalculo": "2026-03-16T14:30:00.123Z",
    "resultado": {
      "detalleHonorarios": [...],
      "totalHonorarios": 4125000,
      "metadata": {
        "rango": "B",
        "valorK": 522181756.33,
        "rangoCostoObra": 0.0957
      }
    }
  },
  "version": "1.0"
}
```

**Errores:**
- `400` - Datos inválidos
- `405` - Método no permitido
- `500` - Error interno del servidor

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo (con watch mode)
npm run dev

# Producción
npm start

# Tests
npm test
```

---

## 🔐 Variables de Entorno

Ver `.env.example` para configuración completa.

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Ambiente de ejecución | `development` |
| `CORS_ORIGIN` | Orígenes permitidos para CORS | `http://localhost:5173` |
| `VALOR_K_DEFAULT` | Valor K base para cálculos | `522181756.33` |

---

## 🚢 Deploy

### Vercel Serverless

El código está preparado para deployarse en Vercel Functions. Ver guía en `/App/Frontend/api/README.md`.

### AWS Lambda

Para AWS Lambda, ver documentación en:
- `00-Contexto/08-GuiaMigracionBackendReal.md`
- `00-Contexto/09-EjemploConexionDB-Lambda.md`

---

## 📝 Notas Importantes

### Protección de Propiedad Intelectual

⚠️ **CRÍTICO:** Los archivos en `src/utils/calculos/` contienen:
- Fórmulas de cálculo propietarias
- Coeficientes oficiales del CPAU
- Valor K actualizado
- Algoritmos de determinación de rangos

**NUNCA** exponer estos archivos en el frontend. Solo deben ejecutarse en servidor.

### Fases del Proyecto

**Fase 1 (Actual):** Serverless sin base de datos  
- ✅ Protege código de cálculo
- ⏳ Sin persistencia de datos
- ⏳ Sin autenticación real

**Fase 2 (Futuro):** AWS Lambda + RDS  
- ✅ Base de datos MySQL/SQL Server
- ✅ Stored Procedures
- ✅ Autenticación JWT
- ✅ Auditoría completa

Ver `00-Contexto/08-GuiaMigracionBackendReal.md` para detalles.

---

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Test manual con curl
curl -X POST http://localhost:3001/api/v1/honorarios/calcular \
  -H "Content-Type: application/json" \
  -d '{"tipoCalculo":"basico","datosObra":{"valorObra":10000000},"tareasProfesionales":{"obraProyecto":true}}'
```

---

## 📚 Documentación Adicional

- [Arquitectura Backend API](../../../00-Contexto/06-ArquitecturaBackendAPI.md)
- [Contrato de API](../../../00-Contexto/07-ContratoAPI-Honorarios.md)
- [Guía de Migración](../../../00-Contexto/08-GuiaMigracionBackendReal.md)
- [Conexión Base de Datos](../../../00-Contexto/09-EjemploConexionDB-Lambda.md)

---

## 👥 Equipo

**Proyecto:** CPAU - Consejo Profesional de Arquitectura y Urbanismo  
**Desarrollo:** Equipo CH2026  
**Fecha:** Marzo 2026

---

## 📄 Licencia

PROPRIETARY - Código propietario del CPAU. Todos los derechos reservados.
