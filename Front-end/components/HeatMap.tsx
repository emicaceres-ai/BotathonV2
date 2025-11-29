"use client";

import React from 'react';
import { MapPin } from 'lucide-react';

interface RegionData {
  region: string;
  representatividad: number;
  voluntarios: number;
}

interface HeatMapProps {
  data: RegionData[];
}

export default function HeatMap({ data }: HeatMapProps) {
  // Función para obtener el color según la representatividad
  const getColor = (representatividad: number) => {
    if (representatividad >= 80) return 'bg-green-500';
    if (representatividad >= 60) return 'bg-yellow-400';
    if (representatividad >= 40) return 'bg-orange-400';
    return 'bg-red-500';
  };

  // Función para obtener el color de texto
  const getTextColor = (representatividad: number) => {
    if (representatividad >= 60) return 'text-gray-900';
    return 'text-white';
  };

  // Ordenar por representatividad (menor primero para destacar áreas de baja participación)
  const sortedData = [...data].sort((a, b) => a.representatividad - b.representatividad);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mapa de Esfuerzo Regional</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Alta (≥80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>Media (60-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span>Baja (40-59%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Crítica (&lt;40%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedData.map((item, index) => (
          <div
            key={index}
            className={`${getColor(item.representatividad)} ${getTextColor(item.representatividad)} p-4 rounded-lg shadow-md transition-transform hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">{item.region}</span>
              </div>
              <span className="text-sm font-bold">{item.representatividad.toFixed(1)}%</span>
            </div>
            <div className="text-xs opacity-90">
              {item.voluntarios} voluntarios
            </div>
            {item.representatividad < 60 && (
              <div className="mt-2 text-xs font-medium opacity-90">
                ⚠️ Requiere acción de captación
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay datos de representatividad disponibles
        </div>
      )}
    </div>
  );
}

