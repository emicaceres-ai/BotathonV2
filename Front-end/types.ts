export interface Volunteer {
  id?: string;
  nombre: string;
  correo: string;
  region: string;
  habilidades: string[];
  campañas: string[];
  nivel_educacional: string;
  telefono?: string; // Optional, kept for backward compatibility if API returns it
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  fecha_registro?: string;
}

export interface SearchFilters {
  region?: string;
  habilidad?: string;
  campana?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Stats for the dashboard visualization
export interface VolunteerStats {
  region: string;
  count: number;
}