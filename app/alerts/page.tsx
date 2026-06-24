'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Alert {
  type: string;
  brand: string;
  severity: string;
  message: string;
  avg_price?: number;
  price_variation?: number;
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

  if (loading) return <div className="loading">Carregando alertas...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Voltar ao Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Alertas de Preço
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Oportunidades e riscos competitivos
        </p>
      </header>

      {alerts && alerts.length > 0 ? (
        <div className="grid grid-2">
          {alerts.map((alert, index) => (
            <div key={index} className="card">
              <div style={{ marginBottom: '16px' }}>
                <span className={`badge badge-${alert.severity === 'danger' ? 'danger' : 'warning'}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span style={{ marginLeft: '8px', color: '#64748B', fontSize: '0.875rem' }}>
                  {alert.type}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#00FF88' }}>
                {alert.brand}
              </h3>
              <p style={{ color: '#E2E8F0', marginBottom: '16px' }}>
                {alert.message}
              </p>
              {alert.avg_price && (
                <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  <div>Preço Médio: R$ {alert.avg_price.toFixed(2)}</div>
                  {alert.price_variation && (
                    <div>Variação de Preço: R$ {alert.price_variation.toFixed(2)}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <p style={{ color: '#64748B', textAlign: 'center' }}>
            Nenhum alerta no momento. O sistema está monitorando anomalias de preços.
          </p>
        </div>
      )}
    </div>
  );
}
