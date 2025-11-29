import React, { useState, useEffect } from 'react';
import { AlertTriangle, Users, Heart, TrendingUp } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { supabaseService } from '../services/supabaseService';
import { Volunteer } from '../types';
import { COLORS } from '../constants';
import KPICards from '../components/KPICards';
import ChartsSection from '../components/ChartsSection';

const Dashboard: React.FC = () => {
  const { settings } = useAccessibility();
  const isHighContrast = settings.highContrast;
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    enRiesgo: 0,
    brechas: 0,
    regionesActivas: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await supabaseService.searchVolunteers({});
      if (result.success && result.data) {
        setVolunteers(result.data);
        
        const enRiesgo = result.data.filter(v => (v.score_riesgo_baja || 0) >= 75).length;
        const brechas = result.data.filter(v => v.flag_brecha_cap).length;
        const regiones = new Set(result.data.map(v => v.region)).size;
        
        setStats({
          total: result.data.length,
          enRiesgo,
          brechas,
          regionesActivas: regiones,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPIs */}
      <section aria-label="Indicadores Clave">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Voluntarios */}
          <div className={`relative p-6 rounded-2xl shadow-md border transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 ${
            isHighContrast ? 'bg-black border-white border-2' : 'bg-white border-gray-200'
          }`} role="region" aria-label="Total de voluntarios registrados">
            <div className={`absolute top-0 left-0 w-full h-1 ${isHighContrast ? 'bg-white' : 'bg-[#00A499]'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Total Voluntarios</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-[#00A499]'}`}>{stats.total}</h3>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-teal-50 text-[#00A499]'}`}>
                <Users aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* En Riesgo */}
          <div className={`relative p-6 rounded-2xl shadow-md border transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 ${
            isHighContrast ? 'bg-black border-white border-2' : 'bg-white border-gray-200'
          }`} role="region" aria-label="Voluntarios en riesgo de deserción">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : 'bg-[#D6001C]'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>En Riesgo</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-[#D6001C]'}`}>{stats.enRiesgo}</h3>
                <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Score ≥ 75</p>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-red-50 text-[#D6001C]'}`}>
                <AlertTriangle aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Brechas Detectadas */}
          <div className={`relative p-6 rounded-2xl shadow-md border transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 ${
            isHighContrast ? 'bg-black border-white border-2' : 'bg-white border-gray-200'
          }`} role="region" aria-label="Brechas de capacitación detectadas">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : 'bg-orange-500'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Brechas Detectadas</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-orange-500'}`}>{stats.brechas}</h3>
                <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Capacitación Crítica</p>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-orange-50 text-orange-500'}`}>
                <TrendingUp aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Regiones Activas */}
          <div className={`relative p-6 rounded-2xl shadow-md border transition-all duration-300 overflow-hidden hover:shadow-lg hover:-translate-y-1 ${
            isHighContrast ? 'bg-black border-white border-2' : 'bg-white border-gray-200'
          }`} role="region" aria-label="Regiones activas con voluntarios">
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : 'bg-[#5C2D91]'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Regiones Activas</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-[#5C2D91]'}`}>{stats.regionesActivas}</h3>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-purple-50 text-[#5C2D91]'}`}>
                <Heart aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Análisis Gráfico">
        <ChartsSection isHighContrast={isHighContrast} />
      </section>

      <div className={`p-6 rounded-2xl border text-center shadow-sm ${isHighContrast ? 'bg-gray-900 border-gray-700 border-2' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`} role="note" aria-label="Información de navegación">
        <p className={`text-sm ${isHighContrast ? 'text-white' : 'text-blue-800'}`}>
          Para gestionar acciones individuales o filtrar la lista, diríjase a la sección <strong>Gestión Voluntarios</strong>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

