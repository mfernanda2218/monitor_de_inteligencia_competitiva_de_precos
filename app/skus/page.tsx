'use client';

import { useEffect, useState } from 'react';
import { TARGET_BRAND } from '../config/brands';
import PageHeader from '../components/layout/PageHeader';
import AnalyticsTable from '../components/ui/AnalyticsTable';
import Button from '../components/ui/Button';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';

interface SKUData {
  sku: string;
  record_count: number | null;
  brand_count: number | null;
  target_brand: string | null;
  target_price: number | null;
  market_min: number | null;
  market_avg: number | null;
  market_min_competitor: string | null;
  premium_vs_min: number | null;
  alert_severity: 'danger' | 'warning' | 'success' | null;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function formatCurrency(value: number | null) {
  return value === null || value === undefined ? 'N/D' : currencyFormatter.format(value);
}

function formatNumber(value: number | null) {
  return value === null || value === undefined ? 'N/D' : value.toLocaleString('pt-BR');
}

export default function SKUsPage() {
  const [skuData, setSkuData] = useState<SKUData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/skus')
      .then(res => {
        if (!res.ok) {
          throw new Error('Falha ao carregar SKUs');
        }
        return res.json();
      })
      .then(data => {
        setSkuData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Falha ao carregar SKUs');
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingState message="Carregando SKUs..." />;
  if (error) return <ErrorState message={error} />;

  const tableColumns = [
    {
      key: 'sku',
      header: 'SKU',
      width: '18%',
      minWidth: '168px',
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: '#111827' }}>{value}</span>
      )
    },
    {
      key: 'record_count',
      header: 'Registros',
      width: '10%',
      minWidth: '108px',
      align: 'right' as const,
      render: (value: number | null) => formatNumber(value)
    },
    {
      key: 'brand_count',
      header: 'Marcas',
      width: '9%',
      minWidth: '96px',
      align: 'center' as const,
      render: (value: number | null) => (
        <StatusBadge variant="info">{formatNumber(value)}</StatusBadge>
      )
    },
    {
      key: 'target_price',
      header: `Preço ${TARGET_BRAND}`,
      width: '13%',
      minWidth: '136px',
      align: 'right' as const,
      render: (value: number | null) => (
        <span style={{ color: value ? '#2563EB' : '#9CA3AF', fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      )
    },
    {
      key: 'market_min',
      header: 'Mín. Mercado',
      width: '16%',
      minWidth: '180px',
      align: 'right' as const,
      render: (value: number | null, row: SKUData) => (
        <span style={{ color: value ? '#6B7280' : '#9CA3AF' }}>
          {formatCurrency(value)}
          {row.market_min_competitor && (
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginLeft: '4px' }}>
              ({row.market_min_competitor})
            </span>
          )}
        </span>
      )
    },
    {
      key: 'market_avg',
      header: 'Média Mercado',
      width: '13%',
      minWidth: '136px',
      align: 'right' as const,
      render: (value: number | null) => formatCurrency(value)
    },
    {
      key: 'premium_vs_min',
      header: 'Premium vs Mín.',
      width: '11%',
      minWidth: '132px',
      align: 'right' as const,
      render: (value: number | null) => {
        if (value === null || value === undefined) {
          return <span style={{ color: '#9CA3AF' }}>N/D</span>;
        }

        return (
          <span style={{
            color: value > 10 ? '#DC2626' : value > 0 ? '#D97706' : '#059669',
            fontWeight: 600
          }}>
            {value > 0 ? '+' : ''}{value.toFixed(1)}%
          </span>
        );
      }
    },
    {
      key: 'alert_severity',
      header: 'Alerta',
      width: '10%',
      minWidth: '128px',
      align: 'center' as const,
      render: (value: 'danger' | 'warning' | 'success' | null) => {
        if (!value) return <span style={{ color: '#9CA3AF' }}>N/D</span>;

        const label = {
          danger: 'Crítico',
          warning: 'Atenção',
          success: 'Competitivo'
        }[value];

        return <StatusBadge variant={value}>{label}</StatusBadge>;
      }
    },
    {
      key: 'action',
      header: 'Ação',
      width: '10%',
      minWidth: '136px',
      align: 'center' as const,
      render: (_value: string, row: SKUData) => (
        <Button href={`/timeline?sku=${encodeURIComponent(row.sku)}`} variant="secondary" size="sm">
          Ver Timeline
        </Button>
      )
    }
  ];

  const dangerCount = skuData.filter(s => s.alert_severity === 'danger').length;
  const warningCount = skuData.filter(s => s.alert_severity === 'warning').length;
  const premiums = skuData
    .map(s => s.premium_vs_min)
    .filter((value): value is number => typeof value === 'number');
  const avgPremium = premiums.length > 0
    ? `${(premiums.reduce((sum, value) => sum + value, 0) / premiums.length).toFixed(1)}%`
    : 'N/D';

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Top SKUs"
        subtitle="Análise de preços por SKU com métricas vindas do ETL"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <div className="grid grid-4 section-gap">
        <KPIWidget title="Total de SKUs" value={skuData.length} color="primary" />
        <KPIWidget title="Alertas Críticos" value={dangerCount} color="danger" />
        <KPIWidget title="Alertas de Atenção" value={warningCount} color="warning" />
        <KPIWidget title="Premium Médio" value={avgPremium} color="info" />
      </div>

      <DashboardCard title="Tabela de SKUs" padding="sm">
        <AnalyticsTable columns={tableColumns} data={skuData} pageSize={6} />
      </DashboardCard>
    </div>
  );
}
