// app/api/brands/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = getFiltersFromRequest(searchParams);

    const client = await getRedisClient();
    const data = await client.get('dashboard:brands');

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let brands = JSON.parse(data);

    // Aplicar filtro de marcas (se houver)
    if (filters.brands.length > 0) {
      const filtered: Record<string, any> = {};
      filters.brands.forEach(b => {
        const key = Object.keys(brands).find(k => k.toUpperCase() === b.toUpperCase());
        if (key && brands[key]) {
          filtered[key] = brands[key];
        }
      });
      brands = filtered;
    }

    // Se houver filtro de marketplaces, filtrar marcas que estão nesses marketplaces
    if (filters.marketplaces.length > 0) {
      const filtered: Record<string, any> = {};
      Object.entries(brands).forEach(([brand, data]: [string, any]) => {
        // Verifica se a marca está presente em algum dos marketplaces filtrados
        const hasMarketplace = data.marketplaces?.some((mp: string) =>
          filters.marketplaces.some(f => f.toUpperCase() === mp.toUpperCase())
        );
        if (hasMarketplace) {
          filtered[brand] = data;
        }
      });
      brands = filtered;
    }

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}