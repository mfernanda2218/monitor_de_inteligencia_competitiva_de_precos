import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = getFiltersFromRequest(searchParams);

    const client = await getRedisClient();
    const data = await client.get('dashboard:sku_metrics');
    const fallbackData = await client.get('dashboard:top_skus');

    let skus: any[] = [];

    if (data) {
      const skuMetrics = JSON.parse(data);
      if (Array.isArray(skuMetrics) && skuMetrics.length > 0) {
        skus = skuMetrics;
      }
    }

    if (skus.length === 0 && fallbackData) {
      const parsedFallback = JSON.parse(fallbackData);
      skus = Array.isArray(parsedFallback) ? parsedFallback.map((sku: string) => ({
        sku,
        record_count: null,
        brand_count: null,
        target_brand: null,
        target_price: null,
        market_min: null,
        market_avg: null,
        market_min_competitor: null,
        premium_vs_min: null,
        alert_severity: null
      })) : [];
    }

    if (skus.length === 0) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    // Filtro por marcas
    if (filters.brands.length > 0) {
      skus = skus.filter((sku: any) =>
        sku.target_brand && filters.brands.some(b => sku.target_brand.toUpperCase() === b.toUpperCase())
      );
    }

    // Filtro por severidade
    if (filters.alertSeverity.length > 0) {
      skus = skus.filter((sku: any) =>
        sku.alert_severity && filters.alertSeverity.includes(sku.alert_severity)
      );
    }

    return NextResponse.json(skus);
  } catch (error) {
    console.error('Error fetching SKU metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
