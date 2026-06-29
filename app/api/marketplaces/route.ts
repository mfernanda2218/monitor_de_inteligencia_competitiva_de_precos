// app/api/marketplaces/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplaceFilter = searchParams.get('marketplaces')?.split(',') || [];
    const brandFilter = searchParams.get('brands')?.split(',') || [];

    await client.connect();
    const data = await client.get('dashboard:marketplaces');
    await client.disconnect();

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let marketplaces = JSON.parse(data);

    // Aplicar filtro de marketplaces
    if (marketplaceFilter.length > 0) {
      const filtered: Record<string, any> = {};
      marketplaceFilter.forEach(m => {
        const key = Object.keys(marketplaces).find(k => k.toUpperCase() === m.toUpperCase());
        if (key && marketplaces[key]) {
          filtered[key] = marketplaces[key];
        }
      });
      marketplaces = filtered;
    }

    // Se houver filtro de marcas, filtrar marketplaces que contêm essas marcas
    if (brandFilter.length > 0) {
      const filtered: Record<string, any> = {};
      Object.entries(marketplaces).forEach(([mp, data]: [string, any]) => {
        const hasBrand = data.brands?.some((b: string) =>
          brandFilter.some(f => f.toUpperCase() === b.toUpperCase())
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