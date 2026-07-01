import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const client = await getRedisClient();
    const data = await client.get('dashboard:summary');
    
    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }
    
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
