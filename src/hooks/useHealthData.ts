'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
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

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Fetch today's entry
      const { data: todayData, error: todayError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_name', user)
        .eq('date', today)
        .single();

      if (todayError && todayError.code !== 'PGRST116') {
        throw todayError;
      }

      // Fetch recent entries (last 7 days)
      const { data: recentData, error: recentError } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_name', user)
        .gte('date', weekStartStr)
        .order('date', { ascending: false })
        .limit(7);

      if (recentError) throw recentError;

      // Fetch current streak
      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_name', user)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      // Convert database format to DailyEntry format
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const convertDbEntry = (dbEntry: any): DailyEntry => ({
        id: dbEntry.id,
        date: dbEntry.date,
        user: dbEntry.user_name,
        checklist: {
          noSugar: dbEntry.no_sugar,
          noAlcohol: dbEntry.no_alcohol,
          fastingTime: dbEntry.fasting_time,
          fastingPoints: dbEntry.fasting_points,
          training: dbEntry.training,
          morningRoutine: dbEntry.morning_routine,
          sauna: dbEntry.sauna,
          steps10k: dbEntry.steps_10k,
          supplements: dbEntry.supplements,
          weighedIn: dbEntry.weighed_in,
          caloriesTracked: dbEntry.calories_tracked,
        },
        dailyPoints: dbEntry.daily_points,
        bonusPoints: dbEntry.bonus_points,
        totalPoints: dbEntry.total_points,
        streak: dbEntry.streak,
        notes: dbEntry.notes,
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
    bobWeekly: 0,
    paulaWeekly: 0,
    bobToday: 0,
    paulaToday: 0,
    bobStreak: 0,
    paulaStreak: 0,
    weekLeader: 'Bob',
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Fetch weekly data for both users
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('daily_entries')
        .select('user_name, total_points, date')
        .gte('date', weekStartStr)
        .lte('date', today);

      if (weeklyError) throw weeklyError;

      // Fetch today's data for both users
      const { data: todayData, error: todayError } = await supabase
        .from('daily_entries')
        .select('user_name, total_points')
        .eq('date', today);

      if (todayError) throw todayError;

      // Fetch streaks for both users
      const { data: streakData, error: streakError } = await supabase
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

// Real-time subscription hook (optional enhancement)
export function useRealtimeUpdates(user: User, onUpdate?: () => void) {
  useEffect(() => {
    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [user, onUpdate]);
}