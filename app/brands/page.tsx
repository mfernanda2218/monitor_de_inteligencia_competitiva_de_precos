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

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        setBrands(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Falha ao carregar dados de marcas');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Carregando análise de marcas...</div>;
  if (error) return <div className="error">{error}</div>;

  const brandsArray = brands ? Object.entries(brands).map(([name, data]) => ({ name, ...data })) : [];

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
          Posicionamento competitivo por marca
        </p>
      </header>

      <div className="card" style={{ marginBottom: '40px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Marca</th>
              <th>Registros</th>
              <th>Preço Médio</th>
              <th>Preço Mín</th>
              <th>Preço Máx</th>
              <th>Variação de Preço</th>
              <th>Cobertura de Marketplace</th>
            </tr>
          </thead>
          <tbody>
            {brandsArray.map((brand) => (
              <tr key={brand.name}>
                <td style={{ fontWeight: 600, color: '#00FF88' }}>{brand.name}</td>
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
    </div>
  );
}
