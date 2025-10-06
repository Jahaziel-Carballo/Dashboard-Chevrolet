// src/components/dashboard/CategoryBreakdown.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { formatFinancial } from '../../utils/formatters';

export default function CategoryBreakdown({ data }) {
  const [activeCategory, setActiveCategory] = useState('ingresos');
  const [animatedValues, setAnimatedValues] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    if (data && data.kpis) {
      const initialValues = {};
      const categories = getCategories(data.kpis);
      Object.keys(categories).forEach(catKey => {
        initialValues[catKey] = categories[catKey].items.map(() => ({
          value: 0,
          percent: 0
        }));
      });
      setAnimatedValues(initialValues);
      
      // Animate values with delay
      Object.keys(categories).forEach(catKey => {
        setTimeout(() => {
          setAnimatedValues(prev => ({
            ...prev,
            [catKey]: categories[catKey].items.map(item => ({
              value: item.value,
              percent: item.percent || 0
            }))
          }));
        }, 300);
      });
    }
  }, [data]);

  const handleCategoryChange = (category) => {
    setIsTransitioning(true);
    setActiveCategory(category);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (!data) return null;

  const { kpis } = data;

  const getCategories = (kpis) => ({
    ingresos: {
      title: 'Ingresos',
      icon: '💰',
      items: [
        { 
          name: 'Autos Nuevos', 
          value: kpis.ventas_autos_nuevos, 
          percent: kpis.porcentaje_nuevos,
          color: 'from-blue-500 to-cyan-500',
          icon: '🚗'
        },
        { 
          name: 'Autos Usados', 
          value: kpis.ventas_autos_usados, 
          percent: kpis.porcentaje_usados,
          color: 'from-green-500 to-emerald-500',
          icon: '🛻'
        },
        { 
          name: 'Financiamiento', 
          value: kpis.ventas_financiamiento,
          percent: kpis.porcentaje_financiamiento,
          color: 'from-purple-500 to-violet-500',
          icon: '💳'
        },
        { 
          name: 'Servicio', 
          value: kpis.ventas_servicio + kpis.ventas_servicio_arlux, 
          percent: kpis.porcentaje_servicio,
          color: 'from-orange-500 to-amber-500',
          icon: '🔧'
        },
        { 
          name: 'Refacciones', 
          value: kpis.ventas_refacciones + kpis.ventas_refacciones_ventanilla + kpis.ventas_refacciones_mayoreo,
          percent: kpis.porcentaje_refacciones,
          color: 'from-red-500 to-rose-500',
          icon: '⚙️'
        }
      ],
      total: kpis.ingresos_totales,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-25 to-cyan-25'
    },
    costos: {
      title: 'Costos',
      icon: '📉',
      items: [
        { 
          name: 'Autos Nuevos', 
          value: kpis.costos_autos_nuevos,
          color: 'from-red-500 to-rose-500',
          icon: '🚗'
        },
        { 
          name: 'Autos Usados', 
          value: kpis.costo_autos_usados,
          color: 'from-orange-500 to-amber-500',
          icon: '🛻'
        },
        { 
          name: 'Refacciones', 
          value: kpis.costo_refacciones_mostrador + kpis.costo_refacciones_ventanilla + kpis.costo_refacciones_mayoreo,
          color: 'from-yellow-500 to-orange-500',
          icon: '⚙️'
        },
        { 
          name: 'Servicio', 
          value: kpis.costo_servicio + kpis.costo_servicio_arlux,
          color: 'from-pink-500 to-rose-500',
          icon: '🔧'
        }
      ],
      total: kpis.costos_totales,
      gradient: 'from-red-500 to-rose-600',
      bgGradient: 'from-red-25 to-rose-25'
    },
    gastos: {
      title: 'Gastos de Operación',
      icon: '📊',
      items: [
        { 
          name: 'Gastos Generales', 
          value: kpis.gastos_generales,
          color: 'from-purple-500 to-violet-500',
          icon: '🏢'
        },
        { 
          name: 'Gastos de Personal', 
          value: kpis.gastos_personal,
          color: 'from-indigo-500 to-blue-500',
          icon: '👥'
        },
        { 
          name: 'Comisiones', 
          value: kpis.comisiones_ventas,
          color: 'from-teal-500 to-cyan-500',
          icon: '💸'
        },
        { 
          name: 'Rentas', 
          value: kpis.rentas,
          color: 'from-gray-500 to-slate-500',
          icon: '🏠'
        }
      ],
      total: kpis.gastos_operacion_totales,
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-25 to-violet-25'
    }
  });

  const categories = getCategories(kpis);
  const currentCategory = categories[activeCategory];
  const animatedItems = animatedValues[activeCategory] || [];

  // Función para calcular el porcentaje correctamente para todas las categorías
  const calculateDisplayPercentage = (item, category, animatedItem) => {
    // Si el ítem ya tiene un porcentaje precalculado (como en ingresos), lo usamos
    if (item.percent !== undefined) {
      return animatedItem.percent || 0;
    }
    
    // Para costos y gastos, calculamos el porcentaje basado en el total de la categoría
    if (category.total > 0 && animatedItem.value !== undefined) {
      return (animatedItem.value / category.total) * 100;
    }
    
    return 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header con icono y título */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg text-white">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Desglose por Categorías</h2>
          <p className="text-sm text-gray-500 mt-1">Análisis detallado de componentes financieros</p>
        </div>
      </div>
      
      {/* Selector de Categorías Mejorado */}
      <div className="flex space-x-2 bg-gray-100 p-2 rounded-xl mb-6">
        {Object.keys(categories).map((key) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key)}
            className={`flex items-center gap-2 flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
              activeCategory === key
                ? `bg-gradient-to-r ${categories[key].gradient} text-white shadow-lg`
                : 'text-gray-600 hover:text-gray-900 bg-white/50 hover:bg-white'
            }`}
          >
            <span className="text-base">{categories[key].icon}</span>
            {categories[key].title}
          </button>
        ))}
      </div>

      {/* Detalles de la Categoría con Animación */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header de la Categoría */}
        <div className={`p-4 rounded-xl mb-6 bg-gradient-to-r ${currentCategory.bgGradient} border border-gray-200`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentCategory.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-xl text-white filter drop-shadow-sm">{currentCategory.icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{currentCategory.title}</h3>
                <p className="text-sm text-gray-600">Total de la categoría</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900 bg-white/80 px-4 py-2 rounded-lg shadow-sm">
              {formatFinancial(currentCategory.total, 'currency', { decimals: 0 })}
            </span>
          </div>
        </div>

        {/* Items de la Categoría */}
        <div className="space-y-4">
          {currentCategory.items.map((item, index) => {
            const animatedItem = animatedItems[index] || {};
            const displayPercentage = calculateDisplayPercentage(item, currentCategory, animatedItem);
            
            return (
              <div 
                key={index} 
                className="group p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-white"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-gray-200">
                      <span className="text-sm">{item.icon}</span>
                    </div>
                    <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-bold text-gray-900 text-sm block">
                      {formatFinancial(animatedItem.value || 0, 'currency', { 
                        decimals: Math.abs(animatedItem.value || 0) < 1000 ? 2 : 0 
                      })}
                    </span>
                    {/* Mostrar porcentaje para todos los items */}
                    <span className="text-xs text-gray-600 font-medium">
                      {formatFinancial(displayPercentage, 'percent', { 
                        decimals: 1,
                        alwaysShowSign: false 
                      })}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso mejorada */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Proporción</span>
                    <span>{formatFinancial(displayPercentage, 'percent', { 
                      decimals: 1,
                      alwaysShowSign: false 
                    })}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                    {/* Fondo con patrón sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                    
                    {/* Barra principal animada */}
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out shadow-sm transform origin-left`}
                      style={{ 
                        width: `${displayPercentage}%`,
                        transitionDelay: `${index * 150}ms`
                      }}
                    ></div>
                    
                    {/* Efecto de brillo al hover */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                  </div>
                </div>

                {/* Indicador de valor absoluto en tooltip sutil */}
                <div className="mt-2 flex justify-between text-xs text-gray-400">
                  <span>Contribución absoluta</span>
                  <span className="font-medium">
                    {formatFinancial(animatedItem.value || 0, 'currency', { 
                      decimals: Math.abs(animatedItem.value || 0) < 1000 ? 2 : 0 
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Validación de suma mejorada */}
          {currentCategory.total > 0 && (
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Validación de suma</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {formatFinancial(
                      currentCategory.items.reduce((sum, item) => sum + item.value, 0) / currentCategory.total * 100,
                      'percent',
                      { decimals: 1, alwaysShowSign: false }
                    )}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">del total</span>
                </div>
              </div>
              
              {/* Barra de validación */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${Math.min(
                      (currentCategory.items.reduce((sum, item) => sum + item.value, 0) / currentCategory.total) * 100, 
                      100
                    )}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Efecto de gradiente sutil en el fondo */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}