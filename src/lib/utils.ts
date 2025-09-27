import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ChecklistData = {
  noSugar: boolean;
  noAlcohol: boolean;
  fastingPoints: number;
  training: boolean;
  morningRoutine: boolean;
  sauna: boolean;
  steps10k: boolean;
  supplements: boolean;
  weighedIn: boolean;
  caloriesTracked: boolean;
};

export function calculateDailyPoints(checklist: ChecklistData): number {
  let points = 0;

  if (checklist.noSugar) points += 1;
  if (checklist.noAlcohol) points += 1;
  if (checklist.fastingPoints) points += checklist.fastingPoints;
  if (checklist.training) points += 2;
  if (checklist.morningRoutine) points += 3;
  if (checklist.sauna) points += 1;
  if (checklist.steps10k) points += 2;
  if (checklist.supplements) points += 1;
  if (checklist.weighedIn) points += 1;
  if (checklist.caloriesTracked) points += 2;

  return points;
}

export function calculateBonusPoints(dailyPoints: number, streak: number): number {
  let bonus = 0;

  // Success level bonuses
  if (dailyPoints >= 12) {
    bonus += 5; // Gold
  } else if (dailyPoints >= 10) {
    bonus += 3; // Silver
  } else if (dailyPoints >= 8) {
    bonus += 2; // Bronze
  }

  // Streak bonuses
  if (streak >= 15) {
    bonus += 15;
  } else if (streak >= 10) {
    bonus += 10;
  } else if (streak >= 7) {
    bonus += 5;
  } else if (streak >= 5) {
    bonus += 3;
  } else if (streak >= 3) {
    bonus += 2;
  }

  return bonus;
}

export function getSuccessLevel(points: number): 'gold' | 'silver' | 'bronze' | 'fail' {
  if (points >= 12) return 'gold';
  if (points >= 10) return 'silver';
  if (points >= 8) return 'bronze';
  return 'fail';
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function getDaysAgo(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}