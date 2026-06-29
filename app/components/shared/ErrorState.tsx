// app/components/shared/ErrorState.tsx
'use client';

import React from 'react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Erro ao carregar dados', onRetry }: ErrorStateProps) {
  return (
    <div className="error">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '48px 24px'
      }}>
        <div style={{
          fontSize: '3rem',
          color: '#DC2626'
        }}>
          ⚠️
        </div>
        <div style={{
          color: '#DC2626',
          fontSize: '1rem',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          {message}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
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
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}