// lib/filters.ts
export interface AppFilters {
    period: string;
    marketplaces: string[];
    brands: string[];
    categories: string[];
    alertSeverity: string[];
}

export function getFiltersFromRequest(searchParams: URLSearchParams): AppFilters {
    return {
        period: searchParams.get('period') || '30d',
        marketplaces: searchParams.getAll('marketplace'),
        brands: searchParams.getAll('brand').map(b => b.toUpperCase()),
        categories: searchParams.getAll('category'),
        alertSeverity: searchParams.getAll('severity'),
    };
}