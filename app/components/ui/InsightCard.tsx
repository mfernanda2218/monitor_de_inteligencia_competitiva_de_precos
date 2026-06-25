import React from 'react';

interface Insight {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface InsightCardProps {
  title: string;
  insights: Insight[];
  icon?: React.ReactNode;
  className?: string;
}

export default function InsightCard({ title, insights, icon, className = '' }: InsightCardProps) {
  return (
    <div className={`card ${className}`}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {icon && <span style={{ fontSize: '1.25rem' }}>{icon}</span>}
        <h3 style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#111827',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0
        }}>
          {title}
        </h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#111827'
              }}>
                {insight.title}
              </div>
              {insight.trend && (
                <span style={{
                  fontSize: '1rem',
                  color: insight.trend === 'up' ? '#059669' : 
                        insight.trend === 'down' ? '#DC2626' : '#6B7280'
                }}>
                  {insight.trend === 'up' ? '↑' : insight.trend === 'down' ? '↓' : '→'}
                </span>
              )}
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#2563EB',
              marginBottom: '4px'
            }}>
              {typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value}
            </div>
            {insight.description && (
              <div style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                lineHeight: 1.4
              }}>
                {insight.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
