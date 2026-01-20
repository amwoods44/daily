'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const MODE_KEY = 'daily-pulse-theme-mode';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('light'); // Default to light mode

  // Resolve the actual theme based on mode
  const resolvedMode: 'light' | 'dark' = mode === 'system' ? getSystemTheme() : mode;

  // Load saved preferences
  useEffect(() => {
    const savedMode = localStorage.getItem(MODE_KEY) as ThemeMode | null;
    if (savedMode) {
      setModeState(savedMode);
    }
    setMounted(true);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply dark class
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set color-scheme for native elements
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      const systemMode = getSystemTheme();

      if (systemMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      root.style.colorScheme = systemMode;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_KEY, newMode);
  }, []);

  // Prevent flash of unstyled content
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        resolvedMode,
        setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Default theme for SSR/fallback
const defaultTheme: ThemeContextType = {
  mode: 'system',
  resolvedMode: 'light',
  setMode: () => {},
};

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default during SSR or when outside provider
  if (!context) {
    return defaultTheme;
  }
  return context;
}
