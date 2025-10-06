// src/components/dashboard/FileManager.jsx - VERSIÓN MEJORADA
import React, { useState, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useFileManager } from '../../hooks/useFileManager';
import { formatFinancial, formatNumber } from '../../utils/formatters';

export default function FileManager() {
  const { state, dispatch } = useApp();
  const { 
    processMultipleFiles, 
    exportData, 
    importData,
    processing, 
    batchProgress 
  } = useFileManager();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    try {
      await processMultipleFiles(files);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const handleExportAll = () => {
    if (state.historicalData.length > 0) {
      const exportPayload = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: state.historicalData
      };
      exportData(exportPayload);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await importData(file);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeFile = (id) => {
    dispatch({ type: 'REMOVE_HISTORICAL_DATA', payload: id });
  };

  const clearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los archivos? Esta acción no se puede deshacer.')) {
      dispatch({ type: 'CLEAR_ALL_DATA' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return formatNumber(bytes / Math.pow(k, i), 2) + ' ' + sizes[i];
  };

  const getFileStatus = (file) => {
    if (!file.metadata) return 'unknown';
    
    const { validation } = file.metadata;
    if (validation.allCalculationsValid) return 'valid';
    if (validation.hasIngresos && validation.hasUtilidadNeta) return 'warning';
    return 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'valid': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header Mejorado */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestor de Archivos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {state.historicalData.length} archivos procesados •{' '}
            {formatFinancial(
              state.historicalData.reduce((sum, file) => sum + file.kpis.utilidad_neta, 0),
              'currency',
              { decimals: 0 }
            )} utilidad total
          </p>
        </div>
        <div className="flex gap-2">
          {/* Selector de Vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cuadrícula
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
            {isExpanded ? 'Contraer' : 'Expandir'}
          </button>
        </div>
      </div>

      {/* Contenido Expandible */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Estadísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Archivos Totales</p>
              <p className="text-2xl font-bold text-blue-700">
                {formatNumber(state.historicalData.length, 0)}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Utilidad Promedio</p>
              <p className="text-2xl font-bold text-green-700">
                {formatFinancial(
                  state.historicalData.length > 0 
                    ? state.historicalData.reduce((sum, file) => sum + file.kpis.utilidad_neta, 0) / state.historicalData.length
                    : 0,
                  'currency',
                  { decimals: 0 }
                )}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Archivos Válidos</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatNumber(
                  state.historicalData.filter(file => getFileStatus(file) === 'valid').length,
                  0
                )}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Espacio Usado</p>
              <p className="text-2xl font-bold text-gray-700">
                {formatFileSize(state.historicalData.reduce((sum, file) => sum + file.fileInfo.size, 0))}
              </p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium text-gray-700">Agregar Archivos</span>
              <span className="text-sm text-gray-500">Múltiples Excel</span>
            </button>

            <button
              onClick={handleExportAll}
              disabled={state.historicalData.length === 0}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium text-gray-700">Exportar Todo</span>
              <span className="text-sm text-gray-500">Backup JSON</span>
            </button>

            <button
              onClick={() => importInputRef.current?.click()}
              disabled={processing}
              className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="font-medium text-gray-700">Importar</span>
              <span className="text-sm text-gray-500">Desde JSON</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            multiple
            className="hidden"
          />

          <input
            type="file"
            ref={importInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />

          {/* Progreso de Procesamiento por Lotes */}
          {processing && batchProgress.total > 1 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-800">Procesando archivos...</span>
                <span className="text-blue-700 text-sm">
                  {batchProgress.current} de {batchProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(batchProgress.current / batchProgress.total) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Lista de Archivos */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">Archivos Procesados</h3>
                <p className="text-sm text-gray-500">
                  {state.historicalData.filter(f => getFileStatus(f) === 'valid').length} de {state.historicalData.length} archivos válidos
                </p>
              </div>
              {state.historicalData.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 border border-red-200 rounded-md hover:bg-red-50 transition-colors duration-200"
                >
                  Limpiar Todo
                </button>
              )}
            </div>

            {state.historicalData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">No hay archivos procesados</p>
                <p className="text-sm">Sube archivos Excel para comenzar el análisis</p>
              </div>
            ) : viewMode === 'list' ? (
              /* Vista de Lista */
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {state.historicalData.map((item) => {
                  const status = getFileStatus(item);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                        state.currentData?.id === item.id
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          state.currentData?.id === item.id ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 truncate">
                              {item.displayName}
                            </p>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                              {getStatusIcon(status)} {status === 'valid' ? 'Válido' : status === 'warning' ? 'Advertencia' : 'Error'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatFileSize(item.fileInfo.size)}</span>
                            <span>•</span>
                            <span>
                              {new Date(item.timestamp).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-green-600">
                              {formatFinancial(item.kpis.utilidad_neta, 'currency', { decimals: 0 })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => dispatch({ type: 'SET_CURRENT_DATA', payload: item })}
                          className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
                            state.currentData?.id === item.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {state.currentData?.id === item.id ? 'Actual' : 'Ver'}
                        </button>
                        
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Eliminar archivo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Vista de Cuadrícula */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.historicalData.map((item) => {
                  const status = getFileStatus(item);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        state.currentData?.id === item.id
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {item.displayName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Utilidad:</span>
                          <span className="font-medium text-green-600">
                            {formatFinancial(item.kpis.utilidad_neta, 'currency', { decimals: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ingresos:</span>
                          <span className="font-medium text-gray-900">
                            {formatFinancial(item.kpis.ingresos_totales, 'currency', { decimals: 0 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tamaño:</span>
                          <span className="font-medium text-gray-900">
                            {formatFileSize(item.fileInfo.size)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => dispatch({ type: 'SET_CURRENT_DATA', payload: item })}
                          className={`flex-1 py-1 text-sm rounded transition-colors duration-200 ${
                            state.currentData?.id === item.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {state.currentData?.id === item.id ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                        
                        <button
                          onClick={() => removeFile(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}