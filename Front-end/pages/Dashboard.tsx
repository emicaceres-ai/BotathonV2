
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  UserPlus, 
  RefreshCw, 
  AlertCircle, 
  Loader2,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { Volunteer } from '../types';
import { API_CONFIG } from '../constants';

export default function DashboardPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos el endpoint real de Supabase y el header de autorización solicitado
      const response = await fetch(`${API_CONFIG.BASE_URL}/buscar`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener la lista de voluntarios.`);
      }

      const result = await response.json();
      // Handle Supabase response structure (it might be the array directly or { data: [] })
      const data = Array.isArray(result) ? result : (result.data || []);
      
      setVolunteers(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  // --- KPI CALCULATIONS ---

  // 1. Total Volunteers
  const totalVolunteers = volunteers.length;

  // 2. Active Regions (Unique count)
  const uniqueRegions = new Set(volunteers.map(v => v.region).filter(Boolean)).size;

  // 3. New Today
  const newToday = volunteers.filter(v => {
    if (!v.fecha_registro && !v.created_at) return false;
    const regDate = v.fecha_registro 
      ? new Date(v.fecha_registro).toISOString().split('T')[0]
      : new Date(v.created_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return regDate === today;
  }).length;

  // 4. En Riesgo (score_riesgo_baja >= 75)
  const enRiesgo = volunteers.filter(v => {
    const score = (v as any).score_riesgo_baja;
    return typeof score === 'number' && score >= 75;
  }).length;

  // 5. Brechas Detectadas (flag_brecha_cap = true)
  const brechasDetectadas = volunteers.filter(v => {
    const flag = (v as any).flag_brecha_cap;
    return flag === true;
  }).length;

  // 6. Chart Data: Distribution by Region
  const regionStats = volunteers.reduce((acc, curr) => {
    const region = curr.region || 'Sin Región';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(regionStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count) // Sort by highest count
    .slice(0, 10); // Top 10 regions to keep chart clean

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard de Control</h1>
          <p className="text-gray-500 mt-1">Vista general de voluntarios en tiempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden md:inline-block">
            Actualizado: {lastUpdated.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchVolunteers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold">Error de conexión</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button onClick={fetchVolunteers} className="text-sm underline hover:text-red-900">Reintentar</button>
        </div>
      )}

      {/* 2. KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* KPI Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Voluntarios</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {loading ? "-" : totalVolunteers}
            </h3>
            <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Base de datos activa
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* KPI Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Regiones Activas</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {loading ? "-" : uniqueRegions}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Cobertura nacional
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <MapPin className="h-6 w-6" />
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Nuevos Hoy</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {loading ? "-" : newToday}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Registrados las últimas 24h
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <UserPlus className="h-6 w-6" />
          </div>
        </div>

        {/* KPI Card 4 - En Riesgo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">En Riesgo</p>
            <h3 className="text-3xl font-bold text-orange-600">
              {loading ? "-" : enRiesgo}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Score ≥ 75
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        {/* KPI Card 5 - Brechas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Brechas Detectadas</p>
            <h3 className="text-3xl font-bold text-red-600">
              {loading ? "-" : brechasDetectadas}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Requieren capacitacion
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 3. Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Distribución por Región</h3>
            <p className="text-sm text-gray-500">Top regiones con mayor número de voluntarios</p>
          </div>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>

        <div className="h-80 w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-teleton-red" />
                <span className="text-sm">Cargando visualización...</span>
              </div>
            </div>
          ) : volunteers.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p>No hay datos disponibles para el gráfico</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  height={70}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d91f26' : '#b91b22'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
