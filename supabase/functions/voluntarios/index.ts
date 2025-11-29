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
    // No incluir 'estado' ya que la columna no existe en la BD

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

    // Preparar payload base para upsert (sin 'estado' ya que no existe en la BD)
    const payload: Record<string, unknown> = {
      nombre,
      correo,
      region
    };

    // Solo incluir nivel_educacional si tiene valor
    if (nivel_educacional) {
      payload.nivel_educacional = nivel_educacional;
    }

    // Solo incluir habilidades si tiene valores
    if (habilidades.length > 0) {
      payload.habilidades = habilidades;
    }

    // Intentar upsert - primero sin campañas para evitar problemas de encoding
    let data: unknown = null;
    let error: { message: string; code?: string } | null = null;

    console.log("[voluntarios] Intentando upsert con payload:", {
      nombre,
      correo,
      region,
      tiene_nivel: !!nivel_educacional,
      tiene_habilidades: habilidades.length > 0,
      tiene_campanas: campañas.length > 0
    });

    // Estrategia: Intentar primero sin campañas (más seguro)
    const result = await supabase
      .from("voluntarios")
      .upsert(payload, {
        onConflict: "correo"
      })
      .select()
      .single();

    if (result.error) {
      error = result.error;
      console.error("[voluntarios] Error en upsert inicial:", error.message, error.code);
      
      // Si el error es por onConflict, intentar sin especificar onConflict
      if (error.code === "23505" || error.message?.includes("duplicate") || error.message?.includes("unique")) {
        console.log("[voluntarios] Error de duplicado, intentando insert normal...");
        const insertResult = await supabase
          .from("voluntarios")
          .insert(payload)
          .select()
          .single();
        
        if (insertResult.error) {
          error = insertResult.error;
        } else {
          data = insertResult.data;
          console.log("[voluntarios] Insert exitoso");
        }
      }
    } else {
      data = result.data;
      console.log("[voluntarios] Upsert exitoso");
      
      // Si hay campañas y el upsert fue exitoso, intentar actualizar solo las campañas
      if (campañas.length > 0 && data) {
        console.log("[voluntarios] Intentando actualizar campañas por separado...");
        const campanaVariants = ["campanas", "campañas", "campaÃ±as"];
        
        for (const variant of campanaVariants) {
          const updateResult = await supabase
            .from("voluntarios")
            .update({ [variant]: campañas })
            .eq("correo", correo)
            .select()
            .single();
          
          if (!updateResult.error) {
            data = updateResult.data;
            console.log(`[voluntarios] Campañas actualizadas usando: ${variant}`);
            break;
          }
        }
      }
    }

    if (error) {
      console.error("[voluntarios] Error final Supabase:", {
        message: error.message,
        code: error.code,
        hint: error.message
      });
      const body = {
        success: false,
        message: "Error al registrar voluntario",
        details: `${error.message}${error.code ? ` (Código: ${error.code})` : ''}`
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

