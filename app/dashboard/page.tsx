'use client';

import React, { useState } from 'react';
import { Header } from '@/src/components/layout/Header';
import {
  TrendingUp, TrendingDown, Activity, Flame, Award,
  Heart, Footprints, Moon, BarChart3
} from 'lucide-react';
import { User } from '@/src/types';
import { useHealthData, useCompetitionData } from '@/src/hooks/useHealthData';

export default function DashboardPage() {
  const [selectedUser, setSelectedUser] = useState<User>('Bob');
  const { streak } = useHealthData(selectedUser);
  const competitionData = useCompetitionData();

  // Mock Withings data - replace with real data from Supabase
  const healthMetrics = {
    weight: { value: 78.2, trend: -0.3, target: 75, unit: 'kg' },
    bodyFat: { value: 18.5, trend: -0.2, target: 15, unit: '%' },
    muscleMass: { value: 62.4, trend: 0.1, target: 65, unit: 'kg' },
    steps: { value: 8542, target: 10000, unit: 'steps' },
    heartRate: { value: 68, unit: 'bpm' },
    sleepScore: { value: 82, unit: '/100' }
  };

  const todayPoints = selectedUser === 'Bob' ? competitionData.bobToday : competitionData.paulaToday;
  const weeklyPoints = selectedUser === 'Bob' ? competitionData.bobWeekly : competitionData.paulaWeekly;

  return (
    <div className="min-h-screen bg-background">
      <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div>
            <h1 className="text-3xl font-bold">Health Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {selectedUser}&apos;s health metrics and daily progress
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Weight */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Weight</span>
                {healthMetrics.weight.trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                )}
              </div>
              <p className="text-2xl font-bold">{healthMetrics.weight.value}</p>
              <p className="text-xs text-muted-foreground">{healthMetrics.weight.unit}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Target: {healthMetrics.weight.target}</span>
                  <span className={healthMetrics.weight.trend < 0 ? 'text-green-600' : 'text-red-600'}>
                    {healthMetrics.weight.trend > 0 ? '+' : ''}{healthMetrics.weight.trend}
                  </span>
                </div>
              </div>
            </div>

            {/* Body Fat */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Body Fat</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{healthMetrics.bodyFat.value}</p>
              <p className="text-xs text-muted-foreground">{healthMetrics.bodyFat.unit}</p>
              <div className="mt-2 text-xs">
                <span className={healthMetrics.bodyFat.value < 20 ? 'text-green-600' : 'text-yellow-600'}>
                  {healthMetrics.bodyFat.value < 15 ? 'Athletic' :
                   healthMetrics.bodyFat.value < 20 ? 'Healthy' :
                   'Above target'}
                </span>
              </div>
            </div>

            {/* Muscle Mass */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Muscle</span>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold">{healthMetrics.muscleMass.value}</p>
              <p className="text-xs text-muted-foreground">{healthMetrics.muscleMass.unit}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-purple-600 h-1.5 rounded-full"
                    style={{ width: `${(healthMetrics.muscleMass.value / healthMetrics.muscleMass.target) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Steps</span>
                <Footprints className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold">{healthMetrics.steps.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">/ {healthMetrics.steps.target.toLocaleString()}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (healthMetrics.steps.value / healthMetrics.steps.target) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Heart Rate</span>
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold">{healthMetrics.heartRate.value}</p>
              <p className="text-xs text-muted-foreground">{healthMetrics.heartRate.unit}</p>
              <div className="mt-2 text-xs text-green-600">
                Resting
              </div>
            </div>

            {/* Sleep Score */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Sleep</span>
                <Moon className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold">{healthMetrics.sleepScore.value}</p>
              <p className="text-xs text-muted-foreground">{healthMetrics.sleepScore.unit}</p>
              <div className="mt-2 text-xs">
                <span className={healthMetrics.sleepScore.value > 80 ? 'text-green-600' : 'text-yellow-600'}>
                  {healthMetrics.sleepScore.value > 90 ? 'Excellent' :
                   healthMetrics.sleepScore.value > 80 ? 'Good' :
                   healthMetrics.sleepScore.value > 70 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>
          </div>

          {/* Points and Achievements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Today's Progress */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Today&apos;s Progress</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Points Earned</span>
                  <span className="text-2xl font-bold">{todayPoints} / 16</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Streak Bonus</span>
                  <span className="font-semibold flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-orange-500" />
                    {streak > 14 ? '+3' : streak > 7 ? '+2' : streak > 3 ? '+1' : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Performance Level</span>
                  <span className={`font-semibold ${
                    todayPoints >= 14 ? 'text-blue-600' :
                    todayPoints >= 10 ? 'text-green-600' :
                    todayPoints >= 6 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {todayPoints >= 14 ? 'EXCELLENT' :
                     todayPoints >= 10 ? 'GOOD' :
                     todayPoints >= 6 ? 'AVERAGE' : 'WEAK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Weekly Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Points</span>
                  <span className="text-2xl font-bold">{weeklyPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-semibold flex items-center">
                    <Flame className="w-4 h-4 mr-1 text-orange-500" />
                    {streak} days
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Competition Position</span>
                  <span className={`font-semibold ${
                    competitionData.weekLeader === selectedUser ? 'text-gold' : 'text-muted-foreground'
                  }`}>
                    {competitionData.weekLeader === selectedUser ? '1st Place' : '2nd Place'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Tracking */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Achievements & Goals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Streak Achievement */}
              <div>
                <h3 className="font-medium mb-3">Streak Goals</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>7-Day Warrior</span>
                      <span className={streak >= 7 ? 'text-green-600' : 'text-gray-400'}>
                        {streak >= 7 ? '✓' : `${streak}/7`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${streak >= 7 ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(100, (streak / 7) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>14-Day Champion</span>
                      <span className={streak >= 14 ? 'text-green-600' : 'text-gray-400'}>
                        {streak >= 14 ? '✓' : `${streak}/14`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${streak >= 14 ? 'bg-green-600' : 'bg-purple-600'}`}
                        style={{ width: `${Math.min(100, (streak / 14) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Goals */}
              <div>
                <h3 className="font-medium mb-3">Weekly Goals</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>70+ Points</span>
                      <span className={weeklyPoints >= 70 ? 'text-green-600' : 'text-gray-400'}>
                        {weeklyPoints >= 70 ? '✓' : `${weeklyPoints}/70`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${weeklyPoints >= 70 ? 'bg-green-600' : 'bg-yellow-600'}`}
                        style={{ width: `${Math.min(100, (weeklyPoints / 70) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>100+ Points</span>
                      <span className={weeklyPoints >= 100 ? 'text-green-600' : 'text-gray-400'}>
                        {weeklyPoints >= 100 ? '✓' : `${weeklyPoints}/100`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${weeklyPoints >= 100 ? 'bg-green-600' : 'bg-gold'}`}
                        style={{ width: `${Math.min(100, (weeklyPoints / 100) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Goals */}
              <div>
                <h3 className="font-medium mb-3">Health Goals</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weight Target</span>
                      <span className="text-gray-400">
                        {Math.abs(healthMetrics.weight.value - healthMetrics.weight.target).toFixed(1)} kg to go
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.max(0, 100 - Math.abs(healthMetrics.weight.value - healthMetrics.weight.target) * 5)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Steps</span>
                      <span className={healthMetrics.steps.value >= 10000 ? 'text-green-600' : 'text-gray-400'}>
                        {healthMetrics.steps.value >= 10000 ? '✓' : `${(healthMetrics.steps.value / 1000).toFixed(1)}k/10k`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${healthMetrics.steps.value >= 10000 ? 'bg-green-600' : 'bg-cyan-600'}`}
                        style={{ width: `${Math.min(100, (healthMetrics.steps.value / 10000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}