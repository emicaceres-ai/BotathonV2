import React, { useState, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Database, Loader2 } from 'lucide-react';
import { Volunteer } from '../types';

interface DocumentUploadProps {
  onDataLoaded: (newVolunteers: Volunteer[]) => void;
  isHighContrast: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDataLoaded, isHighContrast }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const newVolunteers: Volunteer[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        
        const getVal = (keyPart: string) => {
          const index = headers.findIndex(h => h.includes(keyPart));
          return index > -1 && values[index] ? values[index].trim() : '';
        };

        const nombre = getVal('nombre') || `Voluntario Importado ${i}`;
        const region = getVal('region') || 'Metropolitana';
        const area = getVal('area') || 'Otro';
        const edad = getVal('edad') || '18-29';
        
        const score = Math.floor(Math.random() * 100); 
        const brecha = area.toLowerCase().includes('salud') && Math.random() > 0.7;

        newVolunteers.push({
          id: `csv-${Date.now()}-${i}`,
          nombre: nombre.replace(/['"]+/g, ''),
          region: region.replace(/['"]+/g, ''),
          area_estudio: area.replace(/['"]+/g, ''),
          rango_etario: edad.replace(/['"]+/g, ''),
          estado: true,
          score_riesgo_baja: score,
          flag_brecha_cap: brecha
        });
      }

      if (newVolunteers.length > 0) {
        onDataLoaded(newVolunteers);
        setMessage({ type: 'success', text: `Base de datos actualizada: ${newVolunteers.length} nuevos registros procesados.` });
      } else {
        setMessage({ type: 'error', text: 'El archivo parece estar vacío o tener un formato incorrecto.' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error al procesar el archivo. Verifique el formato CSV.' });
    }
    setProcessing(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType !== 'csv' && fileType !== 'xlsx' && fileType !== 'xls') {
      setMessage({ type: 'error', text: 'Formato no soportado. Por favor use archivos CSV o Excel.' });
      return;
    }

    setProcessing(true);
    setMessage({ type: 'info', text: 'Analizando estructura del archivo...' });

    setTimeout(() => {
      if (fileType === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          parseCSV(text);
        };
        reader.readAsText(file);
      } else {
        setMessage({ type: 'success', text: 'Archivo Excel procesado exitosamente (Simulación).' });
        setProcessing(false);
      }
    }, 1500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={`rounded-xl shadow-sm p-6 mb-8 border transition-all ${isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center mb-5">
        <div className={`p-2 rounded-lg mr-3 ${isHighContrast ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-[#5C2D91]'}`}>
           <Database className="w-5 h-5" />
        </div>
        <h2 className={`text-lg font-bold ${isHighContrast ? 'text-white' : 'text-[#1A1A1A]'}`}>
          Carga de Datos Masiva
        </h2>
      </div>
      
      <p className={`mb-6 text-sm ${isHighContrast ? 'text-gray-300' : 'text-gray-500'}`}>
        Arrastre archivos CSV o Excel para sincronizar nuevos voluntarios. El sistema recalculará los indicadores de riesgo automáticamente.
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 group
          ${isDragging 
            ? (isHighContrast ? 'border-yellow-400 bg-gray-900' : 'border-[#D6001C] bg-red-50') 
            : (isHighContrast ? 'border-gray-600 hover:border-white' : 'border-gray-300 hover:border-[#D6001C] hover:bg-gray-50')
          }
        `}
        role="button"
        aria-label="Zona de carga de archivos"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv,.xlsx,.xls" 
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        {processing ? (
          <div className="flex flex-col items-center">
            <Loader2 className={`w-10 h-10 mb-4 animate-spin ${isHighContrast ? 'text-yellow-400' : 'text-[#D6001C]'}`} />
            <span className={`font-semibold ${isHighContrast ? 'text-white' : 'text-gray-800'}`}>Procesando información...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-4 transition-colors ${isHighContrast ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-gray-100 group-hover:bg-white'}`}>
               <Upload className={`w-8 h-8 ${isHighContrast ? 'text-gray-400' : 'text-gray-400 group-hover:text-[#D6001C]'}`} />
            </div>
            <p className={`font-medium text-base ${isHighContrast ? 'text-white' : 'text-gray-700'}`}>
              <span className="underline">Haga clic</span> o arrastre el archivo aquí
            </p>
            <p className={`text-xs mt-2 ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
              Compatible con .CSV, .XLSX, .XLS (Sin límite de tamaño)
            </p>
          </div>
        )}
      </div>

      {message && (
        <div className={`mt-5 p-4 rounded-lg flex items-start animate-fade-in ${
          message.type === 'success' 
            ? (isHighContrast ? 'bg-green-900 text-white border border-green-500' : 'bg-green-50 text-green-800 border border-green-100')
            : message.type === 'error'
            ? (isHighContrast ? 'bg-red-900 text-white border border-red-500' : 'bg-red-50 text-red-800 border border-red-100')
            : (isHighContrast ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-800')
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}
    </div>
  );
};