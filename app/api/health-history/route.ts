import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user') || 'Bob';
  const startDate = searchParams.get('startDate') || '2024-09-15';
  const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

  console.log(`🔍 HEALTH HISTORY API - User: ${user}, Date Range: ${startDate} to ${endDate}`);

  try {
    if (!isSupabaseConfigured()) {
      console.error('❌ SUPABASE NOT CONFIGURED');
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 });
    }

    // Fetch all health metrics within date range
    const { data: healthData, error: healthError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('user_name', user)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (healthError) {
      console.error('❌ HEALTH HISTORY QUERY ERROR:', healthError);
      throw healthError;
    }

    console.log(`✅ HEALTH HISTORY FOUND: ${healthData?.length || 0} records`);

    // Calculate date range and missing dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create complete date range
    const allDates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    // Create map of existing data
    const dataMap = new Map();
    healthData?.forEach(record => {
      dataMap.set(record.date, record);
    });

    // Build complete dataset with missing data indicators
    const completeData = allDates.map(date => {
      const record = dataMap.get(date);
      if (record) {
        return {
          date,
          weight: record.weight,
          body_fat: record.body_fat,
          muscle_mass: record.muscle_mass,
          water_percentage: record.water_percentage,
          bone_mass: record.bone_mass,
          visceral_fat: record.visceral_fat,
          steps: record.steps,
          heart_rate: record.heart_rate,
          sleep_score: record.sleep_score,
          data_source: record.data_source,
          last_synced: record.last_synced,
          hasData: true
        };
      } else {
        return {
          date,
          weight: null,
          body_fat: null,
          muscle_mass: null,
          water_percentage: null,
          bone_mass: null,
          visceral_fat: null,
          steps: null,
          heart_rate: null,
          sleep_score: null,
          data_source: null,
          last_synced: null,
          hasData: false
        };
      }
    });

    // Calculate summary statistics
    const recordsWithData = healthData || [];
    const daysWithData = recordsWithData.length;
    const dataCompleteness = (daysWithData / totalDays) * 100;

    // Calculate averages for available data
    const calculateAverage = (field: string) => {
      const values = recordsWithData
        .map(record => record[field])
        .filter(value => value !== null && value !== undefined);
      return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : null;
    };

    // Find baseline (first record) and latest values
    const baseline = recordsWithData[0];
    const latest = recordsWithData[recordsWithData.length - 1];

    // Calculate progress
    const weightProgress = baseline && latest ? latest.weight - baseline.weight : null;
    const bodyFatProgress = baseline && latest ? latest.body_fat - baseline.body_fat : null;

    // Calculate steps goal achievement
    const stepsGoal = 10000;
    const daysWithSteps = recordsWithData.filter(record => record.steps !== null);
    const goalAchievements = daysWithSteps.filter(record => record.steps >= stepsGoal);
    const goalAchievementRate = daysWithSteps.length > 0 ? (goalAchievements.length / daysWithSteps.length) * 100 : 0;

    // Find best/worst days
    const bestStepsDay = recordsWithData.reduce((best, current) =>
      (current.steps && (!best.steps || current.steps > best.steps)) ? current : best, {});
    const bestWeightDay = recordsWithData.reduce((best, current) =>
      (current.weight && (!best.weight || current.weight < best.weight)) ? current : best, {});

    const summary = {
      totalDays,
      daysWithData,
      dataCompleteness: Math.round(dataCompleteness * 10) / 10,
      averages: {
        weight: calculateAverage('weight'),
        body_fat: calculateAverage('body_fat'),
        muscle_mass: calculateAverage('muscle_mass'),
        steps: calculateAverage('steps'),
        heart_rate: calculateAverage('heart_rate')
      },
      progress: {
        weight: weightProgress,
        body_fat: bodyFatProgress,
        weightChange: weightProgress ? (weightProgress > 0 ? 'gained' : 'lost') : null,
        bodyFatChange: bodyFatProgress ? (bodyFatProgress > 0 ? 'increased' : 'decreased') : null
      },
      goals: {
        stepsGoalAchievementRate: Math.round(goalAchievementRate * 10) / 10,
        totalGoalAchievements: goalAchievements.length,
        totalDaysWithSteps: daysWithSteps.length
      },
      milestones: {
        bestStepsDay: bestStepsDay.steps ? {
          date: bestStepsDay.date,
          steps: bestStepsDay.steps
        } : null,
        bestWeightDay: bestWeightDay.weight ? {
          date: bestWeightDay.date,
          weight: bestWeightDay.weight
        } : null
      },
      baseline: baseline ? {
        date: baseline.date,
        weight: baseline.weight,
        body_fat: baseline.body_fat
      } : null,
      latest: latest ? {
        date: latest.date,
        weight: latest.weight,
        body_fat: latest.body_fat
      } : null
    };

    // Prepare chart data
    const chartData = {
      weight: recordsWithData
        .filter(record => record.weight !== null)
        .map(record => ({ date: record.date, value: record.weight })),
      bodyFat: recordsWithData
        .filter(record => record.body_fat !== null)
        .map(record => ({ date: record.date, value: record.body_fat })),
      steps: recordsWithData
        .filter(record => record.steps !== null)
        .map(record => ({ date: record.date, value: record.steps })),
      heartRate: recordsWithData
        .filter(record => record.heart_rate !== null)
        .map(record => ({ date: record.date, value: record.heart_rate }))
    };

    console.log('✅ HEALTH HISTORY SUCCESSFULLY PROCESSED');

    return NextResponse.json({
      success: true,
      data: completeData,
      summary,
      chartData,
      meta: {
        user,
        startDate,
        endDate,
        totalRecords: healthData?.length || 0,
        dateRange: `${startDate} to ${endDate}`
      }
    });

  } catch (error) {
    console.error('❌ HEALTH HISTORY API FAILED:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      user,
      dateRange: `${startDate} to ${endDate}`
    }, { status: 500 });
  }
}