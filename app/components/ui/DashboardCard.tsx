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
    sm: '16px',
    md: '20px',
    lg: '24px'
  };

  return (
    <div 
      className={`card ${className}`}
      style={{ padding: paddingStyles[padding], ...style }}
    >
      {title && (
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '16px',
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
