import { GoogleGenerativeAI } from '@google/generative-ai';
import { Volunteer } from '../types';
import { env } from '../config/env';

// Inicializar GoogleGenerativeAI solo si hay API key
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

if (env.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(env.geminiApiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  } catch (error) {
    console.error('Error inicializando Gemini:', error);
  }
}

// Exportar instancia por defecto
export default genAI;

// Exportar modelo para compatibilidad (puede ser null)
export { model };

export const geminiService = {
  // Generar insight estratégico basado en voluntarios en riesgo
  async generateInsight(highRiskVolunteers: Volunteer[], gapVolunteers: Volunteer[]): Promise<string> {
    try {
      // Verificar que la API key y el modelo están disponibles
      if (!model || !env.geminiApiKey) {
        return '⚠️ Gemini AI no está configurado. Por favor configura VITE_GEMINI_API_KEY en Vercel → Settings → Environment Variables.';
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
      if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
        return '⚠️ Error de configuración: VITE_GEMINI_API_KEY no está configurada correctamente. Verifica la variable en Vercel → Settings → Environment Variables.';
      }
      return 'Error al conectar con el servicio de inteligencia. Por favor verifica la configuración.';
    }
  },

  // Generar resumen de voluntario
  async generateVolunteerSummary(volunteer: Volunteer): Promise<string> {
    try {
      // Verificar que la API key y el modelo están disponibles
      if (!model || !env.geminiApiKey) {
        return '⚠️ Gemini AI no está configurado. Configura VITE_GEMINI_API_KEY en Vercel.';
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
      if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
        return '⚠️ Error de configuración: VITE_GEMINI_API_KEY no está configurada. Verifica la variable en Vercel.';
      }
      return 'Error al generar resumen.';
    }
  },
};

