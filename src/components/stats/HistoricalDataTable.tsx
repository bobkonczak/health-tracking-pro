'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Database, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { HealthHistoryRecord } from '@/src/hooks/useHealthHistory';
import { cn } from '@/src/lib/utils';

interface HistoricalDataTableProps {
  data: HealthHistoryRecord[];
  title?: string;
}

type SortField = 'date' | 'weight' | 'body_fat' | 'muscle_mass' | 'steps' | 'heart_rate';
type SortDirection = 'asc' | 'desc';

export function HistoricalDataTable({ data, title = "Historical Data Records" }: HistoricalDataTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showOnlyDataDays, setShowOnlyDataDays] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Filter data to show only days with actual measurements if toggle is on
  const filteredData = showOnlyDataDays
    ? data.filter(record => record.hasData)
    : data;

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let valueA: number | string = a[sortField] ?? '';
    let valueB: number | string = b[sortField] ?? '';

    // Handle date sorting
    if (sortField === 'date') {
      valueA = new Date(a.date).getTime();
      valueB = new Date(b.date).getTime();
    }

    // Handle null values - put them at the end
    if (valueA === null || valueA === undefined) return 1;
    if (valueB === null || valueB === undefined) return -1;

    if (sortDirection === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + recordsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  const formatValue = (value: number | null, unit: string, decimals: number = 1): string => {
    if (value === null || value === undefined) return '—';
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getTrendIcon = (current: number | null, previous: number | null) => {
    if (!current || !previous) return null;
    return current > previous ?
      <TrendingUp className="w-3 h-3 text-green-500" /> :
      <TrendingDown className="w-3 h-3 text-red-500" />;
  };

  if (data.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Historical Data</h3>
          <p className="text-muted-foreground">No health records found for the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Database className="w-5 h-5 mr-2" />
          {title}
        </h3>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyDataDays}
              onChange={(e) => setShowOnlyDataDays(e.target.checked)}
              className="rounded"
            />
            <span>Show only days with data</span>
          </label>

          <div className="text-sm text-muted-foreground">
            {sortedData.length} records
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3">
                <SortButton field="date">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date
                </SortButton>
              </th>
              <th className="text-right py-2 px-3">
                <SortButton field="weight">Weight (kg)</SortButton>
              </th>
              <th className="text-right py-2 px-3">
                <SortButton field="body_fat">Body Fat (%)</SortButton>
              </th>
              <th className="text-right py-2 px-3">
                <SortButton field="muscle_mass">Muscle (kg)</SortButton>
              </th>
              <th className="text-right py-2 px-3">
                <SortButton field="steps">Steps</SortButton>
              </th>
              <th className="text-right py-2 px-3">
                <SortButton field="heart_rate">HR (bpm)</SortButton>
              </th>
              <th className="text-center py-2 px-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record, index) => {
              const prevRecord = index > 0 ? paginatedData[index - 1] : null;
              const isWeekend = new Date(record.date).getDay() === 0 || new Date(record.date).getDay() === 6;

              return (
                <tr
                  key={record.date}
                  className={cn(
                    "border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    !record.hasData && "opacity-50",
                    isWeekend && "bg-blue-50/30 dark:bg-blue-900/10"
                  )}
                >
                  <td className="py-3 px-3">
                    <div>
                      <div className="font-medium">
                        {new Date(record.date).toLocaleDateString('pl-PL', {
                          month: 'short',
                          day: 'numeric',
                          year: '2-digit'
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  </td>

                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end space-x-1">
                      <span className={cn(
                        "font-medium",
                        record.weight === null && "text-muted-foreground"
                      )}>
                        {formatValue(record.weight, '', 2)}
                      </span>
                      {getTrendIcon(record.weight, prevRecord?.weight)}
                    </div>
                  </td>

                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end space-x-1">
                      <span className={cn(
                        "font-medium",
                        record.body_fat === null && "text-muted-foreground"
                      )}>
                        {formatValue(record.body_fat, '%')}
                      </span>
                      {getTrendIcon(record.body_fat, prevRecord?.body_fat)}
                    </div>
                  </td>

                  <td className="text-right py-3 px-3">
                    <span className={cn(
                      "font-medium",
                      record.muscle_mass === null && "text-muted-foreground"
                    )}>
                      {formatValue(record.muscle_mass, '', 2)}
                    </span>
                  </td>

                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end space-x-1">
                      <span className={cn(
                        "font-medium",
                        record.steps === null && "text-muted-foreground",
                        record.steps && record.steps >= 10000 && "text-green-600"
                      )}>
                        {record.steps ? record.steps.toLocaleString() : '—'}
                      </span>
                      {record.steps && record.steps >= 10000 && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </div>
                  </td>

                  <td className="text-right py-3 px-3">
                    <span className={cn(
                      "font-medium",
                      record.heart_rate === null && "text-muted-foreground"
                    )}>
                      {formatValue(record.heart_rate, '', 0)}
                    </span>
                  </td>

                  <td className="text-center py-3 px-3">
                    {record.hasData ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {record.data_source || 'Withings'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        No data
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + recordsPerPage, sortedData.length)} of {sortedData.length} records
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Previous
            </button>

            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">
              {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Legend:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>Increased from previous</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span>Decreased from previous</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✓</span>
            <span>Steps goal achieved (10k+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Weekend</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">—</span>
            <span>No data available</span>
          </div>
        </div>
      </div>
    </div>
  );
}