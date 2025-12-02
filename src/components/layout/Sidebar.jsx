// src/components/layout/Sidebar.jsx - VERSIÓN ELEGANTE Y SUTIL
import React from 'react';
import { useAuth } from '../../context/AuthContext';
// Importar el logo desde src/assets
import chevroletLogo from '../../assets/Chevrolet-Logo.png';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: '📊', active: true },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'US';
  };

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  };

  // Función para obtener el email
  const getDisplayEmail = () => {
    return user?.email || 'usuario@ejemplo.com';
  };

  return (
    <div className="w-64 bg-gray-950 shadow-xl border-r border-gray-800 flex flex-col h-full">
      {/* Header con branding Chevrolet */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center shadow-lg border border-gray-700">
            <img 
              src={chevroletLogo} 
              alt="Chevrolet"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.querySelector('.logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback w-8 h-8 hidden items-center justify-center">
              <div className="relative">
                <div className="w-6 h-1 bg-amber-400 rounded-full"></div>
                <div className="w-1 h-4 bg-amber-400 rounded-full absolute -left-1 top-0"></div>
                <div className="w-1 h-4 bg-amber-400 rounded-full absolute -right-1 top-0"></div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-gray-100 text-lg tracking-wide">Chevrolet</h2>
            <p className="text-gray-400 text-sm">Autos Reynosa</p>
          </div>
        </div>
        
        {/* Badge de ubicación */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group">
          <p className="text-amber-400/90 text-xs font-medium text-center tracking-wide">Sucursal Miguel Alemán</p>
        </div>
      </div>
      
      {/* Navegación */}
      <div className="p-6 flex-1">
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 relative overflow-hidden ${
                item.active
                  ? 'bg-gray-800/40 text-amber-400 border-l-2 border-amber-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/20'
              }`}
            >
              {/* Efecto sutil al hover */}
              <div className="absolute inset-0 bg-amber-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
              
              <span className={`text-lg transition-transform duration-300 relative z-10 ${
                item.active ? 'scale-105' : 'group-hover:scale-105'
              }`}>{item.icon}</span>
              <span className="font-medium tracking-wide relative z-10">{item.name}</span>
              {item.active && (
                <div className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse relative z-10"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Separador sutil */}
        <div className="my-6 border-t border-gray-800/50"></div>

        {/* Información adicional */}
        <div className="space-y-3">
          <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/30 hover:border-amber-400/20 transition-all duration-300 cursor-pointer group relative overflow-hidden">
            <p className="text-xs text-gray-500 font-medium tracking-wide">Versión</p>
            <p className="text-sm text-amber-400/90 font-medium">2.1.0</p>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="group w-full bg-gray-800/20 hover:bg-gray-800/40 rounded-lg p-3 border border-gray-700/30 hover:border-gray-600 transition-all duration-300 relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 relative z-10">
              <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm text-gray-400 group-hover:text-gray-200 font-medium transition-colors duration-300">
                Cerrar Sesión
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Footer del sidebar */}
      <div className="p-6 border-t border-gray-800 bg-gray-900/20">
        {/* Información del usuario */}
        <div className="flex items-center gap-3 mb-4 group relative overflow-hidden rounded-lg p-2 hover:bg-gray-800/20 transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow border border-gray-700 relative z-10">
            <span className="text-gray-300 font-medium text-sm">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-sm font-medium text-gray-200 truncate">{getDisplayName()}</p>
            <p className="text-xs text-gray-500 truncate">{getDisplayEmail()}</p>
          </div>
        </div>
        
        {/* Estado del sistema */}
        <div className="flex items-center justify-between text-xs mb-4 group relative overflow-hidden rounded-lg p-2 hover:bg-gray-800/20 transition-all duration-300 cursor-pointer">
          <span className="text-gray-500 relative z-10">Estado:</span>
          <span className="flex items-center gap-1 text-amber-400/90 font-medium relative z-10">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
            Conectado
          </span>
        </div>

        {/* Developer credit - MÁS MODESTO */}
        <div className="pt-4 border-t border-gray-800/50">
          <div className="group">
            <p className="text-gray-500 text-xs text-center py-1 transition-all duration-500 font-light tracking-wide">
              Desarrollado por{' '}
              <span className="text-gray-300 font-normal group-hover:text-gray-200 transition-colors duration-300">
                Jahaziel García
              </span>
            </p>
            {/* Línea muy sutil que aparece al hacer hover */}
            <div className="w-0 h-px bg-gray-400 mx-auto mt-1 group-hover:w-12 transition-all duration-500 ease-out opacity-0 group-hover:opacity-40"></div>
          </div>
        </div>
      </div>

      {/* Efecto de gradiente muy sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 to-transparent pointer-events-none"></div>
    </div>
  );
}