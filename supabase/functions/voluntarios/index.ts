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

// Cabeceras CORS robustas para desarrollo y producción
const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3000, https://<nombre-del-deploy-de-vercel>.vercel.app, *",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

// Helper para obtener headers CORS con extras
function getCorsHeaders(extra?: Record<string, string>) {
  return {
    ...corsHeaders,
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
      headers: getCorsHeaders()
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
      headers: getCorsHeaders({ "Content-Type": "application/json" })
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
        headers: getCorsHeaders({ "Content-Type": "application/json" })
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
    const estado = (rawBody["estado"] || "pendiente").toString().trim();

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
        headers: getCorsHeaders({ "Content-Type": "application/json" })
      });
    }

    // Preparar payload base para upsert
    const payload: Record<string, unknown> = {
      nombre,
      correo,
      region,
      nivel_educacional,
      estado
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
        headers: getCorsHeaders({ "Content-Type": "application/json" })
      });
    }

    // Respuesta estándar de éxito
    const body = {
      success: true,
      data
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: getCorsHeaders({ "Content-Type": "application/json" })
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
      headers: getCorsHeaders({ "Content-Type": "application/json" })
    });
  }
});

