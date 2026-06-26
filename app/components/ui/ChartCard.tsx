import React from 'react';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ChartCard({ title, children, actions, className = '', style }: ChartCardProps) {
  return (
    <div className={`card ${className}`} style={style}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '8px'
      }}>
        <h3 style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#111827',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          margin: 0
        }}>
          {title}
        </h3>
        {actions && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {actions}
          </div>
        )}
      </div>
      <div style={{ minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
