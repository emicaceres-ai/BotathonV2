// Variables de entorno usando VITE_* únicamente
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  
  // Console.log seguro solo en desarrollo
  if (import.meta.env.DEV) {
    if (value) {
      console.log(`✅ ${key} cargada correctamente`);
    } else {
      console.warn(`⚠️ ${key} no está configurada`);
    }
  }
  
  if (value && typeof value === 'string' && value.trim()) {
    return value;
  }
  
  if (!fallback) {
    throw new Error(
      `❌ Variable de entorno faltante: ${key}\n` +
      `Por favor configura esta variable en Vercel → Settings → Environment Variables`
    );
  }
  return fallback;
};

const SUPABASE_URL = getEnvVar(
  'VITE_SUPABASE_URL',
  'https://tatvmyjoinyfkxeclbso.supabase.co'
);

const SUPABASE_ANON_KEY = getEnvVar(
  'VITE_SUPABASE_ANON_KEY',
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

export const COLORS = {
  teletonRed: '#D6001C',
  teletonPurple: '#5C2D91',
  teletonDark: '#1A1A1A',
  chartSafe: ['#D6001C', '#5C2D91', '#FFB81C', '#00A499', '#707070'],
  highContrast: ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00'],
  motivation: ['#D6001C', '#FFB81C', '#5C2D91', '#00A499']
};

