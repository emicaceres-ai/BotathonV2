import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TALENT_DISTRIBUTION, REGIONAL_DATA, MOTIVATION_DATA, COLORS } from '../constants';

interface ChartProps {
  isHighContrast: boolean;
}

export const ChartsSection: React.FC<ChartProps> = ({ isHighContrast }) => {
  const activeColors = isHighContrast ? COLORS.highContrast : COLORS.chartSafe;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill={isHighContrast ? 'black' : 'white'} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const containerClass = `rounded-xl p-6 border shadow-sm ${
    isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'
  }`;

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Map Heatmap Table */}
        <div className={containerClass}>
          <h3 className={`text-lg font-bold mb-1 ${isHighContrast ? 'hc-text-yellow' : 'text-[#1A1A1A]'}`}>
            Representatividad Regional
          </h3>
          <p className={`text-xs mb-5 ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>
            Encuesta 2024 - Destacan Puerto Montt (101%) y Arica (90%).
          </p>
          <div className="space-y-4 h-64 overflow-y-auto pr-2 custom-scrollbar">
            {REGIONAL_DATA.map((region) => (
              <div key={region.name} className="relative group" tabIndex={0} aria-label={`Región ${region.name}, ${region.value}% representatividad`}>
                <div className="flex justify-between text-sm font-medium mb-1.5">
                  <span className={isHighContrast ? 'text-white' : 'text-gray-700'}>{region.name}</span>
                  <span className={`font-bold ${isHighContrast ? 'hc-text-yellow' : 'text-[#5C2D91]'}`}>{region.value}%</span>
                </div>
                <div className={`w-full h-2.5 rounded-full ${isHighContrast ? 'bg-gray-800 border border-white' : 'bg-gray-100'}`}>
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isHighContrast ? 'bg-white' : (region.value < 50 ? 'bg-[#D6001C]' : 'bg-[#5C2D91]')}`}
                    style={{ width: `${Math.min(region.value, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Chart: Areas of Study */}
        <div className={`${containerClass} flex flex-col items-center`}>
          <div className="w-full text-left mb-4">
             <h3 className={`text-lg font-bold mb-1 ${isHighContrast ? 'hc-text-yellow' : 'text-[#1A1A1A]'}`}>
              Perfil Académico
            </h3>
            <p className={`text-xs ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Dominio Salud (41%) y Educación (14%)</p>
          </div>
         
          <div className="w-full h-64" aria-label="Gráfico de dona mostrando distribución de áreas de estudio">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TALENT_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={85}
                  innerRadius={45}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {TALENT_DISTRIBUTION.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={activeColors[index % activeColors.length]} 
                      stroke={isHighContrast ? '#000' : 'none'}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isHighContrast ? '#000' : '#fff', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: isHighContrast ? '#fff' : '#000', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: isHighContrast ? '#fff' : '#555', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart: Motivations */}
      <div className={containerClass}>
         <h3 className={`text-lg font-bold mb-1 ${isHighContrast ? 'hc-text-yellow' : 'text-[#1A1A1A]'}`}>
            Motivaciones para el Ingreso
          </h3>
          <p className={`text-xs mb-4 ${isHighContrast ? 'text-white' : 'text-gray-500'}`}>Principales razones declaradas en la encuesta</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={MOTIVATION_DATA}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isHighContrast ? '#444' : '#f0f0f0'} />
                <XAxis type="number" stroke={isHighContrast ? '#fff' : '#999'} fontSize={11} />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={160} 
                    stroke={isHighContrast ? '#fff' : '#555'} 
                    tick={{fontSize: 12, fontWeight: 500}} 
                />
                <Tooltip 
                    cursor={{fill: isHighContrast ? '#333' : '#f9fafb'}} 
                    contentStyle={{ backgroundColor: isHighContrast ? '#000' : '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    itemStyle={{color: isHighContrast ? '#fff' : '#333'}} 
                />
                <Bar dataKey="value" fill={isHighContrast ? '#ffff00' : '#D6001C'} radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};