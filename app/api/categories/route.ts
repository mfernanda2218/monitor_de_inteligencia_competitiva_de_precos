// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('categories')?.split(',') || [];
    const brandFilter = searchParams.get('brands')?.split(',') || [];

    await client.connect();
    const data = await client.get('dashboard:categories');
    await client.disconnect();

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let categories = JSON.parse(data);

    // Aplicar filtro de categorias
    if (categoryFilter.length > 0) {
      const filtered: Record<string, any> = {};
      categoryFilter.forEach(c => {
        const key = Object.keys(categories).find(k => k.toUpperCase() === c.toUpperCase());
        if (key && categories[key]) {
          filtered[key] = categories[key];
        }
      });
      categories = filtered;
    }

    // Se houver filtro de marcas, filtrar categorias que contêm essas marcas
    if (brandFilter.length > 0) {
      const filtered: Record<string, any> = {};
      Object.entries(categories).forEach(([cat, data]: [string, any]) => {
        const hasBrand = data.brands?.some((b: string) =>
          brandFilter.some(f => f.toUpperCase() === b.toUpperCase())
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