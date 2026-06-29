// contexts/FilterContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiltersState, defaultFilters } from '../types/filters';

interface FilterContextType {
    filters: FiltersState;
    setFilters: (newFilters: Partial<FiltersState>) => void;
    clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFiltersState] = useState<FiltersState>(() => ({
        marketplaces: searchParams.getAll('marketplace'),
        brands: searchParams.getAll('brand'),
        categories: searchParams.getAll('category'),
        alertSeverity: searchParams.getAll('severity'),
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
        minMarketShare: searchParams.get('minMarketShare') ? Number(searchParams.get('minMarketShare')) : null,
        minRecords: searchParams.get('minRecords') ? Number(searchParams.get('minRecords')) : null,
        minBrands: searchParams.get('minBrands') ? Number(searchParams.get('minBrands')) : null,
        period: {
            start: searchParams.get('periodStart') || null,
            end: searchParams.get('periodEnd') || null,
        },
        orderBy: searchParams.get('orderBy') || 'marketShare',
        orderDirection: (searchParams.get('orderDirection') as 'asc' | 'desc') || 'desc',
        targetBrandOnly: searchParams.get('targetBrandOnly') === 'true',
    }));

    const setFilters = (newFilters: Partial<FiltersState>) => {
        const updated = { ...filters, ...newFilters };
        setFiltersState(updated);

        const params = new URLSearchParams();
        updated.marketplaces.forEach(m => params.append('marketplace', m));
        updated.brands.forEach(b => params.append('brand', b));
        updated.categories.forEach(c => params.append('category', c));
        updated.alertSeverity.forEach(s => params.append('severity', s));

        if (updated.minPrice !== null) params.set('minPrice', String(updated.minPrice));
        if (updated.maxPrice !== null) params.set('maxPrice', String(updated.maxPrice));
        if (updated.minMarketShare !== null) params.set('minMarketShare', String(updated.minMarketShare));
        if (updated.minRecords !== null) params.set('minRecords', String(updated.minRecords));
        if (updated.minBrands !== null) params.set('minBrands', String(updated.minBrands));
        if (updated.period.start) params.set('periodStart', updated.period.start);
        if (updated.period.end) params.set('periodEnd', updated.period.end);
        if (updated.orderBy) params.set('orderBy', updated.orderBy);
        if (updated.orderDirection) params.set('orderDirection', updated.orderDirection);
        if (updated.targetBrandOnly) params.set('targetBrandOnly', 'true');

        const queryString = params.toString();
        router.push(queryString ? `?${queryString}` : '?');
    };

    const clearFilters = () => {
        const reset: FiltersState = {
            ...defaultFilters,
            orderBy: filters.orderBy,
            orderDirection: filters.orderDirection,
        };
        setFiltersState(reset);
        router.push('?');
    };

    return (
        <FilterContext.Provider value={{ filters, setFilters, clearFilters }}>
            {children}
        </FilterContext.Provider>
    );
}

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) throw new Error('useFilters must be used within FilterProvider');
    return context;
};