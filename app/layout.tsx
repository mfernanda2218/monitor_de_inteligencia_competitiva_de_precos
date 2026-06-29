// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './components/ui/Sidebar';
import { FilterProvider } from './contexts/FilterContext';

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
              <FilterProvider>
                {children}
              </FilterProvider>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}