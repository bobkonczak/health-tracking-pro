import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

// iOS Health data webhook endpoint for Pipedream integration
export async function POST(request: NextRequest) {
  try {
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

    // Check if Supabase is properly configured - if not, use mock response
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          id: 'mock-health-' + Date.now(),
          ...body,
          autoUpdates: {
            steps10k: (metrics?.steps || 0) >= 10000,
            weighedIn: !!metrics?.weight,
          }
        },
        message: 'Health data saved (mock mode - no database)'
      });
    }

    // Prepare health metrics data for real database
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
      const updates: Record<string, unknown> = {};

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

    return NextResponse.json({
      success: true,
      data: {
        healthMetrics: healthData,
        dailyEntry: dailyEntry,
        autoUpdates: {
          steps10k: (metrics.steps || 0) >= 10000,
          weighedIn: !!metrics.weight,
        }
      },
      message: 'Health data processed successfully'
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
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const days = parseInt(searchParams.get('days') || '7');

    if (!user || (user !== 'Bob' && user !== 'Paula')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing user parameter' },
        { status: 400 }
      );
    }

    // Check if Supabase is properly configured - if not, use mock data
    if (!isSupabaseConfigured()) {
      const mockData = {
        user,
        dateRange: {
          start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
          totalDays: days,
          averageSteps: user === 'Bob' ? 10500 : 8800,
          daysWithWeight: 5,
          totalPoints: user === 'Bob' ? 84 : 76
        }
      };

      return NextResponse.json({
        success: true,
        data: mockData,
        message: 'Mock health data (no database)'
      });
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