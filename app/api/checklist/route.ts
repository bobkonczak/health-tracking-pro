import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import { DailyEntry } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const body: DailyEntry = await request.json();

    // Check if Supabase is properly configured - if not, use mock response
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Using mock mode - no database configured');
      return NextResponse.json({
        success: true,
        data: {
          id: 'mock-id-' + Date.now(),
          ...body,
        },
        message: 'Checklist saved (mock mode - no database)'
      });
    }

    // Convert DailyEntry to database format
    const dbEntry = {
      date: body.date,
      user_name: body.user,
      no_sugar: body.checklist.noSugar,
      no_alcohol: body.checklist.noAlcohol,
      fasting_time: body.checklist.fastingTime,
      fasting_points: body.checklist.fastingPoints,
      training: body.checklist.training,
      morning_routine: body.checklist.morningRoutine,
      sauna: body.checklist.sauna,
      steps_10k: body.checklist.steps10k,
      supplements: body.checklist.supplements,
      weighed_in: body.checklist.weighedIn,
      calories_tracked: body.checklist.caloriesTracked,
      daily_points: body.dailyPoints,
      bonus_points: body.bonusPoints,
      total_points: body.totalPoints,
      streak: body.streak,
      notes: body.notes,
    };

    // Create or update entry in Supabase
    const { data, error } = await supabase!
      .from('daily_entries')
      .upsert([dbEntry], {
        onConflict: 'date,user_name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save checklist'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user') as 'Bob' | 'Paula';
    const date = searchParams.get('date');

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User parameter is required' },
        { status: 400 }
      );
    }

    // Check if Supabase is properly configured - if not, use mock data
    if (!isSupabaseConfigured()) {
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
        message: 'Mock checklist data (no database)'
      });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get entry from Supabase
    const { data: entry, error } = await supabase!
      .from('daily_entries')
      .select('*')
      .eq('user_name', user)
      .eq('date', targetDate)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Convert database entry to DailyEntry format if found
    let dailyEntry = null;
    if (entry) {
      dailyEntry = {
        id: entry.id,
        date: entry.date,
        user: entry.user_name,
        checklist: {
          noSugar: entry.no_sugar,
          noAlcohol: entry.no_alcohol,
          fastingTime: entry.fasting_time || '',
          fastingPoints: entry.fasting_points,
          training: entry.training,
          morningRoutine: entry.morning_routine,
          sauna: entry.sauna,
          steps10k: entry.steps_10k,
          supplements: entry.supplements,
          weighedIn: entry.weighed_in,
          caloriesTracked: entry.calories_tracked,
        },
        dailyPoints: entry.daily_points,
        bonusPoints: entry.bonus_points,
        totalPoints: entry.total_points,
        streak: entry.streak,
        notes: entry.notes,
      };
    }

    return NextResponse.json({
      success: true,
      data: dailyEntry,
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Check if Supabase is properly configured - if not, use mock response
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          id: body.id || 'mock-id',
          ...body,
        },
        message: 'Checklist updated (mock mode - no database)'
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required for updates' },
        { status: 400 }
      );
    }

    // Convert updates to database format
    const dbUpdates: Record<string, unknown> = {};

    if (updates.checklist) {
      Object.assign(dbUpdates, {
        no_sugar: updates.checklist.noSugar,
        no_alcohol: updates.checklist.noAlcohol,
        fasting_time: updates.checklist.fastingTime,
        fasting_points: updates.checklist.fastingPoints,
        training: updates.checklist.training,
        morning_routine: updates.checklist.morningRoutine,
        sauna: updates.checklist.sauna,
        steps_10k: updates.checklist.steps10k,
        supplements: updates.checklist.supplements,
        weighed_in: updates.checklist.weighedIn,
        calories_tracked: updates.checklist.caloriesTracked,
      });
    }

    if (updates.dailyPoints !== undefined) dbUpdates.daily_points = updates.dailyPoints;
    if (updates.bonusPoints !== undefined) dbUpdates.bonus_points = updates.bonusPoints;
    if (updates.totalPoints !== undefined) dbUpdates.total_points = updates.totalPoints;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase!
      .from('daily_entries')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update checklist' },
      { status: 500 }
    );
  }
}