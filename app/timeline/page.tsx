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

function TimelineContent() {
  const searchParams = useSearchParams();
  const sku = searchParams.get('sku') || '';
  const [timeline, setTimeline] = useState<TimelineData[] | null>(null);
  const [topSkus, setTopSkus] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/top_skus')
      .then(res => res.json())
      .then(data => {
        setTopSkus(data);
        if (!sku && data.length > 0) {
          loadTimeline(data[0]);
        } else if (sku) {
          loadTimeline(sku);
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        setError('Falha ao carregar SKUs');
        setLoading(false);
      });
  }, [sku]);

  const loadTimeline = (skuToLoad: string) => {
    setLoading(true);
    fetch(`/api/timeline?sku=${skuToLoad}`)
      .then(res => res.json())
      .then(data => {
        setTimeline(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados da linha do tempo');
        setLoading(false);
      });
  };

  if (loading) return <LoadingState message="Carregando linha do tempo..." />;
  if (error) return <ErrorState message={error} />;

  const currentPrice = timeline && timeline.length > 0 ? timeline[timeline.length - 1].avg_price : 0;
  const minPrice = timeline && timeline.length > 0 ? Math.min(...timeline.map(t => t.min_price)) : 0;
  const maxPrice = timeline && timeline.length > 0 ? Math.max(...timeline.map(t => t.max_price)) : 0;
  const priceVariation = maxPrice - minPrice;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const chartData = timeline?.map(t => ({
    date: formatDate(t.date),
    avg_price: t.avg_price,
    min_price: t.min_price,
    max_price: t.max_price
  })) || [];

  const chartLines = [
    { dataKey: 'avg_price', name: 'Preço Médio', color: '#2563EB' },
    { dataKey: 'min_price', name: 'Preço Mínimo', color: '#059669' },
    { dataKey: 'max_price', name: 'Preço Máximo', color: '#D97706' }
  ];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <PageHeader
        title="Linha do Tempo de Preços"
        subtitle="Evolução histórica de preços por SKU"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <DashboardCard style={{ marginBottom: '32px' }}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontWeight: 500 }}>
            Selecionar SKU:
          </label>
          <select
            value={sku}
            onChange={(e) => loadTimeline(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              color: '#111827',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {topSkus?.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </DashboardCard>

      {timeline && timeline.length > 0 && (
        <>
          <ChartCard title={`Evolução de Preço: ${sku}`} style={{ marginBottom: '32px' }}>
            <PriceLineChart
              data={chartData}
              lines={chartLines}
              height={400}
            />
          </ChartCard>

          <div className="grid grid-3">
            <KPIWidget
              title="Preço Atual"
              value={`R$ ${currentPrice.toFixed(2)}`}
              color="primary"
            />
            <KPIWidget
              title="Menor Preço"
              value={`R$ ${minPrice.toFixed(2)}`}
              color="success"
            />
            <KPIWidget
              title="Variação do Período"
              value={`R$ ${priceVariation.toFixed(2)}`}
              color="warning"
            />
          </div>
        </>
      )}
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
