# 🔧 Guía de Reparación y Deploy en Vercel

## ✅ Cambios Realizados Automáticamente

### 1. Estructura Reorganizada
- ✅ Creada carpeta `src/` con estructura estándar de Vite
- ✅ Movidos `components/`, `pages/`, `services/` a `src/`
- ✅ Movidos `App.tsx`, `constants.ts`, `types.ts` a `src/`
- ✅ Creado `src/main.tsx` como punto de entrada
- ✅ Actualizado `index.html` para usar `/src/main.tsx`

### 2. Configuración de Vite
- ✅ `vite.config.ts` configurado con `envPrefix: ['VITE_']`
- ✅ `cssCodeSplit: true` habilitado
- ✅ Alias `@` apunta a `./src`
- ✅ CSS se genera automáticamente en `/assets/`

### 3. Variables de Entorno
- ✅ `constants.ts` usa `import.meta.env.VITE_*`
- ✅ Validación de variables con mensajes de error claros
- ✅ Fallbacks incluidos para desarrollo

### 4. Vercel Configuration
- ✅ `vercel.json` simplificado
- ✅ Rewrite excluye assets (CSS, JS, imágenes)
- ✅ Solo rutas de SPA se redirigen a `index.html`

---

## 🚀 Pasos para Deploy en Vercel

### Paso 1: Configurar Root Directory

1. Ve a tu proyecto en **Vercel Dashboard**
2. Click en **Settings** → **General**
3. En la sección **Root Directory**, selecciona:
   ```
   Front-end
   ```
4. Click en **Save**

### Paso 2: Configurar Variables de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Elimina las variables antiguas (si existen):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Agrega las nuevas variables:
   ```
   VITE_SUPABASE_URL = https://tatvmyjoinyfkxeclbso.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdHZteWpvaW55Zmt4ZWNsYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzYyNDQsImV4cCI6MjA3OTk1MjI0NH0.F-BcU63qt1IvgyLA53IUjjC5gux-79qiCYt_8L6D468
   ```
4. Aplica a todos los ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click en **Save**

### Paso 3: Limpiar Cache y Redeploy

1. Ve a **Deployments**
2. Click en los **3 puntos** (⋯) del último deployment
3. Selecciona **Redeploy**
4. **IMPORTANTE**: Marca la casilla **"Clear Build Cache"**
5. Click en **Redeploy**

**O alternativamente:**
- Haz un nuevo commit y push:
  ```bash
  git add .
  git commit -m "Fix: Reorganización estructura src/ y configuración Vite"
  git push
  ```

---

## ✅ Verificaciones Post-Deploy

Después del deploy, verifica que:

1. ✅ **CSS carga correctamente** (sin error MIME type)
   - Abre DevTools → Network
   - Busca archivos `.css` en `/assets/`
   - Deben tener status `200` y `Content-Type: text/css`

2. ✅ **Variables de entorno funcionan**
   - Abre DevTools → Console
   - No debe aparecer: "Variable de entorno faltante"
   - Las llamadas a Supabase deben funcionar

3. ✅ **Dashboard carga sin errores**
   - La página debe mostrar KPIs
   - Los gráficos deben renderizarse
   - No debe haber pantalla en blanco

4. ✅ **Llamadas a Supabase funcionan**
   - Abre DevTools → Network
   - Las peticiones a `/functions/v1/*` deben tener status `200`
   - Los datos deben aparecer en el Dashboard

---

## 🐛 Solución de Problemas

### Error: "MIME type text/html" para CSS
**Causa**: Vercel está sirviendo `index.html` en lugar del CSS
**Solución**: 
- Verifica que `vercel.json` tenga el rewrite correcto
- Asegúrate de que el Root Directory esté configurado como `Front-end`
- Limpia el cache y redeploya

### Error: "Variable de entorno faltante"
**Causa**: Variables no configuradas en Vercel
**Solución**:
- Ve a Settings → Environment Variables
- Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Aplica a todos los ambientes
- Redeploya

### Error: Pantalla en blanco
**Causa**: Error de JavaScript no capturado
**Solución**:
- Abre DevTools → Console
- Revisa los errores
- Verifica que las variables de entorno estén configuradas
- Verifica que el build se haya completado correctamente

### Error: Build falla en Vercel
**Causa**: Dependencias faltantes o configuración incorrecta
**Solución**:
- Verifica que `package.json` tenga todas las dependencias
- Asegúrate de que el Root Directory sea `Front-end`
- Revisa los logs de build en Vercel

---

## 📝 Estructura Final del Proyecto

```
Front-end/
├── src/
│   ├── components/
│   │   ├── AccessibilitySettingsSidebar.tsx
│   │   ├── HeatMap.tsx
│   │   ├── Layout.tsx
│   │   ├── StatsCard.tsx
│   │   └── VolunteerModal.tsx
│   ├── pages/
│   │   ├── AdminPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SearchPage.tsx
│   │   └── VolunteerForm.tsx
│   ├── services/
│   │   └── supabaseService.ts
│   ├── styles/
│   │   └── accessibility.css
│   ├── App.tsx
│   ├── constants.ts
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── public/
│   └── favicon.ico
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json
├── tailwind.config.js
├── postcss.config.js
└── tsconfig.json
```

---

## 🎯 Comandos Útiles

### Build Local
```bash
cd Front-end
npm install
npm run build
npm run preview
```

### Verificar Build
```bash
cd Front-end
npm run build
# Debe generar:
# - dist/index.html
# - dist/assets/index-[hash].css
# - dist/assets/index-[hash].js
# - dist/assets/vendor-*.js
# - dist/assets/react-vendor-*.js
# - dist/assets/chart-vendor-*.js
```

### Desarrollo Local
```bash
cd Front-end
npm run dev
# Abre http://localhost:5173
```

---

## ✅ Checklist Final

Antes de hacer commit, verifica:

- [ ] Estructura `src/` creada correctamente
- [ ] `index.html` apunta a `/src/main.tsx`
- [ ] `vite.config.ts` tiene `envPrefix: ['VITE_']`
- [ ] `constants.ts` usa `import.meta.env.VITE_*`
- [ ] `vercel.json` tiene rewrite correcto
- [ ] Build local funciona sin errores
- [ ] Preview local funciona correctamente
- [ ] Variables de entorno configuradas en Vercel
- [ ] Root Directory configurado como `Front-end`

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de build en Vercel
2. Revisa la consola del navegador (DevTools)
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de que el Root Directory sea `Front-end`
5. Limpia el cache y redeploya

---

**Última actualización**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

