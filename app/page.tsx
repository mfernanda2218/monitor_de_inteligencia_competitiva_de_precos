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
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px', color: '#00D4FF' }}>
          Price Intelligence Monitor
        </h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>
          Competitive price analysis dashboard • Last updated: {summary?.processed_at ? new Date(summary.processed_at).toLocaleString() : 'N/A'}
        </p>
      </header>

      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_records?.toLocaleString() || 0}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_brands || 0}</div>
          <div className="stat-label">Brands</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_marketplaces || 0}</div>
          <div className="stat-label">Marketplaces</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{summary?.total_skus || 0}</div>
          <div className="stat-label">SKUs Tracked</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '40px' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/brands" className="btn btn-primary">
              Analyze Brands →
            </Link>
            <Link href="/marketplaces" className="btn btn-secondary">
              View Marketplaces →
            </Link>
            <Link href="/alerts" className="btn btn-secondary">
              Check Alerts →
            </Link>
            <Link href="/timeline" className="btn btn-secondary">
              Price Timeline →
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Categories</h2>
          <div style={{ color: '#64748B' }}>
            <p style={{ marginBottom: '12px' }}>Total Categories: <span style={{ color: '#00FF88', fontWeight: 600 }}>{summary?.total_categories || 0}</span></p>
            <p>Explore detailed category analysis in the dedicated sections.</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#00D4FF' }}>Executive Summary</h2>
        <p style={{ color: '#E2E8F0', lineHeight: 1.8 }}>
          This dashboard provides real-time competitive intelligence on pricing across multiple marketplaces.
          Monitor {summary?.total_records?.toLocaleString() || 0} price points from {summary?.total_brands || 0} brands
          across {summary?.total_marketplaces || 0} marketplaces. Use the navigation above to dive deeper into specific
          brand performance, marketplace coverage, and price alerts.
        </p>
      </div>
    </div>
  );
}
