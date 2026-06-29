import { NextResponse } from 'next/server';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = getFiltersFromRequest(searchParams);

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/marketplaces`, {
            cache: 'no-store'
        });
        const data = await res.json();

        let filtered = Object.entries(data || {}).map(([marketplace, value]: [string, any]) => ({
            marketplace,
            count: value.count || 0,
            avg_spot_price: value.avg_spot_price || 0,
            brand_count: value.brand_count || 0,
            brands: value.brands || []
        }));

        if (filters.marketplaces.length > 0) {
            filtered = filtered.filter(mp =>
                filters.marketplaces.includes(mp.marketplace)
            );
        }

        return NextResponse.json(filtered);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erro ao filtrar marketplaces' }, { status: 500 });
    }
}