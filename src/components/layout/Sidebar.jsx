// src/components/layout/Sidebar.jsx - VERSIÓN MEJORADA CON ANIMACIONES MÁS SUTILES
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
    <div className="w-64 bg-gray-900 shadow-xl border-r border-gray-700 flex flex-col h-full">
      {/* Header con branding Chevrolet - Con logo real desde src/assets */}
      <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            {/* Logo Chevrolet importado desde src/assets */}
            <img 
              src={chevroletLogo} 
              alt="Chevrolet"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback si la imagen no carga
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.querySelector('.logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback SVG si la imagen no existe */}
            <div className="logo-fallback w-8 h-8 hidden items-center justify-center">
              <div className="relative">
                <div className="w-6 h-1 bg-yellow-400 rounded-full"></div>
                <div className="w-1 h-4 bg-yellow-400 rounded-full absolute -left-1 top-0"></div>
                <div className="w-1 h-4 bg-yellow-400 rounded-full absolute -right-1 top-0"></div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-bold text-white text-lg">Chevrolet</h2>
            <p className="text-gray-300 text-sm">Autos Reynosa</p>
          </div>
        </div>
        
        {/* Badge de ubicación */}
        <div className="bg-gray-700/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-600 hover:shadow-lg hover:shadow-yellow-400/20 transition-all duration-300 cursor-pointer group">
          <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
          <p className="text-yellow-400 text-xs font-medium text-center relative z-10">Sucursal Miguel Alemán</p>
        </div>
      </div>
      
      {/* Navegación */}
      <div className="p-6 flex-1">
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 relative overflow-hidden ${
                item.active
                  ? 'bg-blue-900/30 text-yellow-400 border-l-4 border-yellow-400 shadow-lg shadow-blue-900/20'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {/* Efecto de iluminación amarilla al hover */}
              <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
              
              <span className={`text-lg transition-transform duration-300 relative z-10 ${
                item.active ? 'scale-110' : 'group-hover:scale-110'
              }`}>{item.icon}</span>
              <span className="font-semibold relative z-10">{item.name}</span>
              {item.active && (
                <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse relative z-10"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Separador */}
        <div className="my-6 border-t border-gray-700"></div>

        {/* Información adicional */}
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:shadow-lg hover:shadow-yellow-400/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
            <p className="text-xs text-gray-400 font-medium">Versión</p>
            <p className="text-sm text-yellow-400 font-semibold">2.1.0</p>
          </div>

          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="group w-full bg-gray-800 hover:bg-red-600 rounded-lg p-3 border border-gray-700 hover:border-red-500 transition-all duration-300 relative overflow-hidden"
          >
            {/* Efecto de iluminación roja al hover */}
            <div className="absolute inset-0 bg-red-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
            <div className="flex items-center justify-center gap-2 relative z-10">
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm text-gray-400 group-hover:text-white font-medium transition-colors duration-300">
                Cerrar Sesión
              </span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Footer del sidebar */}
      <div className="p-6 border-t border-gray-700 bg-gray-800">
        {/* Información del usuario - MEJORADA */}
        <div className="flex items-center gap-3 mb-4 group relative overflow-hidden rounded-xl p-2 hover:bg-gray-750 transition-all duration-300 cursor-pointer">
          {/* Efecto de iluminación para el área del usuario */}
          <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl"></div>
          
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg relative z-10">
            <span className="text-white font-bold text-sm">{getUserInitials()}</span>
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-sm font-semibold text-white truncate">{getDisplayName()}</p>
            <p className="text-xs text-gray-400 truncate">{getDisplayEmail()}</p>
          </div>
        </div>
        
        {/* Estado del sistema */}
        <div className="flex items-center justify-between text-xs mb-4 group relative overflow-hidden rounded-lg p-2 hover:bg-gray-750 transition-all duration-300 cursor-pointer">
          <div className="absolute inset-0 bg-green-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
          <span className="text-gray-400 relative z-10">Estado:</span>
          <span className="flex items-center gap-1 text-green-400 font-medium relative z-10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Conectado
          </span>
        </div>

        {/* Developer credit con animación más sutil y modesta - ACTUALIZADO */}
        <div className="pt-4 border-t border-gray-700">
          <div className="group">
            <p className="text-gray-400 italic text-sm font-light text-center py-1 transition-all duration-500">
              Developed by{' '}
              <span className="font-medium text-gray-300 group-hover:text-cyan-300 transition-colors duration-300">
                Jahaziel García
              </span>
            </p>
            {/* Línea sutil que aparece al hacer hover */}
            <div className="w-0 h-0.5 bg-cyan-400 mx-auto mt-1 group-hover:w-16 transition-all duration-500 ease-out opacity-0 group-hover:opacity-70"></div>
          </div>
        </div>
      </div>

      {/* Efectos de gradiente sutiles */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>
    </div>
  );
}