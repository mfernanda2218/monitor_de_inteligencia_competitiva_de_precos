import React from 'react';

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export default function DashboardCard({ 
  title, 
  children, 
  className = '',
  padding = 'lg',
  style
}: DashboardCardProps) {
  const paddingStyles = {
    sm: '10px',
    md: '12px',
    lg: '14px'
  };

  return (
    <div 
      className={`card ${className}`}
      style={{
        '--card-padding': paddingStyles[padding],
        ...style
      } as React.CSSProperties}
    >
      {title && (
        <h3 style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
