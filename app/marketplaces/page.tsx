'use client';

import { useEffect, useState } from 'react';
import { TARGET_BRAND, BENCHMARK_BRAND } from '../config/brands';
import PageHeader from '../components/layout/PageHeader';
import AnalyticsTable from '../components/ui/AnalyticsTable';
import StatusBadge from '../components/ui/StatusBadge';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';

interface MarketplaceData {
  [key: string]: {
    count: number;
    avg_spot_price: number;
    min_spot_price: number;
    max_spot_price: number;
    brand_count: number;
    brands: string[];
  };
}

interface Summary {
  total_records: number;
}

export default function MarketplacesPage() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/marketplaces').then(res => res.json()),
      fetch('/api/summary').then(res => res.json())
    ])
      .then(([marketplacesData, summaryData]) => {
        setMarketplaces(marketplacesData);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados de marketplaces');
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState message="Carregando análise de marketplaces..." />;
  if (error) return <ErrorState message={error} />;

  const marketplacesArray = marketplaces ? Object.entries(marketplaces).map(([name, data]) => ({
    name,
    ...data,
    market_share: summary ? ((data.count / summary.total_records) * 100) : 0
  })) : [];

  marketplacesArray.sort((a, b) => b.market_share - a.market_share);

  const getMarketShareColor = (share: number) => {
    if (share > 20) return 'success';
    if (share > 10) return 'warning';
    return 'neutral';
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Marketplace',
      width: '28%',
      minWidth: '220px',
      render: (value: string, row: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>
            {value}
          </span>
          {row.brands.includes(TARGET_BRAND) && (
            <StatusBadge variant="success" size="sm">★ {TARGET_BRAND}</StatusBadge>
          )}
          {row.brands.includes(BENCHMARK_BRAND) && (
            <StatusBadge variant="warning" size="sm">★ {BENCHMARK_BRAND}</StatusBadge>
          )}
        </div>
      )
    },
    {
      key: 'market_share',
      header: 'Market Share',
      width: '14%',
      minWidth: '132px',
      align: 'right' as const,
      render: (value: number) => (
        <StatusBadge variant={getMarketShareColor(value)}>
          {value.toFixed(1)}%
        </StatusBadge>
      )
    },
    {
      key: 'count',
      header: 'Registros',
      width: '12%',
      minWidth: '116px',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'avg_spot_price',
      header: 'Preço Médio',
      width: '14%',
      minWidth: '132px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'min_spot_price',
      header: 'Preço Mín',
      width: '12%',
      minWidth: '116px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'max_spot_price',
      header: 'Preço Máx',
      width: '12%',
      minWidth: '116px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'brand_count',
      header: 'Marcas',
      width: '8%',
      minWidth: '104px',
      align: 'center' as const,
      render: (value: number) => (
        <StatusBadge variant="info">{value} marcas</StatusBadge>
      )
    }
  ];

  const targetCoverage = marketplacesArray.filter(mp => mp.brands.includes(TARGET_BRAND)).length;
  const benchmarkCoverage = marketplacesArray.filter(mp => mp.brands.includes(BENCHMARK_BRAND)).length;
  const avgGlobalPrice = marketplacesArray.length > 0 
    ? marketplacesArray.reduce((acc, mp) => acc + mp.avg_spot_price, 0) / marketplacesArray.length 
    : 0;

  return (
    <div className="container page-shell">
      <PageHeader
        title="Análise de Marketplaces"
        subtitle="Desempenho, cobertura e market share por canal"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <div className="grid grid-3 section-gap">
        <KPIWidget
          title="Total de Marketplaces"
          value={marketplacesArray.length}
          color="primary"
        />
        {marketplacesArray.length > 0 && (
          <KPIWidget
            title="Marketplace Líder"
            value={marketplacesArray[0].name}
            subtitle={`${marketplacesArray[0].market_share.toFixed(1)}% market share`}
            color="success"
          />
        )}
        <KPIWidget
          title={`Cobertura ${TARGET_BRAND}`}
          value={`${targetCoverage}/${marketplacesArray.length}`}
          subtitle={`${((targetCoverage / marketplacesArray.length) * 100).toFixed(0)}% dos canais`}
          color="info"
        />
      </div>

      <DashboardCard className="section-gap">
        <AnalyticsTable
          columns={tableColumns}
          data={marketplacesArray}
        />
      </DashboardCard>

      <div className="grid grid-2">
        <DashboardCard title="Insights Executivos">
          <div style={{ color: '#374151', lineHeight: 1.8 }}>
            {marketplacesArray.length > 0 && (
              <>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Marketplace Líder:</strong> {marketplacesArray[0].name} com {marketplacesArray[0].market_share.toFixed(1)}% de market share
                </p>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Cobertura {TARGET_BRAND}:</strong> Presente em {targetCoverage} de {marketplacesArray.length} marketplaces
                </p>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#D97706' }}>Cobertura {BENCHMARK_BRAND}:</strong> Presente em {benchmarkCoverage} de {marketplacesArray.length} marketplaces
                </p>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Preço Médio Global:</strong> R$ {avgGlobalPrice.toFixed(2)}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Marketplaces com {TARGET_BRAND}:</strong> {marketplacesArray.filter(mp => mp.brands.includes(TARGET_BRAND)).map(mp => mp.name).join(', ') || 'Nenhum'}
                </p>
              </>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Recomendações">
          <div style={{ color: '#374151', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '12px', margin: 0 }}>
              • Priorizar marketplaces com market share {'>'} 20% para campanhas promocionais de {TARGET_BRAND}
            </p>
            <p style={{ marginBottom: '12px', margin: 0 }}>
              • Expandir presença de {TARGET_BRAND} em marketplaces onde {BENCHMARK_BRAND} está presente mas {TARGET_BRAND} não
            </p>
            <p style={{ marginBottom: '12px', margin: 0 }}>
              • Analisar marketplaces com preços médios mais altos para estratégias premium de {TARGET_BRAND}
            </p>
            <p style={{ margin: 0 }}>
              • Monitorar marketplaces com alta variação de preço para detectar promoções competitivas de {BENCHMARK_BRAND}
            </p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
