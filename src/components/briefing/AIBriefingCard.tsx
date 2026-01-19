'use client';

import type { AIBriefing } from '@/lib/ai-briefing';

interface AIBriefingCardProps {
  briefing: AIBriefing;
}

export function AIBriefingCard({ briefing }: AIBriefingCardProps) {
  const { verdict, firstMove, waitingOnYou, watchOut, freeTime } = briefing;

  return (
    <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl p-6 border border-stone-200/60">
      {/* Verdict Line */}
      <div className="mb-6">
        <p className="text-stone-700 text-lg">
          <strong className="text-stone-900">{verdict.rating}</strong>
          {verdict.summary && ` — ${verdict.summary}`}
        </p>
      </div>

      {/* First Move */}
      {firstMove && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Your First Move
          </h3>
          <p className="text-stone-800">
            <strong>{firstMove.item}</strong>
            <span className="text-stone-500"> — {firstMove.context}</span>
          </p>
          <p className="text-stone-600 mt-1 flex items-start gap-2">
            <span className="text-stone-400">→</span>
            <span>{firstMove.action}</span>
          </p>
        </div>
      )}

      {/* Waiting On You */}
      {waitingOnYou.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Waiting On You
          </h3>
          <div className="space-y-3">
            {waitingOnYou.map((item, i) => (
              <div key={i}>
                <p className="text-stone-800">
                  <strong>{item.person}</strong>
                  <span className="text-stone-500"> — {item.context}</span>
                  {item.subtext && (
                    <span className="text-stone-400 text-sm"> ({item.subtext})</span>
                  )}
                </p>
                <p className="text-stone-600 mt-1 flex items-start gap-2">
                  <span className="text-stone-400">→</span>
                  <span>{item.action}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Watch Out */}
      {watchOut.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-600/80 mb-2">
            ⚠ Watch Out
          </h3>
          <div className="space-y-2">
            {watchOut.map((item, i) => (
              <p key={i} className="text-stone-700">
                {item.warning}
                {item.action && (
                  <span className="text-stone-500"> → {item.action}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Free Time */}
      {freeTime && (
        <div className="pt-4 border-t border-stone-200/60">
          <p className="text-stone-600">
            <strong className="text-blue-600">{freeTime.duration} min free</strong>
            <span className="text-stone-400"> ({freeTime.startTime}–{freeTime.endTime})</span>
            <span className="text-stone-500"> — {freeTime.suggestion}</span>
          </p>
        </div>
      )}
    </div>
  );
}
