import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ 
  icon = '📭',
  title = 'Nenhum dado encontrado',
  description,
  action
}: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
        {icon}
      </div>
      <div style={{
        fontSize: '1.125rem',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '8px'
      }}>
        {title}
      </div>
      {description && (
        <div style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          marginBottom: '24px',
          maxWidth: '400px'
        }}>
          {description}
        </div>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '10px 20px',
            background: '#2563EB',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#2563EB';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
