'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TARGET_BRAND, BENCHMARK_BRAND } from './config/brands';
import PageHeader from './components/layout/PageHeader';
import KPIWidget from './components/ui/KPIWidget';
import DashboardCard from './components/ui/DashboardCard';
import Button from './components/ui/Button';
import LoadingState from './components/shared/LoadingState';
import ErrorState from './components/shared/ErrorState';

interface Summary {
  total_records: number;
  total_brands: number;
  total_marketplaces: number;
  total_categories: number;
  total_skus: number;
  processed_at: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados');
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState message="Carregando dashboard..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <PageHeader
        title="Monitor de Inteligência de Preços"
        subtitle={`Dashboard de análise competitiva de preços • Última atualização: ${summary?.processed_at ? new Date(summary.processed_at).toLocaleString() : 'N/A'}`}
      />

      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        <KPIWidget
          title="Total de Registros"
          value={summary?.total_records || 0}
          color="primary"
        />
        <KPIWidget
          title="Marcas"
          value={summary?.total_brands || 0}
          color="info"
        />
        <KPIWidget
          title="Marketplaces"
          value={summary?.total_marketplaces || 0}
          color="success"
        />
        <KPIWidget
          title="SKUs Acompanhados"
          value={summary?.total_skus || 0}
          color="warning"
        />
      </div>

      <div className="grid grid-70-30" style={{ marginBottom: '32px' }}>
        <DashboardCard title="Ações Rápidas">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button href="/brands" variant="primary">
              Analisar Marcas →
            </Button>
            <Button href="/marketplaces" variant="secondary">
              Ver Marketplaces →
            </Button>
            <Button href="/alerts" variant="secondary">
              Ver Alertas →
            </Button>
            <Button href="/timeline" variant="secondary">
              Linha do Tempo de Preços →
            </Button>
          </div>
        </DashboardCard>

        <DashboardCard title="Categorias">
          <div style={{ color: '#6B7280' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#6B7280' }}>Total de Categorias: </span>
              <span style={{ color: '#059669', fontWeight: 600 }}>
                {summary?.total_categories || 0}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              Explore a análise detalhada de categorias nas seções dedicadas.
            </p>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Resumo Executivo" style={{ marginBottom: '32px' }}>
        <p style={{ color: '#374151', lineHeight: 1.8, margin: 0 }}>
          Este dashboard fornece inteligência competitiva em tempo real sobre preços em múltiplos marketplaces.
          Monitore <strong>{summary?.total_records?.toLocaleString() || 0}</strong> pontos de preço de <strong>{summary?.total_brands || 0}</strong> marcas
          em <strong>{summary?.total_marketplaces || 0}</strong> marketplaces. Use a navegação acima para mergulhar mais fundo em
          desempenho específico de marcas, cobertura de marketplaces e alertas de preços.
        </p>
      </DashboardCard>

      <DashboardCard 
        title={`⚔️ ${TARGET_BRAND} vs ${BENCHMARK_BRAND}`}
        style={{ border: '2px solid #2563EB' }}
      >
        <div style={{ color: '#374151', lineHeight: 1.8, marginBottom: '20px' }}>
          <p style={{ marginBottom: '12px', margin: 0 }}>
            <strong style={{ color: '#059669' }}>Foco:</strong> Análise competitiva focada em {TARGET_BRAND} com {BENCHMARK_BRAND} como benchmark principal
          </p>
          <p style={{ marginBottom: '12px', margin: 0 }}>
            <strong style={{ color: '#D97706' }}>Objetivo:</strong> Identificar oportunidades de precificação e posicionamento de mercado para {TARGET_BRAND}
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: '#2563EB' }}>Métricas:</strong> Market share, posicionamento de preço, cobertura de marketplace e tendências competitivas
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button href="/brands" variant="primary">
            Ver Comparativo Detalhado →
          </Button>
          <Button href="/alerts" variant="secondary">
            Ver Alertas {TARGET_BRAND} →
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
}
