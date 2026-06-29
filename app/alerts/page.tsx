'use client';

import { useEffect, useState } from 'react';
import { TARGET_BRAND } from '../config/brands';
import PageHeader from '../components/layout/PageHeader';
import AlertPanel, { Alert } from '../components/ui/AlertPanel';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';

interface RawAlert {
  type: Alert['type'];
  brand?: string;
  competitor?: string;
  severity: Alert['severity'];
  sku?: string;
  message: string;
  recommendation?: string;
  target_price?: number;
  market_min?: number;
  market_share?: number;
  category?: string;
  rank?: number;
  is_competitor?: boolean;
  [key: string]: any;
}

function toAlert(rawAlert: RawAlert, index: number): Alert {
  return {
    id: `${rawAlert.type}-${rawAlert.sku || rawAlert.brand || index}`,
    type: rawAlert.type,
    severity: rawAlert.severity || 'info',
    title: rawAlert.brand || rawAlert.competitor || 'Mercado',
    description: rawAlert.message,
    timestamp: rawAlert.sku ? `SKU: ${rawAlert.sku}` : undefined,
    metadata: rawAlert
  };
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    danger: 'Crítico',
    warning: 'Atenção',
    success: 'Positivo',
    info: 'Informativo'
  };
  return labels[severity] || severity;
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    success: 'var(--success)',
    info: 'var(--info)'
  };
  return colors[severity] || 'var(--neutral)';
}

function getSeverityBg(severity: string): string {
  const colors: Record<string, string> = {
    danger: '#FEF2F2',
    warning: '#FFFBEB',
    success: '#F0FDF4',
    info: '#EFF6FF'
  };
  return colors[severity] || '#F9FAFB';
}

function getAlertIcon(type: string): string {
  const icons: Record<string, string> = {
    price_gap: '⚠️',
    market_share: '📊',
    price_trend: '📈',
    coverage: '🌐',
    category_performance: '🏆',
    brand_comparison: '⚔️',
    competitor_share: '🎯'
  };
  return icons[type] || 'ℹ️';
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<RawAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => {
        if (!res.ok) {
          throw new Error('Falha ao carregar alertas');
        }
        return res.json();
      })
      .then(data => {
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Falha ao carregar alertas');
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState message="Carregando inteligência competitiva..." />;
  if (error) return <ErrorState message={error} />;

  const dangerAlerts = alerts.filter(a => a.severity === 'danger').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
  const successAlerts = alerts.filter(a => a.severity === 'success').length;
  const infoAlerts = alerts.filter(a => a.severity === 'info').length;
  const convertedAlerts = alerts.map((a, i) => toAlert(a, i));

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Inteligência Competitiva"
        subtitle="Insights acionáveis para tomada de decisão estratégica"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      {/* KPIs */}
      <div className="grid grid-4 section-gap">
        <KPIWidget title="Total de Alertas" value={alerts.length} color="primary" />
        <KPIWidget title="Críticos" value={dangerAlerts} color="danger" />
        <KPIWidget title="Atenção" value={warningAlerts} color="warning" />
        <KPIWidget title="Oportunidades" value={successAlerts + infoAlerts} color="success" />
      </div>

      {/* Layout principal: Alertas Recentes + Resumo */}
      <div className="grid grid-70-30 section-gap" style={{ alignItems: 'stretch' }}>
        <DashboardCard title="Alertas Recentes">
          <AlertPanel alerts={convertedAlerts} maxItems={6} />
        </DashboardCard>

        <DashboardCard title="Resumo por Severidade">
          <div className="severity-stack">
            <div className="severity-card severity-danger">
              <div className="severity-label">Críticos</div>
              <div className="severity-value">{dangerAlerts}</div>
            </div>
            <div className="severity-card severity-warning">
              <div className="severity-label">Atenção</div>
              <div className="severity-value">{warningAlerts}</div>
            </div>
            <div className="severity-card severity-success">
              <div className="severity-label">Positivos</div>
              <div className="severity-value">{successAlerts}</div>
            </div>
            <div className="severity-card severity-info">
              <div className="severity-label">Informativos</div>
              <div className="severity-value">{infoAlerts}</div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Detalhes dos Alertas - Cards Compactos */}
      {alerts.length > 0 && (
        <DashboardCard title="Detalhes dos Alertas">
          <div className="alerts-details-grid">
            {alerts.map((alert, index) => {
              const severity = alert.severity || 'info';
              const icon = getAlertIcon(alert.type);

              return (
                <div
                  key={`${alert.type}-${alert.sku || alert.brand || index}`}
                  className="alert-detail-card"
                  style={{
                    borderLeftColor: getSeverityColor(severity),
                    background: getSeverityBg(severity)
                  }}
                >
                  {/* Cabeçalho compacto */}
                  <div className="alert-detail-header">
                    <span className="alert-detail-icon">{icon}</span>
                    <span className="alert-detail-brand">
                      {alert.brand || alert.competitor || 'Mercado'}
                      {alert.is_competitor && (
                        <span className="alert-detail-competitor-badge">Concorrente</span>
                      )}
                    </span>
                    <span
                      className="alert-detail-severity"
                      style={{ color: getSeverityColor(severity) }}
                    >
                      {getSeverityLabel(severity)}
                    </span>
                  </div>

                  {/* Mensagem - mais compacta */}
                  <div className="alert-detail-message">
                    {alert.message}
                  </div>

                  {/* Recomendação compacta */}
                  {alert.recommendation && (
                    <div className="alert-detail-recommendation">
                      <span className="alert-detail-recommendation-label">💡</span>
                      <span className="alert-detail-recommendation-text">
                        {alert.recommendation}
                      </span>
                    </div>
                  )}

                  {/* Métricas em linha - mais compactas */}
                  <div className="alert-detail-metrics">
                    {alert.target_price !== undefined && alert.target_price !== null && (
                      <span className="alert-detail-metric">
                        <span className="alert-detail-metric-label">Preço:</span>
                        <span className="alert-detail-metric-value" style={{ color: 'var(--success)' }}>
                          {alert.target_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </span>
                    )}

                    {alert.market_min !== undefined && alert.market_min !== null && (
                      <span className="alert-detail-metric">
                        <span className="alert-detail-metric-label">Mín:</span>
                        <span className="alert-detail-metric-value">
                          {alert.market_min.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </span>
                    )}

                    {alert.market_share !== undefined && alert.market_share !== null && (
                      <span className="alert-detail-metric">
                        <span className="alert-detail-metric-label">Share:</span>
                        <span className="alert-detail-metric-value" style={{ color: 'var(--primary)' }}>
                          {alert.market_share.toFixed(1)}%
                        </span>
                      </span>
                    )}

                    {alert.rank !== undefined && alert.rank !== null && (
                      <span className="alert-detail-metric">
                        <span className="alert-detail-metric-label">Pos:</span>
                        <span className="alert-detail-metric-value">
                          {alert.rank}º
                        </span>
                      </span>
                    )}

                    {alert.category && (
                      <span className="alert-detail-metric">
                        <span className="alert-detail-metric-label">Cat:</span>
                        <span className="alert-detail-metric-value" style={{ color: 'var(--primary)' }}>
                          {alert.category}
                        </span>
                      </span>
                    )}

                    {alert.sku && (
                      <span className="alert-detail-metric">
                        <span className="alert-detail-metric-label">SKU:</span>
                        <span className="alert-detail-metric-value" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                          {alert.sku}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      <style jsx>{`
        .alerts-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
        }

        .alert-detail-card {
          border: 1px solid var(--border);
          border-left-width: 3px;
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.2s ease;
          min-height: 80px;
        }

        .alert-detail-card:hover {
          box-shadow: var(--shadow-sm);
          transform: translateY(-1px);
        }

        .alert-detail-header {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .alert-detail-icon {
          font-size: 0.9rem;
          flex-shrink: 0;
          line-height: 1;
        }

        .alert-detail-brand {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: wrap;
        }

        .alert-detail-competitor-badge {
          font-size: 0.55rem;
          font-weight: 600;
          background: #FEF3C7;
          color: var(--warning);
          padding: 1px 6px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .alert-detail-severity {
          font-size: 0.6rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 1px 8px;
          border-radius: var(--radius-full);
          background: white;
          margin-left: auto;
          flex-shrink: 0;
        }

        .alert-detail-message {
          font-size: 0.78rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .alert-detail-recommendation {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-sm);
          padding: 6px 10px;
          font-size: 0.72rem;
        }

        .alert-detail-recommendation-label {
          flex-shrink: 0;
          font-size: 0.8rem;
        }

        .alert-detail-recommendation-text {
          color: #1E40AF;
          line-height: 1.3;
        }

        .alert-detail-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 12px;
          padding-top: 4px;
          border-top: 1px solid var(--border);
        }

        .alert-detail-metric {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 0.7rem;
          white-space: nowrap;
        }

        .alert-detail-metric-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .alert-detail-metric-value {
          color: var(--text-primary);
          font-weight: 600;
        }

        /* Responsividade */
        @media (max-width: 1024px) {
          .alerts-details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .alert-detail-card {
            padding: 8px 10px;
          }

          .alert-detail-header {
            gap: 4px;
          }

          .alert-detail-severity {
            margin-left: 0;
          }

          .alert-detail-metrics {
            gap: 4px 8px;
          }

          .alert-detail-metric {
            font-size: 0.65rem;
          }
        }

        @media (max-width: 480px) {
          .alert-detail-card {
            padding: 8px;
          }

          .alert-detail-message {
            font-size: 0.72rem;
          }
        }
      `}</style>
    </div>
  );
}