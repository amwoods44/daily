// Dashboard Configuration Manager
// Central preferences system for Daily Pulse dashboard customization

export interface PersonalInfo {
  name: string;
  location: string;
  homeAddress?: string;
  workAddress?: string;
  workHours: {
    start: string; // HH:MM format
    end: string;
  };
  timezone: string;
  goals: {
    dailyTasks: number;
    weeklySprint: number;
    sleepTarget: number;
  };
  preferences: {
    useFahrenheit: boolean;
    use12HourTime: boolean;
    showCommuteAlerts: boolean;
    enableAI: boolean;
  };
}

export interface LayoutConfig {
  lifePulse: boolean;
  timeline: boolean;
  outlook: boolean;
  focusNow: boolean;
  nudges: boolean;
  schedule: boolean;
  tasksToday: boolean;
  tasksWeek: boolean;
  lifeOverview: boolean;
  gridSize: 'compact' | 'comfortable' | 'spacious';
}

export interface DataSourceConfig {
  calendar: 'mock' | 'real';
  email: 'mock' | 'real';
  weather: 'mock' | 'real';
  ai: 'mock' | 'real';
  health: 'mock' | 'real' | 'disabled';
  finance: 'mock' | 'real' | 'disabled';
  calendarOptions?: {
    showCommute: boolean;
    showPrep: boolean;
    calendarsToSync: string[];
  };
  emailOptions?: {
    onlyImportant: boolean;
    maxCount: number;
  };
}

export interface DashboardConfig {
  personalInfo: PersonalInfo;
  layout: LayoutConfig;
  dataSources: DataSourceConfig;
  locked: boolean;
  lastModified: string;
}

const CONFIG_KEY = 'daily_pulse_dashboard_config';
const LOCK_KEY = 'daily_pulse_config_lock';
const PASSPHRASE_KEY = 'daily_pulse_config_passphrase';

// Default configuration
const DEFAULT_CONFIG: DashboardConfig = {
  personalInfo: {
    name: 'Aaron',
    location: 'Austin, TX',
    homeAddress: '',
    workAddress: '',
    workHours: {
      start: '08:00',
      end: '18:00',
    },
    timezone: 'America/Chicago',
    goals: {
      dailyTasks: 12,
      weeklySprint: 3,
      sleepTarget: 7.5,
    },
    preferences: {
      useFahrenheit: true,
      use12HourTime: true,
      showCommuteAlerts: true,
      enableAI: true,
    },
  },
  layout: {
    lifePulse: true,
    timeline: true,
    outlook: true,
    focusNow: true,
    nudges: true,
    schedule: true,
    tasksToday: true,
    tasksWeek: true,
    lifeOverview: true,
    gridSize: 'comfortable',
  },
  dataSources: {
    calendar: 'mock',
    email: 'mock',
    weather: 'real',
    ai: 'mock',
    health: 'disabled',
    finance: 'disabled',
    calendarOptions: {
      showCommute: true,
      showPrep: true,
      calendarsToSync: ['primary'],
    },
    emailOptions: {
      onlyImportant: true,
      maxCount: 5,
    },
  },
  locked: false,
  lastModified: new Date().toISOString(),
};

// Singleton manager with observer pattern
class ConfigManager {
  private subscribers: Array<(config: DashboardConfig) => void> = [];

  load(): DashboardConfig {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;

    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return DEFAULT_CONFIG;

    try {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        personalInfo: { ...DEFAULT_CONFIG.personalInfo, ...parsed.personalInfo },
        layout: { ...DEFAULT_CONFIG.layout, ...parsed.layout },
        dataSources: { ...DEFAULT_CONFIG.dataSources, ...parsed.dataSources },
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  save(config: DashboardConfig): void {
    if (typeof window === 'undefined') return;

    const toSave = {
      ...config,
      lastModified: new Date().toISOString(),
    };

    localStorage.setItem(CONFIG_KEY, JSON.stringify(toSave));
    this.notifySubscribers(toSave);
  }

  isLocked(): boolean {
    if (typeof window === 'undefined') return false;
    const lock = localStorage.getItem(LOCK_KEY);
    return lock === 'true';
  }

  lock(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCK_KEY, 'true');
  }

  unlock(passphrase: string): boolean {
    if (typeof window === 'undefined') return false;

    // Get stored passphrase (default is 'daily')
    const stored = localStorage.getItem(PASSPHRASE_KEY) || 'daily';

    if (passphrase === stored) {
      localStorage.setItem(LOCK_KEY, 'false');
      return true;
    }

    return false;
  }

  setPassphrase(newPassphrase: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PASSPHRASE_KEY, newPassphrase);
  }

  exportConfig(): string {
    const config = this.load();
    return JSON.stringify(config, null, 2);
  }

  importConfig(json: string): boolean {
    try {
      const config = JSON.parse(json) as DashboardConfig;

      // Validate required fields
      if (
        !config.personalInfo ||
        !config.layout ||
        !config.dataSources
      ) {
        return false;
      }

      this.save(config);
      return true;
    } catch {
      return false;
    }
  }

  reset(): void {
    this.save(DEFAULT_CONFIG);
  }

  // Observer pattern
  subscribe(listener: (config: DashboardConfig) => void): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((l) => l !== listener);
    };
  }

  private notifySubscribers(config: DashboardConfig): void {
    this.subscribers.forEach((listener) => listener(config));
  }
}

// Export singleton instance
export const DashboardConfigManager = new ConfigManager();

// Preset configurations
export const PRESETS: Record<string, Partial<DashboardConfig>> = {
  minimal: {
    layout: {
      lifePulse: true,
      timeline: true,
      outlook: false,
      focusNow: true,
      nudges: false,
      schedule: false,
      tasksToday: true,
      tasksWeek: false,
      lifeOverview: false,
      gridSize: 'comfortable',
    },
    dataSources: {
      calendar: 'mock',
      email: 'mock',
      weather: 'real',
      ai: 'mock',
      health: 'disabled',
      finance: 'disabled',
    },
  },
  full: {
    layout: {
      lifePulse: true,
      timeline: true,
      outlook: true,
      focusNow: true,
      nudges: true,
      schedule: true,
      tasksToday: true,
      tasksWeek: true,
      lifeOverview: true,
      gridSize: 'comfortable',
    },
    dataSources: {
      calendar: 'mock',
      email: 'mock',
      weather: 'real',
      ai: 'mock',
      health: 'disabled',
      finance: 'disabled',
    },
  },
  demo: {
    layout: {
      lifePulse: true,
      timeline: true,
      outlook: true,
      focusNow: true,
      nudges: true,
      schedule: true,
      tasksToday: true,
      tasksWeek: true,
      lifeOverview: true,
      gridSize: 'comfortable',
    },
    dataSources: {
      calendar: 'mock',
      email: 'mock',
      weather: 'mock',
      ai: 'mock',
      health: 'mock',
      finance: 'mock',
    },
  },
};
