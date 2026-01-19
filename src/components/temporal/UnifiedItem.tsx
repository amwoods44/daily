'use client';

import {
  Video,
  Check,
  Clock,
  Reply,
  ExternalLink,
  Edit,
  Calendar,
  Mail,
  ListTodo,
  AlertTriangle,
  User,
  CreditCard,
  Phone,
  MessageCircle,
  Eye,
  Bell,
  Package,
  FileText,
  Heart,
  X,
} from 'lucide-react';
import type { UnifiedItem, ItemAction } from '@/lib/temporal-buckets';

interface UnifiedItemCardProps {
  item: UnifiedItem;
  onAction: (actionId: string, item: UnifiedItem) => void;
  isSecondary?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  video: Video,
  check: Check,
  clock: Clock,
  reply: Reply,
  external: ExternalLink,
  edit: Edit,
  calendar: Calendar,
  file: ListTodo,
  'credit-card': CreditCard,
  phone: Phone,
  message: MessageCircle,
  eye: Eye,
  bell: Bell,
  x: X,
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  meeting: Calendar,
  email: Mail,
  task: ListTodo,
  risk: AlertTriangle,
  person_waiting: User,
  habit: Heart,
  bill: CreditCard,
  life_admin: FileText,
  relationship: User,
};

function ActionButton({
  action,
  onClick,
  size = 'default',
}: {
  action: ItemAction;
  onClick: () => void;
  size?: 'default' | 'small';
}) {
  const Icon = action.icon ? ICON_MAP[action.icon] : null;

  const baseStyles =
    size === 'small' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  // Build inline styles based on variant
  const getVariantStyles = (variant: ItemAction['variant']) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent)',
          color: 'var(--text-on-accent)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--error)',
          color: 'white',
        };
      default:
        return {};
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`font-medium rounded-lg transition-all flex items-center gap-1.5 active:scale-[0.98] ${baseStyles}`}
      style={getVariantStyles(action.variant)}
    >
      {Icon && (
        <Icon className={size === 'small' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      )}
      {action.label}
    </button>
  );
}

export function UnifiedItemCard({
  item,
  onAction,
  isSecondary = false,
}: UnifiedItemCardProps) {
  const TypeIcon = TYPE_ICONS[item.type] || ListTodo;

  // Priority-based styling
  const isHighPriority = item.severity === 'high' || item.type === 'risk';
  const isMediumPriority = item.severity === 'medium';
  const isLowPriority = item.severity === 'low' || (!item.severity && !item.urgencyReason);

  // Compute dynamic styles based on priority
  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: 'var(--bg-card)',
      border: 'none',
    };

    if (isHighPriority) {
      return {
        ...baseStyle,
        boxShadow: '0 0 0 1px var(--error), 0 4px 12px rgba(185, 28, 28, 0.15)',
        minHeight: '80px',
      };
    }
    if (isMediumPriority) {
      return {
        ...baseStyle,
        boxShadow: '0 0 0 1px var(--warning), 0 4px 12px rgba(180, 83, 9, 0.1)',
        minHeight: '60px',
      };
    }
    return {
      ...baseStyle,
      boxShadow: 'var(--shadow-sm)',
      opacity: isLowPriority ? 0.75 : 1,
    };
  };

  return (
    <div
      className={`relative rounded-lg transition-all hover:shadow-md ${
        isSecondary ? 'p-3' : isHighPriority ? 'p-5' : 'p-4'
      }`}
      style={getCardStyle()}
    >
      <div className="flex items-start gap-3">
        {/* Type icon or emoji */}
        <div className="shrink-0 mt-0.5">
          {item.emoji ? (
            <span className="text-base">{item.emoji}</span>
          ) : (
            <TypeIcon
              className="w-4 h-4"
              style={{ color: 'var(--text-muted)' }}
            />
          )}
        </div>

        {/* Content + Actions in single column */}
        <div className="flex-1 min-w-0">
          {/* Title row with inline badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`font-medium ${isHighPriority ? 'text-base font-semibold' : 'text-sm'}`}
              style={{ color: 'var(--text-primary)' }}
            >
              {item.title}
            </h4>
            {(item.time || item.urgencyReason) && (
              <span
                className="text-xs px-1.5 py-0.5 rounded shrink-0"
                style={{
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                {item.time || item.urgencyReason}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {item.subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {item.subtitle}
              {item.relationshipNote && (
                <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  {' '}({item.relationshipNote})
                </span>
              )}
            </p>
          )}

          {/* Description (for risks) */}
          {item.description && !isSecondary && (
            <p
              className="text-sm mt-2 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.description}
            </p>
          )}

          {/* AI Suggestion (for risks) */}
          {item.suggestedAction && !isSecondary && (
            <div
              className="mt-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Suggested Action
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {item.suggestedAction}
              </p>
            </div>
          )}

          {/* Severity badge for risks */}
          {item.severity && (
            <div className="mt-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{
                  backgroundColor:
                    item.severity === 'high'
                      ? 'var(--error-subtle)'
                      : item.severity === 'medium'
                        ? 'var(--warning-subtle)'
                        : 'var(--bg-tertiary)',
                  color:
                    item.severity === 'high'
                      ? 'var(--error)'
                      : item.severity === 'medium'
                        ? 'var(--warning)'
                        : 'var(--text-secondary)',
                }}
              >
                {item.severity.toUpperCase()} SEVERITY
              </span>
            </div>
          )}

          {/* Actions - always below content */}
          <div className="flex gap-1.5 flex-wrap mt-2">
            {item.actions.slice(0, 3).map((action) => (
              <ActionButton
                key={action.id}
                action={action}
                onClick={() => onAction(action.handler, item)}
                size="small"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UnifiedItemList({
  items,
  onAction,
  emptyMessage,
  isSecondary = false,
}: {
  items: UnifiedItem[];
  onAction: (actionId: string, item: UnifiedItem) => void;
  emptyMessage?: string;
  isSecondary?: boolean;
}) {
  if (items.length === 0) {
    if (emptyMessage) {
      return (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={isSecondary ? 'space-y-2' : 'space-y-3'}>
      {items.map((item) => (
        <UnifiedItemCard
          key={item.id}
          item={item}
          onAction={onAction}
          isSecondary={isSecondary}
        />
      ))}
    </div>
  );
}
