import { API_CONFIG } from '../constants';
import { Volunteer, SearchFilters } from '../types';

/**
 * Inserts or updates a volunteer via POST /voluntarios
 */
export const createVolunteer = async (volunteer: Volunteer): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/voluntarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Header tal como lo definiste en el prompt
        'Authorization': `Bearer ${API_CONFIG.ANON_KEY}`
      },
      body: JSON.stringify(volunteer)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al registrar voluntario');
    }

    return { success: true, message: 'Voluntario creado con éxito' };
  } catch (error) {
    console.error("Error creating volunteer:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error desconocido de red' 
    };
  }
};

/**
 * Searches volunteers via GET /buscar with query params
 */
export const searchVolunteers = async (filters: SearchFilters): Promise<Volunteer[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.region) queryParams.append('region', filters.region);
    if (filters.habilidad) queryParams.append('habilidad', filters.habilidad);
    if (filters.campana) queryParams.append('campana', filters.campana);

    const url = `${API_CONFIG.BASE_URL}/buscar?${queryParams.toString()}`;
    console.log("Fetching volunteers from:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Header tal como lo definiste en el prompt
        'Authorization': `Bearer ${API_CONFIG.ANON_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const statusText = response.statusText;
      throw new Error(`API Error: ${response.status} ${statusText}`);
    }

    const data = await response.json();
    // API returns array directly or inside data property
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Error searching volunteers:", error);
    throw error;
  }
};