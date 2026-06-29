'use client';

import { useState, useEffect } from 'react';
import { useFilters } from '../../contexts/FilterContext';
import { X } from 'lucide-react';

export default function FilterBar() {
    const { filters, setFilters, clearFilters } = useFilters();
    const [options, setOptions] = useState({
        marketplaces: [] as string[],
        brands: [] as string[],
        categories: [] as string[]
    });

    // Carregar opções de filtro do backend
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [brandsRes, marketplacesRes, categoriesRes] = await Promise.all([
                    fetch('/api/brands'),
                    fetch('/api/marketplaces'),
                    fetch('/api/categories')
                ]);

                const brandsData = await brandsRes.json();
                const marketplacesData = await marketplacesRes.json();
                const categoriesData = await categoriesRes.json();

                setOptions({
                    brands: Object.keys(brandsData || {}),
                    marketplaces: Object.keys(marketplacesData || {}),
                    categories: Object.keys(categoriesData || {})
                });
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchOptions();
    }, []);

    const severityOptions = [
        { value: 'danger', label: 'Crítico' },
        { value: 'warning', label: 'Atenção' },
        { value: 'info', label: 'Info' },
        { value: 'success', label: 'Sucesso' }
    ];

    const addItem = (key: 'marketplaces' | 'brands' | 'categories' | 'alertSeverity', value: string) => {
        if (!filters[key].includes(value)) {
            setFilters({ [key]: [...filters[key], value] });
        }
    };

    const removeItem = (key: 'marketplaces' | 'brands' | 'categories' | 'alertSeverity', value: string) => {
        setFilters({ [key]: filters[key].filter((item: string) => item !== value) });
    };

    const hasActiveFilters = filters.marketplaces.length > 0 ||
        filters.brands.length > 0 ||
        filters.categories.length > 0 ||
        filters.alertSeverity.length > 0;

    return (
        <div className="card mb-lg" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>

                {/* Marketplaces */}
                <div style={{ minWidth: '200px' }}>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Marketplaces</label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('marketplaces', e.target.value)}
                        className="control"
                        style={{ minWidth: '170px' }}
                    >
                        <option value="">Selecione...</option>
                        {options.marketplaces.map(mp => (
                            <option
                                key={mp}
                                value={mp}
                                disabled={filters.marketplaces.includes(mp)}
                            >
                                {mp}
                            </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {filters.marketplaces.map(mp => (
                            <span key={mp} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                {mp}
                                <X size={14} className="cursor-pointer" onClick={() => removeItem('marketplaces', mp)} />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Marcas */}
                <div style={{ minWidth: '180px' }}>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Marcas</label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('brands', e.target.value)}
                        className="control"
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">Selecione...</option>
                        {options.brands.map(b => (
                            <option
                                key={b}
                                value={b}
                                disabled={filters.brands.includes(b)}
                            >
                                {b}
                            </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {filters.brands.map(b => (
                            <span key={b} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                                {b}
                                <X size={14} className="cursor-pointer" onClick={() => removeItem('brands', b)} />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Categorias */}
                <div style={{ minWidth: '180px' }}>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Categorias</label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('categories', e.target.value)}
                        className="control"
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">Selecione...</option>
                        {options.categories.map(c => (
                            <option
                                key={c}
                                value={c}
                                disabled={filters.categories.includes(c)}
                            >
                                {c}
                            </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {filters.categories.map(c => (
                            <span key={c} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                                {c}
                                <X size={14} className="cursor-pointer" onClick={() => removeItem('categories', c)} />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Severidade de Alerta */}
                <div style={{ minWidth: '150px' }}>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Severidade</label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('alertSeverity', e.target.value)}
                        className="control"
                        style={{ minWidth: '130px' }}
                    >
                        <option value="">Selecione...</option>
                        {severityOptions.map(s => (
                            <option
                                key={s.value}
                                value={s.value}
                                disabled={filters.alertSeverity.includes(s.value)}
                            >
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {filters.alertSeverity.map(s => {
                            const label = severityOptions.find(opt => opt.value === s)?.label || s;
                            return (
                                <span key={s} className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">
                                    {label}
                                    <X size={14} className="cursor-pointer" onClick={() => removeItem('alertSeverity', s)} />
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Botão Limpar */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="btn btn-secondary"
                        style={{ height: '38px', marginTop: '22px' }}
                    >
                        Limpar Todos
                    </button>
                )}
            </div>

            {/* Indicador de filtros ativos */}
            {hasActiveFilters && (
                <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                }}>
                    <span>Filtros ativos: </span>
                    {filters.brands.length > 0 && (
                        <span className="badge badge-info">Marcas: {filters.brands.length}</span>
                    )}
                    {filters.marketplaces.length > 0 && (
                        <span className="badge badge-info" style={{ marginLeft: '4px' }}>
                            Marketplaces: {filters.marketplaces.length}
                        </span>
                    )}
                    {filters.categories.length > 0 && (
                        <span className="badge badge-info" style={{ marginLeft: '4px' }}>
                            Categorias: {filters.categories.length}
                        </span>
                    )}
                    {filters.alertSeverity.length > 0 && (
                        <span className="badge badge-warning" style={{ marginLeft: '4px' }}>
                            Severidade: {filters.alertSeverity.length}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}