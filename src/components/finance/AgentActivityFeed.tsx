'use client';

import React from 'react';
import {
  AlertTriangle,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Info,
} from 'lucide-react';
import type { AgentActivity } from '@/lib/finance-data';

interface AgentActivityFeedProps {
  activities: AgentActivity[];
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getActivityIcon(type: AgentActivity['type']) {
  switch (type) {
    case 'bill_reminder':
      return AlertTriangle;
    case 'cashback':
      return DollarSign;
    case 'budget_alert':
      return TrendingUp;
    case 'auto_payment':
      return CheckCircle;
    case 'investment':
      return TrendingUp;
    case 'spending_insight':
      return Info;
    default:
      return Info;
  }
}

function getStatusStyles(status: AgentActivity['status']) {
  switch (status) {
    case 'success':
      return {
        backgroundColor: 'var(--semantic-success-subtle)',
        color: 'var(--semantic-success)',
        borderColor: 'var(--semantic-success)',
      };
    case 'warning':
      return {
        backgroundColor: 'var(--semantic-warning-subtle)',
        color: 'var(--semantic-warning)',
        borderColor: 'var(--semantic-warning)',
      };
    case 'error':
      return {
        backgroundColor: 'var(--semantic-error-subtle)',
        color: 'var(--semantic-error)',
        borderColor: 'var(--semantic-error)',
      };
    case 'info':
    default:
      return {
        backgroundColor: 'var(--semantic-info-subtle)',
        color: 'var(--semantic-info)',
        borderColor: 'var(--semantic-info)',
      };
  }
}

// ============================================================================
// ACTIVITY ITEM
// ============================================================================

function ActivityItem({ activity }: { activity: AgentActivity }) {
  const Icon = getActivityIcon(activity.type);
  const styles = getStatusStyles(activity.status);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'start',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: styles.backgroundColor,
        border: `1px solid ${styles.borderColor}`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: styles.color,
          opacity: 0.15,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon
          className="w-4 h-4"
          style={{ color: styles.color }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="text-body"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 'var(--weight-medium)',
          }}
        >
          {activity.description}
        </div>
        <div
          className="text-mono-sm"
          style={{
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-1)',
          }}
        >
          {formatTimestamp(activity.timestamp)}
        </div>
      </div>

      {/* Badge (if exists) */}
      {activity.badge && (
        <div
          className="text-mono-sm"
          style={{
            padding: 'var(--space-1-5) var(--space-3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            color: styles.color,
            fontWeight: 'var(--weight-semibold)',
            flexShrink: 0,
          }}
        >
          {activity.badge}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AgentActivityFeed({ activities }: AgentActivityFeedProps) {
  return (
    <section className="card-accent">
      {/* Section Header */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          Agent Activity
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
          {activities.length}
        </span>
      </div>

      {/* Activity Feed */}
      <div className="stack-md">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Empty State */}
      {activities.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-6)',
          }}
        >
          <CheckCircle
            className="w-8 h-8"
            style={{
              color: 'var(--text-tertiary)',
              margin: '0 auto var(--space-4)',
            }}
          />
          <p
            className="text-body"
            style={{ color: 'var(--text-secondary)' }}
          >
            All quiet on the finance front
          </p>
        </div>
      )}
    </section>
  );
}

export default AgentActivityFeed;
