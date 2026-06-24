'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/brands').then(res => res.json()),
      fetch('/api/summary').then(res => res.json())
    ])
      .then(([brandsData, summaryData]) => {
        setBrands(brandsData);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados de marcas');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Carregando análise de marcas...</div>;
  if (error) return <div className="error">{error}</div>;

  const brandsArray = brands ? Object.entries(brands).map(([name, data]) => ({
    name,
    ...data,
    market_share: summary ? ((data.count / summary.total_records) * 100) : 0
  })) : [];

  // Sort by market share
  brandsArray.sort((a, b) => b.market_share - a.market_share);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Voltar ao Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Análise de Marcas
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Posicionamento competitivo e market share por marca
        </p>
      </header>

      <div className="card" style={{ marginBottom: '40px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Market Share</th>
              <th>Registros</th>
              <th>Preço Médio</th>
              <th>Preço Mín</th>
              <th>Preço Máx</th>
              <th>Variação</th>
              <th>Cobertura</th>
            </tr>
          </thead>
          <tbody>
            {brandsArray.map((brand) => (
              <tr key={brand.name}>
                <td style={{ fontWeight: 600, color: brand.name.toUpperCase() === 'MIDEA' ? '#00FF88' : '#E2E8F0' }}>
                  {brand.name}
                  {brand.name.toUpperCase() === 'MIDEA' && <span style={{ marginLeft: '8px', fontSize: '0.75rem' }}>★</span>}
                </td>
                <td>
                  <span style={{ 
                    color: brand.market_share > 10 ? '#00FF88' : brand.market_share > 5 ? '#FFB800' : '#64748B',
                    fontWeight: 600
                  }}>
                    {brand.market_share.toFixed(1)}%
                  </span>
                </td>
                <td>{brand.count.toLocaleString()}</td>
                <td>R$ {brand.avg_spot_price.toFixed(2)}</td>
                <td>R$ {brand.min_spot_price.toFixed(2)}</td>
                <td>R$ {brand.max_spot_price.toFixed(2)}</td>
                <td>R$ {brand.price_variation.toFixed(2)}</td>
                <td>
                  <span className="badge badge-success">{brand.marketplace_coverage} marketplaces</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Insights Executivos</h2>
          <div style={{ color: '#E2E8F0', lineHeight: 1.8 }}>
            {brandsArray.length > 0 && (
              <>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#00FF88' }}>Líder de Mercado:</strong> {brandsArray[0].name} com {brandsArray[0].market_share.toFixed(1)}% de market share
                </p>
                {brandsArray.find(b => b.name.toUpperCase() === 'MIDEA') && (
                  <p style={{ marginBottom: '12px' }}>
                    <strong style={{ color: '#00FF88' }}>Posição MIDEA:</strong> {
                      brandsArray.findIndex(b => b.name.toUpperCase() === 'MIDEA') + 1
                    }º lugar com {brandsArray.find(b => b.name.toUpperCase() === 'MIDEA')?.market_share.toFixed(1)}% de market share
                  </p>
                )}
                <p>
                  <strong style={{ color: '#00FF88' }}>Total de Marcas:</strong> {brandsArray.length} marcas monitoradas
                </p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Recomendações</h2>
          <div style={{ color: '#E2E8F0', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '12px' }}>
              • Focar em marcas com market share {'>'} 10% para análise de benchmark
            </p>
            <p style={{ marginBottom: '12px' }}>
              • Investigar marcas com alta variação de preço para entender estratégias dinâmicas
            </p>
            <p>
              • Expandir cobertura de marketplaces para marcas com baixa penetração
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
