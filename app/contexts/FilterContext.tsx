// contexts/FilterContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiltersState, defaultFilters } from '../types/filters';
import LoadingState from '../components/shared/LoadingState';

interface FilterContextType {
    filters: FiltersState;
    setFilters: (newFilters: Partial<FiltersState>) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

function FilterProviderInternal({ children }: { children: ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFiltersState] = useState<FiltersState>(() => ({
        marketplaces: searchParams.getAll('marketplace'),
        brands: searchParams.getAll('brand'),
        categories: searchParams.getAll('category'),
        alertSeverity: searchParams.getAll('severity'),
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
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
        syncUrl(updated);
    };

    const clearFilters = () => {
        const reset: FiltersState = {
            ...defaultFilters,
            orderBy: filters.orderBy,
            orderDirection: filters.orderDirection,
        };
        setFiltersState(reset);
        syncUrl(reset);
    };

    const syncUrl = (filtersToSync: FiltersState) => {
        const params = new URLSearchParams();

        filtersToSync.marketplaces.forEach(m => params.append('marketplace', m));
        filtersToSync.brands.forEach(b => params.append('brand', b));
        filtersToSync.categories.forEach(c => params.append('category', c));
        filtersToSync.alertSeverity.forEach(s => params.append('severity', s));

        if (filtersToSync.minPrice !== null) params.set('minPrice', String(filtersToSync.minPrice));
        if (filtersToSync.maxPrice !== null) params.set('maxPrice', String(filtersToSync.maxPrice));
        if (filtersToSync.period.start) params.set('periodStart', filtersToSync.period.start);
        if (filtersToSync.period.end) params.set('periodEnd', filtersToSync.period.end);
        if (filtersToSync.orderBy) params.set('orderBy', filtersToSync.orderBy);
        if (filtersToSync.orderDirection) params.set('orderDirection', filtersToSync.orderDirection);
        if (filtersToSync.targetBrandOnly) params.set('targetBrandOnly', 'true');

        const queryString = params.toString();
        router.push(queryString ? `?${queryString}` : '?', { scroll: false });
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

    return (
        <FilterContext.Provider value={{ filters, setFilters, clearFilters, hasActiveFilters }}>
            {children}
        </FilterContext.Provider>
    );
}

export function FilterProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<LoadingState message="Carregando filtros..." />}>
            <FilterProviderInternal>{children}</FilterProviderInternal>
        </Suspense>
    );
}

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) throw new Error('useFilters must be used within FilterProvider');
    return context;
};