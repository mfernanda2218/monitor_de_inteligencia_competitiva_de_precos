import { NextResponse } from 'next/server';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = getFiltersFromRequest(searchParams);

        // Busca os dados originais
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/brands`, {
            cache: 'no-store'
        });
        const brandsData = await res.json();

        let filteredBrands = Object.entries(brandsData || {}).map(([brand, value]: [string, any]) => ({
            brand,
            count: value.count || 0,
            avg_spot_price: value.avg_spot_price || 0,
            market_share: 0
        }));

        // Aplica filtro de marcas
        if (filters.brands.length > 0) {
            filteredBrands = filteredBrands.filter(b =>
                filters.brands.includes(b.brand.toUpperCase())
            );
        }

        return NextResponse.json(filteredBrands);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao filtrar marcas' }, { status: 500 });
    }
}