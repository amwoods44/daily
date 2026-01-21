'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Heart,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import type { Relationship } from '@/lib/mock-data';
import {
  calculateOverallRelationshipHealth,
  type RelationshipHealth as RelationshipHealthType,
} from '@/lib/relationships/relationship-engine';

// ============================================================================
// TYPES
// ============================================================================

interface RelationshipHealthProps {
  relationships: Relationship[];
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

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Thriving';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs work';
  return 'At risk';
}

// ============================================================================
// SCORE CIRCLE COMPONENT
// ============================================================================

function ScoreCircle({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const radius = size === 'lg' ? 45 : size === 'md' ? 35 : 25;
  const strokeWidth = size === 'lg' ? 6 : size === 'md' ? 5 : 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[var(--border-default)]"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className={getScoreColor(score)}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${textClasses[size]} font-light ${getScoreColor(score)}`}>
        {score}
      </div>
    </div>
  );
}

// ============================================================================
// PRIORITY ITEM COMPONENT
// ============================================================================

function PriorityItem({
  health,
  onClick,
}: {
  health: RelationshipHealthType;
  onClick?: () => void;
}) {
  const urgencyColors = {
    high: 'bg-[var(--semantic-error-subtle)] border-[var(--semantic-error)]',
    medium: 'bg-[var(--semantic-warning-subtle)] border-[var(--semantic-warning)]',
    low: 'bg-[var(--semantic-warning-subtle)] border-[var(--semantic-warning)]',
    none: 'bg-[var(--bg-muted)] border-[var(--border-default)]',
  };

  const urgencyIcons = {
    high: <AlertTriangle className="w-4 h-4 text-[var(--semantic-error)]" />,
    medium: <AlertTriangle className="w-4 h-4 text-[var(--semantic-warning)]" />,
    low: <Minus className="w-4 h-4 text-[var(--semantic-warning)]" />,
    none: <CheckCircle className="w-4 h-4 text-[var(--semantic-success)]" />,
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border ${urgencyColors[health.urgency]} hover:shadow-sm transition text-left`}
    >
      {urgencyIcons[health.urgency]}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)] truncate">{health.personName}</div>
        <div className="text-xs text-[var(--text-secondary)]">
          {health.overdueBy > 0
            ? `${health.overdueBy} days overdue`
            : `Last contact ${health.daysSinceContact} days ago`}
        </div>
      </div>
      {health.nextAction && (
        <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
      )}
    </button>
  );
}

// ============================================================================
// FULL VARIANT
// ============================================================================

function FullRelationshipHealth({
  relationships,
  onViewDetails,
}: {
  relationships: Relationship[];
  onViewDetails?: () => void;
}) {
  const overall = calculateOverallRelationshipHealth(relationships);

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-6">
      {/* Header with score */}
      <div className="flex items-start gap-6 mb-6">
        <ScoreCircle score={overall.score} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Relationship Health
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {getScoreLabel(overall.score)}
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[var(--semantic-success)]" />
              <span className="text-[var(--text-secondary)]">{overall.healthyCount} healthy</span>
            </div>
            {overall.atRiskCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-[var(--semantic-warning)]" />
                <span className="text-[var(--text-secondary)]">{overall.atRiskCount} at risk</span>
              </div>
            )}
            {overall.criticalCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-[var(--semantic-error)]" />
                <span className="text-[var(--text-secondary)]">{overall.criticalCount} critical</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priorities */}
      {overall.topPriorities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Needs your attention
          </h4>
          <div className="space-y-2">
            {overall.topPriorities.map((priority) => (
              <PriorityItem key={priority.personId} health={priority} />
            ))}
          </div>
        </div>
      )}

      {/* View all button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="mt-4 w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center justify-center gap-1"
        >
          View all relationships
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

function CompactRelationshipHealth({
  relationships,
  onViewDetails,
}: {
  relationships: Relationship[];
  onViewDetails?: () => void;
}) {
  const overall = calculateOverallRelationshipHealth(relationships);

  return (
    <button
      onClick={onViewDetails}
      className="w-full flex items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] hover:shadow-sm transition text-left"
    >
      <div className={`w-12 h-12 rounded-full ${getScoreBackground(overall.score)} flex items-center justify-center`}>
        <Users className={`w-6 h-6 ${getScoreColor(overall.score)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[var(--text-primary)]">Relationships</div>
        <div className="text-sm text-[var(--text-secondary)]">
          {overall.healthyCount} healthy
          {overall.atRiskCount > 0 && ` • ${overall.atRiskCount} need attention`}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-light ${getScoreColor(overall.score)}`}>
          {overall.score}
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

function MinimalRelationshipHealth({
  relationships,
}: {
  relationships: Relationship[];
}) {
  const overall = calculateOverallRelationshipHealth(relationships);

  return (
    <div className="flex items-center gap-3">
      <Users className={`w-5 h-5 ${getScoreColor(overall.score)}`} />
      <div className="flex-1">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Relationships</div>
      </div>
      <div className={`text-lg font-light ${getScoreColor(overall.score)}`}>
        {overall.score}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function RelationshipHealthCard({
  relationships,
  onViewDetails,
  variant = 'full',
}: RelationshipHealthProps) {
  if (variant === 'minimal') {
    return <MinimalRelationshipHealth relationships={relationships} />;
  }

  if (variant === 'compact') {
    return (
      <CompactRelationshipHealth
        relationships={relationships}
        onViewDetails={onViewDetails}
      />
    );
  }

  return (
    <FullRelationshipHealth
      relationships={relationships}
      onViewDetails={onViewDetails}
    />
  );
}

export default RelationshipHealthCard;
