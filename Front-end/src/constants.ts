// Importar configuración centralizada
import { env } from './config/env';

export const API_CONFIG = {
  BASE_URL: `${env.supabaseUrl}/functions/v1`,
  ANON_KEY: env.supabaseAnonKey
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

