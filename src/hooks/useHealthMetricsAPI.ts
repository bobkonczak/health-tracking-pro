'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/src/types';

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
      console.log(`🔍 FETCHING HEALTH METRICS for ${user}...`);
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/health-metrics?user=${encodeURIComponent(user)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      console.log(`✅ HEALTH METRICS FETCHED successfully for ${user}`);

      setData({
        ...result.data,
        isLoading: false,
        error: null
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health metrics';
      console.error(`❌ HEALTH METRICS FETCH ERROR for ${user}:`, error);

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

      // For now, return empty trends - this would need a separate API endpoint
      setTrends({
        weight: [],
        bodyFat: [],
        steps: [],
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