import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { procesarVoluntario } from "../inteligencia_predictiva/index.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[voluntarios] Supabase env vars not configured correctly");
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
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    ...(extra || {})
  };
}

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(req)
    });
  }

  if (req.method !== "POST" && req.method !== "PUT") {
    const body = {
      success: false,
      message: "Metodo no permitido. Usa POST o PUT.",
      details: `Method: ${req.method}`
    };
    return new Response(JSON.stringify(body), {
      status: 405,
      headers: getCorsHeaders(req, { "Content-Type": "application/json" })
    });
  }

  try {
    const rawBody = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      const body = {
        success: false,
        message: "Body invalido. Debe ser JSON.",
        details: ""
      };
      return new Response(JSON.stringify(body), {
        status: 400,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

    console.log("[voluntarios] Body recibido:", {
      nombre: rawBody["nombre"],
      correo: rawBody["correo"],
      region: rawBody["region"],
      edad: rawBody["edad"],
      tiene_habilidades: !!rawBody["habilidades"] || !!rawBody["habilidades_input"],
      tiene_campanas: !!rawBody["campañas"] || !!rawBody["campanas_input"]
    });

    const nombre = (rawBody["nombre"] || "").toString().trim();
    const correo = (rawBody["correo"] || "").toString().trim();
    const region = (rawBody["region"] || "").toString().trim();

    const habilidades = parseToArray(
      rawBody["habilidades"] ?? rawBody["habilidades_input"]
    );
    const campañas = parseToArray(
      rawBody["campañas"] ?? rawBody["campanas_input"] ?? rawBody["campañas_input"]
    );

    const nivel_educacional = (rawBody["nivel_educacional"] || "").toString().trim();
    const edad = rawBody["edad"] ? Number(rawBody["edad"]) : undefined;
    const area_estudio = (rawBody["area_estudio"] || "").toString().trim();
    const estado = (rawBody["estado"] || "Activo").toString().trim();
    const razon_no_continuar = (rawBody["razon_no_continuar"] || "").toString().trim();
    const tiene_capacitacion = Boolean(rawBody["tiene_capacitacion"] || false);
    const programa_asignado = (rawBody["programa_asignado"] || "").toString().trim();
    const fecha_rechazo_count = Number(rawBody["fecha_rechazo_count"] || 0);

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

    const payloadBase: Record<string, unknown> = {
      nombre,
      correo,
      region
    };

    if (nivel_educacional) {
      payloadBase.nivel_educacional = nivel_educacional;
    }

    if (habilidades.length > 0) {
      payloadBase.habilidades = habilidades;
    }

    if (campañas.length > 0) {
      payloadBase.campañas = campañas;
    }

    if (edad) {
      payloadBase.edad = edad;
    }

    if (area_estudio) {
      payloadBase.area_estudio = area_estudio;
    }

    if (estado) {
      payloadBase.estado = estado;
    }

    if (razon_no_continuar) {
      payloadBase.razon_no_continuar = razon_no_continuar;
    }

    payloadBase.tiene_capacitacion = tiene_capacitacion;

    if (programa_asignado) {
      payloadBase.programa_asignado = programa_asignado;
    }

    payloadBase.fecha_rechazo_count = fecha_rechazo_count;

    console.log("[voluntarios] Aplicando inteligencia predictiva...");
    const payloadConIA = procesarVoluntario(payloadBase);
    console.log("[voluntarios] IA aplicada:", {
      score_riesgo_baja: payloadConIA.score_riesgo_baja,
      flag_brecha_cap: payloadConIA.flag_brecha_cap
    });

    let data: unknown = null;
    let error: { message: string; code?: string } | null = null;

    const isUpdate = req.method === "PUT" && rawBody["id"];

    if (isUpdate) {
      const id = rawBody["id"];
      console.log("[voluntarios] Actualizando voluntario ID:", id);
      
      const updateResult = await supabase
        .from("voluntarios")
        .update(payloadConIA)
        .eq("id", id)
        .select()
        .single();

      if (updateResult.error) {
        error = updateResult.error;
        console.error("[voluntarios] Error en update:", error.message, error.code);
      } else {
        data = updateResult.data;
        console.log("[voluntarios] Update exitoso");
      }
    } else {
      const checkResult = await supabase
        .from("voluntarios")
        .select("id, correo")
        .eq("correo", correo)
        .maybeSingle();

      if (checkResult.error && checkResult.error.code !== "PGRST116") {
        error = checkResult.error;
        console.error("[voluntarios] Error al verificar existencia:", error.message);
      } else {
        if (checkResult.data) {
          console.log("[voluntarios] Correo existe, haciendo update...");
          const updateResult = await supabase
            .from("voluntarios")
            .update(payloadConIA)
            .eq("correo", correo)
            .select()
            .single();

          if (updateResult.error) {
            error = updateResult.error;
            console.error("[voluntarios] Error en update:", error.message, error.code);
          } else {
            data = updateResult.data;
            console.log("[voluntarios] Update exitoso");
          }
        } else {
          console.log("[voluntarios] Correo no existe, haciendo insert...");
          const insertResult = await supabase
            .from("voluntarios")
            .insert(payloadConIA)
            .select()
            .single();

          if (insertResult.error) {
            error = insertResult.error;
            console.error("[voluntarios] Error en insert:", error.message, error.code);
          } else {
            data = insertResult.data;
            console.log("[voluntarios] Insert exitoso");
          }
        }
      }
    }

    if (error) {
      console.error("[voluntarios] Error final Supabase:", {
        message: error.message,
        code: error.code
      });
      const body = {
        success: false,
        message: "Error al registrar voluntario",
        details: `${error.message}${error.code ? ` (Codigo: ${error.code})` : ''}`
      };
      return new Response(JSON.stringify(body), {
        status: 500,
        headers: getCorsHeaders(req, { "Content-Type": "application/json" })
      });
    }

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
