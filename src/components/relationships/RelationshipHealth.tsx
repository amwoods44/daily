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
          className="text-stone-200"
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
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-yellow-50 border-yellow-200',
    none: 'bg-stone-50 border-stone-200',
  };

  const urgencyIcons = {
    high: <AlertTriangle className="w-4 h-4 text-red-500" />,
    medium: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    low: <Minus className="w-4 h-4 text-yellow-500" />,
    none: <CheckCircle className="w-4 h-4 text-green-500" />,
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border ${urgencyColors[health.urgency]} hover:shadow-sm transition text-left`}
    >
      {urgencyIcons[health.urgency]}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900 truncate">{health.personName}</div>
        <div className="text-xs text-stone-500">
          {health.overdueBy > 0
            ? `${health.overdueBy} days overdue`
            : `Last contact ${health.daysSinceContact} days ago`}
        </div>
      </div>
      {health.nextAction && (
        <ChevronRight className="w-4 h-4 text-stone-400" />
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
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      {/* Header with score */}
      <div className="flex items-start gap-6 mb-6">
        <ScoreCircle score={overall.score} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-stone-900 mb-1">
            Relationship Health
          </h3>
          <p className="text-sm text-stone-500 mb-3">
            {getScoreLabel(overall.score)}
          </p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-stone-600">{overall.healthyCount} healthy</span>
            </div>
            {overall.atRiskCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-stone-600">{overall.atRiskCount} at risk</span>
              </div>
            )}
            {overall.criticalCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-stone-600">{overall.criticalCount} critical</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priorities */}
      {overall.topPriorities.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-stone-700 mb-3">
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
          className="mt-4 w-full py-2 text-sm text-stone-500 hover:text-stone-700 transition flex items-center justify-center gap-1"
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
      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:shadow-sm transition text-left"
    >
      <div className={`w-12 h-12 rounded-full ${getScoreBackground(overall.score)} flex items-center justify-center`}>
        <Users className={`w-6 h-6 ${getScoreColor(overall.score)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-stone-900">Relationships</div>
        <div className="text-sm text-stone-500">
          {overall.healthyCount} healthy
          {overall.atRiskCount > 0 && ` • ${overall.atRiskCount} need attention`}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-2xl font-light ${getScoreColor(overall.score)}`}>
          {overall.score}
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
        <div className="text-sm font-medium text-stone-700">Relationships</div>
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
