'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { CheckSquare, Flame, ArrowLeft, Calendar } from 'lucide-react';
import { DailyChecklist } from '@/src/components/checklist/DailyChecklist';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ChecklistContent() {
  const { selectedUser, setSelectedUser } = useTheme();
  const searchParams = useSearchParams();
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [historicalMode, setHistoricalMode] = useState(false);

  useEffect(() => {
    const dateParam = searchParams.get('date');
    const userParam = searchParams.get('user');

    if (dateParam) {
      setTargetDate(dateParam);
      setHistoricalMode(true);
    }

    if (userParam && (userParam === 'Bob' || userParam === 'Paula')) {
      setSelectedUser(userParam);
    }
  }, [searchParams, setSelectedUser]);

  return (
    <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Historical Mode Banner */}
          {historicalMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                      Historical Entry Mode
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Editing checklist for {new Date(targetDate!).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href="/stats"
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Stats
                </Link>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <CheckSquare className="w-8 h-8 mr-3" />
              {historicalMode ? 'Historical' : 'Daily'} Checklist
            </h1>
            <p className="text-muted-foreground mt-2">
              {historicalMode
                ? 'Add or edit tasks for this historical date'
                : 'Complete your daily tasks to earn points and maintain your streak'
              }
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

          {/* Daily Checklist Component */}
          <div className="card p-6">
            <DailyChecklist
              user={selectedUser}
              date={targetDate ? new Date(targetDate) : new Date()}
              onSave={async (data) => {
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
          </div>

          {/* Helpful Tips */}
          <div className="card p-4 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-2 flex items-center">
              <Flame className="w-4 h-4 mr-2 text-orange-500" />
              Streak Bonuses
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 3+ days streak: +1 bonus point</li>
              <li>• 7+ days streak: +2 bonus points</li>
              <li>• 14+ days streak: +3 bonus points</li>
            </ul>
          </div>
        </div>
      </main>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold flex items-center justify-center">
              <CheckSquare className="w-8 h-8 mr-3" />
              Daily Checklist
            </h1>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <ChecklistContent />
    </Suspense>
  );
}