'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/src/types';

export interface HealthHistoryRecord {
  date: string;
  weight: number | null;
  body_fat: number | null;
  muscle_mass: number | null;
  water_percentage: number | null;
  bone_mass: number | null;
  visceral_fat: number | null;
  steps: number | null;
  heart_rate: number | null;
  sleep_score: number | null;
  data_source: string | null;
  last_synced: string | null;
  hasData: boolean;
}

export interface HealthHistorySummary {
  totalDays: number;
  daysWithData: number;
  dataCompleteness: number;
  averages: {
    weight: number | null;
    body_fat: number | null;
    muscle_mass: number | null;
    steps: number | null;
    heart_rate: number | null;
  };
  progress: {
    weight: number | null;
    body_fat: number | null;
    weightChange: 'gained' | 'lost' | null;
    bodyFatChange: 'increased' | 'decreased' | null;
  };
  goals: {
    stepsGoalAchievementRate: number;
    totalGoalAchievements: number;
    totalDaysWithSteps: number;
  };
  milestones: {
    bestStepsDay: { date: string; steps: number } | null;
    bestWeightDay: { date: string; weight: number } | null;
  };
  baseline: {
    date: string;
    weight: number | null;
    body_fat: number | null;
  } | null;
  latest: {
    date: string;
    weight: number | null;
    body_fat: number | null;
  } | null;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface HealthHistoryChartData {
  weight: ChartDataPoint[];
  bodyFat: ChartDataPoint[];
  steps: ChartDataPoint[];
  heartRate: ChartDataPoint[];
}

export interface HealthHistoryData {
  data: HealthHistoryRecord[];
  summary: HealthHistorySummary;
  chartData: HealthHistoryChartData;
  isLoading: boolean;
  error: string | null;
}

export function useHealthHistory(
  user: User,
  startDate: string = '2024-09-15',
  endDate?: string
): HealthHistoryData & { refetch: () => Promise<void> } {
  const [historyData, setHistoryData] = useState<HealthHistoryData>({
    data: [],
    summary: {
      totalDays: 0,
      daysWithData: 0,
      dataCompleteness: 0,
      averages: {
        weight: null,
        body_fat: null,
        muscle_mass: null,
        steps: null,
        heart_rate: null,
      },
      progress: {
        weight: null,
        body_fat: null,
        weightChange: null,
        bodyFatChange: null,
      },
      goals: {
        stepsGoalAchievementRate: 0,
        totalGoalAchievements: 0,
        totalDaysWithSteps: 0,
      },
      milestones: {
        bestStepsDay: null,
        bestWeightDay: null,
      },
      baseline: null,
      latest: null,
    },
    chartData: {
      weight: [],
      bodyFat: [],
      steps: [],
      heartRate: [],
    },
    isLoading: true,
    error: null,
  });

  const fetchHistoryData = useCallback(async () => {
    try {
      console.log(`🔍 FETCHING HEALTH HISTORY for ${user} from ${startDate}...`);
      setHistoryData(prev => ({ ...prev, isLoading: true, error: null }));

      const params = new URLSearchParams({
        user,
        startDate,
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/health-history?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      console.log(`✅ HEALTH HISTORY FETCHED successfully for ${user}`);
      console.log('📊 Summary:', {
        totalDays: result.summary.totalDays,
        daysWithData: result.summary.daysWithData,
        dataCompleteness: result.summary.dataCompleteness,
        weightProgress: result.summary.progress.weight
      });

      setHistoryData({
        data: result.data,
        summary: result.summary,
        chartData: result.chartData,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health history';
      console.error(`❌ HEALTH HISTORY FETCH ERROR for ${user}:`, error);

      setHistoryData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [user, startDate, endDate]);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  return { ...historyData, refetch: fetchHistoryData };
}