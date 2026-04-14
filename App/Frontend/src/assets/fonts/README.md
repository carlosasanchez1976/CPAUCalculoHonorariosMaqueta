# Fuentes del Proyecto CH2026

## Archivos Requeridos

Copiar los siguientes archivos de fuente Avenir a esta carpeta:

### Regular (peso 400)
- `Avenir-Regular.woff2` (preferido)
- `Avenir-Regular.woff` (fallback)

### Medium (peso 500)
- `Avenir-Medium.woff2` (preferido)
- `Avenir-Medium.woff` (fallback)

### Bold (peso 700)
- `Avenir-Bold.woff2` (preferido)
- `Avenir-Bold.woff` (fallback)

### Heavy (peso 900) - Opcional
- `Avenir-Heavy.woff2` (preferido)
- `Avenir-Heavy.woff` (fallback)

## Conversión de Formatos

Si solo tienes archivos `.ttf` u `.otf`, puedes convertirlos a formatos web:

**Herramienta recomendada:**
- https://transfonter.org/ (online, gratis)
- https://cloudconvert.com/ttf-to-woff2 (online, gratis)

**Configuración recomendada en Transfonter:**
- ✅ WOFF2 (mejor compresión)
- ✅ WOFF (fallback)
- ✅ Fix vertical metrics
- ✅ Remove kerning

## Licencia

⚠️ **IMPORTANTE:** Verificar que la licencia de Avenir permita uso web.
Fuente provista por el cliente CPAU.

## Verificación

Después de copiar los archivos:
1. Reiniciar el servidor de desarrollo (`npm run dev`)
2. Abrir DevTools → Network → Fonts
3. Verificar que los archivos `.woff2` se cargan correctamente
4. Inspeccionar un texto y verificar que usa `font-family: Avenir`
