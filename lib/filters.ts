// lib/filters.ts
import { FiltersState, defaultFilters } from '@/app/types/filters';

export function getFiltersFromRequest(searchParams: URLSearchParams): FiltersState {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    return {
        marketplaces: searchParams.getAll('marketplace'),
        brands: searchParams.getAll('brand'),
        categories: searchParams.getAll('category'),
        alertSeverity: searchParams.getAll('severity'),
        minPrice: minPrice !== null ? Number(minPrice) : null,
        maxPrice: maxPrice !== null ? Number(maxPrice) : null,
        period: {
            start: searchParams.get('periodStart') || null,
            end: searchParams.get('periodEnd') || null,
        },
        orderBy: searchParams.get('orderBy') || 'marketShare',
        orderDirection: (searchParams.get('orderDirection') as 'asc' | 'desc') || 'desc',
        targetBrandOnly: searchParams.get('targetBrandOnly') === 'true',
    };
}