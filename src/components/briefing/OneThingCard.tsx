'use client';

import type { OneThing } from '@/lib/ai-briefing';

interface OneThingCardProps {
  oneThing: OneThing;
  onAction: (handler: string) => void;
}

export function OneThingCard({ oneThing, onAction }: OneThingCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 border-2 border-stone-200 shadow-sm">
      {/* Section Label */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
        Your One Thing Right Now
      </h2>

      {/* The Main Task */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-stone-900 mb-2">
          {oneThing.title}
        </h3>
        <p className="text-stone-500">
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
                ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]'
                : action.variant === 'secondary'
                  ? 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 active:scale-[0.98]'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Why This First */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
        <p className="text-sm text-stone-500 mb-1 font-medium">Why this first?</p>
        <p className="text-sm text-stone-600 leading-relaxed">
          {oneThing.why}
        </p>
      </div>
    </div>
  );
}
