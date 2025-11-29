# 🧪 Pruebas Automatizadas - BotathonV2

Este directorio contiene todas las pruebas automatizadas para validar el funcionamiento de Supabase Edge Functions y el Dashboard de Next.js.

---

## 📁 Estructura

```
tests-supabase/
├── test-voluntarios.http      # Pruebas manuales HTTP para /voluntarios
├── test-buscar.http           # Pruebas manuales HTTP para /buscar
├── test-rpa.http              # Pruebas manuales HTTP para /rpa-accion-urgente
├── run-tests.js               # Script automatizado de pruebas backend
├── auto-seed.js               # Script de carga de datos sintéticos
├── dashboard-test.js          # Script de pruebas E2E del Dashboard
├── scripts/                   # Scripts auxiliares (futuro)
├── results/                   # Reportes JSON generados
│   ├── backend-report.json
│   └── dashboard-report.json
└── screenshots/               # Capturas de pantalla del Dashboard
```

---

## 🚀 Inicio Rápido

### Orden Recomendado de Ejecución

```bash
# 0. (Opcional) Verificar conexión primero
npm run check:connection

# 1. Cargar datos sintéticos (20 voluntarios con IA aplicada)
npm run seed:test

# 2. Probar Edge Functions backend
npm run test:supabase

# 3. Probar Dashboard frontend
npm run test:dashboard

# O ejecutar todo en secuencia:
npm run test:all
```

### 🔍 Si hay errores de conexión

Si ves errores "fetch failed", ejecuta primero:

```bash
npm run check:connection
```

Este script verifica:
- ✅ Variables de entorno configuradas
- ✅ Conexión a Supabase
- ✅ Edge Functions desplegadas
- ✅ Autenticación funcionando

---

## 📋 Pruebas Backend

### Archivos .http (Pruebas Manuales)

Estos archivos pueden usarse con extensiones como **REST Client** (VS Code) o **Thunder Client**:

- `test-voluntarios.http` - Pruebas de registro/actualización
- `test-buscar.http` - Pruebas de búsqueda con filtros
- `test-rpa.http` - Pruebas del endpoint RPA

**Uso:**
1. Abre el archivo `.http` en VS Code
2. Instala la extensión "REST Client"
3. Haz clic en "Send Request" sobre cada petición

### Script Automatizado: `run-tests.js`

**Comando:** `npm run test:supabase`

**Qué hace:**
1. ✅ Prueba `POST /voluntarios` con datos completos
2. ✅ Valida que la IA se aplica (score_riesgo_baja, flag_brecha_cap, rango_etario)
3. ✅ Prueba `GET /buscar` sin filtros y con filtros
4. ✅ Prueba `GET /rpa-accion-urgente`
5. ✅ Genera reporte en `results/backend-report.json`

**Validaciones:**
- HTTP status codes correctos
- Respuestas JSON válidas
- `score_riesgo_baja` es número >= 0
- `flag_brecha_cap` es boolean
- `rango_etario` calculado automáticamente si hay `edad`
- Filtros de búsqueda funcionan
- RPA retorna solo voluntarios urgentes

**Salida esperada:**
```
🧪 PRUEBAS AUTOMATIZADAS DE SUPABASE
============================================================

ℹ️ Probando /voluntarios (POST)...
  ✓ IA funcionando: score=80, flag=true
ℹ️ Probando /buscar (GET)...
  ✓ Búsqueda funcionando: 25 total, 5 en riesgo
ℹ️ Probando /rpa-accion-urgente (GET)...
  ✓ RPA funcionando: 5 voluntarios urgentes

============================================================
📊 RESUMEN DE PRUEBAS
============================================================
Total: 3
✅ Pasadas: 3
❌ Fallidas: 0

🎯 ESTADO DE FUNCIONES
============================================================
✅ IA funcionando (score_riesgo_baja y flag_brecha_cap calculados)
✅ Buscador funcionando (filtros aplicados correctamente)
✅ RPA funcionando (voluntarios urgentes detectados)
```

---

## 🌱 Carga de Datos Sintéticos

### Script: `auto-seed.js`

**Comando:** `npm run seed:test`

**Qué hace:**
1. ✅ Genera 20 voluntarios sintéticos con datos variados
2. ✅ Envía cada uno a `POST /voluntarios` (IA se aplica automáticamente)
3. ✅ Valida que la IA se aplicó en cada inserción
4. ✅ Ejecuta automáticamente `run-tests.js` al finalizar

**Datos generados:**
- Nombres y correos únicos
- Edades 18-60 años
- Regiones aleatorias de Chile
- Áreas de estudio variadas
- Estados: Activo, Receso, Sin Asignación
- Habilidades y campañas aleatorias
- Campos para activar IA (razon_no_continuar, fecha_rechazo_count, etc.)

**Salida esperada:**
```
🌱 CARGA AUTOMÁTICA DE DATOS SINTÉTICOS
============================================================

📊 Generando 20 voluntarios sintéticos...

   [1/20] Insertando Juan González 0... ✅ (score: 80, flag: true)
   [2/20] Insertando María Rodríguez 1... ✅ (score: 15, flag: false)
   ...

============================================================
📊 RESUMEN DEL SEED
============================================================
✅ Insertados exitosamente: 20
📈 Total procesado: 20

✅ Seed completado! Los datos están listos para pruebas.
🚀 Ejecutando pruebas automáticas...
```

---

## 🖥️ Pruebas Frontend (Dashboard)

### Script: `dashboard-test.js`

**Comando:** `npm run test:dashboard`

**Qué hace:**
1. ✅ Inicia automáticamente el servidor Next.js (`npm run dev`)
2. ✅ Espera a que esté activo en `http://localhost:3000`
3. ✅ Abre navegador controlado (Playwright)
4. ✅ Visita `/dashboard`
5. ✅ Valida KPIs visibles:
   - Total Voluntarios
   - Regiones Activas
   - Nuevos Hoy
   - En Riesgo
   - Brechas Detectadas
6. ✅ Valida valores numéricos en KPIs
7. ✅ Valida gráfico de distribución
8. ✅ Toma capturas de pantalla:
   - Pantalla completa
   - Cada tarjeta KPI
   - Gráfico
9. ✅ Genera reporte en `results/dashboard-report.json`

**Requisitos:**
- Node.js instalado
- Playwright instalado (se instala automáticamente con `npm install`)
- Next.js debe estar configurado en `Front-end/`

**Salida esperada:**
```
ℹ️ Iniciando servidor Next.js...
✅ Servidor Next.js iniciado
ℹ️ Esperando a que el servidor esté listo...
ℹ️ Iniciando navegador...
ℹ️ Visitando dashboard...
  ✓ Captura completa guardada
  ✓ Dashboard cargado correctamente
  ✓ Todos los KPIs visibles
  ✓ KPIs muestran valores numéricos
  ✓ Gráfico visible

============================================================
📊 RESUMEN DE PRUEBAS DEL DASHBOARD
============================================================
Total: 4
✅ Pasadas: 4
❌ Fallidas: 0
📸 Screenshots: 6
📄 Reporte guardado en: tests-supabase/results/dashboard-report.json

🎯 ESTADO DEL DASHBOARD
============================================================
✅ Dashboard cargado correctamente
✅ KPIs funcionan (todos visibles)
✅ Datos sintéticos visibles (valores numéricos presentes)
```

---

## 📊 Reportes Generados

### `results/backend-report.json`

Contiene:
- Timestamp de ejecución
- Resultados de cada prueba
- Detalles de validación de IA
- Resumen (total, pasadas, fallidas)

**Estructura:**
```json
{
  "timestamp": "2024-11-29T...",
  "tests": [
    {
      "name": "POST /voluntarios",
      "status": "passed",
      "details": {
        "iaValidation": {
          "score_riesgo_baja": 80,
          "flag_brecha_cap": true,
          "rango_etario": "18-29 años",
          "iaWorking": true
        }
      }
    }
  ],
  "summary": {
    "total": 3,
    "passed": 3,
    "failed": 0
  }
}
```

### `results/dashboard-report.json`

Contiene:
- Timestamp de ejecución
- URL probada
- Resultados de cada test
- Lista de screenshots generados
- Resumen

**Estructura:**
```json
{
  "timestamp": "2024-11-29T...",
  "url": "http://localhost:3000/dashboard",
  "tests": [
    {
      "name": "Dashboard cargado",
      "status": "passed",
      "details": { "title": "..." }
    }
  ],
  "screenshots": [
    "tests-supabase/screenshots/dashboard-full-...png",
    "tests-supabase/screenshots/kpi-total-voluntarios-...png"
  ],
  "summary": {
    "total": 4,
    "passed": 4,
    "failed": 0
  }
}
```

---

## 🖼️ Screenshots

Las capturas se guardan en `tests-supabase/screenshots/`:

- `dashboard-full-*.png` - Pantalla completa del dashboard
- `kpi-*.png` - Capturas individuales de cada KPI
- `chart-*.png` - Captura del gráfico de distribución

---

## ⚙️ Configuración

### Variables de Entorno

Los scripts buscan variables en este orden:
1. `.env.local` (raíz)
2. `.env` (raíz)
3. `Front-end/.env.local`

**Variables requeridas:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://tatvmyjoinyfkxeclbso.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 🔧 Instalación de Dependencias

```bash
# Instalar dependencias de pruebas
npm install

# Instalar navegadores de Playwright (solo primera vez)
npx playwright install chromium
```

---

## 🐛 Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida"
- **Solución:** Crea `.env.local` en la raíz con la variable

### Error: "Servidor no respondió a tiempo"
- **Solución:** Verifica que el puerto 3000 esté libre
- **Solución:** Aumenta el timeout en `dashboard-test.js`

### Error: "Playwright no encontrado"
- **Solución:** Ejecuta `npx playwright install chromium`

### Error: "Dashboard no cargó"
- **Solución:** Verifica que Next.js esté configurado correctamente
- **Solución:** Revisa la consola del servidor para errores

### Error: "KPIs no visibles"
- **Solución:** Verifica que el Dashboard esté usando los componentes correctos
- **Solución:** Revisa que los datos sintéticos se hayan insertado

---

## 📝 Interpretación de Errores

### Backend Tests

- **"IA no aplicada"**: La Edge Function `/voluntarios` no está calculando score/flag
- **"Búsqueda con problemas"**: La Edge Function `/buscar` no responde correctamente
- **"RPA con problemas"**: La Edge Function `/rpa-accion-urgente` no funciona

### Dashboard Tests

- **"Dashboard no cargó"**: Next.js no está corriendo o hay error en la página
- **"KPIs faltantes"**: Los componentes del Dashboard no están renderizando
- **"Datos no visibles"**: Los datos no se están cargando desde la API

---

## 🎯 Flujo Completo Recomendado

```bash
# 1. Cargar datos y probar backend
npm run seed:test

# 2. Probar dashboard (requiere datos cargados)
npm run test:dashboard

# 3. Ver reportes
cat tests-supabase/results/backend-report.json
cat tests-supabase/results/dashboard-report.json

# 4. Ver screenshots
# Abre tests-supabase/screenshots/ en el explorador
```

---

## 📚 Referencias

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Playwright Docs](https://playwright.dev/)
- [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

---

**¡Pruebas automatizadas listas!** 🎉

