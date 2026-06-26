'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '../components/layout/PageHeader';
import ChartCard from '../components/ui/ChartCard';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import MetricIndicator from '../components/ui/MetricIndicator';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import PriceLineChart from '../components/charts/PriceLineChart';

interface TimelineData {
  date: string;
  avg_price: number;
  min_price: number;
  max_price: number;
}

function formatDate(dateString: string): string {
  if (!dateString) return '';

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }

  let date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    const parts = dateString.split(/[-/]/);
    if (parts.length === 3) {
      date = parts[0].length === 4
        ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
        : new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }

  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('pt-BR');
}

function parseBrazilianDate(dateString: string) {
  const [day, month, year] = dateString.split('/');
  if (day && month && year) {
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
  }

  return new Date(dateString).getTime();
}

function TimelineContent() {
  const searchParams = useSearchParams();
  const initialSku = searchParams.get('sku') || '';
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [topSkus, setTopSkus] = useState<string[]>([]);
  const [currentSku, setCurrentSku] = useState(initialSku);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTimeline = async (skuToLoad: string) => {
    if (!skuToLoad) {
      setTimeline([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setCurrentSku(skuToLoad);

    try {
      const response = await fetch(`/api/timeline?sku=${encodeURIComponent(skuToLoad)}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados da linha do tempo');
      }

      const data = await response.json();
      setTimeline(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch {
      setError('Falha ao carregar dados da linha do tempo');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/top_skus')
      .then(res => {
        if (!res.ok) {
          throw new Error('Falha ao carregar SKUs');
        }
        return res.json();
      })
      .then(data => {
        const skus = Array.isArray(data) ? data : [];
        setTopSkus(skus);
        loadTimeline(initialSku || skus[0] || '');
      })
      .catch(() => {
        setError('Falha ao carregar SKUs');
        setLoading(false);
      });
  }, [initialSku]);

  if (loading) return <LoadingState message="Carregando linha do tempo..." />;
  if (error) return <ErrorState message={error} />;

  const currentPrice = timeline.length > 0 ? timeline[timeline.length - 1].avg_price : 0;
  const minPrice = timeline.length > 0 ? Math.min(...timeline.map(t => t.min_price)) : 0;
  const maxPrice = timeline.length > 0 ? Math.max(...timeline.map(t => t.max_price)) : 0;
  const priceVariation = maxPrice - minPrice;
  const volatility = currentPrice > 0 ? `${((priceVariation / currentPrice) * 100).toFixed(1)}%` : 'N/D';

  const chartData = timeline
    .map(t => ({
      date: formatDate(t.date),
      avg_price: t.avg_price,
      min_price: t.min_price,
      max_price: t.max_price
    }))
    .sort((a, b) => parseBrazilianDate(a.date) - parseBrazilianDate(b.date));

  const chartLines = [
    { dataKey: 'avg_price', name: 'Preço médio', color: '#2563EB' },
    { dataKey: 'min_price', name: 'Preço mínimo', color: '#059669' },
    { dataKey: 'max_price', name: 'Preço máximo', color: '#D97706' }
  ];

  return (
    <div className="container page-shell">
      <PageHeader
        title="Linha do Tempo de Preços"
        subtitle={`Evolução histórica de preços por SKU - SKU: ${currentSku || 'N/D'}`}
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      {timeline.length > 0 && (
        <div className="grid grid-4 section-gap">
          <KPIWidget
            title="Preco Atual"
            value={currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="primary"
          />
          <KPIWidget
            title="Menor Preco"
            value={minPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="success"
          />
          <KPIWidget
            title="Maior Preco"
            value={maxPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="warning"
          />
          <KPIWidget
            title="Variacao do Periodo"
            value={priceVariation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="info"
          />
        </div>
      )}

      <div className={timeline.length > 0 ? 'timeline-layout' : undefined}>
      <ChartCard
        title="Evolução de Preço por SKU"
        actions={
          <select
            value={currentSku}
            onChange={(event) => loadTimeline(event.target.value)}
            className="control"
          >
            {topSkus.map(sku => (
              <option key={sku} value={sku}>{sku}</option>
            ))}
          </select>
        }
        style={{ marginBottom: timeline.length > 0 ? 0 : '20px' }}
      >
        {timeline.length > 0 ? (
          <PriceLineChart data={chartData} lines={chartLines} height={240} />
        ) : (
          <div className="empty-chart">
            Selecione um SKU para visualizar a evolução de preços
          </div>
        )}
      </ChartCard>


      {timeline.length > 0 && (
        <DashboardCard title="Resumo do Período">
          <div className="metric-grid">
            <MetricIndicator label="Data Inicial" value={formatDate(timeline[0]?.date) || 'N/D'} size="sm" />
            <MetricIndicator label="Data Final" value={formatDate(timeline[timeline.length - 1]?.date) || 'N/D'} size="sm" />
            <MetricIndicator label="Pontos de Dados" value={timeline.length} size="sm" />
            <MetricIndicator label="Volatilidade" value={volatility} size="sm" />
          </div>
        </DashboardCard>
      )}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<LoadingState message="Carregando linha do tempo..." />}>
      <TimelineContent />
    </Suspense>
  );
}
