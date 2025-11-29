# 📋 Instrucciones para Aplicar Cambios en Supabase

Este documento contiene los pasos **exactos** para aplicar todos los cambios del MVP migrado en Supabase Dashboard.

---

## ⚠️ IMPORTANTE: Orden de Ejecución

**Ejecuta los pasos en este orden exacto:**
1. ✅ SQL Schema (primero)
2. ✅ Edge Functions (después)

---

## 📌 PASO 1: Ejecutar Schema SQL

### Ubicación en Supabase:
**Dashboard → SQL Editor → New Query**

### Archivo a copiar:
`supabase/schema/voluntarios.sql`

### Instrucciones:
1. Abre Supabase Dashboard
2. Ve a **SQL Editor** (menú lateral)
3. Haz clic en **New Query**
4. Copia **TODO** el contenido de `supabase/schema/voluntarios.sql`
5. Pega en el editor SQL
6. Haz clic en **Run** (o presiona `Ctrl+Enter`)
7. Verifica que aparezca: **Success. No rows returned**

### Qué hace este SQL:
- ✅ Agrega columnas nuevas (migración incremental, NO borra datos)
- ✅ Crea índices optimizados
- ✅ Crea trigger para `updated_at` automático
- ✅ Agrega comentarios descriptivos

### Columnas agregadas:
- `edad` (INTEGER)
- `rango_etario` (VARCHAR)
- `area_estudio` (VARCHAR)
- `razon_no_continuar` (VARCHAR)
- `tiene_capacitacion` (BOOLEAN)
- `programa_asignado` (VARCHAR)
- `fecha_rechazo_count` (INTEGER)
- `score_riesgo_baja` (INTEGER, 0-100) ← **OUTPUT IA**
- `flag_brecha_cap` (BOOLEAN) ← **OUTPUT IA**
- `updated_at` (TIMESTAMP)

---

## 📌 PASO 2: Desplegar Edge Functions

### ⚠️ IMPORTANTE: Nombre de la función RPA

En Supabase, las funciones Edge no pueden tener `/` en el nombre. Por eso:
- **Carpeta local:** `supabase/functions/rpa/accion_urgente/`
- **Nombre en Supabase:** `rpa-accion-urgente` (con guiones)

---

### 🔧 Función 1: `inteligencia_predictiva`

**Endpoint final:** `https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/inteligencia_predictiva`

**Archivo a copiar:**
`supabase/deploy-ready/inteligencia_predictiva/index.ts`

**Pasos:**
1. Ve a **Edge Functions** (menú lateral)
2. Haz clic en **Create a new function**
3. Nombre: `inteligencia_predictiva`
4. Copia **TODO** el contenido de `supabase/deploy-ready/inteligencia_predictiva/index.ts`
5. Pega en el editor de código
6. Haz clic en **Deploy**

**Nota:** Esta función es opcional (solo exporta funciones). La función `/voluntarios` ya tiene la IA inline.

---

### 🔧 Función 2: `voluntarios` (ACTUALIZAR)

**Endpoint final:** `https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/voluntarios`

**Archivo a copiar:**
`supabase/deploy-ready/voluntarios/index.ts`

**Pasos:**
1. Ve a **Edge Functions**
2. Busca la función `voluntarios` (ya existe)
3. Haz clic en ella para editarla
4. **BORRA TODO** el código actual
5. Copia **TODO** el contenido de `supabase/deploy-ready/voluntarios/index.ts`
6. Pega en el editor
7. Haz clic en **Deploy**

**Cambios principales:**
- ✅ IA integrada inline (no depende de otras funciones)
- ✅ Soporta nuevos campos del MVP
- ✅ Calcula `score_riesgo_baja` y `flag_brecha_cap` automáticamente
- ✅ Calcula `rango_etario` si se proporciona `edad`

---

### 🔧 Función 3: `buscar` (ACTUALIZAR)

**Endpoint final:** `https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/buscar`

**Archivo a copiar:**
`supabase/deploy-ready/buscar/index.ts`

**Pasos:**
1. Ve a **Edge Functions**
2. Busca la función `buscar` (ya existe)
3. Haz clic en ella para editarla
4. **BORRA TODO** el código actual
5. Copia **TODO** el contenido de `supabase/deploy-ready/buscar/index.ts`
6. Pega en el editor
7. Haz clic en **Deploy**

**Cambios principales:**
- ✅ Filtros nuevos: `estado`, `programa_asignado`, `rango_etario`, `min_score_riesgo`, `flag_brecha_cap`
- ✅ Mantiene filtros existentes: `region`, `habilidad`, `campaña`

---

### 🔧 Función 4: `rpa-accion-urgente` (NUEVA)

**Endpoint final:** `https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/rpa-accion-urgente`

**Archivo a copiar:**
`supabase/deploy-ready/rpa-accion-urgente/index.ts`

**Pasos:**
1. Ve a **Edge Functions**
2. Haz clic en **Create a new function**
3. **Nombre:** `rpa-accion-urgente` (con guiones, NO con `/`)
4. Copia **TODO** el contenido de `supabase/deploy-ready/rpa-accion-urgente/index.ts`
5. Pega en el editor
6. Haz clic en **Deploy**

**Qué hace:**
- Retorna voluntarios con `score_riesgo_baja >= 75` OR `flag_brecha_cap = true`
- Endpoint para BluePrism (RF-04)

---

## ✅ Verificación Post-Despliegue

### 1. Verificar SQL:
```sql
-- Ejecutar en SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'voluntarios' 
ORDER BY ordinal_position;
```

**Debe mostrar todas las columnas nuevas.**

### 2. Probar Edge Functions:

#### Probar `/voluntarios`:
```bash
curl -X POST https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/voluntarios \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test IA",
    "correo": "test@test.com",
    "region": "Metropolitana",
    "edad": 25,
    "area_estudio": "SALUD",
    "tiene_capacitacion": false,
    "estado": "Receso"
  }'
```

**Verificar en respuesta:**
- ✅ `score_riesgo_baja` debe ser > 0
- ✅ `flag_brecha_cap` debe ser `true` (porque SALUD sin capacitación)
- ✅ `rango_etario` debe ser "18-29 años"

#### Probar `/buscar`:
```bash
curl "https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/buscar?min_score_riesgo=75" \
  -H "Authorization: Bearer TU_ANON_KEY"
```

**Verificar:**
- ✅ Retorna JSON con `{ "success": true, "data": [...] }`
- ✅ Solo voluntarios con score >= 75

#### Probar `/rpa-accion-urgente`:
```bash
curl "https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1/rpa-accion-urgente" \
  -H "Authorization: Bearer TU_ANON_KEY"
```

**Verificar:**
- ✅ Retorna JSON con `{ "success": true, "data": [...], "total": N }`
- ✅ Solo voluntarios urgentes (score >= 75 o flag = true)

---

## 🔍 Troubleshooting

### Error: "Column does not exist"
- **Causa:** SQL no se ejecutó correctamente
- **Solución:** Ejecutar `supabase/schema/voluntarios.sql` nuevamente

### Error: "Function not found"
- **Causa:** Función no se desplegó
- **Solución:** Verificar que el nombre de la función sea correcto (sin `/`)

### Error: "Import error" en `/voluntarios`
- **Causa:** Intentó importar desde otra función
- **Solución:** Usar la versión de `supabase/deploy-ready/voluntarios/index.ts` (tiene IA inline)

### Error: CORS bloqueado
- **Causa:** Headers CORS incorrectos
- **Solución:** Verificar que las funciones tengan `getCorsHeaders()` correcto

---

## 📊 Resumen de Endpoints

| Función | Endpoint | Método | Descripción |
|---------|----------|--------|-------------|
| `voluntarios` | `/functions/v1/voluntarios` | POST, PUT | Registro/actualización con IA |
| `buscar` | `/functions/v1/buscar` | GET | Búsqueda con filtros avanzados |
| `rpa-accion-urgente` | `/functions/v1/rpa-accion-urgente` | GET, POST | Voluntarios urgentes (BluePrism) |
| `inteligencia_predictiva` | `/functions/v1/inteligencia_predictiva` | - | Solo exporta funciones (opcional) |

---

## 🎯 Checklist Final

Antes de considerar el despliegue completo:

- [ ] SQL ejecutado sin errores
- [ ] Función `voluntarios` actualizada y desplegada
- [ ] Función `buscar` actualizada y desplegada
- [ ] Función `rpa-accion-urgente` creada y desplegada
- [ ] Función `inteligencia_predictiva` creada (opcional)
- [ ] Todas las funciones responden correctamente
- [ ] Frontend puede registrar voluntarios con IA
- [ ] Frontend puede buscar con nuevos filtros
- [ ] Dashboard muestra métricas de IA

---

## 🚀 Siguiente Paso

Una vez completado el despliegue:

1. **Ejecutar seed (opcional):**
   ```bash
   cd Back-end
   npm run seed
   ```

2. **Verificar Dashboard:**
   - Abrir Next.js en desarrollo
   - Verificar que aparezcan KPIs de IA (En Riesgo, Brechas)

3. **Probar registro:**
   - Registrar un voluntario con `edad`, `area_estudio`, etc.
   - Verificar que se calcule `score_riesgo_baja` y `flag_brecha_cap`

---

**¡Despliegue completado!** 🎉

