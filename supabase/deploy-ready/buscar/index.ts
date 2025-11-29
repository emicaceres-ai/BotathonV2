import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[buscar] Supabase env vars not configured correctly");
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

  if (req.method !== "GET") {
    const body = {
      success: false,
      message: "Metodo no permitido. Usa GET.",
      details: `Method: ${req.method}`
    };
    return new Response(JSON.stringify(body), {
      status: 405,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  try {
    const url = new URL(req.url);

    const region = (url.searchParams.get("region") || "").trim();
    const habilidad = (url.searchParams.get("habilidad") || "").trim();
    const campaña = (url.searchParams.get("campaña") || "").trim();
    const estado = (url.searchParams.get("estado") || "").trim();
    const programa_asignado = (url.searchParams.get("programa_asignado") || "").trim();
    const rango_etario = (url.searchParams.get("rango_etario") || "").trim();
    const min_score_riesgo = url.searchParams.get("min_score_riesgo");
    const flag_brecha_cap = url.searchParams.get("flag_brecha_cap");

    console.log("[buscar] Filtros recibidos:", {
      region: region || "(vacío)",
      habilidad: habilidad || "(vacío)",
      campaña: campaña || "(vacío)",
      estado: estado || "(vacío)",
      programa_asignado: programa_asignado || "(vacío)",
      rango_etario: rango_etario || "(vacío)",
      min_score_riesgo: min_score_riesgo || "(vacío)",
      flag_brecha_cap: flag_brecha_cap || "(vacío)"
    });

    let query = supabase.from("voluntarios").select("*");

    if (region) {
      query = query.eq("region", region);
    }

    if (estado) {
      query = query.eq("estado", estado);
    }

    if (programa_asignado) {
      query = query.eq("programa_asignado", programa_asignado);
    }

    if (rango_etario) {
      query = query.eq("rango_etario", rango_etario);
    }

    if (habilidad) {
      query = query.contains("habilidades", [habilidad]);
    }

    if (campaña) {
      query = query.contains("campañas", [campaña]);
    }

    if (min_score_riesgo) {
      const minScore = Number(min_score_riesgo);
      if (!isNaN(minScore)) {
        query = query.gte("score_riesgo_baja", minScore);
      }
    }

    if (flag_brecha_cap !== null && flag_brecha_cap !== "") {
      const flagValue = flag_brecha_cap.toLowerCase() === "true" || flag_brecha_cap === "1";
      query = query.eq("flag_brecha_cap", flagValue);
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

