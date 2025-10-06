// src/components/dashboard/KpiCards.jsx - VERSIÓN CORREGIDA
import React, { useState, useEffect } from 'react';
import { formatFinancial, getTrendColor, getTrendIcon } from '../../utils/formatters';

export default function KpiCards({ data }) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});
  
  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    
    // Initialize animated values
    if (data && data.kpis) {
      const initialValues = {};
      const mainKpis = getMainKpis(data.kpis);
      mainKpis.forEach((kpi, index) => {
        initialValues[index] = 0;
      });
      setAnimatedValues(initialValues);
      
      // Animate values sequentially
      mainKpis.forEach((kpi, index) => {
        setTimeout(() => {
          setAnimatedValues(prev => ({
            ...prev,
            [index]: kpi.value
          }));
        }, 500 + (index * 200));
      });
    }
  }, [data]);

  if (!data) return null;

  const { kpis } = data;

  // Función para calcular porcentaje de crecimiento correctamente
  const calculateGrowthPercentage = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getMainKpis = (kpis) => [
    {
      title: 'Utilidad Neta',
      value: kpis.utilidad_neta,
      previous: kpis.utilidad_neta_anio_anterior,
      // CORREGIDO: Calcular porcentaje correctamente
      trend: calculateGrowthPercentage(kpis.utilidad_neta, kpis.utilidad_neta_anio_anterior),
      format: (v) => formatFinancial(v, 'currency', { 
        decimals: kpis.utilidad_neta < 1000 ? 2 : 0 
      }),
      // CORREGIDO: Formateador específico para el trend (porcentaje)
      formatTrend: (v) => formatFinancial(v, 'percent', {
        decimals: 2,
        alwaysShowSign: true
      }),
      icon: '💰',
      type: 'currency',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50/50',
      progressType: 'currency'
    },
    {
      title: 'Ingresos Totales',
      value: kpis.ingresos_totales,
      previous: kpis.ingresos_totales_anio_anterior,
      // CORREGIDO: Calcular porcentaje correctamente
      trend: calculateGrowthPercentage(kpis.ingresos_totales, kpis.ingresos_totales_anio_anterior),
      format: (v) => formatFinancial(v, 'currency', { 
        decimals: 0,
        showDecimalsForCents: false 
      }),
      // CORREGIDO: Formateador específico para el trend (porcentaje)
      formatTrend: (v) => formatFinancial(v, 'percent', {
        decimals: 2,
        alwaysShowSign: true
      }),
      icon: '📈',
      type: 'currency',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50/50',
      progressType: 'currency'
    },
    {
      title: 'Margen Neto',
      value: kpis.margen_neto,
      format: (v) => formatFinancial(v, 'percent', { 
        decimals: 2,
        alwaysShowSign: false 
      }),
      icon: '📊',
      type: 'percent',
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50/50',
      progressType: 'percentage',
      // Contexto específico para márgenes: 10%+ es bueno, 15%+ excelente
      qualityThresholds: { good: 10, excellent: 15 },
      qualityLabel: (value) => value >= 15 ? 'Excelente' : value >= 10 ? 'Bueno' : 'En desarrollo'
    },
    {
      title: 'Crecimiento',
      value: kpis.crecimiento_utilidad_neta,
      format: (v) => formatFinancial(v, 'percent', { 
        decimals: 2,
        alwaysShowSign: true 
      }),
      trend: kpis.crecimiento_utilidad_neta,
      icon: '🚀',
      type: 'percent',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50/50',
      progressType: 'growth',
      // Contexto específico para crecimiento: 8%+ es bueno, 15%+ excelente
      qualityThresholds: { good: 8, excellent: 15 },
      qualityLabel: (value) => value >= 15 ? 'Excepcional' : value >= 8 ? 'Sólido' : value >= 0 ? 'Positivo' : 'Por mejorar'
    }
  ];

  const mainKpis = getMainKpis(kpis);

  // Resto del código se mantiene exactamente igual...
  const getContextualPercentage = (kpi, value) => {
    switch (kpi.progressType) {
      case 'percentage':
        return Math.min((value / 30) * 100, 100);
      
      case 'growth':
        if (value < 0) return Math.min((Math.abs(value) / 25) * 100, 100);
        return Math.min((value / 25) * 100, 100);
      
      case 'currency':
      default:
        if (kpi.previous && kpi.previous > 0) {
          const growth = ((value - kpi.previous) / kpi.previous) * 100;
          return Math.min((Math.abs(growth) / 50) * 100, 100);
        }
        return 50;
    }
  };

  const getProgressColor = (kpi, value) => {
    const thresholds = kpi.qualityThresholds;
    
    if (kpi.progressType === 'growth') {
      return value >= (thresholds?.excellent || 15) 
        ? 'from-green-400 to-green-600' 
        : value >= (thresholds?.good || 8)
        ? 'from-blue-400 to-blue-600'
        : value >= 0
        ? 'from-yellow-400 to-yellow-600'
        : 'from-red-400 to-red-600';
    }
    
    if (kpi.progressType === 'percentage') {
      return value >= (thresholds?.excellent || 15)
        ? 'from-green-400 to-green-600'
        : value >= (thresholds?.good || 10)
        ? 'from-blue-400 to-blue-600'
        : 'from-purple-400 to-purple-600';
    }
    
    if (kpi.trend > 0) return 'from-green-400 to-green-600';
    if (kpi.trend < 0) return 'from-red-400 to-red-600';
    return 'from-gray-400 to-gray-600';
  };

  const ProgressRing = ({ percentage, color, size = 48, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`text-${color.split('-')[1]}-500 transition-all duration-1000 ease-out`}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {mainKpis.map((kpi, index) => {
        const displayValue = animatedValues[index] !== undefined ? animatedValues[index] : 0;
        const contextualPercentage = getContextualPercentage(kpi, kpi.value);
        const progressColor = getProgressColor(kpi, kpi.value);
        const showProgressVisual = kpi.progressType !== 'currency' || kpi.previous;

        return (
          <div 
            key={index} 
            className={`
              bg-white rounded-2xl shadow-lg border border-gray-100 p-6 
              transform transition-all duration-500 ease-out
              hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]
              backdrop-blur-sm bg-opacity-95 relative overflow-hidden
              ${isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
              }
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Efecto de fondo sutil basado en el progreso */}
            <div 
              className="absolute inset-0 opacity-5 transition-all duration-1000"
              style={{
                background: `conic-gradient(from 0deg, ${
                  kpi.progressType === 'growth' && kpi.value < 0 ? '#ef4444' : 
                  progressColor.includes('green') ? '#10b981' :
                  progressColor.includes('blue') ? '#3b82f6' :
                  progressColor.includes('purple') ? '#8b5cf6' : '#6b7280'
                } 0deg, ${
                  kpi.progressType === 'growth' && kpi.value < 0 ? '#ef4444' : 
                  progressColor.includes('green') ? '#10b981' :
                  progressColor.includes('blue') ? '#3b82f6' :
                  progressColor.includes('purple') ? '#8b5cf6' : '#6b7280'
                } ${contextualPercentage * 3.6}deg, transparent ${contextualPercentage * 3.6}deg)`
              }}
            ></div>

            {/* Header con icono y título */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{kpi.title}</h3>
                {kpi.qualityLabel && (
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    {kpi.qualityLabel(kpi.value)}
                  </p>
                )}
              </div>
              <div className="relative">
                {showProgressVisual ? (
                  <div className="relative">
                    <ProgressRing 
                      percentage={contextualPercentage} 
                      color={progressColor}
                      size={52}
                      strokeWidth={3}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg filter drop-shadow-sm">{kpi.icon}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${kpi.gradient} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110`}>
                    <span className="text-xl filter drop-shadow-sm">{kpi.icon}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Valor principal con animación de conteo */}
            <div className="space-y-4 relative z-10">
              <p className="text-3xl font-bold text-gray-900 transform transition-transform duration-300 hover:scale-105 cursor-default min-h-[48px] flex items-center">
                {kpi.format(displayValue)}
              </p>
              
              {/* Trend indicator con animación - CORREGIDO: usar formatTrend cuando exista */}
              {kpi.trend !== undefined && kpi.trend !== null && !isNaN(kpi.trend) && (
                <div className="flex items-center gap-3 animate-pulse-slow">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getTrendColor(kpi.trend, true)} bg-opacity-20 backdrop-blur-sm transition-all duration-300 hover:scale-105`}>
                    <span className="text-lg">{getTrendIcon(kpi.trend, false)}</span>
                    {/* CORREGIDO: Usar formatTrend si existe, sino format */}
                    <span>{kpi.formatTrend ? kpi.formatTrend(kpi.trend) : kpi.format(kpi.trend)}</span>
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    vs período anterior
                  </span>
                </div>
              )}

              {/* Información adicional con animación de aparición */}
              {kpi.previous !== undefined && kpi.previous !== null && !isNaN(kpi.previous) && (
                <div className="pt-4 border-t border-gray-100 animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-gray-500 font-medium">Anterior:</p>
                    <p className="text-sm text-gray-700 font-semibold transition-colors duration-300 hover:text-gray-900">
                      {kpi.format(kpi.previous)}
                    </p>
                  </div>
                  
                  {/* Barra de comparación visual mejorada */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Actual</span>
                      <span>Anterior</span>
                    </div>
                    <div className="flex gap-2 h-3 bg-gray-100 rounded-full p-1">
                      <div 
                        className={`rounded-full transition-all duration-1000 ease-out shadow-sm bg-gradient-to-r ${progressColor}`}
                        style={{ 
                          width: `${Math.min((kpi.value / (kpi.previous + kpi.value)) * 100, 100)}%` 
                        }}
                      ></div>
                      <div 
                        className="rounded-full flex-1 transition-all duration-1000 ease-out bg-gray-300"
                        style={{ 
                          width: `${Math.min((kpi.previous / (kpi.previous + kpi.value)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicador visual contextual para KPIs sin valor anterior */}
              {(!kpi.previous || isNaN(kpi.previous)) && showProgressVisual && (
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${
                      kpi.progressType === 'growth' && kpi.value < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      Progreso contextual
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(contextualPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${progressColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${contextualPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Indicador de tipo simple */}
              {(!kpi.previous || isNaN(kpi.previous)) && !showProgressVisual && (
                <div className="pt-3">
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${kpi.gradient} text-white shadow-sm transform transition-transform duration-300 hover:scale-105`}>
                    {kpi.type === 'currency' ? 'Monetario' : 'Porcentaje'}
                  </span>
                </div>
              )}
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        );
      })}
    </div>
  );
}