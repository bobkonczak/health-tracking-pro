import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

// iOS Health data webhook endpoint
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 503 }
      );
    }
    const body = await request.json();
    console.log('Received health data:', body);

    // Validate the incoming data structure
    const { user, date, metrics } = body;

    if (!user || !date || !metrics) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user, date, or metrics' },
        { status: 400 }
      );
    }

    // Validate user
    if (user !== 'Bob' && user !== 'Paula') {
      return NextResponse.json(
        { success: false, error: 'Invalid user. Must be Bob or Paula' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Prepare health metrics data
    const healthMetricData = {
      date,
      user_name: user,
      weight: metrics.weight || null,
      body_fat: metrics.bodyFat || null,
      muscle_mass: metrics.muscleMass || null,
      water_percentage: metrics.waterPercentage || null,
      steps: metrics.steps || null,
      heart_rate: metrics.heartRate || null,
      sleep_score: metrics.sleepScore || null,
    };

    // Insert or update health metrics
    const { data: healthData, error: healthError } = await supabase!
      .from('health_metrics')
      .upsert([healthMetricData], {
        onConflict: 'date,user_name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (healthError) {
      console.error('Error saving health metrics:', healthError);
      return NextResponse.json(
        { success: false, error: 'Failed to save health metrics' },
        { status: 500 }
      );
    }

    // Get or create daily entry for auto-updates
    const { data: initialEntry, error: dailyError } = await supabase!
      .from('daily_entries')
      .select('*')
      .eq('date', date)
      .eq('user_name', user)
      .single();

    let dailyEntry;

    // If no daily entry exists, create one
    if (dailyError && dailyError.code === 'PGRST116') {
      const { data: newEntry, error: createError } = await supabase!
        .from('daily_entries')
        .insert([{
          date,
          user_name: user,
          steps_10k: (metrics.steps || 0) >= 10000,
          weighed_in: !!metrics.weight,
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating daily entry:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create daily entry' },
          { status: 500 }
        );
      }

      dailyEntry = newEntry;
    } else if (dailyError) {
      console.error('Error fetching daily entry:', dailyError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch daily entry' },
        { status: 500 }
      );
    } else {
      // Update existing daily entry with health-based achievements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {};

      // Auto-check steps achievement
      if (metrics.steps && metrics.steps >= 10000) {
        updates.steps_10k = true;
      }

      // Auto-check weighed in
      if (metrics.weight) {
        updates.weighed_in = true;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase!
          .from('daily_entries')
          .update(updates)
          .eq('id', initialEntry.id);

        if (updateError) {
          console.error('Error updating daily entry:', updateError);
        }
      }

      dailyEntry = initialEntry;
    }

    // Calculate and update points
    await calculateAndUpdatePoints(dailyEntry.id);

    // Update streak if this is today's entry
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      await updateUserStreak(user);
    }

    return NextResponse.json({
      success: true,
      data: {
        healthMetrics: healthData,
        dailyEntry: dailyEntry,
        autoUpdates: {
          steps10k: (metrics.steps || 0) >= 10000,
          weighedIn: !!metrics.weight,
        }
      }
    });

  } catch (error) {
    console.error('Error processing health data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve recent health data
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 503 }
      );
    }
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const days = parseInt(searchParams.get('days') || '7');

    if (!user || (user !== 'Bob' && user !== 'Paula')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing user parameter' },
        { status: 400 }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch health metrics
    const { data: healthMetrics, error: healthError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('user_name', user)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });

    if (healthError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch health metrics' },
        { status: 500 }
      );
    }

    // Fetch corresponding daily entries
    const { data: dailyEntries, error: entriesError } = await supabase!
      .from('daily_entries')
      .select('*')
      .eq('user_name', user)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: false });

    if (entriesError) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch daily entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        dateRange: { start: startDateStr, end: endDateStr },
        healthMetrics,
        dailyEntries,
        summary: {
          totalDays: healthMetrics.length,
          averageSteps: healthMetrics.reduce((sum, m) => sum + (m.steps || 0), 0) / Math.max(healthMetrics.length, 1),
          daysWithWeight: healthMetrics.filter(m => m.weight).length,
          totalPoints: dailyEntries.reduce((sum, e) => sum + (e.total_points || 0), 0)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate and update daily points
async function calculateAndUpdatePoints(entryId: string) {
  try {
    // Get the daily entry
    const { data: entry, error: fetchError } = await supabase!
      .from('daily_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (fetchError) {
      console.error('Error fetching entry for points calculation:', fetchError);
      return;
    }

    // Calculate daily points
    let dailyPoints = 0;

    if (entry.no_sugar) dailyPoints += 1;
    if (entry.no_alcohol) dailyPoints += 1;
    if (entry.fasting_points > 0) dailyPoints += entry.fasting_points;
    if (entry.training) dailyPoints += 2;
    if (entry.morning_routine) dailyPoints += 3;
    if (entry.sauna) dailyPoints += 1;
    if (entry.steps_10k) dailyPoints += 2;
    if (entry.supplements) dailyPoints += 1;
    if (entry.weighed_in) dailyPoints += 1;
    if (entry.calories_tracked) dailyPoints += 2;

    // Calculate bonus points
    let bonusPoints = 0;

    // Performance bonuses
    if (dailyPoints >= 12) bonusPoints += 5; // Gold level
    else if (dailyPoints >= 10) bonusPoints += 3; // Silver level
    else if (dailyPoints >= 8) bonusPoints += 2; // Bronze level

    // Streak bonuses
    const streak = entry.streak || 0;
    if (streak >= 15) bonusPoints += 15;
    else if (streak >= 10) bonusPoints += 10;
    else if (streak >= 7) bonusPoints += 5;
    else if (streak >= 5) bonusPoints += 3;
    else if (streak >= 3) bonusPoints += 2;

    const totalPoints = dailyPoints + bonusPoints;

    // Update the entry with calculated points
    const { error: updateError } = await supabase!
      .from('daily_entries')
      .update({
        daily_points: dailyPoints,
        bonus_points: bonusPoints,
        total_points: totalPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', entryId);

    if (updateError) {
      console.error('Error updating points:', updateError);
    }

  } catch (error) {
    console.error('Error in calculateAndUpdatePoints:', error);
  }
}

// Helper function to update user streak
async function updateUserStreak(user: string) {
  try {
    // Get recent entries to calculate current streak
    const { data: recentEntries, error: entriesError } = await supabase!
      .from('daily_entries')
      .select('date, total_points')
      .eq('user_name', user)
      .gte('total_points', 8) // Minimum points for streak
      .order('date', { ascending: false })
      .limit(30);

    if (entriesError) {
      console.error('Error fetching entries for streak calculation:', entriesError);
      return;
    }

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < recentEntries.length; i++) {
      const entryDate = new Date(recentEntries[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      // Check if entry is from expected consecutive date
      if (entryDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Update streak record
    const { data: existingStreak, error: streakFetchError } = await supabase!
      .from('streaks')
      .select('*')
      .eq('user_name', user)
      .single();

    if (streakFetchError && streakFetchError.code !== 'PGRST116') {
      console.error('Error fetching streak record:', streakFetchError);
      return;
    }

    const bestStreak = existingStreak ? Math.max(existingStreak.best_streak, currentStreak) : currentStreak;

    const { error: streakUpdateError } = await supabase!
      .from('streaks')
      .upsert([{
        user_name: user,
        current_streak: currentStreak,
        best_streak: bestStreak,
        last_activity_date: today.toISOString().split('T')[0]
      }], {
        onConflict: 'user_name'
      });

    if (streakUpdateError) {
      console.error('Error updating streak:', streakUpdateError);
    }

    // Update today's entry with current streak
    const todayStr = today.toISOString().split('T')[0];
    const { error: entryUpdateError } = await supabase!
      .from('daily_entries')
      .update({ streak: currentStreak })
      .eq('user_name', user)
      .eq('date', todayStr);

    if (entryUpdateError) {
      console.error('Error updating entry with streak:', entryUpdateError);
    }

  } catch (error) {
    console.error('Error in updateUserStreak:', error);
  }
}