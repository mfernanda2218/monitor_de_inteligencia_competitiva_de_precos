// app/api/timeline/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku');
    const brandFilter = searchParams.get('brands')?.split(',') || [];

    if (!sku) {
      return NextResponse.json([]);
    }

    await client.connect();

    // Buscar timeline do SKU
    const timelineData = await client.get(`dashboard:timeline:${sku}`);

    await client.disconnect();

    if (!timelineData) {
      console.log(`No timeline data found for SKU: ${sku}`);
      return NextResponse.json([]);
    }

    let timeline = JSON.parse(timelineData);

    if (!Array.isArray(timeline)) {
      console.log(`Invalid timeline data for SKU: ${sku}`);
      return NextResponse.json([]);
    }

    // Ordenar por data (mais antiga para mais nova)
    const parseDateForSort = (dateStr: string) => {
      try {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(dateStr);
      } catch {
        return new Date(0);
      }
    };

    timeline.sort((a: any, b: any) => {
      return parseDateForSort(a.date).getTime() - parseDateForSort(b.date).getTime();
    });

    return NextResponse.json(timeline);

  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json([]);
  }
}