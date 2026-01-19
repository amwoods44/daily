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

  const variantStyles = {
    primary:
      'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]',
    secondary:
      'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-[0.98]',
    ghost: 'text-stone-500 hover:text-stone-700 hover:bg-stone-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`font-medium rounded-lg transition-all flex items-center gap-1.5 ${baseStyles} ${variantStyles[action.variant]}`}
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

  return (
    <div
      className={`relative bg-white rounded-xl transition-all ${
        isSecondary
          ? 'p-4 border border-stone-200 hover:border-stone-300'
          : 'p-5 border border-stone-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Type icon or emoji */}
        <div className={`shrink-0 ${isSecondary ? 'mt-0.5' : 'mt-1'}`}>
          {item.emoji ? (
            <span className={isSecondary ? 'text-base' : 'text-lg'}>
              {item.emoji}
            </span>
          ) : (
            <TypeIcon
              className={`text-stone-400 ${isSecondary ? 'w-4 h-4' : 'w-5 h-5'}`}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <h4
                className={`font-semibold text-stone-900 ${isSecondary ? 'text-sm' : 'text-base'}`}
              >
                {item.title}
              </h4>
              {item.subtitle && (
                <p
                  className={`text-stone-500 ${isSecondary ? 'text-xs' : 'text-sm'}`}
                >
                  {item.subtitle}
                  {item.relationshipNote && (
                    <span className="text-stone-400 italic">
                      {' '}
                      ({item.relationshipNote})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Context badge */}
            {(item.time || item.urgencyReason) && (
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-md shrink-0">
                {item.time || item.urgencyReason}
              </span>
            )}
          </div>

          {/* Description (for risks) */}
          {item.description && !isSecondary && (
            <p className="text-sm text-stone-600 mt-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* AI Suggestion (for risks) */}
          {item.suggestedAction && !isSecondary && (
            <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-100">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">
                Suggested Action
              </p>
              <p className="text-sm text-stone-700">{item.suggestedAction}</p>
            </div>
          )}

          {/* Severity badge for risks */}
          {item.severity && (
            <div className="mt-3">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  item.severity === 'high'
                    ? 'bg-red-50 text-red-700'
                    : item.severity === 'medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-stone-100 text-stone-600'
                }`}
              >
                {item.severity.toUpperCase()} SEVERITY
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex gap-2 shrink-0 ${isSecondary ? 'flex-col' : ''}`}>
          {item.actions.slice(0, isSecondary ? 2 : 3).map((action) => (
            <ActionButton
              key={action.id}
              action={action}
              onClick={() => onAction(action.handler, item)}
              size={isSecondary ? 'small' : 'default'}
            />
          ))}
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
        <div className="text-center py-8 text-stone-400">
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
