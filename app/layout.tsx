import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './components/ui/Sidebar';

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
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
