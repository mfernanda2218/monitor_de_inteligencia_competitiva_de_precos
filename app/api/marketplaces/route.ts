import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function GET() {
  try {
    await client.connect();
    const data = await client.get('dashboard:marketplaces');
    await client.disconnect();
    
    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error fetching marketplaces:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
