'use client';

import React, { useState } from 'react';
import {
  Activity, Heart, Footprints, Weight, TrendingUp, TrendingDown,
  Target, Award, Database, Calendar, ArrowRight, CheckCircle2, XCircle
} from 'lucide-react';
import { useHealthHistory } from '@/src/hooks/useHealthHistory';
import { User } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { HistoricalDataTable } from './HistoricalDataTable';

interface HistoricalHealthDataProps {
  user: User;
}

interface SimpleChartProps {
  data: Array<{ date: string; value: number }>;
  title: string;
  unit: string;
  color: string;
  target?: number;
}

function SimpleChart({ data, title, unit, color, target }: SimpleChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Include target in range calculation if provided
  const displayMin = target ? Math.min(minValue, target) : minValue;
  const displayMax = target ? Math.max(maxValue, target) : maxValue;
  const displayRange = displayMax - displayMin || 1;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="text-xs text-muted-foreground">
          {data.length} records
        </div>
      </div>

      <div className="relative h-32 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
        <svg className="w-full h-full">
          {/* Target line */}
          {target && (
            <line
              x1="0"
              y1={`${((displayMax - target) / displayRange) * 100}%`}
              x2="100%"
              y2={`${((displayMax - target) / displayRange) * 100}%`}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          )}

          {/* Data line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((displayMax - point.value) / displayRange) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((displayMax - point.value) / displayRange) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill={color}
              />
            );
          })}
        </svg>

        {/* Value range labels */}
        <div className="absolute top-0 right-0 text-xs text-muted-foreground">
          {displayMax.toFixed(1)}{unit}
        </div>
        <div className="absolute bottom-0 right-0 text-xs text-muted-foreground">
          {displayMin.toFixed(1)}{unit}
        </div>

        {/* Latest value */}
        <div className="absolute top-0 left-0 text-xs font-medium">
          {data[data.length - 1]?.value.toFixed(1)}{unit}
        </div>

        {/* Trend indicator */}
        {data.length > 1 && (
          <div className="absolute bottom-0 left-0 flex items-center text-xs">
            {data[data.length - 1].value > data[0].value ? (
              <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
            )}
            <span className={cn(
              "font-medium",
              data[data.length - 1].value > data[0].value ? "text-green-600" : "text-red-600"
            )}>
              {Math.abs(data[data.length - 1].value - data[0].value).toFixed(1)}{unit}
            </span>
          </div>
        )}
      </div>

      {/* Date range */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{new Date(data[0]?.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}</span>
        <span>{new Date(data[data.length - 1]?.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  );
}

function DataAvailabilityCalendar({ data }: { data: Array<{ date: string; hasData: boolean }> }) {
  const weeks: Array<Array<{ date: string; hasData: boolean }>> = [];
  let currentWeek: Array<{ date: string; hasData: boolean }> = [];

  data.forEach((day) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    // Start new week on Monday
    if (dayOfWeek === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(day);
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {weeks.slice(-12).map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1">
          {week.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={cn(
                "aspect-square rounded-sm flex items-center justify-center text-xs",
                day.hasData
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
              )}
              title={`${new Date(day.date).toLocaleDateString('pl-PL')}: ${day.hasData ? 'Data available' : 'No data'}`}
            >
              {new Date(day.date).getDate()}
            </div>
          ))}
        </div>
      ))}

      <div className="flex items-center justify-center space-x-4 text-xs mt-2">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>Has data</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
          <span>No data</span>
        </div>
      </div>
    </div>
  );
}

export function HistoricalHealthData({ user }: HistoricalHealthDataProps) {
  const [dateRange, setDateRange] = useState<'all' | '90d' | '30d'>('all');
  const { data, summary, chartData, isLoading, error } = useHealthHistory(
    user,
    dateRange === 'all' ? '2025-09-15' :
    dateRange === '90d' ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium mb-2">Failed to Load Health History</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Historical Health Data Header */}
      <div className="card p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              <Activity className="w-6 h-6 mr-2" />
              Historical Health Data
            </h2>
            <p className="text-muted-foreground mt-1">
              Health metrics from September 15, 2025 onwards
            </p>
          </div>

          <div className="flex space-x-2">
            {['all', '90d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as 'all' | '90d' | '30d')}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm',
                  dateRange === range
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Data Coverage</p>
            <p className="text-2xl font-bold">{summary.dataCompleteness}%</p>
            <p className="text-xs text-muted-foreground">
              {summary.daysWithData} of {summary.totalDays} days
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Weight Progress</p>
            <p className={cn(
              "text-2xl font-bold flex items-center",
              summary.progress.weightChange === 'gained' ? 'text-red-600' : 'text-green-600'
            )}>
              {summary.progress.weightChange === 'gained' ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
              {Math.abs(summary.progress.weight || 0).toFixed(1)}kg
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.progress.weightChange}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Steps Goal</p>
            <p className="text-2xl font-bold">{summary.goals.stepsGoalAchievementRate}%</p>
            <p className="text-xs text-muted-foreground">
              {summary.goals.totalGoalAchievements} of {summary.goals.totalDaysWithSteps} days
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Weight</p>
            <p className="text-2xl font-bold">{summary.averages.weight?.toFixed(1) || '--'}kg</p>
            <p className="text-xs text-muted-foreground">daily average</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Body Fat</p>
            <p className="text-2xl font-bold">{summary.averages.body_fat?.toFixed(1) || '--'}%</p>
            <p className="text-xs text-muted-foreground">daily average</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Steps</p>
            <p className="text-2xl font-bold">{summary.averages.steps ? Math.round(summary.averages.steps).toLocaleString() : '--'}</p>
            <p className="text-xs text-muted-foreground">daily average</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {summary.baseline && summary.latest && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Challenge Progress
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Weight Journey</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Baseline</p>
                  <p className="text-lg font-bold">{summary.baseline.weight?.toFixed(1) || '--'}kg</p>
                  <p className="text-xs text-muted-foreground">{new Date(summary.baseline.date).toLocaleDateString('pl-PL')}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-bold">{summary.latest.weight?.toFixed(1) || '--'}kg</p>
                  <p className="text-xs text-muted-foreground">{new Date(summary.latest.date).toLocaleDateString('pl-PL')}</p>
                </div>
              </div>

              {summary.milestones.bestWeightDay && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Best Weight</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {summary.milestones.bestWeightDay.weight}kg
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(summary.milestones.bestWeightDay.date).toLocaleDateString('pl-PL')}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Steps Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Goal Achievement</p>
                  <p className="text-lg font-bold">{summary.goals.stepsGoalAchievementRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.goals.totalGoalAchievements} successful days
                  </p>
                </div>

                {summary.milestones.bestStepsDay && (
                  <div>
                    <p className="text-sm text-muted-foreground">Best Day</p>
                    <p className="text-lg font-bold text-blue-600">
                      {summary.milestones.bestStepsDay.steps.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(summary.milestones.bestStepsDay.date).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trend Charts */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Health Trends
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleChart
            data={chartData.weight}
            title="Weight Progression"
            unit="kg"
            color="#ef4444"
            target={user === 'Bob' ? 75 : 65}
          />

          <SimpleChart
            data={chartData.bodyFat}
            title="Body Fat Percentage"
            unit="%"
            color="#f59e0b"
            target={user === 'Bob' ? 15 : 18}
          />

          <SimpleChart
            data={chartData.steps}
            title="Daily Steps"
            unit=""
            color="#3b82f6"
            target={10000}
          />

          <SimpleChart
            data={chartData.heartRate}
            title="Heart Rate"
            unit=" bpm"
            color="#06b6d4"
          />
        </div>
      </div>

      {/* Data Availability Calendar */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Data Availability
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataAvailabilityCalendar data={data} />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Data Quality</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Complete days</span>
                  <span className="font-medium">{summary.daysWithData}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Missing days</span>
                  <span className="font-medium">{summary.totalDays - summary.daysWithData}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Coverage</span>
                  <span className="font-medium">{summary.dataCompleteness}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Data Sources</p>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm">Withings Scale</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      <HistoricalDataTable data={data} title="Daily Health Records" />
    </div>
  );
}