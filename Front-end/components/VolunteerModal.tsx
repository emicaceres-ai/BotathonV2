"use client";

import React, { useState } from 'react';
import { X, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { API_CONFIG, REGIONES_CHILE } from '../constants';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VolunteerModal({ isOpen, onClose, onSuccess }: VolunteerModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    edad: '',
    region: 'Metropolitana',
    area_estudio: '',
    tiene_capacitacion: false,
    razon_no_continuar: '',
    fecha_rechazo_count: '0',
    programa_asignado: '',
    habilidades_input: '',
    campanas_input: '',
    nivel_educacional: 'Media Completa'
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const habilidades = formData.habilidades_input.split(',').map(s => s.trim()).filter(Boolean);
    const campanas = formData.campanas_input.split(',').map(s => s.trim()).filter(Boolean);
    
    const payload: Record<string, unknown> = {
      nombre: formData.nombre,
      correo: formData.correo,
      region: formData.region,
      nivel_educacional: formData.nivel_educacional
    };

    if (formData.edad) {
      payload.edad = Number(formData.edad);
    }

    if (formData.area_estudio) {
      payload.area_estudio = formData.area_estudio;
    }

    payload.tiene_capacitacion = formData.tiene_capacitacion;

    if (formData.razon_no_continuar) {
      payload.razon_no_continuar = formData.razon_no_continuar;
    }

    if (formData.programa_asignado) {
      payload.programa_asignado = formData.programa_asignado;
    }

    payload.fecha_rechazo_count = Number(formData.fecha_rechazo_count) || 0;

    if (habilidades.length > 0) {
      payload.habilidades = habilidades;
    }
    
    if (campanas.length > 0) {
      payload.campanas = campanas;
    }

    const anonKey = API_CONFIG.ANON_KEY;

    if (!anonKey) {
      setStatus('error');
      setErrorMessage('Error de configuración: No se encontró la clave de autenticación. Verifica las variables de entorno en Vercel.');
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/voluntarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${anonKey}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: `;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.details || errorMessage;
        } catch {
          errorMessage += response.statusText;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success === false) {
        throw new Error(result.message || 'Error al registrar voluntario');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setFormData({
          nombre: '', correo: '', edad: '', region: 'Metropolitana',
          area_estudio: '', tiene_capacitacion: false, razon_no_continuar: '',
          fecha_rechazo_count: '0', programa_asignado: '',
          habilidades_input: '', campanas_input: '', nivel_educacional: 'Media Completa'
        });
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Voluntario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campos Obligatorios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre * <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo * <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                min="18"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Rango etario se calculará automáticamente</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Región * <span className="text-red-500">*</span>
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {REGIONES_CHILE.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campos para Scoring */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Datos para Scoring de Riesgo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área de Estudio
                </label>
                <select
                  name="area_estudio"
                  value={formData.area_estudio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="SALUD">Salud</option>
                  <option value="EDUCACION">Educación</option>
                  <option value="INGENIERIA">Ingeniería</option>
                  <option value="ADMINISTRACION">Administración</option>
                  <option value="PSICOLOGIA">Psicología</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiene Capacitación
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    name="tiene_capacitacion"
                    checked={formData.tiene_capacitacion}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Sí, tiene capacitación</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón No Continuar
                </label>
                <input
                  type="text"
                  name="razon_no_continuar"
                  value={formData.razon_no_continuar}
                  onChange={handleChange}
                  placeholder="Ej: Falta de Tiempo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Rechazo Count
                </label>
                <input
                  type="number"
                  name="fecha_rechazo_count"
                  value={formData.fecha_rechazo_count}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programa Asignado
                </label>
                <input
                  type="text"
                  name="programa_asignado"
                  value={formData.programa_asignado}
                  onChange={handleChange}
                  placeholder="Ej: Programa 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Educacional
                </label>
                <select
                  name="nivel_educacional"
                  value={formData.nivel_educacional}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Media Completa">Media Completa</option>
                  <option value="Universitaria">Universitaria</option>
                  <option value="Técnico Superior">Técnico Superior</option>
                  <option value="Postgrado">Postgrado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Habilidades y Campañas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Habilidades (separadas por coma)
              </label>
              <input
                type="text"
                name="habilidades_input"
                value={formData.habilidades_input}
                onChange={handleChange}
                placeholder="Ej: IA, Automatización, Logística"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campañas (separadas por coma)
              </label>
              <input
                type="text"
                name="campanas_input"
                value={formData.campanas_input}
                onChange={handleChange}
                placeholder="Ej: 2023, 2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Mensajes de Estado */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Voluntario registrado exitosamente. Score de riesgo calculado automáticamente.</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Guardar Postulante
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

