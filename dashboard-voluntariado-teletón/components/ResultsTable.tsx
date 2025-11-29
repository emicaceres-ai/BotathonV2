import React from 'react';
import { Volunteer } from '../types';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ResultsTableProps {
  volunteers: Volunteer[];
  isHighContrast: boolean;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ volunteers, isHighContrast }) => {
  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden ${isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'}`}>
      <div className={`px-6 py-5 border-b flex justify-between items-center ${isHighContrast ? 'border-white' : 'border-gray-100'}`}>
        <h3 className={`text-lg font-bold ${isHighContrast ? 'text-white' : 'text-[#1A1A1A]'}`}>
          Nomina de Voluntarios
        </h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isHighContrast ? 'bg-white text-black' : 'bg-gray-100 text-gray-600'}`}>
          {volunteers.length} Registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" role="grid" aria-label="Tabla de voluntarios segmentados">
          <thead className={isHighContrast ? 'bg-gray-900 text-white border-b border-white' : 'bg-[#D6001C] text-white'}>
            <tr>
              <th scope="col" className="px-6 py-4 font-bold tracking-wide">Nombre</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wide">Región</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wide">Área</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wide">Scoring Riesgo</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wide">Brecha</th>
              <th scope="col" className="px-6 py-4 font-bold tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody className={isHighContrast ? 'divide-y divide-white' : 'divide-y divide-gray-100'}>
            {volunteers.map((vol, index) => {
              const isHighRisk = vol.score_riesgo_baja > 75;
              return (
                <tr 
                  key={vol.id} 
                  className={`transition-colors ${
                    isHighContrast 
                      ? 'hover:bg-gray-900 focus:bg-gray-900' 
                      : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-50'
                  }`}
                  tabIndex={0}
                >
                  <td className={`px-6 py-4 font-medium ${isHighContrast ? 'text-white' : 'text-gray-900'}`}>{vol.nombre}</td>
                  <td className={`px-6 py-4 ${isHighContrast ? 'text-gray-300' : 'text-gray-600'}`}>{vol.region}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      vol.area_estudio === 'Salud' 
                        ? (isHighContrast ? 'bg-white text-black border border-white' : 'bg-purple-100 text-[#5C2D91]')
                        : (isHighContrast ? 'bg-transparent border border-gray-400 text-white' : 'bg-gray-100 text-gray-700')
                    }`}>
                      {vol.area_estudio}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-20 h-1.5 rounded-full mr-3 ${isHighContrast ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-1.5 rounded-full ${isHighRisk ? 'bg-red-600' : 'bg-green-500'} ${isHighContrast && isHighRisk ? 'bg-yellow-400' : ''}`}
                          style={{ width: `${vol.score_riesgo_baja}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-bold ${isHighRisk ? (isHighContrast ? 'text-yellow-400' : 'text-red-600') : (isHighContrast ? 'text-gray-400' : 'text-gray-500')}`}>
                        {vol.score_riesgo_baja}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {vol.flag_brecha_cap ? (
                      <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${isHighContrast ? 'text-red-400 border border-red-400' : 'bg-red-50 text-[#D6001C]'}`}>
                        <AlertCircle className="w-3 h-3 mr-1.5" />
                        CRÍTICA
                      </div>
                    ) : (
                      <span className="text-gray-300 px-2">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <CheckCircle className={`w-5 h-5 ${isHighContrast ? 'text-green-400' : 'text-[#00A499]'}`} />
                  </td>
                </tr>
              );
            })}
            {volunteers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  No se encontraron voluntarios con los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};