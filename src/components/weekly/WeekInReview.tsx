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
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

// getScoreGradient reserved for future use with gradient backgrounds
function _getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-green-500';
  if (score >= 60) return 'from-green-500 to-lime-500';
  if (score >= 40) return 'from-amber-500 to-yellow-500';
  return 'from-red-500 to-orange-500';
}

function getTrendIcon(current: number, previous: number, higherIsBetter: boolean = true) {
  const diff = current - previous;
  const improved = higherIsBetter ? diff > 0 : diff < 0;
  const declined = higherIsBetter ? diff < 0 : diff > 0;

  if (Math.abs(diff) < 0.01) {
    return <Minus className="w-4 h-4 text-stone-400" />;
  }
  if (improved) {
    return <TrendingUp className="w-4 h-4 text-emerald-500" />;
  }
  if (declined) {
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  }
  return <Minus className="w-4 h-4 text-stone-400" />;
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
          className="text-stone-100"
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
            <stop offset="0%" stopColor={score >= 60 ? '#10B981' : '#F59E0B'} />
            <stop offset="100%" stopColor={score >= 80 ? '#22C55E' : score >= 60 ? '#84CC16' : '#EF4444'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-light ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-stone-400">Weekly Score</span>
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
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-stone-600" />
        </div>
        {previousValue !== undefined && (
          <div className="flex items-center gap-1">
            {getTrendIcon(value, previousValue, higherIsBetter)}
          </div>
        )}
      </div>
      <div className="text-2xl font-light text-stone-900">
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value.toLocaleString()}
        {unit && <span className="text-sm text-stone-400 ml-1">{unit}</span>}
      </div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}

// ============================================================================
// WINS SECTION
// ============================================================================

function WinsSection({ wins }: { wins: WeeklyReview['wins'] }) {
  if (wins.length === 0) {
    return (
      <div className="bg-stone-50 rounded-xl p-6 text-center">
        <Trophy className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-stone-500 text-sm">No major wins recorded this week.</p>
        <p className="text-stone-400 text-xs mt-1">Every week has potential!</p>
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
    productivity: 'bg-blue-100 text-blue-600',
    health: 'bg-emerald-100 text-emerald-600',
    financial: 'bg-amber-100 text-amber-600',
    relationships: 'bg-purple-100 text-purple-600',
    personal: 'bg-pink-100 text-pink-600',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="font-medium text-stone-900">This Week&apos;s Wins</h3>
      </div>
      <div className="grid gap-2">
        {wins.map((win, i) => {
          const Icon = categoryIcons[win.category] || Sparkles;
          const colors = categoryColors[win.category] || 'bg-stone-100 text-stone-600';

          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100"
            >
              <div className={`w-8 h-8 rounded-lg ${colors} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-stone-900">{win.title}</div>
                <div className="text-xs text-stone-500 capitalize">{win.category}</div>
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
      <h3 className="font-medium text-stone-900">Lessons for Next Week</h3>
      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs text-stone-600 flex-shrink-0">
              {i + 1}
            </div>
            <p className="text-sm text-stone-700">{lesson}</p>
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
      <h3 className="font-medium text-stone-900">Next Week&apos;s Focus</h3>
      <div className="space-y-2">
        {focus.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-sm text-stone-700">{item}</span>
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
        <h2 className="text-2xl font-light text-stone-900 mb-1">Week in Review</h2>
        <p className="text-stone-500">
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
