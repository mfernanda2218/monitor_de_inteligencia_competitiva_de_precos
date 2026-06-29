// components/ui/FiltersBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { FiltersState } from '@/app/types/filters';

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

const orderOptions = [
    { value: 'marketShare', label: 'Market Share' },
    { value: 'avgPrice', label: 'Preço Médio' },
    { value: 'count', label: 'Volume' },
    { value: 'coverage', label: 'Cobertura' },
    { value: 'brandCount', label: 'Nº Marcas' },
    { value: 'minPrice', label: 'Preço Mínimo' },
    { value: 'maxPrice', label: 'Preço Máximo' },
    { value: 'priceVariation', label: 'Variação' },
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
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    // Atualizar filtros locais quando os filtros externos mudarem
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleChange = (key: keyof FiltersState, value: any) => {
        const updated = { ...localFilters, [key]: value };
        setLocalFilters(updated);
    };

    const handleApply = () => {
        onFilterChange(localFilters);
        setIsExpanded(false);
    };

    const handleClear = () => {
        onClearFilters();
        setIsExpanded(false);
    };

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (key === 'period') {
            return value?.start || value?.end;
        }
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== '' && value !== false;
    });

    const activeCount = Object.entries(filters).reduce((count, [key, value]) => {
        if (key === 'period') {
            return count + (value?.start ? 1 : 0) + (value?.end ? 1 : 0);
        }
        if (Array.isArray(value)) return count + value.length;
        if (value !== null && value !== '' && value !== false && key !== 'orderBy' && key !== 'orderDirection') {
            return count + 1;
        }
        return count;
    }, 0);

    const handleMultiSelectChange = (key: 'marketplaces' | 'categories' | 'brands', value: string) => {
        const current = localFilters[key] || [];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        handleChange(key, updated);
    };

    const removeFilter = (key: keyof FiltersState, value?: string) => {
        if (Array.isArray(localFilters[key]) && value) {
            const updated = (localFilters[key] as string[]).filter(v => v !== value);
            handleChange(key, updated);
        } else {
            handleChange(key, null);
        }
    };

    // Renderizar tags de filtros ativos
    const renderActiveTags = () => {
        const tags: React.ReactNode[] = [];

        // Marketplaces
        if (filters.marketplaces.length > 0) {
            filters.marketplaces.forEach(mp => {
                tags.push(
                    <span key={`mp-${mp}`} className="filter-tag filter-tag-blue">
                        {mp}
                        <X size={12} onClick={() => removeFilter('marketplaces', mp)} />
                    </span>
                );
            });
        }

        // Categorias
        if (filters.categories.length > 0) {
            filters.categories.forEach(cat => {
                tags.push(
                    <span key={`cat-${cat}`} className="filter-tag filter-tag-green">
                        {cat}
                        <X size={12} onClick={() => removeFilter('categories', cat)} />
                    </span>
                );
            });
        }

        // Marcas
        if (filters.brands && filters.brands.length > 0) {
            filters.brands.forEach(brand => {
                tags.push(
                    <span key={`brand-${brand}`} className="filter-tag filter-tag-purple">
                        {brand}
                        <X size={12} onClick={() => removeFilter('brands', brand)} />
                    </span>
                );
            });
        }

        // Target Brand Only
        if (filters.targetBrandOnly) {
            tags.push(
                <span key="target-only" className="filter-tag filter-tag-success">
                    Apenas SAMSUNG
                    <X size={12} onClick={() => handleChange('targetBrandOnly', false)} />
                </span>
            );
        }

        // Price Range
        if (filters.minPrice !== null || filters.maxPrice !== null) {
            const label = `Preço: ${filters.minPrice !== null ? `R$ ${filters.minPrice}` : '0'} - ${filters.maxPrice !== null ? `R$ ${filters.maxPrice}` : '∞'}`;
            tags.push(
                <span key="price-range" className="filter-tag filter-tag-orange">
                    {label}
                    <X size={12} onClick={() => { handleChange('minPrice', null); handleChange('maxPrice', null); }} />
                </span>
            );
        }

        // Market Share
        if (filters.minMarketShare !== null) {
            tags.push(
                <span key="min-share" className="filter-tag filter-tag-orange">
                    Share ≥ {filters.minMarketShare}%
                    <X size={12} onClick={() => handleChange('minMarketShare', null)} />
                </span>
            );
        }

        // Min Records
        if (filters.minRecords !== null) {
            tags.push(
                <span key="min-records" className="filter-tag filter-tag-orange">
                    Registros ≥ {filters.minRecords}
                    <X size={12} onClick={() => handleChange('minRecords', null)} />
                </span>
            );
        }

        // Min Brands
        if (filters.minBrands !== null) {
            tags.push(
                <span key="min-brands" className="filter-tag filter-tag-orange">
                    Marcas ≥ {filters.minBrands}
                    <X size={12} onClick={() => handleChange('minBrands', null)} />
                </span>
            );
        }

        return tags;
    };

    return (
        <div className="filters-bar">
            {/* Header */}
            <div className="filters-header">
                <div className="filters-header-left">
                    <div className="filters-title" onClick={() => setIsExpanded(!isExpanded)}>
                        <Filter size={16} />
                        <span>Filtros</span>
                        {activeCount > 0 && (
                            <span className="filters-badge">{activeCount}</span>
                        )}
                        <button className="filters-toggle-btn">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                    </div>
                    {!isExpanded && activeCount > 0 && (
                        <div className="filters-tags">
                            {renderActiveTags()}
                        </div>
                    )}
                </div>
                <div className="filters-header-right">
                    {!isLoading && totalResults !== undefined && (
                        <span className="filters-results">
                            {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
                        </span>
                    )}
                    {hasActiveFilters && (
                        <button className="filters-clear-btn" onClick={handleClear}>
                            Limpar tudo
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className="filters-body">
                    <div className="filters-grid">
                        {/* Marketplaces */}
                        {options.marketplaces.length > 0 && (
                            <div className="filter-group">
                                <label>Marketplaces</label>
                                <div className="filter-chips">
                                    {options.marketplaces.map(mp => (
                                        <button
                                            key={mp.value}
                                            className={`filter-chip ${localFilters.marketplaces.includes(mp.value) ? 'active' : ''}`}
                                            onClick={() => handleMultiSelectChange('marketplaces', mp.value)}
                                        >
                                            {mp.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Categorias */}
                        {options.categories.length > 0 && (
                            <div className="filter-group">
                                <label>Categorias</label>
                                <div className="filter-chips">
                                    {options.categories.map(cat => (
                                        <button
                                            key={cat.value}
                                            className={`filter-chip ${localFilters.categories.includes(cat.value) ? 'active' : ''}`}
                                            onClick={() => handleMultiSelectChange('categories', cat.value)}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Marcas (apenas para marketplaces) */}
                        {mode === 'marketplaces' && options.brands.length > 0 && (
                            <div className="filter-group">
                                <label>Marcas</label>
                                <div className="filter-chips">
                                    {options.brands.map(brand => (
                                        <button
                                            key={brand.value}
                                            className={`filter-chip ${(localFilters.brands || []).includes(brand.value) ? 'active' : ''}`}
                                            onClick={() => handleMultiSelectChange('brands', brand.value)}
                                        >
                                            {brand.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Samsung Toggle */}
                        {mode === 'brands' && (
                            <div className="filter-group filter-group-toggle">
                                <label>Apenas SAMSUNG</label>
                                <button
                                    className={`filter-toggle ${localFilters.targetBrandOnly ? 'active' : ''}`}
                                    onClick={() => handleChange('targetBrandOnly', !localFilters.targetBrandOnly)}
                                >
                                    <span className="toggle-slider" />
                                </button>
                            </div>
                        )}

                        {mode === 'marketplaces' && (
                            <div className="filter-group filter-group-toggle">
                                <label>Presença SAMSUNG</label>
                                <button
                                    className={`filter-toggle ${localFilters.targetBrandOnly ? 'active' : ''}`}
                                    onClick={() => handleChange('targetBrandOnly', !localFilters.targetBrandOnly)}
                                >
                                    <span className="toggle-slider" />
                                </button>
                            </div>
                        )}

                        {/* Price Range */}
                        <div className="filter-group">
                            <label>Faixa de Preço</label>
                            <div className="filter-range">
                                <input
                                    type="number"
                                    placeholder="Mín"
                                    value={localFilters.minPrice ?? ''}
                                    onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : null)}
                                    className="filter-input"
                                />
                                <span className="filter-range-separator">até</span>
                                <input
                                    type="number"
                                    placeholder="Máx"
                                    value={localFilters.maxPrice ?? ''}
                                    onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : null)}
                                    className="filter-input"
                                />
                            </div>
                        </div>

                        {/* Market Share */}
                        <div className="filter-group">
                            <label>Market Share mínimo (%)</label>
                            <input
                                type="number"
                                placeholder="Ex: 5"
                                min={0}
                                max={100}
                                value={localFilters.minMarketShare ?? ''}
                                onChange={(e) => handleChange('minMarketShare', e.target.value ? Number(e.target.value) : null)}
                                className="filter-input"
                            />
                        </div>

                        {/* Min Records */}
                        <div className="filter-group">
                            <label>Volume mínimo de registros</label>
                            <input
                                type="number"
                                placeholder="Ex: 1000"
                                min={0}
                                value={localFilters.minRecords ?? ''}
                                onChange={(e) => handleChange('minRecords', e.target.value ? Number(e.target.value) : null)}
                                className="filter-input"
                            />
                        </div>

                        {/* Min Brands (apenas para marketplaces) */}
                        {mode === 'marketplaces' && (
                            <div className="filter-group">
                                <label>Nº mínimo de marcas</label>
                                <input
                                    type="number"
                                    placeholder="Ex: 3"
                                    min={0}
                                    value={localFilters.minBrands ?? ''}
                                    onChange={(e) => handleChange('minBrands', e.target.value ? Number(e.target.value) : null)}
                                    className="filter-input"
                                />
                            </div>
                        )}

                        {/* Ordenação */}
                        <div className="filter-group">
                            <label>Ordenar por</label>
                            <div className="filter-order">
                                <select
                                    value={localFilters.orderBy}
                                    onChange={(e) => handleChange('orderBy', e.target.value)}
                                    className="filter-select"
                                >
                                    {orderOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <button
                                    className="filter-order-direction"
                                    onClick={() => handleChange('orderDirection', localFilters.orderDirection === 'asc' ? 'desc' : 'asc')}
                                >
                                    {localFilters.orderDirection === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="filters-actions">
                        <button className="filters-apply-btn" onClick={handleApply}>
                            Aplicar Filtros
                        </button>
                        <button className="filters-clear-btn" onClick={handleClear}>
                            Limpar tudo
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
        .filters-bar {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filters-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .filters-title {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .filters-badge {
          background: var(--primary);
          color: white;
          font-size: 0.625rem;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: var(--radius-full);
        }

        .filters-toggle-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .filters-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          overflow: hidden;
        }

        .filter-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .filter-tag-blue {
          background: #E0F2FE;
          color: #0369A1;
        }

        .filter-tag-green {
          background: #DCFCE7;
          color: #15803D;
        }

        .filter-tag-purple {
          background: #F3E8FF;
          color: #7E22CE;
        }

        .filter-tag-orange {
          background: #FEF3C7;
          color: #B45309;
        }

        .filter-tag-success {
          background: #DCFCE7;
          color: #15803D;
        }

        .filter-tag svg {
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .filter-tag svg:hover {
          opacity: 1;
        }

        .filters-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .filters-results {
          font-size: 0.78rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .filters-clear-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .filters-clear-btn:hover {
          background: #FEE2E2;
          color: var(--danger);
        }

        .filters-body {
          padding: 16px;
          border-top: 1px solid var(--border);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .filter-chip {
          padding: 4px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: var(--surface);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .filter-chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .filter-input {
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          width: 100%;
          background: var(--surface);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }

        .filter-input:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .filter-input::placeholder {
          color: var(--text-tertiary);
        }

        .filter-range {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-range .filter-input {
          width: 80px;
        }

        .filter-range-separator {
          font-size: 0.72rem;
          color: var(--text-tertiary);
        }

        .filter-group-toggle {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }

        .filter-group-toggle label {
          margin-bottom: 0;
        }

        .filter-toggle {
          position: relative;
          width: 40px;
          height: 22px;
          background: #D1D5DB;
          border: none;
          border-radius: 11px;
          cursor: pointer;
          transition: background 0.3s ease;
          flex-shrink: 0;
        }

        .filter-toggle.active {
          background: var(--primary);
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .filter-toggle.active .toggle-slider {
          transform: translateX(18px);
        }

        .filter-select {
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          background: var(--surface);
          color: var(--text-primary);
          flex: 1;
          cursor: pointer;
        }

        .filter-select:focus {
          border-color: var(--primary);
          outline: none;
        }

        .filter-order {
          display: flex;
          gap: 4px;
        }

        .filter-order-direction {
          padding: 6px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--surface);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.78rem;
          transition: all 0.2s;
        }

        .filter-order-direction:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .filters-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          justify-content: flex-end;
        }

        .filters-apply-btn {
          padding: 8px 20px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .filters-apply-btn:hover {
          background: var(--primary-light);
        }

        @media (max-width: 768px) {
          .filters-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .filters-header-left {
            flex-wrap: wrap;
          }

          .filters-tags {
            order: 3;
            width: 100%;
          }

          .filters-header-right {
            justify-content: space-between;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .filter-range .filter-input {
            width: 100%;
          }

          .filters-actions {
            flex-direction: column;
          }

          .filters-actions button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .filter-chips {
            gap: 4px;
          }

          .filter-chip {
            font-size: 0.65rem;
            padding: 3px 8px;
          }
        }
      `}</style>
        </div>
    );
}