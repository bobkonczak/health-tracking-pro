'use client';

import { useState, useEffect } from 'react';
import { Check, Clock, Flame, Edit3 } from 'lucide-react';
import { cn, calculateDailyPoints, calculateBonusPoints, getSuccessLevel } from '@/src/lib/utils';
import { User, DailyEntry } from '@/src/types';
import { useHealthData } from '@/src/hooks/useHealthData';
import { useHealthMetrics } from '@/src/hooks/useHealthMetrics';

interface ChecklistItemProps {
  label: string;
  points: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
  readonly?: boolean;
}

interface TextInputChecklistItemProps {
  label: string;
  points: number;
  value: string;
  onValueChange: (value: string) => void;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

function ChecklistItem({ label, points, checked, onChange, description, icon, readonly = false }: ChecklistItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
        readonly ? 'cursor-default' : 'cursor-pointer',
        checked
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        !readonly && !checked && 'hover:border-gray-300 dark:hover:border-gray-600',
        readonly && 'opacity-75'
      )}
      onClick={() => !readonly && onChange(!checked)}
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
            checked
              ? 'bg-green-500 border-green-500'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
          )}
        >
          {checked && <Check className="w-4 h-4 text-white" />}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            {icon && <span className="text-lg">{icon}</span>}
            <span className={cn('font-medium', checked && 'text-green-700 dark:text-green-400')}>
              {label}
            </span>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-bold',
          checked
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        )}>
          {points} {points === 1 ? 'pkt' : 'pkt'}
        </span>
      </div>
    </div>
  );
}

function TextInputChecklistItem({
  label,
  points,
  value,
  onValueChange,
  checked,
  onChange,
  description,
  icon,
  placeholder
}: TextInputChecklistItemProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        checked
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
              checked
                ? 'bg-green-500 border-green-500'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
            )}
            onClick={() => onChange(!checked)}
          >
            {checked && <Check className="w-4 h-4 text-white" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              {icon && <span className="text-lg">{icon}</span>}
              <span className={cn('font-medium', checked && 'text-green-700 dark:text-green-400')}>
                {label}
              </span>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <span className={cn(
          'px-2 py-1 rounded-full text-xs font-bold',
          checked
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        )}>
          {points} {points === 1 ? 'pkt' : 'pkt'}
        </span>
      </div>
      <div className="ml-9">
        <div className="flex items-center space-x-2">
          <Edit3 className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

interface FastingTimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onPointsChange: (points: number) => void;
}

function FastingTimeInput({ value, onChange, onPointsChange }: FastingTimeInputProps) {
  const handleTimeChange = (time: string) => {
    onChange(time);
    const hour = parseInt(time.split(':')[0]);
    if (hour < 17) {
      onPointsChange(3); // Before 17:00 = 3 points
    } else if (hour < 19) {
      onPointsChange(2); // Before 19:00 = 2 points
    } else {
      onPointsChange(0); // After 19:00 = 0 points
    }
  };

  return (
    <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <label className="font-medium flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Fasting - ostatni posiłek</span>
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Przed 17:00 = 3pkt | Przed 19:00 = 2pkt
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="time"
            value={value}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="px-3 py-1 rounded border dark:bg-gray-700 dark:border-gray-600"
          />
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-bold',
            value ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}>
            {value ? (parseInt(value.split(':')[0]) < 17 ? '3 pkt' : parseInt(value.split(':')[0]) < 19 ? '2 pkt' : '0 pkt') : '0 pkt'}
          </span>
        </div>
      </div>
    </div>
  );
}

interface DailyChecklistProps {
  user: User;
  date?: Date;
  onSave?: (data: DailyEntry) => Promise<void>;
}

export function DailyChecklist({ user, date = new Date(), onSave }: DailyChecklistProps) {
  // Load user-specific data and health metrics
  const { todayEntry, streak, isLoading } = useHealthData(user);
  const healthMetrics = useHealthMetrics(user);

  const [checklist, setChecklist] = useState({
    noSugar: false,
    noAlcohol: false,
    fastingTime: '',
    fastingPoints: 0,
    training: false,
    trainingDescription: '',
    morningRoutine: false,
    sauna: false,
    steps10k: false,
    supplements: false,
    weighedIn: false,
    caloriesTracked: false,
    caloriesDescription: '',
  });

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Update checklist when user changes or data loads
  useEffect(() => {
    if (todayEntry) {
      // Load existing data for this user
      setChecklist({
        ...todayEntry.checklist,
        fastingTime: todayEntry.checklist.fastingTime || '',
        trainingDescription: todayEntry.checklist.trainingDescription || '',
        caloriesDescription: todayEntry.checklist.caloriesDescription || ''
      });
    } else {
      // Reset to empty state for new user or no data
      setChecklist({
        noSugar: false,
        noAlcohol: false,
        fastingTime: '',
        fastingPoints: 0,
        training: false,
        trainingDescription: '',
        morningRoutine: false,
        sauna: false,
        steps10k: false,
        supplements: false,
        weighedIn: false,
        caloriesTracked: false,
        caloriesDescription: '',
      });
    }
  }, [user, todayEntry]);

  // Auto-populate health metrics (steps and weight) from database
  useEffect(() => {
    if (!healthMetrics.isLoading && !healthMetrics.error) {
      setChecklist(prev => ({
        ...prev,
        // Auto-check steps if >= 10k from health_metrics
        steps10k: healthMetrics.steps.value >= 10000,
        // Auto-check weight if data exists in health_metrics
        weighedIn: healthMetrics.weight.value > 0
      }));
    }
  }, [healthMetrics]);
  const dailyPoints = calculateDailyPoints(checklist);
  const bonusPoints = calculateBonusPoints(dailyPoints, streak);
  const totalPoints = dailyPoints + bonusPoints;
  const successLevel = getSuccessLevel(dailyPoints);

  const handleChecklistChange = (key: keyof typeof checklist, value: boolean | string | number) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;

    setSaveState('saving');
    setSaveMessage('');

    try {
      await onSave({
        date: date.toISOString().split('T')[0],
        user,
        checklist,
        dailyPoints,
        bonusPoints,
        totalPoints,
        streak,
      });

      setSaveState('success');
      setSaveMessage('Zapisane!');

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveState('idle');
        setSaveMessage('');
      }, 3000);

    } catch (error) {
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'Błąd podczas zapisywania');

      // Reset to idle after 5 seconds
      setTimeout(() => {
        setSaveState('idle');
        setSaveMessage('');
      }, 5000);
    }
  };

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 text-center animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
        <div className="text-center text-muted-foreground">
          Loading {user}&apos;s checklist...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">Punkty dzienne</p>
          <p className="text-3xl font-bold">{dailyPoints}</p>
          <p className="text-xs text-muted-foreground">/ 16 max</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-muted-foreground">Bonus</p>
          <p className="text-3xl font-bold text-gold">+{bonusPoints}</p>
          {streak > 0 && (
            <p className="text-xs text-muted-foreground flex items-center justify-center">
              <Flame className="w-3 h-3 mr-1" />
              {streak} dni
            </p>
          )}
        </div>
        <div className={cn('card p-4 text-center', `badge-${successLevel}`)}>
          <p className="text-sm text-muted-foreground">Razem</p>
          <p className="text-3xl font-bold">{totalPoints}</p>
          <p className="text-xs font-semibold uppercase">{successLevel}</p>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <span className={user === 'Bob' ? 'text-bob' : 'text-paula'}>{user}</span>
          <span>- Daily Checklist</span>
        </h3>

        {/* Diet */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Dieta</h4>
          <ChecklistItem
            label="Brak cukru"
            points={1}
            checked={checklist.noSugar}
            onChange={(checked) => handleChecklistChange('noSugar', checked)}
            description="Zero słodyczy, deserów, słodzonych napojów"
            icon="🚫🍰"
          />
          <ChecklistItem
            label="Brak alkoholu"
            points={1}
            checked={checklist.noAlcohol}
            onChange={(checked) => handleChecklistChange('noAlcohol', checked)}
            description="0% alkoholu przez cały dzień"
            icon="🚫🍺"
          />
          <FastingTimeInput
            value={checklist.fastingTime}
            onChange={(value) => handleChecklistChange('fastingTime', value)}
            onPointsChange={(points) => handleChecklistChange('fastingPoints', points)}
          />
          <TextInputChecklistItem
            label="Spisane kalorie"
            points={2}
            value={checklist.caloriesDescription}
            onValueChange={(value) => handleChecklistChange('caloriesDescription', value)}
            checked={checklist.caloriesTracked}
            onChange={(checked) => handleChecklistChange('caloriesTracked', checked)}
            description="Wszystkie posiłki zapisane w aplikacji"
            icon="📝"
            placeholder="np. 1850 kcal, 150g białka, 200g węglowodanów..."
          />
        </div>

        {/* Training & Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Aktywność</h4>
          <TextInputChecklistItem
            label="Zrobiony trening"
            points={2}
            value={checklist.trainingDescription}
            onValueChange={(value) => handleChecklistChange('trainingDescription', value)}
            checked={checklist.training}
            onChange={(checked) => handleChecklistChange('training', checked)}
            description="Bieganie, boks, EMS lub konie"
            icon="💪"
            placeholder="np. Bieg 5km, Boks 45min, EMS full body..."
          />
          <ChecklistItem
            label={`${healthMetrics.isLoading ? 'Kroki (ładowanie...)' :
                     healthMetrics.error ? 'Kroki (brak danych)' :
                     `${healthMetrics.steps.value.toLocaleString()} kroków`}`}
            points={2}
            checked={checklist.steps10k}
            onChange={() => {}} // Read-only
            description={healthMetrics.error ? 'Błąd połączenia z Withings' : 'Automatycznie z Withings'}
            icon="🚶"
            readonly={true}
          />
          <ChecklistItem
            label="Sauna"
            points={1}
            checked={checklist.sauna}
            onChange={(checked) => handleChecklistChange('sauna', checked)}
            description="Minimum 15 minut"
            icon="🧖"
          />
        </div>

        {/* Routine */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Rutyna</h4>
          <ChecklistItem
            label="Morning routine"
            points={3}
            checked={checklist.morningRoutine}
            onChange={(checked) => handleChecklistChange('morningRoutine', checked)}
            description="Sun salutation, medytacja, woda, bez telefonu, oddychanie"
            icon="🌅"
          />
          <ChecklistItem
            label="Suplementy"
            points={1}
            checked={checklist.supplements}
            onChange={(checked) => handleChecklistChange('supplements', checked)}
            description="Wszystkie zaplanowane suplementy wzięte"
            icon="💊"
          />
          <ChecklistItem
            label={`${healthMetrics.isLoading ? 'Waga (ładowanie...)' :
                     healthMetrics.error ? 'Waga (brak danych)' :
                     healthMetrics.weight.value > 0 ? `${healthMetrics.weight.value} kg` : 'Brak danych o wadze'}`}
            points={1}
            checked={checklist.weighedIn}
            onChange={() => {}} // Read-only
            description={healthMetrics.error ? 'Błąd połączenia z Withings' : 'Automatycznie z Withings'}
            icon="⚖️"
            readonly={true}
          />
        </div>
      </div>

      {/* Success/Error Message */}
      {saveMessage && (
        <div className={cn(
          'p-3 rounded-lg text-center font-medium',
          saveState === 'success' && 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200',
          saveState === 'error' && 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        )}>
          {saveMessage}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className={cn(
          'w-full py-3 text-lg font-semibold transition-all',
          saveState === 'saving'
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : saveState === 'success'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'btn-primary'
        )}
      >
        {saveState === 'saving' ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Zapisywanie...</span>
          </span>
        ) : saveState === 'success' ? (
          <span className="flex items-center justify-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Zapisane!</span>
          </span>
        ) : (
          `Zapisz dzień (${totalPoints} pkt)`
        )}
      </button>
    </div>
  );
}