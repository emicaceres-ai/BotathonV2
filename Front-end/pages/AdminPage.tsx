"use client";

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Map, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { API_CONFIG } from '../constants';

interface ColumnMapping {
  fileColumn: string;
  dbColumn: string;
}

export default function AdminPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'mapping' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Campos del esquema de la BD
  const dbColumns = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'edad', label: 'Edad' },
    { value: 'rango_etario', label: 'Rango Etario' },
    { value: 'region', label: 'Región' },
    { value: 'area_estudio', label: 'Área de Estudio' },
    { value: 'estado', label: 'Estado' },
    { value: 'razon_no_continuar', label: 'Razón No Continuar' },
    { value: 'tiene_capacitacion', label: 'Tiene Capacitación' },
    { value: 'programa_asignado', label: 'Programa Asignado' },
    { value: 'fecha_rechazo_count', label: 'Fecha Rechazo Count' },
    { value: 'habilidades', label: 'Habilidades' },
    { value: 'campañas', label: 'Campañas' },
    { value: 'nivel_educacional', label: 'Nivel Educacional' }
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setStatus('uploading');
    setError(null);
    setSuccessMessage(null);

    try {
      // Leer el archivo para extraer columnas
      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length > 0) {
        // Detectar si es CSV o Excel
        const firstLine = lines[0];
        const columns = firstLine.split(',').map(col => col.trim().replace(/"/g, ''));
        setFileColumns(columns);
        
        // Inicializar mapeo vacío
        const initialMapping: ColumnMapping[] = columns.map(col => ({
          fileColumn: col,
          dbColumn: ''
        }));
        setColumnMapping(initialMapping);
        setStatus('mapping');
      }
    } catch (err) {
      setError('Error al leer el archivo. Asegúrate de que sea CSV o XLSX válido.');
      setStatus('error');
    }
  };

  const handleMappingChange = (fileColumn: string, dbColumn: string) => {
    setColumnMapping(prev => 
      prev.map(mapping => 
        mapping.fileColumn === fileColumn 
          ? { ...mapping, dbColumn }
          : mapping
      )
    );
  };

  const handleConsolidate = async () => {
    const requiredFields = ['nombre', 'correo', 'region'];
    const mappedFields = columnMapping
      .filter(m => m.dbColumn && requiredFields.includes(m.dbColumn))
      .map(m => m.dbColumn);

    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingFields.length > 0) {
      setError(`Faltan campos obligatorios: ${missingFields.join(', ')}`);
      return;
    }

    setStatus('processing');
    setError(null);
    setLoading(true);

    try {
      // Aquí iría la lógica de consolidación
      // Por ahora simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccessMessage('Datos consolidados y procesados exitosamente. Scores calculados automáticamente.');
      setStatus('success');
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setStatus('idle');
        setSelectedFile(null);
        setFileColumns([]);
        setColumnMapping([]);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consolidar datos');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Módulo Administrador</h1>
        <p className="text-gray-500 mt-1">Carga masiva de datos y mapeo de columnas (RF-01, RNF-A)</p>
      </div>

      {/* Paso 1: Carga de Archivo */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">1. Cargar Archivo de Datos</h2>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <label className="cursor-pointer">
            <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Haz clic para seleccionar archivo
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={status === 'processing'}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">Formatos soportados: CSV, XLSX</p>
          {selectedFile && (
            <p className="text-sm text-gray-700 mt-2">
              Archivo seleccionado: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Paso 2: Mapeo de Columnas */}
      {status === 'mapping' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Map className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">2. Mapeo de Columnas (RNF-A)</h2>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Empareja las columnas del archivo con los campos del esquema de la base de datos.
          </p>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {columnMapping.map((mapping, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Columna del Archivo
                  </label>
                  <input
                    type="text"
                    value={mapping.fileColumn}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                <div className="text-gray-400">→</div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campo de la Base de Datos
                  </label>
                  <select
                    value={mapping.dbColumn}
                    onChange={(e) => handleMappingChange(mapping.fileColumn, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Seleccionar --</option>
                    {dbColumns.map(col => (
                      <option key={col.value} value={col.value}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleConsolidate}
              disabled={loading || columnMapping.every(m => !m.dbColumn)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Consolidar y Procesar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mensajes de Estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-800">Éxito</h3>
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>El archivo debe contener al menos: nombre, correo, región</li>
          <li>Los scores de riesgo se calcularán automáticamente después de la consolidación</li>
          <li>El mapeo de columnas permite adaptar diferentes formatos de archivo</li>
        </ul>
      </div>
    </div>
  );
}

