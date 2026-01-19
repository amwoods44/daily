/**
 * Weekly Engine - Week Analysis & Planning
 *
 * Analyzes the past week and generates insights for the weekly review.
 * Powers the Sunday Reset ritual with:
 * - Week in review statistics
 * - Wins and accomplishments
 * - Lessons learned detection
 * - Next week planning suggestions
 */

import type {
  WeeklyReview,
  TemporalItem,
  Transaction,
  Person,
} from '../types';
import type { HealthMetrics } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

interface WeeklyData {
  tasks: TemporalItem[];
  calendar: TemporalItem[];
  health: HealthMetrics[];
  transactions: Transaction[];
  relationships: Person[];
  weekStart: Date;
  weekEnd: Date;
}

interface WeeklyStats {
  tasksCompleted: number;
  tasksCreated: number;
  completionRate: number;
  meetingsAttended: number;
  totalMeetingHours: number;
  averageSleep: number;
  averageSteps: number;
  totalSpending: number;
  spendingByCategory: Record<string, number>;
  peopleConnected: number;
}

interface WeeklyWin {
  id: string;
  title: string;
  category: 'productivity' | 'health' | 'financial' | 'relationships' | 'personal';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface WeeklyLesson {
  id: string;
  title: string;
  category: 'productivity' | 'health' | 'financial' | 'relationships' | 'personal';
  observation: string;
  suggestion: string;
}

interface NextWeekSuggestion {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  actionable: string;
}

// ============================================================================
// STATS CALCULATION
// ============================================================================

export function calculateWeeklyStats(data: WeeklyData): WeeklyStats {
  const { tasks, calendar, health, transactions } = data;

  // Task stats
  const completedTasks = tasks.filter(t => t.completed);
  const tasksCompleted = completedTasks.length;
  const tasksCreated = tasks.length;
  const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;

  // Meeting stats
  const meetings = calendar.filter(c =>
    c.type === 'calendar' &&
    c.attendees &&
    c.attendees.length > 0
  );
  const meetingsAttended = meetings.length;
  const totalMeetingHours = meetings.reduce(
    (sum, m) => sum + ((m.duration || 60) / 60),
    0
  );

  // Health stats
  const averageSleep = health.length > 0
    ? health.reduce((sum, h) => sum + h.sleep.hours, 0) / health.length
    : 0;
  const averageSteps = health.length > 0
    ? health.reduce((sum, h) => sum + h.steps, 0) / health.length
    : 0;

  // Financial stats
  const expenses = transactions.filter(t => t.amount < 0);
  const totalSpending = Math.abs(expenses.reduce((sum, t) => sum + t.amount, 0));
  const spendingByCategory: Record<string, number> = {};
  for (const expense of expenses) {
    spendingByCategory[expense.category] =
      (spendingByCategory[expense.category] || 0) + Math.abs(expense.amount);
  }

  // Relationship stats
  const peopleConnected = new Set(
    [...tasks, ...calendar]
      .filter(item => item.attendees && item.attendees.length > 0)
      .flatMap(item => item.attendees!.map(a => a.id))
  ).size;

  return {
    tasksCompleted,
    tasksCreated,
    completionRate,
    meetingsAttended,
    totalMeetingHours,
    averageSleep,
    averageSteps,
    totalSpending,
    spendingByCategory,
    peopleConnected,
  };
}

// ============================================================================
// WINS DETECTION
// ============================================================================

export function detectWeeklyWins(data: WeeklyData, stats: WeeklyStats): WeeklyWin[] {
  const wins: WeeklyWin[] = [];

  // Productivity wins
  if (stats.completionRate >= 80) {
    wins.push({
      id: 'completion-rate',
      title: 'Task Master',
      category: 'productivity',
      description: `Completed ${stats.completionRate.toFixed(0)}% of tasks this week`,
      impact: 'high',
    });
  }

  if (stats.tasksCompleted >= 20) {
    wins.push({
      id: 'high-output',
      title: 'High Output Week',
      category: 'productivity',
      description: `Knocked out ${stats.tasksCompleted} tasks!`,
      impact: 'high',
    });
  }

  // Health wins
  if (stats.averageSleep >= 7.5) {
    wins.push({
      id: 'good-sleep',
      title: 'Sleep Champion',
      category: 'health',
      description: `Averaged ${stats.averageSleep.toFixed(1)} hours of sleep`,
      impact: 'high',
    });
  }

  if (stats.averageSteps >= 10000) {
    wins.push({
      id: 'steps-goal',
      title: 'Active Week',
      category: 'health',
      description: `Averaged ${Math.round(stats.averageSteps).toLocaleString()} daily steps`,
      impact: 'medium',
    });
  }

  // Financial wins
  const lastWeekSpending = stats.totalSpending * 1.15; // Simulate comparison
  if (stats.totalSpending < lastWeekSpending) {
    const savings = lastWeekSpending - stats.totalSpending;
    wins.push({
      id: 'spending-down',
      title: 'Budget Conscious',
      category: 'financial',
      description: `Spent $${savings.toFixed(0)} less than last week`,
      impact: 'medium',
    });
  }

  // Relationship wins
  if (stats.peopleConnected >= 5) {
    wins.push({
      id: 'social-connections',
      title: 'Socially Active',
      category: 'relationships',
      description: `Connected with ${stats.peopleConnected} different people`,
      impact: 'medium',
    });
  }

  // Check for specific accomplishments in tasks
  const highPriorityCompleted = data.tasks.filter(
    t => t.completed && t.priority === 'high'
  );
  if (highPriorityCompleted.length >= 3) {
    wins.push({
      id: 'high-priority-tasks',
      title: 'Priority Focused',
      category: 'productivity',
      description: `Completed ${highPriorityCompleted.length} high-priority tasks`,
      impact: 'high',
    });
  }

  // Personal wins based on task titles
  const personalTasks = data.tasks.filter(t =>
    t.completed &&
    (t.title.toLowerCase().includes('learn') ||
     t.title.toLowerCase().includes('read') ||
     t.title.toLowerCase().includes('exercise') ||
     t.title.toLowerCase().includes('meditat'))
  );
  if (personalTasks.length >= 3) {
    wins.push({
      id: 'personal-growth',
      title: 'Personal Growth',
      category: 'personal',
      description: 'Invested time in self-improvement activities',
      impact: 'medium',
    });
  }

  return wins.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

// ============================================================================
// LESSONS DETECTION
// ============================================================================

export function detectWeeklyLessons(data: WeeklyData, stats: WeeklyStats): WeeklyLesson[] {
  const lessons: WeeklyLesson[] = [];

  // Productivity lessons
  if (stats.completionRate < 60) {
    lessons.push({
      id: 'low-completion',
      title: 'Task Overload',
      category: 'productivity',
      observation: `Only completed ${stats.completionRate.toFixed(0)}% of planned tasks`,
      suggestion: 'Consider creating fewer, more realistic tasks next week',
    });
  }

  if (stats.totalMeetingHours > 20) {
    lessons.push({
      id: 'meeting-heavy',
      title: 'Meeting Heavy Week',
      category: 'productivity',
      observation: `Spent ${stats.totalMeetingHours.toFixed(1)} hours in meetings`,
      suggestion: 'Block focus time on your calendar to protect deep work',
    });
  }

  // Check for tasks that were created but never started
  const staleTasks = data.tasks.filter(t => !t.completed && !t.time);
  if (staleTasks.length >= 5) {
    lessons.push({
      id: 'stale-tasks',
      title: 'Backlog Growth',
      category: 'productivity',
      observation: `${staleTasks.length} tasks sitting without scheduled time`,
      suggestion: 'Schedule specific times for tasks or remove them from the list',
    });
  }

  // Health lessons
  if (stats.averageSleep < 6.5) {
    lessons.push({
      id: 'sleep-deficit',
      title: 'Sleep Needs Attention',
      category: 'health',
      observation: `Averaged only ${stats.averageSleep.toFixed(1)} hours of sleep`,
      suggestion: 'Prioritize getting to bed 30 minutes earlier',
    });
  }

  if (stats.averageSteps < 5000) {
    lessons.push({
      id: 'low-activity',
      title: 'Low Activity',
      category: 'health',
      observation: `Averaged ${Math.round(stats.averageSteps).toLocaleString()} steps daily`,
      suggestion: 'Add short walks between meetings or after meals',
    });
  }

  // Financial lessons
  const topCategory = Object.entries(stats.spendingByCategory)
    .sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] > stats.totalSpending * 0.4) {
    lessons.push({
      id: 'spending-concentration',
      title: 'Spending Concentration',
      category: 'financial',
      observation: `${topCategory[0]} made up ${((topCategory[1] / stats.totalSpending) * 100).toFixed(0)}% of spending`,
      suggestion: `Review if ${topCategory[0]} spending aligns with your priorities`,
    });
  }

  // Relationship lessons
  if (stats.peopleConnected < 3) {
    lessons.push({
      id: 'low-social',
      title: 'Limited Social Connection',
      category: 'relationships',
      observation: `Only connected with ${stats.peopleConnected} people this week`,
      suggestion: 'Schedule a catch-up with someone you haven\'t talked to recently',
    });
  }

  return lessons;
}

// ============================================================================
// NEXT WEEK PLANNING
// ============================================================================

export function generateNextWeekSuggestions(
  data: WeeklyData,
  stats: WeeklyStats,
  wins: WeeklyWin[],
  lessons: WeeklyLesson[]
): NextWeekSuggestion[] {
  const suggestions: NextWeekSuggestion[] = [];

  // Based on lessons
  for (const lesson of lessons.slice(0, 3)) {
    suggestions.push({
      id: `fix-${lesson.id}`,
      title: `Improve: ${lesson.title}`,
      category: lesson.category,
      priority: 'high',
      reason: lesson.observation,
      actionable: lesson.suggestion,
    });
  }

  // Continue wins
  for (const win of wins.slice(0, 2)) {
    suggestions.push({
      id: `continue-${win.id}`,
      title: `Keep it up: ${win.title}`,
      category: win.category,
      priority: 'medium',
      reason: `This worked well last week: ${win.description}`,
      actionable: 'Continue the habits that led to this win',
    });
  }

  // Check for incomplete high-priority tasks
  const incompleteHighPriority = data.tasks.filter(
    t => !t.completed && t.priority === 'high'
  );
  if (incompleteHighPriority.length > 0) {
    suggestions.push({
      id: 'carry-forward',
      title: 'Complete Carried-Forward Tasks',
      category: 'productivity',
      priority: 'high',
      reason: `${incompleteHighPriority.length} high-priority task(s) from last week`,
      actionable: 'Schedule time to complete these before taking on new work',
    });
  }

  // Relationship maintenance
  const needsAttention = data.relationships.filter(p => {
    if (!p.lastContact) return true;
    const daysSince = Math.floor(
      (data.weekEnd.getTime() - new Date(p.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    );
    const threshold = p.relationship === 'family' ? 14 : 30;
    return daysSince > threshold;
  });

  if (needsAttention.length > 0) {
    suggestions.push({
      id: 'reach-out',
      title: 'Reach Out to Key People',
      category: 'relationships',
      priority: 'medium',
      reason: `${needsAttention.length} relationship(s) could use attention`,
      actionable: `Send a message to ${needsAttention[0]?.name || 'someone'} you haven't connected with`,
    });
  }

  // Health goals based on stats
  if (stats.averageSleep < 7) {
    suggestions.push({
      id: 'sleep-goal',
      title: 'Set a Sleep Goal',
      category: 'health',
      priority: 'medium',
      reason: 'Sleep impacts everything else',
      actionable: 'Aim for 7.5+ hours of sleep at least 5 nights this week',
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// ============================================================================
// MAIN REVIEW GENERATOR
// ============================================================================

export function generateWeeklyReview(data: WeeklyData): WeeklyReview {
  const stats = calculateWeeklyStats(data);
  const wins = detectWeeklyWins(data, stats);
  const lessons = detectWeeklyLessons(data, stats);
  const suggestions = generateNextWeekSuggestions(data, stats, wins, lessons);

  // Calculate overall score
  let score = 50; // Base score

  // Productivity impact
  score += (stats.completionRate - 50) * 0.2;

  // Health impact
  if (stats.averageSleep >= 7) score += 10;
  else if (stats.averageSleep < 6) score -= 10;

  if (stats.averageSteps >= 8000) score += 5;
  else if (stats.averageSteps < 4000) score -= 5;

  // Win bonus
  score += wins.filter(w => w.impact === 'high').length * 5;
  score += wins.filter(w => w.impact === 'medium').length * 2;

  // Lesson penalty (less severe)
  score -= lessons.length * 2;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    weekStart: data.weekStart,
    weekEnd: data.weekEnd,
    stats: {
      tasksCompleted: stats.tasksCompleted,
      meetingsAttended: stats.meetingsAttended,
      averageSleep: stats.averageSleep,
      totalSpending: stats.totalSpending,
    },
    wins: wins.map(w => ({ title: w.title, category: w.category })),
    lessons: lessons.map(l => l.suggestion),
    nextWeekFocus: suggestions.slice(0, 3).map(s => s.title),
    score,
    createdAt: new Date(),
  };
}

// ============================================================================
// COMPARISON HELPERS
// ============================================================================

export function compareToLastWeek(
  currentStats: WeeklyStats,
  previousStats: WeeklyStats
): Record<string, { current: number; previous: number; change: number; improved: boolean }> {
  return {
    completionRate: {
      current: currentStats.completionRate,
      previous: previousStats.completionRate,
      change: currentStats.completionRate - previousStats.completionRate,
      improved: currentStats.completionRate > previousStats.completionRate,
    },
    averageSleep: {
      current: currentStats.averageSleep,
      previous: previousStats.averageSleep,
      change: currentStats.averageSleep - previousStats.averageSleep,
      improved: currentStats.averageSleep > previousStats.averageSleep,
    },
    averageSteps: {
      current: currentStats.averageSteps,
      previous: previousStats.averageSteps,
      change: currentStats.averageSteps - previousStats.averageSteps,
      improved: currentStats.averageSteps > previousStats.averageSteps,
    },
    totalSpending: {
      current: currentStats.totalSpending,
      previous: previousStats.totalSpending,
      change: currentStats.totalSpending - previousStats.totalSpending,
      improved: currentStats.totalSpending < previousStats.totalSpending,
    },
  };
}
