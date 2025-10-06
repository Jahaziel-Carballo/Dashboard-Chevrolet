// src/components/charts/MarginBarChart.jsx
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function MarginBarChart({ data }) {
  if (!data) return null;

  const { kpis } = data;

  const marginData = [
    {
      name: 'Margen Bruto',
      actual: kpis.margen_bruto,
      anterior: kpis.utilidad_bruta_anio_anterior && kpis.ingresos_totales_anio_anterior ? 
        (kpis.utilidad_bruta_anio_anterior / kpis.ingresos_totales_anio_anterior) * 100 : 0
    },
    {
      name: 'Margen Operativo',
      actual: kpis.margen_operativo,
      anterior: kpis.utilidad_operacion_anio_anterior && kpis.ingresos_totales_anio_anterior ? 
        (kpis.utilidad_operacion_anio_anterior / kpis.ingresos_totales_anio_anterior) * 100 : 0
    },
    {
      name: 'Margen Neto',
      actual: kpis.margen_neto,
      anterior: kpis.utilidad_neta_anio_anterior && kpis.ingresos_totales_anio_anterior ? 
        (kpis.utilidad_neta_anio_anterior / kpis.ingresos_totales_anio_anterior) * 100 : 0
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 backdrop-blur-sm">
          <p className="font-bold text-gray-900 mb-3 text-sm">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-sm"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="font-medium text-gray-600 min-w-[120px]">
                  {entry.name}:
                </span>
                <span className="font-bold text-gray-900">
                  {entry.value?.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-600">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Comparativa de Márgenes</h2>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          Porcentajes (%)
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={marginData} 
            margin={{ top: 5, right: 20, left: 20, bottom: 10 }}
            barSize={32}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f3f4f6" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={13}
              fontWeight={500}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              fontWeight={500}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: '#f8fafc' }}
            />
            <Legend content={<CustomLegend />} />
            <Bar 
              dataKey="actual" 
              name="Período Actual" 
              fill="#4f46e5" 
              radius={[6, 6, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
            <Bar 
              dataKey="anterior" 
              name="Año Anterior" 
              fill="#94a3b8" 
              radius={[6, 6, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Comparación entre el período actual y el año anterior
      </div>
    </div>
  );
}