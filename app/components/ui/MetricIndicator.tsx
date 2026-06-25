import React from 'react';

interface MetricIndicatorProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'absolute' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
  className?: string;
}

export default function MetricIndicator({
  label,
  value,
  change,
  changeType = 'percentage',
  trend,
  size = 'md',
  color = 'primary',
  className = ''
}: MetricIndicatorProps) {
  const colorStyles = {
    primary: '#2563EB',
    success: '#059669',
    danger: '#DC2626',
    warning: '#D97706',
    neutral: '#6B7280'
  };

  const sizeStyles = {
    sm: { valueSize: '1rem', labelSize: '0.75rem' },
    md: { valueSize: '1.25rem', labelSize: '0.875rem' },
    lg: { valueSize: '1.5rem', labelSize: '1rem' }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#059669';
    if (trend === 'down') return '#DC2626';
    return '#6B7280';
  };

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{
        fontSize: sizeStyles[size].labelSize,
        color: '#6B7280',
        fontWeight: 500
      }}>
        {label}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px'
      }}>
        <div style={{
          fontSize: sizeStyles[size].valueSize,
          fontWeight: 700,
          color: colorStyles[color]
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div style={{
            fontSize: sizeStyles[size].labelSize,
            color: getTrendColor(),
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {getTrendIcon()}
            {changeType === 'percentage' ? `${Math.abs(change).toFixed(1)}%` : Math.abs(change).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
