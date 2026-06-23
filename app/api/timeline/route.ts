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
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU parameter required' }, { status: 400 });
    }
    
    await client.connect();
    const data = await client.get(`dashboard:timeline:${sku}`);
    await client.disconnect();
    
    if (!data) {
      return NextResponse.json({ error: 'No data found for SKU' }, { status: 404 });
    }
    
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
