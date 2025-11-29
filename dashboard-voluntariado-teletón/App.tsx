import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Bell, Type, ZapOff, Palette, Monitor } from 'lucide-react';
import { KPICards } from './components/KPICards';
import { ChartsSection } from './components/ChartsSection';
import { ActionPanel } from './components/ActionPanel';
import { ResultsTable } from './components/ResultsTable';
import { VolunteerForm } from './components/VolunteerForm';
import { DocumentUpload } from './components/DocumentUpload';
import { Sidebar } from './components/Sidebar';
import { MOCK_VOLUNTEERS } from './constants';
import { FilterArea, Volunteer, AppView } from './types';

const App: React.FC = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  
  // Accessibility State
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);

  // Data State
  const [volunteers, setVolunteers] = useState<Volunteer[]>(MOCK_VOLUNTEERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter State (Global across views where applicable)
  const [minRisk, setMinRisk] = useState<number>(0);
  const [gapOnly, setGapOnly] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<string>(FilterArea.ALL);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(vol => {
      const riskCondition = vol.score_riesgo_baja >= minRisk;
      const gapCondition = gapOnly ? vol.flag_brecha_cap === true : true;
      const areaCondition = selectedArea === FilterArea.ALL ? true : vol.area_estudio === selectedArea;
      
      return riskCondition && gapCondition && areaCondition;
    });
  }, [volunteers, minRisk, gapOnly, selectedArea]);

  const handleAddVolunteer = (newVolunteerData: Omit<Volunteer, 'id'>) => {
    const newVolunteer: Volunteer = {
      ...newVolunteerData,
      id: Date.now().toString(),
    };
    setVolunteers(prev => [newVolunteer, ...prev]);
  };

  const handleDataLoaded = (newVolunteers: Volunteer[]) => {
    setVolunteers(prev => [...newVolunteers, ...prev]);
    setCurrentView('volunteers'); // Redirect to list after upload
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Dashboard Estratégico';
      case 'volunteers': return 'Gestión de Voluntarios';
      case 'upload': return 'Centro de Carga de Datos';
      case 'settings': return 'Configuración del Sistema';
      default: return 'Teletón';
    }
  };

  // Base app styles with dynamic accessibility modifiers
  const appContainerStyle = {
    zoom: fontSize === 'large' ? 1.1 : 1,
    filter: colorBlindMode ? 'grayscale(10%) contrast(110%)' : 'none',
  };

  const toggleSwitchClass = (active: boolean) => `
    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5C2D91]
    ${active 
      ? (isHighContrast ? 'bg-yellow-400' : 'bg-[#D6001C]') 
      : (isHighContrast ? 'bg-gray-700 border border-white' : 'bg-gray-200')}
  `;

  const toggleKnobClass = (active: boolean) => `
    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
    ${active ? 'translate-x-6' : 'translate-x-1'}
  `;

  return (
    <div 
      className={`flex min-h-screen font-sans transition-colors duration-300 ${isHighContrast ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} ${reduceMotion ? 'motion-reduce' : ''}`}
      style={appContainerStyle as any}
    >
      {reduceMotion && (
        <style>{`*, *::before, *::after { transition: none !important; animation: none !important; }`}</style>
      )}

      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView}
        onChangeView={setCurrentView}
        onAddVolunteer={() => setIsAddModalOpen(true)}
        isHighContrast={isHighContrast}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        
        {/* Top Header */}
        <header className={`sticky top-0 z-30 flex items-center justify-between px-8 py-4 ${isHighContrast ? 'bg-black border-b border-white' : 'bg-white border-b border-gray-200 shadow-sm'}`}>
          <div>
             <h2 className={`text-xl font-bold ${isHighContrast ? 'text-white' : 'text-[#1A1A1A]'}`}>
               {getTitle()}
             </h2>
             <p className={`text-xs ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
               Última actualización: Hoy, 10:45 AM
             </p>
          </div>

          <div className="flex items-center gap-4">
             <button className={`p-2 rounded-full relative ${isHighContrast ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>

             <div className={`h-6 w-px ${isHighContrast ? 'bg-gray-700' : 'bg-gray-200'}`}></div>

             <button
                onClick={() => setIsHighContrast(!isHighContrast)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                    isHighContrast 
                    ? 'bg-yellow-400 text-black border-transparent hover:bg-yellow-300' 
                    : 'bg-white text-gray-600 border-gray-200 hover:text-[#5C2D91] hover:border-[#5C2D91]'
                }`}
              >
                <Eye className="h-4 w-4" />
                {isHighContrast ? 'Modo Contraste' : 'Vista Normal'}
              </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            
            {/* VIEW: DASHBOARD */}
            {currentView === 'dashboard' && (
              <>
                <section aria-label="Indicadores Clave">
                  <KPICards isHighContrast={isHighContrast} />
                </section>
                <section aria-label="Análisis Gráfico">
                  <ChartsSection isHighContrast={isHighContrast} />
                </section>
                <div className={`p-6 rounded-xl border text-center ${isHighContrast ? 'bg-gray-900 border-gray-700' : 'bg-blue-50 border-blue-100'}`}>
                   <p className={`text-sm ${isHighContrast ? 'text-white' : 'text-blue-800'}`}>
                     Para gestionar acciones individuales o filtrar la lista, diríjase a la sección <strong>Gestión Voluntarios</strong>.
                   </p>
                </div>
              </>
            )}

            {/* VIEW: VOLUNTEERS */}
            {currentView === 'volunteers' && (
              <>
                <section aria-label="Controles de Gestión">
                  <ActionPanel 
                    isHighContrast={isHighContrast}
                    minRisk={minRisk}
                    setMinRisk={setMinRisk}
                    gapOnly={gapOnly}
                    setGapOnly={setGapOnly}
                    selectedArea={selectedArea}
                    setSelectedArea={setSelectedArea}
                    filteredCount={filteredVolunteers.length}
                    filteredVolunteers={filteredVolunteers}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                </section>
                <section aria-label="Listado de Voluntarios">
                  <ResultsTable 
                    volunteers={filteredVolunteers} 
                    isHighContrast={isHighContrast} 
                  />
                </section>
              </>
            )}

            {/* VIEW: UPLOAD */}
            {currentView === 'upload' && (
               <section aria-label="Carga de Datos" className="max-w-3xl mx-auto mt-10">
                <DocumentUpload 
                  onDataLoaded={handleDataLoaded} 
                  isHighContrast={isHighContrast} 
                />
              </section>
            )}

            {/* VIEW: SETTINGS */}
            {currentView === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <div className={`rounded-xl shadow-sm border overflow-hidden ${isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'}`}>
                   
                   {/* Header */}
                   <div className={`px-8 py-6 border-b ${isHighContrast ? 'border-gray-800' : 'border-gray-100'}`}>
                     <h3 className={`text-lg font-bold flex items-center ${isHighContrast ? 'text-yellow-400' : 'text-[#5C2D91]'}`}>
                       <Monitor className="w-5 h-5 mr-2" />
                       Accesibilidad y Visualización
                     </h3>
                     <p className={`mt-1 text-sm ${isHighContrast ? 'text-gray-300' : 'text-gray-500'}`}>
                       Personalice su experiencia en el dashboard ajustando el contraste, tamaño y movimiento.
                     </p>
                   </div>

                   <div className="p-8 space-y-8">
                     
                     {/* Option 1: High Contrast */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-start">
                         <div className={`p-2 rounded-lg mr-4 ${isHighContrast ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                           <Eye className="w-5 h-5" />
                         </div>
                         <div>
                           <p className={`font-bold ${isHighContrast ? 'text-white' : 'text-gray-900'}`}>Modo Alto Contraste</p>
                           <p className={`text-sm mt-1 ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                             Aumenta la legibilidad reduciendo el uso de colores decorativos y maximizando el contraste.
                           </p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setIsHighContrast(!isHighContrast)}
                         className={toggleSwitchClass(isHighContrast)}
                         aria-pressed={isHighContrast}
                       >
                         <span className={toggleKnobClass(isHighContrast)} />
                       </button>
                     </div>

                     <div className={`h-px w-full ${isHighContrast ? 'bg-gray-800' : 'bg-gray-100'}`}></div>

                     {/* Option 2: Text Size */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-start">
                         <div className={`p-2 rounded-lg mr-4 ${isHighContrast ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                           <Type className="w-5 h-5" />
                         </div>
                         <div>
                           <p className={`font-bold ${isHighContrast ? 'text-white' : 'text-gray-900'}`}>Tamaño de Texto</p>
                           <p className={`text-sm mt-1 ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                             Aumenta el tamaño de la fuente para mejorar la lectura.
                           </p>
                         </div>
                       </div>
                       <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                          <button 
                            onClick={() => setFontSize('normal')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${fontSize === 'normal' ? 'bg-white text-[#5C2D91] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            Normal
                          </button>
                          <button 
                            onClick={() => setFontSize('large')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${fontSize === 'large' ? 'bg-white text-[#5C2D91] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            Grande
                          </button>
                       </div>
                     </div>

                     <div className={`h-px w-full ${isHighContrast ? 'bg-gray-800' : 'bg-gray-100'}`}></div>

                     {/* Option 3: Reduce Motion */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-start">
                         <div className={`p-2 rounded-lg mr-4 ${isHighContrast ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                           <ZapOff className="w-5 h-5" />
                         </div>
                         <div>
                           <p className={`font-bold ${isHighContrast ? 'text-white' : 'text-gray-900'}`}>Reducir Movimiento</p>
                           <p className={`text-sm mt-1 ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                             Elimina las transiciones y animaciones suaves para evitar mareos o distracciones.
                           </p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setReduceMotion(!reduceMotion)}
                         className={toggleSwitchClass(reduceMotion)}
                         aria-pressed={reduceMotion}
                       >
                         <span className={toggleKnobClass(reduceMotion)} />
                       </button>
                     </div>

                     <div className={`h-px w-full ${isHighContrast ? 'bg-gray-800' : 'bg-gray-100'}`}></div>

                     {/* Option 4: Color Blind Mode (Simulated) */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-start">
                         <div className={`p-2 rounded-lg mr-4 ${isHighContrast ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}>
                           <Palette className="w-5 h-5" />
                         </div>
                         <div>
                           <p className={`font-bold ${isHighContrast ? 'text-white' : 'text-gray-900'}`}>Filtro Daltonismo</p>
                           <p className={`text-sm mt-1 ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                             Ajusta los colores para mejorar la diferenciación (Escala de grises + Contraste).
                           </p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setColorBlindMode(!colorBlindMode)}
                         className={toggleSwitchClass(colorBlindMode)}
                         aria-pressed={colorBlindMode}
                       >
                         <span className={toggleKnobClass(colorBlindMode)} />
                       </button>
                     </div>

                   </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modals (Always accessible) */}
      <VolunteerForm 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddVolunteer}
        isHighContrast={isHighContrast}
      />

    </div>
  );
};

export default App;