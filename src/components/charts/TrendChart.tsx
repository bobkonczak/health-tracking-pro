'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ChartDataPoint } from '@/src/types';

interface TrendChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel: string;
  bobLabel?: string;
  paulaLabel?: string;
  showBob?: boolean;
  showPaula?: boolean;
}

export function TrendChart({
  data,
  title,
  yAxisLabel,
  bobLabel = 'Bob',
  paulaLabel = 'Paula',
  showBob = true,
  showPaula = true,
}: TrendChartProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
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
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs"
            />
            <YAxis
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              className="text-xs"
            />
            <Tooltip
              labelFormatter={(value) => formatDate(value)}
              formatter={(value: number, name: string) => [
                typeof value === 'number' ? value.toFixed(1) : value,
                name
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {showBob && (
              <Line
                type="monotone"
                dataKey="bobValue"
                stroke="hsl(var(--bob))"
                strokeWidth={2}
                name={bobLabel}
                dot={{ fill: 'hsl(var(--bob))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {showPaula && (
              <Line
                type="monotone"
                dataKey="paulaValue"
                stroke="hsl(var(--paula))"
                strokeWidth={2}
                name={paulaLabel}
                dot={{ fill: 'hsl(var(--paula))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}