'use client';

import React from 'react';
import {
  Moon,
  Zap,
  Footprints,
  Droplets,
  Weight,
  Activity,
} from 'lucide-react';
import type { HealthMetrics } from '@/lib/mock-data';
import { ProgressRing } from './HealthCharts';

interface HealthDashboardProps {
  health: HealthMetrics;
  healthScore?: number; // 0-100
}

// ============================================================================
// HELPERS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--semantic-success)';
  if (score >= 60) return 'var(--semantic-warning)';
  if (score >= 40) return 'var(--semantic-error)';
  return 'var(--semantic-error-vivid)';
}

function formatQuality(quality: string): string {
  return quality.charAt(0).toUpperCase() + quality.slice(1);
}

// ============================================================================
// METRIC CARD
// ============================================================================

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subvalue?: string;
}

function MetricCard({ icon: Icon, label, value, subvalue }: MetricCardProps) {
  return (
    <div
      className="premium-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        <span className="text-label-sm" style={{ color: 'var(--text-tertiary)' }}>
          {label}
        </span>
      </div>
      <div>
        <div
          className="text-heading-lg"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 'var(--weight-semibold)',
          }}
        >
          {value}
        </div>
        {subvalue && (
          <div
            className="text-body-sm"
            style={{
              color: 'var(--text-tertiary)',
              marginTop: 'var(--space-1)',
            }}
          >
            {subvalue}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function HealthDashboard({ health, healthScore = 72 }: HealthDashboardProps) {
  const scoreColor = getScoreColor(healthScore);
  const stepsProgress = (health.steps / health.stepsGoal) * 100;
  const waterProgress = (health.waterGlasses / health.waterGoal) * 100;

  return (
    <section
      className="card-hero"
      style={{
        padding: 'var(--space-10)',
      }}
    >
      {/* Health Score Ring */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-12)',
        }}
      >
        <span
          className="text-label-md"
          style={{
            color: 'var(--text-tertiary)',
            display: 'block',
            marginBottom: 'var(--space-4)',
          }}
        >
          Overall Health Score
        </span>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
          <ProgressRing
            progress={healthScore}
            size={80}
            strokeWidth={8}
            color={scoreColor}
          >
            <div
              className="text-display-sm"
              style={{
                color: scoreColor,
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              {healthScore}
            </div>
          </ProgressRing>
        </div>
        <div
          className="text-body-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Attention'}
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3"
        style={{
          gap: 'var(--space-6)',
        }}
      >
        <MetricCard
          icon={Moon}
          label="Sleep"
          value={`${health.sleep.hours.toFixed(1)}h`}
          subvalue={formatQuality(health.sleep.quality)}
        />
        <MetricCard
          icon={Zap}
          label="HRV"
          value={`${health.hrv}`}
          subvalue={`${health.restingHR} bpm`}
        />
        <MetricCard
          icon={Footprints}
          label="Steps"
          value={health.steps.toLocaleString()}
          subvalue={`${Math.round(stepsProgress)}% of goal`}
        />
        <MetricCard
          icon={Droplets}
          label="Water"
          value={`${health.waterGlasses}/${health.waterGoal}`}
          subvalue={`${Math.round(waterProgress)}% hydrated`}
        />
        {health.weight && (
          <MetricCard
            icon={Weight}
            label="Weight"
            value={`${health.weight} lbs`}
          />
        )}
        <MetricCard
          icon={Activity}
          label="Active"
          value={`${health.activeMinutes} min`}
        />
      </div>
    </section>
  );
}

export default HealthDashboard;
