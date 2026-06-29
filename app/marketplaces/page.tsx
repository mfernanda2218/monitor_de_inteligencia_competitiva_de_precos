// app/marketplaces/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { TARGET_BRAND, BENCHMARK_BRAND } from '../config/brands';
import PageHeader from '../components/layout/PageHeader';
import AnalyticsTable from '../components/ui/AnalyticsTable';
import StatusBadge from '../components/ui/StatusBadge';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import FiltersBar from '../components/ui/FiltersBar';
import { useFilters } from '../hooks/useFilters';
import { FiltersState } from '../types/filters';

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

interface FilterOption {
  value: string;
  label: string;
}

export default function MarketplacesPage() {
  const { filters, setFilters, clearFilters } = useFilters();

  const [marketplaces, setMarketplaces] = useState<MarketplaceData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    marketplaces: FilterOption[];
    brands: FilterOption[];
  }>({
    marketplaces: [],
    brands: [],
  });

  // Carregar opções de filtro
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [marketplacesRes, brandsRes] = await Promise.all([
          fetch('/api/marketplaces'),
          fetch('/api/brands')
        ]);

        const marketplacesData = await marketplacesRes.json();
        const brandsData = await brandsRes.json();

        setFilterOptions({
          marketplaces: Object.keys(marketplacesData || {}).map(k => ({ value: k, label: k })),
          brands: Object.keys(brandsData || {}).map(k => ({ value: k, label: k })),
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchOptions();
  }, []);

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [marketplacesData, summaryData] = await Promise.all([
          fetch('/api/marketplaces').then(res => res.json()),
          fetch('/api/summary').then(res => res.json())
        ]);

        setMarketplaces(marketplacesData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar dados de marketplaces');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar dados
  const filteredMarketplaces = useMemo(() => {
    if (!marketplaces || !summary) return [];

    const marketplacesArray = Object.entries(marketplaces).map(([name, data]) => ({
      name,
      ...data,
      market_share: ((data.count / summary.total_records) * 100),
    }));

    let filtered = marketplacesArray;

    // Filtro de marketplaces
    if (filters.marketplaces.length > 0) {
      filtered = filtered.filter(mp =>
        filters.marketplaces.some(f => f.toUpperCase() === mp.name.toUpperCase())
      );
    }

    // Filtro de marcas
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(mp =>
        mp.brands.some(b => filters.brands!.some(f => f.toUpperCase() === b.toUpperCase()))
      );
    }

    // Filtro Samsung apenas
    if (filters.targetBrandOnly) {
      filtered = filtered.filter(mp =>
        mp.brands.some(b => b.toUpperCase() === TARGET_BRAND.toUpperCase())
      );
    }

    // Filtro de preço
    if (filters.minPrice !== null) {
      filtered = filtered.filter(mp => mp.avg_spot_price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter(mp => mp.avg_spot_price <= filters.maxPrice!);
    }

    // Filtro de market share
    if (filters.minMarketShare !== null) {
      filtered = filtered.filter(mp => mp.market_share >= filters.minMarketShare!);
    }

    // Filtro de registros
    if (filters.minRecords !== null) {
      filtered = filtered.filter(mp => mp.count >= filters.minRecords!);
    }

    // Filtro de marcas mínimas
    if (filters.minBrands !== null) {
      filtered = filtered.filter(mp => mp.brand_count >= filters.minBrands!);
    }

    // Ordenação
    const orderByMap: Record<string, keyof typeof filtered[0]> = {
      marketShare: 'market_share',
      avgPrice: 'avg_spot_price',
      count: 'count',
      brandCount: 'brand_count',
      minPrice: 'min_spot_price',
      maxPrice: 'max_spot_price',
    };

    const sortKey = orderByMap[filters.orderBy] || 'market_share';
    const direction = filters.orderDirection === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * direction;
      }
      return String(aVal).localeCompare(String(bVal)) * direction;
    });

    return filtered;
  }, [marketplaces, summary, filters]);

  const handleFilterChange = (newFilters: Partial<FiltersState>) => {
    setFilters(newFilters);
  };

  if (loading) return <LoadingState message="Carregando análise de marketplaces..." />;
  if (error) return <ErrorState message={error} />;

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

  const totalMarketplaces = filteredMarketplaces.length;
  const targetCoverage = filteredMarketplaces.filter(mp => mp.brands.includes(TARGET_BRAND)).length;
  const benchmarkCoverage = filteredMarketplaces.filter(mp => mp.brands.includes(BENCHMARK_BRAND)).length;
  const avgGlobalPrice = filteredMarketplaces.length > 0
    ? filteredMarketplaces.reduce((acc, mp) => acc + mp.avg_spot_price, 0) / filteredMarketplaces.length
    : 0;

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Análise de Marketplaces"
        subtitle="Desempenho, cobertura e market share por canal"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <FiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        options={{
          marketplaces: filterOptions.marketplaces,
          categories: [],
          brands: filterOptions.brands,
        }}
        mode="marketplaces"
        totalResults={totalMarketplaces}
        isLoading={loading}
      />

      <div className="grid grid-3 section-gap">
        <KPIWidget
          title="Total de Marketplaces"
          value={totalMarketplaces}
          color="primary"
        />
        {filteredMarketplaces.length > 0 && (
          <KPIWidget
            title="Marketplace Líder"
            value={filteredMarketplaces[0].name}
            subtitle={`${filteredMarketplaces[0].market_share.toFixed(1)}% market share`}
            color="success"
          />
        )}
        <KPIWidget
          title={`Cobertura ${TARGET_BRAND}`}
          value={`${targetCoverage}/${totalMarketplaces}`}
          subtitle={`${totalMarketplaces > 0 ? ((targetCoverage / totalMarketplaces) * 100).toFixed(0) : 0}% dos canais`}
          color="info"
        />
      </div>

      <DashboardCard className="section-gap" padding="sm">
        {filteredMarketplaces.length > 0 ? (
          <AnalyticsTable
            columns={tableColumns}
            data={filteredMarketplaces}
            pageSize={6}
          />
        ) : (
          <div className="empty-chart" style={{ minHeight: '200px' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: 500, color: '#111827' }}>
                Nenhum marketplace encontrado
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '4px' }}>
                Tente ajustar os filtros para ver mais resultados
              </div>
            </div>
          </div>
        )}
      </DashboardCard>

      <div className="grid grid-2">
        <DashboardCard title="Insights Executivos">
          <div style={{ color: '#374151', lineHeight: 1.8 }}>
            {filteredMarketplaces.length > 0 && (
              <>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Marketplace Líder:</strong> {filteredMarketplaces[0].name} com {filteredMarketplaces[0].market_share.toFixed(1)}% de market share
                </p>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Cobertura {TARGET_BRAND}:</strong> Presente em {targetCoverage} de {totalMarketplaces} marketplaces
                </p>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#D97706' }}>Cobertura {BENCHMARK_BRAND}:</strong> Presente em {benchmarkCoverage} de {totalMarketplaces} marketplaces
                </p>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Preço Médio Global:</strong> R$ {avgGlobalPrice.toFixed(2)}
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Marketplaces com {TARGET_BRAND}:</strong> {filteredMarketplaces.filter(mp => mp.brands.includes(TARGET_BRAND)).map(mp => mp.name).join(', ') || 'Nenhum'}
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