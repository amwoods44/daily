/**
 * Relationship Engine
 *
 * Core logic for relationship intelligence:
 * - Track communication patterns
 * - Calculate relationship health scores
 * - Generate nudges when relationships need attention
 * - Detect communication drift
 */

import type {
  RelationshipType,
  CommunicationChannel,
  Nudge,
} from '../types';
import type { Relationship, PersonWaiting } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface RelationshipHealth {
  personId: string;
  personName: string;
  score: number; // 0-100
  status: 'thriving' | 'healthy' | 'needs_attention' | 'at_risk' | 'critical';
  daysSinceContact: number;
  targetFrequency: number;
  overdueBy: number; // days overdue, 0 if not overdue
  trend: 'improving' | 'stable' | 'declining';
  nextAction?: string;
  urgency: 'high' | 'medium' | 'low' | 'none';
}

export interface CommunicationEvent {
  id: string;
  personId: string;
  channel: CommunicationChannel;
  direction: 'sent' | 'received';
  timestamp: string;
  responseTime?: number; // minutes to respond
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface RelationshipInsight {
  type: 'pattern' | 'milestone' | 'warning' | 'suggestion';
  title: string;
  description: string;
  personId?: string;
  personName?: string;
  actionable: boolean;
  action?: {
    label: string;
    handler: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Default contact frequency by relationship type (in days)
// Reserved for customizable frequency thresholds
const _DEFAULT_FREQUENCY: Record<RelationshipType, number> = {
  partner: 1,
  family: 7,
  close_friend: 14,
  friend: 30,
  colleague: 30,
  acquaintance: 90,
};

// Importance multipliers for scoring
// Reserved for weighted relationship calculations
const _IMPORTANCE_MULTIPLIER: Record<number, number> = {
  1: 0.5,
  2: 0.75,
  3: 1.0,
  4: 1.25,
  5: 1.5,
};

// Status thresholds (as percentage of target frequency)
const STATUS_THRESHOLDS = {
  thriving: 0.5, // Within 50% of target
  healthy: 1.0, // At target
  needs_attention: 1.5, // 50% overdue
  at_risk: 2.0, // 100% overdue
  critical: 3.0, // 200% overdue
};

// ============================================================================
// HEALTH CALCULATION
// ============================================================================

/**
 * Calculate relationship health score for a person
 */
export function calculateRelationshipHealth(relationship: Relationship): RelationshipHealth {
  const {
    id,
    name,
    daysSinceContact,
    targetFrequencyDays,
    type,
  } = relationship;

  // Calculate how overdue the relationship is
  const overdueBy = Math.max(0, daysSinceContact - targetFrequencyDays);
  const overdueRatio = daysSinceContact / targetFrequencyDays;

  // Determine status based on overdue ratio
  let status: RelationshipHealth['status'];
  if (overdueRatio <= STATUS_THRESHOLDS.thriving) {
    status = 'thriving';
  } else if (overdueRatio <= STATUS_THRESHOLDS.healthy) {
    status = 'healthy';
  } else if (overdueRatio <= STATUS_THRESHOLDS.needs_attention) {
    status = 'needs_attention';
  } else if (overdueRatio <= STATUS_THRESHOLDS.at_risk) {
    status = 'at_risk';
  } else {
    status = 'critical';
  }

  // Calculate base score (100 = just contacted, decreases over time)
  let score = Math.max(0, 100 - (overdueRatio * 30));

  // Adjust for relationship type (family relationships are weighted higher)
  if (type === 'family') {
    score = score * 0.9; // Family gets stricter scoring
  }

  // Determine urgency
  let urgency: RelationshipHealth['urgency'] = 'none';
  if (status === 'critical') {
    urgency = 'high';
  } else if (status === 'at_risk') {
    urgency = 'medium';
  } else if (status === 'needs_attention') {
    urgency = 'low';
  }

  // Generate next action suggestion
  let nextAction: string | undefined;
  if (overdueBy > 0) {
    if (overdueBy > targetFrequencyDays) {
      nextAction = `It's been ${daysSinceContact} days. A quick check-in would mean a lot.`;
    } else {
      nextAction = `Consider reaching out in the next few days.`;
    }
  }

  return {
    personId: id,
    personName: name,
    score: Math.round(score),
    status,
    daysSinceContact,
    targetFrequency: targetFrequencyDays,
    overdueBy,
    trend: 'stable', // Would need historical data to calculate
    nextAction,
    urgency,
  };
}

/**
 * Calculate overall relationship health across all relationships
 */
export function calculateOverallRelationshipHealth(
  relationships: Relationship[]
): {
  score: number;
  healthyCount: number;
  atRiskCount: number;
  criticalCount: number;
  topPriorities: RelationshipHealth[];
} {
  const healths = relationships.map(calculateRelationshipHealth);

  // Calculate weighted average score
  const totalScore = healths.reduce((sum, h) => sum + h.score, 0);
  const avgScore = healths.length > 0 ? totalScore / healths.length : 100;

  // Count by status
  const healthyCount = healths.filter(
    (h) => h.status === 'thriving' || h.status === 'healthy'
  ).length;
  const atRiskCount = healths.filter((h) => h.status === 'at_risk').length;
  const criticalCount = healths.filter((h) => h.status === 'critical').length;

  // Get top priorities (sorted by urgency and overdue amount)
  const topPriorities = healths
    .filter((h) => h.urgency !== 'none')
    .sort((a, b) => {
      // Sort by urgency first, then by overdue days
      const urgencyOrder = { high: 0, medium: 1, low: 2, none: 3 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return b.overdueBy - a.overdueBy;
    })
    .slice(0, 5);

  return {
    score: Math.round(avgScore),
    healthyCount,
    atRiskCount,
    criticalCount,
    topPriorities,
  };
}

// ============================================================================
// NUDGE GENERATION
// ============================================================================

/**
 * Generate relationship nudges based on current state
 */
export function generateRelationshipNudges(
  relationships: Relationship[],
  peopleWaiting?: PersonWaiting[]
): Nudge[] {
  const nudges: Nudge[] = [];
  const now = new Date();

  // Check for upcoming birthdays
  relationships.forEach((rel) => {
    if (rel.birthday) {
      const [month, day] = rel.birthday.split('-').map(Number);
      const birthday = new Date(now.getFullYear(), month - 1, day);

      // Handle year wrap-around
      if (birthday < now) {
        birthday.setFullYear(now.getFullYear() + 1);
      }

      const daysUntil = Math.ceil(
        (birthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil === 0) {
        nudges.push({
          id: `birthday-${rel.id}`,
          type: 'reminder',
          priority: 'high',
          title: `${rel.name}'s birthday is today! 🎂`,
          description: 'Don\'t forget to wish them a happy birthday.',
          category: 'relationships',
          color: 'purple',
          action: {
            id: 'send',
            label: 'Send message',
            variant: 'primary',
            handler: 'send_birthday_message',
          },
        });
      } else if (daysUntil === 1) {
        nudges.push({
          id: `birthday-${rel.id}`,
          type: 'reminder',
          priority: 'medium',
          title: `${rel.name}'s birthday is tomorrow`,
          description: 'Maybe plan something special?',
          category: 'relationships',
          color: 'blue',
          action: {
            id: 'remind',
            label: 'Set reminder',
            variant: 'secondary',
            handler: 'set_birthday_reminder',
          },
        });
      } else if (daysUntil <= 7) {
        nudges.push({
          id: `birthday-${rel.id}`,
          type: 'reminder',
          priority: 'low',
          title: `${rel.name}'s birthday in ${daysUntil} days`,
          description: rel.daysSinceContact > rel.targetFrequencyDays
            ? `You haven't talked in ${rel.daysSinceContact} days - good excuse to reconnect.`
            : 'Consider planning something.',
          category: 'relationships',
          color: 'blue',
        });
      }
    }
  });

  // Check for critical relationships
  relationships.forEach((rel) => {
    const health = calculateRelationshipHealth(rel);

    if (health.status === 'critical' && rel.type === 'family') {
      nudges.push({
        id: `critical-${rel.id}`,
        type: 'warning',
        priority: 'high',
        title: `Hasn't spoken to ${rel.name} in ${rel.daysSinceContact} days`,
        description: 'Family relationships need nurturing. A quick call?',
        category: 'relationships',
        color: 'orange',
        action: {
          id: 'call',
          label: 'Call now',
          variant: 'primary',
          handler: 'call_contact',
        },
      });
    } else if (health.status === 'at_risk') {
      nudges.push({
        id: `at-risk-${rel.id}`,
        type: 'suggestion',
        priority: 'medium',
        title: `Time to reconnect with ${rel.name}`,
        description: `It's been ${rel.daysSinceContact} days. ${rel.notes || 'A quick message would be nice.'}`,
        category: 'relationships',
        color: 'yellow',
        action: {
          id: 'message',
          label: 'Send message',
          variant: 'secondary',
          handler: 'send_message',
        },
      });
    }
  });

  // Check for people waiting too long
  if (peopleWaiting) {
    peopleWaiting.forEach((person) => {
      if (person.daysWaiting >= 3) {
        nudges.push({
          id: `waiting-${person.id}`,
          type: 'warning',
          priority: 'high',
          title: `${person.name} waiting ${Math.floor(person.daysWaiting)} days`,
          description: person.relationshipNote || person.context,
          category: 'relationships',
          color: 'red',
          action: {
            id: 'reply',
            label: 'Reply now',
            variant: 'primary',
            handler: 'quick_reply',
          },
        });
      }
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return nudges;
}

// ============================================================================
// INSIGHTS
// ============================================================================

/**
 * Generate relationship insights based on patterns
 */
export function generateRelationshipInsights(
  relationships: Relationship[],
  _communications?: CommunicationEvent[]
): RelationshipInsight[] {
  const insights: RelationshipInsight[] = [];

  // Find relationships that have improved
  const healthyRelationships = relationships.filter((r) => {
    const health = calculateRelationshipHealth(r);
    return health.status === 'thriving';
  });

  if (healthyRelationships.length > 0) {
    insights.push({
      type: 'milestone',
      title: `${healthyRelationships.length} relationships thriving`,
      description: `You're staying connected with ${healthyRelationships.map((r) => r.name).slice(0, 3).join(', ')}${healthyRelationships.length > 3 ? ' and others' : ''}.`,
      actionable: false,
    });
  }

  // Find relationships that need attention
  const needsAttention = relationships.filter((r) => {
    const health = calculateRelationshipHealth(r);
    return health.status === 'needs_attention' || health.status === 'at_risk';
  });

  if (needsAttention.length >= 3) {
    insights.push({
      type: 'warning',
      title: `${needsAttention.length} relationships drifting`,
      description: 'Consider scheduling some catch-up calls this week.',
      actionable: true,
      action: {
        label: 'View all',
        handler: 'view_relationships',
      },
    });
  }

  // Suggest batch contact if multiple people overdue
  const familyOverdue = relationships.filter(
    (r) => r.type === 'family' && r.daysSinceContact > r.targetFrequencyDays
  );

  if (familyOverdue.length >= 2) {
    insights.push({
      type: 'suggestion',
      title: 'Family check-in day?',
      description: `${familyOverdue.map((r) => r.name).join(' and ')} could use a call. Maybe do them back-to-back?`,
      actionable: true,
      action: {
        label: 'Schedule calls',
        handler: 'schedule_family_calls',
      },
    });
  }

  return insights;
}

// ============================================================================
// COMMUNICATION TRACKING
// ============================================================================

/**
 * Record a communication event
 */
export function recordCommunication(
  personId: string,
  channel: CommunicationChannel,
  direction: 'sent' | 'received'
): CommunicationEvent {
  return {
    id: `comm-${Date.now()}`,
    personId,
    channel,
    direction,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get suggested channel for contacting a person
 */
export function getSuggestedChannel(
  relationship: Relationship,
  recentCommunications?: CommunicationEvent[]
): CommunicationChannel {
  // Check if there's a pattern in recent communications
  if (recentCommunications && recentCommunications.length > 0) {
    const channelCounts: Record<string, number> = {};
    recentCommunications.forEach((c) => {
      channelCounts[c.channel] = (channelCounts[c.channel] || 0) + 1;
    });

    const mostUsed = Object.entries(channelCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (mostUsed) {
      return mostUsed[0] as CommunicationChannel;
    }
  }

  // Default suggestions by relationship type
  switch (relationship.type) {
    case 'family':
      return 'call';
    case 'romantic':
      return 'text';
    case 'friend':
      return 'text';
    case 'professional':
      return 'email';
    default:
      return 'email';
  }
}

// ============================================================================
// PRIORITY CALCULATION
// ============================================================================

/**
 * Get people to contact today, prioritized
 */
export function getTodaysPriorities(
  relationships: Relationship[],
  maxCount: number = 3
): Relationship[] {
  return relationships
    .map((r) => ({
      ...r,
      health: calculateRelationshipHealth(r),
    }))
    .filter((r) => r.health.urgency !== 'none')
    .sort((a, b) => {
      // Sort by urgency, then by overdue days
      const urgencyOrder = { high: 0, medium: 1, low: 2, none: 3 };
      if (urgencyOrder[a.health.urgency] !== urgencyOrder[b.health.urgency]) {
        return urgencyOrder[a.health.urgency] - urgencyOrder[b.health.urgency];
      }
      return b.health.overdueBy - a.health.overdueBy;
    })
    .slice(0, maxCount)
    .map(({ health: _health, ...r }) => r);
}
