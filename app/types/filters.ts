// types/filters.ts
export interface FiltersState {
    // Filtros comuns
    marketplaces: string[];
    brands: string[];
    categories: string[];
    alertSeverity: string[];
    minPrice: number | null;
    maxPrice: number | null;
    minMarketShare: number | null;
    minRecords: number | null;
    period: {
        start: string | null;
        end: string | null;
    };
    orderBy: string;
    orderDirection: 'asc' | 'desc';

    // Filtros específicos de marketplaces
    minBrands: number | null;

    // Filtros específicos de marcas
    targetBrandOnly: boolean;
}

export const defaultFilters: FiltersState = {
    marketplaces: [],
    brands: [],
    categories: [],
    alertSeverity: [],
    minPrice: null,
    maxPrice: null,
    minMarketShare: null,
    minRecords: null,
    period: { start: null, end: null },
    orderBy: 'marketShare',
    orderDirection: 'desc',
    minBrands: null,
    targetBrandOnly: false,
};