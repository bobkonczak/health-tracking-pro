'use client';

import { useState } from 'react';
import { TrendChart } from '@/src/components/charts/TrendChart';
import { ProgressChart } from '@/src/components/charts/ProgressChart';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// Mock data
const mockBodyData = [
  { date: '2024-09-15', bobValue: 20.3, paulaValue: 77.0 },
  { date: '2024-09-16', bobValue: 20.2, paulaValue: 76.8 },
  { date: '2024-09-17', bobValue: 20.1, paulaValue: 76.5 },
  { date: '2024-09-18', bobValue: 20.0, paulaValue: 76.3 },
  { date: '2024-09-19', bobValue: 19.9, paulaValue: 76.0 },
  { date: '2024-09-20', bobValue: 19.8, paulaValue: 75.8 },
  { date: '2024-09-21', bobValue: 19.7, paulaValue: 75.5 },
];

const mockPointsData = [
  { date: '2024-09-15', bobDaily: 12, bobBonus: 3, paulaDaily: 14, paulaBonus: 5 },
  { date: '2024-09-16', bobDaily: 10, bobBonus: 2, paulaDaily: 11, paulaBonus: 3 },
  { date: '2024-09-17', bobDaily: 14, bobBonus: 5, paulaDaily: 13, paulaBonus: 5 },
  { date: '2024-09-18', bobDaily: 13, bobBonus: 5, paulaDaily: 15, paulaBonus: 7 },
  { date: '2024-09-19', bobDaily: 11, bobBonus: 3, paulaDaily: 12, paulaBonus: 3 },
  { date: '2024-09-20', bobDaily: 15, bobBonus: 7, paulaDaily: 14, paulaBonus: 5 },
  { date: '2024-09-21', bobDaily: 13, bobBonus: 5, paulaDaily: 16, paulaBonus: 10 },
];

const mockStepsData = [
  { date: '2024-09-15', bobValue: 12500, paulaValue: 11200 },
  { date: '2024-09-16', bobValue: 8500, paulaValue: 9800 },
  { date: '2024-09-17', bobValue: 15200, paulaValue: 13400 },
  { date: '2024-09-18', bobValue: 11800, paulaValue: 10500 },
  { date: '2024-09-19', bobValue: 9200, paulaValue: 12100 },
  { date: '2024-09-20', bobValue: 14500, paulaValue: 16200 },
  { date: '2024-09-21', bobValue: 13100, paulaValue: 11800 },
];

export default function StatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d'>('7d');
  const [selectedChart, setSelectedChart] = useState<'body' | 'points' | 'steps'>('body');

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '7d': return 'Ostatnie 7 dni';
      case '14d': return 'Ostatnie 14 dni';
      case '30d': return 'Ostatnie 30 dni';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold flex items-center justify-center md:justify-start space-x-2">
          <BarChart3 className="w-8 h-8" />
          <span>Statystyki</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Analizuj swoje postępy i trendy
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Period Selector */}
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {(['7d', '14d', '30d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'px-3 py-2 rounded-md font-medium transition-all text-sm',
                selectedPeriod === period
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {period === '7d' && '7 dni'}
              {period === '14d' && '14 dni'}
              {period === '30d' && '30 dni'}
            </button>
          ))}
        </div>

        {/* Chart Type Selector */}
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setSelectedChart('body')}
            className={cn(
              'px-3 py-2 rounded-md font-medium transition-all text-sm flex items-center space-x-1',
              selectedChart === 'body'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Ciało</span>
          </button>
          <button
            onClick={() => setSelectedChart('points')}
            className={cn(
              'px-3 py-2 rounded-md font-medium transition-all text-sm flex items-center space-x-1',
              selectedChart === 'points'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Punkty</span>
          </button>
          <button
            onClick={() => setSelectedChart('steps')}
            className={cn(
              'px-3 py-2 rounded-md font-medium transition-all text-sm flex items-center space-x-1',
              selectedChart === 'steps'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>Kroki</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">Bob - Progress</p>
          <p className="text-2xl font-bold text-bob">23%</p>
          <p className="text-xs text-muted-foreground">do celu</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">Paula - Progress</p>
          <p className="text-2xl font-bold text-paula">18%</p>
          <p className="text-xs text-muted-foreground">do celu</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">Średnia dzienna</p>
          <p className="text-2xl font-bold">12.5</p>
          <p className="text-xs text-muted-foreground">punktów</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">Consistency</p>
          <p className="text-2xl font-bold">85%</p>
          <p className="text-xs text-muted-foreground">dni 8+ pkt</p>
        </div>
      </div>

      {/* Charts */}
      {selectedChart === 'body' && (
        <TrendChart
          data={mockBodyData}
          title={`Postęp ciała - ${getPeriodLabel()}`}
          yAxisLabel="Bob: Body Fat % | Paula: Waga (kg)"
          bobLabel="Bob (Body Fat %)"
          paulaLabel="Paula (Waga kg)"
        />
      )}

      {selectedChart === 'points' && (
        <ProgressChart
          data={mockPointsData}
          title={`Punkty dzienne - ${getPeriodLabel()}`}
          period={selectedPeriod}
        />
      )}

      {selectedChart === 'steps' && (
        <TrendChart
          data={mockStepsData}
          title={`Kroki dzienne - ${getPeriodLabel()}`}
          yAxisLabel="Liczba kroków"
          bobLabel="Bob"
          paulaLabel="Paula"
        />
      )}

      {/* Insights Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-3">🔥 Najlepsze streak&apos;i</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Bob - najdłuższy</span>
              <span className="font-semibold">12 dni</span>
            </div>
            <div className="flex justify-between">
              <span>Paula - najdłuższy</span>
              <span className="font-semibold">15 dni</span>
            </div>
            <div className="flex justify-between">
              <span>Bob - obecny</span>
              <span className="font-semibold text-bob">5 dni</span>
            </div>
            <div className="flex justify-between">
              <span>Paula - obecny</span>
              <span className="font-semibold text-paula">7 dni</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-3">📊 Rekordy</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Najlepszy dzień</span>
              <span className="font-semibold">22 pkt (Paula)</span>
            </div>
            <div className="flex justify-between">
              <span>Najlepszy tydzień</span>
              <span className="font-semibold">118 pkt (Bob)</span>
            </div>
            <div className="flex justify-between">
              <span>Perfect days</span>
              <span className="font-semibold">8 (Bob), 12 (Paula)</span>
            </div>
            <div className="flex justify-between">
              <span>Wygrane tygodnie</span>
              <span className="font-semibold">4 (Bob), 3 (Paula)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Podsumowanie tygodniowe</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Ten tydzień</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Bob</span>
                <span className="text-bob font-semibold">78 pkt</span>
              </div>
              <div className="flex justify-between">
                <span>Paula</span>
                <span className="text-paula font-semibold">85 pkt</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Poprzedni tydzień</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Bob</span>
                <span className="text-bob font-semibold">92 pkt</span>
              </div>
              <div className="flex justify-between">
                <span>Paula</span>
                <span className="text-paula font-semibold">88 pkt</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trend</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Bob</span>
                <span className="text-red-500">-14 pkt</span>
              </div>
              <div className="flex justify-between">
                <span>Paula</span>
                <span className="text-green-500">+3 pkt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}