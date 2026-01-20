/**
 * Data Sources Registry
 *
 * Central documentation of all data sources in Daily Pulse.
 * Each source is marked as 'mock' or 'real' with notes on what's needed
 * to make it production-ready.
 *
 * This file serves as:
 * 1. Documentation for developers
 * 2. Runtime config for UI indicators
 * 3. Checklist for production readiness
 */

// ============================================================================
// TYPES
// ============================================================================

export type DataSourceStatus = 'mock' | 'real' | 'partial';

export interface DataSource {
  /** Current implementation status */
  status: DataSourceStatus;
  /** What the real integration would be */
  realProvider: string;
  /** What's needed to make it real */
  requirements: string[];
  /** Estimated effort to implement */
  effort: 'low' | 'medium' | 'high';
  /** File(s) that would need changes */
  files: string[];
}

// ============================================================================
// REGISTRY
// ============================================================================

export const DATA_SOURCES: Record<string, DataSource> = {
  calendar: {
    status: 'mock',
    realProvider: 'Google Calendar API',
    requirements: [
      'Google OAuth credentials',
      'Calendar API enabled in Google Cloud Console',
      'Implement src/lib/integrations/google/calendar.ts',
      'Token refresh handling',
    ],
    effort: 'medium',
    files: [
      'src/app/api/calendar/route.ts',
      'src/lib/integrations/google/calendar.ts',
    ],
  },

  email: {
    status: 'mock',
    realProvider: 'Gmail API',
    requirements: [
      'Google OAuth credentials (same as calendar)',
      'Gmail API enabled in Google Cloud Console',
      'Implement src/lib/integrations/google/gmail.ts',
      'Email parsing and threading logic',
    ],
    effort: 'medium',
    files: [
      'src/app/api/emails/route.ts',
      'src/lib/integrations/google/gmail.ts',
    ],
  },

  finance: {
    status: 'mock',
    realProvider: 'Plaid API',
    requirements: [
      'Plaid API credentials (sandbox for testing)',
      'Plaid Link integration for account connection',
      'Webhook handling for transaction updates',
      'Secure token storage for access tokens',
    ],
    effort: 'high',
    files: [
      'src/lib/integrations/plaid/client.ts',
      'src/lib/integrations/plaid/sync.ts',
      'src/app/api/finance/accounts/route.ts',
      'src/app/api/finance/transactions/route.ts',
    ],
  },

  health: {
    status: 'mock',
    realProvider: 'Manual Entry / Apple HealthKit / Fitbit / Oura',
    requirements: [
      'Phase 1: Manual entry form + local storage',
      'Phase 2: iOS companion app for HealthKit',
      'Phase 2: OAuth for Fitbit/Oura/Whoop APIs',
    ],
    effort: 'high',
    files: [
      'src/lib/health/health-engine.ts',
      'src/app/api/health/route.ts',
    ],
  },

  weather: {
    status: 'partial',
    realProvider: 'Open-Meteo API (free, no key required)',
    requirements: [
      'Geolocation permission from user',
      'Implement actual API call in route handler',
    ],
    effort: 'low',
    files: [
      'src/app/api/weather/route.ts',
    ],
  },

  ai_insights: {
    status: 'mock',
    realProvider: 'OpenAI API (GPT-4)',
    requirements: [
      'OpenAI API key',
      'Prompt engineering for briefing generation',
      'Rate limiting and cost management',
    ],
    effort: 'medium',
    files: [
      'src/lib/ai-briefing.ts',
      'src/app/api/insights/route.ts',
    ],
  },

  relationships: {
    status: 'mock',
    realProvider: 'Local Database + Google Contacts API',
    requirements: [
      'Database setup (Prisma + SQLite/Postgres)',
      'CRUD operations for people',
      'Optional: Google Contacts API for import',
      'Communication tracking from email/calendar',
    ],
    effort: 'medium',
    files: [
      'src/lib/relationships/relationship-engine.ts',
      'src/lib/relationships/communication-tracker.ts',
    ],
  },

  tasks: {
    status: 'mock',
    realProvider: 'Local Database / Todoist / Linear API',
    requirements: [
      'Database setup for task storage',
      'Optional: OAuth for Todoist/Linear/Asana',
      'Sync logic for external task managers',
    ],
    effort: 'medium',
    files: [
      'src/lib/mock-data.ts', // Currently embedded here
    ],
  },

  user_auth: {
    status: 'mock',
    realProvider: 'NextAuth.js / Clerk / Custom',
    requirements: [
      'Auth provider setup',
      'User model in database',
      'Session management',
      'Protected routes',
    ],
    effort: 'medium',
    files: [
      'src/app/api/auth/[...nextauth]/route.ts', // Would need to create
    ],
  },

  persistence: {
    status: 'mock',
    realProvider: 'Prisma + SQLite (local) or Postgres (cloud)',
    requirements: [
      'Prisma schema definition',
      'Database migrations',
      'Repository pattern for data access',
    ],
    effort: 'high',
    files: [
      'prisma/schema.prisma', // Would need to create
    ],
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if a data source is using mock data
 */
export function isMock(source: keyof typeof DATA_SOURCES): boolean {
  return DATA_SOURCES[source]?.status === 'mock';
}

/**
 * Check if mock indicators should be shown
 * Controlled by NEXT_PUBLIC_SHOW_MOCK_INDICATORS env var
 */
export function shouldShowMockIndicators(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SHOW_MOCK_INDICATORS === 'true';
  }
  return process.env.NEXT_PUBLIC_SHOW_MOCK_INDICATORS === 'true';
}

/**
 * Get all mock sources
 */
export function getMockSources(): string[] {
  return Object.entries(DATA_SOURCES)
    .filter(([, source]) => source.status === 'mock')
    .map(([key]) => key);
}

/**
 * Get all real sources
 */
export function getRealSources(): string[] {
  return Object.entries(DATA_SOURCES)
    .filter(([, source]) => source.status === 'real')
    .map(([key]) => key);
}

/**
 * Get production readiness percentage
 */
export function getProductionReadiness(): number {
  const sources = Object.values(DATA_SOURCES);
  const realCount = sources.filter(s => s.status === 'real').length;
  const partialCount = sources.filter(s => s.status === 'partial').length;
  return Math.round(((realCount + partialCount * 0.5) / sources.length) * 100);
}

/**
 * Get summary for display
 */
export function getDataSourcesSummary(): {
  total: number;
  mock: number;
  real: number;
  partial: number;
  readiness: number;
} {
  const sources = Object.values(DATA_SOURCES);
  return {
    total: sources.length,
    mock: sources.filter(s => s.status === 'mock').length,
    real: sources.filter(s => s.status === 'real').length,
    partial: sources.filter(s => s.status === 'partial').length,
    readiness: getProductionReadiness(),
  };
}
