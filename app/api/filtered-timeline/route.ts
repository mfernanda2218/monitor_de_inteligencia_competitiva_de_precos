import { NextResponse } from 'next/server';
import { getFiltersFromRequest } from '@/lib/filters';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters = getFiltersFromRequest(searchParams);
        const sku = searchParams.get('sku');

        if (!sku) {
            return NextResponse.json([]);
        }

        const res = await fetch(`http://localhost:3000/api/timeline?sku=${encodeURIComponent(sku)}`, {
            cache: 'no-store'
        });
        const timeline = await res.json();

        return NextResponse.json(Array.isArray(timeline) ? timeline : []);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao filtrar timeline' }, { status: 500 });
    }
}