
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
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import HeatMap from '../components/HeatMap';
import { Volunteer } from '../types';
import { API_CONFIG } from '../constants';
import VolunteerModal from '../components/VolunteerModal';

export default function DashboardPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos el endpoint real de Supabase y el header de autorización solicitado
      const anonKey = API_CONFIG.ANON_KEY || 
                      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
                      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
                      '';
      
      if (!anonKey) {
        throw new Error('Error de configuración: No se encontró la clave de autenticación. Verifica .env.local');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/buscar`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${anonKey}`,
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

  // 6. KPIs Específicos del MVP
  const razonNoContinuar = volunteers.filter(v => {
    const razon = (v as any).razon_no_continuar;
    return razon && (razon.toLowerCase().includes('tiempo') || razon.toLowerCase().includes('falta'));
  }).length;
  const porcentajeRazonPrincipal = totalVolunteers > 0 
    ? ((razonNoContinuar / totalVolunteers) * 100).toFixed(1) 
    : '0.0';

  const talentoSalud = volunteers.filter(v => {
    const area = (v as any).area_estudio;
    return area && area.toUpperCase() === 'SALUD';
  }).length;
  const porcentajeTalentoSalud = totalVolunteers > 0 
    ? ((talentoSalud / totalVolunteers) * 100).toFixed(1) 
    : '0.0';

  const rangoEtario1829 = volunteers.filter(v => {
    const rango = (v as any).rango_etario;
    return rango && rango.includes('18-29');
  }).length;
  const porcentajeRango1829 = totalVolunteers > 0 
    ? ((rangoEtario1829 / totalVolunteers) * 100).toFixed(1) 
    : '0.0';

  // 7. Chart Data: Distribution by Region
  const regionStats = volunteers.reduce((acc, curr) => {
    const region = curr.region || 'Sin Región';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(regionStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 8. Gráfico de Dona - Distribución de Talento por Área
  const areaStats = volunteers.reduce((acc, curr) => {
    const area = (curr as any).area_estudio || 'Sin Área';
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const donutData = Object.entries(areaStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#d91f26', '#b91b22', '#991b1b', '#7f1d1d', '#dc2626', '#ef4444'];

  // 9. Mapa de Calor - Representatividad por Región
  // Simulamos representatividad basada en el número de voluntarios
  const maxVolunteers = Math.max(...Object.values(regionStats), 1);
  const heatMapData = Object.entries(regionStats).map(([region, count]) => ({
    region,
    voluntarios: count,
    representatividad: (count / maxVolunteers) * 100
  }));

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
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              Registrar Nuevo Voluntario
            </button>
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

      {/* 2. KPIs Section - Métricas Críticas del MVP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI: Razón Principal de Baja */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          role="region"
          aria-label="Razón Principal de Baja"
          aria-describedby="razon-desc"
        >
          <p className="text-sm font-medium text-gray-500 mb-1">Razón Principal de Baja</p>
          <h3 className="text-3xl font-bold text-gray-900" aria-live="polite">
            {loading ? "-" : `${porcentajeRazonPrincipal}%`}
          </h3>
          <p id="razon-desc" className="text-xs text-gray-400 mt-2">Falta de Tiempo</p>
        </div>

        {/* KPI: Talento en Salud */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          role="region"
          aria-label="Talento en Salud"
          aria-describedby="salud-desc"
        >
          <p className="text-sm font-medium text-gray-500 mb-1">Talento en Salud</p>
          <h3 className="text-3xl font-bold text-gray-900" aria-live="polite">
            {loading ? "-" : `${porcentajeTalentoSalud}%`}
          </h3>
          <p id="salud-desc" className="text-xs text-gray-400 mt-2">Área de Estudio: Salud</p>
        </div>

        {/* KPI: Rango Etario 18-29 */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          role="region"
          aria-label="Rango Etario 18-29 años"
          aria-describedby="rango-desc"
        >
          <p className="text-sm font-medium text-gray-500 mb-1">Rango Etario 18-29</p>
          <h3 className="text-3xl font-bold text-gray-900" aria-live="polite">
            {loading ? "-" : `${porcentajeRango1829}%`}
          </h3>
          <p id="rango-desc" className="text-xs text-gray-400 mt-2">Voluntarios jóvenes</p>
        </div>

        {/* KPI: En Riesgo */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          role="region"
          aria-label="Voluntarios en Riesgo"
          aria-describedby="riesgo-desc"
        >
          <p className="text-sm font-medium text-gray-500 mb-1">En Riesgo</p>
          <h3 className="text-3xl font-bold text-orange-600" aria-live="polite">
            {loading ? "-" : enRiesgo}
          </h3>
          <p id="riesgo-desc" className="text-xs text-gray-400 mt-2">Score ≥ 75</p>
        </div>
      </div>

      {/* 2b. KPIs Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* KPI Card 1 */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between"
          role="region"
          aria-label="Total de Voluntarios"
          aria-describedby="total-desc"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Voluntarios</p>
            <h3 className="text-3xl font-bold text-gray-900" aria-live="polite">
              {loading ? "-" : totalVolunteers}
            </h3>
            <p id="total-desc" className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" aria-hidden="true"></span>
              Base de datos activa
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600" aria-hidden="true">
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

      {/* 3. Gráficos Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Dona - Distribución de Talento */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          role="region"
          aria-label="Gráfico de Distribución de Talento por Área de Estudio"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Distribución de Talento</h3>
            <p className="text-sm text-gray-500">Por Área de Estudio (énfasis en Salud)</p>
            <p className="sr-only" id="dona-desc">
              Gráfico de Dona mostrando la distribución de voluntarios por área de estudio. 
              {donutData.length > 0 && donutData.map((item, idx) => 
                `${item.name}: ${((item.value / totalVolunteers) * 100).toFixed(1)}%${idx < donutData.length - 1 ? ', ' : '.'}`
              ).join('')}
            </p>
          </div>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : donutData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <p>No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart aria-label="Gráfico de Dona de Distribución de Talento">
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    aria-labelledby="dona-desc"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Gráfico de Barras - Distribución por Región */}
        <div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          role="region"
          aria-label="Gráfico de Barras de Distribución por Región"
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Distribución por Región</h3>
            <p className="text-sm text-gray-500">Top regiones con mayor número de voluntarios</p>
            <p className="sr-only" id="barras-desc">
              Gráfico de Barras mostrando las top 10 regiones con mayor número de voluntarios. 
              {chartData.length > 0 && chartData.map((item, idx) => 
                `${item.name}: ${item.count} voluntarios${idx < chartData.length - 1 ? ', ' : '.'}`
              ).join('')}
            </p>
          </div>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <p>No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  aria-label="Gráfico de Barras de Distribución por Región"
                  aria-labelledby="barras-desc"
                >
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

      {/* 4. Mapa de Calor Regional */}
      <div 
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        role="region"
        aria-label="Mapa de Esfuerzo Regional"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Mapa de Esfuerzo Regional</h3>
          <p className="text-sm text-gray-500">Representatividad (%) por Instituto/Región - Áreas con baja participación requieren acción de captación</p>
          <p className="sr-only" id="heatmap-desc">
            Mapa de calor mostrando la representatividad por región. 
            {heatMapData.length > 0 && heatMapData.map((item, idx) => 
              `${item.region}: ${item.representatividad.toFixed(1)}% de representatividad, ${item.voluntarios} voluntarios${idx < heatMapData.length - 1 ? ', ' : '.'}`
            ).join('')}
          </p>
        </div>
        <div aria-labelledby="heatmap-desc">
          <HeatMap data={heatMapData} />
        </div>
      </div>

      {/* Modal de Registro */}
      <VolunteerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchVolunteers();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
