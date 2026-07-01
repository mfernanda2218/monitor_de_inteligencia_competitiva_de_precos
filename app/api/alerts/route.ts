// app/api/alerts/route.ts
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = getFiltersFromRequest(searchParams);

    const client = await getRedisClient();
    const data = await client.get('dashboard:alerts');

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    let alerts = JSON.parse(data);

    // Aplicar filtro de severidade
    if (filters.alertSeverity.length > 0) {
      alerts = alerts.filter((a: any) => filters.alertSeverity.includes(a.severity));
    }

    // Aplicar filtro de marcas
    if (filters.brands.length > 0) {
      alerts = alerts.filter((a: any) => {
        if (!a.brand) return false;
        return filters.brands.some(b => a.brand.toUpperCase() === b.toUpperCase());
      });
    }

    // Aplicar filtro de marketplaces (se os alertas tiverem essa informação)
    if (filters.marketplaces.length > 0) {
      alerts = alerts.filter((a: any) => {
        if (!a.marketplace) return true; // mantém se não tiver marketplace
        return filters.marketplaces.some(m => a.marketplace.toUpperCase() === m.toUpperCase());
      });
    }

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}