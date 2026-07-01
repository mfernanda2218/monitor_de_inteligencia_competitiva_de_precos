// app/api/marketplaces/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = getFiltersFromRequest(searchParams);

    const client = await getRedisClient();
    const data = await client.get('dashboard:marketplaces');

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let marketplaces = JSON.parse(data);

    // Aplicar filtro de marketplaces
    if (filters.marketplaces.length > 0) {
      const filtered: Record<string, any> = {};
      filters.marketplaces.forEach(m => {
        const key = Object.keys(marketplaces).find(k => k.toUpperCase() === m.toUpperCase());
        if (key && marketplaces[key]) {
          filtered[key] = marketplaces[key];
        }
      });
      marketplaces = filtered;
    }

    // Se houver filtro de marcas, filtrar marketplaces que contêm essas marcas
    if (filters.brands.length > 0) {
      const filtered: Record<string, any> = {};
      Object.entries(marketplaces).forEach(([mp, data]: [string, any]) => {
        const hasBrand = data.brands?.some((b: string) =>
          filters.brands.some(f => f.toUpperCase() === b.toUpperCase())
        );
        if (hasBrand) {
          filtered[mp] = data;
        }
      });
      marketplaces = filtered;
    }

    return NextResponse.json(marketplaces);
  } catch (error) {
    console.error('Error fetching marketplaces:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}