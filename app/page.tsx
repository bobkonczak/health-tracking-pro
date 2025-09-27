'use client';

import { useState } from 'react';
import { Trophy, TrendingUp, Target, Flame, Calendar, Users, AlertCircle, Loader2 } from 'lucide-react';
import { DailyChecklist } from '@/src/components/checklist/DailyChecklist';
import { BodyMetricsForm, BodyMetricsData } from '@/src/components/health/BodyMetricsForm';
import { useCompetitionData, useHealthData, useRealtimeUpdates } from '@/src/hooks/useHealthData';
import { cn } from '@/src/lib/utils';
import { User } from '@/src/types';

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<'Bob' | 'Paula'>('Bob');

  // Fetch real data from Supabase
  const competitionData = useCompetitionData();
  const selectedUserData = useHealthData(selectedUser);

  // Enable real-time updates
  useRealtimeUpdates(selectedUser, () => {
    competitionData.refetch();
    selectedUserData.refetch();
  });

  // Show loading state
  if (competitionData.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state with fallback
  if (competitionData.error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Database Connection Issue
            </h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-2">
            {competitionData.error}. The app will work with limited functionality.
          </p>
          <button
            onClick={competitionData.refetch}
            className="mt-3 text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
        {/* Continue with limited functionality */}
        <DashboardContent
          data={null}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          refreshData={() => {
            competitionData.refetch();
            selectedUserData.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <DashboardContent
      data={competitionData}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      selectedUserData={selectedUserData}
      refreshData={() => {
        competitionData.refetch();
        selectedUserData.refetch();
      }}
    />
  );
}

function DashboardContent({
  data,
  selectedUser,
  setSelectedUser,
  selectedUserData,
  refreshData
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  selectedUser: User;
  setSelectedUser: (user: User) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedUserData?: any;
  refreshData?: () => void;
}) {
  // Calculate progress percentages (mock for now, can be made real later)
  const bobProgress = 23;
  const paulaProgress = 18;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold">Dzień dobry! 💪</h1>
        <p className="text-muted-foreground mt-2">
          Dzień 47 z 84 challenge. Keep pushing!
          {data && (
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              ✓ Connected to database
            </span>
          )}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Bob Stats */}
        <div className="card p-4 border-2 border-bob/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-bob">Bob</span>
            <Trophy className="w-4 h-4 text-bob" />
          </div>
          <p className="text-2xl font-bold">{data ? data.bobToday : 0} pkt</p>
          <p className="text-xs text-muted-foreground">Dziś</p>
          <div className="mt-2 flex items-center text-xs">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            <span>{data ? data.bobStreak : 0} dni streak</span>
          </div>
        </div>

        {/* Paula Stats */}
        <div className="card p-4 border-2 border-paula/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-paula">Paula</span>
            <Trophy className="w-4 h-4 text-paula" />
          </div>
          <p className="text-2xl font-bold">{data ? data.paulaToday : 0} pkt</p>
          <p className="text-xs text-muted-foreground">Dziś</p>
          <div className="mt-2 flex items-center text-xs">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            <span>{data ? data.paulaStreak : 0} dni streak</span>
          </div>
        </div>

        {/* Weekly Leader */}
        <div className="card p-4 bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Lider tygodnia</span>
            <Trophy className="w-4 h-4 text-gold" />
          </div>
          <p className="text-2xl font-bold text-gold">{data ? data.weekLeader : 'Loading...'}</p>
          <p className="text-xs text-muted-foreground">
            {data ? (data.weekLeader === 'Bob' ? data.bobWeekly : data.paulaWeekly) : 0} pkt
          </p>
        </div>

        {/* Progress to Goals */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Cele</span>
            <Target className="w-4 h-4" />
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-bob">Bob</span>
                <span>{bobProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-bob h-1.5 rounded-full transition-all"
                  style={{ width: `${bobProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-paula">Paula</span>
                <span>{paulaProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-paula h-1.5 rounded-full transition-all"
                  style={{ width: `${paulaProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Competition Bar */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Tygodniowa rywalizacja
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Poniedziałek - Niedziela</span>
            <span>Dzień {new Date().getDay()}/7</span>
          </div>
          <div className="relative">
            <div className="flex h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {data && data.bobWeekly + data.paulaWeekly > 0 ? (
                <>
                  <div
                    className="bg-bob flex items-center justify-center text-white text-sm font-bold transition-all"
                    style={{ width: `${(data.bobWeekly / (data.bobWeekly + data.paulaWeekly)) * 100}%` }}
                  >
                    Bob: {data.bobWeekly}
                  </div>
                  <div
                    className="bg-paula flex items-center justify-center text-white text-sm font-bold transition-all"
                    style={{ width: `${(data.paulaWeekly / (data.bobWeekly + data.paulaWeekly)) * 100}%` }}
                  >
                    Paula: {data.paulaWeekly}
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-center text-gray-500 text-sm">
                  {data ? 'Brak danych na ten tydzień' : 'Loading...'}
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            {data ? (
              data.paulaWeekly > data.bobWeekly ? (
                <p className="text-sm">
                  <span className="text-paula font-semibold">Paula</span> prowadzi{' '}
                  <span className="font-semibold">+{data.paulaWeekly - data.bobWeekly} pkt</span>
                </p>
              ) : data.bobWeekly > data.paulaWeekly ? (
                <p className="text-sm">
                  <span className="text-bob font-semibold">Bob</span> prowadzi{' '}
                  <span className="font-semibold">+{data.bobWeekly - data.paulaWeekly} pkt</span>
                </p>
              ) : (
                <p className="text-sm font-semibold">Remis! 🤝</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Loading competition data...</p>
            )}
          </div>
        </div>
      </div>

      {/* User Selection Tabs */}
      <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setSelectedUser('Bob')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md font-medium transition-all',
            selectedUser === 'Bob'
              ? 'bg-bob text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          Bob&apos;s Checklist
        </button>
        <button
          onClick={() => setSelectedUser('Paula')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md font-medium transition-all',
            selectedUser === 'Paula'
              ? 'bg-paula text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          )}
        >
          Paula&apos;s Checklist
        </button>
      </div>

      {/* Daily Checklist */}
      <div className="card p-6">
        <DailyChecklist
          user={selectedUser}
          onSave={async (data) => {
            console.log('Saving checklist data:', data);
            try {
              const response = await fetch('/api/checklist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });

              if (response.ok) {
                console.log('Checklist saved successfully');
                // Refresh data after successful save
                refreshData?.();
              } else {
                console.error('Failed to save checklist');
              }
            } catch (error) {
              console.error('Error saving checklist:', error);
            }
          }}
        />
      </div>

      {/* Body Metrics */}
      <div className="card p-6">
        <BodyMetricsForm
          user={selectedUser}
          onSave={async (data: BodyMetricsData) => {
            console.log('Saving body metrics:', data);
            try {
              const response = await fetch('/api/health-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user: data.user,
                  date: data.date,
                  metrics: {
                    weight: data.weight,
                    bodyFat: data.bodyFat,
                    muscleMass: data.muscleMass,
                    waterPercentage: data.waterPercentage,
                    steps: data.steps,
                    heartRate: data.heartRate,
                    sleepScore: data.sleepScore,
                  }
                }),
              });

              if (response.ok) {
                console.log('Body metrics saved successfully');
                // Refresh dashboard data after successful save
                refreshData?.();
              } else {
                console.error('Failed to save body metrics');
              }
            } catch (error) {
              console.error('Error saving body metrics:', error);
            }
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="btn-secondary flex items-center justify-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>Zobacz kalendarz</span>
        </button>
        <button className="btn-secondary flex items-center justify-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Statystyki</span>
        </button>
      </div>
    </div>
  );
}