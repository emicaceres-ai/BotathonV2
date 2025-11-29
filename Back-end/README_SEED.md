# 🌱 Script de Seed para Voluntarios

Este script genera e inserta datos sintéticos en la tabla `voluntarios` de Supabase.

## 📋 Requisitos Previos

1. **Node.js y npm** instalados
2. **Service Role Key** de Supabase (no la anon key, sino la service role key)

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   cd Back-end
   npm install
   ```

2. **Configurar variables de entorno:**
   
   Crea un archivo `.env` en la carpeta `Back-end/` con:
   ```env
   SUPABASE_URL=https://tatvmyjoinyfkxeclbso.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```
   
   **⚠️ IMPORTANTE:** Necesitas la **Service Role Key**, no la Anon Key.
   
   Para obtenerla:
   - Ve a tu proyecto en Supabase
   - Settings > API
   - Copia la `service_role` key (secret) - **NO la anon key**

## 🎯 Ejecución

```bash
npm run seed:voluntarios
```

## 📊 Qué hace el script

- **Genera entre 40-60 registros** sintéticos aleatorios
- **Datos realistas chilenos:**
  - Nombres y apellidos chilenos comunes
  - Correos únicos generados
  - 16 regiones de Chile distribuidas aleatoriamente
  - Habilidades: 1-4 seleccionadas de la lista
  - Campañas: combinaciones de años (2021-2024)
  - Niveles educacionales variados
  - Estados: 60% aprobado, 30% pendiente, 10% rechazado

- **Inserta en lotes** de 20 registros para evitar problemas de tamaño
- **Muestra estadísticas** al finalizar

## 📝 Estructura de Datos Generados

Cada registro incluye:
```typescript
{
  nombre: string,              // Ej: "Fernanda Rivas"
  correo: string,             // Ej: "fernanda.rivas0@gmail.com"
  region: string,              // Una de las 16 regiones de Chile
  habilidades: string[],       // 1-4 habilidades seleccionadas
  campañas: string[],          // Combinaciones de años
  nivel_educacional: string,  // Media Completa, Universitaria, etc.
  estado: "aprobado" | "pendiente" | "rechazado"
}
```

## ✅ Verificación

Después de ejecutar el script, verifica en tu dashboard que:
- Se muestran los voluntarios generados
- Las estadísticas por región son visibles
- Los filtros funcionan correctamente
- Los gráficos muestran datos

## 🔄 Ejecutar Nuevamente

Si quieres regenerar los datos:
1. **Opcional:** Limpia la tabla primero (desde Supabase Dashboard)
2. Ejecuta el script nuevamente: `npm run seed:voluntarios`

## ⚠️ Notas

- El script usa la **Service Role Key** que tiene permisos completos
- Los correos generados son únicos pero ficticios
- Los datos son completamente sintéticos y no representan personas reales
- El script es idempotente: puedes ejecutarlo múltiples veces

