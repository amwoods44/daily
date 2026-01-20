'use client';

import { useState } from 'react';
import { Moon, Calendar, CreditCard, Heart, Users, TrendingUp, ChevronDown } from 'lucide-react';

type PulseStatus = 'good' | 'attention' | 'urgent';

interface PulseItem {
  id: string;
  label: string;
  value: string;
  status: PulseStatus;
  icon: React.ElementType;
  detail?: {
    headline: string;
    subtext: string;
    insight?: string;
    progress?: number;
  };
}

interface LifePulseStripProps {
  items: PulseItem[];
}

function PulseOrb({ status, isExpanded }: { status: PulseStatus; isExpanded: boolean }) {
  const statusColors = {
    good: {
      bg: 'var(--semantic-success)',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
    attention: {
      bg: 'var(--semantic-warning)',
      glow: 'rgba(251, 191, 36, 0.4)',
    },
    urgent: {
      bg: 'var(--semantic-error)',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
  };

  const colors = statusColors[status];

  return (
    <span
      className="pulse-orb"
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: colors.bg,
        boxShadow: `0 0 ${isExpanded ? '12px' : '8px'} ${colors.glow}`,
        transition: 'all 0.3s ease',
        transform: isExpanded ? 'scale(1.2)' : 'scale(1)',
      }}
    />
  );
}

function PulseItemCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: PulseItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;

  return (
    <div className="pulse-item-wrapper">
      <button
        onClick={onToggle}
        className="pulse-item"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 'var(--radius-lg)',
          background: isExpanded ? 'var(--bg-muted)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <PulseOrb status={item.status} isExpanded={isExpanded} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}
        >
          {item.value}
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </span>
      </button>

      {/* Expanded Detail Card */}
      {isExpanded && item.detail && (
        <div
          className="pulse-detail-card"
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 8,
            padding: 16,
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: 240,
            zIndex: 100,
            animation: 'fadeInUp 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon style={{ width: 18, height: 18, color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {item.detail.headline}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {item.detail.subtext}
              </div>
            </div>
          </div>

          {item.detail.progress !== undefined && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'var(--bg-muted)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${item.detail.progress}%`,
                    borderRadius: 3,
                    backgroundColor:
                      item.status === 'good'
                        ? 'var(--semantic-success)'
                        : item.status === 'attention'
                          ? 'var(--semantic-warning)'
                          : 'var(--semantic-error)',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {item.detail.progress}% of target
              </div>
            </div>
          )}

          {item.detail.insight && (
            <div
              style={{
                padding: 10,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-muted)',
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              <span style={{ marginRight: 6 }}>💡</span>
              {item.detail.insight}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LifePulseStrip({ items }: LifePulseStripProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div
      className="life-pulse-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '12px 16px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      {items.map((item, index) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <PulseItemCard
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
          {index < items.length - 1 && (
            <span
              style={{
                width: 1,
                height: 16,
                backgroundColor: 'var(--border-default)',
                margin: '0 4px',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Default mock data for demonstration
export function getDefaultPulseItems(): PulseItem[] {
  return [
    {
      id: 'sleep',
      label: 'sleep',
      value: '6.2h',
      status: 'attention',
      icon: Moon,
      detail: {
        headline: '6.2 hours last night',
        subtext: '6.0h avg this week · 7h target',
        progress: 89,
        insight: "You've slept under 7h for 4 nights. Consider an earlier bedtime.",
      },
    },
    {
      id: 'meetings',
      label: 'meetings',
      value: '3',
      status: 'good',
      icon: Calendar,
      detail: {
        headline: '3 meetings today',
        subtext: '2h 15m total · 195min free',
        insight: 'Your biggest free block is 10:45–14:00.',
      },
    },
    {
      id: 'finances',
      label: 'due Wed',
      value: '$145',
      status: 'urgent',
      icon: CreditCard,
      detail: {
        headline: 'Electric bill due Wednesday',
        subtext: '$145.00 · Auto-pay not set up',
        insight: 'Set up auto-pay to avoid late fees.',
      },
    },
    {
      id: 'habits',
      label: 'habits',
      value: '2/3',
      status: 'attention',
      icon: Heart,
      detail: {
        headline: '2 of 3 habits complete',
        subtext: 'Journal ✓ · Read ✗ · Meditate ✗',
        progress: 67,
        insight: 'Best time for reading: evening after dinner.',
      },
    },
    {
      id: 'waiting',
      label: 'waiting',
      value: '2',
      status: 'urgent',
      icon: Users,
      detail: {
        headline: '2 people waiting on you',
        subtext: 'Sam Patel (18h) · Lisa Wong (12h)',
        insight: 'Sam is a fast responder—he\'ll notice the delay.',
      },
    },
  ];
}
