'use client';

import React from 'react';
import type { HealthInsight } from '@/lib/health-mock-data';

interface AgentHealthFeedProps {
  insights: HealthInsight[];
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getInsightStyles(type: HealthInsight['type']) {
  switch (type) {
    case 'warning':
      return {
        backgroundColor: 'var(--semantic-warning-subtle)',
        color: 'var(--semantic-warning)',
        borderColor: 'var(--semantic-warning)',
      };
    case 'alert':
      return {
        backgroundColor: 'var(--semantic-error-subtle)',
        color: 'var(--semantic-error)',
        borderColor: 'var(--semantic-error)',
      };
    case 'reminder':
      return {
        backgroundColor: 'var(--semantic-info-subtle)',
        color: 'var(--semantic-info)',
        borderColor: 'var(--semantic-info)',
      };
    case 'celebration':
      return {
        backgroundColor: 'var(--semantic-success-subtle)',
        color: 'var(--semantic-success)',
        borderColor: 'var(--semantic-success)',
      };
    default:
      return {
        backgroundColor: 'var(--bg-muted)',
        color: 'var(--text-secondary)',
        borderColor: 'var(--border-subtle)',
      };
  }
}

// ============================================================================
// INSIGHT ITEM
// ============================================================================

function InsightItem({ insight }: { insight: HealthInsight }) {
  const styles = getInsightStyles(insight.type);

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
      {/* Emoji */}
      <div
        style={{
          fontSize: '24px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {insight.emoji}
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
          {insight.title}
        </div>
        <div
          className="text-body-sm"
          style={{
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-1)',
          }}
        >
          {insight.description}
        </div>
        <div
          className="text-mono-sm"
          style={{
            color: 'var(--text-tertiary)',
            marginTop: 'var(--space-2)',
          }}
        >
          {formatTimestamp(insight.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AgentHealthFeed({ insights }: AgentHealthFeedProps) {
  return (
    <section
      className="card-accent"
      style={{ marginTop: 'var(--space-12)' }}
    >
      {/* Section Header */}
      <div className="section-header">
        <span className="text-label-sm" style={{ color: 'var(--brand-primary)' }}>
          Health Insights
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
          {insights.length}
        </span>
      </div>

      {/* Insights Feed */}
      <div className="stack-md">
        {insights.map((insight) => (
          <InsightItem key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Empty State */}
      {insights.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-12) var(--space-6)',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: 'var(--space-4)' }}>
            ✅
          </span>
          <p
            className="text-body"
            style={{ color: 'var(--text-secondary)' }}
          >
            All systems green. No health alerts right now.
          </p>
        </div>
      )}
    </section>
  );
}

export default AgentHealthFeed;
