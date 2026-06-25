'use client';

import { useEffect, useState } from 'react';
import { TARGET_BRAND, BENCHMARK_BRAND } from '../config/brands';
import PageHeader from '../components/layout/PageHeader';
import AlertPanel, { Alert } from '../components/ui/AlertPanel';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';

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

  if (loading) return <LoadingState message="Carregando inteligência competitiva..." />;
  if (error) return <ErrorState message={error} />;

  const dangerAlerts = alerts?.filter(a => a.severity === 'danger').length || 0;
  const warningAlerts = alerts?.filter(a => a.severity === 'warning').length || 0;
  const successAlerts = alerts?.filter(a => a.severity === 'success').length || 0;

  const convertedAlerts = alerts?.map((alert: any, index: number) => ({
    id: String(index),
    type: alert.type,
    severity: alert.severity,
    title: alert.brand,
    description: alert.message,
    timestamp: alert.sku ? `SKU: ${alert.sku}` : undefined,
    metadata: {
      recommendation: alert.recommendation,
      target_price: alert.target_price,
      market_min: alert.market_min,
      premium_vs_min: alert.premium_vs_min,
      target_avg_price: alert.target_avg_price,
      benchmark_avg_price: alert.benchmark_avg_price,
      price_difference_pct: alert.price_difference_pct,
      market_share: alert.market_share,
      avg_price: alert.avg_price,
      price_variation: alert.price_variation,
      trend_direction: alert.trend_direction,
      category: alert.category
    }
  })) || [];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <PageHeader
        title="Inteligência Competitiva"
        subtitle="Insights acionáveis para tomada de decisão estratégica"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        <KPIWidget
          title="Total de Alertas"
          value={alerts?.length || 0}
          color="primary"
        />
        <KPIWidget
          title="Críticos"
          value={dangerAlerts}
          color="danger"
        />
        <KPIWidget
          title="Oportunidades"
          value={successAlerts}
          color="success"
        />
      </div>

      <div className="grid grid-70-30" style={{ marginBottom: '32px' }}>
        <DashboardCard title="Alertas Recentes">
          <AlertPanel 
            alerts={convertedAlerts}
            maxItems={10}
            onAlertClick={(alert) => console.log('Alert clicked:', alert)}
          />
        </DashboardCard>

        <DashboardCard title="Resumo por Severidade">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#FEE2E2',
              border: '1px solid #FECACA'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginBottom: '4px' }}>
                CRÍTICOS
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#DC2626' }}>
                {dangerAlerts}
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#FEF3C7',
              border: '1px solid #FDE68A'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, marginBottom: '4px' }}>
                ATENÇÃO
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#D97706' }}>
                {warningAlerts}
              </div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#DCFCE7',
              border: '1px solid #BBF7D0'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginBottom: '4px' }}>
                POSITIVOS
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#059669' }}>
                {successAlerts}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      {alerts && alerts.length > 0 && (
        <DashboardCard title="Detalhes dos Alertas">
          <div className="grid grid-2">
            {alerts.map((alert: any, index: number) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderLeft: `4px solid ${
                    alert.severity === 'danger' ? '#DC2626' : 
                    alert.severity === 'warning' ? '#D97706' : '#059669'
                  }`
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>
                    {alert.brand}
                    {alert.sku && <span style={{ marginLeft: '8px' }}>• {alert.sku}</span>}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                    {alert.message}
                  </div>
                </div>

                {alert.recommendation && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginBottom: '4px' }}>
                      💡 Recomendação
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#1E40AF' }}>
                      {alert.recommendation}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  {alert.target_price && alert.market_min && (
                    <div style={{ marginBottom: '4px' }}>
                      <span>Preço {TARGET_BRAND}: </span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>R$ {alert.target_price.toFixed(2)}</span>
                      <span style={{ marginLeft: '8px' }}>| Mínimo: R$ {alert.market_min.toFixed(2)}</span>
                    </div>
                  )}
                  {alert.market_share && (
                    <div style={{ marginBottom: '4px' }}>
                      <span>Market Share: </span>
                      <span style={{ color: '#2563EB', fontWeight: 600 }}>{alert.market_share.toFixed(1)}%</span>
                    </div>
                  )}
                  {alert.category && (
                    <div>
                      <span>Categoria: </span>
                      <span style={{ color: '#2563EB', fontWeight: 600 }}>{alert.category}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
