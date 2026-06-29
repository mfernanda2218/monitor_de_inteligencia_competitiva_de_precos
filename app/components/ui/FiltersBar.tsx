// components/ui/FiltersBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FiltersState } from '../../types/filters';

interface FilterOption {
    value: string;
    label: string;
}

interface FiltersBarProps {
    filters: FiltersState;
    onFilterChange: (filters: Partial<FiltersState>) => void;
    onClearFilters: () => void;
    options?: {
        marketplaces: FilterOption[];
        categories: FilterOption[];
        brands: FilterOption[];
    };
    mode?: 'brands' | 'marketplaces';
    totalResults?: number;
    isLoading?: boolean;
}

type FilterKey = 'marketplaces' | 'categories' | 'brands';

export default function FiltersBar({
    filters,
    onFilterChange,
    onClearFilters,
    options = { marketplaces: [], categories: [], brands: [] },
    mode = 'brands',
    totalResults,
    isLoading = false,
}: FiltersBarProps) {
    const [localFilters, setLocalFilters] = useState<FiltersState>(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key: keyof FiltersState, value: any) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        onFilterChange(updated);
    };

    const handleClear = () => {
        onClearFilters();
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'period') {
            return !!(value?.start || value?.end);
        }
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        if (key === 'orderBy' || key === 'orderDirection') {
            return false;
        }
        return value !== null && value !== '' && value !== false;
    });

    const addItem = (key: FilterKey, value: string) => {
        const current = localFilters[key] || [];
        if (!current.includes(value)) {
            const updated = [...current, value];
            handleChange(key, updated);
        }
    };

    const removeItem = (key: FilterKey, value: string) => {
        const current = localFilters[key] || [];
        if (Array.isArray(current)) {
            const updated = current.filter((item: string) => item !== value);
            handleChange(key, updated);
        }
    };

    const orderOptions = [
        { value: 'marketShare', label: 'Market Share' },
        { value: 'avgPrice', label: 'Preço Médio' },
        { value: 'count', label: 'Volume' },
        { value: 'coverage', label: 'Cobertura' },
        { value: 'brandCount', label: 'Nº Marcas' },
    ];

    return (
        <div className="card mb-lg" style={{ padding: '16px 20px' }}>
            {/* Título e contador */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#111827'
                    }}>
                        Filtros
                    </span>
                    {!isLoading && totalResults !== undefined && (
                        <span style={{
                            fontSize: '0.78rem',
                            color: '#6B7280',
                            fontWeight: 500
                        }}>
                            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
                        </span>
                    )}
                    {hasActiveFilters && (
                        <button
                            onClick={handleClear}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#6B7280',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#FEE2E2';
                                e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#6B7280';
                            }}
                        >
                            Limpar todos
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros em linha - estilo dashboard */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                alignItems: 'flex-start'
            }}>
                {/* Marketplaces */}
                <div style={{ minWidth: '200px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        Marketplaces
                    </label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('marketplaces', e.target.value)}
                        className="control"
                        style={{ minWidth: '170px' }}
                    >
                        <option value="">Selecione...</option>
                        {options.marketplaces.map((mp) => (
                            <option
                                key={mp.value}
                                value={mp.value}
                                disabled={localFilters.marketplaces.includes(mp.value)}
                            >
                                {mp.label}
                            </option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {localFilters.marketplaces.map((mp) => (
                            <span
                                key={mp}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#E0F2FE',
                                    color: '#0369A1',
                                    fontSize: '0.68rem',
                                    fontWeight: 500,
                                    padding: '2px 8px',
                                    borderRadius: '9999px'
                                }}
                            >
                                {mp}
                                <X
                                    size={14}
                                    style={{ cursor: 'pointer', opacity: 0.6 }}
                                    onClick={() => removeItem('marketplaces', mp)}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Categorias */}
                <div style={{ minWidth: '180px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        Categorias
                    </label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('categories', e.target.value)}
                        className="control"
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">Selecione...</option>
                        {options.categories.map((cat) => (
                            <option
                                key={cat.value}
                                value={cat.value}
                                disabled={localFilters.categories.includes(cat.value)}
                            >
                                {cat.label}
                            </option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {localFilters.categories.map((cat) => (
                            <span
                                key={cat}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    fontSize: '0.68rem',
                                    fontWeight: 500,
                                    padding: '2px 8px',
                                    borderRadius: '9999px'
                                }}
                            >
                                {cat}
                                <X
                                    size={14}
                                    style={{ cursor: 'pointer', opacity: 0.6 }}
                                    onClick={() => removeItem('categories', cat)}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Marcas (apenas para marketplaces) */}
                {mode === 'marketplaces' && options.brands.length > 0 && (
                    <div style={{ minWidth: '180px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#6B7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                        }}>
                            Marcas
                        </label>
                        <select
                            value=""
                            onChange={(e) => e.target.value && addItem('brands', e.target.value)}
                            className="control"
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">Selecione...</option>
                            {options.brands.map((brand) => (
                                <option
                                    key={brand.value}
                                    value={brand.value}
                                    disabled={localFilters.brands.includes(brand.value)}
                                >
                                    {brand.label}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                            {localFilters.brands.map((brand) => (
                                <span
                                    key={brand}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: '#F3E8FF',
                                        color: '#7E22CE',
                                        fontSize: '0.68rem',
                                        fontWeight: 500,
                                        padding: '2px 8px',
                                        borderRadius: '9999px'
                                    }}
                                >
                                    {brand}
                                    <X
                                        size={14}
                                        style={{ cursor: 'pointer', opacity: 0.6 }}
                                        onClick={() => removeItem('brands', brand)}
                                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Samsung Toggle */}
                <div style={{ minWidth: '150px', display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '18px' }}>
                    <label style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap'
                    }}>
                        {mode === 'brands' ? 'Apenas SAMSUNG' : 'Presença SAMSUNG'}
                    </label>
                    <button
                        onClick={() => handleChange('targetBrandOnly', !localFilters.targetBrandOnly)}
                        style={{
                            position: 'relative',
                            width: '38px',
                            height: '22px',
                            background: localFilters.targetBrandOnly ? '#2563EB' : '#D1D5DB',
                            border: 'none',
                            borderRadius: '11px',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease',
                            flexShrink: 0
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                top: '2px',
                                left: localFilters.targetBrandOnly ? '18px' : '2px',
                                width: '18px',
                                height: '18px',
                                background: 'white',
                                borderRadius: '50%',
                                transition: 'transform 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                        />
                    </button>
                </div>

                {/* Price Range */}
                <div style={{ minWidth: '180px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        Faixa de Preço
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                            type="number"
                            placeholder="Mín"
                            value={localFilters.minPrice ?? ''}
                            onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                            className="control"
                            style={{ width: '80px', minWidth: '70px' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>-</span>
                        <input
                            type="number"
                            placeholder="Máx"
                            value={localFilters.maxPrice ?? ''}
                            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                            className="control"
                            style={{ width: '80px', minWidth: '70px' }}
                        />
                    </div>
                </div>

                {/* Market Share */}
                <div style={{ minWidth: '140px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        Share mínimo (%)
                    </label>
                    <input
                        type="number"
                        placeholder="Ex: 5"
                        min={0}
                        max={100}
                        value={localFilters.minMarketShare ?? ''}
                        onChange={(e) => handleChange('minMarketShare', e.target.value ? Number(e.target.value) : null)}
                        className="control"
                        style={{ width: '100px' }}
                    />
                </div>

                {/* Min Records */}
                <div style={{ minWidth: '140px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        Registros ≥
                    </label>
                    <input
                        type="number"
                        placeholder="Ex: 1000"
                        min={0}
                        value={localFilters.minRecords ?? ''}
                        onChange={(e) => handleChange('minRecords', e.target.value ? Number(e.target.value) : null)}
                        className="control"
                        style={{ width: '100px' }}
                    />
                </div>

                {/* Min Brands (apenas para marketplaces) */}
                {mode === 'marketplaces' && (
                    <div style={{ minWidth: '140px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#6B7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '4px'
                        }}>
                            Nº marcas ≥
                        </label>
                        <input
                            type="number"
                            placeholder="Ex: 3"
                            min={0}
                            value={localFilters.minBrands ?? ''}
                            onChange={(e) => handleChange('minBrands', e.target.value ? Number(e.target.value) : null)}
                            className="control"
                            style={{ width: '100px' }}
                        />
                    </div>
                )}

                {/* Ordenação */}
                <div style={{ minWidth: '180px' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                    }}>
                        Ordenar por
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <select
                            value={localFilters.orderBy}
                            onChange={(e) => handleChange('orderBy', e.target.value)}
                            className="control"
                            style={{ flex: 1, minWidth: '120px' }}
                        >
                            {orderOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleChange('orderDirection', localFilters.orderDirection === 'asc' ? 'desc' : 'asc')}
                            className="control"
                            style={{
                                width: '38px',
                                minWidth: '38px',
                                padding: '6px 8px',
                                textAlign: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            {localFilters.orderDirection === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}