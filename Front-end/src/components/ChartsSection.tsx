import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { COLORS } from '../constants';

interface ChartProps {
  isHighContrast: boolean;
}

const REGIONAL_DATA = [
  { name: 'Metropolitana', value: 60.14, volunteers: 414 },
  { name: 'Puerto Montt', value: 101.04, volunteers: 96 },
  { name: 'Arica', value: 90.54, volunteers: 74 },
  { name: 'Coquimbo', value: 92.21, volunteers: 77 },
  { name: 'Antofagasta', value: 86.18, volunteers: 123 },
  { name: 'Valparaíso', value: 68.94, volunteers: 132 },
  { name: 'Talca', value: 45.24, volunteers: 168 },
];

const TALENT_DISTRIBUTION = [
  { name: 'Salud', value: 41, color: COLORS.teletonRed },
  { name: 'Educación', value: 14, color: COLORS.teletonPurple },
  { name: 'Sociales', value: 11, color: '#FFB81C' },
  { name: 'Ingeniería', value: 7, color: '#00A499' },
  { name: 'Otros', value: 27, color: '#707070' },
];

const MOTIVATION_DATA = [
  { name: 'Rehabilitación/Inclusión', value: 63.67 },
  { name: 'Tiempo/Aporte', value: 17.83 },
  { name: 'Experiencia Previa', value: 5.50 },
  { name: 'Otro', value: 13.0 }
];

const ChartsSection: React.FC<ChartProps> = ({ isHighContrast }) => {
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

  const containerClass = `rounded-2xl p-6 border shadow-md hover:shadow-lg transition-all duration-300 ${
    isHighContrast ? 'bg-black border-white border-2' : 'bg-white border-gray-200'
  }`;

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map Heatmap Table */}
        <div className={containerClass}>
          <h3 className={`text-xl font-bold mb-2 ${isHighContrast ? 'hc-text-yellow' : 'text-[#1A1A1A]'}`} aria-label="Representatividad Regional por Instituto">
            Representatividad Regional
          </h3>
          <p className={`text-sm mb-6 ${isHighContrast ? 'text-white' : 'text-gray-600'}`}>
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

        {/* Donut Chart */}
        <div className={`${containerClass} flex flex-col items-center`}>
          <div className="w-full text-left mb-4">
            <h3 className={`text-xl font-bold mb-2 ${isHighContrast ? 'hc-text-yellow' : 'text-[#1A1A1A]'}`} aria-label="Distribución de Perfil Académico">
              Perfil Académico
            </h3>
            <p className={`text-sm ${isHighContrast ? 'text-white' : 'text-gray-600'}`}>Dominio Salud (41%) y Educación (14%)</p>
          </div>
          
          <div className="w-full h-64 min-h-[256px]" aria-label="Gráfico de dona mostrando distribución de áreas de estudio">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
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

      {/* Bar Chart */}
      <div className={containerClass}>
        <h3 className={`text-xl font-bold mb-2 ${isHighContrast ? 'hc-text-yellow' : 'text-[#1A1A1A]'}`} aria-label="Motivaciones para el Ingreso al Voluntariado">
          Motivaciones para el Ingreso
        </h3>
        <p className={`text-sm mb-6 ${isHighContrast ? 'text-white' : 'text-gray-600'}`}>Principales razones declaradas en la encuesta</p>
        <div className="w-full h-64 min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
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

export default ChartsSection;

