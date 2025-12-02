// src/App.jsx
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import MainLayout from './components/layout/MainLayout';
import FileUploadZone from './components/dashboard/FileUploadZone';
import KpiCards from './components/dashboard/KpiCards';
import CategoryBreakdown from './components/dashboard/CategoryBreakdown';
import ComparativeAnalysis from './components/dashboard/ComparativeAnalysis';
import ChartsSection from './components/dashboard/ChartsSection';
import FileManager from './components/dashboard/FileManager';
import AdvancedComparison from './components/dashboard/AdvancedComparison';
import { useFileManager } from './hooks/useFileManager';

// 🔐 Autenticación
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Componente simple para recordatorio de pantalla completa
function FullscreenHint() {
  const [showHint, setShowHint] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowHint(!showHint)}
          onMouseEnter={() => setShowHint(true)}
          onMouseLeave={() => setShowHint(false)}
          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 group"
          title="Pantalla completa disponible (F11)"
        >
          <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          <span>Pantalla Completa</span>
        </button>

        {/* Tooltip que aparece al hover o click */}
        {showHint && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3 z-50 animate-fade-in border border-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-amber-400/20 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium mb-1">Usa pantalla completa nativa</p>
                <p className="text-gray-300 text-xs mb-2">
                  Presiona <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 font-mono">F11</kbd> para entrar/salir
                </p>
                <p className="text-gray-400 text-xs">
                  Chrome, Edge, Brave: F11<br />
                  Mac: ⌘ + Shift + F
                </p>
              </div>
            </div>
            {/* Flecha del tooltip */}
            <div className="absolute -top-1 right-4 w-3 h-3 bg-gray-900 transform rotate-45 border-t border-l border-gray-700"></div>
          </div>
        )}
      </div>
    </>
  );
}

function DashboardContent() {
  const { state, dispatch } = useApp();
  const { exportData } = useFileManager();

  const handleExportCurrent = () => {
    if (state.currentData) {
      const exportPayload = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: [state.currentData]
      };
      exportData(exportPayload);
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

  // Detectar si estamos en pantalla completa nativa
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      setIsNativeFullscreen(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    };

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Indicador sutil cuando está en pantalla completa nativa */}
      {isNativeFullscreen && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 z-50 border border-gray-700">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          Pantalla completa activa • F11 para salir
        </div>
      )}

      {/* Sección de Subida de Archivos */}
      {!state.currentData && (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bienvenido al Dashboard Automotriz
            </h1>
            <p className="text-lg text-gray-600">
              Sube tu reporte mensual de Excel para analizar los resultados financieros
            </p>
          </div>
          <FileUploadZone />
        </div>
      )}

      {/* Dashboard con Datos */}
      {state.currentData && (
        <>
          {/* Header Mejorado */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {state.viewMode === 'comparison' ? 'Comparación Múltiple' : 'Análisis de Resultados'} - {state.currentData.fileInfo.name}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Procesado el {new Date(state.currentData.metadata.processedAt).toLocaleDateString('es-MX')}
                {state.viewMode === 'comparison' && ` • ${state.comparisonData.length} archivos en comparación`}
              </p>

              {/* Indicador de Modo de Vista */}
              {state.viewMode === 'comparison' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Modo Comparación
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {/* Botón de Recordatorio de Pantalla Completa */}
              <FullscreenHint />

              {/* Botón de Nuevo Análisis */}
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Nuevo Análisis
              </button>

              {/* Botón de Exportación Mejorado */}
              <div className="relative group">
                <button
                  onClick={handleExportCurrent}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar
                </button>

                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={handleExportCurrent}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    Exportar archivo actual
                  </button>
                  <button
                    onClick={handleExportAll}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                  >
                    Exportar todos los archivos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gestor de Archivos */}
          <FileManager />

          {/* Comparación Avanzada */}
          {state.historicalData.length >= 2 && <AdvancedComparison />}

          {/* KPIs Principales */}
          <KpiCards data={state.currentData} />

          {/* Gráficos */}
          <ChartsSection 
            currentData={state.currentData} 
            historicalData={state.historicalData}
            comparisonData={state.comparisonData}
            viewMode={state.viewMode}
          />

          {/* Grid de Análisis Tradicional */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <CategoryBreakdown data={state.currentData} />
            <ComparativeAnalysis data={state.currentData} />
          </div>

          {/* Información del Procesamiento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Información del Procesamiento
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Procesado correctamente</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Archivo</p>
                <p className="font-medium text-gray-900">{state.currentData.fileInfo.name}</p>
                <p className="text-xs text-gray-500">
                  {(state.currentData.fileInfo.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Procesado</p>
                <p className="font-medium text-gray-900">
                  {new Date(state.currentData.metadata.processedAt).toLocaleString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Métricas Calculadas</p>
                <p className="font-medium text-gray-900">{state.currentData.metadata.total_kpis} KPIs</p>
                <p className="text-xs text-gray-500">
                  {state.currentData.metadata.conceptsFound} conceptos encontrados
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium">Archivos Totales</p>
                <p className="font-medium text-gray-900">{state.historicalData.length} procesados</p>
                <p className="text-xs text-gray-500">
                  {state.comparisonSelection.length} en comparación
                </p>
              </div>
            </div>

            {/* Detalles Técnicos */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-medium text-gray-900 mb-3">Detalles Técnicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-500">Hoja detectada</p>
                  <p className="font-medium">{state.currentData.metadata.sheetDetected}</p>
                </div>
                <div>
                  <p className="text-gray-500">Versión del procesador</p>
                  <p className="font-medium">{state.currentData.metadata.version}</p>
                </div>
                <div>
                  <p className="text-gray-500">Filas procesadas</p>
                  <p className="font-medium">{state.currentData.metadata.rowsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Validación</p>
                  <p className="font-medium">
                    {state.currentData.metadata.validation.allCalculationsValid ? '✓ Todos los cálculos válidos' : '⚠ Verificar datos'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de Comparación */}
          {state.viewMode === 'comparison' && state.comparisonData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de Comparación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {state.comparisonData.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 
                        index === 1 ? 'bg-green-500' : 
                        index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                      }`}></div>
                      <h3 className="font-medium text-gray-900 text-sm truncate">
                        {item.displayName}
                      </h3>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Utilidad Neta:</span>
                        <span className="font-medium text-gray-900">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                            minimumFractionDigits: 0
                          }).format(item.kpis.utilidad_neta)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ingresos:</span>
                        <span className="font-medium text-gray-900">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                            minimumFractionDigits: 0
                          }).format(item.kpis.ingresos_totales)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Margen Neto:</span>
                        <span className="font-medium text-gray-900">
                          {item.kpis.margen_neto}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Estado de Carga */}
      {state.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center max-w-md mx-4 animate-fade-in">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 font-medium text-lg mb-2">
              {state.historicalData.length > 0 ? 'Procesando archivos...' : 'Procesando archivo Excel'}
            </p>
            <p className="text-gray-500 text-sm text-center">
              {state.historicalData.length > 0 
                ? 'Analizando múltiples archivos y calculando métricas...' 
                : 'Analizando datos financieros y calculando métricas...'
              }
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar Error si existe */}
      {state.error && !state.loading && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-40 max-w-md animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-800">Error al procesar archivo</p>
              <p className="text-red-700 text-sm mt-1">{state.error}</p>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
              className="text-red-500 hover:text-red-700 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardContent />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;