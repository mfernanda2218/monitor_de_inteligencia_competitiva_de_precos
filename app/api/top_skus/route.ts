// app/api/top_skus/route.ts
import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandFilter = searchParams.get('brands')?.split(',') || [];
    const marketplaceFilter = searchParams.get('marketplaces')?.split(',') || [];
    const categoryFilter = searchParams.get('categories')?.split(',') || [];
    const severityFilter = searchParams.get('severity')?.split(',') || [];
    const searchQuery = searchParams.get('search') || '';
    const period = searchParams.get('period') || '30d';

    await client.connect();

    // Buscar métricas de SKU
    let skuMetrics = [];
    const skuMetricsData = await client.get('dashboard:sku_metrics');

    if (skuMetricsData) {
      skuMetrics = JSON.parse(skuMetricsData);
    }

    // Se não houver métricas, buscar apenas a lista de top SKUs
    let topSkus = [];
    if (skuMetrics.length === 0) {
      const topSkusData = await client.get('dashboard:top_skus');
      if (topSkusData) {
        topSkus = JSON.parse(topSkusData);
        // Converter para o formato de métricas
        skuMetrics = topSkus.map((sku: string) => ({
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
        }));
      }
    }

    await client.disconnect();

    // Aplicar filtros
    let filteredSkus = skuMetrics;

    // Filtro por marca
    if (brandFilter.length > 0) {
      filteredSkus = filteredSkus.filter((sku: any) => {
        // Verificar se o SKU tem a marca alvo ou se a marca está na lista
        if (sku.target_brand) {
          return brandFilter.some(b => sku.target_brand.toUpperCase() === b.toUpperCase());
        }
        // Se não tiver target_brand, manter (não filtrar)
        return true;
      });
    }

    // Filtro por severidade de alerta
    if (severityFilter.length > 0) {
      filteredSkus = filteredSkus.filter((sku: any) => {
        if (!sku.alert_severity) return false;
        return severityFilter.includes(sku.alert_severity);
      });
    }

    // Filtro por busca (SKU)
    if (searchQuery) {
      filteredSkus = filteredSkus.filter((sku: any) =>
        sku.sku?.toUpperCase().includes(searchQuery.toUpperCase())
      );
    }

    // Extrair apenas os SKUs
    const resultSkus = filteredSkus.map((sku: any) => sku.sku);

    // Se não houver SKUs filtrados, retornar array vazio
    return NextResponse.json(resultSkus);

  } catch (error) {
    console.error('Error fetching top SKUs:', error);
    // Em caso de erro, retornar array vazio ao invés de erro 500
    return NextResponse.json([]);
  }
}