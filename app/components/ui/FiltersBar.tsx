// components/ui/FiltersBar.tsx - Trecho atualizado com PriceRangeFilter
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FiltersState } from '../../types/filters';
import PriceRangeFilter from './PriceRangeFilter';

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

const severityOptions = [
    { value: 'danger', label: 'Crítico', color: '#DC2626', bg: '#FEE2E2' },
    { value: 'warning', label: 'Atenção', color: '#D97706', bg: '#FEF3C7' },
    { value: 'success', label: 'Sucesso', color: '#059669', bg: '#DCFCE7' },
    { value: 'info', label: 'Info', color: '#0891B2', bg: '#E0F2FE' }
];

const orderOptions = [
    { value: 'marketShare', label: 'Market Share' },
    { value: 'avgPrice', label: 'Preço Médio' },
    { value: 'count', label: 'Volume' },
    { value: 'coverage', label: 'Cobertura' },
    { value: 'brandCount', label: 'Nº Marcas' },
];

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

    const handleChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
        onFilterChange(updated);
    };

    const handlePriceMinChange = (value: number | null) => {
        handleChange('minPrice', value);
    };

    const handlePriceMaxChange = (value: number | null) => {
        handleChange('maxPrice', value);
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

    const removeSeverity = (value: string) => {
        const current = localFilters.alertSeverity || [];
        const updated = current.filter((item: string) => item !== value);
        handleChange('alertSeverity', updated);
    };

    const getSeverityStyle = (severity: string) => {
        const found = severityOptions.find(s => s.value === severity);
        return found || severityOptions[0];
    };

    return (
        <div className="card mb-lg" style={{ padding: '12px 16px' }}>
            {/* Título e contador */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
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

            {/* Linha única de filtros principais */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 16px',
                alignItems: 'flex-end',
                marginBottom: '8px'
            }}>
                {/* Severidade */}
                {mode === 'brands' && (
                    <div style={{ minWidth: '150px', flex: '0 1 auto' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: '#6B7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '2px'
                        }}>
                            Severidade
                        </label>
                        <select
                            value=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    const current = localFilters.alertSeverity || [];
                                    if (!current.includes(e.target.value)) {
                                        handleChange('alertSeverity', [...current, e.target.value]);
                                    }
                                }
                            }}
                            className="control"
                            style={{ width: '100%', minWidth: '120px' }}
                        >
                            <option value="">Selecione...</option>
                            {severityOptions.map((s) => (
                                <option
                                    key={s.value}
                                    value={s.value}
                                    disabled={localFilters.alertSeverity?.includes(s.value)}
                                >
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                            {localFilters.alertSeverity?.map((s) => {
                                const style = getSeverityStyle(s);
                                return (
                                    <span
                                        key={s}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                            background: style.bg,
                                            color: style.color,
                                            fontSize: '0.6rem',
                                            fontWeight: 500,
                                            padding: '1px 6px',
                                            borderRadius: '9999px'
                                        }}
                                    >
                                        {style.label}
                                        <X
                                            size={11}
                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                            onClick={() => removeSeverity(s)}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                        />
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Marketplaces */}
                <div style={{ minWidth: '160px', flex: '0 1 auto' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px'
                    }}>
                        Marketplaces
                    </label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('marketplaces', e.target.value)}
                        className="control"
                        style={{ width: '100%', minWidth: '140px' }}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                        {localFilters.marketplaces.map((mp) => (
                            <span
                                key={mp}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: '#E0F2FE',
                                    color: '#0369A1',
                                    fontSize: '0.6rem',
                                    fontWeight: 500,
                                    padding: '1px 6px',
                                    borderRadius: '9999px'
                                }}
                            >
                                {mp}
                                <X
                                    size={11}
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
                <div style={{ minWidth: '150px', flex: '0 1 auto' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px'
                    }}>
                        Categorias
                    </label>
                    <select
                        value=""
                        onChange={(e) => e.target.value && addItem('categories', e.target.value)}
                        className="control"
                        style={{ width: '100%', minWidth: '120px' }}
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                        {localFilters.categories.map((cat) => (
                            <span
                                key={cat}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    background: '#DCFCE7',
                                    color: '#15803D',
                                    fontSize: '0.6rem',
                                    fontWeight: 500,
                                    padding: '1px 6px',
                                    borderRadius: '9999px'
                                }}
                            >
                                {cat}
                                <X
                                    size={11}
                                    style={{ cursor: 'pointer', opacity: 0.6 }}
                                    onClick={() => removeItem('categories', cat)}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                />
                            </span>
                        ))}
                    </div>
                </div>

                {/* Faixa de Preço - NOVO componente estilo Tableau */}
                <div style={{ minWidth: '200px', flex: '0 1 auto' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px'
                    }}>
                        Faixa de Preço
                    </label>
                    <PriceRangeFilter
                        minValue={filters.minPrice}
                        maxValue={filters.maxPrice}
                        onMinChange={handlePriceMinChange}
                        onMaxChange={handlePriceMaxChange}
                    />
                </div>

                {/* Marcas (apenas para marketplaces) */}
                {mode === 'marketplaces' && options.brands.length > 0 && (
                    <div style={{ minWidth: '150px', flex: '0 1 auto' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: '#6B7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '2px'
                        }}>
                            Marcas
                        </label>
                        <select
                            value=""
                            onChange={(e) => e.target.value && addItem('brands', e.target.value)}
                            className="control"
                            style={{ width: '100%', minWidth: '120px' }}
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '2px' }}>
                            {localFilters.brands.map((brand) => (
                                <span
                                    key={brand}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: '#F3E8FF',
                                        color: '#7E22CE',
                                        fontSize: '0.6rem',
                                        fontWeight: 500,
                                        padding: '1px 6px',
                                        borderRadius: '9999px'
                                    }}
                                >
                                    {brand}
                                    <X
                                        size={11}
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

                {/* Ordenação */}
                <div style={{ minWidth: '180px', flex: '0 1 auto' }}>
                    <label style={{
                        display: 'block',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '2px'
                    }}>
                        Ordenar por
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <select
                            value={localFilters.orderBy}
                            onChange={(e) => handleChange('orderBy', e.target.value)}
                            className="control"
                            style={{ flex: 1, minWidth: '130px' }}
                        >
                            {orderOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleChange('orderDirection', localFilters.orderDirection === 'asc' ? 'desc' : 'asc')}
                            className="control"
                            style={{
                                width: '34px',
                                minWidth: '34px',
                                padding: '4px 6px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {localFilters.orderDirection === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                {/* Toggle Samsung */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: '0 1 auto',
                    paddingBottom: '2px'
                }}>
                    <label style={{
                        fontSize: '0.65rem',
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
                            width: '34px',
                            height: '20px',
                            background: localFilters.targetBrandOnly ? '#2563EB' : '#D1D5DB',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease',
                            flexShrink: 0
                        }}
                    >
                        <span
                            style={{
                                position: 'absolute',
                                top: '2px',
                                left: localFilters.targetBrandOnly ? '16px' : '2px',
                                width: '16px',
                                height: '16px',
                                background: 'white',
                                borderRadius: '50%',
                                transition: 'transform 0.3s ease',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                        />
                    </button>
                    {localFilters.targetBrandOnly && (
                        <span style={{
                            fontSize: '0.6rem',
                            color: '#2563EB',
                            fontWeight: 500
                        }}>
                            ✓
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}