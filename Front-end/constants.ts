// Cargar variables de entorno (Vite usa import.meta.env)
// En Vercel, las variables NEXT_PUBLIC_* están disponibles en import.meta.env durante el build
// Durante runtime, Vite expone estas variables automáticamente si están en envPrefix

// Función helper para obtener variables de entorno de forma segura
// En Vite, las variables con prefijo NEXT_PUBLIC_ o VITE_ están disponibles en import.meta.env
// Durante el build, Vite reemplaza import.meta.env.* con los valores reales
function getEnvVar(key: string, fallback: string = ''): string {
  // En runtime del navegador, import.meta.env está disponible con las variables expuestas
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Intentar con el nombre exacto primero (NEXT_PUBLIC_*)
    let value = import.meta.env[key];
    
    // Verificar que el valor sea válido (no undefined, null, o string "undefined")
    if (value !== undefined && value !== null && value !== 'undefined' && value !== 'null') {
      const strValue = String(value).trim();
      if (strValue.length > 0) {
        return strValue;
      }
    }
    
    // Intentar con VITE_ prefix como alternativa
    const viteKey = key.replace('NEXT_PUBLIC_', 'VITE_');
    value = import.meta.env[viteKey];
    if (value !== undefined && value !== null && value !== 'undefined' && value !== 'null') {
      const strValue = String(value).trim();
      if (strValue.length > 0) {
        return strValue;
      }
    }
  }
  
  // Fallback para process.env (útil durante el build, no en runtime del navegador)
  if (typeof process !== 'undefined' && process.env) {
    const value = process.env[key];
    if (value !== undefined && value !== null && value !== 'undefined' && value !== 'null') {
      const strValue = String(value).trim();
      if (strValue.length > 0) {
        return strValue;
      }
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