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
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'healthy':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'needs_attention':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'at_risk':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
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
    <div className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-500 font-medium text-lg">
          {relationship.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900 truncate">
              {relationship.name}
            </h3>
            <span className="text-stone-400">{getRelationshipIcon(relationship.type)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(health.status)}`}
            >
              {getStatusLabel(health.status)}
            </span>
            {birthdayInfo && (
              <span className={`text-xs flex items-center gap-1 ${birthdayInfo.isToday ? 'text-pink-600' : 'text-stone-500'}`}>
                <Cake className="w-3 h-3" />
                {birthdayInfo.text}
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={`text-2xl font-light ${health.score >= 70 ? 'text-emerald-600' : health.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {health.score}
          </div>
          <div className="text-xs text-stone-400 flex items-center justify-end gap-1">
            {health.trend === 'improving' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
            {health.trend === 'declining' && <TrendingDown className="w-3 h-3 text-red-500" />}
            score
          </div>
        </div>
      </div>

      {/* Last contact */}
      <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
        <Clock className="w-4 h-4" />
        <span>Last contact: {formatDaysAgo(relationship.daysSinceContact)}</span>
        {health.overdueBy > 0 && (
          <span className="text-amber-600">
            ({health.overdueBy} days overdue)
          </span>
        )}
      </div>

      {/* Notes */}
      {relationship.notes && (
        <p className="text-sm text-stone-600 mb-4 bg-stone-50 p-3 rounded-lg">
          {relationship.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onAction?.('call', relationship.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition"
        >
          <Phone className="w-4 h-4" />
          Call
        </button>
        <button
          onClick={() => onAction?.('text', relationship.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition"
        >
          <MessageSquare className="w-4 h-4" />
          Text
        </button>
        <button
          onClick={() => onAction?.('email', relationship.id)}
          className="py-2 px-3 border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition"
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
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-stone-200 hover:shadow-sm transition">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-500 font-medium flex-shrink-0">
        {relationship.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900 truncate">{relationship.name}</span>
          {birthdayInfo?.isToday && <span className="text-pink-500">🎂</span>}
        </div>
        <div className="text-xs text-stone-500">
          {formatDaysAgo(relationship.daysSinceContact)}
          {health.overdueBy > 0 && (
            <span className="text-amber-600 ml-1">• {health.overdueBy}d overdue</span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        health.status === 'thriving' || health.status === 'healthy' ? 'bg-emerald-500' :
        health.status === 'needs_attention' ? 'bg-yellow-500' :
        health.status === 'at_risk' ? 'bg-orange-500' : 'bg-red-500'
      }`} />

      {/* Quick action */}
      <button
        onClick={() => onAction?.('text', relationship.id)}
        className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition"
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
      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 text-sm font-medium">
        {relationship.name.charAt(0)}
      </div>
      <span className="text-sm text-stone-700">{relationship.name}</span>
      <span className="text-xs text-stone-400 ml-auto">
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
          <h3 className="text-sm font-medium text-stone-700">{title}</h3>
          {showViewAll && hasMore && (
            <button
              onClick={onViewAll}
              className="text-xs text-stone-500 hover:text-stone-700"
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
