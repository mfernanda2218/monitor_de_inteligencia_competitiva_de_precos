// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { TARGET_BRAND, BENCHMARK_BRAND } from './config/brands';
import PageHeader from './components/layout/PageHeader';
import KPIWidget from './components/ui/KPIWidget';
import DashboardCard from './components/ui/DashboardCard';
import ChartCard from './components/ui/ChartCard';
import AlertPanel, { Alert } from './components/ui/AlertPanel';
import LoadingState from './components/shared/LoadingState';
import ErrorState from './components/shared/ErrorState';
import PriceLineChart from './components/charts/PriceLineChart';
import MarketShareBar from './components/charts/MarketShareBar';
import FiltersBar from './components/ui/FiltersBar';
import { useFilters } from './contexts/FilterContext';
import { FiltersState } from './types/filters';

interface Summary {
  total_records: number;
  total_brands: number;
  total_marketplaces: number;
  total_categories: number;
  total_skus: number;
  processed_at: string;
}

interface TimelinePoint {
  date: string;
  avg_price: number;
  min_price: number;
  max_price: number;
}

interface BrandData {
  brand: string;
  count: number;
  market_share: number;
  avg_price: number;
}

interface MarketplaceData {
  marketplace: string;
  avg_price: number;
  count?: number;
}

interface CategoryData {
  category: string;
  avg_price: number;
  count: number;
}

interface FilterOption {
  value: string;
  label: string;
}

function toAlert(rawAlert: any, index: number): Alert {
  return {
    id: `${rawAlert.type || 'alert'}-${rawAlert.sku || rawAlert.brand || index}`,
    type: rawAlert.type,
    severity: rawAlert.severity || 'info',
    title: rawAlert.brand || rawAlert.competitor || 'Mercado',
    description: rawAlert.message || 'Alerta sem descrição',
    timestamp: rawAlert.sku ? `SKU: ${rawAlert.sku}` : undefined,
    metadata: rawAlert
  };
}

// Função para construir URL com filtros
const buildFilteredUrl = (baseUrl: string, filters: FiltersState) => {
  const params = new URLSearchParams();

  if (filters.brands?.length > 0) {
    params.append('brands', filters.brands.join(','));
  }
  if (filters.marketplaces?.length > 0) {
    params.append('marketplaces', filters.marketplaces.join(','));
  }
  if (filters.categories?.length > 0) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters.alertSeverity?.length > 0) {
    params.append('severity', filters.alertSeverity.join(','));
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

export default function Dashboard() {
  const { filters, setFilters, clearFilters } = useFilters();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [brandData, setBrandData] = useState<BrandData[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topSkus, setTopSkus] = useState<string[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    marketplaces: FilterOption[];
    categories: FilterOption[];
    brands: FilterOption[];
  }>({
    marketplaces: [],
    categories: [],
    brands: [],
  });

  // Carregar opções de filtro
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [brandsRes, marketplacesRes, categoriesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/marketplaces'),
          fetch('/api/categories')
        ]);

        const brandsData = await brandsRes.json();
        const marketplacesData = await marketplacesRes.json();
        const categoriesData = await categoriesRes.json();

        setFilterOptions({
          brands: Object.keys(brandsData || {}).map((k: string) => ({ value: k, label: k })),
          marketplaces: Object.keys(marketplacesData || {}).map((k: string) => ({ value: k, label: k })),
          categories: Object.keys(categoriesData || {}).map((k: string) => ({ value: k, label: k })),
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchOptions();
  }, []);

  const fetchJson = async (url: string, defaultValue: any = null) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        return defaultValue;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return defaultValue;
    }
  };

  const loadTimeline = async (sku: string) => {
    if (!sku) {
      setTimelineData([]);
      return;
    }

    setLoadingTimeline(true);
    try {
      const url = buildFilteredUrl(`/api/timeline?sku=${encodeURIComponent(sku)}`, filters);
      const timeline = await fetchJson(url, []);
      setTimelineData(Array.isArray(timeline) ? timeline : []);
    } catch (err) {
      console.error('Error loading timeline:', err);
      setTimelineData([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Carregar dados quando os filtros mudarem
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          summaryData,
          alertsData,
          brandsData,
          marketplacesData,
          categoriesData,
          skusData
        ] = await Promise.all([
          fetchJson(buildFilteredUrl('/api/summary', filters), {}),
          fetchJson(buildFilteredUrl('/api/alerts', filters), []),
          fetchJson(buildFilteredUrl('/api/brands', filters), {}),
          fetchJson(buildFilteredUrl('/api/marketplaces', filters), {}),
          fetchJson(buildFilteredUrl('/api/categories', filters), {}),
          fetchJson(buildFilteredUrl('/api/top_skus', filters), [])
        ]);

        setSummary(summaryData);

        // Processar alertas
        setAlerts(Array.isArray(alertsData) ? alertsData.map((a, i) => toAlert(a, i)) : []);

        // Processar marcas
        const totalRecords = summaryData?.total_records || 0;
        const formattedBrands = Object.entries(brandsData || {}).map(([brand, value]: [string, any]) => ({
          brand,
          count: value.count || 0,
          market_share: totalRecords > 0 ? ((value.count || 0) / totalRecords) * 100 : 0,
          avg_price: value.avg_spot_price || 0
        }));
        setBrandData(formattedBrands);

        // Processar marketplaces
        setMarketplaceData(Object.entries(marketplacesData || {}).map(([marketplace, value]: [string, any]) => ({
          marketplace,
          avg_price: value.avg_spot_price || 0,
          count: value.count || 0
        })));

        // Processar categorias
        setCategoryData(Object.entries(categoriesData || {}).map(([category, value]: [string, any]) => ({
          category,
          avg_price: value.avg_spot_price || 0,
          count: value.count || 0
        })));

        // Processar SKUs
        const skus = Array.isArray(skusData) ? skusData : [];
        setTopSkus(skus);

        // Selecionar primeiro SKU ou manter o selecionado se ainda existir
        if (skus.length > 0) {
          const skuToSelect = selectedSKU && skus.includes(selectedSKU) ? selectedSKU : skus[0];
          setSelectedSKU(skuToSelect);
          await loadTimeline(skuToSelect);
        } else {
          setSelectedSKU('');
          setTimelineData([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Falha ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Função para carregar timeline de um SKU específico
  const loadSelectedTimeline = async (sku: string) => {
    setSelectedSKU(sku);
    await loadTimeline(sku);
  };

  if (loading) return <LoadingState message="Carregando dashboard..." />;
  if (error) return <ErrorState message={error} />;

  // Dados derivados para gráficos (já filtrados)
  const dangerAlerts = alerts.filter(a => a.severity === 'danger').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

  const marketShareData = brandData
    .map(brand => ({ name: brand.brand, value: brand.market_share }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const targetBrand = brandData.find(b => b.brand.toUpperCase() === TARGET_BRAND.toUpperCase());
  const benchmarkBrand = brandData.find(b => b.brand.toUpperCase() === BENCHMARK_BRAND.toUpperCase());

  const priceComparisonData = [
    { name: TARGET_BRAND, value: targetBrand?.avg_price || 0 },
    { name: BENCHMARK_BRAND, value: benchmarkBrand?.avg_price || 0 }
  ].filter(item => item.value > 0);

  const marketplacePriceData = marketplaceData
    .map(mp => ({ name: mp.marketplace, value: mp.avg_price }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const categoryPriceData = categoryData
    .map(cat => ({ name: cat.category, value: cat.avg_price }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Verifica se há dados para exibir
  const hasData = brandData.length > 0 || marketplaceData.length > 0 || alerts.length > 0;

  return (
    <div className="page-wrapper">
      <PageHeader
        className="dashboard-header"
        title={`Monitor de Inteligência de Preços ${TARGET_BRAND}`}
        subtitle={`Análise competitiva para ${TARGET_BRAND} vs ${BENCHMARK_BRAND} - Última atualização: ${summary?.processed_at ? new Date(summary.processed_at).toLocaleString('pt-BR') : 'N/A'}`}
      />

      <FiltersBar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={clearFilters}
        options={{
          marketplaces: filterOptions.marketplaces,
          categories: filterOptions.categories,
          brands: filterOptions.brands,
        }}
        mode="brands"
        totalResults={brandData.length}
        isLoading={loading}
      />

      {!hasData ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Nenhum dado encontrado para os filtros selecionados.
          </p>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', marginTop: '8px' }}>
            Tente ajustar os filtros ou verifique se há dados disponíveis.
          </p>
        </div>
      ) : (
        <div className="dashboard-layout">
          {/* KPIs */}
          <div className="grid grid-4 section-gap compact-kpis">
            <KPIWidget
              title="Total de Registros"
              value={summary?.total_records?.toLocaleString() || 0}
              color="primary"
            />
            <KPIWidget
              title="Marcas Monitoradas"
              value={brandData.length}
              color="info"
            />
            <KPIWidget
              title="Marketplaces"
              value={marketplaceData.length}
              color="success"
            />
            <KPIWidget
              title={`Alertas ${TARGET_BRAND}`}
              value={alerts.length}
              subtitle={`${dangerAlerts} críticos - ${warningAlerts} atenção`}
              color={dangerAlerts > 0 ? 'danger' : warningAlerts > 0 ? 'warning' : 'success'}
            />
          </div>

          {/* Conteúdo Principal */}
          <div className="dashboard-content-grid">
            <main className="dashboard-main">
              <div className="dashboard-chart-grid">
                {/* Gráfico de Evolução de Preço */}
                <ChartCard
                  title="Evolução de Preço por SKU"
                  className="main-chart-card"
                  actions={
                    topSkus.length > 0 ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {loadingTimeline && (
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Carregando...
                          </span>
                        )}
                        <select
                          value={selectedSKU}
                          onChange={(e) => loadSelectedTimeline(e.target.value)}
                          className="control"
                          disabled={loadingTimeline}
                          style={{ minWidth: '200px' }}
                        >
                          {topSkus.map(sku => (
                            <option key={sku} value={sku}>{sku}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Nenhum SKU disponível
                      </span>
                    )
                  }
                >
                  {timelineData.length > 0 ? (
                    <PriceLineChart
                      data={timelineData.map(item => ({
                        date: item.date,
                        avg_price: item.avg_price,
                        min_price: item.min_price,
                        max_price: item.max_price
                      }))}
                      lines={[
                        { dataKey: 'avg_price', name: 'Preço médio', color: '#2563EB' },
                        { dataKey: 'min_price', name: 'Preço mínimo', color: '#059669' },
                        { dataKey: 'max_price', name: 'Preço máximo', color: '#D97706' }
                      ]}
                    />
                  ) : (
                    <div className="empty-chart" style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {loadingTimeline ? 'Carregando dados...' : 'Nenhum dado disponível para este SKU'}
                    </div>
                  )}
                </ChartCard>

                {/* Gráficos Compactos */}
                <div className="compact-chart-grid">
                  <ChartCard title="Market Share por Marca" className="small-chart">
                    {marketShareData.length > 0 ? (
                      <MarketShareBar
                        data={marketShareData}
                        dataKey="value"
                        horizontal
                        height={118}
                      />
                    ) : (
                      <div className="empty-chart">Sem dados</div>
                    )}
                  </ChartCard>

                  <ChartCard title={`Preço Médio - ${TARGET_BRAND} vs ${BENCHMARK_BRAND}`} className="small-chart">
                    {priceComparisonData.length > 0 ? (
                      <MarketShareBar
                        data={priceComparisonData}
                        dataKey="value"
                        height={118}
                        format="currency"
                      />
                    ) : (
                      <div className="empty-chart">Sem dados</div>
                    )}
                  </ChartCard>

                  <ChartCard title="Preço Médio por Marketplace" className="small-chart">
                    {marketplacePriceData.length > 0 ? (
                      <MarketShareBar
                        data={marketplacePriceData}
                        dataKey="value"
                        horizontal
                        height={118}
                        format="currency"
                      />
                    ) : (
                      <div className="empty-chart">Sem dados</div>
                    )}
                  </ChartCard>

                  <ChartCard title="Preço Médio por Categoria" className="small-chart">
                    {categoryPriceData.length > 0 ? (
                      <MarketShareBar
                        data={categoryPriceData}
                        dataKey="value"
                        horizontal
                        height={118}
                        format="currency"
                      />
                    ) : (
                      <div className="empty-chart">Sem dados</div>
                    )}
                  </ChartCard>
                </div>
              </div>
            </main>

            {/* Sidebar de Alertas */}
            <aside className="dashboard-alerts-sidebar">
              <DashboardCard title={`Alertas ${TARGET_BRAND}`} className="alerts-card">
                {alerts.length > 0 ? (
                  <AlertPanel alerts={alerts} maxItems={8} />
                ) : (
                  <div className="empty-chart" style={{ minHeight: '100px' }}>
                    Nenhum alerta encontrado
                  </div>
                )}
              </DashboardCard>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}