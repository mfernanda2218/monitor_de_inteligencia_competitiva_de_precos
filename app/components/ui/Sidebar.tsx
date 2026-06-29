'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Tags,
    Store,
    Package,
    TrendingUp,
    Bell,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} strokeWidth={2} /> },
    { path: '/brands', label: 'Análise de Marcas', icon: <Tags size={20} strokeWidth={2} /> },
    { path: '/marketplaces', label: 'Marketplaces', icon: <Store size={20} strokeWidth={2} /> },
    { path: '/skus', label: 'Top SKUs', icon: <Package size={20} strokeWidth={2} /> },
    { path: '/timeline', label: 'Linha do Tempo', icon: <TrendingUp size={20} strokeWidth={2} /> },
    { path: '/alerts', label: 'Alertas', icon: <Bell size={20} strokeWidth={2} /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        // Atualiza a classe no main-content quando o estado muda
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            if (isCollapsed) {
                mainContent.classList.add('main-content-expanded');
            } else {
                mainContent.classList.remove('main-content-expanded');
            }
        }
    }, [isCollapsed]);

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    return (
        <aside
            className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
            style={{
                width: isCollapsed ? '72px' : '280px',
                transition: 'width 0.25s ease',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div className="sidebar-header" style={{
                padding: isCollapsed ? '1.5rem 0.75rem' : '2rem 1.75rem 1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: isCollapsed ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isCollapsed ? '8px' : '0'
            }}>
                {!isCollapsed && (
                    <div>
                        <h1 style={{
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            color: '#111827',
                            margin: 0,
                            letterSpacing: '-0.02em',
                            whiteSpace: 'nowrap'
                        }}>
                            Price Intel
                        </h1>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            marginTop: '0.15rem',
                            whiteSpace: 'nowrap'
                        }}>
                            Monitor de Preços
                        </p>
                    </div>
                )}
                {isCollapsed && (
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#111827'
                    }}>
                        PI
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F3F4F6';
                        e.currentTarget.style.color = '#111827';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6B7280';
                    }}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav" style={{
                padding: isCollapsed ? '0.75rem' : '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
            }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${active ? 'active' : ''}`}
                            style={{
                                padding: isCollapsed ? '0.9rem' : '0.9rem 1.25rem',
                                color: active ? '#2563EB' : '#4b5563',
                                textDecoration: 'none',
                                borderRadius: '12px',
                                fontWeight: active ? 600 : 500,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: isCollapsed ? '0' : '12px',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                background: active ? '#EFF6FF' : 'transparent',
                                border: '1px solid',
                                borderColor: active ? '#BFDBFE' : 'transparent',
                                position: 'relative',
                                minHeight: '44px'
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = '#F9FAFB';
                                    e.currentTarget.style.color = '#111827';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#4b5563';
                                }
                            }}
                        >
                            <span style={{
                                flexShrink: 0,
                                color: active ? '#2563EB' : '#6B7280',
                                opacity: active ? 1 : 0.85
                            }}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {item.label}
                                </span>
                            )}
                            {active && !isCollapsed && (
                                <span style={{
                                    position: 'absolute',
                                    right: '12px',
                                    width: '6px',
                                    height: '6px',
                                    background: '#2563EB',
                                    borderRadius: '50%'
                                }} />
                            )}
                            {active && isCollapsed && (
                                <span style={{
                                    position: 'absolute',
                                    right: '4px',
                                    width: '4px',
                                    height: '20px',
                                    background: '#2563EB',
                                    borderRadius: '2px'
                                }} />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}