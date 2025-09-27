// User types
export type User = 'Bob' | 'Paula';

// Checklist item types
export interface ChecklistItem {
  id: string;
  label: string;
  points: number;
  checked: boolean;
  category: 'diet' | 'training' | 'routine' | 'other';
  description?: string;
}

// Daily entry type
export interface DailyEntry {
  id?: string;
  date: string;
  user: User;
  checklist: {
    noSugar: boolean;
    noAlcohol: boolean;
    fastingTime?: string; // "19:00" or "17:00"
    fastingPoints: number; // 2 or 3
    training: boolean;
    morningRoutine: boolean;
    sauna: boolean;
    steps10k: boolean;
    supplements: boolean;
    weighedIn: boolean;
    caloriesTracked: boolean;
  };
  metrics?: {
    weight?: number;
    bodyFat?: number;
    muscleMass?: number;
    waterPercentage?: number;
    steps?: number;
    heartRate?: number;
    sleepScore?: number;
  };
  dailyPoints: number;
  bonusPoints: number;
  totalPoints: number;
  streak: number;
  notes?: string;
}

// Competition types
export interface WeeklyCompetition {
  weekNumber: number;
  startDate: string;
  endDate: string;
  bobPoints: number;
  paulaPoints: number;
  winner?: User;
  champions: {
    steps?: User;
    training?: User;
    streak?: User;
    bodyProgress?: User;
    perfectDays?: User;
  };
  powerUpsEarned: {
    Bob: PowerUp[];
    Paula: PowerUp[];
  };
}

// Power-up types
export interface PowerUp {
  id: string;
  type: 'steps_multiplier' | 'training_bonus' | 'streak_shield' | 'double_points' | 'progress_boost';
  name: string;
  description: string;
  validUntil: string;
  used: boolean;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'performance' | 'competition' | 'progress' | 'special';
  icon: string;
  unlockedDate?: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Goal types
export interface Goal {
  user: User;
  type: 'weight' | 'bodyFat';
  startValue: number;
  currentValue: number;
  targetValue: number;
  startDate: string;
  targetDate: string;
  progressPercentage: number;
}

// Statistics types
export interface UserStats {
  user: User;
  totalDays: number;
  averageDailyPoints: number;
  currentStreak: number;
  longestStreak: number;
  perfectDays: number;
  totalPoints: number;
  weeklyWins: number;
  achievements: Achievement[];
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  xp: number;
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  bobValue: number;
  paulaValue: number;
  label?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'reminder' | 'achievement' | 'competition' | 'insight';
  title: string;
  message: string;
  scheduledTime: string;
  sent: boolean;
}

// Success level thresholds
export const SUCCESS_LEVELS = {
  BRONZE: { min: 8, bonus: 2 },
  SILVER: { min: 10, bonus: 3 },
  GOLD: { min: 12, bonus: 5 }
} as const;

// Streak bonuses
export const STREAK_BONUSES = {
  3: 2,
  5: 3,
  7: 5,
  10: 10,
  15: 15
} as const;