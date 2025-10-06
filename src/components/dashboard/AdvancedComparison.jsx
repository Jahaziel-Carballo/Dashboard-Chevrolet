// src/components/dashboard/AdvancedComparison.jsx - VERSIÓN SIMPLIFICADA Y ELEGANTE
import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatFinancial, getTrendColor, getTrendIcon } from '../../utils/formatters';

export default function AdvancedComparison() {
  const { state, dispatch } = useApp();
  const [selectedMetrics, setSelectedMetrics] = useState(['utilidad_neta', 'ingresos_totales', 'margen_neto']);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const availableMetrics = [
    { 
      key: 'utilidad_neta', 
      label: 'Utilidad Neta', 
      category: 'resultados', 
      type: 'currency',
      description: 'Resultado final después de todos los costos y gastos'
    },
    { 
      key: 'utilidad_operacion', 
      label: 'Utilidad Operación', 
      category: 'resultados', 
      type: 'currency',
      description: 'Resultado de las operaciones principales del negocio'
    },
    { 
      key: 'utilidad_bruta', 
      label: 'Utilidad Bruta', 
      category: 'resultados', 
      type: 'currency',
      description: 'Ingresos menos costos directos'
    },
    { 
      key: 'ingresos_totales', 
      label: 'Ingresos Totales', 
      category: 'ingresos', 
      type: 'currency',
      description: 'Total de ingresos por todas las actividades'
    },
    { 
      key: 'ventas_autos_nuevos', 
      label: 'Ventas Autos Nuevos', 
      category: 'ingresos', 
      type: 'currency',
      description: 'Ingresos por venta de vehículos nuevos'
    },
    { 
      key: 'ventas_autos_usados', 
      label: 'Ventas Autos Usados', 
      category: 'ingresos', 
      type: 'currency',
      description: 'Ingresos por venta de vehículos usados'
    },
    { 
      key: 'margen_neto', 
      label: 'Margen Neto', 
      category: 'margenes', 
      type: 'percent',
      description: 'Porcentaje de utilidad neta sobre ingresos'
    },
    { 
      key: 'margen_operativo', 
      label: 'Margen Operativo', 
      category: 'margenes', 
      type: 'percent',
      description: 'Porcentaje de utilidad operativa sobre ingresos'
    },
    { 
      key: 'margen_bruto', 
      label: 'Margen Bruto', 
      category: 'margenes', 
      type: 'percent',
      description: 'Porcentaje de utilidad bruta sobre ingresos'
    },
    { 
      key: 'crecimiento_utilidad_neta', 
      label: 'Crecimiento Utilidad', 
      category: 'tendencias', 
      type: 'percent',
      description: 'Variación porcentual de utilidad neta vs período anterior'
    },
    { 
      key: 'ratio_eficiencia_operativa', 
      label: 'Eficiencia Operativa', 
      category: 'eficiencia', 
      type: 'percent',
      description: 'Gastos operativos como porcentaje de ingresos (menor es mejor)'
    },
    { 
      key: 'roi_personal', 
      label: 'ROI de Personal', 
      category: 'eficiencia', 
      type: 'percent',
      description: 'Retorno sobre inversión en gastos de personal'
    }
  ];

  const comparisonData = useMemo(() => {
    return state.comparisonSelection.map(id => 
      state.historicalData.find(item => item.id === id)
    ).filter(Boolean);
  }, [state.comparisonSelection, state.historicalData]);

  // Calcular promedios y tendencias
  const summaryData = useMemo(() => {
    if (comparisonData.length === 0) return null;

    const averages = {};
    const trends = {};

    availableMetrics.forEach(metric => {
      const values = comparisonData.map(item => item.kpis[metric.key]).filter(v => v !== undefined);
      if (values.length > 0) {
        averages[metric.key] = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        if (values.length >= 2) {
          const sortedData = [...comparisonData].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );
          const firstValue = sortedData[0].kpis[metric.key];
          const lastValue = sortedData[sortedData.length - 1].kpis[metric.key];
          
          if (firstValue !== 0) {
            trends[metric.key] = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
          }
        }
      }
    });

    return { averages, trends };
  }, [comparisonData]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedComparisonData = useMemo(() => {
    if (!sortConfig.key) return comparisonData;

    return [...comparisonData].sort((a, b) => {
      const aValue = a.kpis[sortConfig.key] || 0;
      const bValue = b.kpis[sortConfig.key] || 0;

      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [comparisonData, sortConfig]);

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => 
      prev.includes(metricKey)
        ? prev.filter(m => m !== metricKey)
        : [...prev, metricKey]
    );
  };

  const toggleFileComparison = (fileId) => {
    if (state.comparisonSelection.includes(fileId)) {
      dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: fileId });
    } else {
      dispatch({ type: 'ADD_TO_COMPARISON', payload: fileId });
    }
  };

  const selectAllMetrics = () => {
    setSelectedMetrics(availableMetrics.map(m => m.key));
  };

  const clearAllMetrics = () => {
    setSelectedMetrics([]);
  };

  if (state.historicalData.length < 2) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Comparación Múltiple</h3>
        <p className="text-gray-600 mb-4">Necesitas al menos 2 archivos para usar la comparación múltiple</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
          <p className="text-blue-800 text-sm">
            Sube múltiples reportes mensuales para comparar el desempeño a través del tiempo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header Simplificado */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Comparación Múltiple</h2>
          <p className="text-gray-600 text-sm mt-1">
            {comparisonData.length} archivos seleccionados • {selectedMetrics.length} métricas activas
          </p>
        </div>
        <div className="flex gap-2">
          {comparisonData.length > 0 && (
            <>
              <button
                onClick={selectAllMetrics}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded transition-colors"
              >
                Seleccionar Todas
              </button>
              <button
                onClick={clearAllMetrics}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 font-medium hover:bg-gray-50 rounded transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => dispatch({ type: 'CLEAR_COMPARISON' })}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 rounded hover:bg-red-50 transition-colors"
              >
                Limpiar Selección
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Selector de Archivos */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Seleccionar Archivos para Comparar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.historicalData.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                  state.comparisonSelection.includes(item.id)
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleFileComparison(item.id)}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                    state.comparisonSelection.includes(item.id) ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {item.displayName}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Utilidad:</span>
                    <span className="font-medium text-green-600">
                      {formatFinancial(item.kpis.utilidad_neta, 'currency', { decimals: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ingresos:</span>
                    <span className="font-medium">
                      {formatFinancial(item.kpis.ingresos_totales, 'currency', { decimals: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen:</span>
                    <span className="font-medium">
                      {formatFinancial(item.kpis.margen_neto, 'percent', { decimals: 1, alwaysShowSign: false })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de Comparación */}
        {comparisonData.length > 0 && summaryData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Resumen de Comparación</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-600">Utilidad Neta Promedio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatFinancial(summaryData.averages.utilidad_neta, 'currency', { decimals: 0 })}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-600">Margen Neto Promedio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatFinancial(summaryData.averages.margen_neto, 'percent', { decimals: 1, alwaysShowSign: false })}
                </p>
              </div>
              <div className="text-center p-3 bg-white rounded border border-gray-200">
                <p className="text-sm text-gray-600">Tendencia General</p>
                <p className={`text-lg font-semibold ${getTrendColor(summaryData.trends.utilidad_neta, true)}`}>
                  {getTrendIcon(summaryData.trends.utilidad_neta, true)} {' '}
                  {formatFinancial(summaryData.trends.utilidad_neta, 'percent', { decimals: 1, alwaysShowSign: true })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selector de Métricas */}
        {comparisonData.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Métricas a Comparar</h3>
              <div className="text-sm text-gray-500">
                {selectedMetrics.length} de {availableMetrics.length} seleccionadas
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableMetrics.map((metric, index) => (
                <button
                  key={metric.key}
                  onClick={() => toggleMetric(metric.key)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 transform hover:scale-105 ${
                    selectedMetrics.includes(metric.key)
                      ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                  title={metric.description}
                  style={{
                    animationDelay: `${index * 30}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  {metric.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de Comparación */}
        {comparisonData.length > 0 && selectedMetrics.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archivo
                    </th>
                    {selectedMetrics.map((metricKey) => {
                      const metric = availableMetrics.find(m => m.key === metricKey);
                      return (
                        <th 
                          key={metricKey}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort(metricKey)}
                        >
                          <div className="flex items-center gap-1">
                            {metric.label}
                            {sortConfig.key === metricKey && (
                              <span className="text-gray-400">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedComparisonData.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{item.displayName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </td>
                      {selectedMetrics.map((metricKey) => {
                        const metric = availableMetrics.find(m => m.key === metricKey);
                        const value = item.kpis[metricKey];
                        
                        return (
                          <td key={metricKey} className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`font-medium ${
                              metric.type === 'percent' ? getTrendColor(value, false) : 'text-gray-900'
                            }`}>
                              {formatFinancial(value, metric.type, { 
                                decimals: metric.type === 'percent' ? 2 : 0,
                                alwaysShowSign: metric.type === 'percent'
                              })}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {comparisonData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium mb-2">Selecciona archivos para comparar</p>
            <p className="text-sm">Elige al menos 2 archivos del listado superior para comenzar la comparación</p>
          </div>
        )}
      </div>
    </div>
  );
}