import { API_CONFIG } from '../constants';
import { Volunteer } from '../types';

const BASE_URL = API_CONFIG.BASE_URL;
const ANON_KEY = API_CONFIG.ANON_KEY;

async function fetchEdgeFunction(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const supabaseService = {
  // Registrar o actualizar voluntario
  async createVolunteer(volunteer: Partial<Volunteer>): Promise<{ success: boolean; data?: Volunteer; message?: string }> {
    return fetchEdgeFunction('/voluntarios', {
      method: 'POST',
      body: JSON.stringify(volunteer),
    });
  },

  // Buscar voluntarios con filtros
  async searchVolunteers(filters: {
    region?: string;
    habilidad?: string;
    campaña?: string;
    estado?: string;
    programa_asignado?: string;
    rango_etario?: string;
    min_score_riesgo?: number;
    flag_brecha_cap?: boolean;
  }): Promise<{ success: boolean; data?: Volunteer[]; message?: string }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    
    const query = params.toString();
    return fetchEdgeFunction(`/buscar${query ? `?${query}` : ''}`);
  },

  // Obtener voluntarios urgentes (RPA)
  async getUrgentVolunteers(): Promise<{ success: boolean; data?: Volunteer[]; total?: number; message?: string }> {
    return fetchEdgeFunction('/rpa-accion-urgente');
  },
};

