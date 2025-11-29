import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno directamente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tatvmyjoinyfkxeclbso.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhdHZteWpvaW55Zmt4ZWNsYnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNzYyNDQsImV4cCI6MjA3OTk1MjI0NH0.F-BcU63qt1IvgyLA53IUjjC5gux-79qiCYt_8L6D468';

// Console.log seguro solo en desarrollo
if (import.meta.env.DEV) {
  if (import.meta.env.VITE_SUPABASE_URL) {
    console.log('✅ Supabase URL cargada correctamente');
  } else {
    console.warn('⚠️ VITE_SUPABASE_URL no está configurada, usando fallback');
  }
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.log('✅ Supabase ANON KEY cargada correctamente');
  } else {
    console.warn('⚠️ VITE_SUPABASE_ANON_KEY no está configurada, usando fallback');
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

