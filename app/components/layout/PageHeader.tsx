import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: {
    label: string;
    href: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  breadcrumb, 
  actions,
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={className} style={{ marginBottom: '16px' }}>
      {breadcrumb && (
        <Link
          href={breadcrumb.href}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#2563EB',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontWeight: 500,
            marginBottom: '8px',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1D4ED8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#2563EB';
          }}
        >
          ← {breadcrumb.label}
        </Link>
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: subtitle ? '4px' : 0,
            lineHeight: 1.2
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: '0.82rem',
              color: '#6B7280',
              margin: 0,
              lineHeight: 1.5
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
