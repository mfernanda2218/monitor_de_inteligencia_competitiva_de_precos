// app/brands/page.tsx
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
import { useFilters } from '../contexts/FilterContext';

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

interface FilterOption {
  value: string;
  label: string;
}

interface BrandItem {
  name: string;
  count: number;
  avg_spot_price: number;
  min_spot_price: number;
  max_spot_price: number;
  price_variation: number;
  marketplace_coverage: number;
  marketplaces: string[];
  market_share: number;
}

export default function BrandsPage() {
  const { filters, setFilters, clearFilters } = useFilters();

  const [brands, setBrands] = useState<BrandData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<{
    marketplaces: FilterOption[];
    categories: FilterOption[];
  }>({
    marketplaces: [],
    categories: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [marketplacesRes, categoriesRes] = await Promise.all([
          fetch('/api/marketplaces'),
          fetch('/api/categories')
        ]);

        const marketplacesData = await marketplacesRes.json();
        const categoriesData = await categoriesRes.json();

        setFilterOptions({
          marketplaces: Object.keys(marketplacesData || {}).map((k: string) => ({ value: k, label: k })),
          categories: Object.keys(categoriesData || {}).map((k: string) => ({ value: k, label: k })),
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [brandsData, summaryData] = await Promise.all([
          fetch('/api/brands').then(res => res.json()),
          fetch('/api/summary').then(res => res.json())
        ]);

        setBrands(brandsData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar dados de marcas');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBrands = useMemo((): BrandItem[] => {
    if (!brands || !summary) return [];

    const brandsArray: BrandItem[] = Object.entries(brands).map(([name, data]) => ({
      name,
      ...data,
      market_share: ((data.count / summary.total_records) * 100),
    }));

    let filtered = brandsArray;

    if (filters.marketplaces.length > 0) {
      filtered = filtered.filter((brand) =>
        brand.marketplaces.some((mp: string) =>
          filters.marketplaces.some((f: string) => f.toUpperCase() === mp.toUpperCase())
        )
      );
    }

    if (filters.targetBrandOnly) {
      filtered = filtered.filter((brand) =>
        brand.name.toUpperCase() === TARGET_BRAND.toUpperCase()
      );
    }

    if (filters.minPrice !== null) {
      filtered = filtered.filter((brand) => brand.avg_spot_price >= filters.minPrice!);
    }
    if (filters.maxPrice !== null) {
      filtered = filtered.filter((brand) => brand.avg_spot_price <= filters.maxPrice!);
    }

    if (filters.minMarketShare !== null) {
      filtered = filtered.filter((brand) => brand.market_share >= filters.minMarketShare!);
    }

    if (filters.minRecords !== null) {
      filtered = filtered.filter((brand) => brand.count >= filters.minRecords!);
    }

    const orderByMap: Record<string, keyof BrandItem> = {
      marketShare: 'market_share',
      avgPrice: 'avg_spot_price',
      count: 'count',
      coverage: 'marketplace_coverage',
      minPrice: 'min_spot_price',
      maxPrice: 'max_spot_price',
      priceVariation: 'price_variation',
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
  }, [brands, summary, filters]);

  if (loading) return <LoadingState message="Carregando análise de marcas..." />;
  if (error) return <ErrorState message={error} />;

  const targetBrand = filteredBrands.find((b) => b.name.toUpperCase() === TARGET_BRAND.toUpperCase());
  const benchmarkBrand = filteredBrands.find((b) => b.name.toUpperCase() === BENCHMARK_BRAND.toUpperCase());

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
          {value.toUpperCase() === BENCHMARK_BRAND.toUpperCase() && (
            <StatusBadge variant="warning" size="sm">BM</StatusBadge>
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

  const totalBrands = filteredBrands.length;
  const totalRecords = filteredBrands.reduce((acc, b) => acc + b.count, 0);

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Análise de Marcas"
        subtitle="Posicionamento competitivo e market share por marca"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <FiltersBar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
        options={{
          marketplaces: filterOptions.marketplaces,
          categories: filterOptions.categories,
          brands: [],
        }}
        mode="brands"
        totalResults={totalBrands}
        isLoading={loading}
      />

      <div className="grid grid-3 section-gap">
        <KPIWidget
          title="Total de Marcas"
          value={totalBrands}
          color="primary"
        />
        {filteredBrands.length > 0 && (
          <KPIWidget
            title="Líder de Mercado"
            value={filteredBrands[0].name}
            subtitle={`${filteredBrands[0].market_share.toFixed(1)}% market share`}
            color="success"
          />
        )}
        {targetBrand && (
          <KPIWidget
            title={`Posição ${TARGET_BRAND}`}
            value={`${filteredBrands.findIndex((b) => b.name.toUpperCase() === TARGET_BRAND.toUpperCase()) + 1}º`}
            subtitle={`${targetBrand.market_share.toFixed(1)}% market share`}
            color="info"
          />
        )}
      </div>

      <DashboardCard className="section-gap" padding="sm">
        {filteredBrands.length > 0 ? (
          <AnalyticsTable
            columns={tableColumns}
            data={filteredBrands}
            pageSize={6}
          />
        ) : (
          <div className="empty-chart" style={{ minHeight: '200px' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: 500, color: '#111827' }}>
                Nenhuma marca encontrada
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
            {filteredBrands.length > 0 && (
              <>
                <p style={{ marginBottom: '12px', margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Líder de Mercado:</strong> {filteredBrands[0].name} com {filteredBrands[0].market_share.toFixed(1)}% de market share
                </p>
                {targetBrand && (
                  <p style={{ marginBottom: '12px', margin: 0 }}>
                    <strong style={{ color: '#059669' }}>Posição {TARGET_BRAND}:</strong> {
                      filteredBrands.findIndex((b) => b.name.toUpperCase() === TARGET_BRAND.toUpperCase()) + 1
                    }º lugar com {targetBrand.market_share.toFixed(1)}% de market share
                  </p>
                )}
                {benchmarkBrand && (
                  <p style={{ marginBottom: '12px', margin: 0 }}>
                    <strong style={{ color: '#D97706' }}>{BENCHMARK_BRAND} (Benchmark):</strong> {
                      filteredBrands.findIndex((b) => b.name.toUpperCase() === BENCHMARK_BRAND.toUpperCase()) + 1
                    }º lugar com {benchmarkBrand.market_share.toFixed(1)}% de market share
                  </p>
                )}
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Total de Marcas:</strong> {totalBrands} marcas monitoradas
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#059669' }}>Total de Registros:</strong> {totalRecords.toLocaleString()}
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