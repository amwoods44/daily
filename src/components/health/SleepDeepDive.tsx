'use client';

import React from 'react';
import type { SleepDay } from '@/lib/health-mock-data';
import { SleepBarChart } from './HealthCharts';
import { calculateAverageSleep, calculateSleepDebt, getBedtimeConsistency } from '@/lib/health-mock-data';

interface SleepDeepDiveProps {
  sleepData: SleepDay[];
  targetHours?: number;
}

export function SleepDeepDive({ sleepData, targetHours = 7 }: SleepDeepDiveProps) {
  const avgSleep = calculateAverageSleep(sleepData);
  const sleepDebt = calculateSleepDebt(sleepData, targetHours);
  const bedtimeVariance = getBedtimeConsistency(sleepData);

  const nightsBelowTarget = sleepData.filter((d) => d.hours < targetHours).length;

  return (
    <section className="card-accent">
      {/* Section Header */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          Sleep Analysis
        </span>
        <div className="section-header-line" />
        <span
          className="text-mono-sm"
          style={{
            color: 'var(--text-quaternary)',
            backgroundColor: 'var(--bg-muted)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          7 days
        </span>
      </div>

      {/* 7-Day Bar Chart */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <SleepBarChart sleepData={sleepData} />
      </div>

      {/* Insights */}
      <div className="stack-md">
        <div
          style={{
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-accent-subtle)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h3
            className="text-label-md"
            style={{
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Insights
          </h3>
          <ul className="stack-sm" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li
              className="text-body-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              • {nightsBelowTarget} night{nightsBelowTarget !== 1 ? 's' : ''} below {targetHours}h target this week
            </li>
            <li
              className="text-body-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              • Bedtime varied by {bedtimeVariance.toFixed(1)} hours
            </li>
            {sleepDebt > 0 && (
              <li
                className="text-body-sm"
                style={{ color: 'var(--semantic-warning)' }}
              >
                • Sleep debt: {sleepDebt.toFixed(1)} hours
              </li>
            )}
            <li
              className="text-body-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              • Average: {avgSleep.toFixed(1)}h per night
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default SleepDeepDive;
