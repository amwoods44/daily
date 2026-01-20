/**
 * Collision Detector - Predictive Conflict Detection
 *
 * Analyzes calendar, tasks, health, and financial data to detect
 * upcoming collisions and conflicts before they become problems.
 *
 * Types of collisions:
 * - Schedule conflicts (double-booked, back-to-back with no buffer)
 * - Energy/schedule mismatch (hard tasks during low energy)
 * - Financial timing (bills due when cash is low)
 * - Relationship neglect (important dates approaching)
 * - Health warnings (sleep debt + heavy schedule)
 */

import type {
  Collision,
  TemporalItem,
  Account,
  Bill,
  Person,
} from '../types';
import type { HealthMetrics } from '../mock-data';
import type { EnergyPrediction } from '../health/health-engine';

// ============================================================================
// TYPES
// ============================================================================

interface CollisionContext {
  calendar: TemporalItem[];
  tasks: TemporalItem[];
  health: HealthMetrics;
  energyPrediction: EnergyPrediction;
  accounts: Account[];
  upcomingBills: Bill[];
  relationships: Person[];
  now: Date;
}

// ScheduleBlock reserved for advanced schedule analysis
interface _ScheduleBlock {
  start: Date;
  end: Date;
  title: string;
  type: 'meeting' | 'task' | 'event' | 'focus';
  energyRequired: 'high' | 'medium' | 'low';
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Reserved for weighted collision scoring
const _COLLISION_WEIGHTS = {
  schedule_conflict: 100,
  energy_mismatch: 70,
  financial_timing: 90,
  relationship_neglect: 60,
  health_warning: 85,
  deadline_cluster: 75,
  travel_buffer: 65,
};

const LOOKAHEAD_DAYS = 7;
const MIN_BUFFER_MINUTES = 15;
const _HIGH_ENERGY_THRESHOLD = 70; // Reserved for energy-based scheduling
const LOW_ENERGY_THRESHOLD = 40;

// ============================================================================
// SCHEDULE COLLISION DETECTION
// ============================================================================

function detectScheduleCollisions(
  calendar: TemporalItem[],
  tasks: TemporalItem[],
  now: Date
): Collision[] {
  const collisions: Collision[] = [];
  const endOfLookahead = new Date(now);
  endOfLookahead.setDate(endOfLookahead.getDate() + LOOKAHEAD_DAYS);

  // Get all scheduled items in the lookahead window
  const scheduledItems = [...calendar, ...tasks]
    .filter(item => {
      if (!item.time) return false;
      const itemDate = new Date(item.time);
      return itemDate >= now && itemDate <= endOfLookahead;
    })
    .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime());

  // Check for overlaps and insufficient buffers
  for (let i = 0; i < scheduledItems.length - 1; i++) {
    const current = scheduledItems[i];
    const next = scheduledItems[i + 1];

    const currentStart = new Date(current.time!);
    const currentEnd = new Date(currentStart);
    currentEnd.setMinutes(currentEnd.getMinutes() + (current.duration || 60));

    const nextStart = new Date(next.time!);

    // Check for overlap (conflict)
    if (nextStart < currentEnd) {
      collisions.push({
        id: `conflict-${current.id}-${next.id}`,
        type: 'schedule',
        severity: 'high',
        title: 'Schedule Conflict',
        description: `"${current.title}" overlaps with "${next.title}"`,
        items: [current, next],
        detectedAt: now,
        suggestedResolution: `Reschedule one of these items to avoid the overlap.`,
        impact: {
          area: 'productivity',
          score: -25,
        },
      });
    }
    // Check for insufficient buffer
    else {
      const bufferMinutes = (nextStart.getTime() - currentEnd.getTime()) / 60000;
      if (bufferMinutes < MIN_BUFFER_MINUTES && bufferMinutes >= 0) {
        collisions.push({
          id: `buffer-${current.id}-${next.id}`,
          type: 'schedule',
          severity: 'medium',
          title: 'Back-to-Back Items',
          description: `Only ${Math.round(bufferMinutes)} min between "${current.title}" and "${next.title}"`,
          items: [current, next],
          detectedAt: now,
          suggestedResolution: `Add at least ${MIN_BUFFER_MINUTES} minutes buffer between these items.`,
          impact: {
            area: 'wellbeing',
            score: -10,
          },
        });
      }
    }
  }

  return collisions;
}

// ============================================================================
// ENERGY-SCHEDULE MISMATCH DETECTION
// ============================================================================

function detectEnergyMismatches(
  calendar: TemporalItem[],
  tasks: TemporalItem[],
  energyPrediction: EnergyPrediction,
  now: Date
): Collision[] {
  const collisions: Collision[] = [];

  // Get items scheduled for specific times
  const scheduledItems = [...calendar, ...tasks].filter(item => item.time);

  for (const item of scheduledItems) {
    const itemDate = new Date(item.time!);
    if (itemDate < now) continue;

    const itemHour = itemDate.getHours();
    const energyAtTime = energyPrediction.hourlyPredictions?.find(
      (p: { hour: number; level: number }) => p.hour === itemHour
    );

    if (!energyAtTime) continue;

    // Detect high-energy tasks during low energy times
    const isHighEnergyTask = item.priority === 'high' ||
      item.title.toLowerCase().includes('important') ||
      item.title.toLowerCase().includes('presentation') ||
      item.title.toLowerCase().includes('meeting');

    if (isHighEnergyTask && energyAtTime.level < LOW_ENERGY_THRESHOLD) {
      collisions.push({
        id: `energy-${item.id}`,
        type: 'energy',
        severity: 'medium',
        title: 'Energy Mismatch',
        description: `"${item.title}" is scheduled during your predicted energy dip`,
        items: [item],
        detectedAt: now,
        suggestedResolution: `Consider moving this to around ${energyPrediction.peakTime}:00 when your energy peaks.`,
        impact: {
          area: 'productivity',
          score: -15,
        },
      });
    }
  }

  return collisions;
}

// ============================================================================
// FINANCIAL TIMING DETECTION
// ============================================================================

function detectFinancialCollisions(
  accounts: Account[],
  upcomingBills: Bill[],
  now: Date
): Collision[] {
  const collisions: Collision[] = [];

  // Calculate available cash
  const checkingAccounts = accounts.filter(a => a.type === 'checking');
  const availableCash = checkingAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Sort bills by due date
  const sortedBills = [...upcomingBills].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Simulate cash flow
  let projectedCash = availableCash;
  const upcomingDays = 14;

  for (const bill of sortedBills) {
    const dueDate = new Date(bill.dueDate);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue > upcomingDays) continue;

    projectedCash -= bill.amount;

    if (projectedCash < 0) {
      collisions.push({
        id: `cash-${bill.id}`,
        type: 'financial',
        severity: 'high',
        title: 'Insufficient Funds Risk',
        description: `${bill.name} ($${bill.amount}) due in ${daysUntilDue} days may cause overdraft`,
        items: [],
        detectedAt: now,
        suggestedResolution: `Transfer $${Math.abs(projectedCash).toFixed(2)} to checking before ${dueDate.toLocaleDateString()}.`,
        impact: {
          area: 'financial',
          score: -30,
        },
      });
    } else if (projectedCash < 500) {
      collisions.push({
        id: `low-cash-${bill.id}`,
        type: 'financial',
        severity: 'medium',
        title: 'Low Balance Warning',
        description: `After ${bill.name}, balance will be $${projectedCash.toFixed(2)}`,
        items: [],
        detectedAt: now,
        suggestedResolution: `Consider reducing discretionary spending this week.`,
        impact: {
          area: 'financial',
          score: -15,
        },
      });
    }
  }

  // Check for bill clusters
  const billsThisWeek = sortedBills.filter(bill => {
    const daysUntilDue = Math.ceil(
      (new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 7;
  });

  if (billsThisWeek.length >= 3) {
    const totalDue = billsThisWeek.reduce((sum, b) => sum + b.amount, 0);
    collisions.push({
      id: 'bill-cluster',
      type: 'financial',
      severity: 'low',
      title: 'Multiple Bills Due',
      description: `${billsThisWeek.length} bills totaling $${totalDue.toFixed(2)} due this week`,
      items: [],
      detectedAt: now,
      suggestedResolution: `Ensure $${totalDue.toFixed(2)} is available in your checking account.`,
      impact: {
        area: 'financial',
        score: -10,
      },
    });
  }

  return collisions;
}

// ============================================================================
// RELATIONSHIP TIMING DETECTION
// ============================================================================

function detectRelationshipCollisions(
  relationships: Person[],
  calendar: TemporalItem[],
  now: Date
): Collision[] {
  const collisions: Collision[] = [];

  for (const person of relationships) {
    // Check for upcoming birthdays
    if (person.birthday) {
      const birthday = new Date(person.birthday);
      const thisYearBirthday = new Date(
        now.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      // If birthday has passed this year, check next year
      if (thisYearBirthday < now) {
        thisYearBirthday.setFullYear(thisYearBirthday.getFullYear() + 1);
      }

      const daysUntilBirthday = Math.ceil(
        (thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilBirthday <= 7 && daysUntilBirthday > 0) {
        collisions.push({
          id: `birthday-${person.id}`,
          type: 'relationship',
          severity: daysUntilBirthday <= 2 ? 'high' : 'medium',
          title: 'Birthday Coming Up',
          description: `${person.name}'s birthday is in ${daysUntilBirthday} days`,
          items: [],
          detectedAt: now,
          suggestedResolution: daysUntilBirthday <= 2
            ? `Send a birthday message to ${person.name} now or set a reminder.`
            : `Plan something special for ${person.name}'s birthday.`,
          impact: {
            area: 'relationships',
            score: daysUntilBirthday <= 2 ? -20 : -10,
          },
        });
      }
    }

    // Check for relationship neglect
    if (person.lastContact) {
      const lastContact = new Date(person.lastContact);
      const daysSinceContact = Math.floor(
        (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
      );

      const thresholds: Record<string, number> = {
        family: 14,
        close_friend: 21,
        friend: 30,
        colleague: 45,
        acquaintance: 90,
      };

      const threshold = thresholds[person.relationship || 'friend'] || 30;

      if (daysSinceContact > threshold) {
        collisions.push({
          id: `neglect-${person.id}`,
          type: 'relationship',
          severity: daysSinceContact > threshold * 2 ? 'high' : 'medium',
          title: 'Relationship Needs Attention',
          description: `Haven't connected with ${person.name} in ${daysSinceContact} days`,
          items: [],
          detectedAt: now,
          suggestedResolution: `Reach out to ${person.name} - a quick message goes a long way.`,
          impact: {
            area: 'relationships',
            score: -15,
          },
        });
      }
    }
  }

  return collisions;
}

// ============================================================================
// HEALTH-SCHEDULE COLLISION DETECTION
// ============================================================================

function detectHealthCollisions(
  health: HealthMetrics,
  calendar: TemporalItem[],
  now: Date
): Collision[] {
  const collisions: Collision[] = [];

  // Check for sleep debt + heavy schedule
  const sleepDeficit = 8 - health.sleep.hours; // Assuming 8 hours is optimal

  if (sleepDeficit > 1) {
    // Count meetings/events in next 24 hours
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const itemsNext24h = calendar.filter(item => {
      if (!item.time) return false;
      const itemDate = new Date(item.time);
      return itemDate >= now && itemDate <= tomorrow;
    });

    if (itemsNext24h.length >= 5) {
      collisions.push({
        id: 'sleep-schedule',
        type: 'health',
        severity: 'high',
        title: 'Burnout Risk',
        description: `${sleepDeficit.toFixed(1)}h sleep debt with ${itemsNext24h.length} items scheduled today`,
        items: itemsNext24h.slice(0, 3),
        detectedAt: now,
        suggestedResolution: `Consider rescheduling non-essential items and prioritizing rest tonight.`,
        impact: {
          area: 'wellbeing',
          score: -25,
        },
      });
    }
  }

  // Check for low HRV + demanding schedule
  if (health.hrv < 40) {
    collisions.push({
      id: 'hrv-warning',
      type: 'health',
      severity: 'medium',
      title: 'Recovery Needed',
      description: `HRV of ${health.hrv} indicates your body needs recovery time`,
      items: [],
      detectedAt: now,
      suggestedResolution: `Avoid intense activities today. Light exercise and early sleep recommended.`,
      impact: {
        area: 'wellbeing',
        score: -15,
      },
    });
  }

  // Check for hydration
  if (health.waterGlasses < health.waterGoal * 0.5) {
    const hourOfDay = now.getHours();
    if (hourOfDay >= 14) {
      collisions.push({
        id: 'hydration-warning',
        type: 'health',
        severity: 'low',
        title: 'Hydration Alert',
        description: `Only ${health.waterGlasses}/${health.waterGoal} glasses today - may affect energy`,
        items: [],
        detectedAt: now,
        suggestedResolution: `Drink ${health.waterGoal - health.waterGlasses} more glasses before end of day.`,
        impact: {
          area: 'wellbeing',
          score: -5,
        },
      });
    }
  }

  return collisions;
}

// ============================================================================
// DEADLINE CLUSTER DETECTION
// ============================================================================

function detectDeadlineClusters(
  tasks: TemporalItem[],
  now: Date
): Collision[] {
  const collisions: Collision[] = [];

  // Group tasks by due date
  const tasksByDate = new Map<string, TemporalItem[]>();

  for (const task of tasks) {
    if (!task.deadline) continue;
    const deadline = new Date(task.deadline);
    if (deadline < now) continue;

    const dateKey = deadline.toISOString().split('T')[0];
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, []);
    }
    tasksByDate.get(dateKey)!.push(task);
  }

  // Check for days with multiple deadlines
  for (const [dateKey, tasks] of tasksByDate) {
    if (tasks.length >= 3) {
      const deadline = new Date(dateKey);
      const daysUntil = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const highPriorityTasks = tasks.filter(t => t.priority === 'high');

      collisions.push({
        id: `deadline-cluster-${dateKey}`,
        type: 'deadline',
        severity: highPriorityTasks.length >= 2 ? 'high' : 'medium',
        title: 'Deadline Cluster',
        description: `${tasks.length} items due on ${deadline.toLocaleDateString()}${highPriorityTasks.length ? ` (${highPriorityTasks.length} high priority)` : ''}`,
        items: tasks,
        detectedAt: now,
        suggestedResolution: daysUntil <= 2
          ? `Start working on these immediately to avoid last-minute rush.`
          : `Spread work over the next ${daysUntil} days to avoid cramming.`,
        impact: {
          area: 'productivity',
          score: -20,
        },
      });
    }
  }

  return collisions;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

export function detectCollisions(context: CollisionContext): Collision[] {
  const allCollisions: Collision[] = [];

  // Run all detection functions
  allCollisions.push(
    ...detectScheduleCollisions(context.calendar, context.tasks, context.now)
  );

  allCollisions.push(
    ...detectEnergyMismatches(
      context.calendar,
      context.tasks,
      context.energyPrediction,
      context.now
    )
  );

  allCollisions.push(
    ...detectFinancialCollisions(
      context.accounts,
      context.upcomingBills,
      context.now
    )
  );

  allCollisions.push(
    ...detectRelationshipCollisions(
      context.relationships,
      context.calendar,
      context.now
    )
  );

  allCollisions.push(
    ...detectHealthCollisions(context.health, context.calendar, context.now)
  );

  allCollisions.push(
    ...detectDeadlineClusters(context.tasks, context.now)
  );

  // Sort by severity and impact
  return allCollisions.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    return Math.abs(b.impact.score) - Math.abs(a.impact.score);
  });
}

// ============================================================================
// COLLISION RESOLUTION HELPERS
// ============================================================================

export function categorizeCollisions(
  collisions: Collision[]
): Record<string, Collision[]> {
  const categories: Record<string, Collision[]> = {
    schedule: [],
    energy: [],
    financial: [],
    relationship: [],
    health: [],
    deadline: [],
  };

  for (const collision of collisions) {
    if (categories[collision.type]) {
      categories[collision.type].push(collision);
    }
  }

  return categories;
}

export function calculateCollisionImpact(collisions: Collision[]): {
  totalImpact: number;
  byArea: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  const byArea: Record<string, number> = {
    productivity: 0,
    financial: 0,
    wellbeing: 0,
    relationships: 0,
  };

  let totalImpact = 0;

  for (const collision of collisions) {
    totalImpact += Math.abs(collision.impact.score);
    byArea[collision.impact.area] += Math.abs(collision.impact.score);
  }

  const riskLevel =
    totalImpact >= 100 ? 'critical' :
    totalImpact >= 60 ? 'high' :
    totalImpact >= 30 ? 'medium' : 'low';

  return { totalImpact, byArea, riskLevel };
}

export function prioritizeResolutions(
  collisions: Collision[]
): { collision: Collision; urgency: number; effort: 'low' | 'medium' | 'high' }[] {
  return collisions.map(collision => {
    // Calculate urgency based on severity and timing
    let urgency = collision.severity === 'high' ? 100 :
                  collision.severity === 'medium' ? 60 : 30;

    // Financial and schedule conflicts are more urgent
    if (collision.type === 'financial' || collision.type === 'schedule') {
      urgency += 20;
    }

    // Estimate effort based on resolution type
    const effort: 'low' | 'medium' | 'high' =
      collision.type === 'health' || collision.type === 'relationship' ? 'low' :
      collision.type === 'energy' ? 'medium' : 'high';

    return { collision, urgency, effort };
  }).sort((a, b) => {
    // Prioritize high urgency, low effort items
    const aScore = a.urgency - (a.effort === 'high' ? 30 : a.effort === 'medium' ? 15 : 0);
    const bScore = b.urgency - (b.effort === 'high' ? 30 : b.effort === 'medium' ? 15 : 0);
    return bScore - aScore;
  });
}
