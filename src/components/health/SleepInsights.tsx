'use client';

import React from 'react';
import { Moon, Sun, TrendingUp, TrendingDown, Minus, Clock, AlertCircle } from 'lucide-react';
import type { HealthMetrics } from '@/lib/mock-data';
import { analyzeSleep, type SleepAnalysis } from '@/lib/health/health-engine';

// ============================================================================
// TYPES
// ============================================================================

interface SleepInsightsProps {
  health: HealthMetrics;
  variant?: 'full' | 'compact' | 'minimal';
}

// ============================================================================
// HELPERS
// ============================================================================

function getQualityColor(quality: string): string {
  switch (quality) {
    case 'excellent':
      return 'text-[var(--semantic-success)]';
    case 'good':
      return 'text-[var(--semantic-success-vivid)]';
    case 'fair':
      return 'text-[var(--semantic-warning)]';
    case 'poor':
      return 'text-[var(--semantic-error)]';
    default:
      return 'text-[var(--text-secondary)]';
  }
}

function getQualityBg(quality: string): string {
  switch (quality) {
    case 'excellent':
      return 'bg-[var(--semantic-success-subtle)]';
    case 'good':
      return 'bg-[var(--semantic-success-subtle)]';
    case 'fair':
      return 'bg-[var(--semantic-warning-subtle)]';
    case 'poor':
      return 'bg-[var(--semantic-error-subtle)]';
    default:
      return 'bg-[var(--bg-muted)]';
  }
}

// TrendIndicator as a pure component to avoid lint false positive
function TrendIndicator({ trend, className }: { trend: 'improving' | 'stable' | 'declining'; className?: string }) {
  switch (trend) {
    case 'improving':
      return <TrendingUp className={className} />;
    case 'declining':
      return <TrendingDown className={className} />;
    default:
      return <Minus className={className} />;
  }
}

function getTrendColor(trend: 'improving' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'improving':
      return 'text-[var(--semantic-success)]';
    case 'declining':
      return 'text-[var(--semantic-error)]';
    default:
      return 'text-[var(--text-tertiary)]';
  }
}

// ============================================================================
// FULL VARIANT
// ============================================================================

function FullSleepInsights({
  health,
  analysis,
}: {
  health: HealthMetrics;
  analysis: SleepAnalysis;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${getQualityBg(health.sleep.quality)} flex items-center justify-center`}>
            <Moon className={`w-6 h-6 ${getQualityColor(health.sleep.quality)}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Sleep Insights</h3>
            <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
              <TrendIndicator trend={analysis.trend} className={`w-4 h-4 ${getTrendColor(analysis.trend)}`} />
              <span className="capitalize">{analysis.trend}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-light ${getQualityColor(health.sleep.quality)}`}>
            {analysis.hoursSlept}h
          </div>
          <div className="text-sm text-[var(--text-tertiary)]">Last night</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] mb-1">
            <Moon className="w-4 h-4" />
            <span>Quality</span>
          </div>
          <div className={`text-xl font-semibold capitalize ${getQualityColor(health.sleep.quality)}`}>
            {health.sleep.quality}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] mb-1">
            <Clock className="w-4 h-4" />
            <span>Weekly Avg</span>
          </div>
          <div className="text-xl font-semibold text-[var(--text-primary)]">
            {analysis.weeklyAverage.toFixed(1)}h
          </div>
        </div>
      </div>

      {/* Sleep Times */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
        <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Sleep Schedule</h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[var(--semantic-info)]" />
            <span className="text-sm text-[var(--text-secondary)]">Bedtime</span>
          </div>
          <span className="font-medium text-[var(--text-primary)]">{health.sleep.bedtime}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[var(--semantic-warning)]" />
            <span className="text-sm text-[var(--text-secondary)]">Wake time</span>
          </div>
          <span className="font-medium text-[var(--text-primary)]">{health.sleep.wakeTime}</span>
        </div>
      </div>

      {/* Deficit Warning */}
      {analysis.deficit > 0 && (
        <div className="bg-[var(--semantic-warning-subtle)] rounded-xl border border-[var(--semantic-warning)] p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--semantic-warning)] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-[var(--text-primary)]">Sleep Deficit</h4>
              <p className="text-sm text-[var(--semantic-warning)] mt-1">
                You&apos;re {analysis.deficit.toFixed(1)} hours behind your target.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-[var(--bg-muted)] rounded-xl p-4">
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <Moon className="w-4 h-4 text-[var(--semantic-info)] flex-shrink-0 mt-0.5" />
                <span>{typeof rec === 'string' ? rec : rec.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactSleepInsights({
  health,
  analysis,
}: {
  health: HealthMetrics;
  analysis: SleepAnalysis;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${getQualityBg(health.sleep.quality)} flex items-center justify-center`}>
          <Moon className={`w-6 h-6 ${getQualityColor(health.sleep.quality)}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--text-primary)]">Sleep</span>
            <span className={`text-lg font-semibold ${getQualityColor(health.sleep.quality)}`}>
              {analysis.hoursSlept}h
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-sm text-[var(--text-tertiary)]">
            <span className="capitalize">{health.sleep.quality} quality</span>
            <span>Avg: {analysis.weeklyAverage.toFixed(1)}h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MINIMAL VARIANT
// ============================================================================

function MinimalSleepInsights({
  health,
  analysis,
}: {
  health: HealthMetrics;
  analysis: SleepAnalysis;
}) {
  return (
    <div className="flex items-center gap-3">
      <Moon className={`w-5 h-5 ${getQualityColor(health.sleep.quality)}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Sleep</div>
      </div>
      <div className={`text-lg font-medium ${getQualityColor(health.sleep.quality)}`}>
        {analysis.hoursSlept}h
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SleepInsights({
  health,
  variant = 'full',
}: SleepInsightsProps) {
  const analysis = analyzeSleep(health);

  if (variant === 'minimal') {
    return <MinimalSleepInsights health={health} analysis={analysis} />;
  }

  if (variant === 'compact') {
    return <CompactSleepInsights health={health} analysis={analysis} />;
  }

  return <FullSleepInsights health={health} analysis={analysis} />;
}

export default SleepInsights;
