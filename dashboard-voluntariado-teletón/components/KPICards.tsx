import React from 'react';
import { AlertTriangle, Users, Heart } from 'lucide-react';
import { COLORS } from '../constants';

interface KPIProps {
  isHighContrast: boolean;
}

export const KPICards: React.FC<KPIProps> = ({ isHighContrast }) => {
  // Corporate styled card base
  const cardBase = `relative p-6 rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
    isHighContrast 
      ? 'bg-black border-white' 
      : 'bg-white border-gray-100 hover:shadow-md'
  }`;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Razón de Baja */}
      <div className={cardBase}>
        <div className={`absolute top-0 left-0 w-full h-1 ${isHighContrast ? 'bg-white' : 'bg-[#D6001C]'}`}></div>
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Riesgo Principal</p>
            <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-[#D6001C]'}`}>47.6%</h3>
            <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Falta de Tiempo</p>
          </div>
          <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-red-50 text-[#D6001C]'}`}>
            <AlertTriangle aria-hidden="true" className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
           <span className={`text-xs ${isHighContrast ? 'text-gray-300' : 'text-gray-500'}`}>2do Factor: Problemas de Salud (23.8%)</span>
        </div>
      </div>

      {/* Card 2: Brecha de Género */}
      <div className={cardBase}>
        <div className={`absolute top-0 left-0 w-full h-1 ${isHighContrast ? 'bg-white' : 'bg-[#5C2D91]'}`}></div>
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Fuerza Femenina</p>
            <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-[#5C2D91]'}`}>83.5%</h3>
            <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Mujeres en el equipo</p>
          </div>
          <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-purple-50 text-[#5C2D91]'}`}>
            <Users aria-hidden="true" className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
           <span className={`text-xs ${isHighContrast ? 'text-gray-300' : 'text-gray-500'}`}>Objetivo: Atraer Hombres &gt; 30 años</span>
        </div>
      </div>

      {/* Card 3: Motivación */}
      <div className={cardBase}>
        <div className={`absolute top-0 left-0 w-full h-1 ${isHighContrast ? 'bg-white' : 'bg-[#00A499]'}`}></div>
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Motivación Rehab.</p>
            <h3 className={`text-4xl font-extrabold mt-3 ${isHighContrast ? 'hc-text-yellow' : 'text-[#00A499]'}`}>63.7%</h3>
            <p className={`text-sm mt-1 font-medium ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>Compromiso Inclusión</p>
          </div>
          <div className={`p-3 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-teal-50 text-[#00A499]'}`}>
            <Heart aria-hidden="true" className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
           <span className={`text-xs ${isHighContrast ? 'text-gray-300' : 'text-gray-500'}`}>Desafío: Fidelizar por desarrollo personal</span>
        </div>
      </div>
    </div>
  );
};