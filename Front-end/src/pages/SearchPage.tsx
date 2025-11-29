import React, { useState, useEffect } from 'react';
import { Filter, Zap, Play, Loader2, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { supabaseService } from '../services/supabaseService';
import { geminiService } from '../services/gemini';
import { Volunteer, FilterArea } from '../types';
import ActionPanel from '../components/ActionPanel';
import ResultsTable from '../components/ResultsTable';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const isHighContrast = settings.highContrast;
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [minRisk, setMinRisk] = useState<number>(0);
  const [gapOnly, setGapOnly] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<string>(FilterArea.ALL);
  const [rpaLoading, setRpaLoading] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadVolunteers();
  }, [minRisk, gapOnly, selectedArea]);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (minRisk > 0) filters.min_score_riesgo = minRisk;
      if (gapOnly) filters.flag_brecha_cap = true;
      if (selectedArea !== FilterArea.ALL) filters.area_estudio = selectedArea;
      
      const result = await supabaseService.searchVolunteers(filters);
      if (result.success && result.data) {
        setVolunteers(result.data);
      }
    } catch (error) {
      console.error('Error loading volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRPAAction = async (type: 'retencion' | 'capacitacion') => {
    try {
      setRpaLoading(type);
      const result = await supabaseService.getUrgentVolunteers();
      if (result.success && result.data) {
        const data = result.data;
        alert(`${type === 'retencion' ? 'Comunicación Proactiva' : 'Inscripción Urgente'} activada para ${data.length} voluntarios`);
      }
    } catch (err) {
      alert('Error al activar acción RPA');
      console.error(err);
    } finally {
      setRpaLoading(null);
    }
  };

  const handleGenerateInsight = async () => {
    setAiLoading(true);
    const highRisk = volunteers.filter(v => (v.score_riesgo_baja || 0) > 75);
    const gap = volunteers.filter(v => v.flag_brecha_cap);
    
    try {
      const insight = await geminiService.generateInsight(highRisk, gap);
      setAiInsight(insight);
    } catch (error) {
      console.error('Error generating insight:', error);
      setAiInsight('Error al generar insight');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(vol => {
    const riskCondition = (vol.score_riesgo_baja || 0) >= minRisk;
    const gapCondition = gapOnly ? vol.flag_brecha_cap === true : true;
    const areaCondition = selectedArea === FilterArea.ALL ? true : vol.area_estudio === selectedArea;
    return riskCondition && gapCondition && areaCondition;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
        onOpenAddModal={() => navigate('/voluntarios/nuevo')}
        onRPAAction={handleRPAAction}
        onGenerateInsight={handleGenerateInsight}
        rpaLoading={rpaLoading}
        aiLoading={aiLoading}
        aiInsight={aiInsight}
      />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <ResultsTable volunteers={filteredVolunteers} isHighContrast={isHighContrast} />
      )}
    </div>
  );
};

export default SearchPage;

