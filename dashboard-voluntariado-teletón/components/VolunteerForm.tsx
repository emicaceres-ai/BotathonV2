import React, { useState } from 'react';
import { X, Save, UserPlus, ChevronDown, ChevronUp, User, MapPin, Briefcase } from 'lucide-react';
import { Volunteer, FilterArea } from '../types';
import { REGIONAL_DATA } from '../constants';

interface VolunteerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: Omit<Volunteer, 'id'>) => void;
  isHighContrast: boolean;
}

export const VolunteerForm: React.FC<VolunteerFormProps> = ({ isOpen, onClose, onSave, isHighContrast }) => {
  // State for form sections visibility
  const [activeSection, setActiveSection] = useState<number>(1);

  const [formData, setFormData] = useState({
    // Section 1: Personal
    rut: '',
    nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    estado_civil: '',
    nacionalidad: 'Chilena',
    
    // Section 2: Contact
    email: '',
    telefono: '',
    region: REGIONAL_DATA[0].name,
    comuna: '',
    direccion: '',
    
    // Section 3: Profile (Existing + New)
    nivel_educacional: '',
    institucion: '',
    profesion: '',
    area_estudio: FilterArea.SALUD,
    rango_etario: '18-29'
  });

  if (!isOpen) return null;

  const toggleSection = (section: number) => {
    setActiveSection(activeSection === section ? 0 : section);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mockScore = Math.floor(Math.random() * 40); 
    const mockGap = formData.area_estudio === FilterArea.SALUD && Math.random() > 0.7;

    const fullName = `${formData.nombre} ${formData.apellidos}`.trim();

    onSave({
      ...formData,
      nombre: fullName || formData.nombre, // Fallback logic
      estado: true,
      score_riesgo_baja: mockScore,
      flag_brecha_cap: mockGap
    });
    
    // Reset form roughly
    setFormData({
      rut: '', nombre: '', apellidos: '', fecha_nacimiento: '', genero: '', estado_civil: '', nacionalidad: 'Chilena',
      email: '', telefono: '', region: REGIONAL_DATA[0].name, comuna: '', direccion: '',
      nivel_educacional: '', institucion: '', profesion: '', area_estudio: FilterArea.SALUD, rango_etario: '18-29'
    });
    onClose();
  };

  const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all text-sm ${
    isHighContrast 
      ? 'bg-black border-white text-white focus:ring-1 focus:ring-yellow-400' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#D6001C] focus:border-transparent'
  }`;

  const labelClass = `block mb-1.5 text-xs font-bold uppercase tracking-wide ${isHighContrast ? 'text-white' : 'text-gray-500'}`;
  
  const sectionHeaderClass = (isActive: boolean) => `
    flex items-center justify-between w-full p-4 text-left font-bold border-b transition-colors
    ${isHighContrast 
      ? (isActive ? 'bg-gray-800 text-yellow-400 border-white' : 'bg-black text-white border-gray-600') 
      : (isActive ? 'bg-red-50 text-[#D6001C] border-red-100' : 'bg-white text-gray-700 border-gray-100 hover:bg-gray-50')
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isHighContrast ? 'bg-black border-2 border-white' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`px-6 py-5 flex justify-between items-center flex-shrink-0 ${isHighContrast ? 'bg-gray-900 border-b border-white' : 'bg-[#D6001C]'}`}>
          <h2 className={`text-lg font-bold flex items-center ${isHighContrast ? 'text-yellow-400' : 'text-white'}`}>
            <UserPlus className="mr-2 h-5 w-5" />
            Ficha de Inscripción 2024
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* SECTION 1: DATOS PERSONALES */}
          <div>
            <button type="button" onClick={() => toggleSection(1)} className={sectionHeaderClass(activeSection === 1)}>
              <div className="flex items-center"><User className="w-4 h-4 mr-2"/> 1. Datos Personales</div>
              {activeSection === 1 ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
            
            {activeSection === 1 && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>RUT</label>
                    <input type="text" required placeholder="12.345.678-9" 
                      value={formData.rut} onChange={e => setFormData({...formData, rut: e.target.value})} className={inputClass} 
                    />
                  </div>
                   <div>
                    <label className={labelClass}>Fecha Nacimiento</label>
                    <input type="date" required 
                      value={formData.fecha_nacimiento} onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} className={inputClass} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className={labelClass}>Nombres</label>
                    <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Apellidos</label>
                    <input type="text" required value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                    <label className={labelClass}>Género</label>
                    <select className={inputClass} value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})}>
                      <option value="">Seleccione...</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                   <div>
                    <label className={labelClass}>Estado Civil</label>
                    <select className={inputClass} value={formData.estado_civil} onChange={e => setFormData({...formData, estado_civil: e.target.value})}>
                      <option value="">Seleccione...</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Nacionalidad</label>
                    <input type="text" value={formData.nacionalidad} onChange={e => setFormData({...formData, nacionalidad: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: CONTACTO */}
          <div>
            <button type="button" onClick={() => toggleSection(2)} className={sectionHeaderClass(activeSection === 2)}>
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-2"/> 2. Contacto y Ubicación</div>
              {activeSection === 2 ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
            
            {activeSection === 2 && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" required placeholder="ejemplo@correo.cl"
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} 
                    />
                  </div>
                   <div>
                    <label className={labelClass}>Teléfono / Móvil</label>
                    <input type="tel" placeholder="+569..." 
                      value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className={inputClass} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className={labelClass}>Región</label>
                     <select className={inputClass} value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                        {REGIONAL_DATA.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                      </select>
                  </div>
                  <div>
                    <label className={labelClass}>Comuna</label>
                    <input type="text" placeholder="Ej: Providencia" value={formData.comuna} onChange={e => setFormData({...formData, comuna: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Dirección (Calle, Número, Depto)</label>
                  <input type="text" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: PERFIL ACADÉMICO */}
          <div>
             <button type="button" onClick={() => toggleSection(3)} className={sectionHeaderClass(activeSection === 3)}>
              <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2"/> 3. Perfil y Educación</div>
              {activeSection === 3 ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
            
            {activeSection === 3 && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className={labelClass}>Nivel Educacional</label>
                    <select className={inputClass} value={formData.nivel_educacional} onChange={e => setFormData({...formData, nivel_educacional: e.target.value})}>
                      <option value="">Seleccione...</option>
                      <option value="Media Completa">Ens. Media Completa</option>
                      <option value="Tecnico Superior">Técnico Superior</option>
                      <option value="Universitaria Incompleta">Universitaria Incompleta</option>
                      <option value="Universitaria Completa">Universitaria Completa</option>
                      <option value="Postgrado">Postgrado</option>
                    </select>
                  </div>
                   <div>
                    <label className={labelClass}>Institución</label>
                    <input type="text" placeholder="Universidad / Instituto" value={formData.institucion} onChange={e => setFormData({...formData, institucion: e.target.value})} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Profesión / Carrera</label>
                    <input type="text" value={formData.profesion} onChange={e => setFormData({...formData, profesion: e.target.value})} className={inputClass} />
                  </div>
                   <div>
                    <label className={labelClass}>Área de Interés (Teletón)</label>
                    <select className={inputClass} value={formData.area_estudio} onChange={e => setFormData({...formData, area_estudio: e.target.value as any})}>
                      {Object.values(FilterArea).filter(area => area !== FilterArea.ALL).map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>

                 <div>
                    <label className={labelClass}>Rango Etario (Calculado)</label>
                     <select className={inputClass} value={formData.rango_etario} onChange={e => setFormData({...formData, rango_etario: e.target.value})}>
                      <option value="18-29">18-29 años</option>
                      <option value="30-45">30-45 años</option>
                      <option value="46+">46+ años</option>
                    </select>
                  </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className={`px-6 py-4 border-t flex-shrink-0 flex justify-end gap-3 ${isHighContrast ? 'bg-gray-900 border-white' : 'bg-gray-50 border-gray-100'}`}>
           <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${isHighContrast ? 'text-white border border-white hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className={`flex items-center px-6 py-2.5 rounded-lg font-bold text-sm shadow-md transition-transform active:scale-95 ${
                isHighContrast 
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                  : 'bg-[#00A499] text-white hover:bg-[#008f85]'
              }`}
            >
              <Save className="mr-2 h-4 w-4" />
              Completar Inscripción
            </button>
        </div>

      </div>
    </div>
  );
};