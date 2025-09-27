import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    database: true,
    timestamp: new Date().toISOString(),
    message: 'Mock health check - no database required'
  });
}