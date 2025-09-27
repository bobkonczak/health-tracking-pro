export const CHALLENGE_START_DATE = '2024-09-15';
export const CHALLENGE_DURATION_WEEKS = 12;

export const CHECKLIST_POINTS = {
  noSugar: 1,
  noAlcohol: 1,
  fastingBefore19: 2,
  fastingBefore17: 3,
  training: 2,
  morningRoutine: 3,
  sauna: 1,
  steps10k: 2,
  supplements: 1,
  weighedIn: 1,
  caloriesTracked: 2,
} as const;

export const SUCCESS_BONUSES = {
  bronze: { threshold: 8, bonus: 2 },
  silver: { threshold: 10, bonus: 3 },
  gold: { threshold: 12, bonus: 5 },
} as const;

export const STREAK_BONUSES = [
  { days: 3, bonus: 2 },
  { days: 5, bonus: 3 },
  { days: 7, bonus: 5 },
  { days: 10, bonus: 10 },
  { days: 15, bonus: 15 },
] as const;

export const WEEKLY_REWARDS = [
  { weeks: [1, 2], reward: 'Seks oralny' },
  { weeks: [3, 4], reward: 'Masaż 30min + seks oralny' },
  { weeks: [5, 6], reward: 'Kolacja w restauracji (przegrany płaci)' },
  { weeks: [7, 8], reward: 'Weekend spa treatment' },
  { weeks: [9, 10], reward: 'Shopping (przegrany finansuje)' },
  { weeks: [11, 12], reward: 'Full day slave mode' },
] as const;

export const GOALS = {
  bob: {
    type: 'bodyFat' as const,
    start: 20.3,
    target: 15,
    difference: 5.3,
  },
  paula: {
    type: 'weight' as const,
    start: 77,
    target: 69,
    difference: 8,
  },
} as const;

export const NOTIFICATION_SCHEDULE = [
  { time: '07:00', message: 'Morning routine time! 🌅' },
  { time: '12:00', message: 'Suplementy lunch! 💊' },
  { time: '18:30', message: 'Last meal przed 19:00! 🍽️' },
  { time: '21:00', message: 'Uzupełnij dzisiejszy checklist! ✅' },
] as const;

export const SUNDAY_RESULTS_TIME = '20:00';

export const SUPPLEMENTS = {
  bob: [
    { name: 'Omega-3', dosage: '2g EPA/DHA', timing: 'morning' },
    { name: 'Witamina D3+K2', dosage: '4000 IU + 100mcg', timing: 'morning' },
    { name: 'Magnez glicynian', dosage: '400mg', timing: 'evening' },
    { name: 'Kompleks B', dosage: '1x', timing: 'morning' },
    { name: 'Kreatyna', dosage: '5g', timing: 'pre_workout' },
    { name: 'L-teanina', dosage: '200mg', timing: 'with_coffee' },
    { name: 'Ashwagandha KSM-66', dosage: '600mg', timing: 'evening' },
    { name: 'Rhodiola', dosage: '400mg', timing: 'morning' },
    { name: 'Sylimaryn', dosage: '300mg', timing: 'morning' },
    { name: 'NAC', dosage: '600mg', timing: 'evening' },
    { name: 'L-karnityna', dosage: '2g', timing: 'pre_workout' },
    { name: 'Jeżówka', dosage: '500mg', timing: 'morning', notes: 'Cyklicznie: 2-3 tyg on, 1 tyg off' },
  ],
  paula: [
    { name: 'Omega-3', dosage: '2g EPA/DHA', timing: 'morning' },
    { name: 'Witamina D3+K2', dosage: '4000 IU + 100mcg', timing: 'morning' },
    { name: 'Magnez glicynian', dosage: '400mg', timing: 'evening' },
    { name: 'Selen', dosage: '200mcg', timing: 'morning' },
    { name: 'L-tyrozyna', dosage: '500mg', timing: 'morning' },
    { name: 'Ashwagandha', dosage: '600mg', timing: 'evening' },
    { name: 'Kurkuma', dosage: '1000mg', timing: 'morning' },
    { name: 'Kreatyna', dosage: '5g', timing: 'pre_workout' },
    { name: 'L-karnityna', dosage: '2g', timing: 'pre_workout' },
    { name: 'Jeżówka', dosage: '500mg', timing: 'morning', notes: 'Cyklicznie: 2-3 tyg on, 1 tyg off' },
  ],
} as const;