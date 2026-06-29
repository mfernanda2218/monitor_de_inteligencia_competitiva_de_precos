'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Filters {
    marketplaces: string[];
    brands: string[];
    categories: string[];
    alertSeverity: string[];
}

interface FilterContextType {
    filters: Filters;
    setFilters: (newFilters: Partial<Filters>) => void;
    clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFiltersState] = useState<Filters>({
        marketplaces: searchParams.getAll('marketplace'),
        brands: searchParams.getAll('brand'),
        categories: searchParams.getAll('category'),
        alertSeverity: searchParams.getAll('severity'),
    });

    const setFilters = (newFilters: Partial<Filters>) => {
        const updated = { ...filters, ...newFilters };
        setFiltersState(updated);

        const params = new URLSearchParams();
        updated.marketplaces.forEach(m => params.append('marketplace', m));
        updated.brands.forEach(b => params.append('brand', b));
        updated.categories.forEach(c => params.append('category', c));
        updated.alertSeverity.forEach(s => params.append('severity', s));

        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        const reset: Filters = {
            marketplaces: [],
            brands: [],
            categories: [],
            alertSeverity: []
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