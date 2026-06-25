import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
}

export default function MarketShareBar({ 
  data, 
  dataKey,
  nameKey = 'name',
  color = '#2563EB',
  height = 400,
  horizontal = false,
  className = '' 
}: MarketShareBarProps) {
  return (
    <div className={className} style={{ width: '100%', height }}>
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
          <XAxis 
            dataKey={horizontal ? 'value' : nameKey}
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            type={horizontal ? 'number' : 'category'}
            tickFormatter={horizontal ? (value) => `${value}%` : undefined}
          />
          <YAxis 
            dataKey={horizontal ? nameKey : 'value'}
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            type={horizontal ? 'category' : 'number'}
            tickFormatter={horizontal ? undefined : (value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ fontSize: '0.875rem', color: '#111827' }}
            labelStyle={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Market Share']}
          />
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
