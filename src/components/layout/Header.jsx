// src/components/layout/Header.jsx - VERSIÓN MEJORADA CON ANIMACIONES
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';

export default function Header() {
  const { state } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsVisible(true);
    
    // Actualizar la hora cada segundo para tiempo real
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-gray-900 border-b-4 border-yellow-500 shadow-2xl relative overflow-hidden">
      {/* Efecto de gradiente sutil en el fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-yellow-500/5 pointer-events-none"></div>
      
      <div className="flex items-center justify-between px-8 py-5 relative z-10">
        {/* Logo y título con animaciones */}
        <div className={`transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-yellow-500 transform group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-xl">AR</span>
              </div>
              
              {/* Efecto de iluminación amarilla al hover */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
              
              {/* Punto de estado conectado */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white font-sans group">
                Dashboard <span className="text-yellow-500 relative">
                  Automotriz
                  {/* Subrayado animado */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-500"></span>
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-300 text-sm font-light">
                  Análisis de resultados financieros en tiempo real
                </p>
                
                {/* Hora y fecha actual EN TIEMPO REAL */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700 font-mono">
                    {formatTime(currentTime)}
                  </span>
                  <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
                    {formatDate(currentTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del lado derecho */}
        <div className={`flex items-center gap-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          {state.currentData && (
            <div className="group relative">
              {/* Efecto de iluminación para el cuadro de archivo */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-yellow-500 rounded-lg blur opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
              
              <div className="text-right bg-gray-800 px-5 py-3 rounded-lg border-l-4 border-blue-500 relative z-10 transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/10">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium flex items-center gap-2 justify-end">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Archivo actual
                </p>
                <p className="font-semibold text-white text-sm mt-1 max-w-xs truncate">
                  {state.currentData.fileInfo.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {state.currentData.metadata.rowsCount} registros procesados
                </p>
              </div>
            </div>
          )}
          
          {/* Indicador de estado del sistema */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-all duration-500"></div>
            
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-yellow-500 transform group-hover:scale-110 transition-all duration-300 relative z-10">
              <span className="text-white font-bold text-lg">AR</span>
              
              {/* Anillo de estado animado */}
              <div className="absolute -inset-2 border-2 border-yellow-400 rounded-full animate-ping opacity-20"></div>
            </div>
            
            {/* Tooltip de estado */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 border border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Sistema activo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso sutil en la parte inferior */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-yellow-500 to-blue-500 opacity-20">
        <div className="h-full bg-yellow-400 w-1/3 animate-pulse-slow rounded-full"></div>
      </div>

      {/* Partículas de efecto visual (opcional) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-5 animate-pulse delay-1000"></div>
    </header>
  );
}