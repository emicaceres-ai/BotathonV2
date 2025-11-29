export interface Volunteer {
  id?: string;
  nombre: string;
  correo?: string;
  region: string;
  area_estudio?: string;
  rango_etario?: string;
  edad?: number;
  estado?: string;
  score_riesgo_baja?: number;
  flag_brecha_cap?: boolean;
  habilidades?: string[];
  campañas?: string[];
  nivel_educacional?: string;
  tiene_capacitacion?: boolean;
  programa_asignado?: string;
  razon_no_continuar?: string;
  fecha_rechazo_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RegionMetric {
  name: string;
  value: number;
  volunteers: number;
}

export interface AreaMetric {
  name: string;
  value: number;
  color: string;
}

export enum FilterArea {
  ALL = 'Todos',
  SALUD = 'Salud',
  EDUCACION = 'Educación',
  SOCIAL = 'Social',
  INGENIERIA = 'Ingeniería',
  OTRO = 'Otro'
}

export type AppView = 'dashboard' | 'volunteers' | 'upload' | 'settings';

