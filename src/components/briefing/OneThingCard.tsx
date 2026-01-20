'use client';

import type { OneThing } from '@/lib/ai-briefing';

interface OneThingCardProps {
  oneThing: OneThing;
  onAction: (handler: string) => void;
}

export function OneThingCard({ oneThing, onAction }: OneThingCardProps) {
  return (
    <div className="bg-[var(--bg-surface)] rounded-2xl p-8 border-2 border-[var(--border-default)] shadow-sm">
      {/* Section Label */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
        Your One Thing Right Now
      </h2>

      {/* The Main Task */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          {oneThing.title}
        </h3>
        <p className="text-[var(--text-secondary)]">
          {oneThing.subtitle}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {oneThing.actions.map((action, i) => (
          <button
            key={i}
            onClick={() => onAction(action.handler)}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
              action.variant === 'primary'
                ? 'bg-[var(--bg-inverse)] text-[var(--text-inverse)] hover:opacity-90 active:scale-[0.98]'
                : action.variant === 'secondary'
                  ? 'bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] active:scale-[0.98]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Why This First */}
      <div className="bg-[var(--bg-muted)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <p className="text-sm text-[var(--text-secondary)] mb-1 font-medium">Why this first?</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          {oneThing.why}
        </p>
      </div>
    </div>
  );
}
