'use client';

import { useRouter } from 'next/navigation';
import { Paperclip, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import type { VaultItem } from '@/lib/vault';
import { CATEGORY_META } from '@/lib/vault';

interface VaultItemCardProps {
  item: VaultItem;
  showAlert?: boolean;
  alertMessage?: string;
  compact?: boolean;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function VaultItemCard({
  item,
  showAlert,
  alertMessage,
  compact = false,
}: VaultItemCardProps) {
  const router = useRouter();
  const meta = CATEGORY_META[item.category];

  // Determine the most relevant date to show
  const relevantDate = item.expirationDate || item.renewalDate || item.nextActionDate;
  const days = relevantDate ? daysUntil(relevantDate) : null;

  const handleClick = () => {
    router.push(`/vault/${item.id}`);
  };

  const getDaysColor = (d: number) => {
    if (d <= 7) return 'var(--semantic-error)';
    if (d <= 30) return 'var(--semantic-warning)';
    return 'var(--text-tertiary)';
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left p-3 rounded-lg transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{meta?.emoji || '📦'}</span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {item.name}
            </p>
            {relevantDate && days !== null && (
              <p className="text-xs" style={{ color: getDaysColor(days) }}>
                {days < 0
                  ? `${Math.abs(days)}d overdue`
                  : days === 0
                    ? 'Today'
                    : `${days}d`}
              </p>
            )}
          </div>
          {item.currentValue && (
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formatCurrency(item.currentValue)}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-4 rounded-xl transition-all"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Alert banner */}
      {showAlert && alertMessage && (
        <div
          className="flex items-center gap-2 mb-3 p-2 rounded-lg"
          style={{
            backgroundColor: 'var(--semantic-warning-subtle)',
            color: 'var(--semantic-warning)',
          }}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-medium">{alertMessage}</span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Emoji */}
        <div className="shrink-0 mt-0.5">
          <span className="text-2xl">{meta?.emoji || '📦'}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {item.name}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {meta?.label || item.category}
              </p>
            </div>
            {/* Category badge */}
            <span
              className="text-xs px-2 py-1 rounded-md shrink-0 capitalize"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-tertiary)',
              }}
            >
              {item.type}
            </span>
          </div>

          {item.description && (
            <p
              className="text-sm mt-2 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.description}
            </p>
          )}

          {/* Meta row */}
          <div
            className="flex flex-wrap items-center gap-4 mt-3 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {relevantDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(relevantDate)}
                {days !== null && (
                  <span
                    className="ml-1"
                    style={{
                      color: getDaysColor(days),
                      fontWeight: days <= 7 ? 500 : 400,
                    }}
                  >
                    ({days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'today' : `${days}d`})
                  </span>
                )}
              </span>
            )}

            {item.currentValue && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {formatCurrency(item.currentValue)}
              </span>
            )}

            {item.attachments.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                {item.attachments.length}
              </span>
            )}
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
