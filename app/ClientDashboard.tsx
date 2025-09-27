'use client';

import React, { useState, Suspense } from 'react';
import { Trophy, Target, Flame, Users, AlertCircle } from 'lucide-react';
import { useCompetitionData } from '@/src/hooks/useHealthData';
import { Header } from '@/src/components/layout/Header';

// Lazy load heavy components to prevent SSR issues
import dynamic from 'next/dynamic';

const DailyChecklist = dynamic(() => import('@/src/components/checklist/DailyChecklist').then(mod => ({ default: mod.DailyChecklist })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-40"></div>,
  ssr: false
});


// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-medium text-red-800">Something went wrong</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ClientDashboard() {
  const [selectedUser, setSelectedUser] = useState<'Bob' | 'Paula'>('Bob');
  const [dataError, setDataError] = useState<string | null>(null);

  // Use real competition data from hooks
  const competitionData = useCompetitionData();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header
          selectedUser={selectedUser}
          onUserChange={setSelectedUser}
        />
        <main className="container mx-auto px-4 py-6 md:px-8">
          <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">Dzień dobry! 💪</h1>
          <p className="text-muted-foreground mt-2">
            Dzień {Math.floor((new Date('2024-09-27').getTime() - new Date('2024-09-15').getTime()) / (1000 * 60 * 60 * 24)) + 1} z 101 challenge. Keep pushing!
            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              ✓ App running at {typeof window !== 'undefined' ? window.location.hostname : 'health.konczak.io'}
            </span>
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              🗄️ Database: {competitionData.isLoading ? 'Checking...' : competitionData.error ? 'Offline' : 'Connected'}
            </span>
          </p>
        </div>

        {/* Show any data errors */}
        {dataError && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Database Connection Issue
              </h3>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              {dataError}. Using cached data.
            </p>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Bob Stats */}
          <div className="card p-4 border-2 border-bob/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-bob">Bob</span>
              <Trophy className="w-4 h-4 text-bob" />
            </div>
            <p className="text-2xl font-bold">{competitionData.bobToday} pkt</p>
            <p className="text-xs text-muted-foreground">Dziś</p>
            <div className="mt-2 flex items-center text-xs">
              <Flame className="w-3 h-3 mr-1 text-orange-500" />
              <span>{competitionData.bobStreak} dni streak</span>
            </div>
          </div>

          {/* Paula Stats */}
          <div className="card p-4 border-2 border-paula/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-paula">Paula</span>
              <Trophy className="w-4 h-4 text-paula" />
            </div>
            <p className="text-2xl font-bold">{competitionData.paulaToday} pkt</p>
            <p className="text-xs text-muted-foreground">Dziś</p>
            <div className="mt-2 flex items-center text-xs">
              <Flame className="w-3 h-3 mr-1 text-orange-500" />
              <span>{competitionData.paulaStreak} dni streak</span>
            </div>
          </div>

          {/* Weekly Leader */}
          <div className="card p-4 bg-gradient-to-br from-gold/10 to-gold/5 border-2 border-gold/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Lider tygodnia</span>
              <Trophy className="w-4 h-4 text-gold" />
            </div>
            <p className="text-2xl font-bold text-gold">{competitionData.weekLeader}</p>
            <p className="text-xs text-muted-foreground">
              {competitionData.weekLeader === 'Bob' ? competitionData.bobWeekly : competitionData.paulaWeekly} pkt
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
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-bob h-1.5 rounded-full transition-all" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-paula">Paula</span>
                  <span>60%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className="bg-paula h-1.5 rounded-full transition-all" style={{ width: '60%' }} />
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
                <div
                  className="bg-bob flex items-center justify-center text-white text-sm font-bold transition-all"
                  style={{ width: `${(competitionData.bobWeekly / (competitionData.bobWeekly + competitionData.paulaWeekly)) * 100}%` }}
                >
                  Bob: {competitionData.bobWeekly}
                </div>
                <div
                  className="bg-paula flex items-center justify-center text-white text-sm font-bold transition-all"
                  style={{ width: `${(competitionData.paulaWeekly / (competitionData.bobWeekly + competitionData.paulaWeekly)) * 100}%` }}
                >
                  Paula: {competitionData.paulaWeekly}
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm">
                <span className={`font-semibold ${competitionData.weekLeader === 'Bob' ? 'text-bob' : 'text-paula'}`}>
                  {competitionData.weekLeader}
                </span> prowadzi{' '}
                <span className="font-semibold">+{Math.abs(competitionData.bobWeekly - competitionData.paulaWeekly)} pkt</span>
              </p>
            </div>
          </div>
        </div>

        {/* User Selection Tabs */}
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setSelectedUser('Bob')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              selectedUser === 'Bob'
                ? 'bg-bob text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Bob&apos;s Checklist
          </button>
          <button
            onClick={() => setSelectedUser('Paula')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              selectedUser === 'Paula'
                ? 'bg-paula text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Paula&apos;s Checklist
          </button>
        </div>

        {/* Daily Checklist - Dynamically loaded */}
        <ErrorBoundary fallback={
          <div className="card p-6">
            <div className="flex items-center space-x-2 text-yellow-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-medium">Checklist temporarily unavailable</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The daily checklist component failed to load. Please refresh the page.
            </p>
          </div>
        }>
          <div className="card p-6">
            <Suspense fallback={
              <div className="space-y-4">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 rounded"></div>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded"></div>
              </div>
            }>
              <DailyChecklist
                user={selectedUser}
                onSave={async (data) => {
                  setDataError(null);

                  const response = await fetch('/api/checklist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });

                  const result = await response.json();

                  if (!response.ok) {
                    throw new Error(result.error || `Failed to save checklist (${response.status})`);
                  }
                }}
              />
            </Suspense>
          </div>
        </ErrorBoundary>


        {/* Footer with Version */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Health Tracking Pro v1.1.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date().toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}