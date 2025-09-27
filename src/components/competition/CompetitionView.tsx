'use client';

import { useState } from 'react';
import { Trophy, Crown, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { User } from '@/src/types';

interface CompetitionStats {
  bobWeekly: number;
  paulaWeekly: number;
  bobMonthly: number;
  paulaMonthly: number;
  weekLeader: User;
  monthLeader: User;
  daysLeft: number;
  champions: {
    steps: User;
    training: User;
    streak: User;
    bodyProgress: User;
    perfectDays: User;
  };
  powerUps: {
    Bob: PowerUp[];
    Paula: PowerUp[];
  };
}

interface PowerUp {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
}

const mockCompetitionData: CompetitionStats = {
  bobWeekly: 78,
  paulaWeekly: 85,
  bobMonthly: 312,
  paulaMonthly: 295,
  weekLeader: 'Paula',
  monthLeader: 'Bob',
  daysLeft: 2,
  champions: {
    steps: 'Bob',
    training: 'Paula',
    streak: 'Paula',
    bodyProgress: 'Bob',
    perfectDays: 'Paula',
  },
  powerUps: {
    Bob: [
      {
        id: '1',
        type: 'progress_boost',
        name: 'Body Progress Champion',
        description: 'x2 punkty za ważenie przez 3 dni',
        icon: '📊',
        active: true,
      },
    ],
    Paula: [
      {
        id: '2',
        type: 'steps_multiplier',
        name: 'Steps Champion',
        description: 'x2 punkty za kroki przez 1 dzień',
        icon: '🏃',
        active: true,
      },
      {
        id: '3',
        type: 'streak_shield',
        name: 'Streak Champion',
        description: 'Ochrona przed przerwaniem streak',
        icon: '🛡️',
        active: false,
      },
    ],
  },
};

export function CompetitionView() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [data] = useState(mockCompetitionData);

  const getCurrentStats = () => {
    if (selectedPeriod === 'week') {
      return {
        bob: data.bobWeekly,
        paula: data.paulaWeekly,
        leader: data.weekLeader,
        title: 'Tygodniowa rywalizacja',
        subtitle: `${data.daysLeft} dni do końca`,
      };
    } else {
      return {
        bob: data.bobMonthly,
        paula: data.paulaMonthly,
        leader: data.monthLeader,
        title: 'Miesięczna rywalizacja',
        subtitle: 'Całościowy wynik',
      };
    }
  };

  const stats = getCurrentStats();
  const totalPoints = stats.bob + stats.paula;
  const bobPercentage = (stats.bob / totalPoints) * 100;
  const paulaPercentage = (stats.paula / totalPoints) * 100;
  const leadMargin = Math.abs(stats.bob - stats.paula);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Trophy className="w-8 h-8 text-gold" />
          <span>Rywalizacja</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Bob vs Paula - kto będzie championem?
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setSelectedPeriod('week')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md font-medium transition-all',
            selectedPeriod === 'week'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          Ten tydzień
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md font-medium transition-all',
            selectedPeriod === 'month'
              ? 'bg-white dark:bg-gray-700 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          )}
        >
          Ten miesiąc
        </button>
      </div>

      {/* Main Competition Display */}
      <div className="card p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">{stats.title}</h2>
          <p className="text-sm text-muted-foreground">{stats.subtitle}</p>
        </div>

        {/* Race Track Visualization */}
        <div className="relative mb-6">
          <div className="flex h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
            <div
              className="bg-bob flex items-center justify-center text-white font-bold transition-all duration-1000 relative"
              style={{ width: `${bobPercentage}%` }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  🧔
                </div>
                <span>Bob: {stats.bob}</span>
              </div>
            </div>
            <div
              className="bg-paula flex items-center justify-center text-white font-bold transition-all duration-1000 relative"
              style={{ width: `${paulaPercentage}%` }}
            >
              <div className="flex items-center space-x-2">
                <span>Paula: {stats.paula}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  👩
                </div>
              </div>
            </div>
          </div>

          {/* Leader Crown */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Crown className="w-6 h-6 text-gold animate-bounce-slow" />
          </div>
        </div>

        {/* Lead Information */}
        <div className="text-center">
          {stats.bob === stats.paula ? (
            <div className="badge badge-warning">
              Remis! 🤝 Każdy ma {stats.bob} punktów
            </div>
          ) : (
            <div className={cn(
              'badge',
              stats.leader === 'Bob' ? 'user-bob' : 'user-paula'
            )}>
              <span className="font-semibold">{stats.leader}</span> prowadzi o{' '}
              <span className="font-bold">{leadMargin} pkt</span>
            </div>
          )}
        </div>
      </div>

      {/* Champions Board */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Crown className="w-5 h-5 mr-2 text-gold" />
          Championi kategorii
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(data.champions).map(([category, champion]) => (
            <div
              key={category}
              className={cn(
                'p-3 rounded-lg border-2 text-center',
                champion === 'Bob' ? 'border-bob/30 bg-bob/5' : 'border-paula/30 bg-paula/5'
              )}
            >
              <div className="text-2xl mb-1">
                {category === 'steps' && '🏃'}
                {category === 'training' && '💪'}
                {category === 'streak' && '🔥'}
                {category === 'bodyProgress' && '📊'}
                {category === 'perfectDays' && '⭐'}
              </div>
              <p className="text-xs text-muted-foreground capitalize">{category}</p>
              <p className={cn(
                'font-semibold',
                champion === 'Bob' ? 'text-bob' : 'text-paula'
              )}>
                {champion}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Power-ups */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bob's Power-ups */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-bob">
            <Zap className="w-5 h-5 mr-2" />
            Bob&apos;s Power-ups
          </h3>
          <div className="space-y-3">
            {data.powerUps.Bob.map((powerUp) => (
              <div
                key={powerUp.id}
                className={cn(
                  'p-3 rounded-lg border',
                  powerUp.active
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{powerUp.icon}</span>
                    <div>
                      <p className="font-medium">{powerUp.name}</p>
                      <p className="text-xs text-muted-foreground">{powerUp.description}</p>
                    </div>
                  </div>
                  {powerUp.active && (
                    <div className="badge badge-success">Aktywny</div>
                  )}
                </div>
              </div>
            ))}
            {data.powerUps.Bob.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Brak aktywnych power-upów
              </p>
            )}
          </div>
        </div>

        {/* Paula's Power-ups */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-paula">
            <Zap className="w-5 h-5 mr-2" />
            Paula&apos;s Power-ups
          </h3>
          <div className="space-y-3">
            {data.powerUps.Paula.map((powerUp) => (
              <div
                key={powerUp.id}
                className={cn(
                  'p-3 rounded-lg border',
                  powerUp.active
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{powerUp.icon}</span>
                    <div>
                      <p className="font-medium">{powerUp.name}</p>
                      <p className="text-xs text-muted-foreground">{powerUp.description}</p>
                    </div>
                  </div>
                  {powerUp.active && (
                    <div className="badge badge-success">Aktywny</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Competition Info */}
      <div className="card p-6 bg-gradient-to-r from-gold/10 to-gold/5 border-gold/20">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Następne wyniki</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Wyniki tygodnia będą ogłoszone w niedzielę o 20:00
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <div>
              <p className="font-semibold">Nagroda</p>
              <p className="text-muted-foreground">Seks oralny</p>
            </div>
            <div>
              <p className="font-semibold">Kara</p>
              <p className="text-muted-foreground">Dodatkowy trening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Quote */}
      <div className="text-center p-6 bg-gradient-to-r from-bob/10 to-paula/10 rounded-lg">
        <p className="text-lg italic">
          &ldquo;Prawdziwym przeciwnikiem nie jest druga osoba, ale lenistwo i brak konsekwencji&rdquo;
        </p>
        <p className="text-sm text-muted-foreground mt-2">- Health Tracking Pro</p>
      </div>
    </div>
  );
}