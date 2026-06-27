'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Tags,
    Store,
    Package,
    TrendingUp,
    Bell
} from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/';
        return pathname?.startsWith(path);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Menu</h2>
                <p>Monitor de Preços</p>
            </div>

            <nav className="sidebar-nav">
                <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                    <LayoutDashboard size={20} strokeWidth={2} />
                    <span>Dashboard</span>
                </Link>

                <Link href="/brands" className={`nav-item ${isActive('/brands') ? 'active' : ''}`}>
                    <Tags size={20} strokeWidth={2} />
                    <span>Análise de Marcas</span>
                </Link>

                <Link href="/marketplaces" className={`nav-item ${isActive('/marketplaces') ? 'active' : ''}`}>
                    <Store size={20} strokeWidth={2} />
                    <span>Marketplaces</span>
                </Link>

                <Link href="/skus" className={`nav-item ${isActive('/skus') ? 'active' : ''}`}>
                    <Package size={20} strokeWidth={2} />
                    <span>Top SKUs</span>
                </Link>

                <Link href="/timeline" className={`nav-item ${isActive('/timeline') ? 'active' : ''}`}>
                    <TrendingUp size={20} strokeWidth={2} />
                    <span>Linha do Tempo</span>
                </Link>

                <Link href="/alerts" className={`nav-item ${isActive('/alerts') ? 'active' : ''}`}>
                    <Bell size={20} strokeWidth={2} />
                    <span>Alertas</span>
                </Link>
            </nav>
        </aside>
    );
}