const SUPABASE_ANON_KEY =
  // Valor principal: como solicitaste, usando la variable pública de Next.js
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  // Fallback para entornos Vite (opcional, por si decides usar VITE_)
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
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