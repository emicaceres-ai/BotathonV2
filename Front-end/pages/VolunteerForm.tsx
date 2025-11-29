"use client";

import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const REGIONES_CHILE = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", 
  "Valparaíso", "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", 
  "Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"
];

export default function Page() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    region: 'Metropolitana',
    habilidades_input: '',
    campanas_input: '',
    nivel_educacional: 'Media Completa'
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const payload = {
      nombre: formData.nombre,
      correo: formData.correo,
      region: formData.region,
      nivel_educacional: formData.nivel_educacional,
      habilidades: formData.habilidades_input.split(',').map(s => s.trim()).filter(Boolean),
      campanas: formData.campanas_input.split(',').map(s => s.trim()).filter(Boolean),
      estado: 'pendiente'
    };

    try {
      const response = await fetch(
        "https://tatvmvjoinyfkxeclbso.supabase.co/functions/v1/voluntarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error("Error en el servidor: " + errText);
      }

      setStatus('success');

      // CLEAN FORM
      setFormData({
        nombre: '',
        correo: '',
        region: 'Metropolitana',
        habilidades_input: '',
        campanas_input: '',
        nivel_educacional: 'Media Completa'
      });

    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Voluntario</h1>
        <p className="text-gray-500 mt-2">
          Ingresa los datos del postulante para registrarlo en el sistema.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {status === 'success' ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Voluntario creado con éxito!</h3>
            <button 
              onClick={() => setStatus('idle')}
              className="px-6 py-2 bg-teleton-red text-white rounded-lg hover:bg-teleton-dark transition-colors font-medium"
            >
              Registrar otro voluntario
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nombre */}
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Correo */}
            <div className="space-y-2">
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                value={formData.correo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Región + Nivel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">Región</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  {REGIONES_CHILE.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="nivel_educacional" className="block text-sm font-medium text-gray-700">Nivel Educacional</label>
                <select
                  id="nivel_educacional"
                  name="nivel_educacional"
                  value={formData.nivel_educacional}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option>Básica Incompleta</option>
                  <option>Básica Completa</option>
                  <option>Media Incompleta</option>
                  <option>Media Complepleta</option>
                  <option>Técnico Superior</option>
                  <option>Universitaria</option>
                  <option>Postgrado</option>
                </select>
              </div>
            </div>

            {/* Habilidades */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Habilidades (coma)</label>
              <input
                name="habilidades_input"
                value={formData.habilidades_input}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Campañas */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Campañas (coma)</label>
              <input
                name="campanas_input"
                value={formData.campanas_input}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 inline mr-2" />
                {errorMessage}
              </div>
            )}

            <button
              disabled={status === 'loading'}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-teleton-red text-white rounded-lg"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : <Send />}
              {status === 'loading' ? "Guardando..." : "Crear Voluntario"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
