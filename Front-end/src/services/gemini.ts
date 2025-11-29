import { GoogleGenerativeAI } from '@google/generative-ai';
import { Volunteer } from '../types';

// Validar y obtener la clave de API de Gemini
const getApiKey = (): string => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Console.log seguro solo en desarrollo
  if (import.meta.env.DEV) {
    if (key) {
      console.log('✅ Gemini API Key cargada correctamente');
    } else {
      console.warn('⚠️ VITE_GEMINI_API_KEY no está configurada');
    }
  }
  
  if (!key) {
    throw new Error('VITE_GEMINI_API_KEY no está configurada. Por favor configura esta variable en Vercel → Settings → Environment Variables');
  }
  return key;
};

// Inicializar GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(getApiKey());

// Exportar instancia por defecto
export default genAI;

// Exportar modelo para compatibilidad
export const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const geminiService = {
  // Generar insight estratégico basado en voluntarios en riesgo
  async generateInsight(highRiskVolunteers: Volunteer[], gapVolunteers: Volunteer[]): Promise<string> {
    try {
      // Verificar que la API key está disponible
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        return '⚠️ Gemini AI no está configurado. Por favor configura VITE_GEMINI_API_KEY en Vercel.';
      }

      const prompt = `
        Actúa como un experto en gestión de voluntariado para Teletón.
        Analiza los siguientes datos resumidos del Dashboard de Gestión de Voluntariado:
        
        - Cantidad de voluntarios en Alto Riesgo de Deserción (>75 score): ${highRiskVolunteers.length}
        - Cantidad de voluntarios con Brecha de Capacitación Crítica (Salud): ${gapVolunteers.length}
        - Muestra de perfiles en riesgo: ${highRiskVolunteers.slice(0, 3).map(v => `${v.area_estudio || 'N/A'}/${v.rango_etario || 'N/A'}`).join(', ')}...
        
        Genera UN párrafo estratégico (máximo 50 palabras) recomendando una acción inmediata para reducir la deserción por 'Falta de Tiempo' y cerrar la brecha en Salud. Sé directo y motivador.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || 'No se pudo generar el insight.';
    } catch (error: any) {
      console.error('Error generating insight:', error);
      // Fallback visual adecuado
      if (error.message?.includes('API_KEY')) {
        return '⚠️ Error de configuración: VITE_GEMINI_API_KEY no está configurada correctamente.';
      }
      return 'Error al conectar con el servicio de inteligencia. Por favor verifica la configuración.';
    }
  },

  // Generar resumen de voluntario
  async generateVolunteerSummary(volunteer: Volunteer): Promise<string> {
    try {
      // Verificar que la API key está disponible
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        return '⚠️ Gemini AI no está configurado.';
      }

      const prompt = `
        Genera un resumen breve (2-3 oraciones) sobre este voluntario de Teletón:
        Nombre: ${volunteer.nombre}
        Región: ${volunteer.region}
        Área de Estudio: ${volunteer.area_estudio || 'No especificado'}
        Score de Riesgo: ${volunteer.score_riesgo_baja || 'N/A'}
        Brecha de Capacitación: ${volunteer.flag_brecha_cap ? 'Sí' : 'No'}
        
        Sé conciso y enfocado en acciones preventivas.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || 'No se pudo generar el resumen.';
    } catch (error: any) {
      console.error('Error generating summary:', error);
      if (error.message?.includes('API_KEY')) {
        return '⚠️ Error de configuración: VITE_GEMINI_API_KEY no está configurada.';
      }
      return 'Error al generar resumen.';
    }
  },
};

