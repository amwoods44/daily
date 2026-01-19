'use client';

import type { Nudge } from '@/lib/mock-data';

interface NudgeCardsProps {
  nudges: Nudge[];
  onAction?: (handler: string) => void;
}

const COLOR_STYLES: Record<Nudge['color'], { bg: string; border: string; text: string; icon: string }> = {
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🚨' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '⚠️' },
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: '💡' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: '🎉' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '📅' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: '💜' },
};

export function NudgeCards({ nudges, onAction }: NudgeCardsProps) {
  if (nudges.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
      {nudges.map((nudge) => {
        const colors = COLOR_STYLES[nudge.color];

        return (
          <div
            key={nudge.id}
            className={`shrink-0 w-72 p-4 rounded-xl border ${colors.bg} ${colors.border}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">{colors.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${colors.text}`}>
                  {nudge.title}
                </h4>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                  {nudge.description}
                </p>
                {nudge.action && (
                  <button
                    onClick={() => onAction?.(nudge.action!.handler)}
                    className={`mt-2 text-xs font-medium ${colors.text} hover:underline`}
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
