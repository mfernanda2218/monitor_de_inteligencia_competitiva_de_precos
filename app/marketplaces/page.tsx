'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface MarketplaceData {
  [key: string]: {
    count: number;
    avg_spot_price: number;
    min_spot_price: number;
    max_spot_price: number;
    brand_count: number;
    brands: string[];
  };
}

interface Summary {
  total_records: number;
}

export default function MarketplacesPage() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/marketplaces').then(res => res.json()),
      fetch('/api/summary').then(res => res.json())
    ])
      .then(([marketplacesData, summaryData]) => {
        setMarketplaces(marketplacesData);
        setSummary(summaryData);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados de marketplaces');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Carregando análise de marketplaces...</div>;
  if (error) return <div className="error">{error}</div>;

  const marketplacesArray = marketplaces ? Object.entries(marketplaces).map(([name, data]) => ({
    name,
    ...data,
    market_share: summary ? ((data.count / summary.total_records) * 100) : 0
  })) : [];

  // Sort by market share
  marketplacesArray.sort((a, b) => b.market_share - a.market_share);

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Voltar ao Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Análise de Marketplaces
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Desempenho, cobertura e market share por canal
        </p>
      </header>

      <div className="card" style={{ marginBottom: '40px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Marketplace</th>
              <th>Market Share</th>
              <th>Registros</th>
              <th>Preço Médio</th>
              <th>Preço Mín</th>
              <th>Preço Máx</th>
              <th>Marcas</th>
            </tr>
          </thead>
          <tbody>
            {marketplacesArray.map((mp) => (
              <tr key={mp.name}>
                <td style={{ fontWeight: 600, color: '#00FF88' }}>{mp.name}</td>
                <td>
                  <span style={{ 
                    color: mp.market_share > 20 ? '#00FF88' : mp.market_share > 10 ? '#FFB800' : '#64748B',
                    fontWeight: 600
                  }}>
                    {mp.market_share.toFixed(1)}%
                  </span>
                </td>
                <td>{mp.count.toLocaleString()}</td>
                <td>R$ {mp.avg_spot_price.toFixed(2)}</td>
                <td>R$ {mp.min_spot_price.toFixed(2)}</td>
                <td>R$ {mp.max_spot_price.toFixed(2)}</td>
                <td>
                  <span className="badge badge-success">{mp.brand_count} marcas</span>
                  {mp.brands.includes('MIDEA') && <span style={{ marginLeft: '8px', color: '#00FF88', fontSize: '0.75rem' }}>★ MIDEA</span>}
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
            {marketplacesArray.length > 0 && (
              <>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#00FF88' }}>Marketplace Líder:</strong> {marketplacesArray[0].name} com {marketplacesArray[0].market_share.toFixed(1)}% de market share
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#00FF88' }}>Cobertura MIDEA:</strong> Presente em {marketplacesArray.filter(mp => mp.brands.includes('MIDEA')).length} de {marketplacesArray.length} marketplaces
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#00FF88' }}>Preço Médio Global:</strong> R$ {(marketplacesArray.reduce((acc, mp) => acc + mp.avg_spot_price, 0) / marketplacesArray.length).toFixed(2)}
                </p>
                <p>
                  <strong style={{ color: '#00FF88' }}>Marketplaces com MIDEA:</strong> {marketplacesArray.filter(mp => mp.brands.includes('MIDEA')).map(mp => mp.name).join(', ')}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Recomendações</h2>
          <div style={{ color: '#E2E8F0', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '12px' }}>
              • Priorizar marketplaces com market share {'>'} 20% para campanhas promocionais
            </p>
            <p style={{ marginBottom: '12px' }}>
              • Expandir presença da MIDEA em marketplaces onde ainda não está presente
            </p>
            <p style={{ marginBottom: '12px' }}>
              • Analisar marketplaces com preços médios mais altos para estratégias premium
            </p>
            <p>
              • Monitorar marketplaces com alta variação de preço para detectar promoções competitivas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
