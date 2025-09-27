'use client';

import { useState } from 'react';
import { Scale, Heart, Activity, Droplets, TrendingUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { User } from '@/src/types';

interface BodyMetricsFormProps {
  user: User;
  date?: Date;
  onSave?: (data: BodyMetricsData) => void;
  existingData?: BodyMetricsData;
}

export interface BodyMetricsData {
  date: string;
  user: User;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waterPercentage?: number;
  steps?: number;
  heartRate?: number;
  sleepScore?: number;
}

export function BodyMetricsForm({ user, date = new Date(), onSave, existingData }: BodyMetricsFormProps) {
  const [metrics, setMetrics] = useState<BodyMetricsData>(() => ({
    date: date.toISOString().split('T')[0],
    user,
    weight: existingData?.weight || undefined,
    bodyFat: existingData?.bodyFat || undefined,
    muscleMass: existingData?.muscleMass || undefined,
    waterPercentage: existingData?.waterPercentage || undefined,
    steps: existingData?.steps || undefined,
    heartRate: existingData?.heartRate || undefined,
    sleepScore: existingData?.sleepScore || undefined,
  }));

  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof BodyMetricsData, value: string) => {
    const numericValue = value === '' ? undefined : parseFloat(value);
    setMetrics(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      await onSave(metrics);
    } catch (error) {
      console.error('Error saving metrics:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasData = Object.values(metrics).some(value =>
    typeof value === 'number' && !isNaN(value)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold flex items-center justify-center space-x-2">
          <Activity className="w-5 h-5" />
          <span className={user === 'Bob' ? 'text-bob' : 'text-paula'}>
            {user}&apos;s Body Metrics
          </span>
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manual entry • Auto-synced from iOS Health when available
        </p>
      </div>

      {/* Body Composition */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
          <Scale className="w-4 h-4 mr-2" />
          Body Composition
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="300"
              value={metrics.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="75.5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Body Fat (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={metrics.bodyFat || ''}
              onChange={(e) => handleChange('bodyFat', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="18.5"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Muscle Mass (kg)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={metrics.muscleMass || ''}
              onChange={(e) => handleChange('muscleMass', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="55.2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Droplets className="w-3 h-3 mr-1" />
              Water (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={metrics.waterPercentage || ''}
              onChange={(e) => handleChange('waterPercentage', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="60.0"
            />
          </div>
        </div>
      </div>

      {/* Activity & Health */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Activity & Health
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Steps</label>
            <input
              type="number"
              step="1"
              min="0"
              max="50000"
              value={metrics.steps || ''}
              onChange={(e) => handleChange('steps', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="12500"
            />
            {metrics.steps && metrics.steps >= 10000 && (
              <p className="text-xs text-green-600 dark:text-green-400">
                ✅ 10k+ steps achieved (+2 points)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Heart className="w-3 h-3 mr-1" />
              Resting HR (bpm)
            </label>
            <input
              type="number"
              step="1"
              min="30"
              max="120"
              value={metrics.heartRate || ''}
              onChange={(e) => handleChange('heartRate', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="65"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sleep Score (0-100)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={metrics.sleepScore || ''}
              onChange={(e) => handleChange('sleepScore', e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
              placeholder="85"
            />
          </div>
        </div>
      </div>

      {/* Auto-calculations */}
      {hasData && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Auto-calculations</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            {metrics.weight && (
              <p>✅ Weighed in today (+1 point)</p>
            )}
            {metrics.steps && metrics.steps >= 10000 && (
              <p>✅ 10k+ steps achieved (+2 points)</p>
            )}
            {metrics.bodyFat && user === 'Bob' && (
              <p>🎯 Body fat: {metrics.bodyFat}% (Target: &lt;20%)</p>
            )}
            {metrics.weight && user === 'Paula' && (
              <p>🎯 Weight: {metrics.weight}kg (Target: 75kg)</p>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!hasData || saving}
        className={cn(
          'w-full py-3 rounded-md font-semibold transition-all',
          hasData
            ? 'bg-primary text-white hover:bg-primary/90'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        )}
      >
        {saving ? 'Saving...' : hasData ? 'Save Metrics' : 'Enter some data to save'}
      </button>

      {/* iOS Health Integration Info */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 <strong>Pro tip:</strong> Set up iOS Shortcuts to automatically send this data from your Health app.
          Manual entry is great for backup or when automatic sync isn&apos;t available.
        </p>
      </div>
    </div>
  );
}