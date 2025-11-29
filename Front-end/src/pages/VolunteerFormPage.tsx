import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, UserPlus } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { supabaseService } from '../services/supabaseService';
import { REGIONES_CHILE, HABILIDADES_COMUNES } from '../constants';
import { Volunteer } from '../types';

const VolunteerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useAccessibility();
  const isHighContrast = settings.highContrast;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    region: REGIONES_CHILE[0],
    edad: '',
    nivel_educacional: '',
    area_estudio: '',
    tiene_capacitacion: false,
    habilidades: [] as string[],
    campañas: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const volunteerData: Partial<Volunteer> = {
        nombre: formData.nombre,
        correo: formData.correo,
        region: formData.region,
        edad: formData.edad ? parseInt(formData.edad) : undefined,
        nivel_educacional: formData.nivel_educacional,
        area_estudio: formData.area_estudio,
        tiene_capacitacion: formData.tiene_capacitacion,
        habilidades: formData.habilidades,
        campañas: formData.campañas,
      };

      const result = await supabaseService.createVolunteer(volunteerData);
      
      if (result.success) {
        alert('Voluntario registrado exitosamente');
        navigate('/buscar');
      } else {
        setError(result.message || 'Error al registrar voluntario');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrar voluntario');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all text-sm ${
    isHighContrast 
      ? 'bg-black border-white text-white focus:ring-1 focus:ring-yellow-400' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#D6001C] focus:border-transparent'
  }`;

  const labelClass = `block mb-1.5 text-xs font-bold uppercase tracking-wide ${isHighContrast ? 'text-white' : 'text-gray-500'}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`rounded-xl shadow-sm border overflow-hidden ${isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-5 flex justify-between items-center ${isHighContrast ? 'bg-gray-900 border-b border-white' : 'bg-[#D6001C]'}`}>
          <h2 className={`text-lg font-bold flex items-center ${isHighContrast ? 'text-yellow-400' : 'text-white'}`}>
            <UserPlus className="mr-2 h-5 w-5" />
            Ficha de Inscripción 2024
          </h2>
          <button 
            onClick={() => navigate('/buscar')} 
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className={`p-4 rounded-lg ${isHighContrast ? 'bg-red-900 text-red-200 border border-red-500' : 'bg-red-50 text-red-800'}`}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre Completo *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Correo Electrónico *</label>
              <input
                type="email"
                required
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Región *</label>
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className={inputClass}
              >
                {REGIONES_CHILE.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Edad</label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.edad}
                onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nivel Educacional</label>
              <select
                value={formData.nivel_educacional}
                onChange={(e) => setFormData({ ...formData, nivel_educacional: e.target.value })}
                className={inputClass}
              >
                <option value="">Seleccione...</option>
                <option value="Media Completa">Ens. Media Completa</option>
                <option value="Tecnico Superior">Técnico Superior</option>
                <option value="Universitaria Incompleta">Universitaria Incompleta</option>
                <option value="Universitaria Completa">Universitaria Completa</option>
                <option value="Postgrado">Postgrado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Área de Estudio</label>
              <select
                value={formData.area_estudio}
                onChange={(e) => setFormData({ ...formData, area_estudio: e.target.value })}
                className={inputClass}
              >
                <option value="">Seleccione...</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Social">Social</option>
                <option value="Ingeniería">Ingeniería</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.tiene_capacitacion}
                onChange={(e) => setFormData({ ...formData, tiene_capacitacion: e.target.checked })}
                className="w-4 h-4"
              />
              <span className={isHighContrast ? 'text-white' : 'text-gray-700'}>Tiene Capacitación</span>
            </label>
          </div>

          <div>
            <label className={labelClass}>Habilidades</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {HABILIDADES_COMUNES.map(habilidad => (
                <label key={habilidad} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.habilidades.includes(habilidad)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, habilidades: [...formData.habilidades, habilidad] });
                      } else {
                        setFormData({ ...formData, habilidades: formData.habilidades.filter(h => h !== habilidad) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className={isHighContrast ? 'text-white text-sm' : 'text-gray-700 text-sm'}>{habilidad}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Campañas</label>
            <div className="flex flex-wrap gap-2">
              {['2021', '2022', '2023', '2024'].map(campaña => (
                <label key={campaña} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.campañas.includes(campaña)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, campañas: [...formData.campañas, campaña] });
                      } else {
                        setFormData({ ...formData, campañas: formData.campañas.filter(c => c !== campaña) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className={isHighContrast ? 'text-white text-sm' : 'text-gray-700 text-sm'}>{campaña}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isHighContrast ? 'bg-gray-900 border-white' : 'bg-gray-50 border-gray-100'}`}>
            <button
              type="button"
              onClick={() => navigate('/buscar')}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${isHighContrast ? 'text-white border border-white hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-transform active:scale-95 disabled:opacity-50 ${
                isHighContrast 
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                  : 'bg-[#00A499] text-white hover:bg-[#008f85]'
              }`}
            >
              {loading ? 'Guardando...' : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Completar Inscripción
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerFormPage;

