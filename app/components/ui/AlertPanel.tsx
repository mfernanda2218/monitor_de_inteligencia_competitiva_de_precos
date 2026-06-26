import React from 'react';

export interface Alert {
  id: string;
  type: 'price_gap' | 'market_share' | 'price_trend' | 'coverage' | 'category_performance' | 'brand_comparison' | 'competitor_share';
  severity: 'danger' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface AlertPanelProps {
  alerts: Alert[];
  maxItems?: number;
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertPanel({ alerts, maxItems = 5, onAlertClick }: AlertPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger': return '#DC2626';
      case 'warning': return '#D97706';
      case 'success': return '#059669';
      case 'info': return '#0891B2';
      default: return '#6B7280';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'danger': return '#FEE2E2';
      case 'warning': return '#FEF3C7';
      case 'success': return '#DCFCE7';
      case 'info': return '#E0F2FE';
      default: return '#F3F4F6';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_gap': return '⚠️';
      case 'market_share': return '📊';
      case 'price_trend': return '📈';
      case 'coverage': return '🌐';
      case 'category_performance': return '🏆';
      case 'brand_comparison': return '⚔️';
      case 'competitor_share': return '🎯';
      default: return 'ℹ️';
    }
  };

  const displayAlerts = Array.isArray(alerts) ? alerts.slice(0, maxItems) : [];

  if (displayAlerts.length === 0) {
    return (
      <div>
        <div style={{
          textAlign: 'center',
          padding: '20px 12px',
          color: '#6B7280'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✓</div>
          <div style={{ fontSize: '0.875rem' }}>Nenhum alerta no momento</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onAlertClick?.(alert)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: getSeverityBg(alert.severity),
              borderLeft: `3px solid ${getSeverityColor(alert.severity)}`,
              cursor: onAlertClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (onAlertClick) {
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ fontSize: '1rem', flexShrink: 0 }}>
                {getAlertIcon(alert.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '2px',
                  gap: '8px'
                }}>
                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#111827',
                    flex: 1
                  }}>
                    {alert.title}
                  </div>
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: getSeverityColor(alert.severity),
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'white',
                    flexShrink: 0
                  }}>
                    {alert.severity}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#6B7280',
                  lineHeight: 1.4
                }}>
                  {alert.description}
                </div>
                {alert.timestamp && (
                  <div style={{
                    fontSize: '0.625rem',
                    color: '#9CA3AF',
                    marginTop: '4px'
                  }}>
                    {alert.timestamp}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {alerts.length > maxItems && (
        <div style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#6B7280'
        }}>
          +{alerts.length - maxItems} alertas adicionais
        </div>
      )}
    </div>
  );
}
