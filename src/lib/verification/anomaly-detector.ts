/**
 * Anomaly Detector - Unusual Pattern Detection
 *
 * Detects unusual patterns and anomalies across all data:
 * - Spending spikes
 * - Health metric changes
 * - Schedule anomalies
 * - Behavior changes
 *
 * Uses statistical methods and historical comparison.
 */

import type {
  TemporalItem,
  Transaction,
} from '../types';
import type { HealthMetrics } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface Anomaly {
  id: string;
  type: 'spike' | 'drop' | 'unusual_pattern' | 'missing_data' | 'sudden_change';
  category: 'spending' | 'health' | 'schedule' | 'behavior';
  severity: 'info' | 'warning' | 'alert';
  title: string;
  description: string;
  value: number;
  expectedRange: { min: number; max: number };
  deviation: number; // Standard deviations from mean
  timestamp: Date;
  suggestion?: string;
}

export interface AnomalyDetectionConfig {
  spendingThreshold: number; // Standard deviations for spending alerts
  healthThreshold: number; // Standard deviations for health alerts
  lookbackDays: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CONFIG: AnomalyDetectionConfig = {
  spendingThreshold: 2,
  healthThreshold: 2.5,
  lookbackDays: 30,
};

// ============================================================================
// STATISTICAL HELPERS
// ============================================================================

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

// ============================================================================
// SPENDING ANOMALY DETECTION
// ============================================================================

export function detectSpendingAnomalies(
  transactions: Transaction[],
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Group by category
  const byCategory = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // Skip income
    if (!byCategory.has(tx.category)) {
      byCategory.set(tx.category, []);
    }
    byCategory.get(tx.category)!.push(tx);
  }

  for (const [category, categoryTxs] of byCategory) {
    if (categoryTxs.length < 3) continue;

    const amounts = categoryTxs.map(tx => Math.abs(tx.amount));
    const mean = calculateMean(amounts);
    const stdDev = calculateStdDev(amounts, mean);

    // Check most recent transactions
    const recent = categoryTxs.slice(-5);
    for (const tx of recent) {
      const amount = Math.abs(tx.amount);
      const zScore = calculateZScore(amount, mean, stdDev);

      if (Math.abs(zScore) > config.spendingThreshold) {
        const isSpike = zScore > 0;
        anomalies.push({
          id: `spending-${tx.id}`,
          type: isSpike ? 'spike' : 'drop',
          category: 'spending',
          severity: Math.abs(zScore) > 3 ? 'alert' : 'warning',
          title: `${isSpike ? 'High' : 'Low'} ${category} Spending`,
          description: `$${amount.toFixed(2)} is ${Math.abs(zScore).toFixed(1)} standard deviations ${isSpike ? 'above' : 'below'} your average`,
          value: amount,
          expectedRange: {
            min: Math.max(0, mean - 2 * stdDev),
            max: mean + 2 * stdDev,
          },
          deviation: zScore,
          timestamp: new Date(tx.date),
          suggestion: isSpike
            ? `Review this ${category} expense - it's higher than usual`
            : undefined,
        });
      }
    }
  }

  // Check for daily spending spikes
  const spendingByDay = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.amount >= 0) continue;
    const date = new Date(tx.date).toISOString().split('T')[0];
    spendingByDay.set(date, (spendingByDay.get(date) || 0) + Math.abs(tx.amount));
  }

  const dailyAmounts = [...spendingByDay.values()];
  if (dailyAmounts.length >= 7) {
    const mean = calculateMean(dailyAmounts);
    const stdDev = calculateStdDev(dailyAmounts, mean);

    // Check last 7 days
    const dates = [...spendingByDay.keys()].sort().slice(-7);
    for (const date of dates) {
      const amount = spendingByDay.get(date) || 0;
      const zScore = calculateZScore(amount, mean, stdDev);

      if (zScore > config.spendingThreshold) {
        anomalies.push({
          id: `daily-spending-${date}`,
          type: 'spike',
          category: 'spending',
          severity: zScore > 3 ? 'alert' : 'warning',
          title: 'High Daily Spending',
          description: `Spent $${amount.toFixed(2)} on ${date} - ${zScore.toFixed(1)} standard deviations above average`,
          value: amount,
          expectedRange: {
            min: Math.max(0, mean - 2 * stdDev),
            max: mean + 2 * stdDev,
          },
          deviation: zScore,
          timestamp: new Date(date),
          suggestion: 'Review your spending on this day',
        });
      }
    }
  }

  return anomalies;
}

// ============================================================================
// HEALTH ANOMALY DETECTION
// ============================================================================

export function detectHealthAnomalies(
  healthHistory: HealthMetrics[],
  config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  if (healthHistory.length < 7) return anomalies;

  // Sleep anomalies
  const sleepHours = healthHistory.map(h => h.sleep.hours);
  const sleepMean = calculateMean(sleepHours);
  const sleepStdDev = calculateStdDev(sleepHours, sleepMean);

  const recentSleep = sleepHours.slice(-3);
  for (let i = 0; i < recentSleep.length; i++) {
    const hours = recentSleep[i];
    const zScore = calculateZScore(hours, sleepMean, sleepStdDev);

    if (Math.abs(zScore) > config.healthThreshold) {
      const isLow = zScore < 0;
      anomalies.push({
        id: `sleep-${i}`,
        type: isLow ? 'drop' : 'spike',
        category: 'health',
        severity: Math.abs(zScore) > 3 ? 'alert' : 'warning',
        title: `${isLow ? 'Low' : 'High'} Sleep`,
        description: `${hours.toFixed(1)} hours is ${Math.abs(zScore).toFixed(1)} standard deviations ${isLow ? 'below' : 'above'} your average`,
        value: hours,
        expectedRange: {
          min: Math.max(0, sleepMean - 2 * sleepStdDev),
          max: Math.min(24, sleepMean + 2 * sleepStdDev),
        },
        deviation: zScore,
        timestamp: new Date(),
        suggestion: isLow
          ? 'Prioritize rest tonight'
          : 'Great sleep! Were you catching up on sleep debt?',
      });
    }
  }

  // HRV anomalies (lower is concerning)
  const hrvValues = healthHistory.map(h => h.hrv);
  const hrvMean = calculateMean(hrvValues);
  const hrvStdDev = calculateStdDev(hrvValues, hrvMean);

  const recentHrv = healthHistory.slice(-1)[0]?.hrv;
  if (recentHrv) {
    const zScore = calculateZScore(recentHrv, hrvMean, hrvStdDev);
    if (zScore < -config.healthThreshold) {
      anomalies.push({
        id: 'hrv-low',
        type: 'drop',
        category: 'health',
        severity: zScore < -3 ? 'alert' : 'warning',
        title: 'Low HRV',
        description: `HRV of ${recentHrv} is ${Math.abs(zScore).toFixed(1)} standard deviations below your average`,
        value: recentHrv,
        expectedRange: {
          min: Math.max(0, hrvMean - 2 * hrvStdDev),
          max: hrvMean + 2 * hrvStdDev,
        },
        deviation: zScore,
        timestamp: new Date(),
        suggestion: 'Your body may need extra recovery today',
      });
    }
  }

  // Resting heart rate anomalies (higher is concerning)
  const rhrValues = healthHistory.map(h => h.restingHR);
  const rhrMean = calculateMean(rhrValues);
  const rhrStdDev = calculateStdDev(rhrValues, rhrMean);

  const recentRhr = healthHistory.slice(-1)[0]?.restingHR;
  if (recentRhr) {
    const zScore = calculateZScore(recentRhr, rhrMean, rhrStdDev);
    if (zScore > config.healthThreshold) {
      anomalies.push({
        id: 'rhr-high',
        type: 'spike',
        category: 'health',
        severity: zScore > 3 ? 'alert' : 'warning',
        title: 'Elevated Resting Heart Rate',
        description: `RHR of ${recentRhr} is ${zScore.toFixed(1)} standard deviations above your average`,
        value: recentRhr,
        expectedRange: {
          min: Math.max(40, rhrMean - 2 * rhrStdDev),
          max: rhrMean + 2 * rhrStdDev,
        },
        deviation: zScore,
        timestamp: new Date(),
        suggestion: 'Consider extra rest - your body may be stressed',
      });
    }
  }

  // Steps anomalies
  const stepsValues = healthHistory.map(h => h.steps);
  const stepsMean = calculateMean(stepsValues);
  const stepsStdDev = calculateStdDev(stepsValues, stepsMean);

  const recentSteps = healthHistory.slice(-1)[0]?.steps;
  if (recentSteps !== undefined) {
    const zScore = calculateZScore(recentSteps, stepsMean, stepsStdDev);
    if (Math.abs(zScore) > config.healthThreshold) {
      const isLow = zScore < 0;
      anomalies.push({
        id: 'steps-anomaly',
        type: isLow ? 'drop' : 'spike',
        category: 'health',
        severity: 'info',
        title: `${isLow ? 'Low' : 'High'} Activity`,
        description: `${recentSteps.toLocaleString()} steps is ${Math.abs(zScore).toFixed(1)} standard deviations ${isLow ? 'below' : 'above'} average`,
        value: recentSteps,
        expectedRange: {
          min: Math.max(0, stepsMean - 2 * stepsStdDev),
          max: stepsMean + 2 * stepsStdDev,
        },
        deviation: zScore,
        timestamp: new Date(),
        suggestion: isLow
          ? 'Try to add some movement today'
          : 'Great activity day!',
      });
    }
  }

  return anomalies;
}

// ============================================================================
// SCHEDULE ANOMALY DETECTION
// ============================================================================

export function detectScheduleAnomalies(
  calendar: TemporalItem[],
  tasks: TemporalItem[],
  _config: AnomalyDetectionConfig = DEFAULT_CONFIG
): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Group events by day
  const eventsByDay = new Map<string, number>();
  for (const item of calendar) {
    if (!item.time) continue;
    const date = new Date(item.time).toISOString().split('T')[0];
    eventsByDay.set(date, (eventsByDay.get(date) || 0) + 1);
  }

  const dailyCounts = [...eventsByDay.values()];
  if (dailyCounts.length >= 7) {
    const mean = calculateMean(dailyCounts);
    const stdDev = calculateStdDev(dailyCounts, mean);

    // Check upcoming days
    const dates = [...eventsByDay.keys()].sort().slice(-7);
    for (const date of dates) {
      const count = eventsByDay.get(date) || 0;
      const zScore = calculateZScore(count, mean, stdDev);

      if (zScore > 2) {
        anomalies.push({
          id: `busy-day-${date}`,
          type: 'spike',
          category: 'schedule',
          severity: zScore > 3 ? 'alert' : 'warning',
          title: 'Unusually Busy Day',
          description: `${count} events on ${date} is ${zScore.toFixed(1)} standard deviations above your average`,
          value: count,
          expectedRange: {
            min: Math.max(0, mean - 2 * stdDev),
            max: mean + 2 * stdDev,
          },
          deviation: zScore,
          timestamp: new Date(date),
          suggestion: 'Consider rescheduling some meetings if possible',
        });
      }
    }
  }

  // Check for meeting hours
  const meetingHoursByDay = new Map<string, number>();
  for (const item of calendar) {
    if (!item.time) continue;
    const date = new Date(item.time).toISOString().split('T')[0];
    const hours = (item.duration || 60) / 60;
    meetingHoursByDay.set(date, (meetingHoursByDay.get(date) || 0) + hours);
  }

  const dailyHours = [...meetingHoursByDay.values()];
  if (dailyHours.length >= 7) {
    const mean = calculateMean(dailyHours);
    const stdDev = calculateStdDev(dailyHours, mean);

    const dates = [...meetingHoursByDay.keys()].sort().slice(-7);
    for (const date of dates) {
      const hours = meetingHoursByDay.get(date) || 0;
      const zScore = calculateZScore(hours, mean, stdDev);

      if (zScore > 2 && hours > 6) {
        anomalies.push({
          id: `meeting-heavy-${date}`,
          type: 'spike',
          category: 'schedule',
          severity: 'warning',
          title: 'Meeting-Heavy Day',
          description: `${hours.toFixed(1)} hours of meetings on ${date}`,
          value: hours,
          expectedRange: {
            min: Math.max(0, mean - 2 * stdDev),
            max: mean + 2 * stdDev,
          },
          deviation: zScore,
          timestamp: new Date(date),
          suggestion: 'Block some focus time between meetings',
        });
      }
    }
  }

  // Check for task overload
  const incompleteTasks = tasks.filter(t => !t.completed);
  const overdueTasks = incompleteTasks.filter(t => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < new Date();
  });

  if (overdueTasks.length > 5) {
    anomalies.push({
      id: 'task-overload',
      type: 'unusual_pattern',
      category: 'schedule',
      severity: 'alert',
      title: 'Task Backlog Growing',
      description: `${overdueTasks.length} overdue tasks`,
      value: overdueTasks.length,
      expectedRange: { min: 0, max: 3 },
      deviation: (overdueTasks.length - 3) / 2,
      timestamp: new Date(),
      suggestion: 'Prioritize or reschedule overdue tasks',
    });
  }

  return anomalies;
}

// ============================================================================
// COMBINED ANOMALY DETECTION
// ============================================================================

export function detectAllAnomalies(data: {
  transactions: Transaction[];
  healthHistory: HealthMetrics[];
  calendar: TemporalItem[];
  tasks: TemporalItem[];
}, config?: AnomalyDetectionConfig): Anomaly[] {
  const cfg = config || DEFAULT_CONFIG;

  const spendingAnomalies = detectSpendingAnomalies(data.transactions, cfg);
  const healthAnomalies = detectHealthAnomalies(data.healthHistory, cfg);
  const scheduleAnomalies = detectScheduleAnomalies(data.calendar, data.tasks, cfg);

  const allAnomalies = [
    ...spendingAnomalies,
    ...healthAnomalies,
    ...scheduleAnomalies,
  ];

  // Sort by severity
  return allAnomalies.sort((a, b) => {
    const severityOrder = { alert: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// ============================================================================
// ANOMALY SUMMARY
// ============================================================================

export function generateAnomalySummary(anomalies: Anomaly[]): {
  totalCount: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  requiresAttention: Anomaly[];
  summary: string;
} {
  const bySeverity: Record<string, number> = { alert: 0, warning: 0, info: 0 };
  const byCategory: Record<string, number> = {};

  for (const anomaly of anomalies) {
    bySeverity[anomaly.severity]++;
    byCategory[anomaly.category] = (byCategory[anomaly.category] || 0) + 1;
  }

  const requiresAttention = anomalies.filter(a => a.severity === 'alert');

  let summary = '';
  if (anomalies.length === 0) {
    summary = 'All metrics are within normal ranges. 👍';
  } else if (requiresAttention.length > 0) {
    summary = `${requiresAttention.length} item${requiresAttention.length > 1 ? 's' : ''} need${requiresAttention.length === 1 ? 's' : ''} your attention.`;
  } else if (bySeverity.warning > 0) {
    summary = `${bySeverity.warning} unusual pattern${bySeverity.warning > 1 ? 's' : ''} detected.`;
  } else {
    summary = 'A few minor anomalies detected. Nothing urgent.';
  }

  return {
    totalCount: anomalies.length,
    bySeverity,
    byCategory,
    requiresAttention,
    summary,
  };
}
