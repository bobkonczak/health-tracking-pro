'use client';

import React from 'react';
import { CheckSquare, Flame } from 'lucide-react';
import { Header } from '@/src/components/layout/Header';
import { DailyChecklist } from '@/src/components/checklist/DailyChecklist';
import { useTheme } from '@/src/contexts/ThemeContext';

export default function ChecklistPage() {
  const { selectedUser, setSelectedUser, theme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Header selectedUser={selectedUser} onUserChange={setSelectedUser} />

      <main className="container mx-auto px-4 py-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <CheckSquare className="w-8 h-8 mr-3" />
              Daily Checklist
            </h1>
            <p className="text-muted-foreground mt-2">
              Complete your daily tasks to earn points and maintain your streak
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
    </div>
  );
}