# 🚀 Instrucciones para Deploy de Funciones Edge

## Opción 1: Desde la Interfaz Web de Supabase (RECOMENDADO)

### Para la función `voluntarios`:

1. **Ve a tu proyecto en Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Edge Functions:**
   - En el menú lateral, busca **"Edge Functions"**
   - O ve directamente a: `https://supabase.com/dashboard/project/[tu-proyecto]/functions`

3. **Selecciona o crea la función `voluntarios`:**
   - Si ya existe, haz clic en ella
   - Si no existe, crea una nueva función llamada `voluntarios`

4. **Copia y pega el código:**
   - Abre el archivo `supabase/functions/voluntarios/index.ts` de este proyecto
   - Copia TODO el contenido
   - Pégalo en el editor de Supabase

5. **Haz clic en "Deploy" o "Save":**
   - El botón suele estar en la esquina superior derecha
   - Espera a que termine el deploy (puede tardar unos segundos)

### Para la función `buscar`:

Repite los mismos pasos pero para la función `buscar`:
- Usa el código de `supabase/functions/buscar/index.ts`

---

## Opción 2: Desde Terminal (Si tienes Supabase CLI instalado)

```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Login en Supabase
supabase login

# Link tu proyecto
supabase link --project-ref tatvmyjoinyfkxeclbso

# Deploy de las funciones
supabase functions deploy voluntarios
supabase functions deploy buscar
```

---

## ⚠️ IMPORTANTE: Variables de Entorno

Las funciones Edge de Supabase usan automáticamente estas variables de entorno:
- `SUPABASE_URL` - Se configura automáticamente
- `SUPABASE_SERVICE_ROLE_KEY` - Se configura automáticamente

**No necesitas configurarlas manualmente**, Supabase las inyecta automáticamente.

---

## ✅ Verificación

Después del deploy, prueba las funciones:

1. **Probar `voluntarios`:**
   ```bash
   curl -X POST https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/voluntarios \
     -H "Authorization: Bearer tu_anon_key" \
     -H "Content-Type: application/json" \
     -d '{"nombre":"Test","correo":"test@test.com","region":"Metropolitana"}'
   ```

2. **Probar `buscar`:**
   ```bash
   curl https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/buscar?region=Metropolitana \
     -H "Authorization: Bearer tu_anon_key"
   ```

---

## 📝 Notas

- El deploy desde la interfaz web es más fácil y no requiere instalaciones
- El código ya está listo y corregido (CORS, validaciones, etc.)
- Después del deploy, el formulario debería funcionar correctamente

