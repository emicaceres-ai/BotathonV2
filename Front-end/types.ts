export interface Volunteer {
  id?: string;
  nombre: string;
  correo: string;
  edad?: number;
  rango_etario?: string;
  region: string;
  area_estudio?: string;
  estado?: string;
  razon_no_continuar?: string;
  tiene_capacitacion?: boolean;
  programa_asignado?: string;
  fecha_rechazo_count?: number;
  habilidades?: string[];
  campañas?: string[];
  nivel_educacional?: string;
  score_riesgo_baja?: number;
  flag_brecha_cap?: boolean;
  telefono?: string;
  fecha_registro?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SearchFilters {
  region?: string;
  habilidad?: string;
  campana?: string;
  estado?: string;
  programa_asignado?: string;
  rango_etario?: string;
  min_score_riesgo?: number;
  flag_brecha_cap?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string | null;
  message?: string;
  details?: string;
}

// Stats for the dashboard visualization
export interface VolunteerStats {
  region: string;
  count: number;
}

export interface DashboardMetrics {
  totalVolunteers: number;
  activeRegions: number;
  newToday: number;
  inRisk: number;
  brechasDetectadas: number;
  regionStats: VolunteerStats[];
}
