# API Serverless - Vercel Functions

**Proyecto:** CH2026 - Sistema de Gestión de Cálculo de Honorarios CPAU  
**Versión:** 1.0 - Fase Serverless  
**Fecha:** 16/03/2026  

---

## 📁 Estructura

```
api/
└── honorarios/
    └── calcular.js      → POST /api/honorarios/calcular
```

---

## 🎯 Endpoints Disponibles

### POST /api/honorarios/calcular

Calcula honorarios profesionales según tipo de cálculo y tareas seleccionadas.

**URL Local:** `http://localhost:5173/api/honorarios/calcular`  
**URL QA:** `https://ch2026-qa.vercel.app/api/honorarios/calcular`  

**Request Body:**
```json
{
  "tipoCalculo": "basico",
  "datosProyecto": {
    "nombre": "string",
    "ubicacion": "string",
    "cliente": "string"
  },
  "datosObra": {
    "valorObra": number,
    "superficie": number,
    "tipologia": "string",
    "complejidad": "string"
  },
  "tareasProfesionales": {
    "obraProyecto": boolean,
    "obraDireccion": boolean,
    "instalacionSanitaria": boolean,
    "instalacionElectrica": boolean,
    "instalacionContraIncendio": boolean,
    "proyectoEstructuras": boolean
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
      "detalleHonorarios": [ ... ],
      "totalHonorarios": 4333334.17,
      "metadata": {
        "rango": "B",
        "valorK": 522181756.33,
        "rangoCostoObra": 0.0958,
        "cantidadTareas": 5
      }
    }
  },
  "version": "1.0"
}
```

---

## 🔧 Desarrollo Local

### Prerequisitos
- Node.js 18.x o superior
- Vercel CLI (opcional): `npm i -g vercel`

### Testing Local con Vite

Vite incluye soporte nativo para Vercel serverless functions en desarrollo:

```bash
# Iniciar servidor de desarrollo
npm run dev

# Las funciones estarán disponibles en:
# http://localhost:5173/api/honorarios/calcular
```

### Testing Local con Vercel CLI (alternativo)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Iniciar servidor local de Vercel
vercel dev

# Las funciones estarán disponibles en:
# http://localhost:3000/api/honorarios/calcular
```

### Testing Manual con cURL

```bash
curl -X POST http://localhost:5173/api/honorarios/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "tipoCalculo": "basico",
    "datosObra": {
      "valorObra": 50000000,
      "superficie": 250
    },
    "tareasProfesionales": {
      "obraProyecto": true,
      "obraDireccion": false,
      "instalacionSanitaria": false,
      "instalacionElectrica": false,
      "instalacionContraIncendio": false,
      "proyectoEstructuras": false
    }
  }'
```

---

## 📚 Documentación Completa

Para más información sobre el contrato de API, vea:
- [Contrato de API](../../00-Contexto/07-ContratoAPI-Honorarios.md)
- [Arquitectura Backend](../../00-Contexto/06-ArquitecturaBackendAPI.md)

---

## 🚀 Deployment

### Vercel (Automático)

Al hacer push a rama `qa`, Vercel desplegará automáticamente:

```bash
git add .
git commit -m "feat: implementar API serverless"
git push origin qa
```

Las serverless functions se despliegan automáticamente en:
- **QA:** `https://ch2026-qa.vercel.app/api/...`

### Verificar Deployment

1. Acceder a [Vercel Dashboard](https://vercel.com/)
2. Seleccionar proyecto CH2026
3. Ver logs de deployment
4. Verificar que functions estén activas

---

## 🐛 Troubleshooting

### Error: 404 Not Found al llamar a /api/...

**Causa:** `vercel.json` no está configurado correctamente.

**Solución:** Verificar que `vercel.json` tenga:
```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

Nota: El regex `(?!api)` excluye rutas que empiecen con `/api/`.

### Error: Module not found al importar desde src/

**Causa:** Las serverless functions no pueden importar desde `/src/` por defecto.

**Solución:** Usar imports relativos:
```javascript
// ❌ NO funciona
import { calcular } from '../../src/utils/calculos/honorarios.js';

// ✅ SÍ funciona  
import { calcular } from '../../src/utils/calculos/honorarios.js';
```

### Error: Cannot find module 'xyz'

**Causa:** Dependencia no instalada.

**Solución:**
```bash
npm install xyz
```

### Ver Logs de Vercel

**Desarrollo Local:**
```bash
# Los logs aparecen en la consola donde ejecutaste npm run dev
```

**Producción (Vercel):**
1. Ir a Vercel Dashboard
2. Seleccionar proyecto
3. Ir a "Functions" tab
4. Ver logs en tiempo real

---

## 📊 Monitoreo

### Métricas en Vercel Dashboard

- **Invocations:** Cantidad de llamadas
- **Duration:** Tiempo de ejecución (avg, p50, p95, p99)
- **Errors:** Cantidad de errores
- **Cold Starts:** Arranques desde cero

### Límites (Plan Free)

- ✅ **100 GB-Hrs/mes** de ejecución
- ✅ **12 segundos** de timeout por invocación
- ✅ **Unlimited** número de funciones
- ✅ **1024 MB** de memoria por función

Para esta maqueta, estos límites son más que suficientes.

---

## 🔐 Seguridad

### Consideraciones Actuales (Fase 1)

- ✅ Código de cálculo NO visible en navegador
- ✅ Validaciones server-side implementadas
- ⚠️ CORS abierto (`*`) - adecuado para demo
- ⚠️ Sin autenticación JWT (mock)
- ⚠️ Sin rate limiting

### Mejoras para Fase 2 (Backend Real)

- [ ] Implementar JWT authentication
- [ ] Rate limiting por usuario/IP
- [ ] CORS restrictivo
- [ ] Auditoría de operaciones
- [ ] Encriptación de datos sensibles

---

## 📝 Notas Importantes

1. **Código de Cálculo:** Los archivos en `/src/utils/calculos/` son importados por la serverless function pero NO son enviados al bundle del frontend. Solo son accesibles desde el servidor.

2. **Compatibilidad Frontend:** El servicio `honorariosService.js` en el frontend está diseñado para funcionar tanto con esta API serverless como con un backend real futuro. Solo se necesita cambiar la variable `VITE_API_URL`.

3. **Cold Starts:** La primera invocación después de inactividad puede tardar ~100-200ms. Invocaciones subsiguientes son más rápidas (~50ms).

4. **Limitaciones de Maqueta:** Esta es una solución temporal para ocultar la lógica de cálculo. En producción, se recomienda migrar a un backend completo con base de datos (ver [Guía de Migración](../../00-Contexto/08-GuiaMigracionBackendReal.md)).

---

**Última actualización:** 16/03/2026  
**Autor:** Equipo de Desarrollo CH2026
