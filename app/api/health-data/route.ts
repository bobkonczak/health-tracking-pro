import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock successful save
    return NextResponse.json({
      success: true,
      data: {
        id: 'mock-health-' + Date.now(),
        ...body,
        autoUpdates: {
          steps10k: (body.metrics?.steps || 0) >= 10000,
          weighedIn: !!body.metrics?.weight,
        }
      },
      message: 'Health data saved (mock mode)'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save health data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user || (user !== 'Bob' && user !== 'Paula')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing user parameter' },
        { status: 400 }
      );
    }

    // Mock health data
    const mockData = {
      user,
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      healthMetrics: [
        {
          date: new Date().toISOString().split('T')[0],
          weight: user === 'Bob' ? 80.5 : 65.2,
          body_fat: user === 'Bob' ? 15.2 : 22.1,
          steps: user === 'Bob' ? 12500 : 8200,
          heart_rate: user === 'Bob' ? 65 : 68,
          sleep_score: user === 'Bob' ? 85 : 78
        }
      ],
      summary: {
        totalDays: 7,
        averageSteps: user === 'Bob' ? 10500 : 8800,
        daysWithWeight: 5,
        totalPoints: user === 'Bob' ? 84 : 76
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Mock health data'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health data' },
      { status: 500 }
    );
  }
}