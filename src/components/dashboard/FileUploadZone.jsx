// src/components/dashboard/FileUploadZone.jsx
import React, { useCallback, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useFileProcessor } from '../../hooks/useFileProcessor';

export default function FileUploadZone() {
  const { state, dispatch } = useApp();
  const { processFile, processing } = useFileProcessor();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleProcessFile = async (file) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await processFile(file);
      dispatch({ type: 'ADD_DATA', payload: result });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => file.name.match(/\.(xlsx|xls)$/i));
    
    if (excelFile) {
      handleProcessFile(excelFile);
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Por favor, sube un archivo Excel válido' });
    }
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${processing ? 'opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {processing ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Procesando archivo...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0l-3-3m3 3l3-3" />
              </svg>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Arrastra tu reporte Excel aquí
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  O haz clic para seleccionar un archivo
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Formatos soportados: .xlsx, .xls
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                Seleccionar Archivo
              </label>
            </div>
          </>
        )}
      </div>

      {state.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      {state.currentData && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">
            ✅ Archivo procesado correctamente: {state.currentData.fileInfo.name}
          </p>
        </div>
      )}
    </div>
  );
}