export interface Volunteer {
  id: string;
  nombre: string;
  region: string;
  area_estudio: string;
  rango_etario: string;
  estado: boolean; // true = activo, false = inactivo/riesgo
  score_riesgo_baja: number; // 0-100
  flag_brecha_cap: boolean;
  representatividad_regional_pct?: number; // Only relevant for aggregation logic
  
  // Extended fields for Registration Form
  rut?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  genero?: string;
  estado_civil?: string;
  nacionalidad?: string;
  
  email?: string;
  telefono?: string;
  direccion?: string;
  comuna?: string;
  
  nivel_educacional?: string;
  institucion?: string;
  profesion?: string;
  ano_cursado?: string;
}

export interface RegionMetric {
  name: string;
  value: number; // Percentage
  volunteers: number;
}

export interface AreaMetric {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
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