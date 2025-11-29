// Cargar variables de entorno (Vite usa import.meta.env)
const SUPABASE_ANON_KEY =
  // Prioridad 1: Variable de Vite (VITE_*)
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  // Prioridad 2: Variable de Next.js (para compatibilidad)
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  // Fallback: string vacío
  '';

export const API_CONFIG = {
  // Base URL corregida al project ID real de Supabase
  BASE_URL: "https://tatvmyjoinyfkxeclbso.supabase.co/functions/v1",
  ANON_KEY: SUPABASE_ANON_KEY
};

export const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes"
];

export const HABILIDADES_COMUNES = [
  "Logística",
  "Primeros Auxilios",
  "Redes Sociales",
  "Atención al Cliente",
  "Conducción",
  "Carga y Descarga",
  "Coordinación de Equipos"
];