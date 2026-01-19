// Vault Reminder Configuration
// User-configurable settings for reminder windows and priorities

import { VaultCategory } from './types';

export interface CategoryReminderConfig {
  reminderDays: number; // Days before date to start reminding
  priorityBoostDays: number; // Days before date when priority becomes "high"
  autoReviewMonths?: number; // For periodic reviews (e.g., jewelry appraisals every 24 months)
}

export interface ReminderConfig {
  categoryDefaults: Partial<Record<VaultCategory, CategoryReminderConfig>>;
  globalEnabled: boolean;
}

// Default reminder windows by category
export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  globalEnabled: true,
  categoryDefaults: {
    // Identity documents - long lead time
    identity: {
      reminderDays: 180,
      priorityBoostDays: 60,
    },

    // Insurance - moderate lead time for shopping/renewal
    insurance: {
      reminderDays: 45,
      priorityBoostDays: 14,
    },

    // Vehicles - registration, inspections
    vehicles: {
      reminderDays: 30,
      priorityBoostDays: 7,
    },

    // Jewelry - periodic appraisal reminders
    jewelry: {
      reminderDays: 30,
      priorityBoostDays: 7,
      autoReviewMonths: 24,
    },

    // Property - annual insurance review
    property: {
      reminderDays: 45,
      priorityBoostDays: 14,
      autoReviewMonths: 12,
    },

    // Credit cards - expiration
    credit_card: {
      reminderDays: 30,
      priorityBoostDays: 14,
    },

    // Subscriptions - short notice
    subscription: {
      reminderDays: 14,
      priorityBoostDays: 3,
    },

    // Memberships
    membership: {
      reminderDays: 30,
      priorityBoostDays: 7,
    },

    // Warranties - last chance to use
    warranty: {
      reminderDays: 30,
      priorityBoostDays: 7,
    },

    // Loans - payment tracking
    loan: {
      reminderDays: 7,
      priorityBoostDays: 2,
    },

    // Contracts - renewal decisions
    contract: {
      reminderDays: 30,
      priorityBoostDays: 14,
    },

    // Tax documents - filing deadlines
    tax: {
      reminderDays: 30,
      priorityBoostDays: 7,
    },

    // Medical - appointment reminders, prescription refills
    medical: {
      reminderDays: 14,
      priorityBoostDays: 3,
    },

    // Electronics - warranty tracking
    electronics: {
      reminderDays: 30,
      priorityBoostDays: 7,
    },

    // Collectibles - insurance review
    collectibles: {
      reminderDays: 30,
      priorityBoostDays: 7,
      autoReviewMonths: 24,
    },
  },
};

// Fallback for categories not in config
export const DEFAULT_CATEGORY_CONFIG: CategoryReminderConfig = {
  reminderDays: 30,
  priorityBoostDays: 7,
};

// Get config for a specific category
export function getCategoryConfig(
  category: VaultCategory,
  userConfig?: ReminderConfig
): CategoryReminderConfig {
  const config = userConfig ?? DEFAULT_REMINDER_CONFIG;
  return config.categoryDefaults[category] ?? DEFAULT_CATEGORY_CONFIG;
}

// Merge user config with defaults
export function mergeConfig(userConfig: Partial<ReminderConfig>): ReminderConfig {
  return {
    globalEnabled: userConfig.globalEnabled ?? DEFAULT_REMINDER_CONFIG.globalEnabled,
    categoryDefaults: {
      ...DEFAULT_REMINDER_CONFIG.categoryDefaults,
      ...userConfig.categoryDefaults,
    },
  };
}

// Storage key for user config
const CONFIG_STORAGE_KEY = 'daily_pulse_vault_reminder_config';

// Load user config from localStorage
export function loadReminderConfig(): ReminderConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return mergeConfig(parsed);
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_REMINDER_CONFIG;
}

// Save user config to localStorage
export function saveReminderConfig(config: ReminderConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

// Reset to defaults
export function resetReminderConfig(): void {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}
