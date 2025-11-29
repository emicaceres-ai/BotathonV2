import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[rpa-accion-urgente] Supabase env vars not configured correctly");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

function getOrigin(req: Request): string {
  const origin = req.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  
  return "*";
}

function getCorsHeaders(req: Request, extra?: Record<string, string>) {
  return {
    "Access-Control-Allow-Origin": getOrigin(req),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    ...(extra || {})
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    const body = {
      success: false,
      message: "Metodo no permitido. Usa GET o POST.",
      details: `Method: ${req.method}`
    };
    return new Response(JSON.stringify(body), {
      status: 405,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  try {
    console.log("[rpa-accion-urgente] Buscando voluntarios con accion urgente...");

    const { data, error } = await supabase
      .from("voluntarios")
      .select("*")
      .or("score_riesgo_baja.gte.75,flag_brecha_cap.eq.true");

    if (error) {
      console.error("[rpa-accion-urgente] Error Supabase:", error.message);
      const body = {
        success: false,
        message: "Error al buscar voluntarios con accion urgente",
        details: error.message
      };
      return new Response(JSON.stringify(body), {
        status: 500,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    const voluntariosUrgentes = data ?? [];
    
    console.log(`[rpa-accion-urgente] Encontrados ${voluntariosUrgentes.length} voluntarios con accion urgente`);

    const body = {
      success: true,
      data: voluntariosUrgentes,
      total: voluntariosUrgentes.length,
      criterios: {
        score_riesgo_baja_minimo: 75,
        flag_brecha_cap: true
      }
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  } catch (err) {
    console.error("[rpa-accion-urgente] Error interno:", err instanceof Error ? err.message : String(err));
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

