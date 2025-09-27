'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/src/types';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export interface HealthMetric {
  value: number | null;
  trend?: number;
  target?: number;
  unit: string;
  lastUpdated?: string;
  dataSource?: string;
  hasData: boolean; // Distinguishes between 0 value and no data
}

export interface HealthMetrics {
  weight: HealthMetric;
  bodyFat: HealthMetric;
  muscleMass: HealthMetric;
  waterPercentage: HealthMetric;
  boneMass: HealthMetric;
  visceralFat: HealthMetric;
  steps: HealthMetric;
  heartRate: HealthMetric;
  sleepScore: HealthMetric;
  // Unknown measurement types from Pipedream
  unknownType91: HealthMetric;
  unknownType155: HealthMetric;
  isLoading: boolean;
  error: string | null;
  lastSynced?: string;
}

// Yesterday's mock data - realistic for Bob/Paula
const getMockHealthMetrics = (user: User): HealthMetrics => {
  const createMockMetric = (value: number | null, unit: string, target?: number, trend?: number): HealthMetric => ({
    value,
    unit,
    target,
    trend,
    hasData: value !== null,
    dataSource: 'mock',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  if (user === 'Bob') {
    return {
      weight: createMockMetric(84.2, 'kg', 75, -0.3),
      bodyFat: createMockMetric(19.8, '%', 15, -0.2),
      muscleMass: createMockMetric(67.1, 'kg', 70, 0.1),
      waterPercentage: createMockMetric(58.5, '%'),
      boneMass: createMockMetric(3.2, 'kg'),
      visceralFat: createMockMetric(8, 'level'),
      steps: createMockMetric(9247, 'steps', 10000),
      heartRate: createMockMetric(68, 'bpm'),
      sleepScore: createMockMetric(78, '/100'),
      unknownType91: createMockMetric(null, 'unknown'),
      unknownType155: createMockMetric(null, 'unknown'),
      isLoading: false,
      error: null,
      lastSynced: new Date().toISOString()
    };
  } else {
    return {
      weight: createMockMetric(72.5, 'kg', 65, -0.4),
      bodyFat: createMockMetric(22.3, '%', 18, -0.3),
      muscleMass: createMockMetric(45.2, 'kg', 48, 0.2),
      waterPercentage: createMockMetric(55.8, '%'),
      boneMass: createMockMetric(2.8, 'kg'),
      visceralFat: createMockMetric(6, 'level'),
      steps: createMockMetric(8832, 'steps', 10000),
      heartRate: createMockMetric(72, 'bpm'),
      sleepScore: createMockMetric(85, '/100'),
      unknownType91: createMockMetric(null, 'unknown'),
      unknownType155: createMockMetric(null, 'unknown'),
      isLoading: false,
      error: null,
      lastSynced: new Date().toISOString()
    };
  }
};

export function useHealthMetrics(user: User): HealthMetrics & { refetch: () => Promise<void> } {
  const createEmptyMetric = (unit: string, target?: number): HealthMetric => ({
    value: null,
    unit,
    target,
    hasData: false,
    dataSource: undefined
  });

  const [data, setData] = useState<HealthMetrics>(() => ({
    weight: createEmptyMetric('kg'),
    bodyFat: createEmptyMetric('%'),
    muscleMass: createEmptyMetric('kg'),
    waterPercentage: createEmptyMetric('%'),
    boneMass: createEmptyMetric('kg'),
    visceralFat: createEmptyMetric('level'),
    steps: createEmptyMetric('steps', 10000),
    heartRate: createEmptyMetric('bpm'),
    sleepScore: createEmptyMetric('/100'),
    unknownType91: createEmptyMetric('unknown'),
    unknownType155: createEmptyMetric('unknown'),
    isLoading: true,
    error: null,
  }));

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // STOP using mock data - require real Supabase connection
      if (!isSupabaseConfigured()) {
        throw new Error('CRITICAL: Supabase not configured. Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
      }

      // Test direct query for specific record first
      console.log('🔍 TESTING DIRECT SUPABASE QUERY...');
      const targetId = 'df66d8ea-d3a7-47b0-8a45-bf90af220799';
      const { data: testRecord, error: testError } = await supabase!
        .from('health_metrics')
        .select('*')
        .eq('id', targetId)
        .single();

      if (!testError && testRecord) {
        console.log('✅ DIRECT QUERY SUCCESS - TARGET RECORD FOUND:', {
          id: testRecord.id,
          body_fat: testRecord.body_fat,
          weight: testRecord.weight,
          user: testRecord.user_name,
          date: testRecord.date
        });
      } else {
        console.warn('⚠️ Target record not found, proceeding with date-based query...');
      }

      // Get yesterday's date (health data is typically from previous day)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Also get day before yesterday for trend calculation
      const dayBeforeYesterday = new Date();
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
      const dayBeforeYesterdayStr = dayBeforeYesterday.toISOString().split('T')[0];

      // Fetch health metrics for yesterday and day before for trend calculation
      // Select ALL available fields to capture complete Withings data
      const { data: healthData, error: healthError } = await supabase!
        .from('health_metrics')
        .select(`
          *,
          data_source,
          last_synced,
          measurement_type_91,
          measurement_type_155,
          pulse_wave_velocity,
          visceral_fat,
          bone_mass,
          water_percentage
        `)
        .eq('user_name', user)
        .in('date', [yesterdayStr, dayBeforeYesterdayStr])
        .order('date', { ascending: false })
        .limit(2);

      if (healthError) throw healthError;

      // Debug: Log the actual data we received
      console.log('🔍 DEBUG: Health data from Supabase:', {
        user,
        yesterdayStr,
        dayBeforeYesterdayStr,
        healthData,
        dataCount: healthData?.length || 0
      });

      // Get user targets from user_profiles table
      const { data: profileData, error: profileError } = await supabase!
        .from('user_profiles')
        .select('target_weight, target_body_fat, target_muscle_mass')
        .eq('user_name', user)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('No user profile found, using default targets');
      }

      // Process health data
      const yesterdayData = healthData?.[0];
      const dayBeforeData = healthData?.[1];

      if (!yesterdayData) {
        // NO MOCK DATA - Fail with clear error message
        throw new Error(`CRITICAL: No health data found for ${user} on ${yesterdayStr}. Database connection working but no records exist.`);
      }

      // Calculate trends (yesterday vs day before)
      const calculateTrend = (current: number | null, previous: number | null): number | undefined => {
        if (current === null || previous === null) return undefined;
        return parseFloat((current - previous).toFixed(1));
      };

      // Debug: Log the individual data points we're processing
      console.log('🔍 DEBUG: Processing individual metrics:', {
        weight: yesterdayData.weight,
        body_fat: yesterdayData.body_fat,
        muscle_mass: yesterdayData.muscle_mass,
        water_percentage: yesterdayData.water_percentage,
        bone_mass: yesterdayData.bone_mass,
        visceral_fat: yesterdayData.visceral_fat,
        steps: yesterdayData.steps,
        heart_rate: yesterdayData.heart_rate,
        sleep_score: yesterdayData.sleep_score,
        measurement_type_91: yesterdayData.measurement_type_91,
        measurement_type_155: yesterdayData.measurement_type_155,
        data_source: yesterdayData.data_source,
        last_synced: yesterdayData.last_synced,
        date: yesterdayData.date,
        allFields: Object.keys(yesterdayData),
        totalFields: Object.keys(yesterdayData).length
      });

      // Helper function to create health metric with proper null handling
      const createHealthMetric = (
        value: number | null | undefined,
        unit: string,
        target?: number,
        trend?: number,
        dataSource?: string
      ): HealthMetric => ({
        value: value ?? null,
        unit,
        target,
        trend,
        hasData: value !== null && value !== undefined,
        dataSource: dataSource || yesterdayData.data_source || 'withings',
        lastUpdated: yesterdayData.date
      });

      const healthMetrics: HealthMetrics = {
        weight: createHealthMetric(
          yesterdayData.weight,
          'kg',
          profileData?.target_weight || (user === 'Bob' ? 75 : 65),
          calculateTrend(yesterdayData.weight, dayBeforeData?.weight)
        ),
        bodyFat: createHealthMetric(
          yesterdayData.body_fat,
          '%',
          profileData?.target_body_fat || (user === 'Bob' ? 15 : 18),
          calculateTrend(yesterdayData.body_fat, dayBeforeData?.body_fat)
        ),
        muscleMass: createHealthMetric(
          yesterdayData.muscle_mass,
          'kg',
          profileData?.target_muscle_mass || (user === 'Bob' ? 70 : 48),
          calculateTrend(yesterdayData.muscle_mass, dayBeforeData?.muscle_mass)
        ),
        waterPercentage: createHealthMetric(
          yesterdayData.water_percentage,
          '%',
          undefined,
          calculateTrend(yesterdayData.water_percentage, dayBeforeData?.water_percentage)
        ),
        boneMass: createHealthMetric(
          yesterdayData.bone_mass,
          'kg',
          undefined,
          calculateTrend(yesterdayData.bone_mass, dayBeforeData?.bone_mass)
        ),
        visceralFat: createHealthMetric(
          yesterdayData.visceral_fat,
          'level',
          undefined,
          calculateTrend(yesterdayData.visceral_fat, dayBeforeData?.visceral_fat)
        ),
        steps: createHealthMetric(
          yesterdayData.steps,
          'steps',
          10000
        ),
        heartRate: createHealthMetric(
          yesterdayData.heart_rate,
          'bpm'
        ),
        sleepScore: createHealthMetric(
          yesterdayData.sleep_score,
          '/100'
        ),
        unknownType91: createHealthMetric(
          yesterdayData.measurement_type_91,
          'unknown'
        ),
        unknownType155: createHealthMetric(
          yesterdayData.measurement_type_155,
          'unknown'
        ),
        isLoading: false,
        error: null,
        lastSynced: yesterdayData.last_synced
      };

      // Data validation: check for impossible values and log warnings
      const validationWarnings = [];
      const dataStatus = [];

      if (healthMetrics.weight.value !== null) {
        if (healthMetrics.weight.value < 40 || healthMetrics.weight.value > 200) {
          validationWarnings.push(`⚠️ Suspicious weight: ${healthMetrics.weight.value}kg (normal range: 40-200kg)`);
        }
      } else {
        dataStatus.push('❌ No weight data');
      }

      if (healthMetrics.bodyFat.value !== null) {
        if (healthMetrics.bodyFat.value < 3 || healthMetrics.bodyFat.value > 50) {
          validationWarnings.push(`⚠️ Suspicious body fat: ${healthMetrics.bodyFat.value}% (normal range: 3-50%)`);
        }
      } else {
        dataStatus.push('❌ No body fat data');
      }

      if (healthMetrics.heartRate.value !== null) {
        if (healthMetrics.heartRate.value < 40 || healthMetrics.heartRate.value > 120) {
          validationWarnings.push(`⚠️ Suspicious heart rate: ${healthMetrics.heartRate.value}bpm (normal range: 40-120bpm)`);
        }
      } else {
        dataStatus.push('❌ No heart rate data');
      }

      if (healthMetrics.steps.value !== null && healthMetrics.steps.value > 50000) {
        validationWarnings.push(`⚠️ Suspicious steps: ${healthMetrics.steps.value} (max expected: 50000)`);
      }

      // Log data availability and unknown measurement types
      if (healthMetrics.unknownType91.value !== null) {
        console.log(`🔍 Found unknown measurement type 91: ${healthMetrics.unknownType91.value}`);
      }
      if (healthMetrics.unknownType155.value !== null) {
        console.log(`🔍 Found unknown measurement type 155: ${healthMetrics.unknownType155.value}`);
      }

      if (validationWarnings.length > 0) {
        console.warn('🔍 DATA VALIDATION WARNINGS:', validationWarnings);
      }

      if (dataStatus.length > 0) {
        console.info('🔍 DATA AVAILABILITY STATUS:', dataStatus);
      }

      // Summary of data freshness and sources
      const dataSummary = {
        totalMetrics: Object.keys(healthMetrics).filter(key => key !== 'isLoading' && key !== 'error' && key !== 'lastSynced').length,
        metricsWithData: Object.entries(healthMetrics)
          .filter(([key, metric]) => key !== 'isLoading' && key !== 'error' && key !== 'lastSynced' && (metric as HealthMetric).hasData)
          .length,
        dataSource: healthMetrics.weight.dataSource,
        lastSynced: healthMetrics.lastSynced,
        date: yesterdayData.date
      };

      console.log('🔍 DEBUG: Final health metrics calculated:', healthMetrics);
      console.log('📊 DATA SUMMARY:', dataSummary);

      setData(healthMetrics);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health metrics';
      console.error('❌ HEALTH METRICS FETCH ERROR:', error);

      // NO MOCK DATA FALLBACK - Show real error
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}

// Hook for getting health trends over time
export function useHealthTrends(user: User, days: number = 7) {
  const [trends, setTrends] = useState<{
    weight: Array<{ date: string; value: number }>;
    bodyFat: Array<{ date: string; value: number }>;
    steps: Array<{ date: string; value: number }>;
    isLoading: boolean;
    error: string | null;
  }>({
    weight: [],
    bodyFat: [],
    steps: [],
    isLoading: true,
    error: null,
  });

  const fetchTrends = useCallback(async () => {
    try {
      setTrends(prev => ({ ...prev, isLoading: true, error: null }));

      if (!isSupabaseConfigured()) {
        throw new Error('CRITICAL: Supabase not configured for trends. No mock data available.');
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase!
        .from('health_metrics')
        .select('date, weight, body_fat, steps')
        .eq('user_name', user)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      setTrends({
        weight: data?.map(d => ({ date: d.date, value: d.weight || 0 })) || [],
        bodyFat: data?.map(d => ({ date: d.date, value: d.body_fat || 0 })) || [],
        steps: data?.map(d => ({ date: d.date, value: d.steps || 0 })) || [],
        isLoading: false,
        error: null,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health trends';
      setTrends(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [user, days]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return trends;
}