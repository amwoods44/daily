'use client';

import React from 'react';
import type { SleepDay, ActivityDay } from '@/lib/health-mock-data';

// ============================================================================
// HELPERS
// ============================================================================

function getQualityColor(quality: SleepDay['quality']): string {
  switch (quality) {
    case 'excellent':
      return 'var(--semantic-success-vivid)';
    case 'good':
      return 'var(--semantic-success)';
    case 'fair':
      return 'var(--semantic-warning)';
    case 'poor':
      return 'var(--semantic-error)';
    default:
      return 'var(--text-tertiary)';
  }
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ============================================================================
// SLEEP BAR CHART
// ============================================================================

interface SleepBarChartProps {
  sleepData: SleepDay[];
}

export function SleepBarChart({ sleepData }: SleepBarChartProps) {
  const maxHours = 10;
  const chartHeight = 120;
  const barWidth = 30;
  const barSpacing = 50;

  return (
    <svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${sleepData.length * barSpacing + 25} ${chartHeight}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ overflow: 'visible' }}
    >
      {/* Y-axis labels */}
      <text
        x="5"
        y="15"
        fontSize="10"
        fill="var(--text-quaternary)"
        fontFamily="var(--font-mono)"
      >
        10h
      </text>
      <text
        x="5"
        y="65"
        fontSize="10"
        fill="var(--text-quaternary)"
        fontFamily="var(--font-mono)"
      >
        5h
      </text>

      {/* Bars */}
      {sleepData.map((day, i) => {
        const barHeight = (day.hours / maxHours) * 100;
        const x = i * barSpacing + 25;
        const y = 100 - barHeight;
        const color = getQualityColor(day.quality);

        return (
          <g key={day.date.toISOString()}>
            {/* Bar */}
            <rect
              x={x - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="4"
              fill={color}
            />
            {/* Day label */}
            <text
              x={x}
              y="115"
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-tertiary)"
              fontFamily="var(--font-sans)"
            >
              {formatDay(day.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================================
// ACTIVITY SPARKLINE
// ============================================================================

interface ActivitySparklineProps {
  activityData: ActivityDay[];
}

export function ActivitySparkline({ activityData }: ActivitySparklineProps) {
  const maxSteps = Math.max(...activityData.map((d) => d.steps));
  const chartHeight = 40;
  const chartWidth = 200;

  // Generate polyline points
  const points = activityData
    .map((day, i) => {
      const x = (i / (activityData.length - 1)) * chartWidth;
      const y = chartHeight - (day.steps / maxSteps) * 35; // 35px max height
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      preserveAspectRatio="none"
      style={{ overflow: 'visible' }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--semantic-info)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// PROGRESS RING (Reusable circular progress)
// ============================================================================

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 6,
  color = 'var(--semantic-success)',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, progress) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          style={{ color: 'var(--bg-muted)' }}
        />
        {/* Progress circle */}
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
          style={{
            color,
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
