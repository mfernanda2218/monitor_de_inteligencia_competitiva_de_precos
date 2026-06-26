'use client';

import { useEffect, useState } from 'react';
import { TARGET_BRAND, BENCHMARK_BRAND } from './config/brands';
import PageHeader from './components/layout/PageHeader';
import KPIWidget from './components/ui/KPIWidget';
import DashboardCard from './components/ui/DashboardCard';
import ChartCard from './components/ui/ChartCard';
import AlertPanel, { Alert } from './components/ui/AlertPanel';
import Button from './components/ui/Button';
import LoadingState from './components/shared/LoadingState';
import ErrorState from './components/shared/ErrorState';
import PriceLineChart from './components/charts/PriceLineChart';
import MarketShareBar from './components/charts/MarketShareBar';

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
}

interface CategoryData {
  category: string;
  avg_price: number;
  count: number;
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

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [brandData, setBrandData] = useState<BrandData[]>([]);
  const [marketplaceData, setMarketplaceData] = useState<MarketplaceData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topSkus, setTopSkus] = useState<string[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJson = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Falha ao carregar ${url}`);
      return response.json();
    };

    const loadTimeline = async (sku: string) => {
      const timeline = await fetchJson(`/api/timeline?sku=${encodeURIComponent(sku)}`);
      setTimelineData(Array.isArray(timeline) ? timeline : []);
    };

    const fetchData = async () => {
      try {
        const [summaryData, alertsData, brandsData, marketplacesData, categoriesData, skusData] = await Promise.all([
          fetchJson('/api/summary'),
          fetchJson('/api/alerts'),
          fetchJson('/api/brands'),
          fetchJson('/api/marketplaces'),
          fetchJson('/api/categories'),
          fetchJson('/api/top_skus')
        ]);

        setSummary(summaryData);
        setAlerts(Array.isArray(alertsData) ? alertsData.map(toAlert) : []);

        const totalRecords = summaryData?.total_records || 0;
        const formattedBrands = Object.entries(brandsData || {}).map(([brand, value]: [string, any]) => ({
          brand,
          count: value.count || 0,
          market_share: totalRecords > 0 ? ((value.count || 0) / totalRecords) * 100 : 0,
          avg_price: value.avg_spot_price || 0
        }));
        setBrandData(formattedBrands);

        setMarketplaceData(Object.entries(marketplacesData || {}).map(([marketplace, value]: [string, any]) => ({
          marketplace,
          avg_price: value.avg_spot_price || 0
        })));

        setCategoryData(Object.entries(categoriesData || {}).map(([category, value]: [string, any]) => ({
          category,
          avg_price: value.avg_spot_price || 0,
          count: value.count || 0
        })));

        const skus = Array.isArray(skusData) ? skusData : [];
        setTopSkus(skus);

        if (skus.length > 0) {
          setSelectedSKU(skus[0]);
          await loadTimeline(skus[0]);
        }

        setLoading(false);
      } catch (err) {
        setError('Falha ao carregar dados do dashboard');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadSelectedTimeline = async (sku: string) => {
    setSelectedSKU(sku);
    try {
      const response = await fetch(`/api/timeline?sku=${encodeURIComponent(sku)}`);
      if (!response.ok) {
        setTimelineData([]);
        return;
      }
      const timeline = await response.json();
      setTimelineData(Array.isArray(timeline) ? timeline : []);
    } catch (err) {
      setTimelineData([]);
    }
  };

  const dangerAlerts = alerts.filter(a => a.severity === 'danger').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

  if (loading) return <LoadingState message="Carregando dashboard..." />;
  if (error) return <ErrorState message={error} />;

  const timelineChartData = timelineData
    .map(item => ({
      date: item.date,
      avg_price: item.avg_price,
      min_price: item.min_price,
      max_price: item.max_price
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const marketShareData = brandData
    .map(brand => ({ name: brand.brand, value: brand.market_share }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

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

  return (
    <div className="page-wrapper">
      <PageHeader
        className="dashboard-header"
        title={`Monitor de Inteligência de Preços ${TARGET_BRAND}`}
        subtitle={`Análise competitiva para ${TARGET_BRAND} vs ${BENCHMARK_BRAND} - Última atualização: ${summary?.processed_at ? new Date(summary.processed_at).toLocaleString('pt-BR') : 'N/A'}`}
      />

      <div className="dashboard-layout">
        {/* KPIs */}
        <div className="grid grid-4 section-gap compact-kpis">
          <KPIWidget title="Total de Registros" value={summary?.total_records || 0} color="primary" />
          <KPIWidget title="Marcas Monitoradas" value={summary?.total_brands || 0} color="info" />
          <KPIWidget title="Marketplaces" value={summary?.total_marketplaces || 0} color="success" />
          <KPIWidget
            title={`Alertas ${TARGET_BRAND}`}
            value={alerts.length}
            subtitle={`${dangerAlerts} críticos - ${warningAlerts} atenção`}
            color={dangerAlerts > 0 ? 'danger' : warningAlerts > 0 ? 'warning' : 'success'}
          />
        </div>

        <div className="dashboard-content-grid">
          <main className="dashboard-main">
            <div className="dashboard-chart-grid">
              {/* Gráfico Principal */}
              <ChartCard
                title="Evolução de Preço por SKU"
                className="main-chart-card"
                actions={
                  topSkus.length > 0 && (
                    <select
                      value={selectedSKU}
                      onChange={(e) => loadSelectedTimeline(e.target.value)}
                      className="control"
                    >
                      {topSkus.map(sku => (
                        <option key={sku} value={sku}>{sku}</option>
                      ))}
                    </select>
                  )
                }
              >
                <div className="chart-container">
                  <PriceLineChart
                    data={timelineChartData}
                    lines={[
                      { dataKey: 'avg_price', name: 'Preço médio', color: '#2563EB' },
                      { dataKey: 'min_price', name: 'Preço mínimo', color: '#059669' },
                      { dataKey: 'max_price', name: 'Preço máximo', color: '#D97706' }
                    ]}
                  />
                </div>
              </ChartCard>

              {/* 4 Gráficos Pequenos */}
              <div className="compact-chart-grid">
                <ChartCard title="Market Share por Marca" className="small-chart">
                  <MarketShareBar data={marketShareData} dataKey="value" horizontal height={118} />
                </ChartCard>
                <ChartCard title={`Preço Médio Spot - ${TARGET_BRAND} vs ${BENCHMARK_BRAND}`} className="small-chart">
                  <MarketShareBar data={priceComparisonData} dataKey="value" height={118} format="currency" />
                </ChartCard>
                <ChartCard title="Preço Médio por Marketplace" className="small-chart">
                  <MarketShareBar data={marketplacePriceData} dataKey="value" horizontal height={118} format="currency" />
                </ChartCard>
                <ChartCard title="Preço Médio por Categoria" className="small-chart">
                  <MarketShareBar data={categoryPriceData} dataKey="value" horizontal height={118} format="currency" />
                </ChartCard>
              </div>
            </div>
          </main>

          {/* Alertas */}
          <aside className="dashboard-alerts-sidebar">
            <DashboardCard title={`Alertas ${TARGET_BRAND}`} className="alerts-card">
              <AlertPanel alerts={alerts} maxItems={8} />
            </DashboardCard>
          </aside>
        </div>
      </div>
    </div>
  );
}