'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Bell } from 'lucide-react';
import { format } from 'date-fns';

export function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

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
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-bob flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
              <div className="w-8 h-8 rounded-full bg-paula flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}