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
  const convertedAlerts = alerts.map(toAlert);

  return (
    <div className="container page-shell">
      <PageHeader
        title="Inteligência Competitiva"
        subtitle="Insights acionáveis para tomada de decisão estratégica"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <div className="grid grid-4 section-gap">
        <KPIWidget title="Total de Alertas" value={alerts.length} color="primary" />
        <KPIWidget title="Críticos" value={dangerAlerts} color="danger" />
        <KPIWidget title="Atenção" value={warningAlerts} color="warning" />
        <KPIWidget title="Oportunidades" value={successAlerts + infoAlerts} color="success" />
      </div>

      <div className="grid grid-70-30 section-gap">
        <DashboardCard title="Alertas Recentes">
          <AlertPanel alerts={convertedAlerts} maxItems={10} />
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

      {alerts.length > 0 && (
        <DashboardCard title="Detalhes dos Alertas">
          <div className="grid grid-2">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.type}-${alert.sku || alert.brand || index}`}
                className={`alert-detail alert-${alert.severity || 'info'}`}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '4px' }}>
                    {alert.brand || alert.competitor || 'Mercado'}
                    {alert.sku && <span style={{ marginLeft: '8px' }}>- {alert.sku}</span>}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>
                    {alert.message}
                  </div>
                </div>

                {alert.recommendation && (
                  <div className="recommendation-box">
                    <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600, marginBottom: '4px' }}>
                      Recomendação
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
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        {alert.target_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span style={{ marginLeft: '8px' }}>
                        | Mínimo: {alert.market_min.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  )}
                  {alert.market_share && (
                    <div style={{ marginBottom: '4px' }}>
                      <span>Market share: </span>
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
