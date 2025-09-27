import { createClient } from '@supabase/supabase-js';
import { DailyEntry, User } from '@/src/types';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test database connectivity
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    // Test basic connection by checking if we can query the database
    const { error } = await supabase
      .from('daily_entries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Database connection error:', error);
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
    console.error('Unexpected database error:', error);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
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
  user: User;
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
  user: User;
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

export interface Competition {
  id?: string;
  week_number: number;
  start_date: string;
  end_date: string;
  bob_points: number;
  paula_points: number;
  winner?: User;
  champions: {
    steps?: User;
    training?: User;
    streak?: User;
    body_progress?: User;
    perfect_days?: User;
  };
  created_at?: string;
  updated_at?: string;
}

export interface StreakRecord {
  id?: string;
  user: User;
  current_streak: number;
  best_streak: number;
  last_activity_date: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to convert database entry to DailyEntry
function dbEntryToDailyEntry(dbEntry: DatabaseEntry): DailyEntry {
  return {
    id: dbEntry.id,
    date: dbEntry.date,
    user: dbEntry.user,
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
  };
}

// Helper function to convert DailyEntry to database entry
function dailyEntryToDbEntry(entry: DailyEntry): Omit<DatabaseEntry, 'id' | 'created_at' | 'updated_at'> {
  return {
    date: entry.date,
    user: entry.user,
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
  try {
    const dbEntry = dailyEntryToDbEntry(entry);

    const { data, error } = await supabase
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

// Update an existing daily entry
export async function updateDailyEntry(id: string, updates: Partial<DailyEntry>) {
  try {
    const dbUpdates: Partial<DatabaseEntry> = {};

    if (updates.checklist) {
      Object.assign(dbUpdates, {
        no_sugar: updates.checklist.noSugar,
        no_alcohol: updates.checklist.noAlcohol,
        fasting_time: updates.checklist.fastingTime,
        fasting_points: updates.checklist.fastingPoints,
        training: updates.checklist.training,
        morning_routine: updates.checklist.morningRoutine,
        sauna: updates.checklist.sauna,
        steps_10k: updates.checklist.steps10k,
        supplements: updates.checklist.supplements,
        weighed_in: updates.checklist.weighedIn,
        calories_tracked: updates.checklist.caloriesTracked,
      });
    }

    if (updates.dailyPoints !== undefined) dbUpdates.daily_points = updates.dailyPoints;
    if (updates.bonusPoints !== undefined) dbUpdates.bonus_points = updates.bonusPoints;
    if (updates.totalPoints !== undefined) dbUpdates.total_points = updates.totalPoints;
    if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('daily_entries')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return dbEntryToDailyEntry(data);
  } catch (error) {
    console.error('Error updating daily entry:', error);
    throw error;
  }
}

// Get today's entry for a user
export async function getTodayEntry(user: User): Promise<DailyEntry | null> {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user', user)
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
  try {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user', user)
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

// Get all entries for both users in a date range (for competition)
export async function getCompetitionEntries(
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  try {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(dbEntryToDailyEntry);
  } catch (error) {
    console.error('Error getting competition entries:', error);
    throw error;
  }
}

// Body metrics functions
export async function createBodyMetric(metric: Omit<BodyMetric, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('body_metrics')
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

export async function getBodyMetrics(
  user: User,
  startDate: string,
  endDate: string
): Promise<BodyMetric[]> {
  try {
    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user', user)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting body metrics:', error);
    throw error;
  }
}

export async function updateBodyMetric(id: string, updates: Partial<BodyMetric>) {
  try {
    const { data, error } = await supabase
      .from('body_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating body metric:', error);
    throw error;
  }
}

// Streak functions
export async function updateStreak(user: User, currentStreak: number) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user', user)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const today = new Date().toISOString().split('T')[0];

    if (existing) {
      // Update existing streak
      const newBestStreak = Math.max(existing.best_streak, currentStreak);

      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_streak: currentStreak,
          best_streak: newBestStreak,
          last_activity_date: today,
        })
        .eq('user', user)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new streak record
      const { data, error } = await supabase
        .from('streaks')
        .insert([{
          user,
          current_streak: currentStreak,
          best_streak: currentStreak,
          last_activity_date: today,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

export async function getStreak(user: User): Promise<StreakRecord | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user', user)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting streak:', error);
    throw error;
  }
}

// Data export function
export async function exportUserData(user: User, startDate?: string, endDate?: string): Promise<string> {
  try {
    // Get daily entries
    const entries = startDate && endDate
      ? await getDailyEntries(user, startDate, endDate)
      : await getDailyEntries(user, '2024-01-01', '2025-12-31');

    // Get body metrics
    const metrics = startDate && endDate
      ? await getBodyMetrics(user, startDate, endDate)
      : await getBodyMetrics(user, '2024-01-01', '2025-12-31');

    // Convert to CSV format
    const csvData = [];

    // Headers
    csvData.push([
      'Date', 'User', 'No Sugar', 'No Alcohol', 'Fasting Time', 'Fasting Points',
      'Training', 'Morning Routine', 'Sauna', '10k Steps', 'Supplements',
      'Weighed In', 'Calories Tracked', 'Daily Points', 'Bonus Points',
      'Total Points', 'Streak', 'Weight', 'Body Fat %', 'Steps', 'Notes'
    ].join(','));

    // Merge entries with metrics by date
    entries.forEach(entry => {
      const metric = metrics.find(m => m.date === entry.date);

      csvData.push([
        entry.date,
        entry.user,
        entry.checklist.noSugar,
        entry.checklist.noAlcohol,
        entry.checklist.fastingTime || '',
        entry.checklist.fastingPoints,
        entry.checklist.training,
        entry.checklist.morningRoutine,
        entry.checklist.sauna,
        entry.checklist.steps10k,
        entry.checklist.supplements,
        entry.checklist.weighedIn,
        entry.checklist.caloriesTracked,
        entry.dailyPoints,
        entry.bonusPoints,
        entry.totalPoints,
        entry.streak,
        metric?.weight || '',
        metric?.body_fat || '',
        metric?.steps || '',
        entry.notes || ''
      ].join(','));
    });

    return csvData.join('\n');
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}