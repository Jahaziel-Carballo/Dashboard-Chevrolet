// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import chevroletLogo from '../assets/Chevrolet-Logo.png';

export default function Login() {
  const { login, signup, error, clearError, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [localError, setLocalError] = useState('');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  // Limpiar errores cuando cambie el modo
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [isLogin, clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setLocalError('Email y contraseña son requeridos');
      return false;
    }

    if (!isLogin && !formData.displayName) {
      setLocalError('El nombre es requerido para registrarse');
      return false;
    }

    if (formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.displayName);
      }
      // La redirección se maneja en el useEffect
    } catch (error) {
      // El error ya se maneja en el contexto
      console.error('Error de autenticación:', error);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      displayName: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-yellow-500/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/5 via-gray-900 to-gray-900"></div>
      
      <div className="max-w-md w-full space-y-8 bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-700 relative z-10">
        {/* Header con branding Chevrolet */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <img 
                src={chevroletLogo} 
                alt="Chevrolet"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement.querySelector('.logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="logo-fallback w-10 h-10 hidden items-center justify-center">
                <div className="relative">
                  <div className="w-8 h-1 bg-yellow-400 rounded-full"></div>
                  <div className="w-1 h-6 bg-yellow-400 rounded-full absolute -left-1 top-0"></div>
                  <div className="w-1 h-6 bg-yellow-400 rounded-full absolute -right-1 top-0"></div>
                </div>
              </div>
            </div>
            <div className="text-left">
              <h2 className="font-bold text-white text-2xl">Chevrolet</h2>
              <p className="text-gray-300 text-sm">Autos Reynosa</p>
            </div>
          </div>

          {/* Badge de ubicación */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-600 inline-block mb-6 group cursor-pointer">
            <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg"></div>
            <p className="text-yellow-400 text-sm font-medium text-center relative z-10">Sucursal Miguel Alemán</p>
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Accede al Dashboard para ver todas las estadísticas ' : 'Regístrate para comenzar a usar el dashboard'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div className="group relative">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    required={!isLogin}
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600"
                    placeholder="Tu nombre completo"
                  />
                  <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            )}

            <div className="group relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600"
                  placeholder="correo@ejemplo.com"
                />
                <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="group relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-600"
                  placeholder="Tu contraseña"
                  minLength="6"
                />
                <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {(error || localError) && (
            <div className="rounded-xl bg-red-900/20 border border-red-700 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-red-200">
                    {error || localError}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="group relative">
            <button
              type="submit"
              disabled={loading}
              className="group w-full relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25"
            >
              {/* Efecto de iluminación */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
              
              {loading ? (
                <div className="flex items-center gap-2 relative z-10">
                  <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-semibold">
                    {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                  </span>
                </div>
              ) : (
                <span className="font-semibold relative z-10">
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </span>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors duration-300 group relative py-2 px-4 rounded-lg"
            >
              <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300"></div>
              {isLogin 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión aquí'
              }
            </button>
          </div>
        </form>

        {/* Footer del login */}
        <div className="pt-6 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Sistema seguro</span>
            </div>
            
            {/* Developer credit con animación más sutil y modesta */}
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
      </div>

      {/* Efectos de gradiente sutiles adicionales */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
    </div>
  );
}