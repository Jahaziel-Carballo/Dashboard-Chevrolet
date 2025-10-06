// src/components/dashboard/ComparativeAnalysis.jsx - VERSIÓN MEJORADA CON ÉNFASIS VISUAL
import React, { useState, useEffect } from 'react';
import { formatFinancial, getTrendColor, getTrendIcon } from '../../utils/formatters';

export default function ComparativeAnalysis({ data }) {
  const [animatedValues, setAnimatedValues] = useState({});
  
  useEffect(() => {
    if (data && data.kpis) {
      const initialValues = {};
      const comparisons = getComparisons(data.kpis);
      comparisons.forEach((item, index) => {
        initialValues[index] = {
          current: 0,
          previous: 0,
          change: 0
        };
      });
      setAnimatedValues(initialValues);
      
      // Animate values with sequential delays
      comparisons.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedValues(prev => ({
            ...prev,
            [index]: {
              current: item.current,
              previous: item.previous,
              change: item.change
            }
          }));
        }, 300 + (index * 150));
      });
    }
  }, [data]);

  if (!data) return null;

  const { kpis } = data;

  const getComparisons = (kpis) => [
    {
      metric: 'Utilidad Neta',
      current: kpis.utilidad_neta,
      previous: kpis.utilidad_neta_anio_anterior,
      change: kpis.crecimiento_utilidad_neta,
      type: 'currency',
      icon: '💰',
      importance: 'high'
    },
    {
      metric: 'Ingresos Totales',
      current: kpis.ingresos_totales,
      previous: kpis.ingresos_totales_anio_anterior,
      change: kpis.ingresos_totales_anio_anterior ? 
        ((kpis.ingresos_totales - kpis.ingresos_totales_anio_anterior) / Math.abs(kpis.ingresos_totales_anio_anterior)) * 100 : 0,
      type: 'currency',
      icon: '📈',
      importance: 'high'
    },
    {
      metric: 'Margen Bruto',
      current: kpis.margen_bruto,
      previous: kpis.utilidad_bruta_anio_anterior && kpis.ingresos_totales_anio_anterior ?
        (kpis.utilidad_bruta_anio_anterior / kpis.ingresos_totales_anio_anterior) * 100 : 0,
      change: kpis.utilidad_bruta_anio_anterior && kpis.ingresos_totales_anio_anterior ?
        ((kpis.margen_bruto - (kpis.utilidad_bruta_anio_anterior / kpis.ingresos_totales_anio_anterior * 100)) / 
         Math.abs(kpis.utilidad_bruta_anio_anterior / kpis.ingresos_totales_anio_anterior * 100)) * 100 : 0,
      type: 'percent',
      icon: '📊',
      importance: 'medium'
    }, 
    {
      metric: 'Eficiencia Operativa',
      current: kpis.ratio_eficiencia_operativa,
      previous: kpis.gastos_operacion_totales_anio_anterior && kpis.ingresos_totales_anio_anterior ?
        (kpis.gastos_operacion_totales_anio_anterior / kpis.ingresos_totales_anio_anterior) * 100 : 0,
      change: kpis.gastos_operacion_totales_anio_anterior && kpis.ingresos_totales_anio_anterior ?
        ((kpis.ratio_eficiencia_operativa - (kpis.gastos_operacion_totales_anio_anterior / kpis.ingresos_totales_anio_anterior * 100)) / 
         Math.abs(kpis.gastos_operacion_totales_anio_anterior / kpis.ingresos_totales_anio_anterior * 100)) * 100 : 0,
      type: 'percent',
      icon: '⚡',
      importance: 'medium'
    }
  ];

  const comparisons = getComparisons(kpis);

  const getChangeColor = (change, intensity = 'normal') => {
    const baseColors = {
      positive: {
        strong: 'text-green-700 bg-green-50 border-green-200 shadow-green-100',
        normal: 'text-green-600 bg-green-50 border-green-200',
        light: 'text-green-500 bg-green-25 border-green-100'
      },
      negative: {
        strong: 'text-red-700 bg-red-50 border-red-200 shadow-red-100',
        normal: 'text-red-600 bg-red-50 border-red-200',
        light: 'text-red-500 bg-red-25 border-red-100'
      },
      neutral: {
        normal: 'text-gray-600 bg-gray-50 border-gray-200',
        light: 'text-gray-500 bg-gray-25 border-gray-150'
      }
    };

    if (change > 15) return baseColors.positive.strong;
    if (change > 5) return baseColors.positive.normal;
    if (change > 0) return baseColors.positive.light;
    if (change < -15) return baseColors.negative.strong;
    if (change < -5) return baseColors.negative.normal;
    if (change < 0) return baseColors.negative.light;
    return intensity === 'light' ? baseColors.neutral.light : baseColors.neutral.normal;
  };

  const getChangeSize = (change) => {
    const absChange = Math.abs(change);
    if (absChange > 15) return 'text-lg';
    if (absChange > 5) return 'text-base';
    return 'text-sm';
  };

  const getImportanceStyle = (importance) => {
    switch (importance) {
      case 'high':
        return 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-25 to-white';
      case 'medium':
        return 'border-l-2 border-l-blue-300 bg-white';
      default:
        return 'bg-white';
    }
  };

  // Función para calcular el ancho de la barra de progreso visual
  const getProgressWidth = (current, previous) => {
    if (!previous || previous === 0) return 50;
    const ratio = current / previous;
    return Math.min(Math.max(ratio * 50, 10), 90);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg text-white">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Análisis Comparativo vs Año Anterior</h2>
          <p className="text-sm text-gray-500 mt-1">Evolución de métricas clave en el tiempo</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {comparisons.map((item, index) => {
          const animated = animatedValues[index] || {};
          const progressWidth = getProgressWidth(animated.current || 0, animated.previous || 1);
          
          return (
            <div 
              key={index} 
              className={`
                relative p-4 rounded-xl border border-gray-200 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-md
                ${getImportanceStyle(item.importance)}
                ${index % 2 === 0 ? 'animate-fade-in-left' : 'animate-fade-in-right'}
              `}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Barra de progreso sutil en el fondo */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-200 to-green-200 rounded-b-xl transition-all duration-1000 ease-out"
                style={{ width: `${progressWidth}%` }}
              ></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-colors duration-300 group-hover:bg-gray-200">
                    <span className="text-sm">{item.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{item.metric}</h3>
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-medium">Actual</p>
                        <p className="text-base font-bold text-gray-900 transition-all duration-500">
                          {formatFinancial(animated.current || 0, item.type, { 
                            decimals: 2,
                            alwaysShowSign: item.type === 'percent'
                          })}
                        </p>
                      </div>
                      
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-medium">Año Anterior</p>
                        <p className="text-base font-bold text-gray-700 transition-all duration-500">
                          {formatFinancial(animated.previous || 0, item.type, { 
                            decimals: 2,
                            alwaysShowSign: item.type === 'percent'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-3 rounded-xl border-2 transition-all duration-500 transform hover:scale-105 ${getChangeColor(animated.change || 0)} shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg transition-transform duration-300 ${animated.change > 0 ? 'hover:scale-110' : 'hover:scale-90'}`}>
                      {getTrendIcon(animated.change || 0, true)}
                    </span>
                    <span className={`font-semibold ${getChangeSize(animated.change || 0)} transition-all duration-500`}>
                      {formatFinancial(animated.change || 0, 'percent', { 
                        decimals: 1,
                        alwaysShowSign: true 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Indicador de diferencia absoluta sutil */}
              {(animated.current && animated.previous) && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Diferencia absoluta:</span>
                    <span className={`font-medium ${
                      animated.current > animated.previous ? 'text-green-600' : 
                      animated.current < animated.previous ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatFinancial(
                        item.type === 'currency' ? 
                        animated.current - animated.previous : 
                        (animated.current - animated.previous), 
                        item.type, 
                        { decimals: 2, alwaysShowSign: true }
                      )}
                    </span>
                  </div>
                  
                  {/* Mini indicador de progreso */}
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                        animated.current > animated.previous ? 
                        'bg-gradient-to-r from-green-400 to-green-500' : 
                        'bg-gradient-to-r from-red-400 to-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(
                          (animated.current / (animated.previous || 1)) * 100, 
                          100
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda de interpretación mejorada */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-2 justify-center p-2 bg-green-25 rounded-lg">
            <span className="text-green-600 text-sm">↗</span>
            <span>Mejora significativa (+5%+)</span>
          </div>
          <div className="flex items-center gap-2 justify-center p-2 bg-gray-50 rounded-lg">
            <span className="text-gray-500 text-sm">→</span>
            <span>Estable (±5%)</span>
          </div>
          <div className="flex items-center gap-2 justify-center p-2 bg-red-25 rounded-lg">
            <span className="text-red-600 text-sm">↙</span>
            <span>Deterioro significativo (-5%-)</span>
          </div>
        </div>
        
        {/* Nota contextual */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">
            💡 Los colores se intensifican según la magnitud del cambio
          </p>
        </div>
      </div>

      {/* Efecto de gradiente sutil en los bordes */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-green-500/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}