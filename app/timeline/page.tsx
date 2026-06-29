'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '../components/layout/PageHeader';
import ChartCard from '../components/ui/ChartCard';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
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
  const avgPrice = timeline.length > 0
    ? timeline.reduce((sum, t) => sum + t.avg_price, 0) / timeline.length
    : 0;

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
    <div className="page-wrapper timeline-page">
      <PageHeader
        title="Linha do Tempo de Preços"
        subtitle={`Evolução histórica de preços por SKU - SKU: ${currentSku || 'N/D'}`}
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      {timeline.length > 0 && (
        <div className="grid grid-4 section-gap timeline-kpis">
          <KPIWidget
            title="Preço Atual"
            value={currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="primary"
          />
          <KPIWidget
            title="Menor Preço"
            value={minPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="success"
          />
          <KPIWidget
            title="Maior Preço"
            value={maxPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="warning"
          />
          <KPIWidget
            title="Variação do Período"
            value={priceVariation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            color="info"
          />
        </div>
      )}

      <div className="timeline-main-layout">
        <ChartCard
          title="Evolução de Preço por SKU"
          className="timeline-chart-card"
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
        >
          {timeline.length > 0 ? (
            <PriceLineChart data={chartData} lines={chartLines} height={280} />
          ) : (
            <div className="empty-chart">
              Selecione um SKU para visualizar a evolução de preços
            </div>
          )}
        </ChartCard>

        {timeline.length > 0 && (
          <DashboardCard title="Resumo do Período" className="timeline-summary-card">
            <div className="timeline-summary-list">
              <div className="summary-item">
                <span className="summary-label">Data Inicial</span>
                <span className="summary-value">{formatDate(timeline[0]?.date) || 'N/D'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Data Final</span>
                <span className="summary-value">{formatDate(timeline[timeline.length - 1]?.date) || 'N/D'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Pontos de Dados</span>
                <span className="summary-value">{timeline.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Volatilidade</span>
                <span className="summary-value">{volatility}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Preço Médio</span>
                <span className="summary-value">
                  {avgPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Amplitude</span>
                <span className="summary-value">
                  {priceVariation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>

      <style jsx>{`
        .timeline-page {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          height: 100%;
          min-height: 0;
        }

        .timeline-kpis {
          flex-shrink: 0;
        }

        .timeline-main-layout {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: var(--spacing-md);
          flex: 1;
          min-height: 0;
        }

        .timeline-chart-card {
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
        }

        .timeline-chart-card > div:last-child {
          flex: 1;
          min-height: 0;
        }

        .timeline-summary-card {
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
        }

        .timeline-summary-card > div:last-child {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .timeline-summary-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          padding: 4px 0;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid var(--border);
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-label {
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .summary-value {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        /* Responsividade */
        @media (max-width: 1024px) {
          .timeline-main-layout {
            grid-template-columns: 1fr;
            gap: var(--spacing-md);
          }

          .timeline-chart-card {
            min-height: 400px;
          }

          .timeline-summary-card {
            min-height: auto;
          }

          .timeline-summary-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px 16px;
          }

          .summary-item {
            border-bottom: none;
            padding: 4px 0;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .summary-label {
            font-size: 0.65rem;
          }

          .summary-value {
            font-size: 0.78rem;
          }
        }

        @media (max-width: 768px) {
          .timeline-kpis {
            grid-template-columns: repeat(2, 1fr);
          }

          .timeline-chart-card {
            min-height: 320px;
          }

          .timeline-summary-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .timeline-kpis {
            grid-template-columns: 1fr;
          }

          .timeline-summary-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
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