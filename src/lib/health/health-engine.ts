/**
 * Health Engine
 *
 * Core health tracking and analysis:
 * - Sleep quality tracking
 * - Energy level monitoring
 * - Exercise/activity tracking
 * - Overall health score calculation
 * - Trend detection
 */

import type { HealthSnapshot, HealthTrend, Nudge } from '../types';
import type { HealthMetrics } from '../mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface HealthScore {
  overall: number; // 0-100
  components: {
    sleep: { score: number; status: string; insight?: string };
    energy: { score: number; status: string; insight?: string };
    activity: { score: number; status: string; insight?: string };
    hydration: { score: number; status: string; insight?: string };
    recovery: { score: number; status: string; insight?: string };
  };
  trend: 'improving' | 'stable' | 'declining';
  topConcern?: string;
  topWin?: string;
}

export interface SleepAnalysis {
  hoursSlept: number;
  quality: string;
  deficit: number; // Hours below target
  weeklyAverage: number;
  weeklyDeficit?: number;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[] | { type: string; message: string }[];
  optimalBedtime?: string;
  optimalWakeTime?: string;
}

export interface EnergyPrediction {
  currentLevel: number; // 0-100
  predictedPeakTime: string;
  predictedDipTime: string;
  factors: string[] | { name: string; impact: number }[];
  recommendations: string[];
  // Extended fields for components
  peakTime?: number; // Hour (0-23)
  dipTime?: number; // Hour (0-23)
  peakActivity?: string;
  dipActivity?: string;
  hourlyPredictions?: { hour: number; level: number; activity: string }[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SLEEP_TARGET_HOURS = 7.5;
// Reserved for future goal-based features
const _STEPS_GOAL = 10000;
const _WATER_GOAL = 8;

// Weights for overall health score
const HEALTH_WEIGHTS = {
  sleep: 0.30,
  energy: 0.20,
  activity: 0.25,
  hydration: 0.10,
  recovery: 0.15,
};

// ============================================================================
// HEALTH SCORE CALCULATION
// ============================================================================

/**
 * Calculate overall health score from metrics
 */
export function calculateHealthScore(metrics: HealthMetrics): HealthScore {
  // Calculate individual component scores
  const sleepScore = calculateSleepScore(metrics.sleep);
  const energyScore = calculateEnergyScore(metrics.hrv, metrics.restingHR);
  const activityScore = calculateActivityScore(metrics.steps, metrics.stepsGoal, metrics.activeMinutes);
  const hydrationScore = calculateHydrationScore(metrics.waterGlasses, metrics.waterGoal);
  const recoveryScore = calculateRecoveryScore(metrics.hrv, metrics.restingHR);

  // Calculate weighted overall score
  const overall = Math.round(
    sleepScore.score * HEALTH_WEIGHTS.sleep +
    energyScore.score * HEALTH_WEIGHTS.energy +
    activityScore.score * HEALTH_WEIGHTS.activity +
    hydrationScore.score * HEALTH_WEIGHTS.hydration +
    recoveryScore.score * HEALTH_WEIGHTS.recovery
  );

  // Determine top concern and win
  const scores = [
    { name: 'sleep', ...sleepScore },
    { name: 'energy', ...energyScore },
    { name: 'activity', ...activityScore },
    { name: 'hydration', ...hydrationScore },
    { name: 'recovery', ...recoveryScore },
  ];

  const lowest = scores.sort((a, b) => a.score - b.score)[0];
  const highest = scores.sort((a, b) => b.score - a.score)[0];

  return {
    overall,
    components: {
      sleep: sleepScore,
      energy: energyScore,
      activity: activityScore,
      hydration: hydrationScore,
      recovery: recoveryScore,
    },
    trend: 'stable', // Would need historical data
    topConcern: lowest.score < 60 ? lowest.insight : undefined,
    topWin: highest.score >= 80 ? highest.insight : undefined,
  };
}

function calculateSleepScore(sleep: HealthMetrics['sleep']): { score: number; status: string; insight?: string } {
  const hoursScore = Math.min(100, (sleep.hours / SLEEP_TARGET_HOURS) * 100);

  const qualityMultiplier = {
    excellent: 1.1,
    good: 1.0,
    fair: 0.85,
    poor: 0.7,
  }[sleep.quality] || 1.0;

  const score = Math.round(Math.min(100, hoursScore * qualityMultiplier));

  let status: string;
  let insight: string | undefined;

  if (score >= 85) {
    status = 'Excellent';
    insight = 'Great sleep last night!';
  } else if (score >= 70) {
    status = 'Good';
  } else if (score >= 50) {
    status = 'Fair';
    insight = `Only ${sleep.hours.toFixed(1)}h sleep. Aim for ${SLEEP_TARGET_HOURS}h tonight.`;
  } else {
    status = 'Poor';
    insight = `Sleep deficit building. Priority: get to bed earlier tonight.`;
  }

  return { score, status, insight };
}

function calculateEnergyScore(hrv: number, restingHR: number): { score: number; status: string; insight?: string } {
  // HRV is highly individual, but generally higher is better
  // These are simplified thresholds
  let hrvScore = 50;
  if (hrv >= 60) hrvScore = 90;
  else if (hrv >= 50) hrvScore = 80;
  else if (hrv >= 40) hrvScore = 65;
  else if (hrv >= 30) hrvScore = 50;
  else hrvScore = 35;

  // Resting HR - lower is generally better (for healthy adults)
  let hrScore = 50;
  if (restingHR <= 55) hrScore = 95;
  else if (restingHR <= 60) hrScore = 85;
  else if (restingHR <= 65) hrScore = 75;
  else if (restingHR <= 70) hrScore = 60;
  else hrScore = 45;

  const score = Math.round((hrvScore + hrScore) / 2);

  let status: string;
  let insight: string | undefined;

  if (score >= 85) {
    status = 'High energy';
    insight = 'Great day for challenging work!';
  } else if (score >= 70) {
    status = 'Good';
  } else if (score >= 50) {
    status = 'Moderate';
    insight = 'HRV is lower than usual. Consider a lighter day.';
  } else {
    status = 'Low';
    insight = 'Body needs recovery. Avoid overexertion today.';
  }

  return { score, status, insight };
}

function calculateActivityScore(
  steps: number,
  stepsGoal: number,
  activeMinutes: number
): { score: number; status: string; insight?: string } {
  const stepsScore = Math.min(100, (steps / stepsGoal) * 100);
  const activeScore = Math.min(100, (activeMinutes / 30) * 100); // 30 min target
  const score = Math.round((stepsScore * 0.6 + activeScore * 0.4));

  let status: string;
  let insight: string | undefined;

  if (score >= 100) {
    status = 'Goal reached!';
    insight = 'You hit your activity goal! 🎉';
  } else if (score >= 70) {
    status = 'On track';
  } else if (score >= 40) {
    status = 'Getting there';
    insight = `${Math.round(stepsGoal - steps).toLocaleString()} steps to go.`;
  } else {
    status = 'Just started';
    insight = 'Try a short walk to boost your energy.';
  }

  return { score, status, insight };
}

function calculateHydrationScore(
  glasses: number,
  goal: number
): { score: number; status: string; insight?: string } {
  const score = Math.round(Math.min(100, (glasses / goal) * 100));

  let status: string;
  let insight: string | undefined;

  if (score >= 100) {
    status = 'Well hydrated';
  } else if (score >= 75) {
    status = 'Good';
  } else if (score >= 50) {
    status = 'Moderate';
    insight = `${goal - glasses} more glasses to hit your goal.`;
  } else {
    status = 'Low';
    insight = 'Drink more water! Dehydration affects focus.';
  }

  return { score, status, insight };
}

function calculateRecoveryScore(hrv: number, _restingHR: number): { score: number; status: string; insight?: string } {
  // Recovery is primarily based on HRV
  let score: number;
  if (hrv >= 55) score = 90;
  else if (hrv >= 45) score = 75;
  else if (hrv >= 35) score = 55;
  else score = 40;

  let status: string;
  let insight: string | undefined;

  if (score >= 85) {
    status = 'Fully recovered';
    insight = 'Body is ready for intense activity!';
  } else if (score >= 70) {
    status = 'Good recovery';
  } else if (score >= 50) {
    status = 'Partial recovery';
  } else {
    status = 'Needs rest';
    insight = 'Consider rest or light activity today.';
  }

  return { score, status, insight };
}

// ============================================================================
// SLEEP ANALYSIS
// ============================================================================

/**
 * Analyze sleep patterns and provide recommendations
 */
export function analyzeSleep(
  metrics: HealthMetrics,
  weeklyData?: HealthSnapshot[]
): SleepAnalysis {
  const hoursSlept = metrics.sleep.hours;
  const quality = metrics.sleep.quality;
  const deficit = Math.max(0, SLEEP_TARGET_HOURS - hoursSlept);

  // Calculate weekly average (would use real data in production)
  const weeklyAverage = weeklyData
    ? weeklyData.reduce((sum, d) => sum + d.sleep.hours, 0) / weeklyData.length
    : hoursSlept;

  // Determine trend (would compare to previous weeks)
  let trend: SleepAnalysis['trend'] = 'stable';
  if (weeklyAverage > SLEEP_TARGET_HOURS - 0.5) {
    trend = 'improving';
  } else if (weeklyAverage < SLEEP_TARGET_HOURS - 1) {
    trend = 'declining';
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (deficit > 1) {
    recommendations.push(`Try to get to bed ${Math.round(deficit * 60)} minutes earlier tonight.`);
  }

  if (quality === 'poor' || quality === 'fair') {
    recommendations.push('Consider reducing screen time before bed.');
    recommendations.push('Avoid caffeine after 2pm.');
  }

  if (metrics.sleep.bedtime && parseInt(metrics.sleep.bedtime) >= 24) {
    recommendations.push('Aim for a more consistent bedtime before midnight.');
  }

  return {
    hoursSlept,
    quality,
    deficit,
    weeklyAverage,
    trend,
    recommendations,
  };
}

// ============================================================================
// ENERGY PREDICTION
// ============================================================================

/**
 * Predict energy levels throughout the day
 */
export function predictEnergy(metrics: HealthMetrics): EnergyPrediction {
  const sleepScore = calculateSleepScore(metrics.sleep);
  const recoveryScore = calculateRecoveryScore(metrics.hrv, metrics.restingHR);

  // Base energy level on sleep and recovery
  const baseEnergy = Math.round((sleepScore.score + recoveryScore.score) / 40); // 1-5 scale
  const currentLevel = Math.max(1, Math.min(5, baseEnergy));

  // Predict peak and dip times (simplified)
  // In production, would use historical patterns
  const factors: string[] = [];
  const recommendations: string[] = [];

  const predictedPeakTime = '10:00 AM';
  let predictedDipTime = '2:00 PM';

  if (metrics.sleep.hours < 6) {
    factors.push('Low sleep affecting energy');
    predictedDipTime = '11:00 AM';
    recommendations.push('Consider a 20-minute power nap if possible.');
  }

  if (metrics.hrv < 40) {
    factors.push('HRV indicates lower recovery');
    recommendations.push('Schedule demanding tasks for the morning.');
  }

  if (currentLevel >= 4) {
    factors.push('Well-rested');
    recommendations.push('Great day for challenging work or exercise!');
  }

  return {
    currentLevel,
    predictedPeakTime,
    predictedDipTime,
    factors,
    recommendations,
  };
}

// ============================================================================
// HEALTH NUDGES
// ============================================================================

/**
 * Generate health-related nudges
 */
export function generateHealthNudges(metrics: HealthMetrics): Nudge[] {
  const nudges: Nudge[] = [];
  const healthScore = calculateHealthScore(metrics);

  // Sleep warnings
  if (metrics.sleep.hours < 6) {
    nudges.push({
      id: 'sleep-warning',
      type: 'warning',
      priority: 'high',
      title: `Only ${metrics.sleep.hours.toFixed(1)} hours of sleep`,
      description: 'Consider a lighter schedule today. Sleep deficit affects focus and mood.',
      category: 'health',
      color: 'yellow',
    });
  }

  // Sleep streak celebration
  // (Would check historical data in production)

  // Low activity nudge
  const activityScore = healthScore.components.activity.score;
  if (activityScore < 30) {
    nudges.push({
      id: 'activity-nudge',
      type: 'suggestion',
      priority: 'low',
      title: 'Time to move?',
      description: 'A short walk can boost energy and focus.',
      category: 'health',
      color: 'blue',
      action: {
        id: 'start-walk',
        label: 'Start walk',
        variant: 'secondary',
        handler: 'start_walk_timer',
      },
    });
  }

  // Hydration reminder
  if (metrics.waterGlasses < 4 && new Date().getHours() >= 14) {
    nudges.push({
      id: 'hydration-reminder',
      type: 'reminder',
      priority: 'low',
      title: 'Drink more water',
      description: `Only ${metrics.waterGlasses} glasses so far. Dehydration affects focus.`,
      category: 'health',
      color: 'blue',
    });
  }

  // Low HRV warning
  if (metrics.hrv < 35) {
    nudges.push({
      id: 'hrv-warning',
      type: 'warning',
      priority: 'medium',
      title: 'Body needs recovery',
      description: 'HRV is low. Consider rest or light activity today.',
      category: 'health',
      color: 'orange',
    });
  }

  return nudges;
}

// ============================================================================
// HEALTH TRENDS
// ============================================================================

/**
 * Calculate health trends over time
 */
export function calculateHealthTrends(
  snapshots: HealthSnapshot[]
): HealthTrend[] {
  if (snapshots.length < 2) return [];

  const trends: HealthTrend[] = [];

  // Sort by date
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate sleep trend
  const sleepHours = sorted.map((s) => s.sleep.hours);
  const sleepTrend = calculateTrend(sleepHours);
  trends.push({
    metric: 'sleep',
    direction: sleepTrend.direction,
    percentChange: sleepTrend.percentChange,
    insight: sleepTrend.direction === 'down'
      ? 'Sleep has been declining. Prioritize rest.'
      : sleepTrend.direction === 'up'
        ? 'Sleep is improving. Keep it up!'
        : undefined,
  });

  // Calculate energy trend
  const energyLevels = sorted.map((s) => s.energy);
  const energyTrend = calculateTrend(energyLevels);
  trends.push({
    metric: 'energy',
    direction: energyTrend.direction,
    percentChange: energyTrend.percentChange,
  });

  // Calculate steps trend
  const steps = sorted.filter((s) => s.steps !== undefined).map((s) => s.steps!);
  if (steps.length >= 2) {
    const stepsTrend = calculateTrend(steps);
    trends.push({
      metric: 'steps',
      direction: stepsTrend.direction,
      percentChange: stepsTrend.percentChange,
    });
  }

  return trends;
}

function calculateTrend(values: number[]): { direction: 'up' | 'down' | 'stable'; percentChange: number } {
  if (values.length < 2) return { direction: 'stable', percentChange: 0 };

  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;

  let direction: 'up' | 'down' | 'stable';
  if (percentChange > 5) direction = 'up';
  else if (percentChange < -5) direction = 'down';
  else direction = 'stable';

  return { direction, percentChange: Math.round(percentChange) };
}

