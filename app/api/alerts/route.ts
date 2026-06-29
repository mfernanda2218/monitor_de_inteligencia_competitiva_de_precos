// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const severityFilter = searchParams.get('severity')?.split(',') || [];
    const brandFilter = searchParams.get('brands')?.split(',') || [];
    const marketplaceFilter = searchParams.get('marketplaces')?.split(',') || [];

    await client.connect();
    const data = await client.get('dashboard:alerts');
    await client.disconnect();

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let alerts = JSON.parse(data);

    // Aplicar filtro de severidade
    if (severityFilter.length > 0) {
      alerts = alerts.filter((a: any) => severityFilter.includes(a.severity));
    }

    // Aplicar filtro de marcas
    if (brandFilter.length > 0) {
      alerts = alerts.filter((a: any) => {
        if (!a.brand) return false;
        return brandFilter.some(b => a.brand.toUpperCase() === b.toUpperCase());
      });
    }

    // Aplicar filtro de marketplaces (se os alertas tiverem essa informação)
    if (marketplaceFilter.length > 0) {
      alerts = alerts.filter((a: any) => {
        if (!a.marketplace) return true; // mantém se não tiver marketplace
        return marketplaceFilter.some(m => a.marketplace.toUpperCase() === m.toUpperCase());
      });
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}