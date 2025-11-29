"use client";

import React, { useState, useEffect } from 'react';
import { X, Settings, Eye, Keyboard, MousePointer, Brain, Volume2 } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

export default function AccessibilitySettingsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useAccessibility();

  return (
    <>
      {/* Icono de Accesibilidad */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir configuración de accesibilidad"
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 z-50"
      >
        <Settings size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-settings-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="accessibility-settings-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Settings size={20} /> Ajustes de Accesibilidad
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar configuración de accesibilidad"
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
          {/* Visión y Contraste */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Eye size={18} /> Visión y Contraste
            </h3>
            <div className="flex items-center justify-between">
              <label htmlFor="highContrast" className="text-gray-600">Alto Contraste Extremo</label>
              <input
                type="checkbox"
                id="highContrast"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="colorBlindFriendly" className="text-gray-600">Esquema Daltónico Amigable</label>
              <input
                type="checkbox"
                id="colorBlindFriendly"
                checked={settings.colorBlindFriendly}
                onChange={(e) => updateSetting('colorBlindFriendly', e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
            <div>
              <label htmlFor="textScale" className="block text-gray-600 mb-2">
                Aumento de Escala de Texto ({settings.textScale}%)
              </label>
              <input
                type="range"
                id="textScale"
                min="100"
                max="200"
                step="10"
                value={settings.textScale}
                onChange={(e) => updateSetting('textScale', Number(e.target.value))}
                className="range range-primary"
              />
            </div>
          </section>

          {/* Motor y Navegación */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Keyboard size={18} /> Motor y Navegación
            </h3>
            <div className="flex items-center justify-between">
              <label htmlFor="keyboardNavigation" className="text-gray-600">Navegación por Teclado Mejorada</label>
              <input
                type="checkbox"
                id="keyboardNavigation"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="largeClickTargets" className="text-gray-600">Objetivos de Clic Grandes</label>
              <input
                type="checkbox"
                id="largeClickTargets"
                checked={settings.largeClickTargets}
                onChange={(e) => updateSetting('largeClickTargets', e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
          </section>

          {/* Cognitivo y Asistencia */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <Brain size={18} /> Cognitivo y Asistencia
            </h3>
            <div className="flex items-center justify-between">
              <label htmlFor="dyslexiaFriendly" className="text-gray-600">Fuente Amigable para Dislexia</label>
              <input
                type="checkbox"
                id="dyslexiaFriendly"
                checked={settings.dyslexiaFriendly}
                onChange={(e) => updateSetting('dyslexiaFriendly', e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="screenReaderSupport" className="text-gray-600">Soporte para Lectores de Pantalla</label>
              <input
                type="checkbox"
                id="screenReaderSupport"
                checked={settings.screenReaderSupport}
                onChange={(e) => updateSetting('screenReaderSupport', e.target.checked)}
                className="toggle toggle-primary"
                disabled
              />
            </div>
          </section>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

