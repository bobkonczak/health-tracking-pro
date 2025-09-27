import { Suspense } from 'react';
import { Metadata } from 'next';
import ClientDashboard from './ClientDashboard';

export const metadata: Metadata = {
  title: 'Health Tracking Pro - Dashboard',
  description: 'Track your health journey with Bob & Paula',
};

// Server component that renders the client dashboard
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <ClientDashboard />
    </Suspense>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="text-center md:text-left">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mx-auto md:mx-0 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto md:mx-0 animate-pulse"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* Competition Bar Skeleton */}
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
      </div>

      {/* User Selection Skeleton */}
      <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
      </div>

      {/* Checklist Skeleton */}
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>

      {/* Body Metrics Skeleton */}
      <div className="card p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}