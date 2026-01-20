/**
 * Burnout Detector
 *
 * Monitors patterns that indicate burnout risk:
 * - Declining sleep quality over time
 * - Increasing meeting load
 * - Decreasing social activity
 * - Response time changes
 * - Spending pattern changes (comfort eating, retail therapy)
 *
 * Provides early warnings and intervention suggestions.
 */

import type { HealthSnapshot, Nudge, Prediction } from '../types';
import type { HealthMetrics, Meeting, Relationship, FinanceOverview } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface BurnoutAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  signals: BurnoutSignal[];
  recommendations: string[];
  interventions: Intervention[];
}

export interface BurnoutSignal {
  category: 'sleep' | 'work' | 'social' | 'financial' | 'health';
  indicator: string;
  severity: 'warning' | 'concerning' | 'critical';
  value: string;
  baseline?: string;
  trend: 'worsening' | 'stable' | 'improving';
}

export interface Intervention {
  id: string;
  type: 'immediate' | 'short_term' | 'lifestyle';
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    handler: string;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const THRESHOLDS = {
  // Sleep
  minSleepHours: 6,
  sleepDeclineThreshold: -15, // % decline that's concerning
  sleepDeficitDays: 4, // Days of poor sleep before warning

  // Work
  maxMeetingHoursPerWeek: 25,
  maxConsecutiveMeetingDays: 5,
  lateMeetingHour: 18, // 6 PM

  // Social
  maxDaysWithoutSocialContact: 7,
  minSocialEventsPerWeek: 1,

  // Financial (stress indicators)
  comfortSpendingIncrease: 30, // % increase in food/entertainment
};

// ============================================================================
// SIGNAL DETECTION
// ============================================================================

/**
 * Detect sleep-related burnout signals
 */
function detectSleepSignals(
  currentHealth: HealthMetrics,
  historicalData?: HealthSnapshot[]
): BurnoutSignal[] {
  const signals: BurnoutSignal[] = [];

  // Check current sleep
  if (currentHealth.sleep.hours < THRESHOLDS.minSleepHours) {
    signals.push({
      category: 'sleep',
      indicator: 'Low sleep last night',
      severity: currentHealth.sleep.hours < 5 ? 'critical' : 'warning',
      value: `${currentHealth.sleep.hours.toFixed(1)} hours`,
      baseline: '7-8 hours recommended',
      trend: 'worsening',
    });
  }

  // Check historical trend
  if (historicalData && historicalData.length >= 7) {
    const recentSleep = historicalData.slice(-7);
    const avgSleep = recentSleep.reduce((sum, d) => sum + d.sleep.hours, 0) / 7;

    if (avgSleep < THRESHOLDS.minSleepHours) {
      signals.push({
        category: 'sleep',
        indicator: 'Sleep deficit building',
        severity: 'concerning',
        value: `${avgSleep.toFixed(1)}h average this week`,
        baseline: '7-8 hours recommended',
        trend: 'worsening',
      });
    }

    // Count days of poor sleep
    const poorSleepDays = recentSleep.filter((d) => d.sleep.hours < 6).length;
    if (poorSleepDays >= THRESHOLDS.sleepDeficitDays) {
      signals.push({
        category: 'sleep',
        indicator: 'Consecutive poor sleep nights',
        severity: poorSleepDays >= 5 ? 'critical' : 'concerning',
        value: `${poorSleepDays} nights below 6 hours`,
        trend: 'worsening',
      });
    }
  }

  return signals;
}

/**
 * Detect work-related burnout signals
 */
function detectWorkSignals(meetings: Meeting[]): BurnoutSignal[] {
  const signals: BurnoutSignal[] = [];

  // Calculate total meeting hours
  let totalMeetingMinutes = 0;
  let lateMeetingCount = 0;

  meetings.forEach((meeting) => {
    const [startH, startM] = meeting.start.split(':').map(Number);
    const [endH, endM] = meeting.end.split(':').map(Number);
    totalMeetingMinutes += (endH * 60 + endM) - (startH * 60 + startM);

    if (startH >= THRESHOLDS.lateMeetingHour || endH >= THRESHOLDS.lateMeetingHour) {
      lateMeetingCount++;
    }
  });

  const meetingHours = totalMeetingMinutes / 60;

  // High meeting load (extrapolate to week)
  const estimatedWeeklyHours = meetingHours * 5; // Rough estimate
  if (estimatedWeeklyHours > THRESHOLDS.maxMeetingHoursPerWeek) {
    signals.push({
      category: 'work',
      indicator: 'High meeting load',
      severity: estimatedWeeklyHours > 30 ? 'concerning' : 'warning',
      value: `~${Math.round(estimatedWeeklyHours)}h of meetings this week`,
      baseline: `${THRESHOLDS.maxMeetingHoursPerWeek}h recommended max`,
      trend: 'stable',
    });
  }

  // Late meetings
  if (lateMeetingCount >= 2) {
    signals.push({
      category: 'work',
      indicator: 'Late meetings affecting recovery',
      severity: 'warning',
      value: `${lateMeetingCount} meetings after 6pm today`,
      trend: 'stable',
    });
  }

  // No breaks between meetings
  const hasBackToBack = meetings.length >= 3; // Simplified check
  if (hasBackToBack) {
    signals.push({
      category: 'work',
      indicator: 'Back-to-back meetings',
      severity: 'warning',
      value: 'No buffer time detected',
      baseline: '15-min breaks recommended',
      trend: 'stable',
    });
  }

  return signals;
}

/**
 * Detect social isolation signals
 */
function detectSocialSignals(relationships: Relationship[]): BurnoutSignal[] {
  const signals: BurnoutSignal[] = [];

  // Find friends and family not contacted recently
  const closeRelationships = relationships.filter(
    (r) => r.type === 'family' || r.type === 'friend'
  );

  const neglectedCount = closeRelationships.filter(
    (r) => r.daysSinceContact > r.targetFrequencyDays * 1.5
  ).length;

  if (neglectedCount >= 3) {
    signals.push({
      category: 'social',
      indicator: 'Social connections declining',
      severity: 'concerning',
      value: `${neglectedCount} close relationships overdue`,
      trend: 'worsening',
    });
  }

  // Check for any recent social contact
  const recentSocialContact = closeRelationships.some((r) => r.daysSinceContact <= 3);
  if (!recentSocialContact && closeRelationships.length > 0) {
    signals.push({
      category: 'social',
      indicator: 'Low social contact',
      severity: 'warning',
      value: 'No close contact in 3+ days',
      baseline: 'Regular social contact reduces burnout',
      trend: 'stable',
    });
  }

  return signals;
}

/**
 * Detect financial stress signals
 */
function detectFinancialSignals(finance: FinanceOverview): BurnoutSignal[] {
  const signals: BurnoutSignal[] = [];

  // Check for overspending (comfort spending)
  const spendingRatio = finance.monthlySpent / finance.monthlyBudget;
  if (spendingRatio > 1.2) {
    signals.push({
      category: 'financial',
      indicator: 'Overspending this month',
      severity: spendingRatio > 1.5 ? 'concerning' : 'warning',
      value: `${Math.round((spendingRatio - 1) * 100)}% over budget`,
      baseline: 'May indicate stress spending',
      trend: 'worsening',
    });
  }

  // Low checking balance can be stressful
  if (finance.checking < 500) {
    signals.push({
      category: 'financial',
      indicator: 'Low account balance',
      severity: 'warning',
      value: `$${finance.checking.toFixed(0)} in checking`,
      baseline: 'Financial stress impacts wellbeing',
      trend: 'stable',
    });
  }

  return signals;
}

// ============================================================================
// BURNOUT ASSESSMENT
// ============================================================================

/**
 * Comprehensive burnout assessment
 */
export function assessBurnout(
  health: HealthMetrics,
  meetings: Meeting[],
  relationships: Relationship[],
  finance: FinanceOverview,
  historicalHealth?: HealthSnapshot[]
): BurnoutAssessment {
  const allSignals: BurnoutSignal[] = [
    ...detectSleepSignals(health, historicalHealth),
    ...detectWorkSignals(meetings),
    ...detectSocialSignals(relationships),
    ...detectFinancialSignals(finance),
  ];

  // Calculate risk score based on signals
  let riskScore = 0;

  allSignals.forEach((signal) => {
    switch (signal.severity) {
      case 'critical':
        riskScore += 30;
        break;
      case 'concerning':
        riskScore += 20;
        break;
      case 'warning':
        riskScore += 10;
        break;
    }
  });

  // Cap at 100
  riskScore = Math.min(100, riskScore);

  // Determine overall risk level
  let overallRisk: BurnoutAssessment['overallRisk'];
  if (riskScore >= 70) overallRisk = 'critical';
  else if (riskScore >= 50) overallRisk = 'high';
  else if (riskScore >= 30) overallRisk = 'medium';
  else overallRisk = 'low';

  // Generate recommendations
  const recommendations = generateRecommendations(allSignals, overallRisk);

  // Generate interventions
  const interventions = generateInterventions(allSignals, overallRisk);

  return {
    overallRisk,
    riskScore,
    signals: allSignals,
    recommendations,
    interventions,
  };
}

// ============================================================================
// RECOMMENDATIONS & INTERVENTIONS
// ============================================================================

function generateRecommendations(
  signals: BurnoutSignal[],
  riskLevel: BurnoutAssessment['overallRisk']
): string[] {
  const recommendations: string[] = [];

  // Sleep-based recommendations
  const sleepSignals = signals.filter((s) => s.category === 'sleep');
  if (sleepSignals.length > 0) {
    recommendations.push('Prioritize getting 7-8 hours of sleep tonight.');
    if (sleepSignals.some((s) => s.severity === 'critical')) {
      recommendations.push('Consider canceling non-essential morning commitments.');
    }
  }

  // Work-based recommendations
  const workSignals = signals.filter((s) => s.category === 'work');
  if (workSignals.length > 0) {
    recommendations.push('Block 30 minutes tomorrow for a break or walk.');
    if (workSignals.some((s) => s.indicator.includes('Late meetings'))) {
      recommendations.push('Try to end work by 6pm this week.');
    }
  }

  // Social recommendations
  const socialSignals = signals.filter((s) => s.category === 'social');
  if (socialSignals.length > 0) {
    recommendations.push('Reach out to a friend or family member this week.');
  }

  // General high-risk recommendations
  if (riskLevel === 'high' || riskLevel === 'critical') {
    recommendations.push('Consider taking a mental health day if possible.');
    recommendations.push('Talk to someone you trust about how you\'re feeling.');
  }

  return recommendations.slice(0, 5); // Limit to 5
}

function generateInterventions(
  signals: BurnoutSignal[],
  riskLevel: BurnoutAssessment['overallRisk']
): Intervention[] {
  const interventions: Intervention[] = [];

  // Immediate interventions
  if (signals.some((s) => s.category === 'sleep' && s.severity !== 'warning')) {
    interventions.push({
      id: 'early-bedtime',
      type: 'immediate',
      title: 'Get to bed by 10pm tonight',
      description: 'Sleep is the foundation of recovery. One good night can help.',
      effort: 'low',
      impact: 'high',
      action: {
        label: 'Set reminder',
        handler: 'set_bedtime_reminder',
      },
    });
  }

  if (signals.some((s) => s.indicator.includes('Back-to-back'))) {
    interventions.push({
      id: 'add-breaks',
      type: 'immediate',
      title: 'Add 15-min buffers between meetings',
      description: 'Short breaks prevent cognitive fatigue.',
      effort: 'low',
      impact: 'medium',
      action: {
        label: 'Auto-add buffers',
        handler: 'add_meeting_buffers',
      },
    });
  }

  // Short-term interventions
  interventions.push({
    id: 'social-reconnect',
    type: 'short_term',
    title: 'Schedule a catch-up call',
    description: 'Social connection is protective against burnout.',
    effort: 'low',
    impact: 'medium',
    action: {
      label: 'Pick someone',
      handler: 'show_neglected_relationships',
    },
  });

  if (riskLevel === 'high' || riskLevel === 'critical') {
    interventions.push({
      id: 'block-recovery',
      type: 'short_term',
      title: 'Block a recovery afternoon',
      description: 'Clear your calendar for rest and personal time.',
      effort: 'medium',
      impact: 'high',
      action: {
        label: 'Find time',
        handler: 'find_recovery_block',
      },
    });
  }

  // Lifestyle interventions
  interventions.push({
    id: 'exercise-routine',
    type: 'lifestyle',
    title: 'Start a simple exercise routine',
    description: 'Even 15 minutes daily improves mood and energy.',
    effort: 'medium',
    impact: 'high',
  });

  return interventions;
}

// ============================================================================
// BURNOUT NUDGES
// ============================================================================

/**
 * Generate burnout-related nudges
 */
export function generateBurnoutNudges(assessment: BurnoutAssessment): Nudge[] {
  const nudges: Nudge[] = [];

  if (assessment.overallRisk === 'critical') {
    nudges.push({
      id: 'burnout-critical',
      type: 'warning',
      priority: 'high',
      title: 'Burnout risk is high',
      description: 'Multiple stress signals detected. Consider taking action today.',
      category: 'health',
      color: 'red',
      action: {
        id: 'view-assessment',
        label: 'View details',
        variant: 'primary',
        handler: 'show_burnout_assessment',
      },
    });
  } else if (assessment.overallRisk === 'high') {
    nudges.push({
      id: 'burnout-high',
      type: 'warning',
      priority: 'medium',
      title: 'Take care of yourself',
      description: `${assessment.signals.length} stress signals detected. Consider a lighter day.`,
      category: 'health',
      color: 'orange',
    });
  } else if (assessment.overallRisk === 'medium') {
    // Only show if there are actionable signals
    if (assessment.signals.length > 0) {
      nudges.push({
        id: 'burnout-medium',
        type: 'suggestion',
        priority: 'low',
        title: 'Wellness check',
        description: assessment.recommendations[0] || 'Remember to take breaks.',
        category: 'health',
        color: 'yellow',
      });
    }
  }

  return nudges;
}

// ============================================================================
// PREDICTIONS
// ============================================================================

/**
 * Predict burnout risk trajectory
 */
export function predictBurnoutTrajectory(
  currentAssessment: BurnoutAssessment,
  upcomingMeetings: Meeting[]
): Prediction | null {
  // Only predict if risk is medium or higher
  if (currentAssessment.overallRisk === 'low') return null;

  // Check if upcoming schedule is heavy
  const upcomingMeetingHours = upcomingMeetings.reduce((sum, m) => {
    const [startH, startM] = m.start.split(':').map(Number);
    const [endH, endM] = m.end.split(':').map(Number);
    return sum + ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
  }, 0);

  if (upcomingMeetingHours > 4 && currentAssessment.riskScore > 40) {
    return {
      id: 'burnout-trajectory',
      type: 'health',
      title: 'Heavy schedule ahead',
      description: `${upcomingMeetingHours.toFixed(1)} hours of meetings coming up. Combined with current stress signals, consider rescheduling non-essential items.`,
      confidence: 75,
      basedOn: ['Current burnout signals', 'Upcoming meeting load'],
      suggestedAction: {
        id: 'reschedule',
        label: 'Review schedule',
        variant: 'secondary',
        handler: 'show_schedule',
      },
      timeline: 'This week',
    };
  }

  return null;
}

