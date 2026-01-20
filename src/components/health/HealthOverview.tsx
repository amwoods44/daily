'use client';

import React from 'react';
import {
  Moon,
  Heart,
  Footprints,
  Droplets,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Zap,
} from 'lucide-react';
import type { HealthMetrics } from '@/lib/mock-data';
import { calculateHealthScore, type HealthScore } from '@/lib/health/health-engine';

// ============================================================================
// TYPES
// ============================================================================

interface HealthOverviewProps {
  health: HealthMetrics;
  onViewDetails?: () => void;
  variant?: 'full' | 'compact' | 'minimal';
}

// ============================================================================
// HELPERS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-[var(--semantic-success)]';
  if (score >= 60) return 'text-[var(--semantic-warning)]';
  if (score >= 40) return 'text-[var(--semantic-warning)]';
  return 'text-[var(--semantic-error)]';
}

function getScoreBackground(score: number): string {
  if (score >= 80) return 'bg-[var(--semantic-success-subtle)]';
  if (score >= 60) return 'bg-[var(--semantic-warning-subtle)]';
  if (score >= 40) return 'bg-[var(--semantic-warning-subtle)]';
  return 'bg-[var(--semantic-error-subtle)]';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-[var(--semantic-success)]" />;
    case 'down':
      return <TrendingDown className="w-3 h-3 text-[var(--semantic-error)]" />;
    default:
      return <Minus className="w-3 h-3 text-[var(--text-tertiary)]" />;
  }
}

// ============================================================================
// METRIC CARD
// ============================================================================

function MetricCard({
  icon,
  label,
  value,
  subvalue,
  score,
  status,
  insight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue?: string;
  score: number;
  status: string;
  insight?: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${getScoreBackground(score)} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[var(--text-primary)]">{value}</span>
            {subvalue && <span className="text-sm text-[var(--text-secondary)]">{subvalue}</span>}
          </div>
          <div className={`text-xs mt-1 ${getScoreColor(score)}`}>{status}</div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-light ${getScoreColor(score)}`}>{score}</div>
        </div>
      </div>
      {insight && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">{insight}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS RING
// ============================================================================

function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color = 'text-[var(--semantic-success)]',
  children,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, progress) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--bg-muted)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// FULL VARIANT
// ============================================================================

function FullHealthOverview({
  health,
  healthScore,
  onViewDetails,
}: {
  health: HealthMetrics;
  healthScore: HealthScore;
  onViewDetails?: () => void;
}) {
  const stepsProgress = (health.steps / health.stepsGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5">
        <div className="flex items-center gap-5">
          <ProgressRing
            progress={healthScore.overall}
            size={80}
            strokeWidth={8}
            color={getScoreColor(healthScore.overall)}
          >
            <div className={`text-2xl font-light ${getScoreColor(healthScore.overall)}`}>
              {healthScore.overall}
            </div>
          </ProgressRing>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Health Score</h3>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              {getTrendIcon(healthScore.trend === 'improving' ? 'up' : healthScore.trend === 'declining' ? 'down' : 'stable')}
              <span>
                {healthScore.trend === 'improving' ? 'Improving' :
                 healthScore.trend === 'declining' ? 'Declining' : 'Stable'}
              </span>
            </div>
            {healthScore.topConcern && (
              <div className="mt-2 flex items-center gap-1 text-xs text-[var(--semantic-warning)]">
                <AlertTriangle className="w-3 h-3" />
                {healthScore.topConcern}
              </div>
            )}
            {healthScore.topWin && !healthScore.topConcern && (
              <div className="mt-2 flex items-center gap-1 text-xs text-[var(--semantic-success)]">
                <CheckCircle className="w-3 h-3" />
                {healthScore.topWin}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sleep */}
        <MetricCard
          icon={<Moon className={`w-5 h-5 ${getScoreColor(healthScore.components.sleep.score)}`} />}
          label="Sleep"
          value={`${health.sleep.hours.toFixed(1)}h`}
          subvalue={health.sleep.quality}
          score={healthScore.components.sleep.score}
          status={healthScore.components.sleep.status}
          insight={healthScore.components.sleep.insight}
        />

        {/* Energy / Recovery */}
        <MetricCard
          icon={<Zap className={`w-5 h-5 ${getScoreColor(healthScore.components.energy.score)}`} />}
          label="Energy"
          value={`HRV ${health.hrv}`}
          subvalue={`${health.restingHR} bpm`}
          score={healthScore.components.energy.score}
          status={healthScore.components.energy.status}
          insight={healthScore.components.energy.insight}
        />
      </div>

      {/* Activity Progress */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-[var(--semantic-info)]" />
            <span className="font-medium text-[var(--text-primary)]">Steps</span>
          </div>
          <span className="text-sm text-[var(--text-secondary)]">
            {health.steps.toLocaleString()} / {health.stepsGoal.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--semantic-info)] rounded-full transition-all"
            style={{ width: `${Math.min(100, stepsProgress)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>{health.activeMinutes} active minutes</span>
          <span>{Math.round(stepsProgress)}% of goal</span>
        </div>
      </div>

      {/* Hydration */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[var(--semantic-info)]" />
            <span className="font-medium text-[var(--text-primary)]">Hydration</span>
          </div>
          <span className="text-sm text-[var(--text-secondary)]">
            {health.waterGlasses} / {health.waterGoal} glasses
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: health.waterGoal }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded ${
                i < health.waterGlasses ? 'bg-[var(--semantic-info)]' : 'bg-[var(--bg-muted)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* View details button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center justify-center gap-1"
        >
          View all health data
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactHealthOverview({
  health,
  healthScore,
  onViewDetails,
}: {
  health: HealthMetrics;
  healthScore: HealthScore;
  onViewDetails?: () => void;
}) {
  return (
    <button
      onClick={onViewDetails}
      className="w-full flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] hover:shadow-sm transition text-left"
    >
      <div className={`w-12 h-12 rounded-full ${getScoreBackground(healthScore.overall)} flex items-center justify-center`}>
        <Heart className={`w-6 h-6 ${getScoreColor(healthScore.overall)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)]">Health</div>
        <div className="text-sm text-[var(--text-secondary)]">
          {health.sleep.hours.toFixed(1)}h sleep
          {health.sleep.quality !== 'good' && health.sleep.quality !== 'excellent' && (
            <span className="text-[var(--semantic-warning)]"> • {health.sleep.quality}</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-light ${getScoreColor(healthScore.overall)}`}>
          {healthScore.overall}
        </div>
        <div className="text-xs text-[var(--text-tertiary)]">score</div>
      </div>
      <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
    </button>
  );
}

// ============================================================================
// MINIMAL VARIANT
// ============================================================================

function MinimalHealthOverview({
  healthScore,
}: {
  healthScore: HealthScore;
}) {
  return (
    <div className="flex items-center gap-3">
      <Heart className={`w-5 h-5 ${getScoreColor(healthScore.overall)}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-primary)]">Health</div>
      </div>
      <div className={`text-lg font-light ${getScoreColor(healthScore.overall)}`}>
        {healthScore.overall}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HealthOverview({
  health,
  onViewDetails,
  variant = 'full',
}: HealthOverviewProps) {
  const healthScore = calculateHealthScore(health);

  if (variant === 'minimal') {
    return <MinimalHealthOverview healthScore={healthScore} />;
  }

  if (variant === 'compact') {
    return (
      <CompactHealthOverview
        health={health}
        healthScore={healthScore}
        onViewDetails={onViewDetails}
      />
    );
  }

  return (
    <FullHealthOverview
      health={health}
      healthScore={healthScore}
      onViewDetails={onViewDetails}
    />
  );
}

export default HealthOverview;
