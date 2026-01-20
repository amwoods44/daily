'use client';

import React from 'react';
import { Footprints } from 'lucide-react';
import type { ActivityDay } from '@/lib/health-mock-data';
import { ActivitySparkline, ProgressRing } from './HealthCharts';

interface ActivityTrackerProps {
  activityData: ActivityDay[];
  currentSteps: number;
  stepsGoal: number;
  activeMinutes: number;
  activeGoal?: number;
}

export function ActivityTracker({
  activityData,
  currentSteps,
  stepsGoal,
  activeMinutes,
  activeGoal = 30,
}: ActivityTrackerProps) {
  const stepsProgress = (currentSteps / stepsGoal) * 100;
  const activeProgress = (activeMinutes / activeGoal) * 100;

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'var(--semantic-success)';
    if (progress >= 40) return 'var(--semantic-warning)';
    return 'var(--semantic-error)';
  };

  return (
    <section className="card-accent">
      {/* Section Header */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          Activity & Movement
        </span>
        <div className="section-header-line" />
      </div>

      {/* Steps Progress */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Footprints
              className="w-5 h-5"
              style={{ color: 'var(--semantic-info)' }}
            />
            <span
              className="text-body"
              style={{
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
              }}
            >
              Steps
            </span>
          </div>
          <span
            className="text-body-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {currentSteps.toLocaleString()} / {stepsGoal.toLocaleString()}
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-muted)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, stepsProgress)}%`,
              backgroundColor: getProgressColor(stepsProgress),
            }}
          />
        </div>
        <div
          className="text-body-sm"
          style={{
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-2)',
          }}
        >
          {Math.round(stepsProgress)}% of goal
        </div>
      </div>

      {/* 7-Day Trend Sparkline */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h3
          className="text-label-sm"
          style={{
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-3)',
          }}
        >
          7-Day Step Trend
        </h3>
        <ActivitySparkline activityData={activityData} />
      </div>

      {/* Active Minutes Ring */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <h3
          className="text-label-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Active Minutes
        </h3>
        <ProgressRing
          progress={activeProgress}
          size={80}
          strokeWidth={8}
          color={getProgressColor(activeProgress)}
        >
          <div
            className="text-mono"
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-primary)',
              fontWeight: 'var(--weight-semibold)',
            }}
          >
            {activeMinutes}
          </div>
        </ProgressRing>
        <div
          className="text-body-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {activeMinutes} of {activeGoal} min goal
        </div>
      </div>
    </section>
  );
}

export default ActivityTracker;
