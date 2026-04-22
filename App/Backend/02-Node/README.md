# Backend Node.js - CH2026 Honorarios

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Stack:** Node.js 18+ + Express  
**Propósito:** API REST para cálculo de honorarios profesionales  
**Versión:** 2.1.0 (SPEC-CALC-002 en desarrollo)

---

## 📋 Cambios Recientes

### [20/04/2026] Sistema Progresivo de Honorarios (SPEC-CALC-002) 🚧 EN DESARROLLO

**Estado:** ⏳ Ticket #001 completado - Setup inicial

**Cambio:** Implementación de sistema de cálculo progresivo escalonado donde cada tramo del valor de obra aplica los coeficientes de su rango correspondiente (similar al sistema impositivo por escalas).

**Archivos creados:**
- ✅ `src/utils/calculos/honorariosProgresivo.js` - Módulo nuevo (stub)
- ✅ `src/utils/calculos/__tests__/honorariosProgresivo.test.js` - Suite de tests

**Próximos pasos:**
- ⏳ Ticket #002: Implementar función `calcularLimitesRangos()` en tablasCoeficientes.js
- ⏳ Ticket #003: Escribir tests completos (TDD - RED phase)
- ⏳ Ticket #004: Implementar algoritmo progresivo (TDD - GREEN phase)

**Referencia:** `01-Docs/00-Specs/SPEC-CALC-002-Arrastre-Coeficientes-Progresivo.md`

---

### [19/04/2026] Coeficientes Diferenciados por Instalación (SPEC-CALC-001)

**Cambio:** Se implementaron coeficientes diferenciados por tipo de instalación según nuevas tablas CPAU 2026.

**Antes:**
- Todas las instalaciones (Sanitaria, Eléctrica, Incendio, Termomecánica) usaban los mismos coeficientes
- Coeficientes únicos: Rango A: 0.0023, Rango B: 0.0012, Rango C: 0.0008, Rango D: 0.0004

**Después:**
- **Sanitaria/Eléctrica**: Coeficientes propios (incremento +17% a +74% según rango)
  - Rango A: 0.0040, Rango B: 0.0014, Rango C: 0.0012, Rango D: 0.0005
- **Incendio**: Coeficientes propios (reducción -25% a -57% según rango)
  - Rango A: 0.0010, Rango B: 0.0007, Rango C: 0.0006, Rango D: 0.00025
- **Termomecánica**: Coeficientes propios (reducción -25% a -57% según rango)
  - Rango A: 0.0010, Rango B: 0.0007, Rango C: 0.0006, Rango D: 0.00025

**Impacto:**
- ✅ Frontend: Sin cambios (API completamente compatible)
- ✅ Backend: Solo cálculo interno modificado
- ✅ Precisión: Mayor exactitud según complejidad técnica de cada especialidad
- ✅ Tests: 8/8 tests pasando con validación completa

**Archivos modificados:**
- `src/utils/calculos/tablasCoeficientes.js` - Nuevas constantes de coeficientes
- `src/utils/calculos/honorariosBasico.js` - Lógica de asignación por tipo
- `src/utils/calculos/__tests__/honorariosBasico.test.js` - Tests unitarios

**Referencia:** `01-Docs/00-Specs/SPEC-CALC-001-Coeficientes-Instalaciones-Diferenciados.md`

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
    "tareasProfesionales": { "obraProyecto": true }
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
