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
  // Paleta Oficial Teletón Chile
  teletonRed: '#E60026',
  teletonRedDark: '#B5001D',
  teletonYellow: '#FFC20E',
  teletonGreen: '#009E73',
  teletonPurple: '#5A2D82',
  teletonGrayDark: '#3A3A3A',
  teletonGrayLight: '#F5F5F7',
  teletonWhite: '#FFFFFF',
  // Colores para gráficos (paleta Teletón)
  chartSafe: ['#E60026', '#5A2D82', '#FFC20E', '#009E73', '#3A3A3A'],
  highContrast: ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00'],
  motivation: ['#E60026', '#FFC20E', '#5A2D82', '#009E73']
};

