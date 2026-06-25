'use client';

import { useEffect, useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import AnalyticsTable from '../components/ui/AnalyticsTable';
import Button from '../components/ui/Button';
import DashboardCard from '../components/ui/DashboardCard';
import KPIWidget from '../components/ui/KPIWidget';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';

export default function SKUsPage() {
  const [skus, setSkus] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/top_skus')
      .then(res => res.json())
      .then(data => {
        setSkus(data);
        setLoading(false);
      })
      .catch(err => {
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
      render: (value: string) => (
        <span style={{ fontWeight: 600, color: '#111827' }}>
          {value}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Ação',
      align: 'center' as const,
      render: (value: string, row: any) => (
        <Button
          href={`/timeline?sku=${row.sku}`}
          variant="secondary"
          size="sm"
        >
          Ver Linha do Tempo
        </Button>
      )
    }
  ];

  const tableData = skus?.map(sku => ({ sku })) || [];

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <PageHeader
        title="Top SKUs"
        subtitle="Produtos mais acompanhados por volume de dados"
        breadcrumb={{ label: 'Voltar ao Dashboard', href: '/' }}
      />

      <div className="grid grid-2" style={{ marginBottom: '32px' }}>
        <KPIWidget
          title="Total de SKUs"
          value={skus?.length || 0}
          color="primary"
        />
        {skus && skus.length > 0 && (
          <KPIWidget
            title="Mais Monitorado"
            value={skus[0]}
            color="success"
          />
        )}
      </div>

      <DashboardCard>
        <AnalyticsTable
          columns={tableColumns}
          data={tableData}
        />
      </DashboardCard>
    </div>
  );
}
