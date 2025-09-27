'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/src/types';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export interface HealthMetric {
  value: number;
  trend?: number;
  target?: number;
  unit: string;
  lastUpdated?: string;
}

export interface HealthMetrics {
  weight: HealthMetric;
  bodyFat: HealthMetric;
  muscleMass: HealthMetric;
  steps: HealthMetric;
  heartRate: HealthMetric;
  sleepScore: HealthMetric;
  isLoading: boolean;
  error: string | null;
}

// Yesterday's mock data - realistic for Bob/Paula
const getMockHealthMetrics = (user: User): HealthMetrics => {
  if (user === 'Bob') {
    return {
      weight: { value: 84.2, trend: -0.3, target: 75, unit: 'kg' },
      bodyFat: { value: 19.8, trend: -0.2, target: 15, unit: '%' },
      muscleMass: { value: 67.1, trend: 0.1, target: 70, unit: 'kg' },
      steps: { value: 9247, target: 10000, unit: 'steps' },
      heartRate: { value: 68, unit: 'bpm' },
      sleepScore: { value: 78, unit: '/100' },
      isLoading: false,
      error: null,
    };
  } else {
    return {
      weight: { value: 72.5, trend: -0.4, target: 65, unit: 'kg' },
      bodyFat: { value: 22.3, trend: -0.3, target: 18, unit: '%' },
      muscleMass: { value: 45.2, trend: 0.2, target: 48, unit: 'kg' },
      steps: { value: 8832, target: 10000, unit: 'steps' },
      heartRate: { value: 72, unit: 'bpm' },
      sleepScore: { value: 85, unit: '/100' },
      isLoading: false,
      error: null,
    };
  }
};

export function useHealthMetrics(user: User): HealthMetrics & { refetch: () => Promise<void> } {
  const [data, setData] = useState<HealthMetrics>(() => ({
    weight: { value: 0, unit: 'kg' },
    bodyFat: { value: 0, unit: '%' },
    muscleMass: { value: 0, unit: 'kg' },
    steps: { value: 0, target: 10000, unit: 'steps' },
    heartRate: { value: 0, unit: 'bpm' },
    sleepScore: { value: 0, unit: '/100' },
    isLoading: true,
    error: null,
  }));

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Check if Supabase is configured - if not, use mock data
      if (!isSupabaseConfigured()) {
        // Simulate API delay for mock mode
        await new Promise(resolve => setTimeout(resolve, 400));

        setData(getMockHealthMetrics(user));
        return;
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
      const { data: healthData, error: healthError } = await supabase!
        .from('health_metrics')
        .select('*')
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
        // No data available, use mock data
        setData(getMockHealthMetrics(user));
        return;
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
        steps: yesterdayData.steps,
        heart_rate: yesterdayData.heart_rate,
        sleep_score: yesterdayData.sleep_score,
        date: yesterdayData.date,
        allFields: Object.keys(yesterdayData)
      });

      const healthMetrics: HealthMetrics = {
        weight: {
          value: yesterdayData.weight || 0,
          trend: calculateTrend(yesterdayData.weight, dayBeforeData?.weight),
          target: profileData?.target_weight || (user === 'Bob' ? 75 : 65),
          unit: 'kg',
          lastUpdated: yesterdayData.date,
        },
        bodyFat: {
          value: yesterdayData.body_fat || 0,
          trend: calculateTrend(yesterdayData.body_fat, dayBeforeData?.body_fat),
          target: profileData?.target_body_fat || (user === 'Bob' ? 15 : 18),
          unit: '%',
          lastUpdated: yesterdayData.date,
        },
        muscleMass: {
          value: yesterdayData.muscle_mass || 0,
          trend: calculateTrend(yesterdayData.muscle_mass, dayBeforeData?.muscle_mass),
          target: profileData?.target_muscle_mass || (user === 'Bob' ? 70 : 48),
          unit: 'kg',
          lastUpdated: yesterdayData.date,
        },
        steps: {
          value: yesterdayData.steps || 0,
          target: 10000,
          unit: 'steps',
          lastUpdated: yesterdayData.date,
        },
        heartRate: {
          value: yesterdayData.heart_rate || 0,
          unit: 'bpm',
          lastUpdated: yesterdayData.date,
        },
        sleepScore: {
          value: yesterdayData.sleep_score || 0,
          unit: '/100',
          lastUpdated: yesterdayData.date,
        },
        isLoading: false,
        error: null,
      };

      // Data validation: check for impossible values and log warnings
      const validationWarnings = [];
      if (healthMetrics.weight.value && (healthMetrics.weight.value < 40 || healthMetrics.weight.value > 200)) {
        validationWarnings.push(`⚠️ Suspicious weight: ${healthMetrics.weight.value}kg (normal range: 40-200kg)`);
      }
      if (healthMetrics.bodyFat.value && (healthMetrics.bodyFat.value < 3 || healthMetrics.bodyFat.value > 50)) {
        validationWarnings.push(`⚠️ Suspicious body fat: ${healthMetrics.bodyFat.value}% (normal range: 3-50%)`);
      }
      if (healthMetrics.heartRate.value && (healthMetrics.heartRate.value < 40 || healthMetrics.heartRate.value > 120)) {
        validationWarnings.push(`⚠️ Suspicious heart rate: ${healthMetrics.heartRate.value}bpm (normal range: 40-120bpm)`);
      }
      if (healthMetrics.steps.value > 50000) {
        validationWarnings.push(`⚠️ Suspicious steps: ${healthMetrics.steps.value} (max expected: 50000)`);
      }

      if (validationWarnings.length > 0) {
        console.warn('🔍 DATA VALIDATION WARNINGS:', validationWarnings);
      }

      console.log('🔍 DEBUG: Final health metrics calculated:', healthMetrics);

      setData(healthMetrics);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health metrics';
      console.error('Health metrics fetch error:', error);

      // On error, fall back to mock data
      setData({
        ...getMockHealthMetrics(user),
        error: errorMessage
      });
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
        // Generate mock trend data
        const mockTrends = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          const dateStr = date.toISOString().split('T')[0];

          const baseWeight = user === 'Bob' ? 85 : 73;
          const baseBodyFat = user === 'Bob' ? 20 : 23;
          const baseSteps = 8500;

          return {
            date: dateStr,
            weight: baseWeight + (Math.random() - 0.5) * 2,
            bodyFat: baseBodyFat + (Math.random() - 0.5) * 1.5,
            steps: baseSteps + Math.floor(Math.random() * 3000),
          };
        });

        setTrends({
          weight: mockTrends.map(d => ({ date: d.date, value: d.weight })),
          bodyFat: mockTrends.map(d => ({ date: d.date, value: d.bodyFat })),
          steps: mockTrends.map(d => ({ date: d.date, value: d.steps })),
          isLoading: false,
          error: null,
        });
        return;
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