import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET() {
  try {
    await client.connect();
    const data = await client.get('dashboard:sku_metrics');
    const fallbackData = await client.get('dashboard:top_skus');
    await client.disconnect();

    if (data) {
      const skuMetrics = JSON.parse(data);
      if (Array.isArray(skuMetrics) && skuMetrics.length > 0) {
        return NextResponse.json(skuMetrics);
      }
    }

    if (fallbackData) {
      const skus = JSON.parse(fallbackData);
      return NextResponse.json(Array.isArray(skus) ? skus.map((sku: string) => ({
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
      })) : []);
    }

    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching SKU metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
