import { GoogleGenAI } from "@google/genai";
import { Volunteer } from "../types";

const generateInsight = async (highRiskVolunteers: Volunteer[], gapVolunteers: Volunteer[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "La clave de API no está configurada. No se puede generar el insight.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Actúa como un experto en gestión de voluntariado para Teletón.
    Analiza los siguientes datos resumidos del Dashboard de Gestión de Voluntariado:
    
    - Cantidad de voluntarios en Alto Riesgo de Deserción (>75 score): ${highRiskVolunteers.length}
    - Cantidad de voluntarios con Brecha de Capacitación Crítica (Salud): ${gapVolunteers.length}
    - Muestra de perfiles en riesgo: ${highRiskVolunteers.slice(0, 3).map(v => `${v.area_estudio}/${v.rango_etario}`).join(', ')}...

    Genera UN párrafo estratégico (máximo 50 palabras) recomendando una acción inmediata para reducir la deserción por 'Falta de Tiempo' y cerrar la brecha en Salud. Sé directo y motivador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No se pudo generar el insight.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Error al conectar con el servicio de inteligencia.";
  }
};

export const aiService = {
  generateInsight
};