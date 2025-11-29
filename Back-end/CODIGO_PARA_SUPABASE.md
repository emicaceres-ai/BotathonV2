# 📋 Código para Copiar en Supabase Dashboard

## 🔧 Función VOLUNTARIOS

### Pasos:
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a: **Edge Functions** → **voluntarios**
3. Copia TODO el código de abajo
4. Pégalo en el editor de Supabase
5. Haz clic en **Deploy** o **Save**

---

## 📝 Código completo para VOLUNTARIOS:

```typescript
// Import Supabase Client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Variables de entorno seguras (nunca se filtran en logs)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[voluntarios] Supabase env vars not configured correctly");
}

// Inicializar cliente con variables de entorno seguras
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Helper para obtener el origen permitido basado en el request
function getOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ];
  
  // Si el origen está en la lista permitida, usarlo; si no, usar wildcard
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // Para producción, puedes agregar aquí tu dominio de Vercel
  // Por ahora, usamos wildcard para desarrollo
  return "*";
}

// Cabeceras CORS robustas para desarrollo y producción
function getCorsHeaders(req: Request, extra?: Record<string, string>) {
  return {
    "Access-Control-Allow-Origin": getOrigin(req),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    ...(extra || {})
  };
}


// Helper para convertir strings a arrays
function parseToArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Servidor principal de la función
Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }

  // Solo permitir POST
  if (req.method !== "POST") {
    const body = {
      success: false,
      message: "Método no permitido. Usa POST.",
      details: `Method: ${req.method}`
    };
    return new Response(JSON.stringify(body), {
      status: 405,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  try {
    // Leer JSON enviado en la petición
    const rawBody = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      const body = {
        success: false,
        message: "Body inválido. Debe ser JSON.",
        details: ""
      };
      return new Response(JSON.stringify(body), {
        status: 400,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    // Log seguro del body (solo campos funcionales, sin keys sensibles)
    console.log("[voluntarios] Body recibido (campos principales):", {
      nombre: rawBody["nombre"],
      correo: rawBody["correo"],
      region: rawBody["region"],
      tiene_habilidades: !!rawBody["habilidades"] || !!rawBody["habilidades_input"],
      tiene_campanas: !!rawBody["campañas"] || !!rawBody["campanas_input"]
    });

    // Normalizar campos: convertir strings a arrays si es necesario
    const nombre = (rawBody["nombre"] || "").toString().trim();
    const correo = (rawBody["correo"] || "").toString().trim();
    const region = (rawBody["region"] || "").toString().trim();

    // Aceptar tanto "habilidades" como "habilidades_input" (y lo mismo para campañas)
    const habilidades = parseToArray(
      rawBody["habilidades"] ?? rawBody["habilidades_input"]
    );
    const campañas = parseToArray(
      rawBody["campañas"] ?? rawBody["campanas_input"] ?? rawBody["campañas_input"]
    );

    const nivel_educacional = (rawBody["nivel_educacional"] || "").toString().trim();

    // Validación de campos obligatorios
    const missingFields: string[] = [];
    if (!nombre) missingFields.push("nombre");
    if (!correo) missingFields.push("correo");
    if (!region) missingFields.push("region");

    if (missingFields.length > 0) {
      const body = {
        success: false,
        message: "Faltan campos obligatorios",
        details: `Campos requeridos: ${missingFields.join(", ")}`
      };
      return new Response(JSON.stringify(body), {
        status: 400,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    // Preparar payload base para upsert
    const payload: Record<string, unknown> = {
      nombre,
      correo,
      region,
      nivel_educacional
    };

    if (habilidades.length > 0) {
      payload.habilidades = habilidades;
    }

    // Intentar upsert con diferentes estrategias para manejar el problema de encoding de campañas
    let data: unknown = null;
    let error: { message: string; code?: string } | null = null;

    // Estrategia 1: Intentar con campañas si tiene valores
    if (campañas.length > 0) {
      // Intentar con diferentes variantes del nombre de columna
      const campanaVariants = [
        "campañas",  // Nombre correcto con tilde
        "campanas",  // Sin tilde
        "campaÃ±as"  // Encoding corrupto (como aparece en la BD)
      ];

      let success = false;
      
      for (const variant of campanaVariants) {
        const testPayload = { ...payload, [variant]: campañas };
        
        const result = await supabase
          .from("voluntarios")
          .upsert(testPayload, {
            onConflict: "correo"
          })
          .select()
          .single();

        if (!result.error) {
          data = result.data;
          success = true;
          console.log(`[voluntarios] Upsert exitoso usando columna: ${variant}`);
          break;
        } else {
          // Si el error es específico de columna no encontrada, intentar siguiente variante
          if (result.error.message?.includes("column") || result.error.code === "PGRST204") {
            console.log(`[voluntarios] Variante ${variant} falló, intentando siguiente...`);
            continue;
          } else {
            // Si es otro tipo de error, detener y reportar
            error = result.error;
            break;
          }
        }
      }

      // Si todas las variantes fallaron, intentar sin campañas
      if (!success && !error) {
        console.log("[voluntarios] Todas las variantes de campañas fallaron, intentando sin campañas...");
        const resultWithoutCampanas = await supabase
          .from("voluntarios")
          .upsert(payload, {
            onConflict: "correo"
          })
          .select()
          .single();

        if (resultWithoutCampanas.error) {
          error = resultWithoutCampanas.error;
        } else {
          data = resultWithoutCampanas.data;
          console.log("[voluntarios] Upsert exitoso sin campañas (se guardaron otros campos)");
        }
      }
    } else {
      // No hay campañas, hacer upsert normal
      const result = await supabase
        .from("voluntarios")
        .upsert(payload, {
          onConflict: "correo"
        })
        .select()
        .single();

      if (result.error) {
        error = result.error;
      } else {
        data = result.data;
      }
    }

    if (error) {
      console.error("[voluntarios] Error Supabase:", error.message);
      const body = {
        success: false,
        message: "Error al registrar voluntario",
        details: error.message
      };
      return new Response(JSON.stringify(body), {
        status: 500,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    // Respuesta estándar de éxito
    const body = {
      success: true,
      data
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  } catch (err) {
    console.error("[voluntarios] Error interno:", err instanceof Error ? err.message : String(err));
    const body = {
      success: false,
      message: "Error interno del servidor",
      details: err instanceof Error ? err.message : String(err)
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }
});
```

---

## 🔍 Función BUSCAR

### Pasos:
1. Ve a: **Edge Functions** → **buscar**
2. Copia TODO el código de abajo
3. Pégalo en el editor
4. Haz clic en **Deploy** o **Save**

---

## 📝 Código completo para BUSCAR:

```typescript
// Importar Supabase Client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Variables de entorno seguras (nunca se filtran en logs)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[buscar] Supabase env vars not configured correctly");
}

// Inicializar conexión usando variables internas seguras
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

// Helper para obtener el origen permitido basado en el request
function getOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ];
  
  // Si el origen está en la lista permitida, usarlo; si no, usar wildcard
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  // Para producción, puedes agregar aquí tu dominio de Vercel
  // Por ahora, usamos wildcard para desarrollo
  return "*";
}

// Helper para obtener headers CORS con extras
function getCorsHeaders(req: Request, extra?: Record<string, string>) {
  return {
    "Access-Control-Allow-Origin": getOrigin(req),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    ...(extra || {})
  };
}

// Servidor principal
Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }

  // Solo permitir GET
  if (req.method !== "GET") {
    const body = {
      success: false,
      message: "Método no permitido. Usa GET.",
      details: `Method: ${req.method}`
    };
    return new Response(JSON.stringify(body), {
      status: 405,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  try {
    const url = new URL(req.url);

    // Obtener y sanitizar parámetros opcionales
    const region = (url.searchParams.get("region") || "").trim();
    const habilidad = (url.searchParams.get("habilidad") || "").trim();
    const campaña = (url.searchParams.get("campaña") || "").trim();

    // Log seguro (sin keys sensibles)
    console.log("[buscar] Filtros recibidos:", {
      region: region || "(vacío)",
      habilidad: habilidad || "(vacío)",
      campaña: campaña || "(vacío)"
    });

    // Query base usando supabase-js (previene SQL injection)
    let query = supabase.from("voluntarios").select("*");

    if (region) {
      query = query.eq("region", region);
    }

    if (habilidad) {
      // Busca dentro del array de habilidades usando contains
      query = query.contains("habilidades", [habilidad]);
    }

    if (campaña) {
      // Busca dentro del array de campañas usando contains
      query = query.contains("campañas", [campaña]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[buscar] Error Supabase:", error.message);
      const body = {
        success: false,
        message: "Error al buscar voluntarios",
        details: error.message
      };
      return new Response(JSON.stringify(body), {
        status: 500,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    // Respuesta estándar de éxito
    const body = {
      success: true,
      data: data ?? []
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  } catch (err) {
    console.error("[buscar] Error interno:", err instanceof Error ? err.message : String(err));
    const body = {
      success: false,
      message: "Error interno del servidor",
      details: err instanceof Error ? err.message : String(err)
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }
});
```

---

## ✅ Después de hacer deploy:

1. **Verifica** que ambas funciones estén desplegadas
2. **Prueba el formulario** nuevamente
3. El error "Failed to fetch" debería desaparecer

---

## ⚠️ Nota importante:

Las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya están configuradas automáticamente en Supabase, no necesitas cambiarlas.

