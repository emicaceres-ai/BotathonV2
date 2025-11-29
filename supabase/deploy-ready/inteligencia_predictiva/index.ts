export interface VoluntarioData {
  nombre?: string;
  edad?: number;
  rango_etario?: string;
  region?: string;
  area_estudio?: string;
  estado?: string;
  razon_no_continuar?: string;
  tiene_capacitacion?: boolean;
  programa_asignado?: string;
  fecha_rechazo_count?: number;
  habilidades?: string[];
  campañas?: string[];
  [key: string]: unknown;
}

export interface VoluntarioProcesado extends VoluntarioData {
  score_riesgo_baja: number;
  flag_brecha_cap: boolean;
}

export function calcularRangoEtario(edad: number): string {
  if (edad >= 18 && edad <= 29) {
    return "18-29 años";
  } else if (edad >= 30 && edad <= 39) {
    return "30-39 años";
  } else if (edad >= 40 && edad <= 49) {
    return "40-49 años";
  } else if (edad >= 50 && edad <= 59) {
    return "50-59 años";
  } else {
    return "60+ años";
  }
}

export function calcularScoreRiesgo(data: VoluntarioData): number {
  let score = 0;
  
  const razon = String(data.razon_no_continuar || "").toLowerCase();
  if (razon.includes("falta de tiempo") || razon.includes("tiempo")) {
    score += 40;
  }
  
  const rangoEtario = String(data.rango_etario || "");
  if (rangoEtario.includes("18-29")) {
    score += 35;
  }
  
  const estado = String(data.estado || "");
  if (estado === "Receso" || estado === "Sin Asignación") {
    score += 25;
  }
  
  const fechaRechazoCount = Number(data.fecha_rechazo_count || 0);
  if (fechaRechazoCount >= 2) {
    score += 20;
  }
  
  const programaAsignado = data.programa_asignado;
  if (!programaAsignado || String(programaAsignado).trim() === "") {
    score += 15;
  }
  
  return Math.min(score, 100);
}

export function calcularFlagBrecha(data: VoluntarioData): boolean {
  const areaEstudio = String(data.area_estudio || "").toUpperCase();
  const tieneCapacitacion = Boolean(data.tiene_capacitacion || false);
  
  if (areaEstudio === "SALUD" && !tieneCapacitacion) {
    return true;
  }
  
  return false;
}

export function procesarVoluntario(data: VoluntarioData): VoluntarioProcesado {
  const procesado: VoluntarioProcesado = {
    ...data,
    score_riesgo_baja: 0,
    flag_brecha_cap: false
  };
  
  if (data.edad && !data.rango_etario) {
    procesado.rango_etario = calcularRangoEtario(data.edad);
  }
  
  procesado.score_riesgo_baja = calcularScoreRiesgo(procesado);
  procesado.flag_brecha_cap = calcularFlagBrecha(procesado);
  
  return procesado;
}

