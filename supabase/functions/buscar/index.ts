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

// Servidor principal
Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders()
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
      headers: getCorsHeaders({ "Content-Type": "application/json" })
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
        headers: getCorsHeaders({ "Content-Type": "application/json" })
      });
    }

    // Respuesta estándar de éxito
    const body = {
      success: true,
      data: data ?? []
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: getCorsHeaders({ "Content-Type": "application/json" })
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
      headers: getCorsHeaders({ "Content-Type": "application/json" })
    });
  }
});

