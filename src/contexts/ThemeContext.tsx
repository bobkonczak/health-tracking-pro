'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/src/types';

interface ThemeContextType {
  selectedUser: User;
  setSelectedUser: (user: User) => void;
  theme: UserTheme;
}

interface UserTheme {
  primary: string;
  primaryRgb: string;
  secondary: string;
  accent: string;
  gradient: string;
  ring: string;
  text: string;
  background: string;
  cardBorder: string;
}

const bobTheme: UserTheme = {
  primary: '#8D8741', // Khaki green
  primaryRgb: '141, 135, 65',
  secondary: '#6B7280', // Gray
  accent: '#F3F4F6', // Light gray
  gradient: 'from-[#8D8741] to-[#6B7280]',
  ring: 'ring-[#8D8741]/50',
  text: 'text-[#8D8741]',
  background: 'bg-[#8D8741]',
  cardBorder: 'border-[#8D8741]/20',
};

const paulaTheme: UserTheme = {
  primary: '#ec4899', // Pink
  primaryRgb: '236, 72, 153',
  secondary: '#ffffff', // White
  accent: '#fdf2f8', // Light pink
  gradient: 'from-[#ec4899] to-[#ffffff]',
  ring: 'ring-[#ec4899]/50',
  text: 'text-[#ec4899]',
  background: 'bg-[#ec4899]',
  cardBorder: 'border-[#ec4899]/20',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedUser, setSelectedUser] = useState<User>('Bob');

  // Apply CSS custom properties for dynamic theming
  useEffect(() => {
    const theme = selectedUser === 'Bob' ? bobTheme : paulaTheme;
    const root = document.documentElement;

    root.style.setProperty('--user-primary', theme.primary);
    root.style.setProperty('--user-primary-rgb', theme.primaryRgb);
    root.style.setProperty('--user-secondary', theme.secondary);
    root.style.setProperty('--user-accent', theme.accent);

    // Update CSS classes for dynamic theming
    document.body.className = document.body.className
      .replace(/user-theme-\w+/g, '')
      .concat(` user-theme-${selectedUser.toLowerCase()}`);
  }, [selectedUser]);

  const theme = selectedUser === 'Bob' ? bobTheme : paulaTheme;

  return (
    <ThemeContext.Provider value={{ selectedUser, setSelectedUser, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to get theme colors for a specific user
export function getUserTheme(user: User): UserTheme {
  return user === 'Bob' ? bobTheme : paulaTheme;
}

// Helper function to get theme class names
export function getThemeClasses(user: User) {
  const theme = getUserTheme(user);

  return {
    primary: `bg-[${theme.primary}]`,
    primaryText: `text-[${theme.primary}]`,
    primaryBorder: `border-[${theme.primary}]`,
    primaryRing: `ring-[${theme.primary}]/50`,
    gradient: `bg-gradient-to-r ${theme.gradient}`,
    card: `${theme.cardBorder} border-2`,
    button: `bg-[${theme.primary}] hover:bg-[${theme.primary}]/90 text-white`,
    badge: `bg-[${theme.primary}]/10 text-[${theme.primary}] border-[${theme.primary}]/20`,
  };
}