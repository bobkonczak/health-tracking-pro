import { NextResponse } from 'next/server';
import { healthCheck } from '@/src/lib/supabase';

// Health check endpoint for monitoring database connectivity
export async function GET() {
  try {
    const health = await healthCheck();

    const statusCode = health.status === 'healthy' ? 200
                     : health.status === 'degraded' ? 503
                     : 500;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'offline',
      database: false,
      timestamp: new Date().toISOString(),
      details: error
    }, { status: 500 });
  }
}