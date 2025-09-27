import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

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
    const user = searchParams.get('user') as 'Bob' | 'Paula' | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    // Validate parameters
    if (user && user !== 'Bob' && user !== 'Paula') {
      return NextResponse.json(
        { success: false, error: 'Invalid user. Must be Bob or Paula' },
        { status: 400 }
      );
    }

    // Set default date range if not provided (last 30 days)
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const defaultStartDateStr = defaultStartDate.toISOString().split('T')[0];

    const finalStartDate = startDate || defaultStartDateStr;
    const finalEndDate = endDate || defaultEndDate;

    // Build query for daily entries
    let dailyEntriesQuery = supabase!
      .from('daily_entries')
      .select('*')
      .gte('date', finalStartDate)
      .lte('date', finalEndDate)
      .order('date', { ascending: false });

    if (user) {
      dailyEntriesQuery = dailyEntriesQuery.eq('user_name', user);
    }

    // Build query for health metrics
    let healthMetricsQuery = supabase!
      .from('health_metrics')
      .select('*')
      .gte('date', finalStartDate)
      .lte('date', finalEndDate)
      .order('date', { ascending: false });

    if (user) {
      healthMetricsQuery = healthMetricsQuery.eq('user_name', user);
    }

    // Execute queries
    const [{ data: dailyEntries, error: entriesError }, { data: healthMetrics, error: metricsError }] = await Promise.all([
      dailyEntriesQuery,
      healthMetricsQuery
    ]);

    if (entriesError) throw entriesError;
    if (metricsError) throw metricsError;

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: {
          exportInfo: {
            user: user || 'Both',
            dateRange: { start: finalStartDate, end: finalEndDate },
            exportedAt: new Date().toISOString(),
            totalEntries: dailyEntries.length,
            totalMetrics: healthMetrics.length
          },
          dailyEntries,
          healthMetrics
        }
      });
    }

    // Generate CSV format
    const csvData = generateCSV(dailyEntries, healthMetrics);

    // Return CSV file
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="health-tracking-${user || 'both'}-${finalStartDate}-to-${finalEndDate}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateCSV(dailyEntries: any[], healthMetrics: any[]): string {
  const csvRows: string[] = [];

  // CSV Headers
  const headers = [
    'Date',
    'User',
    'No Sugar',
    'No Alcohol',
    'Fasting Time',
    'Fasting Points',
    'Training',
    'Morning Routine',
    'Sauna',
    '10k Steps',
    'Supplements',
    'Weighed In',
    'Calories Tracked',
    'Daily Points',
    'Bonus Points',
    'Total Points',
    'Streak',
    'Weight (kg)',
    'Body Fat %',
    'Muscle Mass (kg)',
    'Water %',
    'Steps Count',
    'Heart Rate',
    'Sleep Score',
    'Notes'
  ];

  csvRows.push(headers.join(','));

  // Create a map of health metrics by date and user for easier lookup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metricsMap = new Map<string, any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  healthMetrics.forEach((metric: any) => {
    const key = `${metric.date}-${metric.user_name}`;
    metricsMap.set(key, metric);
  });

  // Process daily entries and merge with health metrics
  dailyEntries.forEach(entry => {
    const metricKey = `${entry.date}-${entry.user_name}`;
    const metric = metricsMap.get(metricKey);

    const row = [
      entry.date,
      entry.user_name,
      entry.no_sugar ? 'Yes' : 'No',
      entry.no_alcohol ? 'Yes' : 'No',
      entry.fasting_time || '',
      entry.fasting_points || 0,
      entry.training ? 'Yes' : 'No',
      entry.morning_routine ? 'Yes' : 'No',
      entry.sauna ? 'Yes' : 'No',
      entry.steps_10k ? 'Yes' : 'No',
      entry.supplements ? 'Yes' : 'No',
      entry.weighed_in ? 'Yes' : 'No',
      entry.calories_tracked ? 'Yes' : 'No',
      entry.daily_points || 0,
      entry.bonus_points || 0,
      entry.total_points || 0,
      entry.streak || 0,
      metric?.weight || '',
      metric?.body_fat || '',
      metric?.muscle_mass || '',
      metric?.water_percentage || '',
      metric?.steps || '',
      metric?.heart_rate || '',
      metric?.sleep_score || '',
      `"${(entry.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
    ];

    csvRows.push(row.join(','));
  });

  // Add health metrics that don't have corresponding daily entries
  healthMetrics.forEach(metric => {
    const entryExists = dailyEntries.some(entry =>
      entry.date === metric.date && entry.user_name === metric.user_name
    );

    if (!entryExists) {
      const row = [
        metric.date,
        metric.user_name,
        '', '', '', 0, '', '', '', '', '', '', '', 0, 0, 0, 0, // Empty checklist data
        metric.weight || '',
        metric.body_fat || '',
        metric.muscle_mass || '',
        metric.water_percentage || '',
        metric.steps || '',
        metric.heart_rate || '',
        metric.sleep_score || '',
        '' // No notes
      ];

      csvRows.push(row.join(','));
    }
  });

  return csvRows.join('\n');
}

// Competition export endpoint
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
    const { type = 'weekly', weekNumber, startDate, endDate } = body;

    let query = supabase!.from('competitions').select('*');

    if (type === 'weekly' && weekNumber) {
      query = query.eq('week_number', weekNumber);
    } else if (startDate && endDate) {
      query = query.gte('start_date', startDate).lte('end_date', endDate);
    }

    const { data: competitions, error } = await query.order('week_number', { ascending: false });

    if (error) throw error;

    // Get corresponding daily entries for the competition period
    const competitionEntries = await Promise.all(
      competitions.map(async (comp) => {
        const { data: entries, error: entriesError } = await supabase!
          .from('daily_entries')
          .select('*')
          .gte('date', comp.start_date)
          .lte('date', comp.end_date)
          .order('date', { ascending: false });

        if (entriesError) throw entriesError;

        return {
          competition: comp,
          entries
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        exportInfo: {
          type,
          exportedAt: new Date().toISOString(),
          totalCompetitions: competitions.length
        },
        competitions: competitionEntries
      }
    });

  } catch (error) {
    console.error('Error exporting competition data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export competition data' },
      { status: 500 }
    );
  }
}