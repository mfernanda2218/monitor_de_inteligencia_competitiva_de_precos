// app/layout.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Sidebar from './components/ui/Sidebar';
import { FilterProvider } from './contexts/FilterContext';
import LoadingState from './components/shared/LoadingState';

export const metadata: Metadata = {
  title: 'Price Intelligence Monitor',
  description: 'Competitive price intelligence dashboard',
};

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
              <Suspense fallback={<LoadingState message="Carregando..." />}>
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