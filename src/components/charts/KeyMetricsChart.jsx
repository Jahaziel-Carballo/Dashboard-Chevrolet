// src/components/charts/KeyMetricsChart.jsx
import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function KeyMetricsChart({ data }) {
  if (!data) return null;

  const { kpis } = data;

  const metricsData = [
    { subject: 'Rentabilidad', value: kpis.margen_neto, fullMark: 20 },
    { subject: 'Eficiencia', value: 100 - kpis.ratio_eficiencia_operativa, fullMark: 100 },
    { subject: 'Crecimiento', value: Math.min(kpis.crecimiento_utilidad_neta, 100), fullMark: 100 },
    { subject: 'Productividad', value: kpis.roi_personal, fullMark: 200 },
    { subject: 'Margen Bruto', value: kpis.margen_bruto, fullMark: 40 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].payload.subject}</p>
          <p className="text-blue-600 font-medium">{payload[0].value.toFixed(1)} puntos</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Métricas Clave de Desempeño</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metricsData}>
            <PolarGrid stroke="#f0f0f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Métricas"
              dataKey="value"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="font-semibold text-blue-700">{kpis.margen_neto}%</p>
          <p className="text-blue-600">Margen Neto</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="font-semibold text-green-700">{kpis.crecimiento_utilidad_neta}%</p>
          <p className="text-green-600">Crecimiento</p>
        </div>
      </div>
    </div>
  );
}