'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { themes, themeOrder, getSystemTheme, getDefaultThemeForMode, type Theme } from '@/lib/themes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  mode: ThemeMode;
  setThemeId: (id: string) => void;
  setMode: (mode: ThemeMode) => void;
  availableThemes: typeof themes;
  themeOrder: typeof themeOrder;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'daily-pulse-theme';
const MODE_KEY = 'daily-pulse-theme-mode';

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;

  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });

  // Apply font variables
  root.style.setProperty('--font-heading', theme.fonts.heading);
  root.style.setProperty('--font-body', theme.fonts.body);
  root.style.setProperty('--font-mono', theme.fonts.mono);

  // Set dark mode class for Tailwind
  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set color-scheme for native elements
  root.style.colorScheme = theme.isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [themeId, setThemeIdState] = useState<string>('ink-paper');

  // Resolve the actual theme based on mode
  const resolvedThemeId = mode === 'system'
    ? getDefaultThemeForMode(getSystemTheme())
    : themeId;

  const theme = themes[resolvedThemeId] || themes['ink-paper'];

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const savedMode = localStorage.getItem(MODE_KEY) as ThemeMode | null;

    if (savedMode) {
      setModeState(savedMode);
    }
    if (savedTheme && themes[savedTheme]) {
      setThemeIdState(savedTheme);
    }

    setMounted(true);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!mounted) return;
    applyThemeToDocument(theme);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newThemeId = getDefaultThemeForMode(getSystemTheme());
      applyThemeToDocument(themes[newThemeId]);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setThemeId = useCallback((id: string) => {
    if (!themes[id]) return;
    setThemeIdState(id);
    localStorage.setItem(STORAGE_KEY, id);

    // If setting a specific theme, also set mode to match
    const newTheme = themes[id];
    const newMode = newTheme.isDark ? 'dark' : 'light';
    setModeState(newMode);
    localStorage.setItem(MODE_KEY, newMode);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_KEY, newMode);

    if (newMode === 'system') {
      const systemMode = getSystemTheme();
      const defaultTheme = getDefaultThemeForMode(systemMode);
      setThemeIdState(defaultTheme);
      localStorage.setItem(STORAGE_KEY, defaultTheme);
    }
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
        theme,
        themeId: resolvedThemeId,
        mode,
        setThemeId,
        setMode,
        availableThemes: themes,
        themeOrder,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Default theme for SSR/fallback - use actual theme from themes object
const defaultTheme: ThemeContextType = {
  theme: themes['ink-paper'],
  themeId: 'ink-paper',
  mode: 'system',
  setThemeId: () => {},
  setMode: () => {},
  availableThemes: themes,
  themeOrder,
};

export function useTheme() {
  const context = useContext(ThemeContext);
  // Return default during SSR or when outside provider
  if (!context) {
    return defaultTheme;
  }
  return context;
}
