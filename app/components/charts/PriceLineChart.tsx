import React from 'react';
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

interface DataPoint {
  date: string;
  [key: string]: string | number;
}

interface PriceLineChartProps {
  data: DataPoint[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
  }[];
  height?: number;
  className?: string;
}

export default function PriceLineChart({ 
  data, 
  lines, 
  height = 400,
  className = '' 
}: PriceLineChartProps) {
  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          <YAxis 
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E7EB' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
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
            formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']}
          />
          <Legend 
            wrapperStyle={{ fontSize: '0.875rem', color: '#111827' }}
            iconType="circle"
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: line.color }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
