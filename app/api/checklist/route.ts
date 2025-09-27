import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock successful save
    return NextResponse.json({
      success: true,
      data: {
        id: 'mock-id-' + Date.now(),
        ...body,
      },
      message: 'Checklist saved (mock mode)'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save checklist' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user') as 'Bob' | 'Paula';

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User parameter is required' },
        { status: 400 }
      );
    }

    // Return mock data
    const mockEntry = {
      id: 'mock-' + user.toLowerCase(),
      date: new Date().toISOString().split('T')[0],
      user,
      checklist: {
        noSugar: false,
        noAlcohol: false,
        fastingTime: '',
        fastingPoints: 0,
        training: false,
        morningRoutine: false,
        sauna: false,
        steps10k: false,
        supplements: false,
        weighedIn: false,
        caloriesTracked: false,
      },
      dailyPoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
      streak: user === 'Bob' ? 5 : 3,
      notes: '',
    };

    return NextResponse.json({
      success: true,
      data: mockEntry,
      message: 'Mock checklist data'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock successful update
    return NextResponse.json({
      success: true,
      data: {
        id: body.id || 'mock-id',
        ...body,
      },
      message: 'Checklist updated (mock mode)'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update checklist' },
      { status: 500 }
    );
  }
}