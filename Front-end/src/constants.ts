// Variables de entorno - soporta VITE_* y NEXT_PUBLIC_*
const getEnvVar = (key: string, altKey?: string, fallback?: string): string => {
  const value = import.meta.env[key] || (altKey ? import.meta.env[altKey] : undefined);
  if (value && typeof value === 'string' && value.trim()) {
    return value;
  }
  return fallback || '';
};

const SUPABASE_URL = getEnvVar(
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'https://tatvmyjoinyfkxeclbso.supabase.co'
);

const SUPABASE_ANON_KEY = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdHZteWpvaW55Zmt4ZWNsYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzYyNDQsImV4cCI6MjA3OTk1MjI0NH0.F-BcU63qt1IvgyLA53IUjjC5gux-79qiCYt_8L6D468'
);

export const API_CONFIG = {
  BASE_URL: `${SUPABASE_URL}/functions/v1`,
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