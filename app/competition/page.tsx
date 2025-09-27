'use client';

import React from 'react';
import { Header } from '@/src/components/layout/Header';
import { Trophy, Medal, Target, Flame, Users, Star, Clock, Calendar } from 'lucide-react';
import { useCompetitionData } from '@/src/hooks/useHealthData';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function CompetitionPage() {
  const { selectedUser, setSelectedUser } = useTheme();
  const competitionData = useCompetitionData();

  return (
    <div className="min-h-screen bg-background">
      <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />
      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-gold" />
              🏆 Rywalizacja
            </h1>
            <p className="text-muted-foreground mt-2">
              Bob vs Paula - challenge 15 września - 24 grudnia 2024
            </p>
          </div>

          {/* Current Week Leaderboard */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Medal className="w-6 h-6 mr-2 text-gold" />
              Obecny tydzień (Poniedziałek - Niedziela)
            </h2>

            <div className="space-y-4">
              {/* Competition Bar */}
              <div className="relative">
                <div className="flex h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <div
                    className="bg-bob flex items-center justify-center text-white font-bold transition-all"
                    style={{ width: `${(competitionData.bobWeekly / (competitionData.bobWeekly + competitionData.paulaWeekly)) * 100}%` }}
                  >
                    Bob: {competitionData.bobWeekly}
                  </div>
                  <div
                    className="bg-paula flex items-center justify-center text-white font-bold transition-all"
                    style={{ width: `${(competitionData.paulaWeekly / (competitionData.bobWeekly + competitionData.paulaWeekly)) * 100}%` }}
                  >
                    Paula: {competitionData.paulaWeekly}
                  </div>
                </div>
              </div>

              {/* Winner */}
              <div className="text-center bg-gradient-to-r from-gold/10 to-gold/5 border-2 border-gold/20 rounded-lg p-4">
                <Trophy className="w-8 h-8 mx-auto text-gold mb-2" />
                <p className="text-lg">
                  <span className={`font-bold ${competitionData.weekLeader === 'Bob' ? 'text-bob' : 'text-paula'}`}>
                    {competitionData.weekLeader}
                  </span>{' '}
                  prowadzi z wynikiem{' '}
                  <span className="font-bold">
                    {competitionData.weekLeader === 'Bob' ? competitionData.bobWeekly : competitionData.paulaWeekly} punktów
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Przewaga: +{Math.abs(competitionData.bobWeekly - competitionData.paulaWeekly)} pkt
                </p>
              </div>

              {/* Daily Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-bob flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Bob - {competitionData.bobWeekly} pkt
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Dziś</span>
                      <span className="font-semibold">{competitionData.bobToday} pkt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Streak</span>
                      <span className="font-semibold flex items-center">
                        <Flame className="w-4 h-4 mr-1 text-orange-500" />
                        {competitionData.bobStreak} dni
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-paula flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Paula - {competitionData.paulaWeekly} pkt
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Dziś</span>
                      <span className="font-semibold">{competitionData.paulaToday} pkt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Streak</span>
                      <span className="font-semibold flex items-center">
                        <Flame className="w-4 h-4 mr-1 text-orange-500" />
                        {competitionData.paulaStreak} dni
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring System */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-600" />
              📋 System punktacji
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Diet */}
              <div>
                <h3 className="font-semibold mb-3 text-green-600">🥗 Dieta</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Brak cukru</span>
                    <span className="font-semibold">1 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Brak alkoholu</span>
                    <span className="font-semibold">1 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fasting (przed 17:00)</span>
                    <span className="font-semibold">3 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fasting (przed 19:00)</span>
                    <span className="font-semibold">2 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spisane kalorie</span>
                    <span className="font-semibold">2 pkt</span>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div>
                <h3 className="font-semibold mb-3 text-blue-600">💪 Aktywność</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Trening</span>
                    <span className="font-semibold">2 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>10k+ kroków</span>
                    <span className="font-semibold">2 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sauna</span>
                    <span className="font-semibold">1 pkt</span>
                  </div>
                </div>
              </div>

              {/* Routine */}
              <div>
                <h3 className="font-semibold mb-3 text-purple-600">🌅 Rutyna</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Morning routine</span>
                    <span className="font-semibold">3 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Suplementy</span>
                    <span className="font-semibold">1 pkt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ważenie się</span>
                    <span className="font-semibold">1 pkt</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold flex items-center mb-2">
                <Star className="w-4 h-4 mr-2 text-blue-600" />
                Maksimum dzienne: 16 punktów
              </h4>
              <p className="text-sm text-muted-foreground">
                Dodatkowe punkty bonusowe za streaki powyżej 3 dni
              </p>
            </div>
          </div>

          {/* Achievements & Badges */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Medal className="w-6 h-6 mr-2 text-gold" />
              🏅 Osiągnięcia i odznaki
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Performance Levels */}
              <div>
                <h3 className="font-semibold mb-3">📊 Poziomy wydajności</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">WEAK</p>
                      <p className="text-xs text-muted-foreground">0-5 punktów</p>
                    </div>
                    <div className="text-2xl">😴</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-yellow-700 dark:text-yellow-400">AVERAGE</p>
                      <p className="text-xs text-muted-foreground">6-9 punktów</p>
                    </div>
                    <div className="text-2xl">😐</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">GOOD</p>
                      <p className="text-xs text-muted-foreground">10-13 punktów</p>
                    </div>
                    <div className="text-2xl">😊</div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-700 dark:text-blue-400">EXCELLENT</p>
                      <p className="text-xs text-muted-foreground">14-16 punktów</p>
                    </div>
                    <div className="text-2xl">🔥</div>
                  </div>
                </div>
              </div>

              {/* Streak Bonuses */}
              <div>
                <h3 className="font-semibold mb-3">🔥 Bonusy za streak</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold">3+ dni</p>
                      <p className="text-xs text-muted-foreground">Streak bonus</p>
                    </div>
                    <span className="font-bold text-orange-600">+1 pkt</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div>
                      <p className="font-semibold">7+ dni</p>
                      <p className="text-xs text-muted-foreground">Tygodniowy streak</p>
                    </div>
                    <span className="font-bold text-orange-600">+2 pkt</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gold/10 rounded-lg">
                    <div>
                      <p className="font-semibold">14+ dni</p>
                      <p className="text-xs text-muted-foreground">Legendary streak</p>
                    </div>
                    <span className="font-bold text-gold">+3 pkt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Info */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-purple-600" />
              📅 Informacje o challenge
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="font-semibold">Start</p>
                <p className="text-sm text-muted-foreground">15 września 2024</p>
              </div>

              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="font-semibold">Koniec</p>
                <p className="text-sm text-muted-foreground">24 grudnia 2024</p>
              </div>

              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold">Długość</p>
                <p className="text-sm text-muted-foreground">101 dni</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Cel challenge</h4>
              <p className="text-sm text-muted-foreground">
                Utrzymanie zdrowych nawyków przez 101 dni z systemem konkurencji tygodniowej.
                Automatyczne śledzenie z integracji Withings + Pipedream.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}