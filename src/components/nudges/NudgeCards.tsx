'use client';

import type { Nudge } from '@/lib/mock-data';

interface NudgeCardsProps {
  nudges: Nudge[];
  onAction?: (handler: string) => void;
}

const COLOR_STYLES: Record<Nudge['color'], { bg: string; border: string; text: string; icon: string }> = {
  red: { bg: 'var(--semantic-error-subtle)', border: 'var(--semantic-error)', text: 'var(--semantic-error)', icon: '🚨' },
  orange: { bg: 'var(--semantic-warning-subtle)', border: 'var(--semantic-warning)', text: 'var(--semantic-warning)', icon: '⚠️' },
  yellow: { bg: 'var(--semantic-warning-subtle)', border: 'var(--semantic-warning-vivid)', text: 'var(--semantic-warning-vivid)', icon: '💡' },
  green: { bg: 'var(--semantic-success-subtle)', border: 'var(--semantic-success)', text: 'var(--semantic-success)', icon: '🎉' },
  blue: { bg: 'var(--semantic-info-subtle)', border: 'var(--semantic-info)', text: 'var(--semantic-info)', icon: '📅' },
  purple: { bg: 'var(--bg-accent-subtle)', border: 'var(--brand-primary)', text: 'var(--brand-primary)', icon: '💜' },
};

export function NudgeCards({ nudges, onAction }: NudgeCardsProps) {
  if (nudges.length === 0) return null;

  return (
    <div
      className="flex overflow-x-auto pb-2 scrollbar-hide"
      style={{
        gap: 'var(--space-4)',
        marginLeft: 'calc(-1 * var(--space-6))',
        marginRight: 'calc(-1 * var(--space-6))',
        paddingLeft: 'var(--space-6)',
        paddingRight: 'var(--space-6)',
      }}
    >
      {nudges.map((nudge) => {
        const colors = COLOR_STYLES[nudge.color];

        return (
          <div
            key={nudge.id}
            style={{
              flexShrink: 0,
              width: '288px',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-xl)',
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.bg,
            }}
          >
            <div className="flex items-start" style={{ gap: 'var(--space-3)' }}>
              <span
                style={{
                  fontSize: 'var(--text-xl)',
                  flexShrink: 0,
                }}
              >
                {colors.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  className="text-body"
                  style={{
                    fontWeight: 'var(--weight-semibold)',
                    color: colors.text,
                  }}
                >
                  {nudge.title}
                </h4>
                <p
                  className="text-body-sm"
                  style={{
                    color: 'var(--text-secondary)',
                    marginTop: 'var(--space-1)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {nudge.description}
                </p>
                {nudge.action && (
                  <button
                    onClick={() => onAction?.(nudge.action!.handler)}
                    className="text-body-sm"
                    style={{
                      marginTop: 'var(--space-3)',
                      fontWeight: 'var(--weight-semibold)',
                      color: colors.text,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    {nudge.action.label} →
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
