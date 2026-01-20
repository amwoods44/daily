'use client';

import React from 'react';
import {
  CheckSquare,
  Calendar,
  Moon,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Target,
  Sparkles,
} from 'lucide-react';
import type { WeeklyReview } from '@/lib/types';

// ============================================================================
// TYPES
// ============================================================================

interface WeekInReviewProps {
  review: WeeklyReview;
  previousReview?: WeeklyReview;
}

// ============================================================================
// HELPERS
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-[var(--semantic-success)]';
  if (score >= 60) return 'text-[var(--semantic-success)]';
  if (score >= 40) return 'text-[var(--semantic-warning)]';
  return 'text-[var(--semantic-error)]';
}

// getScoreGradient reserved for future use with gradient backgrounds
function _getScoreGradient(score: number): string {
  if (score >= 80) return 'bg-[var(--semantic-success)]';
  if (score >= 60) return 'bg-[var(--semantic-success)]';
  if (score >= 40) return 'bg-[var(--semantic-warning)]';
  return 'bg-[var(--semantic-error)]';
}

function getTrendIcon(current: number, previous: number, higherIsBetter: boolean = true) {
  const diff = current - previous;
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const declined = higherIsBetter ? diff < 0 : diff > 0;

  if (Math.abs(diff) < 0.01) {
    return <Minus className="w-4 h-4 text-[var(--text-tertiary)]" />;
  }
  if (improved) {
    return <TrendingUp className="w-4 h-4 text-[var(--semantic-success)]" />;
  }
  if (declined) {
    return <TrendingDown className="w-4 h-4 text-[var(--semantic-error)]" />;
  }
  return <Minus className="w-4 h-4 text-[var(--text-tertiary)]" />;
}

function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });

  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()} - ${endDate.getDate()}`;
  }
  return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}`;
}

// ============================================================================
// SCORE RING
// ============================================================================

function ScoreRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-[var(--bg-muted)]"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={score >= 60 ? 'var(--semantic-success)' : 'var(--semantic-warning)'} />
            <stop offset="100%" stopColor={score >= 80 ? 'var(--semantic-success-vivid)' : score >= 60 ? 'var(--semantic-success)' : 'var(--semantic-error)'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-light ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-[var(--text-tertiary)]">Weekly Score</span>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  previousValue,
  unit,
  higherIsBetter = true,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  higherIsBetter?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        {previousValue !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon(value, previousValue, higherIsBetter)}
          </div>
        )}
      </div>
      <div className="text-2xl font-light text-[var(--text-primary)]">
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
        {unit && <span className="text-sm text-[var(--text-tertiary)] ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-[var(--text-secondary)] mt-1">{label}</div>
    </div>
  );
}

// ============================================================================
// WINS SECTION
// ============================================================================

function WinsSection({ wins }: { wins: WeeklyReview['wins'] }) {
  if (wins.length === 0) {
    return (
      <div className="bg-[var(--bg-muted)] rounded-xl p-6 text-center">
        <Trophy className="w-8 h-8 text-[var(--text-quaternary)] mx-auto mb-2" />
        <p className="text-[var(--text-secondary)] text-sm">No major wins recorded this week.</p>
        <p className="text-[var(--text-tertiary)] text-xs mt-1">Every week has potential!</p>
      </div>
    );
  }

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    productivity: Target,
    health: Moon,
    financial: DollarSign,
    relationships: Users,
    personal: Sparkles,
  };

  const categoryColors: Record<string, string> = {
    productivity: 'bg-[var(--semantic-info-subtle)] text-[var(--semantic-info)]',
    health: 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)]',
    financial: 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)]',
    relationships: 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]',
    personal: 'bg-[var(--bg-accent-subtle)] text-[var(--brand-primary-vivid)]',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[var(--semantic-warning)]" />
        <h3 className="font-medium text-[var(--text-primary)]">This Week&apos;s Wins</h3>
      </div>
      <div className="grid gap-2">
        {wins.map((win, i) => {
          const Icon = categoryIcons[win.category] || Sparkles;
          const colors = categoryColors[win.category] || 'bg-[var(--bg-muted)] text-[var(--text-secondary)]';

          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-[var(--semantic-warning-subtle)] rounded-lg border border-[var(--semantic-warning)]"
            >
              <div className={`w-8 h-8 rounded-lg ${colors} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-[var(--text-primary)]">{win.title}</div>
                <div className="text-xs text-[var(--text-secondary)] capitalize">{win.category}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// LESSONS SECTION
// ============================================================================

function LessonsSection({ lessons }: { lessons: string[] }) {
  if (lessons.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-[var(--text-primary)]">Lessons for Next Week</h3>
      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-[var(--bg-muted)] rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--border-default)] flex items-center justify-center text-xs text-[var(--text-secondary)] flex-shrink-0">
              {i + 1}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{lesson}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// FOCUS SECTION
// ============================================================================

function FocusSection({ focus }: { focus: string[] }) {
  if (focus.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-[var(--text-primary)]">Next Week&apos;s Focus</h3>
      <div className="space-y-2">
        {focus.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-[var(--semantic-info-subtle)] rounded-lg border border-[var(--semantic-info)]"
          >
            <div className="w-6 h-6 rounded-full bg-[var(--semantic-info)] text-[var(--text-on-accent)] flex items-center justify-center text-xs flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-sm text-[var(--text-secondary)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function WeekInReview({ review, previousReview }: WeekInReviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-light text-[var(--text-primary)] mb-1">Week in Review</h2>
        <p className="text-[var(--text-secondary)]">
          {formatDateRange(review.weekStart, review.weekEnd)}
        </p>
      </div>

      {/* Score */}
      <div className="flex justify-center">
        <ScoreRing score={review.score} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={CheckSquare}
          label="Tasks Completed"
          value={review.stats.tasksCompleted}
          previousValue={previousReview?.stats.tasksCompleted}
        />
        <StatCard
          icon={Calendar}
          label="Meetings"
          value={review.stats.meetingsAttended}
          previousValue={previousReview?.stats.meetingsAttended}
          higherIsBetter={false}
        />
        <StatCard
          icon={Moon}
          label="Avg Sleep"
          value={review.stats.averageSleep}
          previousValue={previousReview?.stats.averageSleep}
          unit="hrs"
        />
        <StatCard
          icon={DollarSign}
          label="Total Spent"
          value={review.stats.totalSpending}
          previousValue={previousReview?.stats.totalSpending}
          unit=""
          higherIsBetter={false}
        />
      </div>

      {/* Wins */}
      <WinsSection wins={review.wins} />

      {/* Lessons */}
      <LessonsSection lessons={review.lessons} />

      {/* Focus */}
      <FocusSection focus={review.nextWeekFocus} />
    </div>
  );
}

export default WeekInReview;
