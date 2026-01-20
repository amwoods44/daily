'use client';

import React from 'react';
import {
  Phone,
  MessageSquare,
  Mail,
  Video,
  Clock,
  Heart,
  Users,
  Briefcase,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Cake,
} from 'lucide-react';
import type { Relationship } from '@/lib/mock-data';
import { calculateRelationshipHealth, type RelationshipHealth } from '@/lib/relationships/relationship-engine';

// ============================================================================
// TYPES
// ============================================================================

interface PersonCardProps {
  relationship: Relationship;
  onAction?: (action: string, personId: string) => void;
  variant?: 'full' | 'compact' | 'minimal';
  showActions?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

function getRelationshipIcon(type: Relationship['type']) {
  switch (type) {
    case 'family':
      return <Users className="w-4 h-4" />;
    case 'romantic':
      return <Heart className="w-4 h-4" />;
    case 'professional':
      return <Briefcase className="w-4 h-4" />;
    default:
      return <Users className="w-4 h-4" />;
  }
}

function getStatusColor(status: RelationshipHealth['status']) {
  switch (status) {
    case 'thriving':
      return 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)] border-[var(--semantic-success)]';
    case 'healthy':
      return 'bg-[var(--semantic-success-subtle)] text-[var(--semantic-success)] border-[var(--semantic-success)]';
    case 'needs_attention':
      return 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)] border-[var(--semantic-warning)]';
    case 'at_risk':
      return 'bg-[var(--semantic-warning-subtle)] text-[var(--semantic-warning)] border-[var(--semantic-warning)]';
    case 'critical':
      return 'bg-[var(--semantic-error-subtle)] text-[var(--semantic-error)] border-[var(--semantic-error)]';
    default:
      return 'bg-[var(--bg-muted)] text-[var(--text-primary)] border-[var(--border-default)]';
  }
}

function getStatusLabel(status: RelationshipHealth['status']) {
  switch (status) {
    case 'thriving':
      return 'Thriving';
    case 'healthy':
      return 'Healthy';
    case 'needs_attention':
      return 'Needs attention';
    case 'at_risk':
      return 'At risk';
    case 'critical':
      return 'Critical';
    default:
      return status;
  }
}

function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
}

function getBirthdayInfo(birthday?: string): { text: string; isToday: boolean; isSoon: boolean } | null {
  if (!birthday) return null;

  const [month, day] = birthday.split('-').map(Number);
  const today = new Date();
  const thisYear = today.getFullYear();

  let birthdayDate = new Date(thisYear, month - 1, day);
  if (birthdayDate < today) {
    birthdayDate = new Date(thisYear + 1, month - 1, day);
  }

  const daysUntil = Math.ceil(
    (birthdayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntil === 0) {
    return { text: 'Birthday today! 🎂', isToday: true, isSoon: false };
  } else if (daysUntil === 1) {
    return { text: 'Birthday tomorrow', isToday: false, isSoon: true };
  } else if (daysUntil <= 7) {
    return { text: `Birthday in ${daysUntil} days`, isToday: false, isSoon: true };
  }

  return null;
}

// ============================================================================
// FULL CARD VARIANT
// ============================================================================

function FullPersonCard({
  relationship,
  health,
  birthdayInfo,
  onAction,
}: {
  relationship: Relationship;
  health: RelationshipHealth;
  birthdayInfo: ReturnType<typeof getBirthdayInfo>;
  onAction?: (action: string, personId: string) => void;
}) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-default)] p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--bg-muted)] to-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] font-medium text-lg">
          {relationship.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--text-primary)] truncate">
              {relationship.name}
            </h3>
            <span className="text-[var(--text-tertiary)]">{getRelationshipIcon(relationship.type)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(health.status)}`}
            >
              {getStatusLabel(health.status)}
            </span>
            {birthdayInfo && (
              <span className={`text-xs flex items-center gap-1 ${birthdayInfo.isToday ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]'}`}>
                <Cake className="w-3 h-3" />
                {birthdayInfo.text}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={`text-2xl font-light ${health.score >= 70 ? 'text-[var(--semantic-success)]' : health.score >= 50 ? 'text-[var(--semantic-warning)]' : 'text-[var(--semantic-error)]'}`}>
            {health.score}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] flex items-center justify-end gap-1">
            {health.trend === 'improving' && <TrendingUp className="w-3 h-3 text-[var(--semantic-success)]" />}
            {health.trend === 'declining' && <TrendingDown className="w-3 h-3 text-[var(--semantic-error)]" />}
            score
          </div>
        </div>
      </div>

      {/* Last contact */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
        <Clock className="w-4 h-4" />
        <span>Last contact: {formatDaysAgo(relationship.daysSinceContact)}</span>
        {health.overdueBy > 0 && (
          <span className="text-[var(--semantic-warning)]">
            ({health.overdueBy} days overdue)
          </span>
        )}
      </div>

      {/* Notes */}
      {relationship.notes && (
        <p className="text-sm text-[var(--text-secondary)] mb-4 bg-[var(--bg-muted)] p-3 rounded-lg">
          {relationship.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onAction?.('call', relationship.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-[var(--text-primary)] text-[var(--text-inverse)] rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        <button
          onClick={() => onAction?.('text', relationship.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--bg-muted)] transition"
        >
          <MessageSquare className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => onAction?.('email', relationship.id)}
          className="py-2 px-3 border border-[var(--border-default)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--bg-muted)] transition"
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT CARD VARIANT
// ============================================================================

function CompactPersonCard({
  relationship,
  health,
  birthdayInfo,
  onAction,
}: {
  relationship: Relationship;
  health: RelationshipHealth;
  birthdayInfo: ReturnType<typeof getBirthdayInfo>;
  onAction?: (action: string, personId: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] hover:shadow-sm transition">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--bg-muted)] to-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] font-medium flex-shrink-0">
        {relationship.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--text-primary)] truncate">{relationship.name}</span>
          {birthdayInfo?.isToday && <span className="text-[var(--brand-primary)]">🎂</span>}
        </div>
        <div className="text-xs text-[var(--text-secondary)]">
          {formatDaysAgo(relationship.daysSinceContact)}
          {health.overdueBy > 0 && (
            <span className="text-[var(--semantic-warning)] ml-1">• {health.overdueBy}d overdue</span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        health.status === 'thriving' || health.status === 'healthy' ? 'bg-[var(--semantic-success)]' :
        health.status === 'needs_attention' ? 'bg-[var(--semantic-warning)]' :
        health.status === 'at_risk' ? 'bg-[var(--semantic-warning)]' : 'bg-[var(--semantic-error)]'
      }`} />

      {/* Quick action */}
      <button
        onClick={() => onAction?.('text', relationship.id)}
        className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] rounded-lg transition"
      >
        <MessageSquare className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// MINIMAL CARD VARIANT
// ============================================================================

function MinimalPersonCard({
  relationship,
  health,
}: {
  relationship: Relationship;
  health: RelationshipHealth;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] text-sm font-medium">
        {relationship.name.charAt(0)}
      </div>
      <span className="text-sm text-[var(--text-primary)]">{relationship.name}</span>
      <span className="text-xs text-[var(--text-tertiary)] ml-auto">
        {formatDaysAgo(relationship.daysSinceContact)}
      </span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PersonCard({
  relationship,
  onAction,
  variant = 'full',
  showActions = true,
}: PersonCardProps) {
  const health = calculateRelationshipHealth(relationship);
  const birthdayInfo = getBirthdayInfo(relationship.birthday);

  if (variant === 'minimal') {
    return <MinimalPersonCard relationship={relationship} health={health} />;
  }

  if (variant === 'compact') {
    return (
      <CompactPersonCard
        relationship={relationship}
        health={health}
        birthdayInfo={birthdayInfo}
        onAction={showActions ? onAction : undefined}
      />
    );
  }

  return (
    <FullPersonCard
      relationship={relationship}
      health={health}
      birthdayInfo={birthdayInfo}
      onAction={showActions ? onAction : undefined}
    />
  );
}

// ============================================================================
// PERSON LIST COMPONENT
// ============================================================================

interface PersonListProps {
  relationships: Relationship[];
  onAction?: (action: string, personId: string) => void;
  variant?: 'full' | 'compact' | 'minimal';
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function PersonList({
  relationships,
  onAction,
  variant = 'compact',
  title,
  maxItems,
  showViewAll = false,
  onViewAll,
}: PersonListProps) {
  const displayedRelationships = maxItems
    ? relationships.slice(0, maxItems)
    : relationships;

  const hasMore = maxItems && relationships.length > maxItems;

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">{title}</h3>
          {showViewAll && hasMore && (
            <button
              onClick={onViewAll}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              View all ({relationships.length})
            </button>
          )}
        </div>
      )}
      <div className={variant === 'full' ? 'grid gap-4 md:grid-cols-2' : 'space-y-2'}>
        {displayedRelationships.map((rel) => (
          <PersonCard
            key={rel.id}
            relationship={rel}
            onAction={onAction}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

export default PersonCard;
