// Theme System for Daily Pulse
// Elite themes with distinct personalities
//
// To add a new theme:
// 1. Add a new entry to the `themes` object below
// 2. Add the theme id to the `themeOrder` array at the bottom
// 3. Import any new Google Fonts in globals.css

export interface Theme {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: {
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgCard: string;
    bgCardHover: string;
    bgAccent: string;
    bgAccentSubtle: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textMuted: string;
    textOnAccent: string;

    // Accent
    accent: string;
    accentHover: string;
    accentSubtle: string;

    // Borders
    border: string;
    borderSubtle: string;
    borderAccent: string;

    // Semantic
    success: string;
    successSubtle: string;
    warning: string;
    warningSubtle: string;
    error: string;
    errorSubtle: string;

    // Shadows (as CSS values)
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
}

export const themes: Record<string, Theme> = {
  'ink-paper': {
    id: 'ink-paper',
    name: 'Ink & Paper',
    description: 'Warm editorial, like a premium letterpress publication',
    isDark: false,
    colors: {
      bgPrimary: '#FAF9F6',      // Warm cream
      bgSecondary: '#F5F4F0',    // Slightly darker cream
      bgTertiary: '#ECEAE4',     // Warm light gray
      bgCard: '#FFFFFF',
      bgCardHover: '#FDFCFA',
      bgAccent: '#C2410C',       // Burnt sienna
      bgAccentSubtle: '#FFF7ED',

      textPrimary: '#1C1917',    // Rich charcoal
      textSecondary: '#44403C',  // Warm dark gray
      textTertiary: '#78716C',   // Warm medium gray
      textMuted: '#A8A29E',      // Warm light gray
      textOnAccent: '#FFFFFF',

      accent: '#C2410C',         // Burnt sienna
      accentHover: '#9A3412',    // Darker sienna
      accentSubtle: '#FDBA74',   // Soft orange

      border: '#E7E5E0',
      borderSubtle: '#F0EEE9',
      borderAccent: '#C2410C',

      success: '#15803D',
      successSubtle: '#DCFCE7',
      warning: '#B45309',
      warningSubtle: '#FEF3C7',
      error: '#B91C1C',
      errorSubtle: '#FEE2E2',

      shadowSm: '0 1px 2px rgba(28, 25, 23, 0.04)',
      shadowMd: '0 4px 12px rgba(28, 25, 23, 0.06)',
      shadowLg: '0 12px 32px rgba(28, 25, 23, 0.1)',
    },
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Source Serif 4", Georgia, serif',
      mono: '"JetBrains Mono", monospace',
    },
  },

  'morning-fog': {
    id: 'morning-fog',
    name: 'Morning Fog',
    description: 'Nordic calm, soft sophistication',
    isDark: false,
    colors: {
      bgPrimary: '#FAFAFA',      // Cool soft white
      bgSecondary: '#F4F4F5',    // Cool light gray
      bgTertiary: '#E4E4E7',     // Cool medium gray
      bgCard: '#FFFFFF',
      bgCardHover: '#FAFAFA',
      bgAccent: '#B45309',       // Muted gold
      bgAccentSubtle: '#FFFBEB',

      textPrimary: '#18181B',    // Cool charcoal
      textSecondary: '#3F3F46',  // Cool dark gray
      textTertiary: '#71717A',   // Cool medium gray
      textMuted: '#A1A1AA',      // Cool light gray
      textOnAccent: '#FFFFFF',

      accent: '#B45309',         // Muted gold
      accentHover: '#92400E',    // Darker gold
      accentSubtle: '#FCD34D',   // Soft yellow

      border: '#E4E4E7',
      borderSubtle: '#F4F4F5',
      borderAccent: '#B45309',

      success: '#059669',
      successSubtle: '#D1FAE5',
      warning: '#D97706',
      warningSubtle: '#FEF3C7',
      error: '#DC2626',
      errorSubtle: '#FEE2E2',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.03)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.05)',
      shadowLg: '0 12px 32px rgba(0, 0, 0, 0.08)',
    },
    fonts: {
      heading: '"DM Sans", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
      mono: '"SF Mono", monospace',
    },
  },

  'midnight': {
    id: 'midnight',
    name: 'Midnight Editorial',
    description: 'Dark and dramatic, evening reading',
    isDark: true,
    colors: {
      bgPrimary: '#0A0A0A',      // True dark background
      bgSecondary: '#141414',    // Slightly lifted surface
      bgTertiary: '#1E1E1E',     // Elevated surface
      bgCard: '#141414',
      bgCardHover: '#1E1E1E',
      bgAccent: '#FF6B35',       // Vibrant orange (reserved for CTAs)
      bgAccentSubtle: '#1A0F0A',

      textPrimary: '#FFFFFF',    // Pure white for max contrast
      textSecondary: '#E5E5E5',  // High contrast secondary
      textTertiary: '#A3A3A3',   // Medium gray
      textMuted: '#6B7280',      // Muted gray (timestamps, meta)
      textOnAccent: '#FFFFFF',

      accent: '#FF6B35',         // Vibrant orange
      accentHover: '#FF8E53',    // Lighter on hover
      accentSubtle: '#EA580C',   // Deeper for subtle uses

      border: '#262626',
      borderSubtle: '#1A1A1A',
      borderAccent: '#FF6B35',

      success: '#10B981',        // Subtle green for checkmarks
      successSubtle: '#0D3628',
      warning: '#F59E0B',
      warningSubtle: '#2D1B00',
      error: '#EF4444',
      errorSubtle: '#2D0A0A',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14)',
      shadowMd: '0 2px 4px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)',
      shadowLg: '0 4px 8px rgba(0, 0, 0, 0.25), 0 6px 12px rgba(0, 0, 0, 0.2)',
    },
    fonts: {
      heading: '"Sora", system-ui, sans-serif',
      body: '"Sora", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
  },

  'sage-garden': {
    id: 'sage-garden',
    name: 'Sage Garden',
    description: 'Organic warmth, grounded and calming',
    isDark: false,
    colors: {
      bgPrimary: '#FEFDFB',      // Warm white
      bgSecondary: '#F8F7F4',    // Warm off-white
      bgTertiary: '#EFEDE8',     // Warm light beige
      bgCard: '#FFFFFF',
      bgCardHover: '#FDFCFA',
      bgAccent: '#2D5A3D',       // Deep forest green
      bgAccentSubtle: '#ECFDF5',

      textPrimary: '#1E3A30',    // Deep forest
      textSecondary: '#3D5A4C',  // Medium forest
      textTertiary: '#5F7A6A',   // Sage gray
      textMuted: '#8FA899',      // Light sage
      textOnAccent: '#FFFFFF',

      accent: '#2D5A3D',         // Deep forest green
      accentHover: '#1E3A2A',    // Darker forest
      accentSubtle: '#6B8E6B',   // Sage

      border: '#E5E3DB',
      borderSubtle: '#F0EEE6',
      borderAccent: '#2D5A3D',

      success: '#16A34A',
      successSubtle: '#DCFCE7',
      warning: '#CA8A04',
      warningSubtle: '#FEF9C3',
      error: '#DC2626',
      errorSubtle: '#FEE2E2',

      shadowSm: '0 1px 2px rgba(30, 58, 48, 0.04)',
      shadowMd: '0 4px 12px rgba(30, 58, 48, 0.06)',
      shadowLg: '0 12px 32px rgba(30, 58, 48, 0.1)',
    },
    fonts: {
      heading: '"Fraunces", Georgia, serif',
      body: '"Nunito Sans", system-ui, sans-serif',
      mono: '"IBM Plex Mono", monospace',
    },
  },

  'deep-ocean': {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    description: 'Modern depth, focused and tech-forward',
    isDark: true,
    colors: {
      bgPrimary: '#0A1628',      // Deep navy
      bgSecondary: '#0F2140',    // Slightly lighter navy
      bgTertiary: '#1A3358',     // Medium navy
      bgCard: '#0F2140',
      bgCardHover: '#1A3358',
      bgAccent: '#0EA5E9',       // Vibrant teal
      bgAccentSubtle: '#082F49',

      textPrimary: '#F0F9FF',    // Cool white
      textSecondary: '#BAE6FD',  // Light blue
      textTertiary: '#7DD3FC',   // Medium blue
      textMuted: '#38BDF8',      // Darker blue
      textOnAccent: '#FFFFFF',

      accent: '#0EA5E9',         // Vibrant teal
      accentHover: '#38BDF8',    // Lighter teal
      accentSubtle: '#0284C7',   // Deeper teal

      border: '#1E3A5F',
      borderSubtle: '#0F2140',
      borderAccent: '#0EA5E9',

      success: '#10B981',
      successSubtle: '#064E3B',
      warning: '#FBBF24',
      warningSubtle: '#451A03',
      error: '#F87171',
      errorSubtle: '#450A0A',

      shadowSm: '0 1px 2px rgba(0, 0, 0, 0.4)',
      shadowMd: '0 4px 12px rgba(0, 0, 0, 0.5)',
      shadowLg: '0 12px 32px rgba(0, 0, 0, 0.6)',
    },
    fonts: {
      heading: '"Space Grotesk", system-ui, sans-serif',
      body: '"IBM Plex Sans", system-ui, sans-serif',
      mono: '"IBM Plex Mono", monospace',
    },
  },
};

export const themeOrder = ['ink-paper', 'morning-fog', 'midnight', 'sage-garden', 'deep-ocean'];

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getDefaultThemeForMode = (mode: 'light' | 'dark'): string => {
  return mode === 'dark' ? 'midnight' : 'ink-paper';
};
