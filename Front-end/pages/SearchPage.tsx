"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Send, BookOpen, Loader2 } from 'lucide-react';
import { Volunteer } from '../types';
import { API_CONFIG, REGIONES_CHILE } from '../constants';

export default function SearchPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [rpaLoading, setRpaLoading] = useState<string | null>(null);

  // Filtros
  const [minScore, setMinScore] = useState<number>(0);
  const [flagBrecha, setFlagBrecha] = useState<boolean | null>(null);
  const [region, setRegion] = useState<string>('');
  const [areaEstudio, setAreaEstudio] = useState<string>('');

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const anonKey = API_CONFIG.ANON_KEY;
      
      if (!anonKey) {
        throw new Error('Error de configuración');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/buscar`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${anonKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);
      setVolunteers(data);
      setFilteredVolunteers(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    let filtered = [...volunteers];

    // Filtro de score
    if (minScore > 0) {
      filtered = filtered.filter(v => {
        const score = (v as any).score_riesgo_baja;
        return typeof score === 'number' && score >= minScore;
      });
    }

    // Filtro de brecha
    if (flagBrecha !== null) {
      filtered = filtered.filter(v => {
        const flag = (v as any).flag_brecha_cap;
        return flag === flagBrecha;
      });
    }

    // Filtro de región
    if (region) {
      filtered = filtered.filter(v => v.region === region);
    }

    // Filtro de área de estudio
    if (areaEstudio) {
      filtered = filtered.filter(v => (v as any).area_estudio === areaEstudio);
    }

    setFilteredVolunteers(filtered);
  }, [volunteers, minScore, flagBrecha, region, areaEstudio]);

  const handleRPAAction = async (type: 'retencion' | 'capacitacion') => {
    setRpaLoading(type);
    try {
      const anonKey = API_CONFIG.ANON_KEY;

      let url = '';
      if (type === 'retencion') {
        // Filtrar por score > 75
        url = `${API_CONFIG.BASE_URL}/buscar?min_score_riesgo=75`;
      } else {
        // Filtrar por flag_brecha_cap = true
        url = `${API_CONFIG.BASE_URL}/buscar?flag_brecha_cap=true`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${anonKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const result = await response.json();
      const data = Array.isArray(result) ? result : (result.data || []);

      // Aquí se activaría Blue Prism
      alert(`${type === 'retencion' ? 'Comunicación Proactiva' : 'Inscripción Urgente'} activada para ${data.length} voluntarios`);
    } catch (err) {
      alert('Error al activar acción RPA');
      console.error(err);
    } finally {
      setRpaLoading(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-600 bg-red-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Búsqueda y Acción Preventiva</h1>
        <p className="text-gray-500 mt-1">Motor de búsqueda con filtros avanzados y acciones RPA (RF-03, RF-04)</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtros de Control</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Score de Riesgo (≥ {minScore})
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>100</span>
            </div>
          </div>

          {/* Filtro de Brecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brecha de Capacitación
            </label>
            <select
              value={flagBrecha === null ? '' : flagBrecha ? 'true' : 'false'}
              onChange={(e) => {
                if (e.target.value === '') setFlagBrecha(null);
                else setFlagBrecha(e.target.value === 'true');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Con Brecha</option>
              <option value="false">Sin Brecha</option>
            </select>
          </div>

          {/* Filtro de Región */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Región/Instituto
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {REGIONES_CHILE.map(reg => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Área de Estudio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área de Estudio
            </label>
            <select
              value={areaEstudio}
              onChange={(e) => setAreaEstudio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="SALUD">Salud</option>
              <option value="EDUCACION">Educación</option>
              <option value="INGENIERIA">Ingeniería</option>
              <option value="ADMINISTRACION">Administración</option>
              <option value="PSICOLOGIA">Psicología</option>
            </select>
          </div>
        </div>

        {/* Botones de Acción RPA */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => handleRPAAction('retencion')}
            disabled={rpaLoading === 'retencion'}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {rpaLoading === 'retencion' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Ejecutar Comunicación Proactiva (Score &gt; 75)
          </button>
          <button
            onClick={() => handleRPAAction('capacitacion')}
            disabled={rpaLoading === 'capacitacion'}
            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {rpaLoading === 'capacitacion' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            Activar Inscripción Urgente (Brecha = TRUE)
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados ({filteredVolunteers.length})
            </h2>
          </div>
          <button
            onClick={fetchVolunteers}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-2">Cargando voluntarios...</p>
          </div>
        ) : filteredVolunteers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron voluntarios con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Región</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área Estudio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score Riesgo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVolunteers.map((volunteer, index) => {
                  const score = (volunteer as any).score_riesgo_baja || 0;
                  const flag = (volunteer as any).flag_brecha_cap || false;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{volunteer.nombre || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{volunteer.region || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(volunteer as any).area_estudio || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {flag ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

