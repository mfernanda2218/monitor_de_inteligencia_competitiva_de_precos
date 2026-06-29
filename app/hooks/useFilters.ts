// hooks/useFilters.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiltersState, defaultFilters } from '../types/filters';

export function useFilters(initialFilters?: Partial<FiltersState>) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFiltersState] = useState<FiltersState>(() => {
        const params = new URLSearchParams(searchParams);

        return {
            marketplaces: params.getAll('marketplace'),
            categories: params.getAll('category'),
            brands: params.getAll('brand'),
            alertSeverity: params.getAll('severity'),
            minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : null,
            maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : null,
            minMarketShare: params.get('minMarketShare') ? Number(params.get('minMarketShare')) : null,
            minRecords: params.get('minRecords') ? Number(params.get('minRecords')) : null,
            minBrands: params.get('minBrands') ? Number(params.get('minBrands')) : null,
            period: {
                start: params.get('periodStart') || null,
                end: params.get('periodEnd') || null,
            },
            orderBy: params.get('orderBy') || 'marketShare',
            orderDirection: (params.get('orderDirection') as 'asc' | 'desc') || 'desc',
            targetBrandOnly: params.get('targetBrandOnly') === 'true',
            ...initialFilters,
        };
    });

    const setFilters = useCallback((newFilters: Partial<FiltersState>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
    }, []);

    const clearFilters = useCallback(() => {
        setFiltersState({
            ...defaultFilters,
            orderBy: filters.orderBy,
            orderDirection: filters.orderDirection,
        });
    }, [filters.orderBy, filters.orderDirection]);

    // Sincronizar com URL
    useEffect(() => {
        const params = new URLSearchParams();

        filters.marketplaces.forEach(m => params.append('marketplace', m));
        filters.categories.forEach(c => params.append('category', c));
        filters.brands?.forEach(b => params.append('brand', b));
        filters.alertSeverity?.forEach(s => params.append('severity', s));

        if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
        if (filters.minMarketShare !== null) params.set('minMarketShare', String(filters.minMarketShare));
        if (filters.minRecords !== null) params.set('minRecords', String(filters.minRecords));
        if (filters.minBrands !== null) params.set('minBrands', String(filters.minBrands));
        if (filters.period.start) params.set('periodStart', filters.period.start);
        if (filters.period.end) params.set('periodEnd', filters.period.end);
        if (filters.orderBy) params.set('orderBy', filters.orderBy);
        if (filters.orderDirection) params.set('orderDirection', filters.orderDirection);
        if (filters.targetBrandOnly) params.set('targetBrandOnly', 'true');

        const queryString = params.toString();
        router.push(queryString ? `?${queryString}` : '?', { scroll: false });
    }, [filters, router]);

    const hasFilters = Object.entries(filters).some(([key, value]) => {
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

    return {
        filters,
        setFilters,
        clearFilters,
        hasFilters,
    };
}