'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TimelineData {
  date: string;
  avg_price: number;
  min_price: number;
  max_price: number;
}

export default function TimelinePage() {
  const searchParams = useSearchParams();
  const sku = searchParams.get('sku') || '';
  const [timeline, setTimeline] = useState<TimelineData[] | null>(null);
  const [topSkus, setTopSkus] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load top SKUs for dropdown
    fetch('/api/top_skus')
      .then(res => res.json())
      .then(data => {
        setTopSkus(data);
        if (!sku && data.length > 0) {
          // Load first SKU if none selected
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

  if (loading) return <div className="loading">Carregando linha do tempo...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#00D4FF', textDecoration: 'none', marginBottom: '16px', display: 'inline-block' }}>
          ← Voltar ao Dashboard
        </Link>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Linha do Tempo de Preços
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Evolução histórica de preços por SKU
        </p>
      </header>

      <div className="card" style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E2E8F0' }}>
          Selecionar SKU:
        </label>
        <select
          value={sku}
          onChange={(e) => loadTimeline(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#1A1F2E',
            border: '1px solid #2D3748',
            borderRadius: '8px',
            color: '#E2E8F0',
            fontSize: '1rem'
          }}
        >
          {topSkus?.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {timeline && timeline.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>
            Evolução de Preço: {sku}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
              <XAxis 
                dataKey="date" 
                stroke="#64748B"
                tick={{ fill: '#64748B' }}
              />
              <YAxis 
                stroke="#64748B"
                tick={{ fill: '#64748B' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1A1F2E', 
                  border: '1px solid #2D3748',
                  borderRadius: '8px',
                  color: '#E2E8F0'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg_price" 
                stroke="#00D4FF" 
                strokeWidth={2}
                name="Preço Médio"
              />
              <Line 
                type="monotone" 
                dataKey="min_price" 
                stroke="#00FF88" 
                strokeWidth={2}
                name="Preço Mínimo"
              />
              <Line 
                type="monotone" 
                dataKey="max_price" 
                stroke="#FFB800" 
                strokeWidth={2}
                name="Preço Máximo"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
