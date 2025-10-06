// src/components/charts/RevenuePieChart.jsx - VERSIÓN MEJORADA
import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  'url(#blueGradient)', 
  'url(#greenGradient)', 
  'url(#purpleGradient)', 
  'url(#orangeGradient)', 
  'url(#redGradient)', 
  'url(#cyanGradient)', 
  'url(#indigoGradient)'
];

export default function RevenuePieChart({ data }) {
  const [animatedData, setAnimatedData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (data && data.kpis) {
      // Inicializar datos con valores en 0 para animación
      const initialData = getPieData(data.kpis).map(item => ({
        ...item,
        animatedValue: 0
      }));
      setAnimatedData(initialData);
      
      // Animar los valores después de un delay
      setTimeout(() => {
        setAnimatedData(getPieData(data.kpis));
      }, 500);
    }
  }, [data]);

  if (!data) return null;

  const { kpis } = data;

  const getPieData = (kpis) => [
    { 
      name: 'Autos Nuevos', 
      value: kpis.ventas_autos_nuevos,
      percentage: kpis.porcentaje_nuevos,
      color: 'from-blue-500 to-blue-600',
      icon: '🚗'
    },
    { 
      name: 'Autos Usados', 
      value: kpis.ventas_autos_usados,
      percentage: kpis.porcentaje_usados,
      color: 'from-green-500 to-green-600',
      icon: '🛻'
    },
    { 
      name: 'Financiamiento', 
      value: kpis.ventas_financiamiento,
      percentage: kpis.ingresos_totales > 0 ? (kpis.ventas_financiamiento / kpis.ingresos_totales) * 100 : 0,
      color: 'from-purple-500 to-purple-600',
      icon: '💳'
    },
    { 
      name: 'Servicio', 
      value: kpis.ventas_servicio + kpis.ventas_servicio_arlux,
      percentage: kpis.porcentaje_servicio,
      color: 'from-orange-500 to-orange-600',
      icon: '🔧'
    },
    { 
      name: 'Refacciones', 
      value: kpis.ventas_refacciones + kpis.ventas_refacciones_ventanilla + kpis.ventas_refacciones_mayoreo,
      percentage: kpis.porcentaje_refacciones,
      color: 'from-red-500 to-red-600',
      icon: '⚙️'
    }
  ].filter(item => item.value > 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm bg-opacity-95">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-sm">{data.icon}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{data.name}</p>
              <p className="text-blue-600 font-semibold text-lg">{formatCurrency(data.value)}</p>
            </div>
          </div>
          {data.percentage && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Porcentaje:</span>
              <span className="font-bold text-gray-900">{data.percentage.toFixed(1)}%</span>
            </div>
          )}
          
          {/* Barra de progreso en el tooltip */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${data.percentage}%` }}
            ></div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {payload.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <div 
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
            <span className="text-xs text-gray-500 font-medium">
              {formatCurrency(entry.payload.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Gradientes SVG para las rebanadas del pie chart
  const GradientDefinitions = () => (
    <defs>
      <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="redGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
      <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
      <linearGradient id="indigoGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header con icono y título */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-lg text-white">💰</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Composición de Ingresos</h2>
          <p className="text-sm text-gray-500 mt-1">Distribución por categorías de ventas</p>
        </div>
      </div>
      
      <div className={`h-80 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <GradientDefinitions />
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage, value }) => {
                if (percentage > 8) {
                  return `${name}\n${formatCurrency(value)}`;
                }
                return null;
              }}
              outerRadius={90}
              innerRadius={40}
              paddingAngle={2}
              dataKey="value"
              animationBegin={500}
              animationDuration={1000}
            >
              {animatedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Total y estadísticas adicionales */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-25 rounded-xl border border-blue-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(kpis.ingresos_totales)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">Categorías Activas</p>
            <p className="text-xl font-bold text-blue-600">{animatedData.length}</p>
          </div>
        </div>
        
        {/* Mini estadísticas */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Categoría Principal</p>
            <p className="text-sm font-semibold text-gray-900">
              {animatedData.length > 0 
                ? animatedData.reduce((max, item) => item.value > max.value ? item : max).name
                : 'N/A'
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Mayor Porcentaje</p>
            <p className="text-sm font-semibold text-gray-900">
              {animatedData.length > 0 
                ? `${Math.max(...animatedData.map(item => item.percentage)).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Efecto de gradiente sutil en el fondo */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}