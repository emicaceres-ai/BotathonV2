// Cargar variables de entorno (Vite usa import.meta.env)
// En Vercel, las variables NEXT_PUBLIC_* están disponibles en import.meta.env durante el build
// Durante runtime, Vite expone estas variables automáticamente si están en envPrefix

// Función helper para obtener variables de entorno de forma segura
function getEnvVar(key: string, fallback: string = ''): string {
  // En Vite, las variables con prefijo NEXT_PUBLIC_ o VITE_ están disponibles en import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Intentar con el nombre exacto primero
    let value = import.meta.env[key];
    if (value && typeof value === 'string' && value.trim()) {
      return value;
    }
    
    // Intentar con VITE_ prefix
    const viteKey = key.replace('NEXT_PUBLIC_', 'VITE_');
    value = import.meta.env[viteKey];
    if (value && typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  
  // Fallback para process.env (útil en algunos contextos)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value && typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  
  return fallback;
}

// Obtener variables de entorno con fallbacks
const SUPABASE_ANON_KEY = getEnvVar(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdHZteWpvaW55Zmt4ZWNsYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzYyNDQsImV4cCI6MjA3OTk1MjI0NH0.F-BcU63qt1IvgyLA53IUjjC5gux-79qiCYt_8L6D468'
);

const SUPABASE_URL = getEnvVar(
  'NEXT_PUBLIC_SUPABASE_URL',
  'https://tatvmyjoinyfkxeclbso.supabase.co'
);

// Debug en desarrollo (solo en runtime del navegador, no durante build)
// Este código solo se ejecuta en el navegador, no durante el build de Vite
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
      console.log('[DEBUG] Variables de entorno:', {
        hasAnonKey: !!SUPABASE_ANON_KEY,
        anonKeyLength: SUPABASE_ANON_KEY?.length || 0,
        supabaseUrl: SUPABASE_URL
      });
    }
  } catch (e) {
    // Ignorar errores en el debug
  }
}

export const API_CONFIG = {
  // Base URL corregida al project ID real de Supabase
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