# Guía de Deployment a Vercel - Backend CH2026

## 📋 Pre-requisitos

1. **Cuenta en Vercel**: Crear cuenta en [vercel.com](https://vercel.com)
2. **Vercel CLI instalado** (opcional, recomendado para deploy desde terminal)
3. **Git configurado**: El proyecto debe estar en un repositorio Git

## 🚀 Opción 1: Deploy desde Vercel Dashboard (Recomendado para QA)

### Paso 1: Conectar Repositorio

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New Project"**
3. Seleccionar **"Import Git Repository"**
4. Autorizar acceso a tu repositorio (GitHub/GitLab/Bitbucket)
5. Seleccionar el repositorio del proyecto CH2026

### Paso 2: Configurar Proyecto

En la pantalla de configuración:

**Root Directory:**
```
App/Backend/03-Vercel
```

**Framework Preset:**
- Seleccionar: **Other** (no es frontend)

**Build Command:**
- Dejar vacío (no hay build, son serverless functions)

**Output Directory:**
- Dejar vacío

**Install Command:**
- `npm install` (detectado automáticamente)

### Paso 3: Configurar Variables de Entorno

En **Environment Variables**, agregar:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NODE_ENV` | `production` | Production, Preview |
| `API_VERSION` | `v1` | Production, Preview |
| `CORS_ORIGIN` | `https://tu-frontend.vercel.app` | Production, Preview |
| `VALOR_K_DEFAULT` | `522181756.33` | Production, Preview |

**IMPORTANTE:** 
- Para Preview/QA, usar la URL del preview del frontend
- Para Production, usar la URL final del frontend

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Vercel automáticamente:
   - Clona el repositorio
   - Instala dependencias (`npm install`)
   - Detecta funciones en carpeta `api/`
   - Configura las rutas según `vercel.json`
   - Publica las funciones serverless

3. Esperar a que finalice el deploy (1-2 minutos)

### Paso 5: Verificar Deployment

Una vez completado, Vercel te dará una URL como:
```
https://tu-proyecto.vercel.app
```

**Probar endpoints:**

1. Health Check:
```bash
curl https://tu-proyecto.vercel.app/api/health
```

2. Calcular Honorarios:
```bash
curl -X POST https://tu-proyecto.vercel.app/api/v1/honorarios/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "tipoCalculo": "basico",
    "datosObra": {
      "valorObra": 500000000
    },
    "tareasProfesionales": {
      "obraProyecto": true,
      "obraDireccion": true
    }
  }'
```

## 🔧 Opción 2: Deploy desde Terminal (Vercel CLI)

### Instalación Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy Preview (QA/Testing)

```bash
cd App/Backend/03-Vercel
vercel
```

Vercel te hará preguntas:
- **Set up and deploy?** → Yes
- **Which scope?** → Selecciona tu cuenta
- **Link to existing project?** → No (primera vez) / Yes (deploys siguientes)
- **Project name:** → `ch2026-backend-api` (o el nombre que prefieras)
- **Directory:** → `.` (ya estás en 03-Vercel)

### Deploy Production

```bash
cd App/Backend/03-Vercel
vercel --prod
```

## 📝 Configurar Frontend para usar Backend Vercel

Una vez desplegado el backend, actualizar frontend:

### Archivo: `App/Frontend/.env.local`

```env
# Ambiente de QA/Preview
VITE_API_URL=https://tu-proyecto.vercel.app/api/v1
```

### Archivo: `App/Frontend/.env.production`

```env
# Ambiente de Producción
VITE_API_URL=https://tu-backend-prod.vercel.app/api/v1
```

## 🔄 Redeploy Automático (CI/CD)

Vercel automáticamente hace redeploy cuando:

1. **Push a rama principal** → Deploy a Production
2. **Push a otras ramas** → Deploy a Preview (URL temporal)
3. **Pull Request** → Deploy Preview con URL única

Para configurar qué rama es producción:
1. Vercel Dashboard > Tu Proyecto > Settings > Git
2. Configurar **Production Branch** (generalmente `main` o `master`)

## 🐛 Troubleshooting

### Error: "Module not found"

**Causa:** Imports relativos incorrectos en serverless functions

**Solución:** Verificar que todos los imports usen rutas correctas:
```javascript
// ✅ Correcto
import { calcularHonorariosService } from '../../../lib/services/honorarios.service.js';

// ❌ Incorrecto
import { calcularHonorariosService } from '@/lib/services/honorarios.service.js';
```

### Error: "Function timeout"

**Causa:** Función tarda más de 10 segundos (límite gratuito de Vercel)

**Solución:** 
- Optimizar lógica de cálculo
- Upgrade a plan Pro (60 segundos timeout)

### Error CORS

**Causa:** Frontend no está en `CORS_ORIGIN`

**Solución:**
1. Ir a Vercel Dashboard > Proyecto > Settings > Environment Variables
2. Actualizar `CORS_ORIGIN` con la URL del frontend
3. Redeploy el backend

### Logs de Funciones

Ver logs en tiempo real:
1. Vercel Dashboard > Tu Proyecto > Logs
2. O usar CLI: `vercel logs [deployment-url]`

## 📊 Monitoreo

### Vercel Analytics

Vercel provee automáticamente:
- **Request Count**: Número de llamadas a cada función
- **Execution Duration**: Tiempo de ejecución
- **Errors**: Errores 4xx y 5xx
- **Bandwidth**: Datos transferidos

Acceder desde: Dashboard > Proyecto > Analytics

### Custom Logging

Los `console.log()` en el código aparecen en:
- Vercel Dashboard > Logs
- Vercel CLI: `vercel logs`

## 💰 Límites del Plan Gratuito

- **100 GB bandwidth** por mes
- **100 horas de función** por mes
- **10 segundos timeout** por función
- **Unlimited requests**

Si necesitas más, considerar upgrade a plan Pro.

## 🔐 Seguridad

### Secrets en Vercel

Para datos sensibles (API keys, tokens):

```bash
# Agregar secret desde CLI
vercel secrets add mi-secret-key valor-secreto

# Usar en variables de entorno
# Vercel Dashboard > Settings > Environment Variables
# Value: @mi-secret-key
```

### HTTPS

Todas las funciones de Vercel usan HTTPS automáticamente. No necesitas configurar SSL.

## 📚 Recursos Adicionales

- [Vercel Functions Docs](https://vercel.com/docs/functions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Serverless Function API](https://vercel.com/docs/functions/serverless-functions)

---

## ✅ Checklist de Deployment

- [ ] Backend code en `App/Backend/03-Vercel/`
- [ ] `vercel.json` configurado
- [ ] Variables de entorno configuradas en Dashboard
- [ ] Repositorio Git committeado y pusheado
- [ ] Proyecto conectado en Vercel Dashboard
- [ ] Deploy completado exitosamente
- [ ] Health check respondiendo
- [ ] Endpoint de cálculo testeado con Postman
- [ ] Frontend `.env` actualizado con URL del backend
- [ ] Frontend testeado integralmente
- [ ] CORS configurado correctamente
- [ ] Logs verificados sin errores

¡Listo para QA! 🎉
