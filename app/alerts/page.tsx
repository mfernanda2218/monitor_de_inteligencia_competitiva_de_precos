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
    danger: '#DC2626',
    warning: '#D97706',
    success: '#059669',
    info: '#0891B2'
  };
  return colors[severity] || '#6B7280';
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

function getSeverityIcon(severity: string): string {
  const icons: Record<string, string> = {
    danger: '🔴',
    warning: '🟡',
    success: '🟢',
    info: '🔵'
  };
  return icons[severity] || '⚪';
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

  // Dados para o resumo por severidade com cores
  const severitySummary = [
    {
      label: 'Críticos',
      value: dangerAlerts,
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      icon: '🔴',
      textColor: '#991B1B'
    },
    {
      label: 'Atenção',
      value: warningAlerts,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      icon: '🟡',
      textColor: '#92400E'
    },
    {
      label: 'Positivos',
      value: successAlerts,
      color: '#059669',
      bg: '#F0FDF4',
      border: '#A7F3D0',
      icon: '🟢',
      textColor: '#065F46'
    },
    {
      label: 'Informativos',
      value: infoAlerts,
      color: '#0891B2',
      bg: '#EFF6FF',
      border: '#93C5FD',
      icon: '🔵',
      textColor: '#1E40AF'
    }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Alertas - Samsung"
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
            {severitySummary.map((item) => (
              <div
                key={item.label}
                className="severity-card"
                style={{
                  background: item.bg,
                  borderLeft: `4px solid ${item.color}`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                  marginBottom: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: item.textColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {item.label}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: item.color,
                  lineHeight: 1
                }}>
                  {item.value}
                </div>
              </div>
            ))}

            {/* Barra de progresso visual */}
            {alerts.length > 0 && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.65rem',
                  color: '#6B7280',
                  marginBottom: '6px',
                  fontWeight: 500
                }}>
                  <span>Distribuição</span>
                  <span>{alerts.length} total</span>
                </div>
                <div style={{
                  display: 'flex',
                  height: '6px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  background: '#E5E7EB'
                }}>
                  {dangerAlerts > 0 && (
                    <div style={{
                      width: `${(dangerAlerts / alerts.length) * 100}%`,
                      background: '#DC2626',
                      transition: 'width 0.5s ease'
                    }} />
                  )}
                  {warningAlerts > 0 && (
                    <div style={{
                      width: `${(warningAlerts / alerts.length) * 100}%`,
                      background: '#D97706',
                      transition: 'width 0.5s ease'
                    }} />
                  )}
                  {successAlerts > 0 && (
                    <div style={{
                      width: `${(successAlerts / alerts.length) * 100}%`,
                      background: '#059669',
                      transition: 'width 0.5s ease'
                    }} />
                  )}
                  {infoAlerts > 0 && (
                    <div style={{
                      width: `${(infoAlerts / alerts.length) * 100}%`,
                      background: '#0891B2',
                      transition: 'width 0.5s ease'
                    }} />
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '6px',
                  flexWrap: 'wrap'
                }}>
                  {dangerAlerts > 0 && (
                    <span style={{ fontSize: '0.6rem', color: '#DC2626', fontWeight: 500 }}>
                      ● Críticos ({dangerAlerts})
                    </span>
                  )}
                  {warningAlerts > 0 && (
                    <span style={{ fontSize: '0.6rem', color: '#D97706', fontWeight: 500 }}>
                      ● Atenção ({warningAlerts})
                    </span>
                  )}
                  {successAlerts > 0 && (
                    <span style={{ fontSize: '0.6rem', color: '#059669', fontWeight: 500 }}>
                      ● Positivos ({successAlerts})
                    </span>
                  )}
                  {infoAlerts > 0 && (
                    <span style={{ fontSize: '0.6rem', color: '#0891B2', fontWeight: 500 }}>
                      ● Informativos ({infoAlerts})
                    </span>
                  )}
                </div>
              </div>
            )}
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
              const severityColor = getSeverityColor(severity);
              const severityBg = getSeverityBg(severity);
              const severityLabel = getSeverityLabel(severity);

              return (
                <div
                  key={`${alert.type}-${alert.sku || alert.brand || index}`}
                  className="alert-detail-card"
                  style={{
                    borderLeftColor: severityColor,
                    background: severityBg,
                    border: '1px solid var(--border)',
                    borderLeftWidth: '4px',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    minHeight: '80px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Cabeçalho compacto */}
                  <div className="alert-detail-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    <span className="alert-detail-icon" style={{ fontSize: '0.9rem', flexShrink: 0 }}>
                      {icon}
                    </span>
                    <span className="alert-detail-brand" style={{
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#111827',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexWrap: 'wrap'
                    }}>
                      {alert.brand || alert.competitor || 'Mercado'}
                      {alert.is_competitor && (
                        <span className="alert-detail-competitor-badge" style={{
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          background: '#FEF3C7',
                          color: '#D97706',
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          Concorrente
                        </span>
                      )}
                    </span>
                    <span
                      className="alert-detail-severity"
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 10px',
                        borderRadius: '9999px',
                        background: 'white',
                        color: severityColor,
                        border: `1px solid ${severityColor}`,
                        marginLeft: 'auto',
                        flexShrink: 0
                      }}
                    >
                      {severityLabel}
                    </span>
                  </div>

                  {/* Mensagem - mais compacta */}
                  <div className="alert-detail-message" style={{
                    fontSize: '0.78rem',
                    color: '#374151',
                    lineHeight: '1.4'
                  }}>
                    {alert.message}
                  </div>

                  {/* Recomendação compacta */}
                  {alert.recommendation && (
                    <div className="alert-detail-recommendation" style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '0.72rem'
                    }}>
                      <span className="alert-detail-recommendation-label" style={{
                        flexShrink: 0,
                        fontSize: '0.8rem'
                      }}>
                        💡
                      </span>
                      <span className="alert-detail-recommendation-text" style={{
                        color: '#1E40AF',
                        lineHeight: '1.3'
                      }}>
                        {alert.recommendation}
                      </span>
                    </div>
                  )}

                  {/* Métricas em linha - mais compactas */}
                  <div className="alert-detail-metrics" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px 12px',
                    paddingTop: '4px',
                    borderTop: '1px solid var(--border)'
                  }}>
                    {alert.target_price !== undefined && alert.target_price !== null && (
                      <span className="alert-detail-metric" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <span className="alert-detail-metric-label" style={{
                          color: '#6B7280',
                          fontWeight: 500
                        }}>
                          Preço:
                        </span>
                        <span className="alert-detail-metric-value" style={{
                          color: '#059669',
                          fontWeight: 600
                        }}>
                          {alert.target_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </span>
                    )}

                    {alert.market_min !== undefined && alert.market_min !== null && (
                      <span className="alert-detail-metric" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <span className="alert-detail-metric-label" style={{
                          color: '#6B7280',
                          fontWeight: 500
                        }}>
                          Mín:
                        </span>
                        <span className="alert-detail-metric-value" style={{
                          color: '#111827',
                          fontWeight: 600
                        }}>
                          {alert.market_min.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </span>
                    )}

                    {alert.market_share !== undefined && alert.market_share !== null && (
                      <span className="alert-detail-metric" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <span className="alert-detail-metric-label" style={{
                          color: '#6B7280',
                          fontWeight: 500
                        }}>
                          Share:
                        </span>
                        <span className="alert-detail-metric-value" style={{
                          color: '#2563EB',
                          fontWeight: 600
                        }}>
                          {alert.market_share.toFixed(1)}%
                        </span>
                      </span>
                    )}

                    {alert.rank !== undefined && alert.rank !== null && (
                      <span className="alert-detail-metric" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <span className="alert-detail-metric-label" style={{
                          color: '#6B7280',
                          fontWeight: 500
                        }}>
                          Pos:
                        </span>
                        <span className="alert-detail-metric-value" style={{
                          color: '#111827',
                          fontWeight: 600
                        }}>
                          {alert.rank}º
                        </span>
                      </span>
                    )}

                    {alert.category && (
                      <span className="alert-detail-metric" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <span className="alert-detail-metric-label" style={{
                          color: '#6B7280',
                          fontWeight: 500
                        }}>
                          Cat:
                        </span>
                        <span className="alert-detail-metric-value" style={{
                          color: '#2563EB',
                          fontWeight: 600
                        }}>
                          {alert.category}
                        </span>
                      </span>
                    )}

                    {alert.sku && (
                      <span className="alert-detail-metric" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.7rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <span className="alert-detail-metric-label" style={{
                          color: '#6B7280',
                          fontWeight: 500
                        }}>
                          SKU:
                        </span>
                        <span className="alert-detail-metric-value" style={{
                          fontFamily: 'monospace',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#111827'
                        }}>
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

        /* Animações suaves */
        .severity-card {
          transition: all 0.2s ease;
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