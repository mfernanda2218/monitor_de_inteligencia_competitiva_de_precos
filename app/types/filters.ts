// types/filters.ts
export interface FiltersState {
    // Filtros comuns
    marketplaces: string[];
    categories: string[];
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

    // Filtros específicos de marcas
    brands: string[];
    targetBrandOnly: boolean;

    // Filtros específicos de marketplaces
    minBrands: number | null;
}

export const defaultFilters: FiltersState = {
    marketplaces: [],
    categories: [],
    minPrice: null,
    maxPrice: null,
    minMarketShare: null,
    minRecords: null,
    period: { start: null, end: null },
    orderBy: 'marketShare',
    orderDirection: 'desc',
    brands: [],
    targetBrandOnly: false,
    minBrands: null,
};