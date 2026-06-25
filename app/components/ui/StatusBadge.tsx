import React from 'react';

interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusBadge({ 
  variant, 
  children, 
  size = 'md',
  className = '' 
}: StatusBadgeProps) {
  const variantStyles = {
    success: { bg: '#DCFCE7', color: '#059669' },
    warning: { bg: '#FEF3C7', color: '#D97706' },
    danger: { bg: '#FEE2E2', color: '#DC2626' },
    info: { bg: '#E0F2FE', color: '#0891B2' },
    neutral: { bg: '#F3F4F6', color: '#6B7280' }
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.625rem' },
    md: { padding: '4px 10px', fontSize: '0.75rem' }
  };

  return (
    <span
      className={`badge ${className}`}
      style={{
        background: variantStyles[variant].bg,
        color: variantStyles[variant].color,
        padding: sizeStyles[size].padding,
        fontSize: sizeStyles[size].fontSize,
        fontWeight: 500,
        borderRadius: '9999px',
        display: 'inline-block'
      }}
    >
      {children}
    </span>
  );
}
