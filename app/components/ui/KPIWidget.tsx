import React from 'react';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'info';
}

export default function KPIWidget({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon,
  color = 'primary'
}: KPIWidgetProps) {
  const colorStyles = {
    primary: '#2563EB',
    success: '#059669',
    danger: '#DC2626',
    warning: '#D97706',
    neutral: '#6B7280',
    info: '#0891B2'
  };

  return (
    <div className="card stat-card">
      {icon && (
        <div style={{ marginBottom: '12px', fontSize: '1.5rem' }}>
          {icon}
        </div>
      )}
      <div className="stat-label" style={{ marginBottom: '8px' }}>
        {title}
      </div>
      <div 
        className="stat-value" 
        style={{ color: colorStyles[color] }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {trend && (
        <div style={{
          fontSize: '0.875rem',
          color: trend.isPositive ? '#059669' : '#DC2626',
          fontWeight: 500,
          marginTop: '4px'
        }}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
        </div>
      )}
      {subtitle && (
        <div style={{
          fontSize: '0.75rem',
          color: '#6B7280',
          marginTop: '4px'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
