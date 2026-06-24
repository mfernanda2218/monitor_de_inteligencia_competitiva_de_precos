'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Alert {
  type: string;
  brand: string;
  severity: string;
  message: string;
  recommendation?: string;
  avg_price?: number;
  price_variation?: number;
  market_share?: number;
  premium_vs_min?: number;
  midea_price?: number;
  market_min?: number;
  market_avg?: number;
  sku?: string;
  trend_direction?: string;
  category?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar alertas');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Carregando inteligência competitiva...</div>;
  if (error) return <div className="error">{error}</div>;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger': return '#FF4757';
      case 'warning': return '#FFB800';
      case 'success': return '#00FF88';
      default: return '#00D4FF';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price_gap': return '⚠️';
      case 'market_share': return '📊';
      case 'price_trend': return '📈';
      case 'coverage': return '🌐';
      case 'category_performance': return '🏆';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Voltar ao Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Inteligência Competitiva
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Insights acionáveis para tomada de decisão estratégica
        </p>
      </header>

      {alerts && alerts.length > 0 ? (
        <div className="grid grid-2">
          {alerts.map((alert, index) => (
            <div key={index} className="card" style={{ borderLeft: `4px solid ${getSeverityColor(alert.severity)}` }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>{getAlertIcon(alert.type)}</span>
                <span className={`badge badge-${alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'success'}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span style={{ marginLeft: '8px', color: '#64748B', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {alert.type.replace('_', ' ')}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#00FF88', fontWeight: 600 }}>
                {alert.brand}
                {alert.sku && <span style={{ fontSize: '0.875rem', color: '#64748B', marginLeft: '8px' }}>• {alert.sku}</span>}
              </h3>

              <p style={{ color: '#E2E8F0', marginBottom: '16px', lineHeight: 1.6 }}>
                {alert.message}
              </p>

              {alert.recommendation && (
                <div style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    💡 Recomendação
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#E2E8F0' }}>
                    {alert.recommendation}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.875rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {alert.midea_price && alert.market_min && (
                  <>
                    <div>Preço MIDEA: <span style={{ color: '#00FF88', fontWeight: 600 }}>R$ {alert.midea_price.toFixed(2)}</span></div>
                    <div>Mínimo Mercado: <span style={{ color: '#E2E8F0' }}>R$ {alert.market_min.toFixed(2)}</span></div>
                    {alert.premium_vs_min && (
                      <div>Premium: <span style={{ color: alert.premium_vs_min > 10 ? '#FF4757' : '#00FF88', fontWeight: 600 }}>
                        {alert.premium_vs_min > 0 ? '+' : ''}{alert.premium_vs_min.toFixed(1)}%
                      </span></div>
                    )}
                  </>
                )}
                {alert.market_share && (
                  <div>Market Share: <span style={{ color: '#00D4FF', fontWeight: 600 }}>{alert.market_share.toFixed(1)}%</span></div>
                )}
                {alert.avg_price && (
                  <div>Preço Médio: <span style={{ color: '#E2E8F0' }}>R$ {alert.avg_price.toFixed(2)}</span></div>
                )}
                {alert.price_variation && (
                  <div>Variação: <span style={{ color: '#E2E8F0' }}>R$ {alert.price_variation.toFixed(2)}</span></div>
                )}
                {alert.trend_direction && (
                  <div>Tendência: <span style={{ color: alert.trend_direction === 'increasing' ? '#FF4757' : '#00FF88', fontWeight: 600 }}>
                    {alert.trend_direction === 'increasing' ? '📈 Alta' : '📉 Baixa'}
                  </span></div>
                )}
                {alert.category && (
                  <div>Categoria: <span style={{ color: '#00D4FF', fontWeight: 600 }}>{alert.category}</span></div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p style={{ color: '#64748B', textAlign: 'center', fontSize: '1.1rem' }}>
            Nenhum alerta no momento. O sistema está monitorando anomalias de preços.
          </p>
        </div>
      )}
    </div>
  );
}
