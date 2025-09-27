import { createClient } from '@supabase/supabase-js';
import { DailyEntry, User } from '@/src/types';

// Supabase configuration with runtime validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
// This prevents build-time failures when environment variables are missing
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
}

// Test database connectivity
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string; error?: unknown }> {
  try {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase configuration missing - using mock mode',
        error: 'Environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set'
      };
    }

    // Test basic connection by checking if we can query the database
    const { error } = await supabase!
      .from('daily_entries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        success: false,
        message: 'Failed to connect to database',
        error: error
      };
    }

    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected database error',
      error: error
    };
  }
}

// Health check function for API endpoints
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'offline';
  database: boolean;
  timestamp: string;
  details?: unknown;
}> {
  const timestamp = new Date().toISOString();

  try {
    const dbTest = await testDatabaseConnection();

    return {
      status: dbTest.success ? 'healthy' : 'degraded',
      database: dbTest.success,
      timestamp,
      details: dbTest.success ? undefined : dbTest.error
    };
  } catch (error) {
    return {
      status: 'offline',
      database: false,
      timestamp,
      details: error
    };
  }
}

// Database types for Supabase tables
export interface DatabaseEntry {
  id?: string;
  date: string;
  user_name: User;
  no_sugar: boolean;
  no_alcohol: boolean;
  fasting_time?: string;
  fasting_points: number;
  training: boolean;
  morning_routine: boolean;
  sauna: boolean;
  steps_10k: boolean;
  supplements: boolean;
  weighed_in: boolean;
  calories_tracked: boolean;
  daily_points: number;
  bonus_points: number;
  total_points: number;
  streak: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BodyMetric {
  id?: string;
  date: string;
  user_name: User;
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  water_percentage?: number;
  steps?: number;
  heart_rate?: number;
  sleep_score?: number;
  created_at?: string;
  updated_at?: string;
}

// Helper function to convert database entry to DailyEntry
function dbEntryToDailyEntry(dbEntry: DatabaseEntry): DailyEntry {
  return {
    id: dbEntry.id,
    date: dbEntry.date,
    user: dbEntry.user_name,
    checklist: {
      noSugar: dbEntry.no_sugar,
      noAlcohol: dbEntry.no_alcohol,
      fastingTime: dbEntry.fasting_time || '',
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
  };
}

// Helper function to convert DailyEntry to database entry
function dailyEntryToDbEntry(entry: DailyEntry): Omit<DatabaseEntry, 'id' | 'created_at' | 'updated_at'> {
  return {
    date: entry.date,
    user_name: entry.user,
    no_sugar: entry.checklist.noSugar,
    no_alcohol: entry.checklist.noAlcohol,
    fasting_time: entry.checklist.fastingTime,
    fasting_points: entry.checklist.fastingPoints,
    training: entry.checklist.training,
    morning_routine: entry.checklist.morningRoutine,
    sauna: entry.checklist.sauna,
    steps_10k: entry.checklist.steps10k,
    supplements: entry.checklist.supplements,
    weighed_in: entry.checklist.weighedIn,
    calories_tracked: entry.checklist.caloriesTracked,
    daily_points: entry.dailyPoints,
    bonus_points: entry.bonusPoints,
    total_points: entry.totalPoints,
    streak: entry.streak,
    notes: entry.notes,
  };
}

// Create a new daily entry
export async function createDailyEntry(entry: DailyEntry) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration missing');
  }

  try {
    const dbEntry = dailyEntryToDbEntry(entry);

    const { data, error } = await supabase!
      .from('daily_entries')
      .insert([dbEntry])
      .select()
      .single();

    if (error) throw error;

    return dbEntryToDailyEntry(data);
  } catch (error) {
    console.error('Error creating daily entry:', error);
    throw error;
  }
}

// Get today's entry for a user
export async function getTodayEntry(user: User): Promise<DailyEntry | null> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration missing');
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase!
      .from('daily_entries')
      .select('*')
      .eq('user_name', user)
      .eq('date', today)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No entry found for today
        return null;
      }
      throw error;
    }

    return dbEntryToDailyEntry(data);
  } catch (error) {
    console.error('Error getting today entry:', error);
    throw error;
  }
}

// Get entries for a specific user and date range
export async function getDailyEntries(
  user: User,
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration missing');
  }

  try {
    const { data, error } = await supabase!
      .from('daily_entries')
      .select('*')
      .eq('user_name', user)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(dbEntryToDailyEntry);
  } catch (error) {
    console.error('Error getting daily entries:', error);
    throw error;
  }
}

// Body metrics functions
export async function createBodyMetric(metric: Omit<BodyMetric, 'id' | 'created_at' | 'updated_at'>) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase configuration missing');
  }

  try {
    const { data, error } = await supabase!
      .from('health_metrics')
      .insert([metric])
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating body metric:', error);
    throw error;
  }
}