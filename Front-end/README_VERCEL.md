# Guía de Despliegue en Vercel

## Configuración de Variables de Entorno

En el dashboard de Vercel, ve a **Settings → Environment Variables** y agrega:

```
VITE_SUPABASE_URL=https://tatvmyjoinyfkxeclbso.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdHZteWpvaW55Zmt4ZWNsYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzYyNDQsImV4cCI6MjA3OTk1MjI0NH0.F-BcU63qt1IvgyLA53IUjjC5gux-79qiCYt_8L6D468
```

## Configuración del Proyecto

1. **Root Directory**: Si el proyecto está en la raíz, deja vacío. Si está en `Front-end`, configura:
   - Root Directory: `Front-end`

2. **Build Command**: `npm run build`

3. **Output Directory**: `dist`

4. **Install Command**: `npm install`

## Verificación

Después del despliegue, verifica que:
- ✅ La aplicación carga correctamente
- ✅ Las rutas funcionan (/#/, /#/busqueda, /#/admin)
- ✅ Las variables de entorno están configuradas
- ✅ Los assets se cargan correctamente

## Solución de Problemas

### Error 404
- Verifica que `vercel.json` esté en la raíz del proyecto desplegado
- Asegúrate de que el `outputDirectory` sea `dist`

### Variables de entorno no funcionan
- Verifica que los nombres sean exactamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Reinicia el deployment después de agregar variables

### Assets no cargan
- Verifica que el build se complete correctamente
- Revisa la consola del navegador para errores 404 en assets

