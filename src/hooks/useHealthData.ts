'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, DailyEntry } from '@/src/types';

export interface HealthData {
  todayEntry: DailyEntry | null;
  recentEntries: DailyEntry[];
  streak: number;
  weeklyTotal: number;
  isLoading: boolean;
  error: string | null;
}

export interface CompetitionData {
  bobWeekly: number;
  paulaWeekly: number;
  bobToday: number;
  paulaToday: number;
  bobStreak: number;
  paulaStreak: number;
  weekLeader: User;
  isLoading: boolean;
  error: string | null;
}

// Mock data for immediate display
const createMockEntry = (user: User, daysAgo: number = 0): DailyEntry => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return {
    id: `mock-${user.toLowerCase()}-${daysAgo}`,
    date: date.toISOString().split('T')[0],
    user,
    checklist: {
      noSugar: Math.random() > 0.3,
      noAlcohol: Math.random() > 0.2,
      fastingTime: Math.random() > 0.5 ? '16:8' : '',
      fastingPoints: Math.random() > 0.5 ? 2 : 0,
      training: Math.random() > 0.4,
      morningRoutine: Math.random() > 0.3,
      sauna: Math.random() > 0.7,
      steps10k: Math.random() > 0.5,
      supplements: Math.random() > 0.4,
      weighedIn: Math.random() > 0.6,
      caloriesTracked: Math.random() > 0.5,
    },
    dailyPoints: user === 'Bob' ? 10 : 8,
    bonusPoints: user === 'Bob' ? 2 : 0,
    totalPoints: user === 'Bob' ? 12 : 8,
    streak: user === 'Bob' ? 5 : 3,
    notes: '',
  };
};

// Hook for fetching individual user health data
export function useHealthData(user: User): HealthData & { refetch: () => Promise<void> } {
  const [data, setData] = useState<HealthData>({
    todayEntry: null,
    recentEntries: [],
    streak: 0,
    weeklyTotal: 0,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create mock data
      const todayEntry = createMockEntry(user, 0);
      const recentEntries = Array.from({ length: 7 }, (_, i) => createMockEntry(user, i));
      const weeklyTotal = user === 'Bob' ? 84 : 76;
      const streak = user === 'Bob' ? 5 : 3;

      setData({
        todayEntry,
        recentEntries,
        streak,
        weeklyTotal,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
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

// Hook for fetching competition data for both users
export function useCompetitionData(): CompetitionData & { refetch: () => Promise<void> } {
  const [data, setData] = useState<CompetitionData>({
    bobWeekly: 84,
    paulaWeekly: 76,
    bobToday: 12,
    paulaToday: 8,
    bobStreak: 5,
    paulaStreak: 3,
    weekLeader: 'Bob',
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Static mock data
      setData({
        bobWeekly: 84,
        paulaWeekly: 76,
        bobToday: 12,
        paulaToday: 8,
        bobStreak: 5,
        paulaStreak: 3,
        weekLeader: 'Bob',
        isLoading: false,
        error: null,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch competition data';
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}

// Real-time subscription hook (disabled for mock mode)
export function useRealtimeUpdates(_user: User, _onUpdate?: () => void) {
  // No-op in mock mode
  useEffect(() => {
    // Mock mode - no real-time updates
  }, []);
}