import { NextResponse } from 'next/server';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = getFiltersFromRequest(searchParams);

        const res = await fetch('http://localhost:3000/api/skus', {
            cache: 'no-store'
        });
        let skus = await res.json();

        if (!Array.isArray(skus)) skus = [];

        // Filtro por marcas
        if (filters.brands.length > 0) {
            skus = skus.filter((sku: any) =>
                sku.target_brand && filters.brands.includes(sku.target_brand.toUpperCase())
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
        return NextResponse.json({ error: 'Erro ao filtrar SKUs' }, { status: 500 });
    }
}