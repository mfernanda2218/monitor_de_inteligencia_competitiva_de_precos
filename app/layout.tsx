// app/layout.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Sidebar from './components/ui/Sidebar';
import { FilterProvider } from './contexts/FilterContext';

export const metadata: Metadata = {
  title: 'Price Intelligence Monitor',
  description: 'Competitive price intelligence dashboard',
};

// Componente de loading simples sem styled-jsx
function LayoutLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px',
      color: '#6B7280'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span>Carregando...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="dashboard-root">
          <Sidebar />
          <main className="main-content">
            <div className="content-area">
              <Suspense fallback={<LayoutLoader />}>
                <FilterProvider>
                  {children}
                </FilterProvider>
              </Suspense>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}