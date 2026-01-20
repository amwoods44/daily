'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, ChevronRight, ChevronDown, ExternalLink, Check, Calendar, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { VaultReminder, VaultItem } from '@/lib/vault';
import { CATEGORY_META, dismissReminder, snoozeReminder } from '@/lib/vault';

interface NeedsAttentionListProps {
  reminders: VaultReminder[];
  items: VaultItem[];
  onUpdate?: () => void;
}

function getItemForReminder(
  reminder: VaultReminder,
  items: VaultItem[]
): VaultItem | undefined {
  return items.find((item) => item.id === reminder.itemId);
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface ReminderCardProps {
  reminder: VaultReminder;
  item: VaultItem;
  isExpanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  onSnooze: (days: number) => void;
  onViewFull: () => void;
  onMarkComplete: () => void;
}

function ReminderCard({
  reminder,
  item,
  isExpanded,
  onToggle,
  onDismiss,
  onSnooze,
  onViewFull,
  onMarkComplete,
}: ReminderCardProps) {
  const meta = CATEGORY_META[item.category];
  const days = daysUntil(reminder.dueDate);

  const getPriorityStyles = (priority: VaultReminder['priority']) => {
    switch (priority) {
      case 'high':
        return {
          border: '1px solid var(--error)',
          backgroundColor: isExpanded ? 'var(--error-subtle)' : 'var(--bg-card)',
        };
      case 'medium':
        return {
          border: '1px solid var(--warning)',
          backgroundColor: isExpanded ? 'var(--warning-subtle)' : 'var(--bg-card)',
        };
      default:
        return {
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)',
        };
    }
  };

  const getPriorityBadgeStyles = (priority: VaultReminder['priority']) => {
    switch (priority) {
      case 'high':
        return {
          backgroundColor: 'var(--error-subtle)',
          color: 'var(--error)',
        };
      case 'medium':
        return {
          backgroundColor: 'var(--warning-subtle)',
          color: 'var(--warning)',
        };
      default:
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)',
        };
    }
  };

  return (
    <div
      className="rounded-xl transition-all overflow-hidden"
      style={{
        ...getPriorityStyles(reminder.priority),
        boxShadow: isExpanded ? 'var(--shadow-md)' : 'none',
      }}
    >
      {/* Main row - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start gap-3"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {reminder.priority === 'high' ? (
            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--error)' }} />
          ) : (
            <span className="text-xl">{meta?.emoji || '📌'}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {reminder.title}
              </h4>
              {!isExpanded && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {reminder.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={getPriorityBadgeStyles(reminder.priority)}
              >
                {days < 0
                  ? `${Math.abs(days)}d overdue`
                  : days === 0
                    ? 'Today'
                    : `${days}d left`}
              </span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              ) : (
                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div
          className="px-4 pb-4"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Full message */}
          <p
            className="text-sm py-3"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          >
            {reminder.message}
          </p>

          {/* Item details */}
          <div
            className="p-3 rounded-lg mb-4"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{meta?.emoji || '📌'}</span>
              <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                {item.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              >
                {meta?.label || item.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due: {formatDate(reminder.dueDate)}
              </span>
              {item.currentValue && (
                <span>${item.currentValue.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--success)',
                color: 'var(--text-on-accent)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Check className="w-3.5 h-3.5" />
              Mark Complete
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSnooze(1);
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Clock className="w-3 h-3" />
                +1d
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSnooze(3);
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                +3d
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSnooze(7);
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                +7d
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewFull();
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium ml-auto"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--accent)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <ExternalLink className="w-3 h-3" />
              View Full
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="flex items-center gap-1 px-2 py-2 rounded-lg text-xs"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function NeedsAttentionList({ reminders, items, onUpdate }: NeedsAttentionListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter to only active reminders (not dismissed, not snoozed)
  const activeReminders = reminders.filter((r) => {
    if (r.dismissed) return false;
    if (r.snoozedUntil) {
      const today = new Date().toISOString().split('T')[0];
      if (r.snoozedUntil > today) return false;
    }
    return true;
  });

  if (activeReminders.length === 0) {
    return null;
  }

  const handleDismiss = async (id: string) => {
    await dismissReminder(id);
    setExpandedId(null);
    onUpdate?.();
  };

  const handleSnooze = async (id: string, days: number) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    await snoozeReminder(id, snoozeDate.toISOString().split('T')[0]);
    setExpandedId(null);
    onUpdate?.();
  };

  const handleMarkComplete = async (id: string) => {
    // For now, dismissing acts as "complete"
    await dismissReminder(id);
    setExpandedId(null);
    onUpdate?.();
  };

  const handleViewFull = (itemId: string) => {
    router.push(`/vault/${itemId}`);
  };

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Group by priority
  const highPriority = activeReminders.filter((r) => r.priority === 'high');
  const otherPriority = activeReminders.filter((r) => r.priority !== 'high');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Needs Attention
        </h2>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: activeReminders.some((r) => r.priority === 'high')
              ? 'var(--error-subtle)'
              : 'var(--bg-tertiary)',
            color: activeReminders.some((r) => r.priority === 'high')
              ? 'var(--error)'
              : 'var(--text-muted)',
          }}
        >
          {activeReminders.length} {activeReminders.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* High priority first */}
      {highPriority.length > 0 && (
        <div className="space-y-2">
          {highPriority.map((reminder) => {
            const item = getItemForReminder(reminder, items);
            if (!item) return null;
            return (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                item={item}
                isExpanded={expandedId === reminder.id}
                onToggle={() => handleToggle(reminder.id)}
                onDismiss={() => handleDismiss(reminder.id)}
                onSnooze={(days) => handleSnooze(reminder.id, days)}
                onViewFull={() => handleViewFull(item.id)}
                onMarkComplete={() => handleMarkComplete(reminder.id)}
              />
            );
          })}
        </div>
      )}

      {/* Other priorities */}
      {otherPriority.length > 0 && (
        <div className="space-y-2">
          {otherPriority.map((reminder) => {
            const item = getItemForReminder(reminder, items);
            if (!item) return null;
            return (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                item={item}
                isExpanded={expandedId === reminder.id}
                onToggle={() => handleToggle(reminder.id)}
                onDismiss={() => handleDismiss(reminder.id)}
                onSnooze={(days) => handleSnooze(reminder.id, days)}
                onViewFull={() => handleViewFull(item.id)}
                onMarkComplete={() => handleMarkComplete(reminder.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
