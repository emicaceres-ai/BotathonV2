import React, { useState } from 'react';
import { Filter, Zap, Play, Loader2, UserPlus, Sparkles } from 'lucide-react';
import { FilterArea, Volunteer } from '../types';
import { aiService } from '../services/aiService';

interface ActionPanelProps {
  isHighContrast: boolean;
  minRisk: number;
  setMinRisk: (val: number) => void;
  gapOnly: boolean;
  setGapOnly: (val: boolean) => void;
  selectedArea: string;
  setSelectedArea: (val: string) => void;
  filteredCount: number;
  filteredVolunteers: Volunteer[];
  onOpenAddModal: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  isHighContrast,
  minRisk,
  setMinRisk,
  gapOnly,
  setGapOnly,
  selectedArea,
  setSelectedArea,
  filteredCount,
  filteredVolunteers,
  onOpenAddModal
}) => {
  const [rpaLoading, setRpaLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const handleRPAAction = (actionType: 'comm' | 'enroll') => {
    setRpaLoading(true);
    // Simulate RPA API Call
    setTimeout(() => {
      setRpaLoading(false);
      alert(`ACCIÓN EJECUTADA: ${actionType === 'comm' ? 'Comunicación de Retención' : 'Inscripción Urgente'} para ${filteredCount} voluntarios.`);
    }, 1500);
  };

  const handleGenerateInsight = async () => {
    setAiLoading(true);
    const highRisk = filteredVolunteers.filter(v => v.score_riesgo_baja > 75);
    const gap = filteredVolunteers.filter(v => v.flag_brecha_cap);
    
    const insight = await aiService.generateInsight(highRisk, gap);
    setAiInsight(insight);
    setAiLoading(false);
  };

  return (
    <div className={`rounded-xl shadow-sm p-6 mb-8 border transition-all ${isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className={`text-xl font-bold flex items-center ${isHighContrast ? 'text-white' : 'text-[#1A1A1A]'}`}>
          <Filter className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
          Filtros de Segmentación
        </h2>
        {aiInsight && (
           <div className={`mt-2 md:mt-0 md:ml-6 p-4 rounded-lg text-sm max-w-xl flex items-start animate-fade-in ${isHighContrast ? 'bg-gray-900 border border-yellow-400 text-yellow-400' : 'bg-purple-50 text-purple-900'}`}>
             <Sparkles className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
             <div>
                <strong>Recomendación IA:</strong> {aiInsight}
             </div>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        
        {/* Risk Slider */}
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between">
             <label htmlFor="risk-slider" className={`text-sm font-semibold ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>
                Nivel de Riesgo
             </label>
             <span className={`text-sm font-bold ${isHighContrast ? 'text-yellow-400' : 'text-[#D6001C]'}`}>{minRisk}%</span>
          </div>
          <input
            id="risk-slider"
            type="range"
            min="0"
            max="100"
            value={minRisk}
            onChange={(e) => setMinRisk(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D6001C]"
            style={{ accentColor: isHighContrast ? '#ffff00' : '#D6001C' }}
          />
        </div>

        {/* Area Dropdown */}
        <div className="flex flex-col space-y-3">
          <label htmlFor="area-select" className={`text-sm font-semibold ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>
            Área de Estudio
          </label>
          <select
            id="area-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className={`block w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-offset-1 focus:ring-[#5C2D91] focus:border-[#5C2D91] outline-none transition-shadow ${isHighContrast ? 'bg-black text-white border-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
          >
            {Object.values(FilterArea).map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        {/* Gap Toggle */}
        <div className="flex items-center pb-3">
          <label className="relative inline-flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              checked={gapOnly} 
              onChange={(e) => setGapOnly(e.target.checked)} 
              className="sr-only peer"
              id="gap-toggle"
            />
            <div className={`w-11 h-6 rounded-full peer transition-colors ${gapOnly ? 'bg-[#D6001C]' : 'bg-gray-300'} ${isHighContrast ? 'border-2 border-white' : ''}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${gapOnly ? 'translate-x-full' : ''}`}></div>
            <span className={`ml-3 text-sm font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'} group-hover:text-[#D6001C] transition-colors`}>
              Brecha Crítica (Salud)
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4">
        <button
          onClick={() => handleRPAAction('comm')}
          disabled={rpaLoading || filteredCount === 0}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 ${
            isHighContrast 
              ? 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-black' 
              : 'bg-[#5C2D91] text-white hover:bg-[#4a2475] disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {rpaLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Zap className="mr-2 h-4 w-4" />}
          Comunicación de Retención
        </button>

        <button
          onClick={() => handleRPAAction('enroll')}
          disabled={rpaLoading || !gapOnly}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 ${
            isHighContrast 
              ? 'bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' 
              : 'bg-white text-[#D6001C] border border-[#D6001C] hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          <Play className="mr-2 h-4 w-4" fill="currentColor" />
          Inscripción Urgente
        </button>

        <button
          onClick={onOpenAddModal}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm active:scale-95 ${
            isHighContrast
              ? 'bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
              : 'bg-[#00A499] text-white hover:bg-[#008f85]'
          }`}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Voluntario
        </button>

        <button
          onClick={handleGenerateInsight}
          disabled={aiLoading}
          className={`flex items-center justify-center px-6 py-3 rounded-lg font-bold text-sm ml-auto transition-all shadow-sm active:scale-95 ${
            isHighContrast
              ? 'bg-gray-800 text-white border border-white hover:bg-gray-700'
              : 'bg-gray-900 text-white hover:bg-black'
          }`}
        >
           {aiLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <><Sparkles className="w-4 h-4 mr-2" /> Análisis Inteligente</>}
        </button>
      </div>
    </div>
  );
};