import { Volunteer, RegionMetric, AreaMetric, FilterArea } from './types';

export const COLORS = {
  teletonRed: '#D6001C',
  teletonPurple: '#5C2D91',
  teletonDark: '#1A1A1A',
  chartSafe: ['#D6001C', '#5C2D91', '#FFB81C', '#00A499', '#707070'], // Red, Purple, Yellow-Gold, Teal, Grey
  highContrast: ['#FFFFFF', '#FFFF00', '#00FFFF', '#FF00FF', '#00FF00'],
  motivation: ['#D6001C', '#FFB81C', '#5C2D91', '#00A499']
};

export const MOCK_VOLUNTEERS: Volunteer[] = [
  { id: '1', nombre: 'Ana González', region: 'Metropolitana', area_estudio: 'Salud', rango_etario: '18-29', estado: true, score_riesgo_baja: 85, flag_brecha_cap: true },
  { id: '2', nombre: 'Carlos Ruiz', region: 'Valparaíso', area_estudio: 'Ingeniería', rango_etario: '30-45', estado: true, score_riesgo_baja: 45, flag_brecha_cap: false },
  { id: '3', nombre: 'María Silva', region: 'Biobío', area_estudio: 'Salud', rango_etario: '18-29', estado: true, score_riesgo_baja: 92, flag_brecha_cap: false },
  { id: '4', nombre: 'Jorge Tapia', region: 'Metropolitana', area_estudio: 'Social', rango_etario: '18-29', estado: true, score_riesgo_baja: 30, flag_brecha_cap: false },
  { id: '5', nombre: 'Lucía Méndez', region: 'Araucanía', area_estudio: 'Educación', rango_etario: '18-29', estado: true, score_riesgo_baja: 78, flag_brecha_cap: true },
  { id: '6', nombre: 'Francisca Pires', region: 'Metropolitana', area_estudio: 'Salud', rango_etario: '46+', estado: true, score_riesgo_baja: 20, flag_brecha_cap: false },
  { id: '7', nombre: 'Sofía Castro', region: 'Coquimbo', area_estudio: 'Salud', rango_etario: '18-29', estado: true, score_riesgo_baja: 88, flag_brecha_cap: true },
  { id: '8', nombre: 'Diego Soto', region: 'Metropolitana', area_estudio: 'Otro', rango_etario: '18-29', estado: true, score_riesgo_baja: 60, flag_brecha_cap: false },
  { id: '9', nombre: 'Valentina Díaz', region: 'Valparaíso', area_estudio: 'Salud', rango_etario: '18-29', estado: true, score_riesgo_baja: 82, flag_brecha_cap: true },
  { id: '10', nombre: 'Felipe Lagos', region: 'Biobío', area_estudio: 'Ingeniería', rango_etario: '30-45', estado: true, score_riesgo_baja: 40, flag_brecha_cap: false },
  { id: '11', nombre: 'Camila Torres', region: 'Metropolitana', area_estudio: 'Salud', rango_etario: '18-29', estado: true, score_riesgo_baja: 95, flag_brecha_cap: true },
  { id: '12', nombre: 'Roberta Mora', region: 'Antofagasta', area_estudio: 'Social', rango_etario: '18-29', estado: true, score_riesgo_baja: 55, flag_brecha_cap: false },
];

// Data from PDF Page 3 (Tabla Final de Representatividad Recalculada)
export const REGIONAL_DATA: RegionMetric[] = [
  { name: 'Metropolitana', value: 60.14, volunteers: 414 },
  { name: 'Puerto Montt', value: 101.04, volunteers: 96 },
  { name: 'Arica', value: 90.54, volunteers: 74 },
  { name: 'Coquimbo', value: 92.21, volunteers: 77 },
  { name: 'Antofagasta', value: 86.18, volunteers: 123 },
  { name: 'Valparaíso', value: 68.94, volunteers: 132 },
  { name: 'Talca', value: 45.24, volunteers: 168 },
];

// Data from PDF Page 6/7 (Areas de Estudio)
export const TALENT_DISTRIBUTION: AreaMetric[] = [
  { name: 'Salud', value: 41, color: COLORS.teletonRed },
  { name: 'Educación', value: 14, color: COLORS.teletonPurple },
  { name: 'Sociales', value: 11, color: '#FFB81C' },
  { name: 'Ingeniería', value: 7, color: '#00A499' },
  { name: 'Otros', value: 27, color: '#707070' },
];

// Data from PDF Page 11 (Motivaciones Principales)
export const MOTIVATION_DATA = [
  { name: 'Rehabilitación/Inclusión', value: 63.67 },
  { name: 'Tiempo/Aporte', value: 17.83 },
  { name: 'Experiencia Previa', value: 5.50 },
  { name: 'Otro', value: 13.0 }
];