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
    <div className="space-y-8 animate-in fade-in duration-500" style={{ padding: '24px' }}>
      {/* KPIs */}
      <section aria-label="Indicadores Clave">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Voluntarios */}
          <div 
            className={`relative p-6 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
              isHighContrast 
                ? 'bg-black border-white border-2' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              borderRadius: isHighContrast ? '20px' : 'var(--radius-large)',
              boxShadow: isHighContrast ? 'none' : 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }
            }}
            role="region" 
            aria-label="Total de voluntarios registrados"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'var(--t-green)' }}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Total Voluntarios</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : ''}`} style={{ color: isHighContrast ? '#FFFF00' : 'var(--t-green)' }}>{stats.total}</h3>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'rgba(0, 158, 115, 0.1)', color: isHighContrast ? '#000000' : 'var(--t-green)' }}>
                <Users aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* En Riesgo */}
          <div 
            className={`relative p-6 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
              isHighContrast 
                ? 'bg-black border-white border-2' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              borderRadius: isHighContrast ? '20px' : 'var(--radius-large)',
              boxShadow: isHighContrast ? 'none' : 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }
            }}
            role="region" 
            aria-label="Voluntarios en riesgo de deserción"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'var(--t-red)' }}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>En Riesgo</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : ''}`} style={{ color: isHighContrast ? '#FFFF00' : 'var(--t-red)' }}>{stats.enRiesgo}</h3>
                <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Score ≥ 75</p>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'rgba(230, 0, 38, 0.1)', color: isHighContrast ? '#000000' : 'var(--t-red)' }}>
                <AlertTriangle aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Brechas Detectadas */}
          <div 
            className={`relative p-6 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
              isHighContrast 
                ? 'bg-black border-white border-2' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              borderRadius: isHighContrast ? '20px' : 'var(--radius-large)',
              boxShadow: isHighContrast ? 'none' : 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }
            }}
            role="region" 
            aria-label="Brechas de capacitación detectadas"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'var(--t-yellow)' }}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Brechas Detectadas</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : ''}`} style={{ color: isHighContrast ? '#FFFF00' : 'var(--t-yellow)' }}>{stats.brechas}</h3>
                <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Capacitación Crítica</p>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'rgba(255, 194, 14, 0.1)', color: isHighContrast ? '#000000' : 'var(--t-yellow)' }}>
                <TrendingUp aria-hidden="true" className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Regiones Activas */}
          <div 
            className={`relative p-6 transition-all duration-300 overflow-hidden hover:-translate-y-1 ${
              isHighContrast 
                ? 'bg-black border-white border-2' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              borderRadius: isHighContrast ? '20px' : 'var(--radius-large)',
              boxShadow: isHighContrast ? 'none' : 'var(--shadow-card)',
            }}
            onMouseEnter={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }
            }}
            role="region" 
            aria-label="Regiones activas con voluntarios"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${isHighContrast ? 'bg-white' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'var(--t-purple)' }}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Regiones Activas</p>
                <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : ''}`} style={{ color: isHighContrast ? '#FFFF00' : 'var(--t-purple)' }}>{stats.regionesActivas}</h3>
              </div>
              <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'rgba(90, 45, 130, 0.1)', color: isHighContrast ? '#000000' : 'var(--t-purple)' }}>
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

      <div 
        className={`p-6 text-center ${isHighContrast ? 'bg-gray-900 border-gray-700 border-2' : 'border border-gray-200'}`}
        style={{
          borderRadius: isHighContrast ? '20px' : 'var(--radius-large)',
          boxShadow: isHighContrast ? 'none' : 'var(--shadow-card)',
          background: isHighContrast ? '#000000' : 'linear-gradient(to right, rgba(245, 245, 247, 0.8), rgba(90, 45, 130, 0.05))',
        }}
        role="note" 
        aria-label="Información de navegación"
      >
        <p className={`text-sm ${isHighContrast ? 'text-white' : ''}`} style={{ color: isHighContrast ? '#FFFFFF' : 'var(--t-gray-dark)' }}>
          Para gestionar acciones individuales o filtrar la lista, diríjase a la sección <strong>Gestión Voluntarios</strong>.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

