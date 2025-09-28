'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, CheckSquare, Trophy, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useTheme } from '@/src/contexts/ThemeContext';

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

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, selectedUser, setSelectedUser } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-bold gradient-bob-paula text-gradient">
            Health Tracking Pro
          </h1>

          {/* User Selection */}
          <div className="flex space-x-1">
            <button
              onClick={() => setSelectedUser('Bob')}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                selectedUser === 'Bob'
                  ? 'bg-bob ring-2 ring-bob/50 ring-offset-1'
                  : 'bg-bob/60 hover:bg-bob'
              }`}
              aria-label="Switch to Bob"
            >
              B
            </button>
            <button
              onClick={() => setSelectedUser('Paula')}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                selectedUser === 'Paula'
                  ? 'bg-paula ring-2 ring-paula/50 ring-offset-1'
                  : 'bg-paula/60 hover:bg-paula'
              }`}
              aria-label="Switch to Paula"
            >
              P
            </button>
          </div>
        </div>

        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />

          {/* Slide-out Menu */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-50 overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href ||
                                 (item.href !== '/' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                        isActive
                          ? `${theme.background} text-white`
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

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Health Tracking Pro v1.0
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}