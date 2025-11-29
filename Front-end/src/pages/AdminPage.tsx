import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';

const AdminPage: React.FC = () => {
  const { settings } = useAccessibility();
  const isHighContrast = settings.highContrast;

  return (
    <div className="max-w-3xl mx-auto">
      <div className={`rounded-xl shadow-sm border overflow-hidden ${isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'}`}>
        <div className={`px-6 py-5 ${isHighContrast ? 'bg-gray-900 border-b border-white' : 'bg-[#5C2D91]'}`}>
          <h2 className={`text-lg font-bold flex items-center ${isHighContrast ? 'text-yellow-400' : 'text-white'}`}>
            <Upload className="mr-2 h-5 w-5" />
            Centro de Carga de Datos
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className={`p-6 rounded-lg border ${isHighContrast ? 'bg-gray-900 border-white' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-sm ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>
              Esta funcionalidad estará disponible próximamente. Permite cargar archivos CSV o Excel con datos de voluntarios para procesamiento masivo.
            </p>
          </div>

          <div className={`p-6 rounded-lg border-2 border-dashed ${isHighContrast ? 'border-white' : 'border-gray-300'}`}>
            <div className="text-center">
              <FileText className={`mx-auto h-12 w-12 ${isHighContrast ? 'text-white' : 'text-gray-400'}`} />
              <p className={`mt-4 text-sm ${isHighContrast ? 'text-white' : 'text-gray-600'}`}>
                Arrastra y suelta archivos aquí o haz clic para seleccionar
              </p>
              <p className={`mt-2 text-xs ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
                Formatos soportados: CSV, XLSX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

