import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user') || 'Bob';

  console.log(`🔍 HEALTH METRICS API - User: ${user}`);

  try {
    if (!isSupabaseConfigured()) {
      console.error('❌ SUPABASE NOT CONFIGURED');
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured'
      }, { status: 500 });
    }

    // Get today's, yesterday's and day before yesterday's dates
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().split('T')[0];

    console.log(`🗓️ Querying dates: ${todayStr}, ${yesterdayStr}, ${dayBeforeYesterdayStr}`);

    // Fetch health metrics for the last 3 days
    const { data: healthData, error: healthError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('user_name', user)
      .in('date', [todayStr, yesterdayStr, dayBeforeYesterdayStr])
      .order('date', { ascending: false })
      .limit(3);

    if (healthError) {
      console.error('❌ HEALTH DATA QUERY ERROR:', healthError);
      throw healthError;
    }

    console.log(`✅ HEALTH DATA FOUND: ${healthData?.length || 0} records`);

    // Get user targets from user_profiles table
    const { data: profileData, error: profileError } = await supabase!
      .from('user_profiles')
      .select('target_weight, target_body_fat, target_muscle_mass')
      .eq('user_name', user)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('⚠️ No user profile found, using default targets');
    }

    // Process health data - prioritize records with complete data
    // Use the most recent record that has the most complete data
    const findBestRecord = (records: any[], field: string) => {
      // First try to find the most recent record with this field
      for (const record of records) {
        if (record[field] !== null && record[field] !== undefined) {
          return record[field];
        }
      }
      return null;
    };

    const latestData = healthData?.[0];
    const previousData = healthData?.[1];

    // Create a composite data object with the best available data for each metric
    const compositeData = {
      ...latestData,
      steps: findBestRecord(healthData, 'steps'),
      heart_rate: findBestRecord(healthData, 'heart_rate'),
      sleep_score: findBestRecord(healthData, 'sleep_score')
    };

    if (!latestData) {
      console.error(`❌ NO HEALTH DATA FOUND for ${user}`);
      return NextResponse.json({
        success: false,
        error: `No health data found for ${user}`,
        user,
        dateRange: [todayStr, yesterdayStr, dayBeforeYesterdayStr]
      }, { status: 404 });
    }

    console.log('📊 PROCESSING LATEST DATA:', {
      id: latestData.id,
      date: latestData.date,
      weight: latestData.weight,
      body_fat: latestData.body_fat,
      muscle_mass: latestData.muscle_mass,
      heart_rate: latestData.heart_rate,
      steps: latestData.steps
    });


    // Calculate trends (latest vs previous)
    const calculateTrend = (current: number | null, previous: number | null): number | undefined => {
      if (current === null || previous === null) return undefined;
      return parseFloat((current - previous).toFixed(1));
    };

    // Helper function to create health metric
    const createHealthMetric = (
      value: number | null | undefined,
      unit: string,
      target?: number,
      trend?: number
    ) => ({
      value: value ?? null,
      unit,
      target,
      trend,
      hasData: value !== null && value !== undefined,
      dataSource: latestData.data_source || 'withings',
      lastUpdated: latestData.date
    });

    const healthMetrics = {
      weight: createHealthMetric(
        latestData.weight,
        'kg',
        profileData?.target_weight || (user === 'Bob' ? 75 : 65),
        calculateTrend(latestData.weight, previousData?.weight)
      ),
      bodyFat: createHealthMetric(
        latestData.body_fat,
        '%',
        profileData?.target_body_fat || (user === 'Bob' ? 15 : 18),
        calculateTrend(latestData.body_fat, previousData?.body_fat)
      ),
      muscleMass: createHealthMetric(
        latestData.muscle_mass,
        'kg',
        profileData?.target_muscle_mass || (user === 'Bob' ? 70 : 48),
        calculateTrend(latestData.muscle_mass, previousData?.muscle_mass)
      ),
      waterPercentage: createHealthMetric(
        latestData.water_percentage,
        '%',
        undefined,
        calculateTrend(latestData.water_percentage, previousData?.water_percentage)
      ),
      boneMass: createHealthMetric(
        latestData.bone_mass,
        'kg',
        undefined,
        calculateTrend(latestData.bone_mass, previousData?.bone_mass)
      ),
      visceralFat: createHealthMetric(
        latestData.visceral_fat,
        'level',
        undefined,
        calculateTrend(latestData.visceral_fat, previousData?.visceral_fat)
      ),
      steps: createHealthMetric(
        compositeData.steps,
        'steps',
        10000
      ),
      heartRate: createHealthMetric(
        compositeData.heart_rate,
        'bpm'
      ),
      sleepScore: createHealthMetric(
        compositeData.sleep_score,
        '/100'
      ),
      unknownType91: createHealthMetric(
        latestData.measurement_type_91,
        'unknown'
      ),
      unknownType155: createHealthMetric(
        latestData.measurement_type_155,
        'unknown'
      ),
      isLoading: false,
      error: null,
      lastSynced: latestData.last_synced
    };

    console.log('✅ HEALTH METRICS SUCCESSFULLY PROCESSED');

    return NextResponse.json({
      success: true,
      data: healthMetrics,
      meta: {
        user,
        dataDate: latestData.date,
        recordsFound: healthData.length,
        hasTargets: !!profileData
      }
    });

  } catch (error) {
    console.error('❌ HEALTH METRICS API FAILED:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      user
    }, { status: 500 });
  }
}