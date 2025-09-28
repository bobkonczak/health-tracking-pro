'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/src/components/layout/Header';
import {
  BarChart3, Calendar, TrendingUp, X, Check, Flame
} from 'lucide-react';
import { DailyEntry } from '@/src/types';
import { useHealthData } from '@/src/hooks/useHealthData';
import { useTheme } from '@/src/contexts/ThemeContext';
import { cn } from '@/src/lib/utils';
import { HistoricalHealthData } from '@/src/components/stats/HistoricalHealthData';

// Generate all days in the challenge period
function generateChallengeDays() {
  const startDate = new Date('2025-09-15');
  const endDate = new Date('2025-12-24');
  const days = [];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  return days;
}

// Get color for points value (0-16 scale)
function getPointColor(points: number): string {
  const colors = [
    '#374151', // 0 - gray-700
    '#4B5563', // 1 - gray-600
    '#6B7280', // 2 - gray-500
    '#9CA3AF', // 3 - gray-400
    '#FCA5A5', // 4 - red-300
    '#F87171', // 5 - red-400
    '#FBBF24', // 6 - yellow-400
    '#FCD34D', // 7 - yellow-300
    '#FDE047', // 8 - yellow-200
    '#BEF264', // 9 - lime-300
    '#A3E635', // 10 - lime-400
    '#84CC16', // 11 - lime-500
    '#65A30D', // 12 - lime-600
    '#10B981', // 13 - emerald-500
    '#059669', // 14 - emerald-600
    '#047857', // 15 - emerald-700
    '#FFD700', // 16 - gold
  ];

  return colors[Math.min(points, 16)] || colors[0];
}

interface DayDetailModalProps {
  date: Date;
  dayNumber: number;
  entry: DailyEntry | null;
  onClose: () => void;
  onEdit: () => void;
}

function DayDetailModal({ date, dayNumber, entry, onClose, onEdit }: DayDetailModalProps) {
  const dateStr = date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Day {dayNumber} of 101</h3>
            <p className="text-sm text-muted-foreground">{dateStr}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {entry ? (
          <div className="space-y-4">
            {/* Points Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Total Points</span>
                <span className="text-2xl font-bold">{entry.totalPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Streak</span>
                <span className="font-medium flex items-center">
                  <Flame className="w-4 h-4 mr-1 text-orange-500" />
                  {entry.streak} days
                </span>
              </div>
            </div>

            {/* Checklist Details */}
            <div>
              <h4 className="font-medium mb-2">Completed Tasks</h4>
              <div className="space-y-1 text-sm">
                {entry.checklist.noSugar && (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    No sugar (1 pt)
                  </div>
                )}
                {entry.checklist.noAlcohol && (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    No alcohol (1 pt)
                  </div>
                )}
                {entry.checklist.training && (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Training (2 pts)
                  </div>
                )}
                {entry.checklist.morningRoutine && (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Morning routine (3 pts)
                  </div>
                )}
                {entry.checklist.steps10k && (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    10k+ steps (2 pts)
                  </div>
                )}
                {entry.checklist.fastingTime && (
                  <div className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    Fasting: {entry.checklist.fastingTime} ({entry.checklist.fastingPoints} pts)
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {entry.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No data recorded for this day</p>
            <button
              onClick={onEdit}
              className="btn-primary px-4 py-2 text-sm"
            >
              Add Entry
            </button>
          </div>
        )}

        {entry && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onEdit}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Edit Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EnhancedStatsPage() {
  const { selectedUser, setSelectedUser } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterLevel, setFilterLevel] = useState<'all' | 'weak' | 'average' | 'good' | 'excellent'>('all');

  const { recentEntries } = useHealthData(selectedUser);

  // Generate all challenge days (real dates, no mock data)
  const challengeDays = useMemo(() => generateChallengeDays(), []);

  // Create a map of date to entry for quick lookup
  const entriesMap = useMemo(() => {
    const map = new Map<string, DailyEntry>();
    recentEntries.forEach(entry => {
      map.set(entry.date, entry);
    });

    // Only use real database entries - NO MOCK DATA

    return map;
  }, [recentEntries]);

  // Calculate statistics
  const stats = useMemo(() => {
    const entries = Array.from(entriesMap.values());
    const totalDays = challengeDays.length;
    const completedDays = entries.length;
    const totalPoints = entries.reduce((sum, e) => sum + (e.totalPoints || 0), 0);
    const avgPoints = completedDays > 0 ? (totalPoints / completedDays).toFixed(1) : '0';

    const bestDay = entries.reduce((best, entry) =>
      (entry.totalPoints || 0) > (best?.totalPoints || 0) ? entry : best
    , entries[0]);

    const worstDay = entries.reduce((worst, entry) =>
      (entry.totalPoints || 0) < (worst?.totalPoints || 999) ? entry : worst
    , entries[0]);

    const currentStreak = entries[entries.length - 1]?.streak || 0;
    const longestStreak = Math.max(...entries.map(e => e.streak || 0), 0);

    return {
      totalDays,
      completedDays,
      remainingDays: totalDays - completedDays,
      totalPoints,
      avgPoints,
      bestDay,
      worstDay,
      currentStreak,
      longestStreak,
      completionRate: ((completedDays / totalDays) * 100).toFixed(1)
    };
  }, [entriesMap, challengeDays]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEditDay = () => {
    if (!selectedDate) return;

    // Navigate to checklist page with date parameter for historical entry
    const dateStr = selectedDate.toISOString().split('T')[0];
    window.location.href = `/checklist?date=${dateStr}&user=${selectedUser}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <BarChart3 className="w-8 h-8 mr-3" />
                Statistics & History
              </h1>
              <p className="text-muted-foreground mt-2">
                101-day challenge: Sep 15 - Dec 24, 2025
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={cn(
                  'px-3 py-1 rounded-lg',
                  viewMode === 'calendar' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as 'all' | 'weak' | 'average' | 'good' | 'excellent')}
                className="px-3 py-1 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Days</option>
                <option value="excellent">Excellent (14-16)</option>
                <option value="good">Good (10-13)</option>
                <option value="average">Average (6-9)</option>
                <option value="weak">Weak (0-5)</option>
              </select>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">{stats.completedDays}/{stats.totalDays}</p>
              <p className="text-xs text-muted-foreground">{stats.completionRate}%</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Avg Points</p>
              <p className="text-2xl font-bold">{stats.avgPoints}</p>
              <p className="text-xs text-muted-foreground">per day</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="text-2xl font-bold">{stats.bestDay?.totalPoints || 0}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold flex items-center">
                <Flame className="w-5 h-5 mr-1 text-orange-500" />
                {stats.currentStreak}
              </p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-2xl font-bold">{stats.longestStreak}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold">{stats.totalPoints}</p>
              <p className="text-xs text-muted-foreground">earned</p>
            </div>
          </div>

          {/* Calendar Pixel View */}
          <div className="card p-6">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Challenge Calendar</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <span>0</span>
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>6</span>
                  <div className="w-4 h-4 bg-lime-500 rounded"></div>
                  <span>11</span>
                  <div className="w-4 h-4 bg-emerald-600 rounded"></div>
                  <span>14</span>
                  <div className="w-4 h-4 bg-gold rounded"></div>
                  <span>16</span>
                </div>
              </div>
            </div>

            {/* Month Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-xs text-center text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Add empty cells for alignment */}
              {[...Array(new Date('2025-09-15').getDay() === 0 ? 6 : new Date('2025-09-15').getDay() - 1)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Render challenge days */}
              {challengeDays.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const entry = entriesMap.get(dateStr);
                const points = entry?.totalPoints || 0;
                const dayNumber = index + 1;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                // Apply filter
                if (filterLevel !== 'all') {
                  const level = points >= 14 ? 'excellent' :
                               points >= 10 ? 'good' :
                               points >= 6 ? 'average' : 'weak';
                  if (level !== filterLevel && entry) {
                    return (
                      <div
                        key={dateStr}
                        className="aspect-square rounded opacity-20"
                        style={{ backgroundColor: '#374151' }}
                      />
                    );
                  }
                }

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'aspect-square rounded cursor-pointer transition-all hover:scale-110 hover:z-10 relative group p-0.5',
                      isWeekend && 'ring-1 ring-gray-400 dark:ring-gray-600'
                    )}
                    style={{ backgroundColor: entry ? getPointColor(points) : '#1F2937' }}
                    onClick={() => handleDayClick(date)}
                  >
                    {/* Mini-pixels showing completion status */}
                    {entry && (
                      <div className="w-full h-full grid grid-cols-4 gap-0.5">
                        {/* Diet category - top left */}
                        <div className={cn(
                          'rounded-sm',
                          (entry.checklist.noSugar && entry.checklist.noAlcohol && entry.checklist.caloriesTracked)
                            ? 'bg-green-400'
                            : (entry.checklist.noSugar || entry.checklist.noAlcohol || entry.checklist.caloriesTracked)
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                        )} />

                        {/* Activity category - top right */}
                        <div className={cn(
                          'rounded-sm',
                          (entry.checklist.training && entry.checklist.steps10k)
                            ? 'bg-green-400'
                            : (entry.checklist.training || entry.checklist.steps10k)
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                        )} />

                        {/* Routine category - bottom left */}
                        <div className={cn(
                          'rounded-sm',
                          (entry.checklist.morningRoutine && entry.checklist.supplements && entry.checklist.weighedIn)
                            ? 'bg-green-400'
                            : (entry.checklist.morningRoutine || entry.checklist.supplements || entry.checklist.weighedIn)
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                        )} />

                        {/* Bonus category - bottom right */}
                        <div className={cn(
                          'rounded-sm',
                          entry.checklist.sauna
                            ? 'bg-purple-400'
                            : entry.streak > 3
                            ? 'bg-orange-400'
                            : 'bg-gray-400'
                        )} />
                      </div>
                    )}

                    {/* Day number overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow-md">
                        {dayNumber}
                      </span>
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                      <div className="text-center">
                        <div className="font-bold">Day {dayNumber}</div>
                        <div>{entry ? `${points} pts` : 'No data'}</div>
                        {entry?.streak ? <div>{entry.streak} day streak</div> : null}
                        {entry && (
                          <div className="mt-1 text-left">
                            <div className="text-green-400">🟢 Diet: {[entry.checklist.noSugar, entry.checklist.noAlcohol, entry.checklist.caloriesTracked].filter(Boolean).length}/3</div>
                            <div className="text-blue-400">🔵 Activity: {[entry.checklist.training, entry.checklist.steps10k].filter(Boolean).length}/2</div>
                            <div className="text-yellow-400">🟡 Routine: {[entry.checklist.morningRoutine, entry.checklist.supplements, entry.checklist.weighedIn].filter(Boolean).length}/3</div>
                            <div className="text-purple-400">🟣 Bonus: {entry.checklist.sauna ? 'Sauna' : entry.streak > 3 ? 'Streak' : 'None'}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mini-pixels Legend */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium mb-3">Mini-pixel Legend:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded-sm"></div>
                  <span>Diet Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                  <span>Activity Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
                  <span>Routine Complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-400 rounded-sm"></div>
                  <span>Bonus (Sauna/Streak)</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Each day shows 4 mini-pixels: 🟢 Green = All tasks done, 🟡 Yellow = Some tasks done, 🔴 Red = Tasks missing
              </div>
            </div>
          </div>

          {/* Weekly Trends */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Weekly Performance
            </h2>
            <div className="space-y-3">
              {[...Array(15)].map((_, weekIndex) => {
                const weekStart = weekIndex * 7;
                const weekEnd = Math.min(weekStart + 7, challengeDays.length);
                const weekDays = challengeDays.slice(weekStart, weekEnd);
                const weekPoints = weekDays.reduce((sum, date) => {
                  const entry = entriesMap.get(date.toISOString().split('T')[0]);
                  return sum + (entry?.totalPoints || 0);
                }, 0);
                const maxPoints = (weekEnd - weekStart) * 16;
                const percentage = (weekPoints / maxPoints) * 100;

                return (
                  <div key={weekIndex}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Week {weekIndex + 1}</span>
                      <span className="font-medium">{weekPoints} / {maxPoints}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Health Data Section */}
          <HistoricalHealthData user={selectedUser} />
        </div>
      </main>

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          dayNumber={challengeDays.findIndex(d =>
            d.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
          ) + 1}
          entry={entriesMap.get(selectedDate.toISOString().split('T')[0]) || null}
          onClose={() => setSelectedDate(null)}
          onEdit={handleEditDay}
        />
      )}
    </div>
  );
}