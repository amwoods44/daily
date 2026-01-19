/**
 * Smart Suggestions Engine
 *
 * Generates context-aware, personalized suggestions based on:
 * - Current time and context
 * - Detected patterns
 * - Upcoming collisions
 * - User preferences and history
 *
 * Suggestions are proactive nudges that help users stay on track
 * without being overwhelming.
 */

import type {
  Nudge,
  TemporalItem,
  Person,
  Account,
  Bill,
  Collision,
} from '../types';
import type { HealthMetrics } from '../mock-data';
import type { Pattern, ProductivityPattern } from './patterns';
import type { EnergyPrediction } from '../health/health-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface SuggestionContext {
  now: Date;
  calendar: TemporalItem[];
  tasks: TemporalItem[];
  health: HealthMetrics;
  energyPrediction: EnergyPrediction;
  accounts: Account[];
  bills: Bill[];
  people: Person[];
  patterns: Pattern[];
  collisions: Collision[];
  recentActions: { type: string; timestamp: Date }[];
  preferences: {
    workHoursStart: number;
    workHoursEnd: number;
    focusPreference: 'morning' | 'afternoon' | 'evening';
    notificationFrequency: 'minimal' | 'moderate' | 'frequent';
  };
}

export interface Suggestion extends Nudge {
  relevanceScore: number; // 0-100, how relevant this suggestion is right now
  expiresAt: Date;
  source: 'pattern' | 'collision' | 'context' | 'schedule' | 'health' | 'relationship' | 'financial';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_SUGGESTIONS = 5;
const SUGGESTION_COOLDOWN_MINUTES = 30;

// ============================================================================
// TIME-BASED SUGGESTIONS
// ============================================================================

function generateTimeSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const hour = ctx.now.getHours();
  const dayOfWeek = ctx.now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isWorkHours = hour >= ctx.preferences.workHoursStart && hour < ctx.preferences.workHoursEnd;

  // Morning routine suggestions
  if (hour >= 6 && hour <= 9) {
    // Check if morning ritual hasn't been done
    const recentMorningAction = ctx.recentActions.find(
      a => a.type === 'morning_ritual' &&
      (ctx.now.getTime() - a.timestamp.getTime()) < 12 * 60 * 60 * 1000
    );

    if (!recentMorningAction) {
      suggestions.push({
        id: 'morning-ritual',
        type: 'action',
        priority: 'high',
        title: 'Start Your Morning Ritual',
        message: 'Take 2 minutes to set your intention for today.',
        action: {
          type: 'navigate',
          label: 'Begin Ritual',
          payload: { path: '/morning' },
        },
        createdAt: ctx.now,
        relevanceScore: 90,
        expiresAt: new Date(ctx.now.getTime() + 3 * 60 * 60 * 1000), // 3 hours
        source: 'context',
      });
    }
  }

  // Midday energy check
  if (hour >= 13 && hour <= 15 && !isWeekend) {
    const energyNow = ctx.energyPrediction.hourlyPredictions?.find((p: { hour: number; level: number }) => p.hour === hour);
    if (energyNow && energyNow.level < 50) {
      suggestions.push({
        id: 'midday-energy',
        type: 'reminder',
        priority: 'medium',
        title: 'Energy Dip Detected',
        message: 'This is typically your low-energy period. Consider a quick walk or light tasks.',
        action: {
          type: 'dismiss',
          label: 'Got it',
        },
        createdAt: ctx.now,
        relevanceScore: 70,
        expiresAt: new Date(ctx.now.getTime() + 2 * 60 * 60 * 1000),
        source: 'health',
      });
    }
  }

  // End of day review
  if (hour >= 17 && hour <= 19 && !isWeekend && isWorkHours) {
    const incompleteTasks = ctx.tasks.filter(t => !t.completed && t.deadline);
    const todayDeadlines = incompleteTasks.filter(t => {
      const deadline = new Date(t.deadline!);
      return deadline.toDateString() === ctx.now.toDateString();
    });

    if (todayDeadlines.length > 0) {
      suggestions.push({
        id: 'end-of-day-tasks',
        type: 'warning',
        priority: 'high',
        title: `${todayDeadlines.length} Tasks Due Today`,
        message: `You have ${todayDeadlines.length} task${todayDeadlines.length > 1 ? 's' : ''} due today that ${todayDeadlines.length > 1 ? 'are' : 'is'} still incomplete.`,
        action: {
          type: 'navigate',
          label: 'View Tasks',
          payload: { path: '/tasks' },
        },
        createdAt: ctx.now,
        relevanceScore: 95,
        expiresAt: new Date(ctx.now.getTime() + 4 * 60 * 60 * 1000),
        source: 'schedule',
      });
    }
  }

  // Weekend planning
  if (dayOfWeek === 5 && hour >= 15) {
    suggestions.push({
      id: 'weekend-planning',
      type: 'reminder',
      priority: 'low',
      title: 'Plan Your Weekend',
      message: 'Take a moment to decide what would make this weekend great.',
      action: {
        type: 'dismiss',
        label: 'Later',
      },
      createdAt: ctx.now,
      relevanceScore: 50,
      expiresAt: new Date(ctx.now.getTime() + 24 * 60 * 60 * 1000),
      source: 'context',
    });
  }

  // Sunday evening prep
  if (dayOfWeek === 0 && hour >= 18 && hour <= 21) {
    suggestions.push({
      id: 'week-prep',
      type: 'reminder',
      priority: 'medium',
      title: 'Prepare for the Week',
      message: 'A quick review of your upcoming week can reduce Monday stress.',
      action: {
        type: 'navigate',
        label: 'Weekly Review',
        payload: { path: '/weekly' },
      },
      createdAt: ctx.now,
      relevanceScore: 75,
      expiresAt: new Date(ctx.now.getTime() + 4 * 60 * 60 * 1000),
      source: 'context',
    });
  }

  return suggestions;
}

// ============================================================================
// SCHEDULE-BASED SUGGESTIONS
// ============================================================================

function generateScheduleSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = ctx.now;
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  // Upcoming meeting preparation
  const upcomingMeetings = ctx.calendar.filter(item => {
    if (!item.time) return false;
    const itemTime = new Date(item.time);
    return itemTime > now && itemTime <= inOneHour;
  });

  for (const meeting of upcomingMeetings.slice(0, 1)) {
    const meetingTime = new Date(meeting.time!);
    const minutesUntil = Math.round((meetingTime.getTime() - now.getTime()) / 60000);

    if (minutesUntil <= 15 && minutesUntil >= 5) {
      suggestions.push({
        id: `prep-${meeting.id}`,
        type: 'reminder',
        priority: 'high',
        title: `"${meeting.title}" in ${minutesUntil} min`,
        message: meeting.attendees && meeting.attendees.length > 0
          ? `Meeting with ${meeting.attendees.slice(0, 2).map(a => a.name).join(', ')}${meeting.attendees.length > 2 ? ` and ${meeting.attendees.length - 2} others` : ''}`
          : 'Take a moment to prepare.',
        action: meeting.location?.includes('zoom') || meeting.location?.includes('meet')
          ? { type: 'open_url', label: 'Join Meeting', payload: { url: meeting.location } }
          : { type: 'dismiss', label: 'Dismiss' },
        createdAt: now,
        relevanceScore: 100,
        expiresAt: meetingTime,
        source: 'schedule',
      });
    }
  }

  // Gap between meetings for break
  const sortedCalendar = [...ctx.calendar]
    .filter(item => item.time && new Date(item.time) > now)
    .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime());

  for (let i = 0; i < sortedCalendar.length - 1; i++) {
    const current = sortedCalendar[i];
    const next = sortedCalendar[i + 1];

    const currentEnd = new Date(new Date(current.time!).getTime() + (current.duration || 60) * 60000);
    const nextStart = new Date(next.time!);
    const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000;

    // If there's a 30-60 minute gap, suggest a break
    if (gapMinutes >= 30 && gapMinutes <= 60) {
      const gapStart = currentEnd;
      const minutesUntilGap = (gapStart.getTime() - now.getTime()) / 60000;

      if (minutesUntilGap > 0 && minutesUntilGap <= 120) {
        suggestions.push({
          id: `break-${current.id}-${next.id}`,
          type: 'reminder',
          priority: 'low',
          title: 'Break Opportunity',
          message: `You have ${Math.round(gapMinutes)} minutes between meetings. Perfect for a short break.`,
          action: {
            type: 'dismiss',
            label: 'Got it',
          },
          createdAt: now,
          relevanceScore: 40,
          expiresAt: gapStart,
          source: 'schedule',
        });
        break; // Only suggest one break opportunity
      }
    }
  }

  return suggestions;
}

// ============================================================================
// HEALTH-BASED SUGGESTIONS
// ============================================================================

function generateHealthSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const hour = ctx.now.getHours();

  // Hydration reminder
  if (hour >= 10 && hour <= 18) {
    const waterProgress = ctx.health.waterGlasses / ctx.health.waterGoal;
    const expectedProgress = (hour - 8) / 12; // Expected progress based on time

    if (waterProgress < expectedProgress * 0.7) {
      suggestions.push({
        id: 'hydration',
        type: 'reminder',
        priority: 'low',
        title: 'Hydration Check',
        message: `You've had ${ctx.health.waterGlasses} of ${ctx.health.waterGoal} glasses today. Time for water?`,
        action: {
          type: 'dismiss',
          label: 'Done',
        },
        createdAt: ctx.now,
        relevanceScore: 45,
        expiresAt: new Date(ctx.now.getTime() + 2 * 60 * 60 * 1000),
        source: 'health',
      });
    }
  }

  // Movement reminder after sitting
  if (hour >= 9 && hour <= 17) {
    const stepsProgress = ctx.health.steps / ctx.health.stepsGoal;
    const expectedSteps = (hour - 8) / 12;

    if (stepsProgress < expectedSteps * 0.5) {
      suggestions.push({
        id: 'movement',
        type: 'reminder',
        priority: 'low',
        title: 'Time to Move',
        message: "You're behind on steps today. A 5-minute walk would help.",
        action: {
          type: 'dismiss',
          label: 'Will do',
        },
        createdAt: ctx.now,
        relevanceScore: 40,
        expiresAt: new Date(ctx.now.getTime() + 2 * 60 * 60 * 1000),
        source: 'health',
      });
    }
  }

  // Sleep debt recovery
  if (hour >= 20 && hour <= 22) {
    const sleepDeficit = 8 - ctx.health.sleep.hours;
    if (sleepDeficit > 1) {
      suggestions.push({
        id: 'sleep-recovery',
        type: 'reminder',
        priority: 'medium',
        title: 'Recover Sleep Debt',
        message: `You were ${sleepDeficit.toFixed(1)}h short last night. Consider going to bed 30 minutes earlier tonight.`,
        action: {
          type: 'dismiss',
          label: 'Set reminder',
        },
        createdAt: ctx.now,
        relevanceScore: 60,
        expiresAt: new Date(ctx.now.getTime() + 3 * 60 * 60 * 1000),
        source: 'health',
      });
    }
  }

  // Recovery day suggestion
  if (ctx.health.hrv < 35 && ctx.health.restingHR > 70) {
    suggestions.push({
      id: 'recovery-day',
      type: 'warning',
      priority: 'medium',
      title: 'Body Needs Recovery',
      message: 'Your HRV and resting heart rate suggest you need rest. Consider lighter activities today.',
      action: {
        type: 'dismiss',
        label: 'Understood',
      },
      createdAt: ctx.now,
      relevanceScore: 75,
      expiresAt: new Date(ctx.now.getTime() + 12 * 60 * 60 * 1000),
      source: 'health',
    });
  }

  return suggestions;
}

// ============================================================================
// RELATIONSHIP-BASED SUGGESTIONS
// ============================================================================

function generateRelationshipSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = ctx.now;

  // Check for birthdays
  for (const person of ctx.people) {
    if (!person.birthday) continue;

    const birthday = new Date(person.birthday);
    const thisYearBirthday = new Date(
      now.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );

    if (thisYearBirthday < now) {
      thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
    }

    const daysUntil = Math.ceil(
      (thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil === 0) {
      suggestions.push({
        id: `birthday-today-${person.id}`,
        type: 'action',
        priority: 'high',
        title: `🎂 ${person.name}'s Birthday!`,
        message: 'Send them a heartfelt message to brighten their day.',
        action: {
          type: 'send_message',
          label: 'Send wishes',
          payload: { personId: person.id },
        },
        createdAt: now,
        relevanceScore: 100,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        source: 'relationship',
      });
    } else if (daysUntil === 1) {
      suggestions.push({
        id: `birthday-tomorrow-${person.id}`,
        type: 'reminder',
        priority: 'medium',
        title: `${person.name}'s Birthday Tomorrow`,
        message: 'Would you like to prepare something special?',
        action: {
          type: 'dismiss',
          label: 'Got it',
        },
        createdAt: now,
        relevanceScore: 85,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        source: 'relationship',
      });
    }
  }

  // Relationship maintenance
  const priorityRelationships = ctx.people.filter(
    p => p.relationship === 'family' || p.relationship === 'close_friend'
  );

  for (const person of priorityRelationships.slice(0, 3)) {
    if (!person.lastContact) continue;

    const daysSinceContact = Math.floor(
      (now.getTime() - new Date(person.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    );

    const threshold = person.relationship === 'family' ? 14 : 21;

    if (daysSinceContact > threshold && daysSinceContact <= threshold + 7) {
      suggestions.push({
        id: `reach-out-${person.id}`,
        type: 'action',
        priority: 'medium',
        title: `Check in with ${person.name}`,
        message: `It's been ${daysSinceContact} days since you connected.`,
        action: {
          type: 'send_message',
          label: 'Send message',
          payload: { personId: person.id },
        },
        createdAt: now,
        relevanceScore: 55,
        expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        source: 'relationship',
      });
    }
  }

  return suggestions;
}

// ============================================================================
// FINANCIAL SUGGESTIONS
// ============================================================================

function generateFinancialSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = ctx.now;

  // Upcoming bills
  const urgentBills = ctx.bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    const daysUntil = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil >= 0 && daysUntil <= 3 && !bill.isPaid;
  });

  if (urgentBills.length > 0) {
    const totalDue = urgentBills.reduce((sum, b) => sum + b.amount, 0);
    suggestions.push({
      id: 'urgent-bills',
      type: 'warning',
      priority: 'high',
      title: `${urgentBills.length} Bill${urgentBills.length > 1 ? 's' : ''} Due Soon`,
      message: `$${totalDue.toFixed(2)} due in the next 3 days`,
      action: {
        type: 'navigate',
        label: 'View Bills',
        payload: { path: '/finance/bills' },
      },
      createdAt: now,
      relevanceScore: 90,
      expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      source: 'financial',
    });
  }

  // Low balance warning
  const checkingAccounts = ctx.accounts.filter(a => a.type === 'checking');
  const totalChecking = checkingAccounts.reduce((sum, a) => sum + a.balance, 0);
  const upcomingBillsTotal = ctx.bills
    .filter(b => {
      const daysUntil = Math.ceil(
        (new Date(b.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil >= 0 && daysUntil <= 7 && !b.isPaid;
    })
    .reduce((sum, b) => sum + b.amount, 0);

  if (totalChecking - upcomingBillsTotal < 500) {
    suggestions.push({
      id: 'low-balance-warning',
      type: 'warning',
      priority: 'high',
      title: 'Low Balance Alert',
      message: `After upcoming bills, you'll have ~$${(totalChecking - upcomingBillsTotal).toFixed(2)} in checking.`,
      action: {
        type: 'navigate',
        label: 'Review Finances',
        payload: { path: '/finance' },
      },
      createdAt: now,
      relevanceScore: 85,
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      source: 'financial',
    });
  }

  return suggestions;
}

// ============================================================================
// COLLISION-BASED SUGGESTIONS
// ============================================================================

function generateCollisionSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Convert high-priority collisions to suggestions
  const highPriorityCollisions = ctx.collisions.filter(c => c.severity === 'high');

  for (const collision of highPriorityCollisions.slice(0, 2)) {
    suggestions.push({
      id: `collision-${collision.id}`,
      type: 'warning',
      priority: 'high',
      title: collision.title,
      message: collision.description,
      action: {
        type: 'dismiss',
        label: 'Resolve',
      },
      createdAt: ctx.now,
      relevanceScore: 80 + Math.abs(collision.impact.score) / 2,
      expiresAt: new Date(ctx.now.getTime() + 24 * 60 * 60 * 1000),
      source: 'collision',
    });
  }

  return suggestions;
}

// ============================================================================
// PATTERN-BASED SUGGESTIONS
// ============================================================================

function generatePatternSuggestions(ctx: SuggestionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const hour = ctx.now.getHours();

  // Find productivity pattern
  const productivityPattern = ctx.patterns.find(
    p => p.type === 'productivity'
  ) as ProductivityPattern | undefined;

  if (productivityPattern) {
    // Suggest focus time during peak hours
    if (productivityPattern.peakHours.includes(hour)) {
      const hasScheduledMeeting = ctx.calendar.some(item => {
        if (!item.time) return false;
        const itemHour = new Date(item.time).getHours();
        return itemHour === hour;
      });

      if (!hasScheduledMeeting) {
        suggestions.push({
          id: 'peak-focus-time',
          type: 'action',
          priority: 'medium',
          title: 'Peak Productivity Window',
          message: `${hour}:00 is historically one of your most productive hours. Tackle something important.`,
          action: {
            type: 'navigate',
            label: 'Start Focus',
            payload: { path: '/focus' },
          },
          createdAt: ctx.now,
          relevanceScore: 65,
          expiresAt: new Date(ctx.now.getTime() + 60 * 60 * 1000),
          source: 'pattern',
        });
      }
    }
  }

  // Actionable pattern suggestions
  const actionablePatterns = ctx.patterns.filter(p => p.actionable && p.suggestion);
  for (const pattern of actionablePatterns.slice(0, 2)) {
    suggestions.push({
      id: `pattern-${pattern.id}`,
      type: 'reminder',
      priority: 'low',
      title: pattern.name,
      message: pattern.suggestion!,
      action: {
        type: 'dismiss',
        label: 'Got it',
      },
      createdAt: ctx.now,
      relevanceScore: pattern.confidence * 0.5,
      expiresAt: new Date(ctx.now.getTime() + 24 * 60 * 60 * 1000),
      source: 'pattern',
    });
  }

  return suggestions;
}

// ============================================================================
// MAIN SUGGESTION GENERATOR
// ============================================================================

export function generateSuggestions(ctx: SuggestionContext): Suggestion[] {
  let allSuggestions: Suggestion[] = [];

  // Generate suggestions from all sources
  allSuggestions.push(...generateTimeSuggestions(ctx));
  allSuggestions.push(...generateScheduleSuggestions(ctx));
  allSuggestions.push(...generateHealthSuggestions(ctx));
  allSuggestions.push(...generateRelationshipSuggestions(ctx));
  allSuggestions.push(...generateFinancialSuggestions(ctx));
  allSuggestions.push(...generateCollisionSuggestions(ctx));
  allSuggestions.push(...generatePatternSuggestions(ctx));

  // Filter out recently dismissed suggestions
  const recentDismissals = ctx.recentActions
    .filter(a => a.type.startsWith('dismiss-') &&
      (ctx.now.getTime() - a.timestamp.getTime()) < SUGGESTION_COOLDOWN_MINUTES * 60 * 1000
    )
    .map(a => a.type.replace('dismiss-', ''));

  allSuggestions = allSuggestions.filter(s => !recentDismissals.includes(s.id));

  // Filter expired suggestions
  allSuggestions = allSuggestions.filter(s => s.expiresAt > ctx.now);

  // Sort by relevance and priority
  allSuggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.relevanceScore - a.relevanceScore;
  });

  // Limit based on notification preference
  const limits = {
    minimal: 2,
    moderate: 4,
    frequent: MAX_SUGGESTIONS,
  };

  const limit = limits[ctx.preferences.notificationFrequency];

  return allSuggestions.slice(0, limit);
}

// ============================================================================
// SUGGESTION FILTERING
// ============================================================================

export function filterSuggestionsByContext(
  suggestions: Suggestion[],
  context: 'morning' | 'work' | 'evening' | 'weekend'
): Suggestion[] {
  return suggestions.filter(s => {
    switch (context) {
      case 'morning':
        return s.source !== 'financial' || s.priority === 'high';
      case 'work':
        return s.source !== 'relationship' || s.priority === 'high';
      case 'evening':
        return s.source !== 'schedule' || s.priority === 'high';
      case 'weekend':
        return s.priority === 'high' || s.source === 'relationship' || s.source === 'health';
      default:
        return true;
    }
  });
}

export function groupSuggestionsBySource(
  suggestions: Suggestion[]
): Record<string, Suggestion[]> {
  const groups: Record<string, Suggestion[]> = {};

  for (const suggestion of suggestions) {
    if (!groups[suggestion.source]) {
      groups[suggestion.source] = [];
    }
    groups[suggestion.source].push(suggestion);
  }

  return groups;
}
