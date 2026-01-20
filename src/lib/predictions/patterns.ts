/**
 * Pattern Recognition Engine
 *
 * Analyzes historical data to detect patterns in:
 * - Productivity rhythms
 * - Spending habits
 * - Communication patterns
 * - Health cycles
 * - Behavior correlations
 *
 * Uses these patterns to make predictions and recommendations.
 */

import type {
  TemporalItem,
  Transaction,
  Person,
} from '../types';
import type { HealthMetrics } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface Pattern {
  id: string;
  type: 'productivity' | 'spending' | 'communication' | 'health' | 'behavior';
  name: string;
  description: string;
  confidence: number; // 0-100
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  dataPoints: number;
  insight: string;
  actionable: boolean;
  suggestion?: string;
}

export interface ProductivityPattern extends Pattern {
  type: 'productivity';
  peakHours: number[];
  lowHours: number[];
  bestDayOfWeek: number; // 0 = Sunday
  averageTasksCompleted: number;
  focusSessionLength: number; // minutes
}

export interface SpendingPattern extends Pattern {
  type: 'spending';
  category: string;
  averageAmount: number;
  typicalDayOfWeek?: number;
  typicalDayOfMonth?: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality?: string;
}

export interface CommunicationPattern extends Pattern {
  type: 'communication';
  person?: Person;
  preferredChannel: 'email' | 'call' | 'text' | 'in-person';
  averageResponseTime: number; // hours
  typicalInteractionFrequency: number; // days between
  sentimentTrend: 'positive' | 'neutral' | 'declining';
}

export interface HealthPattern extends Pattern {
  type: 'health';
  metric: 'sleep' | 'activity' | 'hrv' | 'weight';
  baseline: number;
  variance: number;
  correlatedFactors: string[];
  weekdayVsWeekend: { weekday: number; weekend: number };
}

export interface BehaviorCorrelation {
  id: string;
  factor1: string;
  factor2: string;
  correlation: number; // -1 to 1
  confidence: number;
  insight: string;
  samples: number;
}

// ============================================================================
// PRODUCTIVITY PATTERN DETECTION
// ============================================================================

export function detectProductivityPatterns(
  tasks: TemporalItem[],
  calendar: TemporalItem[],
  daysOfHistory: number = 30
): ProductivityPattern[] {
  const patterns: ProductivityPattern[] = [];

  // Analyze task completion by hour
  const completionsByHour: number[] = new Array(24).fill(0);
  // Reserved for task density analysis
  const _tasksByHour: number[] = new Array(24).fill(0);

  for (const task of tasks) {
    if (task.completed && task.time) {
      const hour = new Date(task.time).getHours();
      completionsByHour[hour]++;
    }
  }

  // Find peak and low hours
  const hourlyData = completionsByHour.map((count, hour) => ({ hour, count }));
  hourlyData.sort((a, b) => b.count - a.count);

  const peakHours = hourlyData.slice(0, 3).map(d => d.hour);
  const lowHours = hourlyData.slice(-3).map(d => d.hour);

  // Analyze by day of week
  const completionsByDay: number[] = new Array(7).fill(0);
  for (const task of tasks) {
    if (task.completed && task.time) {
      const day = new Date(task.time).getDay();
      completionsByDay[day]++;
    }
  }

  const bestDayOfWeek = completionsByDay.indexOf(Math.max(...completionsByDay));
  const avgTasksPerDay = tasks.filter(t => t.completed).length / daysOfHistory;

  // Detect focus session patterns
  // Group consecutive completed tasks
  const completedTasks = tasks
    .filter(t => t.completed && t.time)
    .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime());

  const focusSessions: number[] = [];
  let currentSession = 0;

  for (let i = 0; i < completedTasks.length - 1; i++) {
    const current = new Date(completedTasks[i].time!);
    const next = new Date(completedTasks[i + 1].time!);
    const gap = (next.getTime() - current.getTime()) / 60000; // minutes

    if (gap < 30) {
      currentSession += gap;
    } else {
      if (currentSession > 0) {
        focusSessions.push(currentSession);
      }
      currentSession = 0;
    }
  }

  const avgFocusSession = focusSessions.length > 0
    ? focusSessions.reduce((a, b) => a + b, 0) / focusSessions.length
    : 45; // default

  patterns.push({
    id: 'productivity-rhythm',
    type: 'productivity',
    name: 'Productivity Rhythm',
    description: `You're most productive at ${peakHours.map(h => formatHour(h)).join(', ')}`,
    confidence: Math.min(95, 60 + tasks.length / 2),
    frequency: 'daily',
    dataPoints: tasks.length,
    insight: `Your peak hours are ${peakHours.map(h => formatHour(h)).join(', ')}. Schedule your most important work during these times.`,
    actionable: true,
    suggestion: `Block ${formatHour(peakHours[0])} - ${formatHour(peakHours[0] + 2)} for deep work daily.`,
    peakHours,
    lowHours,
    bestDayOfWeek,
    averageTasksCompleted: avgTasksPerDay,
    focusSessionLength: avgFocusSession,
  });

  return patterns;
}

// ============================================================================
// SPENDING PATTERN DETECTION
// ============================================================================

export function detectSpendingPatterns(
  transactions: Transaction[],
  _daysOfHistory: number = 90
): SpendingPattern[] {
  const patterns: SpendingPattern[] = [];

  // Group by category
  const byCategory = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (!byCategory.has(tx.category)) {
      byCategory.set(tx.category, []);
    }
    byCategory.get(tx.category)!.push(tx);
  }

  for (const [category, categoryTxs] of byCategory) {
    if (categoryTxs.length < 3) continue;

    // Calculate average and trend
    const amounts = categoryTxs.map(tx => Math.abs(tx.amount));
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // Simple trend detection: compare first half to second half
    const midpoint = Math.floor(amounts.length / 2);
    const firstHalf = amounts.slice(0, midpoint);
    const secondHalf = amounts.slice(midpoint);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const trend: 'increasing' | 'decreasing' | 'stable' =
      secondAvg > firstAvg * 1.1 ? 'increasing' :
      secondAvg < firstAvg * 0.9 ? 'decreasing' : 'stable';

    // Detect day-of-week patterns
    const byDayOfWeek: number[] = new Array(7).fill(0);
    for (const tx of categoryTxs) {
      const day = new Date(tx.date).getDay();
      byDayOfWeek[day]++;
    }
    const maxDay = byDayOfWeek.indexOf(Math.max(...byDayOfWeek));
    const hasWeekdayPattern = byDayOfWeek[maxDay] > categoryTxs.length * 0.3;

    // Detect day-of-month patterns (for recurring bills)
    const byDayOfMonth: number[] = new Array(31).fill(0);
    for (const tx of categoryTxs) {
      const day = new Date(tx.date).getDate() - 1;
      byDayOfMonth[day]++;
    }
    const maxDayOfMonth = byDayOfMonth.indexOf(Math.max(...byDayOfMonth));
    const hasMonthlyPattern = byDayOfMonth[maxDayOfMonth] > categoryTxs.length * 0.5;

    const pattern: SpendingPattern = {
      id: `spending-${category.toLowerCase().replace(/\s/g, '-')}`,
      type: 'spending',
      name: `${category} Spending`,
      description: `Average $${avgAmount.toFixed(2)} per transaction, ${trend} trend`,
      confidence: Math.min(95, 50 + categoryTxs.length * 2),
      frequency: hasMonthlyPattern ? 'monthly' : hasWeekdayPattern ? 'weekly' : 'monthly',
      dataPoints: categoryTxs.length,
      category,
      averageAmount: avgAmount,
      trend,
      insight: trend === 'increasing'
        ? `Your ${category} spending is trending up. Consider reviewing recent purchases.`
        : trend === 'decreasing'
        ? `Great job! Your ${category} spending is trending down.`
        : `Your ${category} spending is consistent at ~$${avgAmount.toFixed(0)} per transaction.`,
      actionable: trend === 'increasing',
      suggestion: trend === 'increasing'
        ? `Set a budget alert for ${category} to stay on track.`
        : undefined,
    };

    if (hasWeekdayPattern) {
      pattern.typicalDayOfWeek = maxDay;
    }
    if (hasMonthlyPattern) {
      pattern.typicalDayOfMonth = maxDayOfMonth + 1;
    }

    patterns.push(pattern);
  }

  return patterns.sort((a, b) => b.averageAmount - a.averageAmount);
}

// ============================================================================
// COMMUNICATION PATTERN DETECTION
// ============================================================================

export function detectCommunicationPatterns(
  people: Person[],
  communicationHistory: { personId: string; date: Date; channel: string; sentiment?: string }[]
): CommunicationPattern[] {
  const patterns: CommunicationPattern[] = [];

  // Group by person
  const byPerson = new Map<string, typeof communicationHistory>();
  for (const comm of communicationHistory) {
    if (!byPerson.has(comm.personId)) {
      byPerson.set(comm.personId, []);
    }
    byPerson.get(comm.personId)!.push(comm);
  }

  for (const [personId, comms] of byPerson) {
    if (comms.length < 2) continue;

    const person = people.find(p => p.id === personId);
    if (!person) continue;

    // Find preferred channel
    const channelCounts = new Map<string, number>();
    for (const comm of comms) {
      channelCounts.set(comm.channel, (channelCounts.get(comm.channel) || 0) + 1);
    }
    const preferredChannel = [...channelCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0][0] as CommunicationPattern['preferredChannel'];

    // Calculate interaction frequency
    const sortedComms = comms.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const gaps: number[] = [];
    for (let i = 1; i < sortedComms.length; i++) {
      const gap = (new Date(sortedComms[i].date).getTime() - new Date(sortedComms[i - 1].date).getTime()) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }
    const avgFrequency = gaps.length > 0
      ? gaps.reduce((a, b) => a + b, 0) / gaps.length
      : 30;

    // Detect sentiment trend
    const sentiments = comms.filter(c => c.sentiment).map(c => c.sentiment);
    const sentimentTrend: 'positive' | 'neutral' | 'declining' =
      sentiments.filter(s => s === 'positive').length > sentiments.length * 0.6 ? 'positive' :
      sentiments.filter(s => s === 'negative').length > sentiments.length * 0.3 ? 'declining' : 'neutral';

    patterns.push({
      id: `comm-${personId}`,
      type: 'communication',
      name: `${person.name} Communication`,
      description: `Typically connect via ${preferredChannel} every ~${Math.round(avgFrequency)} days`,
      confidence: Math.min(95, 50 + comms.length * 5),
      frequency: avgFrequency < 7 ? 'weekly' : avgFrequency < 30 ? 'weekly' : 'monthly',
      dataPoints: comms.length,
      person,
      preferredChannel,
      averageResponseTime: 24, // Would need more data to calculate
      typicalInteractionFrequency: avgFrequency,
      sentimentTrend,
      insight: sentimentTrend === 'positive'
        ? `Your relationship with ${person.name} is thriving!`
        : sentimentTrend === 'declining'
        ? `Consider a thoughtful check-in with ${person.name}.`
        : `You connect with ${person.name} about every ${Math.round(avgFrequency)} days via ${preferredChannel}.`,
      actionable: sentimentTrend === 'declining' || avgFrequency > 30,
      suggestion: avgFrequency > 30
        ? `Schedule a regular check-in with ${person.name}.`
        : undefined,
    });
  }

  return patterns;
}

// ============================================================================
// HEALTH PATTERN DETECTION
// ============================================================================

export function detectHealthPatterns(
  healthHistory: HealthMetrics[]
): HealthPattern[] {
  const patterns: HealthPattern[] = [];

  if (healthHistory.length < 7) return patterns;

  // Sleep patterns
  const sleepHours = healthHistory.map(h => h.sleep.hours);
  const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
  const sleepVariance = Math.sqrt(
    sleepHours.map(h => Math.pow(h - avgSleep, 2)).reduce((a, b) => a + b, 0) / sleepHours.length
  );

  // Weekday vs weekend sleep (assuming history is chronological)
  const weekdaySleep: number[] = [];
  const weekendSleep: number[] = [];
  healthHistory.forEach((h, i) => {
    // Assuming index 0 is most recent
    const dayOfWeek = new Date().getDay() - i;
    const adjustedDay = ((dayOfWeek % 7) + 7) % 7;
    if (adjustedDay === 0 || adjustedDay === 6) {
      weekendSleep.push(h.sleep.hours);
    } else {
      weekdaySleep.push(h.sleep.hours);
    }
  });

  const avgWeekdaySleep = weekdaySleep.length > 0
    ? weekdaySleep.reduce((a, b) => a + b, 0) / weekdaySleep.length
    : avgSleep;
  const avgWeekendSleep = weekendSleep.length > 0
    ? weekendSleep.reduce((a, b) => a + b, 0) / weekendSleep.length
    : avgSleep;

  // Detect correlated factors
  const correlatedFactors: string[] = [];
  if (avgWeekendSleep - avgWeekdaySleep > 1) {
    correlatedFactors.push('catching up on weekends');
  }
  if (sleepVariance > 1.5) {
    correlatedFactors.push('inconsistent schedule');
  }

  patterns.push({
    id: 'sleep-pattern',
    type: 'health',
    name: 'Sleep Pattern',
    description: `Averaging ${avgSleep.toFixed(1)}h with ${sleepVariance < 0.5 ? 'very consistent' : sleepVariance < 1 ? 'fairly consistent' : 'variable'} schedule`,
    confidence: Math.min(95, 50 + healthHistory.length * 3),
    frequency: 'daily',
    dataPoints: healthHistory.length,
    metric: 'sleep',
    baseline: avgSleep,
    variance: sleepVariance,
    correlatedFactors,
    weekdayVsWeekend: { weekday: avgWeekdaySleep, weekend: avgWeekendSleep },
    insight: avgWeekendSleep - avgWeekdaySleep > 1
      ? `You're sleeping ${(avgWeekendSleep - avgWeekdaySleep).toFixed(1)}h more on weekends - this suggests weekday sleep debt.`
      : sleepVariance > 1.5
      ? `Your sleep varies significantly. Consistent sleep times improve quality.`
      : `Your sleep is consistent at ~${avgSleep.toFixed(1)}h. Great for recovery!`,
    actionable: sleepVariance > 1 || avgSleep < 7,
    suggestion: avgSleep < 7
      ? `Aim for 30 more minutes of sleep each night.`
      : sleepVariance > 1
      ? `Try going to bed within 30 minutes of the same time each day.`
      : undefined,
  });

  // Activity patterns
  const steps = healthHistory.map(h => h.steps);
  const avgSteps = steps.reduce((a, b) => a + b, 0) / steps.length;

  patterns.push({
    id: 'activity-pattern',
    type: 'health',
    name: 'Activity Pattern',
    description: `Averaging ${Math.round(avgSteps).toLocaleString()} steps daily`,
    confidence: Math.min(95, 50 + healthHistory.length * 3),
    frequency: 'daily',
    dataPoints: healthHistory.length,
    metric: 'activity',
    baseline: avgSteps,
    variance: Math.sqrt(
      steps.map(s => Math.pow(s - avgSteps, 2)).reduce((a, b) => a + b, 0) / steps.length
    ),
    correlatedFactors: [],
    weekdayVsWeekend: { weekday: avgSteps, weekend: avgSteps },
    insight: avgSteps >= 10000
      ? `You're hitting your activity goals consistently!`
      : avgSteps >= 7500
      ? `Good activity level. A bit more movement could boost energy.`
      : `Consider adding short walks throughout the day.`,
    actionable: avgSteps < 7500,
    suggestion: avgSteps < 7500
      ? `Try a 10-minute walk after meals to boost your daily steps.`
      : undefined,
  });

  return patterns;
}

// ============================================================================
// CORRELATION DETECTION
// ============================================================================

export function detectCorrelations(
  healthHistory: HealthMetrics[],
  productivityData: { date: Date; tasksCompleted: number }[]
): BehaviorCorrelation[] {
  const correlations: BehaviorCorrelation[] = [];

  if (healthHistory.length < 7 || productivityData.length < 7) return correlations;

  // Sleep vs Productivity correlation
  // Match health data with productivity data by date
  const matchedData: { sleep: number; productivity: number }[] = [];

  for (const health of healthHistory) {
    // Find matching productivity data
    // Assuming health data and productivity data can be matched by index for simplicity
    const matchingProd = productivityData[healthHistory.indexOf(health)];
    if (matchingProd) {
      matchedData.push({
        sleep: health.sleep.hours,
        productivity: matchingProd.tasksCompleted,
      });
    }
  }

  if (matchedData.length >= 5) {
    const correlation = calculateCorrelation(
      matchedData.map(d => d.sleep),
      matchedData.map(d => d.productivity)
    );

    correlations.push({
      id: 'sleep-productivity',
      factor1: 'Sleep Duration',
      factor2: 'Task Completion',
      correlation,
      confidence: Math.min(95, 50 + matchedData.length * 3),
      samples: matchedData.length,
      insight: correlation > 0.5
        ? `Strong link: Better sleep = more tasks completed`
        : correlation > 0.2
        ? `Moderate link between sleep and productivity`
        : correlation < -0.2
        ? `Interesting: You might be burning midnight oil`
        : `Sleep and productivity don't show strong correlation for you`,
    });
  }

  // HRV vs Productivity
  const hrvProductivity: { hrv: number; productivity: number }[] = [];
  for (let i = 0; i < Math.min(healthHistory.length, productivityData.length); i++) {
    hrvProductivity.push({
      hrv: healthHistory[i].hrv,
      productivity: productivityData[i].tasksCompleted,
    });
  }

  if (hrvProductivity.length >= 5) {
    const correlation = calculateCorrelation(
      hrvProductivity.map(d => d.hrv),
      hrvProductivity.map(d => d.productivity)
    );

    correlations.push({
      id: 'hrv-productivity',
      factor1: 'HRV (Recovery)',
      factor2: 'Task Completion',
      correlation,
      confidence: Math.min(95, 50 + hrvProductivity.length * 3),
      samples: hrvProductivity.length,
      insight: correlation > 0.5
        ? `Your recovery directly impacts productivity`
        : correlation > 0.2
        ? `Better recovery tends to mean better output`
        : `Recovery and productivity aren't strongly linked for you`,
    });
  }

  return correlations;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${period}`;
}

function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

// ============================================================================
// AGGREGATE INSIGHTS
// ============================================================================

export function generatePatternInsights(
  patterns: Pattern[]
): { summary: string; recommendations: string[]; highlights: string[] } {
  const actionablePatterns = patterns.filter(p => p.actionable);
  const highConfidence = patterns.filter(p => p.confidence >= 75);

  const recommendations = actionablePatterns
    .filter(p => p.suggestion)
    .map(p => p.suggestion!)
    .slice(0, 5);

  const highlights = highConfidence
    .map(p => p.insight)
    .slice(0, 3);

  const summary = actionablePatterns.length === 0
    ? `All your patterns look healthy! Keep up the good work.`
    : actionablePatterns.length <= 2
    ? `${actionablePatterns.length} area${actionablePatterns.length > 1 ? 's' : ''} could use attention.`
    : `Several patterns suggest room for optimization.`;

  return { summary, recommendations, highlights };
}
