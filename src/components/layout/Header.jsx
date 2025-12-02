// src/components/layout/Header.jsx - VERSIÓN ELEGANTE Y SUTIL
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
    <header className="bg-neutral-950 border-b border-gray-800 shadow-sm relative overflow-hidden">
      {/* Efecto de gradiente muy sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/20 via-transparent to-amber-400/5 pointer-events-none"></div>
      
      <div className="flex items-center justify-between px-8 py-4 relative z-10">
        {/* Logo y título con animaciones sutiles */}
        <div className={`transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow border border-gray-700 transform group-hover:scale-102 transition-all duration-300">
                <span className="text-gray-300 font-medium text-lg">AR</span>
              </div>
              
              {/* Efecto de iluminación sutil al hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl blur opacity-0 group-hover:opacity-10 transition-all duration-500"></div>
              
              {/* Punto de estado conectado - más sutil */}
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-neutral-950 animate-pulse"></div>
            </div>
            
            <div>
              <h1 className="text-2xl font-semibold text-gray-100 font-sans group tracking-wide">
                Dashboard <span className="text-amber-400/90 relative">
                  Automotriz
                  {/* Subrayado animado sutil */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400/50 group-hover:w-full transition-all duration-500"></span>
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-gray-400 text-sm font-light">
                  Análisis de resultados financieros en tiempo real
                </p>
                
                {/* Hora y fecha actual EN TIEMPO REAL - más discreto */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-900/50 px-2 py-1 rounded border border-gray-800 font-mono backdrop-blur-sm">
                    {formatTime(currentTime)}
                  </span>
                  <span className="bg-gray-900/50 px-2 py-1 rounded border border-gray-800 backdrop-blur-sm">
                    {formatDate(currentTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información del lado derecho */}
        <div className={`flex items-center gap-6 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          {state.currentData && (
            <div className="group relative">
              {/* Efecto de iluminación muy sutil */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700 to-amber-400 rounded-lg blur opacity-0 group-hover:opacity-10 transition-all duration-500"></div>
              
              <div className="text-right bg-gray-900/30 px-5 py-2.5 rounded-lg border-l border-amber-400/50 relative z-10 transform group-hover:scale-102 transition-all duration-300 backdrop-blur-sm group-hover:border-amber-400/70">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium flex items-center gap-2 justify-end">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Archivo actual
                </p>
                <p className="font-medium text-gray-200 text-sm mt-1 max-w-xs truncate">
                  {state.currentData.fileInfo.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {state.currentData.metadata.rowsCount} registros procesados
                </p>
              </div>
            </div>
          )}
          
          {/* Indicador de estado del sistema */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full blur opacity-0 group-hover:opacity-10 transition-all duration-500"></div>
            
            <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center shadow border border-amber-400/30 transform group-hover:scale-105 transition-all duration-300 relative z-10">
              <span className="text-gray-300 font-medium text-base">AR</span>
              
              {/* Anillo de estado animado - más sutil */}
              <div className="absolute -inset-1 border border-amber-400/20 rounded-full animate-ping opacity-10"></div>
            </div>
            
            {/* Tooltip de estado - más discreto */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 text-gray-300 text-xs px-2 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 border border-gray-800 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Sistema activo
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso muy sutil en la parte inferior */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-gray-800 via-amber-400/20 to-gray-800 opacity-20">
        <div className="h-full bg-amber-400/30 w-1/4 animate-pulse-slow rounded-full"></div>
      </div>

      {/* Partículas de efecto visual muy sutiles */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gray-800/10 rounded-full blur-lg opacity-30"></div>
    </header>
  );
}