import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface MarketShareBarProps {
  data: DataPoint[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
  className?: string;
  format?: 'percentage' | 'currency';
}

export default function MarketShareBar({
  data,
  dataKey,
  nameKey = 'name',
  color = '#2563EB',
  height = 220,
  horizontal = false,
  className = '',
  format = 'percentage',
}: MarketShareBarProps) {
  const formatValue = (value: any): string => {
    const num = Number(value ?? 0);
    return format === 'currency'
      ? `R$ ${num.toLocaleString('pt-BR')}`
      : `${num.toFixed(1)}%`;
  };

  // tickFormatter compatível com Recharts v3
  const tickFormatter = (value: any): string => {
    return formatValue(value);
  };

  return (
    <div className={className} style={{ width: '100%', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />

          {/* XAxis */}
          <XAxis
            dataKey={horizontal ? 'value' : nameKey}
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            type={horizontal ? 'number' : 'category'}
            tickFormatter={horizontal ? tickFormatter : undefined}
          />

          {/* YAxis */}
          <YAxis
            dataKey={horizontal ? nameKey : 'value'}
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            type={horizontal ? 'category' : 'number'}
            tickFormatter={!horizontal ? tickFormatter : undefined}
          />

          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            itemStyle={{ fontSize: '0.75rem', color: '#111827' }}
            labelStyle={{
              fontSize: '0.75rem',
              color: '#6B7280',
              marginBottom: '4px',
            }}
            formatter={(value: any) => [
              formatValue(value),
              format === 'currency' ? 'Preço' : 'Market Share',
            ]}
          />

          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}