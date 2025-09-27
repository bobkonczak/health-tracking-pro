'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface ProgressData {
  date: string;
  bobDaily: number;
  bobBonus: number;
  paulaDaily: number;
  paulaBonus: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
  period: '7d' | '14d' | '30d';
}

export function ProgressChart({ data, title, period }: ProgressChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (period === '7d' || period === '14d') {
        return format(date, 'EEE'); // Mon, Tue, etc.
      }
      return format(date, 'dd/MM');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs"
            />
            <YAxis
              label={{ value: 'Punkty', angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip
              labelFormatter={(value) => formatDate(value)}
              formatter={(value: number, name: string) => [
                value,
                name
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar
              dataKey="bobDaily"
              stackId="bob"
              fill="hsl(var(--bob))"
              name="Bob - Dzienny"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="bobBonus"
              stackId="bob"
              fill="hsl(var(--bob) / 0.7)"
              name="Bob - Bonus"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="paulaDaily"
              stackId="paula"
              fill="hsl(var(--paula))"
              name="Paula - Dzienny"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="paulaBonus"
              stackId="paula"
              fill="hsl(var(--paula) / 0.7)"
              name="Paula - Bonus"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}