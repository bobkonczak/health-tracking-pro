'use client';

import React, { useState } from 'react';
import { Header } from '@/src/components/layout/Header';
import { TrendingUp, Calendar, Trophy, Target, BarChart3, Users } from 'lucide-react';
import { User } from '@/src/types';
import { useHealthData, useCompetitionData } from '@/src/hooks/useHealthData';

export default function StatsPage() {
  const [selectedUser, setSelectedUser] = useState<User>('Bob');
  const { todayEntry, recentEntries, streak, weeklyTotal, isLoading } = useHealthData(selectedUser);
  const competitionData = useCompetitionData();

  // Calculate statistics
  const last7Days = recentEntries.slice(0, 7);
  const avgDailyPoints = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, entry) => sum + (entry.totalPoints || 0), 0) / last7Days.length)
    : 0;

  const completionRate = last7Days.length > 0
    ? Math.round((last7Days.filter(entry => (entry.totalPoints || 0) >= 10).length / last7Days.length) * 100)
    : 0;

  const bestDay = last7Days.reduce((best, entry) =>
    (entry.totalPoints || 0) > (best.totalPoints || 0) ? entry : best,
    last7Days[0] || { totalPoints: 0, date: '' }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />
        <main className="container mx-auto px-4 py-6 md:px-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">📊 Statystyki</h1>
            <div className="text-center">Loading statistics...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />
      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              📊 Statystyki
            </h1>
            <p className="text-muted-foreground mt-2">
              Analiza wyników dla <span className={selectedUser === 'Bob' ? 'text-bob font-semibold' : 'text-paula font-semibold'}>{selectedUser}</span>
            </p>
          </div>

          {/* User Selection */}
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg max-w-md">
            <button
              onClick={() => setSelectedUser('Bob')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                selectedUser === 'Bob'
                  ? 'bg-bob text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Bob&apos;s Stats
            </button>
            <button
              onClick={() => setSelectedUser('Paula')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                selectedUser === 'Paula'
                  ? 'bg-paula text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Paula&apos;s Stats
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-gold" />
              <p className="text-sm text-muted-foreground">Obecny streak</p>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">dni</p>
            </div>

            <div className="card p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Dzisiaj</p>
              <p className="text-2xl font-bold">{todayEntry?.totalPoints || 0}</p>
              <p className="text-xs text-muted-foreground">punktów</p>
            </div>

            <div className="card p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-muted-foreground">Ten tydzień</p>
              <p className="text-2xl font-bold">{weeklyTotal}</p>
              <p className="text-xs text-muted-foreground">punktów</p>
            </div>

            <div className="card p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-muted-foreground">Średnia (7 dni)</p>
              <p className="text-2xl font-bold">{avgDailyPoints}</p>
              <p className="text-xs text-muted-foreground">pkt/dzień</p>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">📈 Wydajność (7 dni)</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Wskaźnik ukończenia</span>
                    <span className="font-semibold">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${selectedUser === 'Bob' ? 'bg-bob' : 'bg-paula'}`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dni z 10+ punktami
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Najlepszy dzień</span>
                    <span className="font-semibold">{bestDay?.totalPoints || 0} pkt</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {bestDay?.date ? new Date(bestDay.date).toLocaleDateString('pl-PL') : 'Brak danych'}
                  </p>
                </div>
              </div>
            </div>

            {/* Competition Status */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                🏆 Rywalizacja
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bob (tydzień)</span>
                  <span className="font-bold text-bob">{competitionData.bobWeekly} pkt</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Paula (tydzień)</span>
                  <span className="font-bold text-paula">{competitionData.paulaWeekly} pkt</span>
                </div>
                <div className="border-t pt-3">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Prowadzi</p>
                    <p className={`text-lg font-bold ${competitionData.weekLeader === 'Bob' ? 'text-bob' : 'text-paula'}`}>
                      {competitionData.weekLeader}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      +{Math.abs(competitionData.bobWeekly - competitionData.paulaWeekly)} pkt przewagi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">📅 Ostatnie dni</h3>
            <div className="space-y-3">
              {last7Days.length > 0 ? (
                last7Days.map((entry, index) => (
                  <div key={entry.id || index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                    <div>
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short'
                      })}</p>
                      <p className="text-xs text-muted-foreground">
                        Dzienny: {entry.dailyPoints} + Bonus: {entry.bonusPoints}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${(entry.totalPoints || 0) >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                        {entry.totalPoints} pkt
                      </p>
                      {entry.streak > 0 && (
                        <p className="text-xs text-orange-500">🔥 {entry.streak}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Brak danych z ostatnich 7 dni
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}