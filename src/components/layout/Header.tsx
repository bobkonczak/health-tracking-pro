'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/src/types';

interface HeaderProps {
  selectedUser?: User;
  onUserChange?: (user: User) => void;
}

export function Header({ selectedUser = 'Bob', onUserChange }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (savedTheme === 'light') {
      setDarkMode(false);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold gradient-bob-paula text-gradient">
            Health Tracking Pro
          </h1>
          <span className="hidden md:inline-block text-sm text-muted-foreground">
            {format(currentTime, 'EEEE, d MMMM yyyy')}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <button
                onClick={() => onUserChange?.('Bob')}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                  selectedUser === 'Bob'
                    ? 'bg-bob ring-2 ring-bob/50 ring-offset-2'
                    : 'bg-bob/60 hover:bg-bob'
                }`}
                aria-label="Switch to Bob"
              >
                B
              </button>
              <button
                onClick={() => onUserChange?.('Paula')}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                  selectedUser === 'Paula'
                    ? 'bg-paula ring-2 ring-paula/50 ring-offset-2'
                    : 'bg-paula/60 hover:bg-paula'
                }`}
                aria-label="Switch to Paula"
              >
                P
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}