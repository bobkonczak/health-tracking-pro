'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, DailyEntry } from '@/src/types';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

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

      // Check if Supabase is configured - if not, use mock data
      if (!isSupabaseConfigured()) {
        // Simulate API delay for mock mode
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
        return;
      }

      // Use real Supabase queries
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Fetch today's entry
      const { data: todayData, error: todayError } = await supabase!
        .from('daily_entries')
        .select('*')
        .eq('user_name', user)
        .eq('date', today)
        .single();

      if (todayError && todayError.code !== 'PGRST116') {
        throw todayError;
      }

      // Fetch recent entries (last 7 days)
      const { data: recentData, error: recentError } = await supabase!
        .from('daily_entries')
        .select('*')
        .eq('user_name', user)
        .gte('date', weekStartStr)
        .order('date', { ascending: false })
        .limit(7);

      if (recentError) throw recentError;

      // Fetch current streak
      const { data: streakData, error: streakError } = await supabase!
        .from('streaks')
        .select('current_streak')
        .eq('user_name', user)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      // Convert database format to DailyEntry format
      const convertDbEntry = (dbEntry: Record<string, unknown>): DailyEntry => ({
        id: dbEntry.id as string,
        date: dbEntry.date as string,
        user: dbEntry.user_name as User,
        checklist: {
          noSugar: dbEntry.no_sugar as boolean,
          noAlcohol: dbEntry.no_alcohol as boolean,
          fastingTime: (dbEntry.fasting_time as string) || '',
          fastingPoints: dbEntry.fasting_points as number,
          training: dbEntry.training as boolean,
          morningRoutine: dbEntry.morning_routine as boolean,
          sauna: dbEntry.sauna as boolean,
          steps10k: dbEntry.steps_10k as boolean,
          supplements: dbEntry.supplements as boolean,
          weighedIn: dbEntry.weighed_in as boolean,
          caloriesTracked: dbEntry.calories_tracked as boolean,
        },
        dailyPoints: dbEntry.daily_points as number,
        bonusPoints: dbEntry.bonus_points as number,
        totalPoints: dbEntry.total_points as number,
        streak: dbEntry.streak as number,
        notes: dbEntry.notes as string,
      });

      const todayEntry = todayData ? convertDbEntry(todayData) : null;
      const recentEntries = recentData ? recentData.map(convertDbEntry) : [];
      const weeklyTotal = recentEntries.reduce((sum, entry) => sum + (entry.totalPoints || 0), 0);

      setData({
        todayEntry,
        recentEntries,
        streak: streakData?.current_streak || 0,
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

      // Check if Supabase is configured - if not, use mock data
      if (!isSupabaseConfigured()) {
        // Simulate API delay for mock mode
        await new Promise(resolve => setTimeout(resolve, 300));

        // Static mock data
        setData({
          bobWeekly: 84,
          paulaWeekly: 76,
          bobToday: 10,
          paulaToday: 1,
          bobStreak: 5,
          paulaStreak: 3,
          weekLeader: 'Bob',
          isLoading: false,
          error: null,
        });
        return;
      }

      // Use real Supabase queries
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Fetch weekly data for both users
      const { data: weeklyData, error: weeklyError } = await supabase!
        .from('daily_entries')
        .select('user_name, total_points, date')
        .gte('date', weekStartStr)
        .lte('date', today);

      if (weeklyError) throw weeklyError;

      // Fetch today's data for both users
      const { data: todayData, error: todayError } = await supabase!
        .from('daily_entries')
        .select('user_name, total_points')
        .eq('date', today);

      if (todayError) throw todayError;

      // Fetch streaks for both users
      const { data: streakData, error: streakError } = await supabase!
        .from('streaks')
        .select('user_name, current_streak');

      if (streakError) throw streakError;

      // Calculate totals
      const bobWeekly = weeklyData
        ?.filter(entry => entry.user_name === 'Bob')
        .reduce((sum, entry) => sum + (entry.total_points || 0), 0) || 0;

      const paulaWeekly = weeklyData
        ?.filter(entry => entry.user_name === 'Paula')
        .reduce((sum, entry) => sum + (entry.total_points || 0), 0) || 0;

      const bobToday = todayData
        ?.find(entry => entry.user_name === 'Bob')?.total_points || 0;

      const paulaToday = todayData
        ?.find(entry => entry.user_name === 'Paula')?.total_points || 0;

      const bobStreak = streakData
        ?.find(streak => streak.user_name === 'Bob')?.current_streak || 0;

      const paulaStreak = streakData
        ?.find(streak => streak.user_name === 'Paula')?.current_streak || 0;

      const weekLeader: User = bobWeekly > paulaWeekly ? 'Bob' : 'Paula';

      setData({
        bobWeekly,
        paulaWeekly,
        bobToday,
        paulaToday,
        bobStreak,
        paulaStreak,
        weekLeader,
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

// Real-time subscription hook (with fallback for mock mode)
export function useRealtimeUpdates(user: User, onUpdate?: () => void) {
  useEffect(() => {
    // Don't set up real-time updates if Supabase is not configured
    if (!isSupabaseConfigured()) {
      return;
    }

    const channel = supabase!
      .channel('daily_entries_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_entries',
          filter: `user_name=eq.${user}`
        },
        () => {
          onUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [user, onUpdate]);
}