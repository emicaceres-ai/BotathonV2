import React, { useState } from 'react';
import { X, Settings, Eye, Keyboard, MousePointer, Brain, Type, Gauge, Hand } from 'lucide-react';
import { useAccessibility } from '../../providers/AccessibilityProvider';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useAccessibility();

  return (
    <>
      {/* Botón Flotante de Accesibilidad */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir panel de accesibilidad"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#D6001C] to-[#5C2D91] text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-50 flex items-center gap-2 group"
        style={{ minWidth: '60px', minHeight: '60px' }}
      >
        <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">♿</span>
        <span className="hidden sm:inline font-semibold text-sm">Accesibilidad</span>
        <Settings className="w-5 h-5 hidden sm:block" />
      </button>

      {/* Panel Lateral */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#D6001C] to-[#5C2D91] text-white">
          <h2 id="accessibility-panel-title" className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" /> Ajustes de Accesibilidad
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar panel de accesibilidad"
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-80px)] custom-scrollbar">
          {/* Visión y Contraste */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
              <Eye className="w-5 h-5 text-[#D6001C]" /> Visión y Contraste
            </h3>
            
            {/* Alto Contraste Extremo */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="highContrast" className="text-gray-800 font-semibold cursor-pointer block">
                  Alto Contraste Extremo
                </label>
                <p className="text-xs text-gray-600 mt-1">WCAG AAA (7:1) - Fondo negro/blanco puro</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="highContrast"
                  checked={settings.highContrast}
                  onChange={(e) => updateSetting('highContrast', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D6001C]"></div>
              </label>
            </div>

            {/* Modo Daltónico */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="colorBlindFriendly" className="text-gray-800 font-semibold cursor-pointer block">
                  Modo Daltónico Amigable
                </label>
                <p className="text-xs text-gray-600 mt-1">Reemplaza rojos/verdes por azules/naranjas</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="colorBlindFriendly"
                  checked={settings.colorBlindFriendly}
                  onChange={(e) => updateSetting('colorBlindFriendly', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#5C2D91]"></div>
              </label>
            </div>

            {/* Escala de Texto */}
            <div className="p-4 rounded-xl bg-gray-50">
              <label htmlFor="textScale" className="text-gray-800 font-semibold block mb-3">
                Escala de Texto: <span className="text-[#D6001C]">{settings.textScale}%</span>
              </label>
              <input
                type="range"
                id="textScale"
                min="100"
                max="200"
                step="10"
                value={settings.textScale}
                onChange={(e) => updateSetting('textScale', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D6001C]"
                aria-label={`Escala de texto: ${settings.textScale}%`}
              />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>100%</span>
                <span>150%</span>
                <span>200%</span>
              </div>
            </div>
          </section>

          {/* Cognitivo */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
              <Brain className="w-5 h-5 text-[#5C2D91]" /> Cognitivo y Lectura
            </h3>
            
            {/* Fuente Dislexia */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="dyslexiaFriendly" className="text-gray-800 font-semibold cursor-pointer block">
                  Fuente Amigable para Dislexia
                </label>
                <p className="text-xs text-gray-600 mt-1">Usa OpenDyslexic para mejor legibilidad</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="dyslexiaFriendly"
                  checked={settings.dyslexiaFriendly}
                  onChange={(e) => updateSetting('dyslexiaFriendly', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00A499]"></div>
              </label>
            </div>

            {/* Modo Lectura Fácil */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="easyReading" className="text-gray-800 font-semibold cursor-pointer block">
                  Modo Lectura Fácil
                </label>
                <p className="text-xs text-gray-600 mt-1">Mayor espaciado y menos ruido visual</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="easyReading"
                  checked={settings.easyReading}
                  onChange={(e) => updateSetting('easyReading', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00A499]"></div>
              </label>
            </div>
          </section>

          {/* Motor y Navegación */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
              <MousePointer className="w-5 h-5 text-[#00A499]" /> Motor y Navegación
            </h3>
            
            {/* Navegación por Teclado */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="keyboardNavigation" className="text-gray-800 font-semibold cursor-pointer block">
                  Navegación por Teclado Mejorada
                </label>
                <p className="text-xs text-gray-600 mt-1">Focus visible y animaciones suaves</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="keyboardNavigation"
                  checked={settings.keyboardNavigation}
                  onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#5C2D91]"></div>
              </label>
            </div>

            {/* Objetivos de Clic Grandes */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="largeClickTargets" className="text-gray-800 font-semibold cursor-pointer block">
                  Objetivos de Clic Grandes
                </label>
                <p className="text-xs text-gray-600 mt-1">Mínimo 44x44px (WCAG)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="largeClickTargets"
                  checked={settings.largeClickTargets}
                  onChange={(e) => updateSetting('largeClickTargets', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D6001C]"></div>
              </label>
            </div>

            {/* Modo Anti-temblor */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <label htmlFor="antiTremor" className="text-gray-800 font-semibold cursor-pointer block">
                  Modo Anti-temblor
                </label>
                <p className="text-xs text-gray-600 mt-1">Botones grandes y espaciados (60x60px)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="antiTremor"
                  checked={settings.antiTremor}
                  onChange={(e) => updateSetting('antiTremor', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D6001C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#FFB81C]"></div>
              </label>
            </div>
          </section>

          {/* Información */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Todas las configuraciones se guardan automáticamente y se aplican inmediatamente.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

