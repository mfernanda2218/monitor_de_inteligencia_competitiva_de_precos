'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Summary {
  total_records: number;
  total_brands: number;
  total_marketplaces: number;
  total_categories: number;
  total_skus: number;
  processed_at: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Carregando dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Monitor de Inteligência de Preços
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Dashboard de análise competitiva de preços • Última atualização: {summary?.processed_at ? new Date(summary.processed_at).toLocaleString() : 'N/A'}
        </p>
      </header>

      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_records?.toLocaleString() || 0}</div>
          <div className="stat-label">Total de Registros</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_brands || 0}</div>
          <div className="stat-label">Marcas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_marketplaces || 0}</div>
          <div className="stat-label">Marketplaces</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_skus || 0}</div>
          <div className="stat-label">SKUs Acompanhados</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '40px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Ações Rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/brands" className="btn btn-primary">
              Analisar Marcas →
            </Link>
            <Link href="/marketplaces" className="btn btn-secondary">
              Ver Marketplaces →
            </Link>
            <Link href="/alerts" className="btn btn-secondary">
              Ver Alertas →
            </Link>
            <Link href="/timeline" className="btn btn-secondary">
              Linha do Tempo de Preços →
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Categorias</h2>
          <div style={{ color: '#64748B' }}>
            <p style={{ marginBottom: '12px' }}>Total de Categorias: <span style={{ color: '#00FF88', fontWeight: 600 }}>{summary?.total_categories || 0}</span></p>
            <p>Explore a análise detalhada de categorias nas seções dedicadas.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Resumo Executivo</h2>
        <p style={{ color: '#E2E8F0', lineHeight: 1.8 }}>
          Este dashboard fornece inteligência competitiva em tempo real sobre preços em múltiplos marketplaces.
          Monitore {summary?.total_records?.toLocaleString() || 0} pontos de preço de {summary?.total_brands || 0} marcas
          em {summary?.total_marketplaces || 0} marketplaces. Use a navegação acima para mergulhar mais fundo em
          desempenho específico de marcas, cobertura de marketplaces e alertas de preços.
        </p>
      </div>
    </div>
  );
}
