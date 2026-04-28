# Configuración de Caché HTTP - Vercel

Este archivo configura los headers de caché HTTP para assets estáticos en Vercel.

## 📋 Configuración Implementada

### Assets Cacheados (1 año):

1. **Íconos de tareas** (`/assets/icons/tareas/*`)
   - 17 SVG de tareas profesionales
   - Ejemplo: `/assets/icons/tareas/PYDOA.svg`

2. **Todos los íconos** (`/assets/icons/*`)
   - Cualquier ícono en la carpeta assets/icons

3. **Fuentes e imágenes** (`/assets/(fonts|images)/*`)
   - Fuentes: woff, woff2, ttf, otf, eot
   - Imágenes: jpg, jpeg, png, gif, webp

4. **Assets por extensión** (`*.(svg|jpg|jpeg|png|gif|ico|webp|woff|woff2|ttf|otf|eot)`)
   - Cualquier archivo con estas extensiones en cualquier ubicación

5. **JavaScript y CSS** (`*.(js|css)`)
   - Archivos compilados con hash en el nombre (generados por Vite)

## 🔧 Headers Configurados

```
Cache-Control: public, max-age=31536000, immutable
```

### Significado:
- **`public`**: Puede ser cacheado por navegadores y CDNs
- **`max-age=31536000`**: Cachear por 1 año (365 días en segundos)
- **`immutable`**: El contenido nunca cambia (versionado por hash en build)

## ✅ Cómo Verificar (Post-Deploy)

### 1. Verificar en DevTools:
```
1. Abrir https://ch2026-qa.neosisweb.ar/nuevo-calculo
2. Abrir DevTools → Network tab
3. Buscar PYDOA.svg o cualquier ícono
4. Ver Response Headers:
   ✅ Cache-Control: public, max-age=31536000, immutable
```

### 2. Verificar con curl:
```bash
curl -I https://ch2026-qa.neosisweb.ar/assets/icons/tareas/PYDOA.svg

# Debe mostrar:
# HTTP/2 200
# cache-control: public, max-age=31536000, immutable
# content-type: image/svg+xml
```

### 3. Verificar caché del navegador:
```
1. Primera visita: Status 200 OK (descarga el archivo)
2. Segunda visita: Status 304 Not Modified O "(from disk cache)"
3. Tiempo: ~1500ms → ~50ms (mejora del 97%)
```

## 🎯 Beneficios

### Performance:
- **Primera carga**: 1500ms (17 SVG × ~90ms)
- **Segunda carga**: ~50ms (desde caché del navegador)
- **Ahorro**: 97% de tiempo de carga

### Tráfico:
- Reduce peticiones al servidor en ~90%
- Menos ancho de banda consumido
- Mejor experiencia de usuario

### SEO:
- Mejora métricas de Lighthouse
- Reduce First Contentful Paint (FCP)
- Mejor Time to Interactive (TTI)

## 📝 Notas Importantes

1. **Versionado de assets**: Los archivos deben tener hash en el nombre o estar en rutas inmutables
2. **Deploy necesario**: Los cambios en `vercel.json` requieren un nuevo deploy
3. **Cache invalidation**: Si cambias un asset, debes cambiar su nombre o ruta
4. **Solo para assets estáticos**: No usar para APIs o contenido dinámico

## 🔄 Próximos Pasos (Post-Deploy)

- [ ] Deploy a preview (vercel --preview)
- [ ] Verificar headers en DevTools
- [ ] Verificar caché funciona (segunda visita)
- [ ] Deploy a producción
- [ ] Monitorear métricas de performance

## 📚 Referencias

- [Vercel Headers Configuration](https://vercel.com/docs/projects/project-configuration#headers)
- [Cache-Control Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [HTTP Caching Best Practices](https://web.dev/http-cache/)
