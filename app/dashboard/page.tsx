'use client';

import React from 'react';
import {
  TrendingUp, TrendingDown, Activity, Flame, Award,
  Heart, Footprints, Moon, BarChart3
} from 'lucide-react';
import { useHealthData, useCompetitionData } from '@/src/hooks/useHealthData';
import { useHealthMetrics } from '@/src/hooks/useHealthMetricsAPI';
import { useTheme } from '@/src/contexts/ThemeContext';
import { testDirectSupabaseQuery } from '@/src/utils/supabaseTest';

export default function DashboardPage() {
  const { selectedUser, setSelectedUser, theme } = useTheme();
  const { streak } = useHealthData(selectedUser);
  const competitionData = useCompetitionData();
  const healthMetrics = useHealthMetrics(selectedUser);



  const todayPoints = selectedUser === 'Bob' ? competitionData.bobToday : competitionData.paulaToday;
  const weeklyPoints = selectedUser === 'Bob' ? competitionData.bobWeekly : competitionData.paulaWeekly;

  // DIRECT SUPABASE TEST
  const runDirectTest = async () => {
    console.log('🚀 RUNNING DIRECT SUPABASE TEST...');
    const result = await testDirectSupabaseQuery();
    console.log('📊 TEST RESULT:', result);
  };

  // Show loading state while fetching health metrics
  if (healthMetrics.isLoading) {
    return (
      <main className="container mx-auto px-4 py-6 md:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Health Dashboard</h1>
              <p className="text-muted-foreground mt-1">Loading health metrics...</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              Health Dashboard
              <button
                onClick={runDirectTest}
                className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                title="Test direct Supabase query"
              >
                🔍 TEST DB
              </button>
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedUser}&apos;s health metrics and daily progress
            </p>
            {healthMetrics.error && (
              <p className="text-red-600 mt-2 font-medium">🚨 {healthMetrics.error}</p>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Weight */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Weight</span>
                {healthMetrics.weight.trend && healthMetrics.weight.trend < 0 ? (
                  <TrendingDown className="w-4 h-4 text-green-600" />
                ) : healthMetrics.weight.trend && healthMetrics.weight.trend > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-600" />
                ) : null}
              </div>
              <p className="text-2xl font-bold">
                {healthMetrics.weight.hasData ? healthMetrics.weight.value : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {healthMetrics.weight.hasData ? healthMetrics.weight.unit : 'Not available'}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Target: {healthMetrics.weight.target}</span>
                  <span className={healthMetrics.weight.trend && healthMetrics.weight.trend < 0 ? 'text-green-600' : 'text-red-600'}>
                    {healthMetrics.weight.trend ? (healthMetrics.weight.trend > 0 ? '+' : '') + healthMetrics.weight.trend : 'N/A'}
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
              <p className="text-2xl font-bold">
                {healthMetrics.bodyFat.hasData ? `${healthMetrics.bodyFat.value}%` : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {healthMetrics.bodyFat.hasData ? healthMetrics.bodyFat.unit : 'Not available'}
              </p>
              <div className="mt-2 text-xs">
                <span className={
                  !healthMetrics.bodyFat.hasData ? 'text-gray-500' :
                  healthMetrics.bodyFat.value! < 20 ? 'text-green-600' : 'text-yellow-600'
                }>
                  {!healthMetrics.bodyFat.hasData ? 'No category available' :
                   healthMetrics.bodyFat.value! < 15 ? 'Athletic' :
                   healthMetrics.bodyFat.value! < 20 ? 'Healthy' :
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
                    style={{ width: `${(healthMetrics.muscleMass.target && healthMetrics.muscleMass.value) ? (healthMetrics.muscleMass.value / healthMetrics.muscleMass.target) * 100 : 0}%` }}
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
              <p className="text-2xl font-bold">
                {healthMetrics.steps.hasData ? healthMetrics.steps.value!.toLocaleString() : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground">/ {healthMetrics.steps.target?.toLocaleString() || '10,000'}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: `${healthMetrics.steps.hasData ? Math.min(100, (healthMetrics.steps.value! / (healthMetrics.steps.target || 10000)) * 100) : 0}%` }}
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
              <p className="text-2xl font-bold">
                {healthMetrics.heartRate.hasData ? healthMetrics.heartRate.value : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground">
                {healthMetrics.heartRate.hasData ? healthMetrics.heartRate.unit : 'Not available'}
              </p>
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
              <p className="text-2xl font-bold">
                {healthMetrics.sleepScore.hasData ? healthMetrics.sleepScore.value : 'No data'}
              </p>
              <p className="text-xs text-muted-foreground">{healthMetrics.sleepScore.unit}</p>
              <div className="mt-2 text-xs">
                <span className={
                  !healthMetrics.sleepScore.hasData ? 'text-gray-500' :
                  healthMetrics.sleepScore.value! > 80 ? 'text-green-600' : 'text-yellow-600'
                }>
                  {!healthMetrics.sleepScore.hasData ? 'No quality rating' :
                   healthMetrics.sleepScore.value! > 90 ? 'Excellent' :
                   healthMetrics.sleepScore.value! > 80 ? 'Good' :
                   healthMetrics.sleepScore.value! > 70 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>
          </div>

          {/* Points and Achievements */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Today's Progress */}
            <div className={`card p-6 ${theme.cardBorder}`}>
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
            <div className={`card p-6 ${theme.cardBorder}`}>
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
          <div className={`card p-6 ${theme.cardBorder}`}>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Award className={`w-5 h-5 mr-2 ${theme.text}`} />
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
                        className={`h-2 rounded-full ${streak >= 7 ? 'bg-green-600' : theme.background}`}
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
                        className={`h-2 rounded-full ${streak >= 14 ? 'bg-green-600' : theme.background}`}
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
                        {(healthMetrics.weight.target && healthMetrics.weight.hasData) ? Math.abs(healthMetrics.weight.value! - healthMetrics.weight.target).toFixed(1) : 'N/A'} kg to go
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(healthMetrics.weight.target && healthMetrics.weight.hasData) ? Math.max(0, 100 - Math.abs(healthMetrics.weight.value! - healthMetrics.weight.target) * 5) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Daily Steps</span>
                      <span className={
                        !healthMetrics.steps.hasData ? 'text-gray-400' :
                        healthMetrics.steps.value! >= 10000 ? 'text-green-600' : 'text-gray-400'
                      }>
                        {!healthMetrics.steps.hasData ? 'No data' :
                         healthMetrics.steps.value! >= 10000 ? '✓' : `${(healthMetrics.steps.value! / 1000).toFixed(1)}k/10k`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          !healthMetrics.steps.hasData ? 'bg-gray-300' :
                          healthMetrics.steps.value! >= 10000 ? 'bg-green-600' : 'bg-cyan-600'
                        }`}
                        style={{ width: `${healthMetrics.steps.hasData ? Math.min(100, (healthMetrics.steps.value! / 10000) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}