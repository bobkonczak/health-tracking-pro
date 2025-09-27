import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user') as 'Bob' | 'Paula' | null;
    const format = searchParams.get('format') || 'csv';

    // Mock data for export
    const mockData = {
      exportInfo: {
        user: user || 'Both',
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        exportedAt: new Date().toISOString(),
        totalEntries: 30,
        totalMetrics: 25
      },
      dailyEntries: [
        {
          date: new Date().toISOString().split('T')[0],
          user_name: user || 'Bob',
          no_sugar: true,
          no_alcohol: true,
          training: true,
          total_points: 12,
          streak: 5
        }
      ],
      healthMetrics: [
        {
          date: new Date().toISOString().split('T')[0],
          user_name: user || 'Bob',
          weight: 80.5,
          steps: 12500,
          heart_rate: 65
        }
      ]
    };

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: mockData,
        message: 'Mock export data'
      });
    }

    // Simple CSV format
    const csvData = `Date,User,Points,Streak\n${new Date().toISOString().split('T')[0]},${user || 'Bob'},12,5`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="health-tracking-mock-${user || 'both'}.csv"`
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    data: {
      exportInfo: {
        type: 'weekly',
        exportedAt: new Date().toISOString(),
        totalCompetitions: 1
      },
      competitions: [{
        competition: {
          week_number: 1,
          bob_points: 84,
          paula_points: 76,
          winner: 'Bob'
        },
        entries: []
      }]
    },
    message: 'Mock competition export'
  });
}