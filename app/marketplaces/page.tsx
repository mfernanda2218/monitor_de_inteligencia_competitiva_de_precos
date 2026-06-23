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

export default function MarketplacesPage() {
  const [marketplaces, setMarketplaces] = useState<MarketplaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketplaces')
      .then(res => res.json())
      .then(data => {
        setMarketplaces(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load marketplaces data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading marketplaces analysis...</div>;
  if (error) return <div className="error">{error}</div>;

  const marketplacesArray = marketplaces ? Object.entries(marketplaces).map(([name, data]) => ({ name, ...data })) : [];

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Marketplace Analysis
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Channel performance and coverage
        </p>
      </header>

      <div className="card" style={{ marginBottom: '40px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Marketplace</th>
              <th>Records</th>
              <th>Avg Price</th>
              <th>Min Price</th>
              <th>Max Price</th>
              <th>Brands</th>
            </tr>
          </thead>
          <tbody>
            {marketplacesArray.map((mp) => (
              <tr key={mp.name}>
                <td style={{ fontWeight: 600, color: '#00FF88' }}>{mp.name}</td>
                <td>{mp.count.toLocaleString()}</td>
                <td>R$ {mp.avg_spot_price.toFixed(2)}</td>
                <td>R$ {mp.min_spot_price.toFixed(2)}</td>
                <td>R$ {mp.max_spot_price.toFixed(2)}</td>
                <td>
                  <span className="badge badge-success">{mp.brand_count} brands</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
