# 🔗 POŁĄCZENIE APLIKACJI Z PIPEDREAM

## 📋 ZADANIE
Skonfiguruj pełną integrację między aplikacją Next.js a Pipedream workflows

## 🎯 CEL
Zamień mock data w aplikacji na prawdziwe dane z Notion przez Pipedream API

---

## 🔧 KROK 1: Stwórz API Layer w aplikacji

### Utwórz `/app/api/checklist/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

const PIPEDREAM_API_URL = process.env.PIPEDREAM_WEBHOOK_URL;
const API_SECRET = process.env.API_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`${PIPEDREAM_API_URL}/daily?user=${user}&date=${date}`, {
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${PIPEDREAM_API_URL}/checklist`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
}
```

---

## 🔧 KROK 2: Stwórz hook do zarządzania danymi

### Utwórz `/src/lib/useHealthData.ts`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { DailyEntry, User } from '@/src/types';

export function useHealthData() {
  const [data, setData] = useState<Record<string, DailyEntry>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyData = async (user: string, date?: string) => {
    try {
      const response = await fetch(`/api/checklist?user=${user}&date=${date || ''}`);
      const result = await response.json();
      
      if (response.ok) {
        return result;
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const updateChecklist = async (user: string, updates: any) => {
    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user,
          date: new Date().toISOString().split('T')[0],
          updates
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Update local state
        await loadTodayData();
        return result;
      } else {
        throw new Error(result.error || 'Failed to update checklist');
      }
    } catch (err) {
      console.error('Error updating checklist:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  };

  const loadTodayData = async () => {
    setLoading(true);
    try {
      const bobData = await fetchDailyData('Bob');
      const paulaData = await fetchDailyData('Paula');
      
      setData({
        Bob: bobData,
        Paula: paulaData
      });
    } catch (err) {
      setError('Failed to load today\'s data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayData();
  }, []);

  return {
    data,
    loading,
    error,
    updateChecklist,
    refetch: loadTodayData
  };
}
```

---

## 🔧 KROK 3: Zaktualizuj główną stronę

### Zaktualizuj `/app/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import DailyChecklist from '@/src/components/checklist/DailyChecklist';
import { useHealthData } from '@/src/lib/useHealthData';
import { User } from '@/src/types';

const users: User[] = [
  { id: 'Bob', name: 'Bob', color: '#3b82f6', theme: 'blue' },
  { id: 'Paula', name: 'Paula', color: '#ec4899', theme: 'pink' },
];

export default function HomePage() {
  const { data, loading, error, updateChecklist } = useHealthData();

  const handleUpdate = async (userId: string, updates: any) => {
    await updateChecklist(userId, updates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Today's Score */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🏆 Today's Battle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {data.Bob?.points?.total || 0}
            </div>
            <div className="text-lg font-medium text-gray-700">Bob</div>
            <div className="text-sm text-gray-500">
              {data.Bob?.streakDays || 0} days streak 🔥
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">
              {data.Paula?.points?.total || 0}
            </div>
            <div className="text-lg font-medium text-gray-700">Paula</div>
            <div className="text-sm text-gray-500">
              {data.Paula?.streakDays || 0} days streak 🔥
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          {(data.Bob?.points?.total || 0) > (data.Paula?.points?.total || 0) ? (
            <div className="text-blue-600 font-bold">🎉 Bob is winning today!</div>
          ) : (data.Paula?.points?.total || 0) > (data.Bob?.points?.total || 0) ? (
            <div className="text-pink-600 font-bold">🎉 Paula is winning today!</div>
          ) : (
            <div className="text-gray-600 font-bold">🤝 It's a tie!</div>
          )}
        </div>
      </div>

      {/* Daily Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {users.map((user) => (
          <DailyChecklist
            key={user.id}
            user={user}
            entry={data[user.id]}
            onUpdate={(updates) => handleUpdate(user.id, updates)}
          />
        ))}
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {((data.Bob?.points?.total || 0) + (data.Paula?.points?.total || 0))}
          </div>
          <div className="text-sm text-gray-600">Total Points Today</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(data.Bob?.streakDays || 0, data.Paula?.streakDays || 0)}
          </div>
          <div className="text-sm text-gray-600">Best Streak</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-purple-600">
            {((data.Bob?.metrics?.steps || 0) + (data.Paula?.metrics?.steps || 0))}
          </div>
          <div className="text-sm text-gray-600">Total Steps</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-orange-600">
            {data.Bob?.metrics?.weight || data.Paula?.metrics?.weight ? '✅' : '⏳'}
          </div>
          <div className="text-sm text-gray-600">Today's Weigh-in</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 KROK 4: Environment Variables

### Zaktualizuj `.env.local`:
```bash
# Pipedream Integration
PIPEDREAM_WEBHOOK_URL=https://your-unique-id.m.pipedream.net
API_SECRET=your-random-secret-key

# App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Będą dodane po konfiguracji Pipedream:
NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=xxxxx
```

---

## 🔧 KROK 5: Test Integration

### Stwórz test endpoint `/app/api/test/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test Pipedream connection
    const response = await fetch(`${process.env.PIPEDREAM_WEBHOOK_URL}/health`);
    
    if (response.ok) {
      return NextResponse.json({ 
        status: 'connected', 
        pipedream: 'OK',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Pipedream connection failed' 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Integration test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
```

---

## 🚀 DEPLOYMENT CHECKLIST:

### ✅ Pipedream Setup:
1. [ ] Notion database utworzona
2. [ ] Withings API skonfigurowane  
3. [ ] Wszystkie 6 workflows działają
4. [ ] Webhooks odpowiadają na /health

### ✅ App Configuration:
1. [ ] Environment variables ustawione
2. [ ] API routes przetestowane
3. [ ] useHealthData hook działa
4. [ ] Real-time updates funkcjonują

### ✅ Final Tests:
1. [ ] Checkbox update → Notion updated
2. [ ] Withings sync → App shows new data
3. [ ] Streaks calculating correctly
4. [ ] Push notifications working

---

## 🎯 SUCCESS CRITERIA:
- ✅ Zero mock data in app
- ✅ Real-time Notion synchronization  
- ✅ Automatic Withings data import
- ✅ Live competition scoring
- ✅ Push notifications active

**Aplikacja w pełni zautomatyzowana i gotowa do 12-week challenge! 🏆**
