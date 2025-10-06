// src/components/charts/ProfitTrendChart.jsx - VERSIÓN CORREGIDA CON PATRÓN DE AdvancedComparison
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useApp } from '../../contexts/AppContext';

export default function ProfitTrendChart() {
  const { state } = useApp();
  
  // Usar el mismo patrón que AdvancedComparison para obtener datos
  const chartData = useMemo(() => {
    console.log('📊 Datos disponibles en state:', {
      historicalData: state.historicalData?.length,
      currentData: !!state.currentData
    });

    // Si hay datos históricos, usarlos para la tendencia (igual que AdvancedComparison)
    if (state.historicalData && state.historicalData.length > 0) {
      const sortedData = [...state.historicalData]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-6); // Últimos 6 períodos como en AdvancedComparison

      console.log('📈 Datos históricos ordenados:', sortedData.map(item => ({
        name: item.displayName,
        utilidad_neta: item.kpis?.utilidad_neta,
        timestamp: item.timestamp
      })));

      return sortedData.map((item, index) => {
        const kpis = item.kpis || {};
        return {
          name: item.displayName || `Período ${index + 1}`,
          'Utilidad Neta': kpis.utilidad_neta || 0,
          'Utilidad Operativa': kpis.utilidad_operacion || kpis.utilidad_operativa || 0,
          'Utilidad Bruta': kpis.utilidad_bruta || 0,
          'Ingresos Totales': kpis.ingresos_totales || 0,
          rawData: kpis,
          timestamp: item.timestamp,
          isHistorical: true
        };
      });
    }

    // Si no hay históricos pero hay datos actuales, crear comparativa actual vs anterior
    if (state.currentData && state.currentData.kpis) {
      const kpis = state.currentData.kpis;
      const comparisonData = [];

      // Añadir año anterior si existe (igual que en AdvancedComparison)
      if (kpis.utilidad_neta_anio_anterior !== undefined) {
        comparisonData.push({
          name: 'Año Anterior',
          'Utilidad Neta': kpis.utilidad_neta_anio_anterior || 0,
          'Utilidad Operativa': kpis.utilidad_operacion_anio_anterior || kpis.utilidad_operativa_anio_anterior || 0,
          'Utilidad Bruta': kpis.utilidad_bruta_anio_anterior || 0,
          'Ingresos Totales': kpis.ingresos_totales_anio_anterior || 0,
          isComparison: true,
          isPrevious: true
        });
      }

      // Añadir período actual
      comparisonData.push({
        name: 'Actual',
        'Utilidad Neta': kpis.utilidad_neta || 0,
        'Utilidad Operativa': kpis.utilidad_operacion || kpis.utilidad_operativa || 0,
        'Utilidad Bruta': kpis.utilidad_bruta || 0,
        'Ingresos Totales': kpis.ingresos_totales || 0,
        isComparison: true,
        isCurrent: true
      });

      console.log('🔄 Datos de comparación:', comparisonData);
      return comparisonData;
    }

    // Si no hay datos, retornar array vacío
    console.warn('⚠️ No hay datos disponibles para el gráfico');
    return [];
  }, [state.historicalData, state.currentData]);

  // Calcular estadísticas de variación (igual que en AdvancedComparison)
  const variationStats = useMemo(() => {
    if (chartData.length < 2) return null;

    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    
    const netGrowth = last['Utilidad Neta'] - first['Utilidad Neta'];
    const netGrowthPercent = first['Utilidad Neta'] !== 0 
      ? (netGrowth / Math.abs(first['Utilidad Neta'])) * 100 
      : last['Utilidad Neta'] !== 0 ? 100 : 0;

    const operativeGrowth = last['Utilidad Operativa'] - first['Utilidad Operativa'];
    const operativeGrowthPercent = first['Utilidad Operativa'] !== 0 
      ? (operativeGrowth / Math.abs(first['Utilidad Operativa'])) * 100 
      : last['Utilidad Operativa'] !== 0 ? 100 : 0;

    return {
      netGrowth,
      netGrowthPercent,
      operativeGrowth,
      operativeGrowthPercent,
      periodCount: chartData.length,
      hasGrowth: netGrowth > 0,
      hasOperativeGrowth: operativeGrowth > 0
    };
  }, [chartData]);

  const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '$0';
    
    // Para valores muy grandes, usar formato compacto
    if (Math.abs(value) >= 1000000) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        notation: 'compact',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value);
    }

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-2xl border border-gray-300 backdrop-blur-sm min-w-[200px]">
          <p className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{entry.name}:</span>
                </div>
                <span className="text-sm font-bold" style={{ color: entry.color }}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Si no hay datos, mostrar estado vacío
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tendencia de Utilidades</h2>
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-4">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 font-medium text-center mb-2">
            No hay datos disponibles
          </p>
          <p className="text-sm text-gray-400 text-center">
            {!state.currentData 
              ? 'Carga un archivo Excel para ver las tendencias' 
              : 'Sube múltiples archivos para ver la evolución temporal'
            }
          </p>
        </div>
      </div>
    );
  }

  // Verificar si hay variación real en los datos
  const hasRealVariation = chartData.some((data, index, array) => {
    if (index === 0) return false;
    const prev = array[index - 1];
    return (
      Math.abs(data['Utilidad Neta'] - prev['Utilidad Neta']) > 100 ||
      Math.abs(data['Utilidad Operativa'] - prev['Utilidad Operativa']) > 100 ||
      Math.abs(data['Utilidad Bruta'] - prev['Utilidad Bruta']) > 100
    );
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header con estadísticas - similar a AdvancedComparison */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {chartData[0]?.isComparison ? 'Comparativa de Utilidades' : 'Tendencia de Utilidades'}
          </h2>
          {variationStats && hasRealVariation && (
            <div className="flex gap-4 mt-2">
              <p className={`text-sm font-medium ${
                variationStats.hasGrowth ? 'text-green-600' : 'text-red-600'
              }`}>
                Utilidad Neta: {variationStats.hasGrowth ? '↗' : '↘'} 
                {Math.abs(variationStats.netGrowthPercent).toFixed(1)}%
              </p>
              <p className={`text-sm font-medium ${
                variationStats.hasOperativeGrowth ? 'text-green-600' : 'text-red-600'
              }`}>
                Operativa: {variationStats.hasOperativeGrowth ? '↗' : '↘'} 
                {Math.abs(variationStats.operativeGrowthPercent).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {chartData.length} {chartData.length === 1 ? 'período' : 'períodos'}
          </div>
          {chartData.some(d => d.isHistorical) && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Tendencia
            </div>
          )}
        </div>
      </div>
      
      {/* Gráfico principal */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f3f4f6" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                if (value === 0) return '$0';
                return new Intl.NumberFormat('es-MX', {
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(value);
              }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ 
                stroke: '#e5e7eb', 
                strokeWidth: 1,
                strokeDasharray: '3 3'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '10px',
                fontSize: '12px'
              }}
            />
            
            {/* Líneas con animación */}
            <Line 
              type="monotone" 
              dataKey="Utilidad Bruta" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ 
                fill: '#3B82F6', 
                strokeWidth: 2, 
                r: 5,
                stroke: '#ffffff',
              }}
              activeDot={{ 
                r: 7, 
                fill: '#3B82F6',
                stroke: '#ffffff',
                strokeWidth: 3,
              }}
              isAnimationActive={true}
              animationDuration={1000}
            />
            <Line 
              type="monotone" 
              dataKey="Utilidad Operativa" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ 
                fill: '#10B981', 
                strokeWidth: 2, 
                r: 5,
                stroke: '#ffffff',
              }}
              activeDot={{ 
                r: 7, 
                fill: '#10B981',
                stroke: '#ffffff',
                strokeWidth: 3,
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationBegin={200}
            />
            <Line 
              type="monotone" 
              dataKey="Utilidad Neta" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ 
                fill: '#8B5CF6', 
                strokeWidth: 2, 
                r: 5,
                stroke: '#ffffff',
              }}
              activeDot={{ 
                r: 7, 
                fill: '#8B5CF6',
                stroke: '#ffffff',
                strokeWidth: 3,
              }}
              isAnimationActive={true}
              animationDuration={1000}
              animationBegin={400}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Información adicional */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {hasRealVariation ? '🔄 Datos dinámicos' : '📊 Datos estáticos'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">
              Actualizado: {new Date().toLocaleTimeString('es-MX')}
            </span>
          </div>
        </div>
        
        {/* Debug info - solo en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2 text-xs">
            <summary className="cursor-pointer text-gray-400">Debug Info</summary>
            <div className="mt-1 p-2 bg-gray-50 rounded text-gray-600 space-y-1">
              <div>Datos procesados: {chartData.length} puntos</div>
              <div>Variación detectada: {hasRealVariation ? 'Sí' : 'No'}</div>
              <div>Rango Utilidad Neta: {formatCurrency(Math.min(...chartData.map(d => d['Utilidad Neta'])))} - {formatCurrency(Math.max(...chartData.map(d => d['Utilidad Neta'])))}</div>
              <div>Fuente: {chartData[0]?.isHistorical ? 'Datos históricos' : 'Comparativa actual'}</div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}