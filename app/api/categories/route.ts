// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = getFiltersFromRequest(searchParams);

    const client = await getRedisClient();
    const data = await client.get('dashboard:categories');

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let categories = JSON.parse(data);

    // Aplicar filtro de categorias
    if (filters.categories.length > 0) {
      const filtered: Record<string, any> = {};
      filters.categories.forEach(c => {
        const key = Object.keys(categories).find(k => k.toUpperCase() === c.toUpperCase());
        if (key && categories[key]) {
          filtered[key] = categories[key];
        }
      });
      categories = filtered;
    }

    // Se houver filtro de marcas, filtrar categorias que contêm essas marcas
    if (filters.brands.length > 0) {
      const filtered: Record<string, any> = {};
      Object.entries(categories).forEach(([cat, data]: [string, any]) => {
        const hasBrand = data.brands?.some((b: string) =>
          filters.brands.some(f => f.toUpperCase() === b.toUpperCase())
        );
        if (hasBrand) {
          filtered[cat] = data;
        }
      });
      categories = filtered;
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}