// src/components/dashboard/ChartsSection.jsx - VERSIÓN MEJORADA CON ANIMACIONES
import React, { useState, useEffect } from 'react';
import RevenuePieChart from '../charts/RevenuePieChart';
import ProfitTrendChart from '../charts/ProfitTrendChart';
import MarginBarChart from '../charts/MarginBarChart';
import KeyMetricsChart from '../charts/KeyMetricsChart';
import { formatFinancial, getTrendColor, getTrendIcon } from '../../utils/formatters';

export default function ChartsSection({ currentData, historicalData, comparisonData, viewMode }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Trigger transition animation when tab changes
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  if (!currentData) return null;

  const { kpis } = currentData;

  const tabs = [
    { id: 'overview', name: 'Visión General', icon: '📊' },
    { id: 'revenue', name: 'Ingresos', icon: '💰' },
    { id: 'margins', name: 'Márgenes', icon: '📈' },
    { id: 'metrics', name: 'Métricas', icon: '🎯' }
  ];

  // Cálculos mejorados para métricas de margen
  const marginMetrics = [
    {
      name: 'Margen Bruto',
      value: kpis.margen_bruto,
      description: 'Utilidad bruta como porcentaje de ingresos',
      trend: kpis.utilidad_bruta_anio_anterior && kpis.ingresos_totales_anio_anterior ? 
        kpis.margen_bruto - (kpis.utilidad_bruta_anio_anterior / kpis.ingresos_totales_anio_anterior * 100) : 0,
      color: 'blue'
    },
    {
      name: 'Margen Operativo',
      value: kpis.margen_operativo,
      description: 'Utilidad operativa como porcentaje de ingresos',
      trend: kpis.utilidad_operacion_anio_anterior && kpis.ingresos_totales_anio_anterior ? 
        kpis.margen_operativo - (kpis.utilidad_operacion_anio_anterior / kpis.ingresos_totales_anio_anterior * 100) : 0,
      color: 'green'
    },
    {
      name: 'Margen Neto',
      value: kpis.margen_neto,
      description: 'Utilidad neta como porcentaje de ingresos',
      trend: kpis.utilidad_neta_anio_anterior && kpis.ingresos_totales_anio_anterior ? 
        kpis.margen_neto - (kpis.utilidad_neta_anio_anterior / kpis.ingresos_totales_anio_anterior * 100) : 0,
      color: 'purple'
    }
  ];

  const efficiencyMetrics = [
    {
      name: 'ROI de Personal',
      value: kpis.roi_personal,
      description: 'Retorno sobre inversión en personal',
      format: (v) => formatFinancial(v, 'percent', { decimals: 1, alwaysShowSign: false })
    },
    {
      name: 'Eficiencia Operativa',
      value: kpis.ratio_eficiencia_operativa,
      description: 'Gastos operativos como porcentaje de ingresos',
      format: (v) => formatFinancial(v, 'percent', { decimals: 1, alwaysShowSign: false })
    },
    {
      name: 'Ratio de Comisiones',
      value: kpis.ratio_comisiones,
      description: 'Comisiones como porcentaje de ingresos',
      format: (v) => formatFinancial(v, 'percent', { decimals: 2, alwaysShowSign: false })
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navegación de Pestañas Mejorada */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 backdrop-blur-sm bg-opacity-95">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 border border-transparent hover:border-gray-200'
              }`}
            >
              <span className="text-lg filter drop-shadow-sm">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de Gráficos con Animaciones Mejoradas */}
      <div className={`transition-all duration-500 ${isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
            <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <RevenuePieChart data={currentData} />
            </div>
            <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <ProfitTrendChart 
                currentData={currentData} 
                historicalData={historicalData} 
                comparisonData={comparisonData}
                viewMode={viewMode}
              />
            </div>
            <div className="xl:col-span-2 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <MarginBarChart data={currentData} />
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
            <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <RevenuePieChart data={currentData} />
            </div>
            <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <ProfitTrendChart 
                currentData={currentData} 
                historicalData={historicalData} 
                comparisonData={comparisonData}
                viewMode={viewMode}
              />
            </div>
            
            {/* Resumen de Composición de Ingresos Mejorado */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Desglose Detallado de Ingresos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Autos Nuevos', value: kpis.ventas_autos_nuevos, percent: kpis.porcentaje_nuevos, color: 'from-blue-500 to-blue-600' },
                  { label: 'Autos Usados', value: kpis.ventas_autos_usados, percent: kpis.porcentaje_usados, color: 'from-green-500 to-green-600' },
                  { label: 'Financiamiento', value: kpis.ventas_financiamiento, percent: kpis.porcentaje_financiamiento, color: 'from-purple-500 to-purple-600' },
                  { label: 'Servicio', value: kpis.ventas_servicio + kpis.ventas_servicio_arlux, percent: kpis.porcentaje_servicio, color: 'from-orange-500 to-orange-600' },
                  { label: 'Refacciones', value: kpis.ventas_refacciones + kpis.ventas_refacciones_ventanilla + kpis.ventas_refacciones_mayoreo, percent: kpis.porcentaje_refacciones, color: 'from-red-500 to-red-600' }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="group p-5 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{item.label}</p>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {formatFinancial(item.percent, 'percent', { decimals: 0, alwaysShowSign: false })}
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2 group-hover:text-gray-800 transition-colors">
                      {formatFinancial(item.value, 'currency', { decimals: 0 })}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${item.color} transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'margins' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
            <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <MarginBarChart data={currentData} />
            </div>
            
            {/* Análisis Detallado de Márgenes Mejorado */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Análisis de Márgenes
              </h3>
              <div className="space-y-5">
                {marginMetrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className={`p-5 bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-25 rounded-xl border border-${metric.color}-200 group hover:shadow-md transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{metric.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatFinancial(metric.value, 'percent', { 
                            decimals: 2, 
                            alwaysShowSign: false 
                          })}
                        </p>
                        {metric.trend !== 0 && (
                          <p className={`text-sm font-medium ${getTrendColor(metric.trend, true)} flex items-center gap-1 justify-end mt-1`}>
                            {getTrendIcon(metric.trend, true)} 
                            {formatFinancial(metric.trend, 'percent', { 
                              decimals: 2, 
                              alwaysShowSign: true 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Barra de progreso visual mejorada */}
                    <div className="w-full bg-white rounded-full h-3 mt-3 border border-gray-200">
                      <div 
                        className={`h-3 rounded-full bg-gradient-to-r from-${metric.color}-400 to-${metric.color}-600 transition-all duration-1000 ease-out shadow-sm`}
                        style={{ width: `${Math.min(metric.value, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
            <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <KeyMetricsChart data={currentData} />
            </div>
            
            {/* KPIs de Eficiencia Mejorados */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                KPIs de Eficiencia
              </h3>
              <div className="space-y-5">
                {efficiencyMetrics.map((metric, index) => (
                  <div 
                    key={index} 
                    className="p-5 border border-gray-200 rounded-xl group hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-blue-50/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{metric.name}</p>
                        <p className="text-xs text-gray-600 mt-2">{metric.description}</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {metric.format(metric.value)}
                      </p>
                    </div>
                    
                    {/* Indicador visual de desempeño mejorado */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          metric.value > (metric.name.includes('Eficiencia') ? 80 : 100) ? 'from-green-400 to-green-600' :
                          metric.value > (metric.name.includes('Eficiencia') ? 60 : 50) ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-600'
                        } transition-all duration-1000 ease-out shadow-sm`}
                        style={{ width: `${Math.min(metric.value, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Bajo</span>
                      <span>Medio</span>
                      <span>Alto</span>
                    </div>
                  </div>
                ))}
                
                {/* Métricas adicionales mejoradas */}
                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-200">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-25 border border-green-200 group hover:shadow-sm transition-all">
                    <p className="text-sm text-gray-600">Crecimiento Anual</p>
                    <p className={`text-xl font-bold ${getTrendColor(kpis.crecimiento_utilidad_neta, true)} group-hover:scale-105 transition-transform`}>
                      {formatFinancial(kpis.crecimiento_utilidad_neta, 'percent', { 
                        decimals: 1, 
                        alwaysShowSign: true 
                      })}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-25 border border-blue-200 group hover:shadow-sm transition-all">
                    <p className="text-sm text-gray-600">Ingresos vs Meta</p>
                    <p className="text-xl font-bold text-gray-900 group-hover:scale-105 transition-transform">
                      {formatFinancial(kpis.ingresos_totales, 'currency', { decimals: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información de Vista Actual Mejorada */}
      {viewMode === 'comparison' && comparisonData && comparisonData.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 animate-pulse-slow shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="text-blue-800 font-semibold text-sm">
                Modo comparación activado
              </p>
              <p className="text-blue-600 text-xs">
                Visualizando {comparisonData.length} archivos seleccionados para análisis comparativo
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}