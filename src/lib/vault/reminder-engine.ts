// Vault Reminder Engine
// Auto-generates reminders from vault items based on dates and category rules

import { VaultItem, VaultReminder, VaultReminderType, CATEGORY_META } from './types';
import {
  ReminderConfig,
  getCategoryConfig,
  loadReminderConfig,
} from './reminder-config';
import { getItems, getReminders, setReminders } from './store';

// Calculate days between two dates
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get today's date as YYYY-MM-DD
function today(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate a reminder ID
function generateReminderId(itemId: string, type: VaultReminderType, dateKey: string): string {
  return `${itemId}-${type}-${dateKey}`;
}

// Determine priority based on days until and config
function calculatePriority(
  daysUntil: number,
  priorityBoostDays: number
): 'high' | 'medium' | 'low' {
  if (daysUntil <= 0) return 'high'; // Overdue
  if (daysUntil <= priorityBoostDays) return 'high';
  if (daysUntil <= priorityBoostDays * 2) return 'medium';
  return 'low';
}

// Generate reminder message based on type and days
function generateMessage(
  item: VaultItem,
  type: VaultReminderType,
  daysUntil: number
): string {
  const emoji = CATEGORY_META[item.category]?.emoji ?? '📌';
  const name = item.name;

  if (daysUntil < 0) {
    const daysOverdue = Math.abs(daysUntil);
    switch (type) {
      case 'expiration':
        return `${emoji} ${name} expired ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
      case 'renewal':
        return `${emoji} ${name} renewal was due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
      case 'maintenance':
        return `${emoji} ${name} maintenance was due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
      case 'review':
        return `${emoji} ${name} review was due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
      default:
        return `${emoji} ${name} action was due ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} ago`;
    }
  }

  if (daysUntil === 0) {
    switch (type) {
      case 'expiration':
        return `${emoji} ${name} expires today`;
      case 'renewal':
        return `${emoji} ${name} renews today`;
      case 'maintenance':
        return `${emoji} ${name} maintenance due today`;
      case 'review':
        return `${emoji} Time to review ${name}`;
      default:
        return `${emoji} ${name} action due today`;
    }
  }

  switch (type) {
    case 'expiration':
      return `${emoji} ${name} expires in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    case 'renewal':
      return `${emoji} ${name} renews in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    case 'maintenance':
      return `${emoji} ${name} maintenance due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    case 'review':
      return `${emoji} ${name} review due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    default:
      return `${emoji} ${name} action in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  }
}

// Generate title for reminder
function generateTitle(item: VaultItem, type: VaultReminderType): string {
  const categoryLabel = CATEGORY_META[item.category]?.label ?? item.category;
  switch (type) {
    case 'expiration':
      return `${categoryLabel} Expiring`;
    case 'renewal':
      return `${categoryLabel} Renewal`;
    case 'maintenance':
      return `${categoryLabel} Maintenance`;
    case 'review':
      return `${categoryLabel} Review`;
    default:
      return `${categoryLabel} Action`;
  }
}

// Check if a reminder should be generated for a date
function shouldGenerateReminder(
  dateStr: string | undefined,
  reminderDays: number,
  itemReminderDays?: number
): { generate: boolean; daysUntil: number } {
  if (!dateStr) return { generate: false, daysUntil: 0 };

  const daysUntil = daysBetween(today(), dateStr);
  const threshold = itemReminderDays ?? reminderDays;

  // Generate if within reminder window or overdue (up to 30 days overdue)
  const generate = daysUntil <= threshold && daysUntil >= -30;

  return { generate, daysUntil };
}

// Check for auto-review reminders (e.g., jewelry appraisal every 2 years)
function shouldGenerateReviewReminder(
  item: VaultItem,
  autoReviewMonths: number | undefined
): { generate: boolean; daysUntil: number } {
  if (!autoReviewMonths) return { generate: false, daysUntil: 0 };

  // Use purchase date or created date as base
  const baseDate = item.purchaseDate ?? item.createdAt;
  if (!baseDate) return { generate: false, daysUntil: 0 };

  const base = new Date(baseDate);
  const now = new Date();

  // Calculate next review date
  const monthsSinceBase =
    (now.getFullYear() - base.getFullYear()) * 12 + (now.getMonth() - base.getMonth());
  const reviewCycles = Math.floor(monthsSinceBase / autoReviewMonths);
  const nextReviewCycle = reviewCycles + 1;

  const nextReviewDate = new Date(base);
  nextReviewDate.setMonth(nextReviewDate.getMonth() + nextReviewCycle * autoReviewMonths);

  const daysUntil = daysBetween(today(), nextReviewDate.toISOString().split('T')[0]);

  // Remind 30 days before review is due
  const generate = daysUntil <= 30 && daysUntil >= -30;

  return { generate, daysUntil };
}

// Generate all reminders for a single item
function generateItemReminders(item: VaultItem, config: ReminderConfig): VaultReminder[] {
  if (!item.reminderEnabled || !config.globalEnabled) return [];

  const categoryConfig = getCategoryConfig(item.category, config);
  const reminders: VaultReminder[] = [];
  const todayStr = today();

  // Expiration reminder
  const expCheck = shouldGenerateReminder(
    item.expirationDate,
    categoryConfig.reminderDays,
    item.reminderDays
  );
  if (expCheck.generate && item.expirationDate) {
    reminders.push({
      id: generateReminderId(item.id, 'expiration', item.expirationDate),
      itemId: item.id,
      type: 'expiration',
      title: generateTitle(item, 'expiration'),
      message: generateMessage(item, 'expiration', expCheck.daysUntil),
      dueDate: item.expirationDate,
      priority: calculatePriority(expCheck.daysUntil, categoryConfig.priorityBoostDays),
      dismissed: false,
      createdAt: todayStr,
    });
  }

  // Renewal reminder
  const renewCheck = shouldGenerateReminder(
    item.renewalDate,
    categoryConfig.reminderDays,
    item.reminderDays
  );
  if (renewCheck.generate && item.renewalDate) {
    reminders.push({
      id: generateReminderId(item.id, 'renewal', item.renewalDate),
      itemId: item.id,
      type: 'renewal',
      title: generateTitle(item, 'renewal'),
      message: generateMessage(item, 'renewal', renewCheck.daysUntil),
      dueDate: item.renewalDate,
      priority: calculatePriority(renewCheck.daysUntil, categoryConfig.priorityBoostDays),
      dismissed: false,
      createdAt: todayStr,
    });
  }

  // Maintenance/action reminder
  const actionCheck = shouldGenerateReminder(
    item.nextActionDate,
    categoryConfig.reminderDays,
    item.reminderDays
  );
  if (actionCheck.generate && item.nextActionDate) {
    reminders.push({
      id: generateReminderId(item.id, 'maintenance', item.nextActionDate),
      itemId: item.id,
      type: 'maintenance',
      title: generateTitle(item, 'maintenance'),
      message: generateMessage(item, 'maintenance', actionCheck.daysUntil),
      dueDate: item.nextActionDate,
      priority: calculatePriority(actionCheck.daysUntil, categoryConfig.priorityBoostDays),
      dismissed: false,
      createdAt: todayStr,
    });
  }

  // Auto-review reminder (periodic)
  const reviewCheck = shouldGenerateReviewReminder(item, categoryConfig.autoReviewMonths);
  if (reviewCheck.generate) {
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + reviewCheck.daysUntil);
    const reviewDateStr = reviewDate.toISOString().split('T')[0];

    reminders.push({
      id: generateReminderId(item.id, 'review', reviewDateStr),
      itemId: item.id,
      type: 'review',
      title: generateTitle(item, 'review'),
      message: generateMessage(item, 'review', reviewCheck.daysUntil),
      dueDate: reviewDateStr,
      priority: calculatePriority(reviewCheck.daysUntil, categoryConfig.priorityBoostDays),
      dismissed: false,
      createdAt: todayStr,
    });
  }

  return reminders;
}

// Main function: Generate all reminders from all items
export function generateAllReminders(
  items?: VaultItem[],
  config?: ReminderConfig
): VaultReminder[] {
  const vaultItems = items ?? getItems();
  const reminderConfig = config ?? loadReminderConfig();

  const allReminders: VaultReminder[] = [];

  for (const item of vaultItems) {
    const itemReminders = generateItemReminders(item, reminderConfig);
    allReminders.push(...itemReminders);
  }

  // Sort by priority (high first) then by due date
  allReminders.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return allReminders;
}

// Sync reminders: preserve dismissed/snoozed state, add new, remove stale
export async function syncReminders(): Promise<VaultReminder[]> {
  const existingReminders = getReminders();
  const newReminders = generateAllReminders();

  // Create map of existing reminders by ID
  const existingMap = new Map<string, VaultReminder>();
  for (const r of existingReminders) {
    existingMap.set(r.id, r);
  }

  // Merge: keep dismissed/snoozed state from existing
  const mergedReminders = newReminders.map((newR) => {
    const existing = existingMap.get(newR.id);
    if (existing) {
      return {
        ...newR,
        dismissed: existing.dismissed,
        snoozedUntil: existing.snoozedUntil,
      };
    }
    return newR;
  });

  await setReminders(mergedReminders);
  return mergedReminders;
}

// Get reminders that need attention (not dismissed, not snoozed)
export function getActiveRemindersFromList(reminders: VaultReminder[]): VaultReminder[] {
  const todayStr = today();
  return reminders.filter((r) => {
    if (r.dismissed) return false;
    if (r.snoozedUntil && r.snoozedUntil > todayStr) return false;
    return true;
  });
}

// Get count of active reminders by priority
export function getReminderCounts(reminders: VaultReminder[]): {
  high: number;
  medium: number;
  low: number;
  total: number;
} {
  const active = getActiveRemindersFromList(reminders);
  return {
    high: active.filter((r) => r.priority === 'high').length,
    medium: active.filter((r) => r.priority === 'medium').length,
    low: active.filter((r) => r.priority === 'low').length,
    total: active.length,
  };
}
