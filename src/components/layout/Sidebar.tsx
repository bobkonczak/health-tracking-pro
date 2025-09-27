'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Trophy, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Health metrics overview'
  },
  {
    name: 'Checklist',
    href: '/checklist',
    icon: CheckSquare,
    description: 'Daily tasks'
  },
  {
    name: 'Competition',
    href: '/competition',
    icon: Trophy,
    description: 'Weekly leaderboard'
  },
  {
    name: 'Stats',
    href: '/stats',
    icon: BarChart3,
    description: 'Historical analysis'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configuration'
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex-1">
        <nav className="px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
                           (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                  )}
                />
                <div className="flex-1">
                  <div>{item.name}</div>
                  <div className={cn(
                    'text-xs',
                    isActive
                      ? 'text-white/80'
                      : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}