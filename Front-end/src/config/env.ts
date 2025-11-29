// Archivo centralizado para variables de entorno
// Todas las variables deben usar el prefijo VITE_ para Vite

const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  
  if (value && typeof value === 'string' && value.trim()) {
    return value;
  }
  
  if (fallback) {
    return fallback;
  }
  
  // En desarrollo, mostrar warning pero no fallar
  if (import.meta.env.DEV) {
    console.warn(`⚠️ Variable de entorno ${key} no está configurada`);
  }
  
  return '';
};

export const env = {
  supabaseUrl: getEnvVar(
    'VITE_SUPABASE_URL',
    'https://tatvmyjoinyfkxeclbso.supabase.co'
  ),
  supabaseAnonKey: getEnvVar(
    'VITE_SUPABASE_ANON_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdHZteWpvaW55Zmt4ZWNsYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzYyNDQsImV4cCI6MjA3OTk1MjI0NH0.F-BcU63qt1IvgyLA53IUjjC5gux-79qiCYt_8L6D468'
  ),
  geminiApiKey: getEnvVar('VITE_GEMINI_API_KEY'),
};

// Validación en desarrollo
if (import.meta.env.DEV) {
  if (env.geminiApiKey) {
    console.log('✅ Gemini API Key cargada correctamente');
  } else {
    console.warn('⚠️ VITE_GEMINI_API_KEY no está configurada - Las funciones de IA no estarán disponibles');
  }
  
  if (env.supabaseUrl) {
    console.log('✅ Supabase URL cargada correctamente');
  }
  
  if (env.supabaseAnonKey) {
    console.log('✅ Supabase ANON KEY cargada correctamente');
  }
}

