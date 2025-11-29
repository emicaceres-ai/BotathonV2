/**
 * Utilidades de Accesibilidad
 * Maneja persistencia y aplicación de configuraciones de accesibilidad
 */

export interface AccessibilitySettings {
  // Visión / Contraste
  highContrast: boolean;
  colorBlindFriendly: boolean;
  textScale: number; // 100-200
  
  // Cognitivo
  dyslexiaFriendly: boolean;
  easyReading: boolean;
  
  // Motor
  keyboardNavigation: boolean;
  largeClickTargets: boolean;
  antiTremor: boolean;
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  colorBlindFriendly: false,
  textScale: 100,
  dyslexiaFriendly: false,
  easyReading: false,
  keyboardNavigation: false,
  largeClickTargets: false,
  antiTremor: false,
};

const STORAGE_KEY = 'teleton_accessibility_settings';

/**
 * Carga las configuraciones guardadas desde localStorage
 */
export function loadSettings(): AccessibilitySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading accessibility settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Guarda las configuraciones en localStorage
 */
export function saveSettings(settings: AccessibilitySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving accessibility settings:', error);
  }
}

/**
 * Aplica las configuraciones al DOM
 */
export function applySettings(settings: AccessibilitySettings): void {
  const html = document.documentElement;
  const body = document.body;

  // Limpiar clases previas
  html.className = html.className
    .split(' ')
    .filter(cls => !cls.startsWith('accessibility-') && !cls.startsWith('text-scale-'))
    .join(' ');

  // Alto Contraste
  if (settings.highContrast) {
    html.classList.add('accessibility-high-contrast');
    body.classList.add('accessibility-high-contrast');
  }

  // Modo Daltónico
  if (settings.colorBlindFriendly) {
    html.classList.add('accessibility-colorblind');
  }

  // Escala de Texto
  html.style.fontSize = `${settings.textScale}%`;
  const scaleClass = `text-scale-${Math.round(settings.textScale / 10) * 10}`;
  html.classList.add(scaleClass);

  // Fuente Dislexia
  if (settings.dyslexiaFriendly) {
    html.classList.add('accessibility-dyslexia-font');
  }

  // Modo Lectura Fácil
  if (settings.easyReading) {
    html.classList.add('accessibility-easy-reading');
  }

  // Navegación por Teclado
  if (settings.keyboardNavigation) {
    html.classList.add('accessibility-keyboard-nav');
  }

  // Objetivos de Clic Grandes
  if (settings.largeClickTargets) {
    html.classList.add('accessibility-large-targets');
  }

  // Modo Anti-temblor
  if (settings.antiTremor) {
    html.classList.add('accessibility-anti-tremor');
  }
}

/**
 * Inicializa las configuraciones al cargar la página
 */
export function initializeAccessibility(): void {
  const settings = loadSettings();
  applySettings(settings);
}

