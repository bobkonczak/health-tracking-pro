'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, BarChart3, Calendar, User, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/checklist', icon: Calendar, label: 'Checklist' },
  { href: '/competition', icon: Trophy, label: 'Competition' },
  { href: '/stats', icon: BarChart3, label: 'Stats' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:static md:border-t-0 md:border-r">
      <div className="flex justify-around items-center h-16 md:flex-col md:h-auto md:w-64 md:py-8 md:justify-start md:space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col md:flex-row items-center justify-center md:justify-start md:w-full px-3 py-2 md:px-6 md:py-3 rounded-lg transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                isActive && 'bg-primary/10 text-primary dark:bg-primary/20'
              )}
            >
              <Icon className="w-5 h-5 md:mr-3" />
              <span className="text-xs md:text-sm mt-1 md:mt-0">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}