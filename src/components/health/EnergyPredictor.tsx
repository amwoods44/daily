'use client';

import React from 'react';
import {
  Zap,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Sun,
  Moon,
} from 'lucide-react';
import type { HealthMetrics } from '@/lib/mock-data';
import { predictEnergy, type EnergyPrediction } from '@/lib/health/health-engine';

// ============================================================================
// TYPES
// ============================================================================

interface EnergyPredictorProps {
  health: HealthMetrics;
  variant?: 'full' | 'compact' | 'minimal';
}

// ============================================================================
// HELPERS
// ============================================================================

function getEnergyColor(level: number): string {
  if (level >= 80) return 'text-[var(--semantic-success)]';
  if (level >= 60) return 'text-[var(--semantic-success)]';
  if (level >= 40) return 'text-[var(--semantic-warning)]';
  if (level >= 20) return 'text-[var(--semantic-warning)]';
  return 'text-[var(--semantic-error)]';
}

function getEnergyBackground(level: number): string {
  if (level >= 80) return 'bg-[var(--semantic-success-subtle)]';
  if (level >= 60) return 'bg-[var(--semantic-success-subtle)]';
  if (level >= 40) return 'bg-[var(--semantic-warning-subtle)]';
  if (level >= 20) return 'bg-[var(--semantic-warning-subtle)]';
  return 'bg-[var(--semantic-error-subtle)]';
}

function getEnergyBarColor(level: number): string {
  if (level >= 80) return 'bg-[var(--semantic-success)]';
  if (level >= 60) return 'bg-[var(--semantic-success)]';
  if (level >= 40) return 'bg-[var(--semantic-warning)]';
  if (level >= 20) return 'bg-[var(--semantic-warning)]';
  return 'bg-[var(--semantic-error)]';
}

// Battery icon as a pure component to avoid lint false positive
function BatteryIndicator({ level, className }: { level: number; className?: string }) {
  if (level >= 75) return <BatteryFull className={className} />;
  if (level >= 50) return <BatteryMedium className={className} />;
  if (level >= 25) return <BatteryLow className={className} />;
  return <Battery className={className} />;
}

// ============================================================================
// FULL VARIANT
// ============================================================================

function FullEnergyPredictor({
  prediction,
}: {
  prediction: EnergyPrediction;
}) {
  // Convert 1-5 scale to percentage
  const levelPercent = prediction.currentLevel * 20;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${getEnergyBackground(levelPercent)} flex items-center justify-center`}>
            <Zap className={`w-6 h-6 ${getEnergyColor(levelPercent)}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Energy Forecast</h3>
            <div className="text-sm text-[var(--text-tertiary)]">Based on your health data</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-light ${getEnergyColor(levelPercent)}`}>
            {levelPercent}%
          </div>
          <div className="text-sm text-[var(--text-tertiary)]">Current energy</div>
        </div>
      </div>

      {/* Energy Bar */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
        <div className="h-3 bg-[var(--bg-muted)] rounded-full overflow-hidden">
          <div
            className={`h-full ${getEnergyBarColor(levelPercent)} rounded-full transition-all`}
            style={{ width: `${levelPercent}%` }}
          />
        </div>
      </div>

      {/* Peak & Dip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--semantic-warning-subtle)] rounded-xl p-4 border border-[var(--semantic-warning)]">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-[var(--semantic-warning)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Peak Energy</span>
          </div>
          <div className="text-2xl font-light text-[var(--text-primary)]">
            {prediction.predictedPeakTime}
          </div>
        </div>

        <div className="bg-[var(--semantic-info-subtle)] rounded-xl p-4 border border-[var(--semantic-info)]">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4 text-[var(--semantic-info)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Energy Dip</span>
          </div>
          <div className="text-2xl font-light text-[var(--text-primary)]">
            {prediction.predictedDipTime}
          </div>
        </div>
      </div>

      {/* Factors */}
      {prediction.factors.length > 0 && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Energy Factors</h4>
          <div className="space-y-2">
            {prediction.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {typeof factor === 'string' ? factor : factor.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {prediction.recommendations.length > 0 && (
        <div className="bg-[var(--bg-muted)] rounded-xl p-4">
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Energy Optimization</h4>
          <ul className="space-y-2">
            {prediction.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <Zap className="w-4 h-4 text-[var(--semantic-warning)] flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
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

function CompactEnergyPredictor({
  prediction,
}: {
  prediction: EnergyPrediction;
}) {
  const levelPercent = prediction.currentLevel * 20;

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${getEnergyBackground(levelPercent)} flex items-center justify-center`}>
          <BatteryIndicator level={levelPercent} className={`w-6 h-6 ${getEnergyColor(levelPercent)}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[var(--text-primary)]">Energy</span>
            <span className={`text-lg font-semibold ${getEnergyColor(levelPercent)}`}>
              {levelPercent}%
            </span>
          </div>
          <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden mt-2">
            <div
              className={`h-full ${getEnergyBarColor(levelPercent)} rounded-full`}
              style={{ width: `${levelPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-1">
          <Sun className="w-3 h-3 text-[var(--semantic-warning)]" />
          <span>Peak at {prediction.predictedPeakTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Moon className="w-3 h-3 text-[var(--semantic-info)]" />
          <span>Dip at {prediction.predictedDipTime}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MINIMAL VARIANT
// ============================================================================

function MinimalEnergyPredictor({
  prediction,
}: {
  prediction: EnergyPrediction;
}) {
  const levelPercent = prediction.currentLevel * 20;

  return (
    <div className="flex items-center gap-3">
      <BatteryIndicator level={levelPercent} className={`w-5 h-5 ${getEnergyColor(levelPercent)}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Energy</div>
      </div>
      <div className={`text-lg font-medium ${getEnergyColor(levelPercent)}`}>
        {levelPercent}%
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnergyPredictor({
  health,
  variant = 'full',
}: EnergyPredictorProps) {
  const prediction = predictEnergy(health);

  if (variant === 'minimal') {
    return <MinimalEnergyPredictor prediction={prediction} />;
  }

  if (variant === 'compact') {
    return <CompactEnergyPredictor prediction={prediction} />;
  }

  return <FullEnergyPredictor prediction={prediction} />;
}

export default EnergyPredictor;
