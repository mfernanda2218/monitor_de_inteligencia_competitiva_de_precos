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

interface BrandData {
  [key: string]: {
    count: number;
    avg_spot_price: number;
    min_spot_price: number;
    max_spot_price: number;
    price_variation: number;
    marketplace_coverage: number;
    marketplaces: string[];
  };
}

interface Summary {
  total_records: number;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/brands').then(res => res.json()),
      fetch('/api/summary').then(res => res.json())
    ])
      .then(([brandsData, summaryData]) => {
        setBrands(brandsData);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados de marcas');
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState message="Carregando análise de marcas..." />;
  if (error) return <ErrorState message={error} />;

  const brandsArray = brands ? Object.entries(brands).map(([name, data]) => ({
    name,
    ...data,
    market_share: summary ? ((data.count / summary.total_records) * 100) : 0
  })) : [];

  brandsArray.sort((a, b) => b.market_share - a.market_share);

  const getMarketShareColor = (share: number) => {
    if (share > 10) return 'success';
    if (share > 5) return 'warning';
    return 'neutral';
  };

  const tableColumns = [
    {
      key: 'name',
      header: 'Marca',
      width: '22%',
      minWidth: '180px',
      render: (value: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: '#111827' }}>
            {value}
          </span>
          {value.toUpperCase() === TARGET_BRAND.toUpperCase() && (
            <StatusBadge variant="success" size="sm">★</StatusBadge>
          )}
        </div>
      )
    },
    {
      key: 'market_share',
      header: 'Market Share',
      width: '13%',
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
      width: '11%',
      minWidth: '116px',
      align: 'right' as const,
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'avg_spot_price',
      header: 'Preço Médio',
      width: '13%',
      minWidth: '132px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'min_spot_price',
      header: 'Preço Mín',
      width: '11%',
      minWidth: '116px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'max_spot_price',
      header: 'Preço Máx',
      width: '11%',
      minWidth: '116px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'price_variation',
      header: 'Variação',
      width: '10%',
      minWidth: '112px',
      align: 'right' as const,
      render: (value: number) => `R$ ${value.toFixed(2)}`
    },
    {
      key: 'marketplace_coverage',
      header: 'Cobertura',
      width: '9%',
      minWidth: '112px',
      align: 'center' as const,
      render: (value: number) => (
        <StatusBadge variant="info">{value} MPs</StatusBadge>
      )
    }
  ];

  const targetBrand = brandsArray.find(b => b.name.toUpperCase() === TARGET_BRAND.toUpperCase());
  const benchmarkBrand = brandsArray.find(b => b.name.toUpperCase() === BENCHMARK_BRAND.toUpperCase());

  return (
    <div className="container page-shell">
      <PageHeader
        title="Análise de Marcas"
        subtitle="Posicionamento competitivo e market share por marca"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <div className="grid grid-3 section-gap">
        <KPIWidget
          title="Total de Marcas"
          value={brandsArray.length}
          color="primary"
        />
        {brandsArray.length > 0 && (
          <KPIWidget
            title="Líder de Mercado"
            value={brandsArray[0].name}
            subtitle={`${brandsArray[0].market_share.toFixed(1)}% market share`}
            color="success"
          />
        )}
        {targetBrand && (
          <KPIWidget
            title={`Posição ${TARGET_BRAND}`}
            value={`${brandsArray.findIndex(b => b.name.toUpperCase() === TARGET_BRAND.toUpperCase()) + 1}º`}
            subtitle={`${targetBrand.market_share.toFixed(1)}% market share`}
            color="info"
          />
        )}
      </div>

      <DashboardCard className="section-gap" padding="sm">
        <AnalyticsTable
          columns={tableColumns}
          data={brandsArray}
          pageSize={6}
        />
      </DashboardCard>

      <div className="grid grid-2">
        <DashboardCard title="Insights Executivos">
          <div style={{ color: '#374151', lineHeight: 1.8 }}>
            {brandsArray.length > 0 && (
              <>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Líder de Mercado:</strong> {brandsArray[0].name} com {brandsArray[0].market_share.toFixed(1)}% de market share
                </p>
                {targetBrand && (
                  <p style={{ marginBottom: '12px', margin: 0 }}>
                    <strong style={{ color: '#059669' }}>Posição {TARGET_BRAND}:</strong> {
                      brandsArray.findIndex(b => b.name.toUpperCase() === TARGET_BRAND.toUpperCase()) + 1
                    }º lugar com {targetBrand.market_share.toFixed(1)}% de market share
                  </p>
                )}
                {benchmarkBrand && (
                  <p style={{ marginBottom: '12px', margin: 0 }}>
                    <strong style={{ color: '#D97706' }}>{BENCHMARK_BRAND} (Benchmark):</strong> {
                      brandsArray.findIndex(b => b.name.toUpperCase() === BENCHMARK_BRAND.toUpperCase()) + 1
                    }º lugar com {benchmarkBrand.market_share.toFixed(1)}% de market share
                  </p>
                )}
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Total de Marcas:</strong> {brandsArray.length} marcas monitoradas
                </p>
              </>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Recomendações">
          <div style={{ color: '#374151', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '12px', margin: 0 }}>
              • Monitorar posicionamento de {TARGET_BRAND} vs {BENCHMARK_BRAND} e mercado
            </p>
            <p style={{ marginBottom: '12px', margin: 0 }}>
              • Investigar marcas com alta variação de preço para entender estratégias dinâmicas
            </p>
            <p style={{ margin: 0 }}>
              • Expandir cobertura de marketplaces para {TARGET_BRAND} onde tiver baixa penetração
            </p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
