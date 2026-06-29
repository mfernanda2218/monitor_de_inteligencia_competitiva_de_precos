// types/filters.ts
export interface FiltersState {
    // Filtros comuns
    marketplaces: string[];
    brands: string[];
    categories: string[];
    alertSeverity: string[];
    minPrice: number | null;
    maxPrice: number | null;
    period: {
        start: string | null;
        end: string | null;
    };
    orderBy: string;
    orderDirection: 'asc' | 'desc';

    // Filtro específico de marcas
    targetBrandOnly: boolean;
}

export const defaultFilters: FiltersState = {
    marketplaces: [],
    brands: [],
    categories: [],
    alertSeverity: [],
    minPrice: null,
    maxPrice: null,
    period: { start: null, end: null },
    orderBy: 'marketShare',
    orderDirection: 'desc',
    targetBrandOnly: false,
};