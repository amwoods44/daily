/**
 * Data Validator - Data Quality & Verification
 *
 * Validates data integrity across all systems:
 * - Calendar data consistency
 * - Task data validity
 * - Health metrics sanity checks
 * - Financial data accuracy
 * - Relationship data completeness
 *
 * Detects anomalies and flags issues for user review.
 */

import type {
  TemporalItem,
  Person,
  Account,
  Transaction,
  Bill,
} from '../types';
import type { HealthMetrics } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  dataQualityScore: number; // 0-100
}

export interface ValidationError {
  id: string;
  type: 'missing' | 'invalid' | 'inconsistent' | 'duplicate';
  severity: 'critical' | 'high' | 'medium' | 'low';
  field: string;
  message: string;
  affectedItems?: string[];
  suggestedFix?: string;
}

export interface ValidationWarning {
  id: string;
  type: 'anomaly' | 'stale' | 'incomplete' | 'unusual';
  field: string;
  message: string;
  suggestion?: string;
}

export interface DataQualityReport {
  overall: ValidationResult;
  byCategory: {
    calendar: ValidationResult;
    tasks: ValidationResult;
    health: ValidationResult;
    finance: ValidationResult;
    relationships: ValidationResult;
  };
  timestamp: Date;
}

// ============================================================================
// CALENDAR VALIDATION
// ============================================================================

export function validateCalendarData(items: TemporalItem[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const seenIds = new Set<string>();

  for (const item of items) {
    // Check for duplicates
    if (seenIds.has(item.id)) {
      errors.push({
        id: `dup-${item.id}`,
        type: 'duplicate',
        severity: 'medium',
        field: 'id',
        message: `Duplicate calendar item ID: ${item.id}`,
        affectedItems: [item.id],
        suggestedFix: 'Remove or merge duplicate entries',
      });
    }
    seenIds.add(item.id);

    // Check for required fields
    if (!item.title || item.title.trim() === '') {
      errors.push({
        id: `missing-title-${item.id}`,
        type: 'missing',
        severity: 'high',
        field: 'title',
        message: 'Calendar item missing title',
        affectedItems: [item.id],
        suggestedFix: 'Add a descriptive title',
      });
    }

    // Validate time format
    if (item.time) {
      const date = new Date(item.time);
      if (isNaN(date.getTime())) {
        errors.push({
          id: `invalid-time-${item.id}`,
          type: 'invalid',
          severity: 'high',
          field: 'time',
          message: `Invalid time format for "${item.title}"`,
          affectedItems: [item.id],
          suggestedFix: 'Fix the date/time format',
        });
      }
    }

    // Check for events far in the future or past
    if (item.time) {
      const date = new Date(item.time);
      const now = new Date();
      const yearDiff = Math.abs(date.getFullYear() - now.getFullYear());

      if (yearDiff > 2) {
        warnings.push({
          id: `far-date-${item.id}`,
          type: 'unusual',
          field: 'time',
          message: `"${item.title}" is scheduled ${yearDiff} years ${date > now ? 'in the future' : 'in the past'}`,
          suggestion: 'Verify this date is correct',
        });
      }
    }

    // Validate duration
    if (item.duration !== undefined && (item.duration < 0 || item.duration > 1440)) {
      errors.push({
        id: `invalid-duration-${item.id}`,
        type: 'invalid',
        severity: 'medium',
        field: 'duration',
        message: `Invalid duration for "${item.title}": ${item.duration} minutes`,
        affectedItems: [item.id],
        suggestedFix: 'Set a reasonable duration (1-1440 minutes)',
      });
    }
  }

  // Check for overlapping events
  const sortedItems = items
    .filter(i => i.time)
    .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime());

  for (let i = 0; i < sortedItems.length - 1; i++) {
    const current = sortedItems[i];
    const next = sortedItems[i + 1];

    const currentEnd = new Date(current.time!);
    currentEnd.setMinutes(currentEnd.getMinutes() + (current.duration || 60));
    const nextStart = new Date(next.time!);

    if (nextStart < currentEnd) {
      warnings.push({
        id: `overlap-${current.id}-${next.id}`,
        type: 'anomaly',
        field: 'time',
        message: `"${current.title}" overlaps with "${next.title}"`,
        suggestion: 'Review and adjust the schedule',
      });
    }
  }

  const score = calculateQualityScore(errors, warnings, items.length);

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    dataQualityScore: score,
  };
}

// ============================================================================
// TASK VALIDATION
// ============================================================================

export function validateTaskData(tasks: TemporalItem[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const seenIds = new Set<string>();

  for (const task of tasks) {
    // Check for duplicates
    if (seenIds.has(task.id)) {
      errors.push({
        id: `dup-${task.id}`,
        type: 'duplicate',
        severity: 'medium',
        field: 'id',
        message: `Duplicate task ID: ${task.id}`,
        affectedItems: [task.id],
      });
    }
    seenIds.add(task.id);

    // Check for required fields
    if (!task.title || task.title.trim() === '') {
      errors.push({
        id: `missing-title-${task.id}`,
        type: 'missing',
        severity: 'high',
        field: 'title',
        message: 'Task missing title',
        affectedItems: [task.id],
      });
    }

    // Validate deadline if present
    if (task.deadline) {
      const deadline = new Date(task.deadline);
      if (isNaN(deadline.getTime())) {
        errors.push({
          id: `invalid-deadline-${task.id}`,
          type: 'invalid',
          severity: 'medium',
          field: 'deadline',
          message: `Invalid deadline format for "${task.title}"`,
          affectedItems: [task.id],
        });
      }
    }

    // Check for overdue incomplete tasks
    if (task.deadline && !task.completed) {
      const deadline = new Date(task.deadline);
      if (deadline < new Date()) {
        warnings.push({
          id: `overdue-${task.id}`,
          type: 'stale',
          field: 'deadline',
          message: `"${task.title}" is overdue`,
          suggestion: 'Complete or reschedule this task',
        });
      }
    }

    // Validate priority
    if (task.priority && !['high', 'medium', 'low'].includes(task.priority)) {
      errors.push({
        id: `invalid-priority-${task.id}`,
        type: 'invalid',
        severity: 'low',
        field: 'priority',
        message: `Invalid priority "${task.priority}" for "${task.title}"`,
        affectedItems: [task.id],
        suggestedFix: 'Use high, medium, or low',
      });
    }
  }

  // Check for similar task titles (potential duplicates)
  const titles = tasks.map(t => t.title.toLowerCase().trim());
  const seen = new Map<string, number>();
  titles.forEach((title, index) => {
    if (seen.has(title)) {
      warnings.push({
        id: `similar-${index}`,
        type: 'anomaly',
        field: 'title',
        message: `Potentially duplicate task: "${tasks[index].title}"`,
        suggestion: 'Review for possible merge',
      });
    }
    seen.set(title, index);
  });

  const score = calculateQualityScore(errors, warnings, tasks.length);

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    dataQualityScore: score,
  };
}

// ============================================================================
// HEALTH VALIDATION
// ============================================================================

export function validateHealthData(health: HealthMetrics): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate sleep hours
  if (health.sleep.hours < 0 || health.sleep.hours > 24) {
    errors.push({
      id: 'invalid-sleep-hours',
      type: 'invalid',
      severity: 'critical',
      field: 'sleep.hours',
      message: `Invalid sleep hours: ${health.sleep.hours}`,
      suggestedFix: 'Sleep hours must be between 0 and 24',
    });
  } else if (health.sleep.hours < 3) {
    warnings.push({
      id: 'low-sleep',
      type: 'anomaly',
      field: 'sleep.hours',
      message: `Unusually low sleep: ${health.sleep.hours} hours`,
      suggestion: 'Verify this data is correct',
    });
  } else if (health.sleep.hours > 12) {
    warnings.push({
      id: 'high-sleep',
      type: 'anomaly',
      field: 'sleep.hours',
      message: `Unusually high sleep: ${health.sleep.hours} hours`,
      suggestion: 'Verify this data is correct',
    });
  }

  // Validate sleep quality
  if (!['excellent', 'good', 'fair', 'poor'].includes(health.sleep.quality)) {
    errors.push({
      id: 'invalid-sleep-quality',
      type: 'invalid',
      severity: 'medium',
      field: 'sleep.quality',
      message: `Invalid sleep quality: ${health.sleep.quality}`,
    });
  }

  // Validate sleep stages sum to approximately 100% (if stages data exists)
  const stages = (health.sleep as { stages?: { deep: number; rem: number; light: number; awake: number } }).stages;
  if (stages) {
    const stagesSum = stages.deep + stages.rem + stages.light + stages.awake;
    if (Math.abs(stagesSum - 100) > 5) {
      warnings.push({
        id: 'stages-sum',
        type: 'anomaly',
        field: 'sleep.stages',
        message: `Sleep stages sum to ${stagesSum}%, expected ~100%`,
      });
    }
  }

  // Validate steps
  if (health.steps < 0) {
    errors.push({
      id: 'negative-steps',
      type: 'invalid',
      severity: 'critical',
      field: 'steps',
      message: `Invalid step count: ${health.steps}`,
    });
  } else if (health.steps > 50000) {
    warnings.push({
      id: 'high-steps',
      type: 'anomaly',
      field: 'steps',
      message: `Unusually high step count: ${health.steps}`,
      suggestion: 'Verify this data is correct',
    });
  }

  // Validate HRV
  if (health.hrv < 0 || health.hrv > 300) {
    errors.push({
      id: 'invalid-hrv',
      type: 'invalid',
      severity: 'high',
      field: 'hrv',
      message: `Invalid HRV: ${health.hrv}`,
    });
  }

  // Validate resting heart rate
  if (health.restingHR < 30 || health.restingHR > 200) {
    errors.push({
      id: 'invalid-rhr',
      type: 'invalid',
      severity: 'high',
      field: 'restingHR',
      message: `Invalid resting heart rate: ${health.restingHR}`,
    });
  }

  // Validate water intake
  if (health.waterGlasses < 0 || health.waterGlasses > 30) {
    warnings.push({
      id: 'unusual-water',
      type: 'anomaly',
      field: 'waterGlasses',
      message: `Unusual water intake: ${health.waterGlasses} glasses`,
    });
  }

  const score = calculateQualityScore(errors, warnings, 10);

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    dataQualityScore: score,
  };
}

// ============================================================================
// FINANCE VALIDATION
// ============================================================================

export function validateFinanceData(
  accounts: Account[],
  transactions: Transaction[],
  bills: Bill[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate accounts
  const accountIds = new Set<string>();
  for (const account of accounts) {
    if (accountIds.has(account.id)) {
      errors.push({
        id: `dup-account-${account.id}`,
        type: 'duplicate',
        severity: 'high',
        field: 'account.id',
        message: `Duplicate account ID: ${account.id}`,
      });
    }
    accountIds.add(account.id);

    if (!account.name) {
      errors.push({
        id: `missing-account-name-${account.id}`,
        type: 'missing',
        severity: 'medium',
        field: 'account.name',
        message: 'Account missing name',
      });
    }

    // Check for unusual balances
    if (account.type === 'checking' && account.balance < -10000) {
      warnings.push({
        id: `low-balance-${account.id}`,
        type: 'anomaly',
        field: 'account.balance',
        message: `Account "${account.name}" has very low balance: $${account.balance}`,
      });
    }
  }

  // Validate transactions
  for (const tx of transactions) {
    if (!tx.date || isNaN(new Date(tx.date).getTime())) {
      errors.push({
        id: `invalid-tx-date-${tx.id}`,
        type: 'invalid',
        severity: 'high',
        field: 'transaction.date',
        message: `Invalid transaction date for "${tx.description}"`,
      });
    }

    if (!tx.category) {
      warnings.push({
        id: `uncategorized-${tx.id}`,
        type: 'incomplete',
        field: 'transaction.category',
        message: `Transaction "${tx.description}" is uncategorized`,
        suggestion: 'Categorize this transaction',
      });
    }

    // Check for unusually large transactions
    if (Math.abs(tx.amount) > 10000) {
      warnings.push({
        id: `large-tx-${tx.id}`,
        type: 'anomaly',
        field: 'transaction.amount',
        message: `Large transaction: $${Math.abs(tx.amount)} for "${tx.description}"`,
        suggestion: 'Verify this transaction is correct',
      });
    }
  }

  // Validate bills
  for (const bill of bills) {
    if (!bill.dueDate || isNaN(new Date(bill.dueDate).getTime())) {
      errors.push({
        id: `invalid-bill-date-${bill.id}`,
        type: 'invalid',
        severity: 'high',
        field: 'bill.dueDate',
        message: `Invalid due date for bill "${bill.name}"`,
      });
    }

    if (bill.amount <= 0) {
      errors.push({
        id: `invalid-bill-amount-${bill.id}`,
        type: 'invalid',
        severity: 'medium',
        field: 'bill.amount',
        message: `Invalid amount for bill "${bill.name}": $${bill.amount}`,
      });
    }
  }

  const totalItems = accounts.length + transactions.length + bills.length;
  const score = calculateQualityScore(errors, warnings, totalItems);

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    dataQualityScore: score,
  };
}

// ============================================================================
// RELATIONSHIP VALIDATION
// ============================================================================

export function validateRelationshipData(people: Person[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const seenIds = new Set<string>();

  for (const person of people) {
    // Check for duplicates
    if (seenIds.has(person.id)) {
      errors.push({
        id: `dup-person-${person.id}`,
        type: 'duplicate',
        severity: 'medium',
        field: 'person.id',
        message: `Duplicate person ID: ${person.id}`,
      });
    }
    seenIds.add(person.id);

    // Check for required fields
    if (!person.name || person.name.trim() === '') {
      errors.push({
        id: `missing-name-${person.id}`,
        type: 'missing',
        severity: 'high',
        field: 'person.name',
        message: 'Person missing name',
        affectedItems: [person.id],
      });
    }

    // Validate email if present
    if (person.email && !isValidEmail(person.email)) {
      errors.push({
        id: `invalid-email-${person.id}`,
        type: 'invalid',
        severity: 'medium',
        field: 'person.email',
        message: `Invalid email for ${person.name}: ${person.email}`,
      });
    }

    // Validate phone if present
    if (person.phone && !isValidPhone(person.phone)) {
      warnings.push({
        id: `invalid-phone-${person.id}`,
        type: 'incomplete',
        field: 'person.phone',
        message: `Unusual phone format for ${person.name}: ${person.phone}`,
        suggestion: 'Verify the phone number',
      });
    }

    // Validate birthday if present
    if (person.birthday) {
      const bday = new Date(person.birthday);
      if (isNaN(bday.getTime())) {
        errors.push({
          id: `invalid-birthday-${person.id}`,
          type: 'invalid',
          severity: 'low',
          field: 'person.birthday',
          message: `Invalid birthday for ${person.name}`,
        });
      } else if (bday > new Date()) {
        warnings.push({
          id: `future-birthday-${person.id}`,
          type: 'anomaly',
          field: 'person.birthday',
          message: `${person.name}'s birthday is in the future`,
          suggestion: 'Verify the birth date',
        });
      }
    }

    // Check for incomplete contact info
    if (!person.email && !person.phone) {
      warnings.push({
        id: `no-contact-${person.id}`,
        type: 'incomplete',
        field: 'contact',
        message: `${person.name} has no contact information`,
        suggestion: 'Add email or phone number',
      });
    }

    // Check for stale relationships
    if (person.lastContact) {
      const lastContact = new Date(person.lastContact);
      const daysSince = Math.floor(
        (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince > 180) {
        warnings.push({
          id: `stale-${person.id}`,
          type: 'stale',
          field: 'lastContact',
          message: `Haven't contacted ${person.name} in ${daysSince} days`,
          suggestion: 'Consider reaching out',
        });
      }
    }
  }

  // Check for potential duplicates by name
  const names = people.map(p => p.name.toLowerCase().trim());
  const seenNames = new Map<string, number>();
  names.forEach((name, index) => {
    if (seenNames.has(name)) {
      warnings.push({
        id: `similar-name-${index}`,
        type: 'anomaly',
        field: 'person.name',
        message: `Potentially duplicate person: "${people[index].name}"`,
        suggestion: 'Review for possible merge',
      });
    }
    seenNames.set(name, index);
  });

  const score = calculateQualityScore(errors, warnings, people.length);

  return {
    valid: errors.filter(e => e.severity === 'critical').length === 0,
    errors,
    warnings,
    dataQualityScore: score,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateQualityScore(
  errors: ValidationError[],
  warnings: ValidationWarning[],
  totalItems: number
): number {
  if (totalItems === 0) return 100;

  // Severity weights
  const errorWeights = { critical: 20, high: 10, medium: 5, low: 2 };
  const warningWeight = 1;

  let penalty = 0;

  for (const error of errors) {
    penalty += errorWeights[error.severity] || 5;
  }

  penalty += warnings.length * warningWeight;

  // Score is 100 minus penalty, scaled by item count
  const maxPenalty = Math.max(totalItems * 2, 50);
  const score = Math.max(0, 100 - (penalty / maxPenalty) * 100);

  return Math.round(score);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Basic validation - digits, spaces, dashes, parentheses, plus
  const phoneRegex = /^[\d\s\-\(\)\+]{7,20}$/;
  return phoneRegex.test(phone);
}

// ============================================================================
// FULL VALIDATION REPORT
// ============================================================================

export function generateDataQualityReport(data: {
  calendar: TemporalItem[];
  tasks: TemporalItem[];
  health: HealthMetrics;
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  people: Person[];
}): DataQualityReport {
  const calendarResult = validateCalendarData(data.calendar);
  const tasksResult = validateTaskData(data.tasks);
  const healthResult = validateHealthData(data.health);
  const financeResult = validateFinanceData(data.accounts, data.transactions, data.bills);
  const relationshipsResult = validateRelationshipData(data.people);

  // Aggregate results
  const allErrors = [
    ...calendarResult.errors,
    ...tasksResult.errors,
    ...healthResult.errors,
    ...financeResult.errors,
    ...relationshipsResult.errors,
  ];

  const allWarnings = [
    ...calendarResult.warnings,
    ...tasksResult.warnings,
    ...healthResult.warnings,
    ...financeResult.warnings,
    ...relationshipsResult.warnings,
  ];

  const overallScore = Math.round(
    (calendarResult.dataQualityScore +
      tasksResult.dataQualityScore +
      healthResult.dataQualityScore +
      financeResult.dataQualityScore +
      relationshipsResult.dataQualityScore) /
      5
  );

  return {
    overall: {
      valid: allErrors.filter(e => e.severity === 'critical').length === 0,
      errors: allErrors,
      warnings: allWarnings,
      dataQualityScore: overallScore,
    },
    byCategory: {
      calendar: calendarResult,
      tasks: tasksResult,
      health: healthResult,
      finance: financeResult,
      relationships: relationshipsResult,
    },
    timestamp: new Date(),
  };
}
