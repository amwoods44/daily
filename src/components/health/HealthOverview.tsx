'use client';

import React from 'react';
import {
  Moon,
  Sun,
  Heart,
  Footprints,
  Droplets,
  Activity,
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
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function getScoreBackground(score: number): string {
  if (score >= 80) return 'bg-emerald-100';
  if (score >= 60) return 'bg-amber-100';
  if (score >= 40) return 'bg-orange-100';
  return 'bg-red-100';
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    case 'down':
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    default:
      return <Minus className="w-3 h-3 text-stone-400" />;
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
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${getScoreBackground(score)} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-stone-500 uppercase tracking-wide">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-stone-900">{value}</span>
            {subvalue && <span className="text-sm text-stone-500">{subvalue}</span>}
          </div>
          <div className={`text-xs mt-1 ${getScoreColor(score)}`}>{status}</div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-light ${getScoreColor(score)}`}>{score}</div>
        </div>
      </div>
      {insight && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-xs text-stone-600">{insight}</p>
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
  color = 'text-emerald-500',
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
          className="text-stone-100"
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
  const waterProgress = (health.waterGlasses / health.waterGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <div className="flex items-center gap-5">
          <ProgressRing
            progress={healthScore.overall}
            size={80}
            strokeWidth={8}
            color={getScoreColor(healthScore.overall).replace('text-', 'text-')}
          >
            <div className={`text-2xl font-light ${getScoreColor(healthScore.overall)}`}>
              {healthScore.overall}
            </div>
          </ProgressRing>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-stone-900">Health Score</h3>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              {getTrendIcon(healthScore.trend === 'improving' ? 'up' : healthScore.trend === 'declining' ? 'down' : 'stable')}
              <span>
                {healthScore.trend === 'improving' ? 'Improving' :
                 healthScore.trend === 'declining' ? 'Declining' : 'Stable'}
              </span>
            </div>
            {healthScore.topConcern && (
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                {healthScore.topConcern}
              </div>
            )}
            {healthScore.topWin && !healthScore.topConcern && (
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
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
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-stone-900">Steps</span>
          </div>
          <span className="text-sm text-stone-500">
            {health.steps.toLocaleString()} / {health.stepsGoal.toLocaleString()}
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, stepsProgress)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
          <span>{health.activeMinutes} active minutes</span>
          <span>{Math.round(stepsProgress)}% of goal</span>
        </div>
      </div>

      {/* Hydration */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-600" />
            <span className="font-medium text-stone-900">Hydration</span>
          </div>
          <span className="text-sm text-stone-500">
            {health.waterGlasses} / {health.waterGoal} glasses
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: health.waterGoal }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded ${
                i < health.waterGlasses ? 'bg-cyan-500' : 'bg-stone-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* View details button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full py-3 text-sm text-stone-500 hover:text-stone-700 transition flex items-center justify-center gap-1"
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
      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:shadow-sm transition text-left"
    >
      <div className={`w-12 h-12 rounded-full ${getScoreBackground(healthScore.overall)} flex items-center justify-center`}>
        <Heart className={`w-6 h-6 ${getScoreColor(healthScore.overall)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900">Health</div>
        <div className="text-sm text-stone-500">
          {health.sleep.hours.toFixed(1)}h sleep
          {health.sleep.quality !== 'good' && health.sleep.quality !== 'excellent' && (
            <span className="text-amber-600"> • {health.sleep.quality}</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-light ${getScoreColor(healthScore.overall)}`}>
          {healthScore.overall}
        </div>
        <div className="text-xs text-stone-400">score</div>
      </div>
      <ChevronRight className="w-5 h-5 text-stone-400" />
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
        <div className="text-sm font-medium text-stone-700">Health</div>
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
