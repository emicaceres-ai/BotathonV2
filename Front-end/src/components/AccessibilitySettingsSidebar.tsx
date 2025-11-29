"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings, Eye, Keyboard, MousePointer, Brain, Volume2 } from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  colorBlindFriendly: boolean;
  textScale: number; // 100% to 200%
  keyboardNavigation: boolean;
  largeClickTargets: boolean;
  dyslexiaFriendly: boolean;
  screenReaderSupport: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  colorBlindFriendly: false,
  textScale: 100,
  keyboardNavigation: false,
  largeClickTargets: false,
  dyslexiaFriendly: false,
  screenReaderSupport: true // Por defecto activado
};

export default function AccessibilitySettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  // Cargar configuración desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        applySettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error('Error loading accessibility settings:', e);
      }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Aplicar configuración al DOM
  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;
    const body = document.body;

    // Alto Contraste Extremo
    if (newSettings.highContrast) {
      html.classList.add('accessibility-high-contrast');
      body.classList.add('accessibility-high-contrast');
    } else {
      html.classList.remove('accessibility-high-contrast');
      body.classList.remove('accessibility-high-contrast');
    }

    // Esquema Daltónico
    if (newSettings.colorBlindFriendly) {
      html.classList.add('accessibility-colorblind');
    } else {
      html.classList.remove('accessibility-colorblind');
    }

    // Escala de Texto
    html.style.fontSize = `${newSettings.textScale}%`;

    // Navegación por Teclado
    if (newSettings.keyboardNavigation) {
      html.classList.add('accessibility-keyboard-nav');
    } else {
      html.classList.remove('accessibility-keyboard-nav');
    }

    // Objetivos de Clic Grandes
    if (newSettings.largeClickTargets) {
      html.classList.add('accessibility-large-targets');
    } else {
      html.classList.remove('accessibility-large-targets');
    }

    // Fuente para Dislexia
    if (newSettings.dyslexiaFriendly) {
      html.classList.add('accessibility-dyslexia-font');
      body.classList.add('accessibility-dyslexia-font');
    } else {
      html.classList.remove('accessibility-dyslexia-font');
      body.classList.remove('accessibility-dyslexia-font');
    }

    // Soporte para Lectores de Pantalla (siempre activo, pero se puede mejorar)
    if (newSettings.screenReaderSupport) {
      html.setAttribute('aria-live', 'polite');
    }
  };

  // Actualizar configuración
  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    
    // Guardar en localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
  };

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Botón de Acceso */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
        aria-label="Abrir configuración de accesibilidad"
        title="Configuración de Accesibilidad"
      >
        <span className="text-2xl" aria-hidden="true">♿</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel Lateral */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-settings-title"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6" />
              <h2 id="accessibility-settings-title" className="text-xl font-bold">
                Configuración de Accesibilidad
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Cerrar panel de accesibilidad"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* A. Ajustes de Visión y Contraste */}
            <section aria-labelledby="vision-section">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-5 w-5 text-blue-600" />
                <h3 id="vision-section" className="text-lg font-semibold text-gray-900">
                  Ajustes de Visión y Contraste
                </h3>
              </div>

              <div className="space-y-4">
                {/* Alto Contraste Extremo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                      Alto Contraste Extremo
                    </label>
                    <button
                      id="high-contrast"
                      type="button"
                      role="switch"
                      aria-checked={settings.highContrast}
                      onClick={() => updateSetting('highContrast', !settings.highContrast)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Aumenta el contraste a nivel WCAG AAA (7:1) para mejorar la legibilidad en baja visión.
                  </p>
                </div>

                {/* Esquema Daltónico */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="colorblind" className="text-sm font-medium text-gray-700">
                      Esquema Daltónico Amigable
                    </label>
                    <button
                      id="colorblind"
                      type="button"
                      role="switch"
                      aria-checked={settings.colorBlindFriendly}
                      onClick={() => updateSetting('colorBlindFriendly', !settings.colorBlindFriendly)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.colorBlindFriendly ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.colorBlindFriendly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Reemplaza combinaciones rojo/verde con azul/naranja en gráficos y mapas de calor.
                  </p>
                </div>

                {/* Aumento de Escala de Texto */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label htmlFor="text-scale" className="block text-sm font-medium text-gray-700 mb-2">
                    Aumento de Escala de Texto: {settings.textScale}%
                  </label>
                  <input
                    id="text-scale"
                    type="range"
                    min="100"
                    max="200"
                    step="10"
                    value={settings.textScale}
                    onChange={(e) => updateSetting('textScale', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-valuemin={100}
                    aria-valuemax={200}
                    aria-valuenow={settings.textScale}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Ajusta el tamaño de la fuente de la interfaz. El layout se adapta automáticamente.
                  </p>
                </div>
              </div>
            </section>

            {/* B. Ajustes Motores y de Navegación */}
            <section aria-labelledby="motor-section" className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="h-5 w-5 text-blue-600" />
                <h3 id="motor-section" className="text-lg font-semibold text-gray-900">
                  Ajustes Motores y de Navegación
                </h3>
              </div>

              <div className="space-y-4">
                {/* Navegación por Teclado */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="keyboard-nav" className="text-sm font-medium text-gray-700">
                      Navegación por Teclado Mejorada
                    </label>
                    <button
                      id="keyboard-nav"
                      type="button"
                      role="switch"
                      aria-checked={settings.keyboardNavigation}
                      onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Mejora la visibilidad del foco (Tab) con bordes gruesos y destacados.
                  </p>
                </div>

                {/* Objetivos de Clic Grandes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="large-targets" className="text-sm font-medium text-gray-700">
                      Objetivos de Clic Grandes
                    </label>
                    <button
                      id="large-targets"
                      type="button"
                      role="switch"
                      aria-checked={settings.largeClickTargets}
                      onClick={() => updateSetting('largeClickTargets', !settings.largeClickTargets)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.largeClickTargets ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.largeClickTargets ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Aumenta el área de clic de botones a mínimo 44px x 44px (WCAG).
                  </p>
                </div>
              </div>
            </section>

            {/* C. Ajustes Cognitivos y Asistencia */}
            <section aria-labelledby="cognitive-section" className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 id="cognitive-section" className="text-lg font-semibold text-gray-900">
                  Ajustes Cognitivos y Asistencia
                </h3>
              </div>

              <div className="space-y-4">
                {/* Fuente para Dislexia */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="dyslexia-font" className="text-sm font-medium text-gray-700">
                      Fuente Amigable para Dislexia
                    </label>
                    <button
                      id="dyslexia-font"
                      type="button"
                      role="switch"
                      aria-checked={settings.dyslexiaFriendly}
                      onClick={() => updateSetting('dyslexiaFriendly', !settings.dyslexiaFriendly)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.dyslexiaFriendly ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.dyslexiaFriendly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Cambia la fuente a una especializada para mejorar la comprensión lectora.
                  </p>
                </div>

                {/* Soporte para Lectores de Pantalla */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="screen-reader" className="text-sm font-medium text-gray-700">
                      Soporte para Lectores de Pantalla
                    </label>
                    <button
                      id="screen-reader"
                      type="button"
                      role="switch"
                      aria-checked={settings.screenReaderSupport}
                      onClick={() => updateSetting('screenReaderSupport', !settings.screenReaderSupport)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.screenReaderSupport ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.screenReaderSupport ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Activa etiquetas ARIA y descripciones para lectores de pantalla (siempre recomendado).
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              Las configuraciones se guardan automáticamente y se aplican inmediatamente.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

