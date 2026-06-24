'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  if (loading) return <div className="loading">Carregando SKUs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Voltar ao Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Top SKUs
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Produtos mais acompanhados por volume de dados
        </p>
      </header>

      <div className="card" style={{ marginBottom: '40px' }}>
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {skus?.map((sku, index) => (
              <tr key={sku}>
                <td style={{ fontWeight: 600, color: '#00FF88' }}>{sku}</td>
                <td>
                  <Link 
                    href={`/timeline?sku=${sku}`}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                  >
                    Ver Linha do Tempo
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
